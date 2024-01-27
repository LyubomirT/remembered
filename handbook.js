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