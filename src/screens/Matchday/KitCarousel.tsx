import { motion } from "framer-motion";
import { ChevronRIcon } from "../../icons/ChevronR";

interface Uniform {
    image: string;
    pattern: "hoops" | "halves" | "graphic" | "striped" | "solid";
    kit_group: "white" | "colored" | "black";
    base_colors: string[];
    hex_colors: {
        primary: string;
        secondary: string;
        detail: string;
    };
    tone: number;
}

interface KitCarouselProps {
    teamName: string;
    teamImage: string;
    uniforms: Record<string, Uniform | any>;
    selectedKit: "home" | "away" | "third";
    onSelectKit: (kit: "home" | "away" | "third") => void;
}

const KitCarousel = ({ teamName, uniforms, selectedKit, onSelectKit, teamImage }: KitCarouselProps) => {
    const kitOrder: ("home" | "away" | "third")[] = ["home", "away", "third"];
    const currentIndex = kitOrder.indexOf(selectedKit);

    const handlePrev = () => {
        const nextIdx = (currentIndex - 1 + kitOrder.length) % kitOrder.length;
        onSelectKit(kitOrder[nextIdx]);
    };

    const handleNext = () => {
        const nextIdx = (currentIndex + 1) % kitOrder.length;
        onSelectKit(kitOrder[nextIdx]);
    };

    return (
        <div className="flex flex-col items-center w-full py-1 xl:py-2 overflow-hidden select-none flex-1 min-h-0 justify-center">
            <header className="flex items-center justify-between w-full xl:px-4 mb-2 xl:mb-4 shrink-0">
                <button
                    onClick={handlePrev}
                    className="w-7 h-7 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer active:scale-90"
                >
                    <ChevronRIcon className="w-5 h-5 rotate-180" />
                </button>

                <div className="flex flex-col items-center relative">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center max-w-35 truncate">
                        {selectedKit === "home" ? "Titular" : selectedKit === "away" ? "Reserva" : "Alternativo"}
                    </span>
                </div>

                <button
                    onClick={handleNext}
                    className="w-7 h-7 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer active:scale-90"
                >
                    <ChevronRIcon className="w-5 h-5" />
                </button>
            </header>

            <div className="relative w-full h-24 sm:h-28 md:h-32 xl:h-36 flex-1 min-h-0 flex items-center justify-center">
                <img src={teamImage} className="absolute opacity-10 w-auto h-full top-1/2 right-0 translate-x-1/2 -translate-y-1/2" />
                <img src={teamImage} className="absolute opacity-10 w-auto h-full top-1/2 left-0 -translate-x-1/2 -translate-y-1/2" />
                {kitOrder.map((kitType) => {
                    const kitData = uniforms[kitType];
                    if (!kitData || !kitData.hex_colors) return null;

                    const kitIdx = kitOrder.indexOf(kitType);

                    let diff = kitIdx - currentIndex;
                    if (diff < -1) diff += kitOrder.length;
                    if (diff > 1) diff -= kitOrder.length;

                    const isSelected = diff === 0;
                    const isLeft = diff === -1;
                    const isRight = diff === 1;

                    let zIndex = isSelected ? 20 : 10;
                    let translateX = "0%";
                    let scale = 1;

                    if (isLeft) {
                        translateX = "-55%";
                        scale = 0.75;
                    } else if (isRight) {
                        translateX = "55%";
                        scale = 0.75;
                    }

                    return (
                        <motion.button
                            key={kitType}
                            onClick={() => onSelectKit(kitType)}
                            style={{ zIndex }}
                            animate={{
                                x: translateX,
                                scale: scale,
                                filter: isSelected ? "drop-shadow(0 15px 15px rgba(0,0,0,0.5))" : "brightness(0.4) drop-shadow(0 0 0 rgba(0,0,0,0))"
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            className="absolute w-auto h-full rounded-3xl p-3 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            {isSelected && <div
                                style={{
                                    backgroundColor: kitData.hex_colors.primary
                                }}
                                className="transition-all absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-1 w-[70%] h-[70%] rounded-full blur-xl opacity-75" />}
                            <img
                                src={kitData.image}
                                className="max-h-full max-w-full object-contain pointer-events-none"
                                alt={`${teamName} ${kitType}`}
                            />
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default KitCarousel;