import ApprovedReviews from "@/components/ApprovedReviews";
import MagicBentoGallery from "@/components/MagicBentoGallery";
import { getPropertyBySlug } from "@/lib/properties";

type Props = {
  params: Promise<{ slug: string | string[] }>;
};

const fallbackGallery = [
  {
    src: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1800&q=80",
    alt: "Sunlit living room with neutral palette and balcony access",
  },
  {
    src: "https://images.unsplash.com/photo-1616594039964-1916c64dbe8d?auto=format&fit=crop&w=1200&q=80",
    alt: "Bright bedroom with upholstered headboard and city view",
  },
  {
    src: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
    alt: "Minimalist dining space with round table and pendant lighting",
  },
  {
    src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    alt: "Modern bathroom with wood accents and walk-in shower",
  },
  {
    src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    alt: "Chef's kitchen with warm cabinetry and stone countertops",
  },
];

const defaultAmenities = [
  "Cable TV",
  "Internet",
  "Kitchen",
  "Washing Machine",
  "Wireless",
  "Elevator",
  "Hair Dryer",
  "Heating",
  "Smoke Detector",
];

const stayFacts = [
  { value: "5", label: "Guests" },
  { value: "2", label: "Bedrooms" },
  { value: "1", label: "Bathrooms" },
  { value: "3", label: "Beds" },
];

const schedule = { checkIn: "3:00 PM", checkOut: "10:00 AM" };

const houseRules = [
  "No smoking",
  "No pets",
  "No parties or events",
  "Security deposit required",
];

const cancellationPolicies = [
  {
    title: "For stays less than 28 days",
    details: [
      "Full refund up to 14 days before check-in",
      "No refund for bookings less than 14 days before check-in",
    ],
  },
  {
    title: "For stays of 28 days or more",
    details: [
      "Full refund up to 30 days before check-in",
      "No refund for bookings less than 30 days before check-in",
    ],
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={className ?? "h-5 w-5"}
      fill="none"
    >
      <path
        d="M16.704 5.368a.75.75 0 0 0-1.058-1.064l-7.21 7.168-3.082-3.063a.75.75 0 1 0-1.054 1.068l3.61 3.587a.75.75 0 0 0 1.058 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default async function PropertyPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(Array.isArray(raw) ? raw.join("/") : raw);

  const property = getPropertyBySlug(slug);

  if (!property) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Property not found</h1>
      </main>
    );
  }

  const gallery = property.hero.endsWith(".svg")
    ? fallbackGallery
    : [
        { src: property.hero, alt: `${property.name} hero image` },
        ...fallbackGallery.slice(1),
      ];

  const heroImage = gallery[0] ?? { src: property.hero, alt: property.name };

  const expandedGallery = [...gallery];
  const minGalleryCards = 5;
  while (expandedGallery.length < minGalleryCards && expandedGallery.length > 0) {
    expandedGallery.push(
      gallery[expandedGallery.length % gallery.length] ?? heroImage,
    );
  }
  const bentoCards = expandedGallery.slice(0, minGalleryCards).map((image, index) => ({
    id: `${property.slug}-${index}`,
    image,
  }));

  const amenities = Array.from(
    new Set([...property.amenities, ...defaultAmenities])
  ).slice(0, 8);

  return (
    <main className="min-h-screen bg-[#f5f0e6] pb-20">
      <section className="bg-[#f5f0e6]">
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#f5f0e6]">
          <div className="pb-10 pt-12">
            <MagicBentoGallery cards={bentoCards} />
          </div>
        </div>

        <div className="mx-auto max-w-6xl space-y-8 px-6 pb-12">
          <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#5d7466]">
                The Flex Collection
              </p>
              <h1 className="text-4xl font-semibold text-[#13392f] md:text-5xl">
                {property.name}
              </h1>
              <p className="text-lg text-[#5f6f65]">{property.location}</p>
            </div>
            <p className="max-w-sm text-sm text-[#7a847c] md:text-base">
              {property.shortSummary}
            </p>
          </header>

          <div className="grid gap-3 rounded-3xl border border-[#d8dfd4] bg-[#fbfaf7] p-6 shadow-[0_20px_40px_rgba(25,37,32,0.08)] sm:grid-cols-2 lg:grid-cols-4">
            {stayFacts.map(fact => (
              <div
                key={fact.label}
                className="flex items-center gap-3 rounded-2xl bg-white/70 p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dfe6dc] text-lg font-semibold text-[#134e48]">
                  {fact.value}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#13392f]">{fact.label}</p>
                  <p className="text-xs text-[#7a847c]">Everything you need for a comfortable stay</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <article className="rounded-3xl border border-[#e2e6db] bg-white/90 p-8 shadow-[0_30px_60px_rgba(18,31,25,0.08)] backdrop-blur">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#13392f]">
                About this property
              </h2>
              <p className="text-sm text-[#6d7b72]">
                Thoughtfully curated interiors with hotel-grade comforts.
              </p>
            </div>
          </header>
          <p className="text-base leading-relaxed text-[#3a4941]">
            {property.description}
          </p>
        </article>

        <div className="mt-10 gap-10 pb-16 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <div
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Property highlight panels"
            >
              <article className="w-[min(28rem,85vw)] shrink-0 snap-start rounded-3xl border border-[#e2e6db] bg-white/90 p-8 shadow-[0_24px_50px_rgba(18,31,25,0.06)] backdrop-blur lg:w-[26rem] xl:w-[28rem]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-[#13392f]">Amenities</h2>
                  <button
                    type="button"
                    className="text-sm font-medium text-[#134e48] hover:underline"
                  >
                    View all amenities
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {amenities.map(item => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-[#e7ede5] bg-[#f9fbf7] px-4 py-3 text-sm font-medium text-[#13392f]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfe9df] text-[#134e48]">
                        <CheckIcon className="h-4 w-4" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </article>

              <article className="w-[min(28rem,85vw)] shrink-0 snap-start rounded-3xl border border-[#d7e2da] bg-[#f4f7f2] p-8 shadow-[0_30px_60px_rgba(18,31,25,0.07)] lg:w-[26rem] xl:w-[28rem]">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold text-[#13392f]">Stay Policies</h2>
                  <span className="text-sm text-[#5f6f65]">
                    Check what applies before booking
                  </span>
                </div>
                <div className="space-y-5">
                  <div className="rounded-2xl border border-[#e2eadf] bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-[#13392f]">
                      Check-in &amp; Check-out
                    </h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#e8efe5] bg-[#f8fbf7] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#6d7b72]">
                          Check-in Time
                        </p>
                        <p className="mt-2 text-xl font-semibold text-[#13392f]">
                          {schedule.checkIn}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#e8efe5] bg-[#f8fbf7] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#6d7b72]">
                          Check-out Time
                        </p>
                        <p className="mt-2 text-xl font-semibold text-[#13392f]">
                          {schedule.checkOut}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#e2eadf] bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-[#13392f]">House Rules</h3>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {houseRules.map(rule => (
                        <li key={rule} className="flex items-start gap-3 text-sm text-[#3a4941]">
                          <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#134e48] text-white">
                            <CheckIcon className="h-3.5 w-3.5" />
                          </span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[#e2eadf] bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-[#13392f]">Cancellation Policy</h3>
                    <div className="mt-4 grid gap-4">
                      {cancellationPolicies.map(policy => (
                        <div key={policy.title} className="rounded-2xl border border-[#e8efe5] bg-[#f8fbf7] p-5">
                          <p className="text-sm font-semibold text-[#134e48]">
                            {policy.title}
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-[#3a4941]">
                            {policy.details.map(detail => (
                              <li key={detail} className="flex gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#134e48]" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              <article className="w-[min(28rem,85vw)] shrink-0 snap-start rounded-3xl border border-[#e2e6db] bg-white/90 p-8 shadow-[0_24px_50px_rgba(18,31,25,0.06)] backdrop-blur lg:w-[26rem] xl:w-[28rem]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-[#13392f]">Guest Reviews</h2>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#7a847c]">
                    Approved only
                  </span>
                </div>
                <ApprovedReviews listing={property.slug} />
              </article>
            </div>
          </div>

          <aside className="mt-10 space-y-5 pb-16 lg:mt-0 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-[#e2e6db] bg-white p-7 shadow-[0_30px_60px_rgba(18,31,25,0.12)]">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-[#13392f]">Book Your Stay</h3>
                <p className="text-sm text-[#6d7b72]">Select dates to see prices</p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["Check-in", "Check-out"] as const).map(label => (
                    <button
                      key={label}
                      type="button"
                      className="text-left"
                    >
                      <div className="w-full rounded-2xl border border-[#dfe5da] bg-[#f8faf6] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#6d7b72]">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#13392f]">
                          Select date
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <button type="button" className="w-full rounded-2xl border border-[#dfe5da] bg-[#f8faf6] px-4 py-3 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6d7b72]">
                    Guests
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#13392f]">1 guest</p>
                </button>
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-[#134e48] px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-[#134e4830] transition hover:bg-[#0f403b]"
                  >
                    Check availability
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-[#134e48] px-4 py-3 text-center text-base font-semibold text-[#134e48] transition hover:bg-[#ecf4ef]"
                  >
                    Send inquiry
                  </button>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-[#f1f6f2] px-4 py-3 text-sm text-[#536156]">
                  <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#134e48]">
                    <span className="absolute left-[22px] h-4 w-4 rounded-full bg-white shadow-sm" />
                  </span>
                  Instant booking confirmation
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#e2e6db] bg-[#f8faf6] p-6 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-[#13392f]">Need help planning?</h3>
              <p className="mt-2 text-sm text-[#5f6f65]">
                Our concierge team can arrange transport, private chefs, and more.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[#134e48] px-5 py-2 text-sm font-semibold text-[#134e48] transition hover:bg-[#ecf4ef]"
              >
                Contact concierge
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
