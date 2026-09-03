"use client";

import { api } from "@/shared/api";
import { useSubmit } from "@/shared/use-submit";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

export function CreatePotluckForm() {
  const router = useRouter();
  const { pending, error, submit } = useSubmit(
    (input: { name: string }) => api.createPotluck(input),
    {
      settle: "navigate",
      onSuccess: (potluck) => router.push(`/potluck/${potluck.id}`),
    },
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submit({ name: formData.get("name") as string });
  };

  const currentYear = new Date().getFullYear();

  return (
    <form className="mt-3 flex flex-col gap-4" onSubmit={handleSubmit}>
      <label htmlFor="potluck-name" className="sr-only">
        Potluck name
      </label>
      <input
        id="potluck-name"
        className="border-zinc-800/10 bg-cream/60 text-zinc-800 placeholder:text-soft/70 focus:border-carrot w-full rounded-2xl border-2 px-5 py-3.5 text-lg transition-colors focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={`e.g. Friendsgiving ${currentYear}`}
        type="text"
        name="name"
        required
        disabled={pending}
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-carrot text-cream shadow-soft ease-out-quart hover:bg-carrot-dark hover:shadow-lift active:bg-carrot-deep flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Setting the table…" : "Submit"}
      </button>
      {error && (
        <p
          role="alert"
          className="bg-blush/15 text-carrot-deep rounded-xl px-4 py-2.5 text-sm font-medium"
        >
          {error}
        </p>
      )}
    </form>
  );
}
