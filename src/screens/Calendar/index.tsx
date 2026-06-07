import React, { useMemo, useState } from "react";
import { ChevronRIcon } from "../../icons/ChevronR";
import { useCareerStore } from "../../store/useCareerStore";
import { useCompetitionsStore } from "../../store/useCompetitionsStore";
import { useUIStore } from "../../store/useUIStore";
import { StadiumIcon } from "../../icons/Stadium";
import { FlightIcon } from "../../icons/Flight";
import { getSortedLeagueTable } from "../../utils/leagueTableUtils";
import _teams from "../../data/teams.json";
import { TransferIcon } from "../../icons/Transfer";
import { formatDynamicDate } from "../../utils/formatDynamicDate";

interface CalendarMarker {
    id: string;
    label: string;
    start: string;
    end: string;
    type: "transfer";
}

const TRANSFER_WINDOWS: CalendarMarker[] = [
    { id: "transfer-early-2026", label: "Janela de transferências", start: "2026-01-11", end: "2026-03-02", type: "transfer" },
    { id: "transfer-mid-2026", label: "Janela extra", start: "2026-06-02", end: "2026-06-10", type: "transfer" },
    { id: "transfer-main-2026", label: "Janela de transferências", start: "2026-07-10", end: "2026-09-02", type: "transfer" },
];

function parseLocalDate(date: string): Date {
    return new Date(`${date}T12:00:00`);
}

function toISODate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

// function addDays(date: string, amount: number): string {
//     const parsed = parseLocalDate(date);
//     parsed.setDate(parsed.getDate() + amount);
//     return toISODate(parsed);
// }

function monthLabel(date: Date): string {
    return new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
    }).format(date);
}

function daysBetween(start: string, end: string): number {
    const dayMs = 24 * 60 * 60 * 1000;
    return Math.max(0, Math.ceil((parseLocalDate(end).getTime() - parseLocalDate(start).getTime()) / dayMs));
}

function markerIsActive(marker: CalendarMarker, date: string): boolean {
    return date >= marker.start && date <= marker.end;
}

function buildMonthDays(viewDate: Date): Date[] {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1, 12);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return date;
    });
}

function getFixtureOpponent(fixture: Fixture, currentTeam: Team): Team {
    return fixture.homeTeam.id === currentTeam.id ? fixture.awayTeam : fixture.homeTeam;
}

function isHomeFixture(fixture: Fixture, currentTeam: Team): boolean {
    return fixture.homeTeam.id === currentTeam.id;
}

const Calendar: React.FC = () => {
    const { currentTeam, saveData, setCurrentDate } = useCareerStore();
    const getTeamCalendar = useCompetitionsStore((state) => state.getTeamCalendar);
    const setScreen = useUIStore((state) => state.setScreen);
    const [viewDate, setViewDate] = useState(() => parseLocalDate(saveData?.currentDate ?? "2026-01-01"));
    const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

    const teamCalendar = useMemo(
        () => currentTeam ? getTeamCalendar(currentTeam.id) : [],
        [currentTeam, getTeamCalendar],
    );

    const fixturesByDate = useMemo(() => {
        const map = new Map<string, Fixture[]>();
        teamCalendar.forEach((fixture) => {
            const list = map.get(fixture.date) ?? [];
            list.push(fixture);
            map.set(fixture.date, list);
        });
        return map;
    }, [teamCalendar]);

    if (!currentTeam || !saveData) return null;

    const monthDays = buildMonthDays(viewDate);
    const currentDayFixtures = fixturesByDate.get(saveData.currentDate) ?? [];
    const hasUnplayedMatchToday = currentDayFixtures.some((fixture) => fixture.status === "not_started");
    const selectedFixtures = currentDayFixtures;
    const selectedFixture = selectedFixtures[0] ?? null;
    const selectedMarkers = TRANSFER_WINDOWS.filter((marker) => markerIsActive(marker, saveData.currentDate));
    const selectedMarker = selectedMarkers[0] ?? null;
    const selectedOpponent = selectedFixture ? getFixtureOpponent(selectedFixture, currentTeam) : null;
    const selectedIsRival = selectedOpponent ? currentTeam.rivals_ids.includes(selectedOpponent.id) : false;
    const selectedIsHome = selectedFixture ? isHomeFixture(selectedFixture, currentTeam) : false;
    const isTeamColorBlack = currentTeam.colors.primary[500] === "#000" || currentTeam.colors.primary[500] === "#000000";
    const isTeamColorWhite = currentTeam.colors.primary[500] === "#fff" || currentTeam.colors.primary[500] === "#ffffff";
    const isNeutralTeamColor = isTeamColorBlack || isTeamColorWhite;

    const selectedFixtureSortedTable = getSortedLeagueTable(selectedFixture.competition.standings);

    const goToDate = (date: string) => {
        if (date > saveData.currentDate && hasUnplayedMatchToday) {
            setBlockedMessage("Você precisa jogar a partida de hoje antes de avançar no calendário.");
            return;
        }
        setBlockedMessage(null);
        setCurrentDate(date);
        setViewDate(parseLocalDate(date));
    };

    return (
        <main className="relative grid h-full w-full grid-cols-12 grid-rows-6 gap-4 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-4xl opacity-40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.08),transparent_32%),linear-gradient(145deg,rgba(20,80,45,0.24),transparent_54%)]" />
                <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-linear-to-t from-green-950/30 to-transparent" />
            </div>

            <header className="relative col-span-12 row-span-1 flex items-center justify-between rounded-4xl border border-white/5 bg-[#111]/95 px-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                        Calendário Oficial
                    </span>
                    <h2 className="text-xl font-light text-white">{formatDynamicDate(saveData.currentDate, "br")}</h2>
                    {blockedMessage && (
                        <span className="mt-1 text-[10px] font-bold text-red-300">{blockedMessage}</span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {teamCalendar
                        .filter((fixture) => fixture.date >= saveData.currentDate && fixture.status === "not_started")
                        .slice(0, 6)
                        .map((fixture) => {
                            const opponent = getFixtureOpponent(fixture, currentTeam);
                            const home = isHomeFixture(fixture, currentTeam);
                            const rival = currentTeam.rivals_ids.includes(opponent.id);
                            return (
                                <div
                                    key={fixture.id}
                                    className="min-w-15 flex items-center relative"
                                >
                                    <img src={opponent.logo} alt="" className="h-10 w-10 object-contain" />
                                    <div className="ml-1 flex flex-col items-start">
                                        {home ? (
                                            <StadiumIcon className={`h-4 w-auto ${rival ? "text-red-500" : "text-white"}`} />
                                        ) : (
                                            <FlightIcon className={`h-4 w-auto ${rival ? "text-red-500" : "text-white"}`} />
                                        )}
                                        <p className={`truncate text-[10px] font-black ${rival ? "text-red-500" : "text-white"}`}>{opponent.shortName}</p>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </header>

            <section className="relative col-span-8 row-span-5 flex min-h-0 flex-col rounded-4xl border border-white/5 bg-[#111]/90 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <button
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1, 12))}
                        className="cursor-pointer rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-gray-300 hover:bg-white/10"
                        type="button"
                    >
                        <ChevronRIcon className="w-auto h-5 rotate-180" />
                    </button>
                    <h3 className="text-base font-black uppercase tracking-[0.2em] text-white">{monthLabel(viewDate)}</h3>
                    <button
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1, 12))}
                        className="cursor-pointer rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-gray-300 hover:bg-white/10"
                        type="button"
                    >
                        <ChevronRIcon className="w-auto h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => <span key={day}>{day}</span>)}
                </div>

                <div className="mt-2 grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-2">
                    {monthDays.map((date) => {
                        const iso = toISODate(date);
                        const inMonth = date.getMonth() === viewDate.getMonth();
                        const isSelected = iso === saveData.currentDate;
                        const isPast = iso < saveData.currentDate;
                        const dayFixtures = fixturesByDate.get(iso) ?? [];
                        const fixture = dayFixtures[0] ?? null;
                        const opponent = fixture ? getFixtureOpponent(fixture, currentTeam) : null;
                        const isRival = opponent ? currentTeam.rivals_ids.includes(opponent.id) : false;
                        const home = fixture ? isHomeFixture(fixture, currentTeam) : false;
                        const dayMarkers = TRANSFER_WINDOWS.filter((marker) => markerIsActive(marker, iso));
                        const hasTransfer = dayMarkers.length > 0;
                        const isFinished = fixture?.status === "finished";
                        const isInteractive = inMonth && !isPast;
                        const isClickable = isInteractive && !isSelected;

                        return (
                            <button
                                key={iso}
                                onClick={() => !isPast && goToDate(iso)}
                                className={`group relative overflow-hidden rounded-lg border p-1 text-left transition-all
                                    ${isSelected ? "border-white/45 bg-white/10 shadow-lg shadow-black/30" : "border-white/10 bg-black/15"}
                                    ${isInteractive ? "opacity-100 hover:bg-white/8" : "opacity-30"}
                                    ${isPast ? "grayscale-60" : ""}
                                    ${isClickable ? "cursor-pointer" : ""}
                                `}
                                type="button"
                            >
                                {fixture && (
                                    <>
                                        <img
                                            src={fixture.competition.bg_art}
                                            className="absolute inset-0 w-full h-full object-cover object-center brightness-90"
                                        />
                                        <div className={`absolute inset-0 ${isRival
                                            ? "bg-linear-to-b from-red-500/70 via-red-950/80 via-55% to-black/95"
                                            : "bg-linear-to-t from-black/95 via-black/20 to-transparent"
                                            }`} />
                                    </>
                                )}
                                {!fixture && hasTransfer && (
                                    <>
                                        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/35 via-green-500/15 to-black/20" />
                                        <TransferIcon className="absolute right-1 top-0 w-6 opacity-40" />
                                    </>
                                )}

                                <div className="relative z-10 flex h-full flex-col justify-between gap-1">
                                    <div className="flex items-start justify-between">
                                        <span className={`xl:text-2xl font-black font-oswald ${fixture ? "text-white" : "text-gray-300"}`}>{date.getDate()}</span>
                                        {opponent && (
                                            <img src={opponent.logo} alt="" className="absolute -z-1 right-0 h-[60%] w-auto object-contain drop-shadow-lg" />
                                        )}
                                    </div>
                                    {fixture ? (
                                        <div>
                                            <p className="text-[9px] -mb-1 font-black tracking-wide text-white">{home ? "Casa" : "Fora"}</p>
                                            <p className="text-xs font-bold font-oswald uppercase text-white">
                                                {isFinished ? "Finalizado" : fixture.status === "in_progress" ? "Em jogo" : fixture.competition.short_name}
                                            </p>
                                        </div>
                                    ) : hasTransfer ? (
                                        <p className="text-xs font-oswald font-black uppercase text-emerald-200">Mercado aberto</p>
                                    ) : (
                                        <span className="h-1 w-1 rounded-full bg-white/15" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            <aside className="relative col-span-4 row-span-5 flex min-h-0 flex-col overflow-hidden rounded-4xl border border-white/5 bg-[#111]/90">
                <div className={`relative flex-1 overflow-hidden p-8 ${selectedIsRival ? "bg-linear-to-b from-red-950/35 to-transparent" : "bg-linear-to-b from-white/3 to-transparent"}`}>
                    {selectedOpponent ? (
                        <>
                            <div className="absolute inset-0 brightness-10 pointer-events-none">
                                <img
                                    src={selectedFixture.competition.bg_art}
                                    alt=""
                                    className="w-full h-full object-cover object-center"
                                />
                            </div>

                            <div className="relative z-10 flex h-full flex-col">

                                <div className="flex items-center gap-4 shrink-0">
                                    <img
                                        src={selectedFixture.competition.icon}
                                        alt=""
                                        className="w-12 h-12 object-contain"
                                    />
                                    <div>
                                        <p className="text-lg font-black uppercase font-oswald tracking-wider text-white">
                                            {selectedFixture.competition.short_name}
                                        </p>
                                        <p className="text-sm font-bold text-gray-400">
                                            {formatDynamicDate(selectedFixture.date, "br", 3)} - {selectedFixture.time}
                                        </p>
                                    </div>
                                    {selectedIsHome ? (
                                        <StadiumIcon className="h-10 w-10 ml-auto text-white/80" />
                                    ) : (
                                        <FlightIcon className="h-10 w-10 ml-auto text-white/80" />
                                    )}
                                </div>

                                <div className="flex-1 min-h-0 flex flex-col items-center text-center justify-center py-4 relative">
                                    <img
                                        src={selectedOpponent.logo}
                                        alt={selectedOpponent.name}
                                        className="w-auto h-[60%] max-h-56 object-contain pointer-events-none drop-shadow-2xl"
                                    />
                                    <h2 className="mt-4 text-2xl xl:text-3xl font-black text-white tracking-wide">{selectedOpponent.name}</h2>

                                    {selectedIsRival && (
                                        <>
                                            <div className="absolute w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-1 blur-3xl bg-red-600/35 rounded-full pointer-events-none" />
                                            <span className="text-xs mt-1 font-black tracking-wider uppercase text-red-500 animate-pulse">Rival</span>
                                        </>
                                    )}
                                </div>

                                <div className="mt-auto pt-2 shrink-0">
                                    {selectedFixture?.status === "not_started" && saveData.currentDate === selectedFixture.date && (
                                        <button
                                            onClick={() => setScreen("matchday")}
                                            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-white/10 py-2 xl:py-4 backdrop-blur-md xl:text-lg text-sm font-black uppercase text-white transition hover:bg-(--team-color-500)/20 active:scale-[0.99]"
                                            type="button"
                                        >
                                            Jogar partida
                                            <ChevronRIcon className="w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full flex-col justify-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Dia selecionado</p>
                            <h2 className="mt-2 text-2xl font-light text-white">{formatDynamicDate(saveData.currentDate, "br")}</h2>
                            {selectedMarker ? (
                                <div className="mt-8 rounded-3xl border border-emerald-400/15 bg-emerald-400/10 p-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">{selectedMarker.label}</p>
                                    <p className="mt-4 text-4xl font-black text-white">{daysBetween(saveData.currentDate, selectedMarker.end)}</p>
                                    <p className="text-xs font-bold text-emerald-100/80">dias até o fechamento</p>
                                </div>
                            ) : (
                                <p className="mt-6 text-sm text-gray-500">Sem partida confirmada para este dia.</p>
                            )}
                        </div>
                    )}
                </div>

                {selectedOpponent && (
                    <div className="border-t border-white/5 p-5 h-40">
                        <span className="flex items-center justify-between">
                            <p className="mb-3 text-sm font-oswald font-black uppercase tracking-widest text-gray-500 flex-1 text-center">{selectedFixture.homeTeam.name}</p>
                            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-500 flex-3 text-center">Head to Head</p>
                            <p className="mb-3 text-sm font-oswald font-black uppercase tracking-widest text-gray-500 flex-1 text-center">{selectedFixture.awayTeam.name}</p>
                        </span>
                        <div className="relative flex gap-30 overflow-x-auto pb-1 scrollbar-hide justify-between h-full">
                            {[selectedFixture.homeTeam, selectedFixture.awayTeam].map((team, i) => {
                                const teamStanding = selectedFixtureSortedTable.find((standing) => standing.team_id === team.id)
                                if (!teamStanding) return
                                const points = teamStanding.points
                                const position = teamStanding.position
                                const performance = teamStanding.performance

                                return (
                                    <div className={`flex flex-1 relative ${i === 0 ? "flex-row" : "flex-row-reverse"} overflow-hidden`}>

                                        <img
                                            src={team.logo}
                                            alt={team.name}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200%] w-auto object-contain opacity-12 pointer-events-none z-0"
                                        />

                                        <div className="flex flex-col z-10 flex-1">
                                            <div className="text-center flex justify-between">
                                                <p className="mt-1 text-md leading-6 font-normal font-oswald uppercase text-gray-400">Pos.</p>
                                                <p className="mt-1 text-md leading-6 font-normal font-oswald uppercase text-gray-400">Pts</p>
                                                <p className="mt-1 text-md leading-6 font-normal font-oswald uppercase text-gray-400">Perf.</p>
                                            </div>
                                            <div className="text-center flex justify-between">
                                                <p className="mt-1 text-md font-oswald text-white">{position}º</p>
                                                <p className="mt-1 text-md font-oswald text-white">{points}</p>
                                                <p className="mt-1 text-md font-oswald text-white">{performance.toFixed(0)}%</p>
                                            </div>
                                            <div className={`text-center flex justify-between ${i === 0 ? "flex-row" : "flex-row-reverse"}`}>
                                                {["-", "V", "D", "E", "V"].map((m, i) => {
                                                    const color = m === "V" ? "bg-green-600" : m === "D" ? "bg-red-600" : m === "E" ? "bg-gray-600" : "bg-gray-600 opacity-50"
                                                    return (
                                                        <span key={i} className={`mt-1 text-md font-oswald px-1 rounded-full ${color}`}>
                                                            {m}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <span className="absolute font-oswald left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-xl font-black text-white/70">VS</span>
                        </div>
                    </div>
                )}
            </aside>
        </main>
    );
};

export default Calendar;
