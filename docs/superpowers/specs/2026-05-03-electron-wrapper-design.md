# Bliss Desktop — Electron Wrapper Design Spec

**Date:** 2026-05-03  
**Project:** zas (Bliss Chat UI)  
**Goal:** Package the existing SvelteKit static SPA as a Windows-native Electron app with a custom title bar and system-tray minimize behavior.

---

## 1. Overview

The current `zas` project is a pure client-side SvelteKit chat UI. It is built with `adapter-static`, prerendered, and served as a static bundle. This design adds a thin Electron shell around that bundle without modifying any existing application logic, component markup, or styling.

The resulting app is a **frameless** Windows desktop application that:
- Draws its own window chrome (title bar + controls) inside the SvelteKit UI.
- Minimizes to the system tray when the user clicks the close button.
- Can be packaged into a single `.exe` installer via `electron-builder`.

Native features such as session persistence, OS notifications, and file-system access are **not** implemented in this phase, but the IPC bridge is designed so they can be added later without breaking changes.

---

## 2. Architecture

```
zas/
├── src/                          # SvelteKit app — UNCHANGED except +layout.svelte
│   ├── lib/components/bliss/
│   │   ├── TitleBar.svelte       # NEW — custom window chrome
│   │   └── ...                   # existing components untouched
│   └── routes/+layout.svelte     # injects TitleBar above page content
├── static/
│   └── icon.png                  # source asset for tray icon
├── build/                        # SvelteKit static output (gitignored)
├── electron/
│   ├── main.ts                   # Entry point: BrowserWindow, tray, IPC
│   ├── preload.ts                # contextBridge — safe renderer API
│   └── tsconfig.json             # Electron-side TypeScript config
├── package.json                  # + electron, electron-builder deps & scripts
├── svelte.config.js              # UNCHANGED
└── vite.config.ts                # UNCHANGED
```

### Build flow
1. `vite build` — SvelteKit emits static files to `build/`.
2. `tsc -p electron` — Compiles `electron/*.ts` to `electron/dist/`.
3. `electron-builder` — Packages `build/` + `electron/dist/` into `dist-electron/Bliss Setup.exe`.

### Dev flow
`electron:dev` runs Vite dev server (`http://localhost:5173`) and launches Electron pointing at that URL, enabling hot reload.

---

## 3. Window Behavior

- **Frame:** `frame: false` — no native Windows title bar.
- **Default size:** 1200 × 800.
- **Minimum size:** 900 × 600.
- **Menu bar:** Removed in production; kept in development for debugging.
- **DevTools:** Enabled only when `NODE_ENV === 'development'`.
- **Background:** `#ffffff` (or `oklch` background token) to prevent white flash on load.

---

## 4. Custom Title Bar

### Component: `src/lib/components/bliss/TitleBar.svelte`

A fixed-height bar (~40 px) rendered at the top of `+layout.svelte`.

**Layout:**
- **Left:** Bliss logo icon + "Bliss" wordmark.
- **Center:** Draggable dead zone (`-webkit-app-region: drag`).
- **Right:** Window controls — minimize, maximize/restore, close.

**Styling:** Uses existing Tailwind tokens (`bg-background`, `border-b`, `text-foreground`). Controls are subtle hover-state buttons matching the app theme.

**IPC usage (via `window.electronAPI`):**
```ts
window.electronAPI.window.minimize()
window.electronAPI.window.maximize()
window.electronAPI.window.close()      // triggers tray hide, NOT quit
window.electronAPI.window.isMaximized() // boolean
window.electronAPI.window.onMaximizeChange((isMaximized: boolean) => ...)
```

---

## 5. System Tray Integration

### Tray icon
Source: `static/icon.png`. At build time `electron-builder` embeds it; at runtime the tray loads a `.ico` or `.png` from the app resources directory.

### Close behavior
- Clicking the custom **close** button calls `window.close()`, which in `main.ts` maps to `win.hide()`.
- The app **does not** quit.
- `Alt+F4` is intercepted and also maps to `win.hide()`.

### Tray context menu
- **Show Bliss** — `win.show()` + `win.focus()`
- **Quit** — `app.quit()` (fully exits)

### Single-click tray icon
Restores the hidden window (`win.show()` + `win.focus()`).

### Startup
If the app is launched while already running, the existing window is shown and focused (single-instance lock).

---

## 6. IPC Bridge

All renderer-to-main communication goes through `contextBridge` in `preload.ts`. The raw `ipcRenderer` is **never** exposed directly.

### Channels (Phase 1 — thin wrapper)

| Channel | Direction | Payload | Handler |
|---------|-----------|---------|---------|
| `window:minimize` | R → M | — | `win.minimize()` |
| `window:maximize` | R → M | — | `win.maximize()` / `win.unmaximize()` |
| `window:close` | R → M | — | `win.hide()` |
| `window:isMaximized` | R → M | — | returns `boolean` |
| `window:maximize-changed` | M → R | `boolean` | emitted on `maximize` / `unmaximize` |
| `app:quit` | R → M | — | `app.quit()` |

### Future-proof channels (not implemented now)

| Channel | Direction | Future use |
|---------|-----------|------------|
| `store:get` | R ↔ M | `electron-store` key-value persistence |
| `store:set` | R → M | Save session state to disk |
| `native:notify` | R → M | OS toast notifications |
| `file:open` | R → M | Drag-and-drop / open file dialog |
| `file:save` | R → M | Save file dialog |

---

## 7. Packaging (`electron-builder`)

Target: **Windows x64 NSIS installer**.

Key `package.json` fields:
```json
{
  "name": "bliss-chat-ui",
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
  }
}
```

Output: `dist-electron/Bliss Setup.exe`.

---

## 8. NPM Scripts

| Script | What it does |
|--------|--------------|
| `electron:dev` | Concurrently run `vite dev` + Electron with hot reload |
| `electron:build` | Full pipeline: `vite build` → `tsc -p electron` → `electron-builder` |
| `electron:preview` | Build then run the packaged app |

---

## 9. Files Modified / Added

### Modified
- `src/routes/+layout.svelte` — inject `<TitleBar />` above `{@render children()}`
- `package.json` — add dependencies, scripts, and `build` config

### Added
- `electron/main.ts`
- `electron/preload.ts`
- `electron/tsconfig.json`
- `src/lib/components/bliss/TitleBar.svelte`
- `static/icon.png` (if not present)

### Unchanged
- All existing `src/lib/components/bliss/*` except `+layout.svelte`
- `src/routes/+page.svelte`
- `svelte.config.js`
- `vite.config.ts`
- `tsconfig.json` (project root)

---

## 10. Error Handling & Edge Cases

- **Single instance:** If the user tries to launch a second instance, the first window is focused instead of spawning a new process.
- **Window closed while hidden:** If the OS kills the renderer process while the window is hidden in tray, the tray icon remains and "Show Bliss" restores a new window.
- **Dev server unavailable:** In dev mode, if `localhost:5173` is unreachable, the renderer shows a simple retry screen (or the standard Electron "page not available").

---

## 11. Success Criteria

- [ ] `pnpm electron:dev` opens a frameless 1200×800 window with a custom title bar.
- [ ] Clicking minimize, maximize, and close buttons behaves correctly.
- [ ] Clicking close hides the window; the tray icon remains.
- [ ] Clicking the tray icon restores the window.
- [ ] Right-clicking the tray icon shows "Show Bliss" and "Quit".
- [ ] `pnpm electron:build` produces `dist-electron/Bliss Setup.exe` that installs and runs standalone.
- [ ] No regression in existing SvelteKit chat functionality.
