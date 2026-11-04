export const SLOTS = Array.from({ length: 15 }, (_, index) => {
  const start = 9 * 60 + index * (15 + 1);
  const end = start + 15;
  const fmt = (minutes: number) => {
    const hour = Math.floor(minutes / 60);
    return `${hour > 12 ? hour - 12 : hour}:${String(minutes % 60).padStart(2, "0")}`;
  };
  return { id: index, label: `${fmt(start)} ${start < 12 * 60 ? "AM" : "PM"} – ${fmt(end)} ${end < 12 * 60 ? "AM" : "PM"}`, startLabel: `${fmt(start)} ${start < 12 * 60 ? "AM" : "PM"}` };
});
