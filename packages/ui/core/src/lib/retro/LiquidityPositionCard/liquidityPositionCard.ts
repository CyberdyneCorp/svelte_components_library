import type { LiquidityTokenAmount } from "./types.js";

/** Fraction digits written in a decimal string ("1.2300" → 4, "7" → 0). */
export function fractionDigits(amount: string): number {
  return /\.(\d*)\s*$/.exec(amount)?.[1].length ?? 0;
}

/** Decimals used to show a token amount: the given ones, else the string's own, so nothing rounds. */
export function tokenAmountDecimals(fee: LiquidityTokenAmount): number {
  return fee.decimals ?? fractionDigits(fee.amount);
}

/** Subtitle parts in display order, skipping the ones not provided. */
export function subtitleParts(parts: {
  tokenId?: string;
  chain?: string;
  walletLabel?: string;
}): string[] {
  return [
    parts.tokenId === undefined || parts.tokenId === "" ? undefined : `#${parts.tokenId}`,
    parts.chain,
    parts.walletLabel,
  ].filter((part): part is string => part !== undefined && part !== "");
}
