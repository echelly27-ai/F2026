export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="h-8 w-40 animate-pulse rounded-full bg-panel" />
      <div className="mt-4 h-16 w-2/3 animate-pulse rounded-2xl bg-panel" />
      <div className="mt-6 h-40 animate-pulse rounded-2xl bg-panel" />
    </div>
  );
}
