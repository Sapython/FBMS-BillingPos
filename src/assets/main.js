const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
  });

  app.on("open-url", (event, url) => {
    // console.log(url);
    dialog.showErrorBox("Welcome Back", `You arrived from: ${url}`);
  });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      sandbox: false
    },
  });

  mainWindow.loadFile("dist/fbms-billing-pos/index.html");
  // mainWindow.webContents = remote.getCurrentWebContents();
  // console.log("BrowserWindow");
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// Handle window controls via IPC
ipcMain.on("shell:open", () => {
  const pageDirectory = __dirname.replace("app.asar", "app.asar.unpacked");
  const pagePath = path.join("file://", pageDirectory, "index.html");
  shell.openExternal(pagePath);
});

// const sendStatusToWindow = (text) => {
//   log.info(text);
//   if (mainWindow) {
//     mainWindow.webContents.send('message', text);
//   }
// };

// autoUpdater.on('update-available',()=>{
//   log.info("update-available");
// })

// autoUpdater.on('before-quit-for-update',()=>{
//   log.info("before-quit-for-update");
// })

// autoUpdater.on('update-downloaded',()=>{
//   log.info("update-downloaded");
// })

// autoUpdater.on('update-not-available',()=>{
//   log.info("update-not-available");
// })

// autoUpdater.on('error',(err)=>{
//   log.info("error");
//   log.info(err);
// })

// autoUpdater.on('download-progress',(progress)=>{
//   log.info("Progress: ",progress)
// })