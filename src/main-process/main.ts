import { app, BrowserWindow } from 'electron'
import { isDevMode } from '../constants'
import { Subscription, timer } from 'rxjs'
import { map } from 'rxjs/operators'

app.whenReady().then(() => {
  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      devTools: isDevMode,
      nodeIntegration: true,
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
  let subscriber: Subscription
  window.webContents.once('did-finish-load', () => {
    subscriber = timer(1000, 1000).pipe(
      map((_, i) => `opened timing: ${i}s`)
    ).subscribe(msg => {
      window.webContents.send('tick', msg)
    })
  })
  window.on('close', () => {
    if (subscriber) {
      subscriber.unsubscribe()
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
