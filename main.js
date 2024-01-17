// main.js
// This is the main process of the Electron app
// It creates the main window and handles the communication with the renderer process

// Import the required modules
const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron')
const path = require('path')
const fs = require('fs')

// Define some global variables
let mainWindow // The main window that shows the list of notes
let tray // The tray icon that allows to restore the main window
let notes = [] // An array of note objects that store the properties of each note
let dataFile = path.join(app.getPath('userData'), 'data.json') // The file that stores the notes data

// Create the main window
function createMainWindow() {
  // Create a new browser window with some options
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Enable node integration to use require in the renderer process
      contextIsolation: false, // Disable context isolation to use ipcRenderer in the renderer process
    },
    frame: false, // Remove the default frame to use a custom title bar
  })

  // Load the index.html file into the window
  mainWindow.loadFile('index.html')

  // Handle the window close event
  mainWindow.on('close', (event) => {
    // If the window is not hidden, hide it and prevent the default action
    if (!mainWindow.isMinimized()) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  // Handle the window closed event
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null
  })
}

// Create a note window
function createNoteWindow(note) {
  // Create a new browser window with some options
  let noteWindow = new BrowserWindow({
    width: 300,
    height: 300,
    x: note.x, // Set the initial position based on the note properties
    y: note.y,
    webPreferences: {
      nodeIntegration: true, // Enable node integration to use require in the renderer process
      contextIsolation: false, // Disable context isolation to use ipcRenderer in the renderer process
    },
    frame: false, // Remove the default frame to use a custom title bar
    show: false, // Do not show the window until it is ready
    alwaysOnTop: note.pinned, // Set the always on top option based on the note properties
  })

  // Load the note.html file into the window
  noteWindow.loadFile('note.html')

  // Handle the window ready to show event
  noteWindow.on('ready-to-show', () => {
    // Show the window and focus it
    noteWindow.show()
    noteWindow.focus()
    // Send the note properties to the renderer process
    noteWindow.webContents.send('note:init', note)
  })

  // Handle the window closed event
  noteWindow.on('closed', () => {
    // Find the index of the note in the notes array
    let index = notes.findIndex((n) => n.id === note.id)
    // If the index is valid, remove the note from the array
    if (index !== -1) {
      notes.splice(index, 1)
    }
    // Save the notes data to the file
    saveData()
    // Send the notes array to the main window
    mainWindow.webContents.send('notes:update', notes)
  })

  // Return the note window object
  return noteWindow
}

// Save the notes data to the file
function saveData() {
  // Convert the notes array to a JSON string
  let data = JSON.stringify(notes)
  // Write the data to the file
  fs.writeFile(dataFile, data, (err) => {
    // If there is an error, log it to the console
    if (err) {
      console.error(err)
    }
  })
}

// Load the notes data from the file
function loadData() {
  // Check if the file exists
  if (fs.existsSync(dataFile)) {
    // Read the file
    fs.readFile(dataFile, (err, data) => {
      // If there is an error, log it to the console
      if (err) {
        console.error(err)
      } else {
        // Parse the data as a JSON array
        let notesData = JSON.parse(data)
        // For each note in the array, create a note window and add it to the notes array
        for (let note of notesData) {
          let noteWindow = createNoteWindow(note)
          notes.push({ ...note, window: noteWindow })
        }
        // Send the notes array to the main window
        mainWindow.webContents.send('notes:update', notes)
      }
    })
  }
}

// Wipe the notes data from the file and the app
function wipeData() {
  // Delete the file
  fs.unlink(dataFile, (err) => {
    // If there is an error, log it to the console
    if (err) {
      console.error(err)
    }
  })
  // Close all the note windows
  for (let note of notes) {
    note.window.close()
  }
  // Clear the notes array
  notes = []
  // Send the notes array to the main window
  mainWindow.webContents.send('notes:update', notes)
}

// Handle the app ready event
app.whenReady().then(() => {
  // Create the main window
  createMainWindow()
  // Load the notes data from the file
  loadData()
  // Create the tray icon
  tray = new Tray(path.join(__dirname, 'assets', 'icon.png'))
  // Set the tray tooltip
  tray.setToolTip('Sticky Notes')
  // Set the tray context menu
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show',
        click: () => {
          // Show the main window
          mainWindow.show()
        },
      },
      {
        label: 'Exit',
        click: () => {
          // Quit the app
          app.quit()
        },
      },
    ])
  )
  // Handle the tray click event
  tray.on('click', () => {
    // Toggle the main window visibility
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
})

// Handle the app window all closed event
app.on('window-all-closed', () => {
  // Do nothing to prevent the app from quitting
})

// Handle the app activate event
app.on('activate', () => {
  // If the main window is null, create it
  if (mainWindow === null) {
    createMainWindow()
  }
})

// Handle the note:add event from the renderer process
ipcMain.on('note:add', (event, note) => {
  // Create a note window with the given note properties
  let noteWindow = createNoteWindow(note)
  // Add the note window to the notes array
  notes.push({ ...note, window: noteWindow })
  // Save the notes data to the file
  saveData()
  // Send the notes array to the main window
  mainWindow.webContents.send('notes:update', notes)
})

// Handle the note:delete event from the renderer process
ipcMain.on('note:delete', (event, id) => {
  // Find the note in the notes array by id
  let note = notes.find((n) => n.id === id)
  // If the note exists, close its window
  if (note) {
    note.window.close()
  }
})

// Handle the note:edit event from the renderer process
ipcMain.on('note:edit', (event, note) => {
  // Find the note in the notes array by id
  let oldNote = notes.find((n) => n.id === note.id)
  // If the note exists, update its properties and window options
  if (oldNote) {
    oldNote.title = note.title
    oldNote.content = note.content
    oldNote.color = note.color
    oldNote.pinned = note.pinned
    oldNote.window.setTitle(note.title)
    oldNote.window.setBackgroundColor(note.color)
    oldNote.window.setAlwaysOnTop(note.pinned)
  }
  // Save the notes data to the file
  saveData()
  // Send the notes array to the main window
  mainWindow.webContents.send('notes:update', notes)
})

// Handle the note:move event from the renderer process
ipcMain.on('note:move', (event, note) => {
  // Find the note in the notes array by id
  let oldNote = notes.find((n) => n.id === note.id)
  // If the note exists, update its position
  if (oldNote) {
    oldNote.x = note.x
    oldNote.y = note.y
  }
  // Save the notes data to the file
  saveData()
})

// Handle the data:wipe event from the renderer process
ipcMain.on('data:wipe', (event) => {
  // Wipe the notes data from the file and the app
  wipeData()
})
