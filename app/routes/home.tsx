import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Egg bank" },
    { name: "description", content: "Welcome to Egg bank!" },
  ];
}

export default function Home() {
  return <p>The best place for all of your egg trading needs. Better, faster and safer than ever before.</p>;
}
