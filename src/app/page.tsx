import { ArrowRight, ClipboardList, Search, Shield, Target } from "lucide-react";
import { RecruitingGuide } from "@/components/home/RecruitingGuide";
import { Container } from "@/components/layout/Container";
import { SamplePhone } from "@/components/home/SamplePhone";
import { ButtonLink } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";

const BENEFITS = [
  {
    icon: ClipboardList,
    title: "One profile",
    text: "Measurables, academics, a short bio, and film links stay in the same workspace.",
  },
  {
    icon: Search,
    title: "A scouting board",
    text: "Search the public 2027 ranking by position, class, height, location, school, rank, and stars.",
  },
  {
    icon: Target,
    title: "Schools you choose",
    text: "Group programs you are researching and keep the follow-up dates you set.",
  },
  {
    icon: Shield,
    title: "Published facts only",
    text: "Directory profiles use the public ranking row. Missing stats stay blank. NEXTUP does not invent offers or coach contacts.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        <SafeImage
          src="/images/hero-action.jpg"
          alt="College basketball players contest a shot during a game"
          priority
          sizes="100vw"
          frameClassName="absolute inset-0 h-full w-full"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(7_9_13/0.82)_0%,rgb(7_9_13/0.38)_46%,rgb(7_9_13/0.16)_100%)] lg:bg-[linear-gradient(90deg,rgb(7_9_13/0.9)_0%,rgb(7_9_13/0.62)_34%,rgb(7_9_13/0.18)_62%,transparent_84%)]"
          aria-hidden="true"
        />
        <Container className="relative z-10 grid items-center gap-10 py-14 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">Basketball recruiting</p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(3.2rem,7.2vw,6rem)] uppercase leading-[0.88] text-paper">
              Show your game. Get recruited.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
              Build a profile, add your film and stats, and track the colleges on your list.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/dashboard#profile-editor">
                Build your profile
                <ArrowRight aria-hidden="true" size={16} />
              </ButtonLink>
              <ButtonLink href="/players" variant="secondary" className="bg-ink/75!">
                Explore players
              </ButtonLink>
            </div>
          </div>
          <div className="lg:col-span-5">
            <SamplePhone />
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-ink" aria-labelledby="guide-heading">
        <RecruitingGuide headingId="guide-heading" />
      </section>

      <section className="border-y border-line bg-navy py-14" aria-labelledby="benefits-heading">
        <Container>
          <h2 id="benefits-heading" className="font-display text-5xl uppercase text-paper">
            Built for the process
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <article key={benefit.title} className="rounded-2xl border border-line bg-ink p-5">
                <benefit.icon aria-hidden="true" className="text-lime" size={22} />
                <h3 className="mt-4 font-display text-3xl uppercase text-paper">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{benefit.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-4" aria-labelledby="cta-heading">
        <Container>
          <div className="rounded-3xl border border-line bg-panel px-6 py-8 sm:px-10">
            <h2 id="cta-heading" className="font-display text-5xl uppercase leading-none text-paper sm:text-6xl">
              Put the journey on one board.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">
              Open a demo session, fill the profile you control, and keep the schools you are researching in order.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/sign-in">Start a demo session</ButtonLink>
              <ButtonLink href="/tracker" variant="secondary">
                Open the tracker
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
