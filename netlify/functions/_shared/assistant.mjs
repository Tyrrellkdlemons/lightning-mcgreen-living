import { getStore } from '@netlify/blobs';
import catalog from '../../../src/lib/resources/catalog.json' with { type: 'json' };
import workbook from '../../../src/lib/data/generated/workbook-ranked-listings.json' with { type: 'json' };
import places from '../../../src/lib/places/places.json' with { type: 'json' };
import { buildKnowledge } from '../../../src/lib/assistant/knowledge.mjs';
export const dependencies = {
  knowledge: buildKnowledge(catalog, workbook, places),
  getEnvironment: () => ({ GEMINI_API_KEY: process.env.GEMINI_API_KEY, GOOGLE_GEMINI_BASE_URL: process.env.GOOGLE_GEMINI_BASE_URL, ASSISTANT_ENABLED: process.env.ASSISTANT_ENABLED }),
  getStore: () => getStore({ name: 'housing-assistant-budget-v1', consistency: 'strong' }),
};
