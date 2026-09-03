"use client";

// Non-NOT_FOUND failures from the Potluck page land here: the guest's link is
// fine, the server hiccuped. Missing potlucks keep the not-found page.
export default function PotluckError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="px-6 pt-[20vh] text-center">
      <h1 className="font-display text-zinc-800 mt-6 text-4xl font-bold tracking-tight md:text-5xl">
        Couldn&apos;t load this potluck.
      </h1>
      <p className="text-soft mx-auto mt-4 max-w-sm text-lg">
        Your link is fine &mdash; something went wrong on our end. Give it another try.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-carrot text-cream shadow-soft ease-out-quart hover:bg-carrot-dark hover:shadow-lift active:bg-carrot-deep mt-6 inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0"
      >
        Try again
      </button>
    </main>
  );
}
