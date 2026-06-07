import { create } from "zustand";
import teams from "../data/teams.json";
const teamsObj = teams as unknown as Team[];
const SEASON_TEST_START_DATE = "2026-01-28";
const LEGACY_TEST_START_DATE = "2026-05-13";

interface CareerState {
  savePath: string | null;
  saveData: SaveData | null;
  currentTeam: Team | null;
  isLoaded: boolean;
  savesList: any[];

  setSavePath: () => Promise<void>;
  fetchSaves: () => Promise<void>;
  createNewCareer: (
    name: string,
    teamId: string,
    saveName: string,
  ) => Promise<void>;
  loadSave: (save: any) => Promise<void>;
  advanceDay: () => void;
  setCurrentDate: (date: string) => void;
}

export const useCareerStore = create<CareerState>((set, get) => ({
  savePath: localStorage.getItem("prospect_save_path"),
  saveData: null,
  isLoaded: false,
  savesList: [],
  currentTeam: null,

  setSavePath: async () => {
    const path = await window.ipcRenderer.invoke("select-folder");
    if (path) {
      localStorage.setItem("prospect_save_path", path);
      set({ savePath: path });
      get().fetchSaves();
    }
  },

  fetchSaves: async () => {
    const { savePath } = get();
    if (!savePath) return;
    const saves = await window.ipcRenderer.invoke("list-saves", savePath);
    set({ savesList: saves });
  },

  createNewCareer: async (name, teamId, saveName) => {
    const { savePath } = get();
    if (!savePath) return;

    const newSave = {
      managerName: name,
      teamId: teamId,
      currentDate: SEASON_TEST_START_DATE,
      saveName: saveName,
      saveVersion: "1.0.0",
      lastPlayed: new Date().toISOString(),
    };

    const success = await window.ipcRenderer.invoke("save-game", {
      folderPath: savePath,
      fileName: saveName,
      data: newSave,
    });

    if (success) {
      set({ saveData: newSave, isLoaded: true });
    }
  },

  loadSave: async (save) => {
    set({
      saveData: {
        ...save,
        currentDate:
          save.currentDate === LEGACY_TEST_START_DATE
            ? SEASON_TEST_START_DATE
            : save.currentDate,
      },
      isLoaded: true,
      currentTeam: teamsObj.find((team) => team.id === save.teamId),
    });
  },

  advanceDay: () => {
    const { saveData } = get();
    if (!saveData) return;

    const date = new Date(saveData.currentDate);
    date.setDate(date.getDate() + 1);
    const newDate = date.toISOString().split("T")[0];

    set({ saveData: { ...saveData, currentDate: newDate } });
  },

  setCurrentDate: (date) => {
    const { saveData } = get();
    if (!saveData || !date) return;
    set({ saveData: { ...saveData, currentDate: date } });
  },
}));
