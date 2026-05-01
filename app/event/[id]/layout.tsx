import type { Metadata } from "next";

const EVENTS_DB: Record<string, { title: string; description: string }> = {
  "1": { title: "Safaricom Jazz Festival 2026", description: "Experience the magic of jazz under the Nairobi sky at Carnivore Grounds. Book your tickets now on NeneTickets." },
  "2": { title: "Gor Mahia vs AFC Leopards", description: "The Mashemeji Derby returns! Watch Kenya's biggest football rivalry live at Kasarani Stadium." },
  "3": { title: "Nairobi Tech Week: AI Summit", description: "Join Africa's leading tech minds at the Nairobi AI Summit. Free entry — register your spot on NeneTickets." },
};

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const event = EVENTS_DB[params.id];
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.title,
    description: event.description,
  };
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
