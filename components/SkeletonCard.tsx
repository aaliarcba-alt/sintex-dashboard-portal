export default function SkeletonCard() {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="h-1 skeleton" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl skeleton" />
          <div className="w-7 h-7 rounded-lg skeleton" />
        </div>
        <div className="space-y-2">
          <div className="h-4 rounded-md skeleton w-3/4" />
          <div className="h-3 rounded-md skeleton w-full" />
          <div className="h-3 rounded-md skeleton w-5/6" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-lg skeleton" />
          <div className="h-5 w-12 rounded-lg skeleton" />
        </div>
        <div className="h-8 rounded-xl skeleton w-full" />
      </div>
    </div>
  );
}
