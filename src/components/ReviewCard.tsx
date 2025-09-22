"use client";

type Props = {
  guest: string;
  date: string;
  rating: number | null;
  text: string;
};

export default function ReviewCard({ guest, date, rating, text }: Props) {
  return (
    <div className="rounded-2xl border p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="font-medium">{guest}</div>
        <div className="text-sm text-gray-600">{date}</div>
      </div>
      <div className="mt-1 text-sm text-gray-700">Rating: {rating ?? "—"}</div>
      <p className="mt-3 text-gray-900">{text}</p>
    </div>
  );
}
