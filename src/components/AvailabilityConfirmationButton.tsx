"use client";

import { useState, type ComponentProps } from "react";

import GiftCardButton from "./GiftCardButton";

type GiftCardButtonProps = ComponentProps<typeof GiftCardButton>;

type AvailabilityConfirmationButtonProps = GiftCardButtonProps & {
  confirmationText?: string;
  confirmationClassName?: string;
};

export default function AvailabilityConfirmationButton({
  confirmationText = "Availability confirmed",
  confirmationClassName,
  type = "submit",
  onClick,
  ...buttonProps
}: AvailabilityConfirmationButtonProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <div className="space-y-2">
      <GiftCardButton
        {...buttonProps}
        type={type}
        onClick={(event) => {
          setIsConfirmed(true);
          onClick?.(event);
        }}
      />
      {isConfirmed ? (
        <p
          className={`text-sm font-semibold text-[#134e48] ${confirmationClassName ?? ""}`.trim()}
          role="status"
          aria-live="polite"
        >
          {confirmationText}
        </p>
      ) : null}
    </div>
  );
}
