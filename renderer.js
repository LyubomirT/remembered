// Import modules
const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

// Get DOM elements
const titleBar = document.getElementById("title-bar");
const appTitle = document.getElementById("app-title");
const closeBtn = document.getElementById("close-btn");
const minimizeBtn = document.getElementById("minimize-btn");
const maximizeBtn = document.getElementById("maximize-btn");
const notesList = document.getElementById("notes-list");
const searchInput = document.getElementById("search-input");
const editorTitle = document.getElementById("editor-title");
const editor = document.getElementById("editor");
const formatSelect = document.getElementById("format-select");
const boldBtn = document.getElementById("bold-btn");
const italicBtn = document.getElementById("italic-btn");
const underlineBtn = document.getElementById("underline-btn");
const strikeBtn = document.getElementById("strike-btn");
const ulBtn = document.getElementById("ul-btn");
const olBtn = document.getElementById("ol-btn");
const codeBtn = document.getElementById("code-btn");
const codeBlockBtn = document.getElementById("code-block-btn");

// Define global variables
let notes = []; // Array of note objects
let currentNote = null; // The note object that is currently being edited
let notesDir = path.join(__dirname, "notes"); // The directory where the notes are stored

// Load notes from the notes directory
function loadNotes() {
  notes = []; // Clear the notes array
  notesList.innerHTML = ""; // Clear the notes list
  fs.readdir(notesDir, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    files.forEach((file) => {
      // Read each file and parse its content as JSON
      fs.readFile(path.join(notesDir, file), (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        let note = JSON.parse(data);
        notes.push(note); // Add the note object to the notes array
        // Create a list item element for the note
        let li = document.createElement("li");
        li.className = "note-item";
        li.dataset.id = note.id; // Set the data-id attribute to the note id
        // Create a span element for the note title
        let spanTitle = document.createElement("span");
        spanTitle.className = "note-title";
        spanTitle.textContent = note.title;
        // Create a span element for the note description
        let spanDesc = document.createElement("span");
        spanDesc.className = "note-desc";
        spanDesc.textContent = note.desc;
        // Create a span element for the note timestamp
        let spanTime = document.createElement("span");
        spanTime.className = "note-time";
        spanTime.textContent = note.time;
        // Create a button element for the note more options
        let btnMore = document.createElement("button");
        btnMore.className = "note-more";
        btnMore.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
        // Append the elements to the list item
        li.appendChild(spanTitle);
        li.appendChild(spanDesc);
        li.appendChild(spanTime);
        li.appendChild(btnMore);
        // Append the list item to the notes list
        notesList.appendChild(li);
      });
    });
  });
}

// Save the current note to the notes directory
function saveNote() {
  if (currentNote) {
    // Update the current note object with the editor content
    currentNote.title = editorTitle.value;
    currentNote.desc = editor.textContent;
    currentNote.time = new Date().toLocaleString();
    // Write the current note object to the file
    fs.writeFile(
      path.join(notesDir, currentNote.id + ".json"),
      JSON.stringify(currentNote),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        // Reload the notes list
        loadNotes();
      }
    );
  }
}

// Create a new note and open it in the editor
function newNote() {
  // Generate a random id for the new note
  let id = Math.random().toString(36).substr(2, 9);
  // Create a new note object with default values
  let note = {
    id: id,
    title: "Untitled",
    desc: "",
    time: new Date().toLocaleString(),
  };
  // Write the new note object to the file
  fs.writeFile(
    path.join(notesDir, id + ".json"),
    JSON.stringify(note),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      // Set the current note to the new note
      currentNote = note;
      // Set the editor content to the new note content
      editorTitle.value = note.title;
      editor.innerHTML = note.desc;
      // Reload the notes list
      loadNotes();
    }
  );
}

// Delete a note by its id
function deleteNote(id) {
  // Find the note object by its id
  let note = notes.find((n) => n.id === id);
  if (note) {
    // Delete the note file
    fs.unlink(path.join(notesDir, note.id + ".json"), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      // If the deleted note is the current note, clear the editor content
      if (currentNote && currentNote.id === note.id) {
        currentNote = null;
        editorTitle.value = "";
        editor.innerHTML = "";
      }
      // Reload the notes list
      loadNotes();
    });
  }
}

// Rename a note by its id
function renameNote(id) {
  // Find the note object by its id
  let note = notes.find((n) => n.id === id);
  if (note) {
    // Prompt the user for a new title
    let newTitle = prompt("Enter a new title for the note:", note.title);
    if (newTitle) {
      // Update the note object with the new title
      note.title = newTitle;
      // Write the note object to the file
      fs.writeFile(
        path.join(notesDir, note.id + ".json"),
        JSON.stringify(note),
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
          // If the renamed note is the current note, update the editor title
          if (currentNote && currentNote.id === note.id) {
            editorTitle.value = note.title;
          }
          // Reload the notes list
          loadNotes();
        }
      );
    }
  }
}

// Open a note by its id in the editor
function openNote(id) {
  // Find the note object by its id
  let note = notes.find((n) => n.id === id);
  if (note) {
    // Set the current note to the selected note
    currentNote = note;
    // Set the editor content to the note content
    editorTitle.value = note.title;
    editor.innerHTML = note.desc;
  }
}

// Search for notes by their title
function searchNotes(query) {
  // Clear the notes list
  notesList.innerHTML = "";
  // Filter the notes array by the query
  let filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(query.toLowerCase())
  );
  // Create list items for the filtered notes
  filteredNotes.forEach((note) => {
    // Create a list item element for the note
    let li = document.createElement("li");
    li.className = "note-item";
    li.dataset.id = note.id; // Set the data-id attribute to the note id
    // Create a span element for the note title
    let spanTitle = document.createElement("span");
    spanTitle.className = "note-title";
    spanTitle.textContent = note.title;
    // Create a span element for the note description
    let spanDesc = document.createElement("span");
    spanDesc.className = "note-desc";
    spanDesc.textContent = note.desc;
    // Create a span element for the note timestamp
    let spanTime = document.createElement("span");
    spanTime.className = "note-time";
    spanTime.textContent = note.time;
    // Create a button element for the note more options
    let btnMore = document.createElement("button");
    btnMore.className = "note-more";
    btnMore.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
    // Append the elements to the list item
    li.appendChild(spanTitle);
    li.appendChild(spanDesc);
    li.appendChild(spanTime);
    li.appendChild(btnMore);
    // Append the list item to the notes list
    notesList.appendChild(li);
  });
}

// Format the editor content with a command
function formatEditor(command) {
  // Execute the command on the document
  document.execCommand(command, false, null);
}

// Format the editor content with a value
function formatEditorWithValue(command, value) {
  // Execute the command on the document with the value
  document.execCommand(command, false, value);
}
// Add event listeners to the title bar buttons
closeBtn.addEventListener("click", () => {
  ipcRenderer.send("close-app"); // Send a message to the main process to close the app
});
minimizeBtn.addEventListener("click", () => {
  ipcRenderer.send("minimize-app"); // Send a message to the main process to minimize the app
});
maximizeBtn.addEventListener("click", () => {
  ipcRenderer.send("maximize-app"); // Send a message to the main process to maximize the app
});

// Add event listener to the app title
appTitle.addEventListener("click", () => {
  newNote(); // Create a new note when the app title is clicked
});

// Add event listener to the search input
searchInput.addEventListener("input", () => {
  let query = searchInput.value; // Get the search query
  if (query) {
    searchNotes(query); // Search for notes by the query
  } else {
    loadNotes(); // Load all notes if the query is empty
  }
});

// Add event listener to the editor title
editorTitle.addEventListener("input", () => {
  saveNote(); // Save the note when the editor title is changed
});

// Add event listener to the editor
editor.addEventListener("input", () => {
  saveNote(); // Save the note when the editor content is changed
});

// Add event listener to the format select
formatSelect.addEventListener("change", () => {
  let value = formatSelect.value; // Get the selected value
  if (value) {
    formatEditorWithValue("formatBlock", value); // Format the editor content with the value
    formatSelect.value = ""; // Reset the select value
  }
});

// Add event listeners to the format buttons
boldBtn.addEventListener("click", () => {
  formatEditor("bold"); // Format the editor content with bold
});
italicBtn.addEventListener("click", () => {
  formatEditor("italic"); // Format the editor content with italic
});
underlineBtn.addEventListener("click", () => {
  formatEditor("underline"); // Format the editor content with underline
});
strikeBtn.addEventListener("click", () => {
  formatEditor("strikeThrough"); // Format the editor content with strikeThrough
});
ulBtn.addEventListener("click", () => {
  formatEditor("insertUnorderedList"); // Format the editor content with insertUnorderedList
});
olBtn.addEventListener("click", () => {
  formatEditor("insertOrderedList"); // Format the editor content with insertOrderedList
});
codeBtn.addEventListener("click", () => {
  formatEditor("insertHTML", "<code>" + window.getSelection() + "</code>"); // Format the editor content with insertHTML and code tags
});
codeBlockBtn.addEventListener("click", () => {
  formatEditor(
    "insertHTML",
    "<pre><code>" + window.getSelection() + "</code></pre>"
  ); // Format the editor content with insertHTML and pre and code tags
});

// Add event listener to the document
document.addEventListener("click", (e) => {
  // Get the target element of the click event
  let target = e.target;
  // If the target is a note item, open the note in the editor
  if (target.classList.contains("note-item")) {
    let id = target.dataset.id; // Get the note id from the data-id attribute
    openNote(id); // Open the note by its id
  }
  // If the target is a note more button, show a context menu with options
  if (target.classList.contains("note-more")) {
    let id = target.parentElement.dataset.id; // Get the note id from the parent element
    let menu = new Menu(); // Create a new menu object
    // Add menu items for delete and rename options
    menu.append(
      new MenuItem({
        label: "Delete",
        click: () => {
          deleteNote(id); // Delete the note by its id
        },
      })
    );
    menu.append(
      new MenuItem({
        label: "Rename",
        click: () => {
          renameNote(id); // Rename the note by its id
        },
      })
    );
    // Popup the menu at the cursor position
    menu.popup({ x: e.x, y: e.y });
  }
});

// Load the notes when the app is ready
loadNotes();
