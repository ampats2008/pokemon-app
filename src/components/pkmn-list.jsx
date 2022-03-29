import React, {useState, useEffect, forwardRef, useRef} from 'react';
import PkmnCard from './pkmn-card';
import gsap from 'gsap/all';

function PokemonList({ pkmn, itemCount}, ref) {

    const [loadedCards, setLoadedCards] = useState([]);

    useEffect(() => {
        // initialize pkmnlist whenever you receive a new pkmn obj from app
        let res = buildCards();
        setLoadedCards(res);
        // console.log(pkmn)
    }, [pkmn]);

    const buildCards = () => {
        let cards = [];
        Object.entries(pkmn).map(([key, obj], i) => {

            if (i + 1 === pkmn.length) {
                // if this is the last card, attach the intersection observer ref for infinite scrolling
                cards.push(<PkmnCard
                    ref={ref}
                    key={`${key}__${obj.name}`}
                    obj={obj}
                    setLoadedCardsCount={setLoadedCardsCount}
                    loadedCardsCount={loadedCardsCount}
                    itemCount={itemCount}
                    />);
            } else {
                cards.push(<PkmnCard
                    key={`${key}__${obj.name}`}
                    obj={obj}
                    setLoadedCardsCount={setLoadedCardsCount}
                    loadedCardsCount={loadedCardsCount}
                    itemCount={itemCount}
                    />);
            }

        });
        return cards;
    }

    const [loadedCardsCount, setLoadedCardsCount] = useState(0); // when all cards are loaded, reveal with gsap animation

    // wait for all cards to be ready to render before fading them in
    useEffect(() => {
        // console.log(loadedCardsCount)
        // if a full set of pkmnCards are ready to render, then fade them in:
        if (((loadedCardsCount % parseInt(itemCount) === 0) && (loadedCardsCount !== 0)) || (loadedCardsCount === pkmn.length)) {
            // Conditions 1 and 2 are for the home page:
                // if loadedCardsCount % one full set of pkmn cards returned by an API call === 0, then fade them all in.
            // Condition 3 is for search results:
                // if loadedCardsCount === the length of the search result list, then fade them all in.
                // condition 3 will never trigger on the home page as loadedCardsCount is reset to 0 every time a set of fade-in animations are finished.

            // fade-in cards
            let q = gsap.utils.selector("#mainCardCont");
            gsap.effects.fadeIn(q(".tweenMe"), {stagger: {
                each: 0.1,
                onComplete: function(){
                    this.targets()[0].classList.remove('tweenMe');
                },
            }})
            setLoadedCardsCount(0); // reset card count when animation is complete
        }
    }, [loadedCardsCount]);
    
    // predefine fadeIn animation for cards
    gsap.registerEffect({
        name: "fadeIn",
        effect: (targets, config) => {
            return gsap.to(targets, {
                duration: config.duration, 
                autoAlpha: config.autoAlpha,
                y: config.y,
                stagger: config.stagger,
                ease: 'power2.inOut',
                clearProps: 'all',
                onComplete: config.onComplete
            }, '-=0.25');
        },
        defaults: {
            duration: 0.5,
            autoAlpha: 1,
            y: 0,           
        },  // defaults get applied to any "config" object passed to the effect.
        extendTimeline: true,       // Now you can call the effect directly on any GSAP timeline to have the 
                                    // result immediately inserted in the position you define 
                                    // (default is sequenced at the end)
    });

    return (
        <>  
            <div id="mainCardCont" className='cardCont'>
                {loadedCards}
            </div>
        </>
    );
}

export default React.memo(forwardRef(PokemonList));