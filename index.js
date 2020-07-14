'use strict'

const { app, BrowserWindow, Menu, shell, dialog } = require('electron')
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS
} = require('electron-devtools-installer')
const debug = require('electron-debug')
const del = require('del')
const { once } = require('events')

debug({ isEnabled: true, showDevTools: false })
app.allowRendererProcessReuse = false

let mainWindow
let restarting = false

const createMainWindow = async () => {
  const win = new BrowserWindow({
    title: app.name,
    show: false,
    width: 1440,
    height: 920,
    minWidth: 820,
    minHeight: 764,
    webPreferences: {
      nodeIntegration: true
    },
    titleBarStyle: 'hiddenInset'
  })
  const isMac = process.platform === 'darwin'
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      ...(isMac ? [{ role: 'appMenu' }] : []),
      { role: 'fileMenu' },
      { role: 'editMenu' },
      { role: 'viewMenu' },
      {
        label: 'Database',
        submenu: [
          {
            label: 'Reset database',
            click: async () => {
              const { response } = await dialog.showMessageBox(win, {
                type: 'warning',
                buttons: ['Reset database', 'Cancel'],
                message:
                  'Are you sure you want to reset your p2pcommons database? This will delete your profile and content from your computer and cannot be undone.'
              })
              if (response === 1) return
              restarting = true
              mainWindow.close()
              await once(mainWindow, 'closed')
              await del(`${app.getPath('home')}/.p2pcommons`, { force: true })
              mainWindow = await createMainWindow()
              restarting = false
            }
          }
        ]
      },
      { role: 'windowMenu' },
      {
        role: 'help',
        submenu: [
          {
            label: 'Credits',
            click: () =>
              shell.openExternal(
                'https://github.com/hypergraph-xyz/desktop/blob/gh-pages/credits.md'
              )
          },
          {
            label: 'Learn More',
            click: () =>
              shell.openExternal('https://github.com/hypergraph-xyz/desktop')
          }
        ]
      }
    ])
  )

  win.on('ready-to-show', () => win.show())
  win.on('closed', () => (mainWindow = undefined))
  if (!app.isPackaged && !process.env.CI) win.webContents.openDevTools()
  if (app.isPackaged) {
    await win.loadFile('build/index.html')
  } else {
    await win.loadURL('http://localhost:1212/dist/index.html')
  }
  return win
}

if (!app.requestSingleInstanceLock()) app.quit()

app.on('second-instance', () => {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
})

app.on('window-all-closed', () => {
  if (!restarting && (process.platform !== 'darwin' || process.env.CI)) {
    app.quit()
  }
})

app.on('activate', async () => {
  if (!mainWindow) mainWindow = await createMainWindow()
})

const main = async () => {
  await app.whenReady()
  if (!process.env.CI && process.platform !== 'win32') {
    await installExtension(REACT_DEVELOPER_TOOLS)
  }
  mainWindow = await createMainWindow()
}

main()
