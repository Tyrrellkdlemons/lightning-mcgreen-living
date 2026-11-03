import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as nodeModule from 'node:module';
import vm from 'node:vm';
const source = await readFile(new URL('../src/app/api/maps/streetview/route.ts', import.meta.url), 'utf8');
const code = (typeof nodeModule.stripTypeScriptTypes === 'function' ? nodeModule.stripTypeScriptTypes(source, {mode:'strip'}) : (await import('typescript')).default.transpileModule(source,{compilerOptions:{module:99,target:9}}).outputText).replace(/^import.*;\s*$/gm,'').replace(/\bexport\s+(?=const|async|function)/g,'');
class FakeResponse extends Response { static json(value,options){return new FakeResponse(JSON.stringify(value),options);} static redirect(url,options){return new FakeResponse(null,{...options,headers:{Location:url}});} }
let calls=[]; let key=''; let mode='image';
const env={}; const fakeKey='fixture-key-never-leave-server';
const GET = vm.runInNewContext(code+';GET', {NextResponse:FakeResponse,URL,Number,Math,AbortSignal,process:{env},preferredSatelliteFallback:()=>({url:'https://example.org/satellite.jpg'}),fetch:async(url,options)=>{calls.push({url,options});if(mode==='throw')throw new Error('network');if(url.includes('/metadata'))return {ok:true,json:async()=>({status:mode==='no-pano'?'ZERO_RESULTS':'OK',location:{lat:34.01,lng:-118}})};return new Response(mode==='too-large'?new Uint8Array(2*1024*1024+1):new Uint8Array([255,216,255,217]),{status:mode==='upstream-error'?500:200,headers:{'content-type':mode==='wrong-mime'?'text/html':'image/jpeg'}});}});
const req=(qs='lat=34&lng=-118')=>({nextUrl:new URL('https://example.org/api/maps/streetview?'+qs)});
assert.equal((await GET(req('lat=oops&lng=0'))).status,400);
assert.equal((await GET(req('lat=91&lng=0'))).status,400);
assert.equal((await GET(req())).headers.get('location'),'https://example.org/satellite.jpg');assert.equal(calls.length,0);
env.GOOGLE_MAPS_API_KEY=fakeKey;
let response=await GET(req());assert.equal(response.status,200);assert.equal(response.headers.get('location'),null);assert.equal(response.headers.get('content-type'),'image/jpeg');assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal((await response.arrayBuffer()).byteLength,4);assert.ok(!JSON.stringify([...response.headers]).includes(fakeKey));assert.ok(calls.every(call=>call.options.cache==='no-store'));assert.equal(new URL(calls[1].url).searchParams.get('heading'),'180');
for(const failure of ['no-pano','wrong-mime','upstream-error','too-large','throw']){mode=failure;response=await GET(req());assert.equal(response.status,302);assert.equal(response.headers.get('location'),'https://example.org/satellite.jpg');assert.ok(!response.headers.get('location').includes(fakeKey));}
console.log('PASS street-view credential isolation, image response, no-store, heading, invalid coordinates and five upstream fallback cases.');
