"use client";

import { type ButtonHTMLAttributes, type MouseEvent } from "react";

const defaultMessage = "Send me a $100 Steam gift card to make this functional.";

type GiftCardButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  message?: string;
};

export default function GiftCardButton({
  message = defaultMessage,
  onClick,
  type = "button",
  children,
  ...buttonProps
}: GiftCardButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (type === "submit") {
      event.preventDefault();
    }

    window.alert(message);
    onClick?.(event);
  }

  return (
    <button {...buttonProps} type={type} onClick={handleClick}>
      {children}
    </button>
  );
}
