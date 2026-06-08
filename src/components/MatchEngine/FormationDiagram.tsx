import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FORMATIONS } from "./Engine";
import { getFitnessColorStyles, getOverallColorStyles } from "../../utils/colorStyles";
import { DiamondIcon } from "../../icons/Diamond";
import { formatPosition } from "../../utils/positionI18n";

export interface FormationPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  photo_url: string | null;
  is_captain: boolean;
  overall: number;
  base_overall?: number;
  natural_position?: string;
  playable_positions?: string[];
  position_penalty?: number;
  position_fit?: string;
  condition: number;
  match_fitness: number
  is_injured?: boolean;
}

interface FormationDiagramProps {
  formation: string;
  players: FormationPlayer[];
  primaryColor: string;
  textColor?: string;
  interactive?: boolean;
  selectedSlotIndex?: number | null;
  onPlayerClick?: (slotIndex: number, player: FormationPlayer) => void;
  onPlayerContextMenu?: (slotIndex: number, player: FormationPlayer) => void;
  onSwapSlots?: (fromSlotIndex: number, toSlotIndex: number) => void;
  language?: string;
}

function groupLine(pos: string): string {
  switch (pos) {
    case "GK": return "GK";
    case "CB": case "RB": case "LB": case "RWB": case "LWB": return "DF";
    case "CDM": case "CM": case "CAM": case "RM": case "LM": return "MF";
    case "RW": case "LW": case "ST": case "CF": case "SS": return "FW";
    default: return "MF";
  }
}

function sidePriority(pos: string): number {
  switch (pos) {
    case "GK": return 0;
    case "RB": case "RWB": case "RM": case "RW": return 10;
    case "CB": case "CDM": case "CM": case "CAM": case "CF": case "ST": case "SS": return 20;
    case "LB": case "LWB": case "LM": case "LW": return 30;
    default: return 20;
  }
}

function assignByPosition(players: FormationPlayer[], formation: string) {
  const slots = FORMATIONS[formation] ?? FORMATIONS["4-3-3"];
  const result: Array<{ player: FormationPlayer; displayX: number; displayY: number; slotIndex: number; line: string }> = [];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const player = players[i] ?? { id: "empty-" + i, name: "", number: 0, position: "" };
    result.push({
      player,
      displayX: slot.diagram.y,
      displayY: 100 - slot.diagram.x,
      slotIndex: i,
      line: slot.line,
    });
  }

  return result;
}

const POSITION_LABEL_MAP: Record<string, string[]> = {
  "4-3-3": ["GOL", "LD", "ZG", "ZG", "LE", "MD", "MC", "ME", "PD", "CA", "PE"],
  "4-4-2": ["GOL", "LD", "ZG", "ZG", "LE", "MD", "MC", "MC", "ME", "AT", "AT"],
  "4-2-3-1": ["GOL", "LD", "ZG", "ZG", "LE", "V1", "V2", "MD", "MO", "ME", "CA"],
  "3-5-2": ["GOL", "ZG", "ZG", "ZG", "AD", "AE", "V", "MC", "MO", "AT", "AT"],
  "4-3-3 Holding": ["GOL", "LD", "ZG", "ZG", "LE", "V", "MC", "MC", "PD", "CA", "PE"],
  "4-3-3 Attack": ["GOL", "LD", "ZG", "ZG", "LE", "MC", "MC", "MO", "PD", "CA", "PE"],
  "4-1-4-1": ["GOL", "LD", "ZG", "ZG", "LE", "V", "MD", "MC", "MC", "ME", "CA"],
  "4-5-1": ["GOL", "LD", "ZG", "ZG", "LE", "MD", "MC", "MC", "MC", "ME", "CA"],
  "4-4-1-1": ["GOL", "LD", "ZG", "ZG", "LE", "MD", "MC", "MC", "ME", "MO", "CA"],
  "4-1-2-1-2": ["GOL", "LD", "ZG", "ZG", "LE", "V", "MC", "MC", "MO", "AT", "AT"],
  "4-3-2-1": ["GOL", "LD", "ZG", "ZG", "LE", "MC", "MC", "MC", "MO", "MO", "CA"],
  "4-2-2-2": ["GOL", "LD", "ZG", "ZG", "LE", "V1", "V2", "MD", "ME", "AT", "AT"],
  "4-2-4": ["GOL", "LD", "ZG", "ZG", "LE", "MC", "MC", "PD", "AT", "AT", "PE"],
  "3-4-3": ["GOL", "ZG", "ZG", "ZG", "AD", "MC", "MC", "AE", "PD", "CA", "PE"],
  "3-4-2-1": ["GOL", "ZG", "ZG", "ZG", "AD", "MC", "MC", "AE", "MO", "MO", "CA"],
  "3-4-1-2": ["GOL", "ZG", "ZG", "ZG", "AD", "MC", "MC", "AE", "MO", "AT", "AT"],
  "5-3-2": ["GOL", "LD", "ZG", "ZG", "ZG", "LE", "MC", "MC", "MC", "AT", "AT"],
  "5-4-1": ["GOL", "LD", "ZG", "ZG", "ZG", "LE", "MD", "MC", "MC", "ME", "CA"],
  "5-2-3": ["GOL", "LD", "ZG", "ZG", "ZG", "LE", "MC", "MC", "PD", "CA", "PE"],
};

const PW = 68;
const PH = 105;
const PA_H = PH * 0.157;
const PA_W = PW * 0.594;
const PA_X = (PW - PA_W) / 2;
const SB_H = PH * 0.057;
const SB_W = PW * 0.265;
const SB_X = (PW - SB_W) / 2;
const CR = PH * 0.090;
const GH = PW * 0.110;
const GW = 2.4;
const GX = (PW - GH) / 2;
const PAD = 3;
const PLAYER_R = 6;
const NAME_LABEL_X = -9;
const NAME_LABEL_Y = PLAYER_R + 0.5;
const NAME_LABEL_WIDTH = 12;
const NAME_LABEL_HEIGHT = 3.5;
const NAME_LABEL_PADDING = 0.75;
const NAME_FONT_SIZE = 2.5;
const NUMBER_LABEL_X = 3;
const NUMBER_LABEL_WIDTH = 6;
const STAMINA_ARC_R = PLAYER_R + 1.15;
const STAMINA_ARC_DROP = 2.2;
const STAMINA_ARC_ANGLE = Math.PI + 2 * Math.asin(STAMINA_ARC_DROP / STAMINA_ARC_R);
const STAMINA_ARC_LENGTH = STAMINA_ARC_ANGLE * STAMINA_ARC_R;

const FALLBACK_PHOTO = "src/assets/players/unknown.png";

function mixChannel(start: number, end: number, amount: number): number {
  return Math.round(start + (end - start) * amount);
}

function mixColor(start: [number, number, number], end: [number, number, number], amount: number): string {
  return `rgb(${mixChannel(start[0], end[0], amount)}, ${mixChannel(start[1], end[1], amount)}, ${mixChannel(start[2], end[2], amount)})`;
}

function staminaRingColor(condition: number): string {
  if (condition <= 50) {
    return mixColor([239, 29, 29], [250, 204, 21], condition / 50);
  }
  return mixColor([250, 204, 21], [34, 233, 66], (condition - 50) / 50);
}

interface PlayerNameLabelProps {
  name: string;
  clipId: string;
  svgX: number;
  svgY: number;
  delay: number;
}

const PlayerNameLabel = ({ name, clipId, svgX, svgY, delay }: PlayerNameLabelProps) => {
  const textRef = useRef<SVGTextElement | null>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);

  useLayoutEffect(() => {
    const textNode = textRef.current;
    if (!textNode) return;

    const measure = () => setMeasuredWidth(textNode.getComputedTextLength());
    measure();
    document.fonts?.ready.then(measure).catch(() => undefined);
  }, [name]);

  const clipLeft = svgX + NAME_LABEL_X + NAME_LABEL_PADDING;
  const clipRight = svgX + NAME_LABEL_X + NAME_LABEL_WIDTH - NAME_LABEL_PADDING;
  const availableWidth = clipRight - clipLeft;
  const nameWidth = measuredWidth || availableWidth;
  const isLong = measuredWidth > 0 && nameWidth > availableWidth;
  const startX = isLong ? clipLeft : (clipLeft + clipRight - nameWidth) / 2;
  const endX = clipRight - nameWidth;
  const travel = Math.max(0, startX - endX);

  return (
    <motion.g clipPath={`url(#${clipId})`}>
      <motion.text
        ref={textRef}
        y={svgY + PLAYER_R + 3.2}
        textAnchor="start"
        fontSize={NAME_FONT_SIZE}
        fontWeight="600"
        fill="white"
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
        initial={{ opacity: 0, x: startX }}
        animate={{
          opacity: 1,
          x: isLong ? [startX, startX, endX, endX] : startX,
        }}
        transition={{
          opacity: {
            delay,
            duration: 0.2,
          },
          x: isLong
            ? {
              repeat: Infinity,
              repeatType: "reverse",
              duration: Math.max(2.7, travel * 0.36),
              ease: "linear",
              delay: 0.55,
              times: [0, 0.2, 0.8, 1],
            }
            : {
              duration: 0,
            },
        }}
        className="font-oswald font-normal"
      >
        {name}
      </motion.text>
    </motion.g>
  );
};

function lineFill(line: string): string {
  switch (line) {
    case "GK": return "#fbbf24";
    case "DF": return "#0284c7";
    case "MF": return "#059669";
    case "FW": return "#e11d48";
    default: return "#6b7280";
  }
}

const FormationDiagram = ({
  formation,
  players,
  primaryColor,
  interactive = false,
  selectedSlotIndex = null,
  onPlayerClick,
  onPlayerContextMenu,
  onSwapSlots,
  language = "pt",
}: FormationDiagramProps) => {
  const [dragSourceSlot, setDragSourceSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const suppressClickRef = useRef(false);
  const positioned = useMemo(() => assignByPosition(players, formation), [players, formation]);
  const labels = POSITION_LABEL_MAP[formation] ?? POSITION_LABEL_MAP["4-3-3"];

  const clipPaths = useMemo(() => {
    return positioned.map((item) => {
      const { player, displayX, displayY } = item;
      const svgX = (displayX / 100) * PW;
      const svgY = (displayY / 100) * PH;
      return (
        <clipPath key={player.id} id={`clip-${player.id}`}>
          <circle cx={svgX} cy={svgY} r={PLAYER_R} />
        </clipPath>
      );
    });
  }, [positioned]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      <svg
        className="w-full h-full"
        viewBox={`${-PAD} ${-GW - PAD} ${PW + 2 * PAD} ${PH + 2 * GW + 2 * PAD}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerUp={() => {
          setDragSourceSlot(null);
          setDragOverSlot(null);
        }}
        onPointerCancel={() => {
          setDragSourceSlot(null);
          setDragOverSlot(null);
        }}
        onPointerLeave={() => {
          setDragSourceSlot(null);
          setDragOverSlot(null);
        }}
      >
        <defs>
          <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="50%" stopColor="#111" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
          <pattern id="stripes" x="0" y="0" width="68" height="10.5" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="68" height="5.25" fill="#111" />
            <rect x="0" y="5.25" width="68" height="5.25" fill="#1a1a1a" />
          </pattern>
          {clipPaths}
        </defs>

        <rect x="0" y="0" width={PW} height={PH} fill="url(#stripes)" />

        <g fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5">
          <rect x="0" y="0" width={PW} height={PH} rx="1" ry="1" />
          <line x1="0" y1={PH / 2} x2={PW} y2={PH / 2} />
          <circle cx={PW / 2} cy={PH / 2} r={CR} />
          <circle cx={PW / 2} cy={PH / 2} r={0.6} fill="rgba(255,255,255,0.55)" />
          <rect x={PA_X} y={PH - PA_H} width={PA_W} height={PA_H} rx="0.3" ry="0.3" />
          <rect x={PA_X} y="0" width={PA_W} height={PA_H} rx="0.3" ry="0.3" />
          <rect x={SB_X} y={PH - SB_H} width={SB_W} height={SB_H} rx="0.2" ry="0.2" />
          <rect x={SB_X} y="0" width={SB_W} height={SB_H} rx="0.2" ry="0.2" />
          <circle cx={PW / 2} cy={PH * 0.107} r={0.5} fill="rgba(255,255,255,0.55)" />
          <circle cx={PW / 2} cy={PH * 0.893} r={0.5} fill="rgba(255,255,255,0.55)" />
          {(() => {
            const R = 2.5;
            const corners = [
              { d: `M ${R} 0 A ${R} ${R} 0 0 1 0 ${R}` },
              { d: `M ${PW - R} 0 A ${R} ${R} 0 0 0 ${PW} ${R}` },
              { d: `M 0 ${PH - R} A ${R} ${R} 0 0 1 ${R} ${PH}` },
              { d: `M ${PW - R} ${PH} A ${R} ${R} 0 0 1 ${PW} ${PH - R}` },
            ];

            return corners.map((c, i) => (
              <path
                key={i}
                d={c.d}
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="0.5"
              />
            ));
          })()}
        </g>

        <g stroke="rgba(255,255,255,0.7)" strokeWidth="0.6">
          <rect x={GX} y={-GW} width={GH} height={GW} fill="rgba(255,255,255,0.12)" rx="0.2" ry="0.2" />
          <rect x={GX} y={PH} width={GH} height={GW} fill="rgba(255,255,255,0.12)" rx="0.2" ry="0.2" />
        </g>

        {positioned.map((item, i) => {
          if (!item || item.player.id.startsWith("empty-")) return null;

          const { player, displayX, displayY, slotIndex, line } = item;
          const svgX = (displayX / 100) * PW;
          const svgY = (displayY / 100) * PH;
          const fill = lineFill(line);
          const isSelected = interactive && selectedSlotIndex === slotIndex;
          const isDragSource = interactive && dragSourceSlot === slotIndex;
          const isDragOver = interactive && dragOverSlot === slotIndex && dragSourceSlot !== slotIndex;
          const showStaminaRing = !(isSelected || isDragSource || isDragOver);
          const staminaArcEndX = Math.sqrt(Math.max(0, STAMINA_ARC_R ** 2 - STAMINA_ARC_DROP ** 2));
          const staminaArcY = svgY + STAMINA_ARC_DROP;
          const staminaArcPath = `M ${svgX - staminaArcEndX} ${staminaArcY} A ${STAMINA_ARC_R} ${STAMINA_ARC_R} 0 1 1 ${svgX + staminaArcEndX} ${staminaArcY}`;

          return (
            <g
              key={player.id}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              style={{ cursor: interactive ? "grab" : "default", outline: "none" }}
              onClick={(event) => {
                if (!interactive) return;
                event.stopPropagation();
                if (suppressClickRef.current) {
                  suppressClickRef.current = false;
                  return;
                }
                onPlayerClick?.(slotIndex, player);
              }}
              onContextMenu={(event) => {
                if (!interactive) return;
                event.preventDefault();
                event.stopPropagation();
                onPlayerContextMenu?.(slotIndex, player);
              }}
              onPointerDown={(event) => {
                if (!interactive || event.button !== 0) return;
                setDragSourceSlot(slotIndex);
                setDragOverSlot(slotIndex);
              }}
              onPointerEnter={() => {
                if (!interactive || dragSourceSlot === null) return;
                setDragOverSlot(slotIndex);
              }}
              onPointerLeave={() => {
                if (!interactive || dragSourceSlot === null) return;
                setDragOverSlot(dragSourceSlot);
              }}
              onPointerUp={(event) => {
                if (!interactive || dragSourceSlot === null) return;
                event.stopPropagation();
                if (dragSourceSlot !== slotIndex) {
                  suppressClickRef.current = true;
                  onSwapSlots?.(dragSourceSlot, slotIndex);
                }
                setDragSourceSlot(null);
                setDragOverSlot(null);
              }}
              onPointerCancel={() => {
                setDragSourceSlot(null);
                setDragOverSlot(null);
              }}
            >
              <defs>
                <clipPath id={`name-clip-${player.id}`}>
                  <rect
                    x={svgX + NAME_LABEL_X}
                    y={svgY + NAME_LABEL_Y}
                    width={NAME_LABEL_WIDTH}
                    height={NAME_LABEL_HEIGHT}
                    rx={0}
                  />
                </clipPath>

                <clipPath id={`number-clip-${player.id}`}>
                  <rect
                    x={svgX + NUMBER_LABEL_X}
                    y={svgY + NAME_LABEL_Y}
                    width={NUMBER_LABEL_WIDTH}
                    height={NAME_LABEL_HEIGHT}
                    rx={0}
                  />
                </clipPath>
              </defs>

              <motion.circle
                cx={svgX}
                cy={svgY}
                r={PLAYER_R}
                fill={isDragOver ? "#ffffff" : fill}
                initial={{ opacity: 0, r: 0 }}
                animate={{
                  opacity: isSelected || isDragSource || isDragOver ? 0.75 : 0.5,
                  r: isSelected || isDragSource || isDragOver ? PLAYER_R + 1 : PLAYER_R,
                }}
                transition={{
                  delay: 0.03 * i,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              />

              <motion.image
                href={player.photo_url ?? FALLBACK_PHOTO}
                x={svgX - PLAYER_R}
                y={svgY - PLAYER_R}
                width={PLAYER_R * 2}
                height={PLAYER_R * 2}
                preserveAspectRatio="xMidYMid slice"
                initial={{ opacity: 0 }}
                animate={{ opacity: isDragSource ? 0.65 : 1 }}
                transition={{ delay: 0.04 * i, duration: 0.3 }}
              />

              <motion.path
                d={staminaArcPath}
                fill="none"
                stroke="rgba(0,0,0,0.45)"
                strokeWidth={0.45}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: showStaminaRing ? 0.5 : 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ pointerEvents: "none" }}
              />

              <motion.path
                d={staminaArcPath}
                fill="none"
                stroke={staminaRingColor(player.condition)}
                strokeWidth={0.65}
                strokeLinecap="round"
                strokeDasharray={`${STAMINA_ARC_LENGTH} ${STAMINA_ARC_LENGTH}`}
                initial={{
                  opacity: 0,
                  strokeDashoffset: STAMINA_ARC_LENGTH,
                }}
                animate={{
                  opacity: showStaminaRing ? 1 : 0,
                  strokeDashoffset: STAMINA_ARC_LENGTH * (1 - player.condition / 100),
                  stroke: staminaRingColor(player.condition),
                }}
                transition={{
                  opacity: { duration: 0.2, ease: "easeOut" },
                  strokeDashoffset: { delay: 0.08 * i, duration: 0.55, ease: "easeOut" },
                  stroke: { delay: 0.08 * i, duration: 0.25, ease: "easeOut" },
                }}
                style={{ pointerEvents: "none" }}
              />

              {interactive && (isSelected || isDragOver) && (
                <motion.circle
                  cx={svgX}
                  cy={svgY}
                  r={PLAYER_R + 1.6}
                  fill="none"
                  stroke={isDragOver ? "#ffffff" : primaryColor}
                  strokeWidth={0.8}
                  strokeDasharray="1.8 1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}

              <motion.rect
                x={svgX + NAME_LABEL_X}
                y={svgY + NAME_LABEL_Y}
                width={18}
                height={NAME_LABEL_HEIGHT}
                fill={primaryColor}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.07 * i, duration: 0.2 }}
              />

              <motion.rect
                x={svgX + NUMBER_LABEL_X}
                y={svgY + NAME_LABEL_Y}
                width={NUMBER_LABEL_WIDTH}
                height={NAME_LABEL_HEIGHT}
                fill="rgba(0,0,0)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.07 * i, duration: 0.2 }}
              />

              <PlayerNameLabel
                name={player.name}
                clipId={`name-clip-${player.id}`}
                svgX={svgX}
                svgY={svgY}
                delay={0.08 * i}
              />

              <motion.g clipPath={`url(#number-clip-${player.id})`}>
                <motion.text
                  x={svgX + 6}
                  y={svgY + PLAYER_R + 3.5}
                  textAnchor="middle"
                  fontSize="3"
                  fontWeight="900"
                  fill={primaryColor}
                  style={{
                    pointerEvents: "none",
                    userSelect: "none"
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08 * i, duration: 0.2 }}
                  className="font-oswald font-black"
                >
                  {player.number}
                </motion.text>
              </motion.g>

              <motion.text
                x={svgX}
                y={svgY + PLAYER_R + 5.4}
                textAnchor="middle"
                fontSize="1.6"
                fontWeight="800"
                fill="rgba(255,255,255,0.5)"
                style={{ pointerEvents: "none", userSelect: "none" }}
                letterSpacing="0.3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.09 * i, duration: 0.2 }}
              >
                {formatPosition(labels[slotIndex], language) || "—"}
              </motion.text>
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.09 * i, duration: 0.2 }}
                className={getOverallColorStyles(player.overall).color}
              >
                <motion.text
                  x={svgX + 6}
                  y={svgY + PLAYER_R}
                  textAnchor="middle"
                  fontSize="3.5"
                  fontWeight="800"
                  fill="currentColor"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                  // letterSpacing="0.3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.09 * i, duration: 0.2 }}
                  className={getOverallColorStyles(player.overall).color}
                >
                  {player.overall}
                </motion.text>
                <g transform={`translate(${svgX - 8.6}, ${svgY + PLAYER_R - 3})`}>
                  {(player.position_penalty ?? 0) > 0 ? (
                    <>
                      <motion.g
                        animate={{ opacity: [1, 1, 0, 0, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          times: [0, 0.58, 0.68, 0.84, 1],
                          ease: "easeInOut",
                        }}
                      >
                        <DiamondIcon
                          width="3.5"
                          height="3.5"
                          fill="currentColor"
                          className={getFitnessColorStyles(player.match_fitness).color}
                        />
                      </motion.g>
                      <motion.text
                        x="1.75"
                        y="2.85"
                        textAnchor="middle"
                        fontSize="2.6"
                        fontWeight="900"
                        fill="#f00"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                        animate={{
                          opacity: [0, 0, 1, 1, 0],
                          scale: [0.96, 0.96, 1.08, 1, 0.96],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          times: [0, 0.64, 0.72, 0.86, 1],
                          ease: "easeInOut",
                        }}
                      >
                        -{player.position_penalty}
                      </motion.text>
                    </>
                  ) : (
                    <DiamondIcon
                      width="3.5"
                      height="3.5"
                      fill="currentColor"
                      className={getFitnessColorStyles(player.match_fitness).color}
                    />
                  )}
                </g>
              </motion.g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export function sortPlayersByFormation(players: FormationPlayer[], formation: string): FormationPlayer[] {
  const slots = FORMATIONS[formation] ?? FORMATIONS["4-3-3"];

  const grouped: Record<string, FormationPlayer[]> = {};
  for (const p of players) {
    const line = groupLine(p.position);
    if (!grouped[line]) grouped[line] = [];
    grouped[line].push(p);
  }

  for (const g of Object.values(grouped)) {
    g.sort((a, b) => sidePriority(a.position) - sidePriority(b.position));
  }

  const taken = new Set<string>();
  const lineCounts: Record<string, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
  const result: FormationPlayer[] = [];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const line = slot.line;
    const idx = lineCounts[line];
    lineCounts[line] = idx + 1;

    const group = grouped[line] ?? [];
    if (idx < group.length) {
      const p = group[idx];
      taken.add(p.id);
      result.push(p);
    }
  }

  const remaining = players.filter((p) => !taken.has(p.id));
  result.push(...remaining);

  return result;
}

export default FormationDiagram;
