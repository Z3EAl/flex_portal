// src/app/dashboard/properties/page.tsx
import Image from "next/image";
import Link from "next/link";
import { properties } from "@/lib/properties";

/** Make folder names that match your /public/images/properties/* directories */
function folderFromName(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")  // keep letters, numbers, spaces, hyphens
    .replace(/\s+/g, "-")      // spaces -> hyphens
    .replace(/-+/g, "-")       // compress multi-hyphens
    .trim();
}

function heroSrc(listing: { name: string; slug: string }) {
  // Prefer name; fall back to slug — both slugify to the same folder style
  const folder = folderFromName(listing.name || listing.slug);
  return `/images/properties/${folder}/1.jpg`;
}

export default function PropertiesPage() {
  return (
    <main className="p-6 space-y-6">
      <header className="topbar -mx-6 -mt-6 px-6 py-4 bg-transparent border-0 sticky static">
        <div>
          <h1 className="text-xl font-semibold">Properties</h1>
          <p className="text-sm text-neutral-600">
            Browse all properties and open their public page.
          </p>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((p) => (
          <article
            key={p.slug}
            className="dash-card overflow-hidden flex flex-col"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--tint)]">
              <Image
                src={heroSrc(p)}
                alt={p.name}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 90vw"
                priority={false}
              />
            </div>

            <div className="p-5 space-y-2">
              <p className="text-sm text-neutral-500">{p.location}</p>
              <h3 className="text-lg font-semibold">{p.name}</h3>

              <Link
                href={`/property/${encodeURIComponent(p.slug)}`}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Open property
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
