// note.js
// This is the note window script that handles the note window UI and events

// Import the required modules
const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {

// Get the DOM elements
const moreButton = document.getElementById('more-button');
const options = document.getElementById('options');
const colorButton = document.getElementById('color-button');
const colorPicker = document.getElementById('color-picker');
const fontColorButton = document.getElementById('font-color-button');
const fontColorPicker = document.getElementById('font-color-picker');
const content = document.getElementById('content');
const container = document.getElementById('container');

// Define a global variable for the note object
let note = {
  id: null,
  text: '',
  color: '#ffffff',
  fontColor: '#000000',
};

// Add the click event listener to the more button
moreButton.addEventListener('click', () => {
  // Toggle the options visibility
  options.classList.toggle('hidden');
});

// Add the click event listener to the color button
colorButton.addEventListener('click', () => {
  // Hide the options
  options.classList.add('hidden');

  // Click the color picker input
  colorPicker.click();
});

// Add the change event listener to the color picker
colorPicker.addEventListener('change', () => {
  // Get the selected color value
  let color = colorPicker.value;

  // Update the note color property
  note.color = color;

  // Update the container background color
  container.style.backgroundColor = color;

  // Send the update-note event to the main process with the note object
  ipcRenderer.send('update-note', note);
});

// Add the click event listener to the font color button
fontColorButton.addEventListener('click', () => {
  // Hide the options
  options.classList.add('hidden');

  // Click the font color picker input
  fontColorPicker.click();
});

// Add the change event listener to the font color picker
fontColorPicker.addEventListener('change', () => {
  // Get the selected font color value
  let fontColor = fontColorPicker.value;

  // Update the note font color property
  note.fontColor = fontColor;

  // Update the content color
  content.style.color = fontColor;

  // Send the update-note event to the main process with the note object
  ipcRenderer.send('update-note', note);
});

// Add the input event listener to the content
content.addEventListener('input', () => {
  // Get the content text
  let text = content.textContent;

  // Update the note text property
  note.text = text;

  // Send the update-note event to the main process with the note object
  ipcRenderer.send('update-note', note);
});

// Handle the load-note event from the main process
ipcRenderer.on('load-note', (event, n) => {
  // Assign the note object to the global variable
  note = n;

  // Set the content text
  content.textContent = note.text;

  // Set the container background color
  container.style.backgroundColor = note.color;

  // Set the content color
  content.style.color = note.fontColor;

  // Set the color picker value
  colorPicker.value = note.color;

  // Set the font color picker value
  fontColorPicker.value = note.fontColor;
});

});