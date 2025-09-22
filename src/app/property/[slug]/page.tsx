import Image from "next/image";
import ApprovedReviews from "@/components/ApprovedReviews";
import { getPropertyBySlug } from "@/lib/properties";

type Props = {
  params: Promise<{ slug: string | string[] }>;
};

export default async function PropertyPage({ params }: Props) {
  // In Next 15, params is a Promise in server components.
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-64 w-full bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={property.hero}
            alt={property.name}
            fill
            className="object-contain md:object-cover"
            priority
          />
        </div>
      </section>

      {/* Content container */}
      <section className="mx-auto max-w-5xl px-4 py-6 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <p className="text-gray-600">{property.location}</p>
          </div>
          <div className="text-sm text-gray-500">{property.shortSummary}</div>
        </header>

        {/* Meta / Amenities */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold mb-2">About this place</h2>
            <p className="text-gray-800 leading-relaxed">{property.description}</p>
          </div>
          <aside className="rounded-2xl border bg-white p-5">
            <h3 className="text-base font-semibold mb-2">Amenities</h3>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {property.amenities.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </aside>
        </div>

        {/* Reviews section */}
        <section className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Guest Reviews</h2>
            <span className="text-xs text-gray-500">Only approved reviews are shown</span>
          </div>
          <div className="mt-4">
            <ApprovedReviews listing={property.slug} />
          </div>
        </section>
      </section>
    </main>
  );
}
