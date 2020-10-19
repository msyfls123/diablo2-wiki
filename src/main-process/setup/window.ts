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
  ipcMain.handle(`db-upsert-${window.id}`, (e, collection, data) => {
    return database.upsert(collection, data).then(document => document.toJSON())
  })
  ipcMain.on('db-query-unsubscribe', (e, key) => {
    database.unsubscribe(window.id, key)
  })

  let subscriber: Subscription
  window.webContents.once('did-finish-load', () => {
    subscriber = timer(1000, 1000).pipe(
      map((_, i) => `opened timing: ${i}s`)
    ).subscribe(msg => {
      window.webContents.send('tick', msg)
    })
    
    window.webContents.on('did-finish-load', () => {
      database.unsubscribeAll(window)
    })
  })

  window.on('close', () => {
    if (subscriber) {
      subscriber.unsubscribe()
    }
    database.unsubscribeAll(window)
  })
  window.show()
}
