import { app, BrowserWindow, IpcMain, ipcMain, ipcRenderer } from "electron";
import { exec } from "child_process";
import { parsePlans } from "./Utilities";

function buildComms(comms: IpcMain, window: BrowserWindow) {
  comms.on("getWindowsPlans", async () => {
    console.log("got plans..");
    const prom = new Promise((resolve) => {
      exec("powercfg /l", (err, stdout, stderr) => {
        let parsed = parsePlans(stdout);
        resolve(parsed);
      });
    });
    let parsed = await prom;
    window.webContents.send("winplans", parsed);
  });
}

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + "/Preload.js",
    },
  });

  const comms = ipcMain;
  buildComms(comms, win);
  // and load the index.html of the app.
  win.loadURL("http://localhost:3000/");
}

app.on("ready", createWindow);
