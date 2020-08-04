'use strict'

const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron')
const debug = require('electron-debug')
const del = require('del')
const { once } = require('events')
const AdmZip = require('adm-zip')
const { promises: fs } = require('fs')

debug({ isEnabled: true, showDevTools: false })
app.allowRendererProcessReuse = false
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

let mainWindow
let restarting = false

const withRestart = async cb => {
  restarting = true
  mainWindow.close()
  await once(mainWindow, 'closed')
  await cb()
  mainWindow = await createMainWindow()
  restarting = false
}

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

              await withRestart(() =>
                del(`${app.getPath('home')}/.p2pcommons`, { force: true })
              )
            }
          },
          {
            label: 'Back up database',
            click: async () => {
              const { filePath } = await dialog.showSaveDialog(win, {
                defaultPath: 'p2pcommons.zip'
              })
              if (!filePath) return

              await withRestart(async () => {
                const zip = new AdmZip()
                zip.addLocalFolder(`${app.getPath('home')}/.p2pcommons`)
                zip.writeZip(filePath)
              })
            }
          },
          {
            label: 'Restore database backup',
            click: async () => {
              const { filePaths } = await dialog.showOpenDialog(win, {
                defaultPath: 'p2pcommons.zip',
                filters: [{ name: 'ZIP', extensions: ['zip'] }]
              })
              const filePath = filePaths && filePaths[0]
              if (!filePath) return

              let zip

              try {
                zip = new AdmZip(filePath)
                if (!zip.getEntry('db/LOG')) throw new Error('no db')
              } catch (err) {
                dialog.showErrorBox(
                  'Invalid database backup',
                  "The database couldn't be restored from the backup file provided"
                )
                console.error(err)
                return
              }

              const { response } = await dialog.showMessageBox(win, {
                type: 'warning',
                buttons: ['Restore database backup', 'Cancel'],
                message:
                  'Are you sure you want to restore your p2pcommons database from a backup? This will delete your current profile and content from your computer and cannot be undone.'
              })
              if (response === 1) return

              await withRestart(async () => {
                try {
                  await del(`${app.getPath('home')}/.p2pcommons`, {
                    force: true
                  })
                  zip.extractAllTo(`${app.getPath('home')}/.p2pcommons`)
                } catch (err) {
                  console.error(err)
                }
              })
            }
          },
          {
            label: 'Export module graph',
            click: async () => {
              const { filePath } = await dialog.showSaveDialog(win, {
                defaultPath: 'p2pcommons.json'
              })
              if (!filePath) return

              win.webContents.send('export graph')
              const [, graph] = await once(ipcMain, 'export graph')
              await fs.writeFile(filePath, JSON.stringify(graph, null, 2))
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
  mainWindow = await createMainWindow()
}

main()
