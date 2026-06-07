import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const EmberCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf: number;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        type Ember = {
            x: number; y: number;
            vx: number; vy: number;
            alpha: number; decay: number;
            size: number; flicker: number; fSpeed: number;
        };

        const pool: Ember[] = [];
        const MAX = 110;

        const spawn = (): Ember => ({
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -(0.3 + Math.random() * 0.7),
            alpha: 0.55 + Math.random() * 0.45,
            decay: 0.0015 + Math.random() * 0.002,
            size: 0.9 + Math.random() * 1.8,
            flicker: Math.random() * Math.PI * 2,
            fSpeed: 0.04 + Math.random() * 0.07,
        });

        for (let i = 0; i < MAX; i++) {
            const e = spawn();
            e.y = Math.random() * canvas.height;
            e.alpha *= Math.random() * 0.6;
            pool.push(e);
        }

        const frame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const deficit = MAX - pool.length;
            for (let i = 0; i < Math.min(deficit, 3); i++) pool.push(spawn());

            for (let i = pool.length - 1; i >= 0; i--) {
                const e = pool[i];
                e.x += e.vx;
                e.y += e.vy;
                e.alpha -= e.decay;
                e.flicker += e.fSpeed;
                e.vx += (Math.random() - 0.5) * 0.01;
                e.vx *= 0.996;

                if (e.alpha <= 0 || e.y < -20) { pool.splice(i, 1); continue; }

                const flick = 0.75 + Math.sin(e.flicker) * 0.25;
                const a = Math.max(0, e.alpha) * flick;
                const sz = e.size * (0.85 + flick * 0.15);

                const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, sz * 5.5);
                glow.addColorStop(0, `rgba(220,38,38,${a * 0.4})`);
                glow.addColorStop(0.4, `rgba(180,20,20,${a * 0.12})`);
                glow.addColorStop(1, `rgba(180,20,20,0)`);
                ctx.beginPath();
                ctx.arc(e.x, e.y, sz * 5.5, 0, Math.PI * 2);
                ctx.fillStyle = glow;
                ctx.fill();

                const core = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, sz * 1.1);
                core.addColorStop(0, `rgba(255,220,180,${a})`);
                core.addColorStop(0.4, `rgba(240,80,40,${a * 0.9})`);
                core.addColorStop(1, `rgba(180,20,20,0)`);
                ctx.beginPath();
                ctx.arc(e.x, e.y, sz * 1.1, 0, Math.PI * 2);
                ctx.fillStyle = core;
                ctx.fill();
            }

            raf = requestAnimationFrame(frame);
        };

        raf = requestAnimationFrame(frame);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 1,
            }}
        />
    );
};

const ambientGlows = [
    {
        key: "glow-a",
        style: { left: "10%", bottom: "-10%", width: "55%", height: "55%", background: "radial-gradient(ellipse, rgba(185,28,28,0.18) 0%, rgba(185,28,28,0) 70%)" },
        animate: { x: [0, 30, -20, 0], y: [0, -25, 10, 0], scale: [1, 1.08, 0.96, 1] },
        duration: 18,
    },
    {
        key: "glow-b",
        style: { right: "5%", bottom: "-15%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(220,38,38,0.13) 0%, rgba(220,38,38,0) 70%)" },
        animate: { x: [0, -40, 15, 0], y: [0, -15, 25, 0], scale: [1, 0.94, 1.06, 1] },
        duration: 22,
    },
    {
        key: "glow-c",
        style: { left: "38%", bottom: "-20%", width: "40%", height: "45%", background: "radial-gradient(ellipse, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0) 70%)" },
        animate: { x: [0, 20, -30, 0], y: [0, -30, -10, 0], scale: [1, 1.05, 0.97, 1] },
        duration: 26,
    },
];

const STROKE = "rgba(255,255,255,0.08)";
const STROKE_W = 1.5;

const PW = 1600 * 0.88;
const PH = 900 * 0.72;
const PX = (1600 - PW) / 2;
const PY = (900 - PH) / 2;

const scale = (realMetres: number, axis: "w" | "h") =>
    axis === "w" ? (realMetres / 105) * PW : (realMetres / 68) * PH;

const PA_W = scale(16.5, "h");
const PA_H = scale(40.32, "w");

const GA_W = scale(5.5, "h");
const GA_H = scale(18.32, "w");

const CC_R = scale(9.15, "w");

const SPOT = scale(11, "h");

const PitchSVG = () => (
    <svg
        viewBox="0 0 1600 900"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
        aria-hidden="true"
    >
        <g stroke={STROKE} strokeWidth={STROKE_W} fill="none">

            {/* Outer boundary */}
            <rect x={PX} y={PY} width={PW} height={PH} />

            {/* Halfway line */}
            <line x1={PX + PW / 2} y1={PY} x2={PX + PW / 2} y2={PY + PH} />

            {/* Centre circle */}
            <circle cx={PX + PW / 2} cy={PY + PH / 2} r={CC_R} />

            {/* Centre spot */}
            <circle cx={PX + PW / 2} cy={PY + PH / 2} r={3} fill={STROKE} stroke="none" />

            {/* LEFT PENALTY AREA */}
            <rect
                x={PX}
                y={PY + (PH - PA_H) / 2}
                width={PA_W}
                height={PA_H}
            />

            {/* Left goal area */}
            <rect
                x={PX}
                y={PY + (PH - GA_H) / 2}
                width={GA_W}
                height={GA_H}
            />

            {/* Left penalty spot */}
            <circle cx={PX + SPOT} cy={PY + PH / 2} r={3} fill={STROKE} stroke="none" />

            {/* Left penalty arc (only portion outside penalty box) */}
            <path
                d={describeArc(PX + SPOT, PY + PH / 2, CC_R, -52, 52)}
            />

            <path
                d={describeArc(PX + PW - SPOT, PY + PH / 2, CC_R, 128, 232)}
            />

            {/* RIGHT PENALTY AREA */}
            <rect
                x={PX + PW - PA_W}
                y={PY + (PH - PA_H) / 2}
                width={PA_W}
                height={PA_H}
            />

            {/* Right goal area */}
            <rect
                x={PX + PW - GA_W}
                y={PY + (PH - GA_H) / 2}
                width={GA_W}
                height={GA_H}
            />

            {/* Right penalty spot */}
            <circle cx={PX + PW - SPOT} cy={PY + PH / 2} r={3} fill={STROKE} stroke="none" />

            {/* Right penalty arc */}
            <path
                d={describeArc(PX + PW - SPOT, PY + PH / 2, CC_R, 128, 232)}
            />

            {/* Corner arcs — radius 1m */}
            {[
                [PX, PY, 0, 90],
                [PX + PW, PY, 90, 180],
                [PX + PW, PY + PH, 180, 270],
                [PX, PY + PH, 270, 360],
            ].map(([cx, cy, start, end], i) => (
                <path key={i} d={describeArc(cx as number, cy as number, scale(1, "w"), start as number, end as number)} />
            ))}

        </g>
    </svg>
);

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export const MenuBackground = ({ children }: { children?: React.ReactNode }) => {
    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">

            <div className="relative w-full aspect-video max-h-screen overflow-hidden">

                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 120% 90% at 50% 110%, rgba(60,10,10,0.08) 0%, rgba(10,4,4,1) 55%, rgba(0,0,0,1) 100%)",
                        zIndex: 0,
                    }}
                />

                <PitchSVG />

                {ambientGlows.map(({ key, style, animate, duration }) => (
                    <motion.div
                        key={key}
                        style={{ position: "absolute", pointerEvents: "none", zIndex: 2, ...style }}
                        animate={animate}
                        transition={{ duration, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
                    />
                ))}

                <EmberCanvas />

                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.65) 100%)",
                        zIndex: 3,
                    }}
                />

                <div className="relative z-10 w-full h-full">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default MenuBackground;