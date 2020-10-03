import { createRxDatabase, addRxPlugin, RxDatabase } from 'rxdb'
import leveldown from 'leveldown'
import levelDBAdapter from 'pouchdb-adapter-leveldb'
import { dialog } from 'electron'

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
  public constructor(name: string) {
    this.name = name
    this.create(name)
  }

  private create = async (name) => {
    try {
      this.whenReady = createRxDatabase({
        name,
        adapter: leveldown // the full leveldown-module
      })
      this.db = await this.whenReady
    } catch (err) {
      showErr(err)
      throw(err)
    }
  }

  public destroy(): Promise<boolean> {
    return this.db && this.db.destroy()
  }
}
