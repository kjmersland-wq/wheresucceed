/** Who is behind WhereSucceed. Shown in the footer and used on the legal pages. */
export const COMPANY = {
  name: "KM TECH LABS",
  orgNumber: "934 044 029",
  city: "Kristiansand",
  country: "Norway",
  supportEmail: "support@wheresucceed.com",
} as const;

/** Update this when a legal page changes in substance. */
export const LEGAL_UPDATED = "20 October 2026";

export const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/cookies", label: "Cookies" },
  { to: "/refund", label: "Refunds" },
] as const;
