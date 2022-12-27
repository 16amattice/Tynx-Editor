const { app, BrowserWindow, ipcMain } = require('electron');

app.whenReady().then(() => {
    const window = new BrowserWindow({
        width: 900,
        height: 800,
        minHeight: 650,
        minWidth: 600,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    window.loadFile("editor.html");

    ipcMain.on("minimizeApp", (event, data) => {
        window.minimize();
    });

    ipcMain.on("maximizeApp", (event, data) => {
        window.maximize();
    });

    ipcMain.on("quitApp", (event, data) => {
        window.close();
    });
});