Component Architecture: List every component your app will need. For each component, define: responsibility (one sentence), what it renders, what props it receives, and whether it manages any state. Also document the parent-child hierarchy — which component renders which. Your list should include at minimum: App, MovieList, MovieCard, SearchBar, MovieModal, Header, Footer, and a sort control.
App:
    Responsibility: Owns top-level state, fetches movies, and coordinates search/sort/modal behavior.
    Renders: Header, Banner, SearchBar, SortControl, MovieList, LoadMoreButton, MovieModal, Footer.
    Props: none.
    State: yes (movies, query, page, loading, error, selected movie, sort option).
Header:
    Responsibility: Displays app title/navigation branding.
    Renders: Logo/title text.
    Props: optional title.
    State: no.  
Banner:
    Responsibility: Shows hero intro text for the app.
    Renders: Headline/subtitle.
    Props: optional text strings.
    State: no.
SearchBar:
    Responsibility: Captures search input and triggers search/clear actions.
    Renders: input + Search button + Clear button.
    Props: query, onQueryChange, onSearch, onClear.
    State: optional local input state (or controlled by App).
SortControl:
    Responsibility: Lets user choose sorting criterion.
    Renders: dropdown/select.
    Props: sortOption, onSortChange.
    State: no.
MovieList:
    Responsibility: Displays movie collection as a responsive grid.
    Renders: list of MovieCard.
    Props: movies, onMovieClick.
    State: no.
MovieCard:
    Responsibility: Shows basic movie info and opens details on click.
    Renders: poster, title, vote average.
    Props: movie, onClick.
    State: no.
MovieModal:
    Responsibility: Shows detailed movie info + AI recommendation.
    Renders: runtime, backdrop, release date, genres, overview, AI section.
    Props: movieId, isOpen, onClose.
    State: yes (details loading/error, AI loading/error/response).
    Open/close behavior: opens when App sets selectedMovieId from MovieCard click; closes via onClose (backdrop click/Escape), which clears selectedMovieId.
Footer:
    Responsibility: Displays attribution/footer text.
    Renders: footer content.
    Props: none.
    State: no.
Parent-child hierarchy: App -> Header/Banner/SearchBar/SortControl/MovieList/Footer and App -> MovieModal (conditionally).

API Contracts: Identify every TMDb endpoint your app will use. For each one, define: the endpoint URL, required parameters, the response fields your components will actually use, and the error cases to handle. You'll need at minimum: the Now Playing endpoint, the Search endpoint, and the Movie Details endpoint (the modal needs runtime and genres, which aren't in the Now Playing response).
Now Playing
    -URL: https://api.themoviedb.org/3/movie/now_playing
    -Params: api_key, language=en-US, page
    -Fields used: results[].id, title, poster_path, vote_average, release_date, overview
    -Error cases: invalid API key (401), rate limit (429), network failure.
Search Movies
    -URL: https://api.themoviedb.org/3/search/movie
    -Params: api_key, query, language=en-US, page, include_adult=false
    -Fields used: same as above for card rendering
    -Error cases: empty query, 401, 429, network failure.
Movie Details
    -URL: https://api.themoviedb.org/3/movie/{movie_id}
    -Params: api_key, language=en-US
    -Fields used: runtime, genres[].name, backdrop_path, release_date, overview, title
    -Error cases: movie not found (404), 401, 429, network failure.


State Architecture: List every piece of state your app needs to manage. For each one, define: the variable name and data type, its initial value, which component owns it, and what triggers an update. Think about: the current movie list, active search query, current page number, selected movie for the modal, sort option, loading state, and error state.
    -movies: Movie[] — initial [] — owner App — updates after now playing/search/load more.
    -query: string — initial "" — owner App or SearchBar — updates on typing/clear.
    -page: number — initial 1 — owner App — updates on Load More.
    -mode: "nowPlaying" | "search" — initial "nowPlaying" — owner App — updates on search/clear.
    -sortOption: "title" | "release_date" | "vote_average" — initial "title" — owner MovieList — updates on dropdown change.
    -isLoadingMovies: boolean — initial false — owner App — updates around movie fetches.
    -moviesError: string | null — initial null — owner App — updates on fetch failures.
    -selectedMovieId: number | null — initial null — owner App — updates on card click/modal close.
    -movieDetails: MovieDetails | null — initial null — owner MovieModal (or App) — updates when modal opens.
    -isLoadingDetails: boolean — initial false — owner MovieModal.
    -aiRecommendation: string — initial "" — owner MovieModal.
    -isLoadingAI: boolean — initial false — owner MovieModal.
    -aiError: string | null — initial null — owner MovieModal.



Data Flow: Describe in a short paragraph or simple diagram how data moves from the TMDb API to the rendered MovieCard. Does the raw API response need any transformation before it reaches your components? When a user clicks a MovieCard, how does the movie's ID reach the fetch call for details?
MovieList fetches TMDb now-playing/search results and passes each movie object to MovieCard for rendering. When a user clicks a card, MovieCard calls onClick(movie.id), and App stores selectedMovieId in state. App derives modal-open state from selectedMovieId (isOpen = Boolean(selectedMovieId)) and passes both isOpen and movieId to MovieModal. MovieModal uses movieId to fetch /movie/{id} details, then renders title/runtime/release date/genres/overview/backdrop, plus trailer/recommendation states with loading and error handling.

Sorting Decisions:
    -Where sorting happens: sort a derived copy during rendering in MovieList (useMemo with [...movies].sort(...)); original movies state is not mutated.
    -Sort directions:
        -Title: ascending alphabetical (A-Z).
        -Release Date: newest to oldest.
        -Vote Average: highest to lowest.
    -Tradeoff note: sorting applies only to currently loaded pages in client state, not all TMDb pages.


AI Feature Spec:
Prompt Spec:
    -Role: an enthusiastic but honest film critic.
    -Task: write a 2-3 sentence watch recommendation for the current movie.
    -Inputs: movie title, genres (comma-separated), and overview.
    -Output format: plain text only, 2-3 sentences, no spoilers, no first-person ("I/me/my") statements.
    -Constraints: avoid plot spoilers, avoid generic phrases ("must-see"), avoid unnecessary comparisons to other films unless it adds value.
    -Failure behavior: show a friendly fallback message: "We couldn't generate a recommendation for this one - check out the overview above!"

OpenRouter API:
    -Endpoint: https://openrouter.ai/api/v1/chat/completions
    -Model: google/gemma-3-27b-it:free (fallback option: meta-llama/llama-3.3-70b-instruct:free)
    -Environment variable: VITE_OPENROUTER_API_KEY in .env

State + Trigger:
    -aiInsight: string | null (stores AI recommendation text)
    -loadingInsight: boolean (tracks in-flight AI request)
    -aiInsightError: string | null (stores fallback/error state)
    -Trigger: run AI request when MovieModal opens (movieId changes) and movie details fetch has completed successfully.

UI behavior:
    -Location: inside MovieModal beneath movie details.
    -Loading: show "Generating recommendation..." while loadingInsight is true.
    -Failure UI: show fallback message instead of leaving the section blank.
    -Network requirement for grading: show outbound request directly to OpenRouter in DevTools Network tab during walkthrough.

Visual:
The idea of the website is to make it like a combination of Netflix and Tik Tok. I want the colors and fonts to be that of Netflix. I want there to be a a home page that is like the for you oage in tik tok in the sense you can scroll down and see diferent movies and scroll up. Int he mac book, you can scroll up and down with w and s or the up and down keys. In ipad and phone it can be through scrolling motion. In the other pages, it will be a gallery. There will be four movies per row. And also to go between the home and gallery page the header will be at the top but to move beteenr the two will bein the middle. For each gallery card, it will turn into a modal view there will be a piectue that can be togles to play he movie trailer instead to the left and on the right their will be a description of the movie. 

Responsive Breakpoints:
    -Desktop (greater than 1024px): Movie grid shows 4 columns; cards keep full poster ratio and readable title/vote text.
    -Tablet (768px to 1024px): Movie grid shows 3 columns; spacing remains consistent so cards do not overlap.
    -Small tablet/large phone (481px to 767px): Movie grid shows 2 columns; card content scales without clipping.
    -Phone (480px and below): Movie grid shows 1 column; cards span container width for readability.
    -Implementation notes: CSS Grid + media queries in MovieList.css. MovieCard width is set to 100% inside the grid to prevent overflow/collapse at narrow widths.
