import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import PokemonList from './components/pkmn-list';
import Pagination from './components/pagination';

import { useGetPkmnNames } from './components/hooks/useGetPkmnNames';
// import { useToggle } from './components/hooks/useToggle';
import { useScrolledToBottom } from './components/hooks/useScrolledToBottom';

import { getPkmnEndpointList } from './components/functions/getPkmnEndpointByName';

//Tutorial link: https://youtu.be/o3ZUc7zH8BE

function App() {

  const [pkmn, setPkmn] = useState([]);
  const [clearList, setClearList] = useState(false);
  const [itemCount, setItemCount] = useState('12');


  const [prevPageUrl, setPrevPageUrl] = useState(null)
  const [currPageUrl, setCurrPageUrl] = useState(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${itemCount}`)
  const [nextPageUrl, setNextPageUrl] = useState(`https://pokeapi.co/api/v2/pokemon?offset=${itemCount}&limit=${itemCount}`)

  // allows me to execute a useEffect hook only after first render
  const didMountRef = useRef(false);

  // state for pkmn list load status
  const [loaded, setLoaded] = useState(false); // wait until pkmn card info is loaded to show the list


  // async call to api for first time
  // set prev page, curr page, and next page
  const getPkmnEndpoint = async (pageUrl) => {
    await axios.get(pageUrl)
      .then(res => {
        // do the following with the response:
        let newPkmn = res.data.results;

        setPkmn(prevPkmn => {
          if ((prevPkmn.length <= 0) || clearList) {
            setClearList(false);
            return newPkmn;
          } else {
            return [...pkmn, ...newPkmn];
          }
        });

        setNextPageUrl(res.data.next);
        setPrevPageUrl(res.data.previous);
      });
  }

  // initialize with call to api
  useEffect(() => {
    getPkmnEndpoint(currPageUrl);
  }, [])

  // Client-side Search feature

  // custom hook returns list of all pkmn names
  const pkmnMasterNameList = useGetPkmnNames();

  // onClick search button handler
  const handleSearch = (searchTerm) => {
      let foundNames = [];
      if (searchTerm != '') {
        foundNames = pkmnMasterNameList.sort().filter( name => {
          if (name.includes(searchTerm)) { 
            return name; 
          }
        })
      } else {
        setClearList(true);
      }

      if (foundNames.length > 0 ) {  

        getPkmnEndpointList(foundNames).then( res => { setPkmn(res) });

      } else {
        // show message to user that there were no records found
        alert('Sorry, there were no records found.')
      }
  }

  useEffect(() => {
    if (didMountRef.current) {

      if (clearList) {
        console.log('clearList is true');
        setPkmn([]);
        getPkmnEndpoint(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${itemCount}`);
        setCurrPageUrl(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${itemCount}`);
      }

    } else didMountRef.current = true;     
    
  }, [clearList]);

  // onClick clear grid button handler
  const handleClearGrid = () => {
    if ((prevPageUrl !== null) || (pkmn.length > 0)) {
      setClearList(true);
    } else {
      console.log("Can't go back further! On first page.");
    }
  }

  // Infinite Scroll custom hook
    // returns:
    // 1. ref to the target obj
    // 2. bool val that gets set to true every time the target obj enters the viewport
  const [endOfScrollRef, needMoreItems] = useScrolledToBottom({
    root: null,
    rootMargin: "0px",
    threshold: 1.0
  });

  // need to fix this still **
  
  // Make call for more records when page is scrolled to bottom
  // useEffect(() => {
  //     if (didMountRef.current) {

  //       if (needMoreItems) {
  //         console.log('i need more items');

  //         if (nextPageUrl !== null) {

  //           getPkmnEndpoint(nextPageUrl);

  //         } else {
  //           console.log("Can't go forward, This is the last list of pokemon!")
  //         }
  //       }

  //     } else didMountRef.current = true;
  // }, [needMoreItems]);

  return (
    <>
      <h1 style={{
        width: '100%',
        textAlign: 'center',
        marginTop: '30px'
      }}>The Pokédex</h1>
      <Pagination
        onClear={handleClearGrid}
        onSearch={handleSearch}
        itemCount={itemCount}
        setItemCount={setItemCount}
        setClearList={setClearList}
      />
      <PokemonList pkmn={pkmn} setLoaded={setLoaded} loaded={loaded} />
      
      <div id="endOfScrollableArea" ref={endOfScrollRef}></div>
    </>
  );
}

export default App;
