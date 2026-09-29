/**
 * Default English strings for the order-entry components. Every visible or
 * accessible string can be replaced through the components' `labels` prop
 * (a partial object merged over these defaults).
 */
import type { MarginMode, OrderType, Side, TimeInForce } from "../types.js";

export interface LeverageSliderLabels {
  /** Visible label of the slider. */
  label: string;
  /** Accessible name of the numeric input next to the slider. */
  input: string;
  /** Value text, used for `aria-valuetext` and the marks: `20` → `"20×"`. */
  value: (leverage: number) => string;
  /** Accessible name of a mark button: `25` → `"Set leverage to 25×"`. */
  mark: (leverage: number) => string;
}

export const DEFAULT_LEVERAGE_LABELS: LeverageSliderLabels = {
  label: "Leverage",
  input: "Leverage value",
  value: (leverage) => `${leverage}×`,
  mark: (leverage) => `Set leverage to ${leverage}×`,
};

export interface OrderTicketLabels {
  /** Accessible name of the ticket form. */
  form: string;
  side: string;
  sides: Record<Side, string>;
  orderType: string;
  orderTypes: Record<OrderType, string>;
  price: string;
  triggerPrice: string;
  size: string;
  sizeUnit: string;
  /** Accessible name of the size-percentage slider. */
  sizePercent: string;
  /** Value text of the size-percentage slider: `25` → `"25%"`. */
  percent: (value: number) => string;
  available: string;
  marginMode: string;
  marginModes: Record<MarginMode, string>;
  reduceOnly: string;
  postOnly: string;
  timeInForce: string;
  timeInForceOptions: Record<TimeInForce, string>;
  takeProfit: string;
  stopLoss: string;
  preview: string;
  notional: string;
  initialMargin: string;
  estimatedFee: string;
  liquidationPrice: string;
  /** Placeholder for a preview value that cannot be computed yet. */
  unavailable: string;
  /** Submit button text for the selected side and order type. */
  submit: (side: Side, type: OrderType) => string;
  errorRequired: string;
  errorPositive: string;
  errorMinSize: (min: string) => string;
  errorMaxSize: (max: string) => string;
  errorMinNotional: (min: string) => string;
  errorInsufficientMargin: string;
  errorNoReferencePrice: string;
  errorLeverage: (max: number) => string;
  errorTakeProfitAbove: string;
  errorTakeProfitBelow: string;
  errorStopLossBelow: string;
  errorStopLossAbove: string;
  leverage: LeverageSliderLabels;
}

/** The ticket's `labels` prop: any subset, with a partial `leverage` object. */
export type OrderTicketLabelsInput = Partial<Omit<OrderTicketLabels, "leverage">> & {
  leverage?: Partial<LeverageSliderLabels>;
};

export const DEFAULT_ORDER_TICKET_LABELS: OrderTicketLabels = {
  form: "Order ticket",
  side: "Side",
  sides: { long: "Long", short: "Short" },
  orderType: "Order type",
  orderTypes: {
    market: "Market",
    limit: "Limit",
    "stop-market": "Stop market",
    "stop-limit": "Stop limit",
  },
  price: "Price",
  triggerPrice: "Trigger price",
  size: "Size",
  sizeUnit: "Size unit",
  sizePercent: "Size as a percentage of available margin",
  percent: (value) => `${value}%`,
  available: "Available",
  marginMode: "Margin mode",
  marginModes: { cross: "Cross", isolated: "Isolated" },
  reduceOnly: "Reduce only",
  postOnly: "Post only",
  timeInForce: "Time in force",
  timeInForceOptions: { GTC: "GTC", IOC: "IOC", FOK: "FOK" },
  takeProfit: "Take profit",
  stopLoss: "Stop loss",
  preview: "Order preview",
  notional: "Notional",
  initialMargin: "Initial margin",
  estimatedFee: "Estimated fee",
  liquidationPrice: "Est. liquidation price",
  unavailable: "—",
  submit: (side) => (side === "long" ? "Buy / Long" : "Sell / Short"),
  errorRequired: "Required",
  errorPositive: "Must be greater than zero",
  errorMinSize: (min) => `Minimum size is ${min}`,
  errorMaxSize: (max) => `Maximum size is ${max}`,
  errorMinNotional: (min) => `Minimum order value is ${min}`,
  errorInsufficientMargin: "Insufficient available margin",
  errorNoReferencePrice: "No reference price to convert the size",
  errorLeverage: (max) => `Leverage must be between 1× and ${max}×`,
  errorTakeProfitAbove: "Take profit must be above the entry price",
  errorTakeProfitBelow: "Take profit must be below the entry price",
  errorStopLossBelow: "Stop loss must be below the entry price",
  errorStopLossAbove: "Stop loss must be above the entry price",
  leverage: DEFAULT_LEVERAGE_LABELS,
};

export interface PositionsTableLabels {
  caption: string;
  market: string;
  side: string;
  sides: Record<Side, string>;
  size: string;
  entryPrice: string;
  markPrice: string;
  liquidationPrice: string;
  margin: string;
  marginModes: Record<MarginMode, string>;
  unrealizedPnl: string;
  tpsl: string;
  actions: string;
  /** Leverage badge next to the side: `10` → `"10×"`. */
  leverage: (leverage: number) => string;
  closeMarket: string;
  closeLimit: string;
  editTpsl: string;
  /** Group name of a row's actions, for assistive tech. */
  rowActions: (market: string, side: string) => string;
  none: string;
  empty: string;
}

export const DEFAULT_POSITIONS_LABELS: PositionsTableLabels = {
  caption: "Open positions",
  market: "Market",
  side: "Side",
  sides: { long: "Long", short: "Short" },
  size: "Size",
  entryPrice: "Entry",
  markPrice: "Mark",
  liquidationPrice: "Liq. price",
  margin: "Margin",
  marginModes: { cross: "Cross", isolated: "Isolated" },
  unrealizedPnl: "Unrealized PnL (ROE)",
  tpsl: "TP / SL",
  actions: "Actions",
  leverage: (leverage) => `${leverage}×`,
  closeMarket: "Market close",
  closeLimit: "Limit close",
  editTpsl: "Edit TP/SL",
  rowActions: (market, side) => `${market} ${side} actions`,
  none: "—",
  empty: "No open positions",
};

export interface OpenOrdersTableLabels {
  caption: string;
  market: string;
  side: string;
  sides: Record<Side, string>;
  type: string;
  orderTypes: Record<OrderType, string>;
  price: string;
  /** Trigger shown in the price column: `"65,000.0"` → `"Trigger 65,000.0"`. */
  trigger: (price: string) => string;
  marketPrice: string;
  size: string;
  filled: string;
  reduceOnly: string;
  yes: string;
  no: string;
  timeInForce: string;
  time: string;
  actions: string;
  cancel: string;
  /** Accessible name of a row's cancel button, starting with the visible text. */
  cancelOrder: (market: string, side: string, type: string) => string;
  cancelAll: string;
  empty: string;
}

export const DEFAULT_OPEN_ORDERS_LABELS: OpenOrdersTableLabels = {
  caption: "Open orders",
  market: "Market",
  side: "Side",
  sides: { long: "Long", short: "Short" },
  type: "Type",
  orderTypes: DEFAULT_ORDER_TICKET_LABELS.orderTypes,
  price: "Price",
  trigger: (price) => `Trigger ${price}`,
  marketPrice: "Market",
  size: "Size",
  filled: "Filled",
  reduceOnly: "Reduce only",
  yes: "Yes",
  no: "No",
  timeInForce: "TIF",
  time: "Time",
  actions: "Actions",
  cancel: "Cancel",
  cancelOrder: (market, side, type) => `Cancel ${market} ${side} ${type}`,
  cancelAll: "Cancel all",
  empty: "No open orders",
};
