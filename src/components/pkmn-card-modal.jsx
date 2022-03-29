import { useLayoutEffect, useRef } from "react";
import { ModalTabs } from "./pkmn-card-modal-tabs";
import gsap from 'gsap/all';

// Modal Component
export const PkmnCardModal = ({id, name, pkmnCard, handleModalToggle, modalOpen, printTypes}) => {

    let modalRef = useRef();

    // deconstruct pkmnObj
    let {
        artwork,
        types,
        height,
        weight,
        description,
        genus,
        babyForm,
        middleForm,
        finalEvolution,
        statsList
    } = pkmnCard;

    let sprites = {babyForm, middleForm, finalEvolution}; // will loop thru this to output sprites

    const printSprites = (sprites) => {

        let spritesList = [];
        Object.entries(sprites).map(([form, spriteObj]) => {

            if (!spriteObj) return // don't include undefined objects in spritesList

            let styleObj = (spriteObj.name === name) ? {'--modal-sprite-bgcolor' : 'rgba(255, 255, 255, 0.08)'} : {'--modal-sprite-bgcolor' : 'rgba(0,0,0, 0.1)'};

            spritesList.push(
                <div key={`${spriteObj.name}-sprite`} className="modal-content-evo-sprite" style={styleObj}>
                    {(spriteObj.spriteGif) 
                        ? <img src={`${spriteObj.spriteGif}`} alt={`${spriteObj.name} sprite`}/>
                        : <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png`} alt={`${spriteObj.name} sprite not found`} />}
                </div>
            )

        });

        return spritesList;
    }

    useLayoutEffect(()=>{
        // Fade-In on mount

        if (modalRef.current && modalOpen) {
            // console.log(modalRef.current.children)
            gsap.effects.fadeInFrom([modalRef.current, modalRef.current.children], {delay: 0.2, stagger: 0.1});
        }
        // console.log(`modal for ${name} open`);

    }, [])

    // predefine fadeIn animation for cards
    gsap.registerEffect({
        name: "fadeInFrom",
        effect: (targets, config) => {
            return gsap.from(targets, {
                duration: config.duration, 
                autoAlpha: config.autoAlpha,
                y: config.y,
                delay: config.delay,
                stagger: config.stagger,
                clearProps: 'all',
                onComplete: config.onComplete
            }, '-=0.25');
        },
        defaults: {
            duration: 0.5,
            autoAlpha: 0,
            delay: 0,
            y: 20,           
        },  // defaults get applied to any "config" object passed to the effect.
        extendTimeline: true,       // Now you can call the effect directly on any GSAP timeline to have the 
                                    // result immediately inserted in the position you define 
                                    // (default is sequenced at the end)
    });

    return(<>
        <div id={`${name}-modal-${id}`} className="modal" onClick={e => handleModalToggle(e.target)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} ref={modalRef}>
                <div className='modal-content-name'>
                    <div className='modal-content-name-heading'>
                        <h4><span className='modal-content-name-heading-id'>{id}.</span> {name.toUpperCase().replace(/-+/g, ' ')}</h4>
                        <h5 className='modal-content-name-heading-genus'>The {genus}</h5>
                    </div>

                </div>

                <div className='modal-content-typeBox typeBox'>
                    {printTypes()}
                </div>

                <div className='modal-content-img'>
                    <img src={artwork} alt={`official artwork for ${name}`} />
                    <div className='modal-content-img-shadow'></div>
                </div>

                <div className="modal-content-evo">
                    {printSprites(sprites)}
                </div>

                <div className="modal-content-desc">
                    <p>{description}</p>
                </div>

                <div className="modal-content-tabs">
                    {/* Types - for type matchup tab panels */}
                    {/* statsList - for BarChart tab panel */}
                   <ModalTabs types={types} statsList={statsList} />
                </div>



            </div>
        </div>
    </>);

}