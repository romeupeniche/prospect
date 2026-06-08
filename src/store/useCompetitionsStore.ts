import { create } from "zustand";
import _initial_competitions from "../data/competitions.json";
import _initial_fixtures from "../data/fixtures.json";
import _venues from "../data/venues.json";
import _initial_teams from "../data/teams.json";
import _referees from "../data/referees.json";
import { getTeamSquadPlayers } from "../data/teamSquads";
import { useTeamStore } from "./useTeamStore";
import type { RuntimePlayer } from "./useTeamStore";
import { selectBestAiMatchdaySquad } from "../utils/teamLineupAI";

const venues = _venues as StadiumMap;
const initial_teams = _initial_teams as unknown as Team[];
const referees = _referees as Referee[];
const initial_competitions = _initial_competitions as unknown as Record<
  string,
  CompetitionData
>;
const initial_fixtures = _initial_fixtures as unknown as Record<
  string,
  Record<string, Competition_Fixture_Obj>
>;

type LiveScore = {
  home: number;
  away: number;
};

type LiveScoresByFixtureId = Record<string, LiveScore>;

export type TeamFormResult = "V" | "E" | "D";
export type TeamFormBadge = TeamFormResult | "-";
export type MatchHistoryPeriod = "firstHalf" | "secondHalf" | "extraTime" | "penalties";

export type TeamMatchHistoryEvent = MatchEvent & {
  id: string;
  period: MatchHistoryPeriod;
  teamId: string;
  rawType?: string;
  rawText?: string;
};

export type TeamMatchHistoryEntry = {
  fixtureId: string;
  competitionId: string;
  competitionName: string;
  date: string;
  time: string;
  round: string;
  venue: string;
  isHome: boolean;
  teamId: string;
  opponentId: string;
  opponentName: string;
  opponentLogo: string;
  scoreFor: number;
  scoreAgainst: number;
  homeScore: number;
  awayScore: number;
  result: TeamFormResult;
  statsFor: Record<string, number>;
  statsAgainst: Record<string, number>;
  matchStats: MatchStats | null;
  playerStatsFor: Record<string, PlayerPerformance>;
  playerStatsAgainst: Record<string, PlayerPerformance>;
  events: TeamMatchHistoryEvent[];
  eventsByPeriod: Record<MatchHistoryPeriod, TeamMatchHistoryEvent[]>;
  goals: PlayerPerformance[];
  assists: PlayerPerformance[];
  ownGoals: PlayerPerformance[];
  yellowCards: PlayerPerformance[];
  redCards: PlayerPerformance[];
  substitutions: TeamMatchHistoryEvent[];
  rawFixture: Competition_Fixture_Obj;
};

const teamOrder = new Map(initial_teams.map((team, index) => [team.id, index]));

const emptyStanding = (teamId: string): StandingRow => ({
  team_id: teamId,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goals_for: 0,
  goals_against: 0,
  goals_diff: 0,
  points: 0,
});

const sortStandings = (standings: StandingRow[]): StandingRow[] =>
  standings.slice().sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.goals_diff !== a.goals_diff) return b.goals_diff - a.goals_diff;
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
    return (teamOrder.get(a.team_id) ?? 999) - (teamOrder.get(b.team_id) ?? 999);
  });

const calculateStandingsFromFixtures = (
  fixtures: Record<string, Competition_Fixture_Obj> | undefined,
  liveScores: LiveScoresByFixtureId = {},
): StandingRow[] => {
  const standingsMap: Record<string, StandingRow> = {};
  const ensureTeam = (teamId: string) => {
    if (!standingsMap[teamId]) standingsMap[teamId] = emptyStanding(teamId);
    return standingsMap[teamId];
  };

  Object.values(fixtures ?? {}).forEach((fixture) => {
    ensureTeam(fixture.homeTeam);
    ensureTeam(fixture.awayTeam);

    const liveScore = liveScores[fixture.id];
    const shouldCount = fixture.status === "finished" || Boolean(liveScore);
    if (!shouldCount) return;

    const score = liveScore ?? fixture.score;
    const homeRow = ensureTeam(fixture.homeTeam);
    const awayRow = ensureTeam(fixture.awayTeam);

    homeRow.played += 1;
    awayRow.played += 1;
    homeRow.goals_for += score.home;
    homeRow.goals_against += score.away;
    awayRow.goals_for += score.away;
    awayRow.goals_against += score.home;

    if (score.home > score.away) {
      homeRow.wins += 1;
      homeRow.points += 3;
      awayRow.losses += 1;
    } else if (score.away > score.home) {
      awayRow.wins += 1;
      awayRow.points += 3;
      homeRow.losses += 1;
    } else {
      homeRow.draws += 1;
      awayRow.draws += 1;
      homeRow.points += 1;
      awayRow.points += 1;
    }

    homeRow.goals_diff = homeRow.goals_for - homeRow.goals_against;
    awayRow.goals_diff = awayRow.goals_for - awayRow.goals_against;
  });

  return sortStandings(Object.values(standingsMap));
};

const stableIndexFromId = (id: string, length: number): number => {
  if (length <= 0) return 0;
  const hash = id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return hash % length;
};

const rotateRefereesForDate = (date: string): Referee[] => {
  if (referees.length === 0) return [];
  const startIndex = stableIndexFromId(date, referees.length);
  return referees.map((_, index) => referees[(startIndex + index) % referees.length]);
};

const assignRefereesToFixtures = (
  fixturesByCompetition: Record<string, Record<string, Competition_Fixture_Obj>>,
): Record<string, Record<string, Competition_Fixture_Obj>> => {
  const nextFixtures = Object.fromEntries(
    Object.entries(fixturesByCompetition).map(([competitionId, fixtures]) => [
      competitionId,
      Object.fromEntries(
        Object.entries(fixtures).map(([fixtureId, fixture]) => [
          fixtureId,
          { ...fixture },
        ]),
      ) as Record<string, Competition_Fixture_Obj>,
    ]),
  ) as Record<string, Record<string, Competition_Fixture_Obj>>;

  const fixturesByDate = new Map<string, Array<{ competitionId: string; fixtureId: string; fixture: Competition_Fixture_Obj }>>();
  Object.entries(nextFixtures).forEach(([competitionId, fixtures]) => {
    Object.entries(fixtures).forEach(([fixtureId, fixture]) => {
      const dayFixtures = fixturesByDate.get(fixture.date) ?? [];
      dayFixtures.push({ competitionId, fixtureId, fixture });
      fixturesByDate.set(fixture.date, dayFixtures);
    });
  });

  fixturesByDate.forEach((dayFixtures, date) => {
    const refereePool = rotateRefereesForDate(date);
    dayFixtures
      .sort((a, b) => {
        if (a.fixture.time !== b.fixture.time) return a.fixture.time.localeCompare(b.fixture.time);
        return a.fixture.id.localeCompare(b.fixture.id);
      })
      .forEach(({ competitionId, fixtureId, fixture }, index) => {
        const referee = refereePool[index];
        nextFixtures[competitionId][fixtureId] = {
          ...fixture,
          refereeId: referee?.id,
        };
      });
  });

  return nextFixtures;
};

const initial_fixtures_with_referees = assignRefereesToFixtures(initial_fixtures);

const initial_competitions_with_tables = Object.fromEntries(
  Object.entries(initial_competitions).map(([competitionId, competition]) => [
    competitionId,
    {
      ...competition,
      standings: calculateStandingsFromFixtures(initial_fixtures_with_referees[competitionId]),
    },
  ]),
) as Record<string, CompetitionData>;

const clampScoreInfluence = (value: number): number =>
  Math.max(-0.55, Math.min(0.55, value / 35));

const expectedToGoals = (expectedGoals: number, seed: number): number => {
  const xg = Math.max(0.15, Math.min(3.2, expectedGoals));
  const first = seed % 100;
  const second = Math.floor(seed / 3) % 100;
  const third = Math.floor(seed / 13) % 100;
  let goals = 0;
  if (first < xg * 52) goals += 1;
  if (second < Math.max(0, xg - 0.7) * 38) goals += 1;
  if (third < Math.max(0, xg - 1.6) * 26) goals += 1;
  if (xg > 2.6 && seed % 37 === 0) goals += 1;
  return goals;
};

const parseHistoryMinute = (value: number | string): {
  minute: number;
  extraMinute?: number;
  period: MatchHistoryPeriod;
} => {
  if (typeof value === "number") {
    return {
      minute: value,
      period: value > 90 ? "extraTime" : value <= 45 ? "firstHalf" : "secondHalf",
    };
  }

  const normalized = value.replace("'", "").trim();
  const [minuteText, extraText] = normalized.split("+");
  const minute = Number(minuteText) || 0;
  const extraMinute = extraText ? Number(extraText) || undefined : undefined;
  return {
    minute,
    extraMinute,
    period: minute > 90 ? "extraTime" : minute <= 45 ? "firstHalf" : "secondHalf",
  };
};

const emptyEventsByPeriod = (): Record<MatchHistoryPeriod, TeamMatchHistoryEvent[]> => ({
  firstHalf: [],
  secondHalf: [],
  extraTime: [],
  penalties: [],
});

const resultForTeam = (
  isHome: boolean,
  score: { home: number; away: number },
): TeamFormResult => {
  const scoreFor = isHome ? score.home : score.away;
  const scoreAgainst = isHome ? score.away : score.home;
  if (scoreFor > scoreAgainst) return "V";
  if (scoreFor < scoreAgainst) return "D";
  return "E";
};

const pairStatsForSide = (
  stats: MatchStats | null,
  side: "home" | "away",
): Record<string, number> => {
  if (!stats) return {};
  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [
      key,
      (value as TeamStatPair<number>)[side] ?? 0,
    ]),
  );
};

const fixtureDateTimeValue = (fixture: Competition_Fixture_Obj): number =>
  new Date(`${fixture.date}T${fixture.time || "00:00"}:00`).getTime();

const normalizeFixtureEvent = (
  event: MatchEvent,
  fixture: Competition_Fixture_Obj,
  index: number,
): TeamMatchHistoryEvent => {
  const parsed = parseHistoryMinute(event.minute);
  const period =
    event.period ??
    (event.detail.toLowerCase().includes("penalt") ? "penalties" : parsed.period);
  const teamId = event.team === "home" ? fixture.homeTeam : fixture.awayTeam;
  return {
    ...event,
    id: `${fixture.id}-${index}-${event.type}-${event.minute}-${event.playerId || "event"}`,
    minute: parsed.minute,
    extraMinute: event.extraMinute ?? parsed.extraMinute,
    period,
    teamId,
    rawType: event.rawType ?? event.type,
    rawText: event.rawText ?? event.detail,
  };
};

const buildHistoryEntry = (
  competition: CompetitionData,
  fixture: Competition_Fixture_Obj,
  teamId: string,
): TeamMatchHistoryEntry | null => {
  const isHome = fixture.homeTeam === teamId;
  const isAway = fixture.awayTeam === teamId;
  if (!isHome && !isAway) return null;

  const side: "home" | "away" = isHome ? "home" : "away";
  const opponentSide: "home" | "away" = isHome ? "away" : "home";
  const opponentId = isHome ? fixture.awayTeam : fixture.homeTeam;
  const opponent = initial_teams.find((team) => team.id === opponentId);
  const normalizedEvents = fixture.events.map((event, index) =>
    normalizeFixtureEvent(event, fixture, index),
  );
  const eventsByPeriod = emptyEventsByPeriod();
  normalizedEvents.forEach((event) => eventsByPeriod[event.period].push(event));

  const playerStatsFor = fixture.playerStats?.[side] ?? {};
  const playerStatsAgainst = fixture.playerStats?.[opponentSide] ?? {};
  const playerValues = Object.values(playerStatsFor);

  return {
    fixtureId: fixture.id,
    competitionId: competition.id,
    competitionName: competition.name,
    date: fixture.date,
    time: fixture.time,
    round: fixture.round,
    venue: venues[fixture.venue]?.name ?? fixture.venue,
    isHome,
    teamId,
    opponentId,
    opponentName: opponent?.name ?? opponentId,
    opponentLogo: opponent?.logo ?? "",
    scoreFor: isHome ? fixture.score.home : fixture.score.away,
    scoreAgainst: isHome ? fixture.score.away : fixture.score.home,
    homeScore: fixture.score.home,
    awayScore: fixture.score.away,
    result: resultForTeam(isHome, fixture.score),
    statsFor: pairStatsForSide(fixture.stats, side),
    statsAgainst: pairStatsForSide(fixture.stats, opponentSide),
    matchStats: fixture.stats,
    playerStatsFor,
    playerStatsAgainst,
    events: normalizedEvents,
    eventsByPeriod,
    goals: playerValues.filter((player) => player.goals > 0),
    assists: playerValues.filter((player) => player.assists > 0),
    ownGoals: playerValues.filter((player) => (player.ownGoals ?? 0) > 0),
    yellowCards: playerValues.filter((player) => (player.yellowCards ?? 0) > 0),
    redCards: playerValues.filter((player) => (player.redCards ?? 0) > 0),
    substitutions: normalizedEvents.filter((event) => event.type === "substitution"),
    rawFixture: fixture,
  };
};

const makeStatPair = (home: number, away: number): TeamStatPair<number> => ({ home, away });

const buildBackgroundMatchStats = (
  score: { home: number; away: number },
  seed: number,
): MatchStats => {
  const homeShots = Math.max(4, score.home * 3 + 6 + (seed % 4));
  const awayShots = Math.max(4, score.away * 3 + 5 + (Math.floor(seed / 5) % 4));
  const homeOnTarget = Math.min(homeShots, Math.max(score.home, score.home + 2 + (seed % 2)));
  const awayOnTarget = Math.min(awayShots, Math.max(score.away, score.away + 1 + (Math.floor(seed / 7) % 2)));
  const homePossession = Math.max(36, Math.min(64, 50 + (score.home - score.away) * 3 + ((seed % 9) - 4)));
  const awayPossession = 100 - homePossession;
  const homePasses = 320 + homePossession * 4 + (seed % 60);
  const awayPasses = 320 + awayPossession * 4 + (Math.floor(seed / 3) % 60);

  return {
    possession: makeStatPair(homePossession, awayPossession),
    shotsTotal: makeStatPair(homeShots, awayShots),
    shotsOnTarget: makeStatPair(homeOnTarget, awayOnTarget),
    shotsOffTarget: makeStatPair(Math.max(0, homeShots - homeOnTarget - 2), Math.max(0, awayShots - awayOnTarget - 2)),
    blockedShots: makeStatPair(Math.max(1, homeShots - homeOnTarget - 3), Math.max(1, awayShots - awayOnTarget - 3)),
    cornerKicks: makeStatPair(Math.max(1, Math.floor(homeShots / 3)), Math.max(1, Math.floor(awayShots / 3))),
    offsides: makeStatPair(seed % 3, Math.floor(seed / 11) % 3),
    fouls: makeStatPair(8 + (seed % 7), 8 + (Math.floor(seed / 13) % 7)),
    yellowCards: makeStatPair(seed % 3, Math.floor(seed / 17) % 3),
    redCards: makeStatPair(seed % 61 === 0 ? 1 : 0, seed % 67 === 0 ? 1 : 0),
    bigChances: makeStatPair(Math.max(0, score.home + (seed % 2)), Math.max(0, score.away + (Math.floor(seed / 19) % 2))),
    bigChancesMissed: makeStatPair(Math.max(0, homeOnTarget - score.home - 1), Math.max(0, awayOnTarget - score.away - 1)),
    goalkeeperSaves: makeStatPair(Math.max(0, awayOnTarget - score.away), Math.max(0, homeOnTarget - score.home)),
    passesTotal: makeStatPair(homePasses, awayPasses),
    passesAccurate: makeStatPair(Math.round(homePasses * 0.84), Math.round(awayPasses * 0.83)),
    tackles: makeStatPair(10 + (seed % 6), 10 + (Math.floor(seed / 23) % 6)),
  };
};

const createBackgroundPerformance = (
  player: RuntimePlayer,
  isFirstEleven: boolean,
  minutesPlayed: number,
  goalsConceded: number,
): PlayerPerformance => {
  const isGoalkeeper = player.technical_profile.best_position === "GK";
  return {
    playerId: player.id,
    name: player.personal.short_name || player.personal.name,
    rating: 6,
    isFirstEleven,
    minutesPlayed,
    goals: 0,
    assists: 0,
    ownGoals: 0,
    shotsTotal: 0,
    shotsOnTarget: 0,
    bigChancesCreated: 0,
    bigChancesMissed: 0,
    passesTotal: isFirstEleven ? 28 : 6,
    passesAccurate: isFirstEleven ? 23 : 5,
    keyPasses: 0,
    crossesTotal: 0,
    crossesAccurate: 0,
    longBallsTotal: isGoalkeeper ? 8 : 2,
    longBallsAccurate: isGoalkeeper ? 4 : 1,
    tackles: isGoalkeeper ? 0 : 1,
    interceptions: isGoalkeeper ? 0 : 1,
    clearances: isGoalkeeper ? 0 : 1,
    blockedShots: 0,
    duelsGroundTotal: isGoalkeeper ? 0 : 4,
    duelsGroundWon: isGoalkeeper ? 0 : 2,
    duelsAerialTotal: isGoalkeeper ? 0 : 2,
    duelsAerialWon: isGoalkeeper ? 0 : 1,
    dispossessed: 0,
    foulsCommitted: 0,
    foulsDrawn: 0,
    yellowCards: 0,
    redCards: 0,
    goalsConceded,
    goalkeeper: isGoalkeeper
      ? {
          saves: Math.max(0, 3 - goalsConceded),
          savesInsideBox: Math.max(0, 2 - goalsConceded),
          punches: 0,
          highClaims: 1,
        }
      : undefined,
  };
};

const buildBackgroundMatchDetails = (
  fixture: Competition_Fixture_Obj,
  score: { home: number; away: number },
  seed: number,
): { stats: MatchStats; playerStats: MatchPlayerStats; events: MatchEvent[] } => {
  const homePlayers = useTeamStore.getState().getTeamPlayers(fixture.homeTeam);
  const awayPlayers = useTeamStore.getState().getTeamPlayers(fixture.awayTeam);
  const homeAiSquad = selectBestAiMatchdaySquad(homePlayers);
  const awayAiSquad = selectBestAiMatchdaySquad(awayPlayers);
  const homeById = new Map(homePlayers.map((player) => [player.id, player]));
  const awayById = new Map(awayPlayers.map((player) => [player.id, player]));
  const homeStarters = homeAiSquad.starters
    .map((starter) => homeById.get(starter.id))
    .filter(Boolean) as RuntimePlayer[];
  const awayStarters = awayAiSquad.starters
    .map((starter) => awayById.get(starter.id))
    .filter(Boolean) as RuntimePlayer[];
  const homeBench = homeAiSquad.bench
    .map((id) => homeById.get(id))
    .filter(Boolean) as RuntimePlayer[];
  const awayBench = awayAiSquad.bench
    .map((id) => awayById.get(id))
    .filter(Boolean) as RuntimePlayer[];
  const stats = buildBackgroundMatchStats(score, seed);

  const makePlayerStats = (
    starters: RuntimePlayer[],
    bench: RuntimePlayer[],
    conceded: number,
  ): Record<string, PlayerPerformance> => {
    const entries = [
      ...starters.map((player) => [player.id, createBackgroundPerformance(player, true, 90, conceded)] as const),
      ...bench.slice(0, 3).map((player) => [player.id, createBackgroundPerformance(player, false, 25, conceded)] as const),
    ];
    return Object.fromEntries(entries);
  };

  const playerStats: MatchPlayerStats = {
    home: makePlayerStats(homeStarters, homeBench, score.away),
    away: makePlayerStats(awayStarters, awayBench, score.home),
  };

  const events: MatchEvent[] = [];
  const addGoalEvents = (
    side: "home" | "away",
    goals: number,
    players: RuntimePlayer[],
    baseSeed: number,
  ) => {
    const attackingPlayers = players
      .filter((player) => player.technical_profile.best_position !== "GK")
      .sort((a, b) => b.technical_profile.overall - a.technical_profile.overall);

    for (let index = 0; index < goals; index += 1) {
      const scorer = attackingPlayers[(baseSeed + index * 3) % Math.max(1, attackingPlayers.length)];
      const assister = attackingPlayers[(baseSeed + index * 5 + 2) % Math.max(1, attackingPlayers.length)];
      const minute = Math.min(88, 12 + ((baseSeed + index * 23) % 76));
      if (scorer && playerStats[side][scorer.id]) {
        playerStats[side][scorer.id].goals += 1;
        playerStats[side][scorer.id].shotsTotal += 2;
        playerStats[side][scorer.id].shotsOnTarget += 1;
        playerStats[side][scorer.id].rating += 0.8;
      }
      if (assister && assister.id !== scorer?.id && playerStats[side][assister.id]) {
        playerStats[side][assister.id].assists += 1;
        playerStats[side][assister.id].keyPasses += 1;
        playerStats[side][assister.id].rating += 0.45;
      }
      events.push({
        minute,
        team: side,
        type: "goal",
        playerId: scorer?.id ?? "",
        detail: "Regular Goal",
        assistPlayerId: assister && assister.id !== scorer?.id ? assister.id : undefined,
      });
    }
  };

  addGoalEvents("home", score.home, homeStarters, seed);
  addGoalEvents("away", score.away, awayStarters, Math.floor(seed / 7) + 13);

  (["home", "away"] as const).forEach((side, sideIndex) => {
    const sidePlayers = side === "home" ? homeStarters : awayStarters;
    const sideBench = side === "home" ? homeBench : awayBench;
    const yellowCount = stats.yellowCards[side];
    for (let index = 0; index < yellowCount; index += 1) {
      const player = sidePlayers[(seed + sideIndex * 11 + index * 7) % Math.max(1, sidePlayers.length)];
      if (player && playerStats[side][player.id]) playerStats[side][player.id].yellowCards = 1;
      events.push({
        minute: Math.min(89, 20 + ((seed + index * 17 + sideIndex * 9) % 65)),
        team: side,
        type: "card",
        playerId: player?.id ?? "",
        detail: "Yellow Card",
      });
    }
    sideBench.slice(0, 3).forEach((playerIn, index) => {
      const playerOut = sidePlayers[8 + index] ?? sidePlayers[sidePlayers.length - 1];
      events.push({
        minute: 62 + index * 9,
        team: side,
        type: "substitution",
        playerId: playerIn?.id ?? "",
        detail: "Substitution",
        playerInId: playerIn?.id,
        playerOutId: playerOut?.id,
      });
    });
  });

  return {
    stats,
    playerStats,
    events: events.sort((a, b) => a.minute - b.minute),
  };
};

const resolveFixtureRefereeId = (fixture: Competition_Fixture_Obj): string | null => {
  if (fixture.refereeId) return fixture.refereeId;
  return null;
};

const buildFixtureSquadRelation = (
  fixture: Competition_Fixture_Obj,
): NonNullable<Competition_Fixture_Obj["squadRelation"]> => {
  const pickRelated = (teamId: string) =>
    getTeamSquadPlayers(teamId)
      .filter((player) => Boolean(player?.id))
      .sort((a, b) => b.technical_profile.overall - a.technical_profile.overall)
      .slice(0, 18)
      .map((player) => player.id);

  return {
    home: fixture.squadRelation?.home?.length ? fixture.squadRelation.home : pickRelated(fixture.homeTeam),
    away: fixture.squadRelation?.away?.length ? fixture.squadRelation.away : pickRelated(fixture.awayTeam),
    announcedAt: fixture.squadRelation?.announcedAt,
  };
};

interface CompetitionsState {
  competitions: Record<string, CompetitionData>;
  fixtures: Record<string, Record<string, Competition_Fixture_Obj>>;
  liveScores: Record<string, LiveScore>;

  getFixtureData: (competitionId: string, fixtureId: string) => Fixture;
  updateMatchResult: (
    competitionId: string,
    matchId: string,
    score: { home: number; away: number },
    extraDetails?: {
      stats?: MatchStats;
      playerStats?: MatchPlayerStats;
      events?: MatchEvent[];
    },
  ) => void;
  recalculateTable: (competitionId: string) => StandingRow[];
  getCompetitionStandings: (competitionId: string, includeLive?: boolean) => StandingRow[];
  updateLiveMatchScore: (competitionId: string, matchId: string, score: LiveScore) => void;
  clearLiveMatchScore: (matchId: string) => void;
  simulateBackgroundMatchesForDate: (date: string, excludedTeamId?: string) => void;
  getTeamMatchHistory: (teamId: string) => TeamMatchHistoryEntry[];
  getTeamForm: (teamId: string, count?: number) => TeamFormBadge[];
  getTeamCalendar: (teamId: string) => Fixture[];
  getTeamFixturesForDate: (teamId: string, date: string) => Fixture[];
  getNextMatchFromDate: (teamId: string, currentDate: string) => Fixture | null;
  getNextMatch: (teamId: string) => Fixture | null; // se for nulo eh pq acabou a temporada
}

export const useCompetitionsStore = create<CompetitionsState>((set, get) => ({
  competitions: initial_competitions_with_tables,
  fixtures: initial_fixtures_with_referees,
  liveScores: {},

  getFixtureData: (competitionId, fixtureId) => {
    const comp = get().competitions[competitionId];
    const fixtures = get().fixtures[competitionId];
    if (!comp) throw new Error(`Competição ${competitionId} não encontrada`);

    const fixture = fixtures[fixtureId];
    if (!fixture) throw new Error(`Partida ${fixtureId} não encontrada`);

    const homeTeamFound = initial_teams.find(
      (team) => team.id === fixture.homeTeam,
    );
    const awayTeamFound = initial_teams.find(
      (team) => team.id === fixture.awayTeam,
    );

    if (!homeTeamFound || !awayTeamFound) {
      throw new Error(
        `Times da partida ${fixtureId} não foram encontrados no banco de dados.`,
      );
    }
    return {
      ...fixture,
      refereeId: resolveFixtureRefereeId(fixture) ?? undefined,
      squadRelation: buildFixtureSquadRelation(fixture),
      competition: comp,
      venue: venues[fixture.venue],
      homeTeam: homeTeamFound,
      awayTeam: awayTeamFound,
      referee:
        referees.find((referee) => referee.id === resolveFixtureRefereeId(fixture)) ??
        null,
    } as Fixture;
  },

  updateMatchResult: (competitionId, matchId, score, extraDetails) => {
    set((state) => {
      const comp = state.competitions[competitionId];
      const fixtures = get().fixtures[competitionId];

      if (!comp || !fixtures[matchId]) return state;

      const updatedFixture: Competition_Fixture_Obj = {
        ...fixtures[matchId],
        status: "finished",
        score: score,
        stats: extraDetails?.stats || null,
        playerStats: extraDetails?.playerStats || null,
        events: extraDetails?.events || [],
      };

      return {
        fixtures: {
          ...state.fixtures,
          [competitionId]: {
            ...fixtures,
            [matchId]: updatedFixture,
          },
        },
        competitions: {
          ...state.competitions,
          [competitionId]: {
            ...comp,
            fixtures: {
              ...fixtures,
              [matchId]: updatedFixture,
            },
          },
        },
      };
    });

    get().recalculateTable(competitionId);
    get().clearLiveMatchScore(matchId);
    const updatedFixture = get().fixtures[competitionId]?.[matchId];
    if (extraDetails?.playerStats) {
      useTeamStore.getState().applyMatchPlayerStats(extraDetails.playerStats);
    } else if (updatedFixture) {
      useTeamStore.getState().simulateBackgroundMatchRuntime(updatedFixture, score);
    }
  },

  recalculateTable: (competitionId) => {
    const state = get();
    const comp = state.competitions[competitionId];
    const fixtures = get().fixtures[competitionId];
    if (!comp) return [];

    const sortedStandings = calculateStandingsFromFixtures(fixtures);

    set((currentState) => ({
      competitions: {
        ...currentState.competitions,
        [competitionId]: {
          ...currentState.competitions[competitionId],
          standings: sortedStandings,
        },
      },
    }));

    return sortedStandings;
  },

  getCompetitionStandings: (competitionId, includeLive = false) => {
    const fixtures = get().fixtures[competitionId];
    const liveScores = includeLive ? get().liveScores : {};
    return calculateStandingsFromFixtures(fixtures, liveScores);
  },

  updateLiveMatchScore: (competitionId, matchId, score) => {
    set((state) => {
      const fixtures = state.fixtures[competitionId];
      const comp = state.competitions[competitionId];
      if (!fixtures?.[matchId] || !comp) return state;

      const liveScores = {
        ...state.liveScores,
        [matchId]: score,
      };

      return {
        liveScores,
        competitions: {
          ...state.competitions,
          [competitionId]: {
            ...comp,
            standings: calculateStandingsFromFixtures(fixtures, liveScores),
          },
        },
      };
    });
  },

  clearLiveMatchScore: (matchId) => {
    set((state) => {
      if (!state.liveScores[matchId]) return state;
      const { [matchId]: _removed, ...liveScores } = state.liveScores;

      const nextCompetitions = Object.fromEntries(
        Object.entries(state.competitions).map(([competitionId, competition]) => [
          competitionId,
          {
            ...competition,
            standings: calculateStandingsFromFixtures(state.fixtures[competitionId], liveScores),
          },
        ]),
      ) as Record<string, CompetitionData>;

      return { liveScores, competitions: nextCompetitions };
    });
  },

  simulateBackgroundMatchesForDate: (date, excludedTeamId) => {
    const state = get();
    Object.entries(state.fixtures).forEach(([competitionId, fixtures]) => {
      Object.values(fixtures).forEach((fixture) => {
        const hasExcludedTeam =
          excludedTeamId && (fixture.homeTeam === excludedTeamId || fixture.awayTeam === excludedTeamId);
        if (fixture.date !== date || fixture.status !== "not_started" || hasExcludedTeam) return;

        const homeStrength = useTeamStore
          .getState()
          .getTeamPlayers(fixture.homeTeam)
          .reduce((sum, player, _, players) => sum + player.technical_profile.overall / Math.max(1, players.length), 0);
        const awayStrength = useTeamStore
          .getState()
          .getTeamPlayers(fixture.awayTeam)
          .reduce((sum, player, _, players) => sum + player.technical_profile.overall / Math.max(1, players.length), 0);
        const seed = stableIndexFromId(`${fixture.id}-${date}`, 10_000);
        const strengthDiff = clampScoreInfluence(homeStrength - awayStrength);
        const homeExpected = 1.15 + strengthDiff + 0.22 + ((seed % 7) - 3) * 0.05;
        const awayExpected = 1.05 - strengthDiff + (((seed / 7) | 0) % 7 - 3) * 0.05;
        const score = {
          home: expectedToGoals(homeExpected, seed),
          away: expectedToGoals(awayExpected, Math.floor(seed / 11) + 17),
        };

        get().updateMatchResult(
          competitionId,
          fixture.id,
          score,
          buildBackgroundMatchDetails(fixture, score, seed),
        );
      });
    });
  },

  getTeamMatchHistory: (teamId) => {
    const { competitions, fixtures } = get();
    const history: TeamMatchHistoryEntry[] = [];

    Object.entries(fixtures).forEach(([competitionId, competitionFixtures]) => {
      const competition = competitions[competitionId];
      if (!competition) return;

      Object.values(competitionFixtures).forEach((fixture) => {
        if (fixture.status !== "finished") return;
        const entry = buildHistoryEntry(competition, fixture, teamId);
        if (entry) history.push(entry);
      });
    });

    return history.sort((a, b) => {
      const fixtureA = a.rawFixture;
      const fixtureB = b.rawFixture;
      return fixtureDateTimeValue(fixtureB) - fixtureDateTimeValue(fixtureA);
    });
  },

  getTeamForm: (teamId, count = 5) => {
    const played = get()
      .getTeamMatchHistory(teamId)
      .slice(0, count)
      .reverse()
      .map((entry) => entry.result);

    const padding = Array.from<TeamFormBadge>({ length: Math.max(0, count - played.length) }).fill("-");
    return [...padding, ...played];
  },

  getTeamCalendar: (teamId) => {
    const { competitions, getFixtureData, fixtures: allFixtures } = get();
    const teamFixtures: Fixture[] = [];

    const compKeys = Object.keys(competitions);
    if (compKeys.length === 0) return [];

    Object.values(competitions).forEach((comp) => {
      const compFixtures = allFixtures[comp.id];
      if (!compFixtures) return;

      Object.values(compFixtures).forEach((fixture) => {
        const isHome =
          String(fixture.homeTeam).trim() === String(teamId).trim();
        const isAway =
          String(fixture.awayTeam).trim() === String(teamId).trim();

        if (isHome || isAway) {
          try {
            const fullFixture = getFixtureData(comp.id, fixture.id);
            if (
              fullFixture &&
              fullFixture.homeTeam &&
              fullFixture.awayTeam &&
              fullFixture.venue
            ) {
              teamFixtures.push(fullFixture);
            }
          } catch (e: unknown) {
            console.error(
              `❌ [DEBUG CALENDÁRIO] Erro ao montar partida ${fixture.id}:`,
              e instanceof Error ? e.message : String(e),
            );
          }
        }
      });
    });

    return [...teamFixtures].sort((a, b) => {
      if (!a.date || !a.time || !b.date || !b.time) return 0;
      const dateTimeA = new Date(`${a.date}T${a.time}:00`);
      const dateTimeB = new Date(`${b.date}T${b.time}:00`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
  },

  getNextMatch: (teamId) => {
    const calendar = get().getTeamCalendar(teamId);
    if (!calendar || calendar.length === 0) return null;

    const upcomingMatches = calendar.filter(
      (fixture) =>
        fixture &&
        fixture.status === "not_started",
    );

    return upcomingMatches.length > 0 ? upcomingMatches[0] : null;
  },

  getTeamFixturesForDate: (teamId, date) => {
    const calendar = get().getTeamCalendar(teamId);
    return calendar.filter((fixture) => fixture.date === date);
  },

  getNextMatchFromDate: (teamId, currentDate) => {
    const calendar = get().getTeamCalendar(teamId);
    if (!calendar || calendar.length === 0) return null;
    const currentTime = new Date(`${currentDate}T00:00:00`).getTime();
    const upcomingMatches = calendar.filter(
      (fixture) =>
        fixture &&
        fixture.status === "not_started" &&
        new Date(`${fixture.date}T23:59:59`).getTime() >= currentTime,
    );

    return upcomingMatches.length > 0 ? upcomingMatches[0] : null;
  },
}));
