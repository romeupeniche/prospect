import { useState } from "react";
import { motion } from "framer-motion";
import KitCarousel from "./KitCarousel";
import { getPositionZoneClass, getSortedLeagueTable } from "../../utils/leagueTableUtils";
import { ChevronRIcon } from "../../icons/ChevronR";
import { RuntimePlayer, useTeamStore } from "../../store/useTeamStore";
import { useCompetitionsStore } from "../../store/useCompetitionsStore";

interface MatchDetailsProps {
    hasVisualConflict: boolean;
    isTeamColorBlack: boolean;
    homeTeamKits: UniformMap;
    homeKit: any;
    setHomeKit: any;
    awayTeamKits: UniformMap;
    awayKit: any;
    setAwayKit: any;
    currentMatchData: Fixture;
}

type LeaderboardPlayer = {
    id: string;
    name: string;
    goals: number;
    assists: number;
    score: number;
    matches: number;
};

export default function MatchDetails({
    hasVisualConflict,
    isTeamColorBlack,
    homeTeamKits,
    homeKit,
    setHomeKit,
    awayTeamKits,
    awayKit,
    setAwayKit,
    currentMatchData,
}: MatchDetailsProps) {
    const selectedFixtureSortedTable = getSortedLeagueTable(currentMatchData.competition.standings);
    const homeTeam = currentMatchData.homeTeam;
    const awayTeam = currentMatchData.awayTeam;

    return (
        <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col justify-around overflow-y-auto"
        >
            <div className="grid grid-cols-8 gap-4 h-full">
                <section className={`col-span-2 bg-[#111]/50 rounded-4xl border ${hasVisualConflict ? "border-yellow-600/60" : "border-white/5"} py-4 xl:py-6 px-2 flex flex-col justify-between overflow-hidden h-full`}>
                    <div className="w-full shrink-0">
                        <h3 className={`${hasVisualConflict ? "animate-pulse text-yellow-600 text-center" : ""} text-center text-xs font-black uppercase ${isTeamColorBlack ? "text-white" : "text-(--team-color-400)"} mb-1 xl:mb-2 tracking-widest`}>
                            {hasVisualConflict ? "Risco de confusão" : "Uniformes"}
                        </h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center gap-4 xl:gap-8 w-full min-h-0">
                        <KitCarousel
                            teamName={homeTeam.name}
                            uniforms={homeTeamKits}
                            selectedKit={homeKit}
                            onSelectKit={setHomeKit}
                            teamImage={homeTeam.logo}
                        />
                        <KitCarousel
                            teamName={awayTeam.name}
                            uniforms={awayTeamKits}
                            selectedKit={awayKit}
                            onSelectKit={setAwayKit}
                            teamImage={awayTeam.logo}
                        />
                    </div>
                </section>

                {[currentMatchData.homeTeam, currentMatchData.awayTeam].map((team) => (
                    <TeamStatsCard
                        key={team.id}
                        team={team}
                        selectedFixtureSortedTable={selectedFixtureSortedTable}
                        zones={currentMatchData.competition.zones}
                    />
                ))}
            </div>
        </motion.div>
    );
}

function toLeader(player: RuntimePlayer): LeaderboardPlayer {
    return {
        id: player.id,
        name: player.personal.short_name,
        goals: player.runtime.seasonStats.goals,
        assists: player.runtime.seasonStats.assists,
        score: player.runtime.seasonStats.rating,
        matches: player.runtime.seasonStats.matches,
    };
}

function TeamStatsCard({ team, selectedFixtureSortedTable, zones }: { team: Team, selectedFixtureSortedTable: TableRow[], zones: LeagueZones }) {
    const runtimePlayers = useTeamStore((state) => state.playersByTeamId[team.id] ?? []);
    const getTeamForm = useCompetitionsStore((state) => state.getTeamForm);
    const teamStanding = selectedFixtureSortedTable.find((standing) => standing.team_id === team.id);
    if (!teamStanding) return null;

    const positionZoneClass = getPositionZoneClass(teamStanding.position, zones);
    const points = teamStanding.points;
    const position = teamStanding.position;
    const played = teamStanding.played;
    const wins = teamStanding.wins;
    const draws = teamStanding.draws;
    const losses = teamStanding.losses;
    const goalsFor = teamStanding.goals_for;
    const goalsAgainst = teamStanding.goals_against;
    const lastGames = getTeamForm(team.id, 5);

    const leaderboardPlayers = runtimePlayers.map(toLeader);
    const topScorers = leaderboardPlayers
        .slice()
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.score - a.score)
        .slice(0, 10);
    const topAssists = leaderboardPlayers
        .slice()
        .sort((a, b) => b.assists - a.assists || b.goals - a.goals || b.score - a.score)
        .slice(0, 10);
    const topRatings = leaderboardPlayers
        .filter((player) => player.matches > 0 || player.score > 0)
        .sort((a, b) => b.score - a.score || b.goals - a.goals || b.assists - a.assists)
        .slice(0, 10);

    type TabKey = "ratings" | "scorers" | "assists";
    const [activeTab, setActiveTab] = useState<TabKey>("ratings");

    const tabsConfig: Record<TabKey, {
        label: string;
        data: LeaderboardPlayer[];
        renderBadge: (player: LeaderboardPlayer) => JSX.Element;
    }> = {
        ratings: {
            label: "Notas",
            data: topRatings,
            renderBadge: (player) => (
                <span className="font-mono font-bold text-amber-400 text-xs px-2 py-0.5 bg-amber-500/10 rounded">
                    {player.score.toFixed(1)}
                </span>
            )
        },
        scorers: {
            label: "Gols",
            data: topScorers,
            renderBadge: (player) => (
                <span className="font-mono font-bold text-white text-xs px-2 py-0.5 bg-white/5 rounded">
                    {player.goals}G
                </span>
            )
        },
        assists: {
            label: "Assists.",
            data: topAssists,
            renderBadge: (player) => (
                <span className="font-mono font-bold text-sky-400 text-xs px-2 py-0.5 bg-sky-500/10 rounded">
                    {player.assists}A
                </span>
            )
        }
    };

    const currentData = tabsConfig[activeTab].data;

    return (
        <section className="relative col-span-3 bg-[#111]/50 border-white/5 border rounded-4xl py-6 px-4 overflow-hidden flex flex-col select-none group h-full">
            <img
                src={team.logo}
                alt=""
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-5/6 h-auto pointer-events-none opacity-[0.03] grayscale transition-all duration-500 group-hover:scale-105"
            />

            <div className="relative z-10 flex flex-col gap-5 w-full shrink-0">
                <header className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <img src={team.logo} alt="" className="w-9 h-9 object-contain shrink-0" />
                        <h2 className="font-oswald text-nowrap truncate font-medium text-3xl tracking-wide uppercase text-white">{team.name}</h2>
                    </div>
                    <div className="flex text-right h-full gap-2">
                        <span className="font-oswald font-bold text-2xl">{position}º</span>
                        <div className={`w-0.5 h-full ${positionZoneClass}`} />
                    </div>
                </header>

                <div className="grid grid-cols-6 gap-2 text-center bg-black/20 p-3 rounded-2xl border border-white/5">
                    <Stat label="Pts" value={points} />
                    <Stat label="J" value={played} muted />
                    <Stat label="V" value={wins} tone="text-emerald-400/80" />
                    <Stat label="E" value={draws} muted />
                    <Stat label="D" value={losses} tone="text-rose-400/80" />
                    <Stat label="G" value={`${goalsFor}:${goalsAgainst}`} muted />
                </div>

                <div className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                    <span className="text-xs uppercase tracking-wider font-medium text-white/50">Forma</span>
                    <div className="flex gap-1.5 items-center">
                        {lastGames.map((result, idx) => {
                            let badgeColors = "bg-white/5 text-white/30 border-white/5";
                            if (result === "V") badgeColors = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold";
                            if (result === "E") badgeColors = "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold";
                            if (result === "D") badgeColors = "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold";

                            return (
                                <span key={idx} className={`w-6 h-6 rounded-md border text-xs flex items-center justify-center font-mono ${badgeColors}`}>
                                    {result}
                                </span>
                            );
                        })}
                        <ChevronRIcon className="text-white/30 w-3 h-3" />
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-5 flex flex-col gap-3 w-full flex-1 min-h-0">
                <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 gap-1 shrink-0">
                    {(Object.keys(tabsConfig) as TabKey[]).map((tabKey) => {
                        const isActive = activeTab === tabKey;
                        return (
                            <button
                                key={tabKey}
                                type="button"
                                onClick={() => setActiveTab(tabKey)}
                                className={`flex-1 py-1.5 text-center border text-[10px] lg:text-[11px] uppercase tracking-wider font-bold rounded-lg transition-all duration-200 ${isActive
                                    ? "bg-white/10 text-white shadow-md border-white/5"
                                    : "text-white/40 hover:text-white/70 border-transparent cursor-pointer"
                                    }`}
                            >
                                {tabsConfig[tabKey].label}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-1 flex-1 pr-1 min-h-0 overflow-y-auto custom-scrollbar">
                    {currentData.length === 0 && (
                        <div className="rounded-xl border border-dashed border-white/10 bg-white/2 px-3 py-5 text-center text-xs font-bold text-gray-500">
                            Sem jogos registrados
                        </div>
                    )}
                    {currentData.map((player, idx) => (
                        <div
                            key={player.id}
                            className="flex justify-between items-center bg-white/2 hover:bg-white/4 py-1.5 px-3 rounded-xl border border-white/3 transition-colors shrink-0"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-white/30 font-mono text-xs w-5 text-left">{idx + 1}.</span>
                                <span className="text-sm font-medium text-white/80 truncate">{player.name}</span>
                            </div>
                            {tabsConfig[activeTab].renderBadge(player)}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Stat({ label, value, muted, tone }: { label: string; value: string | number; muted?: boolean; tone?: string }) {
    return (
        <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40 block mb-0.5">{label}</span>
            <span className={`font-oswald text-lg font-medium ${tone ?? (muted ? "text-white/60" : "text-white")}`}>
                {value}
            </span>
        </div>
    );
}
