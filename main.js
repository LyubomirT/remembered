// Import modules
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Initialize variables
let mainWindow = null; // The main window object
let dataFile = 'notes.json'; // The data file path

if (!fs.existsSync(dataFile)) {
  // Create an empty data file
  fs.writeFile(dataFile, '[]', err => {
    if (err) {
      console.error(err);
    }
  });
}

// Create the main window
function createWindow() {
  // Create a new browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // I need to use this in the renderer.js after all
    },
    frame: false // Remove the default frame
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open the devtools (optional)
  // mainWindow.webContents.openDevTools();

  // Handle the window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle the app ready event
app.whenReady().then(() => {
  // Create the main window
  createWindow();

  // Load the notes from the data file and send them to the renderer process
  loadNotes();

  // Handle the app activate event (for macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Handle the app window all closed event
app.on('window-all-closed', () => {
  // Quit the app (for non-macOS)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Load the notes from the data file and send them to the renderer process
function loadNotes() {
  // Check if the data file exists
  if (fs.existsSync(dataFile)) {
    // Read the data file
    fs.readFile(dataFile, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Parse the data as JSON
        let notes = JSON.parse(data);

        // Send the notes to the renderer process
        mainWindow.webContents.send('load-notes', notes);
      }
    });
  } else {
    // Create an empty data file
    fs.writeFile(dataFile, '[]', err => {
      if (err) {
        console.error(err);
      }
    });
  }
}

// Handle the save-notes event from the renderer process
ipcMain.on('save-notes', (event, notes) => {
  // Stringify the notes array as JSON
  let data = JSON.stringify(notes);

  // Write the data to the data file
  fs.writeFile(dataFile, data, err => {
    if (err) {
      console.error(err);
    }
  });
});
