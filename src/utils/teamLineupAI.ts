import { getPositionFitResult, normalizePositionForFit } from "./positionFit";

export interface AiLineupPlayer {
    id: string;
    technical_profile?: {
        overall?: number;
        best_position?: string;
        positions?: string[];
    };
    runtime?: {
        condition?: number;
        form?: number;
        matchFitness?: number;
        injury?: unknown;
    };
}

export interface AiStarterRole {
    id: string;
    pos: string;
}

export interface AiMatchdaySquad {
    formation: string;
    starters: AiStarterRole[];
    bench: string[];
}

export const POSITION_LABEL_MAP: Record<string, string[]> = {
    "4-3-3": ["GOL", "LD", "ZG", "ZG", "LE", "MD", "MC", "ME", "PD", "CA", "PE"],
    "4-4-2": ["GOL", "LD", "ZG", "ZG", "LE", "MD", "MC", "MC", "ME", "AT", "AT"],
    "4-2-3-1": ["GOL", "LD", "ZG", "ZG", "LE", "V1", "V2", "MD", "MO", "ME", "CA"],
    "3-5-2": ["GOL", "ZG", "ZG", "ZG", "AD", "AE", "V", "MC", "MO", "AT", "AT"],
    "4-3-3 Holding": ["GOL", "LD", "ZG", "ZG", "LE", "V", "MC", "MC", "PD", "CA", "PE"],
    "4-3-3 Attack": ["GOL", "LD", "ZG", "ZG", "LE", "MC", "MC", "MO", "PD", "CA", "PE"],
    "4-1-4-1": ["GOL", "LD", "ZG", "ZG", "LE", "V", "MD", "MC", "MC", "ME", "CA"],
    "4-5-1": ["GOL", "LD", "ZG", "ZG", "LE", "MD", "MC", "MC", "MC", "ME", "CA"],
    "4-4-1-1": ["GOL", "LD", "ZG", "ZG", "LE", "MD", "MC", "MC", "ME", "MO", "CA"],
    "4-1-2-1-2": ["GOL", "LD", "ZG", "ZG", "LE", "V", "MC", "MC", "MO", "AT", "AT"],
    "4-3-2-1": ["GOL", "LD", "ZG", "ZG", "LE", "MC", "MC", "MC", "MO", "MO", "CA"],
    "4-2-2-2": ["GOL", "LD", "ZG", "ZG", "LE", "V1", "V2", "MD", "ME", "AT", "AT"],
    "4-2-4": ["GOL", "LD", "ZG", "ZG", "LE", "MC", "MC", "PD", "AT", "AT", "PE"],
    "3-4-3": ["GOL", "ZG", "ZG", "ZG", "AD", "MC", "MC", "AE", "PD", "CA", "PE"],
    "3-4-2-1": ["GOL", "ZG", "ZG", "ZG", "AD", "MC", "MC", "AE", "MO", "MO", "CA"],
    "3-4-1-2": ["GOL", "ZG", "ZG", "ZG", "AD", "MC", "MC", "AE", "MO", "AT", "AT"],
    "5-3-2": ["GOL", "LD", "ZG", "ZG", "ZG", "LE", "MC", "MC", "MC", "AT", "AT"],
    "5-4-1": ["GOL", "LD", "ZG", "ZG", "ZG", "LE", "MD", "MC", "MC", "ME", "CA"],
    "5-2-3": ["GOL", "LD", "ZG", "ZG", "ZG", "LE", "MC", "MC", "PD", "CA", "PE"],
};

export const POSITION_SLOT_ROLE: Record<string, string> = {
    GOL: "GK",
    LD: "RB",
    LE: "LB",
    ZG: "CB",
    AD: "RWB",
    AE: "LWB",
    V: "CDM",
    V1: "CDM",
    V2: "CDM",
    MD: "RM",
    ME: "LM",
    MC: "CM",
    MO: "CAM",
    PD: "RW",
    PE: "LW",
    CA: "ST",
    AT: "ST",
};

export const FORMATION_OPTIONS = [
    "4-3-3",
    "4-3-3 Holding",
    "4-3-3 Attack",
    "4-2-3-1",
    "4-4-2",
    "4-4-1-1",
    "4-1-4-1",
    "4-5-1",
    "4-1-2-1-2",
    "4-3-2-1",
    "4-2-2-2",
    "4-2-4",
    "3-5-2",
    "3-4-3",
    "3-4-2-1",
    "3-4-1-2",
    "5-3-2",
    "5-4-1",
    "5-2-3",
];

export const MATCHDAY_BENCH_SIZE = 12;

export const DEFAULT_BENCH_PROFILE = [
    { key: "GK", count: 1, positions: ["GK"] },
    { key: "CB", count: 2, positions: ["CB", "LCB", "RCB"] },
    { key: "LB", count: 1, positions: ["LB", "LWB"] },
    { key: "RB", count: 1, positions: ["RB", "RWB"] },
    { key: "DM", count: 2, positions: ["CDM", "DM", "CM"] },
    { key: "AM", count: 2, positions: ["CAM", "AM", "CM", "LM", "RM"] },
    { key: "LW", count: 1, positions: ["LW", "LM", "RW", "RM", "ST", "CF", "SS"] },
    { key: "RW", count: 1, positions: ["RW", "RM", "LW", "LM", "ST", "CF", "SS"] },
    { key: "ST", count: 1, positions: ["ST", "CF", "SS", "LW", "RW"] },
];

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function playerCondition(player: AiLineupPlayer): number {
    return clamp(player.runtime?.condition ?? 100, 0, 100);
}

function playerMatchFitness(player: AiLineupPlayer): number {
    return clamp(player.runtime?.matchFitness ?? ((player.runtime?.form ?? 5) * 20), 0, 100);
}

function isAvailable(player: AiLineupPlayer): boolean {
    return Boolean(player?.id) && !player.runtime?.injury;
}

function targetPositionForLabel(label: string): string {
    return POSITION_SLOT_ROLE[label] ?? "CM";
}

function playerSlotScore(player: AiLineupPlayer, targetPosition: string): number {
    const baseOverall = player.technical_profile?.overall ?? 60;
    const bestPosition = player.technical_profile?.best_position ?? targetPosition;
    const playablePositions = player.technical_profile?.positions ?? [];
    const fit = getPositionFitResult(baseOverall, bestPosition, playablePositions, targetPosition);
    const isPrimaryPosition = normalizePositionForFit(bestPosition) === normalizePositionForFit(targetPosition);
    const primaryPositionBonus = isPrimaryPosition ? 0.08 : 0;
    const condition = playerCondition(player);
    const matchFitness = playerMatchFitness(player);
    const conditionPenalty =
        condition >= 88 ? (condition - 88) * 0.12 :
        condition >= 70 ? -(88 - condition) * 0.22 :
        condition >= 55 ? -4 - (70 - condition) * 0.5 :
        -12 - (55 - condition) * 0.82;
    const matchFitnessPenalty =
        matchFitness >= 80 ? (matchFitness - 80) * 0.045 :
        -(80 - matchFitness) * 0.095;
    const hardFitPenalty = fit.penalty >= 35 ? 42 : fit.penalty >= 20 ? 7 : fit.penalty >= 12 ? 2.5 : 0;

    return fit.adjustedOverall + primaryPositionBonus + conditionPenalty + matchFitnessPenalty - hardFitPenalty;
}

function playerBenchScore(player: AiLineupPlayer, targetPositions: string[]): number {
    return Math.max(...targetPositions.map((position) => playerSlotScore(player, position)));
}

function formationShapeBonus(formation: string, starters: AiStarterRole[], players: AiLineupPlayer[]): number {
    const playerById = new Map(players.map((player) => [player.id, player]));
    const slotPositions = new Set(starters.map((starter) => normalizePositionForFit(starter.pos)));
    const hasWideForwardPair = slotPositions.has("LW") && slotPositions.has("RW");
    const hasAdvancedMidfielder = slotPositions.has("CAM");
    let bonus = 0;

    if (hasWideForwardPair) bonus += 0.08;
    if (hasWideForwardPair && hasAdvancedMidfielder) bonus += 0.1;

    starters.forEach((starter) => {
        const player = playerById.get(starter.id);
        if (!player) return;
        const target = normalizePositionForFit(starter.pos);
        const best = normalizePositionForFit(player.technical_profile?.best_position);

        if (target === best && ["LW", "RW", "CAM"].includes(target)) {
            bonus += (player.technical_profile?.overall ?? 60) >= 72 ? 0.04 : 0.02;
        }
        if (formation.includes("4-3-3") && target === best && target === "CAM") {
            bonus += 0.02;
        }
    });

    return bonus;
}

function selectFormationStarters(players: AiLineupPlayer[], formation: string): { starters: AiStarterRole[]; score: number; outOfPosition: number } {
    const labels = POSITION_LABEL_MAP[formation] ?? POSITION_LABEL_MAP["4-3-3"];
    const slots = labels.map((label, index) => ({
        index,
        pos: targetPositionForLabel(label),
    }));
    const available = players.filter(isAvailable);
    const slotOrder = slots
        .map((slot) => ({
            ...slot,
            scarcity: available.filter((player) => {
                const fit = getPositionFitResult(
                    player.technical_profile?.overall ?? 60,
                    player.technical_profile?.best_position ?? slot.pos,
                    player.technical_profile?.positions ?? [],
                    slot.pos,
                );
                return fit.penalty <= 6 && playerCondition(player) >= 55;
            }).length,
        }))
        .sort((a, b) => a.scarcity - b.scarcity || a.index - b.index);

    let beam: Array<{ used: Set<string>; roles: Array<AiStarterRole | null>; score: number; outOfPosition: number }> = [
        { used: new Set(), roles: Array(labels.length).fill(null), score: 0, outOfPosition: 0 },
    ];

    for (const slot of slotOrder) {
        const candidates = available
            .map((player) => {
                const fit = getPositionFitResult(
                    player.technical_profile?.overall ?? 60,
                    player.technical_profile?.best_position ?? slot.pos,
                    player.technical_profile?.positions ?? [],
                    slot.pos,
                );
                return {
                    player,
                    fit,
                    score: playerSlotScore(player, slot.pos),
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        const nextBeam: typeof beam = [];
        for (const state of beam) {
            for (const candidate of candidates) {
                if (state.used.has(candidate.player.id)) continue;
                const used = new Set(state.used);
                used.add(candidate.player.id);
                const roles = [...state.roles];
                roles[slot.index] = { id: candidate.player.id, pos: slot.pos };
                nextBeam.push({
                    used,
                    roles,
                    score: state.score + candidate.score,
                    outOfPosition: state.outOfPosition + (candidate.fit.penalty > 0 ? 1 : 0),
                });
            }
        }
        beam = nextBeam
            .sort((a, b) => b.score - a.score || a.outOfPosition - b.outOfPosition)
            .slice(0, 96);
    }

    const best = beam[0];
    if (!best) return { starters: [], score: -9999, outOfPosition: 99 };

    return {
        starters: best.roles.filter(Boolean) as AiStarterRole[],
        score: best.score - best.outOfPosition * 2.5 + formationShapeBonus(formation, best.roles.filter(Boolean) as AiStarterRole[], available),
        outOfPosition: best.outOfPosition,
    };
}

function selectBench(players: AiLineupPlayer[], starterIds: Set<string>): string[] {
    const remaining = players
        .filter((player) => isAvailable(player) && !starterIds.has(player.id));
    const selected: string[] = [];
    const used = new Set<string>();

    DEFAULT_BENCH_PROFILE.forEach((role) => {
        for (let index = 0; index < role.count; index += 1) {
            const next = remaining
                .filter((player) => !used.has(player.id))
                .map((player) => ({
                    player,
                    score: playerBenchScore(player, role.positions),
                }))
                .sort((a, b) => b.score - a.score)[0]?.player;
            if (!next) break;
            selected.push(next.id);
            used.add(next.id);
        }
    });

    remaining
        .filter((player) => !used.has(player.id))
        .sort((a, b) => {
            const readinessA = (a.technical_profile?.overall ?? 60) + (playerCondition(a) - 85) * 0.18 + (playerMatchFitness(a) - 80) * 0.06;
            const readinessB = (b.technical_profile?.overall ?? 60) + (playerCondition(b) - 85) * 0.18 + (playerMatchFitness(b) - 80) * 0.06;
            return readinessB - readinessA;
        })
        .forEach((player) => {
            if (selected.length >= MATCHDAY_BENCH_SIZE) return;
            selected.push(player.id);
        });

    return selected.slice(0, MATCHDAY_BENCH_SIZE);
}

export function selectBestAiMatchdaySquad(players: AiLineupPlayer[]): AiMatchdaySquad {
    const available = players.filter(isAvailable);
    const formationResults = FORMATION_OPTIONS
        .map((formation) => ({
            formation,
            ...selectFormationStarters(available, formation),
        }))
        .filter((result) => result.starters.length === 11)
        .sort((a, b) => b.score - a.score || a.outOfPosition - b.outOfPosition);

    const best = formationResults[0] ?? selectFormationStarters(available, "4-3-3");
    const formation = "formation" in best ? best.formation : "4-3-3";
    const starters = best.starters;
    const starterIds = new Set(starters.map((starter) => starter.id));

    return {
        formation,
        starters,
        bench: selectBench(players, starterIds),
    };
}
