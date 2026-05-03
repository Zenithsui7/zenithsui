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

const API = (import.meta.env.VITE_API_URL || "") + "/api";
const listeners = new Set<() => void>();
let _apps: App[] = [];
let _initialized = false;

function notify() {
  listeners.forEach((l) => l());
}

async function init() {
  if (_initialized) return;
  _initialized = true;
  try {
    const res = await fetch(`${API}/apps`);
    if (res.ok) {
      _apps = await res.json();
      notify();
    }
  } catch {
    // Network error — stay empty
  }
}

init();

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getApps(): App[] {
  return _apps;
}

export async function createApp(data: Pick<App, "name" | "url" | "icon" | "color">): Promise<App> {
  const res = await fetch(`${API}/apps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const app = await res.json();
  _apps = [..._apps, app];
  notify();
  return app;
}

export async function deleteApp(id: number) {
  await fetch(`${API}/apps/${id}`, { method: "DELETE" });
  _apps = _apps.filter((a) => a.id !== id);
  notify();
}

export async function launchApp(id: number) {
  const res = await fetch(`${API}/apps/${id}/launch`, { method: "POST" });
  if (res.ok) {
    const updated = await res.json();
    _apps = _apps.map((a) => (a.id === id ? { ...a, ...updated } : a));
    notify();
  }
}

export function getStats() {
  return {
    totalApps: _apps.length,
    totalLaunches: _apps.reduce((s, a) => s + a.launchCount, 0),
  };
}

export function getRecent(limit = 5): App[] {
  return _apps
    .filter((a) => a.lastLaunchedAt)
    .sort((a, b) => (b.lastLaunchedAt! > a.lastLaunchedAt! ? 1 : -1))
    .slice(0, limit);
}
