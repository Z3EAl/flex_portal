"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MagicBentoGallery.module.css";

type MagicBentoCard = {
  id: string;
  image: {
    src: string;
    alt: string;
  };
  eyebrow?: string;
  title?: string;
  description?: string;
};

type MagicBentoGalleryProps = {
  cards: MagicBentoCard[];
};

const RIPPLE_LIFETIME_MS = 600;

function createRipple(element: HTMLElement, x: number, y: number) {
  const ripple = document.createElement("span");
  ripple.className = styles.ripple;
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.35;
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x - rect.left - size / 2}px`;
  ripple.style.top = `${y - rect.top - size / 2}px`;
  element.appendChild(ripple);

  window.setTimeout(() => {
    ripple.remove();
  }, RIPPLE_LIFETIME_MS);
}

type CardEventHandlersParams = {
  element: HTMLElement;
  reducedMotion: boolean;
};

function registerInteractiveHandlers({ element, reducedMotion }: CardEventHandlersParams) {
  const setHoverState = (isHovered: boolean) => {
    element.style.setProperty("--magic-hover", isHovered ? "1" : "0");
    if (!isHovered) {
      element.style.removeProperty("--magic-x");
      element.style.removeProperty("--magic-y");
      element.style.removeProperty("--magic-tilt-x");
      element.style.removeProperty("--magic-tilt-y");
      element.style.removeProperty("--magic-shift-x");
      element.style.removeProperty("--magic-shift-y");
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    element.style.setProperty("--magic-x", `${x}px`);
    element.style.setProperty("--magic-y", `${y}px`);

    if (reducedMotion) {
      return;
    }

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    const translateX = (x - centerX) * 0.06;
    const translateY = (y - centerY) * 0.06;

    element.style.setProperty("--magic-tilt-x", `${rotateX}deg`);
    element.style.setProperty("--magic-tilt-y", `${rotateY}deg`);
    element.style.setProperty("--magic-shift-x", `${translateX}px`);
    element.style.setProperty("--magic-shift-y", `${translateY}px`);
  };

  const handlePointerEnter = () => setHoverState(true);
  const handlePointerLeave = () => setHoverState(false);

  const handleClick = (event: MouseEvent) => {
    if (reducedMotion) {
      return;
    }

    createRipple(element, event.clientX, event.clientY);
  };

  element.addEventListener("pointermove", handlePointerMove);
  element.addEventListener("pointerenter", handlePointerEnter);
  element.addEventListener("pointerleave", handlePointerLeave);
  element.addEventListener("click", handleClick);

  return () => {
    element.removeEventListener("pointermove", handlePointerMove);
    element.removeEventListener("pointerenter", handlePointerEnter);
    element.removeEventListener("pointerleave", handlePointerLeave);
    element.removeEventListener("click", handleClick);
  };
}

function MagicBentoCardView({ card, index, reducedMotion }: { card: MagicBentoCard; index: number; reducedMotion: boolean }) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) {
      return;
    }

    const cleanup = registerInteractiveHandlers({ element, reducedMotion });
    return cleanup;
  }, [reducedMotion]);

  return (
    <div
      ref={cardRef}
      className={styles.card}
      data-magic-card
      data-card-index={index}
    >
      <div className={styles.cardSurface}>
        <Image
          src={card.image.src}
          alt={card.image.alt}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 90vw"
          className={styles.cardImage}
          priority={index === 0}
          unoptimized={card.image.src.startsWith("http")}
        />
        <div className={styles.cardOverlay}>
          {card.eyebrow ? <span className={styles.cardLabel}>{card.eyebrow}</span> : null}
          {card.title ? <h3 className={styles.cardTitle}>{card.title}</h3> : null}
          {card.description ? <p className={styles.cardDescription}>{card.description}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default function MagicBentoGallery({ cards }: MagicBentoGalleryProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const normalizedCards = useMemo(() => {
    if (cards.length === 0) {
      return cards;
    }

    if (cards.length >= 6) {
      return cards.slice(0, 6);
    }

    const extended = [...cards];
    let index = 0;
    while (extended.length < 6) {
      extended.push({
        ...cards[index % cards.length],
        id: `${cards[index % cards.length].id}-dup-${extended.length}`,
      });
      index += 1;
    }

    return extended.slice(0, 6);
  }, [cards]);

  return (
    <div className={styles.bentoSection} data-bento-section>
      <div className={styles.cardGrid} data-magic-grid>
        {normalizedCards.map((card, index) => (
          <MagicBentoCardView key={card.id} card={card} index={index} reducedMotion={reducedMotion} />
        ))}
      </div>
    </div>
  );
}
