import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRIcon } from "../../icons/ChevronR";
import { useCareerStore } from "../../store/useCareerStore";
import CompetitionTable from "../../components/DashboardWidgets/CompetitionTable";
import { useCompetitionsStore } from "../../store/useCompetitionsStore";
import MatchSimulation from "../../components/MatchEngine/MatchSimulation";
import FormationDiagram, { FormationPlayer, sortPlayersByFormation } from "../../components/MatchEngine/FormationDiagram";
import { FORMATIONS } from "../../components/MatchEngine/Engine";
import { getTeamSquadPlayers } from "../../data/teamSquads";
import { BasePlayer, RuntimePlayer, useTeamStore } from "../../store/useTeamStore";
import PlayerDrawer from "../Squad/PlayerDrawer";
import { StadiumIcon } from "../../icons/Stadium";
import { FlightIcon } from "../../icons/Flight";
import { CloudsIcon } from "../../icons/Clouds";
import { WhistleIcon } from "../../icons/Whistle";
import { CalendarIcon } from "../../icons/Calendar";
import { formatDynamicDate } from "../../utils/formatDynamicDate";
import MatchDetails from "./MatchDetails";

function groupLine(pos: string): string {
    switch (pos) {
        case "GK": return "GK";
        case "CB": case "RB": case "LB": case "RWB": case "LWB": return "DF";
        case "CDM": case "CM": case "CAM": case "RM": case "LM": return "MF";
        case "RW": case "LW": case "ST": case "CF": case "SS": return "FW";
        default: return "MF";
    }
}

function calcOverall(players: any[], starterIds: Set<string>): number {
    const matched = players.filter((p: any) => p?.id && starterIds.has(p.id));
    if (matched.length === 0) return 0;
    const sum = matched.reduce((s: number, p: any) => s + (p.technical_profile?.overall ?? 60), 0);
    return Math.round(sum / matched.length);
}

const POSITION_LABEL_MAP: Record<string, string[]> = {
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

const POSITION_ROLE_PRIORITY: Record<string, string[]> = {
    GOL: ["GK"],
    LD: ["RB", "RWB", "CB"],
    LE: ["LB", "LWB", "CB"],
    ZG: ["CB", "RB", "LB", "CDM"],
    AD: ["RWB", "RB", "RM"],
    AE: ["LWB", "LB", "LM"],
    V: ["CDM", "CM", "CB"],
    V1: ["CDM", "CM"],
    V2: ["CDM", "CM"],
    MD: ["RM", "RW", "CM", "RB"],
    ME: ["LM", "LW", "CM", "LB"],
    MC: ["CM", "CDM", "CAM"],
    MO: ["CAM", "CM", "CF"],
    PD: ["RW", "RM", "ST"],
    PE: ["LW", "LM", "ST"],
    CA: ["ST", "CF", "SS"],
    AT: ["ST", "CF", "SS", "LW", "RW"],
};

const POSITION_SLOT_ROLE: Record<string, string> = {
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

const FORMATION_OPTIONS = [
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

function roleFitsPosition(label: string, playerPosition: string): boolean {
    return (POSITION_ROLE_PRIORITY[label] ?? [playerPosition]).includes(playerPosition);
}

function selectStarterRoles(players: any[], formation: string): { id: string, pos: string }[] {
    const labels = POSITION_LABEL_MAP[formation] ?? POSITION_LABEL_MAP["4-3-3"];
    const available = players
        .filter((player) => player?.id)
        .sort((a, b) => (b.technical_profile?.overall ?? 0) - (a.technical_profile?.overall ?? 0));
    const used = new Set<string>();

    return labels
        .map((label) => {
            const exact = available.find((player) => {
                const position = player.technical_profile?.best_position ?? "CM";
                return !used.has(player.id) && roleFitsPosition(label, position);
            });
            const fallback = available.find((player) => !used.has(player.id));
            const selected = exact ?? fallback;
            if (!selected) return null;
            used.add(selected.id);
            return {
                id: selected.id,
                pos: POSITION_SLOT_ROLE[label] ?? selected.technical_profile?.best_position ?? "CM",
            };
        })
        .filter(Boolean) as { id: string, pos: string }[];
}

function lineColor(line: string): string {
    switch (line) {
        case "GK": return "bg-amber-400";
        case "DF": return "bg-sky-500";
        case "MF": return "bg-emerald-500";
        case "FW": return "bg-rose-500";
        default: return "bg-gray-400";
    }
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

function toFormationPlayer(p: any, pos?: string): FormationPlayer {
    return {
        id: p.id,
        name: p.personal?.short_name ?? "Jogador",
        number: p.contract?.kit_number ?? 0,
        position: pos ?? p.technical_profile?.best_position ?? "N/A",
        photo_url: p.personal?.photo_url ?? "",
    };
}

function makeMatchdayRuntimePlayer(player: BasePlayer, index: number): RuntimePlayer {
    const seed = player.id.split("").reduce((total, char) => total + char.charCodeAt(0), 0) + index;
    return {
        ...player,
        runtime: {
            matchFitness: 72 + (seed % 24),
            condition: 68 + (seed % 28),
            ckRisk: 18 + (seed % 62),
            form: ((seed % 5) + 1) as RuntimePlayer["runtime"]["form"],
            isLoanListed: false,
            hasUnreadMessage: false,
            injury: null,
            seasonStats: {
                matches: 0,
                rating: 0,
                goals: 0,
                assists: 0,
                tackles: 0,
                passesCompleted: 0,
                saves: 0,
                cleanSheets: 0,
            },
        },
    };
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
    return players.map((player, index) => ({
        ...player,
        position: roleForFormationSlot(formation, index, player.position),
    }));
}

function applyStarterSlotPositions(players: any[], starters: FormationPlayer[]): any[] {
    const slotById = new Map(starters.map((player) => [player.id, player.position]));

    return players.map((player) => {
        const slotPosition = slotById.get(player.id);
        if (!slotPosition) return player;

        return {
            ...player,
            position: slotPosition,
            technical_profile: {
                ...player.technical_profile,
                best_position: slotPosition,
            },
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
    const runtimePlayers = useTeamStore((state) => state.players);
    const hydrateTeam = useTeamStore((state) => state.hydrateTeam);

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

    const homeAll = useMemo(() => getTeamSquadPlayers(currentMatchData.homeTeam.id), [currentMatchData.homeTeam.id]);
    const awayAll = useMemo(() => getTeamSquadPlayers(currentMatchData.awayTeam.id), [currentMatchData.awayTeam.id]);

    const rawHomeStarters = useMemo(() => selectStarterRoles(homeAll, homeFormation), [homeAll, homeFormation]);
    const rawAwayStarters = useMemo(() => selectStarterRoles(awayAll, awayFormation), [awayAll, awayFormation]);

    const rawHomeStarterPlayers: FormationPlayer[] = useMemo(() =>
        rawHomeStarters.map(({ id, pos }) => { const p = homeAll.find((x) => x.id === id); return p ? toFormationPlayer(p, pos) : null; }).filter(Boolean) as FormationPlayer[],
        [homeAll, rawHomeStarters]);
    const rawAwayStarterPlayers: FormationPlayer[] = useMemo(() =>
        rawAwayStarters.map(({ id, pos }) => { const p = awayAll.find((x) => x.id === id); return p ? toFormationPlayer(p, pos) : null; }).filter(Boolean) as FormationPlayer[],
        [awayAll, rawAwayStarters]);

    const sortedHomeStarters: FormationPlayer[] = useMemo(() =>
        sortPlayersByFormation(rawHomeStarterPlayers, homeFormation),
        [rawHomeStarterPlayers, homeFormation]);
    const sortedAwayStarters: FormationPlayer[] = useMemo(() =>
        sortPlayersByFormation(rawAwayStarterPlayers, awayFormation),
        [rawAwayStarterPlayers, awayFormation]);

    const homeStarterIds = useMemo(() => new Set(sortedHomeStarters.map((p) => p.id)), [sortedHomeStarters]);
    const awayStarterIds = useMemo(() => new Set(sortedAwayStarters.map((p) => p.id)), [sortedAwayStarters]);

    const rawHomeBench = useMemo(() =>
        homeAll.filter((p: any) => !homeStarterIds.has(p.id)).slice(0, 7).map((p) => toFormationPlayer(p)),
        [homeAll, homeStarterIds]);
    const rawAwayBench = useMemo(() =>
        awayAll.filter((p: any) => !awayStarterIds.has(p.id)).slice(0, 7).map((p) => toFormationPlayer(p)),
        [awayAll, awayStarterIds]);

    const [homeStarterState, setHomeStarterState] = useState<FormationPlayer[]>(sortedHomeStarters);
    const [homeBenchState, setHomeBenchState] = useState<FormationPlayer[]>(rawHomeBench);
    const [awayStarterState, setAwayStarterState] = useState<FormationPlayer[]>(sortedAwayStarters);
    const [awayBenchState, setAwayBenchState] = useState<FormationPlayer[]>(rawAwayBench);
    const [selectedTeamTab, setSelectedTeamTab] = useState<"home" | "away">("home");
    const [playerListTab, setPlayerListTab] = useState<"field" | "bench">("field");
    const [diagramTab, setDiagramTab] = useState<"team" | "formations">("team");

    useEffect(() => {
        const isRuntimeTeamLoaded =
            runtimePlayers.length > 0 &&
            runtimePlayers.every((player) => player.team_id === saveData.teamId);

        if (!isRuntimeTeamLoaded) {
            hydrateTeam(getTeamSquadPlayers(saveData.teamId) as BasePlayer[]);
        }
    }, [hydrateTeam, runtimePlayers, saveData.teamId]);

    const doSub = useCallback((benchPlayerId: string, starterSlotIndex: number, side: "home" | "away" = "home") => {
        const starters = side === "home" ? homeStarterState : awayStarterState;
        const bench = side === "home" ? homeBenchState : awayBenchState;
        const incoming = bench.find((p) => p.id === benchPlayerId);
        const displaced = starters[starterSlotIndex];
        if (!incoming || !displaced || starterSlotIndex < 0 || starterSlotIndex >= starters.length) return;

        const replacement: FormationPlayer = {
            ...incoming,
            position: displaced.position,
        };
        const newStarters = starters.map((player, index) =>
            index === starterSlotIndex ? replacement : player,
        );
        const nextBench = bench.filter(
            (player) => player.id !== incoming.id && player.id !== displaced.id,
        );

        if (side === "home") {
            setHomeStarterState(newStarters);
            setHomeBenchState([...nextBench, displaced]);
        } else {
            setAwayStarterState(newStarters);
            setAwayBenchState([...nextBench, displaced]);
        }
        setSubTarget(null);
    }, [awayBenchState, awayStarterState, homeBenchState, homeStarterState]);

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
            next[fromSlotIndex] = { ...toPlayer, position: fromPlayer.position };
            next[toSlotIndex] = { ...fromPlayer, position: toPlayer.position };
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
    }, []);

    const sortedStarterIds = useMemo(() => homeStarterState.map((p) => p.id), [homeStarterState]);
    const awaySortedStarterIds = useMemo(() => awayStarterState.map((p) => p.id), [awayStarterState]);

    const homeLabels = POSITION_LABEL_MAP[homeFormation] ?? POSITION_LABEL_MAP["4-3-3"];
    const awayLabels = POSITION_LABEL_MAP[awayFormation] ?? POSITION_LABEL_MAP["4-3-3"];

    const homeOverall = useMemo(() => {
        const ids = new Set(sortedStarterIds);
        return calcOverall(homeAll, ids);
    }, [homeAll, sortedStarterIds]);

    const awayOverall = useMemo(() => {
        return calcOverall(awayAll, new Set(awaySortedStarterIds));
    }, [awayAll, awaySortedStarterIds]);

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
    };

    const isTeamColorBlack = currentTeam.colors.primary[500] === "#000" || currentTeam.colors.primary[500] === "#000000";
    const isTeamColorBlackOrWhite = isTeamColorBlack || currentTeam.colors.primary[500] === "#fff" || currentTeam.colors.primary[500] === "#ffffff";
    const hasVisualConflict = checkKitConflict(homeTeamKits[homeKit] as Uniform, awayTeamKits[awayKit] as Uniform);

    const activeFormation = selectedTeamTab === "home" ? homeFormation : awayFormation;
    const activeStarters = selectedTeamTab === "home" ? homeStarterState : awayStarterState;
    const activeBench = selectedTeamTab === "home" ? homeBenchState : awayBenchState;
    const activeLabels = selectedTeamTab === "home" ? homeLabels : awayLabels;
    const activeTeamColor = selectedTeamTab === "home"
        ? (isTeamColorBlackOrWhite ? "#666" : currentTeam.colors.primary[600])
        : "#888";
    const activeOverall = selectedTeamTab === "home" ? homeOverall : awayOverall;
    const overallTextColor = activeOverall >= 90 ? "text-purple-500" : activeOverall >= 80 ? "text-blue-500" : activeOverall >= 70 ? "text-green-500" : activeOverall >= 60 ? "text-yellow-400" : "text-orange-500"

    const activeTeamId = selectedTeamTab === "home" ? currentMatchData.homeTeam.id : currentMatchData.awayTeam.id;
    const isCareerTeamTab = activeTeamId === saveData.teamId;
    const showSubButton = isCareerTeamTab;
    const activeSide = selectedTeamTab;
    const careerBasePlayers = useMemo(() => getTeamSquadPlayers(saveData.teamId), [saveData.teamId]);
    const drawerPlayer = useMemo(() => {
        if (!drawerPlayerId) return null;
        const runtimePlayer = runtimePlayers.find(
            (player) => player.id === drawerPlayerId && player.team_id === saveData.teamId,
        );
        if (runtimePlayer) return runtimePlayer;

        const basePlayer = careerBasePlayers.find((player) => player.id === drawerPlayerId);
        return basePlayer ? makeMatchdayRuntimePlayer(basePlayer as BasePlayer, careerBasePlayers.indexOf(basePlayer)) : null;
    }, [careerBasePlayers, drawerPlayerId, runtimePlayers, saveData.teamId]);
    const selectedSubSlot = subTarget?.startsWith(`${activeSide}-`)
        ? Number(subTarget.split("-")[1])
        : null;
    const selectedSubPlayer = selectedSubSlot !== null && Number.isFinite(selectedSubSlot)
        ? activeStarters[selectedSubSlot]
        : null;

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
                onFinishMatch={() => setIsSimulating(false)}
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
                                            <span className="text-sm font-oswald uppercase text-white/65">{activeFormation}</span>
                                            <span className="font-oswald text-white/30">—</span>
                                            <span className={`text-sm font-black font-oswald ${overallTextColor}`}>{activeOverall} OVR</span>
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
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${playerListTab === "field" ? (isTeamColorBlackOrWhite ? "bg-white/15 text-white" : "bg-(--team-color-600) text-white") : "text-gray-500 hover:text-gray-300 bg-white/5"}`}
                                                    type="button"
                                                >
                                                    Em campo
                                                </button>
                                                <button
                                                    onClick={() => setPlayerListTab("bench")}
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${playerListTab === "bench" ? (isTeamColorBlackOrWhite ? "bg-white/15 text-white" : "bg-(--team-color-600) text-white") : "text-gray-500 hover:text-gray-300 bg-white/5"}`}
                                                    type="button"
                                                >
                                                    Banco ({activeBench.length})
                                                </button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
                                                {playerListTab === "field" && (
                                                    activeStarters.map((player, i) => {
                                                        const label = activeLabels[i] ?? "—";
                                                        const line = groupLine(player.position);
                                                        const subKey = `${activeSide}-${i}`;
                                                        const isTarget = showSubButton && subTarget === subKey;
                                                        return (
                                                            <div key={player.id} className="relative flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/4 hover:bg-white/[0.07] transition-colors">
                                                                <span className={`w-7 shrink-0 text-center text-[8px] font-black uppercase ${line === "GK" ? "text-amber-300" : line === "DF" ? "text-sky-300" : line === "MF" ? "text-emerald-300" : "text-rose-300"}`}>
                                                                    {label}
                                                                </span>
                                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 shrink-0 ring-1 ring-white/20">
                                                                    {player.photo_url ? (
                                                                        <img src={player.photo_url} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className={`w-full h-full flex items-center justify-center text-[8px] font-black ${lineColor(line).replace("bg-", "text-")}`}>
                                                                            {player.number}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="text-[10px] font-bold text-white truncate block leading-tight">
                                                                        #{player.number} {player.name}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[7px] font-black text-white/30 uppercase shrink-0">{player.position}</span>
                                                                {showSubButton && (
                                                                    <button
                                                                        onClick={() => setSubTarget(isTarget ? null : subKey)}
                                                                        className="text-[9px] text-amber-400/80 hover:text-amber-300 font-black shrink-0 cursor-pointer ml-1"
                                                                    >
                                                                        {isTarget ? "✕" : "↻"}
                                                                    </button>
                                                                )}
                                                                {isTarget && (
                                                                    <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-[#222] border border-white/10 rounded-xl p-2 shadow-xl">
                                                                        <p className="text-[8px] font-black uppercase text-gray-500 mb-1 px-1">Substituir por:</p>
                                                                        {activeBench.length === 0 && (
                                                                            <p className="text-[8px] text-gray-500 px-1">Banco vazio</p>
                                                                        )}
                                                                        {activeBench.map((bp) => (
                                                                            <button
                                                                                key={bp.id}
                                                                                onClick={() => doSub(bp.id, i, activeSide)}
                                                                                className="w-full text-left flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 text-[10px] text-white cursor-pointer"
                                                                            >
                                                                                <div className="w-5 h-5 rounded-full overflow-hidden bg-white/10 shrink-0">
                                                                                    {bp.photo_url ? (
                                                                                        <img src={bp.photo_url} alt="" className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center text-[7px] font-black text-white/50">{bp.number}</div>
                                                                                    )}
                                                                                </div>
                                                                                <span className="font-bold">#{bp.number}</span>
                                                                                <span className="truncate flex-1">{bp.name}</span>
                                                                                <span className="text-[7px] font-black uppercase text-white/40">{bp.position}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                                {playerListTab === "bench" && (
                                                    activeBench.length === 0 ? (
                                                        <p className="text-[10px] text-gray-500 text-center py-4">Nenhum reserva</p>
                                                    ) : (
                                                        activeBench.map((player) => {
                                                            const line = groupLine(player.position);
                                                            return (
                                                                <div key={player.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/4 hover:bg-white/[0.07] transition-colors">
                                                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 shrink-0 ring-1 ring-white/20">
                                                                        {player.photo_url ? (
                                                                            <img src={player.photo_url} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className={`w-full h-full flex items-center justify-center text-[8px] font-black bg-white/10`}>
                                                                                {player.number}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-white truncate flex-1">
                                                                        #{player.number} {player.name}
                                                                    </span>
                                                                    <span className={`text-[7px] font-black uppercase shrink-0 ${line === "GK" ? "text-amber-300/50" : line === "DF" ? "text-sky-300/50" : line === "MF" ? "text-emerald-300/50" : "text-rose-300/50"}`}>
                                                                        {player.position}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })
                                                    )
                                                )}
                                            </div>

                                            {playerListTab === "field" && activeBench.length > 0 && (
                                                <div className="shrink-0 mt-2 pt-2 border-t border-white/5">
                                                    <p className="text-[7px] font-black uppercase text-gray-600 tracking-widest mb-1">
                                                        Suplentes ({activeBench.length})
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {activeBench.slice(0, 5).map((p) => (
                                                            <span key={p.id} className="text-[7px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded-md whitespace-nowrap flex items-center gap-1">
                                                                <div className="w-3 h-3 rounded-full overflow-hidden bg-white/10 shrink-0">
                                                                    {p.photo_url ? (
                                                                        <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-[5px] font-black text-white/50">{p.number}</div>
                                                                    )}
                                                                </div>
                                                                <span>#{p.number}</span>
                                                            </span>
                                                        ))}
                                                        {activeBench.length > 5 && (
                                                            <span className="text-[7px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-md">+{activeBench.length - 5}</span>
                                                        )}
                                                    </div>
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
                                                <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-white/10 bg-[#090909]/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-md">
                                                    <div className="mb-2 flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Substituir</p>
                                                            <p className="truncate text-[11px] font-black text-white">
                                                                #{selectedSubPlayer.number} {selectedSubPlayer.name}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => setSubTarget(null)}
                                                            className="h-7 w-7 shrink-0 cursor-pointer rounded-full bg-white/10 text-[10px] font-black text-white hover:bg-white/20"
                                                            type="button"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                    <div className="flex max-h-24 gap-2 overflow-x-auto pb-1">
                                                        {activeBench.length === 0 ? (
                                                            <p className="text-[10px] text-gray-500">Banco vazio</p>
                                                        ) : (
                                                            activeBench.map((benchPlayer) => (
                                                                <button
                                                                    key={benchPlayer.id}
                                                                    onClick={() => doSub(benchPlayer.id, selectedSubSlot, activeSide)}
                                                                    className="flex min-w-28 cursor-pointer items-center gap-2 rounded-xl bg-white/6 p-2 text-left transition hover:bg-white/12 active:scale-[0.98]"
                                                                    type="button"
                                                                >
                                                                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
                                                                        {benchPlayer.photo_url ? (
                                                                            <img src={benchPlayer.photo_url} alt="" className="h-full w-full object-cover" />
                                                                        ) : (
                                                                            <div className="flex h-full w-full items-center justify-center text-[9px] font-black text-white/50">
                                                                                {benchPlayer.number}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-[10px] font-black text-white">#{benchPlayer.number} {benchPlayer.name}</p>
                                                                        <p className="text-[8px] font-black uppercase text-gray-500">{benchPlayer.position}</p>
                                                                    </div>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
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
                            <span className="font-oswald">Anderson Daronco</span>
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
                        onClose={() => setDrawerPlayerId(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Matchday;
