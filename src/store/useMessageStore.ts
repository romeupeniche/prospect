import { create } from "zustand";
import competitionsData from "../data/competitions.json";
import playersData from "../data/players.json";
import teamsData from "../data/teams.json";
import trainersData from "../data/trainers.json";
import {
  ActorProfile,
  AiChatMessage,
  DialogueChip,
  GameGlobalContext,
  dialogueEngine,
} from "../services/aiContextEngine";
import { useCompetitionsStore } from "./useCompetitionsStore";
import { useCareerStore } from "./useCareerStore";
import { useTeamStore } from "./useTeamStore";
import { formatPositionName, getPositionLanguageFromSave } from "../utils/positionI18n";

export type ContactPresence =
  | "online"
  | "away"
  | "processing"
  | "typing"
  | "responds-soon";
export type MessageDeliveryState =
  | "sent"
  | "delivered"
  | "failed"
  | "pending"
  | "streaming";
export type DialoguePhase = "idle" | "processing" | "streaming" | "failed";

export interface ThreadMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  deliveryState: MessageDeliveryState;
  isUnread?: boolean;
  generatedAtVirtualMinute?: number;
}

export interface PendingThreadRequest {
  requestId: string;
  chatId: string;
  submittedAt: string;
  expectedAssistantTimestamp: string;
  submittedAtVirtualMinute: number;
}

export interface Chat {
  id: string;
  actor: ActorProfile;
  isUnlocked: boolean;
  presence: ContactPresence;
  dialoguePhase: DialoguePhase;
  messages: ThreadMessage[];
  unreadCount: number;
  pendingResponse: boolean;
  smartPrompts: string[];
  smartPromptChips: DialogueChip[];
  lastError?: string;
  pendingRequest?: PendingThreadRequest;
}

interface MessageState {
  chats: Chat[];
  activeChatId: string;
  searchTerm: string;
  activeFilter: "all" | "squad" | "market" | "external";
  globalContext: GameGlobalContext;
  virtualMinuteOfDay: number;
  setActiveChat: (chatId: string) => void;
  setSearchTerm: (term: string) => void;
  setFilter: (filter: MessageState["activeFilter"]) => void;
  initiateChat: (chatId: string, openingText?: string) => void;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  applySmartPrompt: (chatId: string, prompt: string) => Promise<void>;
  applySmartChip: (chatId: string, chipId: string) => Promise<void>;
  markAllRead: (chatId: string) => void;
  setGlobalContext: (context: GameGlobalContext) => void;
  syncLiveContext: () => void;
  advanceVirtualClock: (minutes: number) => void;
}

export interface TacticalStyle {
  preferredFormation: string;
  playStyle: string;
  pressingIntensity: "low" | "Medium" | "Medium-High" | "High" | "Extreme";
  lineHeight: "low" | "Medium" | "Medium-High" | "High" | "Extreme";
}

export interface Trainer {
  id: string;
  name: string;
  nationality: "brazil" | "portugal" | "argentina" | "uruguai" | string;
  currentClubId: string | null;
  status: "employed" | "unemployed";
  salaryBRL: number;
  personality: string;
  tacticalStyle: TacticalStyle;
  triggerRules: string[];
  image: string;
}

export type TrainersDatabase = Record<string, Trainer>;

interface CompetitionRecord {
  name: string;
  standings?: Array<{
    team_id: string;
    wins: number;
    draws: number;
    losses: number;
  }>;
}

const trainers = trainersData as unknown as TrainersDatabase;
const playerDatabase = playersData as unknown as Player[];
const teamDatabase = teamsData as unknown as Team[];
const competitions = competitionsData as unknown as Record<
  string,
  CompetitionRecord
>;
const UNKNOWN_ACTOR_IMAGE = "src/assets/players/unknown.png";

const makeId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const slug = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const createVirtualTimestamp = (date: string, minuteOfDay: number): string => {
  const base = new Date(`${date}T00:00:00`);
  base.setMinutes(minuteOfDay);
  return base.toISOString();
};

const addMinutesToIso = (timestamp: string, minutes: number): string => {
  const date = new Date(timestamp);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
};

const getActiveTeam = (): Team => {
  const { currentTeam, saveData } = useCareerStore.getState();
  const savedTeam = saveData?.teamId
    ? teamDatabase.find((team) => team.id === saveData.teamId)
    : undefined;

  return (currentTeam as Team | null) ?? savedTeam ?? teamDatabase[0];
};

const getLivePlayersForTeam = (teamId: string): Player[] => {
  const runtimePlayers = useTeamStore
    .getState()
    .players.filter((player) => player.team_id === teamId);

  if (runtimePlayers.length > 0) {
    return runtimePlayers as Player[];
  }

  return playerDatabase.filter((player) => player.team_id === teamId);
};

const getCoachActor = (team: Team): ActorProfile => {
  const activeTrainer = trainers[team.trainerId];
  const trainer = activeTrainer;

  return {
    id: trainer ? `coach-${trainer.id}` : "coach-technical-staff",
    name: trainer?.name ?? "Comissao Tecnica",
    role: "Treinador",
    kind: "coach",
    category: "squad",
    personality:
      trainer?.personality ??
      "Comissao tecnica institucional, pragmatica e focada em proteger o planejamento esportivo.",
    triggerRules: trainer?.triggerRules ?? [
      "Falar de planejamento esportivo, elenco, treino e desempenho.",
      "Nao responder como se fosse jogador, agente ou torcedor.",
    ],
    image: trainer?.image ?? UNKNOWN_ACTOR_IMAGE,
  };
};

const playerToActor = (player: Player): ActorProfile => ({
  id: `player-${player.id}`,
  name: player.personal.name,
  role:
    formatPositionName(
      player.technical_profile.best_position,
      getPositionLanguageFromSave(useCareerStore.getState().saveData),
    ) || "Jogador",
  kind: "player",
  category: "squad",
  linkedPlayerName: player.personal.name,
  personality:
    "Jogador profissional competitivo, atento ao proprio espaco no elenco, contrato e percepcao publica.",
  triggerRules: [
    "Falar apenas de carreira, minutos, contrato, proposta, moral ou situacao publica.",
    "Reagir a transferencia, baixa minutagem ou exposicao da torcida.",
    "Pedir clareza do clube sem acessar dados financeiros confidenciais.",
  ],
  image: player.personal.photo_url ?? UNKNOWN_ACTOR_IMAGE,
});

const buildCompetitionContext = (
  teamId: string,
): GameGlobalContext["competitions"] =>
  Object.values(competitions)
    .map((competition) => {
      const standings = competition.standings ?? [];
      const index = standings.findIndex((row) => row.team_id === teamId);
      const teamStanding = index >= 0 ? standings[index] : null;

      return {
        name: competition.name,
        currentPosition: index >= 0 ? index + 1 : 0,
        totalTeams: standings.length,
        recentForm: teamStanding
          ? [
              ...Array(Math.min(teamStanding.wins, 2)).fill("W"),
              ...Array(Math.min(teamStanding.draws, 1)).fill("D"),
              ...Array(Math.min(teamStanding.losses, 2)).fill("L"),
            ].slice(0, 5)
          : [],
        statusText:
          index < 0
            ? "Clube sem posicao registrada nesta competicao."
            : `Posicao atual: ${index + 1}/${standings.length}.`,
      };
    })
    .filter((competition) => competition.currentPosition > 0)
    .slice(0, 3);

const positionGroups: Record<string, string[]> = {
  GK: ["GK"],
  LB: ["LB", "LWB"],
  CB: ["CB"],
  RB: ["RB", "RWB"],
  DM: ["CDM", "DM"],
  CM: ["CM", "LM", "RM"],
  AM: ["CAM"],
  LW: ["LW", "LM"],
  RW: ["RW", "RM"],
  ST: ["ST", "CF"],
};

const displayPosition = (position: string): string =>
  formatPositionName(
    position === "DM" ? "CDM" : position,
    getPositionLanguageFromSave(useCareerStore.getState().saveData),
  );

const groupsForPlayer = (player: Player): string[] => {
  const positions = new Set([
    player.technical_profile.best_position,
    ...(player.technical_profile.positions ?? []),
  ]);
  const groups = Object.entries(positionGroups)
    .filter(([, aliases]) => aliases.some((alias) => positions.has(alias)))
    .map(([group]) => group);

  return groups.length ? groups : [player.technical_profile.best_position];
};

const average = (values: number[]): number =>
  values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

const ageForPlayer = (player: Player): number => {
  const explicitAge = Number(player.personal.age ?? 0);

  if (explicitAge > 0) {
    return explicitAge;
  }

  const birthYear = Number(player.personal.birth_date?.slice(0, 4));

  return Number.isFinite(birthYear) ? Math.max(0, 2026 - birthYear) : 0;
};

const careerStageFor = (player: Player): GameGlobalContext["playerContexts"][string]["careerStage"] => {
  const age = ageForPlayer(player);

  if (age <= 21 && player.technical_profile.potential - player.technical_profile.overall >= 6) {
    return "prospect";
  }

  if (age <= 24) return "developing";
  if (age >= 32) return "veteran";
  return "prime";
};

const minutesTrendFor = (player: Player): GameGlobalContext["playerContexts"][string]["minutesTrend"] => {
  const matches = player.runtime?.seasonStats?.matches ?? 0;

  if (matches <= 0) return "none_recorded";
  if (matches <= 4) return "low";
  if (matches <= 18) return "regular";
  return "heavy";
};

const buildRecentResults = (teamId: string): GameGlobalContext["recentResults"] => {
  try {
    const calendar = useCompetitionsStore.getState().getTeamCalendar(teamId);

    return calendar
      .filter((fixture) => fixture.status === "finished")
      .sort((a, b) => {
        const left = new Date(`${a.date}T${a.time}:00`).getTime();
        const right = new Date(`${b.date}T${b.time}:00`).getTime();
        return right - left;
      })
      .slice(0, 5)
      .map((fixture) => {
        const isHome = fixture.homeTeam.id === teamId;
        const ownScore = isHome ? fixture.score.home : fixture.score.away;
        const opponentScore = isHome ? fixture.score.away : fixture.score.home;
        const opponent = isHome ? fixture.awayTeam.name : fixture.homeTeam.name;
        const result =
          ownScore > opponentScore ? "win" : ownScore < opponentScore ? "loss" : "draw";

        return {
          opponent,
          score: `${ownScore}x${opponentScore}`,
          result,
          competition: fixture.competition.name,
          date: fixture.date,
        };
      });
  } catch {
    return [];
  }
};

const buildSquadAnalysis = (
  players: Player[],
): GameGlobalContext["squadAnalysis"] => {
  const positionNeeds: GameGlobalContext["squadAnalysis"]["positionNeeds"] = [];
  const depthWarnings: string[] = [];
  const availablePlayersByPosition: Record<string, number> = {};
  const averageOverallByPosition: Record<string, number> = {};

  Object.keys(positionGroups).forEach((group) => {
    const groupPlayers = players.filter((player) => groupsForPlayer(player).includes(group));
    const availablePlayers = groupPlayers.filter((player) => !player.runtime?.injury);
    const injuredPlayers = groupPlayers.filter((player) => player.runtime?.injury);
    const longInjuries = injuredPlayers.filter(
      (player) => (player.runtime?.injury?.daysRemaining ?? 0) >= 28,
    );
    const availableCount = availablePlayers.length;
    const avgOverall = average(groupPlayers.map((player) => player.technical_profile.overall));
    const position = displayPosition(group);

    availablePlayersByPosition[position] = availableCount;
    averageOverallByPosition[position] = avgOverall;

    if (availableCount <= 1) {
      positionNeeds.push({
        position,
        severity: "high",
        fit: "depth",
        reason: `só ${availableCount} jogador(es) disponível(is) para a função.`,
      });
      depthWarnings.push(`${position} está curto em profundidade.`);
      return;
    }

    if (longInjuries.length >= 1 && availableCount <= 2) {
      positionNeeds.push({
        position,
        severity: "high",
        fit: "injury",
        reason: `${longInjuries.length} lesão longa e pouca cobertura imediata.`,
      });
      depthWarnings.push(`${position} tem lesão longa afetando o planejamento.`);
      return;
    }

    if (availableCount <= 2) {
      positionNeeds.push({
        position,
        severity: "medium",
        fit: "depth",
        reason: "profundidade limitada para sequência de jogos.",
      });
      depthWarnings.push(`${position} tem cobertura curta.`);
      return;
    }

    if (avgOverall > 0 && avgOverall < 68) {
      positionNeeds.push({
        position,
        severity: "medium",
        fit: "quality",
        reason: `média técnica baixa para o nível do elenco (${avgOverall}).`,
      });
      return;
    }

    const prospects = groupPlayers.filter(
      (player) =>
        player.personal.age <= 21 &&
        player.technical_profile.potential - player.technical_profile.overall >= 8,
    );

    if (prospects.length >= 2 && avgOverall < 72) {
      positionNeeds.push({
        position,
        severity: "low",
        fit: "development",
        reason: "há potencial jovem, mas pode faltar jogador pronto agora.",
      });
    }
  });

  const sortedByQuality = Object.entries(averageOverallByPosition)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);
  const strongestPositions = sortedByQuality.slice(0, 3).map(([position]) => position);
  const weakestPositions = sortedByQuality.slice(-3).reverse().map(([position]) => position);
  const urgentNeeds = positionNeeds.filter((need) => need.severity === "high");
  const contextSummary = urgentNeeds.length
    ? `Há alerta forte em ${urgentNeeds.map((need) => need.position).join(", ")}.`
    : positionNeeds.length
      ? `Há pontos de atenção em ${positionNeeds
          .slice(0, 3)
          .map((need) => need.position)
          .join(", ")}.`
      : "O elenco não mostra uma carência crítica imediata pelos dados atuais.";

  return {
    contextSummary,
    strongestPositions,
    weakestPositions,
    positionNeeds: positionNeeds.sort((a, b) => {
      const severityWeight = { high: 3, medium: 2, low: 1 };
      return severityWeight[b.severity] - severityWeight[a.severity];
    }),
    depthWarnings,
    availablePlayersByPosition,
    averageOverallByPosition,
  };
};

const buildPlayerContexts = (
  players: Player[],
): GameGlobalContext["playerContexts"] => {
  const playersByPrimaryGroup = new Map<string, Player[]>();

  players.forEach((player) => {
    const primaryGroup = groupsForPlayer(player)[0];
    const grouped = playersByPrimaryGroup.get(primaryGroup) ?? [];
    grouped.push(player);
    playersByPrimaryGroup.set(primaryGroup, grouped);
  });

  playersByPrimaryGroup.forEach((grouped, group) => {
    playersByPrimaryGroup.set(
      group,
      [...grouped].sort(
        (a, b) => b.technical_profile.overall - a.technical_profile.overall,
      ),
    );
  });

  return Object.fromEntries(
    players.map((player) => {
      const primaryGroup = groupsForPlayer(player)[0];
      const groupRank =
        (playersByPrimaryGroup.get(primaryGroup) ?? []).findIndex(
          (candidate) => candidate.id === player.id,
        ) + 1;
      const stage = careerStageFor(player);
      const minutesTrend = minutesTrendFor(player);
      const stats = player.runtime?.seasonStats;
      const roleStatus =
        groupRank <= 1 && player.technical_profile.overall >= 73
          ? "titular provável"
          : groupRank <= 2
            ? "opção de rotação"
            : stage === "prospect"
              ? "promessa buscando espaço"
              : "jogador fora da primeira linha";
      const seasonSummary =
        stats && stats.matches > 0
          ? `${stats.matches} jogo(s), nota média ${stats.rating || "sem nota"}, ${stats.goals} gol(s), ${stats.assists} assistência(s).`
          : "ainda não há estatísticas registradas de jogos anteriores nesta carreira.";
      const formText =
        (player.runtime?.form ?? 3) >= 4
          ? "boa"
          : (player.runtime?.form ?? 3) <= 2
            ? "instável"
            : "regular";
      const fitnessSummary = player.runtime?.injury
        ? `estou lesionado com ${player.runtime.injury.type}, retorno estimado em ${player.runtime.injury.daysRemaining} dia(s).`
        : `minha condição está em ${player.runtime?.condition ?? 100}% e minha forma está em ${player.runtime?.form ?? 3}/5.`;
      const contractSummary = `Contrato até ${player.contract.valid_until}, salário ${player.contract.wage.toLocaleString("pt-BR")} e valor de mercado ${player.contract.market_value.toLocaleString("pt-BR")}.`;
      const transferPressure =
        player.contract.is_transfer_listed
          ? "sale_consideration"
          : minutesTrend === "none_recorded" || minutesTrend === "low"
            ? stage === "prospect"
              ? "loan_consideration"
              : player.technical_profile.overall >= 74
                ? "sale_consideration"
                : "stay_and_fight"
            : "none";

      return [
        player.personal.name,
        {
          name: player.personal.name,
          age: ageForPlayer(player),
          position: formatPositionName(
            player.technical_profile.best_position,
            getPositionLanguageFromSave(useCareerStore.getState().saveData),
          ),
          overall: player.technical_profile.overall,
          potential: player.technical_profile.potential,
          roleStatus,
          careerStage: stage,
          minutesTrend,
          formText,
          seasonSummary,
          fitnessSummary,
          contractSummary,
          transferPressure,
        },
      ];
    }),
  );
};

const createLiveGlobalContext = (): GameGlobalContext => {
  const team = getActiveTeam();
  const players = getLivePlayersForTeam(team.id);
  const { saveData } = useCareerStore.getState();
  const transferListed = players
    .filter((player) => player.contract.is_transfer_listed)
    .map((player) => player.personal.name);
  const injuredPlayers = players
    .filter((player) => player.runtime?.injury)
    .map((player) => ({
      name: player.personal.name,
      injury: player.runtime?.injury?.type ?? "Lesao",
      durationDays: player.runtime?.injury?.daysRemaining ?? 0,
    }));
  const unhappyPlayers = players
    .filter(
      (player) =>
        (player.runtime?.condition ?? 100) < 58 ||
        (player.runtime?.form ?? 5) <= 2,
    )
    .slice(0, 4)
    .map((player) => ({
      name: player.personal.name,
      reason:
        (player.runtime?.condition ?? 100) < 58
          ? "Condicao fisica baixa e risco de queda de rendimento."
          : "Fase tecnica ruim e moral fragil.",
    }));
  const stars = [...players]
    .sort(
      (a, b) =>
        (b.technical_profile.overall ?? 0) - (a.technical_profile.overall ?? 0),
    )
    .slice(0, 4)
    .map((player) => player.personal.name);
  const transferBudget = Math.round(
    (team.transfer_budget ?? useTeamStore.getState().budget / 1000000) *
      1000000,
  );
  const recentResults = buildRecentResults(team.id);
  const playerContexts = buildPlayerContexts(players);
  const squadAnalysis = buildSquadAnalysis(players);
  const latestResult = recentResults[0];

  return {
    locale: "pt-BR",
    currentDate: saveData?.currentDate ?? "2026-05-18",
    currentYear: Number((saveData?.currentDate ?? "2026").slice(0, 4)),
    club: {
      id: team.id,
      name: team.full_name ?? team.name,
      nickname: team.nicknames?.[0]?.name ?? team.name,
      boardExpectations:
        "Cumprir os objetivos da diretoria usando o elenco atual, caixa controlado e decisoes de mercado coerentes.",
      finances: {
        balance: Math.round((team.squad_value ?? 0) * 1000000),
        transferBudget,
        wageBudget: Math.round(transferBudget * 0.18),
      },
    },
    competitions: buildCompetitionContext(team.id),
    recentMatch: latestResult
      ? {
          opponent: latestResult.opponent,
          score: latestResult.score,
          result: latestResult.result,
          summary: `${latestResult.competition}, ${latestResult.date}: ${latestResult.score} contra ${latestResult.opponent}.`,
          playerPerformances: [],
        }
      : null,
    recentResults,
    playerContexts,
    squadAnalysis,
    squadHighlights: {
      stars,
      unhappyPlayers,
      injuredPlayers,
      transferListed,
    },
    marketStatus: {
      activeIncomingProposals: [],
      leakedRumors: transferListed.length
        ? [
            `Mercado monitora a situacao de ${transferListed.slice(0, 2).join(" e ")}.`,
          ]
        : ["Intermediarios sondam o clube por oportunidades de elenco."],
    },
    mediaAndSocials: {
      breakingNews:
        unhappyPlayers.length > 0
          ? `${unhappyPlayers[0].name} vive momento de pressao interna no elenco.`
          : "Torcida cobra comunicacao clara sobre planejamento esportivo.",
      fanSentiment: unhappyPlayers.length > 1 ? "concerned" : "neutral",
      topTrendingTweet: `@TorcidaOrg: O ${team.name} precisa de decisao firme da diretoria.`,
    },
  };
};

const selectRepresentativePlayers = (
  context: GameGlobalContext,
): ActorProfile[] => {
  const team = getActiveTeam();
  const players = getLivePlayersForTeam(team.id);
  const byName = (name: string) =>
    players.find((player) => player.personal.name === name);
  const selected = [
    context.squadHighlights.unhappyPlayers[0]?.name,
    context.squadHighlights.stars[0],
    context.squadHighlights.transferListed[0],
  ]
    .filter(Boolean)
    .map((name) => byName(name))
    .filter((player): player is Player => Boolean(player));
  const unique = new Map(selected.map((player) => [player.id, player]));

  return [...unique.values()].slice(0, 2).map(playerToActor);
};

const createAgentActor = (context: GameGlobalContext): ActorProfile => {
  const linkedPlayerName =
    context.marketStatus.activeIncomingProposals[0]?.playerName ??
    context.squadHighlights.stars[0] ??
    context.squadHighlights.transferListed[0];

  return {
    id: `agent-${slug(linkedPlayerName ?? "market")}`,
    name: "Marina Paiva",
    role: "Representante de Mercado",
    kind: "agent",
    category: "market",
    linkedPlayerName,
    personality:
      "Polida, agressiva financeiramente e confortavel usando vazamentos como alavanca.",
    triggerRules: [
      "Falar de proposta, salario, comissao, renovacao ou oportunidade de mercado.",
      "Pressionar por numeros concretos e prazos curtos.",
      "Nunca discutir assuntos taticos internos que nao envolvam seu cliente.",
    ],
    image: UNKNOWN_ACTOR_IMAGE,
  };
};

const createSystemActors = (): ActorProfile[] => [
  {
    id: "cbf-eduardo",
    name: "Eduardo Nogueira",
    role: "Oficial da CBF",
    kind: "regulator",
    category: "external",
    personality:
      "Formal, procedimental e cuidadoso com linguagem administrativa.",
    triggerRules: [
      "Liberar premio financeiro de competicao.",
      "Aplicar multa disciplinar.",
      "Anunciar remarcacao de partida.",
    ],
    image: UNKNOWN_ACTOR_IMAGE,
  },
  {
    id: "supporter-cleiton",
    name: "Cleiton",
    role: "Lider da Torcida",
    kind: "supporter",
    category: "external",
    personality:
      "Intenso, territorial, brusco e sem interesse em cumprimento casual.",
    triggerRules: [
      "Nunca mandar bom dia ou papo casual.",
      "Cobrar explicacao sobre vexame, falta de garra ou decisao corporativa.",
      "Defender a arquibancada e pressionar por resposta publica.",
    ],
    image: UNKNOWN_ACTOR_IMAGE,
  },
];

const buildActors = (context: GameGlobalContext): ActorProfile[] => [
  getCoachActor(getActiveTeam()),
  ...selectRepresentativePlayers(context),
  createAgentActor(context),
  ...createSystemActors(),
];

const proposalForActor = (actor: ActorProfile, context: GameGlobalContext) =>
  context.marketStatus.activeIncomingProposals.find(
    (proposal) => proposal.playerName === actor.linkedPlayerName,
  );

const inferSmartPrompts = (
  actor: ActorProfile,
  latestText: string,
  context: GameGlobalContext,
): string[] => {
  const text = normalize(latestText);
  const proposal = proposalForActor(actor, context);
  const mentionsProposal =
    Boolean(proposal) || text.includes("proposta") || text.includes("mercado");
  const mentionsContract =
    text.includes("contrato") ||
    text.includes("salario") ||
    text.includes("renov");
  const mentionsMatchCrisis =
    text.includes("derrota") ||
    text.includes("classico") ||
    text.includes("vexame");
  const mentionsDefense =
    text.includes("defesa") ||
    text.includes("zagueiro") ||
    text.includes("lateral");
  const mentionsRegulation =
    text.includes("multa") ||
    text.includes("remarc") ||
    text.includes("oficio");

  if (actor.kind === "player" && (mentionsProposal || mentionsContract)) {
    return proposal
      ? [
          `Apresentar renovacao para competir com ${proposal.offeringClub}`,
          `Informar que a proposta do ${proposal.offeringClub} sera avaliada`,
          "Pedir foco no proximo jogo antes de negociar",
        ]
      : [
          "Abrir conversa de renovacao com aumento condicionado a metas",
          "Explicar que nenhuma proposta formal chegou ao clube",
          "Pedir foco esportivo antes de discutir valores",
        ];
  }

  if (
    actor.kind === "coach" &&
    (mentionsMatchCrisis ||
      mentionsDefense ||
      context.squadHighlights.transferListed.length > 0)
  ) {
    return [
      "Autorizar diagnostico imediato das lacunas defensivas",
      "Pedir tres nomes viaveis para reforcar a posicao critica",
      "Suspender mudancas na lista de transferencias ate reuniao tecnica",
    ];
  }

  if (
    actor.kind === "supporter" &&
    (mentionsMatchCrisis || context.mediaAndSocials.fanSentiment !== "neutral")
  ) {
    return [
      "Assumir responsabilidade publica sem expor o vestiario",
      "Marcar reuniao institucional com a torcida",
      "Prometer resposta esportiva sem ceder a ameacas",
    ];
  }

  if (actor.kind === "regulator" || mentionsRegulation) {
    return [
      "Solicitar oficio com prazo, valor e base regulamentar",
      "Confirmar ciencia sem abrir mao de recurso",
      "Pedir detalhamento do impacto financeiro",
    ];
  }

  if (actor.kind === "agent") {
    return [
      "Pedir numeros formais por escrito",
      "Recusar pressao por vazamento",
      "Abrir janela curta para proposta objetiva",
    ];
  }

  return [
    "Pedir detalhes objetivos antes de decidir",
    "Propor reuniao curta ainda hoje",
    "Manter a posicao do clube sem fechar a porta",
  ];
};

const openingForActor = (
  actor: ActorProfile,
  context: GameGlobalContext,
): string => {
  const proposal = proposalForActor(actor, context);
  const transferListed = context.squadHighlights.transferListed[0];
  const unhappy = context.squadHighlights.unhappyPlayers.find(
    (player) => player.name === actor.linkedPlayerName,
  );

  switch (actor.kind) {
    case "coach":
      return transferListed
        ? `Presidente, antes de mexermos mais no mercado, preciso entender a situacao de ${transferListed}. Isso afeta o plano tecnico.`
        : "Presidente, quero alinhar o planejamento do elenco antes que o mercado force uma decisao ruim.";
    case "player":
      if (proposal) {
        return `Presidente, chegou essa conversa de ${proposal.offeringClub}. Quero saber se o clube conta comigo ou se vai abrir negociacao.`;
      }

      return unhappy
        ? `Presidente, meu momento virou assunto interno. Quero clareza sobre meu espaco no projeto.`
        : `Presidente, queria entender diretamente como voce enxerga meu papel nesta fase da temporada.`;
    case "agent":
      return actor.linkedPlayerName
        ? `Presidente, precisamos falar de ${actor.linkedPlayerName}. O mercado esta se mexendo e eu nao quero deixar isso esfriar.`
        : "Presidente, tenho uma oportunidade de mercado e preciso de uma resposta rapida do clube.";
    case "regulator":
      return "Comunicamos que eventuais ajustes de tabela e premios serao formalizados por oficio no prazo regulamentar.";
    case "supporter":
      return `Presidente, a arquibancada quer saber qual e o rumo do ${context.club.nickname}. Sem papo bonito, queremos decisao.`;
  }
};

const toAiHistory = (messages: ThreadMessage[]): AiChatMessage[] =>
  messages
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

const buildChats = (
  context: GameGlobalContext,
  existingChats: Chat[] = [],
): Chat[] => {
  const existingByKindAndName = new Map(
    existingChats.map((chat) => [
      `${chat.actor.kind}:${chat.actor.name}`,
      chat,
    ]),
  );

  return buildActors(context).map((actor, index) => {
    const existing = existingByKindAndName.get(`${actor.kind}:${actor.name}`);

    if (existing) {
      const smartPromptChips = dialogueEngine.getChips(actor, context);
      return {
        ...existing,
        actor,
        smartPromptChips,
        smartPrompts: inferSmartPrompts(
          actor,
          existing.messages[existing.messages.length - 1]?.content ?? "",
          context,
        ),
      };
    }

    const opening = openingForActor(actor, context);
    const smartPromptChips = dialogueEngine.getChips(actor, context);

    return {
      id: actor.id,
      actor,
      isUnlocked: true,
      presence: index % 3 === 0 ? "online" : "away",
      dialoguePhase: "idle",
      pendingResponse: false,
      unreadCount: index < 3 ? 1 : 0,
      smartPromptChips,
      smartPrompts: inferSmartPrompts(actor, opening, context),
      messages: [
        {
          id: makeId("msg"),
          chatId: actor.id,
          role: "assistant",
          content: opening,
          timestamp: createVirtualTimestamp(
            context.currentDate,
            540 + index * 9,
          ),
          deliveryState: "delivered",
          isUnread: index < 3,
        },
      ],
    };
  });
};

const initialContext = createLiveGlobalContext();
const initialChats = buildChats(initialContext);

export const useMessageStore = create<MessageState>((set, get) => ({
  chats: initialChats,
  activeChatId: initialChats[0]?.id ?? "messages",
  searchTerm: "",
  activeFilter: "all",
  globalContext: initialContext,
  virtualMinuteOfDay: 570,

  setActiveChat: (chatId) => {
    set({ activeChatId: chatId });
    get().markAllRead(chatId);
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  setFilter: (filter) => set({ activeFilter: filter }),

  advanceVirtualClock: (minutes) =>
    set((state) => ({
      virtualMinuteOfDay: Math.max(
        0,
        Math.min(1439, state.virtualMinuteOfDay + minutes),
      ),
    })),

  setGlobalContext: (context) =>
    set((state) => {
      const dayChanged =
        context.currentDate !== state.globalContext.currentDate;

      return {
        globalContext: context,
        virtualMinuteOfDay: dayChanged ? 540 : state.virtualMinuteOfDay,
        chats: buildChats(context, state.chats),
      };
    }),

  syncLiveContext: () => {
    const context = createLiveGlobalContext();
    get().setGlobalContext(context);
  },

  markAllRead: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              unreadCount: 0,
              messages: chat.messages.map((message) => ({
                ...message,
                isUnread: false,
              })),
            }
          : chat,
      ),
    })),

  initiateChat: (chatId, openingText) => {
    const chat = get().chats.find((item) => item.id === chatId);

    if (!chat || !chat.isUnlocked) {
      return;
    }

    get().setActiveChat(chatId);

    if (openingText?.trim()) {
      void get().sendMessage(chatId, openingText);
    }
  },

  applySmartPrompt: async (chatId, prompt) => {
    await get().sendMessage(chatId, prompt);
  },

  applySmartChip: async (chatId, chipId) => {
    const chat = get().chats.find((item) => item.id === chatId);
    const chip = chat?.smartPromptChips.find((item) => item.id === chipId);
    await get().sendMessage(chatId, chip?.label ?? chipId);
  },

  sendMessage: async (chatId, content) => {
    get().syncLiveContext();

    const trimmedContent = content.trim();
    const currentState = get();
    const currentChat = currentState.chats.find((chat) => chat.id === chatId);

    if (
      !trimmedContent ||
      !currentChat ||
      currentChat.pendingResponse ||
      !currentChat.isUnlocked
    ) {
      return;
    }

    const submittedAtVirtualMinute = currentState.virtualMinuteOfDay;
    const submittedAt = createVirtualTimestamp(
      currentState.globalContext.currentDate,
      submittedAtVirtualMinute,
    );
    const expectedAssistantTimestamp = addMinutesToIso(submittedAt, 20);
    const requestId = makeId("dialogue");
    const assistantMessageId = makeId("assistant");
    const clickedChip = currentChat.smartPromptChips.find(
      (chip) => chip.label === trimmedContent || chip.id === trimmedContent,
    );
    const userMessage: ThreadMessage = {
      id: makeId("user"),
      chatId,
      role: "user",
      content: clickedChip?.label ?? trimmedContent,
      timestamp: submittedAt,
      deliveryState: "sent",
    };
    const pendingRequest: PendingThreadRequest = {
      requestId,
      chatId,
      submittedAt,
      expectedAssistantTimestamp,
      submittedAtVirtualMinute,
    };

    set((state) => ({
      virtualMinuteOfDay: Math.min(1439, state.virtualMinuteOfDay + 1),
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              presence: "processing",
              dialoguePhase: "processing",
              pendingResponse: true,
              pendingRequest,
              lastError: undefined,
              messages: [...chat.messages, userMessage],
              smartPromptChips: clickedChip
                ? chat.smartPromptChips
                : dialogueEngine.getChips(chat.actor, state.globalContext),
              smartPrompts: inferSmartPrompts(
                chat.actor,
                trimmedContent,
                state.globalContext,
              ),
            }
          : chat,
      ),
    }));

    const refreshedChat = get().chats.find((chat) => chat.id === chatId);

    if (!refreshedChat) {
      return;
    }

    try {
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId && chat.pendingRequest?.requestId === requestId
            ? {
                ...chat,
                presence: "typing",
                dialoguePhase: "streaming",
              }
            : chat,
        ),
      }));

      const response = await dialogueEngine.reply({
        actor: refreshedChat.actor,
        history: toAiHistory(refreshedChat.messages),
        globalContext: get().globalContext,
        input: trimmedContent,
        chatId,
        chipId: clickedChip?.id,
      });

      set((state) => ({
        chats: state.chats.map((chat) => {
          if (
            chat.id !== chatId ||
            chat.pendingRequest?.requestId !== requestId
          ) {
            return chat;
          }

          const assistantMessages: ThreadMessage[] = response.messages.map(
            (messageContent, index) => ({
              id: index === 0 ? assistantMessageId : makeId("assistant"),
              chatId,
              role: "assistant",
              content: messageContent,
              timestamp: addMinutesToIso(expectedAssistantTimestamp, index),
              deliveryState: "delivered",
              isUnread: state.activeChatId !== chatId,
              generatedAtVirtualMinute: submittedAtVirtualMinute + 20 + index,
            }),
          );

          return {
            ...chat,
            presence: "online",
            dialoguePhase: "idle",
            pendingResponse: false,
            pendingRequest: undefined,
            unreadCount:
              state.activeChatId === chatId ? 0 : chat.unreadCount + 1,
            lastError: undefined,
            messages: [...chat.messages, ...assistantMessages],
            smartPromptChips: response.chips,
            smartPrompts: inferSmartPrompts(
              chat.actor,
              response.content,
              state.globalContext,
            ),
          };
        }),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      set((state) => ({
        chats: state.chats.map((chat) => {
          if (
            chat.id !== chatId ||
            chat.pendingRequest?.requestId !== requestId
          ) {
            return chat;
          }

          return {
            ...chat,
            presence: "away",
            dialoguePhase: "failed",
            pendingResponse: false,
            pendingRequest: undefined,
            lastError: message,
            messages: chat.messages,
            smartPromptChips: dialogueEngine.getChips(
              chat.actor,
              state.globalContext,
            ),
            smartPrompts: inferSmartPrompts(
              chat.actor,
              trimmedContent,
              state.globalContext,
            ),
          };
        }),
      }));
    }
  },
}));
