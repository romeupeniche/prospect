import { readFileSync } from "fs";
import { MatchEngine } from "./src/components/MatchEngine/Engine";

(globalThis as any).requestAnimationFrame = (cb: () => void) => {
  return setTimeout(cb, 16) as unknown as number;
};
(globalThis as any).cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

const chapecoense = JSON.parse(
  readFileSync("src/data/squads/chapecoense.json", "utf-8"),
);
const flamengo = JSON.parse(
  readFileSync("src/data/squads/flamengo.json", "utf-8"),
);

console.log("Chapecoense players:", chapecoense.length);
console.log("Flamengo players:", flamengo.length);

let lastEventCount = 0;
let tickCount = 0;
let ballOwnerChanges = 0;
let lastOwner = "";
let playersNearGoal = 0;
let maxHomeX = 0;
let maxAwayX = 100;
let maxBallX = 0;
let minBallX = 100;

const engine = new MatchEngine(
  chapecoense,
  flamengo,
  42000,
  50000,
  0.6,
  (state) => {
    tickCount++;

    if (state.ball.x > maxBallX) maxBallX = state.ball.x;
    if (state.ball.x < minBallX) minBallX = state.ball.x;

    if (state.ball.ownerId !== lastOwner && state.ball.ownerId) {
      ballOwnerChanges++;
      lastOwner = state.ball.ownerId;
    }

    const carrier = state.activePlayers.find((p: any) => p.hasBall);
    if (carrier) {
      const goalX = carrier.team === "home" ? 100 : 0;
      const distToG = Math.abs(carrier.x - goalX);
      if (carrier.team === "home" && carrier.x > maxHomeX) maxHomeX = carrier.x;
      if (carrier.team === "away" && carrier.x < maxAwayX) maxAwayX = carrier.x;
      if (distToG <= 30 && tickCount < 2000) {
        playersNearGoal++;
      }
    }

    if (tickCount % 100 === 0) {
      const carrier = state.activePlayers.find((p: any) => p.hasBall);
      const cInfo = carrier
        ? `${carrier.name}@${Math.round(carrier.x)}`
        : "none";
      console.log(
        `  [pos] ball=(${Math.round(state.ball.x)},${Math.round(state.ball.y)}) carrier=${cInfo}`,
      );
    }

    if (state.events.length > lastEventCount) {
      const newCount = state.events.length - lastEventCount;
      for (let i = newCount - 1; i >= 0; i--) {
        const e = state.events[i];
        if (tickCount < 300) {
          console.log(`[${e.minute}] ${e.type}: ${e.text}`);
        }
      }
      lastEventCount = state.events.length;
    }
  },
  "4-3-3",
  "4-4-2",
);

engine.setSpeed(8);
engine.start();

setTimeout(() => {
  engine.stop();
  const s = (engine as any).stats;
  const e = engine as any;
  console.log("\n--- FINAL STATS ---");
  console.log("Score:", e.homeScore, "-", e.awayScore);
  console.log("Game time:", e.time.toFixed(1), "min");
  console.log(
    "Home shots:",
    s.home.shotsTotal,
    "on target:",
    s.home.shotsOnTarget,
  );
  console.log(
    "Away shots:",
    s.away.shotsTotal,
    "on target:",
    s.away.shotsOnTarget,
  );
  console.log(
    "Home passes:",
    s.home.passesTotal,
    "acc:",
    s.home.passesAccurate,
  );
  console.log(
    "Away passes:",
    s.away.passesTotal,
    "acc:",
    s.away.passesAccurate,
  );
  console.log("Total events:", lastEventCount);
  console.log("Ball owner changes:", ballOwnerChanges);
  console.log("Ball x range:", minBallX.toFixed(0), "-", maxBallX.toFixed(0));
  console.log("Max home carrier x:", maxHomeX.toFixed(0));
  console.log("Min away carrier x:", maxAwayX.toFixed(0));
  console.log("Carriers within 30m of goal:", playersNearGoal);
  process.exit(0);
}, 30000);
