/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@potluck/contract"],

  headers: async () => [
    {
      // robots.txt asks crawlers not to fetch potluck pages; these headers
      // cover whatever fetches one anyway. They travel with the response, so
      // unlike the meta tag they apply even when the html is never parsed.
      source: "/potluck/:slug*",
      headers: [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
        },
        // A potluck url is its own credential, so it must not ride along in
        // the Referer header to anywhere the visitor clicks next.
        { key: "Referrer-Policy", value: "no-referrer" },
      ],
    },
  ],
};

module.exports = nextConfig;
