import { BrowserWindow, ipcMain } from 'electron'
import { isDevMode } from '../../constants'
import { Subscription, timer } from 'rxjs'
import { map } from 'rxjs/operators'
import type { DataBase } from '../utils/db'
import type { BrowserWindowConstructorOptions } from 'electron/main'

export function initializeWindow(database: DataBase): void {
  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      devTools: isDevMode,
      nodeIntegration: true,
      enableRemoteModule: true,
      nativeWindowOpen: true,
    }
    // frame: false,
    // titleBarStyle: 'hiddenInset',
  })

  // hot reload
  if (isDevMode) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron-connect').client.create(window)
  }

  window.loadURL(`file://${__dirname}/pages/main.html`)
  if (isDevMode) {
    window.webContents.openDevTools({
      mode: 'detach',
    });
  }
  ipcMain.handle(`db-upsert-${window.id}`, (e, collection, data) => {
    return database.upsert(collection, data).then(document => document.toJSON())
  })
  // ipcMain.on('db-query-unsubscribe', (e, key) => {
  //   database.unsubscribe(window.id, key)
  // })

  window.webContents
    .on('ipc-message', (e, channel, ...args) => {
      switch (channel) {
        case 'db-query-unsubscribe':
          database.unsubscribe(window.id, args[0])
          break;
      
        default:
          break;
      }
    })
    .on('ipc-message-sync', (e, channel, ...args) => {
      switch (channel) {
        case 'db-query':
          e.returnValue = database.subscribe(window, args[0], args[1])
          break;

        // case 'db-upsert':
        //   e.returnValue = database.upsert(args[0], args[1]).then(document => document.toJSON())
        //   break;

        default:
          break;
      }
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

  window.webContents.on('new-window', (event, url, frameName, disposition, windowOptions) => {
    if (frameName === 'windowPortal') {
      event.preventDefault()
      const options: BrowserWindowConstructorOptions = {
        ...windowOptions,
        frame: false,
        titleBarStyle: 'default',
        skipTaskbar: true,
        show: false,
        width: 0,
        height: 0,
        center: true,
        webPreferences: {
          nodeIntegration: true,
          enableRemoteModule: true,
          affinity: 'windowPortal',
        }
      }
      const newWindow = new BrowserWindow(options)
      event.newGuest = newWindow
    }
  })

  window.on('close', () => {
    if (subscriber) {
      subscriber.unsubscribe()
    }
    database.unsubscribeAll(window)
  })
  window.show()
}
