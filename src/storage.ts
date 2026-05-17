import type { SavedMovie } from "./types";

const WATCHLIST_KEY = "cinerama.watchlist";

export function loadWatchlist(): SavedMovie[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? (JSON.parse(raw) as SavedMovie[]) : [];
  } catch {
    return [];
  }
}

export function saveWatchlist(movies: SavedMovie[]): void {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(movies));
}
