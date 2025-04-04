import Image from "next/image";
import GameSearch from "@/components/GameSearch";

export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <h1 className="text-4x1 font-bold text-center mb-8">
        UNBENCHED
      </h1>
      <GameSearch/>
    </main>
  );
}
