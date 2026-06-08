export interface ColorStyleConfig {
  label: string;
  color: string;
  bg: string;
}

export function getFitnessColorStyles(percentage: number): ColorStyleConfig {
  if (percentage > 90) {
    return {
      label: "Excelente",
      color: "text-emerald-500",
      bg: "bg-emerald-500",
    };
  }
  if (percentage > 75) {
    return { label: "Bom", color: "text-lime-500", bg: "bg-lime-500" };
  }
  if (percentage > 60) {
    return { label: "Regular", color: "text-yellow-500", bg: "bg-yellow-500" };
  }
  if (percentage > 40) {
    return { label: "Baixo", color: "text-orange-500", bg: "bg-orange-500" };
  }
  return { label: "Crítico", color: "text-red-500", bg: "bg-red-500" };
}

export function getOverallColorStyles(overall: number): ColorStyleConfig {
  if (overall >= 90) {
    return { label: "Elite", color: "text-fuchsia-500", bg: "bg-fuchsia-500" };
  }
  if (overall >= 80) {
    return { label: "Excelente", color: "text-cyan-400", bg: "bg-cyan-400" };
  }
  if (overall >= 70) {
    return { label: "Bom", color: "text-green-500", bg: "bg-green-500" };
  }
  if (overall >= 60) {
    return { label: "Regular", color: "text-yellow-400", bg: "bg-yellow-400" };
  }
  return { label: "Baixo", color: "text-orange-500", bg: "bg-orange-500" };
}
