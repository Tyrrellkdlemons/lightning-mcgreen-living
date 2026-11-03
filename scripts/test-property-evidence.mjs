import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let ts; try { ts = require('typescript'); } catch { ts = require('C:/Users/TKDL/AppData/Roaming/npm/node_modules/typescript/lib/typescript.js'); }
const data = JSON.parse(fs.readFileSync('src/lib/property-evidence/records.json','utf8'));
function evalTs(path,globals,names) {
 const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:99,target:9}}).outputText.replace(/^import[\s\S]*?;\s*/gm,'').replace(/\bexport\s+(?=const|let|function|class)/g,'');
 return vm.runInNewContext(code+';({'+names.join(',')+'});',globals,{timeout:1500});
}
const cms=require('../public/admin/content/cms.js');
const raw=JSON.parse(fs.readFileSync('src/lib/data/editor-content.json','utf8'));
const geo=evalTs('src/lib/geofence/socal.ts',{},['isWithinCoverage']);
const editor=evalTs('src/lib/data/editor-content.ts',{raw,...cms,...geo},['EDITOR_RENTALS','withEditorRecords']);
const {REAL_RENTALS}=evalTs('src/lib/data/real-rentals.ts',{...editor,rentalPhotos:()=>({urls:[],alt:'Fixture'})},['REAL_RENTALS']);
const workbook=JSON.parse(fs.readFileSync('src/lib/data/generated/workbook-ranked-listings.json','utf8'));
const resources=JSON.parse(fs.readFileSync('src/lib/resources/catalog.json','utf8')).sources;
const canonical = new Set([...workbook,...REAL_RENTALS,...resources.filter(r=>r.category==='property')].map(t=>t.id));
const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/property-evidence/index.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:()=>data,URL,Date,Number});
const { observationExpired,youtubeEmbed,evidenceFor,EVIDENCE_MAX_AGE_MS }=module.exports;
assert.equal(data.schemaVersion,1); assert(data.records.length>=10);
const ids=new Set(); let embedded=0,links=0;
function https(value){const url=new URL(value);assert.equal(url.protocol,'https:');assert.equal(url.username,'');assert.equal(url.password,'');}
for(const r of data.records){
 assert(['CA','AZ'].includes(r.state));assert(r.name&&r.propertyIds.length);
 for(const id of r.propertyIds){assert(canonical.has(id),id);assert(!ids.has(id),'duplicate '+id);ids.add(id);assert.equal(evidenceFor(id).name,r.name);}
 for(const url of [r.officialUrl,r.galleryUrl,r.availability.sourceUrl])https(url);
 const a=r.availability;assert(Number.isFinite(Date.parse(a.observedAt)));assert(a.summary&&a.limitations);
 assert(['unit-observations','plan-counts','unconfirmed'].includes(a.status));
 if(a.status==='unit-observations')assert(a.units.length>0);
 if(a.status==='plan-counts')assert(a.plans.every(p=>Number.isInteger(p.availableUnits)&&p.availableUnits>=0));
 if(a.status==='unconfirmed')assert(!a.units?.length&&!a.plans?.length);
 for(const t of r.tours){https(t.url);https(t.officialSourceUrl);assert(['youtube','matterport'].includes(t.provider));const embed=youtubeEmbed(t);if(t.embedStatus==='supported-public-player'){assert(embed?.startsWith('https://www.youtube-nocookie.com/embed/'));embedded++;}else{assert.equal(embed,null);links++;}}
 assert(['unknown','permission-required'].includes(r.photoReuse.status));
}
const at='2026-11-03T12:00:00Z', ms=Date.parse(at);
assert.equal(observationExpired(at,ms+EVIDENCE_MAX_AGE_MS-1),false);
assert.equal(observationExpired(at,ms+EVIDENCE_MAX_AGE_MS),true);
assert.equal(observationExpired(at,ms-1),true);assert.equal(observationExpired('invalid',ms),true);
assert.equal(youtubeEmbed({provider:'youtube',embedStatus:'supported-public-player',url:'https://youtube.com.evil.example/watch?v=abcdefghijk'}),null);
assert.equal(youtubeEmbed({provider:'matterport',embedStatus:'supported-public-player',url:'https://my.matterport.com/show/?m=anything'}),null);
assert.equal(evidenceFor('missing'),undefined);
console.log(`PASS: ${data.records.length} communities, ${ids.size} canonical targets, ${embedded} embed candidates, ${links} tour links; identity/URL/expiry/host guards`);
