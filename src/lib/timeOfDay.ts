export type TimeOfDay = "day" | "evening" | "night";

// Local time. Day is morning through late afternoon, evening is the sunset window, night is the rest.
export function timeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 6 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

export function msUntilNextTimeOfDay(date: Date): number {
  const hour = date.getHours();
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  if (hour < 6) next.setHours(6);
  else if (hour < 17) next.setHours(17);
  else if (hour < 20) next.setHours(20);
  else {
    next.setDate(next.getDate() + 1);
    next.setHours(6);
  }
  return Math.max(1000, next.getTime() - date.getTime());
}
