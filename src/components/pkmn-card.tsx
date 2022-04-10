import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
  ForwardedRef,
} from "react"
import axios from "axios"
import { useToggle } from "./hooks/useToggle"
import { PkmnCardModal } from "./pkmn-card-modal"
import gsap from "gsap"

// import helper fn: Number.prototype.round()
import {} from "./utils/Round"

type Props = {
  obj: { name: string; url: string }
  animationOrder: number
  itemsPerPage: number
}

type pkmnForm = {
  name: string
  spriteGif: string
}

// Note: modal component below the card component
const PkmnCard = ({ obj, animationOrder, itemsPerPage }: Props, forwardRef: any) => {
  // const cardAnimationRef = useRef<HTMLDivElement>(null)
  // useImperativeHandle(forwardRef, () => cardAnimationRef.current)
  // merges the forwardedRef with localRef:
  // local ref is for gsap-animations
  // forwardedRef is applied to last card (only) as the intersectionObserver target

  const { name, url } = obj // get name from obj prop

  // parse obj.url for pokedex id; it is b/w two fwd slashes at end of url -- Ex: /id/
  const id = url.match(/(?<=\/)[0-9]+(?=\/)/g)!.toString() // id is displayed on card and used to retrieve record

  const [pkmnCard, setPkmnCard] = useState<{
    artwork: string | undefined
    types: [{ slot: number; type: { name: string; url: string } }]
    height: number
    weight: number
    description: string
    genus: string
    babyForm: pkmnForm | null
    middleForm: pkmnForm | null
    finalEvolution: pkmnForm | null
    statsList: [{ stat: string; base_stat: number }]
  }>({
    artwork: undefined,
    types: [{ slot: 0, type: { name: "", url: "" } }],
    height: 0,
    weight: 0,
    description: "",
    genus: "",
    babyForm: null,
    middleForm: null,
    finalEvolution: null,
    statsList: [{ stat: "", base_stat: 0 }],
  })

  //   const [renderReady, setReadyToRender] = useState(false)

  const getPkmnChars = async () => {
    // call for additional pkmn characteristics
    let res = await axios.get(url)
    return res.data
  }

  const getPkmnSpecies = async (url: string) => {
    // call for species data
    let res = await axios.get(url)
    return res.data
  }

  const getPkmnEvoChain = async (evolURL: string) => {
    // use evolution-chain URL to get the full evo chain for this pkmn
    let { data } = await axios.get(evolURL)

    // for each evolution chain, match the current pkmn to one of the forms:
    // baby:
    let babyForm = data.chain?.species

    // first evolution:
    let middleForm = data.chain?.evolves_to[0]?.species

    // second evolution:
    let finalEvolution = data.chain?.evolves_to[0]?.evolves_to[0]?.species

    return { babyForm, middleForm, finalEvolution }
  }

  const getPkmnGifSpriteByName = async (name: string) => {
    let res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}/`)
    let spriteGif =
      res.data.sprites.versions["generation-v"]["black-white"].animated
        .front_default

    if (spriteGif === null) {
      // if an animated sprite doesn't exist for a pkmn, return the default one instead.
      spriteGif = res.data.sprites.front_default
      // console.log(spriteGif)
    }

    return spriteGif
  }

  const getPkmnObj = async () => {
    let { stats, sprites, types, height, weight, species } =
      await getPkmnChars()

    // call for species data
    let speciesRes = await getPkmnSpecies(species.url)

    // select data from species resource:

    // filter descriptions to english only and sort alphabetically by game version:
    let descriptions = await speciesRes.flavor_text_entries
      .filter((entryObj: any) => entryObj.language.name === "en")
      .sort((a: any, b: any) => {
        var textA = a?.version?.name.toUpperCase()
        var textB = b?.version?.name.toUpperCase()
        return textA < textB ? -1 : textA > textB ? 1 : 0
      })

    // pick a flavor text entry, prefer gen 4 games:
    let description = await descriptions
      .sort()
      .find((entryObj: any) =>
        [
          "platinum",
          "diamond",
          "pearl",
          "sword",
          "shield",
          "sun",
          "moon",
          "x",
          "y",
        ].includes(entryObj.version.name)
      )

    // this string will be set to description in pkmnObj:
    description = description.flavor_text

    // filter "genera" for english only ("the blank pokemon")**
    let genera = await speciesRes.genera.filter(
      (entryObj: any) => entryObj.language.name.toLowerCase() === "en"
    )

    // **this call could wait until the modal is opened.
    let evoURL = await speciesRes.evolution_chain.url // use evolution-chain URL to get the full evo chain for this pkmn

    // call for evo chain
    let evoChain = await getPkmnEvoChain(evoURL)

    let { babyForm, middleForm, finalEvolution } = evoChain // Pkmn forms returned

    // console.log(middleForm);

    // Format Stats array appropriately for use with BarChart from d3.js
    let statsList = stats.map(
      (stat: { stat: { name: string }; base_stat: number }) => {
        return {
          stat: stat.stat.name,
          base_stat: stat.base_stat,
        }
      }
    )
    // console.log(statsList)

    // for each form, do the following:
    Object.values(evoChain).map(async (form) => {
      if (form === undefined) return // do nothing if the form doesn't exist
      form["spriteGif"] = await getPkmnGifSpriteByName(form.name) // add link to spriteGif to the form object
      delete form.url // species url not needed, so it can be deleted
    })

    // assign all api responses to state
    setPkmnCard({
      artwork: sprites.other["official-artwork"].front_default,
      types,
      height,
      weight,
      description,
      genus: genera[0].genus,
      babyForm,
      middleForm,
      finalEvolution,
      statsList,
    })

    // setReadyToRender(true)
  }

  useEffect(() => {
    getPkmnObj()
  }, [])

  // Modal Code:
  const [modalOpen, toggleModal] = useToggle(false)

  const handleModalToggle = (target: EventTarget) => {
    if (modalOpen) {
      // hide modal
      gsap.to(target, {
        autoAlpha: 0,
        ease: "power2.inOut",
        onComplete: () => {
          document.body.classList.toggle("overflowY-disabled") // toggle scrolling on body
          toggleModal()
        },
      })
    } else {
      //show modal
      document.body.classList.toggle("overflowY-disabled") // toggle scrolling on body
      toggleModal()
    }
  }

  const printTypes = () => {
    return (
      <>
        {pkmnCard.types.map((typeObj: any) => (
          <span
            key={`${id}-${name}_type-${typeObj.type.name}`}
            className={`typeBox-type type-${typeObj.type.name}`}
            style={
              // increase contrast of text for certain pkmn types
              ["electric", "ice", "fairy", "grass", "ground", "bug"].includes(
                typeObj.type.name.toLowerCase()
              )
                ? { color: "#363535" }
                : {}
            }
          >
            {typeObj.type.name}
          </span>
        ))}
      </>
    )
  }

  // Calc stagger style custom CSS prop -- tells fadeIn animation how 
  // long to delay the animation to produce a stagger effect
  const orderNum = (animationOrder + 1) % itemsPerPage
  const staggerStyle = {"--animation-order": (orderNum === 0) ? itemsPerPage : orderNum } as React.CSSProperties

  return (
    <>
      {
        <div
          className={`card flip-card fadeIn`}
          ref={forwardRef}
          style={{
            opacity: 0,
            transform: "translateY(-5px)",
            ...staggerStyle
          }}
        >
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <h4 className="card-name">{name.toUpperCase()}</h4>
              <h1 className="card-id">{id}</h1>
              <img
                className="card-img"
                src={pkmnCard.artwork}
                alt={`official artwork for ${name}`}
              />
            </div>

            <div className="flip-card-back">
              <p>The {pkmnCard.genus}</p>

              <div className="typeBox">{printTypes()}</div>

              <table>
                <tbody>
                  <tr>
                    <th>Height</th>
                    {/* weird behavior with imported Number.prototype method*/}
                    <td>
                      {Math.floor(pkmnCard.height / 3.048)}'{" "}
                      {/* @ts-ignore -- works fine, but it's getting flagged by ts*/}
                      {(pkmnCard.height % 3.048).round(1)}"
                    </td>
                  </tr>
                  <tr>
                    <th>Weight</th>
                    {/* @ts-ignore */}
                    <td>{(pkmnCard.weight / 4.536).round(0)} lbs</td>
                  </tr>
                </tbody>
              </table>

              <button
                id={`btn-learnmore-${id}`}
                className="btn-primary"
                style={{ maxWidth: "150px" }}
                onClick={(e) => handleModalToggle(e.target)}
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      }

      {modalOpen && (
        <PkmnCardModal
          id={id}
          name={name}
          pkmnCard={pkmnCard}
          handleModalToggle={handleModalToggle}
          modalOpen={modalOpen}
          printTypes={printTypes}
        />
      )}
    </>
  )
}

export default forwardRef(PkmnCard)
