import { Check, Clapperboard, GraduationCap, School, SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { emptyProfile, profileCompletion } from "@/lib/board";
import type { AthleteProfile } from "@/lib/types";

const STEPS = [
  {
    title: "Build one profile",
    text: "Sport, class, height, and the academics you choose to share, in a single file.",
  },
  {
    title: "Add your film",
    text: "Keep a YouTube or Hudl link you control next to those facts.",
  },
  {
    title: "List target schools",
    text: "Name the programs you are researching and sort them as the list changes.",
  },
  {
    title: "Track outreach",
    text: "Log the day you reached out and the follow-up you set. You send every message.",
  },
] as const;

const sampleProfile: AthleteProfile = {
  ...emptyProfile(),
  firstName: "Avery",
  lastName: "Lang",
  position: "Shooting Guard",
  heightFeet: "6",
  heightInches: "4",
  gradYear: "2028",
  city: "Tempe",
  state: "AZ",
  school: "Westbridge High",
  gpa: "3.6",
};

function statusLabel(status: string) {
  if (status === "interested") return "Interested";
  if (status === "contacted") return "Contacted";
  if (status === "evaluating") return "Evaluating";
  return status;
}

export function RecruitingGuide({
  heading = "h2",
  headingId,
}: {
  heading?: "h1" | "h2";
  headingId?: string;
}) {
  const completion = profileCompletion(sampleProfile);
  const sampleSchools = [
    { id: "guide-harborview", name: "Harborview University", status: "interested" },
    { id: "guide-summit", name: "Summit State", status: "evaluating" },
  ];
  const Title = heading;
  const PanelTitle = heading === "h1" ? "h2" : "h3";

  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">Personal profile</p>
          <Title
            id={headingId}
            className="mt-4 max-w-xl font-display text-[clamp(3.1rem,6vw,5.4rem)] uppercase leading-[0.88] text-paper"
          >
            Build the file. Run the process.
          </Title>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
            College recruiting gets clearer when sport, class, measurables, academics, and film live in one place.
            Then you name the schools you want and record the outreach you send. NEXTUP keeps that work on your
            board. It does not contact coaches or assign someone to recruit for you.
          </p>
          <ol className="mt-8 space-y-4">
            {STEPS.map((step) => (
              <li key={step.title} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime text-ink">
                  <Check aria-hidden="true" size={14} strokeWidth={3} />
                </span>
                <span>
                  <span className="block font-semibold text-paper">{step.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-mist">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <ButtonLink href="/profile#profile-editor" className="mt-8">
            Build your profile
          </ButtonLink>
        </div>

        <aside aria-label="Sample profile summary for Avery Lang" className="lg:pl-2">
          <div className="rounded-[1.75rem] border border-line bg-navy p-4 shadow-[0_0_48px_rgba(62,116,255,0.14)] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line bg-panel font-display text-3xl text-lime">
                  AL
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-lime">Sample profile</p>
                  <p className="font-display text-4xl uppercase leading-none text-paper">Avery Lang</p>
                  <p className="mt-1 text-xs text-mist">Basketball · Class of 2028</p>
                </div>
              </div>
              <p className="rounded-full border border-lime/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-lime">
                Fictional
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-line bg-panel p-4">
              <div className="flex items-end justify-between gap-3">
                <p className="text-sm text-mist">Profile completion</p>
                <p className="font-display text-5xl leading-none text-paper">{completion.percent}%</p>
              </div>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-ink"
                role="meter"
                aria-valuenow={completion.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Sample profile completion"
              >
                <div className="h-full bg-lime" style={{ width: `${completion.percent}%` }} />
              </div>
              <p className="mt-2 text-xs text-mist">
                {completion.filled} of {completion.total} fields on this sample. Blank fields stay blank.
              </p>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <section className="rounded-2xl border border-line bg-panel p-4">
                <div className="flex items-center gap-2 text-lime">
                  <Clapperboard aria-hidden="true" size={16} />
                  <PanelTitle className="text-xs font-semibold uppercase tracking-[0.16em]">Film</PanelTitle>
                </div>
                <p className="mt-3 text-sm font-semibold text-paper">No highlight link</p>
                <p className="mt-1 text-xs leading-relaxed text-mist">
                  Sample slot. Add a URL you control. This is not a real tape.
                </p>
              </section>

              <section className="rounded-2xl border border-line bg-panel p-4">
                <div className="flex items-center gap-2 text-lime">
                  <GraduationCap aria-hidden="true" size={16} />
                  <PanelTitle className="text-xs font-semibold uppercase tracking-[0.16em]">Academics</PanelTitle>
                </div>
                <p className="mt-3 text-sm font-semibold text-paper">GPA 3.6</p>
                <p className="mt-1 text-xs text-paper">SAT 1200 · ACT 25</p>
                <p className="mt-1 text-xs leading-relaxed text-mist">Sample academics. Not a real student record.</p>
              </section>

              <section className="rounded-2xl border border-line bg-panel p-4">
                <div className="flex items-center gap-2 text-lime">
                  <School aria-hidden="true" size={16} />
                  <PanelTitle className="text-xs font-semibold uppercase tracking-[0.16em]">School</PanelTitle>
                </div>
                <p className="mt-3 text-sm font-semibold text-paper">Westbridge High</p>
                <p className="mt-1 text-xs text-paper">Tempe, AZ</p>
                <p className="mt-1 text-xs text-mist">6&apos;4&quot; · 185 lb</p>
              </section>

              <section className="rounded-2xl border border-line bg-panel p-4">
                <div className="flex items-center gap-2 text-lime">
                  <SlidersHorizontal aria-hidden="true" size={16} />
                  <PanelTitle className="text-xs font-semibold uppercase tracking-[0.16em]">Preferences</PanelTitle>
                </div>
                <p className="mt-3 text-sm font-semibold text-paper">Shooting guard</p>
                <ul className="mt-2 space-y-1">
                  {sampleSchools.map((school) => (
                    <li key={school.id} className="text-xs text-paper">
                      {school.name} · {statusLabel(school.status)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs leading-relaxed text-mist">
                  Fictional campuses on this sample. Not offers, and no coach is attached.
                </p>
              </section>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
