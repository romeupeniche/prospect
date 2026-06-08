import React, { useMemo } from "react";
import { LeagueTableCard } from "../LeagueTableCard";
import { ChevronRIcon } from "../../icons/ChevronR";
import { useCareerStore } from "../../store/useCareerStore";
import { useCompetitionsStore } from "../../store/useCompetitionsStore";

interface CompetitionTableProps {
    saveData: SaveData;
    translucent?: boolean;
    opponentId?: string | null;
    competitionId?: string;
    live?: boolean;
}

const CompetitionTable: React.FC<CompetitionTableProps> = ({
    saveData,
    translucent = false,
    opponentId = null,
    competitionId,
    live = true,
}) => {
    const { currentTeam } = useCareerStore();
    const competitions = useCompetitionsStore((state) => state.competitions);
    const fixtures = useCompetitionsStore((state) => state.fixtures);
    const liveScores = useCompetitionsStore((state) => state.liveScores);
    const getTeamCalendar = useCompetitionsStore((state) => state.getTeamCalendar);
    const getCompetitionStandings = useCompetitionsStore((state) => state.getCompetitionStandings);

    const selectedCompetition = useMemo(() => {
        if (competitionId && competitions[competitionId]) return competitions[competitionId];
        const calendar = currentTeam ? getTeamCalendar(currentTeam.id) : [];
        const nextFixture =
            calendar.find((fixture) => fixture.status !== "finished" && fixture.date >= saveData.currentDate) ??
            calendar.find((fixture) => fixture.status === "finished") ??
            null;
        return nextFixture?.competition ?? Object.values(competitions)[0] ?? null;
    }, [competitionId, competitions, currentTeam, getTeamCalendar, saveData.currentDate, fixtures]);

    const standings = useMemo(() => {
        if (!selectedCompetition) return [];
        void liveScores;
        void fixtures;
        return getCompetitionStandings(selectedCompetition.id, live);
    }, [selectedCompetition, getCompetitionStandings, live, liveScores, fixtures]);

    if (!currentTeam || !selectedCompetition) return null;
    const isTeamColorBlack = currentTeam.colors.primary[500] === "#000";

    return (
        <div className={`flex-1 ${translucent ? "bg-[#111]/50" : "bg-[#111]"} rounded-4xl border border-white/5 p-6 flex flex-col overflow-hidden`}>
            <span
                className={`flex justify-between items-center mb-4 group cursor-pointer text-gray-500 ${isTeamColorBlack ? "hover:text-white" : "hover:text-(--team-color-400)"} transition-colors`}
            >
                <h3 className="text-xs font-black uppercase tracking-widest">{selectedCompetition.short_name}</h3>
                <ChevronRIcon className="w-4 mr-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <LeagueTableCard
                standings={standings}
                zones={selectedCompetition.zones}
                selectedTeamId={saveData.teamId}
                opponentId={opponentId}
            />
        </div>
    );
};

export default CompetitionTable;
