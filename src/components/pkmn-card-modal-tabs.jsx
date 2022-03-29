import * as React from 'react';
import axios from 'axios';
import { TabPanel, useTabs } from 'react-headless-tabs';

import { Sort } from './functions/Sort'; // to sort typepanel-sec elements
import { BarChart } from './functions/BarChart';
import * as d3 from 'd3';

// Adapted from: https://github.com/Zertz/react-headless-tabs

export function ModalTabs({types, statsList}) {
    const [selectedTab, setSelectedTab] = useTabs([
    'Stats',
    'Attack Matchups',
    'Defense Matchups',
    ]);

    // Chart Refs/State
    const barChartRef = React.useRef();
    const [chartOrder, setChartOrder] = React.useState(''); // updates the order of the bar chart rects

    // insert bar chart on load:
    const [chartNotLoaded, setChartNotLoaded] = React.useState(true);
    React.useEffect(()=> {
        // only run this block the first time buildChartRef updates
        if (barChartRef.current && chartNotLoaded) {
            // adjust x-axis label names (so that they don't overlap):
            statsList.map(statObj => {
                if (statObj.stat === 'special-attack') { statObj.stat = 'sp. attack'}
                if (statObj.stat === 'special-defense') { statObj.stat = 'sp. defense'}
            })
                        
            let chart = buildBarChart(statsList);
            barChartRef.current.append(chart);
            setChartNotLoaded(false);
        } 
    }, [barChartRef.current])

    // update bar chart order when selectbox changes

    const getChartSortFn = (chartOrder) => {
        if (chartOrder === 'alpha-asc') return (a, b) => d3.ascending(a.stat, b.stat);
        if (chartOrder === 'Ys-asc') return (a, b) => d3.ascending(a.base_stat, b.base_stat);
        if (chartOrder === 'Ys-dsc') return (a, b) => d3.descending(a.base_stat, b.base_stat);
        return   // return null if chartOrder is none of these
    }

    React.useEffect(()=> {
        // only run this block if buildChartRef is defined and if the chart is loaded
        if (barChartRef.current && !chartNotLoaded) {
            let sortFn = getChartSortFn(chartOrder);
            // update chart using sort function
            barChartRef.current.firstChild.update(d3.sort(statsList, sortFn), {yDomain: [0, 100]});
        } 
    }, [chartOrder])

    const buildBarChart = (statsList) => {
        // pass data into d3 BarChart.js function
        const chart = BarChart(statsList, {
            x: d => d.stat,
            y: d => d.base_stat,
            xPadding: 0.3,
            yDomain: [0, 100],
            yLabel: '↑ Stat',
            width: barChartRef.current.offsetWidth,
            height: 350,
            colors: ['#EB3323', '#E28544', '#F2D154', '#6F91E9', '#8BC561', '#E66488'], // array of colors from games
            duration: 750,
        });

        return chart;
    }

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
    
        // **Note: a duplicate type within any given list imply that a pkmn is 4x weak to or 4x strong against that type
        Object.entries(fullTypeMatchups).map(([k, v]) => {
            fullTypeMatchups[k] = v.sort();
    
            let dupes = [...new Set(findDuplicates(fullTypeMatchups[k]))];
    
            if (dupes.length > 0) {
                // if duplicates are found for a list:
                fullTypeMatchups[`${k}_dupes`] = dupes;                          // add duplicates to new array in fullTypeMatchups
                fullTypeMatchups[k] = v.filter(type => !(dupes.includes(type))); // scrub duplicates from original list:
            }
        });
    
        // **Note: if the same type appears in a double list and a half list, it is calculated as normal effectiveness.
        const normalDefTypes = [...new Set(fullTypeMatchups['double_damage_from'].filter(element => fullTypeMatchups['half_damage_from'].includes(element)))];
        const normalAtkTypes = [...new Set(fullTypeMatchups['double_damage_to'].filter(element => fullTypeMatchups['half_damage_to'].includes(element)))];
        
        // Since types with normal effectiveness are unlisted, we need to delete the matches from the fullTypeMatchups Obj:
        normalDefTypes.map(delType => {
            fullTypeMatchups['double_damage_from'] = fullTypeMatchups['double_damage_from'].filter(element => (element !== delType));
            fullTypeMatchups['half_damage_from'] = fullTypeMatchups['half_damage_from'].filter(element => (element !== delType));
        });
        normalAtkTypes.map(delType => {
            fullTypeMatchups['double_damage_to'] = fullTypeMatchups['double_damage_to'].filter(element => (element !== delType));
            fullTypeMatchups['half_damage_to'] = fullTypeMatchups['half_damage_to'].filter(element => (element !== delType));
        });

        // **Note: if the same type appears in a "no effect" list and any other list, it is calculated as "no effect" only.
        fullTypeMatchups['no_damage_to'].map(noEffectType => {
            fullTypeMatchups['double_damage_to'] = fullTypeMatchups['double_damage_to'].filter(element => (element !== noEffectType));
            fullTypeMatchups['half_damage_to'] = fullTypeMatchups['half_damage_to'].filter(element => (element !== noEffectType));
        })
        fullTypeMatchups['no_damage_from'].map(noEffectType => {
            fullTypeMatchups['double_damage_from'] = fullTypeMatchups['double_damage_from'].filter(element => (element !== noEffectType));
            fullTypeMatchups['half_damage_from'] = fullTypeMatchups['half_damage_from'].filter(element => (element !== noEffectType));
        })

        // ^^ the above four maps should be able to be abstracted further with a helper function, the logic is the same b/w all of them

        // console.log(fullTypeMatchups)
    
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

    // Type Matchups State
    const [attackMatchups, setAttackMatchups] = React.useState({
        'double_damage_to_dupes': [],
        'double_damage_to': [],
        'half_damage_to': [],
        'no_damage_to': [],
    });
    const [defenseMatchups, setDefenseMatchups] = React.useState({
        'double_damage_from_dupes': [],
        'double_damage_from': [],
        'half_damage_from': [],
        'no_damage_from': [],
    });

    // get damage relations for type matchups panels
    React.useEffect(() => {
        getDamageRelations(types);
    }, []);

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
        <div className="chartOrder">
            <label className='pagination-label chartOrder-label'>Order:
                <select 
                className='pagination-select chartOrder-select'
                value={chartOrder}
                onChange={e => setChartOrder(e.target.value)}
                style={{ marginLeft: '30px' }}>
                    <option value={'alpha-asc'}>Abc...</option>
                    <option value={'Ys-dsc'}>&#x2193; Stat</option>
                    <option value={'Ys-asc'}>&#x2191; Stat</option>
                </select>
            </label>
        </div>

        <div className="chartCont" ref={barChartRef}></div>
    </TabPanel>

    <TabPanel hidden={selectedTab !== 'Attack Matchups'}>
        <TypeMatchups panelType="atk" matchups={attackMatchups} />
    </TabPanel>
    <TabPanel hidden={selectedTab !== 'Defense Matchups'}>
        <TypeMatchups panelType="def" matchups={defenseMatchups}/>
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
const TypeMatchups = ({panelType, matchups}) => {

    // console.log(matchups);

    let matchupsReturnList = [];

    Object.entries(matchups).map(([effectiveness, typeList], i) => {
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
                <div
                key={`${heading}-${i}`}
                className='typematchup-sec'
                order={order}
                >
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

    });

    return <Sort by={'order'}>{matchupsReturnList}</Sort>;
}