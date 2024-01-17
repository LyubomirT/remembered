// note.js
const { ipcRenderer } = require("electron");

window.onload = () => {
let id;
let content;
let color;
let fontColor;

let note = document.getElementById("note");
let noteContent = document.getElementById("note-content");
let moreButton = document.getElementById("more-button");
let moreMenu = document.getElementById("more-menu");
let colorButton = document.getElementById("color-button");
let fontButton = document.getElementById("font-button");
let colorPicker = document.getElementById("color-picker");
let colorInput = document.getElementById("color-input");
let colorApply = document.getElementById("color-apply");
let fontPicker = document.getElementById("font-picker");
let fontInput = document.getElementById("font-input");
let fontApply = document.getElementById("font-apply");

ipcRenderer.on("note-data", (event, noteId, noteContent, noteColor, noteFontColor) => {
  id = noteId;
  content = noteContent;
  color = noteColor;
  fontColor = noteFontColor;
  note.style.backgroundColor = color;
  noteContent.innerHTML = content;
  note.style.color = fontColor;
  colorInput.value = color;
  fontInput.value = fontColor;
});

noteContent.addEventListener("input", () => {
  content = noteContent.innerHTML;
  ipcRenderer.send("update-note", id, content, color, fontColor);
});

moreButton.addEventListener("click", () => {
  moreMenu.classList.toggle("hidden");
});

colorButton.addEventListener("click", () => {
  moreMenu.classList.add("hidden");
  colorPicker.classList.remove("hidden");
});

fontButton.addEventListener("click", () => {
  moreMenu.classList.add("hidden");
  fontPicker.classList.remove("hidden");
});

colorApply.addEventListener("click", () => {
  color = colorInput.value;
  note.style.backgroundColor = color;
  ipcRenderer.send("update-note", id, content, color, fontColor);
  colorPicker.classList.add("hidden");
});

fontApply.addEventListener("click", () => {
  fontColor = fontInput.value;
  noteContent.style.color = fontColor;
  ipcRenderer.send("update-note", id, content, color, fontColor);
  fontPicker.classList.add("hidden");
});
};
