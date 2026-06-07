import { create } from "zustand";
import _initial_competitions from "../data/competitions.json";
import _initial_fixtures from "../data/fixtures.json";
import _venues from "../data/venues.json";
import _initial_teams from "../data/teams.json";
import _referees from "../data/referees.json";
import { getTeamSquadPlayers } from "../data/teamSquads";

const venues = _venues as StadiumMap;
const initial_teams = _initial_teams as unknown as Team[];
const referees = _referees as Referee[];
const initial_competitions = _initial_competitions as unknown as Record<
  string,
  CompetitionData
>;
const initial_fixtures = _initial_fixtures as unknown as Record<
  string,
  Record<string, Competition_Fixture_Obj>
>;

const stableIndexFromId = (id: string, length: number): number => {
  if (length <= 0) return 0;
  const hash = id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return hash % length;
};

const resolveFixtureRefereeId = (fixture: Competition_Fixture_Obj): string | null => {
  if (fixture.refereeId) return fixture.refereeId;
  return referees[stableIndexFromId(fixture.id, referees.length)]?.id ?? null;
};

const buildFixtureSquadRelation = (
  fixture: Competition_Fixture_Obj,
): NonNullable<Competition_Fixture_Obj["squadRelation"]> => {
  const pickRelated = (teamId: string) =>
    getTeamSquadPlayers(teamId)
      .filter((player) => Boolean(player?.id))
      .sort((a, b) => b.technical_profile.overall - a.technical_profile.overall)
      .slice(0, 18)
      .map((player) => player.id);

  return {
    home: fixture.squadRelation?.home?.length ? fixture.squadRelation.home : pickRelated(fixture.homeTeam),
    away: fixture.squadRelation?.away?.length ? fixture.squadRelation.away : pickRelated(fixture.awayTeam),
    announcedAt: fixture.squadRelation?.announcedAt,
  };
};

interface CompetitionsState {
  competitions: Record<string, CompetitionData>;
  fixtures: Record<string, Record<string, Competition_Fixture_Obj>>;

  getFixtureData: (competitionId: string, fixtureId: string) => Fixture;
  updateMatchResult: (
    competitionId: string,
    matchId: string,
    score: { home: number; away: number },
    extraDetails?: {
      stats?: MatchStats;
      playerStats?: MatchPlayerStats;
      events?: MatchEvent[];
    },
  ) => void;
  recalculateTable: (competitionId: string) => StandingRow[];
  getTeamCalendar: (teamId: string) => Fixture[];
  getTeamFixturesForDate: (teamId: string, date: string) => Fixture[];
  getNextMatchFromDate: (teamId: string, currentDate: string) => Fixture | null;
  getNextMatch: (teamId: string) => Fixture | null; // se for nulo eh pq acabou a temporada
}

export const useCompetitionsStore = create<CompetitionsState>((set, get) => ({
  competitions: initial_competitions,
  fixtures: initial_fixtures,

  getFixtureData: (competitionId, fixtureId) => {
    const comp = get().competitions[competitionId];
    const fixtures = get().fixtures[competitionId];
    if (!comp) throw new Error(`Competição ${competitionId} não encontrada`);

    const fixture = fixtures[fixtureId];
    if (!fixture) throw new Error(`Partida ${fixtureId} não encontrada`);

    const homeTeamFound = initial_teams.find(
      (team) => team.id === fixture.homeTeam,
    );
    const awayTeamFound = initial_teams.find(
      (team) => team.id === fixture.awayTeam,
    );

    if (!homeTeamFound || !awayTeamFound) {
      throw new Error(
        `Times da partida ${fixtureId} não foram encontrados no banco de dados.`,
      );
    }
    return {
      ...fixture,
      refereeId: resolveFixtureRefereeId(fixture) ?? undefined,
      squadRelation: buildFixtureSquadRelation(fixture),
      competition: comp,
      venue: venues[fixture.venue],
      homeTeam: homeTeamFound,
      awayTeam: awayTeamFound,
      referee:
        referees.find((referee) => referee.id === resolveFixtureRefereeId(fixture)) ??
        null,
    } as Fixture;
  },

  updateMatchResult: (competitionId, matchId, score, extraDetails) => {
    set((state) => {
      const comp = state.competitions[competitionId];
      const fixtures = get().fixtures[competitionId];

      if (!comp || !fixtures[matchId]) return state;

      const updatedFixture: Competition_Fixture_Obj = {
        ...fixtures[matchId],
        status: "finished",
        score: score,
        stats: extraDetails?.stats || null,
        playerStats: extraDetails?.playerStats || null,
        events: extraDetails?.events || [],
      };

      return {
        competitions: {
          ...state.competitions,
          [competitionId]: {
            ...comp,
            fixtures: {
              ...fixtures,
              [matchId]: updatedFixture,
            },
          },
        },
      };
    });

    get().recalculateTable(competitionId);
  },

  recalculateTable: (competitionId) => {
    const state = get();
    const comp = state.competitions[competitionId];
    const fixtures = get().fixtures[competitionId];
    if (!comp) return [];

    const standingsMap: Record<string, StandingRow> = {};

    Object.values(fixtures).forEach((fixture) => {
      [fixture.homeTeam, fixture.awayTeam].forEach((id) => {
        if (!standingsMap[id]) {
          standingsMap[id] = {
            team_id: id,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals_for: 0,
            goals_against: 0,
            goals_diff: 0,
            points: 0,
          };
        }
      });

      if (fixture.status === "finished") {
        const homeScore = fixture.score.home;
        const awayScore = fixture.score.away;

        const homeRow = standingsMap[fixture.homeTeam];
        const awayRow = standingsMap[fixture.awayTeam];

        homeRow.played += 1;
        awayRow.played += 1;
        homeRow.goals_for += homeScore;
        homeRow.goals_against += awayScore;
        awayRow.goals_for += awayScore;
        awayRow.goals_against += homeScore;

        if (homeScore > awayScore) {
          homeRow.wins += 1;
          homeRow.points += 3;
          awayRow.losses += 1;
        } else if (awayScore > homeScore) {
          awayRow.wins += 1;
          awayRow.points += 3;
          homeRow.losses += 1;
        } else {
          homeRow.draws += 1;
          homeRow.points += 1;
          awayRow.draws += 1;
          awayRow.points += 1;
        }

        homeRow.goals_diff = homeRow.goals_for - homeRow.goals_against;
        awayRow.goals_diff = awayRow.goals_for - awayRow.goals_against;
      }
    });

    const sortedStandings = Object.values(standingsMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goals_diff !== a.goals_diff) return b.goals_diff - a.goals_diff;
      return b.goals_for - a.goals_for;
    });

    set((currentState) => ({
      competitions: {
        ...currentState.competitions,
        [competitionId]: {
          ...currentState.competitions[competitionId],
          standings: sortedStandings,
        },
      },
    }));

    return sortedStandings;
  },
  getTeamCalendar: (teamId) => {
    const { competitions, getFixtureData, fixtures: allFixtures } = get();
    const teamFixtures: Fixture[] = [];

    const compKeys = Object.keys(competitions);
    if (compKeys.length === 0) return [];

    Object.values(competitions).forEach((comp) => {
      const compFixtures = allFixtures[comp.id];
      if (!compFixtures) return;

      Object.values(compFixtures).forEach((fixture) => {
        const isHome =
          String(fixture.homeTeam).trim() === String(teamId).trim();
        const isAway =
          String(fixture.awayTeam).trim() === String(teamId).trim();

        if (isHome || isAway) {
          try {
            const fullFixture = getFixtureData(comp.id, fixture.id);
            if (
              fullFixture &&
              fullFixture.homeTeam &&
              fullFixture.awayTeam &&
              fullFixture.venue
            ) {
              teamFixtures.push(fullFixture);
            }
          } catch (e: unknown) {
            console.error(
              `❌ [DEBUG CALENDÁRIO] Erro ao montar partida ${fixture.id}:`,
              e instanceof Error ? e.message : String(e),
            );
          }
        }
      });
    });

    return [...teamFixtures].sort((a, b) => {
      if (!a.date || !a.time || !b.date || !b.time) return 0;
      const dateTimeA = new Date(`${a.date}T${a.time}:00`);
      const dateTimeB = new Date(`${b.date}T${b.time}:00`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
  },

  getNextMatch: (teamId) => {
    const calendar = get().getTeamCalendar(teamId);
    if (!calendar || calendar.length === 0) return null;

    const upcomingMatches = calendar.filter(
      (fixture) =>
        fixture &&
        fixture.status === "not_started",
    );

    return upcomingMatches.length > 0 ? upcomingMatches[0] : null;
  },

  getTeamFixturesForDate: (teamId, date) => {
    const calendar = get().getTeamCalendar(teamId);
    return calendar.filter((fixture) => fixture.date === date);
  },

  getNextMatchFromDate: (teamId, currentDate) => {
    const calendar = get().getTeamCalendar(teamId);
    if (!calendar || calendar.length === 0) return null;
    const currentTime = new Date(`${currentDate}T00:00:00`).getTime();
    const upcomingMatches = calendar.filter(
      (fixture) =>
        fixture &&
        fixture.status === "not_started" &&
        new Date(`${fixture.date}T23:59:59`).getTime() >= currentTime,
    );

    return upcomingMatches.length > 0 ? upcomingMatches[0] : null;
  },
}));
