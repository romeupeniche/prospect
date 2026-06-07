import React from 'react';
import { LeagueTableCard } from '../LeagueTableCard';
import { ChevronRIcon } from '../../icons/ChevronR';
import { useCareerStore } from '../../store/useCareerStore';

const nextFixture = {
    id: "fixture-001",
    team: {
        "id": "40705706",
        "full_name": "Sport Club Internacional",
        "name": "Santos",
        "nicknames": [{ "name": "Peixe", "gender": "m" }],
        "gender": "m",
        "shortName": "SAN",
        "stadium": "8a066d73-881a-42eb-8868-cf407157e9ac",
        "logo": "src/assets/clubs_logos/40705706.png",
        "logo_tiny": "src/assets/clubs_logos/40705706_tiny.png",
        "rivals_ids": ["72275367", "90748914", "55963133"]
    },
    venue: {
        "id": "8a066d73-881a-42eb-8868-cf407157e9ac",
        "name": "Urbano Caldeira Stadium",
        "gender": "f",
        "short_name": "Vila Belmiro",
        "home_teams_ids": ["40705706"],
        "city": "Santos",
        "country": "brazil",
        "capacity": 17872
    },
    date: "2026-05-14",
    time: "20:30",
    competition: {
        "id": "122d50dd-ec76-4254-ac63-e04e510c8ac1",
        "name": "Brasileiro Série A",
        "short_name": "Brasileirão",
        "region": "brazil",
        "season": 2026,
        "standings": [
            {
                "team_id": "90748914",
                "points": 34,
                "played": 15,
                "wins": 10,
                "draws": 4,
                "losses": 1,
                "goals_for": 25,
                "goals_against": 12,
                "goals_diff": 13
            },
            {
                "team_id": "74496781",
                "points": 30,
                "played": 14,
                "wins": 9,
                "draws": 3,
                "losses": 2,
                "goals_for": 27,
                "goals_against": 12,
                "goals_diff": 15
            },
            {
                "team_id": "86586513",
                "points": 27,
                "played": 15,
                "wins": 8,
                "draws": 3,
                "losses": 4,
                "goals_for": 25,
                "goals_against": 20,
                "goals_diff": 5
            },
            {
                "team_id": "55963133",
                "points": 24,
                "played": 15,
                "wins": 7,
                "draws": 3,
                "losses": 5,
                "goals_for": 21,
                "goals_against": 16,
                "goals_diff": 5
            },
            {
                "team_id": "40802544",
                "points": 23,
                "played": 15,
                "wins": 7,
                "draws": 2,
                "losses": 6,
                "goals_for": 20,
                "goals_against": 16,
                "goals_diff": 4
            },
            {
                "team_id": "21891021",
                "points": 22,
                "played": 14,
                "wins": 6,
                "draws": 4,
                "losses": 4,
                "goals_for": 20,
                "goals_against": 18,
                "goals_diff": 2
            },
            {
                "team_id": "87595679",
                "points": 20,
                "played": 15,
                "wins": 6,
                "draws": 2,
                "losses": 7,
                "goals_for": 17,
                "goals_against": 18,
                "goals_diff": -1
            },
            {
                "team_id": "48594781",
                "points": 20,
                "played": 15,
                "wins": 5,
                "draws": 5,
                "losses": 5,
                "goals_for": 21,
                "goals_against": 21,
                "goals_diff": 0
            },
            {
                "team_id": "21276332",
                "points": 20,
                "played": 15,
                "wins": 5,
                "draws": 5,
                "losses": 5,
                "goals_for": 18,
                "goals_against": 19,
                "goals_diff": -1
            },
            {
                "team_id": "43257277",
                "points": 19,
                "played": 14,
                "wins": 5,
                "draws": 4,
                "losses": 5,
                "goals_for": 18,
                "goals_against": 20,
                "goals_diff": -2
            },
            {
                "team_id": "35971878",
                "points": 19,
                "played": 15,
                "wins": 5,
                "draws": 4,
                "losses": 6,
                "goals_for": 20,
                "goals_against": 25,
                "goals_diff": -5
            },
            {
                "team_id": "49823308",
                "points": 18,
                "played": 14,
                "wins": 5,
                "draws": 3,
                "losses": 6,
                "goals_for": 26,
                "goals_against": 27,
                "goals_diff": -1
            },
            {
                "team_id": "79951310",
                "points": 18,
                "played": 15,
                "wins": 5,
                "draws": 3,
                "losses": 7,
                "goals_for": 18,
                "goals_against": 21,
                "goals_diff": -3
            },
            {
                "team_id": "69857423",
                "points": 18,
                "played": 15,
                "wins": 4,
                "draws": 6,
                "losses": 5,
                "goals_for": 16,
                "goals_against": 16,
                "goals_diff": 0
            },
            {
                "team_id": "40705706",
                "points": 18,
                "played": 15,
                "wins": 4,
                "draws": 6,
                "losses": 5,
                "goals_for": 21,
                "goals_against": 22,
                "goals_diff": -1
            },
            {
                "team_id": "72275367",
                "points": 18,
                "played": 15,
                "wins": 4,
                "draws": 6,
                "losses": 5,
                "goals_for": 13,
                "goals_against": 15,
                "goals_diff": -2
            },
            {
                "team_id": "59318961",
                "points": 17,
                "played": 15,
                "wins": 4,
                "draws": 5,
                "losses": 6,
                "goals_for": 15,
                "goals_against": 17,
                "goals_diff": -2
            },
            {
                "team_id": "79859601",
                "points": 13,
                "played": 14,
                "wins": 3,
                "draws": 4,
                "losses": 7,
                "goals_for": 16,
                "goals_against": 20,
                "goals_diff": -4
            },
            {
                "team_id": "64334201",
                "points": 12,
                "played": 15,
                "wins": 2,
                "draws": 6,
                "losses": 7,
                "goals_for": 16,
                "goals_against": 25,
                "goals_diff": -9
            },
            {
                "team_id": "41051526",
                "points": 9,
                "played": 14,
                "wins": 1,
                "draws": 6,
                "losses": 7,
                "goals_for": 14,
                "goals_against": 27,
                "goals_diff": -13
            }
        ],
        "zones": {
            "libertadores": [1, 2, 3, 4],
            "pre_libertadores": [5, 6],
            "sulamericana": [7, 8, 9, 10, 11, 12],
            "relegation": [17, 18, 19, 20]
        }
    },
    is_neutral_ground: false,
    round: {
        type: "league", // "league", "group", "knockout"
        key: "matchday_16",    // Chave para tradução
        current_leg: 1,
        total_legs: 2,
        display_label: "round_label_key" // Referência para tradução
    }
};

const CompetitionTable: React.FC<{ saveData: SaveData, translucent?: boolean, opponentId?: string }> = ({ saveData, translucent = false, opponentId = null }) => {
    const { currentTeam } = useCareerStore();
    if (!currentTeam) return null;
    const isTeamColorBlack = currentTeam.colors.primary[500] === "#000"

    return (
        <div className={`flex-1 ${translucent ? "bg-[#111]/50" : "bg-[#111]"} rounded-4xl border border-white/5 p-6 flex flex-col overflow-hidden`}>
            <span
                className={`flex justify-between items-center mb-4 group cursor-pointer text-gray-500 ${isTeamColorBlack ? "hover:text-white" : "hover:text-(--team-color-400)"} transition-colors`}
            >
                <h3 className="text-xs font-black uppercase tracking-widest">{nextFixture.competition.short_name}</h3>
                <ChevronRIcon className="w-4 mr-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <LeagueTableCard
                standings={nextFixture.competition.standings}
                zones={nextFixture.competition.zones}
                selectedTeamId={saveData.teamId}
                opponentId={opponentId}
            />
        </div>
    );
}

export default CompetitionTable;