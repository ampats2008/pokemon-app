import React, {useState, useEffect, forwardRef} from 'react';
import axios from 'axios';

const PkmnCard = ({obj}, ref) => {

    // set card vars
    const id = obj.url.substring((obj.url.indexOf('/', obj.url.indexOf('pokemon')) + 1), obj.url.lastIndexOf('/')); // parse obj.url for pokedex id
    const { name } = obj;

    const [pkmnObj, setPkmnObj] = useState({img: null, types: [], height: null, weight: null});

    const [loaded, setLoaded] = useState(false);

    const getPkmnByID = async () => {
        // use id to call for pkmn's img
        let res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        
        let {sprites, types, height, weight} = res.data;
        // assign response to state
        setPkmnObj({
            img: sprites.other['official-artwork'].front_default,
            types: types,
            height: height,
            weight: weight
        });
        setLoaded(true);
        
    }

    useEffect(() => {
        getPkmnByID();        
    }, [])

    // Rounding helper function
    Number.prototype.round = function(places) {
        return +(Math.round(this + "e+" + places)  + "e-" + places);
    }

    return(
        <>
        {(loaded) &&
        <div className='card flip-card' ref={ref}>
            <div className="flip-card-inner">

                <div className="flip-card-front">
                    <h4 className='card-name' >{name.toUpperCase()}</h4>
                    <h1 className='card-id' >{id}</h1>
                    <img className='card-img' src={pkmnObj.img} alt={`official artwork for ${name}`} />
                </div>

                <div className="flip-card-back">

                    <div className='typeBox'>
                        {
                        pkmnObj.types.map(typeObj => 
                            <span 
                            key={`${id}-${name}_type-${typeObj.type.name}`} 
                            className={`typeBox-type type-${typeObj.type.name}`} 
                            style={
                                // increase contrast of text for certain pkmn types
                                (['electric', 'ice', 'fairy', 'grass'].includes(typeObj.type.name.toLowerCase())) ? {color: '#363535'} : {}}
                                >{typeObj.type.name}
                            </span>)}
                    </div>

                    <table>
                        <tbody>                            
                            <tr>
                                <th>Height</th>
                                <td>{Math.floor(pkmnObj.height / 3.048)}' {(pkmnObj.height % 3.048).round(1)}"</td>
                            </tr>
                            <tr>
                                <th>Weight</th>
                                <td>{Math.round(pkmnObj.weight / 4.536)} lbs</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        }
    </>
    );
}

export default forwardRef(PkmnCard);