export type KitType = "home" | "away" | "third";

interface KitMatchResult {
  homeKit: KitType;
  awayKit: KitType;
  hasConflict: boolean;
}

interface TeamUniforms {
  home: Uniform;
  away: Uniform;
  third: Uniform;
}

const checkKitConflict = (kit1: Uniform, kit2: Uniform): boolean => {
  if (!kit1 || !kit2) return false;

  const group1 = kit1.kit_group;
  const group2 = kit2.kit_group;
  const tone1 = Number(kit1.tone);
  const tone2 = Number(kit2.tone);
  const toneDiff = Math.abs(tone1 - tone2);

  if (group1 === group2 && (group1 === "white" || group1 === "black")) {
    return true;
  }

  const colors1 = (kit1.base_colors || []) as unknown as string[];
  const colors2 = (kit2.base_colors || []) as unknown as string[];

  const sharedColors = colors1.filter((color) => colors2.includes(color));

  if (sharedColors.length === 0) {
    return false;
  }

  if (toneDiff >= 40) {
    return false;
  }

  const mainColor1 = colors1[0];
  const mainColor2 = colors2[0];

  if (mainColor1 === mainColor2 && toneDiff < 30) {
    return true;
  }

  const onlySharesNeutrals = sharedColors.every(
    (color) => color === "white" || color === "black",
  );

  if (onlySharesNeutrals && mainColor1 !== mainColor2) {
    return false;
  }

  if (sharedColors.length >= 2 && toneDiff < 25) {
    return true;
  }

  return false;
};

export const resolveDefaultKits = (
  homeUniforms: TeamUniforms,
  awayUniforms: TeamUniforms,
): KitMatchResult => {
  if (!checkKitConflict(homeUniforms.home, awayUniforms.away)) {
    return { homeKit: "home", awayKit: "away", hasConflict: false };
  }

  if (!checkKitConflict(homeUniforms.home, awayUniforms.home)) {
    return { homeKit: "home", awayKit: "home", hasConflict: false };
  }

  if (
    awayUniforms.third &&
    !checkKitConflict(homeUniforms.home, awayUniforms.third)
  ) {
    return { homeKit: "home", awayKit: "third", hasConflict: false };
  }

  if (!checkKitConflict(homeUniforms.away, awayUniforms.home)) {
    return { homeKit: "away", awayKit: "home", hasConflict: false };
  }

  return { homeKit: "home", awayKit: "away", hasConflict: true };
};
