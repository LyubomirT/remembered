// Import modules
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

// Create a global variable to store the notes data
let notesData = [];

// Define a function to load the notes data from the JSON file
function loadNotesData() {
  // Get the path of the JSON file
  const filePath = 'notetaker.json';
  // Check if the file exists
  try {
    // Read the file and parse the JSON data
    notesData = JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    // If the file does not exist or is invalid, use an empty array
    notesData = [];
  }
}

// Define a function to save the notes data to the JSON file
function saveNotesData() {
  // Get the path of the JSON file
  const filePath = 'notetaker.json';
  // Write the JSON data to the file
  fs.writeFileSync(filePath, JSON.stringify(notesData));
}

// Define a function to create the main window
function createWindow() {
  // Create a new browser window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    minHeight: 400,
    minWidth: 600,
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // Load the index.html file
  win.loadFile('index.html');

  // Open the dev tools (optional)
  // win.webContents.openDevTools();
}

// Load the notes data when the app is ready
app.whenReady().then(() => {
  loadNotesData();
  createWindow();
});

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create a new window if none are open (macOS only)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle the request from the renderer process to get the notes data
ipcMain.handle('get-notes', (event) => {
  // Return the notes data
  return notesData;
});

// Handle the request from the renderer process to add a new note
ipcMain.handle('add-note', (event, note) => {
  // Add the note to the notes data array
  notesData.push(note);
  // Save the notes data to the JSON file
  saveNotesData();
});

// Handle the request from the renderer process to update an existing note
ipcMain.handle('update-note', (event, index, note) => {
  // Update the note in the notes data array
  notesData[index] = note;
  // Save the notes data to the JSON file
  saveNotesData();
});

// Handle the request from the renderer process to delete an existing note
ipcMain.handle('delete-note', (event, index) => {
  // Delete the note from the notes data array
  notesData.splice(index, 1);
  // Save the notes data to the JSON file
  saveNotesData();
});

ipcMain.handle('minimize-window', () => {
  // Minimize the window
  BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.handle('maximize-window', () => {
  // Maximize the window
  BrowserWindow.getFocusedWindow().maximize();
});

ipcMain.handle('unmaximize-window', () => {
  // Unmaximize the window
  BrowserWindow.getFocusedWindow().unmaximize();
});

ipcMain.handle('close-window', () => {
  // Close the window
  BrowserWindow.getFocusedWindow().close();
});

ipcMain.handle('open-handbook', () => {
  // This function basically replaces the current file rendered in the window with the handbook.html file
  // Get the current window
  const win = BrowserWindow.getFocusedWindow();
  // Load the handbook.html file
  win.loadFile('handbook.html');
});

ipcMain.handle('open-main', () => {
  // This function basically replaces the current file rendered in the window with the index.html file
  // Get the current window
  const win = BrowserWindow.getFocusedWindow();
  // Load the index.html file
  win.loadFile('index.html');
});

ipcMain.handle('open-link', (event, link) => {
  // Open the link in the user's default browser
  shell.openExternal(link);
});

ipcMain.handle('not-implemented', () => {
  // This function is called when a feature is not implemented
  // Get the current window
  const win = BrowserWindow.getFocusedWindow();
  // Load the not-implemented.html file
  win.loadFile('not-implemented.html');
});
