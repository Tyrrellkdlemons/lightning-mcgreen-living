import { createHmac } from 'node:crypto';
export const LIMITS = Object.freeze({ day: 20, month: 300, ipDay: 5, retries: 6 });
function validPeriod(value, month) {
  if (!value || value.version !== 1 || !Number.isSafeInteger(value.total) || value.total < 0 || value.total > LIMITS.month || !value.days || typeof value.days !== 'object' || Array.isArray(value.days) || Object.keys(value).some(k => !['version', 'total', 'days'].includes(k)) || Object.keys(value.days).length > 31) return false;
  let total = 0;
  for (const [day, entry] of Object.entries(value.days)) {
    if (!day.startsWith(month + '-') || !/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day || !entry || !Number.isSafeInteger(entry.count) || entry.count < 1 || entry.count > LIMITS.day || !entry.ips || typeof entry.ips !== 'object' || Array.isArray(entry.ips) || Object.keys(entry).some(k => !['count', 'ips'].includes(k))) return false;
    const ips = Object.entries(entry.ips);
    if (ips.length > LIMITS.day || ips.some(([key, count]) => !/^[a-f0-9]{64}$/.test(key) || !Number.isSafeInteger(count) || count < 1 || count > LIMITS.ipDay) || ips.reduce((sum, [, count]) => sum + count, 0) !== entry.count) return false;
    total += entry.count;
  }
  return total === value.total;
}
export async function reserveBudget({ store, ip, secret, now = new Date() }) {
  if (!ip || typeof ip !== 'string' || ip.length > 100 || !secret) throw new Error('Quota identity unavailable');
  const day = now.toISOString().slice(0, 10); const month = day.slice(0, 7);
  const identity = createHmac('sha256', secret).update(`${day}:${ip}`).digest('hex');
  // One bounded document and one conditional write: rejected attempts change no counters.
  const key = `period/${month}`;
  for (let attempt = 0; attempt < LIMITS.retries; attempt++) {
    const existing = await store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
    if (existing !== null && (!validPeriod(existing.data, month) || typeof existing.etag !== 'string')) throw new Error('Invalid quota state');
    const period = existing?.data ?? { version: 1, total: 0, days: {} };
    const daily = period.days[day] ?? { count: 0, ips: {} };
    if (period.total >= LIMITS.month || daily.count >= LIMITS.day || (daily.ips[identity] ?? 0) >= LIMITS.ipDay) return false;
    const updated = { version: 1, total: period.total + 1, days: { ...period.days, [day]: { count: daily.count + 1, ips: { ...daily.ips, [identity]: (daily.ips[identity] ?? 0) + 1 } } } };
    const result = await store.setJSON(key, updated, existing ? { onlyIfMatch: existing.etag } : { onlyIfNew: true });
    if (result.modified === true) return true;
  }
  // Contention is denied, never a reason to skip the budget gate.
  throw new Error('Quota contention');
}
