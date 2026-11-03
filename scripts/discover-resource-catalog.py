"""Bounded public-directory discovery. Acquire exact coordination scopes before --refresh --write.
Use --validate for read-only checks. No property crawl, credentials or browser access.
"""
import argparse,datetime,hashlib,html,json,os,pathlib,re,subprocess,urllib.request,urllib.parse,uuid
ROOT=pathlib.Path(__file__).resolve().parents[1]
CAT=ROOT/'src/lib/resources/catalog.json'
EV=ROOT/'.revamp-evidence/research-v2'
BASE='5eb2e395e316a9ca69f92bf06e7fdea219615039'
REVIEWED='2026-11-03T12:53:10Z'
GEMINI_REVIEWED='2026-11-03T12:58:50Z'
GEMINI_SUGGESTED=["https://www.treasurer.ca.gov/ctcac/projects","https://www.hud.gov/sites/dfiles/PIH/documents/PHA_Contact_Report_CA.pdf","https://www.hud.gov/sites/dfiles/PIH/documents/PHA_Contact_Report_AZ.pdf","https://www.lahsa.org/get-help","https://housingsearch.az.gov/","https://rdmfhrentals.sc.egov.usda.gov/RDMFHRentals/about_mfh.jsp"]
AUDIT_REVIEWED='2026-11-03T13:12:47Z'
AUDIT_CURATED=[['https://www.kcsinc.org/community-services/', 'Korean Community Services community support', 'Korean Community Services', 'CA', 'benefits', 'Orange County assistance with public-benefit enrollment, forms and connections to community resources.', 'https://www.kcsinc.org/kcs-locations/', 'Buena Park'], ['https://calhfa.ca.gov/community/nms/resources.htm', 'California housing counseling directory', 'California Housing Finance Agency', 'CA', 'directory', 'State directory of housing counseling agencies, searchable by city or language. Confirm current services directly.', 'https://calhfa.ca.gov/'], ['https://www.nationalcapacd.org/housing-counseling/', 'National CAPACD housing counseling network', 'National CAPACD', 'Federal', 'directory', 'National nonprofit housing counseling network with California member agencies serving renters and homeowners.', 'https://www.nationalcapacd.org/'], ['https://www.mark-taylor.com/apartments/az/phoenix/n-black-canyon-hwy/', 'Banyan at 17 North', 'Mark-Taylor', 'AZ', 'property', 'Official property source listed by Mark-Taylor. Confirm current details with the operator; no price or vacancy is asserted.', 'https://www.mark-taylor.com/', 'Phoenix'], ['https://www.mark-taylor.com/apartments/az/phoenix/n-central-ave/', 'Blume on Central', 'Mark-Taylor', 'AZ', 'property', 'Official property source listed by Mark-Taylor. Confirm current details with the operator; no price or vacancy is asserted.', 'https://www.mark-taylor.com/', 'Phoenix'], ['https://www.mark-taylor.com/apartments/az/mesa/n-robson-rd-forge-tower/', 'Forge Tower', 'Mark-Taylor', 'AZ', 'property', 'Official property source listed by Mark-Taylor. Confirm current details with the operator; no price or vacancy is asserted.', 'https://www.mark-taylor.com/', 'Mesa'], ['https://www.mark-taylor.com/apartments/az/glendale/sentio/', 'Sentio', 'Mark-Taylor', 'AZ', 'property', 'Official property source listed by Mark-Taylor. Confirm current details with the operator; no price or vacancy is asserted.', 'https://www.mark-taylor.com/', 'Glendale'], ['https://www.mark-taylor.com/apartments/az/peoria/w-olive-ave/', 'Bella Olivia', 'Mark-Taylor', 'AZ', 'property', 'Official property source listed by Mark-Taylor. Confirm current details with the operator; no price or vacancy is asserted.', 'https://www.mark-taylor.com/', 'Peoria']]
RESERVED_SLUGS={'pet-friendly','amenities','floor-plans','photos','contact','neighborhood','virtual-tour'}
MARK='https://www.mark-taylor.com/'
HUD='https://data.hud.gov/Housing_Counselor/search?AgencyName=&City=&State='
CURATED=[["https://www.hud.gov/states/california","HUD California housing resources","HUD","CA","directory","Federal housing and homelessness referral guide.","https://www.hud.gov/contactus/local"],["https://www.hud.gov/states/arizona","HUD Arizona housing resources","HUD","AZ","directory","Federal housing and homelessness referral guide.","https://www.hud.gov/contactus/local"],["https://homelessness.acgov.org/homelessness-assets/docs/coordinated-entry/ACH_Coordinated-Entry-Workflow_011924.pdf","Alameda County coordinated entry workflow","Alameda County","CA","shelter","County guide to housing assessment and referral pathways; placement is not guaranteed.","https://www.hud.gov/states/california"],["https://azlawhelp.org/","AZLawHelp legal assistance","Arizona Bar Foundation","AZ","legal","Directory and application guidance for free or reduced-fee legal help.","https://www.hud.gov/states/arizona"],["https://azcourthelp.org/","Arizona court self-help resources","AZCourtHelp","AZ","legal","Court forms, process information and legal-aid links, including an eviction portal.","https://azlawhelp.org/"],["https://des.az.gov/CommunityActionAgencies","Arizona Community Action Agencies","Arizona Department of Economic Security","AZ","directory","County-based community assistance contacts. Confirm current services with the agency.","https://des.az.gov/ARAP"],["https://des.az.gov/services/basic-needs/shelter-housing/short-term-crisis-services","Arizona Short-Term Crisis Services","Arizona Department of Economic Security","AZ","benefits","Program information and agency referrals for eligible families facing an immediate financial crisis. Funding is not guaranteed.","https://des.az.gov/ARAP"],["https://www.pima.gov/rent-utility-assistance","Pima County rent and utility assistance","Pima County","AZ","benefits","County referrals for rent, mortgage and utility assistance; funding and eligibility vary.","https://www.hud.gov/states/arizona"],["https://www.csd.ca.gov/Pages/FindServicesInYourArea.aspx","California community service providers","California Department of Community Services and Development","CA","benefits","State locator for local community-service providers by city or county.","https://www.hud.gov/states/california"],["https://chworks.org/communities/","Community HousingWorks communities","Community HousingWorks","CA","directory","Nonprofit community directory with California regions and a separate Texas section. Confirm each property's location.","https://chworks.org/"],["https://chworks.org/property/stadium-village-apartments/","Stadium Village Apartments","Community HousingWorks","CA","property","Official Inglewood community overview; check current application details with the operator.","https://chworks.org/property/","Inglewood"],["https://chworks.org/property/salvator-apartments/","Salvator Apartments","Community HousingWorks","CA","property","Official Sacramento community overview; confirm current details with the operator.","https://chworks.org/property/","Sacramento"],["https://chworks.org/property/fallbrook-view/","Fallbrook View","Community HousingWorks","CA","property","Official community overview. Its page reported a closed waitlist when inspected; confirm changes with the operator.","https://chworks.org/property/","Fallbrook"],["https://chworks.org/property/1523-harrison-apartments/","1523 Harrison Apartments development","Community HousingWorks","CA","property","Official Oakland development page; this is a future project, not apartments asserted available now.","https://chworks.org/property/","Oakland"],["https://www.mark-taylor.com/apartments/az/scottsdale/bellagio/","Bellagio","Mark-Taylor","AZ","property","Official Scottsdale community page. No price or vacancy is asserted in this catalog.","https://www.mark-taylor.com/","Scottsdale"],["https://www.treasurer.ca.gov/ctcac/projects","California tax-credit housing project map","California State Treasurer","CA","directory","State map and project data for tax-credit housing. Some projects are under construction; the list does not establish current vacancies.","https://www.treasurer.ca.gov/ctcac"],["https://www.hud.gov/sites/dfiles/PIH/documents/PHA_Contact_Report_CA.pdf","California public housing authority contacts","HUD","CA","directory","HUD contact directory organized by California city. Contact the authority for current programs and application information.","https://www.hud.gov/states/california"],["https://www.hud.gov/sites/dfiles/PIH/documents/PHA_Contact_Report_AZ.pdf","Arizona public housing authority contacts","HUD","AZ","directory","HUD contact directory organized by Arizona city. Contact the authority for current programs and application information.","https://www.hud.gov/states/arizona"],["https://www.lahsa.org/get-help","Los Angeles County homelessness help","Los Angeles Homeless Services Authority","CA","shelter","County guidance for coordinated entry access, outreach requests and housing crisis referrals.","https://www.lahsa.org/"],["https://housingsearch.az.gov/","Arizona rental housing search","HousingSearch.AZ.gov","AZ","directory","Arizona rental locator covering market-rate, affordable and accessible housing. Confirm listing details with each property.","https://housing.az.gov/"],["https://rdmfhrentals.sc.egov.usda.gov/RDMFHRentals/about_mfh.jsp","USDA rural multifamily rental housing","USDA Rural Development","Federal","housing","Federal overview of rural apartment and labor housing programs and rental assistance. Eligibility and property details require direct confirmation.","https://www.rd.usda.gov/"]]

def now():return datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')

def norm(raw):
    if not isinstance(raw,str):return None
    value=html.unescape(raw).strip().rstrip('.,;')
    try:
        p=urllib.parse.urlsplit(value);host=(p.hostname or '').lower()
        if host=='notavailable.org' or host.endswith('.notavailable.org'):return None
        if p.scheme not in ('http','https') or p.username or p.password:return None
        if not re.fullmatch(r'(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}',host):return None
        if any(c.isspace() for c in value) or host.endswith(('.invalid','.example')):return None
        # Conservative identity: query/scheme/www/fragment/slash variants never inflate counts.
        return value,re.sub(r'^www\.','',host)+p.path.rstrip('/')
    except ValueError:return None

def atomic(path,value,before):
    if path.exists():
        if before is None or hashlib.sha256(path.read_bytes()).hexdigest()!=before:raise RuntimeError('Output changed: '+str(path))
    elif before is not None:raise RuntimeError('Output disappeared')
    path.parent.mkdir(parents=True,exist_ok=True)
    tmp=path.with_name(path.name+'.'+uuid.uuid4().hex+'.tmp')
    tmp.write_bytes((json.dumps(value,indent=2,ensure_ascii=False)+'\n').encode())
    if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest()!=before:
        tmp.unlink();raise RuntimeError('Concurrent output change')
    os.replace(tmp,path)

def fetch(url,receipts):
    at=now()
    req=urllib.request.Request(url,headers={'User-Agent':'Lightning-McGreen-Resource-Research/1.0'})
    with urllib.request.urlopen(req,timeout=15) as r:
        body=r.read(2500001)
        if len(body)>2500000:raise ValueError('Response size cap exceeded')
        receipts.append({'url':url,'finalUrl':r.url,'status':r.status,'retrievedAt':at,'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest()})
        return body.decode('utf-8','replace')

def baseline():
    r=subprocess.run(['git','grep','-I','-h','-E','https?://',BASE,'--','src','docs'],cwd=ROOT,capture_output=True,text=True)
    if r.returncode not in (0,1):raise RuntimeError(r.stderr)
    urls=re.findall(r'https?://[^\s<>"\x27\x60\\)]+',r.stdout)
    return sorted({norm(u)[1] for u in urls if norm(u)})

def collect():
    receipts=[];rows=[];rejected=[];snapshot={}
    text=html.unescape(fetch(MARK,receipts))
    paths=sorted({x.rstrip('/') for x in re.findall(r'/apartments/(?:az|ca)/[a-z0-9-]+/[a-z0-9-]+/?',text)})
    if not paths:raise ValueError('Directory format changed: no property paths')
    snapshot['markTaylorPaths']=paths;directory_records=len(paths)
    for path in paths:
        if path.endswith('/phoenix/sentio'):path='/apartments/az/glendale/sentio'
        _,_,state,city,name=path.split('/')
        if name in RESERVED_SLUGS:
            rejected.append({'parent':MARK,'path':path,'reason':'reserved non-property path'});continue
        rows.append({'title':name.replace('-',' ').title(),'url':MARK.rstrip('/')+path+'/','publisher':'Mark-Taylor','state':state.upper(),'city':city.replace('-',' ').title(),'category':'property','kind':'property-provider',
          'description':'Official property source listed by Mark-Taylor. Confirm current details with the operator; no price or vacancy is asserted.',
          'discoveredFrom':MARK,'retrievedAt':receipts[0]['retrievedAt'],'inspection':'metadata-reviewed','retrievalScope':'directory-metadata','titleBasis':'published URL path','locationBasis':'published URL path'})
    for state in ('CA','AZ'):
        endpoint=HUD+state;agencies=json.loads(fetch(endpoint,receipts))
        if not isinstance(agencies,list):raise ValueError('Unexpected HUD response')
        directory_records+=len(agencies)
        snapshot[state]=[{k:a.get(k) for k in ('agcid','nme','statecd','city','weburl','agc_STATUS')} for a in agencies]
        for agency in agencies:
            raw=agency.get('weburl')
            if agency.get('statecd')!=state or not norm(raw):
                rejected.append({'parent':endpoint,'agencyId':agency.get('agcid'),'reason':'missing/invalid public URL or state mismatch'});continue
            title=str(agency.get('nme') or 'Agency '+str(agency.get('agcid'))).strip()
            rows.append({'title':title,'url':raw.strip(),'publisher':title,'state':state,'city':str(agency.get('city') or '').strip(),'category':'housing','kind':'housing-counseling-organization',
              'description':"Agency website reported in HUD's "+state+' counseling directory. Confirm current services and eligibility directly; current approval is not independently verified.',
              'discoveredFrom':endpoint,'retrievedAt':receipts[-1]['retrievedAt'],'inspection':'metadata-reviewed','retrievalScope':'directory-metadata',
              'directoryAgencyIds':[str(agency.get('agcid'))],'directoryStatusCodes':[str(agency.get('agc_STATUS'))]})
    for seed in CURATED+AUDIT_CURATED:
        url,title,publisher,state,category,description,parent,*city=seed
        row={'url':url,'title':title,'publisher':publisher,'state':state,'category':category,'description':description,'discoveredFrom':parent,'retrievedAt':REVIEWED,'inspection':'content-inspected','retrievalScope':'page-content','pageRetrievedAt':REVIEWED,'contentInspectionMethod':'public web tool; relevant sections read','kind':'official-resource'}
        if city:row['city']=city[0]
        if url in GEMINI_SUGGESTED:
            row.update(retrievedAt=GEMINI_REVIEWED,pageRetrievedAt=GEMINI_REVIEWED,discoveryContribution='Gemini Argon candidate; independently content-inspected by research worker')
        if seed in AUDIT_CURATED:
            row.update(retrievedAt=AUDIT_REVIEWED,pageRetrievedAt=AUDIT_REVIEWED,contentInspectionMethod='Independent research worker official-page correction audit')
            if category=='property':row['titleBasis']='official page heading'
            if 'kcsinc.org/community' in url:row['directoryAgencyIds']=['90768']
        rows.append(row)
    return rows,receipts,rejected,directory_records,snapshot

def merge(rows,old):
    unique={}
    for row in rows:
        url,key=norm(row['url']);row=dict(row,url=url)
        if key not in unique:unique[key]=row;continue
        previous=unique[key]
        states={previous['state'],row['state']}
        if states=={'CA','AZ'} or 'CA/AZ' in states:previous['state']='CA/AZ'
        if previous.get('city')!=row.get('city'):previous.pop('city',None)
        for field in ('directoryAgencyIds','directoryStatusCodes'):
            if field in row:previous[field]=sorted(set(previous.get(field,[])+row[field]))
        if row['inspection']=='content-inspected':row['state']=previous['state'];unique[key]=row
    excluded=[k for k in unique if k in old];included=[]
    for key,row in unique.items():
        if key not in old:
            row['id']='resource-'+hashlib.sha256(key.encode()).hexdigest()[:16];included.append(row)
    return sorted(included,key=lambda x:(x['category']=='property',x['state'],x['title'].lower())),len(unique),excluded

def validate(c):
    sources=c['sources'];s=c['summary']
    assert c['schemaVersion']==1 and len(sources)>=200 and s['included']==len(sources)
    keys=[];ids=[]
    for r in sources:
        assert r['state'] in {'CA','AZ','CA/AZ','Federal'}
        assert r['category'] in {'housing','shelter','legal','benefits','property','transport','directory'}
        assert r['inspection'] in {'metadata-reviewed','content-inspected'}
        assert all(isinstance(r.get(k),str) and r[k] for k in ('id','title','url','publisher','description','discoveredFrom','retrievedAt'))
        assert norm(r['url']) and norm(r['discoveredFrom'])
        if r['inspection']=='metadata-reviewed':assert r['retrievalScope']=='directory-metadata' and 'pageRetrievedAt' not in r
        else:assert r.get('pageRetrievedAt')
        keys.append(norm(r['url'])[1]);ids.append(r['id'])
    assert len(set(keys))==len(keys) and len(set(ids))==len(ids)
    assert not set(keys).intersection(baseline())
    assert s['contentInspected']==sum(r['inspection']=='content-inspected' for r in sources)
    return {'result':'PASS','additionalUnique':len(keys),'contentInspected':s['contentInspected']}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--refresh',action='store_true');p.add_argument('--write',action='store_true');p.add_argument('--validate',action='store_true');p.add_argument('--probe-limit',type=int,default=0)
    args=p.parse_args()
    if args.validate:print(json.dumps(validate(json.loads(CAT.read_text(encoding='utf-8')))));return
    if not(args.refresh and args.write):p.error('Use --validate or explicit --refresh --write')
    if not 0<=args.probe_limit<=12:p.error('probe-limit must be 0..12')
    outputs=[CAT,EV/'capture.json',EV/'baseline.json']
    before={x:hashlib.sha256(x.read_bytes()).hexdigest() if x.exists() else None for x in outputs}
    rows,receipts,rejected,records,snapshot=collect()
    old=baseline();sources,dedup,excluded=merge(rows,set(old));probes=[]
    for row in [r for r in sources if r['inspection']=='content-inspected'][:args.probe_limit]:
        at=now()
        try:
            req=urllib.request.Request(row['url'],method='HEAD',headers={'User-Agent':'Lightning-McGreen-Resource-Research/1.0'})
            with urllib.request.urlopen(req,timeout=10) as response:status=response.status
        except Exception as e:status=getattr(e,'code',None)
        probes.append({'url':row['url'],'checkedAt':at,'status':status})
        if isinstance(status,int):row['linkStatus']=status
        row['linkCheckedAt']=at
    summary={'discovered':len(rows),'deduplicated':dedup,'screened':dedup,'included':len(sources),'additionalUnique':len(sources),'baselineUniqueUrls':len(old),'existingExcluded':len(excluded),'directoryRecords':records,'rejectedDirectoryRecords':len(rejected),'contentInspected':sum(r['inspection']=='content-inspected' for r in sources),'metadataOnly':sum(r['inspection']=='metadata-reviewed' for r in sources),'linkChecked':len(probes),'linkSuccessful':sum(x['status'] is not None and 200<=x['status']<400 for x in probes),'publisherCount':len({r['publisher'] for r in sources}),'countsMeaning':'Distinct source URLs, not independent publications or available homes. Directory metadata retrieval is not a destination-page visit.'}
    catalog={'schemaVersion':1,'generatedAt':now(),'baselineRevision':BASE,'summary':summary,'sources':sources}
    result=validate(catalog)
    capture={'generatedAt':catalog['generatedAt'],'receipts':receipts,'snapshot':snapshot,'rejected':rejected,'existingExcluded':excluded,'probes':probes}
    for path,value in [(CAT,catalog),(EV/'capture.json',capture),(EV/'baseline.json',{'revision':BASE,'canonicalUrls':old})]:atomic(path,value,before[path])
    print(json.dumps({'validation':result,'summary':summary,'sha256':hashlib.sha256(CAT.read_bytes()).hexdigest()}))
if __name__=='__main__':main()
