export type EventMode = "appointment" | "general";
export type EventItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  address: string | null;
  startTime: string | null;
  endTime: string | null;
  mode: EventMode;
  appointmentMinutes: number | null;
  capacity: number | null;
  registered: number;
  active: boolean;
  legacyKind: "photos" | "music" | null;
};
export function minutes(value: string) { const [hours, mins] = value.split(":").map(Number); return hours * 60 + mins; }
export function timeLabel(value: string | null) { if (!value) return ""; const total = minutes(value); const hours = Math.floor(total / 60); return `${hours % 12 || 12}:${String(total % 60).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`; }
export function dateLabel(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
export function slotList(event: Pick<EventItem, "startTime" | "endTime" | "appointmentMinutes">) {
  if (!event.startTime || !event.endTime || !event.appointmentMinutes) return [];
  const start = minutes(event.startTime), end = minutes(event.endTime), size = event.appointmentMinutes;
  return Array.from({ length: Math.max(0, Math.floor((end - start) / size)) }, (_, index) => {
    const first = start + index * size, last = first + size;
    const format = (total: number) => `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    return { index, label: `${timeLabel(format(first))} – ${timeLabel(format(last))}` };
  });
}
export function eventPath(event: Pick<EventItem, "slug" | "legacyKind">) { return event.legacyKind ? `/${event.slug}` : `/events/${event.slug}`; }
export function remaining(event: EventItem) {
  const capacityLeft = event.capacity === null ? Infinity : event.capacity - event.registered;
  const slotLeft = event.mode === "appointment" ? (event.legacyKind === "photos" ? 15 : slotList(event).length) - event.registered : Infinity;
  return Math.max(0, Math.min(capacityLeft, slotLeft));
}
