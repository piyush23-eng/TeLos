export function getApiBaseUrl(): string {
  const envVal = import.meta.env.VITE_API_BASE_URL;
  if (typeof envVal === "string") {
    const trimmed = envVal.trim();
    if (trimmed && trimmed !== "undefined" && trimmed !== "null" && trimmed !== '""') {
      return trimmed.replace(/\/+$/, "");
    }
  }
  if (import.meta.env.DEV) {
    return "http://localhost:8787";
  }
  return "";
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}

export const safeStorage = {
  get: (key: string): string | null => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, val: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, val);
      }
    } catch (e) {
      console.warn("Storage set notice:", e);
    }
  },
  remove: (key: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn("Storage remove notice:", e);
    }
  }
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
