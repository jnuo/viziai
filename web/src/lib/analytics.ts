type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export function trackEvent({ action, category, label, value }: GtagEvent) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = typeof window !== "undefined" ? (window as any).gtag : null;
  if (!gtag) return;
  gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}
