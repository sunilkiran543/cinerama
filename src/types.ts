export interface ItunesMovie {
  trackId: number;
  trackName: string;
  artistName?: string;
  primaryGenreName?: string;
  releaseDate?: string;
  trackTimeMillis?: number;
  artworkUrl100?: string;
  shortDescription?: string;
  longDescription?: string;
  contentAdvisoryRating?: string;
  trackViewUrl?: string;
}

export interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesMovie[];
}

export interface Movie {
  id: number;
  title: string;
  director: string;
  genre: string;
  year: string;
  runtime: string;
  poster: string;
  synopsis: string;
  rating: string;
  url?: string;
}

export interface SavedMovie extends Movie {
  userRating: number;
  savedAt: string;
}

export type FilterMode = "all" | "watchlist" | "rated";
