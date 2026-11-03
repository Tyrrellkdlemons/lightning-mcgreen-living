const STATE_CODES = new Set(['CA', 'AZ', 'CA/AZ', 'Federal']);
const clean = (value, limit = 600) => typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, limit) : '';
const tokens = value => clean(value, 2000).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(t => t.length > 2 && !['the', 'and', 'for', 'with', 'can', 'how', 'what', 'where', 'need', 'help', 'find'].includes(t));
// These existing source URLs describe statewide/federal referral directories.
// Missing location fields alone NEVER establish broad coverage.
const BROAD_REFERRALS = new Set([
  'www.hud.gov/states/california', 'www.hud.gov/states/arizona', 'azlawhelp.org/', 'azcourthelp.org/',
  'des.az.gov/CommunityActionAgencies', 'des.az.gov/services/basic-needs/shelter-housing/short-term-crisis-services',
  'www.csd.ca.gov/Pages/FindServicesInYourArea.aspx', 'housingsearch.az.gov/',
  'calhfa.ca.gov/community/nms/resources.htm', 'www.treasurer.ca.gov/ctcac/projects',
  'www.hud.gov/sites/dfiles/PIH/documents/PHA_Contact_Report_CA.pdf', 'www.hud.gov/sites/dfiles/PIH/documents/PHA_Contact_Report_AZ.pdf',
  'rdmfhrentals.sc.egov.usda.gov/RDMFHRentals/about_mfh.jsp', 'www.nationalcapacd.org/housing-counseling/', 'chworks.org/communities/',
]);
export function safePublicUrl(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password && u.hostname.includes('.') ? u.href : null; } catch { return null; }
}
function broadReferral(url) { const u = new URL(url); return BROAD_REFERRALS.has(u.hostname + u.pathname); }
export function buildKnowledge(catalog, workbook, places = []) {
  const locations = [...places.map(p => ({ city: p.name, state: p.state, county: p.county })), ...workbook.map(w => ({ city: w.city, state: 'CA', county: w.county }))].filter(p => p.city && p.county);
  const countyNames = [...new Set(locations.flatMap(p => p.county.split(' / ')))];
  const sources = (catalog.sources ?? []).filter(s => /^[a-z0-9-]+$/.test(s.id) && STATE_CODES.has(s.state) && safePublicUrl(s.url)).map(s => {
    const geography = `${s.title} ${s.description} ${s.publisher}`.toLowerCase();
    const county = clean(s.county, 80) || countyNames.filter(c => geography.includes(c.toLowerCase() + ' county')).join(' / ');
    return { id: s.id, title: clean(s.title, 180), url: safePublicUrl(s.url), detailUrl: `/resources/${s.id}`,
      state: s.state, city: clean(s.city, 80), county, category: clean(s.category, 30), broad: broadReferral(s.url),
      description: clean(s.description), date: clean(s.pageRetrievedAt || s.retrievedAt, 10),
      evidence: s.inspection === 'content-inspected' ? 'Page content inspected on the recorded date' : 'Directory metadata only; destination content not inspected' };
  });
  for (const w of workbook) {
    if (!/^wb-[a-z0-9-]+$/.test(w.id)) continue;
    sources.push({ id: w.id, title: clean(w.property_name, 180), url: `/properties/${w.id}`, detailUrl: `/properties/${w.id}`,
      state: 'CA', city: clean(w.city, 80), county: clean(w.county, 80), category: 'property', broad: false, date: clean(w.source_date, 10),
      description: `Historical California workbook property record. Address on record: ${clean(w.address, 180) || 'not recorded'}. Open its property view for the original fields and source links. Current rent, availability and screening are not established.`,
      evidence: 'Historical workbook record; not a live listing' });
  }
  // Supplemental approved help sources, separately labeled from the 232-source catalog.
  // Relevant official page sections inspected 2026-11-03; no bed or funding claim.
  sources.push(
    { id: 'help-211-az', title: '211 Arizona housing and shelter referrals', url: 'https://211arizona.org/', detailUrl: '/help', state: 'AZ', city: '', county: '', category: 'shelter', broad: true, date: '2026-11-03', evidence: 'Supplemental public 211 referral page inspected on the recorded date', description: 'Statewide information and referral service for shelter and housing options, utilities assistance and other community resources. Dial 2-1-1 within Arizona or use its online resource search. The page reports live operators 9 a.m. to 7 p.m. daily. Ask about current intake; no bed, placement or funding is guaranteed.' },
    { id: 'help-211-ca', title: '211 California housing and shelter referrals', url: 'https://211ca.org/', detailUrl: '/help', state: 'CA', city: '', county: '', category: 'shelter', broad: true, date: '2026-11-03', evidence: 'Supplemental public 211 referral page inspected on the recorded date', description: 'California referral search with location filters and emergency housing categories including homeless shelters, drop-in centers and transitional housing, plus rent payment and utility assistance. Use Find Your 211 for the local service. Ask about current intake; no bed, placement or funding is guaranteed.' },
  );
  return { asOf: clean(catalog.generatedAt, 10), sources, locations };
}
export function questionIntent(question) {
  const q = question.toLowerCase();
  if (/evict|court|legal|notice/.test(q)) return 'legal';
  if (/shelter|homeless|tonight|sleep|emergency housing/.test(q)) return 'shelter';
  if (/benefit|utilit|assistance|behind.*rent|help.*(?:pay|rent)|(?:pay|rent).*help/.test(q)) return 'assistance';
  if (/apartment|property|floor.?plan|rentals?|applying|application|leasing/.test(q)) return 'property';
  return 'general';
}
function fitsIntent(source, intent) {
  if (source.id === 'help-211-az' || source.id === 'help-211-ca') return ['shelter', 'assistance', 'general'].includes(intent);
  const text = `${source.title} ${source.description}`.toLowerCase();
  if (intent === 'legal') return source.category === 'legal' || (source.category === 'directory' && /legal|court|evict/.test(text));
  if (intent === 'shelter') return source.category === 'shelter' || (source.category === 'directory' && /shelter|homeless|coordinated entry/.test(text));
  if (intent === 'assistance') return source.category === 'benefits' || (source.category === 'directory' && /assistance|benefits|community.service/.test(text));
  if (intent === 'property') return source.category === 'property' || (source.category === 'directory' && /rental|housing|communit/.test(text));
  return ['housing', 'directory', 'property'].includes(source.category);
}
export function retrieveSources(knowledge, { question, state, city = '' }) {
  const query = tokens(question); const cityKey = city.trim().toLowerCase(); const intent = questionIntent(question);
  const selectedCounties = new Set((knowledge.locations ?? []).filter(p => p.state === state && p.city.toLowerCase() === cityKey).flatMap(p => p.county.toLowerCase().split(' / ')));
  const inArea = s => {
    if (!cityKey) return true;
    if (s.city) return s.city.toLowerCase() === cityKey;
    if (s.county) return s.county.toLowerCase().split(' / ').some(county => selectedCounties.has(county));
    return s.broad === true;
  };
  return knowledge.sources.filter(s => (s.state === state || s.state === 'CA/AZ' || s.state === 'Federal') && fitsIntent(s, intent) && inArea(s)).map(source => {
    const title = source.title.toLowerCase(); const haystack = `${title} ${source.description} ${source.city} ${source.county}`.toLowerCase();
    const score = query.reduce((sum, t) => sum + (title.includes(t) ? 4 : haystack.includes(t) ? 1 : 0), 0) + (cityKey && source.city.toLowerCase() === cityKey ? 2 : 0) + (source.broad ? 1 : 0);
    return { source, score };
  }).sort((a, b) => b.score - a.score || a.source.id.localeCompare(b.source.id)).slice(0, 8).map(r => r.source);
}
export function publicSources(sources) { return sources.map(({ id, title, url, detailUrl, date, evidence, city, county, state }) => ({ id, title, url, detailUrl, date, evidence, area: [city || (county ? `${county} County` : ''), state].filter(Boolean).join(', ') })); }
