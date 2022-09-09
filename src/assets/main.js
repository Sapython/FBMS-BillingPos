// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, shell, dialog, webContents,autoUpdater } = require("electron");
// let remote = require("@electron/remote/main");
const path = require("path");
// const updater = require('electron-simple-updater');
// updater.init('https://raw.githubusercontent.com/megahertz/electron-simple-updater/master/example/updates.json');
// updater.checkForUpdates()
// remote.initialize();

let mainWindow;
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("virajpos", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("virajpos");
}

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
  });

  app.on("open-url", (event, url) => {
    console.log(url);
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
  console.log("BrowserWindow");
  // console.log(webContents);
  // webContents.getPrinters = function () {
  //   if (features.isPrintingEnabled()) {
  //     return this._getPrinters();
  //   } else {
  //     console.error("Error: Printing feature is disabled.");
  //   }
  // };
  webContents.getAllWebContents().forEach((webContents) => {
    console.log(webContents.getPrintersAsync().then((printers) => {
      // console.log(printers);
    }).catch((error) => {
      console.error(error);
    }).finally(() => {
      console.log("Finally");
    }));
  })
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

const sendStatusToWindow = (text) => {
  log.info(text);
  if (mainWindow) {
    mainWindow.webContents.send('message', text);
  }
};

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', info => {
  sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', info => {
  sendStatusToWindow('Update not available.');
});
autoUpdater.on('error', err => {
  sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
});
autoUpdater.on('download-progress', progressObj => {
  sendStatusToWindow(
    `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred} + '/' + ${progressObj.total} + )`
  );
});
autoUpdater.on('update-downloaded', info => {
  sendStatusToWindow('Update downloaded; will install now');
});

autoUpdater.on('update-downloaded', info => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 500 ms.
  // You could call autoUpdater.quitAndInstall(); immediately
  autoUpdater.quitAndInstall();
});