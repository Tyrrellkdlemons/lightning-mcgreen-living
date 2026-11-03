import { createAssistantHandler } from '../../src/lib/assistant/server.mjs';
import { dependencies } from './_shared/assistant.mjs';
export default createAssistantHandler(dependencies);
export const config = { path: '/api/assistant', rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
