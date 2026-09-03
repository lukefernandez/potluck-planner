"use client";

import { api } from "@/shared/api";
import { useSubmit } from "@/shared/use-submit";
import { useParams, useRouter } from "next/navigation";

export function DeleteItemForm({ id, name }: { id: string; name: string }) {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const { pending, error, submit } = useSubmit(() => api.deleteItem({ slug, itemId: id }), {
    settle: "refresh",
    onSuccess: () => router.refresh(),
  });

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          // Anyone with the link can delete anyone's dish and there is no undo,
          // so a stray tap needs one chance to back out.
          if (confirm(`Remove "${name}" from the table?`)) submit();
        }}
        aria-label="Delete item"
        className="absolute right-3 top-3 rounded-full p-2 text-soft/60 transition-colors hover:bg-blush/20 hover:text-carrot-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <svg
            className="h-5 w-5 animate-spin"
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
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
      {error && (
        <p className="mt-3 rounded-xl bg-blush/15 px-3 py-2 text-sm font-medium text-carrot-deep">
          {error}
        </p>
      )}
    </>
  );
}
