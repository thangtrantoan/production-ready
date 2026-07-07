import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string | number,
  pattern = "dd/MM/yyyy",
): string {
  return format(new Date(date), pattern);
}

export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, "dd/MM/yyyy HH:mm");
}
