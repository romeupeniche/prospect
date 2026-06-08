import { motion } from "framer-motion";
import { ChevronRIcon } from "../../icons/ChevronR";
import { useCareerStore } from "../../store/useCareerStore";
import NextFixture from "../../components/DashboardWidgets/NextFixture";
import CompetitionTable from "../../components/DashboardWidgets/CompetitionTable";
import FeaturedPlayers from "../../components/DashboardWidgets/FeaturedPlayers";
import WorldFootballNews from "../../components/DashboardWidgets/WorldFootballNews";
import { useCompetitionsStore } from "../../store/useCompetitionsStore";
import { useUIStore } from "../../store/useUIStore";

function formatDashboardDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

const Dashboard = () => {
  const { currentTeam, saveData, advanceDay } = useCareerStore();
  const getTeamFixturesForDate = useCompetitionsStore((state) => state.getTeamFixturesForDate);
  const getTeamForm = useCompetitionsStore((state) => state.getTeamForm);
  const setScreen = useUIStore((state) => state.setScreen);
  if (!currentTeam || !saveData) return null;

  const isTeamColorBlack = currentTeam.colors.primary[500] === "#000";
  const isTeamColorBlackOrWhite =
    isTeamColorBlack || currentTeam.colors.primary[500] === "#fff";
  const hasUnplayedMatchToday = getTeamFixturesForDate(currentTeam.id, saveData.currentDate)
    .some((fixture) => fixture.status === "not_started");
  const teamForm = getTeamForm(currentTeam.id, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-full w-full overflow-hidden"
    >
      <main className="h-full w-full grid grid-cols-12 grid-rows-6 gap-4 overflow-hidden">
        <header className="col-span-12 row-span-1 bg-[#111] rounded-4xl border border-white/5 flex justify-between items-center px-10">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
              Calendário Oficial
            </span>
            <h2 className="text-xl font-light text-white">
              {formatDashboardDate(saveData.currentDate)}
            </h2>
          </div>

          <button
            onClick={hasUnplayedMatchToday ? () => setScreen("matchday") : advanceDay}
            className={`cursor-pointer ${isTeamColorBlackOrWhite
              ? "bg-white/10 hover:bg-white/20"
              : "bg-(--team-color-600) hover:bg-(--team-color-700)"
              } text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 group`}
          >
            {hasUnplayedMatchToday ? "JOGAR PARTIDA" : "AVANÇAR DIA"}
            <span className="group-hover:translate-x-1 transition-transform">
              <ChevronRIcon />
            </span>
          </button>
        </header>

        <section className="col-span-3 row-span-5 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 bg-[#111] rounded-4xl border border-white/5 p-6 flex flex-col overflow-hidden">
            <h3
              className={`text-[10px] font-black uppercase ${isTeamColorBlack ? "#fff" : "text-(--team-color-400)"
                } mb-4 tracking-widest`}
            >
              Mensagens Diretas
            </h3>
            <div className="flex-1 overflow-y-auto pr-2">
              <div
                className={`bg-white/5 p-3 rounded-2xl border-l-2 ${isTeamColorBlack ? "#fff" : "border-(--team-color-600)"
                  }`}
              >
                <p
                  className={`text-[10px] font-bold ${isTeamColorBlack ? "#fff" : "text-(--team-color-400)"
                    }`}
                >
                  Técnico
                </p>
                <p className="text-[11px] text-gray-400 italic">
                  "Precisamos observar um novo lateral para a reserva do Lepo."
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#111] rounded-4xl border border-white/5 p-6 flex flex-col overflow-hidden">
            <h3 className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-widest">
              Social & Imprensa
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 opacity-80 text-[11px] pr-2">
              <p className="text-white">
                <strong>@TorcidaOrg_ECV:</strong> "A base vem forte! Quando o
                Rene sobe pro profissional em definitivo?"
              </p>
              <p className="text-gray-500 border-t border-white/5 pt-2 italic">
                Entrevista: "Presidente Romeu garante que não venderá joias
                agora."
              </p>
            </div>
          </div>
        </section>

        <section className="col-span-6 row-span-5 flex flex-col gap-4 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 h-44 shrink-0">
            <NextFixture currentTeam={currentTeam} saveData={saveData} />

            <div className="bg-[#111] rounded-4xl border border-white/5 p-5 flex flex-col">
              <h3 className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">
                Últimos 5 Jogos
              </h3>
              <div className="flex gap-2">
                {teamForm.map((res, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white ${res === "V"
                      ? "bg-emerald-500"
                      : res === "E"
                        ? "bg-yellow-500"
                        : res === "D"
                          ? "bg-red-500"
                          : "bg-white/10 text-white/30"
                      }`}
                  >
                    {res}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <WorldFootballNews currentTeam={currentTeam} saveData={saveData} />
          </div>
        </section>

        <section className="col-span-3 row-span-5 flex flex-col gap-4 overflow-hidden">
          <CompetitionTable saveData={saveData} />
          <FeaturedPlayers />
        </section>
      </main>
    </motion.div>
  );
};

export default Dashboard;
