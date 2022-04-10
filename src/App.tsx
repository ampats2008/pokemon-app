import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import PokemonList from "./components/pkmn-list"
import Pagination from "./components/pagination"
import { useScrolledToBottom } from "./components/hooks/useScrolledToBottom"
import { getPkmnEndpointList } from "./components/functions/getPkmnEndpointByName"

function App() {
  const [pkmn, setPkmn] = useState<[{ name: string; url: string }] | []>([])
  const [itemCount, setItemCount] = useState(12)

  // state for pkmn list load status
  const [loaded, setLoaded] = useState(false) // show spinner while pkmn data is loading

  // state to toggle infinite scroll off when search results appear:
  // const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(true);

  // async call to api for first time
  const getPkmnEndpoint = async (
    pageUrl = `https://pokeapi.co/api/v2/pokemon?offset=0&limit=${800}`
  ) => {
    setLoaded(false)
    await axios
      .get(pageUrl)
      .then((res) => {
        // do the following with the response:
        let newPkmn = res.data.results

        setPkmn((prevPkmn) => {
          if (prevPkmn.length <= 0) {
            return newPkmn
          } else {
            return [...pkmn, ...newPkmn]
          }
        })
      })
      .then((res) => {
        setLoaded(true)
      })
  }

  // initialize with call to api
  useEffect(() => {
    getPkmnEndpoint()
  }, [])

  // Client-side Search feature

  const [searchTerm, setSearchTerm] = useState("")

  // Clear the <PokemonList />
  const handleClearGrid: (e?: React.ChangeEvent<HTMLSelectElement>) => void = (
    e
  ) => {
    // if handleClearGrid is called by clear grid button, it will set the itemCount to 12.
    // if handleClearGrid is called by the item count select box, it will use the value the user selected in the select box,
    // and then reassign itemCount to that value

    let newItemCount = e !== undefined ? e.target.value : 12

    setItemCount(Number(newItemCount)) // reassign itemCount to user input
    setSearchTerm("")
  }

  // Infinite Scroll custom hook
  // returns:
  // 1. useCallback fn to set as the target obj's ref attribute
  // 2. boolean var that gets set to true every time the target obj enters the viewport
  const [endOfScrollRef, needMoreItems] = useScrolledToBottom({
    root: null,
    rootMargin: "0px",
    threshold: 1.0,
  })

  // reveal more records when user reaches end of card grid
  useEffect(() => {
    if (needMoreItems) setItemCount((prev) => prev + itemCount)
  }, [needMoreItems])

  return (
    <>
      <Pagination
        handleClearGrid={handleClearGrid}
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
        itemCount={itemCount}
      />
      <PokemonList
        pkmn={pkmn}
        searchTerm={searchTerm}
        ref={endOfScrollRef}
        itemCount={itemCount}
      />
      {!loaded && (
        <div style={{ display: "grid", placeItems: "center" }}>
          {" "}
          <div className="pokeball"></div>{" "}
        </div>
      )}
    </>
  )
}

export default App
