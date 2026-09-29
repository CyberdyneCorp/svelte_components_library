/**
 * A decimal-safe money value. `amount` is a plain decimal string ("-1234.50",
 * "0.000000000000000001") and is never converted to a JS `number`.
 * Without `decimals`, `currency` is an ISO 4217 code ("USD", "BRL"); with
 * `decimals`, it can be any asset code ("ETH", "USDC") shown with exactly that
 * many fraction digits (see `CurrencyDisplay`).
 */
export interface LiquidityMoney {
  amount: string;
  currency: string;
  decimals?: number;
}

/**
 * Fees owed to a position in one token (a Uniswap v3 position owes fees in
 * both tokens of the pair). When `decimals` is omitted the amount keeps its
 * own fraction digits, so nothing is rounded.
 */
export interface LiquidityTokenAmount {
  asset: string;
  amount: string;
  decimals?: number;
}
