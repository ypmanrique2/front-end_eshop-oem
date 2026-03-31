import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind CSS classes intelligently
 * Used by all Shadcn UI components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}