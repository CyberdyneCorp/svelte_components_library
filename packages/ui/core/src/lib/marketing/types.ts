import type { Snippet } from "svelte";

export type MarketingHeadingLevel = "h1" | "h2" | "h3";
export type MarketingSectionTone = "default" | "muted" | "accent";
export type MarketingSectionWidth = "narrow" | "standard" | "wide" | "full";

export type MarketingAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "text";
};

export type MarketingFeature = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  href?: string;
  linkLabel?: string;
};

export type MarketingLogo = {
  id: string;
  name: string;
  src?: string;
  alt?: string;
  href?: string;
};

export type MarketingTestimonial = {
  id: string;
  quote: string;
  author: string;
  role?: string;
  organization?: string;
  avatarSrc?: string;
};

export type MarketingPlan = {
  id: string;
  name: string;
  description?: string;
  price: string;
  period?: string;
  features: string[];
  action: MarketingAction;
  badge?: string;
  highlighted?: boolean;
};

export type MarketingFaqItem = {
  id: string;
  question: string;
  answer: string | Snippet;
};

export type MarketingMetric = {
  id: string;
  label: string;
  value: string;
  description?: string;
};

export type MarketingLink = {
  label: string;
  href: string;
};

export type MarketingLinkGroup = {
  id: string;
  label: string;
  links: MarketingLink[];
};
