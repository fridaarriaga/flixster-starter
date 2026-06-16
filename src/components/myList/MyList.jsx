import MovieCard from "../movieCard/MovieCard";
import "./MyList.css";

const MyList = ({ movies, onMovieClick }) => {
  if (!Array.isArray(movies) || movies.length === 0) {
    return (
      <section className="my-list" aria-label="My List">
        <h2 className="my-list__title">My List</h2>
        <p className="my-list__empty">
          Your watch later list is empty. Open a movie and tap + My List to save it.
        </p>
      </section>
    );
  }

  return (
    <section className="my-list" aria-label="My List">
      <h2 className="my-list__title">My List</h2>
      <p className="my-list__meta">{movies.length} saved</p>
      <div className="my-list__grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
        ))}
      </div>
    </section>
  );
};

export default MyList;
