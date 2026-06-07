import React from 'react';
import { getTeamSquadPlayers } from "../../data/teamSquads";
import { useCareerStore } from '../../store/useCareerStore';

const FeaturedPlayers: React.FC = () => {
    const { currentTeam } = useCareerStore();
    if (!currentTeam) return null;
    const isTeamColorBlack = currentTeam.colors.primary[500] === "#000"
    const players = getTeamSquadPlayers(currentTeam.id)
        .slice()
        .sort((a, b) => b.technical_profile.overall - a.technical_profile.overall)
        .slice(0, 6);

    return (
        <div className="flex-1 bg-[#111] rounded-4xl border border-white/5 p-6 flex flex-col overflow-hidden">
            <h3 className="text-[10px] font-black uppercase text-gray-500 mb-4">Destaques do Elenco</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {players.length === 0 && (
                    <p className="text-xs text-gray-500">Elenco ainda não cadastrado para este clube.</p>
                )}
                {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between gap-4 hover:bg-zinc-800 p-1 rounded-md">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-8 h-8 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                <img src={player.personal.photo_url} alt={player.personal.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <p className="flex gap-1 items-center">
                                    <span className="text-[10px] font-medium text-zinc-500 shrink-0">
                                        {player.technical_profile.best_position}
                                    </span>
                                    <span className="text-xs truncate text-zinc-300 hover:text-white cursor-pointer">
                                        {player.personal.short_name}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <span className={`text-[10px] font-bold ${isTeamColorBlack ? "text-white bg-white/10" : "text-(--team-color-400) bg-(--team-color-500)/10"} shrink-0 px-2 py-1 rounded-md`}>
                            {player.technical_profile.overall} OVR
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeaturedPlayers;
