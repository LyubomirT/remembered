// renderer.js
const { ipcRenderer } = require("electron");
const fs = require("fs");
const shell = require("electron").shell;

window.onload = () => {

let notesList = document.getElementById("notes-list");
let addButton = document.getElementById("add-button");
let moreButton = document.getElementById("more-button");
let moreMenu = document.getElementById("more-menu");
let guideButton = document.getElementById("guide-button");
let sourceButton = document.getElementById("source-button");
let wipeButton = document.getElementById("wipe-button");
let guideModal = document.getElementById("guide-modal");
let closeButton = document.getElementById("close-button");
let confirmModal = document.getElementById("confirm-modal");
let yesButton = document.getElementById("yes-button");
let noButton = document.getElementById("no-button");

function loadNotes() {
  notesList.innerHTML = "";
  notesList.appendChild(addButton);
  let notes = JSON.parse(fs.readFileSync("notes.json"));
  for (let id in notes) {
    let note = notes[id];
    let noteButton = document.createElement("button");
    noteButton.id = id;
    noteButton.innerHTML = note.content.substring(0, 20) + "...";
    noteButton.addEventListener("click", () => {
      ipcRenderer.send("open-note", id, note.content, note.color, note.fontColor);
    });
    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = "<i class='fas fa-trash'></i>";
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      ipcRenderer.send("delete-note", id);
    });
    noteButton.appendChild(deleteButton);
    notesList.appendChild(noteButton);
  }
}

try {
  loadNotes();
} catch (e) {
  fs.writeFileSync("notes.json", "{}");
}

addButton.addEventListener("click", () => {
  let id = Date.now().toString();
  ipcRenderer.send("create-note", id);
});

moreButton.addEventListener("click", () => {
  moreMenu.classList.toggle("hidden");
});

guideButton.addEventListener("click", () => {
  moreMenu.classList.add("hidden");
  guideModal.classList.remove("hidden");
});

sourceButton.addEventListener("click", () => {
  moreMenu.classList.add("hidden");
  shell.openExternal("https://github.com");
});

wipeButton.addEventListener("click", () => {
  moreMenu.classList.add("hidden");
  confirmModal.classList.remove("hidden");
});

closeButton.addEventListener("click", () => {
  guideModal.classList.add("hidden");
});

yesButton.addEventListener("click", () => {
  confirmModal.classList.add("hidden");
  ipcRenderer.send("wipe-data");
});

noButton.addEventListener("click", () => {
  confirmModal.classList.add("hidden");
});

};