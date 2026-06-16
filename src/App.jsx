import { useEffect, useMemo, useState } from "react";
import HomeFeed from "./components/homeFeed/HomeFeed";
import MovieList from "./components/movieList/MovieList";
import MovieModal from "./components/movieModal/MovieModal";
import MyList from "./components/myList/MyList";
import "./App.css";

const POPCORN = [
  { left: "4%", top: "18%", rot: -20, scale: 1.1 },
  { left: "9%", top: "62%", rot: 12, scale: 0.85 },
  { left: "15%", top: "30%", rot: -5, scale: 0.95 },
  { left: "21%", top: "70%", rot: 25, scale: 1.0 },
  { left: "28%", top: "15%", rot: -15, scale: 0.8 },
  { left: "36%", top: "65%", rot: 8, scale: 1.05 },
  { left: "44%", top: "22%", rot: -30, scale: 0.9 },
  { left: "56%", top: "68%", rot: 18, scale: 1.0 },
  { left: "63%", top: "20%", rot: -8, scale: 0.85 },
  { left: "71%", top: "60%", rot: 22, scale: 1.1 },
  { left: "78%", top: "28%", rot: -18, scale: 0.9 },
  { left: "85%", top: "72%", rot: 10, scale: 0.95 },
  { left: "91%", top: "18%", rot: -25, scale: 1.0 },
  { left: "96%", top: "58%", rot: 15, scale: 0.85 },
];
const MY_LIST_STORAGE_KEY = "flixster-my-list";

const App = () => {
  const [myListMovies, setMyListMovies] = useState(() => {
    try {
      const saved = window.localStorage.getItem(MY_LIST_STORAGE_KEY);
      if (!saved) {
        return [];
      }
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [modalOriginRect, setModalOriginRect] = useState(null);
  const [activeView, setActiveView] = useState("home");
  const myListIds = useMemo(() => new Set(myListMovies.map((movie) => movie.id)), [myListMovies]);

  useEffect(() => {
    window.localStorage.setItem(MY_LIST_STORAGE_KEY, JSON.stringify(myListMovies));
  }, [myListMovies]);

  const handleMovieClick = (movieId, originRect) => {
    setModalOriginRect(originRect ?? null);
    setSelectedMovieId(movieId ?? null);
  };

  const handleCloseModal = () => {
    setSelectedMovieId(null);
    setModalOriginRect(null);
  };

  const handleToggleMyList = (movie) => {
    if (!movie?.id) {
      return;
    }

    setMyListMovies((previous) => {
      const exists = previous.some((savedMovie) => savedMovie.id === movie.id);
      if (exists) {
        return previous.filter((savedMovie) => savedMovie.id !== movie.id);
      }

      const normalizedMovie = {
        id: movie.id,
        title: movie.title || "Untitled movie",
        poster_path: movie.poster_path ?? null,
        vote_average: typeof movie.vote_average === "number" ? movie.vote_average : 0,
        release_date: movie.release_date || "",
        genre_ids: Array.isArray(movie.genre_ids)
          ? movie.genre_ids
          : Array.isArray(movie.genres)
            ? movie.genres.map((genre) => genre.id).filter(Boolean)
            : [],
      };

      return [normalizedMovie, ...previous];
    });
  };

  return (
    <div className="App">
      <section className="app-banner" aria-label="Frida's Movie Corner banner">
        <div className="app-banner__stripe" />
        <div className="app-banner__center">
          {POPCORN.map((p, index) => (
            <span
              key={`${p.left}-${p.top}-${index}`}
              className="app-banner__popcorn-piece"
              aria-hidden="true"
              style={{
                left: p.left,
                top: p.top,
                transform: `rotate(${p.rot}deg) scale(${p.scale})`,
              }}
            >
              🍿
            </span>
          ))}
          <p className="app-banner__title">Frida&apos;s Movie Corner</p>
        </div>
        <div className="app-banner__stripe" />
      </section>

      <main className="gallery-page">
        <nav className="gallery-nav" aria-label="Page sections">
          <button
            className={`gallery-nav__link ${activeView === "home" ? "gallery-nav__link--active" : ""}`}
            type="button"
            onClick={() => setActiveView("home")}
          >
            Home
          </button>
          <button
            className={`gallery-nav__link ${activeView === "gallery" ? "gallery-nav__link--active" : ""}`}
            type="button"
            onClick={() => setActiveView("gallery")}
          >
            Gallery
          </button>
          <button
            className={`gallery-nav__link ${activeView === "my-list" ? "gallery-nav__link--active" : ""}`}
            type="button"
            onClick={() => setActiveView("my-list")}
          >
            My List ({myListMovies.length})
          </button>
        </nav>

        <section className="gallery-frame">
          {activeView === "home" && <HomeFeed onMovieClick={handleMovieClick} />}
          {activeView === "gallery" && (
            <MovieList onMovieClick={handleMovieClick} initialSortOption="vote_average" />
          )}
          {activeView === "my-list" && <MyList movies={myListMovies} onMovieClick={handleMovieClick} />}
        </section>
      </main>

      <footer className="app-footer">
        <p>@Frida Arriaga | Built with TMDb + OpenRouter</p>
      </footer>

      <MovieModal
        movieId={selectedMovieId}
        isOpen={Boolean(selectedMovieId)}
        onClose={handleCloseModal}
        originRect={modalOriginRect}
        isInMyList={myListIds.has(selectedMovieId)}
        onToggleMyList={handleToggleMyList}
      />
    </div>
  );
};

export default App;
