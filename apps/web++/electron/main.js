const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  })
  const isDev = process.env.NODE_ENV === 'development'
  const url = isDev ? 'http://localhost:4200' : `file://${path.join(__dirname, '../out/index.html')}`
  mainWindow.loadURL(url)
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
