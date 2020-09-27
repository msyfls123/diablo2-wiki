import { app, BrowserWindow } from 'electron'
import { client } from 'electron-connect'

app.whenReady().then(() => {
  const window = new BrowserWindow({
    show: false,
    // frame: false,
    // titleBarStyle: 'hiddenInset',
  })
  if (process.env.NODE_ENV === 'development') {
    client.create(window)
  }
  window.loadURL(`file://${__dirname}/pages/main.html`)
  window.show()
})

app.on('window-all-closed', () => {
  app.quit()
})
