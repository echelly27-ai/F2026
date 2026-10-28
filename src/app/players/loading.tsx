import { Container } from "@/components/layout/Container";

export default function PlayersLoading() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="h-4 w-32 animate-pulse rounded-full bg-panel" />
      <div className="mt-4 h-14 w-2/3 max-w-md animate-pulse rounded-2xl bg-panel" />
      <div className="mt-6 h-36 animate-pulse rounded-2xl bg-panel" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-2xl bg-panel" />
        ))}
      </div>
    </Container>
  );
}
