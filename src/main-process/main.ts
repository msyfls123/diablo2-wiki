import { app, BrowserWindow } from 'electron'
import { isDevMode } from '../constants'

app.whenReady().then(() => {
  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      devTools: isDevMode,
    }
    // frame: false,
    // titleBarStyle: 'hiddenInset',
  })
  if (isDevMode) {
    require('electron-connect').client.create(window)
  }
  window.loadURL(`file://${__dirname}/pages/main.html`)
  if (isDevMode) {
    window.webContents.openDevTools({
      mode: 'detach',
    });
  }
  window.show()
})

app.on('window-all-closed', () => {
  app.quit()
})
