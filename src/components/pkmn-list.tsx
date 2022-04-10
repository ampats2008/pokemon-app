import React, { useState, useEffect, forwardRef, useRef, useMemo } from "react"
import PkmnCard from "./pkmn-card"

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
  itemsPerPage: number
}

function PokemonList(
  { pkmn, itemCount, itemsPerPage, searchTerm }: Props,
  lastCardRef: React.Ref<HTMLDivElement> | undefined
) {
  const filteredPkmn = useMemo(
    () =>
      Object.entries(pkmn).filter((pkmnObj) =>
        pkmnObj[1].name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [pkmn, searchTerm]
  )

  return (
    <>
      <div id="mainCardCont" className="cardCont">
        {filteredPkmn.slice(0, itemCount).map(([key, obj], i) => {
          if (i === itemCount - 1) {
            // if this is the last card, attach the intersection observer ref for infinite scrolling
            return (
              <PkmnCard
                ref={lastCardRef}
                key={`${key}__${obj.name}`}
                obj={obj}
                animationOrder={i}
                itemsPerPage={itemsPerPage}
              />
            )
          } else {
            return (
              <PkmnCard
                key={`${key}__${obj.name}`}
                obj={obj}
                animationOrder={i}
                itemsPerPage={itemsPerPage}
              />
            )
          }
        })}
      </div>
    </>
  )
}

export default forwardRef(PokemonList)
