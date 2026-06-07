import { useState } from "react";
import { motion } from "framer-motion";

export const HoveringLogo = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="absolute right-10 bottom-10 w-20 h-20 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                src="/credit.png"
                className="absolute w-15 opacity-50 rounded-full group-hover:opacity-100 transition-opacity"
            />

            <motion.img
                src="/credit_name.png"
                className="absolute w-15 opacity-10 rounded-full group-hover:opacity-100 transition-opacity duration-300"
                initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
                animate={{
                    clipPath: isHovered ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)"
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
    );
};