// note.js
// This is the renderer process of the note window
// It handles the user interface and the communication with the main process

// Import the required modules
const { ipcRenderer } = require('electron')

// Get the HTML elements by id
const noteTitleBar = document.getElementById('note-title-bar')
const noteTitle = document.getElementById('note-title')
const noteSettingsButton = document.getElementById('note-settings-button')
const notePinButton = document.getElementById('note-pin-button')
const noteCloseButton = document.getElementById('note-close-button')
const noteContent = document.getElementById('note-content')
const noteSettingsMenu = document.getElementById('note-settings-menu')
const noteTitleInput = document.getElementById('note-title-input')
const noteColorInput = document.getElementById('note-color-input')
const noteSaveButton = document.getElementById('note-save-button')
const noteFormattingButtons = document.getElementById('note-formatting-buttons')
const noteBoldButton = document.getElementById('note-bold-button')
const noteItalicButton = document.getElementById('note-italic-button')
const noteUnderlineButton = document.getElementById('note-underline-button')
const noteListButton = document.getElementById('note-list-button')
const noteCodeButton = document.getElementById('note-code-button')

// Define some global variables
let note = null // The note object that stores the properties of the note
let edited = false // A flag that indicates whether the note has been edited

// Initialize the note with the given properties
function initNote(note) {
  // Set the note object to the given note
  note = note
  // Set the note title and content
  noteTitle.textContent = note.title
  noteContent.innerHTML = note.content
  // Set the note window title, background color, and always on top option
  ipcRenderer.send('note:options', note.id, note.title, note.color, note.pinned)
  // Set the note title input and color input values
  noteTitleInput.value = note.title
  noteColorInput.value = note.color
  // Set the note pin button text
  notePinButton.textContent = note.pinned ? '📌' : '📍'
  // Set the edited flag to false
  edited = false
}

// Save the note with the current properties
function saveNote() {
  // Get the note title and content
  note.title = noteTitleInput.value
  note.content = noteContent.innerHTML
  // Get the note color and pin option
  note.color = noteColorInput.value
  note.pinned = notePinButton.textContent === '📌'
  // Set the note title and window options
  noteTitle.textContent = note.title
  ipcRenderer.send('note:options', note.id, note.title, note.color, note.pinned)
  // Send the note:edit event to the main process
  ipcRenderer.send('note:edit', note)
  // Set the edited flag to false
  edited = false
}

// Handle the note:init event from the main process
ipcRenderer.on('note:init', (event, note) => {
  // Initialize the note with the given properties
  initNote(note)
})

// Handle the note title bar double click event
noteTitleBar.addEventListener('dblclick', () => {
  // Maximize or unmaximize the window
  ipcRenderer.send('window:maximize')
})

// Handle the note settings button click event
noteSettingsButton.addEventListener('click', () => {
  // Toggle the visibility of the note settings menu
  noteSettingsMenu.classList.toggle('visible')
})

// Handle the note pin button click event
notePinButton.addEventListener('click', () => {
  // Toggle the note pin button text
  notePinButton.textContent = notePinButton.textContent === '📍' ? '📌' : '📍'
  // Set the edited flag to true
  edited = true
})

// Handle the note close button click event
noteCloseButton.addEventListener('click', () => {
  // If the note has been edited, confirm the user's choice
  if (edited) {
    let choice = confirm('Do you want to save the changes to this note?')
    // If the user confirms, save the note
    if (choice) {
      saveNote()
    }
  }
  // Close the window
  ipcRenderer.send('window:close')
})

// Handle the note save button click event
noteSaveButton.addEventListener('click', () => {
  // Save the note
  saveNote()
  // Hide the note settings menu
  noteSettingsMenu.classList.remove('visible')
})

// Handle the note content input event
noteContent.addEventListener('input', () => {
  // Set the edited flag to true
  edited = true
})

// Handle the note formatting buttons click event
noteFormattingButtons.addEventListener('click', (event) => {
  // Get the target element of the event
  let target = event.target
  // If the target is a formatting button, execute the corresponding command
  if (target.classList.contains('note-formatting-button')) {
    // Get the command from the target id
    let command = target.id.replace('note-', '').replace('-button', '')
    // Execute the command on the note content
    document.execCommand(command, false, null)
    // Set the edited flag to true
    edited = true
  }
})
