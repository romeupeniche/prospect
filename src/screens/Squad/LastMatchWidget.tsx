import { motion } from "framer-motion";
import { RuntimePlayer } from "../../store/useTeamStore";

interface LastMatchWidgetProps {
  players: RuntimePlayer[];
  teamLogo?: string;
  opponentLogo?: string;
  isTeamColorBlackOrWhite: boolean;
  onPlayerClick: (id: string) => void;
}

const positionSlots: Record<string, { x: number; y: number }> = {
  GK: { x: 50, y: 88 },
  LCB: { x: 35, y: 72 },
  RCB: { x: 65, y: 72 },
  LB: { x: 15, y: 66 },
  RB: { x: 85, y: 66 },
  LWB: { x: 18, y: 60 },
  RWB: { x: 82, y: 60 },
  CDM: { x: 50, y: 56 },
  LCM: { x: 35, y: 47 },
  RCM: { x: 65, y: 47 },
  LM: { x: 23, y: 43 },
  RM: { x: 77, y: 43 },
  CAM: { x: 50, y: 34 },
  LW: { x: 25, y: 25 },
  RW: { x: 75, y: 25 },
  ST: { x: 50, y: 16 },
  CF: { x: 50, y: 22 },
};

const ratingTone = (rating: number): string => {
  if (rating >= 8) return "bg-emerald-400 text-black";
  if (rating >= 7.2) return "bg-yellow-300 text-black";
  return "bg-white/15 text-white";
};

const LastMatchWidget = ({
  players,
  teamLogo,
  opponentLogo,
  isTeamColorBlackOrWhite,
  onPlayerClick,
}: LastMatchWidgetProps) => {
  // const lineup = pickLineup(players);
  const lastLineup = {
    formation: "433",
    players: [
      { id: "3336bdf6-8564-4f42-8538-72b99ab39ade", role: "GK", rating: 9.5 },
      { id: "6f961930-6510-4e35-b72d-07c66bb22ae4", role: "LB", rating: 7.3 },
      { id: "0bd882d5-ba57-474f-90b5-047c39eeeb41", role: "LCB", rating: 8.8 },
      { id: "449829de-7075-4e56-bdd2-bb89ae2db87b", role: "RCB", rating: 8.5 },
      { id: "2bf122ef-441d-4260-8a28-e165adebf8d0", role: "RB", rating: 7.2 },
      { id: "f4c9a8b2-1d5e-4b9d-8c3f-2a1b0d7e6c98", role: "CDM", rating: 8.9 },
      { id: "a4d92f3b-5821-4c7e-91a5-8e2d4c0b3f11", role: "LCM", rating: 8.0 },
      { id: "b3e945c1-82d4-4a5f-9d3e-2f1a6c0b8e92", role: "RCM", rating: 8.5 },
      { id: "e2d83c41-6b9a-4f5d-9c2e-7b1a0d8f6e32", role: "LW", rating: 7.6 },
      { id: "6e908124-27c4-4ee8-a437-da7e350bbb08", role: "ST", rating: 9.0 },
      { id: "c9e4b1d7-8f2a-4c5d-9e3f-1a0b6d2e8f94", role: "RW", rating: 8.2 },
    ],
  }

  return (
    <div className="bg-[#111] rounded-4xl border border-white/5 flex flex-col h-84 shrink-0 overflow-hidden relative shadow-2xl shadow-black/20">
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-linear-to-b from-black/90 via-black/45 to-transparent">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-[0.22em] font-black">
              Last Match
            </p>
            <p className="text-xs text-white font-bold">Serie A - Round 5</p>
          </div>

          <div className="flex items-center gap-2">
            <img
              src={teamLogo ?? "src/assets/clubs_logos/43257277_tiny.png"}
              className="w-7 h-7 object-contain"
              alt="Home club"
            />
            <span
              className={`px-3 py-1 rounded-xl text-sm font-black ${isTeamColorBlackOrWhite ? "bg-white/10" : "bg-(--team-color-600)"
                }`}
            >
              2 - 1
            </span>
            <img
              src={opponentLogo ?? "src/assets/clubs_logos/21276332_tiny.png"}
              className="w-7 h-7 object-contain"
              alt="Away club"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 relative mt-14 overflow-hidden bg-[radial-gradient(circle_at_center,#1b6b42_0%,#0d3b26_48%,#082416_100%)]">
        <div className="absolute inset-4 rounded-[1.75rem] border border-white/25" />
        <div className="absolute top-1/2 right-4 left-4 h-px bg-white/20" />
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        <div className="absolute left-1/2 top-4 h-12 w-28 -translate-x-1/2 rounded-b-3xl border-x border-b border-white/20" />
        <div className="absolute left-1/2 bottom-4 h-12 w-28 -translate-x-1/2 rounded-t-3xl border-x border-t border-white/20" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[12.5%_100%] opacity-25" />

        {lastLineup.players.map((node, index) => {
          const player = players.find((candidate) => candidate.id === node.id);

          if (!player) {
            return null;
          }

          return (
            <motion.button
              key={node.id}
              type="button"
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index, type: "spring", stiffness: 260, damping: 22 }}
              onClick={() => onPlayerClick(node.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer group"
              style={{ left: `${positionSlots[node.role].x}%`, top: `${positionSlots[node.role].y}%` }}
            >
              <span className="relative block h-10 w-10 rounded-full border-2 border-white/80 bg-black/60 shadow-xl shadow-black/40 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                <img
                  src={player.personal.photo_url}
                  alt={player.personal.short_name}
                  className="h-full w-full rounded-full object-cover"
                />
                <span
                  className={`absolute -right-2 -bottom-1 rounded-md px-1 text-[8px] font-black ${ratingTone(
                    node.rating,
                  )}`}
                >
                  {node.rating}
                </span>
              </span>
              <span className="max-w-15 truncate rounded-lg bg-black/75 px-2 py-0.5 text-[8px] font-black text-white transition-colors group-hover:text-(--team-color-300)">
                {player.personal.short_name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LastMatchWidget;
