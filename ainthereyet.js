const {ipcRenderer} = require('electron')

const backBtn = document.getElementById('back-button')

backBtn.addEventListener('click', () => {
    ipcRenderer.invoke('open-main')
})