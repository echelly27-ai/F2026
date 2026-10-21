import { ArrowRight, ClipboardList, Search, Shield, Target } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PlayerCard } from "@/components/players/PlayerCard";
import { SamplePhone } from "@/components/home/SamplePhone";
import { ButtonLink } from "@/components/ui/Button";
import { PROSPECTS } from "@/lib/prospects";

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

const STEPS = [
  {
    n: "01",
    title: "Build the profile",
    text: "Add the measurables, academics, and film links you want in one place.",
  },
  {
    n: "02",
    title: "Sort your list",
    text: "Move schools between Interested, Contacted, and Evaluating as your process changes.",
  },
  {
    n: "03",
    title: "Log your outreach",
    text: "Record the date you reached out and when you plan to follow up. NEXTUP does not contact programs for you.",
  },
];

export default function HomePage() {
  const featured = PROSPECTS.slice(0, 3);

  return (
    <>
      <section className="border-b border-line">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-12 lg:py-20">
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
              <ButtonLink href="/players" variant="secondary">
                Explore players
              </ButtonLink>
            </div>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-mist">Profiles</dt>
                <dd className="mt-1 font-semibold text-paper">100 public</dd>
              </div>
              <div>
                <dt className="text-mist">Your board</dt>
                <dd className="mt-1 font-semibold text-paper">Saved locally</dd>
              </div>
              <div>
                <dt className="text-mist">Offers</dt>
                <dd className="mt-1 font-semibold text-paper">None invented</dd>
              </div>
            </dl>
          </div>
          <div className="lg:col-span-5">
            <SamplePhone />
          </div>
        </Container>
      </section>

      <section className="py-14" aria-labelledby="featured-heading">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">Featured</p>
              <h2 id="featured-heading" className="mt-2 font-display text-5xl uppercase text-paper">
                Top of the public list
              </h2>
              <p className="mt-2 max-w-xl text-sm text-mist">
                The first three names on the ESPN 2027 SC Next 100 checked October 19, 2026. Rankings change.
                Photos are the public 247Sports recruiting pictures when one was available.
              </p>
            </div>
            <ButtonLink href="/players" variant="secondary">
              See all players
            </ButtonLink>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featured.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </Container>
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

      <section id="how-it-works" className="py-14" aria-labelledby="steps-heading">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">How it works</p>
          <h2 id="steps-heading" className="mt-2 font-display text-5xl uppercase text-paper">
            Three steps
          </h2>
          <ol className="mt-6 grid gap-5 lg:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="rounded-2xl border border-line bg-panel p-5">
                <span className="font-display text-4xl text-lime">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-paper">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-mist">{step.text}</p>
              </li>
            ))}
          </ol>
          <ButtonLink href="/how-it-works" variant="secondary" className="mt-6">
            Read the full walkthrough
          </ButtonLink>
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
