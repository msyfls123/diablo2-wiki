import { IpcMainInvokeEvent } from 'electron'

declare namespace Electron {
  interface IpcMain {
    on(event: 'db-query-unsubscribe', listener: (event: IpcMainInvokeEvent,
                                                key: string) => void): this
  }
}

declare module 'electron' {
  export = Electron;
}
