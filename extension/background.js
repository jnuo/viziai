const API_BASE = "https://www.viziai.app";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "IMPORT_REPORT") {
    handleImport(message.report).then(sendResponse);
    return true; // keep channel open for async response
  }
});

// Content hash: SHA-256 of date + hospital + normal count + out-of-ref count.
// Stable fingerprint based on e-Nabız header info — same report always produces same hash.
async function computeContentHash(report) {
  const raw = [
    report.date,
    report.hospital || "",
    report.normalCount || 0,
    report.outOfRefCount || 0,
  ].join("|");
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function handleImport(report) {
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (!apiKey) {
    return { success: false, error: "No API key configured" };
  }

  try {
    const contentHash = await computeContentHash(report);

    const response = await fetchWithRetry(
      `${API_BASE}/api/import/enabiz/pending`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          date: report.date,
          hospital: report.hospital || null,
          contentHash,
          metrics: report.metrics,
        }),
      },
      1, // 1 retry on network failure
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`,
      };
    }

    const result = await response.json();

    // Open review page in a new tab
    const reviewUrl = `${API_BASE}/import/enabiz/${result.id}`;
    chrome.tabs.create({ url: reviewUrl });

    return { success: true, id: result.id };
  } catch (err) {
    return { success: false, error: err.message || "Network error" };
  }
}

async function fetchWithRetry(url, options, retries) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (i === retries) throw err;
      // Wait 1 second before retry
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
