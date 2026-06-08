import React, { useEffect, useRef } from 'react';
import { getSortedLeagueTable, getPositionZoneClass } from '../utils/leagueTableUtils';

interface Props {
    standings: any[];
    zones: any;
    selectedTeamId: string;
    opponentId: string | null;
}

export const LeagueTableCard: React.FC<Props> = ({
    standings,
    zones,
    selectedTeamId,
    opponentId
}) => {
    const table = getSortedLeagueTable(standings);
    const selectedRef = useRef<HTMLTableRowElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedRef.current && containerRef.current) {
            const container = containerRef.current;
            const element = selectedRef.current;
            const elementTop = element.offsetTop;
            const elementHeight = element.offsetHeight;
            const containerHeight = container.offsetHeight;

            container.scrollTo({
                top: elementTop - (containerHeight / 2) + (elementHeight / 2),
                behavior: 'smooth'
            });
        }
    }, [selectedTeamId, standings, opponentId]);

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto pr-1">
            <table className="w-full text-[10px] xl:text-[11px] border-separate border-spacing-y-1">
                <thead className="sticky top-0 z-10 bg-[#111] text-[8px] uppercase tracking-wider text-gray-600">
                    <tr>
                        <th className="w-8 pb-1 pl-3 text-left font-black">#</th>
                        <th className="pb-1 text-left font-black">Clube</th>
                        <th className="pb-1 text-right font-black">J</th>
                        <th className="pb-1 text-right font-black">V</th>
                        <th className="pb-1 text-right font-black">E</th>
                        <th className="pb-1 text-right font-black">D</th>
                        <th className="pb-1 text-right font-black">SG</th>
                        <th className="pb-1 pr-2 text-right font-black">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {table.map((item) => {
                        const isSelected = item.team_id === selectedTeamId;
                        const isOpponent = item.team_id === opponentId;
                        const zoneClass = getPositionZoneClass(item.position, zones);

                        return (
                            <tr
                                key={item.team_id}
                                ref={isSelected ? selectedRef : null}
                                className={`group transition-colors ${(isSelected || isOpponent) ? 'bg-white/5' : 'hover:bg-white/4'}`}
                            >
                                <td className="py-1 w-8 relative pl-3">
                                    <span className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-full ${zoneClass}`} />
                                    <span className={isSelected ? 'text-white font-bold' : 'text-gray-500'}>
                                        {item.position}
                                    </span>
                                </td>

                                <td className="py-1 flex items-center gap-2 min-w-0">
                                    <img src={item.logo_tiny} className="w-4 h-4 object-contain" alt="" />
                                    <span className={`truncate ${isSelected ? 'text-white font-bold cursor-default' : 'text-gray-400 hover:text-gray-200 cursor-pointer'}`}>
                                        {item.team_name}
                                    </span>
                                </td>

                                <td className="py-1 text-right font-mono text-gray-500">{item.played}</td>
                                <td className="py-1 text-right font-mono text-gray-500">{item.wins}</td>
                                <td className="py-1 text-right font-mono text-gray-500">{item.draws}</td>
                                <td className="py-1 text-right font-mono text-gray-500">{item.losses}</td>
                                <td className="py-1 text-right font-mono text-gray-400">{item.goals_diff}</td>
                                <td className="py-1 text-right font-mono pr-2">
                                    <span className={isSelected ? 'text-white font-bold' : 'text-gray-300'}>
                                        {item.points}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
