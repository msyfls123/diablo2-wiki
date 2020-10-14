import {
  createRxDatabase, 
  addRxPlugin,
  RxDatabase,
  removeRxDatabase,
  MangoQuery,
} from 'rxdb'
import leveldown from 'leveldown'
import levelDBAdapter from 'pouchdb-adapter-leveldb'
import { BrowserWindow, dialog } from 'electron'
import crypto from 'crypto'

import { Subscription, asyncScheduler } from 'rxjs'
import { observeOn } from 'rxjs/operators'

addRxPlugin(levelDBAdapter)

function showErr(err) {
  dialog.showErrorBox('createRxDatabase', 
    JSON.stringify({
      err,
      msg: err.message,
    })
  )
}

export class DataBase {
  public name: string
  public whenReady: Promise<RxDatabase>
  public db: RxDatabase
  public constructor(name: string, wipeOldVersion = false) {
    this.name = name
    this.subscribers = new Map()
    this.create(name, wipeOldVersion)
  }

  private create = async (name: string, wipeOldVersion: boolean) => {
    try {
      this.whenReady = Promise.resolve(wipeOldVersion && removeRxDatabase(name, leveldown))
        .then(() => createRxDatabase({
          name,
          adapter: leveldown // the full leveldown-module
        }))
      this.db = await this.whenReady
    } catch (err) {
      showErr(err)
      throw(err)
    }
  }

  public destroy(): Promise<boolean> {
    return this.db && this.db.destroy()
  }

  private subscribers: Map<number, Map<string, Subscription>>

  public subscribe(window: BrowserWindow, collection: string, query: MangoQuery): string {
    const md5Sum = crypto.createHash('md5')
    md5Sum.update(JSON.stringify(query))
    const md5Key = md5Sum.digest('hex')
    const timestamp = (new Date()).getTime()
    const key = `${window.id}-${collection}-${md5Key}-${timestamp}`

    const subscribers = this.subscribers.get(window.id) || new Map
    subscribers.set(
      key,
      this.db[collection].find(query).$.pipe(
        observeOn(asyncScheduler)
      ).subscribe(data => {
        window.webContents.send(key, data.map(d => d.toJSON()))
      })
    )
    this.subscribers.set(window.id, subscribers)
    return key
  }

  public unsubscribe(windowId: number, key: string): void {
    const subscribers = this.subscribers.get(windowId) || new Map
    const subscriber = subscribers.get(key)
    if (subscriber) {
      subscriber.unsubscribe()
      subscribers.delete(key)
    }
    this.subscribers.set(windowId, subscribers)
  }

  public unsubscribeAll(window: BrowserWindow): void {
    const subscribers = this.subscribers.get(window.id)
    if (subscribers) {
      Array.from(subscribers.values()).forEach((s) => {
        s.unsubscribe()
      })
      subscribers.clear()
    }
  }
}
