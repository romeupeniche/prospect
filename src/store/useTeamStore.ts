import { create } from "zustand";

type PreferredFoot = "L" | "R";
type OwnershipType = "permanent" | "loan" | string;
type InjuryPhase = "Surgery" | "Physiotherapy" | "Transition";

export interface PlayerPersonal {
  name: string;
  short_name: string;
  birth_date: string;
  age: number;
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
  attacking?: AttributeGroup;
  skill?: AttributeGroup;
  movement?: AttributeGroup;
  power?: AttributeGroup;
  mentality?: AttributeGroup;
  defending?: AttributeGroup;
  goalkeeping?: AttributeGroup;
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

interface TeamStore {
  players: RuntimePlayer[];
  budget: number;
  hydrateTeam: (basePlayers: BasePlayer[]) => void;
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

const hydrateRuntimeState = (player: BasePlayer, index: number): PlayerRuntimeState => {
  const seed = hashSeed(player.id);
  const stamina = player.attributes.power?.stamina ?? 70;
  const condition = clamp(72 + (stamina % 24) - (index % 8), 48, 100);
  const matchFitness = clamp(64 + (player.technical_profile.overall % 22) + (seed % 10), 52, 100);
  const ckRisk = clamp(18 + (100 - condition) + (seed % 20), 5, 96);
  const form = clamp(2 + (seed % 4), 1, 5) as PlayerRuntimeState["form"];
  const hasKnock = seed % 23 === 0;

  return {
    matchFitness,
    condition,
    ckRisk,
    form,
    isLoanListed: false,
    hasUnreadMessage: seed % 7 === 0,
    injury: hasKnock
      ? {
          type: "Muscle strain",
          phase: seed % 2 === 0 ? "Physiotherapy" : "Transition",
          daysRemaining: 8 + (seed % 28),
        }
      : null,
    seasonStats: emptySeasonStats(),
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

export const useTeamStore = create<TeamStore>((set) => ({
  players: [],
  budget: 50000000,

  hydrateTeam: (basePlayers) =>
    set(() => ({
      players: basePlayers.map((player, index) => ({
        ...player,
        contract: {
          ...player.contract,
        },
        runtime: hydrateRuntimeState(player, index),
      })),
    })),

  toggleTransferList: (id) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id
          ? {
              ...player,
              contract: {
                ...player.contract,
                is_transfer_listed: !player.contract.is_transfer_listed,
              },
            }
          : player,
      ),
    })),

  toggleLoanList: (id) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id
          ? {
              ...player,
              runtime: {
                ...player.runtime,
                isLoanListed: !player.runtime.isLoanListed,
              },
            }
          : player,
      ),
    })),

  changeKitNumber: (id, newNumber) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id
          ? {
              ...player,
              contract: {
                ...player.contract,
                kit_number: clamp(Math.round(newNumber), 1, 99),
              },
            }
          : player,
      ),
    })),

  proposeRenewal: (id, newWage, expiryYear) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id
          ? {
              ...player,
              contract: {
                ...player.contract,
                wage: Math.max(0, Math.round(newWage)),
                valid_until: normalizeExpiry(expiryYear),
              },
            }
          : player,
      ),
    })),

  readMessages: (id) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id
          ? {
              ...player,
              runtime: {
                ...player.runtime,
                hasUnreadMessage: false,
              },
            }
          : player,
      ),
    })),
}));
