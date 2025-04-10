const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Load the index.html file
  mainWindow.loadFile('index.html')

  // Uncomment to open DevTools automatically
  mainWindow.webContents.openDevTools()

  // Handle window being closed
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// Create window when Electron is ready
app.whenReady().then(createWindow)

// Quit when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})