export const EXCLUDED_EMAIL = "onurovalii@gmail.com";

const PERIOD_INTERVALS: Record<string, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

export function periodToInterval(period: string): string | null {
  return PERIOD_INTERVALS[period] ?? null;
}
