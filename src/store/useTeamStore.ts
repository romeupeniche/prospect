import { create } from "zustand";
import { TEAM_SQUAD_REGISTRY } from "../data/teamSquads";

type PreferredFoot = "L" | "R";
type OwnershipType = "permanent" | "loan" | string;
type InjuryPhase = "Surgery" | "Physiotherapy" | "Transition";

export interface PlayerPersonal {
  name: string;
  short_name: string;
  birth_date: string;
  age?: number;
  height_cm: number;
  weight_kg: number;
  nationality: string;
  preferred_foot: PreferredFoot | string;
  photo_url: string;
}

export interface PlayerContract {
  market_value: number;
  wage: number;
  valid_until: string;
  kit_number: number;
  ownership_type: OwnershipType;
  origin_club_id: string | null;
  is_from_youth_academy?: boolean;
  is_transfer_listed: boolean;
  is_untouchable: boolean;
  clause_release_domestic: number;
  clause_release_international: number;
}

export interface PlayerTechnicalProfile {
  overall: number;
  potential: number;
  best_position: string;
  positions: string[];
  skill_moves: number;
  weak_foot: number;
  reputation: number;
}

export type AttributeGroup = Record<string, number>;

export interface PlayerAttributes {
  attacking?: {
    crossing: number;
    finishing: number;
    heading_accuracy: number;
    short_passing: number;
    volleys: number;
  } | AttributeGroup;
  skill?: {
    dribbling: number;
    ball_control: number;
    curve: number;
    long_passing: number;
    fk_accuracy: number;
  } | AttributeGroup;
  movement?: {
    acceleration: number;
    sprint_speed: number;
    agility: number;
    reactions: number;
    balance: number;
  } | AttributeGroup;
  power?: {
    shot_power: number;
    stamina: number;
    strength: number;
    jumping: number;
    long_shots: number;
  } | AttributeGroup;
  mentality?: {
    attack_position: number;
    vision: number;
    penalties: number;
    composure: number;
    interceptions: number;
    aggression: number;
  } | AttributeGroup;
  defending?: {
    defensive_awareness: number;
    standing_tackle: number;
    sliding_tackle: number;
  } | AttributeGroup;
  goalkeeping?: {
    diving: number;
    handling: number;
    kicking: number;
    positioning: number;
    reflexes: number;
  } | AttributeGroup;
  [key: string]: AttributeGroup | undefined;
}

export interface BasePlayer {
  id: string;
  team_id: string;
  personal: PlayerPersonal;
  contract: PlayerContract;
  technical_profile: PlayerTechnicalProfile;
  attributes: PlayerAttributes;
}

export interface RuntimeInjury {
  type: string;
  phase: InjuryPhase;
  daysRemaining: number;
}

export interface SeasonStats {
  matches: number;
  rating: number;
  goals: number;
  assists: number;
  tackles: number;
  passesCompleted: number;
  saves: number;
  cleanSheets: number;
}

export interface PlayerRuntimeState {
  matchFitness: number;
  condition: number;
  ckRisk: number;
  form: 1 | 2 | 3 | 4 | 5;
  isLoanListed: boolean;
  hasUnreadMessage: boolean;
  injury: RuntimeInjury | null;
  seasonStats: SeasonStats;
}

export interface RuntimePlayer extends BasePlayer {
  runtime: PlayerRuntimeState;
}

export type TeamPlayersRegistry = Record<string, { players: BasePlayer[] }>;

interface TeamStore {
  players: RuntimePlayer[];
  playersByTeamId: Record<string, RuntimePlayer[]>;
  activeTeamId: string | null;
  budget: number;
  hydrateTeam: (basePlayers: BasePlayer[], teamId?: string) => void;
  hydrateAllTeams: (registry?: TeamPlayersRegistry) => void;
  setActiveTeam: (teamId: string) => void;
  getTeamPlayers: (teamId: string) => RuntimePlayer[];
  getPlayerById: (id: string) => RuntimePlayer | undefined;
  getAllPlayers: () => RuntimePlayer[];
  applyMatchPlayerStats: (playerStats: MatchPlayerStats | null | undefined) => void;
  simulateBackgroundMatchRuntime: (fixture: Competition_Fixture_Obj, score?: { home: number; away: number }) => void;
  toggleTransferList: (id: string) => void;
  toggleLoanList: (id: string) => void;
  changeKitNumber: (id: string, newNumber: number) => void;
  proposeRenewal: (id: string, newWage: number, expiryYear: string) => void;
  readMessages: (id: string) => void;
}

const emptySeasonStats = (): SeasonStats => ({
  matches: 0,
  rating: 0,
  goals: 0,
  assists: 0,
  tackles: 0,
  passesCompleted: 0,
  saves: 0,
  cleanSheets: 0,
});

const hashSeed = (value: string): number =>
  value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const clampForm = (value: number): PlayerRuntimeState["form"] =>
  clamp(Math.round(value), 1, 5) as PlayerRuntimeState["form"];

const mergeSeasonStats = (current: SeasonStats, match: PlayerPerformance): SeasonStats => {
  const previousMatches = current.matches;
  const nextMatches = previousMatches + 1;
  const matchRating = Number.isFinite(match.rating) ? match.rating : 6;
  const nextRating =
    previousMatches > 0
      ? Number(((current.rating * previousMatches + matchRating) / nextMatches).toFixed(1))
      : Number(matchRating.toFixed(1));

  return {
    matches: nextMatches,
    rating: nextRating,
    goals: current.goals + (match.goals ?? 0),
    assists: current.assists + (match.assists ?? 0),
    tackles: current.tackles + (match.tackles ?? 0),
    passesCompleted: current.passesCompleted + (match.passesAccurate ?? 0),
    saves: current.saves + (match.goalkeeper?.saves ?? 0),
    cleanSheets: current.cleanSheets,
  };
};

const hydrateRuntimeState = (player: BasePlayer, _index: number): PlayerRuntimeState => {
  const seed = hashSeed(player.id);

  return {
    matchFitness: 100,
    condition: 100,
    ckRisk: 5,
    form: 5,
    isLoanListed: false,
    hasUnreadMessage: seed % 7 === 0,
    injury: null,
    seasonStats: emptySeasonStats(),
  };
};

const normalizeStartOfSeasonRuntime = (runtime: PlayerRuntimeState): PlayerRuntimeState => {
  if (runtime.seasonStats.matches > 0) return runtime;

  return {
    ...runtime,
    matchFitness: 100,
    condition: 100,
    ckRisk: 5,
    form: 5,
    injury: null,
  };
};

const normalizeExpiry = (expiryYear: string): string => {
  const trimmed = expiryYear.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-12-31`;
  }

  return trimmed;
};

const asRuntimePlayer = (
  player: BasePlayer,
  index: number,
  previous?: RuntimePlayer,
): RuntimePlayer => ({
  ...player,
  contract: {
    ...player.contract,
    ...(previous?.contract ?? {}),
  },
  runtime: previous?.runtime
    ? normalizeStartOfSeasonRuntime(previous.runtime)
    : hydrateRuntimeState(player, index),
});

const hydrateTeamPlayers = (
  basePlayers: BasePlayer[],
  previousPlayers: RuntimePlayer[] = [],
): RuntimePlayer[] => {
  const previousById = new Map(previousPlayers.map((player) => [player.id, player]));

  return basePlayers
    .filter((player) => Boolean(player?.id))
    .map((player, index) => asRuntimePlayer(player, index, previousById.get(player.id)));
};

const hydrateRegistry = (
  registry: TeamPlayersRegistry,
  previousByTeamId: Record<string, RuntimePlayer[]> = {},
): Record<string, RuntimePlayer[]> => {
  const nextByTeamId: Record<string, RuntimePlayer[]> = { ...previousByTeamId };

  Object.entries(registry).forEach(([teamId, entry]) => {
    nextByTeamId[teamId] = hydrateTeamPlayers(entry.players, previousByTeamId[teamId]);
  });

  return nextByTeamId;
};

const initialPlayersByTeamId = hydrateRegistry(TEAM_SQUAD_REGISTRY as TeamPlayersRegistry);

const updateEverywhere = (
  state: Pick<TeamStore, "players" | "playersByTeamId" | "activeTeamId">,
  id: string,
  updater: (player: RuntimePlayer) => RuntimePlayer,
): Pick<TeamStore, "players" | "playersByTeamId"> => {
  let activePlayers = state.players;
  const playersByTeamId = Object.fromEntries(
    Object.entries(state.playersByTeamId).map(([teamId, teamPlayers]) => {
      let didUpdateTeam = false;
      const nextTeamPlayers = teamPlayers.map((player) => {
        if (player.id !== id) return player;
        didUpdateTeam = true;
        return updater(player);
      });

      if (didUpdateTeam && teamId === state.activeTeamId) {
        activePlayers = nextTeamPlayers;
      }

      return [teamId, nextTeamPlayers];
    }),
  );

  if (!state.activeTeamId) {
    activePlayers = activePlayers.map((player) => (player.id === id ? updater(player) : player));
  }

  return { players: activePlayers, playersByTeamId };
};

const getPlayerTeamId = (playersByTeamId: Record<string, RuntimePlayer[]>, playerId: string): string | null => {
  for (const [teamId, players] of Object.entries(playersByTeamId)) {
    if (players.some((player) => player.id === playerId)) return teamId;
  }
  return null;
};

const buildSyntheticPerformance = (
  player: RuntimePlayer,
  fixture: Competition_Fixture_Obj,
  score: { home: number; away: number },
): PlayerPerformance => {
  const seed = hashSeed(`${fixture.id}-${player.id}-${score.home}-${score.away}`);
  const isGoalkeeper = player.technical_profile.best_position === "GK";
  const teamGoals = player.team_id === fixture.homeTeam ? score.home : score.away;
  const opponentGoals = player.team_id === fixture.homeTeam ? score.away : score.home;
  const goalBias = player.technical_profile.best_position.includes("ST") || player.technical_profile.best_position.includes("W") ? 2 : 5;
  const assistBias = player.technical_profile.best_position.includes("M") || player.technical_profile.best_position.includes("W") ? 2 : 6;
  const goals = teamGoals > 0 && seed % (goalBias + 2) < teamGoals ? 1 : 0;
  const assists = teamGoals > goals && seed % (assistBias + 3) < teamGoals ? 1 : 0;
  const passesTotal = isGoalkeeper ? 18 + (seed % 16) : 26 + (seed % 38);
  const passing = player.attributes.attacking?.short_passing ?? 65;
  const passesAccurate = Math.round(passesTotal * clamp(0.62 + passing / 300, 0.62, 0.91));
  const saves = isGoalkeeper ? Math.max(0, 1 + (seed % 5) - opponentGoals) : 0;
  const baseRating = 6 + goals * 0.9 + assists * 0.45 + saves * 0.18 - opponentGoals * (isGoalkeeper ? 0.18 : 0.04);

  return {
    playerId: player.id,
    name: player.personal.short_name,
    rating: Number(clamp(baseRating + ((seed % 9) - 4) / 10, 5.2, 9.6).toFixed(1)),
    isFirstEleven: true,
    minutesPlayed: 90,
    goals,
    assists,
    shotsTotal: goals + (seed % 3),
    shotsOnTarget: goals + (seed % 2),
    bigChancesCreated: assists,
    bigChancesMissed: 0,
    passesTotal,
    passesAccurate,
    keyPasses: assists + (seed % 2),
    crossesTotal: player.technical_profile.best_position.includes("W") ? seed % 5 : seed % 2,
    crossesAccurate: player.technical_profile.best_position.includes("W") ? seed % 2 : 0,
    longBallsTotal: seed % 7,
    longBallsAccurate: seed % 4,
    tackles: isGoalkeeper ? 0 : seed % 4,
    interceptions: isGoalkeeper ? 0 : seed % 3,
    clearances: isGoalkeeper ? 0 : seed % 5,
    blockedShots: isGoalkeeper ? 0 : seed % 2,
    duelsGroundTotal: isGoalkeeper ? 0 : 3 + (seed % 8),
    duelsGroundWon: isGoalkeeper ? 0 : 1 + (seed % 5),
    duelsAerialTotal: isGoalkeeper ? 0 : seed % 5,
    duelsAerialWon: isGoalkeeper ? 0 : seed % 3,
    dispossessed: seed % 3,
    foulsCommitted: seed % 2,
    foulsDrawn: seed % 2,
    goalkeeper: isGoalkeeper
      ? {
          saves,
          savesInsideBox: Math.max(0, saves - 1),
          punches: seed % 2,
          highClaims: seed % 3,
        }
      : undefined,
  };
};

export const useTeamStore = create<TeamStore>((set, get) => ({
  players: [],
  playersByTeamId: initialPlayersByTeamId,
  activeTeamId: null,
  budget: 50000000,

  hydrateTeam: (basePlayers, teamId) =>
    set((state) => {
      const resolvedTeamId = teamId ?? basePlayers.find((player) => player?.team_id)?.team_id ?? state.activeTeamId;
      if (!resolvedTeamId) return state;

      const nextTeamPlayers = hydrateTeamPlayers(basePlayers, state.playersByTeamId[resolvedTeamId]);
      const nextPlayersByTeamId = {
        ...state.playersByTeamId,
        [resolvedTeamId]: nextTeamPlayers,
      };

      return {
        playersByTeamId: nextPlayersByTeamId,
        activeTeamId: resolvedTeamId,
        players: nextTeamPlayers,
      };
    }),

  hydrateAllTeams: (registry = TEAM_SQUAD_REGISTRY as TeamPlayersRegistry) =>
    set((state) => {
      const nextPlayersByTeamId = hydrateRegistry(registry, state.playersByTeamId);
      return {
        playersByTeamId: nextPlayersByTeamId,
        players: state.activeTeamId ? nextPlayersByTeamId[state.activeTeamId] ?? [] : state.players,
      };
    }),

  setActiveTeam: (teamId) =>
    set((state) => ({
      activeTeamId: teamId,
      players: state.playersByTeamId[teamId] ?? [],
    })),

  getTeamPlayers: (teamId) => get().playersByTeamId[teamId] ?? [],

  getPlayerById: (id) =>
    Object.values(get().playersByTeamId)
      .flat()
      .find((player) => player.id === id),

  getAllPlayers: () => Object.values(get().playersByTeamId).flat(),

  applyMatchPlayerStats: (playerStats) => {
    if (!playerStats) return;

    const performances = [...Object.values(playerStats.home ?? {}), ...Object.values(playerStats.away ?? {})];
    performances.forEach((performance) => {
      const playerId = performance.playerId;
      const teamId = getPlayerTeamId(get().playersByTeamId, playerId);
      if (!teamId) return;

      set((state) =>
        updateEverywhere(state, playerId, (player) => {
          const conditionDrop = performance.minutesPlayed >= 75 ? 11 : performance.minutesPlayed >= 45 ? 7 : 3;
          const nextCondition = clamp(player.runtime.condition - conditionDrop, 25, 100);
          const nextMatchFitness = clamp(player.runtime.matchFitness + 1, 45, 100);
          const updatedStats = mergeSeasonStats(player.runtime.seasonStats, performance);
          const isCleanSheet =
            player.technical_profile.best_position === "GK" &&
            performance.goalkeeper &&
            performance.rating >= 6.5;

          return {
            ...player,
            runtime: {
              ...player.runtime,
              condition: nextCondition,
              matchFitness: nextMatchFitness,
              ckRisk: clamp(player.runtime.ckRisk + Math.max(1, conditionDrop - 3), 5, 99),
              form: clampForm((player.runtime.form * 2 + performance.rating / 2) / 3),
              seasonStats: {
                ...updatedStats,
                cleanSheets: updatedStats.cleanSheets + (isCleanSheet ? 1 : 0),
              },
            },
          };
        }),
      );
    });
  },

  simulateBackgroundMatchRuntime: (fixture, score = fixture.score ?? { home: 0, away: 0 }) => {
    const state = get();
    const buildTeamStats = (teamId: string): Record<string, PlayerPerformance> =>
      (state.playersByTeamId[teamId] ?? [])
        .slice()
        .sort((a, b) => b.technical_profile.overall - a.technical_profile.overall)
        .slice(0, 11)
        .reduce<Record<string, PlayerPerformance>>((acc, player) => {
          acc[player.id] = buildSyntheticPerformance(player, fixture, score);
          return acc;
        }, {});

    get().applyMatchPlayerStats({
      home: buildTeamStats(fixture.homeTeam),
      away: buildTeamStats(fixture.awayTeam),
    });
  },

  toggleTransferList: (id) =>
    set((state) =>
      updateEverywhere(state, id, (player) => ({
        ...player,
        contract: {
          ...player.contract,
          is_transfer_listed: !player.contract.is_transfer_listed,
        },
      })),
    ),

  toggleLoanList: (id) =>
    set((state) =>
      updateEverywhere(state, id, (player) => ({
        ...player,
        runtime: {
          ...player.runtime,
          isLoanListed: !player.runtime.isLoanListed,
        },
      })),
    ),

  changeKitNumber: (id, newNumber) =>
    set((state) =>
      updateEverywhere(state, id, (player) => ({
        ...player,
        contract: {
          ...player.contract,
          kit_number: clamp(Math.round(newNumber), 1, 99),
        },
      })),
    ),

  proposeRenewal: (id, newWage, expiryYear) =>
    set((state) =>
      updateEverywhere(state, id, (player) => ({
        ...player,
        contract: {
          ...player.contract,
          wage: Math.max(0, Math.round(newWage)),
          valid_until: normalizeExpiry(expiryYear),
        },
      })),
    ),

  readMessages: (id) =>
    set((state) =>
      updateEverywhere(state, id, (player) => ({
        ...player,
        runtime: {
          ...player.runtime,
          hasUnreadMessage: false,
        },
      })),
    ),
}));
