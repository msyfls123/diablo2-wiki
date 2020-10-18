import { DataBase } from '../utils/db'
import path from 'path'
import { app } from 'electron'
import { Runes } from '../../constants/rune'
import { isDevMode } from '../../constants'

const shouldWipeOldDataBase = true

export async function initializeDatabase(): Promise<DataBase> {
  const dbName = path.join(app.getPath('userData'), 'test-db')
  const dbManager = new DataBase(dbName, isDevMode && shouldWipeOldDataBase)
  await dbManager.whenReady
  const { db } = dbManager
  // create collection
  const mySchema = {
    version: 0,
    type: 'object',
    properties: {
      name: {
          type: 'string',
          primary: true
      },
      level: {
        type: 'number',
      },
      runes: {
        type: 'array',
        items: {
          type: 'number',
          enum: Runes,
        }
      }
    }
  }
  await db.collection({
    name: 'items',
    schema: mySchema,
  })

  return dbManager
}
