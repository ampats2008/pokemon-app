import { useState, useEffect } from "react";
import axios from "axios";

// custom hook returns list of all pkmn names
export const useGetPkmnNames = () => {

    // define state
    const [pkmnMasterNameList, setPkmnMasterNameList] = useState([]);

    // define async fn: api call for all pkmn names to check searchTerm against
    const getPkmnMasterNameList = async () => {
      // get all pkmn names
      await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=${898}`)
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

    return pkmnMasterNameList;
  }