'use client';
import {useCallback,useMemo,useState,useSyncExternalStore} from 'react';
const noopSubscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
export function useHydrated(){return useSyncExternalStore(noopSubscribe,clientReady,serverReady);}
const memory = new Map<string,string>();
const failedKeys = new Set<string>();
const storageEvent = 'lmgl:storage-change';
function subscribeStorage(notify:()=>void){window.addEventListener('storage',notify);window.addEventListener(storageEvent,notify);return()=>{window.removeEventListener('storage',notify);window.removeEventListener(storageEvent,notify)};}
function readStorage(key:string){if(failedKeys.has(key))return memory.get(key)??null;try{return localStorage.getItem(key)}catch{return memory.get(key)??null}}
export function writeStorage(key:string,value:string|null){if(value===null)memory.delete(key);else memory.set(key,value);try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);failedKeys.delete(key)}catch(error){failedKeys.add(key);throw error}finally{window.dispatchEvent(new Event(storageEvent));}}
export function useStorageValue(key:string){return useSyncExternalStore(subscribeStorage,useCallback(()=>readStorage(key),[key]),()=>null);}
export function useStoredObject<T extends object>(key:string):[T,(value:T)=>void]{const raw=useStorageValue(key);const value=useMemo(()=>{try{const p=JSON.parse(raw??'{}');return p&&typeof p==='object'&&!Array.isArray(p)?p as T:{} as T}catch{return {} as T}},[raw]);return[value,(next:T)=>{try{writeStorage(key,JSON.stringify(next))}catch{/* memory fallback remains available */}}];}
export function useKeyedPage(key:string):[number,(page:number)=>void]{const [state,setState]=useState({key,page:1});if(state.key!==key)setState({key,page:1});return[state.key===key?state.page:1,(page:number)=>setState({key,page})];}
function subscribeMotion(notify:()=>void){const media=window.matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',notify);window.addEventListener('lmgl:reduce-motion-change',notify);const unsub=subscribeStorage(notify);return()=>{media.removeEventListener('change',notify);window.removeEventListener('lmgl:reduce-motion-change',notify);unsub()};}
function motionSnapshot(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches||readStorage('lmgl:reduce-motion')==='1';}
export function useReducedMotion(){return useSyncExternalStore(subscribeMotion,motionSnapshot,()=>true);}
let clock:number|null=null;let timer:ReturnType<typeof setInterval>|undefined;const listeners=new Set<()=>void>();
function subscribeClock(notify:()=>void){listeners.add(notify);clock=Date.now();notify();if(!timer)timer=setInterval(()=>{clock=Date.now();listeners.forEach(fn=>fn())},60000);return()=>{listeners.delete(notify);if(!listeners.size){clearInterval(timer);timer=undefined;clock=null}};}
export function useNow(){return useSyncExternalStore(subscribeClock,()=>clock,()=>null);}
