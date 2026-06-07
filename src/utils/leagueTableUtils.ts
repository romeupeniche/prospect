export const getSortedLeagueTable = (
  standings: TeamStats[],
  teams: Team[],
): TableRow[] => {
  return [...standings]
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.goals_diff !== a.goals_diff) return b.goals_diff - a.goals_diff;
      if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
      return 0;
    })
    .map((stat, index) => {
      const teamData = teams.find((t) => t.id === stat.team_id);

      return {
        ...stat,
        position: index + 1,
        team_name: teamData?.name || "Desconhecido",
        full_name: teamData?.full_name || "Desconhecido",
        short_name: teamData?.shortName || "---",
        logo: teamData?.logo || "",
        logo_tiny: teamData?.logo_tiny || "",
        performance:
          stat.played > 0
            ? Number(((stat.points / (stat.played * 3)) * 100).toFixed(1))
            : 0,
      };
    });
};

export const getPositionZoneClass = (
  position: number,
  zones: LeagueZones,
): string => {
  if (zones.libertadores.includes(position)) return "zone-libertadores";
  if (zones.pre_libertadores.includes(position)) return "zone-pre-libertadores";
  if (zones.sulamericana.includes(position)) return "zone-sulamericana";
  if (zones.relegation.includes(position)) return "zone-relegation";
  return "zone-neutral";
};
