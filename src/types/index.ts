declare global {
  type Gender = "m" | "f" | "g";

  interface Nickname {
    name: string;
    gender: Gender;
  }

  interface Stadium {
    id: string;
    name: string;
    gender: Gender;
    short_name: string;
    home_teams_ids: string[];
    city: string;
    country: string;
    capacity: number;
  }

  type StadiumMap = Record<string, Stadium>;

  interface Uniform {
    image: string;
    pattern: "hoops" | "halves" | "graphic" | "striped" | "solid";
    kit_group: "white" | "colored" | "black";
    base_colors: [
      (
        | "black"
        | "white"
        | "red"
        | "blue"
        | "green"
        | "yellow"
        | "garnet"
        | "gold"
      ),
      "brown",
      "navy",
      "pink",
      "purple",
    ][];
    hex_colors: {
      primary: string;
      secondary: string;
      detail: string;
    };
    tone: number;
  }

  interface UniformMap {
    home: Uniform;
    away: Uniform;
    third: Uniform;
  }

  interface Team {
    id: string;
    full_name: string;
    name: string;
    nicknames: Nickname[];
    gender: Gender;
    shortName: string;
    stadiumId: string;
    logo: string;
    logo_tiny: string;
    rivals_ids: string[];
    colors: {
      primary: {
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
      };
      secondary: string;
      contrast: "light" | "dark";
    };
    uniforms: {
      home: Uniform;
      away: Uniform;
      third: Uniform;
    };
    trainerId: string;
    domestic_prestige?: number;
    international_prestige?: number;
    transfer_budget?: number;
    squad_value?: number;
  }

  interface TeamStats {
    team_id: string;
    points: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goals_diff: number;
  }

  interface TableRow extends TeamStats {
    position: number;
    team_name: string;
    short_name: string;
    logo: string;
    logo_tiny: string;
    performance: number;
  }

  interface SaveData {
    managerName: string;
    teamId: string;
    currentDate: string;
    saveName: string;
    saveVersion: string;
    lastPlayed: string;
  }

  interface Player {
    id: string;
    team_id: string;
    personal: PlayerPersonal;
    contract: PlayerContract;
    technical_profile: PlayerTechnicalProfile;
    attributes: PlayerAttributes;
  }

  interface PlayerPersonal {
    name: string;
    short_name: string;
    birth_date: string;
    height_cm: number;
    weight_kg: number;
    nationality: string;
    preferred_foot: "R" | "L";
    photo_url: string;
  }

  interface PlayerContract {
    market_value: number;
    wage: number;
    valid_until: string;
    kit_number: number;
    ownership_type: "permanent" | "loan";
    origin_club_id: string;
    is_transfer_listed: boolean;
    is_untouchable: boolean;
    clause_release_domestic: number;
    clause_release_international: number;
  }

  interface PlayerTechnicalProfile {
    overall: number;
    potential: number;
    best_position: string;
    positions: string[];
    skill_moves: number;
    weak_foot: number;
    reputation: number;
  }

  interface PlayerAttributes {
    attacking: AttackingAttributes;
    skill: SkillAttributes;
    movement: MovementAttributes;
    power: PowerAttributes;
    mentality: MentalityAttributes;
    defending: DefendingAttributes;
  }

  interface AttackingAttributes {
    crossing: number;
    finishing: number;
    heading_accuracy: number;
    short_passing: number;
    volleys: number;
  }

  interface SkillAttributes {
    dribbling: number;
    ball_control: number;
    curve: number;
    long_passing: number;
    fk_accuracy: number;
  }

  interface MovementAttributes {
    acceleration: number;
    sprint_speed: number;
    agility: number;
    reactions: number;
    balance: number;
  }

  interface PowerAttributes {
    shot_power: number;
    stamina: number;
    strength: number;
    jumping: number;
    long_shots: number;
  }

  interface MentalityAttributes {
    attack_position: number;
    vision: number;
    penalties: number;
    composure: number;
    interceptions: number;
    aggression: number;
  }

  interface DefendingAttributes {
    defensive_awareness: number;
    standing_tackle: number;
    sliding_tackle: number;
  }

  // ---------------------------------------- fixture

  interface MatchStats {
    // { home: X, away: Y }
    possession: TeamStatPair<number>; // (em %)
    shotsTotal: TeamStatPair<number>; // Finalizações totais
    shotsOnTarget: TeamStatPair<number>; // No gol
    shotsOffTarget: TeamStatPair<number>; // Pra fora
    blockedShots: TeamStatPair<number>; // Chutes travados
    cornerKicks: TeamStatPair<number>; // Escanteios
    offsides: TeamStatPair<number>; // Impedimentos
    fouls: TeamStatPair<number>; // Faltas cometidas
    yellowCards: TeamStatPair<number>; // Cartões amarelos
    redCards: TeamStatPair<number>; // Cartões vermelhos
    bigChances: TeamStatPair<number>; // Grandes chances criadas
    bigChancesMissed: TeamStatPair<number>; // Grandes chances perdidas
    goalkeeperSaves: TeamStatPair<number>; // Defesas do goleiro
    passesTotal: TeamStatPair<number>; // Passes tentados
    passesAccurate: TeamStatPair<number>; // Passes certos
    tackles: TeamStatPair<number>; // Desarmes bem-sucedidos
  }

  interface TeamStatPair<T> {
    home: T;
    away: T;
  }

  interface MatchPlayerStats {
    home: Record<string, PlayerPerformance>; // Key: player_id, Value: dados do jogador
    away: Record<string, PlayerPerformance>;
  }

  interface PlayerPerformance {
    playerId: string;
    name: string;
    rating: number; // Nota Sofascore de 0.0 a 10.0
    isFirstEleven: boolean; // Titular? (Se false, entrou no banco)
    minutesPlayed: number; // Minutos em campo

    // Ataque / Geral
    goals: number;
    assists: number;
    shotsTotal: number;
    shotsOnTarget: number;
    bigChancesCreated: number;
    bigChancesMissed: number;

    // Passes e Criação
    passesTotal: number;
    passesAccurate: number;
    keyPasses: number; // Passes que geraram finalização
    crossesTotal: number;
    crossesAccurate: number;
    longBallsTotal: number;
    longBallsAccurate: number;

    // Defesa e Duelos
    tackles: number; // Desarmes
    interceptions: number; // Interceptações
    clearances: number; // Rebatidas/Cortes
    blockedShots: number; // Chutes bloqueados na defesa
    duelsGroundTotal: number; // Duelos no chão tentados
    duelsGroundWon: number; // Duelos no chão ganhos
    duelsAerialTotal: number; // Duelos aéreos tentados
    duelsAerialWon: number; // Duelos aéreos ganhos
    dispossessed: number; // Bolas perdidas
    foulsCommitted: number; // Faltas cometidas
    foulsDrawn: number; // Faltas sofridas

    // Exclusivo para Goleiros (opcional colocar aqui ou nulo para linha)
    goalkeeper?: {
      saves: number;
      savesInsideBox: number; // Defesas de chutes de dentro da área
      punches: number; // Socos na bola
      highClaims: number; // Bolas aéreas capturadas
    };
  }

  interface MatchEvent {
    minute: number;
    extraMinute?: number; // Para gols/cartões nos acréscimos (ex: 45+2)
    team: "home" | "away";
    type: "goal" | "card" | "substitution" | "var";
    playerId: string; // Jogador principal envolvido
    detail: string; // Ex: "Regular Goal", "Yellow Card", "Own Goal", "Penalty"
    assistPlayerId?: string; // ID de quem deu a assistência (se for gol)
    playerInId?: string; // Se for substituição, quem entrou
    playerOutId?: string; // Se for substituição, quem saiu
  }

  interface Competition_Fixture_Obj {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    homeTeam: string; // id dos times
    awayTeam: string;
    refereeId?: string;
    squadRelation?: {
      home: string[];
      away: string[];
      announcedAt?: string;
    };
    round: string; // Numero da rodada ou "semifinal", "final", etc
    venue: string; // id do estadio
    is_neutral_ground: boolean;
    status: "not_started" | "in_progress" | "finished";
    score: {
      home: number;
      away: number;
    };
    stats: MatchStats | null;
    playerStats: MatchPlayerStats | null;
    events: MatchEvent[];
  }

  type LeagueZones = Record<string, number[]>;

  type Fixture = Competition_Fixture_Obj & {
    competition: CompetitionData;
    venue: Stadium;
    homeTeam: Team;
    awayTeam: Team;
    referee: Referee | null;
  };

  // ---------------------------------------- end fixture

  // ---------------------------------------- competition
  interface StandingRow {
    team_id: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goals_diff: number;
    points: number;
  }
  interface CompetitionData {
    id: string;
    icon: string;
    bg_art: string;
    name: string;
    short_name: string;
    region: "brazil" | "south-america" | "global";
    season: number;
    standings: StandingRow[]; // Tabela ordenada
    zones: LeagueZones;
  }

  // ---------------------------------------- end competition

  export interface Referee {
    id: string;
    fullName: string;
    shortName: string;
    foulStrictness: number; // 0 (deixa correr) a 1 (marca tudo)
    cardStrictness: number; // 0 (controla no papo) a 1 (aplica cartão fácil)
    stoppageGenerosity: number; // 0 (acréscimos curtos) a 1 (padrão Copa do Mundo/acréscimos longos)
    photo: string;
  }

  export interface NewsContext {
    teamA?: string;
    teamB?: string;
    competition?: string;
    stage?: string; // "jogo", "final", "semifinal", "quartas de final"
    player?: string; // Usado para jogador principal
    playerA?: string; // Usado para dinâmicas de dois jogadores (ex: substituição)
    playerB?: string;
    playerList?: string[]; // Para listas gramaticais (Time da Semana, relacionados)
    position?: string;
    injuryName?: string;
    duration?: string; // "3 semanas", "2 meses"
    age?: number | string;
    matchCount?: number | string;
    goalsCount?: number | string;
    marketValue?: string;
    minute?: number | string;
    teamAScore?: number | string;
    teamBScore?: number | string;
    directorName?: string;
    tvChannels?: string; // "Globo, SporTV e Premiere"
    refereeName?: string;
    refereeFoulStrictness?: string;
    refereeCardStrictness?: string;
    refereeStoppageGenerosity?: string;

    // Flags Booleanas para as Condicionais {}
    isRival?: boolean;
    isHomegrown?: boolean; // Se foi revelado na base
    isHighFoulStrictness?: boolean;
    isHighCardStrictness?: boolean;
    isHighStoppageGenerosity?: boolean;
  }

  export interface NewsTemplate {
    title: string[];
    subtitle: string[];
    date: string;
    description: string[];
    category: "rumors" | "team_of_the_month" | "match" | "transfers" | "team";
  }

  export interface NewsTemplate {
    title: string[];
    subtitle: string[];
    date: string;
    description: string[];
    category: "rumors" | "team_of_the_month" | "match" | "transfers" | "team";
  }
}

export {};
