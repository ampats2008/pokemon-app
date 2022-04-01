import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import PokemonList from './components/pkmn-list';
import Pagination from './components/pagination';
import { useGetPkmnNames } from './components/hooks/useGetPkmnNames';
import { useScrolledToBottom } from './components/hooks/useScrolledToBottom';
import { getPkmnEndpointList } from './components/functions/getPkmnEndpointByName';

function App() {

  const [pkmn, setPkmn] = useState([]);
  const [itemCount, setItemCount] = useState('12');
  const [nextPageUrl, setNextPageUrl] = useState(`https://pokeapi.co/api/v2/pokemon?offset=${itemCount}&limit=${itemCount}`);

  // state for pkmn list load status
  const [loaded, setLoaded] = useState(false); // show spinner while pkmn data is loading

  // state to toggle infinite scroll off when search results appear:
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(true); 

  // async call to api for first time
  const getPkmnEndpoint = async (pageUrl = `https://pokeapi.co/api/v2/pokemon?offset=0&limit=${itemCount}`) => {
    setLoaded(false);
    await axios.get(pageUrl)
      .then(res => {
        // do the following with the response:
        let newPkmn = res.data.results;

        setPkmn(prevPkmn => {
          if ((prevPkmn.length <= 0)) {
            return newPkmn;
          } else {
            return [...pkmn, ...newPkmn];
          }
        });
        
        setNextPageUrl(res.data.next);      // set prev page to stop user from clearing the grid too many times

      }).then(res => {setLoaded(true)});
  }

  // initialize with call to api
  useEffect(() => {
    getPkmnEndpoint();
  }, [])

  // Client-side Search feature

  // custom hook returns list of all pkmn names
  const pkmnMasterNameList = useGetPkmnNames();

  // onClick search button handler
  const handleSearch = (searchTerm) => {
      if (searchTerm != '') {

        let foundNames = pkmnMasterNameList.sort().filter( name => {
          if (name.includes(searchTerm)) { 
            return name; 
          }
        })

        if (foundNames.length > 0 ) {  

          getPkmnEndpointList(foundNames).then( res => {
            // toggle
            setInfiniteScrollEnabled(false); // disable infinite scroll
            setPkmn(res);
          });
  
        } else {
          // show message to user that there were no records found
          alert('Sorry, there were no records found.')
        }

      } else {
        handleClearGrid();
      }
  }

  // Clear the <PokemonList />
  const handleClearGrid = (e) => {
    // if handleClearGrid is called by clear grid button, it will default to the current Item Count state.
    // if handleClearGrid is called by the item count select box, it will use the value the user selected in the select box, 
    // and then reassign itemCount to that value

    let newItemCount = (!e.target.value) ? itemCount : e.target.value;
    

    setInfiniteScrollEnabled(true);
    setPkmn([]);
    getPkmnEndpoint(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${newItemCount}`); // Call for initial state records
    setItemCount(newItemCount); // reassign itemCount to user input

  }

  // Infinite Scroll custom hook
    // returns:
    // 1. useCallback fn to set as the target obj's ref attribute
    // 2. boolean var that gets set to true every time the target obj enters the viewport
  const [endOfScrollRef, needMoreItems] = useScrolledToBottom(
    { root: null, rootMargin: "0px", threshold: 1.0 });

  // Make call for more records when page is scrolled to bottom
  useEffect(() => {

        if (needMoreItems && infiniteScrollEnabled) {

          if ((nextPageUrl !== null)) {
            getPkmnEndpoint(nextPageUrl);

          } else {
            alert("Can't go forward, This is the last list of pokemon!");

          }
        }

  }, [needMoreItems]);

  return (
    <>
      <h1 style={{
        width: '100%',
        textAlign: 'center',
        marginTop: '30px'
      }}>
        The Pokédex
      </h1>
      <Pagination
        handleClearGrid={handleClearGrid}
        onSearch={handleSearch}
        itemCount={itemCount}
      />
      <PokemonList pkmn={pkmn} ref={endOfScrollRef} itemCount={itemCount} />
      {(!loaded) &&
      <div style={{display: 'grid', placeItems: 'center'}}> <div className='pokeball'></div> </div>}
    </>
  );
}

export default App;
