import React, {useState, useEffect} from 'react';
import PkmnCard from './pkmn-card';

function PokemonList({ pkmn, setLoaded, loaded}) {

    const [loadedCards, setLoadedCards] = useState([]);

    useEffect(() => {
        // initialize pkmnlist whenever you receive a new pkmn obj from app
        let res = buildCards();
        setLoadedCards(res);
        setLoaded(true);
        
    }, [pkmn]);

    const buildCards = () => {
        setLoaded(false)
        let cards = [];
        Object.entries(pkmn).map(([key, obj], i) => {
            cards.push(<PkmnCard key={`${key}__${obj.name}`} obj={obj}/>)
        });
        return cards;
    }

    return (
        <>
            {(loaded) &&
            <div id="mainCardCont" className='cardCont'>
                {loadedCards}
            </div>
            }
        </>
    );
}

export default PokemonList;