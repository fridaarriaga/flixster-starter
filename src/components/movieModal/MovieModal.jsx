import { useEffect, useMemo, useState } from "react";
import "./MovieModal.css";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w780";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_MOVIE_URL = "https://api.themoviedb.org/3/movie";
const YOUTUBE_WATCH_URL = "https://www.youtube.com/embed";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_FALLBACK_MESSAGE =
  "We couldn't generate a recommendation for this one - check out the overview above!";

const MovieModal = ({ movieId, isOpen, onClose, originRect }) => {
  const [movieDetails, setMovieDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [showTrailerPanel, setShowTrailerPanel] = useState(false);
  const [trailerKey, setTrailerKey] = useState("");
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [trailerError, setTrailerError] = useState("");
  const [aiInsight, setAiInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [aiInsightError, setAiInsightError] = useState("");

  const getMovieInsight = async (title, genres, overview) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      console.warn("Missing VITE_OPENROUTER_API_KEY");
      return AI_FALLBACK_MESSAGE;
    }

    const systemMessage = `
You are an enthusiastic but honest film critic.
Write a 2-3 sentence watch recommendation in plain text.
Do not include spoilers.
Do not use first-person statements (I, me, my).
Avoid generic phrases like "must-see".
Avoid unnecessary comparisons to other films unless it adds value.
`.trim();

    const userMessage = `
Write a 2-3 sentence watch recommendation for this movie encouraging the user to watch it. Someone who is looking for a quick recommendation and a personalized take on whether the film is worth their evening.
Title: ${title || "Unknown"}
Genres: ${genres || "Unknown"}
Overview: ${overview || "No overview available."}
Keep it spoiler-free, specific, and plain text only. Don't just repeat the title. 
`.trim();

    const models = ["openrouter/auto", "google/gemma-4-26b-a4b-it:free", "meta-llama/llama-3.3-70b-instruct:free", ];

    for (const model of models) {
      try {
        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemMessage },
              { role: "user", content: userMessage },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter error: ${response.status}`);
        }

        const data = await response.json();
        const message = data?.choices?.[0]?.message?.content?.trim();

        if (message) {
          return message;
        }
      } catch (error) {
        console.error("AI insight failed:", error);
      }
    }

    return AI_FALLBACK_MESSAGE;
  };

  const mediaUrl = useMemo(() => {
    if (!movieDetails) {
      return "";
    }

    if (movieDetails.backdrop_path) {
      return `${BACKDROP_BASE_URL}${movieDetails.backdrop_path}`;
    }

    if (movieDetails.poster_path) {
      return `${POSTER_BASE_URL}${movieDetails.poster_path}`;
    }

    return "";
  }, [movieDetails]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!isOpen || !movieId) {
        return;
      }

      setIsLoadingDetails(true);
      setDetailsError("");
      setMovieDetails(null);

      try {
        const response = await fetch(
          `${TMDB_MOVIE_URL}/${movieId}?api_key=${import.meta.env.VITE_API_KEY}&language=en-US`
        );

        if (!response.ok) {
          throw new Error("Movie details could not be loaded. Please try another movie.");
        }

        const data = await response.json();
        setMovieDetails(data);
      } catch (err) {
        setDetailsError(err.message || "Movie details are unavailable right now.");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchMovieDetails();
  }, [isOpen, movieId]);

  useEffect(() => {
    const fetchTrailer = async () => {
      if (!isOpen || !movieId) {
        return;
      }

      setIsLoadingTrailer(true);
      setTrailerError("");
      setTrailerKey("");

      try {
        const response = await fetch(
          `${TMDB_MOVIE_URL}/${movieId}/videos?api_key=${import.meta.env.VITE_API_KEY}&language=en-US`
        );

        if (!response.ok) {
          throw new Error("Unable to load trailer.");
        }

        const data = await response.json();
        const videos = Array.isArray(data?.results) ? data.results : [];

        const bestYoutubeTrailer =
          videos.find(
            (video) =>
              video.site === "YouTube" &&
              video.type === "Trailer" &&
              video.official === true &&
              video.key
          ) ||
          videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.key) ||
          videos.find((video) => video.site === "YouTube" && video.key);

        if (!bestYoutubeTrailer?.key) {
          setTrailerError("No YouTube trailer available for this movie.");
          return;
        }

        setTrailerKey(bestYoutubeTrailer.key);
      } catch (err) {
        setTrailerError(err.message || "Trailer is unavailable right now.");
      } finally {
        setIsLoadingTrailer(false);
      }
    };

    fetchTrailer();
  }, [isOpen, movieId]);

  useEffect(() => {
    if (!isOpen) {
      setShowTrailerPanel(false);
      setAiInsight("");
      setLoadingInsight(false);
      setAiInsightError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !movieId || isLoadingDetails || detailsError || !movieDetails) {
      return;
    }

    let isCancelled = false;

    const fetchAiInsight = async () => {
      setLoadingInsight(true);
      setAiInsight("");
      setAiInsightError("");

      const genres = Array.isArray(movieDetails.genres)
        ? movieDetails.genres.map((genre) => genre.name).join(", ")
        : "";

      const insight = await getMovieInsight(movieDetails.title, genres, movieDetails.overview);

      if (isCancelled) {
        return;
      }

      if (insight === AI_FALLBACK_MESSAGE) {
        setAiInsightError(AI_FALLBACK_MESSAGE);
      } else {
        setAiInsight(insight);
      }

      setLoadingInsight(false);
    };

    fetchAiInsight();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, movieId, movieDetails, isLoadingDetails, detailsError]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const entranceStyle = useMemo(() => {
    if (!originRect || !isOpen) {
      return {};
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = Math.min(980, viewportWidth - 40);
    const modalHeight = Math.min(720, viewportHeight - 60);
    const modalCenterX = viewportWidth / 2;
    const modalCenterY = viewportHeight / 2;

    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;

    const translateX = originCenterX - modalCenterX;
    const translateY = originCenterY - modalCenterY;
    const scaleX = Math.max(0.2, Math.min(1, originRect.width / modalWidth));
    const scaleY = Math.max(0.2, Math.min(1, originRect.height / modalHeight));

    return {
      "--flip-start-x": `${translateX}px`,
      "--flip-start-y": `${translateY}px`,
      "--flip-start-scale-x": scaleX,
      "--flip-start-scale-y": scaleY,
    };
  }, [originRect, isOpen]);

  if (!isOpen || !movieId) {
    return null;
  }

  const genresText = Array.isArray(movieDetails?.genres)
    ? movieDetails.genres.map((genre) => genre.name).join(", ")
    : "";

  return (
    <div className="movie-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-modal-title"
        onClick={(event) => event.stopPropagation()}
        style={entranceStyle}
      >
        <div className="movie-modal__layout">
          <section className="movie-modal__media">
            <button
              className="movie-modal__toggle"
              type="button"
              onClick={() => setShowTrailerPanel((current) => !current)}
              disabled={isLoadingDetails || Boolean(detailsError)}
            >
              {showTrailerPanel ? "Show Image" : "Show Trailer"}
            </button>

            {!showTrailerPanel ? (
              mediaUrl ? (
                <img
                  className="movie-modal__image"
                  src={mediaUrl}
                  alt={`${movieDetails?.title || "Movie"} visual`}
                />
              ) : (
                <div className="movie-modal__media-placeholder">
                  {isLoadingDetails ? "Loading movie details..." : "No image available"}
                </div>
              )
            ) : (
              <>
                {isLoadingTrailer && <div className="movie-modal__media-placeholder">Loading trailer...</div>}
                {!isLoadingTrailer && trailerError && (
                  <div className="movie-modal__media-placeholder">{trailerError}</div>
                )}
                {!isLoadingTrailer && !trailerError && trailerKey && (
                  <iframe
                    className="movie-modal__trailer"
                    src={`${YOUTUBE_WATCH_URL}/${trailerKey}`}
                    title={`${movieDetails?.title || "Movie"} trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                )}
              </>
            )}
          </section>

          <section className="movie-modal__description">
            {isLoadingDetails && <p>Loading movie details...</p>}

            {!isLoadingDetails && detailsError && (
              <p className="movie-modal__error">{detailsError}</p>
            )}

            {!isLoadingDetails && !detailsError && movieDetails && (
              <>
                <h2 id="movie-modal-title">{movieDetails.title}</h2>
                <p>
                  <strong>Runtime:</strong> {movieDetails.runtime ? `${movieDetails.runtime} min` : "Unknown"}
                </p>
                <p>
                  <strong>Release date:</strong> {movieDetails.release_date || "Unknown"}
                </p>
                <p>
                  <strong>Genres:</strong> {genresText || "Unknown"}
                </p>
                <p>{movieDetails.overview || "No description available."}</p>
                <div className="movie-modal__ai-block">
                  <p className="movie-modal__ai-title">AI Take</p>
                  {loadingInsight && <p>✨ Getting a recommendation...</p>}
                  {!loadingInsight && aiInsight && <p>{aiInsight}</p>}
                  {!loadingInsight && !aiInsight && aiInsightError && <p>{aiInsightError}</p>}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
