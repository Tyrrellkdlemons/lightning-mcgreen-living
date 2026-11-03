"""Integrate reviewed audit ledgers; no network requests. Run from repository root."""
import json, hashlib, collections
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path.cwd()
def read(path): return json.loads(Path(path).read_text(encoding='utf-8'))
def write(path, value):
 p=Path(path); old=p.read_bytes() if p.exists() else None
 text=json.dumps(value,ensure_ascii=False,indent=2)+'\n' if not isinstance(value,str) else value
 stage=p.with_name(p.name+'.stage'); stage.write_bytes(text.encode('utf-8'))
 assert (p.read_bytes() if p.exists() else None)==old, 'Concurrent edit: '+str(p)
 stage.replace(p)
contract=read('.revamp-evidence/full-audit-root/contract.json')
rows=read('.revamp-evidence/full-audit-properties/property-audit.json')+read('.revamp-evidence/full-audit-services/services-audit.json')
assert len(rows)==203 and len({r['id'] for r in rows})==203
assert {r['id'] for r in rows}==set(contract['remaining_source_ids'])
overrides=Path('.revamp-evidence/full-audit-root/audit-overrides.json')
if overrides.exists():
 patch=read(overrides)
 for r in rows:
  if r['id'] in patch:r.update(patch[r['id']])
catalog=read('src/lib/resources/catalog.json'); sources={s['id']:s for s in catalog['sources']}
for r in rows:
 assert r['outcome'] in ['content-inspected','unavailable','blocked','mismatch']
 assert sources[r['id']]['url']==r['originalUrl']
 assert r['summary'] and r['checkedAt'] and len(r['evidenceExcerpt'].split())<=25
 s=sources[r['id']]
 method=r.get('retrievalMethod','direct-http')
 summary=r['summary'].replace('outbound link should be disabled','outbound link disabled')
 if method=='web-tool-cached-content':summary+=' Cached public page inspected; current freshness is unknown.'
 s['review']={k:r[k] for k in ['checkedAt','outcome','finalUrl','httpStatus','reason','inspectedSections']}
 s['review'].update(summary=summary,retrievalMethod=method)
 s['linkCheckedAt']=r['checkedAt']
 if isinstance(r.get('httpStatus'),int):s['linkStatus']=r['httpStatus']
 else:s.pop('linkStatus',None)
 s['inspection']='content-inspected' if r['outcome']=='content-inspected' else 'metadata-reviewed'
 s['retrievalScope']='page-content' if s['inspection']=='content-inspected' else 'directory-metadata'
 if s['inspection']=='content-inspected':
  s['pageRetrievedAt']=r.get('reviewedAt',r['checkedAt']);s['contentInspectionMethod']=method+'; '+('; '.join(r['inspectedSections']))
  s['description']=r.get('suggestedDescription') or r['summary']
  if r.get('suggestedTitle'):s['title']=r['suggestedTitle']
  if r.get('confirmedName'):s['title']=r['confirmedName']
  if r.get('suggestedCategory'):s['category']=r['suggestedCategory']
 else:
  s.pop('pageRetrievedAt',None);s.pop('contentInspectionMethod',None)
 if r['outcome']=='mismatch':
  s['outboundDisabled']=True;s['description']=summary
 else:s.pop('outboundDisabled',None)
evidence=read('src/lib/property-evidence/records.json')
for record in evidence['records']:
 for key in record['propertyIds']:
  if key in sources and record['availability']['status']=='unit-observations':sources[key]['propertyObservation']={'unitSamples':len(record['availability'].get('units',[])),'observedAt':record['availability']['observedAt']}
counts=dict(collections.Counter(r['outcome'] for r in rows)); now=datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
catalog['generatedAt']=now
summary=catalog['summary'];summary['contentInspected']=sum(s['inspection']=='content-inspected' for s in catalog['sources']);summary['metadataOnly']=len(catalog['sources'])-summary['contentInspected'];summary['linkChecked']=sum(bool(s.get('linkCheckedAt')) for s in catalog['sources']);summary['linkSuccessful']=sum(200<=s.get('linkStatus',0)<400 for s in catalog['sources']);summary.pop('successfulLinkChecks',None);summary['auditAttempted']=203;summary['auditContentInspected']=counts.get('content-inspected',0);summary['auditNeedsAttention']=203-summary['auditContentInspected']
public=[]
for r in rows:
 fields=['id','originalUrl','finalUrl','checkedAt','outcome','httpStatus','title','summary','evidenceExcerpt','inspectedSections','reason','provenanceUrls','confirmedName','confirmedAddress','identityBasis','responseDate','cacheAge','bodySha256','retrievalMethod','reviewedAt','limitations','responseSha256']
 entry={k:r[k] for k in fields if k in r};entry.setdefault('retrievalMethod','direct-http');public.append(entry)
audit={'schemaVersion':1,'baseRevision':contract['base_revision'],'baseCatalogSha256':'e521125d15f978ad767b1ccde864c9e0f00a479bbe1483df7e53eb8b389a4033','generatedAt':now,'summary':{'attempted':203,**counts,'cachedFallbacks':sum(r.get('retrievalMethod')=='web-tool-cached-content' for r in rows)},'records':public}
write('src/lib/resources/source-audit.json',audit);write('src/lib/resources/catalog.json',catalog)
doc=f"# Source audit — November 3, 2026\n\nAll 203 previously metadata-only source records were attempted: {counts}. {audit['summary']['cachedFallbacks']} inspected service records used explicitly labeled cached public pages; they are not fresh provider observations. All 139 property homepages returned substantive content. The catalog now contains {summary['contentInspected']} content-inspected records out of 232, with {summary['metadataOnly']} records needing further confirmation. Counts describe URL records, not independently unique organizations or live offers.\n\nThe machine-readable ledger is `src/lib/resources/source-audit.json`; each record includes URL, observation date, inspected sections, a short evidence excerpt, method and limits. The frozen base revision is `{contract['base_revision']}`.\n\nTwo mismatched destinations have disabled outbound links and are excluded from assistant retrieval. Access restrictions, construction pages, missing content and failed requests remain explicit. HTTP 200 alone is not an inspection pass.\n\nProperty identity uses the operator-published name and address. Marketing text, galleries and starting rents do not prove a vacancy, exact-unit photographs, approval or funding. Availability observations retain their source and timestamp, selected-unit scope and 48-hour historical-state rule. Photos remain attributed publisher references; no image license is inferred from availability on the web.\n"
write('docs/SOURCE_AUDIT_2026-11-03.md',doc)
print(json.dumps({'audit':audit['summary'],'catalog':summary},indent=2))
