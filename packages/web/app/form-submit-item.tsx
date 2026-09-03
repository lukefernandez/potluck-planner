"use client";

import { api } from "@/shared/api";
import { useSubmit } from "@/shared/use-submit";
import { DIETARY_FLAGS, type DietaryFlagKey, type DietaryInfo } from "@potluck/contract/dietary";
import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

export function SubmitItemForm() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<Set<DietaryFlagKey>>(new Set());

  const { pending, error, submit } = useSubmit(
    (input: { name: string; person: string; dietary: DietaryInfo }) =>
      api.createItem({ slug, ...input }),
    {
      settle: "reset",
      onSuccess: () => {
        formRef.current?.reset();
        setSelected(new Set());
        router.refresh();
      },
    },
  );

  const toggleOption = (key: DietaryFlagKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submit({
      name: formData.get("name") as string,
      person: formData.get("person") as string,
      dietary: Object.fromEntries(
        DIETARY_FLAGS.map(({ key }) => [key, selected.has(key)]),
      ) as DietaryInfo,
    });
  };

  return (
    <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="person" className="mb-1.5 block text-sm font-semibold text-zinc-800">
          Your name
        </label>
        <input
          type="text"
          name="person"
          id="person"
          required
          disabled={pending}
          placeholder="Jane Smith"
          className="w-full rounded-2xl border-2 border-zinc-800/10 bg-cream/60 px-4 py-3 text-zinc-800 transition-colors placeholder:text-soft/70 focus:border-carrot focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-zinc-800">
          What are you bringing?
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          disabled={pending}
          placeholder="Grandma's famous apple pie"
          className="w-full rounded-2xl border-2 border-zinc-800/10 bg-cream/60 px-4 py-3 text-zinc-800 transition-colors placeholder:text-soft/70 focus:border-carrot focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <fieldset disabled={pending} className="space-y-2.5">
        <legend className="text-sm font-semibold text-zinc-800">
          Heads up — does it contain any of these?
        </legend>
        <div className="flex flex-wrap gap-2">
          {DIETARY_FLAGS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={selected.has(key)}
              onClick={() => toggleOption(key)}
              className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition duration-150 ${
                selected.has(key)
                  ? "border-carrot bg-carrot text-cream shadow-soft"
                  : "border-zinc-800/10 bg-white text-soft hover:border-carrot/40 hover:text-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <div
          role="alert"
          className="flex items-center rounded-2xl bg-blush/15 p-3 text-sm font-medium text-carrot-deep"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mr-2 h-4 w-4 flex-shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center rounded-2xl bg-carrot px-4 py-3 font-semibold text-cream shadow-soft transition duration-200 ease-out-quart hover:-translate-y-0.5 hover:bg-carrot-dark hover:shadow-lift active:translate-y-0 active:bg-carrot-deep disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
      >
        {pending ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Adding...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mr-2 h-4 w-4"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add item
          </>
        )}
      </button>
    </form>
  );
}
