📝 `NOTE` Use this template to initialize the contents of a README.md file for your application. As you work on your assignment over the course of the week, update the required or stretch features lists to indicate which features you have completed by changing `[ ]` to `[x]`. (🚫 Remove this paragraph before submitting your assignment.)

## Unit Assignment: Flixster

Submitted by: **Frida Arriaga**

Estimated time spent: **10** hours spent in total

Deployed Application (optional): [Flixster Deployed Site](ADD_LINK_HERE)

### Application Features

#### REQUIRED FEATURES

- [X] **Display Movies**
  - [ ] Users can view a list of current movies from The Movie Database API in a grid view.
    - [ ] Movie tiles should be reasonably sized (at least 6 playlists on your laptop when full screen; large enough that the playlist components detailed in the next feature are legible).
  - [X] For each movie displayed, users can see the movie's:
    - [ ] Title
    - [ ] Poster image
    - [ ] Vote average
  - [X] Users can load more current movies by clicking a button which adds more movies to the grid without reloading the entire page. 
- [X] **Search Functionality**
  - [ ] Users can use a search bar to search for movies by title.
  - [ ] The search bar should include:
    - [ ] Text input field
    - [ ] Submit/Search button
    - [ ] Clear button
  - [X] Movies with a title containing the search query in the text input field are displayed in a grid view when the user either:
    - [ ] Presses the Enter key
    - [ ] Clicks the Submit/Search button
  - [X] Users can click the Clear button. When clicked:
    - [ ] All text in the text input field is deleted
    - [ ] The most recent search results are cleared from the text input field and the grid view and all current movies are displayed in a grid view
- [ ] **Design Features**
  - [ ] Website implements all of the following accessibility features:
    - [ ] Semantic HTML
    - [ ] [Color contrast](https://webaim.org/resources/contrastchecker/)
    - [x] Alt text for images 
  - [ ] Website implements responsive web design.
    - [ ] Uses CSS Flexbox or CSS Grid
    - [ ] Movie tiles and images shrink/grow in response to window size
  - [X] Users can click on a movie tile to view more details about a movie in a pop-up modal.
    - [ ] The pop-up window is centered in the screen and does not occupy the entire screen.
    - [ ] The pop-up window has a shadow to show that it is a pop-up and appears floating on the screen.
    - [ ] The backdrop of the pop-up appears darker or in a different shade than before. including:
    - [X] The pop-up displays additional details about the moving including:
      - [ ] Runtime in minutes
      - [ ] Backdrop poster
      - [ ] Release date
      - [ ] Genres
      - [ ] An overview
  - [X] Users can use a drop-down menu to sort movies.
    - [ ] Drop-down allows movies to be sorted by:
      - [ ] Title (alphabetic, A-Z)
      - [ ] Release date (chronologically, most recent to oldest)
      - [ ] Vote average (descending, highest to lowest)
    - [ ] When a sort option is clicked, movies display in a grid according to selected criterion.
  - [X] Website displays:
    - [ ] Header section
    - [ ] Banner section
    - [ ] Search bar
    - [ ] Movie grid
    - [ ] Footer section
    - [ ] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: To ease the grading process, please use the [color contrast checker](https://webaim.org/resources/contrastchecker/) to demonstrate to the grading team that text and background colors on your website have appropriate contrast. The Contrast Ratio should be above 4.5:1 and should have a green box surrounding it. 
- [x] **Planning Documentation**
  - [x] Repository includes a `planning.md` file with:
    - [x] A **Component Architecture** section listing at least 5 components, each with its responsibility, what it renders, and its props.
    - [x] An **API Contracts** section documenting at least 2 TMDb endpoints used, with URL, query parameters, and relevant response fields for each.
    - [x] A **State Architecture** section listing state variables with name, type, initial value, owner component, and what user action triggers an update.
    - [x] A **Data Flow** section (paragraph or diagram) explaining how data flows from the TMDb API response through the component hierarchy to the `MovieCard`, including any transformations.
- [X] **AI Watch Recommendation**
  - [ ] When a movie's detail modal is opened, an AI-generated watch recommendation is displayed alongside the movie details.
  - [ ] A loading state is shown while the AI response is being generated, and a graceful fallback message is shown if the AI call fails.
  - [ ] `planning.md` includes an **AI Feature Spec** documenting role, task, inputs, output format, constraints, and failure behavior for the AI call.
  - [ ] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: To ease the grading process, open your browser's DevTools **Network** tab, trigger the AI recommendation (open a movie modal), and show the outbound request going **directly to an AI API URL** (e.g., `openrouter.ai`) — not to a backend server URL. Graders need to see this call in the Network tab to award full credit.

#### STRETCH FEATURES

- [X] **Deployment**
  - [ ] Website is deployed via Render.
  - [ ] **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS**: For ease of grading, please use the deployed version of your website when creating your walkthrough. 
- [X] **Embedded Movie Trailers**
  - [ ] Within the pop-up modal displaying a movie's details, the movie trailer is viewable.
    - [ ] When the trailer is clicked, users can play the movie trailer.
- [ ] **Favorite Button**
  - [ ] For each movie displayed, users can favorite the movie.
  - [ ] There should be visual element (such as a heart icon) on each movie's tile to show whether or not the movie has been favorited.
  - [ ] If the movie is not favorited:
    - [ ] Clicking on the visual element should mark the movie as favorited
    - [ ] There should be visual feedback (such as the heart turning a different color) to show that the movie has been favorited by the user.
  - [ ] If the movie is already favorited:
    - [ ] Clicking on the visual element should mark the movie as *not* favorited.
    - [ ] There should be visual feedback (such as the heart turning a different color) to show that the movie has been unfavorited. 
- [ ] **Watched Checkbox**
  - [ ] For each movie displayed, users can mark the movie as watched.
  - [ ] There should be visual element (such as an eye icon) on each movie's tile to show whether or not the movie has been watched.
  - [ ] If the movie has not been watched:
    - [ ] Clicking on the visual element should mark the movie as watched
    - [ ] There should be visual feedback (such as the eye turning a different color) to show that the movie has been watched by the user.
  - [ ] If the movie is already watched:
    - [ ] Clicking on the visual element should mark the movie as *not* watched.
    - [ ] There should be visual feedback (such as the eye turning a different color) to show that the movie has not been watched.
- [ ] **Sidebar**
  - [ ] The website includes a side navigation bar.
  - [ ] The sidebar has three pages:
    - [ ] Home
    - [ ] Favorites
    - [ ] Watched
  - [ ] The Home page displays all current movies in a grid view, the search bar, and the sort movies drop-down.
  - [ ] The Favorites page displays all favorited movies in a grid view.
  - [ ] The Watched page displays all watched movies in a grid view.

### Walkthrough Video

`TODO://` Paste the **shareable link** to your animated app walkthrough below (replace `ADD_LOOM_LINK_HERE`). GitHub markdown won't render an embedded Loom player, so a plain link is what graders will use. Make sure the link is public and playable before submitting. Ensure your walkthrough showcases the presence and/or functionality of all features you implemented above (check them off as you film!). Pay attention to any **VIDEO WALKTHROUGH SPECIAL INSTRUCTIONS** checkboxes listed above to ensure graders see the full functionality of your website. (🚫 Remove this paragraph after adding your walkthrough link.)

**Walkthrough video:** [Flixster Walkthrough](https://www.loom.com/share/793c054f268b4be781d4142f4ea24a9a)

### Reflection

* Did the topics discussed in your labs prepare you to complete the assignment? Be specific, which features in your weekly assignment did you feel unprepared to complete?

Yes, the labs helped a lot with React component structure, props, state, and API fetching, which I used for MovieList, search, sorting, and modal details. The part I felt less prepared for was combining advanced UI animation timing with state transitions on the Home mood board, and integrating the AI recommendation flow with good fallback/error handling. Those parts took more iteration and debugging, but they helped me understand hooks and state management more deeply.

* If you had more time, what would you have done differently? Would you have added additional features? Changed the way your project responded to a particular event, etc.
  
I would have added liked and watched stretch feature. 

* Reflect on your project demo, what went well? Were there things that maybe didn't go as planned? Did you notice something that your peer did that you would like to try next time?

My demo was better than last week. It was right on time. I presented my liked features and challenges. I gave a demo beforehand.  

### Open-source libraries used

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TMDb API](https://developer.themoviedb.org/docs/getting-started)
- [OpenRouter API](https://openrouter.ai/docs/quickstart)

### Shout out

Give a shout out to somebody from your cohort that especially helped you during your project. This can be a fellow peer, instructor, TA, mentor, etc.
Shout to Devarsh for showing how to deploy website in Render and Cursor.
