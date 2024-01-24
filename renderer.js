// Import modules
const { ipcRenderer } = require('electron');
const fs = require('fs');

// Get HTML elements
const titlebar = document.getElementById('titlebar');
const noteList = document.getElementById('note-list');
const noteArea = document.getElementById('note-area');
const newNoteBtn = document.getElementById('new-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const deleteNoteBtn = document.getElementById('delete-note-btn');

// Initialize variables
let currentNote = null; // The note object that is currently selected
let notes = []; // The array of note objects

// Load notes from the data file
ipcRenderer.on('load-notes', (event, data) => {
  notes = data;
  updateNoteList();
});

// Update the note list UI
function updateNoteList() {
  // Clear the note list
  noteList.innerHTML = '';

  // Loop through the notes array and create list items
  for (let note of notes) {
    let li = document.createElement('li');
    li.className = 'note-item';
    li.textContent = note.title;
    li.dataset.id = note.id;

    // Add click event listener to select the note
    li.addEventListener('click', () => {
      selectNote(note);
    });

    // Append the list item to the note list
    noteList.appendChild(li);
  }
}

// Select a note and update the UI
function selectNote(note) {
  // Set the current note
  currentNote = note;

  // Update the note area
  noteArea.value = note.content;

  // Highlight the selected note in the note list
  let noteItems = document.getElementsByClassName('note-item');
  for (let item of noteItems) {
    if (item.dataset.id === note.id) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  }
}

// Create a new note and add it to the notes array
function createNote() {
  // Generate a unique id for the new note
  let id = Date.now().toString();

  // Create a new note object with default title and content
  let note = {
    id: id,
    title: 'Untitled',
    content: ''
  };

  // Add the new note to the notes array
  notes.push(note);

  // Update the note list UI
  updateNoteList();

  // Select the new note
  selectNote(note);
}

// Save the current note to the data file
function saveNote() {
  // Check if there is a current note
  if (currentNote) {
    // Update the current note content from the note area
    currentNote.content = noteArea.value;

    // Send the updated notes array to the main process
    ipcRenderer.send('save-notes', notes);
  }
}

// Delete the current note from the notes array and the data file
function deleteNote() {
  // Check if there is a current note
  if (currentNote) {
    // Confirm the deletion
    if (confirm('Are you sure you want to delete this note?')) {
      // Filter out the current note from the notes array
      notes = notes.filter(note => note.id !== currentNote.id);

      // Send the updated notes array to the main process
      ipcRenderer.send('save-notes', notes);

      // Update the note list UI
      updateNoteList();

      // Clear the current note and the note area
      currentNote = null;
      noteArea.value = '';
    }
  }
}

// Add click event listeners to the buttons
newNoteBtn.addEventListener('click', createNote);
saveNoteBtn.addEventListener('click', saveNote);
deleteNoteBtn.addEventListener('click', deleteNote);
