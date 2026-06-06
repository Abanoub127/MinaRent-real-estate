import { Skeleton } from './skeleton';

export const PropertyCardSkeleton = () => (
  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
    {/* Image */}
    <Skeleton className="h-48 w-full rounded-none" />

    <div className="p-4 space-y-3">
      {/* Price */}
      <Skeleton className="h-4 w-1/4 rounded-lg" />
      {/* Title */}
      <Skeleton className="h-4 w-3/4 rounded-lg" />
      {/* Location */}
      <Skeleton className="h-3 w-1/2 rounded-lg" />

      {/* Divider */}
      <div className="pt-2 mt-auto border-t border-[var(--border)]" />

      {/* 3 icons row: beds / baths / size */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-lg" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-lg" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);
