import { BrowserWindow, ipcMain } from 'electron'
import { isDevMode } from '../../constants'
import { Subscription, timer } from 'rxjs'
import { map } from 'rxjs/operators'
import type { DataBase } from '../utils/db'

export function initializeWindow(database: DataBase): void {
  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      devTools: isDevMode,
      nodeIntegration: true,
      enableRemoteModule: true,
    }
    // frame: false,
    // titleBarStyle: 'hiddenInset',
  })

  // hot reload
  if (isDevMode) {
    require('electron-connect').client.create(window)
  }

  window.loadURL(`file://${__dirname}/pages/main.html`)
  if (isDevMode) {
    window.webContents.openDevTools({
      mode: 'detach',
    });
  }
  ipcMain.handle(`db-query-${window.id}`, (e, collection, query) => {
    return database.subscribe(window, collection, query)
  })

  let subscriber: Subscription
  window.webContents.once('did-finish-load', () => {
    subscriber = timer(1000, 1000).pipe(
      map((_, i) => `opened timing: ${i}s`)
    ).subscribe(msg => {
      window.webContents.send('tick', msg)
    })
    
    setTimeout(() => {
      database.db.items.upsert({
        name: 'Insight',
        level: 27,
        runes: [8, 3, 7, 12],
      })
    }, 7000)
  })
  window.on('close', () => {
    if (subscriber) {
      subscriber.unsubscribe()
    }
    database.unsubscribe(window)
  })
  window.show()
}
