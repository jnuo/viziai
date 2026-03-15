export const EXCLUDED_EMAIL = "onurovalii@gmail.com";

const PERIOD_INTERVALS: Record<string, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

export function periodToInterval(period: string): string | null {
  return PERIOD_INTERVALS[period] ?? null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateFilter(searchParams: URLSearchParams): {
  interval: string | null;
  from: string | null;
  to: string | null;
} {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from && to && ISO_DATE.test(from) && ISO_DATE.test(to)) {
    if (!isNaN(Date.parse(from)) && !isNaN(Date.parse(to))) {
      return { interval: null, from, to };
    }
  }
  const period = searchParams.get("period") || "30d";
  return { interval: periodToInterval(period), from: null, to: null };
}
