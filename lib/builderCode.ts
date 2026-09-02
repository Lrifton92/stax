// Base Builder Codes attribution. A builder code is appended as a calldata suffix
// so onchain interactions are attributed to the builder. See
// https://docs.base.org/specifications/builder-codes/overview
import type { Hex } from "viem";

// Set via NEXT_PUBLIC_BUILDER_CODE (obtained on base.dev). Empty = no attribution.
export const BUILDER_CODE: Hex | "" =
  (process.env.NEXT_PUBLIC_BUILDER_CODE as Hex) || "";

// Appends the builder code bytes to the end of calldata. Contracts ignore trailing
// bytes beyond their decoded args, so this is a safe attribution suffix.
export function withBuilderCode(data: Hex): Hex {
  if (!BUILDER_CODE) return data;
  const suffix = BUILDER_CODE.startsWith("0x")
    ? BUILDER_CODE.slice(2)
    : BUILDER_CODE;
  return `${data}${suffix}` as Hex;
}
