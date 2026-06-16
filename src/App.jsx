import { useState } from "react";
import HomeFeed from "./components/homeFeed/HomeFeed";
import MovieList from "./components/movieList/MovieList";
import MovieModal from "./components/movieModal/MovieModal";
import "./App.css";

const App = () => {
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [modalOriginRect, setModalOriginRect] = useState(null);
  const [activeView, setActiveView] = useState("home");

  const handleMovieClick = (movieId, originRect) => {
    setModalOriginRect(originRect ?? null);
    setSelectedMovieId(movieId ?? null);
  };

  const handleCloseModal = () => {
    setSelectedMovieId(null);
    setModalOriginRect(null);
  };

  return (
    <div className="App">
      <section className="app-banner" aria-label="Frida's Movie Corner banner">
        <span className="app-banner__popcorn" aria-hidden="true">
          🍿 🍿 🍿
        </span>
        <p className="app-banner__title">Frida&apos;s Movie Corner</p>
        <span className="app-banner__popcorn" aria-hidden="true">
          🍿 🍿 🍿
        </span>
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
        </nav>

        <section className="gallery-frame">
          {activeView === "home" ? (
            <HomeFeed onMovieClick={handleMovieClick} />
          ) : (
            <MovieList onMovieClick={handleMovieClick} initialSortOption="vote_average" />
          )}
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
      />
    </div>
  );
};

export default App;
