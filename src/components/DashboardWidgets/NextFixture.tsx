import React from 'react';
import { StadiumIcon } from '../../icons/Stadium';
import { FlightIcon } from '../../icons/Flight';
import { SwordsIcon } from '../../icons/Swords';
import { formatDynamicDate } from '../../utils/formatDynamicDate';
import { FlagsIcon } from '../../icons/Flags';
import { useUIStore } from '../../store/useUIStore';
import { useCompetitionsStore } from '../../store/useCompetitionsStore';
import { resolveDefaultKits } from '../../utils/kitResolver';

const NextFixture: React.FC<{ currentTeam: Team, saveData: SaveData }> = ({ currentTeam, saveData }) => {
    const { setScreen } = useUIStore();
    const selectedTeamId = saveData.teamId;

    const competitions = useCompetitionsStore((state) => state.competitions);
    const getNextMatch = useCompetitionsStore((state) => state.getNextMatch);

    const nextFixture = React.useMemo(() => {
        return getNextMatch(selectedTeamId);
    }, [competitions, selectedTeamId, getNextMatch]);

    const hasCompetitionsLoaded = Object.keys(competitions).length > 0;

    if (!hasCompetitionsLoaded) {
        return (
            <div className="bg-[#111] rounded-4xl border border-white/5 px-10 text-center flex flex-col justify-center items-center h-32 text-xs text-gray-400">
                Carregando dados da temporada...
            </div>
        );
    }

    if (!nextFixture || !nextFixture.venue || !nextFixture.competition || !nextFixture.homeTeam || !nextFixture.awayTeam) {
        return (
            <div className="bg-[#111] rounded-4xl border border-white/5 px-10 text-center flex flex-col justify-center items-center h-32 text-xs text-gray-400">
                Fim de temporada. Nenhuma partida agendada.
            </div>
        );
    }

    const isNextFixtureHomeGame = nextFixture.homeTeam.id === selectedTeamId;
    const opponentTeam = isNextFixtureHomeGame ? nextFixture.awayTeam : nextFixture.homeTeam;

    const nextFixtureAgainstRival = currentTeam.rivals_ids.includes(opponentTeam.id);
    const nextFixtureVenue = nextFixture.venue;
    const nextFixtureCompetition = nextFixture.competition;

    const formattedRound = !isNaN(Number(nextFixture.round))
        ? `Rodada ${nextFixture.round}`
        : nextFixture.round;

    const isTeamColorBlack = currentTeam.colors.primary[500] === "#000000";

    const homeTeamKits = isNextFixtureHomeGame ? currentTeam.uniforms : nextFixture.homeTeam.uniforms;
    const awayTeamKits = isNextFixtureHomeGame ? opponentTeam.uniforms : currentTeam.uniforms;
    const suggestedKits = resolveDefaultKits(homeTeamKits, awayTeamKits);
    const homeKitImage = homeTeamKits[suggestedKits.homeKit].image;
    const awayKitImage = awayTeamKits[suggestedKits.awayKit].image;

    return (
        <div
            onClick={() => setScreen('matchday')}
            className={`bg-[#111] cursor-pointer hover:scale-101 ${isTeamColorBlack ? "hover:bg-white/10" : "hover:bg-(--team-color-500)/10"} transition rounded-4xl border ${nextFixtureAgainstRival ? 'border-red-500/30' : 'border-white/5'} px-5 flex flex-col justify-center items-center relative overflow-hidden`}
        >
            <div className="flex justify-between items-center w-full h-10">
                <span
                    className={`${nextFixtureAgainstRival ? 'text-red-500' : 'white'}
                                text-xs font-bold uppercase leading-none 
                                antialiased transform-gpu will-change-transform`}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    Próximo Jogo {nextFixtureAgainstRival ? '- RIVAL' : ''}</span>
                <div title={nextFixture.is_neutral_ground ? "Campo Neutro" : isNextFixtureHomeGame ? "Em Casa" : "Fora de Casa"}>
                    {nextFixture.is_neutral_ground ?
                        <FlagsIcon className={`h-6 ${nextFixtureAgainstRival ? 'text-red-500' : 'text-white'}`} />
                        : isNextFixtureHomeGame ?
                            <StadiumIcon className={`h-6 ${nextFixtureAgainstRival ? 'text-red-500' : 'text-white'}`} /> :
                            <FlightIcon className={`h-6 ${nextFixtureAgainstRival ? 'text-red-500' : 'text-white'}`} />}
                </div>
            </div>
            <div className={`relative flex items-end gap-6 mt-2 h-14 ${isNextFixtureHomeGame ? "flex-row" : "flex-row-reverse"}`}>
                <img src={homeKitImage} className="absolute opacity-60 -left-8 w-16 h-16 object-contain select-none pointer-events-none" />
                <img
                    src={currentTeam.logo}
                    className="z-10 w-16 h-16 object-contain select-none pointer-events-none"
                    style={{
                        imageRendering: 'smooth',
                        transform: 'translateZ(0)'
                    }}
                />
                <span className="text-xl font-bold">
                    <SwordsIcon className="w-6" color={`${nextFixtureAgainstRival ? 'red' : 'white'}`} />
                </span>
                <img src={awayKitImage} className="absolute opacity-60 -right-8 w-16 h-16 object-contain select-none pointer-events-none" />
                <img src={opponentTeam.logo} className="z-10 w-16 h-16 object-contain select-none pointer-events-none" />
            </div>
            <p className="text-[10px] mt-2 text-gray-400">{nextFixtureVenue.short_name} | {nextFixture.time} | {formatDynamicDate(nextFixture.date, "br", 2)}</p>
            <p className="text-[10px] mb-2 text-gray-400">{nextFixtureCompetition.short_name} | {formattedRound}</p>
        </div>
    );
}

export default NextFixture;
