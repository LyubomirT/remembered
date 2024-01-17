// Import modules
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Define global variables
let win = null; // The main window object

// Create the main window
function createWindow() {
  // Create a new browser window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false, // Hide the default frame
    webPreferences: {
      nodeIntegration: true, // Enable Node.js integration
      contextIsolation: false, // Disable context isolation
    },
  });
  // Load the index.html file
  win.loadFile(path.join(__dirname, "index.html"));
  // Open the devtools (optional)
  // win.webContents.openDevTools();
}

// Add event listener for the app ready event
app.whenReady().then(() => {
  createWindow(); // Create the main window
  // Add event listener for the app activate event
  app.on("activate", () => {
    // If there are no windows, create one
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Add event listener for the app window-all-closed event
app.on("window-all-closed", () => {
  // If the platform is not macOS, quit the app
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Add event listener for the ipc close-app message
ipcMain.on("close-app", () => {
  // Close the main window
  win.close();
});

// Add event listener for the ipc minimize-app message
ipcMain.on("minimize-app", () => {
  // Minimize the main window
  win.minimize();
});

// Add event listener for the ipc maximize-app message
ipcMain.on("maximize-app", () => {
  // If the main window is maximized, restore it
  if (win.isMaximized()) {
    win.restore();
  } else {
    // Otherwise, maximize it
    win.maximize();
  }
});
