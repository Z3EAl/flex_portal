// src/components/ReviewCard.tsx
import type { FC } from "react";

type Props = {
  guest: string;
  date: string;
  rating: number | null;
  text: string;
};

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "h-4 w-4"}>
      <path d="M12 2.5 9.6 8.1l-6.1.5 4.7 3.9L6.5 18l5.5-3.2L17.5 18l-1.7-5.5 4.7-3.9-6.1-.5L12 2.5z" />
    </svg>
  );
}

const ReviewCard: FC<Props> = ({ guest, date, rating, text }) => {
  return (
    <article
      className="rounded-2xl border border-[#e7efe3] bg-[#f8fbf7] p-5 shadow-sm"
      aria-label={`Review by ${guest}`}
    >
      {/* Header: name + inline rating pill (left), date (right) */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-base font-semibold text-[#13392f]">{guest}</h4>
            {rating !== null && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-[#134e48]">
                <StarIcon className="h-3.5 w-3.5 text-[#134e48]" />
                {rating.toFixed?.(1) ?? rating}
              </span>
            )}
          </div>
        </div>

        <time className="shrink-0 text-sm text-[#5f6f65]">{date}</time>
      </header>

      {/* Body: comment */}
      <p className="mt-3 text-sm leading-relaxed text-[#3a4941]">{text}</p>
    </article>
  );
};

export default ReviewCard;
