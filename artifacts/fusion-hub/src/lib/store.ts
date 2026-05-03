export interface App {
  id: number;
  name: string;
  url: string;
  icon: string;
  color: string;
  launchCount: number;
  lastLaunchedAt: string | null;
  position: number;
}

const STORAGE_KEY = "zenithsui_apps";
const listeners = new Set<() => void>();

const DEFAULT_APPS: App[] = [
  { id: 1, name: "YouTube",    url: "https://youtube.com",    icon: "▶️",  color: "#ef4444", launchCount: 0, lastLaunchedAt: null, position: 0 },
  { id: 2, name: "GitHub",     url: "https://github.com",     icon: "🐙",  color: "#8b5cf6", launchCount: 0, lastLaunchedAt: null, position: 1 },
  { id: 3, name: "ChatGPT",    url: "https://chat.openai.com",icon: "🤖",  color: "#10b981", launchCount: 0, lastLaunchedAt: null, position: 2 },
  { id: 4, name: "Google",     url: "https://google.com",     icon: "🔍",  color: "#3b82f6", launchCount: 0, lastLaunchedAt: null, position: 3 },
  { id: 5, name: "Twitter",    url: "https://x.com",          icon: "🐦",  color: "#06b6d4", launchCount: 0, lastLaunchedAt: null, position: 4 },
  { id: 6, name: "Gmail",      url: "https://mail.google.com",icon: "📧",  color: "#f97316", launchCount: 0, lastLaunchedAt: null, position: 5 },
  { id: 7, name: "Spotify",    url: "https://open.spotify.com",icon: "🎵", color: "#10b981", launchCount: 0, lastLaunchedAt: null, position: 6 },
  { id: 8, name: "Reddit",     url: "https://reddit.com",     icon: "🔥",  color: "#f97316", launchCount: 0, lastLaunchedAt: null, position: 7 },
];

// Stable cache — useSyncExternalStore requires getSnapshot to return
// the same reference when data hasn't changed, or React infinite-loops.
let _cache: App[] | null = null;

function load(): App[] {
  if (_cache !== null) return _cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      _cache = JSON.parse(raw) as App[];
    } else {
      // First visit — seed with default apps
      _cache = DEFAULT_APPS;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_cache));
    }
  } catch {
    _cache = DEFAULT_APPS;
  }
  return _cache;
}

function save(apps: App[]) {
  _cache = apps;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  listeners.forEach((l) => l());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Stable snapshot — same reference until save() is called. */
export function getApps(): App[] {
  return load();
}

export function createApp(data: Pick<App, "name" | "url" | "icon" | "color">): App {
  const apps = load();
  const app: App = {
    ...data,
    id: Date.now(),
    launchCount: 0,
    lastLaunchedAt: null,
    position: apps.length,
  };
  save([...apps, app]);
  return app;
}

export function deleteApp(id: number) {
  save(load().filter((a) => a.id !== id));
}

export function launchApp(id: number) {
  save(
    load().map((a) =>
      a.id === id
        ? { ...a, launchCount: a.launchCount + 1, lastLaunchedAt: new Date().toISOString() }
        : a
    )
  );
}

export function getStats() {
  const apps = load();
  return {
    totalApps: apps.length,
    totalLaunches: apps.reduce((s, a) => s + a.launchCount, 0),
  };
}

export function getRecent(limit = 5): App[] {
  return load()
    .filter((a) => a.lastLaunchedAt)
    .sort((a, b) => (b.lastLaunchedAt! > a.lastLaunchedAt! ? 1 : -1))
    .slice(0, limit);
}
