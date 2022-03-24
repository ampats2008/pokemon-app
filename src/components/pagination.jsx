import React, {useState, useEffect, useRef} from 'react';

function Pagination({onClear, onSearch, itemCount, setitemCount, setClearList}) {

    const searchNameFieldRef = useRef();
    const [searchTerm, setSearchTerm] = useState('');

    const scrapeSearchTerm = () => {
        onSearch(searchTerm);
    }


    const Button = ({type, onClear, onSearch, children}) => {

        const handleClick = () => {
            // change onClick handler depending on btn type
            if (type === 'clear') { onClear() }
            if (type === 'search') { onSearch() }
        }


        return(
            <>
                <button className='pagination-btn' onClick={handleClick}>{children}</button>
            </>
        );
    }

    return ( 
        <div className='pagination'>
            
        <label 
        className='pagination-label'
        >Rows per page:
            <select
            className='pagination-select'
            value={itemCount}
            onChange={e => {
                setClearList(true);
                setitemCount(e.target.value);
            }}
            style={{
                marginLeft: '30px',
            }}>
                {[2,3,4,5,6,7].map(i => <option key={`dropdown_items_${(i*6)}`} value={`${(i*6)}`}>{i}</option>)}
            </select>
        </label>
        <div
        className='pagination-searchgroup'>
            <input ref={searchNameFieldRef} id="searchNameField" type={'text'} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <Button onSearch={scrapeSearchTerm} type={'search'}>🔍</Button>
        </div>

        <Button onClear={onClear} type={'clear'}>clear grid</Button>
        </div>
     );
}

export default Pagination;