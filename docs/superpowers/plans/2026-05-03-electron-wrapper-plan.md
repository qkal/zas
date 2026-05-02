# Bliss Desktop — Electron Wrapper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package the existing SvelteKit static SPA as a frameless Windows Electron app with custom title bar and system-tray minimize behavior.

**Architecture:** A thin Electron shell loads the SvelteKit static build. `electron/main.ts` creates a frameless `BrowserWindow`, manages a `Tray` icon, and handles IPC. `electron/preload.ts` exposes a safe API to the renderer via `contextBridge`. A new `TitleBar.svelte` component inside the app draws window controls and communicates with the main process.

**Tech Stack:** Electron 35, electron-builder 25, TypeScript 5.7, SvelteKit 2 (static adapter), Tailwind CSS 4

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Add Electron deps, scripts, builder config |
| `electron/tsconfig.json` | Create | Electron-side TS config (separate from SvelteKit) |
| `electron/preload.ts` | Create | `contextBridge` — safe renderer ↔ main API |
| `electron/main.ts` | Create | BrowserWindow, tray, IPC handlers, single-instance lock |
| `src/lib/components/bliss/TitleBar.svelte` | Create | Custom window chrome with minimize/maximize/close |
| `src/routes/+layout.svelte` | Modify | Inject `<TitleBar />` above page content |
| `static/icon.png` | Create (if missing) | Tray icon source |

---

## Task 1: Add Electron Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add Electron dev-dependencies**

  Run:
  ```bash
  pnpm add -D electron electron-builder electron-store concurrently wait-on
  ```
  Expected: All four packages resolve and install.

- [ ] **Step 2: Add Electron npm scripts**

  Edit `package.json` `"scripts"` section. Add these three entries alongside the existing ones (keep existing scripts untouched):
  ```json
  {
    "scripts": {
      "dev": "vite dev",
      "build": "vite build",
      "preview": "vite preview",
      "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
      "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
      "lint": "oxlint",
      "lint:svelte": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
      "lint:all": "pnpm lint && pnpm lint:svelte",
      "prepare": "svelte-kit sync",
      "electron:dev": "concurrently \"vite dev\" \"wait-on http://localhost:5173 && electron electron/dist/main.js\"",
      "electron:build": "vite build && tsc -p electron && electron-builder",
      "electron:preview": "pnpm electron:build && electron-builder --win --publish never && start dist-electron/Bliss.exe"
    }
  }
  ```

- [ ] **Step 3: Add `build` field for electron-builder**

  At the root level of `package.json`, add:
  ```json
  {
    "name": "bliss-chat-ui",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "productName": "Bliss",
    "appId": "com.bliss.chat",
    "build": {
      "directories": {
        "output": "dist-electron"
      },
      "files": [
        "build/**/*",
        "electron/dist/**/*"
      ],
      "win": {
        "target": "nsis"
      }
    },
    "scripts": { ... }
  }
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add package.json pnpm-lock.yaml
  git commit -m "chore: add Electron dependencies and build scripts"
  ```

---

## Task 2: Create Electron TypeScript Config

**Files:**
- Create: `electron/tsconfig.json`

- [ ] **Step 1: Write `electron/tsconfig.json`**

  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "CommonJS",
      "lib": ["ES2022"],
      "outDir": "./dist",
      "rootDir": ".",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "moduleResolution": "node",
      "resolveJsonModule": true
    },
    "include": ["**/*.ts"],
    "exclude": ["node_modules", "dist"]
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add electron/tsconfig.json
  git commit -m "chore: add Electron TypeScript config"
  ```

---

## Task 3: Create Preload Script

**Files:**
- Create: `electron/preload.ts`

- [ ] **Step 1: Write `electron/preload.ts`**

  ```typescript
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
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add electron/preload.ts
  git commit -m "feat(electron): add preload script with contextBridge API"
  ```

---

## Task 4: Create Main Process

**Files:**
- Create: `electron/main.ts`

- [ ] **Step 1: Write `electron/main.ts`**

  ```typescript
  import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
  import * as path from 'path'

  const isDev = !app.isPackaged
  let mainWindow: BrowserWindow | null = null
  let tray: Tray | null = null

  function createWindow(): BrowserWindow {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      frame: false,
      titleBarStyle: 'hidden',
      backgroundColor: '#ffffff',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    if (isDev) {
      win.loadURL('http://localhost:5173')
      win.webContents.openDevTools()
    } else {
      win.loadFile(path.join(__dirname, '../build/index.html'))
    }

    win.once('ready-to-show', () => {
      win.show()
    })

    win.on('maximize', () => {
      win.webContents.send('window:maximize-changed', true)
    })

    win.on('unmaximize', () => {
      win.webContents.send('window:maximize-changed', false)
    })

    return win
  }

  function createTray(): Tray {
    const iconPath = isDev
      ? path.join(process.cwd(), 'static', 'icon.png')
      : path.join(process.resourcesPath, 'icon.png')

    const icon = nativeImage.createFromPath(iconPath)
    const trayInstance = new Tray(icon.resize({ width: 16, height: 16 }))

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Bliss',
        click: () => {
          if (mainWindow) {
            mainWindow.show()
            mainWindow.focus()
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        },
      },
    ])

    trayInstance.setToolTip('Bliss')
    trayInstance.setContextMenu(contextMenu)
    trayInstance.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.focus()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    })

    return trayInstance
  }

  // Single instance lock
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.show()
        mainWindow.focus()
      }
    })
  }

  app.whenReady().then(() => {
    mainWindow = createWindow()
    tray = createTray()

    // IPC handlers
    ipcMain.on('window:minimize', () => {
      mainWindow?.minimize()
    })

    ipcMain.on('window:maximize', () => {
      if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow?.maximize()
      }
    })

    ipcMain.on('window:close', () => {
      mainWindow?.hide()
    })

    ipcMain.handle('window:isMaximized', () => {
      return mainWindow?.isMaximized() ?? false
    })

    ipcMain.on('app:quit', () => {
      app.quit()
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow()
      } else if (mainWindow) {
        mainWindow.show()
      }
    })
  })

  app.on('window-all-closed', () => {
    // Keep app alive in tray on Windows
  })

  // Intercept Alt+F4 — hide to tray instead of quitting
  app.on('before-quit', (event) => {
    if (mainWindow?.isVisible()) {
      event.preventDefault()
      mainWindow.hide()
    }
  })
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add electron/main.ts
  git commit -m "feat(electron): add main process with frameless window and tray"
  ```

---

## Task 5: Create TitleBar Component

**Files:**
- Create: `src/lib/components/bliss/TitleBar.svelte`

- [ ] **Step 1: Write `src/lib/components/bliss/TitleBar.svelte`**

  ```svelte
  <script lang="ts">
    import { onMount } from 'svelte'
    import BlissLogo from './BlissLogo.svelte'
    import { Minus, Square, X, Copy } from '@lucide/svelte'

    let isMaximized = $state(false)

    onMount(() => {
      if (window.electronAPI) {
        window.electronAPI.window.isMaximized().then((v: boolean) => {
          isMaximized = v
        })
        const unsubscribe = window.electronAPI.window.onMaximizeChange((v: boolean) => {
          isMaximized = v
        })
        return unsubscribe
      }
    })

    function handleMinimize() {
      window.electronAPI?.window.minimize()
    }

    function handleMaximize() {
      window.electronAPI?.window.maximize()
    }

    function handleClose() {
      window.electronAPI?.window.close()
    }
  </script>

  <div
    class="flex h-10 items-center justify-between border-b border-border bg-background select-none"
    style="-webkit-app-region: drag;"
  >
    <div class="flex items-center gap-2 px-3" style="-webkit-app-region: no-drag;">
      <BlissLogo size={18} />
      <span class="text-sm font-semibold text-foreground">Bliss</span>
    </div>

    <div class="flex items-center" style="-webkit-app-region: no-drag;">
      <button
        class="flex h-10 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        onclick={handleMinimize}
        aria-label="Minimize"
      >
        <Minus size={16} />
      </button>
      <button
        class="flex h-10 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        onclick={handleMaximize}
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
      >
        {#if isMaximized}
          <Copy size={14} />
        {:else}
          <Square size={14} />
        {/if}
      </button>
      <button
        class="flex h-10 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
        onclick={handleClose}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  </div>
  ```

- [ ] **Step 2: Add global type declaration for `window.electronAPI`**

  Create `src/app.d.ts` (if it doesn't exist, modify it if it does):
  ```typescript
  declare global {
    interface Window {
      electronAPI?: {
        window: {
          minimize: () => void
          maximize: () => void
          close: () => void
          isMaximized: () => Promise<boolean>
          onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void
        }
        app: {
          quit: () => void
        }
      }
    }
  }

  export {}
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/lib/components/bliss/TitleBar.svelte src/app.d.ts
  git commit -m "feat(ui): add custom TitleBar with Electron window controls"
  ```

---

## Task 6: Inject TitleBar into Layout

**Files:**
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 1: Modify `src/routes/+layout.svelte`**

  Replace the entire file with:
  ```svelte
  <script lang="ts">
    import '../app.css'
    import TitleBar from '$lib/components/bliss/TitleBar.svelte'
    import type { Snippet } from 'svelte'

    type Props = { children: Snippet }
    let { children }: Props = $props()
  </script>

  <div class="flex h-screen flex-col">
    <TitleBar />
    <div class="flex-1 overflow-hidden">
      {@render children()}
    </div>
  </div>
  ```

  **Important:** The existing `+page.svelte` uses `min-h-screen` and `h-screen` on `<main>`. Because the layout now wraps it in a flex column with a fixed title bar, the page content area must scroll properly. The `flex-1 overflow-hidden` container ensures the page fills remaining space; the existing `bliss-scroll` and `overflow-y-auto` inside `+page.svelte` will handle internal scrolling.

- [ ] **Step 2: Commit**
  ```bash
  git add src/routes/+layout.svelte
  git commit -m "feat(layout): inject custom TitleBar above all routes"
  ```

---

## Task 7: Prepare Tray Icon Asset

**Files:**
- Create: `static/icon.png`

- [ ] **Step 1: Generate a 256×256 PNG icon from the existing SVG**

  If `static/icon.png` does not exist, use the existing `static/icon.svg` or `static/icon-dark-32x32.png` as source. For the build to work, the file `static/icon.png` must exist.

  Option A — if you have ImageMagick installed:
  ```bash
  magick convert static/icon.svg -resize 256x256 static/icon.png
  ```

  Option B — copy the dark icon as a fallback:
  ```bash
  cp static/icon-dark-32x32.png static/icon.png
  ```

  The tray code resizes it to 16×16 automatically, so any square PNG works.

- [ ] **Step 2: Commit**
  ```bash
  git add static/icon.png
  git commit -m "assets: add tray icon source"
  ```

---

## Task 8: Verify SvelteKit Build Still Works

**Files:**
- None (verification only)

- [ ] **Step 1: Build the SvelteKit app**
  ```bash
  pnpm build
  ```
  Expected: Build completes successfully, `build/` directory contains `index.html` and `_app/`.

- [ ] **Step 2: Run type check**
  ```bash
  pnpm check
  ```
  Expected: 0 errors (warnings are OK).

- [ ] **Step 3: Commit (only if fixes were needed)**
  If `pnpm check` fails, fix the errors, then:
  ```bash
  git add -A
  git commit -m "fix: resolve type errors from TitleBar integration"
  ```

---

## Task 9: Dev Smoke Test

**Files:**
- None (verification only)

- [ ] **Step 1: Compile Electron TypeScript**
  ```bash
  tsc -p electron
  ```
  Expected: Creates `electron/dist/main.js` and `electron/dist/preload.js` with no errors.

- [ ] **Step 2: Run dev mode**
  ```bash
  pnpm electron:dev
  ```
  Expected:
  1. Vite dev server starts on `http://localhost:5173`.
  2. After a short wait, Electron launches and loads the URL.
  3. A frameless window appears with the custom title bar at the top.
  4. Minimize, maximize/restore, and close buttons work.
  5. Clicking close hides the window (not quits).
  6. The tray icon appears; clicking it restores the window.

- [ ] **Step 3: Stop dev servers**
  Press `Ctrl+C` in the terminal to kill both Vite and Electron.

---

## Task 10: Production Build Test

**Files:**
- None (verification only)

- [ ] **Step 1: Run production build**
  ```bash
  pnpm electron:build
  ```
  Expected:
  1. `vite build` completes → `build/` is populated.
  2. `tsc -p electron` completes → `electron/dist/` is populated.
  3. `electron-builder` completes → `dist-electron/Bliss Setup.exe` is created.

- [ ] **Step 2: Run the installer**
  Double-click `dist-electron/Bliss Setup.exe` (or run from terminal) and install to a temp location.

- [ ] **Step 3: Launch the installed app**
  Run `dist-electron/win-unpacked/Bliss.exe` (or the installed shortcut).
  Expected:
  - Frameless window with custom title bar.
  - Chat UI loads and functions identically to the web version.
  - Tray minimize/restore works.
  - No DevTools visible.

- [ ] **Step 4: Commit if any build fixes were needed**
  ```bash
  git add -A
  git commit -m "fix(electron): production build adjustments"
  ```

---

## Spec Coverage Checklist

| Spec Requirement | Implementing Task |
|------------------|-------------------|
| Frameless window (`frame: false`) | Task 4 |
| Custom title bar with controls | Task 5 |
| Title bar minimize/maximize/close IPC | Task 3 + Task 4 |
| Close hides to tray | Task 4 (`window:close` → `win.hide()`) |
| System tray icon | Task 4 + Task 7 |
| Tray context menu (Show / Quit) | Task 4 |
| Tray click restores window | Task 4 |
| Single instance lock | Task 4 |
| Dev mode loads `localhost:5173` | Task 4 |
| Prod mode loads `build/index.html` | Task 4 |
| `electron-builder` Windows NSIS target | Task 1 |
| Preload `contextBridge` API | Task 3 |
| `window.electronAPI` types | Task 5 |
| NPM scripts (`electron:dev`, `electron:build`, `electron:preview`) | Task 1 |

---

## Placeholder Scan

- No "TBD", "TODO", or "implement later" strings.
- Every code block contains complete, runnable code.
- Every task has exact file paths.
- No vague instructions like "add appropriate error handling".

---

## Type Consistency Check

- `window.electronAPI.window.isMaximized()` returns `Promise<boolean>` — matches preload and renderer usage.
- `window.electronAPI.window.onMaximizeChange(callback)` returns unsubscribe function — matches preload and renderer usage.
- IPC channel names match exactly between `preload.ts`, `main.ts`, and `TitleBar.svelte`:
  - `window:minimize`
  - `window:maximize`
  - `window:close`
  - `window:isMaximized`
  - `window:maximize-changed`
  - `app:quit`
