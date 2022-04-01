import React from 'react';
import { Sort } from './Sort-HOC'; // to sort typepanel-sec elements

type Props = {
    panelType: string,
    matchups: Object,
}

// TypeMatchups component for TabPanels
export const TypeMatchups = ({panelType, matchups}:Props) => {

    // console.log(matchups);

    let matchupsReturnList: JSX.Element[] = [];

    // make a dummy wrapper component to store a prop for the typematchup-sec order
    const Dummy : (props: {order: number, children: React.ReactChild}) => JSX.Element = (props) => {
        return(<>{props.children}</>); 
    };

    Object.entries(matchups).forEach(([effectiveness, typeList], i) => {
        // don't bother making a section if there are no types to d
        if (typeList.length === 0) return

        let heading = '';
        let order = 0;   // used as index for Sorting, from most to least effective
        if (panelType === 'atk') {
            // the wording of the headings will be different depending on the type of panel

            // set heading based on effectiveness
            if (effectiveness.includes('double') && effectiveness.includes('dupes')) {
                heading = '4x Effective';
                order = 1;
            } else if (effectiveness.includes('half') && effectiveness.includes('dupes')) {
                heading = '0.25x Effective';
                order = 4;
            } else if (effectiveness.includes('double')) {
                heading = '2x Effective';
                order = 2;
            } else if (effectiveness.includes('half')) {
                heading = '0.5x Effective';
                order = 3;
            } else if (effectiveness.includes('no')) {
                heading = 'No Effect On';
                order = 5;
            }

        } else {
            // def headings:

            // set heading based on effectiveness
            if (effectiveness.includes('double') && effectiveness.includes('dupes')) {
                heading = '4x Weak to';
                order = 5;
            } else if (effectiveness.includes('half') && effectiveness.includes('dupes')) {
                heading = '4x Resists';
                order = 2;
            } else if (effectiveness.includes('double')) {
                heading = 'Weak to';
                order = 4;
            } else if (effectiveness.includes('half')) {
                heading = 'Resists';
                order = 3;
            } else if (effectiveness.includes('no')) {
                heading = 'Immune to';
                order = 1;
            }

        }
        
        matchupsReturnList.push(
            <Dummy
            order={order}
            key={`${heading}-${i}`}
            >
                <div
                className='typematchup-sec'>
                    <h3>{heading}:</h3>
                    <div className='typeBox typeBox-matchups'>
                        {typeList.map((type:string, i:number) => 
                        <div key={`${i}-type-${type}`} style={{display: 'flex'}}>
                            <span
                            className={`typeBox-type type-${type}`} 
                            style={
                                // increase contrast of text for certain pkmn types
                                (['electric', 'ice', 'fairy', 'grass', 'ground', 'bug'].includes(type.toLowerCase())) ? {color: '#363535'} : {}}
                                >{type}
                            </span>
                        </div>)}
                    </div>
                </div>
            </Dummy>
        );

    });

    return( 
        <Sort by={'order'}>
            {matchupsReturnList}
        </Sort>
    );
}