import "./MovieCard.css";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER_URL = "https://placehold.co/500x750?text=No+Poster";

const MovieCard = ({ movie, onClick }) => {
  const posterPath = movie?.poster_path ?? "";
  const posterUrl = posterPath ? `${IMAGE_BASE_URL}${posterPath}` : FALLBACK_POSTER_URL;
  const voteAverage =
    typeof movie?.vote_average === "number" ? movie.vote_average.toFixed(1) : "N/A";

  const handleCardClick = (event) => {
    if (onClick) {
      const cardRect = event.currentTarget.getBoundingClientRect();
      onClick(movie?.id, cardRect);
    }
  };

  return (
    <button className="movie-card" type="button" onClick={handleCardClick}>
      <img
        className="movie-card__poster"
        src={posterUrl}
        alt={`${movie?.title ?? "Movie"} poster`}
        loading="lazy"
      />
      <div className="movie-card__content">
        <h3 className="movie-card__title">{movie?.title ?? "Untitled movie"}</h3>
        <p className="movie-card__vote">Vote Average: {voteAverage}</p>
      </div>
    </button>
  );
};

export default MovieCard;
