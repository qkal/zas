import { browser } from '$app/environment'

type ThemePreference = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'bliss-theme'

function readStored(): ThemePreference {
  if (!browser) return 'system'
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'light' || v === 'dark' ? v : 'system'
}

function systemTheme(): ResolvedTheme {
  if (!browser) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolve(pref: ThemePreference): ResolvedTheme {
  return pref === 'system' ? systemTheme() : pref
}

function createThemeStore() {
  let preference = $state<ThemePreference>(readStored())
  let resolved = $state<ResolvedTheme>(resolve(preference))

  if (browser) {
    // Keep DOM class in sync whenever `resolved` changes.
    $effect.root(() => {
      $effect(() => {
        document.documentElement.classList.toggle('dark', resolved === 'dark')
      })

      // React to OS-level scheme changes when preference is "system".
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onSystemChange = () => {
        if (preference === 'system') resolved = systemTheme()
      }
      mq.addEventListener('change', onSystemChange)

      return () => {
        mq.removeEventListener('change', onSystemChange)
      }
    })
  }

  return {
    get preference() {
      return preference
    },
    get resolved() {
      return resolved
    },
    set(next: ThemePreference) {
      preference = next
      resolved = resolve(next)
      if (browser) {
        if (next === 'system') localStorage.removeItem(STORAGE_KEY)
        else localStorage.setItem(STORAGE_KEY, next)
      }
    },
    toggle() {
      this.set(resolved === 'dark' ? 'light' : 'dark')
    },
  }
}

export const theme = createThemeStore()
