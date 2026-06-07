import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog(win!, {
    properties: ["openDirectory"],
    title: "Selecione a pasta para seus saves",
    buttonLabel: "Escolher esta pasta",
  });

  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle("save-game", async (_event, { folderPath, fileName, data }) => {
  try {
    const fullPath = path.join(folderPath, `${fileName}.prospect`);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    return { success: true, path: fullPath };
  } catch (error) {
    console.error("Erro ao salvar:", error);
    return { success: false, error };
  }
});

ipcMain.handle("list-saves", async (_event, folderPath) => {
  try {
    if (!fs.existsSync(folderPath)) return [];
    const files = fs.readdirSync(folderPath);
    const saves = files
      .filter((file) => file.endsWith(".prospect"))
      .map((file) => {
        const content = fs.readFileSync(path.join(folderPath, file), "utf-8");
        return JSON.parse(content);
      });
    return saves;
  } catch (error) {
    return [];
  }
});

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    resizable: true,
    icon: path.join(process.env.VITE_PUBLIC, "icon.ico"),
    fullscreenable: true,
    autoHideMenuBar: true,
    title: "Prospect",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  win.setAspectRatio(16 / 9);

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.webContents.openDevTools(); // LEMBRAR DE REMOVER
  win.on("page-title-updated", (e) => e.preventDefault());
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
