import { app, BrowserWindow } from 'electron'

app.whenReady().then(() => {
  const window = new BrowserWindow({
    show: false,
    // frame: false,
    // titleBarStyle: 'hiddenInset',
  })
  if (process.env.NODE_ENV === 'development') {
    require('electron-connect').client.create(window)
  }
  window.loadURL(`file://${__dirname}/pages/main.html`)
  window.show()
})

app.on('window-all-closed', () => {
  app.quit()
})
