import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/shared/site";
import type { Metadata } from "next";
import Image from "next/image";
import { CreatePotluckForm } from "./form-create-potluck";
import { HowItWorks } from "./how-it-works";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Luke Fernandez",
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-3xl px-6 pt-2 text-center">
        <div>
          <p className="font-display text-zinc-800 mt-10 flex items-center justify-center gap-2.5 text-xl font-bold tracking-tight sm:text-3xl">
            <Image
              src="/logo.svg"
              alt=""
              width={875}
              height={607}
              unoptimized
              priority
              className="h-auto w-12 sm:w-14"
            />
            Potluck Planner
          </p>
          <h1 className="font-display text-zinc-800 mt-7 text-balance text-[1.9rem] font-bold leading-[1.15] tracking-tight sm:mt-9 sm:text-5xl">
            Know what's coming, so you can{" "}
            <span className="text-carrot relative whitespace-nowrap">
              bring what's missing
              <svg
                aria-hidden
                viewBox="0 0 220 16"
                preserveAspectRatio="none"
                className="text-sun absolute -bottom-2 left-0 h-3 w-full"
              >
                <path
                  d="M3 11C40 5 90 4 150 7c25 1.2 50 3 67 5"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>
        </div>

        <div className="rounded-4xl shadow-sm ring-zinc-800/5 mx-auto mt-14 max-w-lg bg-white p-7 text-left ring-1 md:p-9">
          <h2 className="font-display text-zinc-800 text-xl font-semibold md:text-2xl">
            Create your potluck page
          </h2>
          <CreatePotluckForm />
        </div>
      </section>

      <HowItWorks />

      <section className="mx-auto mt-12 max-w-xl px-6 text-center">
        <div className="rounded-4xl bg-shell ring-carrot/10 px-6 py-10 ring-1 shadow-sm">
          <p className="font-display text-zinc-800 text-xl font-semibold">
            Potluck Planner is free and will stay that way.
          </p>
          <p className="text-soft mx-auto mt-2 max-w-sm">
            If it has helped you, please consider making a donation.
          </p>
          <a
            className="ease-out-quart mt-6 inline-block rounded-2xl transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.03]"
            href="https://www.buymeacoffee.com/lukefernandez"
            target="_blank"
            rel="noreferrer"
          >
            <Image alt="Buy me a coffee" src="/buy-me-a-coffee.png" width={180} height={45} />
          </a>
        </div>
      </section>
    </main>
  );
}
