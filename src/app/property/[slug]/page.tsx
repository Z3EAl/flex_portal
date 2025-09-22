import ApprovedReviews from "@/components/ApprovedReviews";
import MagicBentoGallery from "@/components/MagicBentoGallery";
import { getPropertyBySlug } from "@/lib/properties";
import type { ReactElement } from "react";

/** Types */
type IconProps = { className?: string };
type IconComponent = (props: IconProps) => ReactElement;
type Props = { params: Promise<{ slug: string | string[] }> };

/* ---------- small helpers ---------- */

// Turn the property.slug into the folder name you created in /public/images/properties/<folder>
function slugToFolder(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// build a 5-image local gallery from /public
function buildLocalGallery(folder: string, title: string, count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    src: `/images/properties/${folder}/${i + 1}.jpg`,
    alt: `${title} photo ${i + 1}`,
  }));
}

/* ---------- constants for copy / UI ---------- */

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

const schedule = { checkIn: "3:00 PM", checkOut: "10:00 AM" };
const houseRules = ["No smoking", "No pets", "No parties or events", "Security deposit required"];
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

/* ---------- icons (unchanged) ---------- */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={className ?? "h-5 w-5"} fill="none">
      <path
        d="M16.704 5.368a.75.75 0 0 0-1.058-1.064l-7.21 7.168-3.082-3.063a.75.75 0 1 0-1.054 1.068l3.61 3.587a.75.75 0 0 0 1.058 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
function TvIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <rect x={3.5} y={6} width={17} height={11} rx={2} />
      <path d="M8 19h8M12 17v2" />
    </svg>
  );
}
function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <circle cx={12} cy={12} r={7} />
      <path d="M12 5c2.4 3.4 2.4 10.6 0 14" />
      <path d="M5 12h14" />
      <path d="M8.5 12c0-3.5 1-7 3.5-7s3.5 3.5 3.5 7-1 7-3.5 7-3.5-3.5-3.5-7Z" />
    </svg>
  );
}
function KitchenIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <path d="M6 9h12" />
      <path d="M8 9v6a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V9" />
      <path d="M10 5h4" />
      <path d="M7 5h1M16 5h1" />
    </svg>
  );
}
function WasherIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <rect x={5} y={4} width={14} height={16} rx={2} />
      <circle cx={12} cy={13} r={4} />
      <path d="M9 7h6" />
      <circle cx={9.5} cy={7} r={0.8} fill="currentColor" stroke="none" />
    </svg>
  );
}
function WifiIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <path d="M5 10a11 11 0 0 1 14 0" />
      <path d="M8 13a7 7 0 0 1 8 0" />
      <path d="M11 16a3 3 0 0 1 2 0" />
      <circle cx={12} cy={19} r={1.2} fill="currentColor" stroke="none" />
    </svg>
  );
}
function ElevatorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <rect x={6} y={4} width={12} height={16} rx={2} />
      <path d="M12 8.5 10.5 10h3Z" />
      <path d="M12 15.5 13.5 14h-3Z" />
    </svg>
  );
}
function HairDryerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <path d="M4 10h9a4 4 0 0 0 0-8H4v8Z" />
      <path d="M4 6h9" />
      <path d="M13 6v6" />
      <path d="M13 12h-3l1.5 6" />
    </svg>
  );
}
function HeatingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <path d="M12 5.5c1.7 1.7 3 4.2 3 6.5a3 3 0 0 1-6 0c0-1.1.4-2.2 1.1-3.2" />
      <path d="M13.5 10.5c.6.8.9 1.6.9 2.5a2.4 2.4 0 0 1-4.8.5" />
    </svg>
  );
}
function SmokeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <circle cx={12} cy={8} r={6} />
      <path d="M6 13h12" />
      <path d="M9 16c0 1.5 1.2 2 1.2 3s-.7 1.5-.7 2" />
      <path d="M13.5 16.5c0 1.2.9 1.5.9 2.4s-.6 1.1-.6 1.6" />
    </svg>
  );
}
function KeyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <circle cx={9} cy={9} r={4} />
      <path d="M11.8 11.8 20 20" />
      <path d="M17 17v-3h-3" />
    </svg>
  );
}
function LaptopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <rect x={4} y={5} width={16} height={11} rx={2} />
      <path d="M3 18h18" />
    </svg>
  );
}
function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <path d="M12 3v3M12 18v3M4.9 6.5l2.1 2.1M16.9 16.9l2.2 2.2M3 12h3M18 12h3M6.5 19.1l2.1-2.1M16.9 7.1l2.2-2.2" />
      <circle cx={12} cy={12} r={3.2} />
    </svg>
  );
}
function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <path d="M12 4 5 7v5c0 4.2 2.8 8 7 9 4.2-1 7-4.8 7-9V7Z" />
    </svg>
  );
}
function RulesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M9 12h6M9 16h4" />
      <path d="M14 4v4h4" />
    </svg>
  );
}
function DocumentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <path d="M6 3h9l3 3v15H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M9 12h6M9 16h6M9 8h3" />
    </svg>
  );
}
function ScheduleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"}>
      <circle cx={12} cy={13} r={6} />
      <path d="M8 5V3M16 5V3" />
      <path d="M7 8h10" />
      <path d="M12 13v-2.5l2 1" />
    </svg>
  );
}

/* ---------- compact facts row ---------- */
function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? "h-6 w-6"}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="8" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M17 3a3 3 0 0 1 0 6" />
    </svg>
  );
}
function BedroomIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? "h-6 w-6"}>
      <path d="M3 18V8a2 2 0 0 1 2-2h6a5 5 0 0 1 5 5v7" />
      <path d="M3 13h18" />
      <path d="M7 10h2" />
    </svg>
  );
}
function BathroomIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? "h-6 w-6"}>
      <path d="M3 10h14a3 3 0 0 1 3 3v5H3v-8Z" />
      <path d="M8 3v4" />
      <path d="M6 5h4" />
    </svg>
  );
}
function BedsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className ?? "h-6 w-6"}>
      <rect x="3" y="7" width="18" height="7" rx="2" />
      <path d="M3 18v-2M21 18v-2" />
    </svg>
  );
}
function FactsRow() {
  const items = [
    { icon: UsersIcon, value: "5", label: "Guests" },
    { icon: BedroomIcon, value: "2", label: "Bedrooms" },
    { icon: BathroomIcon, value: "1", label: "Bathrooms" },
    { icon: BedsIcon, value: "3", label: "beds" },
  ];
  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-x-14 gap-y-6">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-4">
            <Icon className="h-7 w-7 text-neutral-600" />
            <div>
              <div className="text-2xl font-semibold text-neutral-900">{value}</div>
              <div className="text-base text-neutral-500">{label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 h-px w-full bg-neutral-200" />
    </>
  );
}

/* ---------- amenity icon helpers ---------- */
const amenityIconMap = new Map<string, IconComponent>([
  ["cable tv", TvIcon],
  ["television", TvIcon],
  ["internet", GlobeIcon],
  ["wireless", WifiIcon],
  ["wifi", WifiIcon],
  ["fast wi-fi", WifiIcon],
  ["kitchen", KitchenIcon],
  ["dishwasher", KitchenIcon],
  ["washing machine", WasherIcon],
  ["washer/dryer", WasherIcon],
  ["hair dryer", HairDryerIcon],
  ["heating", HeatingIcon],
  ["smoke detector", SmokeIcon],
  ["elevator", ElevatorIcon],
  ["self check-in", KeyIcon],
  ["workspace", LaptopIcon],
]);

function getAmenityIcon(name: string): IconComponent {
  const icon = amenityIconMap.get(name.toLowerCase());
  return icon ?? SparkleIcon;
}
function AmenityIcon({ name, className }: { name: string; className?: string }) {
  const Icon = getAmenityIcon(name);
  return <Icon className={className} />;
}

/* ---------- Page (await params in Next 15) ---------- */
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

  // 👉 Build gallery from local files
  const folder = slugToFolder(property.slug);
  const gallery = buildLocalGallery(folder, property.name);
  const bentoCards = gallery.slice(0, 5).map((image, index) => ({
    id: `${folder}-${index}`,
    image,
  }));

  // amenities (merge + dedupe)
  const amenities = Array.from(new Set([...property.amenities, ...defaultAmenities])).slice(0, 8);

  return (
    <main className="min-h-screen bg-[#f5f0e6] pb-20">
      <section className="bg-[#f5f0e6]">
        <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#f5f0e6]">
          <div className="pb-10 pt-12">
            <MagicBentoGallery cards={bentoCards} />
          </div>
        </div>

        {/* Header block with compact facts row */}
        <div className="mx-auto max-w-6xl space-y-0 px-6 pb-12">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(280px,38%)] md:items-end">
            <div>
              <p className="text-[0.8rem] font-semibold uppercase tracking-[0.35em] text-neutral-600">
                The Flex Collection
              </p>
              <h1 className="mt-3 text-5xl/tight font-extrabold text-neutral-900 sm:text-6xl">
                {property.name}
              </h1>
              <p className="mt-2 text-xl text-neutral-500">{property.location}</p>
            </div>
            <p className="text-lg text-neutral-500 md:text-xl">{property.shortSummary}</p>
          </div>

          <FactsRow />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <article className="rounded-3xl border border-[#e2e6db] bg-white/90 p-8 shadow-[0_30px_60px_rgba(18,31,25,0.08)] backdrop-blur">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#13392f]">About this property</h2>
              <p className="text-sm text-[#6d7b72]">Thoughtfully curated interiors with hotel-grade comforts.</p>
            </div>
          </header>
          <p className="text-base leading-relaxed text-[#3a4941]">{property.description}</p>
        </article>

        <div className="mt-10 gap-10 pb-16 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <article className="rounded-3xl border border-[#e4e8dc] bg-[#fdfcf9] p-8 shadow-[0_20px_44px_rgba(23,32,27,0.06)] backdrop-blur">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e3f0e7] text-[#1f3e34]">
                    <SparkleIcon className="h-5 w-5" />
                  </span>
                  <h2 className="text-2xl font-semibold text-[#13392f]">Amenities</h2>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-transparent bg-[#edf5ef] px-4 py-2 text-sm font-medium text-[#134e48] transition hover:border-[#c8dace] hover:bg-white"
                >
                  View all amenities
                </button>
              </div>
              <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {amenities.map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ef] text-[#1f3e34]">
                      <AmenityIcon name={item} className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-[#2f3e35]">{item}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-[#dbe6dc] bg-[#f4f7f2] p-8 shadow-[0_26px_56px_rgba(18,31,25,0.07)]">
              <div className="mb-6 flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e0efe5] text-[#1f3e34]">
                  <ShieldIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-[#13392f]">Stay Policies</h2>
                  <p className="text-sm text-[#5f6f65]">Check what applies before booking</p>
                </div>
              </div>
              <div className="space-y-5">
                <section className="rounded-2xl border border-[#dce7dc] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f1e8] text-[#1f3e34]">
                      <ScheduleIcon className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-semibold text-[#13392f]">Check-in &amp; Check-out</h3>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#e7efe3] bg-[#f8fbf7] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6d7b72]">Check-in Time</p>
                      <p className="mt-2 text-xl font-semibold text-[#13392f]">{schedule.checkIn}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e7efe3] bg-[#f8fbf7] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6d7b72]">Check-out Time</p>
                      <p className="mt-2 text-xl font-semibold text-[#13392f]">{schedule.checkOut}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#dce7dc] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f1e8] text-[#1f3e34]">
                      <RulesIcon className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-semibold text-[#13392f]">House Rules</h3>
                  </div>
                  <ul className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2">
                    {houseRules.map((rule) => (
                      <li key={rule} className="flex items-start gap-3 rounded-xl bg-[#f7faf6] px-3 py-2 text-sm text-[#3a4941]">
                        <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#134e48] text-white">
                          <CheckIcon className="h-3.5 w-3.5" />
                        </span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border border-[#dce7dc] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f1e8] text-[#1f3e34]">
                      <DocumentIcon className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-semibold text-[#13392f]">Cancellation Policy</h3>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {cancellationPolicies.map((policy) => (
                      <div key={policy.title} className="rounded-2xl border border-[#e7efe3] bg-[#f8fbf7] p-5">
                        <p className="text-sm font-semibold text-[#134e48]">{policy.title}</p>
                        <ul className="mt-3 space-y-2 text-sm text-[#3a4941]">
                          {policy.details.map((detail) => (
                            <li key={detail} className="flex gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#134e48]" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </article>

            <article className="rounded-3xl border border-[#e2e6db] bg-white/90 p-8 shadow-[0_24px_50px_rgba(18,31,25,0.06)] backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[#13392f]">Guest Reviews</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-[#7a847c]">Approved only</span>
              </div>
              <ApprovedReviews listing={property.slug} />
            </article>
          </div>

          <aside className="mt-10 space-y-5 pb-16 lg:mt-0 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-[#e2e6db] bg-white p-7 shadow-[0_30px_60px_rgba(18,31,25,0.12)]">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-[#13392f]">Book Your Stay</h3>
                <p className="text-sm text-[#6d7b72]">Select dates to see prices</p>
              </div>
              <form className="mt-6 space-y-5" aria-label="Book your stay">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label htmlFor="check-in" className="block rounded-2xl border border-[#dfe5da] bg-[#f8faf6] px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#6d7b72]">Check-in</span>
                    <input id="check-in" name="check-in" type="date" className="mt-1 w-full border-none bg-transparent text-sm font-medium text-[#13392f] outline-none ring-0 focus:outline-none focus:ring-0" />
                  </label>
                  <label htmlFor="check-out" className="block rounded-2xl border border-[#dfe5da] bg-[#f8faf6] px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#6d7b72]">Check-out</span>
                    <input id="check-out" name="check-out" type="date" className="mt-1 w-full border-none bg-transparent text-sm font-medium text-[#13392f] outline-none ring-0 focus:outline-none focus:ring-0" />
                  </label>
                </div>
                <label htmlFor="guests" className="block rounded-2xl border border-[#dfe5da] bg-[#f8faf6] px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#6d7b72]">Guests</span>
                  <input id="guests" name="guests" type="number" min={1} defaultValue={1} className="mt-1 w-full border-none bg-transparent text-sm font-medium text-[#13392f] outline-none ring-0 focus:outline-none focus:ring-0" />
                </label>
                <fieldset className="rounded-2xl border border-[#dfe5da] bg-[#f8faf6] px-4 py-3">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-[#6d7b72]">Trip type</legend>
                  <div className="mt-3 flex flex-col gap-2 text-sm font-medium text-[#13392f]">
                    <label className="flex items-center gap-3">
                      <input type="radio" name="trip-type" value="leisure" defaultChecked className="h-4 w-4 border-[#b7c5b4] text-[#134e48] focus:ring-[#134e48]" />
                      Leisure
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="trip-type" value="business" className="h-4 w-4 border-[#b7c5b4] text-[#134e48] focus:ring-[#134e48]" />
                      Business
                    </label>
                  </div>
                </fieldset>
                <div className="space-y-3">
                  <button type="submit" className="w-full rounded-2xl bg-[#134e48] px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-[#134e4830] transition hover:bg-[#0f403b]">
                    Check availability
                  </button>
                  <button type="button" className="w-full rounded-2xl border border-[#134e48] px-4 py-3 text-center text-base font-semibold text-[#134e48] transition hover:bg-[#ecf4ef]">
                    Send inquiry
                  </button>
                </div>
                <label className="flex items-center gap-3 rounded-2xl bg-[#f1f6f2] px-4 py-3 text-sm text-[#536156]">
                  <span className="relative inline-flex h-5 w-9 items-center">
                    <input type="checkbox" name="instant-confirmation" defaultChecked className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                    <span className="inline-flex h-full w-full items-center rounded-full bg-[#d9e4da] transition peer-checked:bg-[#134e48]" />
                    <span className="absolute left-1 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-4" />
                  </span>
                  Instant booking confirmation
                </label>
              </form>
            </div>

            <div className="rounded-3xl border border-[#e2e6db] bg-[#f8faf6] p-6 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-[#13392f]">Need help planning?</h3>
              <p className="mt-2 text-sm text-[#5f6f65]">Our concierge team can arrange transport, private chefs, and more.</p>
              <button type="button" className="mt-4 inline-flex items-center justify-center rounded-full border border-[#134e48] px-5 py-2 text-sm font-semibold text-[#134e48] transition hover:bg-[#ecf4ef]">
                Contact concierge
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
