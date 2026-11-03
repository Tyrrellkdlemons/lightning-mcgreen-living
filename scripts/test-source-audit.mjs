import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { buildKnowledge } from '../src/lib/assistant/knowledge.mjs';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript');}catch{ts=require('C:/Users/TKDL/AppData/Roaming/npm/node_modules/typescript/lib/typescript.js');}
const catalog=JSON.parse(fs.readFileSync('src/lib/resources/catalog.json','utf8'));
const audit=JSON.parse(fs.readFileSync('src/lib/resources/source-audit.json','utf8'));
assert.equal(audit.records.length,203);assert.equal(new Set(audit.records.map(r=>r.id)).size,203);
assert.equal(audit.summary.attempted,203);
assert.equal(createHash('sha256').update(audit.records.map(r=>r.id).sort().join('\n')).digest('hex'),'58093a57e98c35c91ee28488c0752adfa8ed352e2eac6a7faa8639bb963d59d8','Exact frozen baseline source IDs');
const counts={};
for(const r of audit.records){
 counts[r.outcome]=(counts[r.outcome]??0)+1;
 const source=catalog.sources.find(s=>s.id===r.id);assert(source);assert.equal(source.url,r.originalUrl);
 assert.equal(source.review.outcome,r.outcome);
 assert.equal(typeof source.review.checkedAt,'string');assert(Number.isFinite(Date.parse(source.review.checkedAt)));
 assert(Array.isArray(source.review.inspectedSections));assert(source.review.inspectedSections.every(s=>typeof s==='string'));
 assert.equal(typeof source.review.summary,'string');assert(source.review.summary.length>0);
 assert(['content-inspected','blocked','unavailable','mismatch'].includes(r.outcome));
 assert(r.evidenceExcerpt.split(/\s+/).filter(Boolean).length<=25);
 if(r.outcome==='content-inspected')assert(source.contentInspectionMethod);
 else assert.equal(source.inspection,'metadata-reviewed');
 if(r.outcome==='mismatch')assert.equal(source.outboundDisabled,true);
 if(r.retrievalMethod==='web-tool-cached-content')assert.match(source.review.summary,/Cached public page/);
}
for(const [key,count] of Object.entries(counts))assert.equal(audit.summary[key],count);
assert.equal(catalog.summary.auditContentInspected,counts['content-inspected']);
assert.equal(catalog.summary.auditNeedsAttention,203-counts['content-inspected']);
const module={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/resources/index.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{module,exports:module.exports,require:()=>catalog});
const disabled=module.exports.resourceOutboundDisabled;
for(const item of [{review:{outcome:'mismatch'}},{outboundDisabled:false,review:{outcome:'mismatch'}},{outboundDisabled:true}])assert.equal(disabled(item),true);
assert.equal(disabled({review:{outcome:'content-inspected'}}),false);
const knowledge=buildKnowledge(catalog,[]);
for(const r of audit.records.filter(r=>r.outcome==='mismatch'))assert(!knowledge.sources.some(s=>s.id===r.id));
console.log(`PASS: all203 frozen audit records reconcile; typed review metadata, cached limits, counts, mismatch exclusion and guard variants.`);
