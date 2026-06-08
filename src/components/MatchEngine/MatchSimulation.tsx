import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MatchEngine,
    MatchState,
    EnginePlayer,
    AIState,
    Ball,
    TeamStatsState,
    PlayerStatsState,
} from "./Engine";
import { formatPosition } from "../../utils/positionI18n";

interface KitColors {
    hex_colors: { primary: string; secondary: string; detail: string };
}

interface TeamData {
    id: string;
    full_name: string;
    name: string;
    logo: string;
}

interface MatchPlayerData {
    id?: string;
    position?: string;
    personal?: { short_name?: string; name?: string; birth_date?: string; photo_url?: string };
    contract?: { kit_number?: number; valid_until?: string };
    technical_profile?: { best_position?: string; overall?: number };
    attributes?: Record<string, Record<string, number> | undefined>;
}

interface LineupData {
    players: MatchPlayerData[];
    starters: string[];
    bench: string[];
    formation?: string;
}

interface MatchInfoData {
    competition?: string;
    matchinfo?: { stadium?: string;[key: string]: unknown };
    lineup?: {
        home_team?: LineupData;
        away_team?: LineupData;
    };
    [key: string]: unknown;
}

interface MatchSimulationProps {
    homeTeam: { data: TeamData; kit: KitColors };
    awayTeam: { data: TeamData; kit: KitColors };
    matchInfo: MatchInfoData;
    onFinishMatch: (finalState?: MatchState) => void;
    onLiveScoreChange?: (score: { home: number; away: number }) => void;
    userTeamId?: string;
    language?: string;
}

const PITCH_W = 105;
const PITCH_H = 68;
const LINE_W = 0.105;

// Penalty area (penalty area extends 16.5m from goal line, 40.32m wide)
const PA_DEPTH = 16.5;
const PA_WIDTH = 40.32;
const PA_Y = (PITCH_H - PA_WIDTH) / 2;

// Six-yard box
const SB_DEPTH = 5.5;
const SB_WIDTH = 18.32;
const SB_Y = (PITCH_H - SB_WIDTH) / 2;

// Goal mouth
const GOAL_DEPTH = 2.0;
const GOAL_H = 7.32;
const GOAL_Y = (PITCH_H - GOAL_H) / 2;

// Circle
const PENALTY_MARK_X = 11;
const CENTER_CIRCLE_R = 9.15;
const PENALTY_ARC_DY = Math.sqrt(CENTER_CIRCLE_R ** 2 - (PA_DEPTH - PENALTY_MARK_X) ** 2);
const CORNER_ARC_R = 1;
const PLAYER_R = 0.86;
const PLAYER_HALO_R = 1.2;
const BALL_R = 0.42;

// ── AI state colour for player badge ─────────────────────────

const AI_STATE_COLOR: Record<AIState, string> = {
    IDLE: "transparent",
    SUPPORT: "#3b82f6",
    PRESS: "#ef4444",
    COVER: "#f97316",
    INTERCEPT: "#eab308",
    DRIBBLE: "#22c55e",
    RETURN: "#6b7280",
    GK_SET: "transparent",
    GK_CLAIM: "#ef4444",
    SET_PIECE: "#a855f7",
};

// ── Phase label ───────────────────────────────────────────────

function phaseLabel(phase: MatchState["phase"], displayTime: string): string {
    switch (phase) {
        case "PRE_MATCH": return "PRE-MATCH";
        case "KICK_OFF": return "KICK-OFF";
        case "HALFTIME": return "HALF-TIME";
        case "SET_PIECE": return "SET PIECE";
        case "FULL_TIME": return "FULL-TIME";
        case "STOPPAGE": return `${displayTime} +`;
        default: return displayTime;
    }
}

// ── Player Dot (memoised — no re-mount on tick) ───────────────

interface PlayerDotProps {
    player: EnginePlayer;
    kit: KitColors;
    ball: Ball;
}

const PlayerDot = memo(({ player, kit, ball }: PlayerDotProps) => {
    // Convert 0-100 coords → SVG units
    const svgX = (player.x / 100) * PITCH_W;
    const svgY = (player.y / 100) * PITCH_H;

    const stateColor = AI_STATE_COLOR[player.aiState];
    const staminaPct = Math.max(0, Math.min(100, player.stamina));
    const facingX = Number.isFinite(player.facingX) ? player.facingX : player.team === "home" ? 1 : -1;
    const facingY = Number.isFinite(player.facingY) ? player.facingY : 0;
    const hasCloseControl = ball.ownerId === player.id && ball.controlState === "CLOSE_CONTROL";
    const facingLen = hasCloseControl ? 1.62 : 1.28;
    const staminaHue = 120 * (staminaPct / 100); // green → red

    return (
        <g transform={`translate(${svgX} ${svgY})`}>
            {/* AI-state glow ring */}
            {stateColor !== "transparent" && (
                <circle
                    cx={0} cy={0} r={PLAYER_HALO_R}
                    fill="none"
                    stroke={stateColor}
                    strokeWidth={0.18}
                    opacity={0.62}
                />
            )}

            {/* Facing cue */}
            <line
                x1={0}
                y1={0}
                x2={facingX * facingLen}
                y2={facingY * facingLen}
                stroke={hasCloseControl ? "#facc15" : "rgba(255,255,255,0.42)"}
                strokeWidth={hasCloseControl ? 0.2 : 0.13}
                strokeLinecap="round"
                opacity={hasCloseControl ? 0.9 : 0.48}
            />

            {/* Player dot */}
            <circle
                cx={0} cy={0} r={PLAYER_R}
                fill={kit.hex_colors.primary}
                stroke={hasCloseControl ? "#facc15" : "rgba(255,255,255,0.5)"}
                strokeWidth={hasCloseControl ? 0.22 : 0.14}
            />

            {/* Shirt number */}
            <text
                x={0} y={0.27}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="0.68"
                fontWeight="bold"
                fill={kit.hex_colors.detail}
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                {player.number}
            </text>

            {/* Name label for ball carrier */}
            {hasCloseControl && (
                <text
                    x={0} y={-2.8}
                    textAnchor="middle"
                    fontSize="1.05"
                    fontWeight="bold"
                    fill="#facc15"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                >
                    {player.name}
                </text>
            )}

            {/* Stamina bar */}
            <rect
                x={-1.15} y={1.2}
                width={2.3} height={0.28}
                fill="rgba(0,0,0,0.48)" rx={0.14}
            />
            <rect
                x={-1.15} y={1.2}
                width={2.3 * (staminaPct / 100)} height={0.28}
                fill={`hsl(${staminaHue},80%,50%)`} rx={0.14}
            />
        </g>
    );
});
PlayerDot.displayName = "PlayerDot";

// ── Ball SVG (memoised) ───────────────────────────────────────

const BallMarker = memo(({ ball }: { ball: Ball }) => {
    const { x, y, z = 0 } = ball;
    const svgX = (x / 100) * PITCH_W;
    const svgY = (y / 100) * PITCH_H;
    const lift = Math.min(Math.max(z, 0), 5.5);
    const visualLift = lift * 0.62;
    const radius = BALL_R + lift * 0.075;
    const shadowRx = Math.max(0.22, 0.58 - lift * 0.045);
    const shadowRy = Math.max(0.08, 0.22 - lift * 0.018);
    const shadowOpacity = Math.max(0.08, 0.48 - lift * 0.07);
    const stateStroke =
        ball.controlState === "CLOSE_CONTROL"
            ? "#facc15"
            : ball.controlState === "CHASING_OWN_TOUCH"
                ? "#38bdf8"
                : ball.controlState === "PASS_IN_FLIGHT"
                    ? "#e5e7eb"
                    : ball.controlState === "CONTESTED"
                        ? "#fb7185"
                        : "#a3e635";
    const stateOpacity = ball.controlState ? 0.72 : 0.42;
    return (
        <g transform={`translate(${svgX} ${svgY})`}>
            {/* Shadow */}
            <ellipse cx={0.12 + lift * 0.05} cy={0.5 + lift * 0.045} rx={shadowRx} ry={shadowRy}
                fill="rgba(0,0,0,0.42)" opacity={shadowOpacity} />
            {/* Ball */}
            <circle cx={0} cy={-visualLift} r={radius + 0.24}
                fill="none" stroke={stateStroke} strokeWidth={0.1} opacity={stateOpacity} />
            <circle cx={0} cy={-visualLift} r={radius}
                fill="#f8fafc" stroke="rgba(0,0,0,0.72)" strokeWidth={0.11} />
            <path
                d={`M ${-radius * 0.58} ${-visualLift - radius * 0.1} C ${-radius * 0.18} ${-visualLift - radius * 0.42}, ${radius * 0.18} ${-visualLift + radius * 0.42}, ${radius * 0.58} ${-visualLift + radius * 0.1}`}
                fill="none"
                stroke="rgba(15,23,42,0.48)"
                strokeWidth={0.08}
            />
            <circle cx={radius * 0.18} cy={-visualLift - radius * 0.2} r={radius * 0.22}
                fill="rgba(15,23,42,0.34)" />
            <circle cx={-radius * 0.24} cy={-visualLift - radius * 0.25} r={radius * 0.16}
                fill="rgba(255,255,255,0.85)" />
        </g>
    );
});
BallMarker.displayName = "BallMarker";

// ── Pitch SVG ─────────────────────────────────────────────────

const PitchMarkings = memo(() => (
    <g fill="none" stroke="rgba(255,255,255,0.58)" strokeWidth={LINE_W}>
        {/* Outer boundary */}
        <rect x="0" y="0" width={PITCH_W} height={PITCH_H} />

        {/* Halfway line */}
        <line x1={PITCH_W / 2} y1="0" x2={PITCH_W / 2} y2={PITCH_H} />

        {/* Centre circle */}
        <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r={CENTER_CIRCLE_R} />
        <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r={0.18} fill="rgba(255,255,255,0.58)" />

        {/* Home penalty area (left) */}
        <rect x="0" y={PA_Y} width={PA_DEPTH} height={PA_WIDTH} />
        {/* Away penalty area (right) */}
        <rect x={PITCH_W - PA_DEPTH} y={PA_Y} width={PA_DEPTH} height={PA_WIDTH} />

        {/* Home 6-yard box */}
        <rect x="0" y={SB_Y} width={SB_DEPTH} height={SB_WIDTH} />
        {/* Away 6-yard box */}
        <rect x={PITCH_W - SB_DEPTH} y={SB_Y} width={SB_DEPTH} height={SB_WIDTH} />

        {/* Penalty spots */}
        <circle cx={PENALTY_MARK_X} cy={PITCH_H / 2} r={0.18}
            fill="rgba(255,255,255,0.58)" />
        <circle cx={PITCH_W - PENALTY_MARK_X} cy={PITCH_H / 2} r={0.18}
            fill="rgba(255,255,255,0.58)" />

        {/* Penalty arcs */}
        <path
            d={`M ${PA_DEPTH} ${PITCH_H / 2 - PENALTY_ARC_DY} A ${CENTER_CIRCLE_R} ${CENTER_CIRCLE_R} 0 0 1 ${PA_DEPTH} ${PITCH_H / 2 + PENALTY_ARC_DY}`}
        />
        <path
            d={`M ${PITCH_W - PA_DEPTH} ${PITCH_H / 2 - PENALTY_ARC_DY} A ${CENTER_CIRCLE_R} ${CENTER_CIRCLE_R} 0 0 0 ${PITCH_W - PA_DEPTH} ${PITCH_H / 2 + PENALTY_ARC_DY}`}
        />

        {/* Corner arcs */}
        {([
            [0, 0, CORNER_ARC_R],
            [PITCH_W, 0, CORNER_ARC_R],
            [0, PITCH_H, CORNER_ARC_R],
            [PITCH_W, PITCH_H, CORNER_ARC_R],
        ] as [number, number, number][]).map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
    </g>
));
PitchMarkings.displayName = "PitchMarkings";

const GoalPosts = memo(() => (
    <g>
        {/* Home goal (left) */}
        <rect
            x={-GOAL_DEPTH} y={GOAL_Y}
            width={GOAL_DEPTH} height={GOAL_H}
            fill="rgba(255,255,255,0.12)"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={LINE_W}
        />
        {/* Away goal (right) */}
        <rect
            x={PITCH_W} y={GOAL_Y}
            width={GOAL_DEPTH} height={GOAL_H}
            fill="rgba(255,255,255,0.12)"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={LINE_W}
        />
    </g>
));
GoalPosts.displayName = "GoalPosts";

// ── Stats bar ─────────────────────────────────────────────────

interface StatRowProps {
    label: string;
    home: string | number;
    away: string | number;
    homeRaw?: number;
    awayRaw?: number;
}

const StatBar = ({ label, home, away, homeRaw, awayRaw }: StatRowProps) => {
    const total = (homeRaw ?? 1) + (awayRaw ?? 1);
    const homePct = total > 0 ? ((homeRaw ?? 1) / total) * 100 : 50;

    return (
        <div className="space-y-1 rounded-xl bg-white/[0.035] px-2 py-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className="text-white font-black w-12 tabular-nums">{home}</span>
                <span className="text-gray-300 uppercase tracking-wider font-black text-[10px]">
                    {label}
                </span>
                <span className="text-white font-black w-12 text-right tabular-nums">{away}</span>
            </div>
            <div className="h-1.5 bg-red-500 rounded-full overflow-hidden flex">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${homePct}%` }}
                />
            </div>
        </div>
    );
};

type StatsScope = "full" | "firstHalf" | "secondHalf";
type SidebarDrawer = "stats" | "players" | "player" | null;

const statPct = (accurate: number, total: number) =>
    total > 0 ? `${Math.round((accurate / total) * 100)}%(${accurate}/${total})` : "0%(0/0)";

const fmtNumber = (value: number, decimals = 0) =>
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();

const getScopedStats = (stats: MatchState["stats"], scope: StatsScope) =>
    scope === "full" ? { home: stats.home, away: stats.away } : stats[scope];

const statSections = (home: TeamStatsState, away: TeamStatsState) => [
    {
        title: "Top Stats",
        rows: [
            ["Expected goals (xG)", fmtNumber(home.expectedGoals, 2), fmtNumber(away.expectedGoals, 2), home.expectedGoals, away.expectedGoals],
            ["Ball possession", `${home.possession}%`, `${away.possession}%`, home.possession, away.possession],
            ["Total shots", home.shotsTotal, away.shotsTotal, home.shotsTotal, away.shotsTotal],
            ["Shots on target", home.shotsOnTarget, away.shotsOnTarget, home.shotsOnTarget, away.shotsOnTarget],
            ["Big chances", home.bigChances, away.bigChances, home.bigChances, away.bigChances],
            ["Corner kicks", home.cornerKicks, away.cornerKicks, home.cornerKicks, away.cornerKicks],
            ["Passes", statPct(home.passesAccurate, home.passesTotal), statPct(away.passesAccurate, away.passesTotal), home.passesTotal, away.passesTotal],
            ["Yellow cards", home.yellowCards, away.yellowCards, home.yellowCards, away.yellowCards],
            ["Red cards", home.redCards, away.redCards, home.redCards, away.redCards],
        ],
    },
    {
        title: "Shots",
        rows: [
            ["xG on target (xGOT)", fmtNumber(home.xGOnTarget, 2), fmtNumber(away.xGOnTarget, 2), home.xGOnTarget, away.xGOnTarget],
            ["Shots off target", home.shotsOffTarget, away.shotsOffTarget, home.shotsOffTarget, away.shotsOffTarget],
            ["Blocked shots", home.blockedShots, away.blockedShots, home.blockedShots, away.blockedShots],
            ["Shots inside the box", home.shotsInsideBox, away.shotsInsideBox, home.shotsInsideBox, away.shotsInsideBox],
            ["Shots outside the box", home.shotsOutsideBox, away.shotsOutsideBox, home.shotsOutsideBox, away.shotsOutsideBox],
            ["Hit the woodwork", home.hitWoodwork, away.hitWoodwork, home.hitWoodwork, away.hitWoodwork],
            ["Headed goals", home.headedGoals, away.headedGoals, home.headedGoals, away.headedGoals],
        ],
    },
    {
        title: "Attack",
        rows: [
            ["Touches in opposition box", home.touchesInOppositionBox, away.touchesInOppositionBox, home.touchesInOppositionBox, away.touchesInOppositionBox],
            ["Accurate through passes", home.accurateThroughPasses, away.accurateThroughPasses, home.accurateThroughPasses, away.accurateThroughPasses],
            ["Offsides", home.offsides, away.offsides, home.offsides, away.offsides],
            ["Free kicks", home.freeKicks, away.freeKicks, home.freeKicks, away.freeKicks],
            ["Penalties", `${home.penaltiesScored}/${home.penaltiesWon}`, `${away.penaltiesScored}/${away.penaltiesWon}`, home.penaltiesWon, away.penaltiesWon],
        ],
    },
    {
        title: "Passes",
        rows: [
            ["Long passes", statPct(home.longPassesAccurate, home.longPassesTotal), statPct(away.longPassesAccurate, away.longPassesTotal), home.longPassesTotal, away.longPassesTotal],
            ["Passes in final third", statPct(home.finalThirdPassesAccurate, home.finalThirdPassesTotal), statPct(away.finalThirdPassesAccurate, away.finalThirdPassesTotal), home.finalThirdPassesTotal, away.finalThirdPassesTotal],
            ["Crosses", statPct(home.crossesAccurate, home.crossesTotal), statPct(away.crossesAccurate, away.crossesTotal), home.crossesTotal, away.crossesTotal],
            ["Expected assists (xA)", fmtNumber(home.expectedAssists, 2), fmtNumber(away.expectedAssists, 2), home.expectedAssists, away.expectedAssists],
            ["Throw ins", home.throwIns, away.throwIns, home.throwIns, away.throwIns],
        ],
    },
    {
        title: "Defense",
        rows: [
            ["Fouls", home.fouls, away.fouls, home.fouls, away.fouls],
            ["Tackles", statPct(home.tacklesWon, home.tacklesTotal), statPct(away.tacklesWon, away.tacklesTotal), home.tacklesTotal, away.tacklesTotal],
            ["Duels won", home.duelsWon, away.duelsWon, home.duelsWon, away.duelsWon],
            ["Clearances", home.clearances, away.clearances, home.clearances, away.clearances],
            ["Interceptions", home.interceptions, away.interceptions, home.interceptions, away.interceptions],
            ["Errors leading to shot", home.errorsLeadingToShot, away.errorsLeadingToShot, home.errorsLeadingToShot, away.errorsLeadingToShot],
            ["Errors leading to goal", home.errorsLeadingToGoal, away.errorsLeadingToGoal, home.errorsLeadingToGoal, away.errorsLeadingToGoal],
        ],
    },
    {
        title: "Goalkeeping",
        rows: [
            ["Goalkeeper saves", home.goalkeeperSaves, away.goalkeeperSaves, home.goalkeeperSaves, away.goalkeeperSaves],
            ["xGOT faced", fmtNumber(home.xGOTFaced, 2), fmtNumber(away.xGOTFaced, 2), home.xGOTFaced, away.xGOTFaced],
            ["Goals prevented", fmtNumber(home.goalsPrevented, 2), fmtNumber(away.goalsPrevented, 2), home.goalsPrevented, away.goalsPrevented],
        ],
    },
];

const playerSections = (stats: PlayerStatsState, isGoalkeeper: boolean) => [
    {
        title: "Top Stats",
        rows: [
            ["Rating", stats.rating.toFixed(1)],
            ["Total shots", stats.totalShots],
            ["Expected goals (xG)", fmtNumber(stats.expectedGoals, 2)],
            ["Assists", stats.assists],
            ["Accurate passes", statPct(stats.accuratePasses, stats.totalPasses)],
            ["Touches", stats.touches],
            ["Touches in opposition box", stats.touchesInOppositionBox],
            ["Successful dribbles", stats.successfulDribbles],
            ["Duels won", statPct(stats.duelsWon, stats.duelsTotal)],
        ],
    },
    {
        title: "Shots",
        rows: [
            ["Goals", stats.goals],
            ["xG on target (xGOT)", fmtNumber(stats.xGOnTarget, 2)],
            ["Shots on target", stats.shotsOnTarget],
            ["Shots off target", stats.shotsOffTarget],
            ["Blocked shots", stats.blockedShots],
            ["Shots inside the box", stats.shotsInsideBox],
            ["Shots outside the box", stats.shotsOutsideBox],
            ["Headed shots", stats.headedShots],
            ["Big chances missed", statPct(stats.bigChancesMissed, stats.bigChancesTotal)],
        ],
    },
    {
        title: "Attack",
        rows: [
            ["Fouls suffered", stats.foulsSuffered],
            ["Offsides", stats.offsides],
            ["Big chances created", stats.bigChancesCreated],
            ["Key passes", stats.keyPasses],
            ["Assists", stats.assists],
            ["Expected assists (xA)", fmtNumber(stats.expectedAssists, 2)],
        ],
    },
    {
        title: "Passes",
        rows: [
            ["Passes in final third", statPct(stats.finalThirdPassesAccurate, stats.finalThirdPassesTotal)],
            ["Long passes", statPct(stats.longPassesAccurate, stats.longPassesTotal)],
            ["Crosses", statPct(stats.crossesAccurate, stats.crossesTotal)],
        ],
    },
    {
        title: "Defense",
        rows: [
            ["Duels won", statPct(stats.duelsWon, stats.duelsTotal)],
            ["Aerial duels won", statPct(stats.aerialDuelsWon, stats.aerialDuelsTotal)],
            ["Ground duels won", statPct(stats.groundDuelsWon, stats.groundDuelsTotal)],
            ["Tackles won", statPct(stats.tacklesWon, stats.tacklesTotal)],
            ["Fouls committed", stats.foulsCommitted],
            ["Interceptions", stats.interceptions],
            ["Clearances", stats.clearances],
            ["Errors leading to goal", stats.errorsLeadingToGoal],
            ["Errors leading to shot", stats.errorsLeadingToShot],
        ],
    },
    {
        title: "Goalkeeping",
        rows: [
            ["Goalkeeper saves", isGoalkeeper ? stats.goalkeeperSaves : "-"],
            ["Goals conceded", isGoalkeeper ? stats.goalsConceded : "-"],
            ["Goals prevented", isGoalkeeper ? fmtNumber(stats.goalsPrevented, 2) : "-"],
            ["xGOT faced", isGoalkeeper ? fmtNumber(stats.xGOTFaced, 2) : "-"],
            ["Punches", isGoalkeeper ? stats.punches : "-"],
            ["Throws", isGoalkeeper ? stats.throws : "-"],
            ["Act as sweeper", isGoalkeeper ? stats.actsAsSweeper : "-"],
        ],
    },
    {
        title: "General",
        rows: [
            ["Minutes played", stats.minutesPlayed],
            ["Own goals", stats.ownGoals],
            ["Yellow cards", stats.yellowCards],
            ["Red cards", stats.redCards],
        ],
    },
];

const CompactStat = ({ label, home, away }: { label: string; home: string | number; away: string | number }) => (
    <div className="grid grid-cols-[56px_1fr_56px] items-center gap-2 text-[10px]">
        <span className="text-white font-black tabular-nums">{home}</span>
        <span className="text-gray-500 uppercase tracking-wider text-center font-bold">{label}</span>
        <span className="text-white font-black tabular-nums text-right">{away}</span>
    </div>
);

// ── Event log item ────────────────────────────────────────────

const EVENT_ICON: Record<string, string> = {
    goal: "⚽",
    shot: "🎯",
    tackle: "⚡",
    foul: "🟨",
    substitution: "🔄",
    halftime: "🕐",
    fulltime: "🏁",
    kickoff: "▶",
    pass: "→",
    throw_in: "↗",
    free_kick: "FK",
    goal_kick: "GK",
    corner_kick: "CK",
    penalty: "PK",
    yellow_card: "YC",
    red_card: "RC",
    cross: "↷",
    save: "▣",
};

// ── Main Component ────────────────────────────────────────────

const MatchSimulation: React.FC<MatchSimulationProps> = ({
    homeTeam,
    awayTeam,
    matchInfo,
    onFinishMatch,
    onLiveScoreChange,
    userTeamId,
    language = "pt",
}) => {
    const [gameState, setGameState] = useState<MatchState | null>(null);
    const [drawer, setDrawer] = useState<SidebarDrawer>(null);
    const [statsScope, setStatsScope] = useState<StatsScope>("full");
    const [playerTeamTab, setPlayerTeamTab] = useState<"home" | "away">("home");
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [cameraMode, setCameraMode] = useState<"top" | "follow">("top");
    const engineRef = useRef<MatchEngine | null>(null);
    const competitionLabel =
        matchInfo?.competition ??
        matchInfo?.matchinfo?.stadium ??
        "Match Simulation";

    // ── Filter players by lineup, preserving starter order ─────
    const hasLineupId = (player: MatchPlayerData): player is MatchPlayerData & { id: string } =>
        typeof player.id === "string";

    const filterTeamByLineup = (allPlayers: MatchPlayerData[], lineup: LineupData): MatchPlayerData[] => {
        const allowed = new Set([...lineup.starters, ...lineup.bench]);
        const filtered = allPlayers.filter(hasLineupId).filter((player) => allowed.has(player.id));
        const starterRank = new Map(lineup.starters.map((id: string, i: number) => [id, i]));
        const benchRank = new Map(lineup.bench.map((id: string, i: number) => [id, i]));
        filtered.sort((a, b) => {
            const aSt = starterRank.get(a.id);
            const bSt = starterRank.get(b.id);
            if (aSt !== undefined && bSt !== undefined) return aSt - bSt;
            if (aSt !== undefined) return -1;
            if (bSt !== undefined) return 1;
            return (benchRank.get(a.id) ?? 99) - (benchRank.get(b.id) ?? 99);
        });
        return filtered;
    };

    const emptyLineup: LineupData = { players: [], starters: [], bench: [] };
    const homeLineup = matchInfo?.lineup?.home_team ?? emptyLineup;
    const awayLineup = matchInfo?.lineup?.away_team ?? emptyLineup;
    const filteredHomePlayers = homeLineup.starters.length > 0
        ? filterTeamByLineup(homeLineup.players, homeLineup)
        : homeLineup.players;
    const filteredAwayPlayers = awayLineup.starters.length > 0
        ? filterTeamByLineup(awayLineup.players, awayLineup)
        : awayLineup.players;

    // `matchInfo.lineup.home_team.formation` or `matchInfo.lineup.away_team.formation`
    // can specify the formation per team; default to 4-3-3 / 4-4-2
    const homeFormation = matchInfo?.lineup?.home_team?.formation ?? "4-3-3";
    const awayFormation = matchInfo?.lineup?.away_team?.formation ?? "4-4-2";

    // ── Boot engine once ──────────────────────────────────────
    useEffect(() => {
        const engine = new MatchEngine(
            filteredHomePlayers,
            filteredAwayPlayers,
            42_000, 50_000, 0.6,
            (state) => setGameState({
                ...state,
                ball: { ...state.ball },
                players: state.players.map((player) => ({ ...player, matchStats: { ...player.matchStats } })),
                activePlayers: state.activePlayers.map((player) => ({ ...player, matchStats: { ...player.matchStats } })),
                stats: {
                    home: { ...state.stats.home },
                    away: { ...state.stats.away },
                    firstHalf: {
                        home: { ...state.stats.firstHalf.home },
                        away: { ...state.stats.firstHalf.away },
                    },
                    secondHalf: {
                        home: { ...state.stats.secondHalf.home },
                        away: { ...state.stats.secondHalf.away },
                    },
                },
                events: [...state.events],
                pendingSubstitutions: [...state.pendingSubstitutions],
            }),
            homeFormation,
            awayFormation,
        );
        engineRef.current = engine;
        engine.start();
        return () => engine.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!gameState || !onLiveScoreChange) return;
        onLiveScoreChange({ home: gameState.homeScore, away: gameState.awayScore });
    }, [gameState?.homeScore, gameState?.awayScore, onLiveScoreChange]);

    const setPaused = useCallback((v: boolean) => engineRef.current?.setPaused(v), []);
    const setSpeed = useCallback((v: number) => engineRef.current?.setSpeed(v), []);
    const execSubs = useCallback(() => engineRef.current?.executeQueuedSubstitutions(), []);

    if (!gameState) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                <div className="text-white/30 text-xs uppercase tracking-widest animate-pulse">
                    Loading simulation…
                </div>
            </div>
        );
    }

    const { ball, players, stats, events, phase, displayTime } = gameState;
    const visiblePlayers = players.length === 22 ? players : [];
    const homePlayers = visiblePlayers.filter(p => p.team === "home");
    const awayPlayers = visiblePlayers.filter(p => p.team === "away");
    const mirrorPitch = phase === "SECOND_HALF" || (phase === "STOPPAGE" && gameState.time >= 90);
    const renderPlayers = mirrorPitch
        ? visiblePlayers.map((p) => ({ ...p, x: 100 - p.x }))
        : visiblePlayers;
    const renderHomePlayers = renderPlayers.filter(p => p.team === "home");
    const renderAwayPlayers = renderPlayers.filter(p => p.team === "away");
    const rawPlayerMap = new Map<string, MatchPlayerData>(
        [...filteredHomePlayers, ...filteredAwayPlayers]
            .filter((p): p is MatchPlayerData & { id: string } => typeof p.id === "string")
            .map((p) => [p.id, p]),
    );
    const selectedPlayer = selectedPlayerId
        ? visiblePlayers.find((p) => p.id === selectedPlayerId) ?? null
        : null;
    const selectedRaw = selectedPlayer ? rawPlayerMap.get(selectedPlayer.id) : null;
    const isUserTeam =
        selectedPlayer?.team === "home"
            ? homeTeam.data.id === userTeamId
            : selectedPlayer?.team === "away"
                ? awayTeam.data.id === userTeamId
                : false;
    const scopedStats = getScopedStats(stats, statsScope);
    const topStats = statSections(scopedStats.home, scopedStats.away)[0].rows.slice(0, 4);
    const teamPlayers = playerTeamTab === "home" ? homePlayers : awayPlayers;
    const topPlayers = [...teamPlayers]
        .sort((a, b) => b.matchStats.rating - a.matchStats.rating)
        .slice(0, 4);
    const canSub =
        (phase === "HALFTIME" || phase === "STOPPAGE") &&
        gameState.pendingSubstitutions.length > 0;

    const timeLabel = phaseLabel(phase, displayTime);
    const isLive =
        phase === "FIRST_HALF" ||
        phase === "SECOND_HALF" ||
        phase === "STOPPAGE" ||
        phase === "SET_PIECE";

    const statRows: StatRowProps[] = topStats.map(([label, home, away, homeRaw, awayRaw]) => ({
        label: String(label),
        home: home as string | number,
        away: away as string | number,
        homeRaw: Number(homeRaw),
        awayRaw: Number(awayRaw),
    }));
    const scopeOptions: Array<{ id: StatsScope; label: string; disabled?: boolean }> = [
        { id: "full", label: "Full" },
        { id: "firstHalf", label: "1st" },
        { id: "secondHalf", label: "2nd", disabled: phase === "FIRST_HALF" || phase === "KICK_OFF" || phase === "PRE_MATCH" },
    ];
    const fullStatsSections = statSections(scopedStats.home, scopedStats.away);
    const selectedBirthYear = selectedRaw?.personal?.birth_date
        ? new Date(selectedRaw.personal.birth_date).getFullYear()
        : null;
    const selectedAge = selectedBirthYear ? new Date().getFullYear() - selectedBirthYear : null;
    const renderBallX = mirrorPitch ? 100 - ball.x : ball.x;
    const ballSvgX = (renderBallX / 100) * PITCH_W;
    const ballSvgY = (ball.y / 100) * PITCH_H;
    const followW = 47;
    const followH = 31;
    const pitchViewBox = cameraMode === "follow"
        ? `${Math.max(-GOAL_DEPTH, Math.min(ballSvgX - followW / 2, PITCH_W + GOAL_DEPTH - followW))} ${Math.max(0, Math.min(ballSvgY - followH / 2, PITCH_H - followH))} ${followW} ${followH}`
        : `${-GOAL_DEPTH} 0 ${PITCH_W + GOAL_DEPTH * 2} ${PITCH_H}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full h-full flex flex-col gap-2 xl:gap-3"
        >
            <header className="bg-[#111] border border-white/5 rounded-2xl xl:rounded-3xl h-16 xl:h-20 shrink-0
                         flex items-center justify-between px-4 xl:px-8 shadow-2xl">
                {/* Home team */}
                <div className="flex items-center gap-3 w-1/3">
                    <img src={homeTeam.data.logo} alt="Home"
                        className="w-8 h-8 xl:w-9 xl:h-9 object-contain drop-shadow" />
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-base xl:text-lg leading-none">
                            {homeTeam.data.name}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-gray-500 mt-0.5">
                            {competitionLabel}
                        </span>
                    </div>
                </div>

                {/* Score & clock */}
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl xl:text-4xl font-black text-white tabular-nums">
                            {gameState.homeScore}
                        </span>
                        <span className="text-gray-600 font-bold text-xl">–</span>
                        <span className="text-3xl xl:text-4xl font-black text-white tabular-nums">
                            {gameState.awayScore}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isLive && (
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-widest
              ${isLive ? "text-red-400" : "text-gray-500"}`}>
                            {timeLabel}
                        </span>
                    </div>
                </div>

                {/* Controls + away team */}
                <div className="flex items-center gap-3 w-1/3 justify-end">
                    {/* Speed controls */}
                    <div className="hidden">
                        <button
                            type="button"
                            onClick={() => setPaused(!gameState.isPaused)}
                            className="h-8 px-3 rounded-xl bg-white/10 text-white text-[10px]
                         font-bold hover:bg-white/20 transition-colors"
                        >
                            {gameState.isPaused ? "▶ PLAY" : "⏸ PAUSE"}
                        </button>
                        {[0.5, 1, 2].map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setSpeed(s)}
                                className={`h-8 w-9 rounded-xl text-[10px] font-black transition-colors
                  ${gameState.speed === s
                                        ? "bg-red-600 text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                            >
                                {s}x
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-white font-bold text-base xl:text-lg leading-none">
                            {awayTeam.data.name}
                        </span>
                    </div>
                    <img src={awayTeam.data.logo} alt="Away"
                        className="w-8 h-8 xl:w-9 xl:h-9 object-contain drop-shadow" />
                </div>
            </header>

            <div className="flex-1 grid grid-cols-[250px_minmax(0,1fr)_280px] xl:grid-cols-[300px_minmax(0,1fr)_320px] gap-2 xl:gap-3 min-h-0">
                <aside className="relative bg-[#111] border border-white/5 rounded-2xl xl:rounded-3xl p-3 xl:p-4 flex flex-col gap-3 xl:gap-4 min-h-0 overflow-hidden">
                    <AnimatePresence>
                        {drawer === "stats" && (
                            <motion.div initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }} className="absolute inset-0 z-20 bg-[#111] p-4 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[10px] text-white uppercase tracking-widest font-black">Match Statistics</h3>
                                    <button type="button" onClick={() => setDrawer(null)} className="text-gray-400 hover:text-white text-xs font-black">Close</button>
                                </div>
                                <div className="grid grid-cols-3 gap-1 mb-3">
                                    {scopeOptions.map((opt) => (
                                        <button key={opt.id} type="button" disabled={opt.disabled} onClick={() => setStatsScope(opt.id)} className={`h-8 rounded-lg text-[10px] font-black uppercase ${statsScope === opt.id ? "bg-red-600 text-white" : "bg-white/5 text-gray-400"} disabled:opacity-30`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex-1 overflow-y-auto pr-1 space-y-5">
                                    {fullStatsSections.map((section) => (
                                        <section key={section.title}>
                                            <h4 className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-2">{section.title}</h4>
                                            <div className="space-y-2">
                                                {section.rows.map(([label, home, away]) => (
                                                    <CompactStat key={String(label)} label={String(label)} home={home as string | number} away={away as string | number} />
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <section>
                        <h3 className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-3">Controls</h3>
                        <button type="button" onClick={() => setPaused(!gameState.isPaused)} className="w-full h-10 rounded-xl bg-white/10 text-white text-[10px] font-black hover:bg-white/20 transition-colors mb-2">
                            {gameState.isPaused ? "PLAY" : "PAUSE"}
                        </button>
                        <div className="grid grid-cols-4 gap-1.5">
                            {[0.5, 1, 2, 4].map(s => (
                                <button key={s} type="button" onClick={() => setSpeed(s)} className={`h-8 rounded-lg text-[10px] font-black transition-colors ${gameState.speed === s ? "bg-red-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                                    {s}x
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                            {(["top", "follow"] as const).map(mode => (
                                <button key={mode} type="button" onClick={() => setCameraMode(mode)} className={`h-8 rounded-lg text-[10px] font-black uppercase transition-colors ${cameraMode === mode ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                                    {mode === "top" ? "Top" : "Follow"}
                                </button>
                            ))}
                        </div>
                    </section>
                    <div className="h-px bg-white/5" />
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Top Statistics</h3>
                            <button type="button" onClick={() => setDrawer("stats")} className="text-gray-400 hover:text-white text-xs font-black">&gt;</button>
                        </div>
                        <div className="space-y-3">
                            {statRows.map(row => (
                                <StatBar key={row.label} {...row} />
                            ))}
                        </div>
                    </section>
                    <div className="h-px bg-white/5" />
                    <section className="flex-1 min-h-0">
                        <h3 className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-2">Player States</h3>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                            {(Object.entries(AI_STATE_COLOR) as [AIState, string][]).filter(([, c]) => c !== "transparent").map(([state, color]) => (
                                <div key={state} className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                    <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">{state}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>

                <div className="relative bg-[#1a3d24] rounded-2xl xl:rounded-3xl border border-white/10
                        overflow-hidden flex items-center justify-center shadow-inner">
                    {/*
            The SVG viewBox matches a real football pitch (105×68).
            All coordinates from the engine (0-100) are mapped:
              svgX = (x / 100) * 105
              svgY = (y / 100) * 68
            so the pitch fills the container with correct aspect ratio.
          */}
                    <svg
                        viewBox={pitchViewBox}
                        className="w-full h-full"
                        style={{ maxHeight: "100%", display: "block" }}
                    >
                        {/* Pitch texture gradient */}
                        <defs>
                            <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1a5c30" />
                                <stop offset="50%" stopColor="#1e6b36" />
                                <stop offset="100%" stopColor="#1a5c30" />
                            </linearGradient>
                            {/* Alternating stripe pattern */}
                            <pattern id="stripes" x="0" y="0" width="10.5" height="68"
                                patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="5.25" height="68" fill="#1e6b36" />
                                <rect x="5.25" y="0" width="5.25" height="68" fill="#196034" />
                            </pattern>
                        </defs>

                        {/* Stripe background */}
                        <rect x="0" y="0" width={PITCH_W} height={PITCH_H}
                            fill="url(#stripes)" />

                        <PitchMarkings />
                        <GoalPosts />

                        {/* Away players (rendered first so home is on top) */}
                        {renderAwayPlayers.map(p => (
                            <PlayerDot
                                key={p.id}
                                player={p}
                                kit={awayTeam.kit}
                                ball={ball}
                            />
                        ))}

                        {/* Home players */}
                        {renderHomePlayers.map(p => (
                            <PlayerDot
                                key={p.id}
                                player={p}
                                kit={homeTeam.kit}
                                ball={ball}
                            />
                        ))}

                        {/* Ball (always on top) */}
                        <BallMarker ball={{ ...ball, x: renderBallX }} />
                    </svg>

                    {/* Validation warning overlay */}
                    {players.length > 0 && players.length !== 22 && (
                        <div className="absolute inset-0 z-40 bg-black/60 flex items-center
                            justify-center pointer-events-none">
                            <span className="text-xs text-red-400 font-black uppercase tracking-widest">
                                Player count mismatch ({players.length}/22)
                            </span>
                        </div>
                    )}

                    {/* Substitution panel */}
                    <AnimatePresence>
                        {canSub && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-0 z-50 bg-black/65 flex items-center
                           justify-center"
                            >
                                <div className="bg-[#141414] border border-white/10 rounded-3xl
                                w-85 p-5 shadow-2xl">
                                    <h3 className="text-[9px] text-gray-500 uppercase tracking-widest
                                 font-black mb-4">
                                        Pending Substitutions
                                    </h3>
                                    <div className="space-y-2.5 mb-5">
                                        {gameState.pendingSubstitutions.map(sub => (
                                            <div
                                                key={sub.playerOutId}
                                                className="grid grid-cols-[1fr_24px_1fr] gap-2
                                   items-center text-xs"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400
                                           shrink-0" />
                                                    <span className="text-red-300 truncate font-bold">
                                                        {sub.playerOutName}
                                                    </span>
                                                </div>
                                                <span className="text-gray-600 text-center font-black">⇄</span>
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="text-emerald-300 truncate font-bold">
                                                        {sub.playerInName}
                                                    </span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400
                                           shrink-0" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={execSubs}
                                        className="w-full h-10 rounded-xl bg-red-600 text-white
                               text-xs font-black hover:bg-red-700 transition-colors"
                                    >
                                        CONFIRM SUBSTITUTIONS
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <aside className="relative bg-[#111] border border-white/5 rounded-2xl xl:rounded-3xl p-3 xl:p-4
                          flex flex-col gap-2.5 xl:gap-4 min-h-0 overflow-hidden">
                    <AnimatePresence>
                        {(drawer === "players" || drawer === "player") && (
                            <motion.div initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }} className="absolute inset-0 z-20 bg-[#111] p-4 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[10px] text-white uppercase tracking-widest font-black">{drawer === "player" ? "Player Details" : "Squads"}</h3>
                                    <button type="button" onClick={() => { setDrawer(null); setSelectedPlayerId(null); }} className="text-gray-400 hover:text-white text-xs font-black">Close</button>
                                </div>
                                {drawer === "player" && selectedPlayer ? (
                                    <div className="flex-1 overflow-y-auto pr-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            {selectedRaw?.personal?.photo_url ? (
                                                <img src={selectedRaw.personal.photo_url} alt={selectedPlayer.name} className="w-14 h-14 rounded-xl object-cover bg-white/5" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-white font-black">{selectedPlayer.number}</div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-white text-sm font-black truncate">{selectedRaw?.personal?.name ?? selectedPlayer.name}</p>
                                                <p className="text-[10px] text-gray-500 font-bold">{formatPosition(selectedPlayer.position, language)} · {selectedAge ? `${selectedAge} yrs` : "Age -"}</p>
                                                <p className="text-[10px] text-gray-500 font-bold">Contract: {selectedRaw?.contract?.valid_until ?? "-"}</p>
                                                <p className="text-[10px] text-gray-500 font-bold">Stamina: {Math.round(selectedPlayer.stamina)}%</p>
                                                <p className="text-[10px] text-gray-500 font-bold">Overall: {isUserTeam ? Math.round(selectedPlayer.overall * 100) : "-"}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-5">
                                            {playerSections(selectedPlayer.matchStats, selectedPlayer.position === "GK").map((section) => (
                                                <section key={section.title}>
                                                    <h4 className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-2">{section.title}</h4>
                                                    <div className="space-y-1.5">
                                                        {section.rows.map(([label, value]) => (
                                                            <div key={String(label)} className="flex items-center justify-between text-[10px]">
                                                                <span className="text-gray-500 font-bold">{label}</span>
                                                                <span className="text-white font-black">{value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-1 mb-3">
                                            {(["home", "away"] as const).map((team) => (
                                                <button key={team} type="button" onClick={() => setPlayerTeamTab(team)} className={`h-8 rounded-lg text-[10px] font-black uppercase ${playerTeamTab === team ? "bg-red-600 text-white" : "bg-white/5 text-gray-400"}`}>
                                                    {team === "home" ? homeTeam.data.name : awayTeam.data.name}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                                            {[...teamPlayers].sort((a, b) => b.matchStats.rating - a.matchStats.rating).map((p) => (
                                                <button key={p.id} type="button" onClick={() => { setSelectedPlayerId(p.id); setDrawer("player"); }} className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 px-3 flex items-center justify-between">
                                                    <span className="text-white text-[11px] font-bold truncate">{p.number}. {p.name}</span>
                                                    <span className="text-emerald-300 text-[11px] font-black">{p.matchStats.rating.toFixed(1)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <section className="shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Top Players</h3>
                            <button type="button" onClick={() => setDrawer("players")} className="text-gray-400 hover:text-white text-xs font-black">&gt;</button>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mb-2">
                            {(["home", "away"] as const).map((team) => (
                                <button key={team} type="button" onClick={() => setPlayerTeamTab(team)} className={`h-7 rounded-lg text-[9px] font-black uppercase ${playerTeamTab === team ? "bg-white/15 text-white" : "bg-white/5 text-gray-500"}`}>
                                    {team === "home" ? homeTeam.data.name : awayTeam.data.name}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-1.5">
                            {topPlayers.map((p) => (
                                <button key={p.id} type="button" onClick={() => { setSelectedPlayerId(p.id); setDrawer("player"); }} className="w-full h-9 rounded-xl bg-white/5 hover:bg-white/10 px-2.5 flex items-center justify-between">
                                    <span className="text-white text-[10px] font-bold truncate">{p.number}. {p.name}</span>
                                    <span className="text-emerald-300 text-[10px] font-black">{p.matchStats.rating.toFixed(1)}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Match events */}
                    <section className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-[9px] text-gray-500 uppercase tracking-widest
                           font-black mb-3 shrink-0">
                            Match Events
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-1
                            scrollbar-thin scrollbar-thumb-white/10">
                            {events.length === 0 && (
                                <div className="text-[10px] text-gray-600 px-3 py-2.5
                                border border-white/5 rounded-xl">
                                    Awaiting kick-off…
                                </div>
                            )}
                            <AnimatePresence initial={false}>
                                {events.map(evt => (
                                    <motion.div
                                        key={evt.id}   /* ← Stable unique ID, not index */
                                        initial={{ opacity: 0, x: 8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className={`border rounded-lg px-2 py-1
                      ${evt.type === "goal"
                                                ? "border-yellow-500/40 bg-yellow-500/10"
                                                : "border-white/5 bg-white/2"}`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-xs shrink-0 mt-0.5">
                                                {EVENT_ICON[evt.type] ?? "•"}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className={`text-[9px] font-black
                          ${evt.team === "home" ? "text-blue-400" : "text-red-400"}`}>
                                                    {evt.minute}
                                                </span>
                                                <span className="text-[10px] text-gray-300 leading-tight">
                                                    {evt.text}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>
                </aside>
            </div>

            <footer className="bg-[#111] border border-white/5 rounded-2xl h-9 xl:h-12 shrink-0
                         flex items-center justify-between px-6">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    Attendance: 42,000 · {phase.replace("_", " ")}
                </span>

                <div className="flex items-center gap-3">
                    {/* Stoppage time chip */}
                    {phase === "STOPPAGE" && (
                        <span className="bg-yellow-600/20 border border-yellow-600/40 text-yellow-400
                             text-[9px] font-black px-2 py-0.5 rounded-lg uppercase
                             tracking-wider">
                            +{gameState.stoppageTime} min
                        </span>
                    )}

                    {gameState.isFinished && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => onFinishMatch(gameState)}
                            className="bg-red-600 text-white px-5 py-1.5 rounded-xl
                         text-[10px] font-black hover:bg-red-700 transition-colors
                         uppercase tracking-wider"
                        >
                            End Match
                        </motion.button>
                    )}
                </div>
            </footer>
        </motion.div>
    );
};

export default MatchSimulation;
