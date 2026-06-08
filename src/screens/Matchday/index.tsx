import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRIcon } from "../../icons/ChevronR";
import { useCareerStore } from "../../store/useCareerStore";
import CompetitionTable from "../../components/DashboardWidgets/CompetitionTable";
import { useCompetitionsStore } from "../../store/useCompetitionsStore";
import MatchSimulation from "../../components/MatchEngine/MatchSimulation";
import FormationDiagram, { FormationPlayer, sortPlayersByFormation } from "../../components/MatchEngine/FormationDiagram";
import { FORMATIONS, EnginePlayer, MatchEventState, MatchState } from "../../components/MatchEngine/Engine";
import { RuntimePlayer, useTeamStore } from "../../store/useTeamStore";
import PlayerDrawer from "../Squad/PlayerDrawer";
import { StadiumIcon } from "../../icons/Stadium";
import { FlightIcon } from "../../icons/Flight";
import { CloudsIcon } from "../../icons/Clouds";
import { WhistleIcon } from "../../icons/Whistle";
import { CalendarIcon } from "../../icons/Calendar";
import { formatDynamicDate } from "../../utils/formatDynamicDate";
import MatchDetails from "./MatchDetails";
import { getOverallColorStyles } from "../../utils/colorStyles";
import { formatPosition, getPositionLanguageFromSave } from "../../utils/positionI18n";
import MatchdayPlayerList, { sortOptionsForTarget } from "./MatchdayPlayerList";
import { CloseIcon } from "../../icons/Close";
import { EnergyIcon } from "../../icons/Energy";
import { DiamondIcon } from "../../icons/Diamond";
import { getPositionFitResult } from "../../utils/positionFit";
import type { PositionFitLevel } from "../../utils/positionFit";
import {
    FORMATION_OPTIONS,
    POSITION_LABEL_MAP,
    POSITION_SLOT_ROLE,
    selectBestAiMatchdaySquad,
} from "../../utils/teamLineupAI";

function calcFormationOverall(players: FormationPlayer[]): number {
    if (players.length === 0) return 0;
    const sum = players.reduce((total, player) => total + (player.overall ?? 60), 0);
    return Math.round(sum / players.length);
}

function statPair(home: number, away: number): TeamStatPair<number> {
    return { home, away };
}

function toFixtureMatchStats(stats: MatchState["stats"]): MatchStats {
    return {
        possession: statPair(stats.home.possession, stats.away.possession),
        shotsTotal: statPair(stats.home.shotsTotal, stats.away.shotsTotal),
        shotsOnTarget: statPair(stats.home.shotsOnTarget, stats.away.shotsOnTarget),
        shotsOffTarget: statPair(stats.home.shotsOffTarget, stats.away.shotsOffTarget),
        blockedShots: statPair(stats.home.blockedShots, stats.away.blockedShots),
        cornerKicks: statPair(stats.home.cornerKicks, stats.away.cornerKicks),
        offsides: statPair(stats.home.offsides, stats.away.offsides),
        fouls: statPair(stats.home.fouls, stats.away.fouls),
        yellowCards: statPair(stats.home.yellowCards, stats.away.yellowCards),
        redCards: statPair(stats.home.redCards, stats.away.redCards),
        bigChances: statPair(stats.home.bigChances, stats.away.bigChances),
        bigChancesMissed: statPair(
            Math.max(0, stats.home.bigChances - stats.home.penaltiesScored),
            Math.max(0, stats.away.bigChances - stats.away.penaltiesScored),
        ),
        goalkeeperSaves: statPair(stats.home.goalkeeperSaves, stats.away.goalkeeperSaves),
        passesTotal: statPair(stats.home.passesTotal, stats.away.passesTotal),
        passesAccurate: statPair(stats.home.passesAccurate, stats.away.passesAccurate),
        tackles: statPair(stats.home.tacklesWon, stats.away.tacklesWon),
    };
}

function parseEngineEventMinute(minute: string): { minute: number; extraMinute?: number; period: MatchEvent["period"] } {
    const normalized = minute.replace("'", "").trim();
    const [minuteText, extraText] = normalized.split("+");
    const baseMinute = Number(minuteText) || 0;
    return {
        minute: baseMinute,
        extraMinute: extraText ? Number(extraText) || undefined : undefined,
        period: baseMinute > 90 ? "extraTime" : baseMinute <= 45 ? "firstHalf" : "secondHalf",
    };
}

function mapEngineEventType(type: MatchEventState["type"]): MatchEvent["type"] {
    if (type === "goal" || type === "penalty") return "goal";
    if (type === "yellow_card" || type === "red_card") return "card";
    if (type === "substitution") return "substitution";
    return "var";
}

function toFixtureEvents(events: MatchEventState[]): MatchEvent[] {
    return events
        .map((event) => {
            const parsed = parseEngineEventMinute(event.minute);
            return {
                ...parsed,
                team: event.team,
                type: mapEngineEventType(event.type),
                playerId: "",
                detail: event.text,
                rawType: event.type,
                rawText: event.text,
            };
        })
        .sort((a, b) => (a.minute + (a.extraMinute ?? 0) / 100) - (b.minute + (b.extraMinute ?? 0) / 100));
}

function toFixturePlayerPerformance(player: EnginePlayer): PlayerPerformance {
    const stats = player.matchStats;
    const isGoalkeeper = player.position === "GK";
    return {
        playerId: player.id,
        name: player.name,
        rating: stats.rating,
        isFirstEleven: player.substitutionSlot < 11,
        minutesPlayed: stats.minutesPlayed,
        goals: stats.goals,
        assists: stats.assists,
        ownGoals: stats.ownGoals,
        shotsTotal: stats.totalShots,
        shotsOnTarget: stats.shotsOnTarget,
        bigChancesCreated: stats.bigChancesCreated,
        bigChancesMissed: stats.bigChancesMissed,
        passesTotal: stats.totalPasses,
        passesAccurate: stats.accuratePasses,
        keyPasses: stats.keyPasses,
        crossesTotal: stats.crossesTotal,
        crossesAccurate: stats.crossesAccurate,
        longBallsTotal: stats.longPassesTotal,
        longBallsAccurate: stats.longPassesAccurate,
        tackles: stats.tacklesWon,
        interceptions: stats.interceptions,
        clearances: stats.clearances,
        blockedShots: stats.blockedShots,
        duelsGroundTotal: stats.groundDuelsTotal,
        duelsGroundWon: stats.groundDuelsWon,
        duelsAerialTotal: stats.aerialDuelsTotal,
        duelsAerialWon: stats.aerialDuelsWon,
        dispossessed: Math.max(0, stats.duelsTotal - stats.duelsWon),
        foulsCommitted: stats.foulsCommitted,
        foulsDrawn: stats.foulsSuffered,
        yellowCards: stats.yellowCards,
        redCards: stats.redCards,
        goalsConceded: stats.goalsConceded,
        goalkeeper: isGoalkeeper
            ? {
                saves: stats.goalkeeperSaves,
                savesInsideBox: stats.goalkeeperSaves,
                punches: stats.punches,
                highClaims: stats.throws,
            }
            : undefined,
    };
}

function buildFinishedMatchDetails(finalState: MatchState): {
    stats: MatchStats;
    playerStats: MatchPlayerStats;
    events: MatchEvent[];
} {
    const playedPlayers = finalState.players.filter((player) => player.matchStats.minutesPlayed > 0);
    return {
        stats: toFixtureMatchStats(finalState.stats),
        playerStats: {
            home: Object.fromEntries(
                playedPlayers
                    .filter((player) => player.team === "home")
                    .map((player) => [player.id, toFixturePlayerPerformance(player)]),
            ),
            away: Object.fromEntries(
                playedPlayers
                    .filter((player) => player.team === "away")
                    .map((player) => [player.id, toFixturePlayerPerformance(player)]),
            ),
        },
        events: toFixtureEvents(finalState.events),
    };
}

const checkKitConflict = (kit1: Uniform, kit2: Uniform): boolean => {
    if (kit1.kit_group === kit2.kit_group) return true;
    const toneDiff = Math.abs(kit1.tone - kit2.tone);
    if (toneDiff < 25) return true;
    const sharedColor = kit1.base_colors.some((color) => kit2.base_colors.includes(color));
    if (sharedColor && toneDiff < 40) return true;
    return false;
};

const resolveDefaultKits = (homeUniforms: UniformMap, awayUniforms: UniformMap) => {
    if (!checkKitConflict(homeUniforms.home, awayUniforms.away)) {
        return { homeKit: "home" as const, awayKit: "away" as const };
    }
    if (!checkKitConflict(homeUniforms.home, awayUniforms.home)) {
        return { homeKit: "home" as const, awayKit: "home" as const };
    }
    if (awayUniforms.third && !checkKitConflict(homeUniforms.home, awayUniforms.third)) {
        return { homeKit: "home" as const, awayKit: "third" as const };
    }
    if (!checkKitConflict(homeUniforms.away, awayUniforms.home)) {
        return { homeKit: "away" as const, awayKit: "home" as const };
    }
    return { homeKit: "home" as const, awayKit: "away" as const };
};

function toFormationPlayer(p: RuntimePlayer, pos?: string): FormationPlayer {
    const targetPosition = pos ?? p.technical_profile.best_position;
    const baseOverall = p.technical_profile.overall;
    const naturalPosition = p.technical_profile.best_position;
    const playablePositions = p.technical_profile.positions ?? [];
    const positionFit = getPositionFitResult(baseOverall, naturalPosition, playablePositions, targetPosition);

    return {
        id: p.id,
        name: p.personal.short_name,
        number: p.contract.kit_number,
        position: targetPosition,
        photo_url: p.personal.photo_url,
        is_captain: false,
        overall: positionFit.adjustedOverall,
        base_overall: baseOverall,
        natural_position: naturalPosition,
        playable_positions: playablePositions,
        position_penalty: positionFit.penalty,
        position_fit: positionFit.fit,
        condition: p.runtime.condition,
        match_fitness: p.runtime.form * 20,
        is_injured: Boolean(p.runtime.injury),
    };
}

function applyPlayerPositionFit(player: FormationPlayer, targetPosition: string): FormationPlayer {
    const baseOverall = player.base_overall ?? player.overall;
    const naturalPosition = player.natural_position ?? player.position;
    const playablePositions = player.playable_positions ?? [];
    const positionFit = getPositionFitResult(baseOverall, naturalPosition, playablePositions, targetPosition);

    return {
        ...player,
        position: targetPosition,
        overall: positionFit.adjustedOverall,
        base_overall: baseOverall,
        natural_position: naturalPosition,
        playable_positions: playablePositions,
        position_penalty: positionFit.penalty,
        position_fit: positionFit.fit as PositionFitLevel,
    };
}

function resetPlayerToNaturalPosition(player: FormationPlayer): FormationPlayer {
    return applyPlayerPositionFit(player, player.natural_position ?? player.position);
}

function formationDotColor(line: string): string {
    switch (line) {
        case "GK": return "#fbbf24";
        case "DF": return "#38bdf8";
        case "MF": return "#34d399";
        case "FW": return "#fb7185";
        default: return "#94a3b8";
    }
}


function MiniFormationCard({
    formation,
    active,
    disabled,
    primaryColor,
    onSelect,
}: {
    formation: string;
    active: boolean;
    disabled: boolean;
    primaryColor: string;
    onSelect: () => void;
}) {
    const slots = FORMATIONS[formation] ?? [];

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onSelect}
            className={`group min-h-38 rounded-2xl border p-2 text-left transition-all ${active
                ? "border-white/30 bg-white/12 shadow-lg shadow-black/30"
                : "border-white/8 bg-white/[0.035] hover:border-white/18 hover:bg-white/[0.07]"} ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
        >
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-[10px] font-black uppercase tracking-wide text-white">{formation}</span>
                {active && (
                    <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                    />
                )}
            </div>
            <svg viewBox="0 0 68 105" className="h-28 w-full">
                <g fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth="0.7">
                    <rect x="1" y="1" width="66" height="103" rx="1.5" />
                    <line x1="1" y1="52.5" x2="67" y2="52.5" />
                    <circle cx="34" cy="52.5" r="9" />
                    <rect x="14" y="1" width="40" height="16" />
                    <rect x="23" y="1" width="22" height="6" />
                    <rect x="14" y="88" width="40" height="16" />
                    <rect x="23" y="98" width="22" height="6" />
                </g>
                {slots.map((slot, index) => {
                    const x = (slot.diagram.y / 100) * 68;
                    const y = ((100 - slot.diagram.x) / 100) * 105;
                    return (
                        <circle
                            key={`${formation}-${index}`}
                            cx={x}
                            cy={y}
                            r={active ? 2.15 : 1.85}
                            fill={formationDotColor(slot.line)}
                            stroke={active ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.55)"}
                            strokeWidth="0.55"
                        />
                    );
                })}
            </svg>
        </button>
    );
}

function roleForFormationSlot(formation: string, index: number, fallback = "CM"): string {
    const labels = POSITION_LABEL_MAP[formation] ?? POSITION_LABEL_MAP["4-3-3"];
    const label = labels[index];
    return label ? POSITION_SLOT_ROLE[label] ?? fallback : fallback;
}

function remapStartersToFormation(players: FormationPlayer[], formation: string): FormationPlayer[] {
    return players.map((player, index) =>
        applyPlayerPositionFit(player, roleForFormationSlot(formation, index, player.position)),
    );
}

function applyStarterSlotPositions(players: any[], starters: FormationPlayer[]): any[] {
    const slotById = new Map(starters.map((player) => [player.id, player.position]));

    return players.map((player) => {
        const slotPosition = slotById.get(player.id);
        if (!slotPosition) return player;
        const baseOverall = player.technical_profile?.overall ?? 60;
        const naturalPosition = player.technical_profile?.best_position ?? slotPosition;
        const playablePositions = player.technical_profile?.positions ?? [];
        const positionFit = getPositionFitResult(baseOverall, naturalPosition, playablePositions, slotPosition);

        return {
            ...player,
            position: slotPosition,
            technical_profile: {
                ...player.technical_profile,
                overall: positionFit.adjustedOverall,
                best_position: slotPosition,
            },
            position_fit_penalty: positionFit.penalty,
            natural_position: naturalPosition,
        };
    });
}

const Matchday: React.FC = () => {
    const { currentTeam, saveData } = useCareerStore();
    const [activeTab, setActiveTab] = useState<"lineup" | "stats" | "table">("lineup");
    const [isSimulating, setIsSimulating] = useState(false);
    const [subTarget, setSubTarget] = useState<string | null>(null);
    const [drawerPlayerId, setDrawerPlayerId] = useState<string | null>(null);
    const [homeFormation, setHomeFormation] = useState("4-3-3");
    const [awayFormation, setAwayFormation] = useState("4-3-3");

    const competitions = useCompetitionsStore((state) => state.competitions);
    const getNextMatch = useCompetitionsStore((state) => state.getNextMatch);
    const updateLiveMatchScore = useCompetitionsStore((state) => state.updateLiveMatchScore);
    const updateMatchResult = useCompetitionsStore((state) => state.updateMatchResult);
    const clearLiveMatchScore = useCompetitionsStore((state) => state.clearLiveMatchScore);
    const playersByTeamId = useTeamStore((state) => state.playersByTeamId);
    const setActiveTeam = useTeamStore((state) => state.setActiveTeam);

    const currentMatchData: Fixture | null = useMemo(() => {
        if (!saveData?.teamId) return null;
        return getNextMatch(saveData.teamId);
    }, [competitions, saveData?.teamId, getNextMatch]);

    const homeTeamKits = useMemo(() => {
        if (!currentMatchData || !saveData || !currentTeam) return null;
        return currentMatchData.homeTeam.id === saveData.teamId
            ? (currentTeam.uniforms as unknown as UniformMap)
            : (currentMatchData.homeTeam.uniforms as unknown as UniformMap);
    }, [currentMatchData, saveData?.teamId, currentTeam]);

    const awayTeamKits = useMemo(() => {
        if (!currentMatchData || !saveData || !currentTeam) return null;
        return currentMatchData.homeTeam.id === saveData.teamId
            ? (currentMatchData.awayTeam.uniforms as unknown as UniformMap)
            : (currentTeam.uniforms as unknown as UniformMap);
    }, [currentMatchData, saveData?.teamId, currentTeam]);

    const suggestedKits = useMemo(() => {
        if (!homeTeamKits || !awayTeamKits) return { homeKit: "home" as const, awayKit: "away" as const };
        return resolveDefaultKits(homeTeamKits, awayTeamKits);
    }, [homeTeamKits, awayTeamKits]);

    const [homeKit, setHomeKit] = useState<"home" | "away" | "third">(suggestedKits.homeKit);
    const [awayKit, setAwayKit] = useState<"home" | "away" | "third">(suggestedKits.awayKit);

    if (!currentTeam || !saveData || !currentMatchData || !homeTeamKits || !awayTeamKits) return null;

    const positionLanguage = getPositionLanguageFromSave(saveData);

    const homeAll = useMemo(
        () => playersByTeamId[currentMatchData.homeTeam.id] ?? [],
        [playersByTeamId, currentMatchData.homeTeam.id],
    );
    const awayAll = useMemo(
        () => playersByTeamId[currentMatchData.awayTeam.id] ?? [],
        [playersByTeamId, currentMatchData.awayTeam.id],
    );

    const homeAiSquad = useMemo(() => selectBestAiMatchdaySquad(homeAll), [homeAll]);
    const awayAiSquad = useMemo(() => selectBestAiMatchdaySquad(awayAll), [awayAll]);

    const rawHomeStarterPlayers: FormationPlayer[] = useMemo(() =>
        homeAiSquad.starters.map(({ id, pos }) => { const p = homeAll.find((x) => x.id === id); return p ? toFormationPlayer(p, pos) : null; }).filter(Boolean) as FormationPlayer[],
        [homeAll, homeAiSquad.starters]);
    const rawAwayStarterPlayers: FormationPlayer[] = useMemo(() =>
        awayAiSquad.starters.map(({ id, pos }) => { const p = awayAll.find((x) => x.id === id); return p ? toFormationPlayer(p, pos) : null; }).filter(Boolean) as FormationPlayer[],
        [awayAll, awayAiSquad.starters]);

    const sortedHomeStarters: FormationPlayer[] = useMemo(() =>
        sortPlayersByFormation(rawHomeStarterPlayers, homeAiSquad.formation),
        [rawHomeStarterPlayers, homeAiSquad.formation]);
    const sortedAwayStarters: FormationPlayer[] = useMemo(() =>
        sortPlayersByFormation(rawAwayStarterPlayers, awayAiSquad.formation),
        [rawAwayStarterPlayers, awayAiSquad.formation]);

    const rawHomeBench = useMemo(() =>
        homeAiSquad.bench.map((id) => { const p = homeAll.find((player) => player.id === id); return p ? toFormationPlayer(p) : null; }).filter(Boolean) as FormationPlayer[],
        [homeAll, homeAiSquad.bench]);
    const rawAwayBench = useMemo(() =>
        awayAiSquad.bench.map((id) => { const p = awayAll.find((player) => player.id === id); return p ? toFormationPlayer(p) : null; }).filter(Boolean) as FormationPlayer[],
        [awayAll, awayAiSquad.bench]);

    const [homeStarterState, setHomeStarterState] = useState<FormationPlayer[]>(sortedHomeStarters);
    const [homeBenchState, setHomeBenchState] = useState<FormationPlayer[]>(rawHomeBench);
    const [awayStarterState, setAwayStarterState] = useState<FormationPlayer[]>(sortedAwayStarters);
    const [awayBenchState, setAwayBenchState] = useState<FormationPlayer[]>(rawAwayBench);
    const [selectedTeamTab, setSelectedTeamTab] = useState<"home" | "away">("home");
    const [playerListTab, setPlayerListTab] = useState<"field" | "bench">("field");
    const [diagramTab, setDiagramTab] = useState<"team" | "formations">("team");
    const [benchEditTarget, setBenchEditTarget] = useState<string | null>(null);
    const [lineupSeedKey, setLineupSeedKey] = useState("");

    useEffect(() => {
        setActiveTeam(saveData.teamId);
    }, [setActiveTeam, saveData.teamId]);

    useEffect(() => {
        const fixtureId = (currentMatchData as { id?: string }).id;
        const fixtureKey = `${fixtureId ?? currentMatchData.date}-${currentMatchData.homeTeam.id}-${currentMatchData.awayTeam.id}`;
        if (lineupSeedKey === fixtureKey) return;

        setHomeFormation(homeAiSquad.formation);
        setAwayFormation(awayAiSquad.formation);
        setHomeStarterState(sortedHomeStarters);
        setAwayStarterState(sortedAwayStarters);
        setHomeBenchState(rawHomeBench);
        setAwayBenchState(rawAwayBench);
        setSubTarget(null);
        setBenchEditTarget(null);
        setLineupSeedKey(fixtureKey);
    }, [
        awayAiSquad.formation,
        currentMatchData.awayTeam.id,
        currentMatchData.date,
        currentMatchData.homeTeam.id,
        homeAiSquad.formation,
        lineupSeedKey,
        rawAwayBench,
        rawHomeBench,
        sortedAwayStarters,
        sortedHomeStarters,
    ]);

    useEffect(() => {
        setBenchEditTarget(null);
    }, [selectedTeamTab, playerListTab]);

    const doSub = useCallback((benchPlayerId: string, starterSlotIndex: number, side: "home" | "away" = "home") => {
        const starters = side === "home" ? homeStarterState : awayStarterState;
        const bench = side === "home" ? homeBenchState : awayBenchState;
        const incoming = bench.find((p) => p.id === benchPlayerId);
        const displaced = starters[starterSlotIndex];
        if (!incoming || !displaced || starterSlotIndex < 0 || starterSlotIndex >= starters.length) return;

        const replacement = applyPlayerPositionFit(incoming, displaced.position);
        const returnedToBench = resetPlayerToNaturalPosition(displaced);
        const newStarters = starters.map((player, index) =>
            index === starterSlotIndex ? replacement : player,
        );
        const nextBench = bench.filter(
            (player) => player.id !== incoming.id && player.id !== displaced.id,
        );

        if (side === "home") {
            setHomeStarterState(newStarters);
            setHomeBenchState([...nextBench, returnedToBench]);
        } else {
            setAwayStarterState(newStarters);
            setAwayBenchState([...nextBench, returnedToBench]);
        }
        setSubTarget(null);
    }, [awayBenchState, awayStarterState, homeBenchState, homeStarterState]);

    const replaceBenchPlayer = useCallback((benchPlayerId: string, incomingPlayerId: string, side: "home" | "away" = "home") => {
        const allPlayers = side === "home" ? homeAll : awayAll;
        const starters = side === "home" ? homeStarterState : awayStarterState;
        const bench = side === "home" ? homeBenchState : awayBenchState;
        const starterIds = new Set(starters.map((player) => player.id));
        const benchIds = new Set(bench.map((player) => player.id));
        const incoming = allPlayers.find((player) => player.id === incomingPlayerId);

        if (!incoming || starterIds.has(incoming.id) || benchIds.has(incoming.id)) return;

        const nextBench = bench.map((player) =>
            player.id === benchPlayerId ? toFormationPlayer(incoming) : player,
        );

        if (side === "home") {
            setHomeBenchState(nextBench);
        } else {
            setAwayBenchState(nextBench);
        }

        setBenchEditTarget(null);
    }, [awayAll, awayBenchState, awayStarterState, homeAll, homeBenchState, homeStarterState]);

    const swapStarterSlots = useCallback((fromSlotIndex: number, toSlotIndex: number, side: "home" | "away" = "home") => {
        const update = (players: FormationPlayer[]) => {
            if (
                fromSlotIndex === toSlotIndex ||
                fromSlotIndex < 0 ||
                toSlotIndex < 0 ||
                fromSlotIndex >= players.length ||
                toSlotIndex >= players.length
            ) {
                return players;
            }

            const next = [...players];
            const fromPlayer = next[fromSlotIndex];
            const toPlayer = next[toSlotIndex];
            next[fromSlotIndex] = applyPlayerPositionFit(toPlayer, fromPlayer.position);
            next[toSlotIndex] = applyPlayerPositionFit(fromPlayer, toPlayer.position);
            return next;
        };

        if (side === "home") {
            setHomeStarterState(update);
        } else {
            setAwayStarterState(update);
        }
    }, []);

    const changeFormation = useCallback((side: "home" | "away", nextFormation: string) => {
        if (!POSITION_LABEL_MAP[nextFormation]) return;

        if (side === "home") {
            setHomeFormation(nextFormation);
            setHomeStarterState((players) => remapStartersToFormation(players, nextFormation));
        } else {
            setAwayFormation(nextFormation);
            setAwayStarterState((players) => remapStartersToFormation(players, nextFormation));
        }

        setSubTarget(null);
        setPlayerListTab("field");
        setBenchEditTarget(null);
    }, []);

    const homeLabels = POSITION_LABEL_MAP[homeFormation] ?? POSITION_LABEL_MAP["4-3-3"];
    const awayLabels = POSITION_LABEL_MAP[awayFormation] ?? POSITION_LABEL_MAP["4-3-3"];

    const homeOverall = useMemo(() => calcFormationOverall(homeStarterState), [homeStarterState]);
    const awayOverall = useMemo(() => calcFormationOverall(awayStarterState), [awayStarterState]);

    const homeLineupPlayers = useMemo(
        () => applyStarterSlotPositions(homeAll, homeStarterState),
        [homeAll, homeStarterState],
    );
    const awayLineupPlayers = useMemo(
        () => applyStarterSlotPositions(awayAll, awayStarterState),
        [awayAll, awayStarterState],
    );

    const lineupData = {
        "formation": homeFormation,
        "home_team": {
            "formation": homeFormation,
            "players": homeLineupPlayers,
            "starters": homeStarterState.map(p => p.id),
            "bench": homeBenchState.map(p => p.id),
        },
        "away_team": {
            "formation": awayFormation,
            "players": awayLineupPlayers,
            "starters": awayStarterState.map(p => p.id),
            "bench": awayBenchState.map((p) => p.id),
        },
    };

    const selectedTeamId = saveData.teamId;
    const isHomeGame = currentMatchData.homeTeam.id === selectedTeamId;
    const opponent = isHomeGame ? currentMatchData.awayTeam : currentMatchData.homeTeam;
    const formattedRound = !isNaN(Number(currentMatchData.round)) ? `Rodada ${currentMatchData.round}` : currentMatchData.round;
    const matchInfo = {
        competition: currentMatchData.competition.short_name,
        round: formattedRound,
        stadiumName: currentMatchData.venue.short_name,
        opponent: opponent,
        date: currentMatchData.date,
        time: currentMatchData.time,
        referee: currentMatchData.referee,
    };

    const isTeamColorBlack = currentTeam.colors.primary[500] === "#000" || currentTeam.colors.primary[500] === "#000000";
    const isTeamColorBlackOrWhite = isTeamColorBlack || currentTeam.colors.primary[500] === "#fff" || currentTeam.colors.primary[500] === "#ffffff";
    const hasVisualConflict = checkKitConflict(homeTeamKits[homeKit] as Uniform, awayTeamKits[awayKit] as Uniform);

    const activeFormation = selectedTeamTab === "home" ? homeFormation : awayFormation;
    const activeStarters = selectedTeamTab === "home" ? homeStarterState : awayStarterState;
    const activeBench = selectedTeamTab === "home" ? homeBenchState : awayBenchState;
    const activeAllPlayers = selectedTeamTab === "home" ? homeAll : awayAll;
    const activeLabels = selectedTeamTab === "home" ? homeLabels : awayLabels;
    const activeTeamColor = selectedTeamTab === "home"
        ? (isTeamColorBlackOrWhite ? "#666" : currentTeam.colors.primary[600])
        : "#888";
    const activeOverall = selectedTeamTab === "home" ? homeOverall : awayOverall;
    const overallTextColor = getOverallColorStyles(activeOverall).color;

    const activeTeamId = selectedTeamTab === "home" ? currentMatchData.homeTeam.id : currentMatchData.awayTeam.id;
    const isCareerTeamTab = activeTeamId === saveData.teamId;
    const activeSide = selectedTeamTab;
    const activeMatchdayIds = new Set([
        ...activeStarters.map((player) => player.id),
        ...activeBench.map((player) => player.id),
    ]);
    const activeAvailableBenchPool = activeAllPlayers
        .filter((player) => !activeMatchdayIds.has(player.id))
        .slice()
        .sort((a, b) => {
            const injuryDiff = Number(Boolean(a.runtime.injury)) - Number(Boolean(b.runtime.injury));
            if (injuryDiff !== 0) return injuryDiff;
            const conditionDiff = (b.runtime.condition ?? 100) - (a.runtime.condition ?? 100);
            if (conditionDiff !== 0) return conditionDiff;
            return (b.technical_profile.overall ?? 0) - (a.technical_profile.overall ?? 0);
        })
        .map((player) => toFormationPlayer(player));
    const drawerPlayer = useMemo(() => {
        if (!drawerPlayerId) return null;
        const runtimePlayer = (playersByTeamId[saveData.teamId] ?? []).find(
            (player) => player.id === drawerPlayerId && player.team_id === saveData.teamId,
        );
        return runtimePlayer ?? null;
    }, [drawerPlayerId, playersByTeamId, saveData.teamId]);
    const selectedSubSlot = subTarget?.startsWith(`${activeSide}-`)
        ? Number(subTarget.split("-")[1])
        : null;
    const selectedSubPlayer = selectedSubSlot !== null && Number.isFinite(selectedSubSlot)
        ? activeStarters[selectedSubSlot]
        : null;

    const teamAverages = useMemo(() => {
        if (!activeStarters || activeStarters.length === 0) {
            return { condition: 0, match_fitness: 0, overall: 0 };
        }

        const count = activeStarters.length;

        const totals = activeStarters.reduce(
            (acc, player) => {
                acc.condition += player.condition;
                acc.match_fitness += player.match_fitness;
                acc.overall += player.overall;
                return acc;
            },
            { condition: 0, match_fitness: 0, overall: 0 }
        );

        return {
            condition: Math.round(totals.condition / count),
            match_fitness: Math.round(totals.match_fitness / count),
            overall: Math.round(totals.overall / count),
        };
    }, [activeStarters]);

    if (isSimulating) {
        return (
            <MatchSimulation
                homeTeam={{ data: currentMatchData.homeTeam, kit: homeTeamKits[homeKit]! }}
                awayTeam={{ data: currentMatchData.awayTeam, kit: awayTeamKits[awayKit]! }}
                matchInfo={{
                    "match_id": currentMatchData.id,
                    "matchinfo": {
                        "date": currentMatchData.date,
                        "stadium": currentMatchData.venue.short_name
                    },
                    "lineup": lineupData
                }}
                userTeamId={saveData.teamId}
                language={positionLanguage}
                onLiveScoreChange={(score) =>
                    updateLiveMatchScore(currentMatchData.competition.id, currentMatchData.id, score)
                }
                onFinishMatch={(finalState) => {
                    if (finalState) {
                        updateMatchResult(currentMatchData.competition.id, currentMatchData.id, {
                            home: finalState.homeScore,
                            away: finalState.awayScore,
                        }, buildFinishedMatchDetails(finalState));
                    } else {
                        clearLiveMatchScore(currentMatchData.id);
                    }
                    setIsSimulating(false);
                }}
            />
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative h-full w-full overflow-hidden">
            <main className="h-full w-full grid grid-cols-12 grid-rows-8 gap-4 overflow-hidden">
                <div className="absolute -z-1 inset-0 brightness-10 pointer-events-none">
                    <img
                        src={currentMatchData.competition.bg_art}
                        alt=""
                        className="w-full h-full object-cover object-center"
                    />
                </div>
                <header className="col-span-12 row-span-1 bg-[#111]/50 rounded-4xl border border-white/5 flex justify-between items-center px-10">
                    <div className="flex flex-1 min-w-0 items-start flex-col h-full min-h-0">
                        <div className="flex justify-center items-center min-h-0 h-full">
                            <img src={currentMatchData.competition.icon} alt="" className="w-auto h-[60%] min-h-0" />
                            <div className="flex flex-col justify-center ml-4">
                                <span className="text-xs leading-none font-bold uppercase text-white">
                                    {matchInfo.round}
                                </span>
                                <span className={`text-3xl leading-none font-oswald font-bold uppercase  ${isTeamColorBlack ? "text-white" : "text-(--team-color-400)"}`}>
                                    {matchInfo.competition}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col h-full justify-center items-center">
                        <div className="flex h-full justify-center items-center gap-4 flex-1">
                            <img src={currentMatchData.homeTeam.logo} className="w-auto h-[60%] min-h-0" />
                            <span className="font-oswald text-3xl">X</span>
                            <img src={currentMatchData.awayTeam.logo} className="w-auto h-[60%] min-h-0" />
                        </div>
                    </div>
                    <div className="flex flex-1 justify-end">
                        <button
                            onClick={() => setIsSimulating(true)}
                            className={`min-w-0 cursor-pointer ${isTeamColorBlackOrWhite ? "bg-white/10 hover:bg-white/20" : "bg-(--team-color-600) hover:bg-(--team-color-700)"} text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 group`}
                        >
                            JOGAR PARTIDA
                            <span className="group-hover:translate-x-1 transition-transform"><ChevronRIcon /></span>
                        </button>
                    </div>
                </header>

                <section className="col-span-9 row-span-7 flex flex-col gap-4 overflow-hidden">
                    <div className="h-14 shrink-0 bg-[#111]/50 rounded-3xl border border-white/5 p-1.5 flex gap-2">
                        {[{ id: "lineup", label: "Escalações" }, { id: "stats", label: "Detalhes" }].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? (isTeamColorBlackOrWhite ? "bg-white/10 text-white border border-white/10" : "bg-(--team-color-600) text-white") : "text-gray-500 hover:text-gray-300 cursor-pointer"}`} type="button">
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 bg-[#111]/50 rounded-4xl border border-white/5 p-4 flex flex-col overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeTab === "lineup" && (
                                <motion.div key="lineup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col overflow-hidden">
                                    <div className="shrink-0 flex justify-between items-center gap-3 mb-3 pb-3 border-b border-white/5">
                                        <div className="flex flex-1 min-w-0 gap-2 bg-white/5 rounded-xl p-0.5">
                                            {[currentMatchData.homeTeam, currentMatchData.awayTeam].map((teamObj, i) => {
                                                const teamStatus = i === 0 ? "home" : "away";
                                                return (
                                                    <button
                                                        key={teamObj.name + i}
                                                        onClick={() => {
                                                            if (selectedTeamTab !== teamStatus) setSelectedTeamTab(teamStatus)
                                                            if (isCareerTeamTab) setDiagramTab("team")
                                                        }}
                                                        className={`truncate font-oswald flex-1 py-2 rounded-[10px] text-md font-bold transition-all ${selectedTeamTab === teamStatus ? "bg-white text-black" : "text-gray-400 hover:text-white cursor-pointer"}`}
                                                        type="button"
                                                    >
                                                        {teamObj.name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="flex flex-1 shrink-0 min-w-0 justify-center items-center gap-2">
                                            <span className="text-md font-oswald uppercase text-white/65">{activeFormation}</span>
                                            <span className="font-oswald text-white/30">—</span>
                                            <span className={`text-md font-black font-oswald ${overallTextColor}`}>{activeOverall} OVR</span>
                                        </div>
                                        <div className={`${isCareerTeamTab ? "" : "pointer-events-none opacity-30"} transition flex flex-1 min-w-0 gap-2 bg-white/5 rounded-xl p-0.5`}>
                                            {["Equipe", "Formações"].map((tabName, i) => {
                                                const teamStatus = i === 0 ? "team" : "formations";
                                                return (
                                                    <button
                                                        key={tabName + i}
                                                        disabled={!isCareerTeamTab}
                                                        onClick={() => setDiagramTab(teamStatus)}
                                                        className={`truncate font-oswald flex-1 py-2 rounded-[10px] text-md font-bold transition-all ${diagramTab === teamStatus ? "bg-white text-black" : "text-gray-400 hover:text-white cursor-pointer"}`}
                                                        type="button"
                                                    >
                                                        {tabName}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                                        <div className="flex-1 min-w-45 flex flex-col overflow-hidden shrink-0">
                                            <div className="shrink-0 flex gap-1 mb-2">
                                                <button
                                                    onClick={() => setPlayerListTab("field")}
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${playerListTab === "field" ? (isTeamColorBlackOrWhite ? "bg-white/15 text-white" : "bg-(--team-color-600) text-white") : "text-gray-500 hover:text-gray-300 bg-white/5 cursor-pointer"}`}
                                                    type="button"
                                                >
                                                    Em campo
                                                </button>
                                                <button
                                                    onClick={() => setPlayerListTab("bench")}
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${playerListTab === "bench" ? (isTeamColorBlackOrWhite ? "bg-white/15 text-white" : "bg-(--team-color-600) text-white") : "text-gray-500 hover:text-gray-300 bg-white/5 cursor-pointer"}`}
                                                    type="button"
                                                >
                                                    Banco
                                                </button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
                                                {playerListTab === "field" && (
                                                    <MatchdayPlayerList
                                                        mode="field"
                                                        players={activeStarters}
                                                        labels={activeLabels}
                                                        side={activeSide}
                                                        canEdit={isCareerTeamTab}
                                                        positionLanguage={positionLanguage}
                                                        subTarget={subTarget}
                                                        benchEditTarget={benchEditTarget}
                                                        substitutionOptions={activeBench}
                                                        relationOptions={activeAvailableBenchPool}
                                                        onToggleSubTarget={setSubTarget}
                                                        onToggleBenchTarget={setBenchEditTarget}
                                                        onSubstitute={doSub}
                                                        onReplaceBenchPlayer={replaceBenchPlayer}
                                                        onPlayerContextMenu={(_, player) => {
                                                            setDrawerPlayerId(player.id);
                                                        }}
                                                    />
                                                )}
                                                {playerListTab === "bench" && (
                                                    <MatchdayPlayerList
                                                        mode="bench"
                                                        players={activeBench}
                                                        side={activeSide}
                                                        canEdit={isCareerTeamTab}
                                                        positionLanguage={positionLanguage}
                                                        subTarget={subTarget}
                                                        benchEditTarget={benchEditTarget}
                                                        substitutionOptions={activeBench}
                                                        relationOptions={activeAvailableBenchPool}
                                                        onToggleSubTarget={setSubTarget}
                                                        onToggleBenchTarget={setBenchEditTarget}
                                                        onSubstitute={doSub}
                                                        onReplaceBenchPlayer={replaceBenchPlayer}
                                                        onPlayerContextMenu={(_, player) => {
                                                            setDrawerPlayerId(player.id);
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            {playerListTab === "field" && activeBench.length > 0 && (
                                                <div className="flex justify-evenly items-center text-lg font-oswald shrink-0 pt-3 border-t border-white/5">
                                                    <span className="flex items-center gap-1">
                                                        <EnergyIcon className="w-5 h-5" />
                                                        <p>{teamAverages.condition}</p>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <p>{teamAverages.overall} OVR</p>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <p>{teamAverages.match_fitness}</p>
                                                        <DiamondIcon className="w-5 h-5" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl bg-black/10">
                                            <FormationDiagram
                                                key={selectedTeamTab}
                                                formation={activeFormation}
                                                players={activeStarters}
                                                primaryColor={activeTeamColor}
                                                interactive={isCareerTeamTab && diagramTab === "team"}
                                                selectedSlotIndex={diagramTab === "team" ? selectedSubSlot : null}
                                                onPlayerClick={(slotIndex) => {
                                                    if (!isCareerTeamTab || diagramTab !== "team") return;
                                                    const subKey = `${activeSide}-${slotIndex}`;
                                                    setSubTarget((current) => current === subKey ? null : subKey);
                                                    setPlayerListTab("field");
                                                }}
                                                onPlayerContextMenu={(_, player) => {
                                                    if (!isCareerTeamTab || diagramTab !== "team") return;
                                                    setDrawerPlayerId(player.id);
                                                }}
                                                onSwapSlots={(fromSlotIndex, toSlotIndex) => {
                                                    if (!isCareerTeamTab || diagramTab !== "team") return;
                                                    swapStarterSlots(fromSlotIndex, toSlotIndex, activeSide);
                                                    setSubTarget(null);
                                                }}
                                                language={positionLanguage}
                                            />

                                            <AnimatePresence>
                                                {diagramTab === "formations" && (
                                                    <motion.div
                                                        key="formation-library"
                                                        initial={{ opacity: 0, y: 8, scale: 0.985 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 8, scale: 0.985 }}
                                                        className="absolute inset-3 z-30 overflow-y-auto rounded-2xl border border-white/10 bg-[#090909]/72 p-3 pt-14 shadow-2xl shadow-black/50 backdrop-blur-md"
                                                    >
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {FORMATION_OPTIONS.filter((formation) => FORMATIONS[formation]).map((formation) => (
                                                                <MiniFormationCard
                                                                    key={formation}
                                                                    formation={formation}
                                                                    active={activeFormation === formation}
                                                                    disabled={!isCareerTeamTab}
                                                                    primaryColor={activeTeamColor}
                                                                    onSelect={() => {
                                                                        if (!isCareerTeamTab) return;
                                                                        changeFormation(activeSide, formation);
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            {isCareerTeamTab && selectedSubSlot !== null && selectedSubPlayer && (
                                                <div className="absolute inset-x-4 bottom-4 z-20 max-h-[46%] rounded-3xl border border-white/10 bg-[#090909]/96 p-4 shadow-2xl shadow-black/60 backdrop-blur-md">
                                                    <div className="mb-3 flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Substituir em campo</p>
                                                            <p className="truncate text-sm font-black text-white">
                                                                <span className="text-white/45">#{selectedSubPlayer.number}</span> {selectedSubPlayer.name}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => setSubTarget(null)}
                                                            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-xl bg-white/10 text-[11px] font-black text-white transition hover:bg-white/20"
                                                            type="button"
                                                        >
                                                            <CloseIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    {activeBench.length === 0 ? (
                                                        <p className="rounded-2xl bg-white/[0.035] px-3 py-4 text-[10px] font-bold text-gray-500">Banco vazio</p>
                                                    ) : (
                                                        <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1">
                                                            {sortOptionsForTarget(activeBench, selectedSubPlayer.position).map((benchPlayer) => (
                                                                <button
                                                                    key={benchPlayer.id}
                                                                    onClick={() => doSub(benchPlayer.id, selectedSubSlot, activeSide)}
                                                                    className="flex min-w-0 cursor-pointer items-center gap-2 rounded-2xl bg-white/4 p-2.5 text-left transition hover:bg-white/12 active:scale-[0.98]"
                                                                    type="button"
                                                                >
                                                                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                                                                        {benchPlayer.photo_url ? (
                                                                            <img src={benchPlayer.photo_url} alt="" className="h-full w-full object-cover" />
                                                                        ) : (
                                                                            <div className="flex h-full w-full items-center justify-center text-[9px] font-black text-white/50">
                                                                                {benchPlayer.number}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-[10px] font-black leading-tight text-white">
                                                                            <span className="text-white/45">#{benchPlayer.number}</span> {benchPlayer.name}
                                                                        </p>
                                                                        <p className="mt-1 text-[8px] font-black uppercase text-gray-500">{formatPosition(benchPlayer.position, positionLanguage)}</p>
                                                                    </div>
                                                                    <span className={`shrink-0 text-[13px] font-black ${getOverallColorStyles(benchPlayer.overall).color}`}>
                                                                        {benchPlayer.overall}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === "stats" && (
                                <MatchDetails
                                    awayKit={awayKit}
                                    awayTeamKits={awayTeamKits}
                                    currentMatchData={currentMatchData}
                                    hasVisualConflict={hasVisualConflict}
                                    homeKit={homeKit}
                                    homeTeamKits={homeTeamKits}
                                    isTeamColorBlack={isTeamColorBlack}
                                    setAwayKit={setAwayKit}
                                    setHomeKit={setHomeKit}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </section>
                <section className="col-span-3 row-span-7 flex flex-col gap-4 overflow-hidden">
                    <CompetitionTable saveData={saveData} translucent opponentId={matchInfo.opponent.id} />
                    <div className="bg-[#111]/50 rounded-4xl text-gray-200 border border-white/5 p-5 flex flex-col h-32 shrink-0 justify-center">
                        <p className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 pb-0.5" />
                            <span className="font-oswald">{formatDynamicDate(matchInfo.date, "br", 3)} - {matchInfo.time}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <WhistleIcon className="w-5 h-5 pb-0.5" />
                            <span className="font-oswald">{matchInfo.referee?.fullName ?? "Arbitragem a definir"}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            {isHomeGame ? <StadiumIcon className="w-5 h-5 pb-0.5" /> : <FlightIcon className="w-5 h-5 pb-0.5" />}
                            <span className="font-oswald">{matchInfo.stadiumName}</span>
                            <span className="font-oswald">-</span>
                            <span className="font-oswald">25.602</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <CloudsIcon className="w-5 h-5 pb-0.5" />
                            <span className="font-oswald">Nublado - 28°C</span>
                        </p>
                    </div>
                </section>
            </main>
            <AnimatePresence>
                {drawerPlayer && (
                    <PlayerDrawer
                        key={drawerPlayer.id}
                        player={drawerPlayer}
                        isTeamColorBlackOrWhite={isTeamColorBlackOrWhite}
                        language={positionLanguage}
                        onClose={() => setDrawerPlayerId(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Matchday;
