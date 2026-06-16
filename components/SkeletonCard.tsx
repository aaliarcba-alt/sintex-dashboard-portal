export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-0.5 skeleton" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="skeleton w-9 h-9 rounded-xl" />
          <div className="skeleton w-6 h-6 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 rounded-lg w-3/4" />
          <div className="skeleton h-3 rounded-lg w-full" />
          <div className="skeleton h-3 rounded-lg w-2/3" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-5 rounded-lg w-16" />
          <div className="skeleton h-5 rounded-lg w-12" />
        </div>
        <div className="skeleton h-8 rounded-xl w-full" />
      </div>
    </div>
  );
}
