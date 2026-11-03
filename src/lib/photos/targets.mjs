/**
 * Build one canonical allowlist without changing existing record IDs or blob keys.
 * @param {{
 * places?: Array<{id:string,name:string,state:string,slug:string}>,
 * workbook?: Array<{id:string,property_name:string,city?:string|null,state?:string|null}>,
 * rentals?: Array<{id:string,property_name:string,city?:string|null,state:string,unit_type:string,meta?:{source?:string,trust_label?:string}}>,
 * resources?: Array<{id:string,title:string,category:string,state:string,city?:string|null}>
 * }} input
 */
export function buildPhotoTargets({ places = [], workbook = [], rentals = [], resources = [] }) {
  const targets = [];
  const seen = new Set();
  function add(record) {
    if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(record.id) || seen.has(record.id)) {
      throw new Error('Invalid or duplicate photo target ID.');
    }
    if (!['CA', 'AZ'].includes(record.state) || !record.label.trim()) {
      throw new Error('Invalid photo target location or label.');
    }
    seen.add(record.id);
    targets.push(record);
  }
  for (const place of places) add({
    id: place.id, kind: 'city', label: place.name, city: place.name, state: place.state,
    href: '/places/' + (place.state === 'CA' ? 'california' : 'arizona') + '/' + encodeURIComponent(place.slug), contextOnly: true,
  });
  // This preserved workbook covers California; its original records have no state field.
  for (const item of workbook) add({
    id: item.id, kind: 'workbook', label: item.property_name, city: item.city || '', state: item.state || 'CA',
    href: '/properties/' + encodeURIComponent(item.id), contextOnly: false,
  });
  for (const item of rentals) add({
    id: item.id, kind: 'rental', label: item.property_name, city: item.city || '', state: item.state,
    href: '/' + (item.unit_type === 'townhouse' ? 'townhomes' : 'apartments') + '/' + encodeURIComponent(item.id),
    // Missing or unverified provenance must never become an exact-unit photo claim.
    contextOnly: !item.meta || item.meta.source === 'unverified' || item.meta.trust_label === 'unverified',
  });
  for (const item of resources) {
    if (item.category !== 'property' || !['CA', 'AZ'].includes(item.state)) continue;
    add({
      id: item.id, kind: 'property-source', label: item.title, city: item.city || '', state: item.state,
      href: '/resources/' + encodeURIComponent(item.id), contextOnly: false,
    });
  }
  return targets;
}

export function filterPhotoTargets(targets, query) {
  const words = String(query || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  return targets.filter(target => words.every(word =>
    [target.id, target.label, target.city, target.state, target.state === 'CA' ? 'California' : 'Arizona', target.kind]
      .join(' ').toLowerCase().includes(word)));
}
