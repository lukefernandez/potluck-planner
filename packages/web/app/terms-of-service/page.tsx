import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Potluck Planner: creating pages, sharing links, and adding dishes.",
  alternates: {
    canonical: "/terms-of-service",
  },
};

const sections = [
  {
    heading: "Acceptance of Terms",
    body: `By accessing or using the Potluck Planner application ("App"), you agree to comply with and be bound by these Terms of Service ("Terms"). Please read these Terms carefully. If you do not agree to these Terms, you may not access or use the App.`,
  },
  {
    heading: "Description of Service",
    body: `The Potluck Planner App provides a platform for users to create potluck events ("Potlucks"), share a link to the Potluck, and allow others to visit the Potluck page and upload items they plan to bring. The App is designed to facilitate the organization of potluck events without requiring user authentication or login.`,
  },
  {
    heading: "User Conduct",
    body: `You are responsible for all activities under your usage of the App. You agree to use the App only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the App.`,
  },
  {
    heading: "Content",
    body: `You retain all ownership rights to the content you provide on the App. However, by submitting content to the App, you grant us a non-exclusive, worldwide, perpetual, irrevocable, royalty-free, sublicensable license to use, reproduce, adapt, publish, translate, create derivative works from, distribute, and display such content in connection with the service provided by the App.`,
  },
  {
    heading: "Data Storage",
    body: `We store all Potlucks, their names, associated items, and the names of the people bringing items in our database. We do not collect any personal data about our users.`,
  },
  {
    heading: "No Warranty",
    body: `The App is provided "as is" and without warranty of any kind. We do not warrant that the App will be error-free or that access thereto will be continuous or uninterrupted.`,
  },
  {
    heading: "Limitation of Liability",
    body: `In no event will we be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the App.`,
  },
  {
    heading: "Changes to Terms",
    body: `We reserve the right to modify or replace these Terms at any time at our sole discretion. Your continued use of the App after any such changes constitutes your acceptance of the new Terms.`,
  },
  {
    heading: "Termination",
    body: `We may terminate or suspend your access to the App immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.`,
  },
  {
    heading: "Governing Law",
    body: `These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the App's company is established, without regard to its conflict of law provisions.`,
  },
  {
    heading: "Contact Us",
    body: `If you have any questions about these Terms, please contact us.`,
  },
];

const TermsOfService = () => (
  <main className="mx-auto max-w-2xl px-6 pb-20 pt-8">
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-soft transition-colors hover:bg-white hover:text-carrot"
    >
      <svg
        aria-hidden="true"
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
      Terms of Service
    </h1>
    <div className="mt-6 space-y-6 text-pretty leading-relaxed text-soft">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="font-display text-xl font-semibold text-zinc-800">{section.heading}</h2>
          <p className="mt-2">{section.body}</p>
        </section>
      ))}
    </div>
  </main>
);

export default TermsOfService;
