const {ipcRenderer} = require('electron')
const {v4: uuidv4} = require('uuid')
const fs = require('fs')
const path = require('path')

const titleBar = document.getElementById('title-bar')
/* This is a different file from renderer.js and it has no note list or note content */

// Make the titlebar buttons work
const minimizeButton = document.getElementById('min-button')
const maximizeButton = document.getElementById('max-button')
const closeButton = document.getElementById('close-button')

var isMaximized = false

minimizeButton.addEventListener('click', () => {
    ipcRenderer.invoke('minimize-window')
    }
)

maximizeButton.addEventListener('click', () => {
    if (isMaximized) {
        ipcRenderer.invoke('unmaximize-window')
        isMaximized = false
    } else {
        ipcRenderer.invoke('maximize-window')
        isMaximized = true
    }
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

// When the user clicks on any section, open the SECTIONNAME.md file and render its contents

const contents = document.getElementById('contents')

for (const a of contents.children) {
    a.addEventListener('click', () => {
        // Use the href attribute to get the file name (also remove the #)
        let normalizedName = a.href.split('#')[1]
        let file = path.join(__dirname, 'handbook', normalizedName + '.md')
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                console.log(err)
            } else {
                // markdown-it
                let md = window.markdownit()
                let result = md.render(data)
                handbook.innerHTML = result
                // Replace all [ ] with unchecked checkboxes
                handbook.innerHTML = handbook.innerHTML.replaceAll('[ ]', '<input type="checkbox" disabled>')
                // Replace all [x] with checked checkboxes
                handbook.innerHTML = handbook.innerHTML.replaceAll('[x]', '<input type="checkbox" checked disabled>')
                var br = document.createElement('br')
                for (i = 0; i < 5; i++) {
                    handbook.appendChild(br.cloneNode())
                }
                // Make all links open in the user's default browser
                for (const a of handbook.getElementsByTagName('a')) {
                    if (a.href.substring(0, 4) === 'http') {
                        a.addEventListener('click', (event) => {
                            event.preventDefault()
                            ipcRenderer.invoke('open-link', a.href)
                        })
                    }
                }
            }
        })
    })
    if (a.href.split('#')[1] === 'introduction') {
        a.click()
    }
}