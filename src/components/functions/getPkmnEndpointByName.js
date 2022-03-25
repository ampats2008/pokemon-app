import axios from "axios";

// returns pokemon resource in the endpoint format:
    // {name: '', url: ''}
export const getPkmnEndpointByName = async (name) => {

    // get all pkmn names
        let res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        
        // need format of returned resource list to match the format of the original get request, this is kinda hacky
        let pkmnRes = await {
            name: res.data.name,
            url: `https://pokeapi.co/api/v2/pokemon/${res.data.id}/`,
        };
    
    return pkmnRes;
}

export const getPkmnEndpointList = async (foundNames) => {

    // call for all resources from foundNames, and return them as a list
    return Promise.all(foundNames.sort().map(name => getPkmnEndpointByName(name) ));
    
}

