import React, {useState, useEffect, useRef, MouseEventHandler, ChangeEvent} from 'react';
import { Button } from './pagination-btn';

type PaginationProps = {
    // handleClearGrid is invoked for onChange event and onClick event
    handleClearGrid: (e?: React.ChangeEvent<HTMLSelectElement>) => void,
    onSearch: (str:string) => void,
    itemCount: string,
};

function Pagination({handleClearGrid, onSearch, itemCount}: PaginationProps) {

    const searchNameFieldRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const scrapeSearchTerm = () => {
        onSearch(searchTerm);
    }

    return ( 
        <div className='pagination'>
            <label 
            className='pagination-label'
            >Items per page:
                <select
                className='pagination-select'
                value={itemCount}
                onChange={(e) => handleClearGrid(e)}
                style={{
                    marginLeft: '30px',
                }}>
                    {[2,3,4,5,6,7].map(i => <option key={`dropdown_items_${(i*6)}`} value={`${(i*6)}`}>{i*6}</option>)}
                </select>
            </label>
            <div
            className='pagination-searchgroup'>
                <input ref={searchNameFieldRef} id="searchNameField" type={'text'} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <Button onClick={scrapeSearchTerm} >&#x1F50E;&#xFE0E;</Button>
            </div>

            <Button onClick={() => handleClearGrid()} >clear grid</Button>
        </div>
     );
}

export default Pagination;