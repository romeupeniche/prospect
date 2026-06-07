import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RuntimePlayer, SeasonStats, useTeamStore } from "../../store/useTeamStore";
import { SeedlingIcon } from "../../icons/Seedling";

interface PlayerDrawerProps {
  player: RuntimePlayer;
  isTeamColorBlackOrWhite: boolean;
  onClose: () => void;
}

interface HighlightStat {
  key: keyof SeasonStats;
  label: string;
  value: string;
  score: number;
  detail: string;
}

const positionFamilies = {
  goalkeeper: ["GK", "G"],
  defender: ["CB", "LB", "RB", "LWB", "RWB"],
  midfielder: ["CDM", "CM", "CAM", "LM", "RM"],
  forward: ["LW", "RW", "ST", "CF"],
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

const getPositionFamily = (position: string): keyof typeof positionFamilies => {
  if (positionFamilies.goalkeeper.includes(position)) return "goalkeeper";
  if (positionFamilies.defender.includes(position)) return "defender";
  if (positionFamilies.midfielder.includes(position)) return "midfielder";
  return "forward";
};

const formatStatValue = (key: keyof SeasonStats, value: number): string => {
  if (key === "rating") {
    return value > 0 ? value.toFixed(2) : "0.00";
  }

  return String(value);
};

const getTopHighlights = (stats: SeasonStats, position: string): HighlightStat[] => {
  const family = getPositionFamily(position);
  const weights: Record<keyof SeasonStats, number> = {
    matches: 1,
    rating: 1.3,
    goals: family === "forward" ? 2.6 : family === "midfielder" ? 1.8 : 1,
    assists: family === "forward" || family === "midfielder" ? 2.1 : 1.3,
    tackles: family === "defender" || family === "midfielder" ? 2.2 : 1,
    passesCompleted: family === "midfielder" ? 1.9 : 1.2,
    saves: family === "goalkeeper" ? 3 : 0.4,
    cleanSheets: family === "goalkeeper" || family === "defender" ? 2.8 : 0.5,
  };

  const labels: Record<keyof SeasonStats, string> = {
    matches: "Matches",
    rating: "Avg Rating",
    goals: "Goals",
    assists: "Assists",
    tackles: "Tackles",
    passesCompleted: "Passes",
    saves: "Saves",
    cleanSheets: "Clean Sheets",
  };

  const details: Record<keyof SeasonStats, string> = {
    matches: "Availability",
    rating: "Performance curve",
    goals: "Final third output",
    assists: "Chance creation",
    tackles: "Ball recovery",
    passesCompleted: "Control volume",
    saves: "Shot stopping",
    cleanSheets: "Defensive impact",
  };

  const priorityFallback: Record<keyof typeof positionFamilies, (keyof SeasonStats)[]> = {
    goalkeeper: ["rating", "cleanSheets", "saves", "matches"],
    defender: ["rating", "cleanSheets", "tackles", "passesCompleted"],
    midfielder: ["rating", "assists", "passesCompleted", "tackles"],
    forward: ["rating", "goals", "assists", "matches"],
  };

  const scored = (Object.keys(weights) as (keyof SeasonStats)[])
    .map((key) => ({
      key,
      label: labels[key],
      value: formatStatValue(key, stats[key]),
      detail: details[key],
      score: stats[key] * weights[key] + (priorityFallback[family].includes(key) ? 0.75 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  const hasProduction = scored.some((item) => Number(stats[item.key]) > 0);

  if (hasProduction) {
    return scored.slice(0, 4);
  }

  return priorityFallback[family].map((key) => ({
    key,
    label: labels[key],
    value: formatStatValue(key, stats[key]),
    detail: details[key],
    score: weights[key],
  }));
};

const conditionTone = (value: number): string => {
  if (value >= 75) return "from-emerald-400 to-lime-300";
  if (value >= 45) return "from-yellow-400 to-orange-400";
  return "from-red-500 to-rose-400";
};

const PlayerDrawer = ({ player, isTeamColorBlackOrWhite, onClose }: PlayerDrawerProps) => {
  const {
    toggleTransferList,
    toggleLoanList,
    changeKitNumber,
    proposeRenewal,
    readMessages,
  } = useTeamStore();
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [kitNumber, setKitNumber] = useState(String(player.contract.kit_number));
  const [renewalWage, setRenewalWage] = useState(String(player.contract.wage));
  const [renewalYear, setRenewalYear] = useState(player.contract.valid_until.slice(0, 4));
  const [messageCopied, setMessageCopied] = useState(false);

  useEffect(() => {
    if (player.runtime.hasUnreadMessage) {
      readMessages(player.id);
    }
  }, [player.id, player.runtime.hasUnreadMessage, readMessages]);

  useEffect(() => {
    setKitNumber(String(player.contract.kit_number));
    setRenewalWage(String(player.contract.wage));
    setRenewalYear(player.contract.valid_until.slice(0, 4));
    setMessageCopied(false);
  }, [player.id, player.contract.kit_number, player.contract.wage, player.contract.valid_until]);

  const highlights = useMemo(
    () => getTopHighlights(player.runtime.seasonStats, player.technical_profile.best_position),
    [player.runtime.seasonStats, player.technical_profile.best_position],
  );

  const allStats = Object.entries(player.runtime.seasonStats) as [keyof SeasonStats, number][];

  const handleKitSave = () => {
    const parsed = Number(kitNumber);

    if (Number.isFinite(parsed)) {
      changeKitNumber(player.id, parsed);
    }
  };

  const handleRenewal = () => {
    const parsedWage = Number(renewalWage);

    if (Number.isFinite(parsedWage) && renewalYear.trim().length > 0) {
      proposeRenewal(player.id, parsedWage, renewalYear);
    }
  };

  const handleMessageTemplate = async () => {
    const template = `Hi ${player.personal.short_name}, I saw your message. Let's talk after training about your role, minutes, and next steps.`;

    try {
      await navigator.clipboard.writeText(template);
      setMessageCopied(true);
    } catch {
      setMessageCopied(true);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 z-40 bg-black/55 backdrop-blur-sm cursor-default"
        aria-label="Close player drawer backdrop"
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 230 }}
        className="absolute top-0 right-0 z-50 h-full w-116 max-w-[calc(100vw-1rem)] overflow-hidden rounded-l-4xl border-l border-white/10 bg-[#080808] shadow-2xl shadow-black/70"
      >
        <div className="flex h-full flex-col">
          <div className="relative overflow-hidden border-b border-white/10 p-6">
            <div
              className={`absolute inset-0 opacity-20 ${isTeamColorBlackOrWhite
                ? "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_44%)]"
                : "bg-[radial-gradient(circle_at_top_right,var(--team-color-500),transparent_44%)]"
                }`}
            />
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black text-gray-400 transition hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
              aria-label="Close player drawer"
            >
              X
            </button>

            <div className="relative flex items-end gap-5 pt-8">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-xl shadow-black/40">
                {player.contract.origin_club_id === "youth_academy" && (
                  <div className="absolute -left-2 top-8" title="Cria da Base">
                    <SeedlingIcon className="w-6 text-green-400" />
                  </div>
                )}
                <img
                  src={player.personal.photo_url ?? "src/assets/players/unknown.png"}
                  alt={player.personal.name}
                  className="h-full w-full object-cover select-none pointer-events-none"
                  onError={(e) => {
                    e.currentTarget.src = "src/assets/players/unknown.png";
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                  {player.technical_profile.best_position} / {player.personal.nationality}
                </p>
                <h2 className="mt-1 text-3xl truncate font-black leading-none text-white">
                  {player.personal.short_name}
                </h2>
                <p className="mt-2 truncate text-xs text-gray-400">
                  {player.personal.age} years / {player.personal.height_cm}cm / {player.personal.preferred_foot} foot
                </p>

                <div className="mt-4 flex flex-wrap gap-2 h-6">
                  <span
                    className={`rounded-xl px-3 h-full flex items-center text-[11px] font-black ${isTeamColorBlackOrWhite ? "bg-white text-black" : "bg-(--team-color-600) text-white"
                      }`}
                  >
                    OVR {player.technical_profile.overall}
                  </span>
                  <span className="rounded-xl border border-white/10 bg-white/10 px-3 full flex items-center text-[11px] font-black text-white">
                    No. {player.contract.kit_number}
                  </span>
                  <span className="rounded-xl border border-white/10 bg-black/30 px-3 full flex items-center text-[11px] font-black text-gray-300">
                    POT {player.technical_profile.potential}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {(player.runtime.ckRisk > 80 || player.runtime.injury) && (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-300">
                  Medical Alert
                </p>
                <p className="mt-2 text-xs leading-relaxed text-gray-300">
                  {player.runtime.injury
                    ? `${player.personal.short_name} is in ${player.runtime.injury.phase} for ${player.runtime.injury.type}. Estimated return in ${player.runtime.injury.daysRemaining} days.`
                    : "Creatine Kinase readings are critical. Reduce minutes and avoid intense load in the next fixture."}
                </p>
              </div>
            )}

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                  Performance Highlights
                </h3>
                <button
                  type="button"
                  onClick={() => setShowStatsModal(true)}
                  className="cursor-pointer rounded-xl border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-300 transition hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
                >
                  Deep Stats
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {highlights.map((stat) => (
                  <motion.div
                    key={stat.key}
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="rounded-3xl border border-white/5 bg-white/4 p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {stat.detail}
                    </p>
                    <p className="mt-2 text-3xl font-light text-white">{stat.value}</p>
                    <p className="mt-1 text-[11px] font-black uppercase tracking-wider text-gray-300">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/5 bg-white/3 p-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                Physical Load
              </h3>
              <div className="mt-4 space-y-4">
                {[
                  ["Condition", player.runtime.condition],
                  ["Match Fitness", player.runtime.matchFitness],
                  ["CK Risk", player.runtime.ckRisk],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <span>{label}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${label === "CK Risk" ? "from-red-500 to-orange-300" : conditionTone(Number(value))
                          }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                Management
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    value={kitNumber}
                    onChange={(event) => setKitNumber(event.target.value)}
                    className="h-11 rounded-2xl border border-white/10 bg-white/4 px-4 text-xs font-bold text-white outline-none transition focus:border-white/30"
                    inputMode="numeric"
                    aria-label="Kit number"
                  />
                  <button
                    type="button"
                    onClick={handleKitSave}
                    className="h-11 cursor-pointer rounded-2xl border border-white/10 bg-white/10 px-4 text-[10px] font-black uppercase tracking-widest text-white transition hover:border-white/25 hover:bg-white/15 active:scale-95"
                  >
                    Save No.
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_5.5rem_auto] gap-2">
                  <input
                    value={renewalWage}
                    onChange={(event) => setRenewalWage(event.target.value)}
                    className="h-11 min-w-0 rounded-2xl border border-white/10 bg-white/4 px-4 text-xs font-bold text-white outline-none transition focus:border-white/30"
                    inputMode="numeric"
                    aria-label="Renewal wage"
                  />
                  <input
                    value={renewalYear}
                    onChange={(event) => setRenewalYear(event.target.value)}
                    className="h-11 min-w-0 rounded-2xl border border-white/10 bg-white/4 px-3 text-xs font-bold text-white outline-none transition focus:border-white/30"
                    inputMode="numeric"
                    aria-label="Renewal year"
                  />
                  <button
                    type="button"
                    onClick={handleRenewal}
                    className={`h-11 cursor-pointer rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest text-white transition active:scale-95 ${isTeamColorBlackOrWhite ? "bg-white/10 hover:bg-white/20" : "bg-(--team-color-600) hover:bg-(--team-color-700)"
                      }`}
                  >
                    Renew
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => toggleTransferList(player.id)}
                  className={`w-full cursor-pointer rounded-2xl border p-3 text-left text-xs font-bold transition hover:scale-[1.01] active:scale-[0.99] ${player.contract.is_transfer_listed
                    ? "border-red-500/30 bg-red-500/15 text-red-200"
                    : "border-white/10 bg-white/4 text-white hover:border-white/25"
                    }`}
                >
                  {player.contract.is_transfer_listed ? "Remove from transfer list" : "Add to transfer list"}
                </button>

                <button
                  type="button"
                  onClick={() => toggleLoanList(player.id)}
                  className={`w-full cursor-pointer rounded-2xl border p-3 text-left text-xs font-bold transition hover:scale-[1.01] active:scale-[0.99] ${player.runtime.isLoanListed
                    ? "border-blue-400/30 bg-blue-400/15 text-blue-100"
                    : "border-white/10 bg-white/4 text-white hover:border-white/25"
                    }`}
                >
                  {player.runtime.isLoanListed ? "Remove from loan list" : "Add to loan list"}
                </button>

                <button
                  type="button"
                  onClick={handleMessageTemplate}
                  className="cursor-pointer w-full rounded-2xl border border-[#25D366]/25 bg-[#25D366]/10 p-3 text-left text-xs font-bold text-[#76f0a1] transition hover:scale-[1.01] hover:bg-[#25D366]/15 active:scale-[0.99]"
                >
                  {messageCopied ? "WhatsApp template copied" : "Prepare WhatsApp response"}
                </button>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-3xl border border-white/5 bg-white/3 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Wage</p>
                <p className="mt-1 font-bold text-white">{formatCurrency(player.contract.wage)} / mo</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/3 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Expires</p>
                <p className="mt-1 font-bold text-white">{player.contract.valid_until}</p>
              </div>
            </section>
          </div>
        </div>
      </motion.aside>

      <AnimatePresence>
        {showStatsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-60 flex items-center justify-center bg-black/70 p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: 18, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 18, scale: 0.97 }}
              className="w-full max-w-lg rounded-4xl border border-white/10 bg-[#101010] p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                    Comprehensive Report
                  </p>
                  <h3 className="text-xl font-black text-white">{player.personal.short_name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStatsModal(false)}
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black text-gray-400 transition hover:border-white/25 hover:text-white"
                  aria-label="Close stats modal"
                >
                  X
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {allStats.map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-white/5 bg-white/4 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="mt-1 text-lg font-black text-white">{formatStatValue(key, value)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlayerDrawer;
