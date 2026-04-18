/**
 * Safe localStorage utilities
 * Handles cases where localStorage might not be available
 */

export const storage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to read from localStorage: ${key}`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (typeof window === "undefined") return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Failed to write to localStorage: ${key}`, error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    if (typeof window === "undefined") return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove from localStorage: ${key}`, error);
      return false;
    }
  },

  getJSON: <T>(key: string, defaultValue?: T): T | null => {
    const item = storage.getItem(key);
    if (!item) return defaultValue ?? null;
    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to parse JSON from localStorage: ${key}`, error);
      return defaultValue ?? null;
    }
  },

  setJSON: <T>(key: string, value: T): boolean => {
    try {
      const json = JSON.stringify(value);
      return storage.setItem(key, json);
    } catch (error) {
      console.error(`Failed to stringify for localStorage: ${key}`, error);
      return false;
    }
  },

  clear: (): boolean => {
    if (typeof window === "undefined") return false;
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Failed to clear localStorage", error);
      return false;
    }
  },
};
