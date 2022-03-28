import React, {useState, useEffect, forwardRef} from 'react';
import PkmnCard from './pkmn-card';

function PokemonList({ pkmn, setLoaded}, ref) {

    const [loadedCards, setLoadedCards] = useState([]);

    useEffect(() => {
        // initialize pkmnlist whenever you receive a new pkmn obj from app
        let res = buildCards();
        setLoadedCards(res);
        // setLoaded(true);
    }, [pkmn]);

    const buildCards = () => {
        let cards = [];
        Object.entries(pkmn).map(([key, obj], i) => {

            if (i + 1 === pkmn.length) {
                // if this is the last card, attach the intersection observer ref for infinite scrolling
                cards.push(<PkmnCard ref={ref} key={`${key}__${obj.name}`} obj={obj}/>);
            } else {
                cards.push(<PkmnCard key={`${key}__${obj.name}`} obj={obj}/>);
            }

        });
        return cards;
    }

    return (
        <>  
            <div id="mainCardCont" className='cardCont'>
                {loadedCards}
            </div>
        </>
    );
}

export default forwardRef(PokemonList);