// Pure client-side chat (no server data). Prerender everything and skip SSR
// so the Composer/Sidebar/chat state are driven purely by runes in the browser.
export const prerender = true
export const ssr = false
