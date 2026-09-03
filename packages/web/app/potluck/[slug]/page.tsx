import { DeleteItemForm } from "@/app/form-delete-item";
import { SubmitItemForm } from "@/app/form-submit-item";
import { CopyUrlButton } from "@/components/copy-url-button";
import { api } from "@/shared/api";
import { classify } from "@potluck/contract/dietary";
import { ErrorCode } from "@potluck/contract/schema";
import { SITE_NAME } from "@/shared/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// A slug that isn't a well-formed uuid can't name a potluck that exists, so
// the API rejects it as invalid rather than reporting it missing. To someone
// following a truncated or mistyped link both mean the same thing, and both
// should land on the not-found page rather than an error.
const isMissing = (code: ErrorCode) =>
  code === ErrorCode.NOT_FOUND || code === ErrorCode.VALIDATION_ERROR;

// Potluck pages are unlisted and shared by link, so they are excluded from
// search indexes — but the metadata below still powers link previews in
// texts, chats, and email.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await api.getPotluck({ slug });

  if (!result.success) {
    if (isMissing(result.error.code)) {
      return {
        title: "Potluck not found",
        robots: { index: false, follow: false },
      };
    }
    throw new Error(result.error.message);
  }

  const { potluck, items } = result.data;
  const description =
    items.length === 0
      ? `You're invited! Be the first to add a dish to ${potluck.name}.`
      : `You're invited! ${items.length} ${
          items.length === 1 ? "dish is" : "dishes are"
        } signed up so far — see what's coming and add yours.`;

  return {
    title: potluck.name,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: potluck.name,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: potluck.name,
      description,
    },
  };
}

const BADGE_CLASS = {
  diet: "bg-[#E4F4EC] text-[#1B7A4B]",
  "free-from": "bg-zinc-800/[0.06] text-soft",
} as const;

export default async function Potluck({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await api.getPotluck({ slug });

  if (!result.success) {
    if (isMissing(result.error.code)) {
      notFound();
    }
    throw new Error(result.error.message);
  }

  const { potluck, items } = result.data;

  return (
    <main className="px-6 pb-16 pt-8 md:pt-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-zinc-800 text-balance text-4xl font-bold tracking-tight md:text-5xl">
            {potluck.name}
          </h1>
          <div className="mt-6 flex items-center justify-center gap-3">
            <CopyUrlButton />
            <Link
              href="/"
              className="text-zinc-800 shadow-soft ease-out-quart hover:shadow-lift inline-flex items-center rounded-full border border-zinc-800/20 bg-transparent px-[19px] py-[9px] text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="mr-0.5 h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New potluck
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
          <div className="rounded-4xl shadow-soft ring-zinc-800/5 bg-white p-6 ring-1 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="bg-carrot text-cream flex h-10 w-10 items-center justify-center rounded-xl">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.4}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
              <h2 className="font-display text-zinc-800 text-xl font-semibold">Add a dish</h2>
            </div>
            <SubmitItemForm />
          </div>

          <div className="rounded-4xl shadow-soft ring-zinc-800/5 bg-white p-6 ring-1 md:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-zinc-800 text-xl font-semibold">On the table</h2>
              <span className="bg-shell text-carrot-deep rounded-full px-3 py-1 text-sm font-semibold">
                {items.length} {items.length === 1 ? "dish" : "dishes"}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="bg-shell/60 flex flex-col items-center rounded-3xl px-6 py-10 text-center">
                <span className="text-3xl" aria-hidden>
                  🍽️
                </span>
                <p className="font-display text-zinc-800 mt-3 text-lg font-semibold">
                  The table&apos;s empty
                </p>
                <p className="text-soft mt-1 max-w-[28ch] text-sm">Be the first to claim a dish.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="bg-shell/50 hover:bg-shell relative rounded-3xl p-5 transition-colors"
                  >
                    <div className="min-w-0 pr-10">
                      <p className="text-zinc-800 break-words font-semibold">{item.name}</p>
                      <p className="text-soft text-sm">{item.person}</p>
                      {classify(item).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {classify(item).map((badge) => (
                            <span
                              key={badge.label}
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE_CLASS[badge.kind]}`}
                            >
                              {badge.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <DeleteItemForm id={item.id} name={item.name} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
