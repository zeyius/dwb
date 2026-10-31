// Data that doesn't change while someone shops (categories, store settings,
// delivery rates) is fetched once per browser session: kept in memory for
// this page and in sessionStorage for reloads. Failures aren't cached.
const memory = new Map()

export function sessionCached(key, load) {
  if (memory.has(key)) return memory.get(key)
  const storageKey = `cache:${key}`
  try {
    const saved = sessionStorage.getItem(storageKey)
    if (saved) {
      const promise = Promise.resolve(JSON.parse(saved))
      memory.set(key, promise)
      return promise
    }
  } catch {
    // unreadable or unavailable: fetch instead
  }
  const promise = load().then(
    (data) => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(data))
      } catch {
        // storage full or unavailable: memory still has it
      }
      return data
    },
    (error) => {
      memory.delete(key)
      throw error
    },
  )
  memory.set(key, promise)
  return promise
}
