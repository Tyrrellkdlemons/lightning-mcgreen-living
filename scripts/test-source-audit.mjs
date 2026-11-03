import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { isDeepStrictEqual } from 'node:util';
import { buildKnowledge } from '../src/lib/assistant/knowledge.mjs';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript');}catch{ts=require('C:/Users/TKDL/AppData/Roaming/npm/node_modules/typescript/lib/typescript.js');}
const catalog=JSON.parse(fs.readFileSync('src/lib/resources/catalog.json','utf8'));
const auditText=fs.readFileSync('src/lib/resources/source-audit.json','utf8');
const audit=JSON.parse(auditText);
const recovery=JSON.parse(fs.readFileSync('src/lib/resources/source-recovery.json','utf8'));
// The first audit is an immutable historical snapshot; later recovery is additive.
assert.equal(createHash('sha256').update(auditText.replace(/\r\n/g,'\n')).digest('hex'),'2f126150e1d526b8bb41880df3691db812c1f46707c8fb3773f61760d15d971b','Historical audit snapshot remains unchanged');
assert.equal(audit.records.length,203);assert.equal(new Set(audit.records.map(r=>r.id)).size,203);
assert.equal(audit.summary.attempted,203);
assert.equal(createHash('sha256').update(audit.records.map(r=>r.id).sort().join('\n')).digest('hex'),'58093a57e98c35c91ee28488c0752adfa8ed352e2eac6a7faa8639bb963d59d8','Exact frozen baseline source IDs');
assert.equal(recovery.records.length,12);assert.equal(new Set(recovery.records.map(r=>r.id)).size,12);
const byRecovery=new Map(recovery.records.map(r=>[r.id,r]));
assert.deepEqual([...byRecovery.keys()].sort(),audit.records.filter(r=>r.outcome!=='content-inspected').map(r=>r.id).sort(),'Recovery targets exactly the12 original gaps');
const historicalCounts={},currentCounts={};
const date=value=>assert(typeof value==='string'&&Number.isFinite(Date.parse(value)),'Valid evidence timestamp');
for(const r of audit.records){
 historicalCounts[r.outcome]=(historicalCounts[r.outcome]??0)+1;
 const source=catalog.sources.find(s=>s.id===r.id);assert(source);
 const followup=byRecovery.get(r.id);
 assert.equal(source.originalUrl??source.url,r.originalUrl,'Original audited URL retained');
 const current=followup??r;
 assert.equal(source.url,followup?.newUrl??r.originalUrl,'Only the authenticated recovery URL can replace the original');
 assert.equal(source.review.outcome,current.outcome);
 currentCounts[current.outcome]=(currentCounts[current.outcome]??0)+1;
 date(source.review.checkedAt);
 assert(Array.isArray(source.review.inspectedSections));assert(source.review.inspectedSections.every(s=>typeof s==='string'));
 assert.equal(typeof source.review.summary,'string');assert(source.review.summary.length>0);
 assert(['content-inspected','blocked','unavailable','mismatch'].includes(r.outcome));
 assert(r.evidenceExcerpt.split(/\s+/).filter(Boolean).length<=25);
 if(current.outcome==='content-inspected')assert(source.contentInspectionMethod);
 else assert.equal(source.inspection,'metadata-reviewed');
 if(current.outcome==='mismatch')assert.equal(source.outboundDisabled,true);
 if(!followup&&r.retrievalMethod==='web-tool-cached-content')assert.match(source.review.summary,/Cached public page/);
 if(followup){
  assert.equal(followup.originalUrl,r.originalUrl);
  assert.equal(followup.originalOutcome,r.outcome);
  assert.equal(followup.originalReview.outcome,r.outcome);
  assert.equal(source.originalUrl,r.originalUrl);
  assert(source.reviewHistory.some(old=>isDeepStrictEqual(old,followup.originalReview)),'Prior review retained without rewriting: '+r.id);
  assert.equal(source.review.retrievalMethod,followup.method);
  assert.deepEqual(source.review.inspectedSections,followup.inspectedSections);
  assert.equal(source.review.checkedAt,followup.webToolInspectedAt??followup.checkedAt);
  assert(source.review.summary.includes(followup.summary));
  assert(followup.evidenceExcerpt.split(/\s+/).filter(Boolean).length<=25);
  if(followup.outcome==='content-inspected'){
   assert(followup.newUrl&&followup.provenanceUrls.includes(followup.newUrl),'Replacement has inspected provenance');
   assert.equal(source.inspection,'content-inspected');
   assert.equal(source.outboundDisabled,false);
  }else{
   assert.equal(followup.newUrl,null,'Alternatives do not replace an unresolved provider');
   assert.deepEqual(source.relatedOfficialResources,followup.relatedOfficialResources);
   assert(source.relatedOfficialResources.length>0,'Unresolved source offers a corroborated official alternative');
  }
  if(followup.method==='web-open-cached-fallback'){
   assert.equal(followup.freshProviderSnapshot,false);
   assert(followup.webToolCrawlLabel&&followup.webToolInspectedAt&&followup.directReceipt);
   assert.match(source.review.summary,/crawl|origin freshness|origin fetch/i,'Cached origin limits remain visible');
   assert.equal(source.review.httpStatus,null,'Cached fallback does not manufacture a successful direct HTTP status');
  }
 }
}
for(const [key,count] of Object.entries(historicalCounts))assert.equal(audit.summary[key],count);
assert.equal(catalog.summary.auditAttempted,203);
assert.equal(catalog.summary.auditContentInspected,currentCounts['content-inspected']);
assert.equal(catalog.summary.auditNeedsAttention,203-currentCounts['content-inspected']);
assert.equal(currentCounts['content-inspected'],200);
assert.equal(catalog.summary.contentInspected,229);assert.equal(catalog.summary.metadataOnly,3);
assert.equal(recovery.summary.providerContentRecovered,9);assert.equal(recovery.summary.originalProviderStillUnresolved,3);
assert.equal(catalog.summary.recoveryContentInspected,recovery.records.filter(r=>r.outcome==='content-inspected').length);
assert.equal(recovery.records.filter(r=>r.method==='web-open-cached-fallback').length,5);
const module={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/resources/index.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:()=>catalog});
const disabled=module.exports.resourceOutboundDisabled;
for(const item of [{review:{outcome:'mismatch'}},{outboundDisabled:false,review:{outcome:'mismatch'}},{outboundDisabled:true}])assert.equal(disabled(item),true);
assert.equal(disabled({review:{outcome:'content-inspected'}}),false);
const knowledge=buildKnowledge(catalog,[]);
const urlKey=value=>{const u=new URL(value);return u.hostname.replace(/^www\./,'')+u.pathname.replace(/\/$/,'');};
const unsafeHistoricalUrls=new Set(audit.records.filter(r=>r.outcome==='mismatch').flatMap(r=>[r.originalUrl,r.finalUrl]).map(urlKey));
for(const s of catalog.sources)if(!disabled(s))assert(!unsafeHistoricalUrls.has(urlKey(s.url)),'Unsafe historical destination cannot be re-enabled');
for(const s of knowledge.sources)assert(!unsafeHistoricalUrls.has(urlKey(s.url)),'Assistant never cites an old mismatched destination');
for(const r of audit.records.filter(r=>r.outcome==='mismatch')){
 const newer=byRecovery.get(r.id),source=catalog.sources.find(s=>s.id===r.id);
 if(newer?.outcome==='content-inspected'){
  assert.equal(disabled(source),false,'Corroborated replacement is enabled');
  assert(knowledge.sources.some(s=>s.id===r.id&&s.url===newer.newUrl),'Assistant uses the new inspected URL');
 }else assert(!knowledge.sources.some(s=>s.id===r.id));
}
console.log('PASS: exact203 immutable audit;12 additive recovery records;200 current audit successes plus3 gaps; prior reviews/cache limits and unsafe-link exclusion.');
