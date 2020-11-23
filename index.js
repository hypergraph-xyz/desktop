'use strict'

const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron')
const debug = require('electron-debug')
const del = require('del')
const { once } = require('events')
const AdmZip = require('adm-zip')
const { promises: fs } = require('fs')
const { promisify } = require('util')
const chmodr = require('chmodr')
const Store = require('electron-store')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')

debug({ isEnabled: true, showDevTools: false })
app.allowRendererProcessReuse = false
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

let mainWindow
let restarting = false
const store = new Store()
const p2pcommonsDir = `${app.getPath('home')}/.p2pcommons${
  !app.isPackaged ? '-dev' : ''
}`

log.transports.file.level = 'debug'
log.transports.ipc.level = 'debug'
autoUpdater.logger = log

ipcMain.handle('getStoreValue', (_, key, defaultValue) =>
  store.get(key, defaultValue)
)
ipcMain.handle('setStoreValue', (_, key, value) => store.set(key, value))
;['vault', 'welcome', 'tour', 'analytics', 'chatra'].forEach(key => {
  store.onDidChange(
    key,
    value => mainWindow && mainWindow.webContents.send(key, value)
  )
})

const withRestart = async cb => {
  restarting = true
  mainWindow.close()
  await once(mainWindow, 'closed')
  await cb()
  mainWindow = await createMainWindow()
  restarting = false
}

const updateMenu = () => {
  const isMac = process.platform === 'darwin'
  const isVaultEnabled = store.get('vault', false)
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      ...(isMac ? [{ role: 'appMenu' }] : []),
      {
        role: 'fileMenu',
        submenu: [
          {
            label: 'Add content',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              mainWindow.webContents.send('goto-create')
            }
          }
        ]
      },
      { role: 'editMenu' },
      { role: 'viewMenu' },
      {
        label: 'Database',
        submenu: [
          {
            label: 'Reset database',
            click: async () => {
              const { response } = await dialog.showMessageBox(mainWindow, {
                type: 'warning',
                buttons: ['Reset database', 'Cancel'],
                message:
                  'Are you sure you want to reset your p2pcommons database? This will delete your profile and content from your computer and cannot be undone.'
              })
              if (response === 1) return

              await withRestart(async () => {
                await promisify(chmodr)(p2pcommonsDir, 0o777)
                await del(p2pcommonsDir, { force: true })
                store.clear()
              })
            }
          },
          {
            label: 'Back up database',
            click: async () => {
              const { filePath } = await dialog.showSaveDialog(mainWindow, {
                defaultPath: 'p2pcommons.zip'
              })
              if (!filePath) return

              await withRestart(async () => {
                const zip = new AdmZip()
                zip.addLocalFolder(p2pcommonsDir)
                zip.writeZip(filePath)
              })
            }
          },
          {
            label: 'Export module graph',
            click: async () => {
              const { filePath } = await dialog.showSaveDialog(mainWindow, {
                defaultPath: 'p2pcommons.json'
              })
              if (!filePath) return

              mainWindow.webContents.send('export graph')
              const [, graph] = await once(ipcMain, 'export graph')
              await fs.writeFile(filePath, JSON.stringify(graph, null, 2))
            }
          }
        ]
      },
      {
        label: 'Vault',
        submenu: [
          {
            label: `${isVaultEnabled ? 'Disable' : 'Enable'} Vault`,
            click: async () => {
              if (!isVaultEnabled) {
                const { response } = await dialog.showMessageBox(mainWindow, {
                  type: 'warning',
                  buttons: ['Enable Vault', 'Cancel'],
                  message:
                    'Are you sure you want to enable the Hypergraph Vault? This will add all existing content to it, to be stored indefinitely.'
                })
                if (response === 1) return
              }
              store.set('vault', !isVaultEnabled)
              updateMenu()
            }
          }
        ]
      },
      { role: 'windowMenu' },
      {
        role: 'help',
        submenu: [
          {
            label: 'Reopen welcome screens',
            click: () => store.set('welcome', true)
          },
          {
            label: 'Reopen tour',
            click: () => store.set('tour', true)
          },
          {
            label: 'Credits',
            click: () =>
              shell.openExternal(
                'https://github.com/hypergraph-xyz/desktop/blob/gh-pages/credits.md'
              )
          },
          {
            label: 'Learn More',
            click: () => shell.openExternal('https://hypegraph.xyz')
          },
          {
            label: 'Community chat',
            click: () => shell.openExternal('https://chat.libscie.org')
          }
        ]
      }
    ])
  )
}
store.onDidChange('vault', updateMenu)

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
  updateMenu()

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

app.on('second-instance', (_, argv) => {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  const lastArg = argv[argv.length - 1]
  if (/^hypergraph:\/\//.test(lastArg)) {
    const url = lastArg.replace(/\/$/, '')
    mainWindow.webContents.send('open', url)
  }
})
app.on('open-url', async (ev, url) => {
  ev.preventDefault()
  if (!mainWindow) mainWindow = await createMainWindow()
  mainWindow.webContents.send('open', url)
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
  mainWindow = await createMainWindow()
  app.setAsDefaultProtocolClient('hypergraph')
  if (app.isPackaged) autoUpdater.checkForUpdatesAndNotify()
}

main()
