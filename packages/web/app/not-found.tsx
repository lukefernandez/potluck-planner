import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="px-6 pt-[20vh] text-center">
      <h1 className="font-display text-zinc-800 mt-6 text-4xl font-bold tracking-tight md:text-5xl">
        Page not found.
      </h1>
      <p className="text-soft mx-auto mt-4 max-w-sm text-lg">
        Double-check the link, or head to the home page to start a fresh potluck.
      </p>
      <Link
        href="/"
        className="bg-carrot text-cream shadow-soft ease-out-quart hover:bg-carrot-dark hover:shadow-lift active:bg-carrot-deep mt-6 inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
      >
        Back home
      </Link>
    </main>
  );
}
