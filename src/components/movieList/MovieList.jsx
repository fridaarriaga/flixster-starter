import { useEffect, useMemo, useState } from "react";
import MovieCard from "../movieCard/MovieCard";
import SearchBar from "../searchBar/SearchBar";
import "./MovieList.css";

const TMDB_NOW_PLAYING_URL = "https://api.themoviedb.org/3/movie/now_playing";
const TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie";

const MovieList = ({ onMovieClick }) => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [sortOption, setSortOption] = useState("title");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        if (page === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        setError(null);

        const endpoint = activeQuery.trim() ? TMDB_SEARCH_URL : TMDB_NOW_PLAYING_URL;
        const params = new URLSearchParams({
          api_key: import.meta.env.VITE_API_KEY,
          language: "en-US",
          page: String(page),
        });

        if (activeQuery.trim()) {
          params.set("query", activeQuery.trim());
          params.set("include_adult", "false");
        }

        const response = await fetch(`${endpoint}?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Unable to fetch movies right now.");
        }

        const data = await response.json();
        const newMovies = Array.isArray(data.results) ? data.results : [];
        const incomingTotalPages = typeof data.total_pages === "number" ? data.total_pages : 1;

        setTotalPages(incomingTotalPages);
        if (page === 1) {
          setMovies(newMovies);
        } else {
          setMovies((prevMovies) => [...prevMovies, ...newMovies]);
        }
      } catch (err) {
        setError(err.message || "Something went wrong while loading movies.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchMovies();
  }, [page, activeQuery, requestId]);

  const handleSearch = () => {
    const nextQuery = query.trim();
    setMovies([]);
    setTotalPages(1);
    setPage(1);
    setActiveQuery(nextQuery);
    setRequestId((previousId) => previousId + 1);
  };

  const handleClear = () => {
    handleNowPlaying();
  };

  const handleNowPlaying = () => {
    setQuery("");
    setMovies([]);
    setTotalPages(1);
    setPage(1);
    setActiveQuery("");
    setRequestId((previousId) => previousId + 1);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || page >= totalPages) {
      return;
    }

    setPage((previousPage) => previousPage + 1);
  };
  const hasActiveSearch = Boolean(activeQuery.trim());
  const hasNoResults = !isLoading && !error && movies.length === 0;
  const sortedMovies = useMemo(() => {
    const sorted = [...movies];

    if (sortOption === "title") {
      sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      return sorted;
    }

    if (sortOption === "release_date") {
      sorted.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
      return sorted;
    }

    if (sortOption === "vote_average") {
      sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    }

    return sorted;
  }, [movies, sortOption]);

  return (
    <>
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        onClear={handleClear}
        onNowPlaying={handleNowPlaying}
        isBusy={isLoading}
        isNowPlayingMode={!hasActiveSearch}
      />

      <div className="movie-list__sort">
        <label htmlFor="movie-sort" className="movie-list__sort-label">
          Sort by
        </label>
        <select
          id="movie-sort"
          className="movie-list__sort-select"
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value)}
        >
          <option value="title">Title (A-Z)</option>
          <option value="release_date">Release Date (Newest)</option>
          <option value="vote_average">Vote Average (Highest)</option>
        </select>
      </div>

      {!isLoading && !error && (
        <p className="movie-list__meta">
          {hasActiveSearch ? `Results for "${activeQuery}"` : "Now Playing Movies"} - {movies.length} shown
        </p>
      )}

      {isLoading && <p className="movie-list__status">Loading movies...</p>}
      {error && <p className="movie-list__status movie-list__status--error">{error}</p>}

      {!isLoading && !error && (
        <section className="movie-list" aria-label="Movie results">
          {sortedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
          ))}
        </section>
      )}

      {hasNoResults && (
        <p className="movie-list__status">
          No movies found. Try another title or clear search to return to now playing.
        </p>
      )}

      {!isLoading && !error && movies.length > 0 && (isLoadingMore || page < totalPages) && (
        <div className="movie-list__controls">
          <button
            className="movie-list__load-more"
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore || page >= totalPages}
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
};

export default MovieList;
