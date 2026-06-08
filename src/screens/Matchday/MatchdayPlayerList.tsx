import { FormationPlayer } from "../../components/MatchEngine/FormationDiagram";
import { CloseIcon } from "../../icons/Close";
import { DiamondIcon } from "../../icons/Diamond";
import { TransferIcon } from "../../icons/Transfer";
import { getFitnessColorStyles, getOverallColorStyles } from "../../utils/colorStyles";
import { formatPosition } from "../../utils/positionI18n";

type MatchdayListMode = "field" | "bench";

interface MatchdayPlayerListProps {
    mode: MatchdayListMode;
    players: FormationPlayer[];
    labels?: string[];
    side: "home" | "away";
    canEdit: boolean;
    positionLanguage: string;
    subTarget: string | null;
    benchEditTarget: string | null;
    substitutionOptions: FormationPlayer[];
    relationOptions: FormationPlayer[];
    onToggleSubTarget: (key: string | null) => void;
    onToggleBenchTarget: (key: string | null) => void;
    onSubstitute: (benchPlayerId: string, starterSlotIndex: number, side: "home" | "away") => void;
    onReplaceBenchPlayer: (benchPlayerId: string, incomingPlayerId: string, side: "home" | "away") => void;
    onPlayerContextMenu: (slotIndex: number, player: FormationPlayer) => void;
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

function conditionColor(condition: number): string {
    const hue = Math.round((condition / 100) * 120);
    return `hsl(${hue}, 82%, 55%)`;
}

function lineColor(line: string): string {
    switch (line) {
        case "GK": return "bg-amber-400";
        case "DF": return "bg-sky-500";
        case "MF": return "bg-emerald-500";
        case "FW": return "bg-rose-500";
        default: return "bg-gray-400";
    }
}

function lineTextColor(line: string): string {
    switch (line) {
        case "GK": return "text-amber-300";
        case "DF": return "text-sky-300";
        case "MF": return "text-emerald-300";
        case "FW": return "text-rose-300";
        default: return "text-gray-300";
    }
}

const POSITION_AFFINITY_GROUPS = [
    ["GK"],
    ["CB", "LCB", "RCB"],
    ["LB", "LWB"],
    ["RB", "RWB"],
    ["CDM", "DM"],
    ["CM", "LCM", "RCM"],
    ["CAM", "AM", "SS"],
    ["LM", "LW"],
    ["RM", "RW"],
    ["ST", "CF"],
];

const POSITION_FALLBACK_GROUPS: Record<string, string[]> = {
    LW: ["RW", "ST", "CF", "SS"],
    LM: ["RM", "LW", "RW", "ST", "CF", "SS"],
    RW: ["LW", "ST", "CF", "SS"],
    RM: ["LM", "RW", "LW", "ST", "CF", "SS"],
    ST: ["CF", "SS", "LW", "RW", "LM", "RM"],
    CF: ["ST", "SS", "LW", "RW", "LM", "RM"],
    SS: ["CF", "ST", "CAM", "AM", "LW", "RW"],
    LB: ["LWB", "RB", "RWB", "CB", "LCB", "RCB"],
    LWB: ["LB", "RWB", "RB", "LW", "LM"],
    RB: ["RWB", "LB", "LWB", "CB", "LCB", "RCB"],
    RWB: ["RB", "LWB", "LB", "RW", "RM"],
    CB: ["LCB", "RCB", "LB", "RB", "CDM", "DM"],
    LCB: ["CB", "RCB", "LB", "CDM", "DM"],
    RCB: ["CB", "LCB", "RB", "CDM", "DM"],
    CDM: ["DM", "CM", "LCM", "RCM", "CB"],
    DM: ["CDM", "CM", "LCM", "RCM", "CB"],
    CM: ["LCM", "RCM", "CDM", "DM", "CAM", "AM", "LM", "RM"],
    LCM: ["CM", "RCM", "CDM", "DM", "CAM", "AM", "LM"],
    RCM: ["CM", "LCM", "CDM", "DM", "CAM", "AM", "RM"],
    CAM: ["AM", "CM", "LCM", "RCM", "SS", "LM", "RM"],
    AM: ["CAM", "CM", "LCM", "RCM", "SS", "LM", "RM"],
};

function normalizePosition(position: string): string {
    return position.trim().toUpperCase();
}

function positionAffinityScore(targetPosition: string, candidatePosition: string): number {
    const target = normalizePosition(targetPosition);
    const candidate = normalizePosition(candidatePosition);
    if (target === candidate) return 0;

    const targetGroup = POSITION_AFFINITY_GROUPS.find((group) => group.includes(target));
    if (targetGroup?.includes(candidate)) return 1;
    if (POSITION_FALLBACK_GROUPS[target]?.includes(candidate)) return 2;

    if (groupLine(target) === groupLine(candidate)) return 3;
    return 4;
}

export function sortOptionsForTarget(options: FormationPlayer[], targetPosition: string): FormationPlayer[] {
    return options
        .map((option, index) => ({ option, index }))
        .sort((a, b) => {
            const affinityDiff =
                positionAffinityScore(targetPosition, a.option.position) -
                positionAffinityScore(targetPosition, b.option.position);
            if (affinityDiff !== 0) return affinityDiff;
            return a.index - b.index;
        })
        .map(({ option }) => option);
}

interface PlayerChoicePanelProps {
    title: string;
    emptyText: string;
    options: FormationPlayer[];
    targetPosition: string;
    positionLanguage: string;
    onChoose: (player: FormationPlayer) => void;
}

const PlayerChoicePanel = ({
    title,
    emptyText,
    options,
    targetPosition,
    positionLanguage,
    onChoose,
}: PlayerChoicePanelProps) => {
    const sortedOptions = sortOptionsForTarget(options, targetPosition);

    return (
        <div className="rounded-2xl border border-white/10 bg-[#090909]/95 p-3 shadow-2xl shadow-black/50">
            <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">{title}</p>
                <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[8px] font-black text-gray-500">{options.length}</span>
            </div>
            {options.length === 0 ? (
                <p className="rounded-xl bg-white/3 px-3 py-3 text-[10px] font-bold text-gray-500">{emptyText}</p>
            ) : (
                <div className="max-h-56 overflow-y-auto pr-1">
                    {sortedOptions.map((option) => {
                        const line = groupLine(option.position);
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => onChoose(option)}
                                className="mb-1 flex w-full cursor-pointer items-center gap-2 rounded-xl bg-white/[0.035] px-2.5 py-2 text-left text-white transition hover:bg-white/10 active:scale-[0.99]"
                            >
                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                                    {option.photo_url ? (
                                        <img src={option.photo_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[9px] font-black text-white/50">{option.number}</div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[10px] font-black leading-tight">
                                        <span className="text-white/45">#{option.number}</span> {option.name}
                                    </p>
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className={`text-[7px] font-black uppercase ${lineTextColor(line)}`}>
                                            {formatPosition(option.position, positionLanguage)}
                                        </span>
                                        {option.is_injured && (
                                            <span className="rounded-md bg-red-500/15 px-1 py-0.5 text-[7px] font-black uppercase text-red-300">
                                                Les
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className={`shrink-0 text-[13px] font-black ${getOverallColorStyles(option.overall).color}`}>
                                    {option.overall}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

interface PlayerListRowProps {
    player: FormationPlayer;
    label: string;
    actionActive: boolean;
    actionDisabled: boolean;
    actionTitle: string;
    positionLanguage: string;
    onAction: () => void;
    onPlayerContextMenu: () => void;
}

const PlayerListRow = ({
    player,
    label,
    actionActive,
    actionDisabled,
    actionTitle,
    positionLanguage,
    onAction,
    onPlayerContextMenu,
}: PlayerListRowProps) => {
    const line = groupLine(player.position);
    const playerOverallTextColor = getOverallColorStyles(player.overall).color;
    const playerMatchFitnessTextColor = getFitnessColorStyles(player.match_fitness).color;

    return (
        <div
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlayerContextMenu();
            }}
            className="group relative flex items-center gap-2 rounded-lg bg-white/4 py-1.5 pl-3 pr-2 transition-colors hover:bg-white/[0.07]">
            <div className="absolute bottom-1.5 left-1 top-1.5 w-0.5 overflow-hidden rounded-full bg-white/8">
                <div
                    className="absolute bottom-0 left-0 right-0 rounded-full transition-[height,background-color] duration-300"
                    style={{
                        height: `${player.condition}%`,
                        backgroundColor: conditionColor(player.condition),
                    }}
                />
            </div>
            <span className={`relative w-7 shrink-0 text-center text-[10px] font-black uppercase ${lineTextColor(line)}`}>
                <span className={`${!actionDisabled ? "transition-opacity group-hover:opacity-0" : ""} ${actionActive ? "opacity-0" : ""}`}>
                    {formatPosition(label, positionLanguage)}
                </span>
                {!actionDisabled && (
                    <button
                        type="button"
                        onClick={onAction}
                        title={actionTitle}
                        className={`absolute left-1/2 top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-lg transition-opacity ${actionActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                        {actionActive ? <CloseIcon className="h-5 w-5 text-white" /> : <TransferIcon className="h-5 w-5 text-white" />}
                    </button>
                )}
            </span>
            <div className="h-10 w-10 shrink-0 overflow-hidden">
                {player.photo_url ? (
                    <img src={player.photo_url} alt="" className="h-full w-full object-cover pointer-events-none" />
                ) : (
                    <div className={`flex h-full w-full items-center justify-center text-[8px] font-black ${lineColor(line).replace("bg-", "text-")}`}>
                        {player.number}
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <span className="block truncate text-md font-bold leading-tight text-white">
                    <span className="mr-1 text-(--team-color-500)">{String(player.number).padStart(2, "0")}</span>
                    {player.name}
                </span>
                {player.is_injured && (
                    <span className="mt-0.5 inline-flex rounded-md bg-red-500/15 px-1.5 py-0.5 text-[7px] font-black uppercase text-red-300">
                        Lesionado
                    </span>
                )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <DiamondIcon className={`h-4 w-4 ${playerMatchFitnessTextColor}`} />
                <span className={`text-lg font-black uppercase ${playerOverallTextColor}`}>{player.overall}</span>
            </div>
        </div>
    );
};

const MatchdayPlayerList = ({
    mode,
    players,
    labels = [],
    side,
    canEdit,
    positionLanguage,
    subTarget,
    benchEditTarget,
    substitutionOptions,
    relationOptions,
    onToggleSubTarget,
    onToggleBenchTarget,
    onSubstitute,
    onReplaceBenchPlayer,
    onPlayerContextMenu
}: MatchdayPlayerListProps) => {
    if (players.length === 0) {
        return (
            <p className="py-4 text-center text-[10px] text-gray-500">
                {mode === "field" ? "Nenhum titular" : "Nenhum reserva"}
            </p>
        );
    }

    return (
        <>
            {players.map((player, index) => {
                const label = mode === "field" ? labels[index] ?? player.position : player.position;
                const targetKey = mode === "field" ? `${side}-${index}` : `${side}-${player.id}`;
                const isOpen = mode === "field"
                    ? canEdit && subTarget === targetKey
                    : canEdit && benchEditTarget === targetKey;

                return (
                    <div key={player.id} className="space-y-1.5">
                        <PlayerListRow
                            player={player}
                            label={label}
                            actionActive={isOpen}
                            actionDisabled={!canEdit}
                            actionTitle={mode === "field" ? "Substituir jogador" : "Trocar jogador da relação"}
                            positionLanguage={positionLanguage}
                            onPlayerContextMenu={() => {
                                if (!canEdit) return;
                                onPlayerContextMenu(index, player);
                            }}
                            onAction={() => {
                                if (mode === "field") {
                                    onToggleSubTarget(isOpen ? null : targetKey);
                                } else {
                                    onToggleBenchTarget(isOpen ? null : targetKey);
                                }
                            }}
                        />
                        {isOpen && mode === "field" && (
                            <PlayerChoicePanel
                                title="Substituir por"
                                emptyText="Banco vazio"
                                options={substitutionOptions}
                                targetPosition={player.position}
                                positionLanguage={positionLanguage}
                                onChoose={(candidate) => onSubstitute(candidate.id, index, side)}
                            />
                        )}
                        {isOpen && mode === "bench" && (
                            <PlayerChoicePanel
                                title="Fora da relação"
                                emptyText="Nenhum jogador disponível."
                                options={relationOptions}
                                targetPosition={player.position}
                                positionLanguage={positionLanguage}
                                onChoose={(candidate) => onReplaceBenchPlayer(player.id, candidate.id, side)}
                            />
                        )}
                    </div>
                );
            })}
        </>
    );
};

export default MatchdayPlayerList;
