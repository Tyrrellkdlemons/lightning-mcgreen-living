import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);let ts;try{ts=req('typescript')}catch{ts=req('C:/Users/TKDL/AppData/Roaming/npm/node_modules/typescript/lib/typescript.js')}
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;vm.runInNewContext(code,{module:mod,exports:mod.exports,URL,URLSearchParams,Date,Headers,require:(name)=>{if(name==='next/server')return {NextResponse:{json:(data,options)=>({data,headers:new Headers(options?.headers)})}};if(name==='@/lib/places')return {};if(name==='@/lib/data/real-rentals')return {REAL_RENTALS:[]};if(name==='@/lib/data/workbook-ranked-listings')return {WORKBOOK_RANKED_LISTINGS:[]};if(name==='@/lib/resources')return {RESOURCE_SOURCES:[]};let p=name.startsWith('@/')?path.resolve('src',name.slice(2)):path.resolve(path.dirname(file),name);if(!fs.existsSync(p)){if(fs.existsSync(p+'.ts'))p+='.ts';else if(fs.existsSync(p+'.json'))p+='.json';else p=path.join(p,'index.ts');}else if(fs.statSync(p).isDirectory())p=path.join(p,'index.ts');return load(p)}});return mod.exports;}
const homes=load('src/lib/homes/index.ts'),locations=load('src/lib/locations/index.ts');
const now=Date.parse('2026-11-04T00:00:00Z');const fresh='2026-11-03T22:00:00Z';
const base={id:'a',name:'Example',intent:'buy',city:'Phoenix',state:'AZ',address:'Example Phoenix AZ',propertyType:'Condo',price:200000,beds:2,photos:[],observedAt:fresh,datedEvidence:true,advertisedNow:false};
const fixtures=[base,{...base,id:'rent',intent:'rent',price:2000,advertisedNow:true},{...base,id:'ca',city:'Los Angeles',state:'CA'},{...base,id:'unknown',price:undefined,beds:undefined},{...base,id:'old',observedAt:'2020-01-01T00:00:00Z'},{...base,id:'photo',photos:[{url:'https://example.org/photo.jpg'}]}];
const ids=(filter)=>Array.from(homes.filterHomes(fixtures,filter,now),x=>x.id);
assert.deepEqual(ids({intent:'rent'}),['rent']);
assert(!ids({intent:'buy'}).includes('rent'));
assert(ids({intent:'buy',city:'az-0455000'}).every(id=>id!=='ca'));
assert.deepEqual(ids({intent:'buy',city:'missing'}),[]);
assert.deepEqual(ids({intent:'buy',state:'TX'}),[]);
assert(!ids({intent:'buy',max:'250000',beds:'1'}).includes('unknown'));
assert(!ids({intent:'buy',max:'100000'}).length);
assert(!ids({intent:'buy',evidence:'recent'}).includes('old'));
assert.deepEqual(ids({intent:'rent',evidence:'now'}),['rent']);
assert.deepEqual(ids({intent:'buy',photos:'yes'}),['photo']);
assert(!ids({intent:'buy',county:'06037'}).includes('a'));
assert.equal(ids({intent:'buy',county:'06037'})[0],'ca');
assert.equal(locations.LOCATIONS.length,2089);
for(const p of locations.LOCATIONS){const links=homes.cityProviderLinks(p,'buy');assert(links.length>=2);for(const l of links)assert.equal(new URL(l.url).protocol,'https:');}
const data=JSON.parse(fs.readFileSync('src/lib/homes/sale-observations.json','utf8')).records;
assert.equal(data.length,36);assert.equal(new Set(data.map(x=>x.id)).size,36);
assert.equal(data.filter(x=>x.state==='CA').length,16);assert.equal(data.filter(x=>x.state==='AZ').length,20);
for(const row of data){assert(row.price>0&&row.beds>0);assert(row.sourceUrl.startsWith('https://homepath.fanniemae.com/property-detail/'));assert(row.observedAt&&row.inspection==='rendered-search-card');assert(row.photos.every(p=>new URL(p.url).hostname==='homepath.fanniemae.com'));}
console.log('PASS: rent/buy isolation, exact city/state/county, unknown numeric exclusions,48h freshness, media filters, all2089 provider paths and36 sourced sale observations.');

// Execute the actual route: distinct q/state responses must never enter a shared CDN cache.
const locationRoute=load('src/app/api/locations/route.ts');
assert.equal(locationRoute.dynamic,'force-dynamic');
const lookup=(q,state='')=>locationRoute.GET({nextUrl:new URL(`https://example.test/api/locations?q=${encodeURIComponent(q)}&state=${state}`)});
const phoenix=lookup('Phoenix'),sanTan=lookup('San Tan Valley'),wrongState=lookup('San Tan Valley','CA'),shortQuery=lookup('a');
assert.equal(phoenix.data.items[0].name,'Phoenix');
assert.equal(sanTan.data.items[0].name,'San Tan Valley');
assert.equal(wrongState.data.total,0);
assert.equal(shortQuery.data.items.length,0);
for(const response of [phoenix,sanTan,wrongState,shortQuery]) {
  for(const header of ['Cache-Control','CDN-Cache-Control','Netlify-CDN-Cache-Control']) assert.match(response.headers.get(header),/no-store/);
  assert.match(response.headers.get('Netlify-Vary'),/query=q\|state/);
}
console.log('PASS: actual city API query/state isolation and no-store policy on full and empty responses.');
