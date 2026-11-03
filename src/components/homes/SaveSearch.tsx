'use client';
import {useState} from 'react';
export function SaveSearch({label}:{label:string}) {
 const [message,setMessage]=useState('');
 function save(){try{const raw=JSON.parse(localStorage.getItem('lmgl:home-searches')||'[]');const list=Array.isArray(raw)?raw:[];const url=window.location.pathname+window.location.search;localStorage.setItem('lmgl:home-searches',JSON.stringify([{label,url},...list.filter(x=>x?.url!==url)].slice(0,20)));setMessage('Saved on this device.');}catch{setMessage('This browser could not save your search. Bookmark this page instead.')}}
 return <div><button className="cinnamon-btn text-sm" onClick={save}>Save this search</button><p className="mt-2 text-xs" role="status">{message}</p></div>;
}
