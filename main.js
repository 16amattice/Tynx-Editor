const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, globalShortcut } = require('electron');
const path = require("path");
let windows = new Set();
const shell = require('electron').shell;
const ipc = require('electron').ipcMain;
const nativeImage = require('electron').nativeImage;
require('v8-compile-cache');
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
    let mainWindow = new BrowserWindow({
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
    windows.add(mainWindow)
    mainWindow.loadFile("editor.html");

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
        autoUpdater.checkForUpdatesAndNotify();
    })
    autoUpdater.on('update-available', () => {
      mainWindow.webContents.send('update_available');
    });
    autoUpdater.on('update-downloaded', () => {
      mainWindow.webContents.send('update_downloaded');
    });
    ipcMain.on('restart_app', () => {
      autoUpdater.quitAndInstall();
    });
    ipcMain.on('app_version', (event) => {
      event.sender.send('app_version', { version: app.getVersion() });
    });
    ipc.on("themeValue", function (event, arg) {

        mainWindow.webContents.send("getThemeValue", arg);
        console.log(arg);
    
      });
    
      mainWindow.on("selectedThemeValue", function (event, arg) {
        win.webContents.send("setThemeValue", arg);
    
      });
    ipcMain.on("minimizeApp", (event, data) => {
        mainWindow.minimize();
    });

    ipcMain.on("maximizeApp", (event, data) => {
        mainWindow.maximize();
    });

    ipcMain.on("quitApp", (event, data) => {
        mainWindow.close();
    });
    ipcMain.on("selectFolder", (event, data) =>{
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }).then(result => {
            if(result.canceled == true) {
                console.log("User cancelled selection process.")
            }
            else{
                var selectedDirectory = result.filePaths[0];	
                event.reply("selectedDirectory", selectedDirectory)
            }
        }).catch(err =>{
            console.log(err)
        })

    });
    ipcMain.on("readFile", (event, parseJson) => {

	    var defaultDirectoryPath;
	    times = parseJson.firstTime;

	    if(times === "true"){

		    defaultDirectoryPath = path.join(__dirname,'getStarted');

		    fileObj.firstTime = "false";
		    fileObj.directoryPath = defaultDirectoryPath;

		    writeJson(fileObj);

	    }else{
		    defaultDirectoryPath = parseJson.directoryPath;
	    }

	    directoryPath = defaultDirectoryPath;

        event.reply('directoryPath', directoryPath)
        event.reply('defaultDirectoryPath', defaultDirectoryPath)

    });
    ipcMain.on('showSaveDialog',(currentFileAddress)=>{
      function saveFileArg(currentFileAddress){
		
        if(currentFileAddress === undefined){
        //alert("File name is undefined");
        return;						 
        }
        
        var content = editor.getValue();
        
        fs.writeFile(currentFileAddress, content, function(e){
          
          if(e){
            
            alert("An error occured while saving the file");
            fileSaved = false;
            updateFileSave();
            
          }
          else{
            
            var tabIdNum = numberReturner(editor.container.id);
            
            var tabId = "tabId_"+tabIdNum;
            
            var currentFileName = getFileName(currentFileAddress);
            
            $("#"+tabId).parent().html(returnListDesign(tabId, currentFileAddress, currentFileName,true));
            
            populateTitleText();
            
            filePath = currentFileAddress;
            fileSaved = true;
            updateFileSave();
            
            var fileExt = getFileExtension(currentFileAddress);
      
            push(filePath);
    
            mode = parseMode(fileExt);
            
            //todo : update the ui aftr detecting the extension and then colour code the editor
            codeSlate(tabIdNum);
            
    
            savedFiles.push(currentFileAddress);
            
            //jsonContent.savedFiles = savedFiles;
            
            //writeJson(jsonContent);
            
            findEditor(editorId,fileExt);
            
          }
        });
        
    
        
      }
      
    
      dialog.showSaveDialog(saveFileArg);
      
      
  
    });
    ipcMain.on("settings", (theme) =>{
        const modalPath = path.join('file://',__dirname,'settings.html'+'#'+theme);
	    let settingsWindow = new BrowserWindow({ 
            width:800, 
            height:550, 
            minHeight:300, 
            minWidth:550, 
            maxWidth:800, 
            maxHeight:800, 
            frame:false, 
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        });
        windows.add(settingsWindow);
        settingsWindow.loadURL(modalPath);
        settingsWindow.show();

    });
    ipcMain.on("showShortcuts", ()=>{
      const modalPath = path.join('file://',__dirname,'shortcutWindow.html');
      let shortcutWindow = new BrowserWindow({ 
        width:800, 
        height:200, 
        minHeight:100, 
        minWidth:600, 
        frame:true ,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        }
      });
      shortcutWindow.on("close",function(){
        shortcutWindow=null;
      });
    
      shortcutWindow.loadURL(modalPath);
      shortcutWindow.show();
    })
    ipcMain.on('closeWindow', () => {
        BrowserWindow.getFocusedWindow()?.close();
    });
    const template = [
        {
          label: 'File',
          submenu: [
            {
               label: 'New File',
               click () { mainWindow.webContents.send("newFile"); }
            },
            {
               label: 'New Folder',
               click () { mainWindow.webContents.send("newfolder"); }          
            },
            { type: 'separator' },
            {
              label: 'Open File',
              click () { mainWindow.webContents.send("openFile"); }
            },
            {
            label: 'Open Folder',
            click () { mainWindow.webContents.send("openFolder"); }
            },
            { type: 'separator' },
            {
              label: 'Save',
              click () { mainWindow.webContents.send("save"); }
            },
            {
            label: 'Save As',
            click () { mainWindow.webContents.send("saveAs"); }
            },
          ]
        },
        {
          label: 'View',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'toggledevtools' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
          ]
        },
        {
          role: 'window',
          submenu: [
            { role: 'minimize' },
            { role: 'close' }
          ]
        },
        {
          role: 'help',
          submenu: [
            {
              label: 'Learn More',
              click () { require('electron').shell.openExternal('https://electronjs.org') }
            }
          ]
        }
      ]
      
      if (process.platform === 'darwin') {
        template.unshift({
          label: app.getName(),
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        })
      
        // Edit menu
        template[1].submenu.push(
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startspeaking' },
              { role: 'stopspeaking' }
            ]
          }
        )
      
        // Window menu
        template[3].submenu = [
          { role: 'close' },
          { role: 'minimize' },
          { role: 'zoom' },
          { type: 'separator' },
          { role: 'front' }
        ]
      }
      
      const menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu);





});