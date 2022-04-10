import React, {
  useState,
  useEffect,
  useRef,
  MouseEventHandler,
  ChangeEvent,
  SetStateAction,
} from "react"
import { Button } from "./pagination-btn"

type PaginationProps = {
  // handleClearGrid is invoked for onChange event and onClick event
  handleClearGrid: (e?: React.ChangeEvent<HTMLSelectElement>) => void
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  searchTerm: string
  itemsPerPage: number
}

function Pagination({
  handleClearGrid,
  setSearchTerm,
  searchTerm,
  itemsPerPage,
}: PaginationProps) {
  return (
    <header>
      <h1 id="siteH1">The Pokédex</h1>
      <div className="pagination">
        <label className="pagination-label">
          Items per page:
          <select
            className="pagination-select"
            value={itemsPerPage}
            onChange={(e) => handleClearGrid(e)}
            style={{
              marginLeft: "30px",
            }}
          >
            {[2, 3, 4, 5, 6, 7].map((i) => (
              <option key={`dropdown_items_${i * 6}`} value={i * 5}>
                {i * 5}
              </option>
            ))}
          </select>
        </label>
        <input
          id="searchNameField"
          type={"text"}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Button onClick={() => handleClearGrid()}>clear grid</Button>
        </div>
    </header>
  )
}

export default Pagination
