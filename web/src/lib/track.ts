export function track(event: string, metricKey?: string): void {
  const body = JSON.stringify({ event, metricKey });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/events",
      new Blob([body], { type: "application/json" }),
    );
  } else {
    fetch("/api/events", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  }
}
