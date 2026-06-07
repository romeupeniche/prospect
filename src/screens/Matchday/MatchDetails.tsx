import { useState } from "react";
import { motion } from "framer-motion";
import KitCarousel from "./KitCarousel";
import { getPositionZoneClass, getSortedLeagueTable } from "../../utils/leagueTableUtils";
import { ChevronRIcon } from "../../icons/ChevronR";

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

function TeamStatsCard({ team, selectedFixtureSortedTable, zones }: { team: Team, selectedFixtureSortedTable: TableRow[], zones: LeagueZones }) {
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
    const lastGames = ["-", "E", "D", "V", "V"];

    const topScorers = [
        { name: "C. Da Fumaça", goals: 12, assists: 4 },
        { name: "Oswaldinato", goals: 10, assists: 5 },
        { name: "Ronaldo F.", goals: 9, assists: 2 },
        { name: "M. Tanque", goals: 8, assists: 1 },
        { name: "Deizinho", goals: 7, assists: 6 },
        { name: "Pipoca", goals: 6, assists: 0 },
        { name: "Gilsinho", goals: 5, assists: 3 },
        { name: "Chicão", goals: 4, assists: 2 },
        { name: "Keke", goals: 4, assists: 1 },
        { name: "Canela", goals: 3, assists: 5 }
    ];

    const topAssists = [
        { name: "C. Da Fumaça", assists: 9, goals: 6 },
        { name: "Oswaldinato", assists: 8, goals: 4 },
        { name: "Deizinho", assists: 7, goals: 3 },
        { name: "Ronaldo F.", assists: 6, goals: 5 },
        { name: "Bruninho", assists: 5, goals: 1 },
        { name: "Gilsinho", assists: 5, goals: 2 },
        { name: "Maestro", assists: 4, goals: 2 },
        { name: "Vitinho", assists: 4, goals: 0 },
        { name: "Zé Passos", assists: 3, goals: 1 },
        { name: "Baiano", assists: 3, goals: 2 }
    ];

    const topRatings = [
        { name: "C. Da Fumaça", score: 8.2 },
        { name: "Oswaldinato", score: 7.7 },
        { name: "Ronaldo F.", score: 7.5 },
        { name: "Maestro", score: 7.4 },
        { name: "M. Tanque", score: 7.3 },
        { name: "Deizinho", score: 7.1 },
        { name: "Gilsinho", score: 6.9 },
        { name: "Pipoca", score: 6.8 },
        { name: "Chiquinho", score: 6.6 },
        { name: "Paredão", score: 6.5 }
    ];

    type TabKey = "ratings" | "scorers" | "assists";

    const [activeTab, setActiveTab] = useState<TabKey>("ratings");

    const logo = team.logo;
    const name = team.name;

    const tabsConfig = {
        ratings: {
            label: "Notas",
            data: topRatings,
            renderBadge: (player: typeof topRatings[0]) => (
                <span className="font-mono font-bold text-amber-400 text-xs px-2 py-0.5 bg-amber-500/10 rounded">
                    {player.score.toFixed(1)}
                </span>
            )
        },
        scorers: {
            label: "Gols",
            data: topScorers,
            renderBadge: (player: typeof topScorers[0]) => (
                <span className="font-mono font-bold text-white text-xs px-2 py-0.5 bg-white/5 rounded">
                    {player.goals}G
                </span>
            )
        },
        assists: {
            label: "Assists.",
            data: topAssists,
            renderBadge: (player: typeof topAssists[0]) => (
                <span className="font-mono font-bold text-sky-400 text-xs px-2 py-0.5 bg-sky-500/10 rounded">
                    {player.assists}A
                </span>
            )
        }
    };

    return (
        <section className="relative col-span-3 bg-[#111]/50 border-white/5 border rounded-4xl py-6 px-4 overflow-hidden flex flex-col select-none group h-full">
            <img
                src={logo}
                alt=""
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-5/6 h-auto pointer-events-none opacity-[0.03] grayscale transition-all duration-500 group-hover:scale-105"
            />

            <div className="relative z-10 flex flex-col gap-5 w-full shrink-0">
                <header className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="" className="w-9 h-9 object-contain" />
                        <h2 className="font-oswald text-nowrap truncate font-medium text-3xl tracking-wide uppercase text-white">{name}</h2>
                    </div>
                    <div className="flex text-right h-full gap-2">
                        <span className="font-oswald font-bold text-2xl">{position}º</span>
                        <div className={`w-0.5 h-full ${positionZoneClass}`} />
                    </div>
                </header>

                <div className="grid grid-cols-6 gap-2 text-center bg-black/20 p-3 rounded-2xl border border-white/5">
                    <div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40 block mb-0.5">Pts</span>
                        <span className="font-oswald text-lg font-bold text-white">{points}</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40 block mb-0.5">J</span>
                        <span className="font-oswald text-lg font-medium text-white/70">{played}</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40 block mb-0.5">V</span>
                        <span className="font-oswald text-lg font-medium text-emerald-400/80">{wins}</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40 block mb-0.5">E</span>
                        <span className="font-oswald text-lg font-medium text-white/50">{draws}</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40 block mb-0.5">D</span>
                        <span className="font-oswald text-lg font-medium text-rose-400/80">{losses}</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40 block mb-0.5">G</span>
                        <span className="font-oswald text-lg font-medium text-white/60">{goalsFor}:{goalsAgainst}</span>
                    </div>
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
                    {tabsConfig[activeTab].data.slice(0, 10).map((player: any, idx: number) => (
                        <div
                            key={idx}
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