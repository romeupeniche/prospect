import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import type { Transition } from "framer-motion";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { getTeamSquadPlayers } from "../../data/teamSquads";
import { NEWS_DATABASE } from "../../services/NewsDB";
import { NewsParser } from "../../services/NewsParser";
import { useCompetitionsStore } from "../../store/useCompetitionsStore";
import { useTeamStore } from "../../store/useTeamStore";
import type { BasePlayer, RuntimePlayer } from "../../store/useTeamStore";
import { formatPositionName } from "../../utils/positionI18n";

type NewsKey =
  | "team_of_the_week"
  | "transfer_available_players"
  | "referee_assignment"
  | "player_injury"
  | "squad_announcement"
  | "match_preview"
  | "tickets_sold_out"
  | "daily_training_report"
  | "player_focus";

interface WorldFootballNewsProps {
  currentTeam: Team;
  saveData: SaveData;
}

interface NewsCandidate {
  id: string;
  key: NewsKey;
  ctx: NewsContext;
  date: string;
}

interface CompiledNewsArticle {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
}

const CATEGORY_LABELS: Record<NewsTemplate["category"], string> = {
  rumors: "Rumores",
  team_of_the_month: "Destaques",
  match: "Partidas",
  transfers: "Mercado",
  team: "Clube",
};

const listTransition: Transition = { duration: 0.24, ease: "easeOut" };
const titleTransition: Transition = { duration: 0.34, ease: [0.22, 1, 0.36, 1] };

const SQUAD_ANNOUNCEMENT_TEMPLATE: NewsTemplate = {
  category: "team",
  date: "",
  title: [
    "{teamA} divulga a lista de relacionados para enfrentar o {teamB}",
    "Convocados! Confira quem viaja pelo {teamA} para o duelo da rodada",
    "Lista oficial: técnico do {teamA} define os atletas relacionados para o jogo",
  ],
  subtitle: [
    "Relação oficial confirma o grupo escolhido para a partida.",
    "Comissão técnica define a lista para o embate na {competition}.",
    "Veja quais jogadores estão à disposição para defender as cores do {teamA}.",
  ],
  description: [
    "A assessoria de imprensa do {teamA} publicou a lista oficial com os jogadores relacionados para o confronto contra o {teamB}. A delegação finaliza a preparação hoje e entra no período de concentração para o duelo válido pela {competition}.\n\nOs atletas relacionados são: {playerList}. A lista indica as opções que a comissão técnica terá para montar o time inicial e ajustar o banco de reservas ao longo da partida.\n\nA escalação titular ainda será confirmada mais perto da bola rolar, mas o grupo divulgado já dá uma boa leitura das alternativas disponíveis para o treinador.",
    "O {teamA} confirmou os atletas selecionados para o duelo contra o {teamB}. A relação serve como base para a preparação final e organiza o grupo que ficará à disposição da comissão técnica.\n\nA lista oficial tem {playerList}. A partir dela, o treinador poderá definir a equipe inicial, os suplentes e eventuais ajustes de última hora conforme o plano de jogo.\n\nNos bastidores, a prioridade é manter o elenco concentrado e bem informado sobre as funções táticas esperadas para a partida.",
    "O torcedor do {teamA} já pode conferir quem está à disposição para o embate contra o {teamB}. A lista de relacionados foi liberada após o encerramento da preparação no centro de treinamento.\n\nForam chamados: {playerList}. O grupo reúne as principais opções para o jogo e ajuda a indicar como a comissão técnica pretende equilibrar titulares, banco e alternativas por setor.\n\nA bola rola em poucas horas e a expectativa é que a escalação oficial seja entregue aos delegados da federação cerca de sessenta minutos antes do início previsto para a partida.",
  ],
};

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

function stableSeed(value: string): number {
  return Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
}

function parseDate(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(parseDate(date));
}

function daysUntil(targetDate: string, currentDate: string): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const target = new Date(`${targetDate}T00:00:00`).getTime();
  const current = new Date(`${currentDate}T00:00:00`).getTime();
  return Math.floor((target - current) / dayMs);
}

function isFirstDayOfMonth(date: string): boolean {
  return parseDate(date).getDate() === 1;
}

function isPreviousMonthFixture(fixtureDate: string, currentDate: string): boolean {
  const fixture = parseDate(fixtureDate);
  const current = parseDate(currentDate);
  const previousMonth = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  return (
    fixture.getFullYear() === previousMonth.getFullYear() &&
    fixture.getMonth() === previousMonth.getMonth()
  );
}

function formatMoney(value: number | undefined): string {
  if (!value) return "";
  if (value >= 1_000_000) return `R$ ${Math.round(value / 1_000_000)} mi`;
  return `R$ ${Math.round(value / 1_000)} mil`;
}

function playerAge(player: BasePlayer, currentDate: string): number {
  return parseDate(currentDate).getFullYear() - parseDate(player.personal.birth_date).getFullYear();
}

function positionOf(player: BasePlayer | RuntimePlayer | undefined, language?: string): string {
  return formatPositionName(player?.technical_profile.best_position, language);
}

function dailySquadPlayer(teamId: string, currentDate: string, offset = 0): BasePlayer | null {
  const squad = getTeamSquadPlayers(teamId);
  if (squad.length === 0) return null;
  const sorted = squad
    .slice()
    .sort((a, b) => b.technical_profile.overall - a.technical_profile.overall);
  return sorted[(stableSeed(`${teamId}-${currentDate}`) + offset) % sorted.length] ?? null;
}

function formatDuration(days: number): string {
  if (days <= 1) return "1 dia";
  if (days < 30) return `${days} dias`;
  const months = Math.max(1, Math.round(days / 30));
  return months === 1 ? "1 mês" : `${months} meses`;
}

function strictnessLabel(value: number): string {
  if (value >= 0.75) return "alta";
  if (value >= 0.5) return "moderada";
  return "baixa";
}

function relationPlayers(fixture: Fixture, teamId: string): BasePlayer[] {
  const side = fixture.homeTeam.id === teamId ? "home" : "away";
  const relationIds = fixture.squadRelation?.[side] ?? [];
  const squad = getTeamSquadPlayers(teamId);
  return relationIds
    .map((id) => squad.find((player) => player.id === id))
    .filter(Boolean) as BasePlayer[];
}

function baseMatchContext(fixture: Fixture, currentTeam: Team, saveData: SaveData): NewsContext {
  const opponent = fixture.homeTeam.id === currentTeam.id ? fixture.awayTeam : fixture.homeTeam;
  return {
    teamA: currentTeam.name,
    teamB: opponent.name,
    competition: fixture.competition.short_name,
    stage: !Number.isNaN(Number(fixture.round)) ? `rodada ${fixture.round}` : fixture.round,
    isRival: currentTeam.rivals_ids.includes(opponent.id),
    tvChannels: "",
    minute: "",
    matchCount: "",
    teamAScore: "",
    teamBScore: "",
    directorName: "",
    age: "",
    marketValue: "",
    goalsCount: "",
    playerList: [],
    player: "",
    playerA: "",
    playerB: "",
    position: "",
    injuryName: "",
    duration: "",
    refereeName: "",
    refereeFoulStrictness: "",
    refereeCardStrictness: "",
    refereeStoppageGenerosity: "",
    isHomegrown: false,
    isHighFoulStrictness: false,
    isHighCardStrictness: false,
    isHighStoppageGenerosity: false,
    ...{
      currentDate: saveData.currentDate,
    },
  };
}

function buildRefereeCandidate(fixture: Fixture, currentTeam: Team, saveData: SaveData): NewsCandidate | null {
  const revealWindow = daysUntil(fixture.date, saveData.currentDate);
  if (!fixture.referee || revealWindow < 0 || revealWindow > 2) return null;
  const referee = fixture.referee;
  return {
    id: `referee-${fixture.id}`,
    key: "referee_assignment",
    date: formatDate(saveData.currentDate),
    ctx: {
      ...baseMatchContext(fixture, currentTeam, saveData),
      refereeName: referee.fullName,
      refereeFoulStrictness: strictnessLabel(referee.foulStrictness),
      refereeCardStrictness: strictnessLabel(referee.cardStrictness),
      refereeStoppageGenerosity: strictnessLabel(referee.stoppageGenerosity),
      isHighFoulStrictness: referee.foulStrictness >= 0.7,
      isHighCardStrictness: referee.cardStrictness >= 0.7,
      isHighStoppageGenerosity: referee.stoppageGenerosity >= 0.7,
    },
  };
}

function buildSquadCandidate(fixture: Fixture, currentTeam: Team, saveData: SaveData): NewsCandidate | null {
  const revealWindow = daysUntil(fixture.date, saveData.currentDate);
  if (revealWindow < 0 || revealWindow > 1) return null;
  const related = relationPlayers(fixture, currentTeam.id);
  if (related.length === 0) return null;
  return {
    id: `squad-${fixture.id}`,
    key: "squad_announcement",
    date: formatDate(saveData.currentDate),
    ctx: {
      ...baseMatchContext(fixture, currentTeam, saveData),
      playerList: related.map((player) => player.personal.short_name),
      player: related[0]?.personal.short_name,
      playerA: related[0]?.personal.short_name,
      playerB: related[1]?.personal.short_name,
      position: positionOf(related[0], saveData.language),
    },
  };
}

function buildMatchPreviewCandidate(fixture: Fixture, currentTeam: Team, saveData: SaveData): NewsCandidate | null {
  const revealWindow = daysUntil(fixture.date, saveData.currentDate);
  if (revealWindow < 0 || revealWindow > 7) return null;
  return {
    id: `preview-${fixture.id}-${saveData.currentDate}`,
    key: "match_preview",
    date: formatDate(saveData.currentDate),
    ctx: {
      ...baseMatchContext(fixture, currentTeam, saveData),
      tvChannels: "Prospect TV e Premiere",
      refereeName: fixture.referee?.fullName ?? "a definir",
    },
  };
}

function buildTicketsCandidate(fixture: Fixture, currentTeam: Team, saveData: SaveData): NewsCandidate | null {
  const revealWindow = daysUntil(fixture.date, saveData.currentDate);
  const isHomeMatch = fixture.homeTeam.id === currentTeam.id;
  if (!isHomeMatch || revealWindow < 1 || revealWindow > 5) return null;
  return {
    id: `tickets-${fixture.id}-${saveData.currentDate}`,
    key: "tickets_sold_out",
    date: formatDate(saveData.currentDate),
    ctx: baseMatchContext(fixture, currentTeam, saveData),
  };
}

function buildInjuryCandidate(
  fixture: Fixture | null,
  currentTeam: Team,
  saveData: SaveData,
  runtimePlayers: RuntimePlayer[],
): NewsCandidate | null {
  const injured = runtimePlayers.find(
    (player) => player.team_id === currentTeam.id && player.runtime.injury,
  );
  if (!injured?.runtime.injury) return null;
  const ctx = fixture ? baseMatchContext(fixture, currentTeam, saveData) : { teamA: currentTeam.name };
  return {
    id: `injury-${injured.id}-${injured.runtime.injury.daysRemaining}`,
    key: "player_injury",
    date: formatDate(saveData.currentDate),
    ctx: {
      ...ctx,
      player: injured.personal.short_name,
      playerA: injured.personal.short_name,
      position: positionOf(injured, saveData.language),
      injuryName: injured.runtime.injury.type,
      duration: formatDuration(injured.runtime.injury.daysRemaining),
      matchCount: injured.runtime.seasonStats.matches,
    },
  };
}

function buildDailyTrainingCandidate(fixture: Fixture | null, currentTeam: Team, saveData: SaveData): NewsCandidate | null {
  const player = dailySquadPlayer(currentTeam.id, saveData.currentDate);
  if (!player) return null;
  const ctx = fixture
    ? baseMatchContext(fixture, currentTeam, saveData)
    : { teamA: currentTeam.name, teamB: "próximo adversário", competition: "temporada", stage: "preparação" };
  return {
    id: `daily-training-${currentTeam.id}-${saveData.currentDate}`,
    key: "daily_training_report",
    date: formatDate(saveData.currentDate),
    ctx: {
      ...ctx,
      player: player.personal.short_name,
      playerA: player.personal.short_name,
      position: positionOf(player, saveData.language),
      age: playerAge(player, saveData.currentDate),
    },
  };
}

function buildPlayerFocusCandidate(fixture: Fixture | null, currentTeam: Team, saveData: SaveData): NewsCandidate | null {
  const player = dailySquadPlayer(currentTeam.id, saveData.currentDate, 3);
  if (!player) return null;
  const ctx = fixture
    ? baseMatchContext(fixture, currentTeam, saveData)
    : { teamA: currentTeam.name, teamB: "próximo adversário", competition: "temporada", stage: "preparação" };
  return {
    id: `player-focus-${player.id}-${saveData.currentDate}`,
    key: "player_focus",
    date: formatDate(saveData.currentDate),
    ctx: {
      ...ctx,
      player: player.personal.short_name,
      playerA: player.personal.short_name,
      position: positionOf(player, saveData.language),
      age: playerAge(player, saveData.currentDate),
    },
  };
}

function buildTransferCandidate(fixture: Fixture | null, currentTeam: Team, saveData: SaveData): NewsCandidate | null {
  const listed = getTeamSquadPlayers(currentTeam.id)
    .filter((player) => player.contract.is_transfer_listed)
    .slice(0, 3);
  if (listed.length === 0) return null;
  const ctx = fixture ? baseMatchContext(fixture, currentTeam, saveData) : { teamA: currentTeam.name };
  return {
    id: `transfer-listed-${listed.map((player) => player.id).join("-")}`,
    key: "transfer_available_players",
    date: formatDate(saveData.currentDate),
    ctx: {
      ...ctx,
      playerList: listed.map((player) => player.personal.short_name),
      player: listed[0]?.personal.short_name,
      playerA: listed[0]?.personal.short_name,
      playerB: listed[1]?.personal.short_name,
      position: positionOf(listed[0], saveData.language),
      age: listed[0] ? playerAge(listed[0], saveData.currentDate) : "",
      marketValue: formatMoney(listed[0]?.contract.market_value),
    },
  };
}

function buildMonthlyAwardCandidate(
  fixtures: Fixture[],
  currentTeam: Team,
  saveData: SaveData,
): NewsCandidate | null {
  if (!isFirstDayOfMonth(saveData.currentDate)) return null;
  const currentSquad = getTeamSquadPlayers(currentTeam.id);
  const playerScores = fixtures
    .filter(
      (fixture) =>
        fixture.status === "finished" &&
        isPreviousMonthFixture(fixture.date, saveData.currentDate) &&
        fixture.playerStats,
    )
    .flatMap((fixture) => {
      const side = fixture.homeTeam.id === currentTeam.id ? "home" : "away";
      return Object.values(fixture.playerStats?.[side] ?? {});
    })
    .filter((stats) => stats.rating >= 7.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  if (playerScores.length === 0) return null;
  const players = playerScores
    .map((stats) => currentSquad.find((player) => player.id === stats.playerId))
    .filter(Boolean) as BasePlayer[];
  if (players.length === 0) return null;

  const referenceFixture = fixtures.find((fixture) => fixture.status === "finished") ?? null;
  const ctx = referenceFixture
    ? baseMatchContext(referenceFixture, currentTeam, saveData)
    : { teamA: currentTeam.name, competition: "" };
  return {
    id: `monthly-awards-${saveData.currentDate}-${players.map((player) => player.id).join("-")}`,
    key: "team_of_the_week",
    date: formatDate(saveData.currentDate),
    ctx: {
      ...ctx,
      playerList: players.map((player) => player.personal.short_name),
      player: players[0]?.personal.short_name,
      playerA: players[0]?.personal.short_name,
      playerB: players[1]?.personal.short_name,
      position: positionOf(players[0], saveData.language),
      matchCount: playerScores[0]?.minutesPlayed ? 1 : "",
    },
  };
}

function compileArticle(candidate: NewsCandidate, index: number): CompiledNewsArticle {
  const template = candidate.key === "squad_announcement"
    ? SQUAD_ANNOUNCEMENT_TEMPLATE
    : NEWS_DATABASE[candidate.key];
  return {
    id: candidate.id,
    category: CATEGORY_LABELS[template.category],
    title: NewsParser.compile(pick(template.title, index), candidate.ctx),
    subtitle: NewsParser.compile(pick(template.subtitle, index + 1), candidate.ctx),
    description: NewsParser.compile(pick(template.description, index + 2), candidate.ctx),
    date: candidate.date,
  };
}

const WorldFootballNews = ({ currentTeam, saveData }: WorldFootballNewsProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fixtures = useCompetitionsStore((state) => state.fixtures);
  const getNextMatchFromDate = useCompetitionsStore((state) => state.getNextMatchFromDate);
  const getTeamCalendar = useCompetitionsStore((state) => state.getTeamCalendar);
  const runtimePlayers = useTeamStore((state) => state.players);
  const accent = currentTeam.colors.primary[500] === "#000000" ? "#ffffff" : currentTeam.colors.primary[400];

  const nextFixture = useMemo(
    () => {
      void fixtures;
      return getNextMatchFromDate(currentTeam.id, saveData.currentDate);
    },
    [fixtures, currentTeam.id, saveData.currentDate, getNextMatchFromDate],
  );

  const articles = useMemo(() => {
    void fixtures;
    const calendar = getTeamCalendar(currentTeam.id);
    const candidates = [
      nextFixture ? buildRefereeCandidate(nextFixture, currentTeam, saveData) : null,
      nextFixture ? buildSquadCandidate(nextFixture, currentTeam, saveData) : null,
      nextFixture ? buildMatchPreviewCandidate(nextFixture, currentTeam, saveData) : null,
      nextFixture ? buildTicketsCandidate(nextFixture, currentTeam, saveData) : null,
      buildInjuryCandidate(nextFixture, currentTeam, saveData, runtimePlayers),
      buildMonthlyAwardCandidate(calendar, currentTeam, saveData),
      buildTransferCandidate(nextFixture, currentTeam, saveData),
      buildDailyTrainingCandidate(nextFixture, currentTeam, saveData),
      buildPlayerFocusCandidate(nextFixture, currentTeam, saveData),
    ].filter(Boolean) as NewsCandidate[];

    return candidates.map((candidate, index) => compileArticle(candidate, index));
  }, [fixtures, currentTeam, saveData, nextFixture, runtimePlayers, getTeamCalendar]);

  const selectedArticle = articles.find((article) => article.id === selectedId) ?? null;

  return (
    <LayoutGroup>
      <section
        className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-4xl border border-white/5 bg-[#111] p-[clamp(1rem,1.45vw,1.75rem)]"
        style={{ "--news-accent": accent } as CSSProperties}
      >
        <AnimatePresence mode="wait">
          {!selectedArticle ? (
            <motion.div
              key="news-list"
              className="flex h-full min-h-0 flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={listTransition}
            >
              <motion.h3
                className="shrink-0 font-black uppercase text-gray-500 text-[clamp(0.58rem,0.72vw,0.7rem)] tracking-[0.28em] mb-[clamp(0.8rem,1.2vw,1.4rem)]"
                exit={{ opacity: 0 }}
                transition={listTransition}
              >
                Mundo do Futebol
              </motion.h3>

              <div className="min-h-0 flex-1 overflow-y-auto pr-[clamp(0.25rem,0.45vw,0.55rem)]">
                {articles.length === 0 ? (
                  <div className="flex h-full flex-col justify-center text-gray-500 text-[clamp(0.72rem,0.82vw,0.88rem)] leading-[1.55]">
                    Nenhuma notícia confirmada para hoje. O feed será atualizado quando houver dados oficiais de partida, elenco, lesão ou desempenho.
                  </div>
                ) : (
                  <div className="flex flex-col gap-[clamp(0.85rem,1.15vw,1.35rem)]">
                    {articles.map((article) => (
                      <motion.article
                        key={article.id}
                        layout
                        className="group cursor-pointer border-white/5 [border-top-width:0.0625rem] pt-[clamp(0.65rem,0.9vw,1rem)] first:border-t-0 first:pt-0"
                        onClick={() => setSelectedId(article.id)}
                        exit={{ opacity: 0 }}
                        whileHover={{ x: "0.35rem" }}
                        transition={listTransition}
                      >
                        <motion.div
                          className="font-black uppercase text-(--news-accent) text-[clamp(0.56rem,0.68vw,0.68rem)] tracking-[0.2em] mb-[clamp(0.22rem,0.32vw,0.36rem)]"
                          exit={{ opacity: 0 }}
                        >
                          {article.category}
                        </motion.div>

                        <motion.h4
                          layoutId={`world-news-title-${article.id}`}
                          className="font-black leading-tight text-white transition-colors group-hover:text-(--news-accent) text-[clamp(0.82rem,0.98vw,1rem)]"
                          transition={titleTransition}
                        >
                          {article.title}
                        </motion.h4>

                        <motion.p
                          className="overflow-hidden text-gray-500 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] text-[clamp(0.68rem,0.78vw,0.8rem)] leading-[1.35] mt-[clamp(0.22rem,0.34vw,0.42rem)]"
                          exit={{ opacity: 0 }}
                        >
                          {article.subtitle}
                        </motion.p>
                      </motion.article>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.article
              key="news-detail"
              className="flex h-full min-h-0 flex-col"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={listTransition}
            >
              <div className="flex shrink-0 items-start justify-between gap-[clamp(0.75rem,1vw,1.1rem)]">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="cursor-pointer rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white py-[clamp(0.35rem,0.45vw,0.5rem)] px-[clamp(0.65rem,0.85vw,0.95rem)] text-[clamp(0.62rem,0.72vw,0.74rem)]"
                >
                  Voltar
                </button>
                <span className="font-black uppercase text-(--news-accent) text-[clamp(0.55rem,0.66vw,0.68rem)] tracking-[0.18em]">
                  {selectedArticle.category}
                </span>
              </div>

              <motion.h2
                layoutId={`world-news-title-${selectedArticle.id}`}
                onClick={() => setSelectedId(null)}
                className="cursor-pointer font-black leading-[1.06] text-white text-[clamp(1.22rem,1.7vw,1.85rem)] mt-[clamp(0.75rem,1.05vw,1.2rem)]"
                transition={titleTransition}
              >
                {selectedArticle.title}
              </motion.h2>

              <motion.div
                className="min-h-0 flex-1 overflow-y-auto pr-[clamp(0.25rem,0.45vw,0.55rem)] mt-[clamp(0.65rem,0.9vw,1rem)]"
                initial={{ opacity: 0, y: "0.7rem" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.16, duration: 0.22, ease: "easeOut" }}
              >
                <p className="font-bold text-(--news-accent) text-[clamp(0.76rem,0.88vw,0.92rem)] leading-[1.45]">
                  {selectedArticle.subtitle}
                </p>

                <div className="text-gray-300 mt-[clamp(0.8rem,1vw,1.1rem)] text-[clamp(0.72rem,0.82vw,0.88rem)] leading-[1.65]">
                  {selectedArticle.description.split(/\n\s*\n/).map((paragraph) => (
                    <p key={paragraph} className="mb-[clamp(0.75rem,0.95vw,1rem)] last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            </motion.article>
          )}
        </AnimatePresence>
      </section>
    </LayoutGroup>
  );
};

export default WorldFootballNews;
