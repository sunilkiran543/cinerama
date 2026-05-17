import React, { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  Clapperboard,
  Film,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2
} from "lucide-react";
import { searchMovies } from "./api";
import { loadWatchlist, saveWatchlist } from "./storage";
import type { FilterMode, Movie, SavedMovie } from "./types";
import "./styles.css";

const starterPicks = ["Dune", "Past Lives", "Spider-Man", "Arrival"];

export default function App() {
  const [query, setQuery] = useState("Dune");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<SavedMovie[]>(() => loadWatchlist());
  const [activeFilter, setActiveFilter] = useState<FilterMode>("all");
  const [genre, setGenre] = useState("All genres");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => saveWatchlist(watchlist), [watchlist]);
  useEffect(() => void runSearch("Dune"), []);

  const genres = useMemo(() => {
    const values = new Set(movies.map((movie) => movie.genre).filter(Boolean));
    return ["All genres", ...Array.from(values).sort()];
  }, [movies]);

  const savedIds = useMemo(() => new Set(watchlist.map((movie) => movie.id)), [watchlist]);

  const visibleMovies = useMemo(() => {
    const source = activeFilter === "watchlist" || activeFilter === "rated" ? watchlist : movies;
    return source.filter((movie) => {
      const genreMatches = genre === "All genres" || movie.genre === genre;
      const ratingMatches = activeFilter !== "rated" || ("userRating" in movie && movie.userRating > 0);
      return genreMatches && ratingMatches;
    });
  }, [activeFilter, genre, movies, watchlist]);

  async function runSearch(term = query) {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    setLoading(true);
    setError("");
    setActiveFilter("all");

    try {
      const results = await searchMovies(cleanTerm);
      setMovies(results);
      setGenre("All genres");
      if (results.length === 0) setError("No movies matched that search.");
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function toggleWatchlist(movie: Movie) {
    setWatchlist((current) => {
      if (current.some((item) => item.id === movie.id)) {
        return current.filter((item) => item.id !== movie.id);
      }

      return [{ ...movie, userRating: 0, savedAt: new Date().toISOString() }, ...current];
    });
  }

  function rateMovie(movie: Movie, userRating: number) {
    setWatchlist((current) => {
      const existing = current.find((item) => item.id === movie.id);
      if (existing) {
        return current.map((item) => (item.id === movie.id ? { ...item, userRating } : item));
      }

      return [{ ...movie, userRating, savedAt: new Date().toISOString() }, ...current];
    });
  }

  const ratedMovies = watchlist.filter((movie) => movie.userRating > 0);
  const average =
    ratedMovies.length === 0
      ? "0.0"
      : (ratedMovies.reduce((total, movie) => total + movie.userRating, 0) / ratedMovies.length).toFixed(1);

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Cinerama controls">
        <div className="brand">
          <span className="brand-mark">
            <Clapperboard size={22} />
          </span>
          <div>
            <h1>Cinerama</h1>
            <p>Movie discovery and watchlist tracking</p>
          </div>
        </div>

        <form
          className="search"
          onSubmit={(event) => {
            event.preventDefault();
            void runSearch();
          }}
        >
          <Search size={19} aria-hidden="true" />
          <input
            aria-label="Search movies"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search films, franchises, directors"
          />
          <button type="submit">Search</button>
        </form>
      </section>

      <section className="summary-band">
        <div className="headline">
          <span>
            <Sparkles size={18} />
            AI-assisted film finder
          </span>
          <h2>Search, rate, and save movies from a public film database.</h2>
        </div>
        <div className="stats" aria-label="Watchlist summary">
          <Stat label="Saved" value={String(watchlist.length)} />
          <Stat label="Rated" value={String(ratedMovies.length)} />
          <Stat label="Avg rating" value={average} />
        </div>
      </section>

      <section className="toolbar" aria-label="Filtering controls">
        <div className="segmented" role="tablist" aria-label="Movie view">
          <FilterButton label="Explore" mode="all" active={activeFilter} onClick={setActiveFilter} />
          <FilterButton label="Watchlist" mode="watchlist" active={activeFilter} onClick={setActiveFilter} />
          <FilterButton label="Rated" mode="rated" active={activeFilter} onClick={setActiveFilter} />
        </div>

        <label className="select-wrap">
          <SlidersHorizontal size={17} />
          <select value={genre} onChange={(event) => setGenre(event.target.value)}>
            {genres.map((genreName) => (
              <option key={genreName}>{genreName}</option>
            ))}
          </select>
        </label>

        <div className="quick-picks" aria-label="Suggested searches">
          {starterPicks.map((pick) => (
            <button
              key={pick}
              type="button"
              onClick={() => {
                setQuery(pick);
                void runSearch(pick);
              }}
            >
              {pick}
            </button>
          ))}
        </div>
      </section>

      {error ? <p className="notice">{error}</p> : null}

      <section className="movie-grid" aria-busy={loading}>
        {loading
          ? Array.from({ length: 8 }, (_, index) => <div className="skeleton" key={index} />)
          : visibleMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                saved={savedIds.has(movie.id)}
                savedMovie={watchlist.find((item) => item.id === movie.id)}
                onToggle={toggleWatchlist}
                onRate={rateMovie}
              />
            ))}
      </section>
    </main>
  );
}

function FilterButton({
  label,
  mode,
  active,
  onClick
}: {
  label: string;
  mode: FilterMode;
  active: FilterMode;
  onClick: (mode: FilterMode) => void;
}) {
  return (
    <button
      type="button"
      className={active === mode ? "active" : ""}
      onClick={() => onClick(mode)}
      role="tab"
      aria-selected={active === mode}
    >
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function MovieCard({
  movie,
  saved,
  savedMovie,
  onToggle,
  onRate
}: {
  movie: Movie;
  saved: boolean;
  savedMovie?: SavedMovie;
  onToggle: (movie: Movie) => void;
  onRate: (movie: Movie, rating: number) => void;
}) {
  const rating = savedMovie?.userRating || 0;

  return (
    <article className="movie-card">
      <div className="poster-wrap">
        {movie.poster ? (
          <img src={movie.poster} alt="" loading="lazy" />
        ) : (
          <div className="poster-fallback">
            <Film size={42} />
          </div>
        )}
        <button
          type="button"
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={() => onToggle(movie)}
          aria-label={saved ? `Remove ${movie.title} from watchlist` : `Save ${movie.title} to watchlist`}
        >
          {saved ? <Check size={18} /> : <Bookmark size={18} />}
        </button>
      </div>
      <div className="movie-body">
        <div className="movie-title-row">
          <h3>{movie.title}</h3>
          <span>{movie.year}</span>
        </div>
        <p className="meta">
          {movie.genre} / {movie.runtime} / {movie.rating}
        </p>
        <p className="synopsis">{movie.synopsis}</p>
        <div className="rating-row" aria-label={`Rate ${movie.title}`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              className={value <= rating ? "lit" : ""}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onClick={() => onRate(movie, value)}
            >
              <Star size={17} fill="currentColor" />
            </button>
          ))}
          {saved ? (
            <button type="button" className="remove" onClick={() => onToggle(movie)} aria-label="Remove">
              <Trash2 size={17} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
