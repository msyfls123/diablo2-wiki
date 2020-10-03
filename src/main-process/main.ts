import { app } from 'electron'
import type { DataBase } from './utils/db'
import { initializeDatabase } from './setup/db'
import { initializeWindow } from './setup/window'

let database: DataBase
app.whenReady().then(async () => {
  database = await initializeDatabase()
  initializeWindow(database)
})

app.on('window-all-closed', async () => {
  await database.destroy()
  app.quit()
})
