const {ipcRenderer} = require('electron')
const {v4: uuidv4} = require('uuid')

const titleBar = document.getElementById('title-bar')
/* This is a different file from renderer.js and it has no note list or note content */

// Make the titlebar buttons work
const minimizeButton = document.getElementById('min-button')
const maximizeButton = document.getElementById('max-button')
const closeButton = document.getElementById('close-button')

minimizeButton.addEventListener('click', () => {
    ipcRenderer.invoke('minimize-window')
    }
)

maximizeButton.addEventListener('click', () => {
    ipcRenderer.invoke('maximize-window')
    }
)

closeButton.addEventListener('click', () => {
    ipcRenderer.invoke('close-window')
    }
)

const backButton = document.getElementById('back-button')

backButton.addEventListener('click', () => {
    ipcRenderer.invoke('open-main')
    }
)

const handbook = document.getElementById('handbook')

// We need to use markdown-it to render the markdown text
const md = window.markdownit()

for (let i = 0; i < handbook.children.length; i++) {
    // Get the current element
    const element = handbook.children[i]
    // Check if the element is a div
    if (element.tagName === 'DIV') {
        // Render the markdown text inside the div
        element.innerHTML = md.render(element.innerHTML)
    }
}