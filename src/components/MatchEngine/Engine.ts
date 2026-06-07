export type MatchPhase =
  | "PRE_MATCH"
  | "KICK_OFF"
  | "FIRST_HALF"
  | "HALFTIME"
  | "SECOND_HALF"
  | "SET_PIECE"
  | "STOPPAGE"
  | "FULL_TIME";

/** Per-player AI behaviour token — used by the renderer */
export type AIState =
  | "IDLE" // Stationed at formation anchor
  | "SUPPORT" // Moving to open passing triangle
  | "PRESS" // Closing down opponent ball-carrier
  | "COVER" // Covering space as second defender
  | "INTERCEPT" // Running to loose ball
  | "CHASE_OWN_TOUCH" // Recovering a self-touched ball before any next action
  | "DRIBBLE" // Carrier advancing to goal
  | "RETURN" // Sprinting back to shape
  | "GK_SET" // Keeper tracking ball on goal-line
  | "GK_CLAIM" // Keeper claiming ball inside box
  | "SET_PIECE"; // Restart shape for throw-ins/free-kicks/goal-kicks

export type BallStatus = "GROUNDED" | "AIRBORNE" | "BOUNCING" | "CONTROLLED";

/** Rectangular zone of responsibility for each roster slot */
export interface Zone {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface EnginePlayer {
  id: string;
  name: string;
  number: number;
  team: "home" | "away";
  position: string; // FIFA-style: GK / CB / CM / ST …

  // Current world position (0-100 in both axes)
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingX: number;
  facingY: number;

  // Formation anchor — players lerp back here when disengaged
  baseX: number;
  baseY: number;

  // Zone of responsibility
  zone: Zone;

  // Normalised attributes (0–1)
  speed: number;
  passing: number;
  shooting: number;
  crossing: number;
  vision: number; // Controls passing range & target quality
  curve: number;
  reaction: number;
  ballControl: number;
  positioning: number;
  composure: number;
  defending: number;
  tackling: number;
  interceptions: number;
  aggression: number;
  jumping: number;
  longPassing: number;
  dribbling: number;
  overall: number;
  gkHandling: number; // GK catching ability (0-1)
  strength: number; // Team-level relative strength (0-1)
  heightCm: number;

  // Runtime
  attackingRight?: boolean;
  stamina: number;
  startingStamina: number;
  hasBall: boolean;
  aiState: AIState;
  decisionCooldown: number;
  dribbleTouchCooldown: number;
  substitutionSlot: number;
  targetX: number;
  targetY: number;
  lastPassTargetId: string | null;
  consecutivePasses: number;
  possessionFlipCount: number;
  matchStats: PlayerStatsState;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
  vz: number;
  status: BallStatus;
  flight?: "ground" | "driven" | "lofted";
  curveX?: number;
  curveY?: number;
  ownerId: string | null;
  lastOwnerId: string | null; // for possession transition detection
  intendedReceiverId: string | null;
  intendedTeam: "home" | "away" | null;
  offsideReceiverId: string | null;
  interceptionOpenTime: number;
  controlOffsetX?: number;
  controlOffsetY?: number;
  controlOwnerId?: string;
  controlState?: OwnerBallControlState;
  lastTouchTime?: number;
  lastTouchOwnerId?: string;
  chaseTargetX?: number;
  chaseTargetY?: number;
}

export interface TeamStatsState {
  possession: number;
  shotsOnTarget: number;
  shotsTotal: number;
  shotsOffTarget: number;
  blockedShots: number;
  shotsInsideBox: number;
  shotsOutsideBox: number;
  hitWoodwork: number;
  headedGoals: number;
  bigChances: number;
  expectedGoals: number;
  xGOnTarget: number;
  cornerKicks: number;
  passesTotal: number;
  passesAccurate: number;
  passAccuracy: number;
  yellowCards: number;
  redCards: number;
  penaltiesWon: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  touchesInOppositionBox: number;
  accurateThroughPasses: number;
  offsides: number;
  freeKicks: number;
  longPassesTotal: number;
  longPassesAccurate: number;
  finalThirdPassesTotal: number;
  finalThirdPassesAccurate: number;
  crossesTotal: number;
  crossesAccurate: number;
  expectedAssists: number;
  throwIns: number;
  fouls: number;
  tacklesTotal: number;
  tacklesWon: number;
  duelsTotal: number;
  duelsWon: number;
  clearances: number;
  interceptions: number;
  errorsLeadingToShot: number;
  errorsLeadingToGoal: number;
  goalkeeperSaves: number;
  xGOTFaced: number;
  goalsConceded: number;
  goalsPrevented: number;
}

export interface PlayerStatsState {
  rating: number;
  totalShots: number;
  expectedGoals: number;
  accuratePasses: number;
  totalPasses: number;
  touches: number;
  touchesInOppositionBox: number;
  successfulDribbles: number;
  goals: number;
  xGOnTarget: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  blockedShots: number;
  shotsInsideBox: number;
  shotsOutsideBox: number;
  headedShots: number;
  bigChancesMissed: number;
  bigChancesTotal: number;
  foulsSuffered: number;
  offsides: number;
  bigChancesCreated: number;
  keyPasses: number;
  assists: number;
  expectedAssists: number;
  finalThirdPassesTotal: number;
  finalThirdPassesAccurate: number;
  longPassesTotal: number;
  longPassesAccurate: number;
  crossesTotal: number;
  crossesAccurate: number;
  duelsTotal: number;
  duelsWon: number;
  aerialDuelsTotal: number;
  aerialDuelsWon: number;
  groundDuelsTotal: number;
  groundDuelsWon: number;
  tacklesTotal: number;
  tacklesWon: number;
  foulsCommitted: number;
  interceptions: number;
  clearances: number;
  errorsLeadingToGoal: number;
  errorsLeadingToShot: number;
  goalkeeperSaves: number;
  goalsConceded: number;
  goalsPrevented: number;
  xGOTFaced: number;
  punches: number;
  throws: number;
  actsAsSweeper: number;
  minutesPlayed: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
}

export interface MatchStatsState {
  home: TeamStatsState;
  away: TeamStatsState;
  firstHalf: {
    home: TeamStatsState;
    away: TeamStatsState;
  };
  secondHalf: {
    home: TeamStatsState;
    away: TeamStatsState;
  };
}

export interface MatchEventState {
  id: string; // Stable unique key for React rendering
  minute: string;
  team: "home" | "away";
  type:
    | "goal"
    | "foul"
    | "substitution"
    | "shot"
    | "halftime"
    | "fulltime"
    | "pass"
    | "tackle"
    | "kickoff"
    | "throw_in"
    | "free_kick"
    | "goal_kick"
    | "corner_kick"
    | "penalty"
    | "yellow_card"
    | "red_card"
    | "cross"
    | "save";
  text: string;
}

export interface PendingSubstitution {
  team: "home" | "away";
  playerOutId: string;
  playerOutName: string;
  playerInName: string;
  isManual: boolean;
}

type RawPlayerData = {
  id?: string;
  position?: string;
  personal?: { short_name?: string; name?: string; height_cm?: number };
  contract?: { kit_number?: number };
  technical_profile?: { best_position?: string; overall?: number };
  attributes?: Record<string, Record<string, number> | undefined>;
};

export interface MatchState {
  time: number;
  phase: MatchPhase;
  stoppageTime: number;
  displayTime: string;
  homeScore: number;
  awayScore: number;
  players: EnginePlayer[];
  activePlayers: EnginePlayer[];
  ball: Ball;
  stats: MatchStatsState;
  events: MatchEventState[];
  pendingSubstitutions: PendingSubstitution[];
  speed: number;
  isPaused: boolean;
  isFinished: boolean;
}

// ── Behavior Tree Framework ────────────────────────────────────

export type BTResult = "success" | "failure" | "running";

export interface BTContext {
  readonly player: EnginePlayer;
  readonly ball: Readonly<Ball>;
  readonly allPlayers: readonly EnginePlayer[];
  readonly opponents: readonly EnginePlayer[];
  readonly teammates: readonly EnginePlayer[];
  readonly isHome: boolean;
  readonly goalX: number;
  readonly distToGoal: number;
  readonly pressureDist: number;
  readonly laneClearance: number;
  readonly forwardRoom: number;
  readonly actions?: EngineActions;
}

export abstract class BTNode {
  abstract evaluate(ctx: BTContext): BTResult;
}

export class BTSelector extends BTNode {
  constructor(private children: BTNode[]) { super(); }
  evaluate(ctx: BTContext): BTResult {
    for (const child of this.children) {
      if (child.evaluate(ctx) === "success") return "success";
    }
    return "failure";
  }
}

export class BTSequence extends BTNode {
  constructor(private children: BTNode[]) { super(); }
  evaluate(ctx: BTContext): BTResult {
    for (const child of this.children) {
      if (child.evaluate(ctx) === "failure") return "failure";
    }
    return "success";
  }
}

export class BTCondition extends BTNode {
  constructor(private predicate: (ctx: BTContext) => boolean) { super(); }
  evaluate(ctx: BTContext): BTResult {
    return this.predicate(ctx) ? "success" : "failure";
  }
}

export class BTAction extends BTNode {
  constructor(private action: (ctx: BTContext) => BTResult) { super(); }
  evaluate(ctx: BTContext): BTResult {
    return this.action(ctx);
  }
}

const PITCH_LENGTH_M = 105;
const PITCH_WIDTH_M = 68;
const PENALTY_AREA_DEPTH_M = 16.5;
const PENALTY_AREA_WIDTH_M = 40.32;
const GOAL_AREA_DEPTH_M = 5.5;
const GOAL_WIDTH_M = 7.32;
const GOAL_HEIGHT_M = 2.44;
const PENALTY_BOX_BUFFER_M = 2;

const pitchX = (metres: number): number => (metres / PITCH_LENGTH_M) * 100;
const pitchY = (metres: number): number => (metres / PITCH_WIDTH_M) * 100;

const HOME_BOX_MAX_X = pitchX(PENALTY_AREA_DEPTH_M);
const AWAY_BOX_MIN_X = 100 - HOME_BOX_MAX_X;
const BOX_MIN_Y = 50 - pitchY(PENALTY_AREA_WIDTH_M) / 2;
const BOX_MAX_Y = 50 + pitchY(PENALTY_AREA_WIDTH_M) / 2;

// Minimum distance outfield defenders must maintain from penalty box.
// This mirrors the rendered pitch scale instead of using visual-only magic numbers.
const DEFENDER_MIN_X = HOME_BOX_MAX_X + pitchX(PENALTY_BOX_BUFFER_M);
const DEFENDER_MAX_X = AWAY_BOX_MIN_X - pitchX(PENALTY_BOX_BUFFER_M);

const HOME_GK_LINE_X = pitchX(GOAL_AREA_DEPTH_M);
const AWAY_GK_LINE_X = 100 - HOME_GK_LINE_X;

const GOAL_MIN_Y = 50 - pitchY(GOAL_WIDTH_M) / 2;
const GOAL_MAX_Y = 50 + pitchY(GOAL_WIDTH_M) / 2;
const GOAL_WIDTH_UNITS = GOAL_MAX_Y - GOAL_MIN_Y;
const POST_COLLISION_RADIUS = pitchY(0.32);
const CROSSBAR_COLLISION_RADIUS = 0.28;

const INTERCEPT_RADIUS = 1.15;
const RECEIVE_RADIUS = 2.45;
const TACKLE_RADIUS = 2.05;
const CONTROL_RADIUS = 0.8;
const DEFENSIVE_COMPRESS = 0.18;
const MATCH_CLOCK_RATE = 0.46;
const PLAYER_MOTION_SCALE = 0.5;
const PLAYER_MOTION_MAX_STEP = 0.68;
const BALL_PHYSICS_SCALE = 100;
const BALL_PHYSICS_MAX_SUBSTEP = 0.42;
const BALL_GRAVITY = 0.052;
const BALL_AIR_DRAG = 0.0065;
const BALL_PITCH_FRICTION = 0.00136;
const BALL_PASS_POWER_FRICTION = 0.00084;
const BALL_GRASS_LINEAR_DRAG = 0.00186;
const BALL_GRASS_SPEED_DRAG = 0.00695;
const BALL_BOUNCE_RESTITUTION = 0.62;
const BALL_BOUNCE_IMPACT_FRICTION = 0.84;
const BALL_BOUNCE_STOP_VZ = 0.024;
const BALL_STOP_SPEED = 0.0074;
const BALL_LOW_CONTROL_HEIGHT = 0.38;
const BALL_HEAD_MIN_HEIGHT = 0.55;
const BALL_HEAD_MAX_HEIGHT = 1.75;
const DRIBBLE_TOUCH_ROLL_FORCE = 0.00058;
const DRIBBLE_TOUCH_MIN_POWER = 0.018;
const DRIBBLE_TOUCH_MAX_POWER = 0.092;
const CARRIER_RECOVERY_RADIUS = 1.52;
const CARRIER_CONTROL_LOSS_RADIUS = 4.85;
const OWNER_CLOSE_CONTROL_BASE = 0.62;
const OWNER_CHASE_MAX_DISTANCE = 3.85;
const LIVE_OWNER_STALL_SECONDS = 0.95;
const LIVE_GLOBAL_STALL_SECONDS = 1.75;
const PRESSURE_RESOLUTION_SECONDS = 0.78;
const PASS_COOLDOWN = 0.42;
const FIRST_TOUCH_COOLDOWN = 0.18;
const SHOT_COOLDOWN = 0.52;
const GK_DISTRIBUTION_COOLDOWN = 0.58;
const SET_PIECE_TAKER_RADIUS = 1.35;
const SET_PIECE_MAX_WAIT = 4.2;

type SetPieceType = "throw_in" | "free_kick" | "goal_kick" | "corner_kick" | "penalty";
type OwnerBallControlState =
  | "CLOSE_CONTROL"
  | "CHASING_OWN_TOUCH"
  | "CONTESTED"
  | "LOOSE"
  | "PASS_IN_FLIGHT"
  | "KEEPER_CLAIMABLE";

// Set to true to enable debug logging to console
const DEBUG = false;
function debugLog(...args: unknown[]): void {
  if (DEBUG) console.log("[MATCH]", ...args);
}

function deterministicUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000000) / 1000000;
}

function deterministicSigned(seed: string, scale = 1): number {
  return (deterministicUnit(seed) - 0.5) * 2 * scale;
}

function playerReachHeight(p: EnginePlayer): number {
  if (p.position === "GK") return 1.7 + p.reaction * 0.35 + p.gkHandling * 0.42;
  const heightBonus = clamp((p.heightCm - 170) / 45, -0.12, 0.32);
  return 1.08 + p.jumping * 0.72 + heightBonus;
}

function canPlayerReachBallHeight(p: EnginePlayer, ball: Ball): boolean {
  if (ball.status === "CONTROLLED") return false;
  if (ball.z <= BALL_LOW_CONTROL_HEIGHT) return true;
  return ball.z >= BALL_HEAD_MIN_HEIGHT && ball.z <= Math.min(BALL_HEAD_MAX_HEIGHT, playerReachHeight(p));
}

function firstTouchControlRadius(p: EnginePlayer, ball: Ball, designedAccurate = false): number {
  if (ball.z > BALL_LOW_CONTROL_HEIGHT) {
    return clamp(2.15 + p.jumping * 1.8 + p.positioning * 0.85, 2.4, 4.7);
  }
  const ballSpeed = Math.hypot(ball.vx, ball.vy);
  const quality = p.ballControl * 0.5 + p.reaction * 0.28 + p.composure * 0.22;
  const speedAllowance = clamp(ballSpeed * 1.45, 0, 0.32);
  const accurateAllowance = designedAccurate ? 0.14 : 0;
  return clamp(0.92 + quality * 0.52 + speedAllowance + accurateAllowance, 1.05, 1.62);
}

function primeReceiverForIncomingBall(receiver: EnginePlayer, ball: Ball, attackDir: 1 | -1): void {
  updatePlayerFacingTowardPoint(receiver, ball.x, ball.y, attackDir, 0, 0.12, 1.55);
}

function applyOpposingAcceleration(v: number, amount: number): number {
  if (Math.abs(v) <= amount) return 0;
  return v - Math.sign(v) * amount;
}

function applyBallHorizontalForces(ball: Ball, step: number): void {
  const speed = Math.hypot(ball.vx, ball.vy);
  if (speed <= 0) return;

  if (ball.status === "GROUNDED") {
    const turfNoise =
      0.92 +
      deterministicUnit(
        `turf:${Math.floor(ball.x * 5)}:${Math.floor(ball.y * 5)}:${Math.floor(speed * 1000)}`,
      ) *
        0.16;
    const rollingResistance = BALL_PITCH_FRICTION * turfNoise;
    const grassDrag =
      BALL_GRASS_LINEAR_DRAG * speed +
      BALL_GRASS_SPEED_DRAG * speed * speed;
    const decel = (rollingResistance + grassDrag) * step;
    const lowSpeedBite = speed < 0.055 ? (0.00042 + (0.055 - speed) * 0.009) * step : 0;
    const nextSpeed = Math.max(0, speed - decel - lowSpeedBite);
    const speedScale = nextSpeed / speed;
    ball.vx *= speedScale;
    ball.vy *= speedScale;
    const postSpeed = Math.hypot(ball.vx, ball.vy);
    if (postSpeed > BALL_STOP_SPEED && postSpeed < 0.055) {
      const wobble =
        (deterministicUnit(
          `turf-wobble:${Math.floor(ball.x * 7)}:${Math.floor(ball.y * 7)}:${Math.floor(postSpeed * 100000)}`,
        ) -
          0.5) *
        0.000035 *
        step;
      ball.vx += (-ball.vy / postSpeed) * wobble;
      ball.vy += (ball.vx / postSpeed) * wobble;
    }
    return;
  }

  const drag = BALL_AIR_DRAG * speed * step;
  ball.vx = applyOpposingAcceleration(ball.vx, drag * Math.abs(ball.vx) / speed);
  ball.vy = applyOpposingAcceleration(ball.vy, drag * Math.abs(ball.vy) / speed);
}

function groundBallPowerForDistance(distance: number, skill: number, restartSafe = false): number {
  // FM-style 2D flow: the ball must roll with visible grass resistance.
  // This estimates only the amount of force needed to arrive near the target,
  // then lets pitch friction finish the roll instead of letting passes skate on.
  const intendedRoll = clamp(distance + (restartSafe ? 0.8 : 0.1), 2.2, restartSafe ? 44 : 34);
  const effectiveGrassDecel =
    BALL_PASS_POWER_FRICTION +
    BALL_PITCH_FRICTION * 0.72 +
    BALL_GRASS_LINEAR_DRAG * 0.06;
  const physicsPower = Math.sqrt(2 * effectiveGrassDecel * intendedRoll);
  const skillLift = 0.82 + clamp(skill, 0.15, 0.98) * 0.075;
  const shortPassSoftener = distance < 12 ? 0.9 + distance * 0.008 : 1;
  const restartLift = restartSafe ? 0.008 : 0;
  return clamp(physicsPower * skillLift * shortPassSoftener + restartLift, 0.074, restartSafe ? 0.36 : 0.325);
}

function dribbleTouchPowerForDistance(distance: number, pressureDist: number, openGrass: boolean): number {
  const targetRoll = clamp(distance, 0.35, openGrass ? 3.35 : 2.35);
  const physicsPower = Math.sqrt(2 * DRIBBLE_TOUCH_ROLL_FORCE * targetRoll);
  const pressureSoftener = pressureDist < 2.4 ? 0.42 : pressureDist < 4.6 ? 0.54 : pressureDist < 7 ? 0.68 : 0.82;
  const spaceLift = openGrass ? 1.1 : 0.86;
  return clamp(
    physicsPower * pressureSoftener * spaceLift,
    DRIBBLE_TOUCH_MIN_POWER,
    openGrass ? 0.078 : 0.052,
  );
}

function curveVector(
  angle: number,
  player: Pick<EnginePlayer, "curve" | "crossing" | "passing" | "shooting">,
  context: "cross" | "long" | "shot",
): { curveX: number; curveY: number } {
  const skill =
    context === "shot"
      ? player.curve * 0.65 + player.shooting * 0.25
      : context === "cross"
        ? player.curve * 0.58 + player.crossing * 0.32
        : player.curve * 0.5 + player.passing * 0.28;
  const base =
    context === "shot"
      ? 0.00012
      : context === "cross"
        ? 0.00018
        : 0.00014;
  const bend =
    base *
    clamp(skill, 0.15, 0.95) *
    (deterministicUnit(`${context}:${angle.toFixed(4)}:${skill.toFixed(4)}`) < 0.5 ? -1 : 1);
  return {
    curveX: Math.cos(angle + Math.PI / 2) * bend,
    curveY: Math.sin(angle + Math.PI / 2) * bend,
  };
}

interface SetPieceState {
  type: SetPieceType;
  team: "home" | "away";
  x: number;
  y: number;
  takerId: string | null;
  timer: number;
  startedAt: number;
  elapsed: number;
}

interface ShotContext {
  team: "home" | "away";
  shooterId: string;
  assisterId: string | null;
  xG: number;
  xGOT: number;
  headed: boolean;
  penalty: boolean;
}

interface PassContext {
  passerId: string;
  team: "home" | "away";
  kind: "pass" | "through" | "long" | "cross";
  accurate: boolean;
  risky: boolean;
  expiresAt: number;
}

interface PendingPassStatsContext {
  passerId: string;
  receiverId: string;
  team: "home" | "away";
  kind: "pass" | "through" | "long" | "cross";
  finalThird: boolean;
  designedAccurate: boolean;
  expiresAt: number;
}

interface PendingErrorContext {
  team: "home" | "away";
  playerId: string;
  opponentTeam: "home" | "away";
  expiresAt: number;
  shotCredited: boolean;
}

interface RefereeProfile {
  rigidity: number;
  foulLeniency: number;
  cardStrictness: number;
  penaltyStrictness: number;
}

interface PendingKickoffContext {
  team: "home" | "away";
  takerId: string;
  targetId: string | null;
  expiresAt: number;
}

interface FormationSlot {
  x: number;
  y: number;
  zone: Zone;
  line: "GK" | "DF" | "MF" | "FW";
}

export const FORMATIONS: Record<
  string,
  (FormationSlot & { diagram: { x: number; y: number } })[]
> = {
  "4-3-3": [
    {
      x: 6,
      y: 50,
      line: "GK",
      diagram: { x: 6, y: 50 },
      zone: { minX: 0, maxX: 17, minY: 28, maxY: 72 },
    },
    {
      x: 26,
      y: 78,
      line: "DF",
      diagram: { x: 38, y: 90 },
      zone: { minX: 22, maxX: 66, minY: 52, maxY: 100 },
    },
    {
      x: 22,
      y: 56,
      line: "DF",
      diagram: { x: 24, y: 65 },
      zone: { minX: 20, maxX: 55, minY: 36, maxY: 78 },
    },
    {
      x: 22,
      y: 44,
      line: "DF",
      diagram: { x: 24, y: 35 },
      zone: { minX: 20, maxX: 55, minY: 22, maxY: 64 },
    },
    {
      x: 26,
      y: 22,
      line: "DF",
      diagram: { x: 38, y: 10 },
      zone: { minX: 22, maxX: 66, minY: 0, maxY: 48 },
    },
    {
      x: 38,
      y: 74,
      line: "MF",
      diagram: { x: 64, y: 74 },
      zone: { minX: 28, maxX: 70, minY: 48, maxY: 95 },
    },
    {
      x: 36,
      y: 50,
      line: "MF",
      diagram: { x: 48, y: 50 },
      zone: { minX: 28, maxX: 66, minY: 28, maxY: 72 },
    },
    {
      x: 38,
      y: 26,
      line: "MF",
      diagram: { x: 64, y: 26 },
      zone: { minX: 28, maxX: 70, minY: 5, maxY: 52 },
    },
    {
      x: 56,
      y: 88,
      line: "FW",
      diagram: { x: 85, y: 88 },
      zone: { minX: 36, maxX: 88, minY: 58, maxY: 100 },
    },
    {
      x: 62,
      y: 50,
      line: "FW",
      diagram: { x: 92, y: 50 },
      zone: { minX: 36, maxX: 88, minY: 28, maxY: 72 },
    },
    {
      x: 56,
      y: 12,
      line: "FW",
      diagram: { x: 85, y: 12 },
      zone: { minX: 36, maxX: 88, minY: 0, maxY: 42 },
    },
  ],
  "4-4-2": [
    {
      x: 6,
      y: 50,
      line: "GK",
      diagram: { x: 6, y: 50 },
      zone: { minX: 0, maxX: 17, minY: 28, maxY: 72 },
    },
    {
      x: 26,
      y: 76,
      line: "DF",
      diagram: { x: 26, y: 76 },
      zone: { minX: 22, maxX: 66, minY: 52, maxY: 100 },
    },
    {
      x: 22,
      y: 56,
      line: "DF",
      diagram: { x: 22, y: 56 },
      zone: { minX: 20, maxX: 55, minY: 36, maxY: 78 },
    },
    {
      x: 22,
      y: 44,
      line: "DF",
      diagram: { x: 22, y: 44 },
      zone: { minX: 20, maxX: 55, minY: 22, maxY: 64 },
    },
    {
      x: 26,
      y: 24,
      line: "DF",
      diagram: { x: 26, y: 24 },
      zone: { minX: 22, maxX: 66, minY: 0, maxY: 48 },
    },
    {
      x: 38,
      y: 76,
      line: "MF",
      diagram: { x: 38, y: 76 },
      zone: { minX: 28, maxX: 72, minY: 50, maxY: 100 },
    },
    {
      x: 35,
      y: 56,
      line: "MF",
      diagram: { x: 35, y: 56 },
      zone: { minX: 26, maxX: 64, minY: 36, maxY: 76 },
    },
    {
      x: 35,
      y: 44,
      line: "MF",
      diagram: { x: 35, y: 44 },
      zone: { minX: 26, maxX: 64, minY: 24, maxY: 64 },
    },
    {
      x: 38,
      y: 24,
      line: "MF",
      diagram: { x: 38, y: 24 },
      zone: { minX: 28, maxX: 72, minY: 0, maxY: 50 },
    },
    {
      x: 58,
      y: 60,
      line: "FW",
      diagram: { x: 58, y: 60 },
      zone: { minX: 36, maxX: 86, minY: 38, maxY: 78 },
    },
    {
      x: 58,
      y: 40,
      line: "FW",
      diagram: { x: 58, y: 40 },
      zone: { minX: 36, maxX: 86, minY: 22, maxY: 62 },
    },
  ],
  "4-2-3-1": [
    {
      x: 6,
      y: 50,
      line: "GK",
      diagram: { x: 6, y: 50 },
      zone: { minX: 0, maxX: 17, minY: 28, maxY: 72 },
    },
    {
      x: 26,
      y: 74,
      line: "DF",
      diagram: { x: 26, y: 74 },
      zone: { minX: 22, maxX: 66, minY: 52, maxY: 100 },
    },
    {
      x: 22,
      y: 56,
      line: "DF",
      diagram: { x: 22, y: 56 },
      zone: { minX: 20, maxX: 55, minY: 36, maxY: 78 },
    },
    {
      x: 22,
      y: 44,
      line: "DF",
      diagram: { x: 22, y: 44 },
      zone: { minX: 20, maxX: 55, minY: 22, maxY: 64 },
    },
    {
      x: 26,
      y: 26,
      line: "DF",
      diagram: { x: 26, y: 26 },
      zone: { minX: 22, maxX: 66, minY: 0, maxY: 48 },
    },
    {
      x: 34,
      y: 62,
      line: "MF",
      diagram: { x: 34, y: 62 },
      zone: { minX: 26, maxX: 60, minY: 38, maxY: 82 },
    },
    {
      x: 34,
      y: 38,
      line: "MF",
      diagram: { x: 34, y: 38 },
      zone: { minX: 26, maxX: 60, minY: 18, maxY: 62 },
    },
    {
      x: 50,
      y: 76,
      line: "MF",
      diagram: { x: 50, y: 76 },
      zone: { minX: 34, maxX: 80, minY: 52, maxY: 100 },
    },
    {
      x: 52,
      y: 50,
      line: "MF",
      diagram: { x: 52, y: 50 },
      zone: { minX: 36, maxX: 82, minY: 28, maxY: 72 },
    },
    {
      x: 50,
      y: 24,
      line: "MF",
      diagram: { x: 50, y: 24 },
      zone: { minX: 34, maxX: 80, minY: 0, maxY: 48 },
    },
    {
      x: 64,
      y: 50,
      line: "FW",
      diagram: { x: 64, y: 50 },
      zone: { minX: 38, maxX: 88, minY: 28, maxY: 72 },
    },
  ],
  "3-5-2": [
    {
      x: 6,
      y: 50,
      line: "GK",
      diagram: { x: 6, y: 50 },
      zone: { minX: 0, maxX: 17, minY: 28, maxY: 72 },
    },
    {
      x: 22,
      y: 68,
      line: "DF",
      diagram: { x: 22, y: 68 },
      zone: { minX: 20, maxX: 54, minY: 46, maxY: 90 },
    },
    {
      x: 20,
      y: 50,
      line: "DF",
      diagram: { x: 20, y: 50 },
      zone: { minX: 18, maxX: 52, minY: 28, maxY: 72 },
    },
    {
      x: 22,
      y: 32,
      line: "DF",
      diagram: { x: 22, y: 32 },
      zone: { minX: 20, maxX: 54, minY: 10, maxY: 54 },
    },
    {
      x: 38,
      y: 88,
      line: "MF",
      diagram: { x: 38, y: 88 },
      zone: { minX: 28, maxX: 74, minY: 68, maxY: 100 },
    },
    {
      x: 38,
      y: 12,
      line: "MF",
      diagram: { x: 38, y: 12 },
      zone: { minX: 28, maxX: 74, minY: 0, maxY: 32 },
    },
    {
      x: 36,
      y: 66,
      line: "MF",
      diagram: { x: 36, y: 66 },
      zone: { minX: 26, maxX: 66, minY: 48, maxY: 86 },
    },
    {
      x: 34,
      y: 50,
      line: "MF",
      diagram: { x: 34, y: 50 },
      zone: { minX: 26, maxX: 64, minY: 28, maxY: 72 },
    },
    {
      x: 36,
      y: 34,
      line: "MF",
      diagram: { x: 36, y: 34 },
      zone: { minX: 26, maxX: 66, minY: 14, maxY: 52 },
    },
    {
      x: 60,
      y: 64,
      line: "FW",
      diagram: { x: 60, y: 64 },
      zone: { minX: 36, maxX: 86, minY: 38, maxY: 78 },
    },
    {
      x: 60,
      y: 36,
      line: "FW",
      diagram: { x: 60, y: 36 },
      zone: { minX: 36, maxX: 86, minY: 22, maxY: 62 },
    },
  ],
};

function positionRank(pos = ""): number {
  if (pos === "GK") return 0;
  if (["LB", "RB", "CB", "LCB", "RCB", "LWB", "RWB"].includes(pos)) return 1;
  if (["CDM", "CM", "LM", "RM"].includes(pos)) return 2;
  if (["CAM", "AM", "SS"].includes(pos)) return 3;
  return 4;
}

function getPlayerPosition(player: RawPlayerData): string {
  return player.position ?? player.technical_profile?.best_position ?? "CM";
}

function ensureGoalkeeperInFirstEleven(players: RawPlayerData[]): RawPlayerData[] {
  const ordered = [...players];
  const firstEleven = ordered.slice(0, 11);
  if (firstEleven.some((p) => getPlayerPosition(p) === "GK")) return firstEleven;

  const keeperIndex = ordered.findIndex((p) => getPlayerPosition(p) === "GK");
  if (keeperIndex === -1) return firstEleven;

  const replaceIndex = firstEleven
    .map((p, index) => ({ index, rank: positionRank(getPlayerPosition(p)) }))
    .sort((a, b) => b.rank - a.rank)[0]?.index ?? 10;
  firstEleven[replaceIndex] = ordered[keeperIndex];
  return firstEleven;
}

function formationFitScore(player: RawPlayerData, slot: FormationSlot): number {
  const pos = getPlayerPosition(player);
  const ideal = idealSlotForPosition(pos);
  const overall = player.technical_profile?.overall ?? 60;
  const lineMatch =
    ideal.line === slot.line ? 26 : slot.line === "GK" || ideal.line === "GK" ? -80 : -12;
  const sideFit = 12 - Math.abs(ideal.y - slot.y) * 0.16;
  const specialistBonus =
    (slot.line === "DF" && ["CB", "LCB", "RCB", "LB", "RB", "LWB", "RWB"].includes(pos)) ||
    (slot.line === "MF" && ["CDM", "CM", "CAM", "AM", "LM", "RM", "SS"].includes(pos)) ||
    (slot.line === "FW" && ["ST", "CF", "LW", "RW"].includes(pos))
      ? 8
      : 0;

  return overall + lineMatch + sideFit + specialistBonus;
}

function selectBalancedFirstEleven(
  players: RawPlayerData[],
  slots: FormationSlot[],
): RawPlayerData[] {
  if (players.length <= 11) return ensureGoalkeeperInFirstEleven(players);

  const selected = new Set<string>();
  const picked: RawPlayerData[] = [];

  slots.forEach((slot) => {
    const best =
      players
        .filter((p) => p?.id && !selected.has(p.id))
        .sort((a, b) => formationFitScore(b, slot) - formationFitScore(a, slot))[0] ??
      null;
    if (!best?.id) return;
    selected.add(best.id);
    picked.push(best);
  });

  return ensureGoalkeeperInFirstEleven(picked).slice(0, 11);
}

function idealSlotForPosition(pos: string): {
  line: "GK" | "DF" | "MF" | "FW";
  y: number;
} {
  switch (pos) {
    case "GK":
      return { line: "GK", y: 50 };
    case "CB":
    case "LCB":
    case "RCB":
      return { line: "DF", y: 50 };
    case "RB":
    case "RWB":
      return { line: "DF", y: 85 };
    case "LB":
    case "LWB":
      return { line: "DF", y: 15 };
    case "CDM":
      return { line: "MF", y: 65 };
    case "CM":
    case "CAM":
    case "AM":
    case "SS":
      return { line: "MF", y: 50 };
    case "RM":
      return { line: "MF", y: 80 };
    case "LM":
      return { line: "MF", y: 20 };
    case "RW":
      return { line: "FW", y: 85 };
    case "LW":
      return { line: "FW", y: 15 };
    case "ST":
    case "CF":
      return { line: "FW", y: 50 };
    default:
      return { line: "MF", y: 50 };
  }
}

function mirrorSlot(slot: FormationSlot): FormationSlot {
  return {
    x: 100 - slot.x,
    y: 100 - slot.y,
    line: slot.line,
    zone: {
      minX: 100 - slot.zone.maxX,
      maxX: 100 - slot.zone.minX,
      minY: 100 - slot.zone.maxY,
      maxY: 100 - slot.zone.minY,
    },
  };
}

function widenFormationSlot(slot: FormationSlot): FormationSlot {
  if (slot.line === "GK") return slot;
  const wideFactor = slot.line === "FW" ? 1.2 : slot.line === "MF" ? 1.16 : 1.1;
  const y = clamp(50 + (slot.y - 50) * wideFactor, 6, 94);
  const minY = clamp(50 + (slot.zone.minY - 50) * wideFactor - 2.5, 0, 98);
  const maxY = clamp(50 + (slot.zone.maxY - 50) * wideFactor + 2.5, 2, 100);

  return {
    ...slot,
    y,
    zone: {
      ...slot.zone,
      minY: Math.min(minY, maxY - 6),
      maxY: Math.max(maxY, minY + 6),
    },
  };
}

export class FormationEngine {
  static map(
    formationName: string,
    players: RawPlayerData[],
    team: "home" | "away",
    preserveOrder = false,
  ): Array<{ player: RawPlayerData; slot: FormationSlot; index: number }> {
    const preset = FORMATIONS[formationName] ?? FORMATIONS["4-3-3"];

    const seen = new Set<string>();
    const unique = players.filter((p) => {
      if (!p?.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    if (preserveOrder) {
      return this.assignByPosition(unique, preset, team);
    }

    const ordered = [...unique].sort(
      (a, b) =>
        positionRank(a.technical_profile?.best_position) -
        positionRank(b.technical_profile?.best_position),
    );

    return ordered.slice(0, 11).map((player, index) => {
      const rawSlot = preset[index] ?? preset[preset.length - 1];
      const slot = widenFormationSlot(team === "away" ? mirrorSlot(rawSlot) : rawSlot);
      return { player, slot, index };
    });
  }

  private static assignByPosition(
    players: RawPlayerData[],
    slots: FormationSlot[],
    team: "home" | "away",
  ): Array<{ player: RawPlayerData; slot: FormationSlot; index: number }> {
    const available = slots.map((s, i) => ({ s, i, taken: false }));
    const first11 = selectBalancedFirstEleven(players, slots);
    const result: Array<{ player: RawPlayerData; slot: FormationSlot; index: number }> =
      [];

    for (const player of first11) {
      const pos = getPlayerPosition(player);
      const ideal = idealSlotForPosition(pos);
      let bestIdx = -1;
      let bestDist = Infinity;

      for (let j = 0; j < available.length; j++) {
        if (available[j].taken) continue;
        const s = available[j].s;
        if (s.line === "GK" && ideal.line !== "GK") continue;
        if (s.line !== ideal.line) continue;
        const d = Math.abs(s.y - ideal.y);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = j;
        }
      }

      if (bestIdx === -1) {
        for (let j = 0; j < available.length; j++) {
          if (available[j].taken) continue;
          const d = Math.abs(available[j].s.y - ideal.y) + 50;
          if (d < bestDist) {
            bestDist = d;
            bestIdx = j;
          }
        }
      }

      available[bestIdx].taken = true;
      const rawSlot = available[bestIdx].s;
      const slot = widenFormationSlot(team === "away" ? mirrorSlot(rawSlot) : rawSlot);
      result.push({ player, slot, index: available[bestIdx].i });
    }

    return result;
  }
}

const readName = (p: RawPlayerData): string =>
  p.personal?.short_name ?? p.personal?.name ?? "Player";

const readAttr = (p: RawPlayerData, cat: string, key: string, fb = 55): number =>
  p.attributes?.[cat]?.[key] ?? p.attributes?.[cat]?.[key.toLowerCase()] ?? fb;

function createEnginePlayer(
  raw: RawPlayerData,
  team: "home" | "away",
  slot: FormationSlot,
  index: number,
): EnginePlayer {
  const acceleration = readAttr(raw, "movement", "acceleration") / 100;
  const sprintSpeed = readAttr(raw, "movement", "sprint_speed") / 100;
  const agility = readAttr(raw, "movement", "agility") / 100;
  const reactions = readAttr(raw, "movement", "reactions") / 100;
  const balance = readAttr(raw, "movement", "balance") / 100;
  const shortPassing = readAttr(raw, "attacking", "short_passing") / 100;
  const crossing = readAttr(raw, "attacking", "crossing", 50) / 100;
  const finishing = readAttr(raw, "attacking", "finishing", 50) / 100;
  const heading = readAttr(raw, "attacking", "heading_accuracy", 50) / 100;
  const volleys = readAttr(raw, "attacking", "volleys", 50) / 100;
  const dribbling = readAttr(raw, "skill", "dribbling", 50) / 100;
  const ballControl = readAttr(raw, "skill", "ball_control") / 100;
  const curve = readAttr(raw, "skill", "curve", readAttr(raw, "attacking", "crossing", 50)) / 100;
  const longPassing = readAttr(raw, "skill", "long_passing", 50) / 100;
  const fkAccuracy = readAttr(raw, "skill", "fk_accuracy", 50) / 100;
  const shotPower = readAttr(raw, "power", "shot_power") / 100;
  const staminaAttr = readAttr(raw, "power", "stamina", 70) / 100;
  const strengthAttr = readAttr(raw, "power", "strength", 58) / 100;
  const jumping = readAttr(raw, "power", "jumping", 55) / 100;
  const longShots = readAttr(raw, "power", "long_shots", 50) / 100;
  const attackPosition = readAttr(raw, "mentality", "attack_position", 50) / 100;
  const vision = readAttr(raw, "mentality", "vision", 50) / 100;
  const composure = readAttr(raw, "mentality", "composure", 55) / 100;
  const defensiveAwareness = readAttr(raw, "defending", "defensive_awareness", 50) / 100;
  const standingTackle = readAttr(raw, "defending", "standing_tackle", 50) / 100;
  const slidingTackle = readAttr(raw, "defending", "sliding_tackle", 45) / 100;
  const interceptions = readAttr(raw, "mentality", "interceptions", 50) / 100;
  const aggression = readAttr(raw, "mentality", "aggression", 50) / 100;
  const overall = (raw.technical_profile?.overall ?? 60) / 100;
  const stamina = clamp(82 + staminaAttr * 18, 82, 99);
  const passingComposite = shortPassing * 0.52 + vision * 0.18 + ballControl * 0.14 + composure * 0.1 + longPassing * 0.06;
  const shootingComposite = shotPower * 0.34 + finishing * 0.32 + composure * 0.14 + longShots * 0.12 + volleys * 0.08;
  const crossingComposite = crossing * 0.56 + curve * 0.16 + longPassing * 0.14 + vision * 0.1 + fkAccuracy * 0.04;
  const defendingComposite = defensiveAwareness * 0.44 + standingTackle * 0.26 + interceptions * 0.2 + slidingTackle * 0.1;
  const gkHandling =
    (readAttr(raw, "goalkeeping", "handling", 60) * 0.38 +
      readAttr(raw, "goalkeeping", "reflexes", 60) * 0.24 +
      readAttr(raw, "goalkeeping", "positioning", 60) * 0.22 +
      readAttr(raw, "goalkeeping", "diving", 60) * 0.16) /
    100;
  const gkKicking = readAttr(raw, "goalkeeping", "kicking", shortPassing * 100) / 100;

  return {
    id: raw.id ?? `${team}-${index}`,
    name: readName(raw),
    number: raw.contract?.kit_number ?? index + 1,
    team,
    position: raw.technical_profile?.best_position ?? "CM",

    x: slot.x,
    y: slot.y,
    vx: 0,
    vy: 0,
    facingX: team === "home" ? 1 : -1,
    facingY: 0,

    baseX: slot.x,
    baseY: slot.y,
    zone: slot.zone,

    speed: 0.1 + (sprintSpeed * 0.5 + acceleration * 0.34 + agility * 0.16) * 0.24,
    passing: raw.technical_profile?.best_position === "GK"
      ? passingComposite * 0.58 + gkKicking * 0.42
      : passingComposite,
    shooting: shootingComposite,
    crossing: crossingComposite,
    vision,
    curve,
    reaction: reactions * 0.82 + composure * 0.1 + balance * 0.08,
    ballControl: ballControl * 0.62 + dribbling * 0.26 + balance * 0.12,
    positioning: attackPosition * 0.64 + composure * 0.18 + overall * 0.18,
    composure,
    defending: defendingComposite,
    tackling: standingTackle * 0.55 + slidingTackle * 0.22 + aggression * 0.13 + defensiveAwareness * 0.1,
    interceptions,
    aggression,
    jumping: clamp(jumping * 0.82 + heading * 0.18, 0.15, 0.99),
    longPassing,
    dribbling,
    overall,
    gkHandling,
    strength: clamp(0.38 + strengthAttr * 0.28 + overall * 0.12, 0.35, 0.9),
    heightCm:
      raw.personal?.height_cm ??
      (raw.technical_profile?.best_position === "GK"
        ? 190
        : ["CB", "ST"].includes(raw.technical_profile?.best_position ?? "")
          ? 184
          : 178),

    stamina,
    attackingRight: team === "home",
    startingStamina: stamina,
    hasBall: false,
    aiState: slot.line === "GK" ? "GK_SET" : "IDLE",
    decisionCooldown: 0,
    dribbleTouchCooldown: 0,
    substitutionSlot: index,
    targetX: slot.x,
    targetY: slot.y,
    lastPassTargetId: null,
    consecutivePasses: 0,
    possessionFlipCount: 0,
    matchStats: createEmptyPlayerStats(),
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

function normalize2D(x: number, y: number, fallbackX = 1, fallbackY = 0): { x: number; y: number } {
  const len = Math.hypot(x, y);
  if (len < 0.0001) return { x: fallbackX, y: fallbackY };
  return { x: x / len, y: y / len };
}

function updatePlayerFacing(p: EnginePlayer, fallbackX: number, fallbackY = 0, dt = 0.016): void {
  const motionSpeed = Math.hypot(p.vx, p.vy);
  const targetVector =
    motionSpeed > 0.012
      ? normalize2D(p.vx, p.vy, fallbackX, fallbackY)
      : normalize2D(p.targetX - p.x, p.targetY - p.y, fallbackX, fallbackY);
  rotatePlayerFacingToward(p, targetVector.x, targetVector.y, fallbackX, fallbackY, dt);
}

function rotatePlayerFacingToward(
  p: EnginePlayer,
  targetX: number,
  targetY: number,
  fallbackX: number,
  fallbackY = 0,
  dt = 0.016,
  urgency = 1,
): void {
  const current = normalize2D(p.facingX, p.facingY, fallbackX, fallbackY);
  const targetVector = normalize2D(targetX, targetY, fallbackX, fallbackY);
  const currentAngle = Math.atan2(current.y, current.x);
  const targetAngle = Math.atan2(targetVector.y, targetVector.x);
  const angleDelta = Math.atan2(
    Math.sin(targetAngle - currentAngle),
    Math.cos(targetAngle - currentAngle),
  );
  const turnSpeed =
    p.hasBall
      ? 1.85 + p.ballControl * 1.05 + p.reaction * 0.45
      : 2.15 + p.reaction * 1.25;
  const maxTurn = Math.max(0.018, turnSpeed * clamp(urgency, 0.55, 1.85) * clamp(dt, 0.008, 0.08));
  const nextAngle = currentAngle + clamp(angleDelta, -maxTurn, maxTurn);
  p.facingX = Math.cos(nextAngle);
  p.facingY = Math.sin(nextAngle);
}

function updatePlayerFacingTowardPoint(
  p: EnginePlayer,
  x: number,
  y: number,
  fallbackX: number,
  fallbackY = 0,
  dt = 0.016,
  urgency = 1,
): void {
  rotatePlayerFacingToward(p, x - p.x, y - p.y, fallbackX, fallbackY, dt, urgency);
}

function nudgeIntoRange(v: number, lo: number, hi: number, step: number): number {
  if (v < lo) return Math.min(lo, v + step);
  if (v > hi) return Math.max(hi, v - step);
  return v;
}

function steerTo(
  p: EnginePlayer,
  tx: number,
  ty: number,
  intensity: number,
): void {
  const rawTargetX = clamp(tx, 2, 98);
  const rawTargetY = clamp(ty, 2, 98);
  const previousTargetX = Number.isFinite(p.targetX) ? p.targetX : rawTargetX;
  const previousTargetY = Number.isFinite(p.targetY) ? p.targetY : rawTargetY;
  const targetShift = dist(previousTargetX, previousTargetY, rawTargetX, rawTargetY);
  const urgent =
    p.hasBall ||
    p.position === "GK" ||
    p.aiState === "INTERCEPT" ||
    p.aiState === "CHASE_OWN_TOUCH" ||
    p.aiState === "PRESS" ||
    intensity >= 1.18;
  const blend = urgent
    ? targetShift > 11
      ? 0.72
      : 0.58
    : targetShift > 10
      ? 0.42
      : 0.28;

  p.targetX = previousTargetX + (rawTargetX - previousTargetX) * blend;
  p.targetY = previousTargetY + (rawTargetY - previousTargetY) * blend;

  const dx = p.targetX - p.x;
  const dy = p.targetY - p.y;
  const d = Math.hypot(dx, dy);

  if (d < 0.01) return;

  const stamFactor = 0.45 + (p.stamina / Math.max(1, p.startingStamina)) * 0.55;
  const chasingOwnTouch = p.hasBall && p.aiState === "CHASE_OWN_TOUCH";
  const closeControlCarrier = p.hasBall && !chasingOwnTouch;
  const carrierPaceBoost = chasingOwnTouch ? 1.12 : closeControlCarrier ? 0.94 : 1;
  const maxSpeed = p.speed * intensity * stamFactor * carrierPaceBoost;
  const arrival = Math.max(0.15, Math.min(1, d / 7));
  const desiredVx = (dx / d) * maxSpeed * arrival;
  const desiredVy = (dy / d) * maxSpeed * arrival;
  const turnRate = 0.055 + p.reaction * 0.145;
  const accelLimit =
    (0.014 + p.speed * 0.029 + p.reaction * 0.014) *
    clamp(0.78 + intensity * 0.38, 0.78, chasingOwnTouch ? 1.45 : 1.32) *
    (chasingOwnTouch ? 1.1 : closeControlCarrier ? 0.92 : 1);
  const nextVx = p.vx + (desiredVx - p.vx) * turnRate;
  const nextVy = p.vy + (desiredVy - p.vy) * turnRate;
  const dvx = nextVx - p.vx;
  const dvy = nextVy - p.vy;
  const deltaSpeed = Math.hypot(dvx, dvy);
  if (deltaSpeed > accelLimit) {
    p.vx += (dvx / deltaSpeed) * accelLimit;
    p.vy += (dvy / deltaSpeed) * accelLimit;
  } else {
    p.vx = nextVx;
    p.vy = nextVy;
  }

  const speed = Math.hypot(p.vx, p.vy);
  const cap = Math.max(maxSpeed * 1.08, 0.032);
  if (speed > cap) {
    p.vx = (p.vx / speed) * cap;
    p.vy = (p.vy / speed) * cap;
  }
}

function applyMovement(p: EnginePlayer, dt: number): void {
  const frameScale = clamp(
    (dt / 0.016) * PLAYER_MOTION_SCALE,
    PLAYER_MOTION_SCALE * 0.35,
    PLAYER_MOTION_MAX_STEP,
  );
  const movementFrameScale =
    p.hasBall && p.aiState === "CHASE_OWN_TOUCH"
      ? frameScale * 1.16
      : p.hasBall
        ? frameScale * 0.94
        : frameScale;
  p.x = clamp(p.x + p.vx * movementFrameScale, 1, 99);
  p.y = clamp(p.y + p.vy * movementFrameScale, 2, 98);
  if (p.position === "GK") {
    if (attacksRightOf(p)) {
      p.x = clamp(p.x, 1, HOME_BOX_MAX_X);
    } else {
      p.x = clamp(p.x, AWAY_BOX_MIN_X, 99);
    }
    p.y = clamp(p.y, BOX_MIN_Y - 2, BOX_MAX_Y + 2);
  } else {
    const isChasingLooseBall = p.aiState === "INTERCEPT" || p.aiState === "CHASE_OWN_TOUCH";
    const isPressing = p.aiState === "PRESS" || p.aiState === "COVER";
    const isSupporting = p.aiState === "SUPPORT";
    const isSetPiece = p.aiState === "SET_PIECE";
    const isActiveOffBall = isChasingLooseBall || isPressing || isSupporting || isSetPiece;
    const carrierMinX = 2;
    const carrierMaxX = 98;
    const isDefender =
      ["CB", "LCB", "RCB", "LB", "RB", "LWB", "RWB"].includes(p.position);
    const zoneLeeway = isPressing
      ? isDefender ? 8 : 13
      : isSupporting
        ? isDefender ? 12 : 18
        : isDefender ? 7 : 12;
    const minX = p.hasBall
      ? carrierMinX
      : isSetPiece
        ? 1
        : isActiveOffBall
        ? Math.max(2, p.zone.minX - zoneLeeway)
        : p.zone.minX;
    const maxX = p.hasBall
      ? carrierMaxX
      : isSetPiece
        ? 99
        : isActiveOffBall
        ? Math.min(98, p.zone.maxX + zoneLeeway)
        : p.zone.maxX;
    const minY =
      isSetPiece
        ? 2
        : p.hasBall || isActiveOffBall
        ? Math.max(2, p.zone.minY - zoneLeeway)
        : p.zone.minY;
    const maxY =
      isSetPiece
        ? 98
        : p.hasBall || isActiveOffBall
        ? Math.min(98, p.zone.maxY + zoneLeeway)
        : p.zone.maxY;
    const correctionStep = (isDefender ? 1.2 : 1.6) * frameScale;
    p.x = nudgeIntoRange(p.x, minX, maxX, correctionStep);
    p.y = nudgeIntoRange(p.y, minY, maxY, correctionStep);
  }
}

function predictedBallPoint(ball: Ball, lookahead = 0.55): { x: number; y: number } {
  const speed = Math.hypot(ball.vx, ball.vy);
  const horizon = clamp(lookahead + speed * 1.15, 0.28, 1.15);
  return {
    x: clamp(ball.x + ball.vx * BALL_PHYSICS_SCALE * horizon, 2, 98),
    y: clamp(ball.y + ball.vy * BALL_PHYSICS_SCALE * horizon, 3, 97),
  };
}

interface EngineActions {
  attacksRight(team: "home" | "away"): boolean;
  attackDirection(team: "home" | "away"): 1 | -1;
  attackingGoalX(team: "home" | "away"): number;
  shoot(p: EnginePlayer, targetGoalX: number): boolean;
  pass(p: EnginePlayer, target: EnginePlayer, restartSafe?: boolean): boolean;
  leadPass(p: EnginePlayer, target: EnginePlayer): boolean;
  throughPass(p: EnginePlayer, target: EnginePlayer): boolean;
  longBall(p: EnginePlayer, target: EnginePlayer): boolean;
  chippedPass(p: EnginePlayer, target: EnginePlayer): boolean;
  cross(p: EnginePlayer): boolean;
}

interface PassOption {
  target: EnginePlayer;
  score: number;
  forwardProgress: number;
  receiverSpace: number;
  laneClearance: number;
  distance: number;
}

interface DirectPassOption extends PassOption {
  targetX: number;
  targetY: number;
}

interface CrossOption {
  target: EnginePlayer;
  score: number;
  targetX: number;
  targetY: number;
  distance: number;
  receiverSpace: number;
}

function decideBallAction(
  p: EnginePlayer,
  allPlayers: EnginePlayer[],
  actions: EngineActions,
  ball: Ball,
): void {
  const ctx = createBTContext(p, ball, allPlayers, actions);
  getBallCarrierTree().evaluate(ctx);
}

function nearestOpponentDistance(
  p: EnginePlayer,
  opponents: EnginePlayer[],
): number {
  return opponents.reduce(
    (min, op) => Math.min(min, dist(op.x, op.y, p.x, p.y)),
    Infinity,
  );
}

function attacksRightOf(p: EnginePlayer): boolean {
  return p.attackingRight ?? p.team === "home";
}

function attackDirectionOf(p: EnginePlayer): 1 | -1 {
  return attacksRightOf(p) ? 1 : -1;
}

function attackingDepthOf(p: EnginePlayer, x = p.x): number {
  return attacksRightOf(p) ? x : 100 - x;
}

function nearestTeammateDistance(
  p: EnginePlayer,
  teammates: EnginePlayer[],
): number {
  return teammates.reduce(
    (min, mate) => Math.min(min, dist(mate.x, mate.y, p.x, p.y)),
    Infinity,
  );
}

function naturalWideLaneY(p: EnginePlayer, ballY: number, finalThird: boolean): number {
  const wideRole =
    p.baseY < 30 ||
    p.baseY > 70 ||
    ["LB", "RB", "LWB", "RWB", "LM", "RM", "LW", "RW"].includes(p.position);
  if (!wideRole) return p.baseY;

  const laneY = p.baseY < 50 ? 7 : 93;
  const ballSameSide = (p.baseY < 50 && ballY < 50) || (p.baseY > 50 && ballY > 50);
  const touchlineWeight = finalThird ? 0.9 : 0.82;
  return ballSameSide
    ? laneY * touchlineWeight + ballY * (1 - touchlineWeight)
    : laneY * 0.94 + 50 * 0.06;
}

function applySupportSpacing(
  p: EnginePlayer,
  targetX: number,
  targetY: number,
  teammates: EnginePlayer[],
  minSpacing = 7.2,
): { x: number; y: number } {
  let pushX = 0;
  let pushY = 0;
  let closeCount = 0;
  for (const mate of teammates) {
    if (mate.id === p.id || mate.position === "GK") continue;
    const dx = targetX - mate.x;
    const dy = targetY - mate.y;
    const d = Math.hypot(dx, dy);
    if (d >= minSpacing) continue;
    closeCount++;
    const dir = normalize2D(dx, dy, p.baseY < 50 ? -0.25 : 0.25, p.baseY < 50 ? -1 : 1);
    const rolePush = p.baseY < 35 || p.baseY > 65 ? 1.1 : 0.82;
    const amount = (minSpacing - Math.max(d, 0.15)) * rolePush;
    pushX += dir.x * amount * 0.28;
    pushY += dir.y * amount;
  }

  if (closeCount === 0) return { x: targetX, y: targetY };
  const stagger =
    deterministicSigned(`${p.id}:support-stagger:${Math.round(targetX)}:${Math.round(targetY)}`, 1) *
    Math.min(closeCount, 3) *
    1.15;
  return {
    x: targetX + pushX,
    y: targetY + pushY + stagger,
  };
}

function shouldStepIntoCentralSupport(
  p: EnginePlayer,
  owner: EnginePlayer,
  ball: Ball,
  allPlayers: EnginePlayer[],
): boolean {
  if (p.team !== owner.team || p.position === "GK" || p.id === owner.id) return false;
  if (getPlayerLine(p) !== "DF" || ball.ownerId !== owner.id) return false;

  const isHome = p.team === "home";
  const ownerDepth = isHome ? owner.x : 100 - owner.x;
  if (ownerDepth < 24 || ownerDepth > 68) return false;

  const opponents = allPlayers.filter((op) => op.team !== p.team);
  const hasUsableCentralOption = allPlayers.some((mate) => {
    if (mate.team !== p.team || mate.id === owner.id || mate.id === p.id || mate.position === "GK") {
      return false;
    }
    const line = getPlayerLine(mate);
    const mateDepth = isHome ? mate.x : 100 - mate.x;
    if (
      (line !== "MF" && line !== "DF") ||
      mate.y <= 34 ||
      mate.y >= 66 ||
      Math.abs(mateDepth - ownerDepth) >= 17 ||
      dist(owner.x, owner.y, mate.x, mate.y) >= 25
    ) {
      return false;
    }
    return passingLaneClearance(owner, mate, opponents) > 2.6 && nearestOpponentDistance(mate, opponents) > 2.5;
  });
  if (hasUsableCentralOption) return false;

  const steppingDefender = allPlayers
    .filter((mate) => mate.team === p.team && getPlayerLine(mate) === "DF" && mate.position !== "GK")
    .sort((a, b) => {
      const aScore = Math.abs(a.y - 50) + dist(a.x, a.y, owner.x, owner.y) * 0.18;
      const bScore = Math.abs(b.y - 50) + dist(b.x, b.y, owner.x, owner.y) * 0.18;
      return aScore - bScore;
    })[0];
  return steppingDefender?.id === p.id;
}

function forwardLaneClearance(
  p: EnginePlayer,
  opponents: EnginePlayer[],
  attackDir?: 1 | -1,
): number {
  const dir = attackDir ?? (p.team === "home" ? 1 : -1);
  return opponents.reduce((best, op) => {
    const ahead = (op.x - p.x) * dir;
    const lateral = Math.abs(op.y - p.y);
    const line = getPlayerLine(op);
    const laneWidth = line === "DF" || line === "MF" ? 12 : 9;
    const scanDepth = line === "DF" || line === "MF" ? 28 : 22;
    if (ahead <= 0 || ahead > scanDepth || lateral > laneWidth) return best;
    const laneWeight = line === "DF" ? 1.85 : line === "MF" ? 1.65 : 1.4;
    return Math.min(best, Math.hypot(ahead, lateral * laneWeight));
  }, 24);
}

function openGoalRoute(
  p: EnginePlayer,
  allPlayers: EnginePlayer[],
  pressureDist = nearestOpponentDistance(p, allPlayers.filter((op) => op.team !== p.team)),
): {
  shouldExploit: boolean;
  clearShotSoon: boolean;
  laneClearance: number;
  forwardRoom: number;
  nearestFrontPressure: number;
} {
  if (p.position === "GK") {
    return {
      shouldExploit: false,
      clearShotSoon: false,
      laneClearance: 0,
      forwardRoom: 0,
      nearestFrontPressure: 0,
    };
  }

  const isHome = attacksRightOf(p);
  const dir = attackDirectionOf(p);
  const opponents = allPlayers.filter((op) => op.team !== p.team);
  const attackingDepth = isHome ? p.x : 100 - p.x;
  const forwardRoom = isHome ? 98 - p.x : p.x - 2;
  const distToGoal = Math.abs(p.x - (isHome ? 100 : 0));
  const laneClearance = forwardLaneClearance(p, opponents, dir);
  const nearestFrontPressure = opponents.reduce((best, op) => {
    const ahead = (op.x - p.x) * dir;
    const lateral = Math.abs(op.y - p.y);
    if (ahead < -1.2 || ahead > 30 || lateral > 14) return best;
    return Math.min(best, Math.hypot(Math.max(0, ahead), lateral * 1.55));
  }, 30);
  const centralEnough = p.y > 18 && p.y < 82;
  const sidePressureOnly = pressureDist < 8.2 && nearestFrontPressure > pressureDist + 3.2;
  const noUsefulFrontBlocker = laneClearance > 12.5 && nearestFrontPressure > 11.5;
  const shouldExploit =
    centralEnough &&
    forwardRoom > 10 &&
    attackingDepth > 38 &&
    distToGoal > 10 &&
    (noUsefulFrontBlocker || sidePressureOnly) &&
    pressureDist > 3.2;
  const clearShotSoon =
    shouldExploit &&
    attackingDepth > 63 &&
    distToGoal <= 30 &&
    p.y > 26 &&
    p.y < 74 &&
    laneClearance > 10;

  return {
    shouldExploit,
    clearShotSoon,
    laneClearance,
    forwardRoom,
    nearestFrontPressure,
  };
}

function lineBreakingRunOption(
  passer: EnginePlayer,
  allPlayers: EnginePlayer[],
): DirectPassOption | null {
  const option = selectThroughBallOption(passer, allPlayers);
  if (!option) return null;
  const runnerDepth = attackingDepthOf(option.target);
  const passerDepth = attackingDepthOf(passer);
  const centralOrHalfSpace = option.target.y > 20 && option.target.y < 80;
  const clearEnough =
    option.forwardProgress > 11 &&
    option.receiverSpace > 2.4 &&
    option.laneClearance > 1.55 &&
    runnerDepth > passerDepth + 8;
  return centralOrHalfSpace && clearEnough ? option : null;
}

function leadRunPassOption(
  passer: EnginePlayer,
  allPlayers: EnginePlayer[],
): DirectPassOption | null {
  if (passer.position === "GK") return null;

  const isHome = attacksRightOf(passer);
  const dir = attackDirectionOf(passer);
  const opponents = allPlayers.filter((op) => op.team !== passer.team);
  const passBall = { x: passer.x, y: passer.y } as Ball;
  const passerDepth = attackingDepthOf(passer);
  const pressure = nearestOpponentDistance(passer, opponents);
  const skill = passExecutionSkill(passer, "through");
  const carrierRoute = openGoalRoute(passer, allPlayers, pressure);
  const carrierCanCarry =
    carrierRoute.shouldExploit &&
    carrierRoute.laneClearance > 10 &&
    carrierRoute.nearestFrontPressure > 9 &&
    pressure > 4.6;
  let best: DirectPassOption | null = null;
  let bestScore = -Infinity;

  allPlayers
    .filter((t) => t.team === passer.team && t.id !== passer.id && t.position !== "GK")
    .forEach((t) => {
      if (isOffside(t, allPlayers, passBall) && !isMarginalOffsideRun(t, allPlayers, passBall)) return;

      const d = dist(passer.x, passer.y, t.x, t.y);
      if (d < 4 || d > 30) return;

      const forwardProgress = isHome ? t.x - passer.x : passer.x - t.x;
      const runnerDepth = isHome ? t.x : 100 - t.x;
      if (forwardProgress < -1.8 || forwardProgress > 13 || runnerDepth < passerDepth - 1.5) return;

      const lateral = Math.abs(t.y - passer.y);
      if (lateral > 18) return;

      const runnerForwardVelocity = (t.vx || 0) * dir;
      const aheadOrLevel = forwardProgress >= -0.4;
      const runnerIntent =
        runnerForwardVelocity > 0.018 ||
        (t.aiState === "SUPPORT" && aheadOrLevel) ||
        (runnerDepth > passerDepth + 3 && lateral < 14);
      if (!runnerIntent) return;

      const offsideLine = getSecondLastDefender(t, allPlayers);
      const distanceToLine = isHome ? offsideLine - t.x : t.x - offsideLine;
      const offsideUrgency =
        distanceToLine > 0 && distanceToLine < 4.5 && runnerForwardVelocity > 0.01
          ? (4.5 - distanceToLine) * 1.6
          : 0;
      const lead = clamp(2.2 + t.speed * 6.2 + Math.max(0, runnerForwardVelocity) * 10, 2.8, 7.1);
      const endlineBuffer = runnerDepth > 76 ? 7.5 : runnerDepth > 68 ? 6.4 : 5.2;
      const targetX = clamp(t.x + dir * lead, dir > 0 ? 5 : endlineBuffer, dir > 0 ? 100 - endlineBuffer : 95);
      const targetY = clamp(t.y + t.vy * 3 + (t.y - passer.y) * 0.08, 6, 94);
      const laneClearance = opponents.reduce((bestLane, op) => {
        const between =
          op.x >= Math.min(passer.x, targetX) - 2 &&
          op.x <= Math.max(passer.x, targetX) + 2 &&
          op.y >= Math.min(passer.y, targetY) - 8 &&
          op.y <= Math.max(passer.y, targetY) + 8;
        if (!between) return bestLane;
        return Math.min(bestLane, pointToSegmentDistance(op.x, op.y, passer.x, passer.y, targetX, targetY));
      }, 18);
      const receiverSpace = nearestOpponentDistance(t, opponents);
      const minLane = clamp(2.25 - skill * 0.55 - passer.vision * 0.2, 1.25, 2.05);
      if (laneClearance < minLane || receiverSpace < 1.4) return;

      const sideBySideRun = forwardProgress < 4.2 && lateral < 12;
      const immediateReturnPass = t.lastPassTargetId === passer.id;
      const runnerHasClearAdvantage =
        forwardProgress > 5.2 ||
        offsideUrgency > 1.4 ||
        receiverSpace > pressure + 2.4 ||
        laneClearance > carrierRoute.laneClearance + 2.2;

      if (carrierCanCarry && sideBySideRun && !runnerHasClearAdvantage) return;
      if (immediateReturnPass && forwardProgress < 10.5 && offsideUrgency < 3.4) return;

      const score =
        skill * 14 +
        passer.vision * 7 +
        Math.max(0, forwardProgress) * 0.62 +
        Math.max(0, runnerForwardVelocity) * 28 +
        Math.min(receiverSpace, 10) * 0.8 +
        Math.min(laneClearance, 8) * 1.15 +
        offsideUrgency +
        (pressure > 5 ? 2 : 0) -
        (sideBySideRun && carrierCanCarry ? 7 : 0) -
        (immediateReturnPass ? 6 : 0) -
        d * 0.18 -
        lateral * 0.06;

      if (score > bestScore) {
        bestScore = score;
        best = {
          target: t,
          score,
          forwardProgress,
          receiverSpace,
          laneClearance,
          distance: d,
          targetX,
          targetY,
        };
      }
    });

  return bestScore > (carrierCanCarry ? 12.6 : 12.2) ? best : null;
}

function dangerousRunnerForDefender(
  defender: EnginePlayer,
  allPlayers: EnginePlayer[],
): EnginePlayer | null {
  if (getPlayerLine(defender) !== "DF") return null;
  const defendingHome = defender.team === "home";
  const dirToGoal = defendingHome ? -1 : 1;
  const opponents = allPlayers.filter((p) => p.team !== defender.team && p.position !== "GK");
  const ownGoalX = defendingHome ? 0 : 100;
  const defenderDepth = defendingHome ? defender.x : 100 - defender.x;

  return opponents
    .map((runner) => {
      const runnerDepth = defendingHome ? runner.x : 100 - runner.x;
      const isGoalSideOrLevel = defendingHome ? runner.x <= defender.x + 1.5 : runner.x >= defender.x - 1.5;
      const centralLane = runner.y > 20 && runner.y < 80;
      const closeToGoal = runnerDepth < Math.max(defenderDepth + 10, HOME_BOX_MAX_X + 24);
      const distance = dist(defender.x, defender.y, runner.x, runner.y);
      const runnerHeadingGoal = (runner.vx || 0) * dirToGoal > -0.02;
      const danger =
        (100 - Math.abs(runner.x - ownGoalX)) * 0.08 +
        Math.max(0, 18 - distance) * 1.4 +
        Math.max(0, 75 - runnerDepth) * 0.1 +
        (runnerHeadingGoal ? 4 : 0);
      return { runner, distance, danger, isGoalSideOrLevel, centralLane, closeToGoal };
    })
    .filter(
      ({ distance, danger, isGoalSideOrLevel, centralLane, closeToGoal }) =>
        isGoalSideOrLevel &&
        centralLane &&
        closeToGoal &&
        distance < 22 &&
        danger > 7,
    )
    .sort((a, b) => b.danger - a.danger)[0]?.runner ?? null;
}

function trackGoalSideRunner(
  defender: EnginePlayer,
  runner: EnginePlayer,
): void {
  const defendingHome = defender.team === "home";
  const goalSideGap = ["CB", "LCB", "RCB"].includes(defender.position) ? 1.9 : 2.5;
  const targetX = defendingHome
    ? clamp(runner.x - goalSideGap, DEFENDER_MIN_X, HOME_BOX_MAX_X + 24)
    : clamp(runner.x + goalSideGap, AWAY_BOX_MIN_X - 24, DEFENDER_MAX_X);
  const targetY = clamp(
    runner.y * 0.86 + defender.baseY * 0.14,
    Math.max(defender.zone.minY - 8, 10),
    Math.min(defender.zone.maxY + 8, 90),
  );
  defender.aiState = "COVER";
  steerTo(defender, targetX, targetY, 1.08);
}

function pointToSegmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(px, py, ax, ay);
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / lenSq, 0, 1);
  return dist(px, py, ax + dx * t, ay + dy * t);
}

function passingLaneClearance(
  passer: EnginePlayer,
  target: EnginePlayer,
  opponents: EnginePlayer[],
): number {
  return opponents.reduce((best, op) => {
    const between =
      op.x >= Math.min(passer.x, target.x) - 2 &&
      op.x <= Math.max(passer.x, target.x) + 2 &&
      op.y >= Math.min(passer.y, target.y) - 8 &&
      op.y <= Math.max(passer.y, target.y) + 8;
    if (!between) return best;
    return Math.min(
      best,
      pointToSegmentDistance(
        op.x,
        op.y,
        passer.x,
        passer.y,
        target.x,
        target.y,
      ),
    );
  }, 18);
}

function passExecutionSkill(p: EnginePlayer, kind: "pass" | "through" | "long" | "cross"): number {
  if (kind === "cross") {
    return clamp(
      p.crossing * 0.45 + p.passing * 0.16 + p.vision * 0.16 + p.curve * 0.12 + p.composure * 0.11,
      0.18,
      0.99,
    );
  }

  if (kind === "long") {
    return clamp(
      p.longPassing * 0.34 + p.passing * 0.24 + p.vision * 0.22 + p.curve * 0.08 + p.composure * 0.12,
      0.18,
      0.99,
    );
  }

  if (kind === "through") {
    return clamp(
      p.vision * 0.34 + p.passing * 0.28 + p.longPassing * 0.12 + p.ballControl * 0.1 + p.composure * 0.16,
      0.18,
      0.99,
    );
  }

  return clamp(
    p.passing * 0.38 + p.vision * 0.18 + p.ballControl * 0.16 + p.composure * 0.16 + p.overall * 0.12,
    0.18,
    0.99,
  );
}

function nearestBlockerOnPath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  defenders: EnginePlayer[],
  maxDistance: number,
): { blocker: EnginePlayer; d: number } | null {
  return defenders
    .map((blocker) => ({
      blocker,
      d: pointToSegmentDistance(blocker.x, blocker.y, fromX, fromY, toX, toY),
    }))
    .filter(({ blocker, d }) => {
      const inPath =
        blocker.x >= Math.min(fromX, toX) - 2 &&
        blocker.x <= Math.max(fromX, toX) + 2 &&
        blocker.y >= Math.min(fromY, toY) - 5 &&
        blocker.y <= Math.max(fromY, toY) + 5;
      return inPath && d <= maxDistance;
    })
    .sort((a, b) => a.d - b.d)[0] ?? null;
}

function evaluateCarry(
  p: EnginePlayer,
  allPlayers: EnginePlayer[],
  pressureDist: number,
): {
  shouldDrive: boolean;
  breakaway: boolean;
  cooldown: number;
  forwardRoom: number;
  laneClearance: number;
} {
  const isHome = p.team === "home";
  const opponents = allPlayers.filter((op) => op.team !== p.team);
  const goalX = isHome ? 100 : 0;
  const distToGoal = Math.abs(p.x - goalX);
  const forwardRoom = isHome ? 98 - p.x : p.x - 2;
  const laneClearance = forwardLaneClearance(p, opponents);
  const route = openGoalRoute(p, allPlayers, pressureDist);
  const centralEnough = p.y > 14 && p.y < 86;
  const openGrass =
    pressureDist > 9.2 && laneClearance > 10.5 && forwardRoom > 9;
  const wideNearEndline = (p.y < 24 || p.y > 76) && distToGoal < 24;
  const breakaway =
    route.shouldExploit ||
    (centralEnough &&
      !wideNearEndline &&
      pressureDist > 13 &&
      laneClearance > 15 &&
      forwardRoom > 16 &&
      distToGoal > 12);
  const confidence =
    p.ballControl * 0.46 +
    p.speed * 0.9 +
    p.overall * 0.34 +
    Math.min(pressureDist, 14) * 0.032 +
    Math.min(laneClearance, 16) * 0.026;
  const shouldDrive =
    !wideNearEndline &&
    (breakaway ||
      route.shouldExploit ||
      (openGrass && confidence > 0.9 && Math.random() < 0.34) ||
      (distToGoal < 65 &&
        pressureDist > 6.2 &&
        laneClearance > 6.5 &&
        confidence > 0.86 &&
        Math.random() < 0.22));
  const cooldown = breakaway
    ? 0.95
    : openGrass
      ? 0.72
      : FIRST_TOUCH_COOLDOWN;

  return { shouldDrive, breakaway, cooldown, forwardRoom, laneClearance };
}

function carryInLane(p: EnginePlayer, allPlayers: EnginePlayer[] = []): void {
  const isHome = p.team === "home";
  p.aiState = "DRIBBLE";
  const opponents = allPlayers.filter((op) => op.team !== p.team);
  const pressureDist = nearestOpponentDistance(p, opponents);
  const laneClearance = forwardLaneClearance(p, opponents);
  const baseAdvance = 2.2 + p.speed * 3.25 + p.ballControl * 1.35;

  const strideBoost = pressureDist > 11 && laneClearance > 13 ? 1.0 : 0.92;
  const dir = isHome ? 1 : -1;
  const rawTargetX = isHome
    ? p.x + baseAdvance * strideBoost
    : p.x - baseAdvance * strideBoost;
  const targetX = clamp(
    rawTargetX,
    2,
    98,
  );
  const laneDefender = opponents
    .map((op) => ({
      op,
      ahead: (op.x - p.x) * dir,
      lateral: op.y - p.y,
    }))
    .filter(
      ({ ahead, lateral }) => ahead > 0 && ahead < 22 && Math.abs(lateral) < 12,
    )
    .sort((a, b) => a.ahead - b.ahead)[0];
  const nearestSidePressure = opponents
    .map((op) => ({ op, d: dist(op.x, op.y, p.x, p.y), lateral: op.y - p.y }))
    .filter(({ d }) => d < 8)
    .sort((a, b) => a.d - b.d)[0];

  const lateralPhase = p.x * 0.8 + p.baseY * 0.2;
  const lateralSway =
    Math.sin(lateralPhase) * (0.7 - p.ballControl * 0.5) * 2.6;
  const avoidLane = laneDefender
    ? (laneDefender.lateral >= 0 ? -1 : 1) *
      clamp(10 - Math.abs(laneDefender.lateral), 4, 9)
    : 0;
  const avoidPressure = nearestSidePressure
    ? (nearestSidePressure.lateral >= 0 ? -1 : 1) *
      clamp(8 - nearestSidePressure.d, 0, 5)
    : 0;
  const driftY = p.baseY + (50 - p.baseY) * 0.05;
  const shouldEscapeWide = Boolean(laneDefender || pressureDist < 7);
  const dribbleY =
    p.y +
    lateralSway * 0.22 +
    avoidLane * 0.55 +
    avoidPressure * 0.5 +
    (driftY - p.y) * (shouldEscapeWide ? 0.02 : 0.08);
  const clampedY = clamp(
    dribbleY,
    Math.max(p.zone.minY - 10, 5),
    Math.min(p.zone.maxY + 10, 95),
  );
  p.targetX = targetX;
  p.targetY = clampedY;

  // Snap decision while carrying near goal: end cooldown early
  const goalX = isHome ? 100 : 0;
  const distToGoal = Math.abs(p.x - goalX);
  if (distToGoal <= 18 && Math.random() < 0.035) {
    p.decisionCooldown = 0;
  }
}

function selectPassTarget(
  passer: EnginePlayer,
  allPlayers: EnginePlayer[],
): EnginePlayer | null {
  return selectPassOption(passer, allPlayers)?.target ?? null;
}

function selectPassOption(
  passer: EnginePlayer,
  allPlayers: EnginePlayer[],
): PassOption | null {
  const isHome = passer.team === "home";
  const maxRange = 20 + passer.vision * 32 + Math.max(0, passer.strength - 0.62) * 10;
  const opponents = allPlayers.filter((op) => op.team !== passer.team);
  const teammates = allPlayers.filter(
    (t) => t.team === passer.team && t.id !== passer.id,
  );

  // Assess pressure on the passer
  const nearestOpp = nearestOpponentDistance(passer, opponents);
  const underPressure = nearestOpp < 5;
  const route = openGoalRoute(passer, allPlayers, nearestOpp);

  let best: PassOption | null = null;
  let bestScore = -Infinity;
  let safeFallback: PassOption | null = null;
  let safeFallbackScore = -Infinity;

  teammates.forEach((t) => {
    const d = dist(passer.x, passer.y, t.x, t.y);
    if (d < 2 || d > maxRange) return;

    // Progress: reward forward passes, but don't heavily punish sideways/backward
    const forwardProgress = isHome ? t.x - passer.x : passer.x - t.x;
    const attackingDepth = isHome ? t.x : 100 - t.x;
    const receiverWide = t.y < 36 || t.y > 64;
    const passerWide = passer.y < 36 || passer.y > 64;
    const receiverCentral = t.y > 30 && t.y < 70;
    const targetInBox =
      attackingDepth > AWAY_BOX_MIN_X &&
      t.y > BOX_MIN_Y &&
      t.y < BOX_MAX_Y;
    const passerDepth = isHome ? passer.x : 100 - passer.x;
    const cutbackLane =
      passerWide &&
      receiverCentral &&
      (isHome ? passer.x > 68 && t.x < passer.x : passer.x < 32 && t.x > passer.x);
    const fieldTilt = isHome ? passer.x - 30 : 70 - passer.x;
    const progressWeight = 0.85 + Math.max(0, fieldTilt / 70) * 0.5;
    const progressionScore =
      forwardProgress > 0
        ? Math.min(forwardProgress, 18) * progressWeight * 0.72
        : forwardProgress * 0.35;

    const oppDist = nearestOpponentDistance(t, opponents);
    const teammateSpacing = nearestTeammateDistance(
      t,
      teammates.filter((mate) => mate.id !== t.id),
    );
    const localTraffic =
      allPlayers.filter(
        (other) =>
          other.id !== t.id &&
          other.position !== "GK" &&
          dist(other.x, other.y, t.x, t.y) < 5.2,
      ).length;
    const sameTeamTraffic =
      teammates.filter((mate) => mate.id !== t.id && dist(mate.x, mate.y, t.x, t.y) < 6.2).length;
    const receiverFacing = normalize2D(t.facingX, t.facingY, isHome ? 1 : -1, 0);
    const receiveVector = normalize2D(passer.x - t.x, passer.y - t.y, -receiverFacing.x, -receiverFacing.y);
    const bodyShapePenalty =
      Math.max(0, 0.28 - (receiverFacing.x * receiveVector.x + receiverFacing.y * receiveVector.y)) * 3.2;
    const spaceScore = Math.min(oppDist, 15) * 0.3;
    const laneClearance = passingLaneClearance(passer, t, opponents);
    const qualityLaneTolerance = clamp(2.25 - passExecutionSkill(passer, "pass") * 0.46 - passer.vision * 0.18, 1.48, 2.16);
    if (laneClearance < qualityLaneTolerance && d > 8) return;
    const receiverRunningIntoBox =
      passerDepth > 66 &&
      attackingDepth > 74 &&
      forwardProgress > 3 &&
      oppDist > 4.5 &&
      laneClearance > 3.4 &&
      t.y > BOX_MIN_Y - 7 &&
      t.y < BOX_MAX_Y + 7;

    // Repetition penalty: avoid passing back to the player who just passed to you
    const repetitionPenalty =
      t.lastPassTargetId === passer.id || passer.lastPassTargetId === t.id
        ? 12
        : 0;

    // Risk: passing to a marked player
    const riskPenalty =
      Math.max(0, 5.4 - oppDist) * 0.72 + Math.max(0, 4.5 - laneClearance) * 1.18;
    const crowdPenalty =
      Math.max(0, 5.7 - teammateSpacing) * 0.78 +
      localTraffic * 2.05 +
      sameTeamTraffic * 1.45 +
      bodyShapePenalty;
    const isolationBonus =
      teammateSpacing > 8
        ? Math.min(teammateSpacing - 8, 8) * (receiverWide ? 0.7 : 0.34)
        : 0;

    // Distance: prefer medium-range passes (not too short, not too long)
    const distBonus = Math.max(0, 35 - Math.abs(d - 18)) * 0.06;
    const backwardPenalty = forwardProgress < -4 && !underPressure ? 4 : 0;
    const openRouteSidePenalty =
      route.shouldExploit && forwardProgress < 8
        ? 14 + Math.max(0, 8 - forwardProgress) * 1.8
        : 0;
    const wingBonus =
      receiverWide && attackingDepth > 50 && forwardProgress > -4
        ? 8.2 + Math.min(teammateSpacing, 15) * 0.28
        : 0;
    const boxEntryBonus =
      targetInBox && laneClearance > 5 && oppDist > 3.5 ? 9 : 0;
    const boxRunnerBonus = receiverRunningIntoBox ? 12 : 0;
    const cutbackBonus = cutbackLane && laneClearance > 5 ? 5 : 0;

    const receiverIsSettled = t.decisionCooldown <= FIRST_TOUCH_COOLDOWN * 0.4;
    const settlePenalty = receiverIsSettled ? 0 : 5;

    const score =
      progressionScore +
      spaceScore +
      isolationBonus +
      wingBonus +
      boxEntryBonus +
      boxRunnerBonus +
      cutbackBonus +
      distBonus -
      riskPenalty -
      crowdPenalty -
      repetitionPenalty -
      settlePenalty -
      backwardPenalty +
      Math.max(0, passer.strength - 0.66) * 5.5 +
      Math.max(0, passer.overall - 0.68) * 4;
    const adjustedScore = score - openRouteSidePenalty;

    const option: PassOption = {
      target: t,
      score: adjustedScore,
      forwardProgress,
      receiverSpace: oppDist,
      laneClearance,
      distance: d,
    };

    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      best = option;
    }

    // Track a safe fallback: any teammate in space, even if backward
    if (oppDist > 5 && laneClearance > 4 && d > 3 && localTraffic <= 2) {
      const safeScore =
        spaceScore +
        distBonus +
        (forwardProgress < 0 ? 3.5 : 0) -
        riskPenalty -
        Math.max(0, sameTeamTraffic - 1) * 1.8 -
        bodyShapePenalty -
        backwardPenalty * 0.35;
      if (safeScore > safeFallbackScore) {
        safeFallbackScore = safeScore;
        safeFallback = option;
      }
    }
  });

  const chosenBest = best as PassOption | null;

  // Under pressure, keep genuine forward/box runners above stale backward outlets.
  if (
    underPressure &&
    safeFallback &&
    (!chosenBest || chosenBest.forwardProgress < 4 || chosenBest.receiverSpace < 3)
  ) {
    return safeFallback;
  }
  return bestScore > 2.2 ? chosenBest : null;
}

function selectThroughBallOption(
  passer: EnginePlayer,
  allPlayers: EnginePlayer[],
): DirectPassOption | null {
  const isHome = attacksRightOf(passer);
  const dir = attackDirectionOf(passer);
  const opponents = allPlayers.filter((op) => op.team !== passer.team);
  const teammates = allPlayers.filter(
    (t) => t.team === passer.team && t.id !== passer.id && t.position !== "GK",
  );
  const pressure = nearestOpponentDistance(passer, opponents);
  const counterWindow = pressure > 4.5 && forwardLaneClearance(passer, opponents, dir) > 8;

  let best: DirectPassOption | null = null;
  let bestScore = -Infinity;

  teammates.forEach((t) => {
    const passBall = { x: passer.x, y: passer.y } as Ball;
    const marginalOffside = isMarginalOffsideRun(t, allPlayers, passBall);
    if (isOffside(t, allPlayers, passBall) && !marginalOffside) return;
    const d = dist(passer.x, passer.y, t.x, t.y);
    if (d < 6 || d > 62) return;

    const forwardProgress = isHome ? t.x - passer.x : passer.x - t.x;
    if (forwardProgress < 5.5) return;

    const runnerDepth = isHome ? t.x : 100 - t.x;
    const receiverSpace = nearestOpponentDistance(t, opponents);
    const laneClearance = passingLaneClearance(passer, t, opponents);
    const quality = passer.passing * 0.42 + passer.vision * 0.36 + passer.strength * 0.22;
    const lineBreakingRun =
      forwardProgress > 12 &&
      runnerDepth > 58 &&
      receiverSpace > 2.4 &&
      (t.vx || 0) * dir > -0.03;
    const minLane = lineBreakingRun
      ? clamp(2.1 - quality * 0.55, 1.25, 1.95)
      : clamp(2.65 - quality * 0.62, 1.85, 2.5);
    const minSpace = lineBreakingRun
      ? clamp(1.65 - t.ballControl * 0.24 - t.speed * 0.22, 0.95, 1.58)
      : clamp(2.05 - t.ballControl * 0.34 - t.speed * 0.2, 1.45, 2.05);
    if (laneClearance < minLane || receiverSpace < minSpace) return;

    const targetX = clamp(t.x + dir * clamp(7 + t.speed * 14, 7, 15), 3, 97);
    const targetY = clamp(t.y + (t.y - 50) * 0.12, 7, 93);
    const line = getPlayerLine(t);
    const roleBonus = line === "FW" ? 6 : line === "MF" ? 3 : 0;
    const wideRunnerBonus = (t.y < 33 || t.y > 67) && receiverSpace > 4 ? 6.5 : 0;
    const score =
      forwardProgress * 0.55 +
      runnerDepth * 0.1 +
      receiverSpace * 0.85 +
      laneClearance * 0.9 +
      passer.vision * 10 +
      passer.passing * 7 +
      passer.strength * 5 +
      (counterWindow ? 8 : 0) +
      (lineBreakingRun ? 7.5 : 0) +
      roleBonus +
      wideRunnerBonus -
      (marginalOffside ? 2.8 : 0) -
      d * 0.08;

    if (score > bestScore) {
      bestScore = score;
      best = {
        target: t,
        score,
        forwardProgress,
        receiverSpace,
        laneClearance,
        distance: d,
        targetX,
        targetY,
      };
    }
  });

  return bestScore > 10.8 ? best : null;
}

function selectBoxRunnerOption(
  passer: EnginePlayer,
  allPlayers: EnginePlayer[],
): PassOption | null {
  const isHome = attacksRightOf(passer);
  const opponents = allPlayers.filter((op) => op.team !== passer.team);
  const passerDepth = isHome ? passer.x : 100 - passer.x;
  if (passerDepth < 54) return null;

  let best: PassOption | null = null;
  let bestScore = -Infinity;

  allPlayers
    .filter((t) => t.team === passer.team && t.id !== passer.id && t.position !== "GK")
    .forEach((t) => {
      if (isOffside(t, allPlayers, { x: passer.x, y: passer.y } as Ball)) return;

      const d = dist(passer.x, passer.y, t.x, t.y);
      if (d < 4 || d > 42) return;

      const runnerDepth = isHome ? t.x : 100 - t.x;
      const forwardProgress = isHome ? t.x - passer.x : passer.x - t.x;
      const receiverSpace = nearestOpponentDistance(t, opponents);
      const laneClearance = passingLaneClearance(passer, t, opponents);
      const inBoxLane =
        runnerDepth > 70 &&
        t.y > BOX_MIN_Y - 10 &&
        t.y < BOX_MAX_Y + 10;
      if (!inBoxLane || forwardProgress < 0.5 || receiverSpace < 2.2 || laneClearance < 0.25) {
        return;
      }

      const score =
        forwardProgress * 0.72 +
        runnerDepth * 0.12 +
        receiverSpace * 1.55 +
        Math.min(laneClearance, 5) * 1.2 +
        passer.vision * 8 +
        passer.passing * 7 +
        passer.strength * 4 -
        d * 0.08;

      if (score > bestScore) {
        bestScore = score;
        best = {
          target: t,
          score,
          forwardProgress,
          receiverSpace,
          laneClearance,
          distance: d,
        };
      }
    });

  return bestScore > 10.6 ? best : null;
}

function selectLongSwitchOption(
  passer: EnginePlayer,
  allPlayers: EnginePlayer[],
): DirectPassOption | null {
  const isHome = attacksRightOf(passer);
  const opponents = allPlayers.filter((op) => op.team !== passer.team);
  const teammates = allPlayers.filter(
    (t) => t.team === passer.team && t.id !== passer.id && t.position !== "GK",
  );

  let best: DirectPassOption | null = null;
  let bestScore = -Infinity;

  teammates.forEach((t) => {
    const d = dist(passer.x, passer.y, t.x, t.y);
    const lateralSwitch = Math.abs(t.y - passer.y);
    const forwardProgress = isHome ? t.x - passer.x : passer.x - t.x;
    const receiverWide = t.y < 24 || t.y > 76;
    if (d < 28 || d > 66 || lateralSwitch < 30 || !receiverWide || forwardProgress < -8) {
      return;
    }

    const receiverSpace = nearestOpponentDistance(t, opponents);
    const laneClearance = passingLaneClearance(passer, t, opponents);
    if (receiverSpace < 4) return;

    const score =
      receiverSpace * 1.15 +
      lateralSwitch * 0.25 +
      Math.max(0, forwardProgress) * 0.25 +
      passer.vision * 9 +
      passer.passing * 6 +
      passer.overall * 4 +
      Math.min(laneClearance, 10) * 0.5 -
      d * 0.08;

    if (score > bestScore) {
      bestScore = score;
      best = {
        target: t,
        score,
        forwardProgress,
        receiverSpace,
        laneClearance,
        distance: d,
        targetX: clamp(t.x + (isHome ? 2 : -2), 3, 97),
        targetY: clamp(t.y, 5, 95),
      };
    }
  });

  return bestScore > 22 ? best : null;
}

function selectChippedPassOption(
  passer: EnginePlayer,
  allPlayers: EnginePlayer[],
): DirectPassOption | null {
  const isHome = attacksRightOf(passer);
  const opponents = allPlayers.filter((op) => op.team !== passer.team);
  const teammates = allPlayers.filter(
    (t) => t.team === passer.team && t.id !== passer.id && t.position !== "GK",
  );

  let best: DirectPassOption | null = null;
  let bestScore = -Infinity;

  teammates.forEach((t) => {
    if (isOffside(t, allPlayers, { x: passer.x, y: passer.y } as Ball)) return;
    const d = dist(passer.x, passer.y, t.x, t.y);
    if (d < 8 || d > 42) return;

    const forwardProgress = isHome ? t.x - passer.x : passer.x - t.x;
    if (forwardProgress < -2) return;

    const laneClearance = passingLaneClearance(passer, t, opponents);
    if (laneClearance > 3.1) return;

    const receiverSpace = nearestOpponentDistance(t, opponents);
    const depth = isHome ? t.x : 100 - t.x;
    const targetInUsefulZone = depth > 54 || receiverSpace > 6;
    if (!targetInUsefulZone || receiverSpace < 2.6) return;

    const score =
      Math.max(0, forwardProgress) * 0.42 +
      receiverSpace * 1.15 +
      (3.2 - laneClearance) * 3.1 +
      passer.passing * 8 +
      passer.vision * 8 +
      passer.curve * 5 +
      passer.strength * 4 -
      d * 0.08;

    if (score > bestScore) {
      bestScore = score;
      best = {
        target: t,
        score,
        forwardProgress,
        receiverSpace,
        laneClearance,
        distance: d,
        targetX: clamp(t.x + (isHome ? 1.4 : -1.4), 3, 97),
        targetY: clamp(t.y + t.vy * 2, 5, 95),
      };
    }
  });

  return bestScore > 18 ? best : null;
}

function selectSafeOutlet(
  passer: EnginePlayer,
  allPlayers: EnginePlayer[],
): PassOption | null {
  const isHome = passer.team === "home";
  const opponents = allPlayers.filter((op) => op.team !== passer.team);
  const teammates = allPlayers.filter(
    (t) => t.team === passer.team && t.id !== passer.id && t.position !== "GK",
  );

  let best: PassOption | null = null;
  let bestScore = -Infinity;

  teammates.forEach((t) => {
    const d = dist(passer.x, passer.y, t.x, t.y);
    if (d < 4 || d > 42) return;

    const laneClearance = passingLaneClearance(passer, t, opponents);
    const receiverSpace = nearestOpponentDistance(t, opponents);
    if (laneClearance < 2.8 || receiverSpace < 2.8) return;

    const forwardProgress = isHome ? t.x - passer.x : passer.x - t.x;
    const score =
      receiverSpace * 0.8 +
      laneClearance * 1.2 -
      Math.abs(d - 18) * 0.18 +
      (forwardProgress < 0 ? 3 : 0);

    if (score > bestScore) {
      bestScore = score;
      best = {
        target: t,
        score,
        forwardProgress,
        receiverSpace,
        laneClearance,
        distance: d,
      };
    }
  });

  return best;
}

function playerAerialScore(p: EnginePlayer): number {
  const heightScore = clamp((p.heightCm - 168) / 28, 0.15, 1);
  return (
    heightScore * 0.3 +
    p.jumping * 0.18 +
    p.positioning * 0.24 +
    p.reaction * 0.16 +
    p.overall * 0.12
  );
}

function selectCrossOption(
  crosser: EnginePlayer,
  allPlayers: EnginePlayer[],
): CrossOption | null {
  const isHome = attacksRightOf(crosser);
  const opponents = allPlayers.filter((op) => op.team !== crosser.team);
  const teammates = allPlayers.filter(
    (t) => t.team === crosser.team && t.id !== crosser.id && t.position !== "GK",
  );
  const crosserDepth = isHome ? crosser.x : 100 - crosser.x;
  const nearEndline = crosserDepth > 76;

  let best: CrossOption | null = null;
  let bestScore = -Infinity;

  teammates.forEach((t) => {
    if (isOffside(t, allPlayers, { x: crosser.x, y: crosser.y } as Ball)) return;
    const depth = isHome ? t.x : 100 - t.x;
    const inBoxLane = t.y > BOX_MIN_Y - 8 && t.y < BOX_MAX_Y + 8;
    const arrivingLate =
      getPlayerLine(t) === "MF" &&
      depth > 66 &&
      t.y > BOX_MIN_Y - 12 &&
      t.y < BOX_MAX_Y + 12;
    if (depth < 66 || (!inBoxLane && !arrivingLate)) return;

    const receiverSpace = nearestOpponentDistance(t, opponents);
    const targetX = clamp(
      t.x * 0.74 + (isHome ? 88 : 12) * 0.26,
      isHome ? 75 : 4,
      isHome ? 96 : 25,
    );
    const targetY = clamp(
      t.y * 0.72 + 50 * 0.28,
      BOX_MIN_Y - 4,
      BOX_MAX_Y + 4,
    );
    const d = dist(crosser.x, crosser.y, targetX, targetY);
    const centrality = 1 - Math.min(1, Math.abs(targetY - 50) / 24);
    const aerial = playerAerialScore(t);
    const line = getPlayerLine(t);
    const roleBonus = line === "FW" ? 2.2 : line === "MF" ? 3.4 : 1.1;
    const bodyCountBonus =
      teammates.filter((mate) => {
        const mateDepth = isHome ? mate.x : 100 - mate.x;
        return (
          mateDepth > 70 &&
          mate.y > BOX_MIN_Y - 8 &&
          mate.y < BOX_MAX_Y + 8
        );
      }).length * 0.7;
    const markedPenalty = Math.max(0, 4.5 - receiverSpace) * 2.5;
    const overhitPenalty = nearEndline && d > 34 ? 4 : 0;
    const score =
      depth * 0.16 +
      centrality * 7 +
      receiverSpace * 1.1 +
      aerial * 11 +
      roleBonus +
      bodyCountBonus +
      crosser.crossing * 5 -
      d * 0.16 -
      markedPenalty -
      overhitPenalty;

    if (score > bestScore) {
      bestScore = score;
      best = {
        target: t,
        score,
        targetX,
        targetY,
        distance: d,
        receiverSpace,
      };
    }
  });

  return bestScore > 11 ? best : null;
}

function decideOffBallAction(
  p: EnginePlayer,
  ball: Ball,
  allPlayers: EnginePlayer[],
): void {
  if (checkBackOnsideIfWaiting(p, ball, allPlayers)) return;

  const opponents = allPlayers.filter((op) => op.team !== p.team);
  const snapP = allPlayers.find((sp) => sp.id === p.id) ?? p;
  const isHome = p.team === "home";
  const goalX = isHome ? 100 : 0;
  const pressureDist = nearestOpponentDistance(snapP, opponents);
  const laneClearance = forwardLaneClearance(snapP, opponents);
  const forwardRoom = isHome ? 98 - snapP.x : snapP.x - 2;

  const ctx: BTContext = {
    player: p,
    ball,
    allPlayers,
    opponents,
    teammates: allPlayers.filter((t) => t.team === p.team && t.id !== p.id),
    isHome,
    goalX,
    distToGoal: Math.abs(snapP.x - goalX),
    pressureDist,
    laneClearance,
    forwardRoom,
  };
  getOffBallTree().evaluate(ctx);
}

function attackingSupport(
  p: EnginePlayer,
  ball: Ball,
  owner: EnginePlayer,
  allPlayers: EnginePlayer[],
): void {
  const isHome = p.team === "home";
  const strFactor = clamp((p.strength - 0.38) / 0.42, 0.45, 1.35);

  const isDefender = isHome ? p.baseX < 30 : p.baseX > 70;
  const isForward = isHome ? p.baseX > 50 : p.baseX < 50;
  const line = getPlayerLine(p);
  const ownerNearEndline = Math.abs(owner.x - (isHome ? 100 : 0)) < 30;
  const ownerWide = owner.y < 30 || owner.y > 70;
  const ownerDepth = isHome ? owner.x : 100 - owner.x;
  const attackingThird = ownerDepth > 58;
  const finalThird = ownerDepth > 68;
  const attackDir = isHome ? 1 : -1;
  const sameSideAsBall = (p.baseY < 50 && ball.y < 50) || (p.baseY > 50 && ball.y > 50);

  const playerWide = p.baseY < 35 || p.baseY > 65;
  const naturalY = p.baseY;
  const wideLaneY = naturalWideLaneY(p, ball.y, finalThird);
  const supportMinX = Math.max(2, p.zone.minX - (finalThird ? 14 : 7));
  const supportMaxX = Math.min(98, p.zone.maxX + (finalThird ? 30 : 16));
  const supportMinY = Math.max(2, p.zone.minY - (finalThird ? 22 : 16));
  const supportMaxY = Math.min(98, p.zone.maxY + (finalThird ? 22 : 16));

  let supportX: number;
  let supportY: number;

  if (isDefender) {
    const minDefX = isHome ? DEFENDER_MIN_X : -Infinity;
    const maxDefX = isHome ? Infinity : DEFENDER_MAX_X;
    const isFullback = isFullbackRole(p.position);
    const centralOutlet = shouldStepIntoCentralSupport(p, owner, ball, allPlayers);
    const sameSide =
      isFullback &&
      ((p.baseY < 50 && ball.y < 46) || (p.baseY > 50 && ball.y > 54));
    const isCentreBack = ["CB", "LCB", "RCB"].includes(p.position);
    const overlapPush = sameSide && attackingThird ? 42 : finalThird ? 28 : 16;
    const linePush = centralOutlet ? (attackingThird ? 24 : 18) : isCentreBack && finalThird ? 34 : overlapPush;
    const push = attackDir * linePush * strFactor;
    supportX = clamp(p.baseX + push, supportMinX, supportMaxX);
    if (centralOutlet) {
      supportX = clamp(
        owner.x - attackDir * (ownerDepth > 52 ? 8 : 10),
        supportMinX,
        supportMaxX,
      );
    } else if (isCentreBack && finalThird) {
      supportX = isHome
        ? clamp(Math.max(supportX, 50), supportMinX, supportMaxX)
        : clamp(Math.min(supportX, 50), supportMinX, supportMaxX);
    }
    supportX = clamp(supportX, minDefX, maxDefX);
    supportY = clamp(
      centralOutlet
        ? owner.y * 0.35 + 50 * 0.65
        : sameSide && attackingThird
        ? wideLaneY * 0.78 + ball.y * 0.22
        : isCentreBack && finalThird
          ? naturalY * 0.58 + 50 * 0.42
          : wideLaneY * (playerWide ? 0.86 : 0.62) + ball.y * (playerWide ? 0.08 : 0.18) + 50 * (playerWide ? 0.06 : 0.2),
      supportMinY,
      supportMaxY,
    );
  } else if (isForward) {
    if (ownerNearEndline || ownerWide) {
      const boxTargetX = isHome ? 90 : 10;
      const sideSpread = playerWide ? (p.baseY < 50 ? -6 : 6) : 0;
      const farWinger = playerWide && !sameSideAsBall;
      supportX = clamp(
        boxTargetX + sideSpread * 0.25 + (farWinger ? -attackDir * 2 : 0),
        supportMinX,
        supportMaxX,
      );
      const farPostY = owner.y < 50 ? 61 : 39;
      const nearPostY = owner.y < 50 ? 41 : 59;
      const spreadY = playerWide
        ? (p.baseY < 50) === (owner.y < 50)
          ? nearPostY
          : farPostY
        : farPostY;
      supportY = clamp(
        naturalY * 0.35 + spreadY * 0.65,
        supportMinY,
        supportMaxY,
      );
    } else {
      const ballWeight = 0.5 + strFactor * 0.35;
      const forwardPush = isHome
        ? Math.max(ball.x * ballWeight + 28, p.zone.minX)
        : Math.min(ball.x * ballWeight - 28, p.zone.maxX);
      supportX = clamp(forwardPush, supportMinX, supportMaxX);
      supportY = clamp(
        playerWide
          ? wideLaneY * 0.84 + ball.y * 0.12 + 50 * 0.04
          : naturalY * 0.62 + ball.y * 0.3 + 50 * 0.08,
        supportMinY,
        supportMaxY,
      );
    }
  } else {
    if (ownerNearEndline || ownerWide) {
      const midfielders = allPlayers
        .filter((mate) => mate.team === p.team && getPlayerLine(mate) === "MF")
        .sort((a, b) => Math.abs(a.baseY - 50) - Math.abs(b.baseY - 50));
      const mfRank = midfielders.findIndex((mate) => mate.id === p.id);
      const boxEntry = isHome ? (finalThird ? 84 : 76) : (finalThird ? 16 : 24);
      const edgeEntry = isHome ? (finalThird ? 80 : 70) : (finalThird ? 20 : 30);
      const sidePull = playerWide ? (p.baseY < 50 ? -7 : 7) : 0;
      supportX = clamp(
        mfRank === 0 ? boxEntry : edgeEntry + sidePull,
        supportMinX,
        supportMaxX,
      );
      const spreadY =
        mfRank === 0
          ? owner.y < 50 ? 58 : 42
          : playerWide
            ? wideLaneY * 0.9 + 50 * 0.1
            : owner.y < 50 ? 62 : 38;
      supportY = clamp(
        naturalY * 0.28 + spreadY * 0.72,
        supportMinY,
        supportMaxY,
      );
    } else {
      const advance = attackDir * (finalThird ? 30 : attackingThird ? 24 : 16) * strFactor;
      const midFloor = finalThird ? 66 : attackingThird ? 54 : 46;
      supportX = clamp(
        ball.x + advance + (p.baseX - owner.baseX) * 0.3,
        supportMinX,
        supportMaxX,
      );
      supportX = isHome
        ? Math.max(supportX, midFloor)
        : Math.min(supportX, 100 - midFloor);
      supportY = clamp(
        playerWide
          ? wideLaneY * 0.84 + ball.y * 0.12 + 50 * 0.04
          : naturalY * (line === "MF" && finalThird ? 0.42 : 0.54) +
            ball.y * (line === "MF" && finalThird ? 0.4 : 0.3) +
            50 * (line === "MF" && finalThird ? 0.18 : 0.16),
        supportMinY,
        supportMaxY,
      );
    }
  }

  const spacedTarget = applySupportSpacing(
    p,
    supportX,
    supportY,
    allPlayers.filter((mate) => mate.team === p.team),
    finalThird ? 8.4 : 7.2,
  );
  supportX = clamp(spacedTarget.x, supportMinX, supportMaxX);
  supportY = clamp(spacedTarget.y, supportMinY, supportMaxY);

  const dToOwner = dist(p.x, p.y, owner.x, owner.y);
  if (dToOwner < 8) {
    supportX = clamp(p.x - (owner.x - p.x) * 0.5, supportMinX, supportMaxX);
    supportY = clamp(p.y - (owner.y - p.y) * 0.5, supportMinY, supportMaxY);
  }

  if (isForward && p.id !== owner.id) {
    const safeLine = attackingOffsideSafeX(p.team, allPlayers, ball.x);
    const offsideMates = allPlayers.filter(
      (mate) =>
        mate.team === p.team &&
        mate.id !== p.id &&
        mate.position !== "GK" &&
        getPlayerLine(mate) === "FW" &&
        isOffside(mate, allPlayers, ball),
    ).length;
    const wideCutbackContext = owner.hasBall && ownerWide && ownerDepth > 76;
    const canBendRiskyRun =
      owner.hasBall &&
      offsideMates === 0 &&
      Math.abs(owner.x - (isHome ? 100 : 0)) < 22 &&
      owner.y > 25 &&
      owner.y < 75 &&
      p.speed > 0.62;
    const maxRiskLine = isHome ? safeLine + 0.7 : safeLine - 0.7;
    if (wideCutbackContext) {
      const ballLineSafe = isHome
        ? Math.max(safeLine, Math.min(owner.x - 1.1, 91))
        : Math.min(safeLine, Math.max(owner.x + 1.1, 9));
      supportX = isHome
        ? Math.min(supportX, ballLineSafe)
        : Math.max(supportX, ballLineSafe);
    } else if (canBendRiskyRun) {
      supportX = isHome
        ? Math.min(supportX, maxRiskLine)
        : Math.max(supportX, maxRiskLine);
    } else {
      supportX = isHome
        ? Math.min(supportX, safeLine)
        : Math.max(supportX, safeLine);
    }
  }

  p.aiState = "SUPPORT";
  steerTo(
    p,
    supportX,
    supportY,
    finalThird && (line === "MF" || line === "FW")
      ? 1.18
      : attackingThird && isDefender ? 1.08 : 0.82,
  );
}

function supportPassInTransit(
  p: EnginePlayer,
  ball: Ball,
  allPlayers: EnginePlayer[],
): void {
  const receiver = ball.intendedReceiverId
    ? (allPlayers.find((player) => player.id === ball.intendedReceiverId) ?? null)
    : null;
  if (receiver && receiver.id !== p.id) {
    attackingSupport(p, ball, receiver, allPlayers);
    return;
  }

  const isHome = p.team === "home";
  const dir = isHome ? 1 : -1;
  const line = getPlayerLine(p);
  const ballDepth = isHome ? ball.x : 100 - ball.x;
  const finalThird = ballDepth > 68;
  const attackingThird = ballDepth > 56;
  const wideLaneY = naturalWideLaneY(p, ball.y, finalThird);
  const playerWide = p.baseY < 35 || p.baseY > 65;
  const targetX =
    line === "DF"
      ? clamp(p.baseX + dir * (finalThird ? 24 : attackingThird ? 16 : 9), p.zone.minX - 10, p.zone.maxX + 18)
      : clamp(
          ball.x - dir * (line === "FW" ? 5 : finalThird ? 8 : 12),
          p.zone.minX - (finalThird ? 16 : 8),
          p.zone.maxX + (finalThird ? 24 : 12),
        );
  const laneY =
    line === "FW"
      ? playerWide
        ? wideLaneY * 0.82 + ball.y * 0.12 + 50 * 0.06
        : p.baseY * 0.5 + ball.y * 0.36 + 50 * 0.14
      : line === "MF" && finalThird
        ? playerWide
          ? wideLaneY * 0.84 + ball.y * 0.1 + 50 * 0.06
          : p.baseY * 0.42 + ball.y * 0.36 + 50 * 0.22
        : playerWide
          ? wideLaneY * 0.86 + ball.y * 0.08 + 50 * 0.06
          : p.baseY * 0.64 + ball.y * 0.24 + 50 * 0.12;
  const rawTargetY = clamp(
    laneY + (ballDepth > 62 && p.baseY !== 50 ? (p.baseY < 50 ? -5 : 5) : 0),
    p.zone.minY - (finalThird ? 12 : 6),
    p.zone.maxY + (finalThird ? 12 : 6),
  );
  const spacedTarget = applySupportSpacing(
    p,
    targetX,
    rawTargetY,
    allPlayers.filter((mate) => mate.team === p.team),
    finalThird ? 8 : 6.8,
  );
  const targetY = clamp(
    spacedTarget.y,
    p.zone.minY - (finalThird ? 14 : 8),
    p.zone.maxY + (finalThird ? 14 : 8),
  );

  p.aiState = "SUPPORT";
  steerTo(p, clamp(spacedTarget.x, 2, 98), targetY, finalThird && line !== "DF" ? 0.92 : 0.78);
}

function checkBackOnsideIfWaiting(
  p: EnginePlayer,
  ball: Ball,
  allPlayers: EnginePlayer[],
): boolean {
  if (p.position === "GK" || getPlayerLine(p) !== "FW") return false;
  const owner = ball.ownerId ? allPlayers.find((player) => player.id === ball.ownerId) : null;
  const teamHasControlledBall = owner?.team === p.team;
  const activePassToTeam = ball.intendedTeam === p.team && ball.ownerId === null;
  if (!teamHasControlledBall || activePassToTeam || ball.intendedReceiverId === p.id) return false;

  const margin = offsideMargin(p, allPlayers, ball);
  if (margin <= 0.9) return false;

  const safeLine = attackingOffsideSafeX(p.team, allPlayers, ball.x);
  const isHome = p.team === "home";
  const targetX = isHome
    ? clamp(safeLine - Math.min(1.3, margin * 0.32), 52, 96)
    : clamp(safeLine + Math.min(1.3, margin * 0.32), 4, 48);
  const targetY = clamp(
    p.y * 0.82 + naturalWideLaneY(p, ball.y, true) * 0.18,
    Math.max(5, p.zone.minY - 8),
    Math.min(95, p.zone.maxY + 8),
  );
  p.aiState = "SUPPORT";
  steerTo(p, targetX, targetY, margin > 1.8 ? 1.22 : 0.96);
  return true;
}

function isFullbackRole(position: string): boolean {
  return position === "LB" || position === "RB" || position === "LWB" || position === "RWB";
}

function isBoxMarkingDangerForTeam(
  team: "home" | "away",
  ball: Ball,
  allPlayers: EnginePlayer[],
): boolean {
  const defendingHome = team === "home";
  const ballDepth = defendingHome ? ball.x : 100 - ball.x;
  if (ballDepth > HOME_BOX_MAX_X + 18) return false;

  const opponentOwner = ball.ownerId
    ? (allPlayers.find((p) => p.id === ball.ownerId)?.team !== team)
    : ball.intendedTeam !== team;
  if (!opponentOwner && ball.intendedTeam !== null) return false;

  return allPlayers.some((op) => {
    if (op.team === team || op.position === "GK") return false;
    const depth = defendingHome ? op.x : 100 - op.x;
    return (
      depth < HOME_BOX_MAX_X + 12 &&
      op.y > BOX_MIN_Y - 8 &&
      op.y < BOX_MAX_Y + 8
    );
  });
}

function defensiveEngagement(
  p: EnginePlayer,
  ball: Ball,
  allPlayers: EnginePlayer[],
  distToBall: number,
  ballInZone: boolean,
): void {
  const isHome = p.team === "home";

  const teammates = allPlayers
    .filter(
      (op) => op.team === p.team && op.id !== p.id && op.position !== "GK",
    )
    .sort(
      (a, b) => dist(a.x, a.y, ball.x, ball.y) - dist(b.x, b.y, ball.x, ball.y),
    );

  const rank = teammates.findIndex(
    (op) => dist(op.x, op.y, ball.x, ball.y) >= distToBall,
  );
  const isFirst = rank === 0 || teammates.length === 0;
  const isSecond = rank === 1;

  const ballInOurBox = isHome
    ? ball.x < HOME_BOX_MAX_X
    : ball.x > AWAY_BOX_MIN_X;
  const line = getPlayerLine(p);
  const isDefender = line === "DF";
  const crossingDanger = isCrossingDangerForTeam(p.team, ball);
  const boxMarkingDanger = isBoxMarkingDangerForTeam(p.team, ball, allPlayers);
  const runnerDanger = dangerousRunnerForDefender(p, allPlayers);

  if (isDefender && (crossingDanger || boxMarkingDanger)) {
    defendPenaltyArea(p, ball, allPlayers);
    return;
  }

  if (isDefender && runnerDanger) {
    trackGoalSideRunner(p, runnerDanger);
    return;
  }

  if (isFirst) {
    const ballInDefensiveThird = isHome ? ball.x < 42 : ball.x > 58;
    if (isDefender && !ballInZone && !ballInOurBox && !ballInDefensiveThird) {
      returnToShape(p, ball, allPlayers);
      return;
    }

    p.aiState = "PRESS";
    const strFactor = Math.max(0.5, Math.min(1.3, p.strength * 2));
    let intensity = (ballInZone ? 0.74 : 0.48) * strFactor;
    if (isDefender) intensity *= 0.82;
    if (ballInOurBox) intensity = Math.min(0.88, 0.82 * strFactor);
    const centralBall = ball.y > 30 && ball.y < 70;
    if (isDefender && isFullbackRole(p.position) && centralBall) {
      intensity *= 0.72;
    }
    const compactPressY = isDefender
      ? ball.y * 0.62 + 50 * 0.38
      : ball.y;
    const pressX = clamp(
      ball.x,
      isHome ? Math.max(p.zone.minX, DEFENDER_MIN_X) : 2,
      isHome ? 98 : Math.min(p.zone.maxX, DEFENDER_MAX_X),
    );
    const pressY = clamp(
      compactPressY,
      Math.max(p.zone.minY, ballInOurBox ? BOX_MIN_Y : isDefender ? 16 : 2),
      Math.min(p.zone.maxY, ballInOurBox ? BOX_MAX_Y : isDefender ? 84 : 98),
    );
    steerTo(p, pressX, pressY, intensity);
    return;
  }

  if (ballInOurBox) {
    if (isDefender) {
      defendPenaltyArea(p, ball, allPlayers);
    } else {
      returnToShape(p, ball, allPlayers);
    }
    return;
  }

  if (isSecond && ballInZone) {
    const goalX = isHome ? 0 : 100;
    const centralBall = ball.y > 30 && ball.y < 70;
    const fullbackCentralCover =
      isDefender && isFullbackRole(p.position) && centralBall;
    const coverX = clamp(
      p.baseX * (fullbackCentralCover ? 0.38 : 0.45) +
        ball.x * (fullbackCentralCover ? 0.12 : 0.2) +
        goalX * (fullbackCentralCover ? 0.5 : 0.35),
      Math.max(p.zone.minX, DEFENDER_MIN_X),
      Math.min(p.zone.maxX, DEFENDER_MAX_X),
    );
    const coverY = clamp(
      fullbackCentralCover
        ? p.baseY * 0.38 + 50 * 0.46 + ball.y * 0.16
        : p.y * 0.6 + ball.y * 0.4,
      fullbackCentralCover ? Math.max(p.zone.minY, 24) : p.zone.minY,
      fullbackCentralCover ? Math.min(p.zone.maxY, 76) : p.zone.maxY,
    );
    p.aiState = "COVER";
    steerTo(p, coverX, coverY * 0.76 + 50 * 0.24, 0.56);
    return;
  }

  returnToShape(p, ball, allPlayers);
}

function isCrossingDangerForTeam(team: "home" | "away", ball: Ball): boolean {
  const defendingHome = team === "home";
  const depth = defendingHome ? ball.x : 100 - ball.x;
  const wide = ball.y < BOX_MIN_Y + 9 || ball.y > BOX_MAX_Y - 9;
  const inOrNearBox = depth < HOME_BOX_MAX_X + 9;
  const aerialOrLoose = ball.z > 0.25 || ball.ownerId === null;
  const opponentIntent =
    ball.intendedTeam === null || ball.intendedTeam !== team;

  return inOrNearBox && opponentIntent && (wide || aerialOrLoose);
}

function isLooseBallInDefensiveArea(
  team: "home" | "away",
  ball: Ball,
): boolean {
  const defendingHome = team === "home";
  const depth = defendingHome ? ball.x : 100 - ball.x;
  const centralArea = ball.y > BOX_MIN_Y - 8 && ball.y < BOX_MAX_Y + 8;
  const opponentIntent = ball.intendedTeam === null || ball.intendedTeam !== team;

  return ball.ownerId === null && opponentIntent && depth < HOME_BOX_MAX_X + 8 && centralArea;
}

function defendPenaltyArea(
  p: EnginePlayer,
  ball: Ball,
  allPlayers: EnginePlayer[],
): void {
  const isHome = p.team === "home";
  const opponents = allPlayers.filter(
    (op) => op.team !== p.team && op.position !== "GK",
  );
  const attackersInBox = opponents
    .filter((op) => {
      const depth = isHome ? op.x : 100 - op.x;
      return (
        depth < HOME_BOX_MAX_X + 10 &&
        op.y > BOX_MIN_Y - 7 &&
        op.y < BOX_MAX_Y + 7
      );
    })
    .sort((a, b) => {
      const dangerA = isHome ? a.x : 100 - a.x;
      const dangerB = isHome ? b.x : 100 - b.x;
      return dangerA - dangerB;
    });

  const isCentreBack = ["CB", "LCB", "RCB"].includes(p.position);
  const isFullback = isFullbackRole(p.position);
  const goalSide = isHome ? -1 : 1;
  const goalLineX = isHome ? 0 : 100;
  const nearPostY = ball.y < 50 ? GOAL_MIN_Y : GOAL_MAX_Y;
  let targetX: number;
  let targetY: number;

  const mark = attackersInBox
    .map((op) => ({
      op,
      score:
        Math.abs(op.y - p.baseY) +
        Math.abs(op.y - 50) * 0.18 +
        (isHome ? op.x : 100 - op.x) * 0.18,
    }))
    .sort((a, b) => a.score - b.score)[0]?.op ?? null;

  if (mark) {
    const markGap = isCentreBack ? 2.0 : isFullback ? 2.6 : 2.4;
    targetX = clamp(
      mark.x + goalSide * markGap,
      isHome ? 4 : AWAY_BOX_MIN_X - 6,
      isHome ? HOME_BOX_MAX_X + 5 : 96,
    );
    targetY = clamp(
      mark.y * (isFullback ? 0.86 : 0.92) + p.baseY * (isFullback ? 0.14 : 0.08),
      BOX_MIN_Y - 5,
      BOX_MAX_Y + 5,
    );
  } else if (isCentreBack) {
    const cbOffset = p.baseY < 50 ? -5 : 5;
    targetX = isHome ? HOME_GK_LINE_X + 5 : AWAY_GK_LINE_X - 5;
    targetY = clamp(50 + cbOffset + (ball.y - 50) * 0.12, BOX_MIN_Y, BOX_MAX_Y);
  } else {
    targetX = isHome ? HOME_BOX_MAX_X - 3 : AWAY_BOX_MIN_X + 3;
    targetY = clamp(
      nearPostY * 0.5 + ball.y * 0.3 + p.baseY * 0.2,
      BOX_MIN_Y - 4,
      BOX_MAX_Y + 4,
    );
  }

  targetX = clamp(targetX, Math.min(goalLineX, HOME_BOX_MAX_X), Math.max(goalLineX, AWAY_BOX_MIN_X));
  p.aiState = "COVER";
  steerTo(p, targetX, targetY, 0.94);
}

function returnToShape(p: EnginePlayer, ball: Ball, allPlayers: EnginePlayer[] = []): void {
  const isHome = p.team === "home";
  const line = getPlayerLine(p);
  const isDefender = line === "DF";
  const isMidfielder = line === "MF";
  const isForward = line === "FW";
  const crossingDanger = isDefender && isCrossingDangerForTeam(p.team, ball);
  const dir = isHome ? 1 : -1;

  // Outside box danger, keep defenders away from the GK. During cross danger,
  // defenders must be allowed to defend the six-yard and back-post spaces.
  const hardMinX = isHome && !crossingDanger ? DEFENDER_MIN_X : -Infinity;
  const hardMaxX = !isHome && !crossingDanger ? DEFENDER_MAX_X : Infinity;

  // Weaker teams compress more (sit deeper), stronger teams compress less (push higher)
  const strFactor = Math.max(0.3, Math.min(1.7, 2 - p.strength * 2));

  // Bidirectional compression — drop deeper when ball is in our half, push up when in theirs
  const shiftX = (ball.x - 50) * DEFENSIVE_COMPRESS * strFactor;
  const defendingOwnHalf = isHome ? ball.x < 56 : ball.x > 44;
  const teamHasTerritory = isHome ? ball.x > 52 : ball.x < 48;
  const ownDepth = isHome ? ball.x : 100 - ball.x;
  const attackDepth = isHome ? ball.x : 100 - ball.x;
  const ballCentral = ball.y > 30 && ball.y < 70;
  const ballOnLeft = ball.y < 38;
  const ballOnRight = ball.y > 62;
  const playerLeft = p.baseY < 50;
  const playerWide = p.baseY < 35 || p.baseY > 65;
  const sameSide = (playerLeft && ball.y < 50) || (!playerLeft && ball.y > 50);
  const wideLaneY = naturalWideLaneY(p, ball.y, teamHasTerritory);

  let targetX = clamp(
    p.baseX + shiftX * (isDefender ? 0.68 : 1),
    p.zone.minX,
    p.zone.maxX,
  );
  targetX = clamp(targetX, hardMinX, hardMaxX);
  let targetY = p.baseY + (ball.y - 50) * 0.12;
  let shapeIntensity = isDefender ? 0.68 : 0.6;
  let state: AIState = "RETURN";

  if (isDefender && defendingOwnHalf) {
    const isCentreBack = ["CB", "LCB", "RCB"].includes(p.position);
    const isFullback = isFullbackRole(p.position);
    const farSideFullback =
      isFullback &&
      ((playerLeft && ballOnRight) || (!playerLeft && ballOnLeft));
    const defenderLineDepth = clamp(ownDepth + 9, 18, crossingDanger ? 24 : 40);
    const defenderLineX = isHome ? defenderLineDepth : 100 - defenderLineDepth;
    if (isCentreBack) {
      targetX = clamp(defenderLineX, hardMinX, hardMaxX);
    } else {
      const fullbackDepthOffset = sameSide ? 1.8 : -2.4;
      targetX = clamp(defenderLineX + dir * fullbackDepthOffset, hardMinX, hardMaxX);
    }
    if (farSideFullback) shapeIntensity = 0.86;
    if (isFullback && ballCentral) {
      const goalSide = isHome ? -1 : 1;
      targetX = clamp(targetX + goalSide * 2.6, hardMinX, hardMaxX);
    }
    const compactBaseY =
      farSideFullback
        ? p.baseY * 0.34 + 50 * 0.66
        : p.baseY * (isCentreBack ? 0.78 : ballCentral ? 0.58 : 0.66) +
          50 * (isCentreBack ? 0.22 : ballCentral ? 0.42 : 0.34);
    const compactMinY = isCentreBack ? 31 : farSideFullback ? 25 : ballCentral ? 16 : 12;
    const compactMaxY = isCentreBack ? 69 : farSideFullback ? 75 : ballCentral ? 84 : 88;
    targetY = clamp(
      compactBaseY +
        (ball.y - 50) *
          (farSideFullback ? 0.03 : isFullback && ballCentral ? 0.12 : 0.18),
      Math.max(p.zone.minY, compactMinY),
      Math.min(p.zone.maxY, compactMaxY),
    );
    state = "COVER";
  } else if (defendingOwnHalf && (isMidfielder || isForward)) {
    const defenderLineDepth = clamp(ownDepth + 9, 18, 38);
    const midfieldDepth = clamp(defenderLineDepth + (ownDepth < 25 ? 12 : 15), 30, 58);
    const forwardDepth = clamp(midfieldDepth + 16, 44, 70);
    const wideForwardDrops = isForward && playerWide;
    const lineDepth = isMidfielder || wideForwardDrops ? midfieldDepth : forwardDepth;
    targetX = isHome ? lineDepth : 100 - lineDepth;
    if (isForward && !playerWide && ownDepth < 28) {
      targetX = isHome ? Math.max(targetX, 48) : Math.min(targetX, 52);
    }
    const compactBaseY = playerWide
      ? wideLaneY * 0.64 + ball.y * 0.12 + 50 * 0.24
      : p.baseY * 0.48 + ball.y * 0.22 + 50 * 0.3;
    targetY = clamp(
      compactBaseY,
      isMidfielder ? 18 : 24,
      isMidfielder ? 82 : 76,
    );
    shapeIntensity = isMidfielder ? 0.88 : wideForwardDrops ? 0.82 : 0.68;
    state = "COVER";
  } else if (teamHasTerritory) {
    const supportDepth = isDefender
      ? clamp(attackDepth - 24, 42, 62)
      : isMidfielder
        ? clamp(attackDepth - 8, 54, 78)
        : clamp(attackDepth + 5, 66, 89);
    targetX = isHome ? supportDepth : 100 - supportDepth;
    if (isForward && allPlayers.length > 0) {
      const safeLine = attackingOffsideSafeX(p.team, allPlayers, ball.x);
      targetX = isHome
        ? Math.min(targetX, safeLine)
        : Math.max(targetX, safeLine);
    }
    const baseWeight = playerWide
      ? isDefender ? 0.84 : isMidfielder ? 0.78 : 0.74
      : isDefender ? 0.58 : isMidfielder ? 0.38 : 0.34;
    const ballWeight = playerWide
      ? isDefender ? 0.08 : isMidfielder ? 0.12 : 0.16
      : isDefender ? 0.18 : isMidfielder ? 0.4 : 0.46;
    const centralWeight = 1 - baseWeight - ballWeight;
    const sideBias = playerWide ? (playerLeft ? -5.5 : 5.5) * (sameSide ? 1 : 0.55) : 0;
    targetY = clamp(
      (playerWide ? wideLaneY : p.baseY) * baseWeight + ball.y * ballWeight + 50 * centralWeight + sideBias,
      Math.max(2, p.zone.minY - (isDefender ? 10 : 16)),
      Math.min(98, p.zone.maxY + (isDefender ? 10 : 16)),
    );
    shapeIntensity = isDefender ? 0.76 : isMidfielder ? 0.88 : 0.8;
    state = isDefender ? "COVER" : "SUPPORT";
  } else {
    targetY = clamp(targetY, p.zone.minY, p.zone.maxY);
  }

  p.aiState = state;
  steerTo(p, targetX, targetY, shapeIntensity);
}

function updateGoalkeeper(
  gk: EnginePlayer,
  ball: Ball,
  allPlayers: EnginePlayer[],
): void {
  const isHome = attacksRightOf(gk);
  const lineX = isHome ? HOME_GK_LINE_X : AWAY_GK_LINE_X;
  const goalX = isHome ? 0 : 100;

  const ballOwner = ball.ownerId
    ? (allPlayers.find((p) => p.id === ball.ownerId) ?? null)
    : null;
  const teamHasBall = ballOwner?.team === gk.team;

  const ballInBox = isHome
    ? ball.x < HOME_BOX_MAX_X && ball.y > BOX_MIN_Y && ball.y < BOX_MAX_Y
    : ball.x > AWAY_BOX_MIN_X && ball.y > BOX_MIN_Y && ball.y < BOX_MAX_Y;
  const defendingDepth = isHome ? ball.x : 100 - ball.x;
  const ballWide =
    ball.y < BOX_MIN_Y + 8 ||
    ball.y > BOX_MAX_Y - 8 ||
    ball.y < 28 ||
    ball.y > 72;
  const crossThreat =
    defendingDepth < HOME_BOX_MAX_X + 15 &&
    !teamHasBall &&
    (ballWide || ball.z > 0.28 || ball.intendedTeam !== gk.team);

  const looseBallSpeed = Math.hypot(ball.vx, ball.vy);
  const canClaimLoose =
    ball.ownerId === null &&
    ballInBox &&
    ball.z < 0.95 &&
    looseBallSpeed < 0.24 &&
    dist(gk.x, gk.y, ball.x, ball.y) < 5.8 + gk.reaction * 2.8 + gk.gkHandling * 1.2;

  if (canClaimLoose) {
    ball.controlState = "KEEPER_CLAIMABLE";
    gk.aiState = "GK_CLAIM";
    steerTo(gk, ball.x, ball.y, 1.18);
  } else if (crossThreat) {
    const nearPostY = ball.y < 50 ? GOAL_MIN_Y : GOAL_MAX_Y;
    const postGuardY = clamp(
      50 + (nearPostY - 50) * 0.72 + (ball.y - 50) * 0.08,
      GOAL_MIN_Y - 1.8,
      GOAL_MAX_Y + 1.8,
    );
    const postGuardX = isHome
      ? clamp(HOME_GK_LINE_X + 1.4, 1, HOME_BOX_MAX_X - 3)
      : clamp(AWAY_GK_LINE_X - 1.4, AWAY_BOX_MIN_X + 3, 99);
    gk.aiState = "GK_SET";
    steerTo(gk, postGuardX, postGuardY, 1.06);
  } else if (ballInBox && !teamHasBall) {
    const claimable =
      ball.z < 1.1 &&
      ball.y > BOX_MIN_Y + 5 &&
      ball.y < BOX_MAX_Y - 5 &&
      defendingDepth < HOME_BOX_MAX_X - 2;
    if (!claimable) {
      const setY = clamp(50 + (ball.y - 50) * 0.25, GOAL_MIN_Y - 1.5, GOAL_MAX_Y + 1.5);
      const setX = isHome ? HOME_GK_LINE_X + 1 : AWAY_GK_LINE_X - 1;
      gk.aiState = "GK_SET";
      steerTo(gk, setX, setY, 0.82);
    } else {
      ball.controlState = "KEEPER_CLAIMABLE";
      gk.aiState = "GK_CLAIM";
      steerTo(gk, ball.x, ball.y, 1.08);
    }
  } else if (teamHasBall) {
    const advanceX = isHome
      ? clamp(lineX + 3.4, 1, HOME_BOX_MAX_X - 6)
      : clamp(lineX - 3.4, AWAY_BOX_MIN_X + 6, 99);
    const trackY = clamp(
      50 + (ball.y - 50) * 0.38,
      GOAL_MIN_Y - 2.4,
      GOAL_MAX_Y + 2.4,
    );
    gk.aiState = "GK_SET";
    steerTo(gk, advanceX, trackY, 0.64);
  } else {
    const ballDistFromGoal = Math.abs(ball.x - goalX);
    const centralThreat = ball.y > BOX_MIN_Y - 4 && ball.y < BOX_MAX_Y + 4;
    const advanceFactor =
      ballDistFromGoal < 30 && centralThreat
        ? clamp(((30 - ballDistFromGoal) / 30) * 5.6, 0, 5.6)
        : 0;
    const gkX = isHome
      ? clamp(lineX + advanceFactor, 1, HOME_GK_LINE_X + 6)
      : clamp(lineX - advanceFactor, AWAY_GK_LINE_X - 6, 99);
    const trackCenter = 50;
    const ballSideOffset = (ball.y - trackCenter) * 0.42;
    const trackY = clamp(
      trackCenter + ballSideOffset,
      GOAL_MIN_Y - 2.6,
      GOAL_MAX_Y + 2.6,
    );
    gk.aiState = "GK_SET";
    steerTo(gk, gkX, trackY, 0.76);
  }

  if (isHome) {
    gk.x = clamp(gk.x, 1, HOME_BOX_MAX_X - 4);
    gk.y = clamp(gk.y, GOAL_MIN_Y - 4, GOAL_MAX_Y + 4);
  } else {
    gk.x = clamp(gk.x, AWAY_BOX_MIN_X + 4, 99);
    gk.y = clamp(gk.y, GOAL_MIN_Y - 4, GOAL_MAX_Y + 4);
  }
}

class MatchTimer {
  private rafId: number | null = null;
  private lastTime: number | null = null;

  start(onTick: (delta: number) => void): void {
    if (this.rafId) return;
    const step = (now: number) => {
      const delta = this.lastTime
        ? Math.min((now - this.lastTime) / 1000, 0.08)
        : 0.016;
      this.lastTime = now;
      onTick(delta);
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  stop(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.lastTime = null;
  }
}

function deduplicate(arr: RawPlayerData[]): RawPlayerData[] {
  const seen = new Set<string>();
  return arr.filter((p) => {
    if (!p?.id || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

class SubstitutionModule {
  private bench: Record<"home" | "away", RawPlayerData[]>;
  private used: Record<"home" | "away", number> = { home: 0, away: 0 };
  private queued = new Set<string>();
  private maxSubs = 5;
  private staminaThreshold = 28;

  constructor(homeBench: RawPlayerData[], awayBench: RawPlayerData[]) {
    this.bench = {
      home: deduplicate(homeBench),
      away: deduplicate(awayBench),
    };
  }

  private replacementFits(outPlayer: EnginePlayer, candidate: RawPlayerData): boolean {
    const candidatePos = getPlayerPosition(candidate);
    if (outPlayer.position === "GK") return candidatePos === "GK";
    if (candidatePos === "GK") return false;
    return idealSlotForPosition(candidatePos).line === idealSlotForPosition(outPlayer.position).line;
  }

  queue(
    players: EnginePlayer[],
    team: "home" | "away",
    minute: number,
  ): PendingSubstitution | null {
    if (
      this.used[team] >= this.maxSubs ||
      minute < 35 ||
      this.bench[team].length === 0
    )
      return null;

    const tired = players
      .filter(
        (p) =>
          p.team === team &&
          p.stamina < this.staminaThreshold &&
          !this.queued.has(p.id),
      )
      .sort((a, b) => a.stamina - b.stamina)[0];

    if (!tired) return null;

    const activeIds = new Set(players.map((p) => p.id));
    const fresh = this.bench[team].find(
      (b) =>
        typeof b.id === "string" &&
        !activeIds.has(b.id) &&
        this.replacementFits(tired, b),
    );
    if (!fresh) return null;

    this.queued.add(tired.id);
    return {
      team,
      playerOutId: tired.id,
      playerOutName: tired.name,
      playerInName: readName(fresh),
      isManual: false,
    };
  }

  execute(
    players: EnginePlayer[],
    sub: PendingSubstitution,
  ): { out: EnginePlayer; in: EnginePlayer } | null {
    if (this.used[sub.team] >= this.maxSubs) return null;
    const outPlayer = players.find((p) => p.id === sub.playerOutId);
    if (!outPlayer) return null;

    const activeIds = new Set(players.map((p) => p.id));
    const replacementIndex = this.bench[sub.team].findIndex(
      (candidate) =>
        typeof candidate.id === "string" &&
        !activeIds.has(candidate.id) &&
        this.replacementFits(outPlayer, candidate),
    );
    if (replacementIndex < 0) return null;
    const [replacement] = this.bench[sub.team].splice(replacementIndex, 1);

    // Incoming player inherits outgoing player's slot & position
    const fakeSlot: FormationSlot = {
      x: outPlayer.baseX,
      y: outPlayer.baseY,
      zone: outPlayer.zone,
      line: "MF",
    };
    const incoming = createEnginePlayer(
      replacement,
      sub.team,
      fakeSlot,
      outPlayer.substitutionSlot,
    );
    incoming.x = outPlayer.x;
    incoming.y = outPlayer.y;
    incoming.targetX = outPlayer.targetX;
    incoming.targetY = outPlayer.targetY;

    players.splice(players.indexOf(outPlayer), 1, incoming);
    this.used[sub.team]++;
    this.queued.delete(outPlayer.id);

    return { out: outPlayer, in: incoming };
  }
}

function createEmptyStats(): TeamStatsState {
  return {
    possession: 50,
    shotsOnTarget: 0,
    shotsTotal: 0,
    shotsOffTarget: 0,
    blockedShots: 0,
    shotsInsideBox: 0,
    shotsOutsideBox: 0,
    hitWoodwork: 0,
    headedGoals: 0,
    bigChances: 0,
    expectedGoals: 0,
    xGOnTarget: 0,
    cornerKicks: 0,
    passesTotal: 0,
    passesAccurate: 0,
    passAccuracy: 0,
    yellowCards: 0,
    redCards: 0,
    penaltiesWon: 0,
    penaltiesScored: 0,
    penaltiesMissed: 0,
    touchesInOppositionBox: 0,
    accurateThroughPasses: 0,
    offsides: 0,
    freeKicks: 0,
    longPassesTotal: 0,
    longPassesAccurate: 0,
    finalThirdPassesTotal: 0,
    finalThirdPassesAccurate: 0,
    crossesTotal: 0,
    crossesAccurate: 0,
    expectedAssists: 0,
    throwIns: 0,
    fouls: 0,
    tacklesTotal: 0,
    tacklesWon: 0,
    duelsTotal: 0,
    duelsWon: 0,
    clearances: 0,
    interceptions: 0,
    errorsLeadingToShot: 0,
    errorsLeadingToGoal: 0,
    goalkeeperSaves: 0,
    xGOTFaced: 0,
    goalsConceded: 0,
    goalsPrevented: 0,
  };
}

function createEmptyPlayerStats(): PlayerStatsState {
  return {
    rating: 6,
    totalShots: 0,
    expectedGoals: 0,
    accuratePasses: 0,
    totalPasses: 0,
    touches: 0,
    touchesInOppositionBox: 0,
    successfulDribbles: 0,
    goals: 0,
    xGOnTarget: 0,
    shotsOnTarget: 0,
    shotsOffTarget: 0,
    blockedShots: 0,
    shotsInsideBox: 0,
    shotsOutsideBox: 0,
    headedShots: 0,
    bigChancesMissed: 0,
    bigChancesTotal: 0,
    foulsSuffered: 0,
    offsides: 0,
    bigChancesCreated: 0,
    keyPasses: 0,
    assists: 0,
    expectedAssists: 0,
    finalThirdPassesTotal: 0,
    finalThirdPassesAccurate: 0,
    longPassesTotal: 0,
    longPassesAccurate: 0,
    crossesTotal: 0,
    crossesAccurate: 0,
    duelsTotal: 0,
    duelsWon: 0,
    aerialDuelsTotal: 0,
    aerialDuelsWon: 0,
    groundDuelsTotal: 0,
    groundDuelsWon: 0,
    tacklesTotal: 0,
    tacklesWon: 0,
    foulsCommitted: 0,
    interceptions: 0,
    clearances: 0,
    errorsLeadingToGoal: 0,
    errorsLeadingToShot: 0,
    goalkeeperSaves: 0,
    goalsConceded: 0,
    goalsPrevented: 0,
    xGOTFaced: 0,
    punches: 0,
    throws: 0,
    actsAsSweeper: 0,
    minutesPlayed: 0,
    ownGoals: 0,
    yellowCards: 0,
    redCards: 0,
  };
}

// ── Scoring Functions ──────────────────────────────────────────

function getPlayerLine(p: EnginePlayer): "GK" | "DF" | "MF" | "FW" {
  const pos = p.position;
  if (pos === "GK") return "GK";
  if (["CB", "LCB", "RCB", "LB", "RB", "LWB", "RWB"].includes(pos)) return "DF";
  if (["CDM", "CM", "CAM", "LM", "RM", "AM", "SS"].includes(pos)) return "MF";
  return "FW";
}

function scoreShotAction(ctx: BTContext): number {
  if (ctx.player.position === "GK") return 0;

  const line = getPlayerLine(ctx.player);
  const roleMultiplier = line === "FW" ? 1.26 : line === "MF" ? 0.98 : line === "DF" ? 0.44 : 0;
  const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
  const inPenaltyArea =
    attackingDepth >= AWAY_BOX_MIN_X &&
    ctx.player.y > BOX_MIN_Y &&
    ctx.player.y < BOX_MAX_Y;
  const inPrimeZone = ctx.distToGoal <= 18 && ctx.player.y > 32 && ctx.player.y < 68;
  const fromOutsideBox = !inPenaltyArea;
  const supportPass = selectPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
  const throughOption = selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
  const boxRunner = selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
  const hasUsefulSupport =
    (Boolean(supportPass) &&
      supportPass!.laneClearance > 4.2 &&
      supportPass!.receiverSpace > 3.2 &&
      supportPass!.forwardProgress > -6) ||
    Boolean(throughOption && throughOption.forwardProgress > 8) ||
    Boolean(boxRunner && boxRunner.forwardProgress > 3);

  const distanceScore = inPenaltyArea
    ? Math.max(0, 1 - ctx.distToGoal / 34)
    : Math.max(0, 1 - Math.max(0, ctx.distToGoal - 18) / 22) * 0.45;
  const angleScore = ctx.player.y > 30 && ctx.player.y < 70 ? 1 : Math.max(0, 1 - Math.abs(ctx.player.y - 50) / 42);
  const shootingSkill = ctx.player.shooting * 0.5 + ctx.player.overall * 0.3;
  const pressurePenalty = Math.max(0, 1 - ctx.pressureDist / 8);
  const laneBonus = Math.min(ctx.laneClearance / 12, 1) * 0.16;
  const supportPenalty = hasUsefulSupport && fromOutsideBox ? 0.24 : 0;
  const outsideBoxPenalty = fromOutsideBox ? (ctx.player.shooting > 0.82 ? 0.27 : 0.44) : 0;
  const primeBonus = inPrimeZone ? 0.26 : 0;
  const crowdedBoxBonus =
    inPenaltyArea && ctx.pressureDist < 5 && !hasUsefulSupport ? 0.18 : 0;
  const teamQualityBonus = Math.max(0, ctx.player.strength - 0.68) * 0.16;

  const raw = (
    shootingSkill * 0.32 +
    distanceScore * 0.32 +
    angleScore * 0.12 -
    pressurePenalty * (inPenaltyArea ? 0.1 : 0.18) +
    laneBonus +
    primeBonus +
    crowdedBoxBonus -
    supportPenalty -
    outsideBoxPenalty +
    teamQualityBonus
  ) * roleMultiplier;
  return clamp(raw, 0, 1);
}

function scorePassAction(ctx: BTContext): number {
  if (ctx.player.position === "GK") return 0.8;

  const line = getPlayerLine(ctx.player);
  const roleMultiplier = line === "MF" ? 1.2 : line === "DF" ? 1.1 : line === "FW" ? 0.85 : 0.8;

  const bestPass = selectPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
  if (!bestPass) return 0;

  const route = openGoalRoute(ctx.player, ctx.allPlayers as EnginePlayer[], ctx.pressureDist);
  if (route.shouldExploit && bestPass.forwardProgress < 8) return 0.04;

  const passingSkill = ctx.player.passing * 0.4 + ctx.player.vision * 0.3 + ctx.player.overall * 0.2;
  const spaceReward = Math.min(bestPass.receiverSpace / 10, 1) * 0.2;
  const progressReward = Math.min(Math.max(0, bestPass.forwardProgress) / 20, 1) * 0.15;
  const safetyReward = Math.min(bestPass.laneClearance / 8, 1) * 0.2;
  const pressurePenalty = Math.max(0, 1 - ctx.pressureDist / 6) * 0.1;

  const openRoutePenalty =
    route.shouldExploit ? Math.max(0, 8 - bestPass.forwardProgress) * 0.075 : 0;
  const raw = (passingSkill * 0.35 + spaceReward + progressReward + safetyReward - pressurePenalty - openRoutePenalty) * roleMultiplier;
  return clamp(raw, 0, 1);
}

function scoreDribbleAction(ctx: BTContext): number {
  if (ctx.player.position === "GK") return 0;

  const line = getPlayerLine(ctx.player);
  const roleMultiplier = line === "FW" ? 1.02 : line === "MF" ? 0.86 : line === "DF" ? 0.58 : 0;

  const dribbleSkill = ctx.player.ballControl * 0.46 + ctx.player.speed * 0.18 + ctx.player.overall * 0.22;
  const spaceScore = Math.min(ctx.laneClearance / 16, 1) * 0.22;
  const lowPressure = Math.min(ctx.pressureDist / 12, 1) * 0.1;
  const forwardRoomScore = Math.min(ctx.forwardRoom / 42, 1) * 0.08;
  const widePenalty = (ctx.player.y < 24 || ctx.player.y > 76) ? 0.18 : 0;

  const raw = (dribbleSkill * 0.31 + spaceScore + lowPressure + forwardRoomScore - widePenalty) * roleMultiplier;
  return clamp(raw, 0, 1);
}

// ── Offside Detection ──────────────────────────────────────────

function getSecondLastDefender(
  player: EnginePlayer,
  allPlayers: EnginePlayer[],
): number {
  const isHome = attacksRightOf(player);
  const opponents = allPlayers.filter((p) => p.team !== player.team && p.position !== "GK");
  if (opponents.length < 2) return isHome ? 100 : 0;

  const sorted = [...opponents].sort((a, b) => (isHome ? b.x - a.x : a.x - b.x));
  return sorted[1].x;
}

function getOffsideLineForTeam(
  team: "home" | "away",
  allPlayers: EnginePlayer[],
): number {
  const sample = allPlayers.find((p) => p.team === team && p.position !== "GK");
  if (!sample) return team === "home" ? 100 : 0;
  return getSecondLastDefender(sample, allPlayers);
}

function isOffside(
  player: EnginePlayer,
  allPlayers: EnginePlayer[],
  ball: Ball,
): boolean {
  if (player.position === "GK") return false;
  const isHome = attacksRightOf(player);
  if (isHome ? player.x <= 50 : player.x >= 50) return false;

  const secondLastDefX = getSecondLastDefender(player, allPlayers);
  const beyondDefender = isHome ? player.x > secondLastDefX : player.x < secondLastDefX;
  const beyondBall = isHome ? player.x > ball.x : player.x < ball.x;

  return beyondDefender && beyondBall;
}

function offsideMargin(
  player: EnginePlayer,
  allPlayers: EnginePlayer[],
  ball: Ball,
): number {
  if (player.position === "GK") return 0;
  const isHome = attacksRightOf(player);
  if (isHome ? player.x <= 50 : player.x >= 50) return 0;
  const secondLastDefX = getSecondLastDefender(player, allPlayers);
  const defenderMargin = isHome ? player.x - secondLastDefX : secondLastDefX - player.x;
  const ballMargin = isHome ? player.x - ball.x : ball.x - player.x;
  return Math.max(0, Math.min(defenderMargin, ballMargin));
}

function isMarginalOffsideRun(
  player: EnginePlayer,
  allPlayers: EnginePlayer[],
  ball: Ball,
): boolean {
  return isOffside(player, allPlayers, ball) && offsideMargin(player, allPlayers, ball) <= 2.2;
}

function attackingOffsideSafeX(
  team: "home" | "away",
  allPlayers: EnginePlayer[],
  ballX: number,
): number {
  const lineX = getOffsideLineForTeam(team, allPlayers);
  const sample = allPlayers.find((p) => p.team === team && p.position !== "GK");
  const attackingRight = sample ? attacksRightOf(sample) : team === "home";
  if (attackingRight) return Math.min(lineX - 1.1, ballX + 18, 96);
  return Math.max(lineX + 1.1, ballX - 18, 4);
}

// ── Behavior Tree Context ──────────────────────────────────────

function createBTContext(
  p: EnginePlayer,
  snapshotBall: Ball,
  snapshotPlayers: EnginePlayer[],
  actions: EngineActions,
): BTContext {
  const snapP = snapshotPlayers.find((sp) => sp.id === p.id) ?? p;
  const isHome = actions.attacksRight(p.team);
  const goalX = actions.attackingGoalX(p.team);
  const opponents = snapshotPlayers.filter((op) => op.team !== p.team);
  const pressureDist = nearestOpponentDistance(snapP, opponents);
  const laneClearance = forwardLaneClearance(snapP, opponents, actions.attackDirection(p.team));
  const forwardRoom = isHome ? 98 - snapP.x : snapP.x - 2;

  return {
    player: p,
    ball: snapshotBall,
    allPlayers: snapshotPlayers,
    opponents,
    teammates: snapshotPlayers.filter((t) => t.team === p.team && t.id !== p.id),
    isHome,
    goalX,
    distToGoal: Math.abs(snapP.x - goalX),
    pressureDist,
    laneClearance,
    forwardRoom,
    actions,
  };
}

// ── Behavior Tree Builders ─────────────────────────────────────

function buildBallCarrierTree(): BTNode {
  return new BTSelector([
    new BTSequence([
      new BTCondition((ctx) => {
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        if (!inPenaltyArea || ctx.distToGoal > 28 || ctx.player.position === "GK") return false;
        const line = getPlayerLine(ctx.player);
        const shootIntent =
          line === "FW"
            ? 0.86
            : line === "MF"
              ? 0.62 + Math.max(0, ctx.player.strength - 0.68) * 0.28
              : 0.22;
        return (
          ctx.pressureDist > 1.3 &&
          scoreShotAction(ctx) > 0.08 &&
          Math.random() < shootIntent
        );
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        return (
          ctx.player.aiState === "DRIBBLE" &&
          ctx.player.decisionCooldown > 0.04 &&
          !inPenaltyArea &&
          ctx.distToGoal > 20 &&
          ctx.forwardRoom > 8 &&
          ctx.pressureDist > 5.4 &&
          ctx.laneClearance > 6.8
        );
      }),
      new BTAction((ctx) => {
        carryInLane(ctx.player, ctx.allPlayers as EnginePlayer[]);
        ctx.player.aiState = "DRIBBLE";
        ctx.player.decisionCooldown = Math.max(ctx.player.decisionCooldown, 0.18);
        return "success";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        const central = ctx.player.y > 27 && ctx.player.y < 73;
        const hasBoxConstruction =
          Boolean(selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[])) ||
          Boolean(selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]));
        const outsideMustShoot =
          !inPenaltyArea &&
          ctx.distToGoal <= 17 &&
          !hasBoxConstruction &&
          scoreShotAction(ctx) > 0.58 &&
          (ctx.player.shooting > 0.84 || ctx.pressureDist < 3.6) &&
          Math.random() < (ctx.player.shooting > 0.86 ? 0.42 : 0.22);
        return (
          central &&
          (inPenaltyArea || outsideMustShoot) &&
          ctx.pressureDist > 5.8 &&
          ctx.laneClearance > 5.2
        );
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        const boxRunner = selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        const through = selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        const wideCross =
          (ctx.player.y < 31 || ctx.player.y > 69) &&
          (ctx.isHome ? ctx.player.x > 60 : ctx.player.x < 40) &&
          Boolean(selectCrossOption(ctx.player, ctx.allPlayers as EnginePlayer[]));
        return (
          !inPenaltyArea &&
          attackingDepth > 54 &&
          ctx.pressureDist > 2.1 &&
          Boolean(
            (boxRunner && boxRunner.receiverSpace > 1.8 && boxRunner.forwardProgress > 0.5) ||
              (through && through.receiverSpace > 1.6 && through.forwardProgress > 4.5) ||
              wideCross,
          )
        );
      }),
      new BTAction((ctx) => {
        const boxRunner = selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (
          boxRunner &&
          !isOffside(boxRunner.target, ctx.allPlayers as EnginePlayer[], ctx.ball as Ball) &&
          ctx.actions!.pass(ctx.player, boxRunner.target)
        ) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          ctx.player.lastPassTargetId = boxRunner.target.id;
          return "success";
        }
        const through = selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (through && through.receiverSpace > 1.6 && ctx.actions!.throughPass(ctx.player, through.target)) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          ctx.player.lastPassTargetId = through.target.id;
          return "success";
        }
        const cross = selectCrossOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (cross && ctx.actions!.cross(ctx.player)) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const option = leadRunPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (!option) return false;
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const closeCentralShot =
          ctx.distToGoal <= 18 &&
          ctx.player.y > 28 &&
          ctx.player.y < 72 &&
          ctx.pressureDist > 6.5 &&
          scoreShotAction(ctx) > 0.28;
        return !closeCentralShot && attackingDepth > 30 && ctx.pressureDist > 1.8;
      }),
      new BTAction((ctx) => {
        const option = leadRunPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (option && ctx.actions!.leadPass(ctx.player, option.target)) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          ctx.player.lastPassTargetId = option.target.id;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const option = lineBreakingRunOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (!option) return false;
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const closeCentralShot =
          ctx.distToGoal <= 18 &&
          ctx.player.y > 28 &&
          ctx.player.y < 72 &&
          ctx.pressureDist > 6.5 &&
          scoreShotAction(ctx) > 0.28;
        return !closeCentralShot && attackingDepth > 32 && ctx.pressureDist > 2.4;
      }),
      new BTAction((ctx) => {
        const option = lineBreakingRunOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (option && ctx.actions!.throughPass(ctx.player, option.target)) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          ctx.player.lastPassTargetId = option.target.id;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        const edgeOfBox =
          !inPenaltyArea &&
          attackingDepth > 68 &&
          ctx.distToGoal <= 27 &&
          ctx.player.y > 24 &&
          ctx.player.y < 76;
        const line = getPlayerLine(ctx.player);
        const patience =
          line === "FW"
            ? 0.58
            : line === "MF"
              ? 0.72
              : 0.86;
        return (
          edgeOfBox &&
          ctx.pressureDist > 3.1 &&
          ctx.laneClearance > 3.4 &&
          Math.random() < patience
        );
      }),
      new BTAction((ctx) => {
        carryInLane(ctx.player, ctx.allPlayers as EnginePlayer[]);
        ctx.player.aiState = "DRIBBLE";
        ctx.player.decisionCooldown = Math.max(ctx.player.decisionCooldown, 0.28);
        return "success";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const route = openGoalRoute(ctx.player, ctx.allPlayers as EnginePlayer[], ctx.pressureDist);
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        return (
          route.shouldExploit &&
          (route.clearShotSoon || inPenaltyArea || ctx.distToGoal <= 19) &&
          scoreShotAction(ctx) > (inPenaltyArea ? 0.12 : 0.74) &&
          (inPenaltyArea || Math.random() < 0.24)
        );
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        const central = ctx.player.y > 28 && ctx.player.y < 72;
        return (
          central &&
          (inPenaltyArea || ctx.distToGoal <= 18) &&
          ctx.pressureDist > 6.5 &&
          ctx.laneClearance > 6 &&
          scoreShotAction(ctx) > (inPenaltyArea ? 0.1 : 0.72) &&
          (inPenaltyArea || (ctx.player.shooting > 0.86 && Math.random() < 0.28))
        );
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const route = openGoalRoute(ctx.player, ctx.allPlayers as EnginePlayer[], ctx.pressureDist);
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        return route.shouldExploit && !inPenaltyArea && ctx.distToGoal > 17;
      }),
      new BTAction((ctx) => {
        const carry = evaluateCarry(ctx.player, ctx.allPlayers as EnginePlayer[], ctx.pressureDist);
        carryInLane(ctx.player, ctx.allPlayers as EnginePlayer[]);
        ctx.player.aiState = "DRIBBLE";
        ctx.player.decisionCooldown = Math.max(ctx.player.decisionCooldown, clamp(carry.cooldown, 0.32, 0.86));
        return "success";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        const through = selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        const boxRunner = selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        return (
          !inPenaltyArea &&
          attackingDepth > 44 &&
          ctx.pressureDist > 2.4 &&
          Boolean(
            (through && through.forwardProgress > 7 && through.receiverSpace > 1.7) ||
              (boxRunner && boxRunner.forwardProgress > 3 && boxRunner.receiverSpace > 3.2),
          )
        );
      }),
      new BTAction((ctx) => {
        const through = selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (through && ctx.actions!.throughPass(ctx.player, through.target)) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          ctx.player.lastPassTargetId = through.target.id;
          return "success";
        }
        const boxRunner = selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (
          boxRunner &&
          !isOffside(boxRunner.target, ctx.allPlayers as EnginePlayer[], ctx.ball as Ball) &&
          ctx.actions!.pass(ctx.player, boxRunner.target)
        ) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          ctx.player.lastPassTargetId = boxRunner.target.id;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const line = getPlayerLine(ctx.player);
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const central = ctx.player.y > 26 && ctx.player.y < 74;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        const quickChance = inPenaltyArea || ctx.distToGoal <= 22;
        const hasConstructiveOption =
          Boolean(selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[])) ||
          Boolean(selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]));
        const intent = line === "FW" ? 0.9 : line === "MF" ? 0.58 : 0.16;
        return (
          central &&
          quickChance &&
          (inPenaltyArea || !hasConstructiveOption) &&
          scoreShotAction(ctx) > (inPenaltyArea ? 0.22 : 0.78) &&
          (inPenaltyArea || Math.random() < 0.24) &&
          Math.random() < intent
        );
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        return ctx.player.decisionCooldown > 0 && !inPenaltyArea && ctx.distToGoal > 24;
      }),
      new BTAction((ctx) => {
        carryInLane(ctx.player, ctx.allPlayers as EnginePlayer[]);
        ctx.player.aiState = "DRIBBLE";
        return "success";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const central = ctx.player.y > 22 && ctx.player.y < 78;
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        const close = ctx.distToGoal <= 18 || inPenaltyArea;
        const clearLane = ctx.laneClearance > 5;
        const safe = ctx.pressureDist > 3.8;
        return central && inPenaltyArea && close && clearLane && safe;
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        return (
          (inPenaltyArea || ctx.distToGoal <= 24) &&
          scoreShotAction(ctx) > (inPenaltyArea ? 0.34 : 0.82) &&
          (inPenaltyArea || Math.random() < 0.18)
        );
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const line = getPlayerLine(ctx.player);
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const central = ctx.player.y > 27 && ctx.player.y < 73;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        const option = selectPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        const poorSupport =
          !option ||
          option.forwardProgress < 3 ||
          option.receiverSpace < 3.2 ||
          option.laneClearance < 4;
        const hasToRiskIt = poorSupport || ctx.pressureDist < 5.2;
        const intent =
          line === "FW"
            ? 0.78
            : line === "MF"
              ? 0.48 + Math.max(0, ctx.player.strength - 0.68) * 0.35
              : 0.18;
        return (
          central &&
          (inPenaltyArea || ctx.distToGoal <= 20) &&
          hasToRiskIt &&
          scoreShotAction(ctx) > (inPenaltyArea ? 0.3 : 0.82) &&
          (inPenaltyArea || Math.random() < 0.2) &&
          Math.random() < intent
        );
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const line = getPlayerLine(ctx.player);
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const central = ctx.player.y > 25 && ctx.player.y < 75;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        const goodAngle = ctx.player.y > 30 && ctx.player.y < 70;
        const constructiveOption =
          selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]) ??
          selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]) ??
          selectPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        const intent =
          line === "FW"
            ? 0.8
            : line === "MF"
              ? 0.5 + Math.max(0, ctx.player.strength - 0.68) * 0.35
              : 0.14;
        return (
          central &&
          goodAngle &&
          (inPenaltyArea || ctx.distToGoal <= 22) &&
          (inPenaltyArea || !constructiveOption || constructiveOption.forwardProgress < 3) &&
          scoreShotAction(ctx) > (inPenaltyArea ? 0.16 : 0.76) &&
          (inPenaltyArea || Math.random() < 0.2) &&
          Math.random() < intent
        );
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const line = getPlayerLine(ctx.player);
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        const central = ctx.player.y > 25 && ctx.player.y < 75;
        const inPenaltyArea =
          attackingDepth >= AWAY_BOX_MIN_X &&
          ctx.player.y > BOX_MIN_Y &&
          ctx.player.y < BOX_MAX_Y;
        const constructiveOption =
          selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]) ??
          selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]) ??
          selectPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        const usefulShootingRange =
          inPenaltyArea || (attackingDepth > 72 && ctx.distToGoal <= 20 && !constructiveOption);
        const intent =
          line === "FW"
            ? 0.86
            : line === "MF"
              ? 0.58 + Math.max(0, ctx.player.strength - 0.68) * 0.4
              : 0.18;
        return (
          central &&
          usefulShootingRange &&
          ctx.laneClearance > 2.6 &&
          scoreShotAction(ctx) > (inPenaltyArea ? 0.12 : 0.72) &&
          (inPenaltyArea || Math.random() < 0.22) &&
          Math.random() < intent
        );
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const option = selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        const attackingDepth = ctx.isHome ? ctx.player.x : 100 - ctx.player.x;
        return Boolean(option && attackingDepth > 61 && ctx.pressureDist > 2.8);
      }),
      new BTAction((ctx) => {
        const option = selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (
          option &&
          !isOffside(option.target, ctx.allPlayers as EnginePlayer[], ctx.ball as Ball) &&
          ctx.actions!.pass(ctx.player, option.target)
        ) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          ctx.player.lastPassTargetId = option.target.id;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const option = selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        return Boolean(option && ctx.pressureDist > 3.2 && ctx.forwardRoom > 11);
      }),
      new BTAction((ctx) => {
        const option = selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (
          option &&
          ctx.actions!.throughPass(ctx.player, option.target)
        ) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          ctx.player.lastPassTargetId = option.target.id;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const inWide = ctx.player.y < 30 || ctx.player.y > 70;
        const inCrossZone = ctx.isHome ? ctx.player.x > 58 : ctx.player.x < 42;
        return inWide && inCrossZone;
      }),
      new BTAction((ctx) => {
        const option = selectCrossOption(
          ctx.player,
          ctx.allPlayers as EnginePlayer[],
        );
        if (option && ctx.actions!.cross(ctx.player)) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const option = selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        return Boolean(option && ctx.pressureDist > 4 && ctx.forwardRoom > 18);
      }),
      new BTAction((ctx) => {
        const option = selectThroughBallOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (
          option &&
          ctx.actions!.throughPass(ctx.player, option.target)
        ) {
          ctx.player.decisionCooldown = PASS_COOLDOWN * 1.1;
          ctx.player.lastPassTargetId = option.target.id;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const option = selectLongSwitchOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        const trappedWide = ctx.player.y < 24 || ctx.player.y > 76;
        const centralCounter = ctx.pressureDist > 5.5 && ctx.forwardRoom > 24;
        return Boolean(option && (trappedWide || centralCounter));
      }),
      new BTAction((ctx) => {
        const option = selectLongSwitchOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (option && ctx.actions!.longBall(ctx.player, option.target)) {
          ctx.player.decisionCooldown = PASS_COOLDOWN * 1.25;
          ctx.player.lastPassTargetId = option.target.id;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const option = selectChippedPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        return Boolean(option && ctx.pressureDist > 2.2);
      }),
      new BTAction((ctx) => {
        const option = selectChippedPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (
          option &&
          !isOffside(option.target, ctx.allPlayers as EnginePlayer[], ctx.ball as Ball) &&
          ctx.actions!.chippedPass(ctx.player, option.target)
        ) {
          ctx.player.decisionCooldown = PASS_COOLDOWN * 1.05;
          ctx.player.lastPassTargetId = option.target.id;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => Boolean(selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]))),
      new BTAction((ctx) => {
        const option = selectBoxRunnerOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (
          option &&
          !isOffside(option.target, ctx.allPlayers as EnginePlayer[], ctx.ball as Ball) &&
          ctx.actions!.pass(ctx.player, option.target)
        ) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          ctx.player.lastPassTargetId = option.target.id;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => scorePassAction(ctx) > 0.3),
      new BTAction((ctx) => {
        const bestPass = selectPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        if (bestPass && !isOffside(bestPass.target, ctx.allPlayers as EnginePlayer[], ctx.ball as Ball)) {
          if (ctx.actions!.pass(ctx.player, bestPass.target)) {
            ctx.player.decisionCooldown = PASS_COOLDOWN;
            ctx.player.lastPassTargetId = bestPass.target.id;
            return "success";
          }
        }
        return "failure";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const carry = evaluateCarry(ctx.player, ctx.allPlayers as EnginePlayer[], ctx.pressureDist);
        return carry.shouldDrive && scoreDribbleAction(ctx) > 0.48;
      }),
      new BTAction((ctx) => {
        const carry = evaluateCarry(ctx.player, ctx.allPlayers as EnginePlayer[], ctx.pressureDist);
        carryInLane(ctx.player, ctx.allPlayers as EnginePlayer[]);
        ctx.player.aiState = "DRIBBLE";
        ctx.player.decisionCooldown = Math.max(ctx.player.decisionCooldown, carry.cooldown);
        return "success";
      }),
    ]),

    new BTAction((ctx) => {
      const route = openGoalRoute(ctx.player, ctx.allPlayers as EnginePlayer[], ctx.pressureDist);
      if (route.shouldExploit) {
        carryInLane(ctx.player, ctx.allPlayers as EnginePlayer[]);
        ctx.player.aiState = "DRIBBLE";
        ctx.player.decisionCooldown = Math.max(ctx.player.decisionCooldown, 0.32);
        return "success";
      }
      const desperate =
        selectPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]) ??
        selectSafeOutlet(ctx.player, ctx.allPlayers as EnginePlayer[]);
      if (desperate && desperate.laneClearance > 1.5) {
        const target = desperate.target;
        if (!isOffside(target, ctx.allPlayers as EnginePlayer[], ctx.ball as Ball) &&
            ctx.actions!.pass(ctx.player, target)) {
          ctx.player.decisionCooldown = PASS_COOLDOWN;
          return "success";
        }
      }
      return "failure";
    }),

    new BTSequence([
      new BTCondition((ctx) => {
        const noPass = !selectPassOption(ctx.player, ctx.allPlayers as EnginePlayer[]);
        return (
          noPass &&
          ctx.distToGoal <= 22 &&
          ctx.player.y > 24 &&
          ctx.player.y < 76 &&
          scoreShotAction(ctx) > 0.43
        );
      }),
      new BTAction((ctx) => {
        if (ctx.actions!.shoot(ctx.player, ctx.goalX)) {
          ctx.player.decisionCooldown = SHOT_COOLDOWN;
          return "success";
        }
        return "failure";
      }),
    ]),

    new BTAction((ctx) => {
      carryInLane(ctx.player, ctx.allPlayers as EnginePlayer[]);
      ctx.player.aiState = "DRIBBLE";
      return "success";
    }),
  ]);
}

function buildOffBallTree(): BTNode {
  return new BTSelector([
    new BTSequence([
      new BTCondition((ctx) => !ctx.ball.ownerId),
      new BTAction((ctx) => {
        const distToBall = dist(ctx.player.x, ctx.player.y, ctx.ball.x, ctx.ball.y);
        const ballInZone =
          ctx.ball.x >= ctx.player.zone.minX &&
          ctx.ball.x <= ctx.player.zone.maxX &&
          ctx.ball.y >= ctx.player.zone.minY &&
          ctx.ball.y <= ctx.player.zone.maxY;

        if (isLooseBallInDefensiveArea(ctx.player.team, ctx.ball as Ball)) {
          const line = getPlayerLine(ctx.player);
          const defenders = (ctx.allPlayers as EnginePlayer[])
            .filter(
              (p) =>
                p.team === ctx.player.team &&
                p.position !== "GK" &&
                (getPlayerLine(p) === "DF" || getPlayerLine(p) === "MF"),
            )
            .sort(
              (a, b) =>
                dist(a.x, a.y, ctx.ball.x, ctx.ball.y) -
                dist(b.x, b.y, ctx.ball.x, ctx.ball.y),
            );
          const rank = defenders.findIndex((p) => p.id === ctx.player.id);
          if (rank >= 0 && rank < (line === "DF" ? 3 : 2)) {
            const nearestOpponentToBall = (ctx.allPlayers as EnginePlayer[])
              .filter((p) => p.team !== ctx.player.team && p.position !== "GK")
              .map((p) => ({ p, d: dist(p.x, p.y, ctx.ball.x, ctx.ball.y) }))
              .sort((a, b) => a.d - b.d)[0];
            const racePressure =
              nearestOpponentToBall && nearestOpponentToBall.d < distToBall + 5 ? 0.18 : 0;
            ctx.player.aiState = "INTERCEPT";
            steerTo(
              ctx.player,
              clamp(ctx.ball.x, Math.max(2, ctx.player.zone.minX - 18), Math.min(98, ctx.player.zone.maxX + 18)),
              clamp(ctx.ball.y, Math.max(2, ctx.player.zone.minY - 18), Math.min(98, ctx.player.zone.maxY + 18)),
              line === "DF" ? 1.18 + racePressure : 1.0 + racePressure * 0.7,
            );
            return "success";
          }
        }

        if (
          ctx.ball.intendedTeam &&
          ctx.ball.intendedTeam !== ctx.player.team &&
          isCrossingDangerForTeam(ctx.player.team, ctx.ball as Ball)
        ) {
          defensiveEngagement(
            ctx.player,
            ctx.ball as Ball,
            ctx.allPlayers as EnginePlayer[],
            distToBall,
            ballInZone,
          );
          return "success";
        }

        if (ctx.ball.intendedReceiverId === ctx.player.id && distToBall < 38) {
          const throughRun = ctx.ball.z <= 0.18 && Math.hypot(ctx.ball.vx, ctx.ball.vy) > 0.12;
          ctx.player.aiState = "INTERCEPT";
          steerTo(
            ctx.player,
            clamp(ctx.ball.x, Math.max(2, ctx.player.zone.minX - (throughRun ? 22 : 12)), Math.min(98, ctx.player.zone.maxX + (throughRun ? 22 : 12))),
            clamp(ctx.ball.y, Math.max(2, ctx.player.zone.minY - (throughRun ? 22 : 12)), Math.min(98, ctx.player.zone.maxY + (throughRun ? 22 : 12))),
            throughRun ? 1.28 : 0.95,
          );
          return "success";
        }

        if (ctx.ball.intendedTeam === ctx.player.team) {
          supportPassInTransit(
            ctx.player,
            ctx.ball as Ball,
            ctx.allPlayers as EnginePlayer[],
          );
          return "success";
        }

        const nearestTeammate = (ctx.allPlayers as EnginePlayer[])
          .filter((op) => op.team === ctx.player.team && op.id !== ctx.player.id && op.position !== "GK")
          .sort((a, b) => dist(a.x, a.y, ctx.ball.x, ctx.ball.y) - dist(b.x, b.y, ctx.ball.x, ctx.ball.y))[0];
        const iAmNearest = !nearestTeammate ||
          distToBall <= dist(nearestTeammate.x, nearestTeammate.y, ctx.ball.x, ctx.ball.y);
        const looseRebound =
          !ctx.ball.intendedTeam &&
          (ctx.ball.x < HOME_BOX_MAX_X + 12 ||
            ctx.ball.x > AWAY_BOX_MIN_X - 12 ||
            Math.hypot(ctx.ball.vx, ctx.ball.vy) < 0.04);

        if (iAmNearest && distToBall < (looseRebound ? 34 : 25) && (ballInZone || looseRebound)) {
          ctx.player.aiState = "INTERCEPT";
          steerTo(
            ctx.player,
            clamp(ctx.ball.x, Math.max(2, ctx.player.zone.minX - (looseRebound ? 22 : 12)), Math.min(98, ctx.player.zone.maxX + (looseRebound ? 22 : 12))),
            clamp(ctx.ball.y, Math.max(2, ctx.player.zone.minY - (looseRebound ? 22 : 12)), Math.min(98, ctx.player.zone.maxY + (looseRebound ? 22 : 12))),
            looseRebound ? 1.08 : 1.0,
          );
          return "success";
        }

        returnToShape(ctx.player, ctx.ball as Ball, ctx.allPlayers as EnginePlayer[]);
        return "success";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const owner = getBallOwner(ctx.ball, ctx.allPlayers as EnginePlayer[]);
        return owner !== null && owner.team === ctx.player.team;
      }),
      new BTAction((ctx) => {
        const owner = getBallOwner(ctx.ball, ctx.allPlayers as EnginePlayer[])!;
        attackingSupport(
          ctx.player,
          ctx.ball as Ball,
          owner,
          ctx.allPlayers as EnginePlayer[],
        );
        return "success";
      }),
    ]),

    new BTSequence([
      new BTCondition((ctx) => {
        const owner = getBallOwner(ctx.ball, ctx.allPlayers as EnginePlayer[]);
        return owner !== null && owner.team !== ctx.player.team;
      }),
      new BTAction((ctx) => {
        const distToBall = dist(ctx.player.x, ctx.player.y, ctx.ball.x, ctx.ball.y);
        const ballInZone =
          ctx.ball.x >= ctx.player.zone.minX &&
          ctx.ball.x <= ctx.player.zone.maxX &&
          ctx.ball.y >= ctx.player.zone.minY &&
          ctx.ball.y <= ctx.player.zone.maxY;
        defensiveEngagement(ctx.player, ctx.ball as Ball, ctx.allPlayers as EnginePlayer[], distToBall, ballInZone);
        return "success";
      }),
    ]),

    new BTAction((ctx) => {
      returnToShape(ctx.player, ctx.ball as Ball, ctx.allPlayers as EnginePlayer[]);
      return "success";
    }),
  ]);
}

function getBallOwner(ball: Ball, allPlayers: EnginePlayer[]): EnginePlayer | null {
  return ball.ownerId ? (allPlayers.find((p) => p.id === ball.ownerId) ?? null) : null;
}

// Cached tree instances (built once, reused across ticks)
let _ballCarrierTree: BTNode | null = null;
let _offBallTree: BTNode | null = null;

function getBallCarrierTree(): BTNode {
  if (!_ballCarrierTree) _ballCarrierTree = buildBallCarrierTree();
  return _ballCarrierTree;
}

function getOffBallTree(): BTNode {
  if (!_offBallTree) _offBallTree = buildOffBallTree();
  return _offBallTree;
}

export class MatchEngine implements EngineActions {
  private players: EnginePlayer[] = [];
  private playerRegistry = new Map<string, EnginePlayer>();

  private ball: Ball = {
    x: 50,
    y: 50,
    vx: 0,
    vy: 0,
    z: 0,
    vz: 0,
    status: "GROUNDED",
    flight: "ground",
    ownerId: null,
    lastOwnerId: null,
    intendedReceiverId: null,
    intendedTeam: null,
    offsideReceiverId: null,
    interceptionOpenTime: 0,
    controlState: "LOOSE",
  };
  private homeScore = 0;
  private awayScore = 0;
  private time = 0;
  private phase: MatchPhase = "PRE_MATCH";
  private activeHalf: "FIRST_HALF" | "SECOND_HALF" = "FIRST_HALF";
  private stoppageTime = 0;
  private stoppageEndTime = 45;
  private halfPauseTimer = 0;
  private isFinished = false;
  private speed = 1;
  private isPaused = false;
  private eventLocks: Record<string, number> = {};
  private eventIdCounter = 0;
  private setPiece: SetPieceState | null = null;
  private restartPhase: MatchPhase = "FIRST_HALF";
  private possessionGraceUntil = 0;
  private shotInFlight = false;
  private currentShot: ShotContext | null = null;
  private nextShotIsHeader = false;
  private nextShotIsPenalty = false;
  private lastPasserByReceiver = new Map<string, string>();
  private lastPassContext: PassContext | null = null;
  private pendingPassStats: PendingPassStatsContext | null = null;
  private tackleAttemptLocks = new Map<string, number>();
  private carrierPressureSeconds = new Map<string, number>();
  private ownerForgetSeconds = new Map<string, number>();
  private ownerMicroTouchCount = new Map<string, number>();
  private lastTickDt = 0;
  private liveFlowWatchdog = {
    ballX: 50,
    ballY: 50,
    pocketX: 50,
    pocketY: 50,
    ownerId: null as string | null,
    possessionTeam: null as "home" | "away" | null,
    ownerSeconds: 0,
    ownerStallSeconds: 0,
    globalStallSeconds: 0,
    tacticalStallSeconds: 0,
    hardStillSeconds: 0,
    eventCount: 0,
  };
  private pendingError: PendingErrorContext | null = null;
  private pendingKickoff: PendingKickoffContext | null = null;
  private referee: RefereeProfile = {
    rigidity: 0.5,
    foulLeniency: 0.5,
    cardStrictness: 0.5,
    penaltyStrictness: 0.5,
  };

  private stats: MatchStatsState = {
    home: createEmptyStats(),
    away: createEmptyStats(),
    firstHalf: {
      home: createEmptyStats(),
      away: createEmptyStats(),
    },
    secondHalf: {
      home: createEmptyStats(),
      away: createEmptyStats(),
    },
  };
  private possessionSamples: Record<"home" | "away", number> = {
    home: 1,
    away: 1,
  };
  private periodPossessionSamples = {
    firstHalf: { home: 1, away: 1 },
    secondHalf: { home: 1, away: 1 },
  };
  private events: MatchEventState[] = [];
  private pendingSubstitutions: PendingSubstitution[] = [];
  private eventListeners: Array<(e: MatchEventState) => void> = [];

  private timer = new MatchTimer();
  private subModule!: SubstitutionModule;
  private momentum = 1.0;
  private teamStrength: Record<"home" | "away", number> = { home: 0.65, away: 0.65 };
  private onUpdate: (state: MatchState) => void;

  constructor(
    homeData: RawPlayerData[],
    awayData: RawPlayerData[],
    _attendance: number,
    _capacity: number,
    _importance: number,
    onUpdate: (state: MatchState) => void,
    homeFormation = "4-3-3",
    awayFormation = "4-4-2",
  ) {
    this.onUpdate = onUpdate;
    this.momentum = 1;
    const rigidity = clamp(
      0.38 + _importance * 0.22 + (Math.random() - 0.5) * 0.18,
      0.22,
      0.82,
    );
    this.referee = {
      rigidity,
      foulLeniency: 1 - rigidity,
      cardStrictness: clamp(rigidity + (Math.random() - 0.5) * 0.14, 0.18, 0.92),
      penaltyStrictness: clamp(rigidity * 0.82 + 0.12, 0.2, 0.86),
    };
    this.subModule = new SubstitutionModule(
      homeData.slice(11),
      awayData.slice(11),
    );

    this.setupTeam(homeData, "home", homeFormation);
    this.setupTeam(awayData, "away", awayFormation);
    this.applyMatchupStrengthAdjustment();

    this.stoppageTime = this.calcStoppage();
    this.stoppageEndTime = 45 + this.stoppageTime;

    this.onEvent((e) => this.events.unshift(e));
    this.pushState();
  }

  start(): void {
    if (this.phase === "PRE_MATCH") {
      this.phase = "KICK_OFF";
      this.assignKickoff("home");
      this.emitEvent("kickoff", "home", "Kick-off!");
    }
    this.timer.start((delta) => this.tick(delta));
    setTimeout(() => {
      if (this.phase === "KICK_OFF") this.phase = "FIRST_HALF";
    }, 200);
  }

  stop(): void {
    this.timer.stop();
  }

  setPaused(paused: boolean): void {
    if (!paused && this.phase === "HALFTIME") {
      this.activeHalf = "SECOND_HALF";
      this.phase = "SECOND_HALF";
      this.time = 46;
      this.stoppageTime = this.calcStoppage();
      this.stoppageEndTime = 90 + this.stoppageTime;
      this.resetPositions();
      this.assignKickoff("away");
      this.emitEvent("kickoff", "away", "Second half!");
    }
    this.isPaused = paused;
    this.pushState();
  }

  setSpeed(speed: number): void {
    this.speed = clamp(speed, 0.25, 8);
    this.pushState();
  }

  executeQueuedSubstitutions(): void {
    if (this.phase !== "HALFTIME" && this.phase !== "STOPPAGE") return;
    const queue = [...this.pendingSubstitutions];
    this.pendingSubstitutions = [];
    queue.forEach((sub) => {
      const result = this.subModule.execute(this.players, sub);
      if (result) {
        this.playerRegistry.delete(result.out.id);
        this.playerRegistry.set(result.in.id, result.in);
        this.emitEvent(
          "substitution",
          sub.team,
          `${result.in.name} ↔ ${result.out.name}`,
        );
      }
    });
    this.pushState();
  }

  onEvent(listener: (e: MatchEventState) => void): void {
    this.eventListeners.push(listener);
  }

  private currentPeriodKey(): "firstHalf" | "secondHalf" {
    return this.activeHalf === "SECOND_HALF" || this.time >= 46
      ? "secondHalf"
      : "firstHalf";
  }

  attacksRight(team: "home" | "away"): boolean {
    return this.activeHalf === "SECOND_HALF" ? team === "away" : team === "home";
  }

  attackDirection(team: "home" | "away"): 1 | -1 {
    return this.attacksRight(team) ? 1 : -1;
  }

  attackingGoalX(team: "home" | "away"): number {
    return this.attacksRight(team) ? 100 : 0;
  }

  private addTeamStat(
    team: "home" | "away",
    key: keyof TeamStatsState,
    amount = 1,
  ): void {
    if (typeof this.stats[team][key] !== "number") return;
    this.stats[team][key] = (this.stats[team][key] as number) + amount;
    const period = this.stats[this.currentPeriodKey()][team];
    period[key] = (period[key] as number) + amount;
  }

  private addPlayerStat(
    player: EnginePlayer | null | undefined,
    key: keyof PlayerStatsState,
    amount = 1,
  ): void {
    if (!player || typeof player.matchStats[key] !== "number") return;
    player.matchStats[key] = (player.matchStats[key] as number) + amount;
  }

  private isInOppositionBox(team: "home" | "away", x: number, y: number): boolean {
    return this.attacksRight(team)
      ? x > AWAY_BOX_MIN_X && y > BOX_MIN_Y && y < BOX_MAX_Y
      : x < HOME_BOX_MAX_X && y > BOX_MIN_Y && y < BOX_MAX_Y;
  }

  private isFinalThird(team: "home" | "away", x: number): boolean {
    return this.attacksRight(team) ? x > 66 : x < 34;
  }

  private calculateShotQuality(
    shooter: EnginePlayer,
    distanceToGoal: number,
    targetY: number,
    pressure: number,
    onTarget: boolean,
    openNet: boolean,
  ): { xG: number; xGOT: number } {
    const goalX = this.attackingGoalX(shooter.team);
    const angleWidth = Math.abs(
      Math.atan2(GOAL_MAX_Y - shooter.y, goalX - shooter.x) -
        Math.atan2(GOAL_MIN_Y - shooter.y, goalX - shooter.x),
    );
    const angleBonus = clamp(angleWidth / 0.55, 0, 1) * 0.18;
    const distanceValue = Math.exp(-distanceToGoal / 22) * 0.44;
    const boxBonus = this.isInOppositionBox(shooter.team, shooter.x, shooter.y)
      ? 0.12
      : -0.04;
    const pressurePenalty = clamp((7 - pressure) / 7, 0, 1) * 0.15;
    const openNetBonus = openNet ? 0.16 : 0;
    const xG = clamp(
      0.025 + distanceValue + angleBonus + boxBonus + openNetBonus - pressurePenalty,
      0.01,
      openNet ? 0.72 : 0.58,
    );
    const placement = onTarget
      ? 1 - Math.min(1, Math.abs(targetY - 50) / (GOAL_WIDTH_UNITS / 2))
      : 0;
    const xGOT = onTarget ? clamp(xG * 0.55 + (1 - placement) * 0.22 + 0.06, 0.02, 0.9) : 0;
    return { xG, xGOT };
  }

  private attackingDepth(team: "home" | "away", x: number): number {
    return this.attacksRight(team) ? x : 100 - x;
  }

  private goalDistance(team: "home" | "away", x: number, y: number): number {
    return dist(x, y, this.attackingGoalX(team), 50);
  }

  private freeKickMode(
    team: "home" | "away",
    x: number,
    y: number,
  ): "quick" | "direct" | "cross" {
    const depth = this.attackingDepth(team, x);
    const goalDist = this.goalDistance(team, x, y);
    const central = y > 27 && y < 73;

    if (depth > 69 && central && goalDist < 32) return "direct";
    if (depth > 58) return "cross";
    return "quick";
  }

  private freeKickSetupTime(team: "home" | "away", x: number, y: number): number {
    const mode = this.freeKickMode(team, x, y);
    if (mode === "direct") return 2.35;
    if (mode === "cross") return 1.85;
    return 0.68;
  }

  private rememberPassContext(
    passer: EnginePlayer,
    kind: PassContext["kind"],
    accurate: boolean,
    restartSafe = false,
  ): void {
    const ownThird = this.attackingDepth(passer.team, passer.x) < 34;
    const centralOwnZone = ownThird && passer.y > 18 && passer.y < 82;
    const risky =
      passer.position === "GK" ||
      centralOwnZone ||
      (restartSafe && ownThird);

    this.lastPassContext = {
      passerId: passer.id,
      team: passer.team,
      kind,
      accurate,
      risky,
      expiresAt: this.time + (restartSafe ? 1.25 : 1.8),
    };
  }

  private registerPotentialError(claimer: EnginePlayer): void {
    const ctx = this.lastPassContext;
    if (!ctx || ctx.team === claimer.team || ctx.expiresAt < this.time) return;
    if (ctx.accurate && !ctx.risky) return;

    const passer = this.playerRegistry.get(ctx.passerId);
    if (!passer) return;
    const ownDanger =
      this.attackingDepth(passer.team, passer.x) < 42 ||
      this.attackingDepth(passer.team, claimer.x) < 45;
    if (!ctx.risky && !ownDanger) return;

    this.pendingError = {
      team: ctx.team,
      playerId: ctx.passerId,
      opponentTeam: claimer.team,
      expiresAt: this.time + 2.4,
      shotCredited: false,
    };
  }

  private creditErrorLeadingToShot(shootingTeam: "home" | "away"): void {
    const error = this.pendingError;
    if (
      !error ||
      error.opponentTeam !== shootingTeam ||
      error.expiresAt < this.time ||
      error.shotCredited
    ) {
      return;
    }

    const player = this.playerRegistry.get(error.playerId);
    this.addTeamStat(error.team, "errorsLeadingToShot");
    this.addPlayerStat(player, "errorsLeadingToShot");
    error.shotCredited = true;
  }

  private creditErrorLeadingToGoal(scoringTeam: "home" | "away"): void {
    const error = this.pendingError;
    if (!error || error.opponentTeam !== scoringTeam || error.expiresAt < this.time) {
      return;
    }

    if (!error.shotCredited) this.creditErrorLeadingToShot(scoringTeam);
    const player = this.playerRegistry.get(error.playerId);
    this.addTeamStat(error.team, "errorsLeadingToGoal");
    this.addPlayerStat(player, "errorsLeadingToGoal");
    this.pendingError = null;
  }

  private recordPassStats(
    passer: EnginePlayer,
    target: EnginePlayer,
    designedAccurate: boolean,
    kind: "pass" | "through" | "long" | "cross",
  ): void {
    const isCross = kind === "cross";
    const finalThird = !isCross && this.isFinalThird(passer.team, target.x);
    if (!isCross) {
      this.addTeamStat(passer.team, "passesTotal");
      this.addPlayerStat(passer, "totalPasses");
    }
    if (finalThird) {
      this.addTeamStat(passer.team, "finalThirdPassesTotal");
      this.addPlayerStat(passer, "finalThirdPassesTotal");
    }
    if (kind === "long") {
      this.addTeamStat(passer.team, "longPassesTotal");
      this.addPlayerStat(passer, "longPassesTotal");
    }
    if (kind === "cross") {
      this.addTeamStat(passer.team, "crossesTotal");
      this.addPlayerStat(passer, "crossesTotal");
    }
    if (!isCross) this.lastPasserByReceiver.delete(target.id);
    this.pendingPassStats = {
      passerId: passer.id,
      receiverId: target.id,
      team: passer.team,
      kind,
      finalThird,
      designedAccurate,
      expiresAt: this.time + (kind === "cross" || kind === "long" ? 2.4 : 1.8),
    };
  }

  private creditCompletedPass(receiver: EnginePlayer): void {
    const pending = this.pendingPassStats;
    if (
      !pending ||
      pending.team !== receiver.team ||
      pending.expiresAt < this.time
    ) {
      return;
    }

    const passer = this.playerRegistry.get(pending.passerId);
    if (pending.kind !== "cross") {
      this.addTeamStat(pending.team, "passesAccurate");
      this.addPlayerStat(passer, "accuratePasses");
    }
    if (pending.finalThird) {
      this.addTeamStat(pending.team, "finalThirdPassesAccurate");
      this.addPlayerStat(passer, "finalThirdPassesAccurate");
    }
    if (pending.kind === "through") this.addTeamStat(pending.team, "accurateThroughPasses");
    if (pending.kind === "long") {
      this.addTeamStat(pending.team, "longPassesAccurate");
      this.addPlayerStat(passer, "longPassesAccurate");
    }
    if (pending.kind === "cross") {
      this.addTeamStat(pending.team, "crossesAccurate");
      this.addPlayerStat(passer, "crossesAccurate");
    }
    this.lastPasserByReceiver.set(receiver.id, pending.passerId);
  }

  shoot(p: EnginePlayer, goalX: number): boolean {
    if (this.ball.ownerId !== p.id || !p.hasBall) return false;
    if (!this.prepareStrikeTouch(p, goalX, 50, "shot")) return false;
    if (!this.tryEvent("shot")) return false;
    this.creditErrorLeadingToShot(p.team);
    p.hasBall = false;
    this.ball.ownerId = null;
    this.ball.lastOwnerId = p.id;
    this.ball.controlState = "LOOSE";
    this.ball.lastTouchOwnerId = p.id;
    this.ball.lastTouchTime = this.time;
    this.ball.intendedReceiverId = null;
    this.ball.intendedTeam = null;
    this.ball.offsideReceiverId = null;
    this.ball.interceptionOpenTime = this.time;
    this.shotInFlight = true;

    const d = dist(p.x, p.y, goalX, 50);
    const opponents = this.players.filter(
      (op) => op.team !== p.team && op.position !== "GK",
    );
    const pressure = opponents.reduce(
      (min, op) => Math.min(min, dist(op.x, op.y, p.x, p.y)),
      Infinity,
    );
    const keeper = this.players.find(
      (op) => op.team !== p.team && op.position === "GK",
    );
    const keeperSet = keeper
      ? dist(keeper.x, keeper.y, goalX, 50) < 13 &&
        Math.abs(keeper.y - p.y) < 14
      : false;
    const central = p.y > 34 && p.y < 66;
    const freeClose = d < 18 && pressure > 7;
    const openNet = d < 20 && !keeperSet;
    const shotFromBox = this.isInOppositionBox(p.team, p.x, p.y);
    const pressurePenalty = clamp((8.5 - pressure) / 8.5, 0, 1) * 0.28;
    const distanceBonus = Math.max(0, 1 - d / 44) * 0.25;
    const qualityPenalty = Math.max(0, 0.68 - p.strength) * 0.18;
    const outsideShotPenalty =
      shotFromBox ? 0 : clamp((d - 18) / 28, 0.1, 0.34) + (p.shooting > 0.84 ? -0.04 : 0.04);
    const accuracy = this.nextShotIsPenalty
      ? clamp(0.88 + p.shooting * 0.07 + p.composure * 0.04 + p.overall * 0.03, 0.91, 0.985)
      : clamp(
          p.overall * 0.28 +
            p.shooting * 0.34 +
            p.strength * 0.12 +
            distanceBonus +
            (central ? 0.07 : -0.05) +
            (freeClose ? 0.12 : 0) +
            (openNet ? 0.14 : 0) -
            pressurePenalty -
            qualityPenalty -
            outsideShotPenalty,
          shotFromBox ? 0.18 : 0.1,
          freeClose || openNet ? 0.92 : shotFromBox ? 0.82 : 0.62,
        );
    const onTarget = Math.random() < accuracy;

    debugLog(
      `${p.name} SHOOTS from ${Math.round(d)}m (acc:${accuracy.toFixed(2)})`,
    );
    this.emitEvent("shot", p.team, `${p.name} shoots (${Math.round(d)}m)`);

    const targetY = onTarget
      ? clamp(
          50 + (Math.random() - 0.5) * GOAL_WIDTH_UNITS * 0.92,
          GOAL_MIN_Y + 0.35,
          GOAL_MAX_Y - 0.35,
        )
      : (Math.random() < 0.5 ? GOAL_MIN_Y - 1.4 : GOAL_MAX_Y + 1.4) +
        (Math.random() - 0.5) * (freeClose ? 1.2 : GOAL_WIDTH_UNITS * 0.42);
    const shotQuality = this.nextShotIsPenalty
      ? {
          xG: 0.79,
          xGOT: onTarget
            ? clamp(0.54 + p.shooting * 0.2 + p.overall * 0.16, 0.48, 0.88)
            : 0,
        }
      : this.calculateShotQuality(
      p,
      d,
      targetY,
      pressure,
      onTarget,
      openNet,
    );
    const defendingTeam = p.team === "home" ? "away" : "home";
    const inBox = this.isInOppositionBox(p.team, p.x, p.y);
    const assisterId = this.lastPasserByReceiver.get(p.id);
    const assister = assisterId ? this.playerRegistry.get(assisterId) : null;
    const angle = Math.atan2(targetY - p.y, goalX - p.x);

    this.addTeamStat(p.team, "shotsTotal");
    this.addTeamStat(p.team, "expectedGoals", shotQuality.xG);
    this.addPlayerStat(p, "totalShots");
    this.addPlayerStat(p, "expectedGoals", shotQuality.xG);
    if (this.nextShotIsHeader) {
      this.addPlayerStat(p, "headedShots");
    }
    if (shotQuality.xG >= 0.28) {
      this.addTeamStat(p.team, "bigChances");
      this.addPlayerStat(p, "bigChancesTotal");
    }
    if (inBox) {
      this.addTeamStat(p.team, "shotsInsideBox");
      this.addPlayerStat(p, "shotsInsideBox");
    } else {
      this.addTeamStat(p.team, "shotsOutsideBox");
      this.addPlayerStat(p, "shotsOutsideBox");
    }
    if (assister && assister.team === p.team && assister.id !== p.id) {
      this.addTeamStat(p.team, "expectedAssists", shotQuality.xG);
      this.addPlayerStat(assister, "expectedAssists", shotQuality.xG);
      this.addPlayerStat(assister, "keyPasses");
      if (shotQuality.xG >= 0.28) this.addPlayerStat(assister, "bigChancesCreated");
    }

    const blocker = nearestBlockerOnPath(
      p.x,
      p.y,
      goalX,
      targetY,
      opponents,
      1.35,
    );
    if (
      blocker &&
      Math.random() < 0.16 + blocker.blocker.reaction * 0.2
    ) {
      this.addTeamStat(p.team, "blockedShots");
      this.addPlayerStat(p, "blockedShots");
      this.addPlayerStat(blocker.blocker, "clearances");
      this.addTeamStat(blocker.blocker.team, "clearances");
      const attackingHome = p.team === "home";
      const towardEndline = Math.random() < 0.46;
      const side = blocker.blocker.y < 50 ? -1 : 1;
      const deflectAngle = towardEndline
        ? Math.atan2(side * (10 + Math.random() * 20), attackingHome ? 34 : -34)
        : Math.atan2(side * (26 + Math.random() * 22), attackingHome ? 8 : -8);
      const deflectPower = 0.18 + Math.random() * 0.24;

      this.ball.vx = Math.cos(deflectAngle) * deflectPower;
      this.ball.vy = Math.sin(deflectAngle) * deflectPower;
      this.ball.curveX = 0;
      this.ball.curveY = 0;
      this.ball.x = p.x + Math.cos(angle) * 1.0;
      this.ball.y = p.y + Math.sin(angle) * 1.0;
      this.ball.z = 0.26 + Math.random() * 0.36;
      this.ball.vz = 0.14 + Math.random() * 0.08;
      this.ball.status = "AIRBORNE";
      this.ball.flight = "driven";
      this.ball.lastOwnerId = blocker.blocker.id;
      this.ball.interceptionOpenTime = this.time;
      this.emitEvent("tackle", blocker.blocker.team, `${blocker.blocker.name} blocks the shot`);
      return true;
    }
    if (onTarget) {
      this.addTeamStat(p.team, "shotsOnTarget");
      this.addTeamStat(p.team, "xGOnTarget", shotQuality.xGOT);
      this.addTeamStat(defendingTeam, "xGOTFaced", shotQuality.xGOT);
      this.addPlayerStat(p, "shotsOnTarget");
      this.addPlayerStat(p, "xGOnTarget", shotQuality.xGOT);
      const keeper = this.players.find(
        (op) => op.team === defendingTeam && op.position === "GK",
      );
      this.addPlayerStat(keeper, "xGOTFaced", shotQuality.xGOT);
    } else {
      this.addTeamStat(p.team, "shotsOffTarget");
      this.addPlayerStat(p, "shotsOffTarget");
      if (shotQuality.xG >= 0.28) this.addPlayerStat(p, "bigChancesMissed");
    }
    this.currentShot = {
      team: p.team,
      shooterId: p.id,
      assisterId: assister && assister.team === p.team && assister.id !== p.id ? assister.id : null,
      xG: shotQuality.xG,
      xGOT: shotQuality.xGOT,
      headed: this.nextShotIsHeader,
      penalty: this.nextShotIsPenalty,
    };
    const power = 0.62 + p.shooting * 0.55 + Math.min(d, 35) * 0.006;
    const shotCurve = curveVector(angle, p, "shot");
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.curveX = shotCurve.curveX;
    this.ball.curveY = shotCurve.curveY;
    this.ball.z = 0.12;
    this.ball.vz = onTarget ? 0.055 + p.shooting * 0.055 : 0.09 + p.shooting * 0.08;
    this.ball.status = "AIRBORNE";
    this.ball.flight = "driven";
    return true;
  }

  pass(p: EnginePlayer, target: EnginePlayer, restartSafe = false): boolean {
    if (!(restartSafe && this.phase === "SET_PIECE") && !this.prepareStrikeTouch(p, target.x, target.y, "pass")) return false;
    if (!this.tryEvent("pass")) return false;
    this.shotInFlight = false;
    p.hasBall = false;
    this.ball.ownerId = null;
    this.ball.lastOwnerId = p.id;
    this.ball.controlState = "PASS_IN_FLIGHT";
    this.ball.lastTouchOwnerId = p.id;
    this.ball.lastTouchTime = this.time;
    this.ball.intendedReceiverId = target.id;
    this.ball.intendedTeam = p.team;
    this.ball.offsideReceiverId = isOffside(target, this.players, this.ball)
      ? target.id
      : null;
    p.lastPassTargetId = target.id;
    p.consecutivePasses++;
    p.possessionFlipCount = 0;
    debugLog(
      `${p.name} → ${target.name} (d=${Math.round(dist(p.x, p.y, target.x, target.y))})`,
    );

    const d = dist(p.x, p.y, target.x, target.y);
    const pressure = this.players
      .filter((op) => op.team !== p.team)
      .reduce((min, op) => Math.min(min, dist(op.x, op.y, p.x, p.y)), Infinity);
    const pressurePenalty = pressure < 4 ? 0.075 : pressure < 7 ? 0.035 : 0;
    const restartBonus = restartSafe ? 0.24 : 0;
    const skill = passExecutionSkill(p, "pass");
    const accurate =
      Math.random() <
      clamp(
        0.61 +
          skill * 0.38 +
          p.composure * 0.12 +
          p.strength * 0.22 +
          restartBonus -
          pressurePenalty -
          d * (restartSafe ? 0.00045 : 0.0009),
        restartSafe ? 0.96 : 0.78,
        restartSafe ? 0.995 : 0.975,
      );
    const targetSpeed = Math.hypot(target.vx, target.vy);
    const receiverLead = restartSafe
      ? clamp(d / 30, 0.35, 1.15)
      : clamp(d / 34 + targetSpeed * 1.6, 0.28, 1.55);
    const towardEndline = this.attackDirection(p.team);
    let tx = target.x + target.vx * receiverLead;
    let ty = target.y + target.vy * receiverLead;
    const endlineBuffer = restartSafe ? 3.2 : 5.2;
    tx = clamp(tx, endlineBuffer, 100 - endlineBuffer);
    if ((tx - target.x) * towardEndline > 2.7) tx = target.x + towardEndline * 2.7;

    if (!accurate) {
      const miss = restartSafe ? 0.75 : 1.85;
      tx += deterministicSigned(`${p.id}:${target.id}:pass:x:${this.time.toFixed(2)}`, miss * 0.5);
      ty += deterministicSigned(`${p.id}:${target.id}:pass:y:${this.time.toFixed(2)}`, miss * 0.5);
    }
    this.recordPassStats(p, target, accurate, "pass");
    this.rememberPassContext(p, "pass", accurate, restartSafe);

    const angle = Math.atan2(ty - p.y, tx - p.x);
    // Power proportional to distance — increased speed
    const power = groundBallPowerForDistance(dist(p.x, p.y, tx, ty), passExecutionSkill(p, "pass"), restartSafe) * (restartSafe ? 0.96 : 0.94);
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.curveX = 0;
    this.ball.curveY = 0;
    this.ball.x = p.x + Math.cos(angle) * 0.72;
    this.ball.y = p.y + Math.sin(angle) * 0.72;
    this.ball.z = 0;
    this.ball.vz = 0;
    this.ball.status = "GROUNDED";
    this.ball.flight = "ground";
    this.ball.interceptionOpenTime =
      this.time + (accurate ? clamp(d / 115, 0.1, 0.28) : 0.05);
    target.aiState = "INTERCEPT";
    target.targetX = tx;
    target.targetY = ty;
    target.decisionCooldown = Math.min(target.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.55);
    steerTo(target, tx, ty, 1.02);
    primeReceiverForIncomingBall(target, this.ball, this.attackDirection(target.team));
    this.emitEvent("pass", p.team, `${p.name} passes to ${target.name}`);
    return true;
  }

  leadPass(p: EnginePlayer, target: EnginePlayer): boolean {
    if (!this.prepareStrikeTouch(p, target.x, target.y, "pass")) return false;
    if (!this.tryEvent("pass")) return false;
    this.shotInFlight = false;
    const dir = this.attackDirection(p.team);
    const d = dist(p.x, p.y, target.x, target.y);
    const pressure = this.players
      .filter((op) => op.team !== p.team)
      .reduce((min, op) => Math.min(min, dist(op.x, op.y, p.x, p.y)), Infinity);
    const skill = passExecutionSkill(p, "through") * 0.58 + passExecutionSkill(p, "pass") * 0.42;
    const runnerDepth = dir > 0 ? target.x : 100 - target.x;
    const lead = clamp(0.95 + target.speed * 2.55 + Math.max(0, target.vx * dir) * 3.1, 1.2, 3.35);
    const endlineBuffer = runnerDepth > 72 ? 11.8 : 8.4;
    const minThroughX = dir > 0 ? 7 : endlineBuffer;
    const maxThroughX = dir > 0 ? 100 - endlineBuffer : 93;
    let tx = clamp(target.x + dir * lead + target.vx * 0.95, minThroughX, maxThroughX);
    let ty = clamp(target.y + target.vy * 0.95 + (target.y - p.y) * 0.025, 8, 92);
    const accurate =
      Math.random() <
      clamp(
        0.58 +
          skill * 0.38 +
          p.composure * 0.1 +
          p.strength * 0.16 -
          d * 0.0009 -
          Math.max(0, 5 - pressure) * 0.009,
        0.72,
        0.965,
      );

    if (!accurate) {
      tx += deterministicSigned(`${p.id}:${target.id}:lead:x:${this.time.toFixed(2)}`, 1.4);
      ty += deterministicSigned(`${p.id}:${target.id}:lead:y:${this.time.toFixed(2)}`, 1.2);
    }

    p.hasBall = false;
    this.ball.ownerId = null;
    this.ball.lastOwnerId = p.id;
    this.ball.controlState = "PASS_IN_FLIGHT";
    this.ball.lastTouchOwnerId = p.id;
    this.ball.lastTouchTime = this.time;
    this.ball.intendedReceiverId = target.id;
    this.ball.intendedTeam = p.team;
    this.ball.offsideReceiverId = isOffside(target, this.players, this.ball)
      ? target.id
      : null;
    p.lastPassTargetId = target.id;
    p.consecutivePasses++;
    p.possessionFlipCount = 0;
    this.recordPassStats(p, target, accurate, "pass");
    this.rememberPassContext(p, "pass", accurate);

    const angle = Math.atan2(ty - p.y, tx - p.x);
    const power = groundBallPowerForDistance(dist(p.x, p.y, tx, ty), skill, false) * 0.86;
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.curveX = 0;
    this.ball.curveY = 0;
    this.ball.x = p.x + Math.cos(angle) * 0.85;
    this.ball.y = p.y + Math.sin(angle) * 0.85;
    this.ball.z = 0;
    this.ball.vz = 0;
    this.ball.status = "GROUNDED";
    this.ball.flight = "ground";
    this.ball.interceptionOpenTime = this.time + (accurate ? clamp((d + lead) / 120, 0.12, 0.34) : 0.06);
    target.aiState = "INTERCEPT";
    target.targetX = tx;
    target.targetY = ty;
    target.decisionCooldown = Math.min(target.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.5);
    steerTo(target, tx, ty, 1.08);
    primeReceiverForIncomingBall(target, this.ball, this.attackDirection(target.team));
    this.emitEvent("pass", p.team, `${p.name} leads a pass to ${target.name}`);
    return true;
  }

  throughPass(p: EnginePlayer, target: EnginePlayer): boolean {
    if (!this.prepareStrikeTouch(p, target.x, target.y, "pass")) return false;
    if (!this.tryEvent("pass")) return false;
    this.shotInFlight = false;
    const dir = this.attackDirection(p.team);
    const d = dist(p.x, p.y, target.x, target.y);
    const pressure = this.players
      .filter((op) => op.team !== p.team)
      .reduce((min, op) => Math.min(min, dist(op.x, op.y, p.x, p.y)), Infinity);
    const runnerDepth = dir > 0 ? target.x : 100 - target.x;
    const lead = clamp(1.35 + target.speed * 3.2 + target.ballControl * 0.45, 1.75, 4.1);
    const endlineBuffer = runnerDepth > 70 ? 12.4 : 8.6;
    const minThroughX = dir > 0 ? 6 : endlineBuffer;
    const maxThroughX = dir > 0 ? 100 - endlineBuffer : 94;
    let tx = clamp(target.x + dir * lead + target.vx * 1.05, minThroughX, maxThroughX);
    let ty = clamp(target.y + target.vy * 1.05, 8, 92);
    const skill = passExecutionSkill(p, "through");
    const accurate =
      Math.random() <
      clamp(
        0.52 +
          skill * 0.42 +
          p.composure * 0.1 +
          p.strength * 0.22 -
          d * 0.00085 -
          Math.max(0, 5 - pressure) * 0.009,
        0.68,
        0.972,
      );

    if (!accurate) {
      tx += deterministicSigned(`${p.id}:${target.id}:through:x:${this.time.toFixed(2)}`, 1.85);
      ty += deterministicSigned(`${p.id}:${target.id}:through:y:${this.time.toFixed(2)}`, 1.6);
    }

    p.hasBall = false;
    this.ball.ownerId = null;
    this.ball.lastOwnerId = p.id;
    this.ball.controlState = "PASS_IN_FLIGHT";
    this.ball.lastTouchOwnerId = p.id;
    this.ball.lastTouchTime = this.time;
    this.ball.intendedReceiverId = target.id;
    this.ball.intendedTeam = p.team;
    this.ball.offsideReceiverId = isOffside(target, this.players, this.ball)
      ? target.id
      : null;
    p.lastPassTargetId = target.id;
    p.consecutivePasses++;
    p.possessionFlipCount = 0;
    this.recordPassStats(p, target, accurate, "through");
    this.rememberPassContext(p, "through", accurate);

    const angle = Math.atan2(ty - p.y, tx - p.x);
    const power = groundBallPowerForDistance(dist(p.x, p.y, tx, ty), passExecutionSkill(p, "through"), false) * 0.9;
    const throughCurve = curveVector(angle, p, "long");
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.curveX = throughCurve.curveX * 0.45;
    this.ball.curveY = throughCurve.curveY * 0.45;
    this.ball.x = p.x + Math.cos(angle) * 0.9;
    this.ball.y = p.y + Math.sin(angle) * 0.9;
    this.ball.z = d > 32 ? 0.035 : 0;
    this.ball.vz = d > 32 ? 0.035 : 0;
    this.ball.status = d > 32 ? "AIRBORNE" : "GROUNDED";
    this.ball.flight = d > 32 ? "driven" : "ground";
    this.ball.interceptionOpenTime = this.time + (accurate ? clamp(d / 120, 0.18, 0.44) : 0.08);
    target.aiState = "INTERCEPT";
    target.targetX = tx;
    target.targetY = ty;
    target.decisionCooldown = Math.min(target.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.45);
    steerTo(target, tx, ty, 1.18);
    primeReceiverForIncomingBall(target, this.ball, this.attackDirection(target.team));
    this.emitEvent("pass", p.team, `${p.name} slips a through ball to ${target.name}`);
    return true;
  }

  longBall(p: EnginePlayer, target: EnginePlayer): boolean {
    if (!this.prepareStrikeTouch(p, target.x, target.y, "pass")) return false;
    if (!this.tryEvent("pass")) return false;
    this.shotInFlight = false;
    const dir = this.attackDirection(p.team);
    const d = dist(p.x, p.y, target.x, target.y);
    const pressure = this.players
      .filter((op) => op.team !== p.team)
      .reduce((min, op) => Math.min(min, dist(op.x, op.y, p.x, p.y)), Infinity);
    let tx = clamp(target.x + dir * 2.5 + target.vx * 4, 3, 97);
    let ty = clamp(target.y + target.vy * 4, 5, 95);
    const skill = passExecutionSkill(p, "long");
    const accurate =
      Math.random() <
      clamp(
        0.42 +
          skill * 0.44 +
          p.composure * 0.08 +
          p.strength * 0.18 -
          d * 0.00085 -
          Math.max(0, 5 - pressure) * 0.008,
        0.62,
        0.955,
      );

    if (!accurate) {
      tx += deterministicSigned(`${p.id}:${target.id}:long:x:${this.time.toFixed(2)}`, 2.8);
      ty += deterministicSigned(`${p.id}:${target.id}:long:y:${this.time.toFixed(2)}`, 2.4);
    }

    p.hasBall = false;
    this.ball.ownerId = null;
    this.ball.lastOwnerId = p.id;
    this.ball.controlState = "PASS_IN_FLIGHT";
    this.ball.lastTouchOwnerId = p.id;
    this.ball.lastTouchTime = this.time;
    this.ball.intendedReceiverId = target.id;
    this.ball.intendedTeam = p.team;
    this.ball.offsideReceiverId = isOffside(target, this.players, this.ball)
      ? target.id
      : null;
    p.lastPassTargetId = target.id;
    p.consecutivePasses++;
    p.possessionFlipCount = 0;
    this.recordPassStats(p, target, accurate, "long");
    this.rememberPassContext(p, "long", accurate);

    const angle = Math.atan2(ty - p.y, tx - p.x);
    const power = 0.16 + Math.min(d, 68) * 0.0072 + passExecutionSkill(p, "long") * 0.105 + p.vision * 0.055;
    const longCurve = curveVector(angle, p, "long");
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.curveX = longCurve.curveX;
    this.ball.curveY = longCurve.curveY;
    this.ball.x = p.x + Math.cos(angle) * 1.0;
    this.ball.y = p.y + Math.sin(angle) * 1.0;
    this.ball.z = 0.58;
    this.ball.vz = 0.29 + p.passing * 0.09;
    this.ball.status = "AIRBORNE";
    this.ball.flight = "lofted";
    this.ball.interceptionOpenTime = this.time + (accurate ? clamp(d / 125, 0.16, 0.42) : 0.08);
    target.aiState = "INTERCEPT";
    target.targetX = tx;
    target.targetY = ty;
    target.decisionCooldown = Math.min(target.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.65);
    steerTo(target, tx, ty, 1.08);
    primeReceiverForIncomingBall(target, this.ball, this.attackDirection(target.team));
    this.emitEvent("pass", p.team, `${p.name} switches play to ${target.name}`);
    return true;
  }

  chippedPass(p: EnginePlayer, target: EnginePlayer): boolean {
    if (!this.prepareStrikeTouch(p, target.x, target.y, "pass")) return false;
    if (!this.tryEvent("pass")) return false;
    this.shotInFlight = false;
    const dir = this.attackDirection(p.team);
    const d = dist(p.x, p.y, target.x, target.y);
    const pressure = this.players
      .filter((op) => op.team !== p.team)
      .reduce((min, op) => Math.min(min, dist(op.x, op.y, p.x, p.y)), Infinity);

    let tx = clamp(target.x + dir * 1.6 + target.vx * 2, 3, 97);
    let ty = clamp(target.y + target.vy * 2, 5, 95);
    const skill = passExecutionSkill(p, "long");
    const accurate =
      Math.random() <
      clamp(
        0.56 +
          skill * 0.38 +
          p.curve * 0.08 +
          p.composure * 0.1 +
          p.strength * 0.19 -
          d * 0.0009 -
          Math.max(0, 4 - pressure) * 0.008,
        0.7,
        0.96,
      );

    if (!accurate) {
      tx += deterministicSigned(`${p.id}:${target.id}:chip:x:${this.time.toFixed(2)}`, 1.75);
      ty += deterministicSigned(`${p.id}:${target.id}:chip:y:${this.time.toFixed(2)}`, 1.5);
    }

    p.hasBall = false;
    this.ball.ownerId = null;
    this.ball.lastOwnerId = p.id;
    this.ball.controlState = "PASS_IN_FLIGHT";
    this.ball.lastTouchOwnerId = p.id;
    this.ball.lastTouchTime = this.time;
    this.ball.intendedReceiverId = target.id;
    this.ball.intendedTeam = p.team;
    this.ball.offsideReceiverId = isOffside(target, this.players, this.ball)
      ? target.id
      : null;
    p.lastPassTargetId = target.id;
    p.consecutivePasses++;
    p.possessionFlipCount = 0;
    this.recordPassStats(p, target, accurate, "long");
    this.rememberPassContext(p, "long", accurate);

    const angle = Math.atan2(ty - p.y, tx - p.x);
    const power = 0.14 + Math.min(d, 44) * 0.0068 + passExecutionSkill(p, "long") * 0.082 + p.vision * 0.042;
    const chipCurve = curveVector(angle, p, "long");
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.curveX = chipCurve.curveX * 0.75;
    this.ball.curveY = chipCurve.curveY * 0.75;
    this.ball.x = p.x + Math.cos(angle) * 0.9;
    this.ball.y = p.y + Math.sin(angle) * 0.9;
    this.ball.z = 0.48;
    this.ball.vz = 0.23 + p.curve * 0.07 + p.passing * 0.055;
    this.ball.status = "AIRBORNE";
    this.ball.flight = "lofted";
    this.ball.interceptionOpenTime = this.time + (accurate ? clamp(d / 130, 0.14, 0.34) : 0.07);
    target.aiState = "INTERCEPT";
    target.targetX = tx;
    target.targetY = ty;
    target.decisionCooldown = Math.min(target.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.65);
    steerTo(target, tx, ty, 1.12);
    primeReceiverForIncomingBall(target, this.ball, this.attackDirection(target.team));
    this.emitEvent("pass", p.team, `${p.name} chips a pass to ${target.name}`);
    return true;
  }

  cross(p: EnginePlayer): boolean {
    const option = selectCrossOption(p, this.players);
    if (!option) return false;
    const target = option.target;
    if (!this.prepareStrikeTouch(p, option.targetX, option.targetY, "cross")) return false;
    if (!this.tryEvent("cross")) return false;
    this.shotInFlight = false;

    p.hasBall = false;
    this.ball.ownerId = null;
    this.ball.lastOwnerId = p.id;
    this.ball.controlState = "PASS_IN_FLIGHT";
    this.ball.lastTouchOwnerId = p.id;
    this.ball.lastTouchTime = this.time;
    this.ball.intendedReceiverId = target.id;
    this.ball.intendedTeam = p.team;
    this.ball.offsideReceiverId =
      isOffside(target, this.players, this.ball) ? target.id : null;
    const crossingAcc =
      Math.random() <
      clamp(
        0.46 + passExecutionSkill(p, "cross") * 0.42 + p.strength * 0.12,
        0.54,
        0.94,
      );
    this.recordPassStats(p, target, crossingAcc, "cross");
    this.rememberPassContext(p, "cross", crossingAcc);
    p.possessionFlipCount = 0;
    const targetX = option.targetX;
    const targetY = option.targetY;
    const crossDistance = dist(p.x, p.y, targetX, targetY);
    const angle = Math.atan2(targetY - p.y, targetX - p.x);
    const blocker = nearestBlockerOnPath(
      p.x,
      p.y,
      targetX,
      targetY,
      this.players.filter((op) => op.team !== p.team && op.position !== "GK"),
      1.5,
    );
    if (
      blocker &&
      Math.random() < clamp(
        0.12 +
          blocker.blocker.reaction * 0.11 +
          blocker.blocker.defending * 0.1 +
          Math.max(0, blocker.blocker.strength - p.strength) * 0.16 -
          p.crossing * 0.16 -
          p.vision * 0.05,
        0.06,
        0.22,
      )
    ) {
      const towardEndline = Math.random() < 0.58;
      const blockDirY = p.y < 50 ? -1 : 1;
      const blockDirX = towardEndline
        ? this.attackDirection(p.team)
        : Math.random() < 0.5 ? 0.2 : -0.2;

      this.ball.vx = towardEndline
        ? blockDirX * (0.48 + Math.random() * 0.28)
        : blockDirX * (0.14 + Math.random() * 0.2);
      this.ball.vy = towardEndline
        ? (Math.random() - 0.5) * 0.16
        : blockDirY * (0.24 + Math.random() * 0.34);
      this.ball.curveX = 0;
      this.ball.curveY = 0;
      this.ball.x = p.x + Math.cos(angle) * 1.1;
      this.ball.y = p.y + Math.sin(angle) * 1.1;
      this.ball.z = 0.24 + Math.random() * 0.24;
      this.ball.vz = 0.12 + Math.random() * 0.07;
      this.ball.status = "AIRBORNE";
      this.ball.flight = "driven";
      this.ball.lastOwnerId = blocker.blocker.id;
      this.ball.intendedReceiverId = null;
      this.ball.intendedTeam = null;
      this.ball.offsideReceiverId = null;
      this.ball.interceptionOpenTime = this.time + 0.12;
      this.emitEvent("cross", p.team, `${p.name}'s cross is blocked`);
      return true;
    }
    const power =
      0.135 + Math.min(crossDistance, 42) * 0.0075 + p.crossing * 0.14;
    const inaccuracy = crossingAcc ? 0 : deterministicSigned(`${p.id}:${target.id}:cross:${this.time.toFixed(2)}`, 0.08);
    const crossCurve = curveVector(angle, p, "cross");
    this.ball.vx = Math.cos(angle + inaccuracy) * power;
    this.ball.vy = Math.sin(angle + inaccuracy) * power;
    this.ball.curveX = crossCurve.curveX;
    this.ball.curveY = crossCurve.curveY;
    this.ball.x = p.x + Math.cos(angle) * 1.1;
    this.ball.y = p.y + Math.sin(angle) * 1.1;
    this.ball.z = 0.54;
    this.ball.vz = 0.2 + p.crossing * 0.09;
    this.ball.status = "AIRBORNE";
    this.ball.flight = "lofted";
    this.ball.interceptionOpenTime = this.time + clamp(crossDistance / 150, 0.16, 0.36);
    target.aiState = "INTERCEPT";
    target.targetX = targetX;
    target.targetY = targetY;
    target.decisionCooldown = Math.min(target.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.55);
    steerTo(target, targetX, targetY, 1.22);
    primeReceiverForIncomingBall(target, this.ball, this.attackDirection(target.team));
    this.emitEvent("cross", p.team, `${p.name} crosses toward ${target.name}`);
    return true;
  }

  private setupTeam(
    data: RawPlayerData[],
    team: "home" | "away",
    formation: string,
  ): void {
    const formationSlots = FORMATIONS[formation] ?? FORMATIONS["4-3-3"];
    const first11 = selectBalancedFirstEleven(data, formationSlots);
    const avgOverall =
      first11.reduce(
        (s: number, p: RawPlayerData) => s + (p.technical_profile?.overall ?? 60),
        0,
      ) /
      Math.max(first11.length, 1) /
      100;
    this.teamStrength[team] = avgOverall;

    FormationEngine.map(formation, data, team, true).forEach(
      ({ player, slot, index }) => {
        const ep = createEnginePlayer(player, team, slot, index);
        ep.strength = clamp(avgOverall * 0.58 + ep.overall * 0.42, 0.36, 0.96);
        const qualityBoost = clamp((avgOverall - 0.64) * 0.28 + (ep.overall - 0.64) * 0.12, -0.045, 0.09);
        ep.passing = clamp(ep.passing + qualityBoost, 0.18, 0.98);
        ep.vision = clamp(ep.vision + qualityBoost, 0.18, 0.98);
        ep.ballControl = clamp(ep.ballControl + qualityBoost * 0.85, 0.18, 0.98);
        ep.reaction = clamp(ep.reaction + qualityBoost * 0.8, 0.18, 0.98);
        ep.positioning = clamp(ep.positioning + qualityBoost * 0.9, 0.18, 0.98);
        ep.composure = clamp(ep.composure + qualityBoost * 0.82, 0.18, 0.98);
        ep.defending = clamp(ep.defending + qualityBoost * 0.72, 0.18, 0.98);
        ep.tackling = clamp(ep.tackling + qualityBoost * 0.68, 0.18, 0.98);
        ep.interceptions = clamp(ep.interceptions + qualityBoost * 0.72, 0.18, 0.98);
        ep.dribbling = clamp(ep.dribbling + qualityBoost * 0.78, 0.18, 0.98);
        ep.longPassing = clamp(ep.longPassing + qualityBoost * 0.7, 0.18, 0.98);
        ep.crossing = clamp(ep.crossing + Math.max(0, qualityBoost) * 0.55, 0.18, 0.98);
        if (team === "home") ep.speed *= this.momentum;
        if (ep.position !== "GK") {
          ep.x =
            team === "home" ? Math.min(ep.baseX, 48) : Math.max(ep.baseX, 52);
          ep.targetX = ep.x;
        }
        this.playerRegistry.set(ep.id, ep);
        this.players.push(ep);
      },
    );
  }

  private applyMatchupStrengthAdjustment(): void {
    const delta = this.teamStrength.home - this.teamStrength.away;

    this.players.forEach((p) => {
      const relative = p.team === "home" ? delta : -delta;
      const boost = clamp(relative * 1.48, -0.12, 0.19);
      const individualEdge = clamp((p.overall - 0.64) * 0.24, -0.045, 0.075);
      p.strength = clamp(p.strength + relative * 1.2 + individualEdge, 0.4, 0.98);
      p.passing = clamp(p.passing + boost + individualEdge * 0.55, 0.18, 0.99);
      p.vision = clamp(p.vision + boost * 0.98 + individualEdge * 0.5, 0.18, 0.99);
      p.ballControl = clamp(p.ballControl + boost + individualEdge * 0.45, 0.18, 0.99);
      p.reaction = clamp(p.reaction + boost * 1.02 + individualEdge * 0.4, 0.18, 0.99);
      p.positioning = clamp(p.positioning + boost * 1.04 + individualEdge * 0.45, 0.18, 0.99);
      p.composure = clamp(p.composure + boost * 0.94 + individualEdge * 0.46, 0.18, 0.99);
      p.defending = clamp(p.defending + boost * 0.9 + individualEdge * 0.36, 0.18, 0.99);
      p.tackling = clamp(p.tackling + boost * 0.82 + individualEdge * 0.32, 0.18, 0.99);
      p.interceptions = clamp(p.interceptions + boost * 0.9 + individualEdge * 0.34, 0.18, 0.99);
      p.dribbling = clamp(p.dribbling + boost * 0.9 + individualEdge * 0.4, 0.18, 0.99);
      p.longPassing = clamp(p.longPassing + boost * 0.86 + individualEdge * 0.38, 0.18, 0.99);
      p.shooting = clamp(p.shooting + boost * 0.82 + individualEdge * 0.42, 0.18, 0.99);
      p.crossing = clamp(p.crossing + boost * 0.88 + individualEdge * 0.4, 0.18, 0.99);
      p.gkHandling = clamp(p.gkHandling + boost + individualEdge * 0.45, 0.18, 0.99);
    });
  }

  private tick(delta: number): void {
    if (this.isFinished || this.isPaused) return;

    const dt = delta * this.speed;
    this.lastTickDt = dt;
    this.refreshTeamDirections();
    this.advanceClock(dt);

    if (this.phase === "SET_PIECE") {
      this.updateSetPiece(dt);
      this.pushState();
      return;
    }

    if (this.phase === "HALFTIME" || this.phase === "KICK_OFF") {
      this.pushState();
      return;
    }
    if (this.isFinished) {
      this.pushState();
      this.stop();
      return;
    }

    this.executePendingKickoffPass();
    this.updateBallPhysics(dt);
    this.validateCurrentOwnerBall(dt);
    this.enforceLooseBallUrgency(dt);
    this.updateAllPlayers(dt);
    this.resolvePlayerSeparation(dt);
    this.checkCollisions();
    this.validateCurrentOwnerBall(dt);
    this.enforceLooseBallUrgency(dt);
    this.enforceLivePlayFlow(dt);
    this.checkGoals();
    this.updateStats();
    this.checkSubstitutions();
    this.maybeCommitFoul();
    this.validateCurrentOwnerBall(dt);

    this.pushState();
  }

  private advanceClock(dt: number): void {
    if (this.phase === "KICK_OFF") return;

    if (this.phase === "HALFTIME") {
      this.halfPauseTimer -= dt;
      if (this.halfPauseTimer <= 0) {
        this.activeHalf = "SECOND_HALF";
        this.phase = "SECOND_HALF";
        this.time = 46;
        this.stoppageTime = this.calcStoppage();
        this.stoppageEndTime = 90 + this.stoppageTime;
        this.resetPositions();
        this.assignKickoff("away");
        this.emitEvent("kickoff", "away", "Second half!");
      }
      return;
    }

    this.time += dt * MATCH_CLOCK_RATE;

    if (this.phase === "FIRST_HALF" && this.time >= 45) {
      this.activeHalf = "FIRST_HALF";
      this.phase = "STOPPAGE";
      this.stoppageEndTime = 45 + this.calcStoppage();
      return;
    }

    if (this.phase === "SECOND_HALF" && this.time >= 90) {
      this.activeHalf = "SECOND_HALF";
      this.phase = "STOPPAGE";
      this.stoppageEndTime = 90 + this.calcStoppage();
      return;
    }

    if (this.phase === "STOPPAGE") {
      if (
        this.activeHalf === "FIRST_HALF" &&
        this.time >= this.stoppageEndTime
      ) {
        this.emitEvent("halftime", "home", "Half-time");
        this.phase = "HALFTIME";
        this.isPaused = true;
        this.halfPauseTimer = 0;
        this.resetPositions();
        return;
      }
      if (
        this.activeHalf === "SECOND_HALF" &&
        this.time >= this.stoppageEndTime
      ) {
        this.phase = "FULL_TIME";
        this.isFinished = true;
        this.emitEvent("fulltime", "home", "Full-time!");
      }
    }
  }

  private refreshTeamDirections(): void {
    this.players.forEach((p) => {
      p.attackingRight = this.attacksRight(p.team);
    });
  }

  private isLiveBallPhase(): boolean {
    return (
      !this.isFinished &&
      !this.isPaused &&
      !this.setPiece &&
      (this.phase === "FIRST_HALF" ||
        this.phase === "SECOND_HALF" ||
        this.phase === "STOPPAGE")
    );
  }

  private nearestOpponentToPoint(
    team: "home" | "away",
    x: number,
    y: number,
    includeGoalkeeper = false,
  ): { player: EnginePlayer; distance: number } | null {
    let best: { player: EnginePlayer; distance: number } | null = null;
    for (const p of this.players) {
      if (p.team === team || (!includeGoalkeeper && p.position === "GK")) continue;
      const d = dist(p.x, p.y, x, y);
      if (!best || d < best.distance) best = { player: p, distance: d };
    }
    return best;
  }

  private ownerBallControlState(owner: EnginePlayer): OwnerBallControlState {
    if (this.ball.ownerId !== owner.id || this.ball.z > BALL_LOW_CONTROL_HEIGHT) return "LOOSE";

    const ballDist = dist(owner.x, owner.y, this.ball.x, this.ball.y);
    const ownTouchAge =
      this.ball.lastTouchOwnerId === owner.id && Number.isFinite(this.ball.lastTouchTime)
        ? this.time - (this.ball.lastTouchTime ?? 0)
        : Infinity;
    if (
      this.ball.controlState === "CHASING_OWN_TOUCH" &&
      ownTouchAge < 0.12 &&
      ballDist > 0.34
    ) {
      return "CHASING_OWN_TOUCH";
    }
    const opponents = this.players.filter((op) => op.team !== owner.team && op.position !== "GK");
    const pressureDist = nearestOpponentDistance(owner, opponents);
    const nearestBallOpponent = this.nearestOpponentToPoint(owner.team, this.ball.x, this.ball.y);
    const ballVector = normalize2D(this.ball.x - owner.x, this.ball.y - owner.y, owner.facingX, owner.facingY);
    const facingVector = normalize2D(owner.facingX, owner.facingY, this.attackDirection(owner.team), 0);
    const velocityVector = normalize2D(owner.vx, owner.vy, facingVector.x, facingVector.y);
    const facingBallDot = facingVector.x * ballVector.x + facingVector.y * ballVector.y;
    const movingAwayDot = owner.vx * (this.ball.x - owner.x) + owner.vy * (this.ball.y - owner.y);
    const nearLine =
      this.ball.y < 6 ||
      this.ball.y > 94 ||
      this.ball.x < 4 ||
      this.ball.x > 96;
    const pressurePenalty = pressureDist < 2.6 ? 0.32 : pressureDist < 4.4 ? 0.18 : 0;
    const linePenalty = nearLine ? 0.2 : 0;
    const closeControl = clamp(
      OWNER_CLOSE_CONTROL_BASE +
        owner.ballControl * 0.22 +
        owner.reaction * 0.1 -
        pressurePenalty -
        linePenalty,
      pressureDist < 2.4 ? 0.58 : 0.62,
      pressureDist < 3.6 ? 0.86 : 1.02,
    );
    const chaseLimit = clamp(
      2.05 +
        owner.speed * 4.2 +
        owner.ballControl * 0.76 -
        Math.max(0, 4.5 - pressureDist) * 0.22 -
        (nearLine ? 0.48 : 0),
      1.65,
      OWNER_CHASE_MAX_DISTANCE,
    );

    if (nearestBallOpponent && nearestBallOpponent.distance + 0.22 < ballDist && ballDist > 0.72) {
      return "CONTESTED";
    }
    if (
      ballDist > closeControl * 0.72 &&
      (facingBallDot < -0.12 || (movingAwayDot < -0.0012 && ballDist > closeControl * 0.92))
    ) {
      return "CHASING_OWN_TOUCH";
    }
    if (ballDist > closeControl && velocityVector.x * ballVector.x + velocityVector.y * ballVector.y < -0.08) {
      return "CHASING_OWN_TOUCH";
    }
    if (ballDist <= closeControl) return "CLOSE_CONTROL";
    if (ballDist <= chaseLimit) return "CHASING_OWN_TOUCH";
    return "LOOSE";
  }

  private releaseOwnerToLoose(owner: EnginePlayer, delay = 0.08): void {
    this.ownerForgetSeconds.delete(owner.id);
    this.ownerMicroTouchCount.delete(owner.id);
    owner.hasBall = false;
    owner.aiState = "INTERCEPT";
    owner.decisionCooldown = Math.max(owner.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.55);
    this.ball.ownerId = null;
    this.ball.intendedReceiverId = null;
    this.ball.intendedTeam = null;
    this.ball.offsideReceiverId = null;
    this.ball.controlOwnerId = undefined;
    this.ball.controlOffsetX = undefined;
    this.ball.controlOffsetY = undefined;
    this.ball.controlState = "LOOSE";
    this.ball.chaseTargetX = undefined;
    this.ball.chaseTargetY = undefined;
    this.ball.interceptionOpenTime = this.time + delay;
  }

  private validateOwnerCanDecide(owner: EnginePlayer, dt: number): boolean {
    const state = this.ownerBallControlState(owner);
    this.ball.controlState = state;
    if (state === "CLOSE_CONTROL" && this.canOwnerUseTechnicalAction(owner)) return true;
    if (state === "CLOSE_CONTROL") {
      owner.aiState = "CHASE_OWN_TOUCH";
      owner.decisionCooldown = Math.min(owner.decisionCooldown, 0.08);
      owner.targetX = this.ball.x;
      owner.targetY = this.ball.y;
      steerTo(owner, this.ball.x, this.ball.y, 1.1 + owner.reaction * 0.28);
      return false;
    }

    const fallbackDir = this.attackDirection(owner.team);
    if (state === "CHASING_OWN_TOUCH") {
      const targetX = Number.isFinite(this.ball.chaseTargetX) ? this.ball.chaseTargetX! : this.ball.x;
      const targetY = Number.isFinite(this.ball.chaseTargetY) ? this.ball.chaseTargetY! : this.ball.y;
      owner.aiState = "CHASE_OWN_TOUCH";
      owner.decisionCooldown = Math.min(owner.decisionCooldown, 0.08);
      owner.targetX = targetX;
      owner.targetY = targetY;
      steerTo(owner, targetX, targetY, 1.16 + owner.reaction * 0.34);
      updatePlayerFacingTowardPoint(owner, this.ball.x, this.ball.y, fallbackDir, 0, dt, 1.65);
      return false;
    }

    if (state === "CONTESTED") {
      const nearest = this.nearestOpponentToPoint(owner.team, this.ball.x, this.ball.y);
      this.releaseOwnerToLoose(owner, 0.02);
      if (nearest && nearest.distance <= firstTouchControlRadius(nearest.player, this.ball, false) + 0.35) {
        this.claimLooseBall(nearest.player);
      }
      return false;
    }

      this.releaseOwnerToLoose(owner);
    return false;
  }

  private canOwnerUseTechnicalAction(owner: EnginePlayer): boolean {
    if (this.ball.ownerId !== owner.id || this.ball.controlState !== "CLOSE_CONTROL") return false;
    if (this.ball.status !== "GROUNDED" || this.ball.z > BALL_LOW_CONTROL_HEIGHT) return false;
    const ballDist = dist(owner.x, owner.y, this.ball.x, this.ball.y);
    const pressure = nearestOpponentDistance(
      owner,
      this.players.filter((op) => op.team !== owner.team && op.position !== "GK"),
    );
    const pressurePenalty = pressure < 2.8 ? 0.18 : pressure < 4.8 ? 0.08 : 0;
    const contactRadius = clamp(
      0.66 + owner.ballControl * 0.24 + owner.reaction * 0.08 - pressurePenalty,
      pressure < 2.8 ? 0.58 : 0.64,
      pressure < 4.8 ? 0.9 : 1.05,
    );
    return ballDist <= contactRadius;
  }

  private enforceOwnerBallResponsibility(owner: EnginePlayer, dt: number): void {
    if (this.ball.ownerId !== owner.id || this.ball.controlState === "PASS_IN_FLIGHT") return;

    const state = this.ownerBallControlState(owner);
    this.ball.controlState = state;
    const ballDist = dist(owner.x, owner.y, this.ball.x, this.ball.y);
    const toBall = normalize2D(this.ball.x - owner.x, this.ball.y - owner.y, this.attackDirection(owner.team), 0);
    const ownerSpeed = Math.hypot(owner.vx, owner.vy);
    const movingAway =
      ownerSpeed > 0.015 &&
      (owner.vx * (this.ball.x - owner.x) + owner.vy * (this.ball.y - owner.y)) < -0.001;
    const ballBehind =
      toBall.x * owner.facingX + toBall.y * owner.facingY < -0.1 &&
      ballDist > 0.46;
    const opponent = this.nearestOpponentToPoint(owner.team, this.ball.x, this.ball.y);
    const opponentCloser =
      Boolean(opponent && opponent.distance + 0.18 < ballDist && ballDist > 0.8);

    if (opponentCloser || state === "CONTESTED" || state === "LOOSE") {
      this.releaseOwnerToLoose(owner, 0.02);
      if (opponent && opponent.distance < firstTouchControlRadius(opponent.player, this.ball, false) + 0.25) {
        this.claimLooseBall(opponent.player);
      }
      this.ownerForgetSeconds.delete(owner.id);
      return;
    }

    const forgetting =
      state === "CHASING_OWN_TOUCH" ||
      (ballDist > 0.78 && (movingAway || ballBehind));
    const previous = this.ownerForgetSeconds.get(owner.id) ?? 0;
    const forgetSeconds = forgetting ? previous + dt : Math.max(0, previous - dt * 1.35);
    if (forgetSeconds <= 0.015) this.ownerForgetSeconds.delete(owner.id);
    else this.ownerForgetSeconds.set(owner.id, forgetSeconds);

    if (!forgetting) return;

    owner.aiState = "CHASE_OWN_TOUCH";
    owner.decisionCooldown = Math.min(owner.decisionCooldown, 0.055);
    owner.dribbleTouchCooldown = Math.min(owner.dribbleTouchCooldown, 0.04);
    if (movingAway || ballBehind) {
      owner.vx *= ballBehind ? 0.42 : 0.62;
      owner.vy *= ballBehind ? 0.42 : 0.62;
    }
    const targetX = Number.isFinite(this.ball.chaseTargetX) ? this.ball.chaseTargetX! : this.ball.x;
    const targetY = Number.isFinite(this.ball.chaseTargetY) ? this.ball.chaseTargetY! : this.ball.y;
    owner.targetX = targetX;
    owner.targetY = targetY;
    steerTo(owner, targetX, targetY, 1.28 + owner.reaction * 0.36);
    updatePlayerFacingTowardPoint(owner, this.ball.x, this.ball.y, this.attackDirection(owner.team), 0, dt, 1.85);

    if (
      (forgetSeconds > 0.75 && ballDist > 1.35) ||
      forgetSeconds > 1.25 ||
      (forgetSeconds > 0.42 && ballDist > OWNER_CHASE_MAX_DISTANCE * 0.86)
    ) {
      this.releaseOwnerToLoose(owner, 0.04);
    }
  }

  private validateCurrentOwnerBall(dt: number): void {
    const owner = this.ball.ownerId ? this.playerRegistry.get(this.ball.ownerId) : null;
    if (!owner || owner.position === "GK" || this.phase === "SET_PIECE") return;
    this.enforceOwnerBallResponsibility(owner, dt);
  }

  private carrierMaxDecisionSeconds(owner: EnginePlayer): number {
    const opponents = this.players.filter((op) => op.team !== owner.team && op.position !== "GK");
    const pressure = nearestOpponentDistance(owner, opponents);
    const closePressureCount = opponents.filter((op) => dist(op.x, op.y, owner.x, owner.y) < 4.2).length;
    const crowdPressureCount = opponents.filter((op) => dist(op.x, op.y, owner.x, owner.y) < 6.3).length;
    const depth = owner.team === "home" ? owner.x : 100 - owner.x;
    const wideFinalThird = depth > 66 && (owner.y < 30 || owner.y > 70);
    const nearBox = depth > 70 && owner.y > BOX_MIN_Y - 9 && owner.y < BOX_MAX_Y + 9;
    const ballDist = dist(owner.x, owner.y, this.ball.x, this.ball.y);

    if (pressure < 2.4 || ballDist > 1.42 || closePressureCount >= 2) return 0.26;
    if (nearBox) return crowdPressureCount >= 2 ? 0.34 : 0.42;
    if (wideFinalThird) return crowdPressureCount >= 2 ? 0.38 : 0.5;
    if (pressure < 4.8) return 0.54;
    if (pressure < 7.5 || crowdPressureCount >= 2) return 0.76;
    return 1.18;
  }

  private tightenCarrierUrgency(owner: EnginePlayer): void {
    const maxSeconds = this.carrierMaxDecisionSeconds(owner);
    owner.decisionCooldown = Math.min(owner.decisionCooldown, maxSeconds);
    const pressureSeconds = this.carrierPressureSeconds.get(owner.id) ?? 0;
    if (pressureSeconds > PRESSURE_RESOLUTION_SECONDS * 0.72) {
      owner.decisionCooldown = Math.min(owner.decisionCooldown, 0.08);
      owner.dribbleTouchCooldown = Math.min(owner.dribbleTouchCooldown, 0.04);
    }
  }

  private syncControlledBall(owner: EnginePlayer, dt: number, immediate = false): void {
    const fallbackDir = this.attackDirection(owner.team);
    const ballDist = dist(owner.x, owner.y, this.ball.x, this.ball.y);
    const ownerSpeed = Math.hypot(owner.vx, owner.vy);
    const toTarget = normalize2D(
      owner.targetX - owner.x,
      owner.targetY - owner.y,
      owner.facingX || fallbackDir,
      owner.facingY || 0,
    );
    let desiredDir = ownerSpeed > 0.018
      ? normalize2D(owner.vx, owner.vy, toTarget.x, toTarget.y)
      : toTarget;

    rotatePlayerFacingToward(owner, desiredDir.x, desiredDir.y, fallbackDir, 0, dt, owner.hasBall ? 1.18 : 1);

    if (immediate) {
      const settleDistance = owner.position === "GK" ? 0.65 : 0.92 + owner.ballControl * 0.24;
      this.ball.x = owner.x + desiredDir.x * settleDistance;
      this.ball.y = owner.y + desiredDir.y * settleDistance;
      this.ball.vx = owner.vx * 0.12;
      this.ball.vy = owner.vy * 0.12;
      this.ball.z = 0;
      this.ball.vz = 0;
      this.ball.status = "GROUNDED";
      this.ball.flight = "ground";
      this.ball.lastOwnerId = owner.id;
      this.ball.controlOwnerId = owner.id;
      this.ball.controlOffsetX = this.ball.x - owner.x;
      this.ball.controlOffsetY = this.ball.y - owner.y;
      this.ball.controlState = "CLOSE_CONTROL";
      this.ball.lastTouchOwnerId = owner.id;
      this.ball.lastTouchTime = this.time;
      owner.dribbleTouchCooldown = immediate ? 0.08 : clamp(0.1 + (1 - owner.ballControl) * 0.1, 0.09, 0.24);
      return;
    }

    if (this.ball.controlOwnerId !== owner.id || !Number.isFinite(this.ball.controlOffsetX)) {
      this.ball.z = Math.max(0, this.ball.z);
      if (this.ball.z <= BALL_LOW_CONTROL_HEIGHT) {
        this.ball.status = "GROUNDED";
        this.ball.flight = "ground";
      }
      this.ball.lastOwnerId = owner.id;
      this.ball.controlOwnerId = owner.id;
      this.ball.controlOffsetX = this.ball.x - owner.x;
      this.ball.controlOffsetY = this.ball.y - owner.y;
      this.ball.controlState = "CLOSE_CONTROL";
      owner.dribbleTouchCooldown = clamp(0.08 + (1 - owner.ballControl) * 0.1, 0.08, 0.22);
    }

    if (owner.position === "GK" && ownerSpeed < 0.018 && ballDist < 1.35) {
      this.ball.x = owner.x + desiredDir.x * 0.62;
      this.ball.y = owner.y + desiredDir.y * 0.62;
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.z = 0;
      this.ball.vz = 0;
      this.ball.status = "GROUNDED";
      this.ball.flight = "ground";
      this.ball.controlOwnerId = owner.id;
      this.ball.controlOffsetX = this.ball.x - owner.x;
      this.ball.controlOffsetY = this.ball.y - owner.y;
      this.ball.controlState = "CLOSE_CONTROL";
      return;
    }

    const opponents = this.players.filter((op) => op.team !== owner.team && op.position !== "GK");
    const pressureDist = nearestOpponentDistance(owner, opponents);
    const responsibilityState = this.ownerBallControlState(owner);
    if (responsibilityState === "CHASING_OWN_TOUCH") {
      const targetX = Number.isFinite(this.ball.chaseTargetX) ? this.ball.chaseTargetX! : this.ball.x;
      const targetY = Number.isFinite(this.ball.chaseTargetY) ? this.ball.chaseTargetY! : this.ball.y;
      owner.aiState = "CHASE_OWN_TOUCH";
      owner.vx *= 0.96;
      owner.vy *= 0.96;
      owner.targetX = targetX;
      owner.targetY = targetY;
      steerTo(owner, targetX, targetY, 1.2 + owner.reaction * 0.32);
      updatePlayerFacingTowardPoint(owner, this.ball.x, this.ball.y, fallbackDir, 0, dt, 1.8);
      this.ball.controlOwnerId = owner.id;
      this.ball.controlOffsetX = this.ball.x - owner.x;
      this.ball.controlOffsetY = this.ball.y - owner.y;
      this.ball.controlState = "CHASING_OWN_TOUCH";
      return;
    }
    if (responsibilityState === "CONTESTED" || responsibilityState === "LOOSE") {
      this.releaseOwnerToLoose(owner, 0.03);
      return;
    }
    const linePenalty =
      this.ball.y < 7 || this.ball.y > 93 || this.ball.x < 4 || this.ball.x > 96 ? 0.25 : 0;
    const controlReach = clamp(
      0.96 +
        owner.ballControl * 0.36 +
        owner.reaction * 0.14 -
        Math.max(0, 4.2 - pressureDist) * 0.08 -
        linePenalty,
      0.82,
      1.44,
    );
    const overrunDistance = clamp(
      2.1 +
        owner.speed * 4.4 +
        owner.ballControl * 0.72 -
        Math.max(0, 4.5 - pressureDist) * 0.24 -
        linePenalty,
      1.72,
      CARRIER_CONTROL_LOSS_RADIUS,
    );
    if (ballDist > overrunDistance || this.ball.z > 0.72) {
      owner.hasBall = false;
      owner.dribbleTouchCooldown = 0;
      this.ball.ownerId = null;
      this.ball.intendedReceiverId = null;
      this.ball.intendedTeam = null;
      this.ball.offsideReceiverId = null;
      this.ball.interceptionOpenTime = this.time + 0.08;
      this.ball.controlOwnerId = undefined;
      this.ball.controlOffsetX = undefined;
      this.ball.controlOffsetY = undefined;
      this.ball.controlState = "LOOSE";
      return;
    }

    if (ballDist > controlReach) {
      // Do not magnetise the ball to the carrier. The carrier must actually
      // turn back and gather it, which prevents the “forgets the ball” look.
      const looseVector = normalize2D(this.ball.x - owner.x, this.ball.y - owner.y, fallbackDir, 0);
      const facingDot = looseVector.x * owner.facingX + looseVector.y * owner.facingY;
      const recoveryBrake = facingDot < 0 ? 0.7 : 0.94;
      owner.vx *= recoveryBrake;
      owner.vy *= recoveryBrake;
      owner.aiState = "CHASE_OWN_TOUCH";
      owner.targetX = this.ball.x;
      owner.targetY = this.ball.y;
      steerTo(owner, this.ball.x, this.ball.y, 1.04 + owner.reaction * 0.36);
      updatePlayerFacingTowardPoint(owner, this.ball.x, this.ball.y, fallbackDir, 0, dt, 1.55);
      this.ball.controlOffsetX = this.ball.x - owner.x;
      this.ball.controlOffsetY = this.ball.y - owner.y;
      this.ball.controlState = "CHASING_OWN_TOUCH";
      return;
    }

    const laneClearance = forwardLaneClearance(owner, opponents);
    const forwardDir = { x: fallbackDir, y: 0 };
    const forwardDot = desiredDir.x * forwardDir.x;
    const nearestPressure = opponents
      .map((op) => ({ op, d: dist(op.x, op.y, owner.x, owner.y), lateral: op.y - owner.y }))
      .sort((a, b) => a.d - b.d)[0];
    const escapingClosePressure = Boolean(nearestPressure && nearestPressure.d < 5.8);
    if (laneClearance > 7.5 && pressureDist > 5.5 && !escapingClosePressure) {
      const forwardWeight = laneClearance > 13 ? 0.78 : 0.58;
      desiredDir = normalize2D(
        desiredDir.x * (1 - forwardWeight) + forwardDir.x * forwardWeight,
        desiredDir.y * (1 - forwardWeight) + forwardDir.y * forwardWeight,
        forwardDir.x,
        0,
      );
    } else if (!escapingClosePressure && forwardDot < 0.35) {
      desiredDir = normalize2D(
        desiredDir.x * 0.35 + forwardDir.x * 0.65,
        desiredDir.y * 0.35,
        forwardDir.x,
        0,
      );
    }
    const ballSpeed = Math.hypot(this.ball.vx, this.ball.vy);
    const ballVector = normalize2D(this.ball.x - owner.x, this.ball.y - owner.y, desiredDir.x, desiredDir.y);
    const ballDirectionDot = ballVector.x * desiredDir.x + ballVector.y * desiredDir.y;
    const ballAhead = ballDirectionDot > 0.08;
    const hasRunningIntent = ownerSpeed > 0.025 || dist(owner.x, owner.y, owner.targetX, owner.targetY) > 1.5;
    const openGrass = pressureDist > 8.5 && laneClearance > 9.5;

    if (!ballAhead) {
      const hardBrake = ballDirectionDot < -0.35;
      owner.vx *= hardBrake ? 0.58 : 0.76;
      owner.vy *= hardBrake ? 0.58 : 0.76;
      updatePlayerFacingTowardPoint(owner, this.ball.x, this.ball.y, fallbackDir, 0, dt, 1.78);

      if (ballDist <= CARRIER_RECOVERY_RADIUS && owner.dribbleTouchCooldown <= 0.125) {
        const pivotDir = normalize2D(
          desiredDir.x * 0.72 + owner.facingX * 0.28,
          desiredDir.y * 0.72 + owner.facingY * 0.28,
          fallbackDir,
          0,
        );
        const frontDistance = clamp(
          0.58 + owner.ballControl * 0.22 - Math.max(0, 4.4 - pressureDist) * 0.035,
          0.46,
          0.86,
        );
        const touchTargetX = clamp(owner.x + pivotDir.x * frontDistance, 2, 98);
        const touchTargetY = clamp(owner.y + pivotDir.y * frontDistance, 3, 97);
        const touchDir = normalize2D(touchTargetX - this.ball.x, touchTargetY - this.ball.y, pivotDir.x, pivotDir.y);
        const touchDistance = dist(this.ball.x, this.ball.y, touchTargetX, touchTargetY);
        const touchPower = clamp(
          dribbleTouchPowerForDistance(touchDistance, pressureDist, false) *
            (2.35 + owner.ballControl * 0.28),
          0.048,
          0.086,
        );

        this.ball.vx = touchDir.x * touchPower + owner.vx * 0.025;
        this.ball.vy = touchDir.y * touchPower + owner.vy * 0.025;
        this.ball.z = 0;
        this.ball.vz = 0;
        this.ball.status = "GROUNDED";
        this.ball.flight = "ground";
        this.ball.lastOwnerId = owner.id;
        this.ball.curveX = 0;
        this.ball.curveY = 0;
        this.ball.controlState = "CHASING_OWN_TOUCH";
        this.ball.lastTouchOwnerId = owner.id;
        this.ball.lastTouchTime = this.time;
        this.ball.chaseTargetX = touchTargetX;
        this.ball.chaseTargetY = touchTargetY;
        owner.targetX = touchTargetX;
        owner.targetY = touchTargetY;
        owner.dribbleTouchCooldown = clamp(0.085 + (1 - owner.ballControl) * 0.055, 0.08, 0.16);
      } else {
        steerTo(owner, this.ball.x, this.ball.y, 1.02 + owner.reaction * 0.32);
        owner.dribbleTouchCooldown = Math.max(owner.dribbleTouchCooldown, 0.035);
      }

      this.ball.controlOwnerId = owner.id;
      this.ball.controlOffsetX = this.ball.x - owner.x;
      this.ball.controlOffsetY = this.ball.y - owner.y;
      this.ball.controlState = "CHASING_OWN_TOUCH";
      return;
    }

    if (!hasRunningIntent && !escapingClosePressure && ballDist <= 1.22) {
      const cushion = 0.68 - owner.ballControl * 0.11;
      this.ball.vx *= cushion;
      this.ball.vy *= cushion;
      this.ball.controlOffsetX = this.ball.x - owner.x;
      this.ball.controlOffsetY = this.ball.y - owner.y;
      this.ball.controlState = "CLOSE_CONTROL";
      owner.dribbleTouchCooldown = Math.max(owner.dribbleTouchCooldown, clamp(0.07 + owner.ballControl * 0.06, 0.07, 0.14));
      return;
    }

    const touchDue =
      owner.dribbleTouchCooldown <= 0 ||
      !ballAhead ||
      ballDist < 0.72 ||
      (hasRunningIntent && ballSpeed < ownerSpeed * 0.55);

    if (!touchDue) {
      this.ball.controlOffsetX = this.ball.x - owner.x;
      this.ball.controlOffsetY = this.ball.y - owner.y;
      this.ball.controlState = ballDist <= controlReach ? "CLOSE_CONTROL" : "CHASING_OWN_TOUCH";
      return;
    }

    const nearBoundary =
      owner.x < 7 ||
      owner.x > 93 ||
      owner.y < 9 ||
      owner.y > 91 ||
      this.ball.x < 7 ||
      this.ball.x > 93 ||
      this.ball.y < 9 ||
      this.ball.y > 91;
    const attackingDepth = owner.team === "home" ? owner.x : 100 - owner.x;
    const nearPenaltyBox = attackingDepth > 68 && owner.y > BOX_MIN_Y - 10 && owner.y < BOX_MAX_Y + 10;
    const boundaryTouchScale = nearBoundary ? 0.58 : 1;
    const boxTouchScale = nearPenaltyBox ? 0.82 : 1;
    const strideDistance = (hasRunningIntent
      ? clamp(
          0.68 +
            ownerSpeed * 5.4 +
            owner.ballControl * 0.42 +
            (openGrass ? 0.62 : 0) -
            Math.max(0, 6.5 - pressureDist) * 0.38,
          escapingClosePressure ? 0.36 : 0.62,
          openGrass ? 2.42 : escapingClosePressure ? 0.92 : 1.58,
        )
      : clamp(0.38 + owner.ballControl * 0.18, 0.32, 0.68)) * boundaryTouchScale * boxTouchScale;
    const touchTargetX = clamp(owner.x + desiredDir.x * strideDistance, 2, 98);
    const touchTargetY = clamp(owner.y + desiredDir.y * strideDistance, 3, 97);
    const touchDistance = dist(this.ball.x, this.ball.y, touchTargetX, touchTargetY);
    const touchPower = dribbleTouchPowerForDistance(
      touchDistance,
      pressureDist,
      openGrass && hasRunningIntent,
    ) * clamp(0.82 + owner.ballControl * 0.2 + owner.dribbling * 0.12, 0.78, 1.08);
    const touchDir = normalize2D(touchTargetX - this.ball.x, touchTargetY - this.ball.y, desiredDir.x, desiredDir.y);

    this.ball.vx = touchDir.x * touchPower + owner.vx * 0.045;
    this.ball.vy = touchDir.y * touchPower + owner.vy * 0.045;
    this.ball.z = 0;
    this.ball.vz = 0;
    this.ball.status = "GROUNDED";
    this.ball.flight = "ground";
    this.ball.lastOwnerId = owner.id;
    this.ball.curveX = 0;
    this.ball.curveY = 0;
    this.ball.controlOwnerId = owner.id;
    this.ball.controlOffsetX = this.ball.x - owner.x;
    this.ball.controlOffsetY = this.ball.y - owner.y;
    this.ball.controlState = "CHASING_OWN_TOUCH";
    this.ball.lastTouchOwnerId = owner.id;
    this.ball.lastTouchTime = this.time;
    this.ball.chaseTargetX = touchTargetX;
    this.ball.chaseTargetY = touchTargetY;
    owner.dribbleTouchCooldown = hasRunningIntent
      ? clamp(0.09 + (1 - owner.ballControl) * 0.07 + (openGrass ? 0.03 : 0) - (escapingClosePressure ? 0.025 : 0), 0.075, 0.22)
      : clamp(0.17 + (1 - owner.ballControl) * 0.08, 0.15, 0.28);
  }

  private performPendingDribbleTouch(owner: EnginePlayer, dt: number): boolean {
    if (this.ball.ownerId !== owner.id || !owner.hasBall || owner.position === "GK") return false;
    if (this.ownerBallControlState(owner) !== "CLOSE_CONTROL") {
      this.enforceOwnerBallResponsibility(owner, dt);
      return false;
    }

    const opponents = this.players.filter((op) => op.team !== owner.team && op.position !== "GK");
    const pressureDist = nearestOpponentDistance(owner, opponents);
    const laneClearance = forwardLaneClearance(owner, opponents);
    const fallbackDir = this.attackDirection(owner.team);
    const depth = this.attackingDepth(owner.team, owner.x);
    const inMidfieldPocket = depth > 24 && depth < 70 && owner.y > 18 && owner.y < 82;
    const repeatedMicroTouches = this.ownerMicroTouchCount.get(owner.id) ?? 0;
    if (inMidfieldPocket && pressureDist < 4.8 && repeatedMicroTouches >= 1) {
      const outlet =
        selectSafeOutlet(owner, this.players) ??
        selectPassOption(owner, this.players) ??
        selectChippedPassOption(owner, this.players);
      if (outlet && "target" in outlet && this.pass(owner, outlet.target, true)) {
        this.ownerMicroTouchCount.delete(owner.id);
        return true;
      }
      const challenger = this.nearestOpponentToPoint(owner.team, owner.x, owner.y);
      if (challenger && challenger.distance < 1.9) {
        this.resolveForcedPressureDuel(owner, challenger.player, challenger.distance);
        this.ownerMicroTouchCount.delete(owner.id);
        return true;
      }
    }
    const intendedDir = normalize2D(
      owner.targetX - owner.x,
      owner.targetY - owner.y,
      owner.facingX || fallbackDir,
      owner.facingY || 0,
    );
    const forwardDir = { x: fallbackDir, y: 0 };
    const forwardDot = intendedDir.x * forwardDir.x + intendedDir.y * forwardDir.y;
    const useForwardBias = pressureDist > 5.2 && laneClearance > 6.5 && forwardDot > -0.1;
    const touchDir = useForwardBias
      ? normalize2D(
          intendedDir.x * 0.56 + forwardDir.x * 0.44,
          intendedDir.y * 0.56,
          forwardDir.x,
          0,
        )
      : intendedDir;
    const nearBoundary =
      owner.x < 7 ||
      owner.x > 93 ||
      owner.y < 9 ||
      owner.y > 91 ||
      this.ball.x < 7 ||
      this.ball.x > 93 ||
      this.ball.y < 9 ||
      this.ball.y > 91;
    const attackingDepth = this.attackingDepth(owner.team, owner.x);
    const nearPenaltyBox = attackingDepth > 68 && owner.y > BOX_MIN_Y - 10 && owner.y < BOX_MAX_Y + 10;
    const pressureScale = pressureDist < 2.8 ? 0.52 : pressureDist < 5.2 ? 0.78 : 1;
    const spaceScale = laneClearance > 12 && pressureDist > 8 ? 1.22 : inMidfieldPocket && laneClearance > 7 ? 1.08 : 1;
    const boundaryScale = nearBoundary ? 0.62 : 1;
    const boxScale = nearPenaltyBox ? 0.78 : 1;
    const touchDistance = clamp(
      (0.58 + owner.speed * 1.15 + owner.ballControl * 0.48 + owner.dribbling * 0.34) *
        pressureScale *
        spaceScale *
        boundaryScale *
        boxScale,
      pressureDist < 2.8 ? 0.36 : 0.56,
      laneClearance > 13 && pressureDist > 9 ? 2.58 : pressureDist < 4.2 ? 1.12 : 1.76,
    );
    const touchTargetX = clamp(this.ball.x + touchDir.x * touchDistance, 2, 98);
    const touchTargetY = clamp(this.ball.y + touchDir.y * touchDistance, 3, 97);
    const finalDir = normalize2D(touchTargetX - this.ball.x, touchTargetY - this.ball.y, touchDir.x, touchDir.y);
    const finalDistance = dist(this.ball.x, this.ball.y, touchTargetX, touchTargetY);
    const touchPower =
      dribbleTouchPowerForDistance(finalDistance, pressureDist, pressureDist > 8.5 && laneClearance > 10.5) *
      clamp(0.82 + owner.ballControl * 0.2 + owner.dribbling * 0.12, 0.78, 1.08);
    const usefulForwardProgress = (touchTargetX - owner.x) * fallbackDir;
    const expectedPressureEscape =
      nearestOpponentDistance(
        { ...owner, x: touchTargetX, y: touchTargetY },
        opponents,
      ) - pressureDist;
    const opensPassLane = selectPassOption(owner, this.players)?.laneClearance ?? 0;
    const usefulTouch =
      usefulForwardProgress > 0.72 ||
      finalDistance > 1.08 ||
      expectedPressureEscape > 0.28 ||
      opensPassLane > 5.2 ||
      laneClearance > 9.5;
    const nextMicroTouches = usefulTouch
      ? 0
      : Math.min(3, repeatedMicroTouches + 1);
    if (nextMicroTouches >= 2) {
      const outlet =
        selectSafeOutlet(owner, this.players) ??
        selectPassOption(owner, this.players) ??
        selectChippedPassOption(owner, this.players);
      if (outlet && "target" in outlet && this.pass(owner, outlet.target, true)) {
        this.ownerMicroTouchCount.delete(owner.id);
        return true;
      }
      const challenger = this.nearestOpponentToPoint(owner.team, owner.x, owner.y);
      if (challenger && challenger.distance < 2.15) {
        this.resolveForcedPressureDuel(owner, challenger.player, challenger.distance);
        this.ownerMicroTouchCount.delete(owner.id);
        return true;
      }
      this.releaseOwnerToLoose(owner, 0.02);
      this.ownerMicroTouchCount.delete(owner.id);
      return true;
    }
    if (nextMicroTouches > 0) this.ownerMicroTouchCount.set(owner.id, nextMicroTouches);
    else this.ownerMicroTouchCount.delete(owner.id);

    rotatePlayerFacingToward(owner, finalDir.x, finalDir.y, fallbackDir, 0, dt, 1.75);
    this.ball.vx = finalDir.x * touchPower + owner.vx * 0.035;
    this.ball.vy = finalDir.y * touchPower + owner.vy * 0.035;
    this.ball.z = 0;
    this.ball.vz = 0;
    this.ball.status = "GROUNDED";
    this.ball.flight = "ground";
    this.ball.curveX = 0;
    this.ball.curveY = 0;
    this.ball.lastOwnerId = owner.id;
    this.ball.controlOwnerId = owner.id;
    this.ball.controlOffsetX = this.ball.x - owner.x;
    this.ball.controlOffsetY = this.ball.y - owner.y;
    this.ball.controlState = "CHASING_OWN_TOUCH";
    this.ball.lastTouchOwnerId = owner.id;
    this.ball.lastTouchTime = this.time;
    this.ball.chaseTargetX = touchTargetX;
    this.ball.chaseTargetY = touchTargetY;

    owner.aiState = "CHASE_OWN_TOUCH";
    owner.targetX = touchTargetX;
    owner.targetY = touchTargetY;
    owner.decisionCooldown = Math.max(owner.decisionCooldown, 0.08);
    owner.dribbleTouchCooldown = clamp(
      0.08 + (1 - owner.ballControl) * 0.07 + (pressureDist > 8.5 ? 0.02 : 0),
      0.075,
      0.2,
    );
    steerTo(owner, touchTargetX, touchTargetY, 1.12 + owner.reaction * 0.28);
    return true;
  }

  private prepareStrikeTouch(
    p: EnginePlayer,
    targetX: number,
    targetY: number,
    kind: "pass" | "shot" | "cross" | "clearance",
  ): boolean {
    if (this.phase === "SET_PIECE") return true;
    if (this.ball.ownerId !== p.id || !p.hasBall) return true;
    const ballDist = dist(p.x, p.y, this.ball.x, this.ball.y);
    const pressure = nearestOpponentDistance(
      p,
      this.players.filter((op) => op.team !== p.team && op.position !== "GK"),
    );
    const contactState = this.ownerBallControlState(p);
    this.ball.controlState = contactState;
    const pressureReachPenalty = pressure < 2.8 ? 0.24 : pressure < 4.8 ? 0.12 : 0;
    const reach = clamp(
      (kind === "clearance" ? 1.74 : kind === "shot" ? 1.38 : kind === "cross" ? 1.46 : 1.42) +
        p.ballControl * 0.18 -
        pressureReachPenalty,
      kind === "clearance" ? 1.35 : 1.08,
      kind === "clearance" ? 1.95 : 1.62,
    );
    const fallbackDir = this.attackDirection(p.team);
    if (contactState !== "CLOSE_CONTROL" || this.ball.z > 0.6 || ballDist > reach) {
      steerTo(p, this.ball.x, this.ball.y, kind === "clearance" ? 1.18 : 1.04);
      updatePlayerFacingTowardPoint(p, this.ball.x, this.ball.y, fallbackDir, 0, 0.045, 1.45);
      p.decisionCooldown = Math.max(p.decisionCooldown, 0.07);
      return false;
    }

    const targetDir = normalize2D(targetX - p.x, targetY - p.y, fallbackDir, 0);
    const facing = normalize2D(p.facingX, p.facingY, fallbackDir, 0);
    const angle = Math.acos(clamp(facing.x * targetDir.x + facing.y * targetDir.y, -1, 1));
    const allowedAngle = kind === "shot" ? 0.92 : kind === "clearance" ? 1.35 : 1.15;
    if (angle > allowedAngle) {
      rotatePlayerFacingToward(p, targetDir.x, targetDir.y, fallbackDir, 0, 0.06, 1.65);
      p.decisionCooldown = Math.max(p.decisionCooldown, 0.055);
      return false;
    }

    rotatePlayerFacingToward(p, targetDir.x, targetDir.y, fallbackDir, 0, 0.045, 2.1);
    this.ball.controlOwnerId = undefined;
    this.ball.controlOffsetX = undefined;
    this.ball.controlOffsetY = undefined;
    return true;
  }

  private updateBallPhysics(dt: number): void {
    const totalFactor = dt * BALL_PHYSICS_SCALE;
    const steps = Math.max(1, Math.ceil(totalFactor / BALL_PHYSICS_MAX_SUBSTEP));
    const stepFactor = totalFactor / steps;
    let bouncedThisTick = false;

    for (let i = 0; i < steps; i++) {
      const status = this.ball.status;
      const airborne =
        status === "AIRBORNE" ||
        status === "BOUNCING" ||
        this.ball.z > 0 ||
        Math.abs(this.ball.vz) > 0.001;
      const flight = this.ball.flight ?? (airborne ? "lofted" : "ground");
      const curveScale = flight === "lofted" ? 1 : flight === "driven" ? 0.5 : 0.12;
      this.ball.vx += (this.ball.curveX ?? 0) * curveScale * stepFactor;
      this.ball.vy += (this.ball.curveY ?? 0) * curveScale * stepFactor;

      if (airborne) {
        this.ball.vz -= BALL_GRAVITY * stepFactor;
        this.ball.z += this.ball.vz * stepFactor;

        if (this.ball.z <= 0 && this.ball.vz < 0) {
          const reboundVz = Math.abs(this.ball.vz) * BALL_BOUNCE_RESTITUTION;
          this.ball.z = 0;
          this.ball.vx *= BALL_BOUNCE_IMPACT_FRICTION;
          this.ball.vy *= BALL_BOUNCE_IMPACT_FRICTION;
          if (reboundVz < BALL_BOUNCE_STOP_VZ) {
            this.ball.vz = 0;
            this.ball.status = "GROUNDED";
            this.ball.flight = "ground";
          } else {
            this.ball.vz = reboundVz;
            this.ball.status = "BOUNCING";
            bouncedThisTick = true;
          }
        } else {
          this.ball.status = this.ball.z > 0 ? "AIRBORNE" : this.ball.status;
        }
      } else {
        this.ball.z = 0;
        this.ball.vz = 0;
        this.ball.status = "GROUNDED";
      }

      applyBallHorizontalForces(this.ball, stepFactor);
      this.ball.x += this.ball.vx * stepFactor;
      this.ball.y += this.ball.vy * stepFactor;

      const curveDecay = Math.pow(this.ball.status === "GROUNDED" ? 0.88 : 0.968, stepFactor);
      this.ball.curveX = (this.ball.curveX ?? 0) * curveDecay;
      this.ball.curveY = (this.ball.curveY ?? 0) * curveDecay;
      if (Math.abs(this.ball.curveX) < 0.00001) this.ball.curveX = 0;
      if (Math.abs(this.ball.curveY) < 0.00001) this.ball.curveY = 0;
      if (
        this.ball.status === "GROUNDED" &&
        Math.hypot(this.ball.vx, this.ball.vy) < BALL_STOP_SPEED
      ) {
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.vz = 0;
        this.ball.z = 0;
        this.ball.status = "GROUNDED";
        this.ball.flight = "ground";
      }

      if (this.ball.y < 1) {
        this.startSetPiece(
          "throw_in",
          this.restartTeamFromLastTouch(),
          clamp(this.ball.x, 4, 96),
          2,
        );
        return;
      }
      if (this.ball.y > 99) {
        this.startSetPiece(
          "throw_in",
          this.restartTeamFromLastTouch(),
          clamp(this.ball.x, 4, 96),
          98,
        );
        return;
      }
      if (this.ball.x > 100 || this.ball.x < 0) break;
    }

    if (this.ball.x > 100 || this.ball.x < 0) return;

    if (this.ball.status === "GROUNDED" && Math.hypot(this.ball.vx, this.ball.vy) < BALL_STOP_SPEED) {
      this.ball.vx = 0;
      this.ball.vy = 0;
    }
    if (bouncedThisTick && this.ball.status !== "GROUNDED") this.ball.status = "BOUNCING";
  }

  private enforceLooseBallUrgency(dt: number): void {
    if (!this.isLiveBallPhase() || this.ball.z > BALL_LOW_CONTROL_HEIGHT + 0.1) return;
    const owner = this.ball.ownerId ? this.playerRegistry.get(this.ball.ownerId) ?? null : null;
    if (owner && this.canOwnerUseTechnicalAction(owner)) return;

    const ballSpeed = Math.hypot(this.ball.vx, this.ball.vy);
    const receivePoint = predictedBallPoint(this.ball, ballSpeed < 0.08 ? 0.35 : 0.62);
    const intended = this.ball.intendedReceiverId
      ? this.playerRegistry.get(this.ball.intendedReceiverId)
      : null;

    if (
      intended &&
      intended.team === this.ball.intendedTeam &&
      canPlayerReachBallHeight(intended, this.ball)
    ) {
      intended.aiState = "INTERCEPT";
      intended.targetX = receivePoint.x;
      intended.targetY = receivePoint.y;
      steerTo(intended, receivePoint.x, receivePoint.y, 1.12 + intended.reaction * 0.42);
      updatePlayerFacingTowardPoint(
        intended,
        receivePoint.x,
        receivePoint.y,
        this.attackDirection(intended.team),
        0,
        dt,
        1.75,
      );
      if (this.time < this.ball.interceptionOpenTime && ballSpeed > 0.035) return;
    }

    const candidates = this.players
      .filter((p) => p.position !== "GK" && canPlayerReachBallHeight(p, this.ball))
      .map((p) => ({
        p,
        d: dist(p.x, p.y, receivePoint.x, receivePoint.y),
        ballD: dist(p.x, p.y, this.ball.x, this.ball.y),
      }))
      .sort((a, b) => a.d - b.d);
    const nearest = candidates[0];
    if (!nearest) return;

    const rival = candidates.find((c) => c.p.team !== nearest.p.team);
    if (
      rival &&
      nearest.ballD < 2.35 &&
      rival.ballD < nearest.ballD + 0.55 &&
      ballSpeed < 0.12
    ) {
      if (owner && owner.id !== nearest.p.id && owner.id !== rival.p.id) this.releaseOwnerToLoose(owner, 0.01);
      this.resolveLooseBallDuel(nearest.p, rival.p);
      return;
    }

    const canClaimNow =
      ballSpeed < 0.09 &&
      nearest.ballD <= firstTouchControlRadius(nearest.p, this.ball, false) + 0.42;
    if (canClaimNow) {
      if (owner && owner.id !== nearest.p.id) this.releaseOwnerToLoose(owner, 0.01);
      this.claimLooseBall(nearest.p);
      return;
    }

    if (owner && owner.id !== nearest.p.id && nearest.ballD + 0.38 < dist(owner.x, owner.y, this.ball.x, this.ball.y)) {
      this.releaseOwnerToLoose(owner, 0.01);
    }

    nearest.p.aiState = this.ball.ownerId === nearest.p.id ? "CHASE_OWN_TOUCH" : "INTERCEPT";
    nearest.p.targetX = receivePoint.x;
    nearest.p.targetY = receivePoint.y;
    steerTo(nearest.p, receivePoint.x, receivePoint.y, 1.18 + nearest.p.reaction * 0.42);
    updatePlayerFacingTowardPoint(
      nearest.p,
      receivePoint.x,
      receivePoint.y,
      this.attackDirection(nearest.p.team),
      0,
      dt,
      1.85,
    );

    if (rival && rival.ballD < nearest.ballD + 2.4) {
      rival.p.aiState = "INTERCEPT";
      rival.p.targetX = receivePoint.x;
      rival.p.targetY = receivePoint.y;
      steerTo(rival.p, receivePoint.x, receivePoint.y, 1.08 + rival.p.reaction * 0.34);
    }
  }

  private updateAllPlayers(dt: number): void {
    const gameMinuteFrac = dt * MATCH_CLOCK_RATE;
    const decDt = gameMinuteFrac;

    // Ball snapshot: all decisions within this tick use the same ball
    // position, preventing frame-order artifacts from earlier player actions.
    const snapshotBall: Ball = { ...this.ball };

    this.players.forEach((p) => {
      p.hasBall = this.ball.ownerId === p.id;
      p.decisionCooldown = Math.max(0, p.decisionCooldown - decDt);
      p.dribbleTouchCooldown = Math.max(0, p.dribbleTouchCooldown - dt);

      p.stamina = Math.max(
        0,
        p.stamina - (p.hasBall ? 0.45 : 0.22) * gameMinuteFrac,
      );

      if (p.position === "GK" && p.hasBall) {
        this.distributeFromGoalkeeper(p);
      } else if (p.position === "GK") {
        updateGoalkeeper(p, snapshotBall, this.players);
      } else if (p.hasBall) {
        this.enforceOwnerBallResponsibility(p, dt);
        this.tightenCarrierUrgency(p);
        if (this.validateOwnerCanDecide(p, dt)) {
          decideBallAction(p, this.players, this, snapshotBall);
        }
        if (p.aiState === "DRIBBLE") {
          this.performPendingDribbleTouch(p, dt);
        }
      } else {
        decideOffBallAction(p, snapshotBall, this.players);
      }

      applyMovement(p, dt);
      const preparingToReceive =
        snapshotBall.ownerId === null &&
        snapshotBall.intendedReceiverId === p.id &&
        snapshotBall.intendedTeam === p.team;
      if (p.aiState === "CHASE_OWN_TOUCH" && p.hasBall) {
        updatePlayerFacingTowardPoint(
          p,
          this.ball.x,
          this.ball.y,
          this.attackDirection(p.team),
          0,
          dt,
          1.9,
        );
      } else if (preparingToReceive) {
        const receivePoint = predictedBallPoint(snapshotBall, 0.62);
        const distanceToIncomingBall = dist(p.x, p.y, receivePoint.x, receivePoint.y);
        const urgency = clamp(1.05 + Math.hypot(snapshotBall.vx, snapshotBall.vy) * 2.8 + (18 - distanceToIncomingBall) * 0.025, 1.05, 1.85);
        p.aiState = "INTERCEPT";
        p.targetX = receivePoint.x;
        p.targetY = receivePoint.y;
        steerTo(p, receivePoint.x, receivePoint.y, urgency);
        updatePlayerFacingTowardPoint(
          p,
          receivePoint.x,
          receivePoint.y,
          this.attackDirection(p.team),
          0,
          dt,
          urgency,
        );
      } else {
        updatePlayerFacing(p, this.attackDirection(p.team), 0, dt);
      }

      if (p.hasBall) {
        const recoveringOwnTouch =
          this.ball.ownerId === p.id &&
          this.ball.controlState === "CHASING_OWN_TOUCH" &&
          this.ball.lastTouchOwnerId === p.id &&
          this.time - (this.ball.lastTouchTime ?? -Infinity) < 0.04;
        if (recoveringOwnTouch) {
          this.ball.controlOwnerId = p.id;
          this.ball.controlOffsetX = this.ball.x - p.x;
          this.ball.controlOffsetY = this.ball.y - p.y;
          this.ball.curveX = 0;
          this.ball.curveY = 0;
          return;
        }
        if (p.decisionCooldown <= 0.02 && p.possessionFlipCount >= 2) {
          const outlet =
            selectSafeOutlet(p, this.players) ??
            selectPassOption(p, this.players) ??
            selectChippedPassOption(p, this.players);
          if (
            outlet &&
            !isOffside(outlet.target, this.players, this.ball) &&
            (outlet.laneClearance < 2.8
              ? this.chippedPass(p, outlet.target)
              : this.pass(p, outlet.target, true))
          ) {
            p.possessionFlipCount = 0;
            return;
          }
        }
        this.ball.intendedReceiverId = null;
        this.ball.intendedTeam = null;
        this.ball.offsideReceiverId = null;
        if (this.canOwnerUseTechnicalAction(p)) {
          this.syncControlledBall(p, dt);
        } else {
          this.enforceOwnerBallResponsibility(p, dt);
        }
        this.ball.curveX = 0;
        this.ball.curveY = 0;
      }
    });
  }

  private distributeFromGoalkeeper(gk: EnginePlayer): void {
    if (gk.decisionCooldown > 0) {
      updateGoalkeeper(gk, this.ball, this.players);
      return;
    }

    // Prefer midfielders or fullbacks in space — avoid short passes to clustered CBs
    const teammates = this.players
      .filter(
        (p) => p.team === gk.team && p.position !== "GK" && p.id !== gk.id,
      )
      .map((p) => ({
        player: p,
        d: dist(gk.x, gk.y, p.x, p.y),
        nearestOpp: this.players
          .filter((op) => op.team !== gk.team)
          .reduce(
            (min, op) => Math.min(min, dist(op.x, op.y, p.x, p.y)),
            Infinity,
          ),
      }));

    // Score each teammate: prefer midfielders/width, in space, moderate distance
    let bestPlayer: EnginePlayer | null = null;
    let bestScore2 = -Infinity;
    for (const t of teammates) {
      if (t.d > 50) continue;
      const pos = t.player.position;
      const isMidfielder =
        pos === "CM" ||
        pos === "CDM" ||
        pos === "CAM" ||
        pos === "LM" ||
        pos === "RM";
      const isFullback =
        pos === "LB" || pos === "RB" || pos === "LWB" || pos === "RWB";
      const isCB = pos === "CB" || pos === "LCB" || pos === "RCB";
      const roleBonus = isMidfielder ? 6 : isFullback ? 5 : isCB ? 0 : 4;
      const spaceBonus = Math.min(t.nearestOpp, 12) * 0.5;
      const distancePenalty = Math.abs(t.d - 20) * 0.1;
      const score = roleBonus + spaceBonus - distancePenalty;
      if (score > bestScore2) {
        bestScore2 = score;
        bestPlayer = t.player;
      }
    }

    const target = bestPlayer;
    if (!target) return;

    gk.decisionCooldown = GK_DISTRIBUTION_COOLDOWN;
    debugLog(`${gk.name} distributes to ${target.name}`);
    this.pass(gk, target, true);
    const targetDist = dist(gk.x, gk.y, target.x, target.y);
    this.ball.vz = targetDist < 15 ? 0 : 0.3;
    this.ball.status = targetDist < 15 ? "GROUNDED" : "AIRBORNE";
    this.ball.flight = targetDist < 15 ? "ground" : "lofted";
    if (targetDist >= 15) this.ball.z = Math.max(this.ball.z, 0.34);
  }

  private resolvePlayerSeparation(dt: number): void {
    const maxPush = clamp(dt * 2.2, 0.012, 0.11);
    for (let i = 0; i < this.players.length; i++) {
      const a = this.players[i];
      if (a.aiState === "SET_PIECE") continue;
      for (let j = i + 1; j < this.players.length; j++) {
        const b = this.players[j];
        if (b.aiState === "SET_PIECE") continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const ownerContact =
          this.ball.ownerId === a.id ||
          this.ball.ownerId === b.id ||
          a.aiState === "PRESS" ||
          b.aiState === "PRESS" ||
          a.aiState === "INTERCEPT" ||
          b.aiState === "INTERCEPT";
        const minSpacing =
          a.team === b.team
            ? ownerContact
              ? 0.95
              : 1.55
            : ownerContact
              ? 0.68
              : 1.05;
        if (d >= minSpacing) continue;

        const overlap = minSpacing - Math.max(d, 0.001);
        const nx = d > 0.001 ? dx / d : deterministicSigned(`${a.id}:${b.id}:sx`, 1);
        const ny = d > 0.001 ? dy / d : deterministicSigned(`${a.id}:${b.id}:sy`, 1);
        const push = Math.min(maxPush, overlap * 0.42);
        const aCanMove = this.ball.ownerId !== a.id && a.position !== "GK";
        const bCanMove = this.ball.ownerId !== b.id && b.position !== "GK";
        if (aCanMove) {
          a.x = clamp(a.x - nx * push, 1.5, 98.5);
          a.y = clamp(a.y - ny * push, 2, 98);
        }
        if (bCanMove) {
          b.x = clamp(b.x + nx * push, 1.5, 98.5);
          b.y = clamp(b.y + ny * push, 2, 98);
        }
      }
    }
  }

  private enforceLivePlayFlow(dt: number): void {
    if (!this.isLiveBallPhase()) {
      this.liveFlowWatchdog.globalStallSeconds = 0;
      this.liveFlowWatchdog.ownerStallSeconds = 0;
      this.liveFlowWatchdog.ownerSeconds = 0;
      this.liveFlowWatchdog.ownerId = this.ball.ownerId;
      this.liveFlowWatchdog.possessionTeam = null;
      this.liveFlowWatchdog.ballX = this.ball.x;
      this.liveFlowWatchdog.ballY = this.ball.y;
      this.liveFlowWatchdog.pocketX = this.ball.x;
      this.liveFlowWatchdog.pocketY = this.ball.y;
      this.liveFlowWatchdog.eventCount = this.events.length;
      this.liveFlowWatchdog.tacticalStallSeconds = 0;
      return;
    }

    const ballMove = dist(
      this.liveFlowWatchdog.ballX,
      this.liveFlowWatchdog.ballY,
      this.ball.x,
      this.ball.y,
    );
    const ballSpeed = Math.hypot(this.ball.vx, this.ball.vy);
    const movingPlayers = this.players.filter((p) => Math.hypot(p.vx, p.vy) > 0.018).length;
    const eventChanged = this.events.length !== this.liveFlowWatchdog.eventCount;
    const owner = this.ball.ownerId ? this.playerRegistry.get(this.ball.ownerId) ?? null : null;
    const currentPossessionTeam = owner?.team ?? this.ball.intendedTeam ?? null;

    if (owner && owner.id === this.liveFlowWatchdog.ownerId) {
      this.liveFlowWatchdog.ownerSeconds += dt;
    } else {
      this.liveFlowWatchdog.ownerId = owner?.id ?? null;
      this.liveFlowWatchdog.ownerSeconds = 0;
      this.liveFlowWatchdog.ownerStallSeconds = 0;
    }

    const pocketDistance = dist(
      this.liveFlowWatchdog.pocketX,
      this.liveFlowWatchdog.pocketY,
      this.ball.x,
      this.ball.y,
    );
    const possessionTeamChanged =
      currentPossessionTeam !== this.liveFlowWatchdog.possessionTeam;
    const shouldResetPocket =
      eventChanged ||
      possessionTeamChanged ||
      pocketDistance > 10.5 ||
      (owner && Math.abs((this.ball.x - this.liveFlowWatchdog.pocketX) * this.attackDirection(owner.team)) > 9.5);
    if (shouldResetPocket) {
      this.liveFlowWatchdog.pocketX = this.ball.x;
      this.liveFlowWatchdog.pocketY = this.ball.y;
      this.liveFlowWatchdog.possessionTeam = currentPossessionTeam;
      this.liveFlowWatchdog.tacticalStallSeconds = 0;
    }

    const ownerStill = owner ? Math.hypot(owner.vx, owner.vy) < 0.016 : false;
    const ownerBallDist = owner ? dist(owner.x, owner.y, this.ball.x, this.ball.y) : Infinity;
    const stagnantOwner =
      Boolean(owner) &&
      ballSpeed < 0.026 &&
      ballMove < 0.035 &&
      ownerStill &&
      (ownerBallDist > 0.55 || (this.carrierPressureSeconds.get(owner!.id) ?? 0) > 0.38);
    this.liveFlowWatchdog.ownerStallSeconds = stagnantOwner
      ? this.liveFlowWatchdog.ownerStallSeconds + dt
      : Math.max(0, this.liveFlowWatchdog.ownerStallSeconds - dt * 0.8);

    const globallyStatic =
      !eventChanged &&
      ballSpeed < 0.022 &&
      ballMove < 0.03 &&
      movingPlayers < 4 &&
      this.phase !== "KICK_OFF";
    this.liveFlowWatchdog.globalStallSeconds = globallyStatic
      ? this.liveFlowWatchdog.globalStallSeconds + dt
      : Math.max(0, this.liveFlowWatchdog.globalStallSeconds - dt);

    const hardStatic =
      !eventChanged &&
      ballMove < 0.022 &&
      ballSpeed < 0.018 &&
      movingPlayers < 3 &&
      this.phase !== "KICK_OFF";
    this.liveFlowWatchdog.hardStillSeconds = hardStatic
      ? this.liveFlowWatchdog.hardStillSeconds + dt
      : Math.max(0, this.liveFlowWatchdog.hardStillSeconds - dt * 1.4);

    const centralPocket = this.ball.x > 24 && this.ball.x < 76 && this.ball.y > 18 && this.ball.y < 82;
    const nearbyOutfield = this.players.filter(
      (p) => p.position !== "GK" && dist(p.x, p.y, this.ball.x, this.ball.y) < 12,
    ).length;
    const ownerPressure = owner
      ? nearestOpponentDistance(
          owner,
          this.players.filter((p) => p.team !== owner.team && p.position !== "GK"),
        )
      : Infinity;
    const repeatedRecovery =
      owner ? (this.ownerMicroTouchCount.get(owner.id) ?? 0) >= 1 || owner.aiState === "CHASE_OWN_TOUCH" : false;
    const tacticalStall =
      !eventChanged &&
      Boolean(currentPossessionTeam) &&
      centralPocket &&
      pocketDistance < 8.8 &&
      nearbyOutfield >= 7 &&
      (ownerPressure < 5.6 || repeatedRecovery || this.liveFlowWatchdog.ownerSeconds > 1.05);
    this.liveFlowWatchdog.tacticalStallSeconds = tacticalStall
      ? this.liveFlowWatchdog.tacticalStallSeconds + dt
      : Math.max(0, this.liveFlowWatchdog.tacticalStallSeconds - dt * 0.65);

    if (
      owner &&
      (this.liveFlowWatchdog.ownerStallSeconds > LIVE_OWNER_STALL_SECONDS ||
        this.liveFlowWatchdog.ownerSeconds > this.carrierMaxDecisionSeconds(owner) + 0.32 ||
        this.liveFlowWatchdog.tacticalStallSeconds > 1.65)
    ) {
      if (this.forcePossessionResolution(owner, this.liveFlowWatchdog.tacticalStallSeconds > 1.65)) {
        this.liveFlowWatchdog.ownerStallSeconds = 0;
        this.liveFlowWatchdog.ownerSeconds = 0;
        this.liveFlowWatchdog.tacticalStallSeconds = 0;
        this.liveFlowWatchdog.pocketX = this.ball.x;
        this.liveFlowWatchdog.pocketY = this.ball.y;
      }
    } else if (this.liveFlowWatchdog.hardStillSeconds > 1.35) {
      if (this.hardRecoverDeadState()) {
        this.liveFlowWatchdog.hardStillSeconds = 0;
        this.liveFlowWatchdog.globalStallSeconds = 0;
        this.liveFlowWatchdog.ownerStallSeconds = 0;
        this.liveFlowWatchdog.ownerSeconds = 0;
        this.liveFlowWatchdog.tacticalStallSeconds = 0;
        this.liveFlowWatchdog.pocketX = this.ball.x;
        this.liveFlowWatchdog.pocketY = this.ball.y;
      }
    } else if (!owner && this.liveFlowWatchdog.globalStallSeconds > LIVE_GLOBAL_STALL_SECONDS) {
      const nearest = this.players
        .filter((p) => p.position !== "GK" && canPlayerReachBallHeight(p, this.ball))
        .map((p) => ({ p, d: dist(p.x, p.y, this.ball.x, this.ball.y) }))
        .sort((a, b) => a.d - b.d)[0];
      if (nearest && nearest.d < 7.5) {
        steerTo(nearest.p, this.ball.x, this.ball.y, 1.28);
        if (nearest.d < firstTouchControlRadius(nearest.p, this.ball, false) + 0.3) {
          this.claimLooseBall(nearest.p);
        }
      } else {
        this.ball.vx += deterministicSigned(`stall:vx:${this.time.toFixed(2)}`, 0.018);
        this.ball.vy += deterministicSigned(`stall:vy:${this.time.toFixed(2)}`, 0.018);
      }
      this.liveFlowWatchdog.globalStallSeconds = 0;
    }

    this.liveFlowWatchdog.ballX = this.ball.x;
    this.liveFlowWatchdog.ballY = this.ball.y;
    this.liveFlowWatchdog.eventCount = this.events.length;
  }

  private hardRecoverDeadState(): boolean {
    const owner = this.ball.ownerId ? this.playerRegistry.get(this.ball.ownerId) ?? null : null;
    if (owner) {
      if (this.canOwnerUseTechnicalAction(owner)) {
        const outlet =
          selectSafeOutlet(owner, this.players) ??
          selectPassOption(owner, this.players) ??
          selectChippedPassOption(owner, this.players);
        if (outlet && "target" in outlet && this.pass(owner, outlet.target, true)) return true;
        if (this.isBallInOwnBox(owner) && owner.position !== "GK") {
          this.clearDefensiveBall(owner);
          return true;
        }
      }

      const challenger = this.nearestOpponentToPoint(owner.team, this.ball.x, this.ball.y);
      if (challenger && challenger.distance < 2.6) {
        this.resolveForcedPressureDuel(owner, challenger.player, challenger.distance);
      } else {
        this.releaseOwnerToLoose(owner, 0.01);
        this.enforceLooseBallUrgency(Math.max(this.lastTickDt, 0.045));
      }
      return true;
    }

    const candidates = this.players
      .filter((p) => p.position !== "GK" && canPlayerReachBallHeight(p, this.ball))
      .map((p) => ({ p, d: dist(p.x, p.y, this.ball.x, this.ball.y) }))
      .sort((a, b) => a.d - b.d);
    const nearest = candidates[0];
    if (!nearest) {
      this.ball.vx += deterministicSigned(`hard:dead:vx:${this.time.toFixed(2)}`, 0.026);
      this.ball.vy += deterministicSigned(`hard:dead:vy:${this.time.toFixed(2)}`, 0.026);
      return true;
    }
    const rival = candidates.find((c) => c.p.team !== nearest.p.team);
    if (rival && rival.d < nearest.d + 0.85 && nearest.d < 3.2) {
      this.resolveLooseBallDuel(nearest.p, rival.p);
      return true;
    }
    if (nearest.d < firstTouchControlRadius(nearest.p, this.ball, false) + 0.75) {
      this.claimLooseBall(nearest.p);
      return true;
    }
    nearest.p.aiState = "INTERCEPT";
    nearest.p.targetX = this.ball.x;
    nearest.p.targetY = this.ball.y;
    steerTo(nearest.p, this.ball.x, this.ball.y, 1.38 + nearest.p.reaction * 0.38);
    this.ball.interceptionOpenTime = this.time;
    this.ball.vx += deterministicSigned(`hard:loose:vx:${this.time.toFixed(2)}`, 0.014);
    this.ball.vy += deterministicSigned(`hard:loose:vy:${this.time.toFixed(2)}`, 0.014);
    return true;
  }

  private forcePossessionResolution(owner: EnginePlayer, tacticalStall = false): boolean {
    if (this.ball.ownerId !== owner.id || !owner.hasBall) return false;
    const state = this.ownerBallControlState(owner);
    this.ball.controlState = state;
    if (state !== "CLOSE_CONTROL") {
      if (state === "CHASING_OWN_TOUCH") {
        if (tacticalStall) {
          const challenger = this.nearestOpponentToPoint(owner.team, this.ball.x, this.ball.y);
          if (challenger && challenger.distance < 2.35) {
            this.resolveForcedPressureDuel(owner, challenger.player, challenger.distance);
          } else {
            this.releaseOwnerToLoose(owner, 0.02);
          }
          return true;
        }
        owner.decisionCooldown = 0;
        owner.dribbleTouchCooldown = 0;
        this.syncControlledBall(owner, Math.max(this.lastTickDt, 0.045));
        return true;
      }
      this.releaseOwnerToLoose(owner, 0.02);
      return true;
    }

    owner.decisionCooldown = 0;
    owner.dribbleTouchCooldown = Math.min(owner.dribbleTouchCooldown, 0.02);
    const dir = this.attackDirection(owner.team);
    const depth = owner.team === "home" ? owner.x : 100 - owner.x;
    const wideFinalThird = depth > 66 && (owner.y < 31 || owner.y > 69);
    const nearBox = depth > 69 && owner.y > BOX_MIN_Y - 9 && owner.y < BOX_MAX_Y + 9;
    const opponents = this.players.filter((op) => op.team !== owner.team && op.position !== "GK");
    const pressure = nearestOpponentDistance(owner, opponents);
    const challenger = this.nearestOpponentToPoint(owner.team, owner.x, owner.y);

    if (wideFinalThird) {
      if (selectCrossOption(owner, this.players) && this.cross(owner)) return true;
      const boxRunner = selectBoxRunnerOption(owner, this.players);
      if (boxRunner && this.pass(owner, boxRunner.target)) return true;
      const outlet = selectSafeOutlet(owner, this.players) ?? selectPassOption(owner, this.players);
      if (outlet && this.pass(owner, outlet.target)) return true;
      owner.aiState = "DRIBBLE";
      owner.targetX = clamp(owner.x + dir * 4.5, 3, 97);
      owner.targetY = clamp(owner.y + (owner.y < 50 ? -2.5 : 2.5), 5, 95);
      this.syncControlledBall(owner, Math.max(this.lastTickDt, 0.045));
      return true;
    }

    if (nearBox && (pressure > 3.2 || Math.random() < 0.55) && this.shoot(owner, this.attackingGoalX(owner.team))) {
      return true;
    }

    if (tacticalStall) {
      const outlet =
        selectSafeOutlet(owner, this.players) ??
        selectPassOption(owner, this.players) ??
        selectChippedPassOption(owner, this.players);
      if (outlet && "target" in outlet && this.pass(owner, outlet.target, true)) {
        this.ownerMicroTouchCount.delete(owner.id);
        return true;
      }
      if (challenger && challenger.distance < 2.1) {
        this.resolveForcedPressureDuel(owner, challenger.player, challenger.distance);
        this.ownerMicroTouchCount.delete(owner.id);
        return true;
      }
      this.releaseOwnerToLoose(owner, 0.01);
      this.ownerMicroTouchCount.delete(owner.id);
      this.enforceLooseBallUrgency(Math.max(this.lastTickDt, 0.045));
      return true;
    }

    if (pressure < 3.2) {
      const outlet =
        selectSafeOutlet(owner, this.players) ??
        selectChippedPassOption(owner, this.players) ??
        selectPassOption(owner, this.players);
      if (outlet && ("target" in outlet) && this.pass(owner, outlet.target)) return true;
      if (challenger && challenger.distance < 1.65) {
        this.resolveForcedPressureDuel(owner, challenger.player, challenger.distance);
        return true;
      }
    }

    const through = selectThroughBallOption(owner, this.players);
    if (through && this.throughPass(owner, through.target)) return true;
    const pass = selectPassOption(owner, this.players) ?? selectSafeOutlet(owner, this.players);
    if (pass && this.pass(owner, pass.target)) return true;

    owner.aiState = "DRIBBLE";
    owner.targetX = clamp(owner.x + dir * (pressure > 6 ? 5.5 : 2.2), 3, 97);
    owner.targetY = clamp(owner.y + deterministicSigned(`${owner.id}:stall-carry:${this.time.toFixed(2)}`, 4.2), 5, 95);
    this.syncControlledBall(owner, Math.max(this.lastTickDt, 0.045));
    return true;
  }

  private resolveForcedPressureDuel(owner: EnginePlayer, challenger: EnginePlayer, challengerDist: number): void {
    this.addTeamStat(challenger.team, "tacklesTotal");
    this.addPlayerStat(challenger, "tacklesTotal");
    this.addTeamStat(challenger.team, "duelsTotal");
    this.addPlayerStat(challenger, "duelsTotal");
    this.addPlayerStat(owner, "duelsTotal");
    const attribution =
      challenger.defending * 0.32 +
      challenger.tackling * 0.28 +
      challenger.reaction * 0.2 +
      challenger.strength * 0.12 +
      challenger.aggression * 0.08;
    const security =
      owner.ballControl * 0.28 +
      owner.dribbling * 0.24 +
      owner.composure * 0.22 +
      owner.strength * 0.14 +
      owner.reaction * 0.12;
    const winChance = clamp(
      0.38 + (attribution - security) * 0.48 + clamp((1.7 - challengerDist) / 1.7, 0, 1) * 0.18,
      0.18,
      0.76,
    );
    if (Math.random() < winChance) {
      this.addTeamStat(challenger.team, "tacklesWon");
      this.addTeamStat(challenger.team, "duelsWon");
      this.addPlayerStat(challenger, "tacklesWon");
      this.addPlayerStat(challenger, "duelsWon");
      this.ball.ownerId = challenger.id;
      this.ball.lastOwnerId = owner.id;
      this.ball.intendedReceiverId = null;
      this.ball.intendedTeam = null;
      this.ball.offsideReceiverId = null;
      this.ball.controlOwnerId = challenger.id;
      this.ball.controlOffsetX = this.ball.x - challenger.x;
      this.ball.controlOffsetY = this.ball.y - challenger.y;
      this.ball.controlState = "CLOSE_CONTROL";
      this.ball.lastTouchOwnerId = challenger.id;
      this.ball.lastTouchTime = this.time;
      owner.hasBall = false;
      challenger.hasBall = true;
      challenger.decisionCooldown = FIRST_TOUCH_COOLDOWN * 0.55;
      challenger.dribbleTouchCooldown = 0.08;
      this.emitEvent("tackle", challenger.team, `${challenger.name} wins the ball from ${owner.name}`);
      return;
    }

    this.addTeamStat(owner.team, "duelsWon");
    this.addPlayerStat(owner, "duelsWon");
    owner.decisionCooldown = 0;
    owner.dribbleTouchCooldown = 0;
    this.syncControlledBall(owner, Math.max(this.lastTickDt, 0.045));
  }

  private resolveLooseBallDuel(a: EnginePlayer, b: EnginePlayer): void {
    this.addTeamStat(a.team, "duelsTotal");
    this.addTeamStat(b.team, "duelsTotal");
    this.addPlayerStat(a, "duelsTotal");
    this.addPlayerStat(b, "duelsTotal");

    const scoreA =
      a.reaction * 0.28 +
      a.ballControl * 0.2 +
      a.strength * 0.18 +
      a.tackling * 0.12 +
      a.composure * 0.1 +
      a.overall * 0.12 -
      dist(a.x, a.y, this.ball.x, this.ball.y) * 0.08;
    const scoreB =
      b.reaction * 0.28 +
      b.ballControl * 0.2 +
      b.strength * 0.18 +
      b.tackling * 0.12 +
      b.composure * 0.1 +
      b.overall * 0.12 -
      dist(b.x, b.y, this.ball.x, this.ball.y) * 0.08;
    const total = Math.max(0.1, scoreA + scoreB);
    const aWinChance = clamp(scoreA / total, 0.24, 0.76);
    const winner = Math.random() < aWinChance ? a : b;
    const loser = winner.id === a.id ? b : a;
    const cleanWin =
      Math.random() <
      clamp(
        0.34 +
          (winner.ballControl - loser.tackling) * 0.22 +
          (winner.strength - loser.strength) * 0.14 +
          winner.reaction * 0.16,
        0.22,
        0.68,
      );

    if (cleanWin) {
      this.addTeamStat(winner.team, "duelsWon");
      this.addPlayerStat(winner, "duelsWon");
      this.claimLooseBall(winner);
      return;
    }

    const away = normalize2D(
      this.ball.x - (a.x + b.x) * 0.5,
      this.ball.y - (a.y + b.y) * 0.5,
      this.attackDirection(winner.team),
      deterministicSigned(`${winner.id}:${loser.id}:duel`, 1),
    );
    this.ball.ownerId = null;
    this.ball.intendedReceiverId = null;
    this.ball.intendedTeam = null;
    this.ball.offsideReceiverId = null;
    this.ball.controlOwnerId = undefined;
    this.ball.controlOffsetX = undefined;
    this.ball.controlOffsetY = undefined;
    this.ball.controlState = "LOOSE";
    this.ball.vx = away.x * 0.075 + (winner.vx - loser.vx) * 0.08;
    this.ball.vy = away.y * 0.075 + (winner.vy - loser.vy) * 0.08;
    this.ball.interceptionOpenTime = this.time + 0.05;
    const chasePoint = predictedBallPoint(this.ball, 0.35);
    winner.aiState = "INTERCEPT";
    winner.targetX = chasePoint.x;
    winner.targetY = chasePoint.y;
    loser.aiState = "INTERCEPT";
    loser.targetX = chasePoint.x;
    loser.targetY = chasePoint.y;
    steerTo(winner, chasePoint.x, chasePoint.y, 1.22 + winner.reaction * 0.28);
    steerTo(loser, chasePoint.x, chasePoint.y, 1.05 + loser.reaction * 0.22);
  }

  private checkCollisions(): void {
    if (this.ball.ownerId) {
      const owner = this.playerRegistry.get(this.ball.ownerId);
      if (!owner) return;

      if (this.time < this.possessionGraceUntil) return;

      const ownerBallDist = dist(owner.x, owner.y, this.ball.x, this.ball.y);
      if (ownerBallDist > 2.35 && this.ball.z <= BALL_LOW_CONTROL_HEIGHT) {
        const nearestOpponentToTouch = this.players
          .filter((p) => p.team !== owner.team && p.position !== "GK" && canPlayerReachBallHeight(p, this.ball))
          .map((p) => ({ p, d: dist(p.x, p.y, this.ball.x, this.ball.y) }))
          .filter(({ d }) => d <= firstTouchControlRadius(owner, this.ball, false) + 0.35)
          .sort((a, b) => a.d - b.d)[0];
        if (
          nearestOpponentToTouch &&
          nearestOpponentToTouch.d + 0.45 < ownerBallDist &&
          Math.random() <
            clamp(
              0.18 +
                nearestOpponentToTouch.p.reaction * 0.18 +
                nearestOpponentToTouch.p.interceptions * 0.16 -
                owner.ballControl * 0.22 -
                owner.composure * 0.08,
              0.08,
              0.42,
            )
        ) {
          owner.hasBall = false;
          this.ball.ownerId = null;
          this.ball.lastOwnerId = owner.id;
          this.ball.intendedReceiverId = null;
          this.ball.intendedTeam = null;
          this.ball.offsideReceiverId = null;
          this.ball.interceptionOpenTime = this.time;
          this.claimLooseBall(nearestOpponentToTouch.p);
          return;
        }
      }

      // Only the single closest opponent may attempt a tackle per tick
      let challenger: EnginePlayer | null = null;
      let challengerDist = TACKLE_RADIUS;
      for (const p of this.players) {
        if (p.team === owner.team || p.position === "GK") continue;
        const d = dist(p.x, p.y, owner.x, owner.y);
        if (d < challengerDist) {
          challengerDist = d;
          challenger = p;
        }
      }
      if (challenger) {
        const previousPressure = this.carrierPressureSeconds.get(owner.id) ?? 0;
        const pressureGain = challengerDist < 1.2 ? 1.35 : challengerDist < 1.65 ? 1.0 : 0.72;
        const pressureSeconds = Math.min(2.2, previousPressure + Math.max(this.lastTickDt, 0.035) * pressureGain);
        this.carrierPressureSeconds.set(owner.id, pressureSeconds);
        const lockKey = `${challenger.id}:${owner.id}`;
        const attribution =
          challenger.reaction * 0.16 +
          challenger.defending * 0.26 +
          challenger.tackling * 0.24 +
          challenger.aggression * 0.08 +
          challenger.overall * 0.16 +
          challenger.strength * 0.1;
        const ownerSecurity =
          owner.ballControl * 0.22 +
          owner.dribbling * 0.18 +
          owner.composure * 0.16 +
          owner.strength * 0.08;
        const recentFlipProtection =
          owner.possessionFlipCount >= 2 ? 0.42 : owner.possessionFlipCount === 1 ? 0.72 : 1;
        const proximity = clamp((TACKLE_RADIUS - challengerDist) / TACKLE_RADIUS, 0, 1);
        const nextAllowedAttempt = this.tackleAttemptLocks.get(lockKey) ?? 0;
        const forcedByPressure =
          challengerDist < 1.45 &&
          pressureSeconds > PRESSURE_RESOLUTION_SECONDS &&
          owner.decisionCooldown < 0.12;
        const attemptChance =
          clamp(
            0.009 +
              proximity * 0.018 +
              challenger.aggression * 0.006 +
              Math.max(0, attribution - ownerSecurity) * 0.012 +
              pressureSeconds * 0.018,
            0.006,
            0.085,
          ) * recentFlipProtection;

        if (this.time >= nextAllowedAttempt && (forcedByPressure || Math.random() < attemptChance)) {
          this.tackleAttemptLocks.set(lockKey, this.time + 0.16 + Math.random() * 0.12);
          this.addTeamStat(challenger.team, "tacklesTotal");
          this.addPlayerStat(challenger, "tacklesTotal");
          this.addTeamStat(challenger.team, "duelsTotal");
          this.addPlayerStat(challenger, "duelsTotal");
          this.addPlayerStat(owner, "duelsTotal");

          const winChance = clamp(
            0.34 +
              (attribution - ownerSecurity) * 0.52 +
              proximity * 0.16 +
              pressureSeconds * 0.08 +
              (challenger.strength - owner.strength) * 0.1,
            0.22,
            0.78,
          );
          if (!(Math.random() < winChance && this.tryEvent("tackle"))) {
            this.addTeamStat(owner.team, "duelsWon");
            this.addPlayerStat(owner, "duelsWon");
            this.addPlayerStat(owner, "groundDuelsTotal");
            this.addPlayerStat(owner, "groundDuelsWon");
            return;
          }

          this.addTeamStat(challenger.team, "tacklesWon");
          this.addTeamStat(challenger.team, "duelsWon");
          this.addPlayerStat(challenger, "tacklesWon");
          this.addPlayerStat(challenger, "duelsWon");
          this.addPlayerStat(challenger, "groundDuelsTotal");
          this.addPlayerStat(challenger, "groundDuelsWon");
          this.addPlayerStat(owner, "groundDuelsTotal");
          this.emitEvent(
            "tackle",
            challenger.team,
            `${challenger.name} wins the ball from ${owner.name}`,
          );
          owner.hasBall = false;
          challenger.hasBall = true;
          this.ball.ownerId = challenger.id;
          this.ball.lastOwnerId = owner.id;
          this.ball.intendedReceiverId = null;
          this.ball.intendedTeam = null;
          this.ball.offsideReceiverId = null;
          this.ball.interceptionOpenTime = this.time;
          this.ball.status = "GROUNDED";
          this.ball.flight = "ground";
          this.ball.z = 0;
          this.ball.vz = 0;
          this.ball.controlOwnerId = challenger.id;
          this.ball.controlOffsetX = this.ball.x - challenger.x;
          this.ball.controlOffsetY = this.ball.y - challenger.y;
          this.ball.controlState = "CLOSE_CONTROL";
          this.ball.lastTouchOwnerId = challenger.id;
          this.ball.lastTouchTime = this.time;
          challenger.dribbleTouchCooldown = clamp(0.12 + (1 - challenger.ballControl) * 0.12, 0.12, 0.28);
          challenger.possessionFlipCount = Math.min(challenger.possessionFlipCount + 1, 4);
          owner.possessionFlipCount = Math.min(owner.possessionFlipCount + 1, 4);
          challenger.decisionCooldown =
            challenger.possessionFlipCount >= 2 ? 0 : this.nextCarryWindow(challenger);
          this.possessionGraceUntil =
            this.time + (challenger.possessionFlipCount >= 2 ? FIRST_TOUCH_COOLDOWN * 1.9 : FIRST_TOUCH_COOLDOWN);
          this.carrierPressureSeconds.delete(owner.id);
        }
      } else {
        const current = this.carrierPressureSeconds.get(owner.id) ?? 0;
        if (current > 0) {
          const next = Math.max(0, current - Math.max(this.lastTickDt, 0.035) * 0.7);
          if (next <= 0.02) this.carrierPressureSeconds.delete(owner.id);
          else this.carrierPressureSeconds.set(owner.id, next);
        }
      }
      return;
    }

    // Loose ball — only one team can claim it per tick
    const intended = this.ball.intendedReceiverId
      ? this.playerRegistry.get(this.ball.intendedReceiverId)
      : null;
    const intendedDist = intended
      ? dist(intended.x, intended.y, this.ball.x, this.ball.y)
      : Infinity;

    const defensiveBoxContest =
      intended &&
      this.ball.intendedTeam &&
      this.time < this.ball.interceptionOpenTime &&
      this.players.some((p) => {
        if (p.team === intended.team || p.position === "GK") return false;
        const depth = p.team === "home" ? this.ball.x : 100 - this.ball.x;
        return (
          depth < HOME_BOX_MAX_X + 8 &&
          this.ball.y > BOX_MIN_Y - 8 &&
          this.ball.y < BOX_MAX_Y + 8 &&
          dist(p.x, p.y, this.ball.x, this.ball.y) <= INTERCEPT_RADIUS * 2.3
        );
      });

    const pendingPass = this.pendingPassStats;
    const designedAccuratePass = Boolean(pendingPass && pendingPass.expiresAt >= this.time && pendingPass.designedAccurate);
    const intendedReceiveRadius = intended
      ? firstTouchControlRadius(intended, this.ball, designedAccuratePass)
      : RECEIVE_RADIUS;
    const aerialReceiveRadius = this.ball.z > 0.32 ? 6.2 : intendedReceiveRadius;
    if (
      this.ball.z > 0.32 &&
      this.ball.intendedTeam &&
      this.ball.y > BOX_MIN_Y - 10 &&
      this.ball.y < BOX_MAX_Y + 10
    ) {
      const nearestAttacker = this.players
        .filter((p) => p.team === this.ball.intendedTeam && p.position !== "GK")
        .map((p) => ({ p, d: dist(p.x, p.y, this.ball.x, this.ball.y) }))
        .filter(({ p, d }) => d <= 6.6 && canPlayerReachBallHeight(p, this.ball))
        .sort((a, b) => a.d - b.d)[0]?.p;
      if (nearestAttacker && this.resolveAerialContest(nearestAttacker)) {
        return;
      }
    }
    if (intended && intendedDist <= aerialReceiveRadius && this.resolveAerialContest(intended)) {
      return;
    }

    if (intended && this.ball.intendedTeam) {
      const nearestDefender = this.players
        .filter((p) => p.team !== this.ball.intendedTeam && p.position !== "GK")
        .map((p) => ({ p, d: dist(p.x, p.y, this.ball.x, this.ball.y) }))
        .filter(({ p, d }) => d <= RECEIVE_RADIUS * 1.35 && canPlayerReachBallHeight(p, this.ball))
        .sort((a, b) => a.d - b.d)[0];
      if (
        nearestDefender &&
        nearestDefender.d + 0.75 < intendedDist &&
        Math.random() < clamp(
          0.16 +
            nearestDefender.p.reaction * 0.14 +
            nearestDefender.p.interceptions * 0.1 +
            Math.max(0, nearestDefender.p.strength - (intended?.strength ?? 0.58)) * 0.14 -
            (intended?.ballControl ?? 0.55) * 0.16 -
            (intended?.positioning ?? 0.55) * 0.12,
          0.1,
          0.38,
        )
      ) {
        this.claimLooseBall(nearestDefender.p);
        return;
      }
    }

    if (
      intended &&
      intendedDist <= intendedReceiveRadius &&
      !defensiveBoxContest &&
      canPlayerReachBallHeight(intended, this.ball)
    ) {
      if (this.ball.offsideReceiverId === intended.id) {
        this.awardOffside(intended);
        return;
      }
      this.claimLooseBall(intended);
      return;
    }

    const isKeeperClaimingOwnBox = (p: EnginePlayer): boolean => {
      if (p.position !== "GK") return false;
      const inOwnBox =
        p.team === "home"
          ? this.ball.x < HOME_BOX_MAX_X && this.ball.y > BOX_MIN_Y && this.ball.y < BOX_MAX_Y
          : this.ball.x > AWAY_BOX_MIN_X && this.ball.y > BOX_MIN_Y && this.ball.y < BOX_MAX_Y;
      return (
        inOwnBox &&
        this.ball.z <= playerReachHeight(p) &&
        Math.hypot(this.ball.vx, this.ball.vy) < 0.18 &&
        dist(p.x, p.y, this.ball.x, this.ball.y) < 4.5 + p.gkHandling * 2.4
      );
    };
    const isOutfieldDefendingOwnBox = (p: EnginePlayer): boolean => {
      if (p.position === "GK" || p.team === this.ball.intendedTeam) return false;
      const depth = p.team === "home" ? this.ball.x : 100 - this.ball.x;
      return (
        depth < HOME_BOX_MAX_X + 8 &&
        this.ball.y > BOX_MIN_Y - 8 &&
        this.ball.y < BOX_MAX_Y + 8
      );
    };

    const claimRadius =
      this.time < this.ball.interceptionOpenTime
        ? CONTROL_RADIUS * 0.75
        : this.ball.intendedTeam
          ? INTERCEPT_RADIUS
          : INTERCEPT_RADIUS * 1.55;
    const candidates = this.players
      .filter((p) => {
        if (isKeeperClaimingOwnBox(p)) return true;
        if (p.position === "GK" || p.id === this.ball.lastOwnerId) return false;
        if (
          this.time < this.ball.interceptionOpenTime &&
          this.ball.intendedTeam &&
          p.team !== this.ball.intendedTeam &&
          !isOutfieldDefendingOwnBox(p)
        ) {
          return dist(p.x, p.y, this.ball.x, this.ball.y) <= claimRadius;
        }
        return true;
      })
      .map((p) => {
        const boxClearanceRadius = isOutfieldDefendingOwnBox(p)
          ? INTERCEPT_RADIUS * 2.3
          : claimRadius;
        return {
          p,
          d: dist(p.x, p.y, this.ball.x, this.ball.y),
          radius: boxClearanceRadius,
        };
      })
      .filter(({ d, radius }) => d <= radius)
      .filter(({ p }) => canPlayerReachBallHeight(p, this.ball))
      .sort((a, b) => a.d - b.d);

    if (candidates.length >= 2) {
      const first = candidates[0];
      const second = candidates.find((candidate) => candidate.p.team !== first.p.team);
      if (second && Math.abs(first.d - second.d) < 0.42 && first.d < 1.75 && second.d < 1.95) {
        this.resolveLooseBallDuel(first.p, second.p);
        return;
      }
    }

    for (const { p, d, radius } of candidates) {
      if (this.ball.offsideReceiverId === p.id) {
        this.awardOffside(p);
        return;
      }
      const sameTeamPass = this.ball.intendedTeam === p.team;
      const earlyInterception = this.time < this.ball.interceptionOpenTime;
      const defendingOwnBox = isOutfieldDefendingOwnBox(p);
      const intendedReceiver = this.ball.intendedReceiverId
        ? this.playerRegistry.get(this.ball.intendedReceiverId)
        : null;
      const receiverQualityShield =
        intendedReceiver && intendedReceiver.team === this.ball.intendedTeam
          ? clamp(
              intendedReceiver.ballControl * 0.24 +
                intendedReceiver.positioning * 0.2 +
                intendedReceiver.composure * 0.12 +
                Math.max(0, intendedReceiver.strength - p.strength) * 0.22,
              0,
              0.34,
            )
          : 0;
      const baseChance =
        (p.reaction * 0.24 +
          p.defending * 0.26 +
          p.interceptions * 0.23 +
          p.positioning * 0.12 +
          p.tackling * 0.08 +
          p.overall * 0.07) *
        (d <= CONTROL_RADIUS ? 1 : defendingOwnBox ? 0.56 : 0.2);
      const chance =
        defendingOwnBox
          ? Math.max(baseChance * 0.72, 0.38 * (1 - d / Math.max(radius, 0.1)))
          : earlyInterception && !sameTeamPass
            ? Math.max(0.004, baseChance * 0.055 - receiverQualityShield * 1.08)
            : Math.max(0.008, baseChance * 0.5 - receiverQualityShield * 0.94);

      if (Math.random() < chance) {
        this.claimLooseBall(p);
        break;
      }
    }

    const ballStopped =
      Math.hypot(this.ball.vx, this.ball.vy) < 0.012 && this.ball.z <= 0.1;
    if (ballStopped && this.time >= this.ball.interceptionOpenTime + 0.15) {
      const nearest = this.players
        .filter((p) => p.position !== "GK")
        .map((p) => ({ p, d: dist(p.x, p.y, this.ball.x, this.ball.y) }))
        .sort((a, b) => a.d - b.d)[0];
      if (nearest && nearest.d <= 8) {
        this.claimLooseBall(nearest.p);
      }
    }
  }

  private resolveAerialContest(intended: EnginePlayer): boolean {
    if (
      this.ball.z < 0.32 ||
      !this.ball.intendedTeam ||
      this.ball.y <= BOX_MIN_Y - 10 ||
      this.ball.y >= BOX_MAX_Y + 10 ||
      !canPlayerReachBallHeight(intended, this.ball)
    ) {
      return false;
    }

    const contestRadius = 5.2;
    const candidates = this.players
      .filter((p) => p.position !== "GK" && p.id !== this.ball.lastOwnerId)
      .map((p) => {
        const d = dist(p.x, p.y, this.ball.x, this.ball.y);
        const ownsDefensiveBox =
          p.team !== this.ball.intendedTeam &&
          (p.team === "home" ? this.ball.x < HOME_BOX_MAX_X + 8 : this.ball.x > AWAY_BOX_MIN_X - 8);
        const intendedBonus = p.id === intended.id ? 0.1 : 0;
        const defensiveBonus = ownsDefensiveBox ? 0.13 : 0;
        return {
          p,
          d,
          score:
            playerAerialScore(p) +
            intendedBonus +
            defensiveBonus -
            Math.max(0, d - 1.2) * 0.115,
        };
      })
      .filter(({ d }) => d <= contestRadius)
      .sort((a, b) => b.score - a.score);

    const winner = candidates[0]?.p ?? null;
    if (!winner) return false;
    if (winner.team !== this.ball.intendedTeam) {
      this.headDefensiveClearance(winner);
      return true;
    }

    const winnerDistanceToBall = dist(winner.x, winner.y, this.ball.x, this.ball.y);
    if (this.isInOppositionBox(winner.team, this.ball.x, this.ball.y) && winnerDistanceToBall <= 2.25) {
      const goalX = this.attackingGoalX(winner.team);
      const aerialFinishChance = clamp(
        0.24 + playerAerialScore(winner) * 0.42 + winner.shooting * 0.18,
        0.22,
        0.72,
      );
      if (Math.random() < aerialFinishChance) {
        this.ball.ownerId = winner.id;
        this.ball.lastOwnerId = winner.id;
        this.ball.intendedReceiverId = null;
        this.ball.intendedTeam = null;
        this.ball.offsideReceiverId = null;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.z = 0.55;
        this.ball.vz = 0;
        this.ball.status = "GROUNDED";
        this.ball.flight = "ground";
        this.ball.controlOwnerId = winner.id;
        this.ball.controlOffsetX = this.ball.x - winner.x;
        this.ball.controlOffsetY = this.ball.y - winner.y;
        this.ball.controlState = "CLOSE_CONTROL";
        this.ball.lastTouchOwnerId = winner.id;
        this.ball.lastTouchTime = this.time;
        winner.hasBall = true;
        this.nextShotIsHeader = true;
        const shotTaken = this.shoot(winner, goalX);
        this.nextShotIsHeader = false;
        if (shotTaken) return true;
      }
    }

    this.claimLooseBall(winner);
    return true;
  }

  private claimLooseBall(p: EnginePlayer): void {
    const actualBallDistance = dist(p.x, p.y, this.ball.x, this.ball.y);
    const legalClaimRadius =
      this.ball.z > BALL_LOW_CONTROL_HEIGHT
        ? firstTouchControlRadius(p, this.ball, false) + 0.75
        : firstTouchControlRadius(p, this.ball, false) + 0.45;
    if (actualBallDistance > legalClaimRadius) {
      p.aiState = "INTERCEPT";
      p.hasBall = false;
      p.decisionCooldown = Math.min(p.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.5);
      steerTo(p, this.ball.x, this.ball.y, 1.18 + p.reaction * 0.24);
      updatePlayerFacingTowardPoint(p, this.ball.x, this.ball.y, this.attackDirection(p.team), 0, 0.045, 1.55);
      if (this.ball.ownerId === p.id) this.releaseOwnerToLoose(p, 0.04);
      return;
    }

    const prev = this.ball.lastOwnerId
      ? this.playerRegistry.get(this.ball.lastOwnerId)
      : null;
    const changedTeam = Boolean(prev && prev.team !== p.team);
    const pendingPass = this.pendingPassStats;
    const interceptedPass = Boolean(
      pendingPass &&
        pendingPass.expiresAt >= this.time &&
        this.ball.intendedTeam &&
        this.ball.intendedTeam !== p.team &&
        this.ball.intendedTeam === pendingPass.team &&
        p.position !== "GK",
    );
    const completedIntendedPass = Boolean(
      this.ball.intendedReceiverId === p.id && this.ball.intendedTeam === p.team,
    );
    const completedTeamPass = Boolean(
      pendingPass &&
        pendingPass.team === p.team &&
        pendingPass.expiresAt >= this.time &&
        this.ball.intendedTeam === p.team,
    );
    if (completedTeamPass) {
      this.creditCompletedPass(p);
    }
    const passWasDesignedAccurate =
      Boolean(pendingPass && pendingPass.designedAccurate && pendingPass.expiresAt >= this.time);
    const firstTouchOffsetX = clamp(this.ball.x - p.x, -2.35, 2.35);
    const firstTouchOffsetY = clamp(this.ball.y - p.y, -2.35, 2.35);
    if (Math.hypot(firstTouchOffsetX, firstTouchOffsetY) > 0.08) {
      const receiveFacing = normalize2D(firstTouchOffsetX, firstTouchOffsetY, this.attackDirection(p.team), 0);
      rotatePlayerFacingToward(
        p,
        receiveFacing.x,
        receiveFacing.y,
        this.attackDirection(p.team),
        0,
        completedIntendedPass ? 0.07 : 0.05,
        1.85,
      );
    }

    const nearestOpponent = this.nearestOpponentToPoint(p.team, this.ball.x, this.ball.y);
    const pressureAtReceiver = nearestOpponentDistance(
      p,
      this.players.filter((op) => op.team !== p.team && op.position !== "GK"),
    );
    const ballSpeed = Math.hypot(this.ball.vx, this.ball.vy);
    const tightControlRadius = clamp(
      0.5 +
        p.ballControl * 0.3 +
        p.reaction * 0.12 -
        Math.max(0, 4.4 - pressureAtReceiver) * 0.07 -
        (this.ball.z > BALL_LOW_CONTROL_HEIGHT ? 0.18 : 0),
      pressureAtReceiver < 2.6 ? 0.48 : 0.55,
      pressureAtReceiver < 3.8 ? 0.82 : 0.96,
    );
    const opponentClearlyCloser =
      Boolean(
        nearestOpponent &&
          nearestOpponent.distance + 0.18 < actualBallDistance &&
          actualBallDistance > tightControlRadius,
      );
    if (opponentClearlyCloser) {
      p.aiState = "INTERCEPT";
      p.hasBall = false;
      p.decisionCooldown = Math.min(p.decisionCooldown, 0.08);
      this.ball.ownerId = null;
      this.ball.controlOwnerId = undefined;
      this.ball.controlOffsetX = undefined;
      this.ball.controlOffsetY = undefined;
      this.ball.controlState = "CONTESTED";
      this.ball.interceptionOpenTime = this.time;
      steerTo(p, this.ball.x, this.ball.y, 1.12 + p.reaction * 0.28);
      if (nearestOpponent) {
        nearestOpponent.player.aiState = "INTERCEPT";
        steerTo(nearestOpponent.player, this.ball.x, this.ball.y, 1.18 + nearestOpponent.player.reaction * 0.3);
      }
      return;
    }

    const cleanFirstTouch =
      actualBallDistance <= tightControlRadius &&
      this.ball.z <= BALL_LOW_CONTROL_HEIGHT + 0.18 &&
      ballSpeed <= 0.21 + p.ballControl * 0.13 + (completedIntendedPass ? 0.06 : 0) &&
      pressureAtReceiver > 1.9;
    const firstTouchControlState: OwnerBallControlState = cleanFirstTouch
      ? "CLOSE_CONTROL"
      : "CHASING_OWN_TOUCH";
    const receiveDamping = cleanFirstTouch
      ? completedIntendedPass
        ? 0.22 + p.ballControl * 0.16
        : 0.12 + p.reaction * 0.1
      : completedIntendedPass
        ? 0.34 + p.ballControl * 0.12
        : 0.28 + p.reaction * 0.08;

    this.ball.ownerId = p.id;
    this.ball.lastOwnerId = p.id;
    this.ball.intendedReceiverId = null;
    this.ball.intendedTeam = null;
    this.ball.offsideReceiverId = null;
    this.ball.interceptionOpenTime = this.time;
    this.ball.vx *= receiveDamping;
    this.ball.vy *= receiveDamping;
    this.ball.z = 0;
    this.ball.vz = 0;
    this.ball.status = "GROUNDED";
    this.ball.flight = "ground";
    this.ball.controlOwnerId = p.id;
    this.ball.controlOffsetX = firstTouchOffsetX;
    this.ball.controlOffsetY = firstTouchOffsetY;
    this.ball.controlState = firstTouchControlState;
    this.ball.lastTouchOwnerId = p.id;
    this.ball.lastTouchTime = this.time;
    this.ownerForgetSeconds.delete(p.id);

    p.hasBall = true;
    if (firstTouchControlState === "CHASING_OWN_TOUCH") {
      p.aiState = "CHASE_OWN_TOUCH";
      p.targetX = this.ball.x;
      p.targetY = this.ball.y;
      p.dribbleTouchCooldown = clamp(0.04 + (1 - p.ballControl) * 0.05, 0.04, 0.12);
      steerTo(p, this.ball.x, this.ball.y, 1.12 + p.reaction * 0.28);
    } else {
      p.dribbleTouchCooldown = clamp(0.12 + (1 - p.ballControl) * 0.12, 0.12, 0.28);
    }
    this.addPlayerStat(p, "touches");
    if (this.isInOppositionBox(p.team, this.ball.x, this.ball.y)) {
      this.addTeamStat(p.team, "touchesInOppositionBox");
      this.addPlayerStat(p, "touchesInOppositionBox");
    }
    if (interceptedPass) {
      this.addTeamStat(p.team, "interceptions");
      this.addPlayerStat(p, "interceptions");
      if (passWasDesignedAccurate) this.registerPotentialError(p);
    }
    this.pendingPassStats = null;
    p.consecutivePasses = 0;
    const attackingDepth = this.attackingDepth(p.team, p.x);
    const firstTouchWindow =
      completedIntendedPass && attackingDepth > 68
        ? this.isInOppositionBox(p.team, p.x, p.y)
          ? 0.035
          : 0.08
        : this.nextCarryWindow(p);
    p.decisionCooldown =
      firstTouchControlState === "CHASING_OWN_TOUCH"
        ? Math.max(p.decisionCooldown, 0.08)
        : completedIntendedPass && attackingDepth > 68
          ? Math.min(p.decisionCooldown, firstTouchWindow)
          : Math.max(p.decisionCooldown, firstTouchWindow);
    this.possessionGraceUntil = this.time + FIRST_TOUCH_COOLDOWN;

    if (changedTeam) {
      p.possessionFlipCount = Math.min(p.possessionFlipCount + 1, 4);
      if (prev) prev.possessionFlipCount = Math.min(prev.possessionFlipCount + 1, 4);
      debugLog(`${p.name} WINS ball from ${prev?.name}`);
      if (this.tryEvent("tackle")) {
        this.emitEvent("tackle", p.team, `${p.name} recovered the ball`);
      }
    } else {
      p.possessionFlipCount = 0;
    }

    if (firstTouchControlState === "CLOSE_CONTROL" && this.isBallInOwnBox(p) && p.position !== "GK") {
      this.clearDefensiveBall(p);
    } else if (firstTouchControlState === "CLOSE_CONTROL" && p.possessionFlipCount >= 2) {
      p.decisionCooldown = 0;
    }
  }

  private headDefensiveClearance(p: EnginePlayer): void {
    const dir = this.attackDirection(p.team);
    const side = this.ball.y < 50 ? -1 : 1;
    const angle = Math.atan2(side * (14 + Math.random() * 18), dir * (34 + Math.random() * 16));
    const power = 0.24 + playerAerialScore(p) * 0.18;

    this.ball.ownerId = null;
    this.ball.lastOwnerId = p.id;
    this.ball.intendedReceiverId = null;
    this.ball.intendedTeam = null;
    this.ball.offsideReceiverId = null;
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.z = 0.42;
    this.ball.vz = 0.06;
    this.ball.status = "AIRBORNE";
    this.ball.flight = "lofted";
    this.ball.interceptionOpenTime = this.time + 0.14;
    p.hasBall = false;
    p.decisionCooldown = PASS_COOLDOWN;
    this.addTeamStat(p.team, "clearances");
    this.addPlayerStat(p, "clearances");
    this.emitEvent("tackle", p.team, `${p.name} heads the cross away`);
  }

  private isBallInOwnBox(p: EnginePlayer): boolean {
    return this.attacksRight(p.team)
      ? this.ball.x < HOME_BOX_MAX_X + 5 &&
          this.ball.y > BOX_MIN_Y - 7 &&
          this.ball.y < BOX_MAX_Y + 7
      : this.ball.x > AWAY_BOX_MIN_X - 5 &&
          this.ball.y > BOX_MIN_Y - 7 &&
          this.ball.y < BOX_MAX_Y + 7;
  }

  private clearDefensiveBall(p: EnginePlayer): void {
    const dir = this.attackDirection(p.team);
    const toTouchline = Math.random() < 0.32;
    const safeSide = p.y < 50 ? -1 : 1;
    const angle = toTouchline
      ? Math.atan2(safeSide * 42, dir * 28)
      : Math.atan2((Math.random() - 0.5) * 28, dir * 46);
    const power = 0.32 + p.passing * 0.16 + p.reaction * 0.08;
    const targetX = p.x + Math.cos(angle) * 18;
    const targetY = p.y + Math.sin(angle) * 18;

    if (!this.prepareStrikeTouch(p, targetX, targetY, "clearance")) {
      p.decisionCooldown = Math.max(p.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.75);
      return;
    }

    p.hasBall = false;
    p.decisionCooldown = PASS_COOLDOWN;
    this.shotInFlight = false;
    this.ball.ownerId = null;
    this.ball.lastOwnerId = p.id;
    this.ball.intendedReceiverId = null;
    this.ball.intendedTeam = null;
    this.ball.offsideReceiverId = null;
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.z = 0.18;
    this.ball.vz = 0.12;
    this.ball.status = "AIRBORNE";
    this.ball.flight = "driven";
    this.ball.interceptionOpenTime = this.time + 0.18;
    this.addTeamStat(p.team, "clearances");
    this.addPlayerStat(p, "clearances");
    this.addTeamStat(p.team, "duelsTotal");
    this.addTeamStat(p.team, "duelsWon");
    this.addPlayerStat(p, "aerialDuelsTotal");
    this.addPlayerStat(p, "aerialDuelsWon");
    this.addPlayerStat(p, "duelsTotal");
    this.addPlayerStat(p, "duelsWon");
  }

  private awardOffside(player: EnginePlayer): void {
    const defendingTeam = player.team === "home" ? "away" : "home";
    this.addTeamStat(player.team, "offsides");
    this.addPlayerStat(player, "offsides");
    this.players.forEach((p) => {
      p.hasBall = false;
      p.decisionCooldown = Math.max(p.decisionCooldown, FIRST_TOUCH_COOLDOWN);
    });
    this.ball.ownerId = null;
    this.ball.lastOwnerId = player.id;
    this.ball.intendedReceiverId = null;
    this.ball.intendedTeam = null;
    this.ball.offsideReceiverId = null;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.z = 0;
    this.ball.vz = 0;
    this.ball.status = "GROUNDED";
    this.ball.flight = "ground";
    this.emitEvent("free_kick", defendingTeam, `${player.name} was offside`);
    this.startSetPiece(
      "free_kick",
      defendingTeam,
      clamp(player.x, 6, 94),
      clamp(player.y, 8, 92),
    );
  }

  private nextCarryWindow(p: EnginePlayer): number {
    const opponents = this.players.filter((op) => op.team !== p.team);
    const pressureDist = nearestOpponentDistance(p, opponents);
    const carry = evaluateCarry(p, this.players, pressureDist);
    return carry.breakaway
      ? clamp(carry.cooldown, 0.16, 0.42)
      : clamp(carry.cooldown, FIRST_TOUCH_COOLDOWN, 0.34);
  }

  private checkGoals(): void {
    if ((this.ball.x >= 100 || this.ball.x <= 0) && this.resolveWoodwork()) {
      return;
    }

    const teamAttackingRight: "home" | "away" = this.attacksRight("home") ? "home" : "away";
    const teamAttackingLeft: "home" | "away" = teamAttackingRight === "home" ? "away" : "home";

    if (
      this.ball.y > GOAL_MIN_Y &&
      this.ball.y < GOAL_MAX_Y &&
      this.ball.z < GOAL_HEIGHT_M
    ) {
      if (this.ball.x >= 100 || this.ball.x <= 0) {
        const scoringTeam = this.ball.x >= 100 ? teamAttackingRight : teamAttackingLeft;
        const defendingTeam = scoringTeam === "home" ? "away" : "home";
        if (this.tryGoalkeeperSave(defendingTeam)) return;
        if (scoringTeam === "home") this.homeScore++;
        else this.awayScore++;
        this.ensureGoalStats(scoringTeam, scoringTeam === "home" ? this.homeScore : this.awayScore);
        this.emitEvent("goal", scoringTeam, `Goal! ${scoringTeam === "home" ? "Home" : "Away"} team scores!`);
        this.stoppageEndTime += 0.5;
        this.resetPositions();
        this.assignKickoff(defendingTeam);
        return;
      }
      if (this.ball.x >= 100) {
        if (this.tryGoalkeeperSave("away")) return;
        this.homeScore++;
        this.ensureGoalStats("home", this.homeScore);
        this.emitEvent("goal", "home", `⚽ GOAL! Home team scores!`);
        this.stoppageEndTime += 0.5;
        this.resetPositions();
        this.assignKickoff("away");
        return;
      }
      if (this.ball.x <= 0) {
        if (this.tryGoalkeeperSave("home")) return;
        this.awayScore++;
        this.ensureGoalStats("away", this.awayScore);
        this.emitEvent("goal", "away", `⚽ GOAL! Away team scores!`);
        this.stoppageEndTime += 0.5;
        this.resetPositions();
        this.assignKickoff("home");
        return;
      }
    }

    if (this.ball.x >= 100 || this.ball.x <= 0) {
      this.markPenaltyMissed();
      const attackingTeam = this.ball.x >= 100 ? teamAttackingRight : teamAttackingLeft;
      const defendingTeam = attackingTeam === "home" ? "away" : "home";
      const lastOwner = this.ball.lastOwnerId
        ? this.playerRegistry.get(this.ball.lastOwnerId)
        : null;

      if (lastOwner && lastOwner.team === defendingTeam) {
        // Defending team touched last → corner kick for attacking team
        const cornerX = this.attacksRight(attackingTeam) ? 98 : 2;
        const cornerY = this.ball.y < 50 ? 4 : 96;
        this.startSetPiece("corner_kick", attackingTeam, cornerX, cornerY);
      } else {
        // Attacking team touched last or no touch → goal kick
        this.startSetPiece(
          "goal_kick",
          defendingTeam,
          this.attacksRight(defendingTeam) ? 6 : 94,
          50,
        );
      }
    }
  }

  private ensureGoalStats(team: "home" | "away", goalsAfterScore: number): void {
    const teamStats = this.stats[team];
    this.creditErrorLeadingToGoal(team);
    if (!this.shotInFlight) {
      this.addTeamStat(team, "shotsTotal");
    }
    teamStats.shotsOnTarget = Math.max(teamStats.shotsOnTarget, goalsAfterScore);
    teamStats.shotsTotal = Math.max(teamStats.shotsTotal, teamStats.shotsOnTarget);
    const scorer = this.currentShot?.shooterId
      ? this.playerRegistry.get(this.currentShot.shooterId)
      : null;
    const defendingTeam = team === "home" ? "away" : "home";
    this.addTeamStat(defendingTeam, "goalsConceded");
    this.addPlayerStat(
      this.players.find((p) => p.team === defendingTeam && p.position === "GK"),
      "goalsConceded",
    );
    this.addPlayerStat(scorer, "goals");
    if (this.currentShot?.headed) this.addTeamStat(team, "headedGoals");
    if (this.currentShot?.penalty) this.addTeamStat(team, "penaltiesScored");
    const assister = this.currentShot?.assisterId
      ? this.playerRegistry.get(this.currentShot.assisterId)
      : scorer
        ? this.playerRegistry.get(this.lastPasserByReceiver.get(scorer.id) ?? "")
        : null;
    if (assister && assister.team === team && assister.id !== scorer?.id) {
      this.addPlayerStat(assister, "assists");
    }
    this.shotInFlight = false;
    this.currentShot = null;
  }

  private markPenaltyMissed(): void {
    if (!this.currentShot?.penalty) return;
    this.addTeamStat(this.currentShot.team, "penaltiesMissed");
    this.currentShot = { ...this.currentShot, penalty: false };
  }

  private resolveWoodwork(): boolean {
    const atAwayGoal = this.ball.x >= 100;
    const teamAttackingRight: "home" | "away" = this.attacksRight("home") ? "home" : "away";
    const attackingTeam: "home" | "away" = atAwayGoal
      ? teamAttackingRight
      : teamAttackingRight === "home" ? "away" : "home";
    const defendingTeam: "home" | "away" = attackingTeam === "home" ? "away" : "home";
    const inGoalMouth =
      this.ball.y > GOAL_MIN_Y - POST_COLLISION_RADIUS &&
      this.ball.y < GOAL_MAX_Y + POST_COLLISION_RADIUS;
    if (!inGoalMouth) return false;

    const hitsPost =
      this.ball.z < GOAL_HEIGHT_M &&
      (Math.abs(this.ball.y - GOAL_MIN_Y) <= POST_COLLISION_RADIUS ||
        Math.abs(this.ball.y - GOAL_MAX_Y) <= POST_COLLISION_RADIUS);
    const hitsCrossbar =
      this.ball.y > GOAL_MIN_Y &&
      this.ball.y < GOAL_MAX_Y &&
      Math.abs(this.ball.z - GOAL_HEIGHT_M) <= CROSSBAR_COLLISION_RADIUS;

    if (!hitsPost && !hitsCrossbar) return false;

    this.emitEvent(
      "shot",
      attackingTeam,
      hitsCrossbar ? "Shot hits the crossbar" : "Shot hits the post",
    );
    this.addTeamStat(attackingTeam, "hitWoodwork");

    const bouncesIn =
      Math.random() < (hitsPost ? 0.16 : 0.1) &&
      this.ball.y > GOAL_MIN_Y + 0.25 &&
      this.ball.y < GOAL_MAX_Y - 0.25;
    if (bouncesIn) {
      if (attackingTeam === "home") {
        this.homeScore++;
        this.ensureGoalStats("home", this.homeScore);
        this.emitEvent("goal", "home", `⚽ GOAL! Home team scores!`);
        this.resetPositions();
        this.assignKickoff("away");
      } else {
        this.awayScore++;
        this.ensureGoalStats("away", this.awayScore);
        this.emitEvent("goal", "away", `⚽ GOAL! Away team scores!`);
        this.resetPositions();
        this.assignKickoff("home");
      }
      this.stoppageEndTime += 0.5;
      return true;
    }

    const goesOut = Math.random() < (hitsCrossbar ? 0.32 : 0.38);
    if (goesOut) {
      this.startSetPiece(
        "goal_kick",
        defendingTeam,
        this.attacksRight(defendingTeam) ? 6 : 94,
        50,
      );
      return true;
    }

    const fieldDir = atAwayGoal ? -1 : 1;
    this.ball.x = atAwayGoal ? 99.1 : 0.9;
    this.ball.vx = fieldDir * (0.22 + Math.random() * 0.28);
    this.ball.vy =
      (this.ball.y < 50 ? 1 : -1) * (0.1 + Math.random() * 0.28);
    this.ball.z = Math.min(this.ball.z, GOAL_HEIGHT_M - 0.18);
    this.ball.vz = hitsCrossbar ? -0.18 : 0.05;
    this.ball.status = "AIRBORNE";
    this.ball.flight = "driven";
    this.ball.ownerId = null;
    this.ball.intendedReceiverId = null;
    this.ball.intendedTeam = null;
    this.ball.offsideReceiverId = null;
    this.ball.interceptionOpenTime = this.time;
    return true;
  }

  private updateStats(): void {
    const owner = this.players.find((p) => p.hasBall);
    if (owner) {
      this.possessionSamples[owner.team]++;
      this.periodPossessionSamples[this.currentPeriodKey()][owner.team]++;
    }

    const total = this.possessionSamples.home + this.possessionSamples.away;
    if (total > 0) {
      this.stats.home.possession = Math.round(
        (this.possessionSamples.home / total) * 100,
      );
      this.stats.away.possession = 100 - this.stats.home.possession;
    }

    (["firstHalf", "secondHalf"] as const).forEach((period) => {
      const samples = this.periodPossessionSamples[period];
      const periodTotal = samples.home + samples.away;
      if (periodTotal > 0) {
        this.stats[period].home.possession = Math.round((samples.home / periodTotal) * 100);
        this.stats[period].away.possession = 100 - this.stats[period].home.possession;
      }
    });

    const statGroups = [
      this.stats,
      this.stats.firstHalf,
      this.stats.secondHalf,
    ];
    statGroups.forEach((group) => {
      (["home", "away"] as const).forEach((t) => {
        const s = group[t];
        s.shotsTotal = Math.max(
          s.shotsTotal,
          s.shotsOnTarget + s.shotsOffTarget + s.blockedShots,
        );
        s.passesAccurate = Math.min(s.passesAccurate, s.passesTotal);
        s.finalThirdPassesAccurate = Math.min(s.finalThirdPassesAccurate, s.finalThirdPassesTotal);
        s.longPassesAccurate = Math.min(s.longPassesAccurate, s.longPassesTotal);
        s.crossesAccurate = Math.min(s.crossesAccurate, s.crossesTotal);
        s.tacklesWon = Math.min(s.tacklesWon, s.tacklesTotal);
        s.duelsWon = Math.min(s.duelsWon, s.duelsTotal);
        s.passAccuracy =
          s.passesTotal > 0
            ? Math.round((s.passesAccurate / s.passesTotal) * 100)
            : 0;
        s.goalsPrevented = Number((s.xGOTFaced - s.goalsConceded).toFixed(2));
      });
    });

    this.players.forEach((p) => {
      const ps = p.matchStats;
      ps.minutesPlayed = Math.max(ps.minutesPlayed, Math.floor(this.time));
      ps.totalShots = Math.max(ps.totalShots, ps.shotsOnTarget + ps.shotsOffTarget + ps.blockedShots);
      ps.accuratePasses = Math.min(ps.accuratePasses, ps.totalPasses);
      ps.finalThirdPassesAccurate = Math.min(ps.finalThirdPassesAccurate, ps.finalThirdPassesTotal);
      ps.longPassesAccurate = Math.min(ps.longPassesAccurate, ps.longPassesTotal);
      ps.crossesAccurate = Math.min(ps.crossesAccurate, ps.crossesTotal);
      ps.duelsWon = Math.min(ps.duelsWon, ps.duelsTotal);
      ps.aerialDuelsWon = Math.min(ps.aerialDuelsWon, ps.aerialDuelsTotal);
      ps.groundDuelsWon = Math.min(ps.groundDuelsWon, ps.groundDuelsTotal);
      ps.tacklesWon = Math.min(ps.tacklesWon, ps.tacklesTotal);
      ps.goalsPrevented = Number((ps.xGOTFaced - ps.goalsConceded).toFixed(2));
      const passPenalty =
        ps.totalPasses > 0 ? Math.max(0, 0.84 - ps.accuratePasses / ps.totalPasses) * 0.55 : 0;
      const rating =
        6 +
        ps.goals * 0.85 +
        ps.assists * 0.45 +
        ps.expectedGoals * 0.24 +
        ps.expectedAssists * 0.18 +
        ps.keyPasses * 0.07 +
        ps.goalkeeperSaves * 0.16 +
        ps.tacklesWon * 0.08 +
        ps.interceptions * 0.07 +
        ps.clearances * 0.045 +
        ps.duelsWon * 0.025 -
        ps.bigChancesMissed * 0.28 -
        ps.errorsLeadingToGoal * 1.15 -
        ps.errorsLeadingToShot * 0.45 -
        passPenalty;
      ps.rating = Number(clamp(rating, 4.8, 10).toFixed(1));
    });
  }

  private checkSubstitutions(): void {
    (["home", "away"] as const).forEach((team) => {
      const q = this.subModule.queue(this.players, team, Math.floor(this.time));
      if (
        q &&
        !this.pendingSubstitutions.some((s) => s.playerOutId === q.playerOutId)
      ) {
        this.pendingSubstitutions.push(q);
      }
    });
  }

  private maybeCommitFoul(): void {
    const owner = this.ball.ownerId
      ? this.playerRegistry.get(this.ball.ownerId)
      : null;
    if (!owner) return;
    const challengers = this.players
      .filter((p) => p.team !== owner.team && p.position !== "GK")
      .map((p) => ({ p, d: dist(p.x, p.y, owner.x, owner.y) }))
      .sort((a, b) => a.d - b.d);
    const nearest = challengers[0];
    const ownerInBox = this.isInOppositionBox(owner.team, owner.x, owner.y);
    if (!nearest || nearest.d > TACKLE_RADIUS * (ownerInBox ? 2.25 : 1.55)) return;

    const desperation =
      (ownerInBox ? 0.95 : 0) +
      Math.max(0, owner.speed - nearest.p.speed) * 0.35 +
      Math.max(0, owner.ballControl - nearest.p.reaction) * 0.25;
    const foulChance =
      (0.0017 + this.referee.rigidity * 0.0019 + desperation * 0.0016 + (ownerInBox ? 0.0013 : 0)) *
      this.speed *
      Math.max(0.35, 1 - owner.ballControl * 0.45);
    if (Math.random() > foulChance) return;
    if (!this.tryEvent("foul")) return;
    const fouler = nearest.p;
    const team = fouler.team;
    const restartTeam = owner.team;
    this.addTeamStat(team, "fouls");
    this.addPlayerStat(fouler, "foulsCommitted");
    this.addPlayerStat(owner, "foulsSuffered");

    const promisingAttack =
      this.isInOppositionBox(owner.team, owner.x, owner.y) ||
      this.attackingDepth(owner.team, owner.x) > 70;
    const severe = Math.random() < 0.012 + this.referee.cardStrictness * 0.022 + desperation * 0.012;
    const yellowChance =
      0.13 +
      this.referee.cardStrictness * 0.24 +
      (promisingAttack ? 0.16 : 0) +
      desperation * 0.08;
    if (severe) {
      this.addTeamStat(team, "redCards");
      this.addPlayerStat(fouler, "redCards");
      this.emitEvent("red_card", team, `${fouler.name} is sent off`);
    } else if (Math.random() < yellowChance) {
      this.addTeamStat(team, "yellowCards");
      this.addPlayerStat(fouler, "yellowCards");
      this.emitEvent("yellow_card", team, `${fouler.name} is booked`);
    }
    this.stoppageEndTime += 0.25;
    this.emitEvent("foul", team, `${fouler.name} fouls ${owner.name}`);

    const penaltyFoul =
      ownerInBox &&
      Math.random() < 0.82 + this.referee.penaltyStrictness * 0.14;
    if (penaltyFoul) {
      this.addTeamStat(restartTeam, "penaltiesWon");
      const penaltyX = this.attacksRight(restartTeam) ? 100 - pitchX(11) : pitchX(11);
      this.startSetPiece(
        "penalty",
        restartTeam,
        penaltyX,
        50,
      );
    } else {
      this.startSetPiece("free_kick", restartTeam, owner.x, owner.y);
    }
  }

  private tryGoalkeeperSave(team: "home" | "away"): boolean {
    const keeper = this.players.find(
      (p) => p.team === team && p.position === "GK",
    );
    if (!keeper) return false;
    const keeperDepth = this.attacksRight(team) ? keeper.x : 100 - keeper.x;
    if (keeperDepth > HOME_BOX_MAX_X + 3) return false;
    const depthPositioning = clamp(1 - Math.max(0, keeperDepth - 8) / 12, 0.25, 1);
    const lateralDist = Math.abs(keeper.y - this.ball.y);
    const diveReach = 2.4 + keeper.reaction * 3.1;
    const desperateReach = diveReach + 1.0;
    const rawSaveChance =
      (keeper.overall * 0.44 +
        keeper.reaction * 0.3 +
        keeper.strength * 0.18 -
        this.ball.z * 0.08) *
      depthPositioning *
      clamp(1 - Math.max(0, lateralDist - diveReach) / 1.6, 0.18, 1);
    const saveChance = this.currentShot?.penalty
      ? clamp(rawSaveChance * 0.1, 0.025, 0.095)
      : clamp(rawSaveChance, 0.08, 0.82);
    if (
      lateralDist <= desperateReach &&
      Math.random() < saveChance
    ) {
      this.markPenaltyMissed();
      const catchReach = 1.25 + keeper.gkHandling * 1.75;
      const catchPositioning = clamp(1 - lateralDist / Math.max(catchReach, 0.1), 0, 1);
      const catchChance = clamp(
        (keeper.gkHandling * 0.5 + keeper.strength * 0.16 + 0.12) *
          catchPositioning *
          (this.ball.z < 1.0 ? 1 : 0.55),
        0,
        0.78,
      );
      if (Math.random() < catchChance) {
        this.emitEvent("save", team, `${keeper.name} catches the ball`);
        this.ball.ownerId = keeper.id;
        this.ball.lastOwnerId = keeper.id;
        this.ball.intendedReceiverId = null;
        this.ball.intendedTeam = null;
        this.ball.offsideReceiverId = null;
        this.ball.interceptionOpenTime = this.time;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.z = 0;
        this.ball.vz = 0;
        this.ball.status = "CONTROLLED";
        this.ball.flight = "ground";
        this.ball.controlOwnerId = keeper.id;
        this.ball.controlOffsetX = this.ball.x - keeper.x;
        this.ball.controlOffsetY = this.ball.y - keeper.y;
        this.ball.controlState = "KEEPER_CLAIMABLE";
        this.ball.lastTouchOwnerId = keeper.id;
        this.ball.lastTouchTime = this.time;
        keeper.hasBall = true;
        keeper.decisionCooldown = 0.5;
        this.addTeamStat(keeper.team, "goalkeeperSaves");
        this.addPlayerStat(keeper, "goalkeeperSaves");
      } else {
        this.emitEvent("save", team, `${keeper.name} palms the ball away`);
        const isHome = keeper.team === "home";
        const outForCorner =
          lateralDist > catchReach + 0.6 || Math.random() < 0.36;
        const dir = outForCorner ? (isHome ? -1 : 1) : isHome ? 1 : -1;
        const palmWide = lateralDist > catchReach || Math.random() < 0.78;
        this.ball.vx = dir * (0.16 + Math.random() * (outForCorner ? 0.24 : 0.18));
        this.ball.vy = palmWide
          ? (this.ball.y < 50 ? -0.5 : 0.5) * (0.36 + Math.random() * 0.48)
          : (Math.random() - 0.5) * 0.4;
        this.ball.z = 0.2 + Math.random() * 0.3;
        this.ball.vz = 0.1;
        this.ball.status = "AIRBORNE";
        this.ball.flight = "driven";
        this.ball.ownerId = null;
        this.ball.lastOwnerId = keeper.id;
        this.ball.intendedReceiverId = null;
        this.ball.intendedTeam = null;
        this.ball.offsideReceiverId = null;
        this.ball.interceptionOpenTime = this.time;
        keeper.decisionCooldown = 0.4;
        this.addTeamStat(keeper.team, "goalkeeperSaves");
        this.addPlayerStat(keeper, "goalkeeperSaves");
        this.addPlayerStat(keeper, "punches");
      }
      return true;
    }
    return false;
  }

  private restartTeamFromLastTouch(): "home" | "away" {
    const last = this.ball.lastOwnerId
      ? this.playerRegistry.get(this.ball.lastOwnerId)
      : null;
    return last?.team === "home" ? "away" : "home";
  }

  private assignKickoff(team: "home" | "away"): void {
    this.shotInFlight = false;
    this.currentShot = null;
    this.setPiece = null;
    this.ball.x = 50;
    this.ball.y = 50;
    this.ball.z = 0;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.vz = 0;
    this.ball.status = "GROUNDED";
    this.ball.flight = "ground";
    this.ball.intendedReceiverId = null;
    this.ball.intendedTeam = null;
    this.ball.offsideReceiverId = null;
    this.ball.interceptionOpenTime = this.time;
    this.players.forEach((p) => {
      p.hasBall = false;
      p.vx = 0;
      p.vy = 0;
    });
    const taker = this.players
      .filter((p) => p.team === team && p.position !== "GK")
      .sort((a, b) => Math.abs(a.baseX - 50) - Math.abs(b.baseX - 50))[0];
    const target = taker
      ? this.players
          .filter((p) => p.team === team && p.id !== taker.id && p.position !== "GK")
          .map((p) => {
            const attackingRight = this.attacksRight(team);
            const backward = attackingRight ? p.x < 50 : p.x > 50;
            return {
              p,
              score:
                (backward ? 18 : 0) -
                Math.abs(p.y - 50) * 0.22 -
                Math.abs((attackingRight ? 44 : 56) - p.x) * 0.3 +
                (getPlayerLine(p) === "MF" ? 5 : getPlayerLine(p) === "DF" ? 3 : 0),
            };
          })
          .sort((a, b) => b.score - a.score)[0]?.p ?? null
      : null;

    if (taker) {
      this.ball.ownerId = taker.id;
      this.ball.lastOwnerId = taker.id;
      this.ball.status = "CONTROLLED";
      this.ball.flight = "ground";
      taker.hasBall = true;
      taker.decisionCooldown = 0;
      this.possessionGraceUntil = this.time + FIRST_TOUCH_COOLDOWN;
      taker.x = this.attacksRight(team) ? 49 : 51;
      taker.y = 50;
      taker.targetX = taker.x;
      taker.targetY = taker.y;
      taker.aiState = "SET_PIECE";
      if (target) {
        target.x = this.attacksRight(team) ? 44.5 : 55.5;
        target.y = target.baseY < 50 ? 45.5 : target.baseY > 50 ? 54.5 : 50;
        target.vx = 0;
        target.vy = 0;
        target.targetX = target.x;
        target.targetY = target.y;
      }
      this.pendingKickoff = {
        team,
        takerId: taker.id,
        targetId: target?.id ?? null,
        expiresAt: this.time + 1.4,
      };
    } else {
      this.pendingKickoff = null;
    }

    const centerCircleRadius = pitchX(9.15);
    this.players.forEach((p) => {
      if (p.team === team || p.position === "GK") return;
      const dx = p.x - 50;
      const dy = p.y - 50;
      const d = Math.hypot(dx, dy);
      if (d >= centerCircleRadius + 1.2) return;
      const angle = d > 0.01 ? Math.atan2(dy, dx) : p.baseY < 50 ? -Math.PI / 2 : Math.PI / 2;
      const push = centerCircleRadius + 1.6;
      p.x = clamp(50 + Math.cos(angle) * push, 35, 65);
      p.y = clamp(50 + Math.sin(angle) * push, 32, 68);
      p.targetX = p.x;
      p.targetY = p.y;
      p.vx = 0;
      p.vy = 0;
    });
  }

  private executePendingKickoffPass(): void {
    const kickoff = this.pendingKickoff;
    if (!kickoff) return;
    if (kickoff.expiresAt < this.time) {
      this.pendingKickoff = null;
      return;
    }
    const taker = this.playerRegistry.get(kickoff.takerId);
    const target = kickoff.targetId ? this.playerRegistry.get(kickoff.targetId) : null;
    if (!taker || !target || this.ball.ownerId !== taker.id || this.phase === "KICK_OFF") return;

    this.syncControlledBall(taker, 0.016, true);
    this.pendingKickoff = null;
    if (!this.pass(taker, target, true)) {
      taker.decisionCooldown = 0;
    }
  }

  private startSetPiece(
    type: SetPieceType,
    team: "home" | "away",
    x: number,
    y: number,
  ): void {
    this.restartPhase =
      this.activeHalf === "SECOND_HALF" ? "SECOND_HALF" : "FIRST_HALF";
    this.phase = "SET_PIECE";
    this.shotInFlight = false;
    this.currentShot = null;
    this.ball = {
      x: clamp(x, 2, 98),
      y: clamp(y, 2, 98),
      vx: 0,
      vy: 0,
      z: 0,
      vz: 0,
      status: "GROUNDED",
      flight: "ground",
      ownerId: null,
      lastOwnerId: this.ball.lastOwnerId,
      intendedReceiverId: null,
      intendedTeam: null,
      offsideReceiverId: null,
      interceptionOpenTime: this.time,
    };
    this.players.forEach((p) => {
      p.hasBall = false;
      p.decisionCooldown = Math.max(p.decisionCooldown, FIRST_TOUCH_COOLDOWN);
    });
    const taker = this.findRestartTaker(team, this.ball.x, this.ball.y, type);
    this.setPiece = {
      type,
      team,
      x: this.ball.x,
      y: this.ball.y,
      takerId: taker?.id ?? null,
      startedAt: this.time,
      elapsed: 0,
      timer:
        type === "free_kick"
          ? this.freeKickSetupTime(team, this.ball.x, this.ball.y)
          : type === "corner_kick"
            ? 2.1
            : type === "penalty"
              ? 1.2
              : type === "throw_in"
                ? 1.15
                : 0.7,
    };
    if (taker) {
      if (type === "corner_kick" || type === "throw_in" || type === "free_kick") {
        taker.targetX = this.ball.x;
        taker.targetY = this.ball.y;
      } else {
        taker.x = this.ball.x;
        taker.y = this.ball.y;
        taker.targetX = type === "goal_kick"
          ? this.ball.x + this.attackDirection(team) * 12
          : this.ball.x;
        taker.targetY = this.ball.y;
      }
      taker.vx = 0;
      taker.vy = 0;
      if (type === "goal_kick") {
        taker.facingX = this.attackDirection(team);
        taker.facingY = 0;
      }
      taker.aiState = "SET_PIECE";
    }
    if (type === "goal_kick") {
      this.prepareGoalKickShape(team);
    } else if (type === "corner_kick") {
      this.prepareCornerShape(team, this.ball.x, this.ball.y, taker?.id ?? null);
    } else if (type === "throw_in") {
      this.prepareThrowInShape(team, this.ball.x, this.ball.y, taker?.id ?? null);
    } else if (type === "free_kick") {
      this.prepareFreeKickShape(team, this.ball.x, this.ball.y, taker?.id ?? null);
    }
    if (type === "corner_kick") this.addTeamStat(team, "cornerKicks");
    if (type === "throw_in") this.addTeamStat(team, "throwIns");
    if (type === "free_kick") this.addTeamStat(team, "freeKicks");
    this.emitEvent(
      type,
      team,
      type === "throw_in"
        ? "Throw-in"
        : type === "free_kick"
          ? "Free kick"
          : type === "corner_kick"
            ? "Corner kick"
            : type === "penalty"
              ? "Penalty"
              : "Goal kick",
    );
  }

  private selectCornerShortOption(taker: EnginePlayer): EnginePlayer | null {
    return (
      this.players
        .filter((p) => p.team === taker.team && p.id !== taker.id && p.position !== "GK")
        .map((p) => ({ p, d: dist(p.x, p.y, taker.x, taker.y) }))
        .filter(({ p, d }) => d > 5 && d < 18 && (p.y < 50) === (taker.y < 50))
        .sort((a, b) => a.d - b.d)[0]?.p ?? null
    );
  }

  private cornerDelivery(
    taker: EnginePlayer,
    target: EnginePlayer,
    label: "corner" | "free kick" = "corner",
  ): boolean {
    if (!this.tryEvent("cross")) return false;
    const attackingRight = this.attacksRight(taker.team);
    const targetX = clamp(
      target.x + (attackingRight ? 1.2 : -1.2) + (Math.random() - 0.5) * 3,
      attackingRight ? 82 : 6,
      attackingRight ? 97 : 18,
    );
    const targetY = clamp(target.y + (Math.random() - 0.5) * 4, BOX_MIN_Y - 4, BOX_MAX_Y + 4);
    const d = dist(taker.x, taker.y, targetX, targetY);
    const accurate = Math.random() < clamp(0.36 + taker.crossing * 0.46 + taker.passing * 0.16, 0.34, 0.86);
    const angle = Math.atan2(targetY - taker.y, targetX - taker.x);
    const power = 0.28 + Math.min(d, 54) * 0.01 + taker.crossing * 0.16;
    const deliveryCurve = curveVector(angle, taker, "cross");

    taker.hasBall = false;
    this.shotInFlight = false;
    this.ball.ownerId = null;
    this.ball.lastOwnerId = taker.id;
    this.ball.intendedReceiverId = target.id;
    this.ball.intendedTeam = taker.team;
    this.ball.offsideReceiverId = null;
    taker.lastPassTargetId = target.id;
    taker.consecutivePasses++;
    taker.possessionFlipCount = 0;
    this.recordPassStats(taker, target, accurate, "cross");
    this.rememberPassContext(taker, "cross", accurate, true);
    this.ball.x = taker.x + Math.cos(angle) * 1.0;
    this.ball.y = taker.y + Math.sin(angle) * 1.0;
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.curveX = deliveryCurve.curveX;
    this.ball.curveY = deliveryCurve.curveY;
    this.ball.z = 0.62;
    this.ball.vz = 0.24 + taker.crossing * 0.09;
    this.ball.status = "AIRBORNE";
    this.ball.flight = "lofted";
    this.ball.interceptionOpenTime = this.time + clamp(d / 145, 0.18, 0.42);
    target.aiState = "INTERCEPT";
    target.targetX = targetX;
    target.targetY = targetY;
    target.decisionCooldown = Math.min(target.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.55);
    steerTo(target, targetX, targetY, 1.18);
    primeReceiverForIncomingBall(target, this.ball, this.attackDirection(target.team));
    this.emitEvent("cross", taker.team, `${taker.name} delivers the ${label} toward ${target.name}`);
    return true;
  }

  private updateSetPiece(dt: number): void {
    if (!this.setPiece) {
      this.phase = this.restartPhase;
      return;
    }

    this.players.forEach((p) => {
      if (p.id === this.setPiece?.takerId) {
        steerTo(p, this.setPiece.x, this.setPiece.y, this.setPiece.type === "corner_kick" ? 1.15 : 0.95);
        applyMovement(p, dt);
        if (this.setPiece.type === "goal_kick") {
          rotatePlayerFacingToward(p, this.attackDirection(p.team), 0, this.attackDirection(p.team), 0, dt, 1.7);
        } else {
          updatePlayerFacing(p, this.attackDirection(p.team), 0, dt);
        }
        return;
      }
      if (this.setPiece?.type === "goal_kick") {
        this.moveInGoalKickShape(p, this.setPiece.team);
      } else if (this.setPiece?.type === "corner_kick") {
        this.moveInCornerShape(
          p,
          this.setPiece.team,
          this.setPiece.x,
          this.setPiece.y,
        );
      } else if (this.setPiece?.type === "free_kick") {
        this.moveInFreeKickShape(
          p,
          this.setPiece.team,
          this.setPiece.x,
          this.setPiece.y,
        );
      } else if (this.setPiece?.type === "throw_in") {
        this.moveInThrowInShape(
          p,
          this.setPiece.team,
          this.setPiece.x,
          this.setPiece.y,
          this.setPiece.takerId,
        );
      } else {
        returnToShape(p, this.ball, this.players);
      }
      applyMovement(p, dt);
      updatePlayerFacing(p, this.attackDirection(p.team), 0, dt);
    });

    this.setPiece.elapsed += dt;
    this.setPiece.timer -= dt;
    if (this.setPiece.timer > 0) return;

    const taker = this.setPiece.takerId
      ? this.playerRegistry.get(this.setPiece.takerId)
      : null;
    const target = taker
      ? this.selectRestartTarget(taker, this.setPiece.type)
      : null;
    if (taker) {
      const takerDist = dist(taker.x, taker.y, this.setPiece.x, this.setPiece.y);
      const opponentsClearForGoalKick =
        this.setPiece.type !== "goal_kick" ||
        !this.players.some((p) => {
          if (p.team === this.setPiece?.team) return false;
          return this.setPiece && this.attacksRight(this.setPiece.team) ? p.x < 31 : p.x > 69;
        });
      const opponentsClearForThrowIn =
        this.setPiece.type !== "throw_in" ||
        !this.players.some((p) => {
          if (p.team === this.setPiece?.team || p.position === "GK" || !this.setPiece) return false;
          return dist(p.x, p.y, this.setPiece.x, this.setPiece.y) < 5.8;
        });
      const waitedLongEnough =
        this.time - this.setPiece.startedAt > SET_PIECE_MAX_WAIT ||
        this.setPiece.elapsed > SET_PIECE_MAX_WAIT;
      const throwInMustResolve =
        this.setPiece.type === "throw_in" && this.setPiece.elapsed > 3.2 && Boolean(target);
      const throwInTargetReady =
        this.setPiece.type !== "throw_in" ||
        (target ? this.isSafeThrowInTarget(taker, target, waitedLongEnough) : false);
      if (
        (takerDist > SET_PIECE_TAKER_RADIUS || !opponentsClearForGoalKick || !opponentsClearForThrowIn) &&
        !throwInMustResolve &&
        !waitedLongEnough
      ) {
        this.setPiece.timer = 0;
        return;
      }
      if (
        takerDist > SET_PIECE_TAKER_RADIUS &&
        this.setPiece.elapsed > SET_PIECE_MAX_WAIT + 1.1
      ) {
        steerTo(taker, this.setPiece.x, this.setPiece.y, 1.35);
        applyMovement(taker, dt);
        updatePlayerFacing(taker, this.attackDirection(taker.team), 0, dt);
        this.setPiece.timer = 0;
        return;
      }
      if (takerDist > SET_PIECE_TAKER_RADIUS && waitedLongEnough && !throwInMustResolve) {
        steerTo(taker, this.setPiece.x, this.setPiece.y, 1.18);
        applyMovement(taker, dt);
        updatePlayerFacing(taker, this.attackDirection(taker.team), 0, dt);
        this.setPiece.timer = 0;
        return;
      }
      if (this.setPiece.type === "throw_in" && (!target || !throwInTargetReady) && !waitedLongEnough) {
        this.prepareThrowInShape(taker.team, this.setPiece.x, this.setPiece.y, taker.id);
        this.setPiece.timer = 0.12;
        return;
      }
      this.ball.x = this.setPiece.x;
      this.ball.y = this.setPiece.y;
      if (this.setPiece.type === "penalty") {
        this.ball.x = this.setPiece.x;
        this.ball.y = this.setPiece.y;
        this.ball.ownerId = taker.id;
        this.ball.status = "CONTROLLED";
        this.ball.flight = "ground";
        taker.hasBall = true;
        this.nextShotIsPenalty = true;
        this.shoot(taker, this.attackingGoalX(taker.team));
        this.nextShotIsPenalty = false;
      } else if (target) {
        if (this.setPiece.type === "throw_in") {
          this.executeThrowIn(taker, target);
        } else if (this.setPiece.type === "corner_kick") {
          const short = this.selectCornerShortOption(taker);
          if (short && Math.random() < 0.16) {
            this.pass(taker, short, true);
          } else {
            this.cornerDelivery(taker, target);
          }
        } else if (
          this.setPiece.type === "free_kick"
        ) {
          const mode = this.freeKickMode(taker.team, this.setPiece.x, this.setPiece.y);
          const directChance = clamp(
            0.22 + taker.shooting * 0.2 + taker.curve * 0.16 - this.goalDistance(taker.team, this.setPiece.x, this.setPiece.y) * 0.006,
            0.12,
            0.56,
          );
          if (mode === "direct" && Math.random() < directChance) {
            this.ball.ownerId = taker.id;
            this.ball.status = "CONTROLLED";
            this.ball.flight = "ground";
            taker.hasBall = true;
            this.shoot(taker, this.attackingGoalX(taker.team));
          } else if (mode !== "quick") {
            this.cornerDelivery(taker, target, "free kick");
          } else {
            this.pass(taker, target, true);
          }
        } else {
          this.pass(taker, target, this.setPiece.type === "goal_kick");
        }
      } else {
        const fallback = this.selectEmergencyRestartTarget(taker);
        if (
          this.setPiece.type === "throw_in" &&
          fallback &&
          (this.isSafeThrowInTarget(taker, fallback, true) || waitedLongEnough)
        ) {
          this.executeThrowIn(taker, fallback);
        } else if (this.setPiece.type === "throw_in") {
          this.setPiece.timer = 0;
          return;
        } else {
          this.ball.ownerId = taker.id;
          this.ball.status = "CONTROLLED";
          this.ball.flight = "ground";
          taker.hasBall = true;
        }
      }
    }

    this.phase = this.restartPhase;
    this.setPiece = null;
  }

  private prepareGoalKickShape(team: "home" | "away"): void {
    const ownGoalLeft = this.attacksRight(team);
    const defendingLine = ownGoalLeft ? 30 : 70;
    const receivingLine = ownGoalLeft ? 24 : 76;
    const keeper = this.players.find((p) => p.team === team && p.position === "GK");
    if (keeper) {
      keeper.facingX = this.attackDirection(team);
      keeper.facingY = 0;
    }

    this.players.forEach((p) => {
      if (p.team !== team) {
        p.targetX = clamp(
          ownGoalLeft ? Math.max(p.x, defendingLine) : Math.min(p.x, defendingLine),
          ownGoalLeft ? defendingLine : 2,
          ownGoalLeft ? 98 : defendingLine,
        );
        p.targetY = clamp(p.baseY + (p.y < 50 ? -4 : 4), 12, 88);
        p.aiState = "RETURN";
        return;
      }

      if (p.position === "GK") return;
      p.targetX = clamp(
        p.baseX * 0.55 + receivingLine * 0.45,
        ownGoalLeft ? 12 : 56,
        ownGoalLeft ? 44 : 88,
      );
      p.targetY = clamp(p.baseY, 12, 88);
      p.aiState = "SUPPORT";
    });
  }

  private moveInGoalKickShape(p: EnginePlayer, team: "home" | "away"): void {
    const ownGoalLeft = this.attacksRight(team);

    if (p.team !== team) {
      const holdX = ownGoalLeft ? Math.max(p.x, 31) : Math.min(p.x, 69);
      const targetX = clamp(
        Math.max(0, p.baseX - (ownGoalLeft ? 0 : 8)),
        ownGoalLeft ? 31 : 8,
        ownGoalLeft ? 92 : 69,
      );
      const targetY = clamp(p.baseY + (p.baseY < 50 ? -3 : 3), 10, 90);
      p.aiState = "RETURN";
      steerTo(
        p,
        ownGoalLeft ? Math.max(holdX, targetX) : Math.min(holdX, targetX),
        targetY,
        0.8,
      );
      return;
    }

    if (p.position === "GK") return;
    const outletX = ownGoalLeft
      ? clamp(p.baseX * 0.45 + 25 * 0.55, 14, 48)
      : clamp(p.baseX * 0.45 + 75 * 0.55, 52, 86);
    const outletY = clamp(p.baseY + (p.baseY < 50 ? -5 : 5), 10, 90);
    p.aiState = "SUPPORT";
    steerTo(p, outletX, outletY, 0.75);
  }

  private prepareCornerShape(
    team: "home" | "away",
    cornerX: number,
    cornerY: number,
    takerId: string | null,
  ): void {
    this.players.forEach((p) => {
      if (p.position === "GK" || p.id === takerId) return;
      this.moveInCornerShape(p, team, cornerX, cornerY);
    });
  }

  private moveInCornerShape(
    p: EnginePlayer,
    team: "home" | "away",
    cornerX: number,
    cornerY: number,
  ): void {
    const attackingRight = this.attacksRight(team);
    const defendingGoalX = attackingRight ? 0 : 100;
    const nearSide = cornerY < 50 ? -1 : 1;
    const attackDepth = attackingRight ? (x: number) => 100 - x : (x: number) => x;
    const isAttacker = p.team === team;
    const line = getPlayerLine(p);

    if (isAttacker) {
      const shortOption =
        line !== "FW" &&
        ((cornerY < 50 && p.baseY < 42) || (cornerY > 50 && p.baseY > 58));
      const boxRole = line === "FW" || line === "MF" || p.position === "CB";
      let targetX: number;
      let targetY: number;

      if (shortOption && attackDepth(p.baseX) > 34) {
        targetX = attackingRight ? cornerX - 8 : cornerX + 8;
        targetY = clamp(cornerY - nearSide * 9, 12, 88);
      } else if (boxRole) {
        const nearPostX = attackingRight ? 92 : 8;
        const farPostX = attackingRight ? 88 : 12;
        const penaltyX = attackingRight ? 83 : 17;
        const slot =
          line === "FW"
            ? 0
            : p.baseY < 45
              ? 1
              : p.baseY > 55
                ? 2
                : 3;
        targetX = [nearPostX, penaltyX, farPostX, penaltyX - (attackingRight ? 2 : -2)][slot];
        targetY = [50 + nearSide * 6, 50, 50 - nearSide * 7, 50 + nearSide * 12][slot];
      } else {
        targetX = attackingRight ? 76 : 24;
        targetY = clamp(p.baseY * 0.7 + 50 * 0.3, 24, 76);
      }

      p.aiState = "SUPPORT";
      steerTo(p, targetX, targetY, 1.12);
      return;
    }

    if (line === "DF" || line === "MF") {
      const goalSide = attackingRight ? 1 : -1;
      const markerOffset = p.baseY < 50 ? -4 : p.baseY > 50 ? 4 : 0;
      const sixYardX = attackingRight ? 94 : 6;
      const penaltyX = attackingRight ? 87 : 13;
      const nearPostX = attackingRight ? 96 : 4;
      const slots = [
        { x: nearPostX, y: 50 + nearSide * 7 },
        { x: sixYardX, y: 50 },
        { x: penaltyX, y: 50 - nearSide * 7 },
        { x: penaltyX, y: 50 + markerOffset },
      ];
      const slotIndex =
        p.position === "LB" || p.position === "LWB"
          ? cornerY < 50 ? 0 : 2
          : p.position === "RB" || p.position === "RWB"
            ? cornerY > 50 ? 0 : 2
            : p.baseY < 50
              ? 1
              : 3;
      const target = slots[slotIndex] ?? slots[1];
      p.aiState = "COVER";
      steerTo(
        p,
        clamp(target.x - goalSide * 1.2, 2, 98),
        clamp(target.y, BOX_MIN_Y - 6, BOX_MAX_Y + 6),
        1.18,
      );
      return;
    }

    p.aiState = "RETURN";
    steerTo(
      p,
      attackingRight ? Math.max(defendingGoalX + 36, p.baseX) : Math.min(defendingGoalX - 36, p.baseX),
      clamp(p.baseY, 18, 82),
      0.9,
    );
  }

  private prepareThrowInShape(
    team: "home" | "away",
    x: number,
    y: number,
    takerId: string | null,
  ): void {
    this.players.forEach((p) => {
      if (p.position === "GK" || p.id === takerId) return;
      this.moveInThrowInShape(p, team, x, y, takerId);
    });
  }

  private moveInThrowInShape(
    p: EnginePlayer,
    team: "home" | "away",
    x: number,
    y: number,
    takerId: string | null,
  ): void {
    const isRestartTeam = p.team === team;
    const isTopTouchline = y < 50;
    const touchlineY = isTopTouchline ? 7 : 93;
    const insideY = isTopTouchline ? 15 : 85;
    const dir = this.attackDirection(team);

    if (p.id === takerId) {
      p.aiState = "SET_PIECE";
      steerTo(p, x, y, 1.28);
      return;
    }

    if (isRestartTeam) {
      const line = getPlayerLine(p);
      const supportCandidates = this.players
        .filter((mate) => mate.team === team && mate.id !== takerId && mate.position !== "GK")
        .sort((a, b) => {
          const aSame = (a.baseY < 50) === isTopTouchline ? -10 : 0;
          const bSame = (b.baseY < 50) === isTopTouchline ? -10 : 0;
          return dist(a.x, a.y, x, y) + aSame - (dist(b.x, b.y, x, y) + bSame);
        });
      const supportRank = supportCandidates.findIndex((mate) => mate.id === p.id);
      const closeOption = supportRank >= 0 && supportRank < 3;
      const slot = Math.max(0, supportRank);
      const laneY = clamp(insideY + (isTopTouchline ? 1 : -1) * (slot === 0 ? 5 : slot === 1 ? 12 : 18), 9, 91);
      const depthOffset = slot === 0 ? -3 : slot === 1 ? 7 : line === "FW" ? 15 : 12;
      const targetX = closeOption
        ? clamp(x + dir * depthOffset, 5, 95)
        : clamp(x + dir * (line === "FW" ? 16 : 10), 5, 95);
      const targetY = closeOption
        ? laneY
        : clamp(p.baseY * 0.55 + insideY * 0.45, 10, 90);
      p.aiState = "SUPPORT";
      steerTo(p, targetX, targetY, closeOption ? 1.14 : 1.02);
      return;
    }

    const markerX = clamp(x + dir * 7, 4, 96);
    const markerY = clamp(touchlineY + (isTopTouchline ? 20 : -20), 12, 88);
    p.aiState = "COVER";
    steerTo(
      p,
      clamp(p.baseX * 0.42 + markerX * 0.58, 4, 96),
      clamp(p.baseY * 0.34 + markerY * 0.66, 10, 90),
      1.02,
    );
  }

  private executeThrowIn(taker: EnginePlayer, target: EnginePlayer): boolean {
    const d = dist(taker.x, taker.y, target.x, target.y);
    const quality = taker.passing * 0.28 + taker.vision * 0.22 + taker.overall * 0.2 + taker.strength * 0.22;
    const accurate = Math.random() < clamp(0.91 + quality - d * 0.0012, 0.965, 0.998);
    const tx = target.x + target.vx * 2 + (accurate ? 0 : (Math.random() - 0.5) * 0.9);
    const ty = target.y + target.vy * 2 + (accurate ? 0 : (Math.random() - 0.5) * 0.9);
    const angle = Math.atan2(ty - taker.y, tx - taker.x);
    const power = groundBallPowerForDistance(dist(taker.x, taker.y, tx, ty), taker.passing, true);

    taker.hasBall = false;
    taker.possessionFlipCount = 0;
    taker.lastPassTargetId = target.id;
    this.shotInFlight = false;
    this.ball.ownerId = null;
    this.ball.lastOwnerId = taker.id;
    this.ball.intendedReceiverId = target.id;
    this.ball.intendedTeam = taker.team;
    this.ball.offsideReceiverId = null;
    this.ball.x = taker.x + Math.cos(angle) * 0.8;
    this.ball.y = taker.y + Math.sin(angle) * 0.8;
    this.ball.vx = Math.cos(angle) * power;
    this.ball.vy = Math.sin(angle) * power;
    this.ball.z = 0.28;
    this.ball.vz = 0.07;
    this.ball.status = "AIRBORNE";
    this.ball.flight = "driven";
    this.ball.curveX = 0;
    this.ball.curveY = 0;
    this.ball.interceptionOpenTime = this.time + clamp(d / 68, 0.38, 0.72);
    this.recordPassStats(taker, target, accurate, "pass");
    this.rememberPassContext(taker, "pass", accurate, true);
    target.aiState = "INTERCEPT";
    target.targetX = tx;
    target.targetY = ty;
    target.decisionCooldown = Math.min(target.decisionCooldown, FIRST_TOUCH_COOLDOWN * 0.45);
    steerTo(target, tx, ty, 1.2);
    primeReceiverForIncomingBall(target, this.ball, this.attackDirection(target.team));
    this.emitEvent("pass", taker.team, `${taker.name} takes the throw-in to ${target.name}`);
    return true;
  }

  private prepareFreeKickShape(
    team: "home" | "away",
    x: number,
    y: number,
    takerId: string | null,
  ): void {
    this.players.forEach((p) => {
      if (p.position === "GK" || p.id === takerId) return;
      this.moveInFreeKickShape(p, team, x, y);
    });
  }

  private freeKickWallPlayers(
    defendingTeam: "home" | "away",
    x: number,
    y: number,
    count: number,
  ): EnginePlayer[] {
    return this.players
      .filter((p) => p.team === defendingTeam && p.position !== "GK")
      .map((p) => {
        const lineBonus = getPlayerLine(p) === "MF" ? 0.8 : getPlayerLine(p) === "DF" ? 0.4 : 0;
        return {
          p,
          score:
            dist(p.x, p.y, x, y) -
            p.heightCm * 0.012 -
            p.reaction * 0.6 -
            lineBonus,
        };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, count)
      .map(({ p }) => p);
  }

  private moveInFreeKickShape(
    p: EnginePlayer,
    team: "home" | "away",
    x: number,
    y: number,
  ): void {
    if (p.position === "GK") {
      updateGoalkeeper(p, this.ball, this.players);
      return;
    }

    const mode = this.freeKickMode(team, x, y);
    const attackingRight = this.attacksRight(team);
    const attackDir = this.attackDirection(team);
    const defendingTeam = team === "home" ? "away" : "home";
    const attackingPlayer = p.team === team;
    const line = getPlayerLine(p);
    const goalDist = this.goalDistance(team, x, y);

    if (mode === "quick") {
      if (attackingPlayer) {
        const supportX = clamp(x - attackDir * (line === "DF" ? 10 : 7), 4, 96);
        const supportY = clamp(p.baseY * 0.7 + y * 0.3, 10, 90);
        p.aiState = "SUPPORT";
        steerTo(p, supportX, supportY, 0.92);
      } else {
        returnToShape(p, this.ball, this.players);
      }
      return;
    }

    if (attackingPlayer) {
      const boxRunner = line === "FW" || line === "MF" || p.position === "CB";
      if (boxRunner) {
        const slot =
          line === "FW"
            ? 0
            : p.baseY < 45
              ? 1
              : p.baseY > 55
                ? 2
                : 3;
        const xs = attackingRight ? [88, 83, 91, 78] : [12, 17, 9, 22];
        const ys = [50, 43, 57, clamp(y, 36, 64)];
        p.aiState = "SUPPORT";
        steerTo(p, xs[slot], ys[slot], 1.03);
      } else {
        p.aiState = "SUPPORT";
        steerTo(
          p,
          clamp(x - attackDir * 10, 8, 92),
          clamp(p.baseY * 0.65 + y * 0.35, 14, 86),
          0.88,
        );
      }
      return;
    }

    if (mode === "direct") {
      const wallCount = Math.round(clamp(5 - goalDist / 8, 2, 4));
      const wallPlayers = this.freeKickWallPlayers(defendingTeam, x, y, wallCount);
      const wallIndex = wallPlayers.findIndex((wallPlayer) => wallPlayer.id === p.id);
      if (wallIndex >= 0) {
        const wallX = clamp(x + attackDir * pitchX(9.15), 3, 97);
        const offset = (wallIndex - (wallPlayers.length - 1) / 2) * 1.75;
        p.aiState = "COVER";
        steerTo(p, wallX, clamp(y + offset, 15, 85), 0.96);
        return;
      }
    }

    if (line === "DF" || line === "MF") {
      const defendX = attackingRight ? 88 : 12;
      const markerY = clamp(p.baseY * 0.55 + 50 * 0.45, BOX_MIN_Y - 6, BOX_MAX_Y + 6);
      p.aiState = "COVER";
      steerTo(
        p,
        clamp(defendX - attackDir * (line === "MF" ? 8 : 2), 4, 96),
        markerY,
        1.02,
      );
      return;
    }

    p.aiState = "RETURN";
    returnToShape(p, this.ball, this.players);
  }

  private findRestartTaker(
    team: "home" | "away",
    x: number,
    y: number,
    type?: SetPieceType,
  ): EnginePlayer | null {
    const isGoalKick = type === "goal_kick";
    const isPenalty = type === "penalty";
    const isThrowIn = type === "throw_in";
    const throwSideTop = y < 50;
    return (
      this.players
        .filter((p) => {
          if (p.team !== team) return false;
          if (isGoalKick) return p.position === "GK";
          return p.position !== "GK";
        })
        .sort((a, b) =>
          isPenalty
            ? b.shooting + b.overall + b.reaction * 0.3 - (a.shooting + a.overall + a.reaction * 0.3)
            : isThrowIn
              ? (dist(a.x, a.y, x, y) - ((a.baseY < 50) === throwSideTop ? 10 : 0) - (isFullbackRole(a.position) ? 4 : 0)) -
                (dist(b.x, b.y, x, y) - ((b.baseY < 50) === throwSideTop ? 10 : 0) - (isFullbackRole(b.position) ? 4 : 0))
            : dist(a.x, a.y, x, y) - dist(b.x, b.y, x, y),
        )[0] ?? null
    );
  }

  private selectEmergencyRestartTarget(taker: EnginePlayer): EnginePlayer | null {
    return (
      this.players
        .filter((p) => p.team === taker.team && p.id !== taker.id && p.position !== "GK")
        .map((p) => {
          const opponents = this.players.filter((op) => op.team !== taker.team);
          const d = dist(taker.x, taker.y, p.x, p.y);
          return {
            p,
            score:
              Math.min(nearestOpponentDistance(p, opponents), 12) * 1.2 +
              Math.min(passingLaneClearance(taker, p, opponents), 8) -
              Math.abs(d - 10) * 0.45,
          };
        })
        .sort((a, b) => b.score - a.score)[0]?.p ?? null
    );
  }

  private isSafeThrowInTarget(
    taker: EnginePlayer,
    target: EnginePlayer,
    emergency = false,
  ): boolean {
    if (target.team !== taker.team || target.id === taker.id || target.position === "GK") return false;
    const d = dist(taker.x, taker.y, target.x, target.y);
    if (d < 4.2 || d > (emergency ? 26 : 23)) return false;

    const opponents = this.players.filter((op) => op.team !== taker.team);
    const safeSpace = nearestOpponentDistance(target, opponents);
    const lane = passingLaneClearance(taker, target, opponents);
    return safeSpace > (emergency ? 1.05 : 1.45) && lane > (emergency ? 0.95 : 1.35);
  }

  private selectRestartTarget(
    taker: EnginePlayer,
    type: SetPieceType,
  ): EnginePlayer | null {
    const teammates = this.players.filter(
      (p) => p.team === taker.team && p.id !== taker.id,
    );
    if (type === "goal_kick") {
      return (
        teammates.sort(
          (a, b) => Math.abs(a.baseX - 45) - Math.abs(b.baseX - 45),
        )[0] ?? null
      );
    }
    if (type === "corner_kick") {
      const attackingRight = this.attacksRight(taker.team);
      return (
        teammates
          .filter((p) => p.team === taker.team && p.position !== "GK")
          .map((p) => {
            const depth = attackingRight ? p.x : 100 - p.x;
            const centrality = 1 - Math.abs(p.y - 50) / 34;
            const roleBonus =
              getPlayerLine(p) === "FW" ? 7 : getPlayerLine(p) === "MF" ? 5 : 3;
            const boxBonus =
              depth > 78 && p.y > BOX_MIN_Y - 5 && p.y < BOX_MAX_Y + 5 ? 8 : 0;
            return {
              p,
              score: depth * 0.18 + centrality * 10 + roleBonus + boxBonus + p.overall * 5,
            };
          })
          .sort((a, b) => b.score - a.score)[0]?.p ?? null
      );
    }
    if (type === "throw_in") {
      const touchlineTop = taker.y < 50;
      return (
        teammates
          .filter((p) => p.position !== "GK")
          .map((p) => {
            const d = dist(taker.x, taker.y, p.x, p.y);
            const forwardProgress = taker.team === "home" ? p.x - taker.x : taker.x - p.x;
            const sameSide = (p.y < 50) === touchlineTop;
            const sameSideBonus = sameSide ? 11 : -3;
            const safeSpace = nearestOpponentDistance(
              p,
              this.players.filter((op) => op.team !== taker.team),
            );
            const lane = passingLaneClearance(
              taker,
              p,
              this.players.filter((op) => op.team !== taker.team),
            );
            return {
              p,
              d,
              safeSpace,
              lane,
              score:
                sameSideBonus +
                Math.min(safeSpace, 12) * 1.15 +
                Math.min(lane, 8) * 0.9 +
                Math.max(-2, Math.min(forwardProgress, 9)) * 0.32 -
                Math.abs(d - 10.5) * 0.62,
            };
          })
          .filter(({ p }) => this.isSafeThrowInTarget(taker, p))
          .filter(({ d }) => d > 4.2 && d < 23)
          .filter(({ score }) => score > 9.5)
          .sort((a, b) => b.score - a.score)[0]?.p ??
        null
      );
    }
    if (type === "free_kick" && this.freeKickMode(taker.team, taker.x, taker.y) !== "quick") {
      const attackingRight = this.attacksRight(taker.team);
      return (
        teammates
          .filter((p) => p.position !== "GK")
          .map((p) => {
            const depth = attackingRight ? p.x : 100 - p.x;
            const centrality = 1 - Math.abs(p.y - 50) / 36;
            const aerial = playerAerialScore(p);
            const roleBonus =
              getPlayerLine(p) === "FW" ? 8 : getPlayerLine(p) === "MF" ? 5 : 3;
            const boxBonus =
              depth > 74 && p.y > BOX_MIN_Y - 7 && p.y < BOX_MAX_Y + 7 ? 9 : 0;
            return {
              p,
              score:
                depth * 0.15 +
                centrality * 8 +
                aerial * 7 +
                roleBonus +
                boxBonus +
                p.overall * 4,
            };
          })
          .sort((a, b) => b.score - a.score)[0]?.p ?? null
      );
    }
    return (
      selectPassTarget(taker, this.players) ??
      teammates.sort(
        (a, b) =>
          dist(taker.x, taker.y, a.x, a.y) - dist(taker.x, taker.y, b.x, b.y),
      )[0] ??
      null
    );
  }

  private tryEvent(type: string): boolean {
    const lockDurations: Record<string, number> = {
      foul: 0.7,
      shot: 0.62,
      pass: 0.24,
      tackle: 0.55,
      cross: 0.42,
    };
    const lock = lockDurations[type] ?? 0.3;
    if (this.time < (this.eventLocks[type] ?? 0)) return false;
    this.eventLocks[type] = this.time + lock;
    return true;
  }

  private emitEvent(
    type: MatchEventState["type"],
    team: "home" | "away",
    text: string,
  ): void {
    const event: MatchEventState = {
      id: `evt-${++this.eventIdCounter}`,
      minute: this.formatTime(),
      team,
      type,
      text,
    };
    this.eventListeners.forEach((l) => l(event));
  }

  private formatTime(): string {
    const base = this.activeHalf === "FIRST_HALF" ? 45 : 90;
    const min = Math.floor(this.time);
    const over =
      (this.activeHalf === "FIRST_HALF" && min > 45) ||
      (this.activeHalf === "SECOND_HALF" && min > 90);
    return over ? `${base}+${min - base}'` : `${min}'`;
  }

  private calcStoppage(): number {
    const interruptions =
      this.stats.home.fouls +
      this.stats.away.fouls +
      this.homeScore +
      this.awayScore;
    return Math.min(
      8,
      1 + Math.floor(Math.random() * 5) + Math.floor(interruptions / 3),
    );
  }

  private resetPositions(): void {
    this.ball = {
      x: 50,
      y: 50,
      vx: 0,
      vy: 0,
      z: 0,
      vz: 0,
      status: "GROUNDED",
      flight: "ground",
      ownerId: null,
      lastOwnerId: null,
      intendedReceiverId: null,
      intendedTeam: null,
      offsideReceiverId: null,
      interceptionOpenTime: this.time,
    };
    this.players.forEach((p) => {
      const baseX = this.orientedBaseX(p);
      const startsInLeftHalf = this.attacksRight(p.team);
      p.x =
        p.position === "GK"
          ? baseX
          : startsInLeftHalf
            ? Math.min(baseX, 48)
            : Math.max(baseX, 52);
      p.y = p.baseY;
      p.vx = 0;
      p.vy = 0;
      p.facingX = this.attackDirection(p.team);
      p.facingY = 0;
      p.dribbleTouchCooldown = 0;
      p.hasBall = false;
      p.aiState = p.position === "GK" ? "GK_SET" : "IDLE";
      p.targetX = baseX;
      p.targetY = p.baseY;
    });
  }

  private orientedBaseX(p: EnginePlayer): number {
    const startsAttackingRight = p.team === "home";
    return this.attacksRight(p.team) === startsAttackingRight ? p.baseX : 100 - p.baseX;
  }

  private pushState(): void {
    const home11 = this.players.filter((p) => p.team === "home").slice(0, 11);
    const away11 = this.players.filter((p) => p.team === "away").slice(0, 11);
    const active =
      home11.length === 11 && away11.length === 11
        ? [...home11, ...away11]
        : [];

    this.onUpdate({
      time: Math.floor(this.time),
      phase: this.phase,
      stoppageTime: this.stoppageTime,
      displayTime: this.formatTime(),
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      players: active,
      activePlayers: active,
      ball: { ...this.ball },
      stats: {
        home: { ...this.stats.home },
        away: { ...this.stats.away },
        firstHalf: {
          home: { ...this.stats.firstHalf.home },
          away: { ...this.stats.firstHalf.away },
        },
        secondHalf: {
          home: { ...this.stats.secondHalf.home },
          away: { ...this.stats.secondHalf.away },
        },
      },
      events: this.events.slice(0, 50),
      pendingSubstitutions: [...this.pendingSubstitutions],
      speed: this.speed,
      isPaused: this.isPaused,
      isFinished: this.isFinished,
    });
  }
}
