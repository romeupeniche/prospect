import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getTeamSquadPlayers } from "../../data/teamSquads";
import { useCareerStore } from "../../store/useCareerStore";
import { BasePlayer, RuntimePlayer, useTeamStore } from "../../store/useTeamStore";
import LastMatchWidget from "./LastMatchWidget";
import PlayerDrawer from "./PlayerDrawer";
import { formatPosition, getPositionLanguageFromSave } from "../../utils/positionI18n";

const rosterLimit = 35;

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        notation: value >= 1000000 ? "compact" : "standard",
        maximumFractionDigits: value >= 1000000 ? 1 : 0,
    }).format(value);

const normalizeHex = (hex?: string): string => (hex ?? "").trim().toLowerCase();

const conditionTone = (value: number): string => {
    if (value >= 75) return "from-emerald-400 via-lime-300 to-emerald-500";
    if (value >= 45) return "from-yellow-300 via-orange-400 to-yellow-500";
    return "from-red-500 via-rose-400 to-red-600";
};

const ovrTone = (overall: number): string => {
    if (overall >= 80) return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
    if (overall >= 72) return "text-yellow-200 bg-yellow-300/10 border-yellow-300/20";
    return "text-gray-200 bg-white/5 border-white/10";
};

const getStatusItems = (player: RuntimePlayer) => {
    const items: { key: string; label: string; node: ReactNode }[] = [];

    if (player.runtime.form === 5) {
        items.push({ key: "form", label: "On Fire", node: <span title="On Fire">⭐</span> });
    }

    if (player.runtime.injury) {
        items.push({ key: "injury", label: "Injured", node: <span title="Injured">🩹</span> });
    }

    if (player.runtime.ckRisk > 80) {
        items.push({ key: "ck", label: "Critical CK", node: <span title="Critical CK">⚠️</span> });
    }

    if (player.contract.ownership_type === "loan" || player.runtime.isLoanListed) {
        items.push({
            key: "loan",
            label: "Loan",
            node: (
                <span className="rounded-md border border-blue-300/20 bg-blue-400/10 px-1.5 py-0.5 text-[8px] font-black text-blue-200">
                    LOAN
                </span>
            ),
        });
    }

    if (player.contract.is_transfer_listed) {
        items.push({
            key: "transfer",
            label: "Listed",
            node: (
                <span className="rounded-md border border-red-300/20 bg-red-400/10 px-1.5 py-0.5 text-[8px] font-black text-red-200">
                    SALE
                </span>
            ),
        });
    }

    if (player.runtime.hasUnreadMessage) {
        items.push({
            key: "message",
            label: "Unread",
            node: <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/40 animate-pulse" />,
        });
    }

    return items;
};

const MedicalDepartmentWidget = ({
    players,
    onPlayerClick,
}: {
    players: RuntimePlayer[];
    onPlayerClick: (id: string) => void;
}) => {
    const medicalPlayers = players.filter((player) => player.runtime.injury || player.runtime.ckRisk > 80);

    return (
        <div className="flex-1 overflow-hidden rounded-4xl border border-white/5 bg-[#111] p-5">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-red-300">
                        Medical
                    </p>
                    <h3 className="text-sm font-bold text-white">Department Queue</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black text-gray-300">
                    {medicalPlayers.length}
                </span>
            </div>

            <div className="h-[calc(100%-3.5rem)] space-y-3 overflow-y-auto pr-2">
                {medicalPlayers.map((player) => (
                    <motion.button
                        key={player.id}
                        type="button"
                        whileHover={{ x: 2, scale: 1.01 }}
                        onClick={() => onPlayerClick(player.id)}
                        className="w-full rounded-3xl border border-white/5 bg-white/4 p-3 text-left transition hover:border-red-300/25 hover:bg-red-500/10 active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={player.personal.photo_url ?? "src/assets/players/unknown.png"}
                                alt={player.personal.short_name}
                                className="h-10 w-10 rounded-2xl bg-white/5 object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "src/assets/players/unknown.png";
                                }}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="truncate text-xs font-black text-white">{player.personal.short_name}</p>
                                    <span className="text-[10px] font-black text-red-200">
                                        CK {player.runtime.ckRisk}
                                    </span>
                                </div>
                                <p className="mt-1 truncate text-[10px] text-gray-400">
                                    {player.runtime.injury
                                        ? `${player.runtime.injury.phase} / ${player.runtime.injury.daysRemaining} days`
                                        : "Load management required"}
                                </p>
                            </div>
                        </div>
                    </motion.button>
                ))}

                {medicalPlayers.length === 0 && (
                    <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/2 p-6 text-center">
                        <p className="text-xs text-gray-500">No injuries or critical CK flags in the current squad.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SquadScreen = () => {
    const { currentTeam, saveData } = useCareerStore();
    const { players, hydrateTeam, setActiveTeam } = useTeamStore();
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const hydratedTeamIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!currentTeam) return;
        setActiveTeam(currentTeam.id);
        const isCurrentTeamLoaded =
            players.length > 0 &&
            players.every((player) => player.team_id === currentTeam.id);

        if (isCurrentTeamLoaded || (players.length === 0 && hydratedTeamIdRef.current === currentTeam.id)) return;

        hydratedTeamIdRef.current = currentTeam.id;
        hydrateTeam(getTeamSquadPlayers(currentTeam.id) as BasePlayer[]);
        setSelectedPlayerId(null);
    }, [currentTeam, hydrateTeam, players, setActiveTeam]);

    const selectedPlayer = useMemo(
        () => players.find((player) => player.id === selectedPlayerId) ?? null,
        [players, selectedPlayerId],
    );

    const isTeamColorBlack = normalizeHex(currentTeam?.colors.primary[500]) === "#000";
    const isTeamColorWhite = normalizeHex(currentTeam?.colors.primary[500]) === "#fff";
    const isTeamColorBlackOrWhite = isTeamColorBlack || isTeamColorWhite || !currentTeam;
    const positionLanguage = getPositionLanguageFromSave(saveData);

    const monthlyWageBill = players.reduce((total, player) => total + player.contract.wage, 0);
    const averageCondition =
        players.length > 0
            ? Math.round(players.reduce((total, player) => total + player.runtime.condition, 0) / players.length)
            : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65 }}
            className="h-full w-full overflow-hidden"
        >
            <main className="relative grid h-full w-full grid-cols-12 grid-rows-6 gap-4 overflow-hidden">
                <header className="col-span-12 row-span-1 flex items-center justify-between rounded-4xl border border-white/5 bg-[#111] px-10 shadow-2xl shadow-black/20">
                    <div className="min-w-0">
                        <span
                            className={`text-[10px] font-black uppercase tracking-[0.24em] ${isTeamColorBlackOrWhite ? "text-gray-500" : "text-(--team-color-400)"
                                }`}
                        >
                            Squad Management Center
                        </span>
                        <h2 className="mt-1 text-2xl font-light text-white">First Team Squad</h2>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                        <div className="rounded-3xl border border-white/5 bg-white/3 px-5 py-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Players</p>
                            <p className="text-sm font-black text-white">
                                {players.length}/{rosterLimit}
                            </p>
                        </div>
                        <div className="rounded-3xl border border-white/5 bg-white/3 px-5 py-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Monthly Wage</p>
                            <p className="text-sm font-black text-white">{formatCurrency(monthlyWageBill)}</p>
                        </div>
                        <div className="rounded-3xl border border-white/5 bg-white/3 px-5 py-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Avg Condition</p>
                            <p className="text-sm font-black text-white">{averageCondition}%</p>
                        </div>
                    </div>
                </header>

                <section className="col-span-8 row-span-5 flex min-h-0 flex-col overflow-hidden rounded-4xl border border-white/5 bg-[#111] p-6 shadow-2xl shadow-black/20">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-gray-500">
                                Live Roster
                            </p>
                            <h3 className="text-sm font-bold text-white">Performance, load and availability</h3>
                        </div>
                        <div className="hidden items-center gap-2 text-[10px] font-bold text-gray-500 xl:flex">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            Ready
                            <span className="ml-2 h-2 w-2 rounded-full bg-red-500" />
                            Needs attention
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                        <table className="w-full border-separate border-spacing-y-2 text-left text-xs">
                            <thead className="sticky top-0 z-10 bg-[#111] text-[10px] uppercase tracking-widest text-gray-500">
                                <tr>
                                    <th className="px-3 py-2 font-black">No.</th>
                                    <th className="px-3 py-2 font-black">Player</th>
                                    <th className="px-3 py-2 text-center font-black">Pos</th>
                                    <th className="px-3 py-2 text-center font-black">OVR</th>
                                    <th className="px-3 py-2 text-center font-black">Condition</th>
                                    <th className="px-3 py-2 text-right font-black">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map((player, index) => {
                                    const statuses = getStatusItems(player);

                                    return (
                                        <motion.tr
                                            key={player.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.025 }}
                                            onClick={() => setSelectedPlayerId(player.id)}
                                            className="group cursor-pointer rounded-3xl"
                                        >
                                            <td className="rounded-l-3xl border-y border-l border-white/5 bg-white/2.5 px-3 py-3 font-black text-gray-400 transition group-hover:border-white/15 group-hover:bg-white/5.5">
                                                {player.contract.kit_number}
                                            </td>
                                            <td className="border-y border-white/5 bg-white/2.5 px-3 py-3 transition group-hover:border-white/15 group-hover:bg-white/5.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                                                        <img
                                                            src={player.personal.photo_url ?? "src/assets/players/unknown.png"}
                                                            alt={player.personal.name}
                                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                                                            onError={(e) => {
                                                                e.currentTarget.src = "src/assets/players/unknown.png";
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p
                                                            className={`truncate font-black text-white transition ${isTeamColorBlackOrWhite ? "group-hover:text-gray-200" : "group-hover:text-(--team-color-300)"
                                                                }`}
                                                        >
                                                            {player.personal.short_name}
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] text-gray-500">
                                                            {player.personal.age} years / POT {player.technical_profile.potential}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border-y border-white/5 bg-white/2.5 px-3 py-3 text-center transition group-hover:border-white/15 group-hover:bg-white/5.5">
                                                <span className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-black text-gray-200">
                                                    {formatPosition(player.technical_profile.best_position, positionLanguage)}
                                                </span>
                                            </td>
                                            <td className="border-y border-white/5 bg-white/2.5 px-3 py-3 text-center transition group-hover:border-white/15 group-hover:bg-white/5.5">
                                                <span
                                                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-2xl border px-2 text-sm font-black ${ovrTone(
                                                        player.technical_profile.overall,
                                                    )}`}
                                                >
                                                    {player.technical_profile.overall}
                                                </span>
                                            </td>
                                            <td className="border-y border-white/5 bg-white/2.5 px-3 py-3 transition group-hover:border-white/15 group-hover:bg-white/5.5">
                                                <div className="mx-auto w-24">
                                                    <div className="mb-1 flex justify-between text-[9px] font-bold text-gray-500">
                                                        <span>FIT</span>
                                                        <span>{player.runtime.condition}%</span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                                        <div
                                                            className={`h-full rounded-full bg-linear-to-r ${conditionTone(player.runtime.condition)}`}
                                                            style={{ width: `${player.runtime.condition}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="rounded-r-3xl border-y border-r border-white/5 bg-white/2.5 px-3 py-3 transition group-hover:border-white/15 group-hover:bg-white/5.5">
                                                <div className="flex min-h-8 items-center justify-end gap-2">
                                                    {statuses.length > 0 ? (
                                                        statuses.map((status) => (
                                                            <span key={status.key} aria-label={status.label} className="inline-flex items-center">
                                                                {status.node}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                                                            Clear
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="col-span-4 row-span-5 flex min-h-0 flex-col gap-4 overflow-hidden">
                    <LastMatchWidget
                        players={players}
                        teamLogo={currentTeam?.logo_tiny ?? currentTeam?.logo}
                        isTeamColorBlackOrWhite={isTeamColorBlackOrWhite}
                        language={positionLanguage}
                        onPlayerClick={setSelectedPlayerId}
                    />

                    <MedicalDepartmentWidget players={players} onPlayerClick={setSelectedPlayerId} />
                </section>

                <AnimatePresence>
                    {selectedPlayer && (
                        <PlayerDrawer
                            key={selectedPlayer.id}
                            player={selectedPlayer}
                            isTeamColorBlackOrWhite={isTeamColorBlackOrWhite}
                            language={positionLanguage}
                            onClose={() => setSelectedPlayerId(null)}
                        />
                    )}
                </AnimatePresence>
            </main>
        </motion.div>
    );
};

export default SquadScreen;
