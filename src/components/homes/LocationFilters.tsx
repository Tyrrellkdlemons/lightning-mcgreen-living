'use client';
import {useState} from 'react';
export function LocationFilters({initialState='',initialCounty='',counties}:{initialState?:string;initialCounty?:string;counties:{geoid:string;name:string}[]}){
 const [state,setState]=useState(initialState),[county,setCounty]=useState(initialCounty);
 const options=counties.filter(c=>!state||c.geoid.startsWith(state==='CA'?'06':'04'));
 return <><label className="text-sm font-bold">State<select name="state" value={state} onChange={e=>{setState(e.target.value);setCounty('')}} className="home-control"><option value="">Both states</option><option value="CA">California</option><option value="AZ">Arizona</option></select></label><label className="text-sm font-bold">County<select name="county" value={county} onChange={e=>setCounty(e.target.value)} className="home-control"><option value="">Any county</option>{options.map(c=><option key={c.geoid} value={c.geoid}>{c.name} · {c.geoid.startsWith('06')?'CA':'AZ'}</option>)}</select></label></>;
}
