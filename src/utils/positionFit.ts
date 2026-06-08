export type PositionFitLevel = "natural" | "close" | "related" | "line" | "awkward" | "invalid";

export interface PositionFitResult {
    penalty: number;
    adjustedOverall: number;
    fit: PositionFitLevel;
}

type PositionLine = "GK" | "DF" | "MF" | "FW";

interface PositionPoint {
    x: number;
    y: number;
    line: PositionLine;
}

const POSITION_ALIASES: Record<string, string> = {
    GOL: "GK",
    GK: "GK",
    LD: "RB",
    RB: "RB",
    LE: "LB",
    LB: "LB",
    ZG: "CB",
    CB: "CB",
    LCB: "CB",
    RCB: "CB",
    AD: "RWB",
    RWB: "RWB",
    AE: "LWB",
    LWB: "LWB",
    VOL: "CDM",
    V: "CDM",
    V1: "CDM",
    V2: "CDM",
    DM: "CDM",
    CDM: "CDM",
    MC: "CM",
    CM: "CM",
    LCM: "CM",
    RCM: "CM",
    MEI: "CAM",
    MO: "CAM",
    AM: "CAM",
    CAM: "CAM",
    MD: "RM",
    RM: "RM",
    ME: "LM",
    LM: "LM",
    PD: "RW",
    RW: "RW",
    PE: "LW",
    LW: "LW",
    CA: "ST",
    AT: "ST",
    ST: "ST",
    CF: "CF",
    SS: "SS",
};

const POSITION_POINTS: Record<string, PositionPoint> = {
    GK: { x: 0, y: 0, line: "GK" },
    CB: { x: 0, y: 1.05, line: "DF" },
    LB: { x: -1.45, y: 1.2, line: "DF" },
    RB: { x: 1.45, y: 1.2, line: "DF" },
    LWB: { x: -1.65, y: 1.7, line: "DF" },
    RWB: { x: 1.65, y: 1.7, line: "DF" },
    CDM: { x: 0, y: 2.05, line: "MF" },
    CM: { x: 0, y: 2.5, line: "MF" },
    LM: { x: -1.45, y: 2.65, line: "MF" },
    RM: { x: 1.45, y: 2.65, line: "MF" },
    CAM: { x: 0, y: 3.05, line: "MF" },
    LW: { x: -1.55, y: 3.45, line: "FW" },
    RW: { x: 1.55, y: 3.45, line: "FW" },
    CF: { x: 0, y: 3.42, line: "FW" },
    SS: { x: 0, y: 3.25, line: "FW" },
    ST: { x: 0, y: 3.75, line: "FW" },
};

const RELATED_GROUPS = [
    ["CB", "LB", "RB", "LWB", "RWB", "CDM"],
    ["CDM", "CM", "CAM", "LM", "RM", "SS"],
    ["LW", "RW", "ST", "CF", "SS", "CAM"],
    ["LB", "LWB", "LM", "LW"],
    ["RB", "RWB", "RM", "RW"],
];

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function normalizePositionForFit(position: string | null | undefined): string {
    const normalized = (position ?? "").trim().toUpperCase();
    return POSITION_ALIASES[normalized] ?? normalized;
}

function uniquePositions(bestPosition: string, playablePositions: string[]): string[] {
    return Array.from(
        new Set([bestPosition, ...playablePositions].map(normalizePositionForFit).filter(Boolean)),
    );
}

function sameRelatedGroup(a: string, b: string): boolean {
    return RELATED_GROUPS.some((group) => group.includes(a) && group.includes(b));
}

function distance(a: PositionPoint, b: PositionPoint): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function classifyPenalty(penalty: number): PositionFitLevel {
    if (penalty <= 0) return "natural";
    if (penalty <= 6) return "close";
    if (penalty <= 12) return "related";
    if (penalty <= 18) return "line";
    if (penalty <= 34) return "awkward";
    return "invalid";
}

function calculatePenalty(bestPosition: string, playablePositions: string[], targetPosition: string): number {
    const target = normalizePositionForFit(targetPosition);
    const primaryPosition = normalizePositionForFit(bestPosition);
    const naturalPositions = uniquePositions(bestPosition, playablePositions);
    if (!target || target === primaryPosition) return 0;
    if (naturalPositions.includes(target)) return 0;

    const targetPoint = POSITION_POINTS[target];
    if (!targetPoint) return 0;

    const knownNaturalPositions = naturalPositions.filter((position) => POSITION_POINTS[position]);
    if (knownNaturalPositions.length === 0) return 0;

    const hasGoalkeeperPosition = knownNaturalPositions.includes("GK");
    if (target === "GK" && !hasGoalkeeperPosition) return 44;
    if (target !== "GK" && hasGoalkeeperPosition) return 36;

    let bestPenalty = 30;

    for (const naturalPosition of knownNaturalPositions) {
        const naturalPoint = POSITION_POINTS[naturalPosition];
        const baseDistance = distance(naturalPoint, targetPoint);
        const verticalGap = Math.abs(naturalPoint.y - targetPoint.y);
        const lineGap = Math.abs(["GK", "DF", "MF", "FW"].indexOf(naturalPoint.line) - ["GK", "DF", "MF", "FW"].indexOf(targetPoint.line));
        let penalty = baseDistance * 5.3 + verticalGap * 2.1 + Math.max(0, lineGap - 1) * 3.5;

        if (naturalPoint.line === targetPoint.line) penalty -= 1.25;
        if (sameRelatedGroup(naturalPosition, target)) penalty -= 2;
        if (naturalPosition === "ST" && target === "CAM") penalty -= 1.5;
        if (naturalPosition === "CAM" && target === "ST") penalty -= 1.25;

        bestPenalty = Math.min(bestPenalty, penalty);
    }

    return Math.round(clamp(bestPenalty, 1, 30));
}

export function getPositionFitResult(
    baseOverall: number,
    bestPosition: string,
    playablePositions: string[] = [],
    targetPosition: string,
): PositionFitResult {
    const penalty = calculatePenalty(bestPosition, playablePositions, targetPosition);
    return {
        penalty,
        adjustedOverall: clamp(Math.round(baseOverall - penalty), 1, 99),
        fit: classifyPenalty(penalty),
    };
}

export function getPositionPenalty(
    bestPosition: string,
    playablePositions: string[] = [],
    targetPosition: string,
): number {
    return getPositionFitResult(99, bestPosition, playablePositions, targetPosition).penalty;
}

export function getAdjustedOverall(
    baseOverall: number,
    bestPosition: string,
    playablePositions: string[] = [],
    targetPosition: string,
): number {
    return getPositionFitResult(baseOverall, bestPosition, playablePositions, targetPosition).adjustedOverall;
}
