// renderer.js
// This is the renderer process of the main window
// It handles the user interface and the communication with the main process

// Import the required modules
const { ipcRenderer } = require('electron')
const { v4: uuidv4 } = require('uuid') // A module to generate unique ids

// Get the HTML elements by id
const titleBar = document.getElementById('title-bar')
const title = document.getElementById('title')
const minimizeButton = document.getElementById('minimize-button')
const maximizeButton = document.getElementById('maximize-button')
const closeButton = document.getElementById('close-button')
const notesList = document.getElementById('notes-list')
const addButton = document.getElementById('add-button')
const moreButton = document.getElementById('more-button')
const moreMenu = document.getElementById('more-menu')
const wipeDataButton = document.getElementById('wipe-data-button')
const guideButton = document.getElementById('guide-button')
const sourceCodeButton = document.getElementById('source-code-button')

// Define some global variables
let notes = [] // An array of note objects that store the properties of each note
let selectedNote = null // The currently selected note in the list

// Create a note element for the list
function createNoteElement(note) {
  // Create a new div element with some attributes and classes
  let noteElement = document.createElement('div')
  noteElement.setAttribute('id', note.id)
  noteElement.setAttribute('data-title', note.title)
  noteElement.setAttribute('data-content', note.content)
  noteElement.setAttribute('data-color', note.color)
  noteElement.setAttribute('data-pinned', note.pinned)
  noteElement.classList.add('note')

  // Create a new span element for the note title
  let noteTitle = document.createElement('span')
  noteTitle.classList.add('note-title')
  noteTitle.textContent = note.title

  // Create a new button element for the note delete action
  let noteDeleteButton = document.createElement('button')
  noteDeleteButton.classList.add('note-delete-button')
  noteDeleteButton.innerHTML = '×'

  // Append the title and the delete button to the note element
  noteElement.appendChild(noteTitle)
  noteElement.appendChild(noteDeleteButton)

  // Return the note element
  return noteElement
}

// Update the notes list with the given notes array
function updateNotesList(notes) {
  // Clear the notes list
  notesList.innerHTML = ''
  // For each note in the array, create a note element and append it to the list
  for (let note of notes) {
    let noteElement = createNoteElement(note)
    notesList.appendChild(noteElement)
  }
  // If the selected note is still in the array, highlight it
  if (selectedNote && notes.find((n) => n.id === selectedNote.id)) {
    document.getElementById(selectedNote.id).classList.add('selected')
  }
}

// Generate a random color for the note background
function generateRandomColor() {
  // Define an array of possible colors
  let colors = [
    '#ffadad',
    '#ffd6a5',
    '#fdffb6',
    '#caffbf',
    '#9bf6ff',
    '#a0c4ff',
    '#bdb2ff',
    '#ffc6ff',
  ]
  // Return a random color from the array
  return colors[Math.floor(Math.random() * colors.length)]
}

// Handle the title bar buttons click events
minimizeButton.addEventListener('click', () => {
  // Minimize the window
  ipcRenderer.send('window:minimize')
})

maximizeButton.addEventListener('click', () => {
  // Maximize or unmaximize the window
  ipcRenderer.send('window:maximize')
})

closeButton.addEventListener('click', () => {
  // Close the window
  ipcRenderer.send('window:close')
})

// Handle the add button click event
addButton.addEventListener('click', () => {
  // Generate a new note object with some default properties
  let note = {
    id: uuidv4(), // Generate a unique id
    title: 'New Note',
    content: '',
    color: generateRandomColor(), // Generate a random color
    pinned: false,
    x: 100, // Set the initial position
    y: 100,
  }
  // Send the note object to the main process to create a note window
  ipcRenderer.send('note:add', note)
})

// Handle the more button click event
moreButton.addEventListener('click', () => {
  // Toggle the visibility of the more menu
  moreMenu.classList.toggle('visible')
})

// Handle the wipe data button click event
wipeDataButton.addEventListener('click', () => {
  // Hide the more menu
  moreMenu.classList.remove('visible')
  // Confirm the user's choice
  let choice = confirm('Are you sure you want to wipe all data? This will delete all your notes and cannot be undone.')
  // If the user confirms, send the data:wipe event to the main process
  if (choice) {
    ipcRenderer.send('data:wipe')
  }
})

// Handle the guide button click event
guideButton.addEventListener('click', () => {
  // Hide the more menu
  moreMenu.classList.remove('visible')
  // Show a guide pop-up with some basic usage info
  alert('Welcome to Sticky Notes!\n\nThis app allows you to create and edit notes that stay on top of other applications.\n\nTo create a new note, click the + button at the top right of the main window.\n\nTo edit a note, click on it to open it in a separate window. You can change the note title, content, color, and pin option in the settings menu of each note.\n\nTo delete a note, click the x button next to it in the main window, or the x button at the top right of the note window.\n\nTo format the note content, you can use the buttons at the bottom of the note window. You can make the text bold, italic, underline, list, or code.\n\nTo hide the main window, click the - button at the top left of the title bar. To restore it, click the tray icon at the bottom right of your screen.\n\nTo exit the app, right-click the tray icon and select Exit.')
})

// Handle the source code button click event
sourceCodeButton.addEventListener('click', () => {
  // Hide the more menu
  moreMenu.classList.remove('visible')
  // Open the source code link in the default browser
  ipcRenderer.send('link:open', 'https://github.com')
})

// Handle the notes list click event
notesList.addEventListener('click', (event) => {
  // Get the target element of the event
  let target = event.target
  // If the target is a note element or a note title, select the note and show its window
  if (target.classList.contains('note') || target.classList.contains('note-title')) {
    // Get the note element
    let noteElement = target.classList.contains('note') ? target : target.parentElement
    // Get the note id from the element id
    let noteId = noteElement.id
    // Find the note in the notes array by id
    let note = notes.find((n) => n.id === noteId)
    // If the note exists, send the note:show event to the main process
    if (note) {
      ipcRenderer.send('note:show', noteId)
      // Remove the selected class from the previous selected note element
      if (selectedNote) {
        document.getElementById(selectedNote.id).classList.remove('selected')
      }
      // Add the selected class to the current note element
      noteElement.classList.add('selected')
      // Set the selected note to the current note
      selectedNote = note
    }
  }
  // If the target is a note delete button, delete the note
  if (target.classList.contains('note-delete-button')) {
    // Get the note element
    let noteElement = target.parentElement
    // Get the note id from the element id
    let noteId = noteElement.id
    // Confirm the user's choice
    let choice = confirm('Are you sure you want to delete this note?')
    // If the user confirms, send the note:delete event to the main process
    if (choice) {
      ipcRenderer.send('note:delete', noteId)
    }
  }
})

// Handle the notes:update event from the main process
ipcRenderer.on('notes:update', (event, updatedNotes) => {
  // Update the notes array with the updated notes
  notes = updatedNotes
  // Update the notes list with the updated notes
  updateNotesList(notes)
})
