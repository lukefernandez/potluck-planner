"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

export function CopyUrlButton() {
  const [copied, setCopied] = useState(false);
  const pathName = usePathname();

  // Read the origin at click time rather than at render: this runs on the
  // server too, where window does not exist, and a click only happens once
  // the component is live in the browser.
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + pathName);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // The clipboard API is unavailable outside a secure context; the button
      // simply does nothing rather than showing an error for a shareable link
      // the guest can still copy from the address bar.
    }
  };

  return (
    <button
      className="inline-flex items-center rounded-full bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-cream shadow-soft transition-all duration-200 ease-out-quart hover:-translate-y-0.5 hover:bg-carrot hover:shadow-lift active:translate-y-0"
      onClick={copyUrl}
      type="button"
    >
      {/* The label lives in a status region that exists before the click, so
          the swap to "Link copied!" is announced. */}
      <span role="status" className="inline-flex items-center">
        {copied ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mr-2 h-4 w-4 text-sun"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
            Link copied!
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mr-2 h-4 w-4"
            >
              <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
              <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
            </svg>
            Share
          </>
        )}
      </span>
    </button>
  );
}
