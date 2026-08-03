const steps = [
  {
    title: "Create a unique potluck page",
    blurb: "No account needed. It takes about ten seconds.",
  },
  {
    title: "Share it with friends or family",
    blurb: "Send the link by text, email, or group chat.",
  },
  {
    title: "Enjoy a well-catered event",
    blurb: "Everyone can share what they're bringing and see what's coming.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-lg px-6 pt-11">
      <ol className="flex flex-col gap-4 md:gap-5">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="rounded-4xl ring-zinc-800/5 flex items-center gap-6 bg-white p-6 shadow-sm ring-1 md:p-7"
          >
            <span
              aria-hidden
              className="font-display text-carrot shrink-0 text-4xl font-extrabold tabular-nums leading-none tracking-tight"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-zinc-800 text-balance text-lg font-semibold sm:text-xl">
                {step.title}
              </h3>
              <p className="text-soft mt-1 text-base font-medium">{step.blurb}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
