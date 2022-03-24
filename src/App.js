import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import PokemonList from './components/pkmn-list';
import Pagination from './components/pagination';

//Tutorial link: https://youtu.be/o3ZUc7zH8BE

function App() {

  const [pkmn, setPkmn] = useState([]);
  const [clearList, setClearList] = useState(false);
  const [itemCount, setitemCount] = useState('12');
  const [nextPageUrl, setNextPageUrl] = useState(`https://pokeapi.co/api/v2/pokemon?offset=${itemCount}&limit=${itemCount}`)
  const [currPageUrl, setCurrPageUrl] = useState(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${itemCount}`)
  const [prevPageUrl, setPrevPageUrl] = useState(null)

  // allows me to execute a useEffect hook only after first render
  const didMountRef = useRef(false);

  // state for search feature
  const [pkmnSearched, setPkmnSearched] = useState([]);
  const [pkmnMasterNameList, setPkmnMasterNameList] = useState([]);

  // state for pkmn list load status
  const [loaded, setLoaded] = useState(false); // wait until pkmn card info is loaded to show the list

  // initialize with call to api
  useEffect(() => {
      axios.get(currPageUrl)
      .then(res => {
        let newPkmn = res.data.results;
        console.log(res.data.results);

        if ((Object.keys(pkmn).length <= 0) || (clearList)) {
          setPkmn(newPkmn);
          setClearList(false);
        } else {
          setPkmn([...pkmn, ...newPkmn]);
        }

        if (didMountRef.current) {
          setNextPageUrl(res.data.next);
          setPrevPageUrl(res.data.previous);
        } else didMountRef.current = true;
      });
  }, [currPageUrl, pkmnSearched])

  useEffect(() => {
    setCurrPageUrl(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${itemCount}`)
  }, [itemCount]);

  const handleClearGrid = () => {
    if (prevPageUrl !== null) {
      setClearList(true);
      setPkmnSearched([])
      setCurrPageUrl(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${itemCount}`);
    } else {
      console.log("Can't go back, This is the first list of pokemon!")
    } 
  }

  // Infinite Scroll Code (custom hook)
  const useScrolledToBottom = (options) => {

    const endOfScrollRef = useRef(null);
    const [needMoreItems, setNeedMoreItems] = useState(false);

    const handleObserver = (entries) => {
      const [ entry ] = entries;
      setNeedMoreItems(entry.isIntersecting);
    }

    useEffect(() => {
      const observer = new IntersectionObserver(handleObserver, options);

      if (endOfScrollRef.current) { observer.observe(endOfScrollRef.current); }

      return () => {
        if (endOfScrollRef.current) { observer.unobserve(endOfScrollRef.current); }
      };
    }, [endOfScrollRef, options]);

    return [endOfScrollRef, needMoreItems];
  }
  const [endOfScrollRef, needMoreItems] = useScrolledToBottom({
    root: null,
    rootMargin: "0px",
    threshold: 1.0
  });
  // Make call for more records when page is scrolled to bottom
  useEffect(() => {
    // wait for PkmnList to load before doing anything
      
      if (needMoreItems) {
        if (nextPageUrl !== null) {
          setCurrPageUrl(nextPageUrl);
        } else {
          console.log("Can't go forward, This is the last list of pokemon!")
        }
      }

  }, [needMoreItems]);


  // Client-side Search feature
  const getPkmnMasterNameList = async () => {
    // get all pkmn names
    axios.get(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${1126}`)
      .then(res => {
        let data = [];
        res.data.results.map((result) => {
          data.push(result['name'])
        });
        setPkmnMasterNameList(data);
      });
  }

  // fetch master pkmn name list on mount
  useEffect(() => {
    getPkmnMasterNameList();
  }, []);

  // search helper
  const searchNameList = (searchTerm) => {
    let returnedNames = [];
    pkmnMasterNameList.map(name => {
      if (name.includes(searchTerm)) {
        returnedNames.push(name);
      }
    })
    return returnedNames;
  }


  const handleSearch = (searchTerm) => {
    if (pkmnMasterNameList.length >= 0) {

      let foundNames = [];
      if (searchTerm != '') { 
        foundNames = searchNameList(searchTerm); 
      }

      if (foundNames.length > 0 ) {
        let masterRes = [];
        // call for all resources from searchedNames
        foundNames.map(name => {
          // get all pkmn names
          axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
          .then(res => {
            // add each to the masterResponse list
            // need format to match the format of the other calls, this is kinda hacky
            masterRes.push({
              name: res.data.name,
              url: `https://pokeapi.co/api/v2/pokemon/${res.data.id}/`,
            })
          });
        });

        setPkmnSearched(masterRes);

      } else {
        // show message to user that there were no records found
        alert('Sorry, there were no records found.')
        setPkmnSearched([]) // reset search
      }

    }
  }

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
        setitemCount={setitemCount}
        setClearList={setClearList}
      />
      {(pkmnSearched.length <= 0) ? 
      <PokemonList pkmn={pkmn} setLoaded={setLoaded} loaded={loaded} /> : 
      <PokemonList pkmn={pkmnSearched}  setLoaded={setLoaded} loaded={loaded} />}
      
      <div id="endOfScrollableArea" ref={endOfScrollRef}></div>
    </>
  );
}

export default App;
