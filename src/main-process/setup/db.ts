import { DataBase } from '../utils/db'
import path from 'path'
import { app } from 'electron'

export async function initializeDatabase(): Promise<DataBase> {
  const dbName = path.join(app.getPath('userData'), 'test-db')
  const dbManager = new DataBase(dbName)
  await dbManager.whenReady
  const { db } = dbManager
  // create collection
  const mySchema = {
    version: 0,
    type: 'object',
    properties: {
        key: {
            type: 'string',
            primary: true
        },
        value: {
            type: 'string'
        }
    }
  }
  await db.collection({
    name: 'items',
    schema: mySchema
  })

  // insert one document
  // await db.items.insert({
  //   key: 'foo',
  //   value: 'bar'
  // })
  return dbManager
}
