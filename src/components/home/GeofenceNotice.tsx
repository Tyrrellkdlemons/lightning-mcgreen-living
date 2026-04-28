import { config } from '@/lib/config';

export function GeofenceNotice() {
  if (!config.geofenceSocal) return null;
  return (
    <div className="mt-4 rounded-cookie border border-gingerbread-300/60 bg-frosting-100 px-4 py-2 text-xs text-chocolate-700">
      <strong className="text-chocolate-900">Geofenced to Southern California.</strong>{' '}
      We hide listings outside LA · OC · SB · Riverside · Ventura counties so
      you only see what&apos;s actually nearby.
    </div>
  );
}
