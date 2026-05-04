import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';

function toNum(v) {
  if (!v) return null;
  const clean = String(v).replace(/\$/g, '').replace(/,/g, '').trim();
  if (!clean || /^verify/i.test(clean)) return null;
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}

function toInt(v) {
  const n = toNum(v);
  return n == null ? null : Math.round(n);
}

function slug(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function inferPlatform(blob) {
  const b = String(blob || '').toLowerCase();
  if (b.includes('appfolio')) return 'AppFolio';
  if (b.includes('on-site') || b.includes('on-site.com')) return 'On-Site';
  if (b.includes('rentcafe')) return 'RentCafe';
  if (b.includes('entrata')) return 'Entrata';
  if (b.includes('realpage')) return 'RealPage';
  if (b.includes('knock') || b.includes('g5')) return 'G5/Knock';
  return 'Other';
}

function main() {
  const input = process.argv[2];
  const output = process.argv[3] || path.join('src', 'lib', 'data', 'generated', 'workbook-ranked-listings.json');

  if (!input) {
    console.error('Usage: npm run import:csv -- "<input.csv>" [output.json]');
    process.exit(1);
  }
  if (!fs.existsSync(input)) {
    console.error(`CSV not found: ${input}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(input, 'utf8');
  const parsed = Papa.parse(raw, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    console.error('CSV parse errors:', parsed.errors.slice(0, 5));
    process.exit(1);
  }

  const rows = (parsed.data || [])
    .filter((r) => (r['Property Name'] || '').trim())
    .map((r, i) => {
      const prop = (r['Property Name'] || '').trim();
      const city = (r['City'] || '').trim() || null;
      const county = (r['County'] || '').trim() || null;
      const rank = toInt(r['Rank']);
      const links = {
        direct_unit_link: r['Direct Unit Link'] || null,
        floor_plan_link: r['Floor Plan Link'] || null,
        leasing_site: r['Leasing Site'] || null,
        source_url: r['Source URL'] || null,
        best_listing_url: r['Best Listing URL'] || null,
        floor_plan_url: r['Floor Plan URL'] || null,
        leasing_url: r['Leasing URL'] || null,
        source_url_clickable: r['Source URL Clickable'] || null,
      };
      const platform = inferPlatform(
        [
          links.direct_unit_link,
          links.floor_plan_link,
          links.leasing_site,
          links.source_url,
          links.best_listing_url,
          links.floor_plan_url,
          links.leasing_url,
          links.source_url_clickable,
          r['Mgmt/Leasing Company'] || '',
          r['Greystar/Snappt Flag'] || '',
        ]
          .filter(Boolean)
          .join(' '),
      );

      return {
        id: `wb-${rank || i + 1}-${slug(prop)}-${slug(city || county || 'ca')}`,
        rank,
        match_percent: toNum(r['Match %']),
        fit_tier: r['Fit Tier'] || null,
        property_name: prop,
        city,
        county,
        priority_city_match: r['Priority City Match'] || null,
        neighborhood: r['Neighborhood'] || null,
        address: r['Address'] || null,
        beds: r['Beds'] || null,
        baths: r['Baths'] || null,
        sqft_range: r['Sq Ft / Range'] || null,
        rent_low: toNum(r['Rent Low']),
        rent_high: toNum(r['Rent High']),
        unit_or_floor: r['Unit # / Floor #'] || null,
        floor_plan: r['Floor Plan'] || null,
        availability: r['Availability'] || null,
        management_company: r['Mgmt/Leasing Company'] || null,
        leasing_contact: r['Leasing Contact'] || null,
        screening_vendor: r['Screening Vendor'] || null,
        screening_difficulty: toNum(r['Screening Difficulty']),
        screening_difficulty_label: r['Screening Difficulty Label'] || null,
        greystar_snappt_flag: r['Greystar/Snappt Flag'] || null,
        action_status: r['Action Status'] || null,
        score_notes: r['Score Notes'] || null,
        best_feature: r['Best Feature'] || null,
        missing_preferences: r['Missing Preferences'] || null,
        questions_to_ask_leasing: r['Questions To Ask Leasing'] || null,
        source_date: r['Source Date'] || null,
        application_platform_inferred: platform,
        links,
      };
    });

  rows.sort((a, b) => {
    const ar = a.rank == null ? 9999 : a.rank;
    const br = b.rank == null ? 9999 : b.rank;
    if (ar !== br) return ar - br;
    return a.property_name.localeCompare(b.property_name);
  });

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(rows, null, 2), 'utf8');
  console.log(`Wrote ${rows.length} rows to ${output}`);
}

main();
