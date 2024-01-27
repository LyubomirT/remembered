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
const minimizeButton = document.getElementById('min-button')
const maximizeButton = document.getElementById('max-button')
const closeButton = document.getElementById('close-button')

function adjustStuff(){
  noteContent.style.height = 'auto'
  noteContent.style.height = noteContent.scrollHeight + 'px'
}

let isMaximized = false

function lockEverything() {
  noteTitle.disabled = true
  noteContent.disabled = true
  noteContent.contentEditable = false
  noteContent.innerHTML = `<h4>Open or create a note to get started! If you're feeling lost or confused, check out the official documentation or the handbook guide!</h4>`
  noteTitle.value = 'Nothing here... for now!'
  // Set the custom "state" attribute to "disabled"
  noteTitle.setAttribute('state', 'disabled')
  noteContent.setAttribute('state', 'disabled')
}

lockEverything()

function unlockEverything() {
  noteTitle.disabled = false
  noteContent.disabled = false
  noteContent.contentEditable = true
  // Set the custom "state" attribute to "enabled"
  noteTitle.setAttribute('state', 'enabled')
  noteContent.setAttribute('state', 'enabled')
}

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
        // Unlock everything
        unlockEverything()
      })
    }
  })
}

// Define a function to render the edit area
function renderEditArea(note) {
  // Set the value of the note title and content inputs
  noteTitle.value = note.title
  noteContent.innerHTML = note.content
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
  unlockEverything()
  adjustStuff()
  // Return the new note
  return note
}

// Define a function to get the current note data
function getCurrentNote() {
  // Get the value of the note title and content inputs
  const title = noteTitle.value
  const content = noteContent.innerHTML
  // Get the current date and time
  const date = new Date().toLocaleString()
  // Create a new note object with the current data
  const note = {
    title: title,
    content: content,
    date: date,
  }
  // Return the current note
  adjustStuff()
  return note
}

// Define a function to clear the edit area
function clearEditArea() {
  // Set the value of the note title and content inputs to empty
  noteTitle.value = ''
  noteContent.innerHTML = ''
  // Disable the save and delete buttons
  saveNoteButton.disabled = true
  deleteNoteButton.disabled = true
  adjustStuff()
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

    adjustStuff()
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
    // Lock everything
    lockEverything()
    adjustStuff()
    // Set the current note index to null
    currentNoteIndex = null
  })
})

// Get the toolbar button elements
const boldButton = document.getElementById('bold-button')
const italicButton = document.getElementById('italic-button')
const underlineButton = document.getElementById('underline-button')
const strikeButton = document.getElementById('strike-button')

// Add a click event listener to the bold button
boldButton.addEventListener('click', () => {
  // Execute the bold command on the selected text
  document.execCommand('bold')
})

// Add a click event listener to the italic button
italicButton.addEventListener('click', () => {
  // Execute the italic command on the selected text
  document.execCommand('italic')
})

// Add a click event listener to the underline button
underlineButton.addEventListener('click', () => {
  // Execute the underline command on the selected text
  document.execCommand('underline')
})

// Add a click event listener to the strike button
strikeButton.addEventListener('click', () => {
  // Execute the strikeThrough command on the selected text
  document.execCommand('strikeThrough')
})

// Add a click event listener to the minimize button
minimizeButton.addEventListener('click', () => {
  ipcRenderer.invoke('minimize-window')
})

// Add a click event listener to the maximize button
maximizeButton.addEventListener('click', () => {
  if (isMaximized) {
    ipcRenderer.invoke('unmaximize-window')
    isMaximized = false
  } else {
    ipcRenderer.invoke('maximize-window')
    isMaximized = true
  }
})

// Add a click event listener to the close button
closeButton.addEventListener('click', () => {
  ipcRenderer.invoke('close-window')
})

// Add an input event listener to the note content for dynamic resizing
noteContent.addEventListener('input', () => {
  // Adjust the height of the note content div based on its scroll height
  adjustStuff()
})
