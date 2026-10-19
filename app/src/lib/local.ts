// Small per-device memory (diet ticks, chosen diet day). Browser storage on web; nothing on native yet.

export function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem('gabi:' + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocal(key: string, value: unknown) {
  try {
    globalThis.localStorage?.setItem('gabi:' + key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked (private mode); the app works without it.
  }
}
