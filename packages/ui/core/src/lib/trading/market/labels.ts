/** User-facing strings of the market-data widgets; pass a partial `labels` prop to localize. */

export interface OrderBookLabels {
  title: string;
  grouping: string;
  price: string;
  size: string;
  total: string;
  bids: string;
  asks: string;
  bid: string;
  ask: string;
  spread: string;
  crossed: string;
  empty: string;
}

export const DEFAULT_ORDER_BOOK_LABELS: OrderBookLabels = {
  title: "Order book",
  grouping: "Grouping",
  price: "Price",
  size: "Size",
  total: "Total",
  bids: "Bids",
  asks: "Asks",
  bid: "Bid",
  ask: "Ask",
  spread: "Spread",
  crossed: "Crossed",
  empty: "No orders",
};

export interface RecentTradesLabels {
  title: string;
  price: string;
  size: string;
  time: string;
  buy: string;
  sell: string;
  empty: string;
}

export const DEFAULT_RECENT_TRADES_LABELS: RecentTradesLabels = {
  title: "Recent trades",
  price: "Price",
  size: "Size",
  time: "Time",
  buy: "Buy",
  sell: "Sell",
  empty: "No trades yet",
};

export interface TickerBarLabels {
  title: string;
  last: string;
  mark: string;
  index: string;
  change: string;
  high: string;
  low: string;
  volume: string;
  quoteVolume: string;
  openInterest: string;
  funding: string;
  countdown: string;
  up: string;
  down: string;
}

export const DEFAULT_TICKER_BAR_LABELS: TickerBarLabels = {
  title: "Market summary",
  last: "Last price",
  mark: "Mark",
  index: "Index",
  change: "24h change",
  high: "24h high",
  low: "24h low",
  volume: "24h volume",
  quoteVolume: "24h turnover",
  openInterest: "Open interest",
  funding: "Funding",
  countdown: "Next funding in",
  up: "Up",
  down: "Down",
};
