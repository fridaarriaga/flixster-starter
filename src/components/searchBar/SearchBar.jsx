import "./SearchBar.css";

const SearchBar = ({ query, onQueryChange, onSearch, onClear, isBusy }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} aria-label="Search movies">
      <input
        className="search-bar__input"
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search movies by title"
        aria-label="Movie title"
      />
      <button className="search-bar__button" type="submit">
        {isBusy ? "Searching..." : "Search"}
      </button>
      <button
        className="search-bar__button search-bar__button--secondary"
        type="button"
        onClick={onClear}
        disabled={!query.trim() && !isBusy}
      >
        Clear
      </button>
    </form>
  );
};

export default SearchBar;
