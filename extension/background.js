// TODO: Change to "https://www.viziai.app" before shipping
const API_BASE = "http://localhost:3000";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "IMPORT_REPORTS") {
    handleImport(message.reports).then(sendResponse);
    return true; // keep channel open for async response
  }
});

async function handleImport(reports) {
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (!apiKey) {
    return { success: false, error: "No API key configured" };
  }

  try {
    const response = await fetchWithRetry(
      `${API_BASE}/api/import/enabiz`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ reports }),
      },
      1, // 1 retry on network failure
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    const result = await response.json();
    return { success: true, ...result };
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
