import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import animationData from "@/assets/lottie-json"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const colors = [
  "bg-[#ff6a2a57] text-[#ff6a00] border-[1px] border-[#ff6a00aa]",
  "bg-[#6d6a2a57] text-[#ffb800] border-[1px] border-[#ffb800aa]",
  "bg-[#0d6a0257] text-[#0ed06a] border-[1px] border-[#0ed06aaa]",
  "bg-[#4c6cf057] text-[#4c6cf0] border-[1px] border-[#4c6cf0bb]",
];

export const getColor = (color) => {
  if (color >= 0 && color < colors.length) {
    return colors[color];
  }
  return colors[0]; // fallback to first color
};

export const animationDefaultOptions = {
  loop: true,
  autoplay: true,
  animationData,
}