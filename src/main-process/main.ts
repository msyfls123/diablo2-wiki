import { app, BrowserWindow } from 'electron'

app.whenReady().then(() => {
  const window = new BrowserWindow({
    show: false,
  })
  window.loadURL(`file://${__dirname}/pages/main.html`)
  window.show()
})

app.on('window-all-closed', () => {
  app.quit()
})
