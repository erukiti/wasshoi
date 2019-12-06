import { BrowserWindow, app as electronApp, screen } from 'electron'
import { client } from 'electron-connect'
import loadDevtool from 'electron-load-devtool'
import Application from './application'

const isDev = process.env.NODE_ENV === 'development'

export default class MainWindow {
  window: BrowserWindow | null = null

  constructor(private app: Application) {
    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      transparent: true,
      hasShadow: false,
      alwaysOnTop: true,
      fullscreenable: false,
      webPreferences: {
        nodeIntegration: true,
      },
      enableLargerThanScreen: true,
    })

    const currentScreen = screen.getDisplayNearestPoint(this.window.getBounds())
    this.window.setBounds(currentScreen.bounds)

    this.bringToTop()

    this.window.setIgnoreMouseEvents(true)

    this.window.loadFile('./build/main-view.html')

    this.window.on('closed', () => {
      this.window = null
      app.quit()
    })

    this.window.on('ready-to-show', (): void => {
      if (!this.window) return
      this.window.show()
    })

    this.window.on('closed', (): void => {
      this.window = null
    })

    if (isDev) {
      client.create(this.window)
      loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS)
    }
  }

  bringToTop() {
    if (!this.window) return
    if (process.platform === 'darwin') electronApp.dock.hide()
    this.window.setAlwaysOnTop(true, 'screen-saver', 1)
    this.window.moveTop()
    this.window.setVisibleOnAllWorkspaces(true)
    if (process.platform === 'darwin') electronApp.dock.show()
  }

  getBrowserWindow(): BrowserWindow {
    return this.window as BrowserWindow
  }

  dispatch(text: string, options: object = {}): void {
    // Dispatch event to renderer process
    this.window &&
      this.window.webContents.send('message', {
        text,
        options,
      })
  }
}
