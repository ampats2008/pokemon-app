import React, { useState, useEffect, forwardRef, useRef } from "react"
import PkmnCard from "./pkmn-card"
import gsap from "gsap/all"

type Props = {
  pkmn:
    | [
        {
          name: string
          url: string
        }
      ]
    | []
  itemCount: number
  searchTerm: string
}

function PokemonList(
  { pkmn, itemCount, searchTerm }: Props,
  lastCardRef: React.Ref<HTMLDivElement> | undefined
) {
  return (
    <>
      <div id="mainCardCont" className="cardCont">
        {Object.entries(pkmn)
          .filter((pkmnObj) =>
            pkmnObj[1].name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, itemCount)
          .map(([key, obj], i) => {
            if (i === (itemCount - 1)) {
              // if this is the last card, attach the intersection observer ref for infinite scrolling
              return (
                <PkmnCard
                  ref={lastCardRef}
                  key={`${key}__${obj.name}`}
                  obj={obj}
                />
              )
            } else {
              return <PkmnCard key={`${key}__${obj.name}`} obj={obj} />
            }
          })}
      </div>
    </>
  )
}

export default forwardRef(PokemonList)
