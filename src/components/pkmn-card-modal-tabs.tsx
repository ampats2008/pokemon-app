import * as React from 'react';
import axios from 'axios';
import { TabPanel, useTabs } from 'react-headless-tabs';
import { TabSelector } from './pkmn-card-modal-tabs-tabselector';
import {TypeMatchups} from './pkmn-card-modal-tabs-typematchups';

import { BarChart } from './functions/BarChart';
import * as d3 from 'd3';

// Adapted from: https://github.com/Zertz/react-headless-tabs
type Types = [
    {
    slot:number,
    type: {name: string, url: string}
    }
];

type Props = {
    types: Types,
    statsList: [
        {stat:string, base_stat:number},
    ],
}

export function ModalTabs({types, statsList}:Props) {
    const [selectedTab, setSelectedTab] = useTabs([
    'Stats',
    'Attack Matchups',
    'Defense Matchups',
    ]);

    // Chart Refs/State
    const barChartRef = React.useRef<HTMLDivElement>(null);
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

    const getChartSortFn = (chartOrder:string) => {
        if (chartOrder === 'alpha-asc') return (a:{stat:string}, b:{stat:string}) => d3.ascending(a.stat, b.stat);
        if (chartOrder === 'Ys-asc') return (a:{base_stat:number}, b:{base_stat:number}) => d3.ascending(a.base_stat, b.base_stat);
        if (chartOrder === 'Ys-dsc') return (a:{base_stat:number}, b:{base_stat:number}) => d3.descending(a.base_stat, b.base_stat);
        return   // return null if chartOrder is none of these
    }

    React.useEffect(()=> {
        // only run this block if buildChartRef is defined and if the chart is loaded
        if (barChartRef.current && !chartNotLoaded) {
            let sortFn = getChartSortFn(chartOrder);
            // update chart using sort function
            // make sure that the SVG exists and that it has the update function attached before invoking it
            if (barChartRef.current.children.length !== 0) {
                if (barChartRef.current.children[0].hasOwnProperty('update')) {
                    // Disabling type-checking on next line for now.
                    // TS claims that that the update property doesn't exist on firstChild, 
                    // but I checked that it exists already:
                    // @ts-ignore
                    barChartRef.current.children[0].update(d3.sort(statsList, sortFn), {yDomain: [0, 100]});
                }
            }
        } 
            
    }, [chartOrder])

    const buildBarChart = (statsList : [{stat:string, base_stat:number}]) => {

        // pass data into d3 BarChart.js function
        const chart = BarChart(statsList, {
            x: (d:{stat:string}) => d.stat,
            y: (d:{base_stat:number}) => d.base_stat,
            xPadding: 0.3,
            yDomain: [0, 100],
            yLabel: '↑ Stat',
            width: barChartRef.current!.offsetWidth,
            height: 350,
            colors: ['#EB3323', '#E28544', '#F2D154', '#6F91E9', '#8BC561', '#E66488'], // array of colors from games
            duration: 750,
        });

        return chart;
    }
    const getDamageRelations = async (types: Types) => {

        let typeResList = await Promise.all(
            // for each type, return type data as promise
            types.map(async (type) => await axios.get(`https://pokeapi.co/api/v2/type/${type.type.name}`))
        );
    
        // make object with keys from both types:
        let fullTypeMatchups : {
            [key: string]: string[],
        } = {
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
            Object.entries(res.data.damage_relations).map(([k, v]:[string, any]) => {
                // if key matches key from fullTypeMatchups, add the value to its list
                Object.keys(fullTypeMatchups).map(masterKey => {
                    if (k === masterKey) {
                        // spread the type names from v into fullTypeMatchups.
                        fullTypeMatchups[masterKey].push(...v.map( (v :{name:string}) => v.name) );
                    }
                });
            });
        });
    
        // def fn to find duplicate strings in each array
        let findDuplicates = (arr:any[]) => arr.filter((item, index) => arr.indexOf(item) != index);
    
        // For each damage relation list in fullTypeMatchups, sort it and find duplicates:
    
        // **Note: a duplicate type within any given list implies that a pkmn is 4x weak to or 4x strong against that type
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
            let kv : {[k:string]:string[]} = {};
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