# Pokédex App

Built with React, SASS, d3.js, GSAP, and Axios.

This web app visualizes data from the [PokeAPI](https://pokeapi.co/docs/v2#pokemon).

## Notable Features:

### Home page:
- Items per page select box:
    > Allows the user to select how many resources the API should return from each GET request.


- Client-side search field:
    > When the search button is clicked, the app fetches all Pokémon whose name includes the search term. For example, a search for *arc* would return both **Arc**anine and G**arc**homp.


- Infinite scrolling:
    > On the home page, if the user scrolls down to the end of the grid of Pokemon cards, more will automatically be called from the API and populated underneath the current list. This was implemented using the IntersectionObserver API inside a custom React hook (that I called useInfiniteScroll).


- Clear grid button:
    > On click, this button allows the user to reset the grid of Pokémon cards to the original state when the page was loaded. This is useful for clearing search results or for clearing a long list of cards.


- GSAP card loading animations:
    > Used React useState hooks to wait for a complete set of Pokemon cards to be inserted into the DOM before playing the fade-in animation. This way, each card fades in one after another (staggered).


### Pokémon modal:
-  Stats Panel:
    > This panel contains a bar chart (from D3.js) that displays a Pokémon's stats. The user can sort the bars in three ways: (1) alphabetical order (by Stat name), (2) descending order (by Stat level, aka. quantity), or (3) ascending order (by Stat level). The chart also has clean transition animations between each state.


- Attack / Defense Matchup Panels:
    > These panels display the type matchups for the selected Pokémon. In short, similar to *Rock, Paper, Scissors,* certain Pokemon types have advantages over Pokemon types. [Here](https://pokemondb.net/type/dual) is a more detailed explanation of how type matchups are calculated in Pokémon.
    
    > The API does not return this data for each Pokemon. It only returns the Pokemon's type. Therefore, I had to calculate the type matchups myself behind the scenes. If you peek at the source code, under *pkmn-card-modal-tabs.jsx,* you'll find comments that outline my thought process in calculating the type matchups:

    ```
    // **Note: a duplicate type within any given list implies that a pkmn is 4x weak to or 4x strong against that type.
    ...
    // **Note: if the same type appears in a 'double' list and a 'half' list, it is calculated as normal effectiveness.
    ...
    // **Note: if the same type appears in a "no effect" list and any other list, it is calculated as "no effect" only.
    ```

Overall, I enjoyed putting together this little app as it allowed me to get more comfortable using React, React Hooks, and working with asynchronous data in JavaScript.
