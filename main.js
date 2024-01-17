// main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;
let noteWindows = {};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

function createNoteWindow(id, content, color, fontColor) {
  let noteWindow = new BrowserWindow({
    width: 300,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  noteWindow.loadFile("note.html");

  noteWindow.webContents.on("did-finish-load", () => {
    noteWindow.webContents.send("note-data", id, content, color, fontColor);
  });

  noteWindow.on("closed", function () {
    delete noteWindows[id];
  });

  noteWindows[id] = noteWindow;
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("create-note", (event, id) => {
  createNoteWindow(id, "", "#ffff88", "#000000");
});

ipcMain.on("open-note", (event, id, content, color, fontColor) => {
  if (noteWindows[id]) {
    noteWindows[id].focus();
  } else {
    createNoteWindow(id, content, color, fontColor);
  }
});

ipcMain.on("update-note", (event, id, content, color, fontColor) => {
  let notes = JSON.parse(fs.readFileSync("notes.json"));
  notes[id] = { content, color, fontColor };
  fs.writeFileSync("notes.json", JSON.stringify(notes));
  if (noteWindows[id]) {
    noteWindows[id].webContents.send("note-data", id, content, color, fontColor);
  }
});

ipcMain.on("delete-note", (event, id) => {
  let notes = JSON.parse(fs.readFileSync("notes.json"));
  delete notes[id];
  fs.writeFileSync("notes.json", JSON.stringify(notes));
  if (noteWindows[id]) {
    noteWindows[id].close();
  }
});

ipcMain.on("wipe-data", (event) => {
  fs.writeFileSync("notes.json", "{}");
  for (let id in noteWindows) {
    noteWindows[id].close();
  }
});
