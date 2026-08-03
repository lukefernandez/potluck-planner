import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Potluck Planner handles your data: what we store, what we don't collect, and the choices you have.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

const PrivacyPolicy = () => (
  <main className="mx-auto max-w-2xl px-6 pb-20 pt-8">
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-soft transition-colors hover:bg-white hover:text-carrot"
    >
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      Home
    </Link>

    <h1 className="mt-10 font-display text-4xl font-bold tracking-tight text-zinc-800 md:text-5xl">
      Privacy Policy
    </h1>
    <div className="mt-6 space-y-6 text-pretty leading-relaxed text-soft">
      <p>
        {`This Privacy Policy describes how Potluck Planner ("we", "us", or "our")
        collects, uses, and stores information in connection with the use of our
        application ("App"). By using our App, you agree to the collection and
        use of information in accordance with this policy.`}
      </p>
      <section>
        <h2 className="font-display text-xl font-semibold text-zinc-800">
          Information Collection and Use
        </h2>
        <p className="mt-2">
          While using our App, we ask you to provide us with certain information that can be used to
          facilitate the creation and management of potlucks. This includes the names of potlucks,
          associated items, and the names of the people bringing items. This information is stored
          in our database and is used solely for the purpose of providing and improving our service.
          Please note that we do not collect any personal data about our users. The App is designed
          to be used without the need for user authentication or login.
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold text-zinc-800">Data Storage</h2>
        <p className="mt-2">
          The data we collect from you is stored securely in our database. We implement a variety of
          security measures to maintain the safety of your information. However, no method of
          transmission over the internet or method of electronic storage is 100% secure. While we
          strive to use commercially acceptable means to protect your information, we cannot
          guarantee its absolute security.
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold text-zinc-800">
          Changes to This Privacy Policy
        </h2>
        <p className="mt-2">
          We may update our Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page. You are advised to review this Privacy Policy
          periodically for any changes. Changes to this Privacy Policy are effective when they are
          posted on this page.
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold text-zinc-800">Contact Us</h2>
        <p className="mt-2">
          If you have any questions or suggestions about our Privacy Policy, do not hesitate to
          contact us.
        </p>
      </section>
    </div>
  </main>
);

export default PrivacyPolicy;
