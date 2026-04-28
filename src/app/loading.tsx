import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="mt-8 grid gap-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}
