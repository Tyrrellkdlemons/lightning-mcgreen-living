import { resourceOutboundDisabled, type ResourceSource } from '@/lib/resources';
export function SourceReview({ source, compact = false }: { source: ResourceSource; compact?: boolean }) {
 const review = source.review;
 const label = resourceOutboundDisabled(source) ? 'Link disabled: source mismatch' : review?.outcome === 'blocked' ? 'Access restricted during review' : review?.outcome === 'unavailable' ? 'Content could not be confirmed' : source.inspection === 'content-inspected' ? 'Source content reviewed' : 'Directory metadata only';
 return <div className="rounded-xl border border-gingerbread-200 bg-white p-3 text-xs leading-relaxed text-chocolate-700"><p className="font-bold">{label}</p>{review && <p className="mt-1">Checked {review.checkedAt.slice(0, 10)}{review.httpStatus ? ` · HTTP ${review.httpStatus}` : ''}</p>}<p className="mt-2">{review?.summary ?? 'Confirm current service details with the provider.'}</p>{!compact && review?.inspectedSections?.length ? <p className="mt-2">Inspected: {review.inspectedSections.join('; ')}.</p> : null}{!compact && <p className="mt-2">Page access does not confirm current vacancies, funding, eligibility or photo accuracy.</p>}</div>;
}
