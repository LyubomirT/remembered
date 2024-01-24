// Import modules
const { ipcRenderer } = require('electron')
const { v4: uuidv4 } = require('uuid')

// Get the HTML elements
const titleBar = document.getElementById('title-bar')
const noteList = document.getElementById('note-list')
const editArea = document.getElementById('edit-area')
const noteTitle = document.getElementById('note-title')
const noteContent = document.getElementById('note-content')
const newNoteButton = document.getElementById('new-note-button')
const saveNoteButton = document.getElementById('save-note-button')
const deleteNoteButton = document.getElementById('delete-note-button')

// Define a variable to store the current note index
let currentNoteIndex = null

// Define a function to render the note list
function renderNoteList() {
  // Get the notes data from the main process
  ipcRenderer.invoke('get-notes').then((notes) => {
    // Clear the note list
    noteList.innerHTML = ''
    // Loop through the notes data
    for (let i = 0; i < notes.length; i++) {
      // Create a new list item element
      const li = document.createElement('li')
      // Set the class name and the data index attributes
      li.className = 'note-item'
      li.dataset.index = i
      // Set the inner HTML with the note title and date
      li.innerHTML = `
        <div class="note-title">${notes[i].title}</div>
        <div class="note-date">${notes[i].date}</div>
      `
      // Append the list item to the note list
      noteList.appendChild(li)
      // Add a click event listener to the list item
      li.addEventListener('click', () => {
        // Set the current note index to the data index
        currentNoteIndex = i
        // Render the edit area with the note data
        renderEditArea(notes[i])
        // Highlight the selected list item
        highlightNoteItem(li)
      })
    }
  })
}

// Define a function to render the edit area
function renderEditArea(note) {
  // Set the value of the note title and content inputs
  noteTitle.value = note.title
  noteContent.value = note.content
  // Enable the save and delete buttons
  saveNoteButton.disabled = false
  deleteNoteButton.disabled = false
}

// Define a function to highlight the selected note item
function highlightNoteItem(li) {
  // Get all the note items
  const noteItems = document.getElementsByClassName('note-item')
  // Loop through the note items
  for (let item of noteItems) {
    // Remove the selected class from the item
    item.classList.remove('selected')
  }
  // Add the selected class to the list item
  li.classList.add('selected')
}

// Define a function to create a new note
function createNewNote() {
  // Generate a unique id for the note
  const id = uuidv4()
  // Get the current date and time
  const date = new Date().toLocaleString()
  // Create a new note object with default title and content
  const note = {
    id: id,
    title: 'Untitled',
    content: '',
    date: date,
  }
  // Return the new note
  return note
}

// Define a function to get the current note data
function getCurrentNote() {
  // Get the value of the note title and content inputs
  const title = noteTitle.value
  const content = noteContent.value
  // Get the current date and time
  const date = new Date().toLocaleString()
  // Create a new note object with the current data
  const note = {
    title: title,
    content: content,
    date: date,
  }
  // Return the current note
  return note
}

// Define a function to clear the edit area
function clearEditArea() {
  // Set the value of the note title and content inputs to empty
  noteTitle.value = ''
  noteContent.value = ''
  // Disable the save and delete buttons
  saveNoteButton.disabled = true
  deleteNoteButton.disabled = true
}

// Render the note list when the window loads
window.addEventListener('load', () => {
  renderNoteList()
})

// Add a click event listener to the title bar to minimize the window
titleBar.addEventListener('click', () => {
  ipcRenderer.send('minimize-window')
})

// Add a click event listener to the new note button
newNoteButton.addEventListener('click', () => {
  // Create a new note
  const note = createNewNote()
  // Add the new note to the main process
  ipcRenderer.invoke('add-note', note).then(() => {
    // Render the note list
    renderNoteList()
    // Set the current note index to the last index
    currentNoteIndex = noteList.childElementCount - 1
    // Render the edit area with the new note
    renderEditArea(note)
    // Highlight the last note item
    highlightNoteItem(noteList.lastElementChild)
  })
})

// Add a click event listener to the save note button
saveNoteButton.addEventListener('click', () => {
  // Get the current note data
  const note = getCurrentNote()
  // Update the note in the main process
  ipcRenderer.invoke('update-note', currentNoteIndex, note).then(() => {
    // Render the note list
    renderNoteList()
    // Highlight the current note item
    highlightNoteItem(noteList.children[currentNoteIndex])
  })
})

// Add a click event listener to the delete note button
deleteNoteButton.addEventListener('click', () => {
  // Delete the note from the main process
  ipcRenderer.invoke('delete-note', currentNoteIndex).then(() => {
    // Render the note list
    renderNoteList()
    // Clear the edit area
    clearEditArea()
    // Set the current note index to null
    currentNoteIndex = null
  })
})
