import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import * as path from 'path'

const isDev = !app.isPackaged
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../build/index.html'))
  }

  win.once('ready-to-show', () => {
    win.show()
  })

  win.on('maximize', () => {
    win.webContents.send('window:maximize-changed', true)
  })

  win.on('unmaximize', () => {
    win.webContents.send('window:maximize-changed', false)
  })

  return win
}

function createTray(): Tray {
  const iconPath = isDev
    ? path.join(process.cwd(), 'static', 'icon.png')
    : path.join(process.resourcesPath, 'icon.png')

  const icon = nativeImage.createFromPath(iconPath)
  const trayInstance = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Bliss',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])

  trayInstance.setToolTip('Bliss')
  trayInstance.setContextMenu(contextMenu)
  trayInstance.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })

  return trayInstance
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

app.whenReady().then(() => {
  mainWindow = createWindow()
  tray = createTray()

  // IPC handlers
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('window:close', () => {
    mainWindow?.hide()
  })

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false
  })

  ipcMain.on('app:quit', () => {
    app.quit()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    } else if (mainWindow) {
      mainWindow.show()
    }
  })
})

app.on('window-all-closed', () => {
  // Keep app alive in tray on Windows
})

// Intercept Alt+F4 — hide to tray instead of quitting
app.on('before-quit', (event) => {
  if (mainWindow?.isVisible()) {
    event.preventDefault()
    mainWindow.hide()
  }
})
