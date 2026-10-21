import { SafeImage } from "@/components/ui/SafeImage";

const OFFERS = [
  { name: "Northline College", place: "lg:col-start-1 lg:row-start-1 lg:justify-self-end" },
  { name: "Redcedar State", place: "lg:col-start-3 lg:row-start-1 lg:justify-self-start" },
  { name: "Port Meridian", place: "lg:col-start-1 lg:row-start-3 lg:justify-self-end" },
  { name: "Fielding University", place: "lg:col-start-3 lg:row-start-3 lg:justify-self-start" },
] as const;

function OfferChip({ name }: { name: string }) {
  return (
    <div className="relative z-10 flex max-w-[12rem] items-center gap-2 rounded-2xl border border-lime/40 bg-navy px-3 py-2">
      <span className="h-2 w-2 shrink-0 rounded-full bg-lime" aria-hidden="true" />
      <span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-lime">Sample offer</span>
        <span className="block text-sm font-semibold leading-tight text-paper">{name}</span>
      </span>
    </div>
  );
}

export function SamplePhone() {
  return (
    <aside aria-label="Sample recruiting profile">
      <div className="relative mx-auto grid max-w-xl grid-cols-2 items-center gap-3 lg:max-w-2xl lg:grid-cols-[minmax(0,1fr)_250px_minmax(0,1fr)] lg:grid-rows-[auto_1fr_auto] lg:gap-x-5 lg:gap-y-8">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[82%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/30 lg:block"
          aria-hidden="true"
        />
        {OFFERS.slice(0, 2).map((offer) => (
          <div key={offer.name} className={offer.place}>
            <OfferChip name={offer.name} />
          </div>
        ))}
        <div className="relative z-10 col-span-2 mx-auto w-[250px] lg:col-span-1 lg:col-start-2 lg:row-span-3 lg:row-start-1">
          <div className="rounded-[2rem] border border-line bg-ink p-2 shadow-[0_0_40px_rgba(62,116,255,0.18)]">
            <div className="overflow-hidden rounded-[1.55rem] bg-navy">
              <div className="flex justify-center pt-2">
                <span className="h-1.5 w-12 rounded-full bg-line" />
              </div>
              <p className="px-3 pt-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-lime">
                Sample profile
              </p>
              <div className="px-3 pt-2">
                <SafeImage
                  src="/images/sample-profile.jpg"
                  alt="Players contesting a shot during a basketball game"
                  priority
                  frameClassName="aspect-[4/5] rounded-xl"
                  sizes="220px"
                />
              </div>
              <div className="px-3 pb-4 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist">Class of 2028</p>
                <p className="font-display text-4xl uppercase leading-none text-paper">Avery Lang</p>
                <p className="mt-1 text-xs text-paper">Basketball · Shooting guard</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <dt className="text-mist">Height</dt>
                    <dd className="font-semibold text-paper">6&apos;4&quot;</dd>
                  </div>
                  <div>
                    <dt className="text-mist">Weight</dt>
                    <dd className="font-semibold text-paper">185 lb</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-mist">School and city</dt>
                    <dd className="font-semibold text-paper">Westbridge High, Tempe, AZ</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[11px] font-semibold text-paper">GPA 3.6 · SAT 1200 · ACT 25</p>
                <p className="mt-1 text-[10px] leading-relaxed text-mist">Sample academics. Not a real student record.</p>
              </div>
            </div>
          </div>
        </div>
        {OFFERS.slice(2).map((offer) => (
          <div key={offer.name} className={offer.place}>
            <OfferChip name={offer.name} />
          </div>
        ))}
      </div>
      <p className="mx-auto mt-4 max-w-md text-center text-xs leading-relaxed text-mist">
        This phone is a sample. The player, school, academics, and colleges are fictional, and the photo is a real game
        photograph. It is not a 2027 ranking profile.
      </p>
    </aside>
  );
}
