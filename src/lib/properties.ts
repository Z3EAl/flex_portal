// src/lib/properties.ts
export type PropertyImage = { src: string; alt: string };

export type Property = {
  slug: string;
  name: string;
  location: string;
  hero: string;             // first image (used for meta / fallback)
  shortSummary: string;
  amenities: string[];
  description: string;
  gallery: PropertyImage[]; // local images
  googlePlaceId?: string;
};

// Helper to build gallery entries from /public
function gallery(folder: string, alts: string[]): PropertyImage[] {
  return alts.map((alt, i) => ({
    src: `/images/properties/${folder}/${i + 1}.jpg`,
    alt,
  }));
}

export const properties: Property[] = [
  {
    slug: "1C Soho Loft",
    name: "1C Soho Loft",
    location: "Soho, London",
    googlePlaceId: "ChIJSohoLoft",
    shortSummary: "Stylish loft in the heart of Soho, steps to cafes & nightlife.",
    amenities: ["Self check-in", "Fast Wi-Fi", "Kitchen", "Washer/Dryer"],
    description:
      "A bright, airy loft with modern finishes and exposed brick. Perfect for city explorers and remote workers alike.",
    gallery: gallery("1c-soho-loft", [
      "Soho loft living room with exposed brick",
      "Minimal kitchen with open shelving",
      "Modern bedroom with soft textures",
      "Walk-in shower bathroom",
      "Compact workspace nook",
    ]),
    hero: `/images/properties/1c-soho-loft/1.jpg`,
  },
  {
    slug: "2B N1 A - 29 Shoreditch Heights",
    name: "2B N1 A - 29 Shoreditch Heights",
    location: "Shoreditch, London",
    googlePlaceId: "ChIJShoreditchHeights",
    shortSummary: "Contemporary apartment near Shoreditch galleries & markets.",
    amenities: ["Elevator", "Rooftop Access", "Workspace", "Dishwasher"],
    description:
      "Clean, modern space with curated art pieces and a spacious living area. Minutes from bars, boutiques, and transit.",
    gallery: gallery("2b-n1-a-29-shoreditch-heights", [
      "Shoreditch living room with large windows",
      "Soft-light bedroom with upholstered headboard",
      "Contemporary tiled bathroom",
      "Kitchen with warm wood cabinetry",
      "Balcony view over Shoreditch",
    ]),
    hero: `/images/properties/2b-n1-a-29-shoreditch-heights/1.jpg`,
  },
  {
    slug: "Vast 2 Bed Balcony Flat in Highbury",
    name: "Vast 2 Bed Balcony Flat in Highbury",
    location: "Highbury, London",
    googlePlaceId: "ChIJHighburyBalcony",
    shortSummary: "Family-friendly flat with balcony and green views.",
    amenities: ["Heating", "Smoke Detector", "Fast Wi-Fi", "Kitchen"],
    description:
      "Spacious, calm, and light—ideal for longer stays. Close to parks and transit with a private balcony for morning coffee.",
    gallery: gallery("vast-2-bed-balcony-flat-in-highbury", [
      "Highbury living room opening to balcony",
      "Dining nook with seating for four",
      "Bright bedroom with large window",
      "Tiled bathroom with shower",
      "Bright white kitchen with full appliances",
    ]),
    hero: `/images/properties/vast-2-bed-balcony-flat-in-highbury/1.jpg`,
  },
];

export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find((p) => p.slug === slug);
}
