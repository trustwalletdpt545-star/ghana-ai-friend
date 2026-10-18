import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { newId } from "@/lib/threads";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Comfortable AI 🌍 — Ask Me Anything International" },
      { name: "description", content: "AI chatbot built in Ghana for the world: nursing, education, Twi translation, coding and more." },
      { property: "og:title", content: "Comfortable AI 🌍 — Ask Me Anything" },
      { property: "og:description", content: "Built in Ghana for the World. Answers in English, Twi, Ga, Ewe and French." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/chat/$threadId", params: { threadId: newId() }, replace: true });
  }, [navigate]);
  return <div className="min-h-screen bg-background" />;
}
