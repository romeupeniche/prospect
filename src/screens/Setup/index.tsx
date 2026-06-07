import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useUIStore } from "../../store/useUIStore";
import { useCareerStore } from "../../store/useCareerStore";
import teams from "../../data/teams.json";
import { HoveringLogo } from "./HoveringLogo";
import MenuBackground from "./MenuBackground";

const titleVariants: Variants = {
    hidden: {
        y: -30,
        opacity: 0,
        scale: 0.95,
    },
    initial: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        y: "30vh",
        scale: 1.1,
        opacity: 0,
        transition: {
            y: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            opacity: { delay: 1, duration: 1 },
        },
    },
};

const menuVariants: Variants = {
    initial: { y: 30, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    exit: { y: 30, opacity: 0, transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] } },
};

const subMenuVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: { y: 20, opacity: 0, transition: { duration: 0.4, ease: [0.7, 0, 0.84, 0] } },
};

export const Setup = () => {
    const { isExiting, startTransition } = useUIStore();
    const { savePath, setSavePath, savesList, fetchSaves, createNewCareer, loadSave } = useCareerStore();

    const [step, setStep] = useState<"menu" | "selectTeam" | "form" | "load" | "options">("menu");
    const [formData, setFormData] = useState({ name: "", teamId: "", saveName: "" });
    const [isLeaving, setIsLeaving] = useState(false);
    const [startSaveTeamColor, setStartSaveTeamColor] = useState<string | null>(null);

    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [selectedSaveIndex, setSelectedSaveIndex] = useState(-1);
    const [language, setLanguage] = useState("PT-BR");

    const menuItems = [
        { id: "load", label: "Continuar Jornada" },
        { id: "selectTeam", label: "Nova Carreira" },
        { id: "options", label: "Opções" },
        { id: "exit", label: "Sair" }
    ];

    useEffect(() => { if (isExiting) setIsLeaving(true); }, [isExiting]);
    useEffect(() => { if (savePath) fetchSaves(); }, [savePath]);

    useEffect(() => {
        if (step === "load") setSelectedSaveIndex(0);
    }, [step]);

    useEffect(() => {
        if (isLeaving) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (step === "menu") {
                if (e.key === "ArrowUp") {
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
                } else if (e.key === "ArrowDown") {
                    setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
                } else if (e.key === "Enter") {
                    const selected = menuItems[selectedIndex];
                    if (selected.id === "exit") {
                        window.close();
                    } else {
                        setStep(selected.id as any);
                    }
                }
            } else if (step === "load") {
                if (savesList.length > 0) {
                    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                        setSelectedSaveIndex((prev) => (prev < savesList.length - 1 ? prev + 1 : 0));
                    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                        setSelectedSaveIndex((prev) => (prev > 0 ? prev - 1 : savesList.length - 1));
                    } else if (e.key === "Enter") {
                        handleLoadSave(savesList[selectedSaveIndex]);
                    }
                }
                if (e.key === "Escape") setStep("menu");
            } else {
                if (e.key === "Escape") setStep("menu");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [step, selectedIndex, selectedSaveIndex, isLeaving, savesList, menuItems]);

    const handleConfirmStart = async () => {
        if (!savePath) return alert("Acesse as Opções e selecione um diretório de saves primeiro!");
        if (!formData.name || !formData.teamId || !formData.saveName) return alert("Preencha todos os campos.");
        await createNewCareer(formData.name, formData.teamId, formData.saveName);
        startTransition("dashboard");
    };

    const handleLoadSave = async (save: any) => {
        const team = teams.find((team) => team.id === save.teamId);
        if (team) {
            const isTeamColorBlackOrWhite = team.colors.primary[500] === "#000" || team.colors.primary[500] === "#fff"
            const _teamColor = isTeamColorBlackOrWhite ? "#fff" : team.colors.primary[500];
            setStartSaveTeamColor(_teamColor);
        }
        await loadSave(save);
        startTransition("dashboard");
    };

    return (
        <MenuBackground>
            <div className="select-none h-screen w-screen bg-transparent text-white flex flex-col items-center overflow-hidden p-[5vh] relative">
                <motion.div
                    variants={titleVariants}
                    initial="hidden"
                    animate={isLeaving ? "exit" : "initial"}
                    className="flex flex-col items-center z-0 relative w-full mt-[5vh]"
                >
                    <div className="relative flex flex-col items-center justify-center w-full">
                        <motion.h1
                            initial={{ color: "oklch(57.7% 0.245 27.325)" }}
                            animate={{ color: startSaveTeamColor ?? "oklch(57.7% 0.245 27.325)" }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="font-science text-[clamp(4rem,13vw,11rem)] font-bold italic tracking-tighter leading-none"
                        >
                            PROSPECT
                        </motion.h1>
                    </div>
                </motion.div>

                <div className="absolute inset-0 z-10">
                    <AnimatePresence mode="wait">
                        {!isLeaving && step === "menu" && (
                            <motion.div
                                key="menu"
                                variants={menuVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                onMouseLeave={() => setSelectedIndex(-1)}
                                className="py-2 absolute left-1/2 -translate-x-1/2 top-1/2 mt-16 -translate-y-1/2 flex flex-col items-center justify-center px-[2vw] gap-[2.5vh] pointer-events-auto transform-gpu"
                            >
                                <motion.div
                                    className="absolute right-0 w-0.5 bg-red-600 rounded-full z-10 will-change-[top,height]"
                                    initial={false}
                                    animate={{
                                        opacity: selectedIndex === -1 ? 0 : 1,
                                        top: `${(selectedIndex / menuItems.length) * 100}%`,
                                        height: `${100 / menuItems.length}%`
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />

                                <motion.div
                                    className="absolute left-0 w-0.5 bg-red-600 rounded-full z-10 will-change-[top,height]"
                                    initial={false}
                                    animate={{
                                        opacity: selectedIndex === -1 ? 0 : 1,
                                        top: `${(selectedIndex / menuItems.length) * 100}%`,
                                        height: `${100 / menuItems.length}%`
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />

                                {menuItems.map((item, index) => (
                                    <button
                                        key={item.id}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onClick={() => {
                                            if (item.id === "exit") window.close();
                                            else setStep(item.id as any);
                                        }}
                                        className={`font-science cursor-pointer text-[clamp(0.9rem,1.2vw,1.5rem)] uppercase tracking-[0.35em] transition-all duration-300 font-medium transform-gpu ${selectedIndex === index
                                            ? "text-white/80 hover:text-white scale-105"
                                            : "text-gray-600 hover:text-gray-400"
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {!isLeaving && step !== "menu" && (
                            <motion.div
                                key="submenu"
                                variants={subMenuVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 w-full max-w-6xl px-[clamp(1rem,4vw,2.5rem)] flex flex-col items-center pointer-events-auto"
                            >
                                {step === "options" && (
                                    <div className="w-full max-w-md space-y-[2vh] flex flex-col items-center">
                                        <h2 className="text-gray-500 uppercase text-[clamp(9px,0.8vw,11px)] font-bold tracking-[0.3em] text-center mb-2">
                                            Opções do Jogo
                                        </h2>
                                        <div className="w-full bg-[#111] p-[2vw] rounded-4xl border border-white/5 space-y-[2.5vh]">
                                            <div className="space-y-2">
                                                <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Idioma</label>
                                                <div className="flex gap-2">
                                                    {['PT-BR', 'EN', 'ES'].map(lang => (
                                                        <button
                                                            key={lang}
                                                            onClick={() => setLanguage(lang)}
                                                            className={`cursor-pointer flex-1 py-[1.2vh] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === lang
                                                                ? 'bg-red-600 text-white border-transparent'
                                                                : 'bg-black border border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
                                                                }`}
                                                        >
                                                            {lang}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Diretório de Saves</label>
                                                <div className="flex flex-col gap-2">
                                                    <div className="w-full bg-black border border-white/10 p-[1.5vh] rounded-xl text-[10px] text-gray-400 break-all font-mono">
                                                        {savePath ? savePath : "Requerido: ~/Documents/Prospect"}
                                                    </div>
                                                    <button
                                                        onClick={setSavePath}
                                                        className="cursor-pointer w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 py-[1.5vh] rounded-xl font-bold uppercase tracking-widest transition-all text-[10px]"
                                                    >
                                                        Definir Diretório Padrão
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setStep("menu")}
                                            className="cursor-pointer text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:scale-105"
                                        >
                                            Voltar ao Menu
                                        </button>
                                    </div>
                                )}

                                {step === "selectTeam" && (
                                    <div className="w-full flex flex-col items-center space-y-[2vh]">
                                        <h2 className="text-gray-500 uppercase text-[clamp(9px,0.8vw,11px)] font-bold tracking-[0.3em] text-center">
                                            Selecione seu Clube
                                        </h2>
                                        <div className="grid grid-cols-6 gap-[1vw] max-h-[35vh] overflow-y-auto p-[1.5vw] bg-white/5 rounded-4xl border border-white/5">
                                            {teams.map((team) => (
                                                <motion.div
                                                    key={team.id}
                                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                                                    onClick={() => { setFormData({ ...formData, teamId: team.id }); setStep("form"); }}
                                                    className="flex flex-col items-center p-[1vw] rounded-2xl border border-transparent cursor-pointer transition-all hover:border-red-600/50"
                                                >
                                                    <img src={team.logo} className="w-[3.5vw] h-[3.5vw] object-contain mb-[0.5vh]" alt={team.name} />
                                                    <span className="text-[clamp(7px,0.7vw,9px)] font-black uppercase text-center leading-tight tracking-wider">{team.name}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setStep("menu")}
                                            className="cursor-pointer text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:scale-105"
                                        >
                                            Voltar ao Menu
                                        </button>
                                    </div>
                                )}

                                {step === "load" && (
                                    <div className="w-full max-w-5xl flex flex-col items-center space-y-[3vh]">
                                        <div className="w-full flex gap-8 overflow-x-auto p-8 items-center justify-center pointer-events-auto">
                                            {savesList.length > 0 ? (
                                                savesList.map((save, i) => {
                                                    const teamInfo = teams.find((t) => t.id === save.teamId);
                                                    const isSelected = selectedSaveIndex === i;
                                                    const isTeamColorBlack = teamInfo?.colors.primary[500] === "#000000"
                                                    const isTeamColorWhite = teamInfo?.colors.primary[500] === "#ffffff"
                                                    const isTeamColorBlackOrWhite = isTeamColorBlack || isTeamColorWhite;

                                                    return (
                                                        <motion.div
                                                            key={i}
                                                            whileHover={{
                                                                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
                                                                transition: { duration: 0.1 },
                                                            }}
                                                            onMouseEnter={() => setSelectedSaveIndex(i)}
                                                            onMouseLeave={() => setSelectedSaveIndex(-1)}
                                                            onClick={() => handleLoadSave(save)}
                                                            className="cursor-pointer flex flex-col items-center justify-between p-[1.8vw] h-80 w-54 shrink-0 rounded-[2.5rem] relative overflow-hidden transition-all duration-300 group border select-none"
                                                            style={{
                                                                background: isSelected
                                                                    ? "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)"
                                                                    : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
                                                                borderColor: isSelected ? (isTeamColorBlackOrWhite ? "color-mix(in oklab, #ffffff  40%, transparent)" : teamInfo?.colors.primary[500]) : "color-mix(in oklab, #ffffff  10%, transparent)",
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-transparent opacity-100 group-hover:scale-105 transition-transform duration-300 pointer-events-none" />

                                                            <div
                                                                style={{
                                                                    background: `color-mix(in oklab, ${teamInfo?.colors.primary[500]} 30%, transparent)`,
                                                                }}
                                                                className={`absolute -inset-10 blur-3xl rounded-full transition-opacity duration-300 pointer-events-none ${isSelected ? "opacity-100" : "opacity-0"}`} />
                                                            <img
                                                                src={teamInfo?.logo}
                                                                alt={teamInfo?.name}
                                                                className="absolute w-full h-auto blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"
                                                            />

                                                            <div className="relative z-10 flex items-center justify-center h-[45%] w-full">
                                                                {teamInfo ? (
                                                                    <img
                                                                        src={teamInfo.logo}
                                                                        alt={teamInfo.name}
                                                                        className="w-25 h-25 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover:scale-105"
                                                                    />
                                                                ) : (
                                                                    <div className="w-[4.5vw] h-[4.5vw] bg-white/5 rounded-full" />
                                                                )}
                                                            </div>

                                                            <div className="relative z-10 flex flex-col items-center w-full space-y-[1vh] mt-auto">
                                                                <div className="text-center space-y-0.5">
                                                                    <p
                                                                        style={{
                                                                            color: isSelected ? (isTeamColorBlackOrWhite ? "#ffffff" : teamInfo?.colors.primary[300]) : "#ffffffee"
                                                                        }}
                                                                        className="font-black italic text-[clamp(1rem,1.3vw,1.25rem)] uppercase tracking-tighter leading-none text-white drop-shadow-md transition-colors duration-300">
                                                                        {save.saveName}
                                                                    </p>
                                                                    <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-[0.18em]">
                                                                        {save.managerName}
                                                                    </p>
                                                                </div>

                                                                <div
                                                                    className="w-full py-2 rounded-2xl border transition-all duration-300"
                                                                    style={{
                                                                        background: isSelected ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.2)",
                                                                        borderColor: isSelected ? `color-mix(in oklab, ${isTeamColorBlackOrWhite ? "#ffffff" : teamInfo?.colors.primary[500]} 30%, transparent)` : "rgba(255,255,255,0.03)"
                                                                    }}
                                                                >
                                                                    <p
                                                                        style={{
                                                                            color: isSelected ? (isTeamColorBlackOrWhite ? "#ffffff" : teamInfo?.colors.primary[300]) : "color-mix(in oklab, oklch(76.5% 0.177 163.223) 90%, transparent)"
                                                                        }}
                                                                        className={`text-[9px] font-black uppercase tracking-[0.2em] text-center transition-colors duration-300 ${isSelected ? "text-red-400" : "text-emerald-400/90"}`}>
                                                                        {save.currentDate}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            ) : (
                                                <div className="w-full text-center py-16 opacity-20 italic text-sm tracking-widest uppercase">
                                                    Nenhum registro de jornada encontrado.
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setStep("menu")}
                                            className="cursor-pointer text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 hover:scale-105"
                                        >
                                            Voltar ao Menu
                                        </button>
                                    </div>
                                )}

                                {step === "form" && (
                                    <div className="w-full max-w-md space-y-[2vh] flex flex-col items-center">
                                        <div className="w-full bg-[#111] p-[2vw] rounded-4xl border border-white/5 space-y-[1.5vh]">
                                            <div className="space-y-1">
                                                <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Nome do Gestor</label>
                                                <input type="text" placeholder="Ex: Romeu Batista" className="w-full bg-black border border-white/10 p-[1.5vh] rounded-xl outline-none focus:border-red-600 transition-colors text-sm" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] uppercase font-bold text-gray-500 ml-2">Identificação do Save</label>
                                                <input type="text" placeholder="Ex: Carreira Principal" className="w-full bg-black border border-white/10 p-[1.5vh] rounded-xl outline-none focus:border-red-600 transition-colors text-sm" onChange={(e) => setFormData({ ...formData, saveName: e.target.value })} />
                                            </div>
                                            <button onClick={handleConfirmStart} className="cursor-pointer w-full bg-red-600 hover:bg-red-700 py-[1.5vh] rounded-xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 text-[11px]">Assumir Comando</button>
                                        </div>
                                        <button onClick={() => setStep("selectTeam")} className="cursor-pointer text-gray-600 text-[10px] font-bold uppercase hover:text-white transition">← Alterar Time</button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>
                    {!isLeaving && (
                        <>
                            <p className="absolute left-10 bottom-16 text-zinc-400">v1.0.0 © {new Date().getFullYear()}</p>
                            <HoveringLogo />
                        </>
                    )}
                </div>
            </div >
        </MenuBackground>
    );
};