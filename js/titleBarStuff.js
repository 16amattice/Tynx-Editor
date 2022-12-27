const { ipcRenderer } = require("electron");

function minimizeApp(){
  ipcRenderer.send("minimizeApp");
}

function maximizeApp(){
  ipcRenderer.send("maximizeApp");
}

function quitApp(){
  ipcRenderer.send("quitApp");
}