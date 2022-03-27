import * as React from 'react';
import axios from 'axios';
import { TabPanel, useTabs } from 'react-headless-tabs';
// Adapted from: https://github.com/Zertz/react-headless-tabs

export function ModalTabs({types}) {
  const [selectedTab, setSelectedTab] = useTabs([
    'Stats',
    'Attack Matchups',
    'Defense Matchups',
  ]);

  const [attackMatchups, setAttackMatchups] = React.useState({
        'double_damage_to': [],
        'half_damage_to': [],
        'no_damage_to': [],
    });
  const [defenseMatchups, setDefenseMatchups] = React.useState({
        'double_damage_from': [],
        'half_damage_from': [],
        'no_damage_from': [],
    });

  React.useEffect(() => {
    getDamageRelations(types);
  }, []);

  const getDamageRelations = async (types) => {

    let typeResList = await Promise.all(
        // for each type, return type data as promise
        types.map(async (type) => await axios.get(`https://pokeapi.co/api/v2/type/${type.type.name}`))
    );
    
    // make object with keys from both types:
    let fullTypeMatchups = {
        'double_damage_from': [],
        'double_damage_to': [],
        'half_damage_from': [],
        'half_damage_to': [],
        'no_damage_from': [],
        'no_damage_to': [],
    };

    // merge objects into fullTypeMatchups:
    typeResList.map(res => {
        // for each damage relations object:
        Object.entries(res.data.damage_relations).map(([k, v]) => {
            // if key matches key from fullTypeMatchups, add the value to its list
            Object.keys(fullTypeMatchups).map(masterKey => {
                if (k === masterKey) {
                    // spread the type names from v into fullTypeMatchups.
                    fullTypeMatchups[masterKey].push(...v.map(v => v.name));
                }
            });
        });
    });

     // def fn to find duplicate strings in each array
     let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index);

    // For each damage relation list in fullTypeMatchups, sort it and find duplicates:
    // **Note: duplicate types in any list imply that a pkmn is 4x weak to or 4x strong against something
    Object.entries(fullTypeMatchups).map(([k, v]) => {
        fullTypeMatchups[k] = v.sort();

        let dupes = [...new Set(findDuplicates(fullTypeMatchups[k]))];

        if (dupes.length > 0) {
            // if duplicates are found for a list:
            fullTypeMatchups[`${k}_dupes`] = dupes;                          // add duplicates to new array in fullTypeMatchups
            fullTypeMatchups[k] = v.filter(type => !(dupes.includes(type))); // scrub duplicates from original list:
        }
    });
    
    console.log(fullTypeMatchups)
    // **Note: if the same type appears in a double list and a half list, it is calculated as normal effectiveness.



    // filter damageRelations for attack/defense matchups
    Object.entries(fullTypeMatchups).map(([k, v]) => {
        // make new key/value pair obj
        let kv = {};
        kv[k] = v;

        if (k.includes('to')) {
            // add key value pair to attackMatchups
            setAttackMatchups(prevObj => { return {...prevObj, ...kv } });
        } else {
            // add to defenseMatchups if it is not an attack matchup
            setDefenseMatchups(prevObj => { return {...prevObj, ...kv } });
        }
    });
  }

  return (
    <>
    <nav className="modal-content-tabs-nav">
    <TabSelector
        isActive={selectedTab === 'Stats'}
        onClick={() => setSelectedTab('Stats')}
    >
        Stats
    </TabSelector>

    <TabSelector
        isActive={selectedTab === 'Attack Matchups'}
        onClick={() => setSelectedTab('Attack Matchups')}
    >
        Attack Matchups
    </TabSelector>

    <TabSelector
        isActive={selectedTab === 'Defense Matchups'}
        onClick={() => setSelectedTab('Defense Matchups')}
    >
        Defense Matchups
    </TabSelector>
    </nav>

    <div className="modal-content-tabs-panel">
    <TabPanel hidden={selectedTab !== 'Stats'}>

        Stats


    </TabPanel>

    <TabPanel hidden={selectedTab !== 'Attack Matchups'}>
        <TypeMatchups type="atk" matchups={attackMatchups} />
    </TabPanel>
    <TabPanel hidden={selectedTab !== 'Defense Matchups'}>
        <TypeMatchups type="def" matchups={defenseMatchups}/>
    </TabPanel>
    </div>
    </>
  );
}

// wrapper component for tabs
const TabSelector = ({ isActive, children, onClick, }) => (
  <button
    className={` ${isActive ? 'tab tab-active' : 'tab'} `}
    onClick={onClick}
  >
    {children}
  </button>
);

// TypeMatchups component for TabPanels
const TypeMatchups = ({type, matchups}) => {

    // console.log(matchups);

    let matchupsReturnList = [];

    Object.entries(matchups).map(([effectiveness, typeList], i) => {
        // don't bother making a section if there are no types to d
        if (typeList.length === 0) return

        // set heading based on effectiveness
        let heading = '';
        if (effectiveness.includes('double') && effectiveness.includes('dupes')) {
            heading = '4x Effective';
        } else if (effectiveness.includes('half') && effectiveness.includes('dupes')) {
            heading = '0.25x Effective';
        } else if (effectiveness.includes('double')) {
            heading = 'Super Effective';
        } else if (effectiveness.includes('half')) {
            heading = 'Not Very Effective';
        } else if (effectiveness.includes('no')) {
            heading = 'No Effect';
        }


        matchupsReturnList.push(
                <div key={`${heading}-${i}`} className='typematchup-sec'>
                    <h3>{heading}:</h3>
                    <div className='typeBox typeBox-matchups'>
                        {typeList.map((type, i) => 
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
        );

    })

    return matchupsReturnList;
}