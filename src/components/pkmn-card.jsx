import React, {useState, useEffect, forwardRef} from 'react';
import axios from 'axios';
import { useToggle } from './hooks/useToggle';
import { PkmnCardModal } from './pkmn-card-modal';

// Note: modal component below the card component
const PkmnCard = ({obj}, ref) => {

    // parse obj.url for pokedex id: between two fwd slashes at end of url --> /id/

    const {name, url} = obj; // get name from obj prop
    
    const id = url.match(/(?<=\/)[0-9]+(?=\/)/g); // id is displayed on card and used to retrieve record

    const [pkmnCard, setPkmnCard] = useState({
        artwork: null, 
        types: [],
        height: null,
        weight: null,
        description: '',
        genus: '',
        babyForm: null,
        middleForm: null,
        finalEvolution: null,
    });

    const [loaded, setLoaded] = useState(false);

    const getPkmnChars = async () => {
        // call for additional pkmn characteristics
        let res = await axios.get(url);
        return res.data;
    }

    const getPkmnSpecies = async (url) => {
        // call for species data
        let res = await axios.get(url);
        return res.data; 
    }

    const getPkmnEvoChain = async (evolURL) => {
         // use evolution-chain URL to get the full evo chain for this pkmn
        let { data } = await axios.get(evolURL);
        
        // for each evolution chain, match the current pkmn to one of the forms:
        // baby:
        let babyForm = data.chain?.species;

        // first evolution:
        let middleForm = data.chain?.evolves_to[0]?.species;

        // second evolution:
        let finalEvolution = data.chain?.evolves_to[0]?.evolves_to[0]?.species;

        return {babyForm, middleForm, finalEvolution};
    }

    const getPkmnGifSpriteByName = async (name) => {
        let res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}/`);
        let spriteGif = res.data.sprites.versions['generation-v']['black-white'].animated.front_default;
        
        if (spriteGif === null) { 
            // if an animated sprite doesn't exist for a pkmn, return the default one instead.
            spriteGif = res.data.sprites.front_default
            console.log(spriteGif)
        }

        return spriteGif;
    }

    const getPkmnObj = async () => {
        
        let {sprites, types, height, weight, species} = await getPkmnChars();

        // call for species data
        let speciesRes = await getPkmnSpecies(species.url);

        // select data from species resource:

        // filter descriptions to english only and sort alphabetically by game version:
        let descriptions = await speciesRes.flavor_text_entries.filter(entryObj => entryObj.language.name === 'en').sort((a, b) => {
            var textA = a?.version?.name.toUpperCase();
            var textB = b?.version?.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

        // pick a flavor text entry, prefer gen 4 games:
        let description = await descriptions.sort().find( entryObj => 
            ['platinum', 'diamond', 'pearl', 'sword', 'shield', 'sun', 'moon', 'x', 'y'].includes(entryObj.version.name));
        
        // this string will be set to description in pkmnObj:
        description = description.flavor_text;
        
        // filter "genera" for english only ("the blank pokemon")**
        let genera = await speciesRes.genera.filter(entryObj => entryObj.language.name.toLowerCase() === 'en');
        
        // **this call could wait until the modal is opened.
        let evoURL = await speciesRes.evolution_chain.url; // use evolution-chain URL to get the full evo chain for this pkmn

        // call for evo chain
        let evoChain = await getPkmnEvoChain(evoURL);
        
        let {babyForm, middleForm, finalEvolution} = evoChain; // Pkmn forms returned

        // for each form, do the following:
        Object.values(evoChain).map(async (form) => {
            if (form === undefined) return                               // do nothing if the form doesn't exist
            form['spriteGif'] = await getPkmnGifSpriteByName(form.name); // add link to spriteGif to the form object
            delete form.url;                                             // species url not needed, so it can be deleted
        })

        // assign all api responses to state
        setPkmnCard({
            artwork: sprites.other['official-artwork'].front_default,
            types,
            height,
            weight,
            description,
            genus: genera[0].genus,
            babyForm,
            middleForm,
            finalEvolution
        });

        setLoaded(true);
    }

    useEffect(() => {
        getPkmnObj();
    }, [])

    // Rounding helper function
    Number.prototype.round = function(places) {
        return +(Math.round(this + "e+" + places)  + "e-" + places);
    }

    // Modal Code:
    const [modalOpen, toggleModal] = useToggle();

    const handleModalToggle = (e) => {
        document.body.classList.toggle('overflowY-disabled');     // toggle scrolling on body        
        toggleModal();                                          // toggle modal show/hide state
    }

    const printTypes = () => {

        return(
            <>
            {pkmnCard.types.map(typeObj => 
            <span 
            key={`${id}-${name}_type-${typeObj.type.name}`} 
            className={`typeBox-type type-${typeObj.type.name}`} 
            style={
                // increase contrast of text for certain pkmn types
                (['electric', 'ice', 'fairy', 'grass', 'ground', 'bug'].includes(typeObj.type.name.toLowerCase())) ? {color: '#363535'} : {}}
                >{typeObj.type.name}
            </span>)}
            </>
        );
    }

    return(
    <>
        {(loaded) &&
        <div className='card flip-card' ref={ref}>
            <div className="flip-card-inner">

                <div className="flip-card-front">
                    <h4 className='card-name' >{name.toUpperCase()}</h4>
                    <h1 className='card-id' >{id}</h1>
                    <img className='card-img' src={pkmnCard.artwork} alt={`official artwork for ${name}`} />
                </div>

                <div className="flip-card-back">

                    <p>The {pkmnCard.genus}</p>

                    <div className='typeBox'>
                        {printTypes()}
                    </div>

                    <table>
                        <tbody>                            
                            <tr>
                                <th>Height</th>
                                <td>{Math.floor(pkmnCard.height / 3.048)}' {(pkmnCard.height % 3.048).round(1)}"</td>
                            </tr>
                            <tr>
                                <th>Weight</th>
                                <td>{Math.round(pkmnCard.weight / 4.536)} lbs</td>
                            </tr>
                        </tbody>
                    </table>

                    <button
                    id={`btn-learnmore-${id}`}
                    className='btn-primary' 
                    style={{maxWidth: '150px'}}
                    onClick={e => handleModalToggle(e)}
                    >Learn more</button>
                </div>
            </div>
        </div>}
        
        {(modalOpen) &&
        <PkmnCardModal id={id} name={name} pkmnCard={pkmnCard} handleModalToggle={handleModalToggle} printTypes={printTypes}/>}
    </>
    );
}

export default forwardRef(PkmnCard);