export function getTimeAgo(time: Date): string {
  const date = new Date(time);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (isNaN(seconds)) return "";
  if (seconds < 5) return "just now";

  const intervals: [number, string][] = [
    [60 * 60 * 24 * 365, "y"],
    [60 * 60 * 24 * 30, "m"],
    [60 * 60 * 24 * 7, "w"],
    [60 * 60 * 24, "d"],
    [60 * 60, "h"],
    [60, "m"],
    [1, "s"],
  ];

  for (const [secondsInUnit, unit] of intervals) {
    const count = Math.floor(seconds / secondsInUnit);

    if (count >= 1) {
      return `${count}${unit} ago`;
    }
  }

  return "just now";
}
