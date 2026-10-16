export function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-line bg-panel px-4 py-3 text-sm leading-relaxed text-mist">
      <span className="font-semibold text-lime">Demonstration data. </span>
      {children}
    </p>
  );
}
