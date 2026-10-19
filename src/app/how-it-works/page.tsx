import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";

export const metadata: Metadata = {
  title: "How it works",
  description: "How NEXTUP organizes a basketball recruiting profile, film links, and a personal school list.",
};

const STEPS = [
  {
    title: "Build the profile you control",
    text: "The dashboard is your workspace. Add a name, position, height, class, school, GPA if you want it public on your board, a short bio, and the season numbers you choose to enter. Completion is calculated from the fields that are filled.",
  },
  {
    title: "Keep film links with the profile",
    text: "Paste a YouTube link to embed it, or a Hudl link to open safely in a new tab. Removing a link updates the list immediately. Public prospect pages only embed a highlight when the ranking row published a stable URL.",
  },
  {
    title: "Track schools and your own dates",
    text: "Add a program, write notes, and move it among Interested, Contacted, and Evaluating. The contact date is the day you reached out. The follow-up date is the reminder you set. NEXTUP does not contact coaches and does not list offers.",
  },
];

export default function HowItWorksPage() {
  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="How it works"
        title="A board, not a rumor mill"
        lede="NEXTUP organizes a recruiting journey. The directory shows publicly listed 2027 ranking facts. Your dashboard and tracker stay yours and save on this device unless you connect your own Supabase project."
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ol className="space-y-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line bg-panel p-5">
              <p className="font-display text-4xl text-lime">0{index + 1}</p>
              <h2 className="mt-2 text-xl font-semibold text-paper">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mist">{step.text}</p>
            </li>
          ))}
        </ol>
        <SafeImage
          src="/images/arena.jpg"
          alt="Wide photograph of a packed basketball arena before tip"
          frameClassName="aspect-[4/5] rounded-3xl border border-line lg:aspect-auto lg:min-h-[520px]"
          sizes="(max-width: 1024px) 100vw, 40vw"
        />
      </div>
      <section className="mt-10" aria-labelledby="try-heading">
        <h2 id="try-heading" className="font-display text-4xl uppercase text-paper">
          Try the demo
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">
          No account is required. Sign in with a demo name if you want the welcome line personalized. Checklist
          marks, profile edits, film links, saved players, and school notes persist in local storage.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/players">Explore players</ButtonLink>
          <ButtonLink href="/dashboard" variant="secondary">
            Open dashboard
          </ButtonLink>
          <ButtonLink href="/tracker" variant="secondary">
            Open tracker
          </ButtonLink>
          <ButtonLink href="/sign-in" variant="ghost">
            Demo sign in
          </ButtonLink>
        </div>
      </section>
    </Container>
  );
}
