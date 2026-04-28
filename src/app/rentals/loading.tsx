import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="mt-8 space-y-4">
      <Skeleton className="h-10 w-2/3" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
      </div>
    </div>
  );
}
