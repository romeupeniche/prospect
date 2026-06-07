import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Dashboard from "./screens/Dashboard";
import { Setup } from "./screens/Setup";
import { useCareerStore } from "./store/useCareerStore";
import { useUIStore } from "./store/useUIStore";
import Matchday from "./screens/Matchday";
import Squad from "./screens/Squad";
import MessagesScreen from "./screens/MessagesScreen";
import Calendar from "./screens/Calendar";

function App() {
  const { currentScreen, isExiting } = useUIStore();
  const currentTeam = useCareerStore((state) => state.currentTeam);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "dashboard": return <Dashboard />;
      case "matchday": return <Matchday />;
      case "calendar": return <Calendar />;
      case "team": return <Squad />;
      case "tables": return <div className="p-8">Tabelas</div>;
      case "market": return <div className="p-8">Mercado</div>;
      case "settings": return <div className="p-8">Configurações</div>;
      case "messages": return <MessagesScreen />;
      default: return <Dashboard />;
    }
  };

  return (
    <div
      className="select-none h-screen w-screen bg-[#050505] overflow-hidden relative cursor-default text-white"
      style={currentScreen === "setup" || !currentTeam ? {} : {
        "--team-color-300": currentTeam.colors.primary[300],
        "--team-color-400": currentTeam.colors.primary[400],
        "--team-color-500": currentTeam.colors.primary[500],
        "--team-color-600": currentTeam.colors.primary[600],
        "--team-color-700": currentTeam.colors.primary[700],
      } as React.CSSProperties}
    >
      <AnimatePresence mode="wait">
        {(currentScreen === "setup" || !currentTeam) && (
          <motion.div
            key="setup-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-50"
          >
            <Setup />
          </motion.div>
        )}
      </AnimatePresence>

      {(currentScreen !== "setup" || isExiting) && currentTeam && (
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{
            opacity: 1,
            filter: isExiting ? "blur(10px)" : "blur(0px)",
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="flex h-screen w-screen p-4 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-full shrink-0"
          >
            <Sidebar currentTeam={currentTeam} />
          </motion.div>

          <main className="flex-1 h-full overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen == "setup" ? "dashboard" : currentScreen}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full w-full"
              >
                {renderCurrentScreen()}
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      )}
    </div>
  );
}

export default App;
