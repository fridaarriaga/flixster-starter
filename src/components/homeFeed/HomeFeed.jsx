import { useEffect, useMemo, useRef, useState } from "react";
import "./HomeFeed.css";

const TMDB_NOW_PLAYING_URL = "https://api.themoviedb.org/3/movie/now_playing";
const TMDB_DISCOVER_URL = "https://api.themoviedb.org/3/discover/movie";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w780";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const CARD_TRANSITION_MS = 450;

const MOODS = [
  { key: "action", label: "Action", genreIds: [28, 12, 878], color: "#2ef5c7" },
  { key: "funny", label: "Funny", genreIds: [35, 10751], color: "#f7cd5e" },
  { key: "dark", label: "Dark", genreIds: [53, 27, 80], color: "#8d94ff" },
  { key: "romance", label: "Romance", genreIds: [10749], color: "#ff77bf" },
  { key: "thriller", label: "Thriller", genreIds: [53, 9648, 80], color: "#79f0ff" },
  { key: "fantasy", label: "Fantasy", genreIds: [14, 12, 16], color: "#61ff7c" },
];

const HomeFeed = ({ onMovieClick }) => {
  const [movies, setMovies] = useState([]);
  const [moodMovies, setMoodMovies] = useState([]);
  const [activeMood, setActiveMood] = useState("fantasy");
  const [activeMovieIndex, setActiveMovieIndex] = useState(0);
  const [cardTransitionStage, setCardTransitionStage] = useState("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const pendingNextIndexRef = useRef(null);
  const pendingMoodRef = useRef(null);
  const exitTimerRef = useRef(null);
  const enterTimerRef = useRef(null);

  useEffect(() => {
    const fetchFeedMovies = async () => {
      try {
        setIsLoading(true);
        setError("");
        const pagesToFetch = [1, 2, 3];
        const responses = await Promise.all(
          pagesToFetch.map((page) =>
            fetch(`${TMDB_NOW_PLAYING_URL}?api_key=${import.meta.env.VITE_API_KEY}&language=en-US&page=${page}`)
          )
        );

        if (responses.some((response) => !response.ok)) {
          throw new Error("Unable to load movies right now.");
        }

        const payloads = await Promise.all(responses.map((response) => response.json()));
        const combined = payloads.flatMap((payload) =>
          Array.isArray(payload.results) ? payload.results : []
        );

        // Deduplicate by movie id in case API returns overlaps.
        const uniqueMovies = Array.from(new Map(combined.map((movie) => [movie.id, movie])).values());
        setMovies(uniqueMovies);
      } catch (err) {
        setError(err.message || "Unable to load movies right now.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedMovies();
  }, []);

  const activeMoodConfig = useMemo(
    () => MOODS.find((mood) => mood.key === activeMood) || MOODS[0],
    [activeMood]
  );

  const filteredMovies = useMemo(
    () =>
      movies.filter(
        (movie) =>
          Array.isArray(movie.genre_ids) &&
          movie.genre_ids.some((id) => activeMoodConfig.genreIds.includes(id))
      ),
    [movies, activeMoodConfig]
  );

  useEffect(() => {
    const fetchMoodMovies = async () => {
      if (!activeMoodConfig?.genreIds?.length) {
        setMoodMovies([]);
        return;
      }

      try {
        const moodGenreFilter = activeMoodConfig.genreIds.join("|");
        const pagesToFetch = [1, 2];
        const responses = await Promise.all(
          pagesToFetch.map((page) =>
            fetch(
              `${TMDB_DISCOVER_URL}?api_key=${import.meta.env.VITE_API_KEY}&language=en-US&page=${page}&with_genres=${moodGenreFilter}&include_adult=false&sort_by=popularity.desc`
            )
          )
        );

        if (responses.some((response) => !response.ok)) {
          setMoodMovies([]);
          return;
        }

        const payloads = await Promise.all(responses.map((response) => response.json()));
        const combined = payloads.flatMap((payload) =>
          Array.isArray(payload.results) ? payload.results : []
        );
        const uniqueMoodMovies = Array.from(new Map(combined.map((movie) => [movie.id, movie])).values());
        setMoodMovies(uniqueMoodMovies);
      } catch {
        setMoodMovies([]);
      }
    };

    fetchMoodMovies();
  }, [activeMoodConfig]);

  const activePool = useMemo(() => {
    const mergedMoodPool = [...moodMovies, ...filteredMovies].filter(
      (movie) =>
        Array.isArray(movie.genre_ids) &&
        movie.genre_ids.some((id) => activeMoodConfig.genreIds.includes(id))
    );
    const uniqueMoodPool = Array.from(new Map(mergedMoodPool.map((movie) => [movie.id, movie])).values());

    if (uniqueMoodPool.length > 0) {
      return uniqueMoodPool;
    }

    return movies;
  }, [moodMovies, filteredMovies, movies, activeMoodConfig]);

  useEffect(() => {
    setActiveMovieIndex(0);
  }, [activeMood]);

  useEffect(() => {
    if (activeMovieIndex >= activePool.length) {
      setActiveMovieIndex(0);
    }
  }, [activePool, activeMovieIndex]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
      if (enterTimerRef.current) {
        window.clearTimeout(enterTimerRef.current);
      }
    };
  }, []);

  const activeMovie = activePool[activeMovieIndex] ?? activePool[0] ?? null;

  if (isLoading) return <p className="home-feed__status">Loading mood spotlight...</p>;
  if (error) return <p className="home-feed__status home-feed__status--error">{error}</p>;
  if (activePool.length === 0) return <p className="home-feed__status">No movies for this mood yet.</p>;
  if (!activeMovie) return <p className="home-feed__status">No movies available right now.</p>;

  const imageUrl = activeMovie.poster_path
    ? `${POSTER_BASE_URL}${activeMovie.poster_path}`
    : activeMovie.backdrop_path
      ? `${BACKDROP_BASE_URL}${activeMovie.backdrop_path}`
      : "";
  const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(
    `${activeMovie.title || "movie"}`
  )}`;

  const moodStyle = { "--mood-color": activeMoodConfig.color };

  const startCardTransition = (onSwap) => {
    if (cardTransitionStage !== "idle") {
      return;
    }

    setCardTransitionStage("exiting");

    exitTimerRef.current = window.setTimeout(() => {
      onSwap();
      setCardTransitionStage("entering");

      enterTimerRef.current = window.setTimeout(() => {
        setCardTransitionStage("idle");
      }, CARD_TRANSITION_MS);
    }, CARD_TRANSITION_MS);
  };

  const handleAdvanceTrigger = () => {
    if (activePool.length <= 1) {
      return;
    }
    pendingNextIndexRef.current = (activeMovieIndex + 1) % activePool.length;
    startCardTransition(() => {
      setActiveMovieIndex(pendingNextIndexRef.current ?? 0);
    });
  };

  const handleOpenMovieModal = (event) => {
    event.stopPropagation();

    if (!onMovieClick || !activeMovie?.id) {
      return;
    }

    const cardElement = event.currentTarget.closest(".home-feed__phone-card");
    const cardRect = cardElement ? cardElement.getBoundingClientRect() : null;
    onMovieClick(activeMovie.id, cardRect);
  };

  const handleMoodChange = (nextMood) => {
    if (!nextMood || nextMood === activeMood) {
      return;
    }

    pendingMoodRef.current = nextMood;
    startCardTransition(() => {
      setActiveMood(pendingMoodRef.current ?? nextMood);
      setActiveMovieIndex(0);
    });
  };

  return (
    <section className="home-feed" style={moodStyle} aria-label="Spotlight mood wheel">
      <p className="home-feed__mood-title">
        <span>What&apos;s your mood?</span>
        <strong>{activeMoodConfig.label}</strong>
      </p>

      <div className="home-feed__wheel-wrap">
        <div className="home-feed__orbit-ring" />
        {MOODS.map((mood, index) => (
          <button
            key={mood.key}
            type="button"
            className={`home-feed__mood-orbit ${activeMood === mood.key ? "home-feed__mood-orbit--active" : ""}`}
            style={{ "--i": index, "--count": MOODS.length, "--mood-node-color": mood.color }}
            onClick={() => handleMoodChange(mood.key)}
          >
            {mood.label}
          </button>
        ))}

        <article
          className={`home-feed__phone-card ${
            cardTransitionStage === "exiting"
              ? "home-feed__phone-card--exit"
              : cardTransitionStage === "entering"
                ? "home-feed__phone-card--enter"
                : ""
          }`}
          role="button"
          tabIndex={0}
          onPointerUp={handleAdvanceTrigger}
          onClick={handleAdvanceTrigger}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleAdvanceTrigger();
            }
          }}
        >
          <a
            className="home-feed__tiktok-link"
            href={tiktokSearchUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Search ${activeMovie.title} on TikTok`}
            onClick={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
          >
            <img src="/tiktok-logo.png" alt="TikTok" />
          </a>
          <button
            className="home-feed__modal-link"
            type="button"
            aria-label={`Open ${activeMovie.title} details`}
            onClick={handleOpenMovieModal}
            onPointerUp={(event) => event.stopPropagation()}
          >
            i
          </button>
          {imageUrl ? (
            <img className="home-feed__poster" src={imageUrl} alt={`${activeMovie.title} poster`} />
          ) : (
            <div className="home-feed__poster home-feed__poster--placeholder">No image</div>
          )}
          <div className="home-feed__card-overlay">
            <p className="home-feed__card-mood">{activeMoodConfig.label}</p>
            <h2>{activeMovie.title}</h2>
            <p className="home-feed__card-meta">
              {typeof activeMovie.vote_average === "number" ? activeMovie.vote_average.toFixed(1) : "N/A"} |{" "}
              {activeMovie.release_date || "Unknown"}
            </p>
            <p className="home-feed__card-hint">Tap card to see another {activeMoodConfig.label.toLowerCase()} movie</p>
          </div>
        </article>
      </div>

      <div className="home-feed__mood-pills">
        {MOODS.map((mood) => (
          <button
            key={mood.key}
            type="button"
            className={`home-feed__pill ${activeMood === mood.key ? "home-feed__pill--active" : ""}`}
            onClick={() => handleMoodChange(mood.key)}
          >
            {mood.label}
          </button>
        ))}
      </div>

    </section>
  );
};

export default HomeFeed;
