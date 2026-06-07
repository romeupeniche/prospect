import athleticopr from "./squads/athleticopr.json";
import atleticomg from "./squads/atleticomg.json";
import bahia from "./squads/bahia.json";
import botafogo from "./squads/botafogo.json";
import chapecoense from "./squads/chapecoense.json";
import corinthians from "./squads/corinthians.json";
import coritiba from "./squads/coritiba.json";
import cruzeiro from "./squads/cruzeiro.json";
import flamengo from "./squads/flamengo.json";
import internacional from "./squads/internacional.json";
import palmeiras from "./squads/palmeiras.json";
import remo from "./squads/remo.json";
import santos from "./squads/santos.json";
import saopaulo from "./squads/saopaulo.json";
import vasco from "./squads/vasco.json";
import vitoria from "./squads/vitoria.json";
import type { BasePlayer } from "../store/useTeamStore";

type TeamSquadRegistryEntry = {
  file: string | null;
  players: BasePlayer[];
};

const placeholder: BasePlayer[] = [];

export const TEAM_SQUAD_REGISTRY: Record<string, TeamSquadRegistryEntry> = {
  "43257277": { file: "vitoria.json", players: vitoria as unknown as BasePlayer[] },
  "21891021": { file: "bahia.json", players: bahia as unknown as BasePlayer[] },
  "86586513": { file: null, players: placeholder },
  "74496781": { file: "flamengo.json", players: flamengo as unknown as BasePlayer[] },
  "59318961": { file: null, players: placeholder },
  "69857423": { file: "internacional.json", players: internacional as unknown as BasePlayer[] },
  "40705706": { file: "santos.json", players: santos as unknown as BasePlayer[] },
  "87595679": { file: null, players: placeholder },
  "72275367": { file: "corinthians.json", players: corinthians as unknown as BasePlayer[] },
  "90748914": { file: "palmeiras.json", players: palmeiras as unknown as BasePlayer[] },
  "79859601": { file: null, players: placeholder },
  "41051526": { file: "chapecoense.json", players: chapecoense as unknown as BasePlayer[] },
  "35971878": { file: "cruzeiro.json", players: cruzeiro as unknown as BasePlayer[] },
  "79951310": { file: "atleticomg.json", players: atleticomg as unknown as BasePlayer[] },
  "21276332": { file: "coritiba.json", players: coritiba as unknown as BasePlayer[] },
  "40802544": { file: "athleticopr.json", players: athleticopr as unknown as BasePlayer[] },
  "48594781": { file: "vasco.json", players: vasco as unknown as BasePlayer[] },
  "49823308": { file: "botafogo.json", players: botafogo as unknown as BasePlayer[] },
  "55963133": { file: "saopaulo.json", players: saopaulo as unknown as BasePlayer[] },
  "64334201": { file: "remo.json", players: remo as unknown as BasePlayer[] },
};

export function getTeamSquadEntry(teamId: string): TeamSquadRegistryEntry {
  return TEAM_SQUAD_REGISTRY[teamId] ?? { file: null, players: placeholder };
}

export function getTeamSquadPlayers(teamId: string): BasePlayer[] {
  return getTeamSquadEntry(teamId).players.filter((player) => Boolean(player?.id));
}
