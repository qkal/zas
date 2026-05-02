import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, value: boolean) => callback(value)
      ipcRenderer.on('window:maximize-changed', handler)
      return () => ipcRenderer.removeListener('window:maximize-changed', handler)
    },
  },
  app: {
    quit: () => ipcRenderer.send('app:quit'),
  },
})
