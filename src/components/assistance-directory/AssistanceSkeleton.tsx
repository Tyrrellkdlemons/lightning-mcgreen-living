export function AssistanceSkeleton({ detail = false }: { detail?: boolean }) {
  return <div role="status" aria-label={detail ? 'Loading program details' : 'Loading assistance directory'} className="py-6">
    <span className="sr-only">{detail ? 'Loading program details...' : 'Loading assistance resources...'}</span>
    <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
      <div className="h-8 w-3/4 rounded-lg bg-gingerbread-100" />
      <div className="h-5 w-1/2 rounded-lg bg-gingerbread-100" />
      <div className="h-36 rounded-2xl border border-gingerbread-200 bg-frosting-100" />
      <div className={detail ? 'space-y-4' : 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'}>{Array.from({ length: detail ? 2 : 6 }, (_, i) => <div key={i} className="h-72 rounded-2xl border border-gingerbread-200 bg-white p-5"><div className="h-10 w-10 rounded-xl bg-lightning-100" /><div className="mt-5 h-5 w-4/5 rounded bg-gingerbread-100" /><div className="mt-3 h-4 w-3/5 rounded bg-gingerbread-100" /><div className="mt-7 h-20 rounded-lg bg-frosting-100" /></div>)}</div>
    </div>
  </div>;
}
