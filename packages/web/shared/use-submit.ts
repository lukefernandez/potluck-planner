import type { ApiResponse } from "@potluck/contract/schema";
import { useState } from "react";

// The submit-and-settle lifecycle shared by every form: flip pending, run the
// call, surface the error or hand the data to onSuccess. The settle policy
// says what happens to pending after success: "reset" returns the form to
// idle; "navigate" and "refresh" hold it until the transition swaps the UI.
type SettlePolicy = "navigate" | "refresh" | "reset";

export const useSubmit = <T, I = void>(
  action: (input: I) => Promise<ApiResponse<T>>,
  { settle, onSuccess }: { settle: SettlePolicy; onSuccess?: (data: T) => void },
) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (input: I) => {
    setError(null);
    setPending(true);

    const result = await action(input);

    if (result.success) {
      onSuccess?.(result.data);
      if (settle === "reset") setPending(false);
    } else {
      setError(result.error.message);
      setPending(false);
    }
  };

  return { pending, error, submit };
};
