export type Property = {
  slug: string;
  name: string;
  location: string;
  hero: string;          // image url
  shortSummary: string;
  amenities: string[];
  description: string;
};

export const properties: Property[] = [
  {
    slug: "1C Soho Loft",
    name: "1C Soho Loft",
    location: "Soho, London",
    hero:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=2000&q=80",
    shortSummary: "Stylish loft in the heart of Soho, steps to cafes & nightlife.",
    amenities: ["Self check-in", "Fast Wi-Fi", "Kitchen", "Washer/Dryer"],
    description:
      "A bright, airy loft with modern finishes and exposed brick. Perfect for city explorers and remote workers alike.",
  },
  {
    slug: "2B N1 A - 29 Shoreditch Heights",
    name: "2B N1 A - 29 Shoreditch Heights",
    location: "Shoreditch, London",
    hero:
      "https://images.unsplash.com/photo-1600585154340-0ef3c08dcdb6?auto=format&fit=crop&w=2000&q=80",
    shortSummary: "Contemporary apartment near Shoreditch galleries & markets.",
    amenities: ["Elevator", "Rooftop Access", "Workspace", "Dishwasher"],
    description:
      "Clean, modern space with curated art pieces and a spacious living area. Minutes from bars, boutiques, and transit.",
  },
];

export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find(p => p.slug === slug);
}
