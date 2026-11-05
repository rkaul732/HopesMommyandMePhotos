import type { Metadata } from "next";
import EventRegistration from "../../../components/event-registration";
export const metadata: Metadata = { title: "Event Registration | HOPES" };
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventRegistration slug={slug}/>;
}
