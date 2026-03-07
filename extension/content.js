(function () {
  "use strict";

  // Language detection: Turkish vs English
  const isTurkish =
    document.documentElement.lang === "tr" ||
    document.querySelector('html[lang="tr"]') !== null ||
    document.body.innerText.includes("Sonuç");

  // Two-tone brand wordmark: "Vizi" white + "AI" coral
  const VIZIAI_BRAND = `Vizi<span style="color:#FDA4AF">AI</span>`;

  const LABELS = isTurkish
    ? {
        sendToViziai: `${VIZIAI_BRAND}'a Gönder`,
        importing: "Gönderiliyor…",
        imported: "Gönderildi",
        failed: "Hata",
        noMetrics: "Metrik bulunamadı",
      }
    : {
        sendToViziai: `Send to ${VIZIAI_BRAND}`,
        importing: "Importing…",
        imported: "Imported",
        failed: "Failed",
        noMetrics: "No metrics found",
      };

  // Wait for accordion to be present
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        reject(new Error("Timeout waiting for " + selector));
      }, timeout);
    });
  }

  // Parse date: DD.MM.YYYY → YYYY-MM-DD
  function parseDate(dateStr) {
    const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (!match) return null;
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  // Parse a numeric value, handling Turkish comma decimals
  function parseNumericValue(str) {
    if (!str || typeof str !== "string") return null;
    const cleaned = str.trim().replace(/,/g, ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  // Parse reference range like "197 - 771" or "0.00-1.00" or "< 5.0"
  function parseRefRange(refStr) {
    if (!refStr || typeof refStr !== "string") return { low: null, high: null };
    // e-Nabız prefixes some ranges with "-" (e.g. "-<0.50") — strip it
    const trimmed = refStr.trim().replace(/^-/, "");

    // Handle "< X" format
    const ltMatch = trimmed.match(/^<\s*(.+)$/);
    if (ltMatch) {
      return { low: null, high: parseNumericValue(ltMatch[1]) };
    }

    // Handle "> X" format
    const gtMatch = trimmed.match(/^>\s*(.+)$/);
    if (gtMatch) {
      return { low: parseNumericValue(gtMatch[1]), high: null };
    }

    // Handle "X - Y" or "X-Y" format
    const rangeMatch = trimmed.match(/^(.+?)\s*[-–]\s*(.+)$/);
    if (rangeMatch) {
      return {
        low: parseNumericValue(rangeMatch[1]),
        high: parseNumericValue(rangeMatch[2]),
      };
    }

    return { low: null, high: null };
  }

  // Extract labeled field from a .columnContainer row
  // e.g. "Sonuç : 111.3" → "111.3", "Referans Değeri : 14-72" → "14-72"
  function extractField(bodyRows, prefix) {
    for (const row of bodyRows) {
      const text = row.textContent.trim();
      if (text.startsWith(prefix)) {
        return text.slice(prefix.length).trim();
      }
    }
    return null;
  }

  // Scrape metrics from an expanded accordion panel.
  // Content-driven: finds every "Sonuç :" field, walks up to the parent row,
  // and extracts name/value/unit/ref from siblings. Works regardless of
  // wrapper class names — future-proof against DOM changes.
  function scrapeMetrics(panel) {
    const metrics = [];
    const seen = new Set();

    // Find every element containing "Sonuç :" text
    panel.querySelectorAll(".columnContainer").forEach((col) => {
      const text = col.textContent.trim();
      if (!text.startsWith("Sonuç :")) return;

      // Walk up to the metric row (parent of the columns)
      const row = col.parentElement;
      if (!row || seen.has(row)) return;
      seen.add(row);

      const cols = row.querySelectorAll(".columnContainer");

      // Extract name — try multiple strategies:
      // 1. span[islemadi] attribute (hemogram/grouped style)
      // 2. "İşlem Adı :" field in sibling columns
      // 3. .tahlilHeader span in ancestor .tahlilList card
      const nameSpan = row.querySelector("span[islemadi]");
      let name = nameSpan?.getAttribute("islemadi")?.trim() || "";
      if (!name) name = extractField(cols, "İşlem Adı :") || "";
      if (!name) {
        const card = row.closest(".tahlilList");
        const headerSpan = card?.querySelector(".tahlilHeader span");
        name = headerSpan?.textContent?.trim() || "";
      }
      if (!name) return;

      const valueStr = extractField(cols, "Sonuç :");
      const unit = extractField(cols, "Sonuç Birimi :");
      const refStr = extractField(cols, "Referans Değeri :");

      const value = parseNumericValue(valueStr);
      if (value === null) return;

      const { low, high } = parseRefRange(refStr);

      metrics.push({
        name,
        value,
        unit: unit || undefined,
        ref_low: low,
        ref_high: high,
      });
    });

    return metrics;
  }

  // Parse header to get date, hospital, and normal/outOfRef counts
  function parseHeader(header) {
    let date = null;
    let hospital = null;
    let normalCount = 0;
    let outOfRefCount = 0;

    // Date is in .tAcordionDate span (contains "26 Aralık 2023 26.12.2023")
    const dateEl = header.querySelector(".tAcordionDate");
    if (dateEl) {
      const dateMatch = dateEl.textContent.match(/(\d{2}\.\d{2}\.\d{4})/);
      if (dateMatch) date = parseDate(dateMatch[1]);
    }

    // Hospital is in .hastaneAdi div
    const hospitalEl = header.querySelector(".hastaneAdi");
    if (hospitalEl) {
      hospital = hospitalEl.textContent.trim();
    }

    // Normal/out-of-ref counts from header badges (e.g. "26 Normal", "5 Referans Dışı")
    const headerText = header.textContent || "";
    const normalMatch = headerText.match(/(\d+)\s*Normal/);
    const refDisiMatch = headerText.match(/(\d+)\s*Referans\s*D/);
    if (normalMatch) normalCount = parseInt(normalMatch[1], 10);
    if (refDisiMatch) outOfRefCount = parseInt(refDisiMatch[1], 10);

    return { date, hospital, normalCount, outOfRefCount };
  }

  // ViziAI favicon as inline base64 image
  const VIZIAI_ICON = `<img src="data:image/png;base64,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" width="16" height="16" style="vertical-align: middle; flex-shrink: 0;" alt="">`;

  // Create a styled button
  function createButton(text, onClick, className = "") {
    const btn = document.createElement("button");
    btn.innerHTML = VIZIAI_ICON + `<span>${text}</span>`;
    btn.className = `viziai-btn ${className}`;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(btn);
    });
    return btn;
  }

  // Update button state
  function setButtonState(btn, state, text) {
    btn.innerHTML = VIZIAI_ICON + `<span>${text}</span>`;
    btn.classList.remove(
      "viziai-btn-success",
      "viziai-btn-error",
      "viziai-btn-loading",
    );
    if (state === "loading") {
      btn.classList.add("viziai-btn-loading");
      btn.disabled = true;
    } else if (state === "success") {
      btn.classList.add("viziai-btn-success");
      btn.disabled = true;
    } else if (state === "error") {
      btn.classList.add("viziai-btn-error");
      btn.disabled = false;
    } else {
      btn.disabled = false;
    }
  }

  // Send a single report to background script
  function sendToViziAI(report) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: "IMPORT_REPORT", report },
        (response) => {
          resolve(response || { success: false, error: "No response" });
        },
      );
    });
  }

  // Scrape a single report from an accordion item
  async function scrapeReport(item) {
    const header = item.querySelector(".accordion-header");
    if (!header) return null;

    const { date, hospital, normalCount, outOfRefCount } = parseHeader(header);
    if (!date) return null;

    // Ensure panel is expanded to scrape metrics
    const collapseBtn = header.querySelector("[data-bs-toggle]") || header;
    const panel = item.querySelector(".accordion-collapse");

    if (panel && !panel.classList.contains("show")) {
      collapseBtn.click();
      // Wait for expansion animation
      await new Promise((r) => setTimeout(r, 500));
    }

    const metricsContainer = panel || item;
    const metrics = scrapeMetrics(metricsContainer);

    if (metrics.length === 0) return null;

    return { date, hospital, normalCount, outOfRefCount, metrics };
  }

  // Import a single report
  async function importSingle(item, btn) {
    setButtonState(btn, "loading", LABELS.importing);

    const report = await scrapeReport(item);
    if (!report) {
      setButtonState(btn, "error", LABELS.noMetrics);
      return;
    }

    const result = await sendToViziAI(report);

    if (result.success) {
      setButtonState(btn, "success", LABELS.imported);
    } else {
      setButtonState(btn, "error", `${LABELS.failed}: ${result.error}`);
    }
  }

  // Inject buttons into the accordion
  function injectButtons(accordion) {
    // Remove any previously injected buttons
    accordion.querySelectorAll(".viziai-btn").forEach((el) => el.remove());

    // Add "Send to ViziAI" button per accordion item, inside .pdfBox next to PDF links
    const items = accordion.querySelectorAll(".accordion-item");

    items.forEach((item) => {
      const pdfBox = item.querySelector(".pdfBox");
      if (!pdfBox) return;

      // Don't double-inject
      if (pdfBox.querySelector(".viziai-btn")) return;

      const btn = createButton(LABELS.sendToViziai, (b) =>
        importSingle(item, b),
      );
      pdfBox.appendChild(btn);
    });
  }

  // Watch for accordion changes — AJAX may replace the entire element or just its children
  function observeForAccordion() {
    function tryInject() {
      const accordion = document.querySelector("#accordionTahlilListe");
      if (!accordion) return;

      const items = accordion.querySelectorAll(".accordion-item");
      if (items.length > 0 && !accordion.querySelector(".viziai-btn")) {
        injectButtons(accordion);
      }
    }

    // Observe body for any DOM changes that might affect the accordion
    const observer = new MutationObserver(tryInject);
    observer.observe(document.body, { childList: true, subtree: true });

    // Also try immediately
    tryInject();
  }

  // Show onboarding banner when extension is installed but not configured
  function showOnboardingBanner() {
    const banner = document.createElement("div");
    banner.className = "viziai-onboarding-banner";
    banner.innerHTML = `
      <div class="viziai-onboarding-content">
        ${VIZIAI_ICON}
        <div class="viziai-onboarding-text">
          <strong>ViziAI eklentisi yüklendi!</strong>
          Tahlillerinizi aktarmak için kurulumu tamamlayın.
        </div>
        <a href="https://www.viziai.app/settings/api-keys" target="_blank" class="viziai-onboarding-btn">
          Kurulumu Başlat
        </a>
        <button class="viziai-onboarding-close" aria-label="Kapat">✕</button>
      </div>
    `;

    banner
      .querySelector(".viziai-onboarding-close")
      .addEventListener("click", () => {
        banner.remove();
        sessionStorage.setItem("viziai-banner-dismissed", "1");
      });

    document.body.appendChild(banner);
  }

  // Inject buttons into the page
  async function init() {
    try {
      await waitForElement("#accordionTahlilListe");
    } catch {
      // Accordion not found — not on the right page
      return;
    }

    // Check if API key is configured
    const { apiKey } = await chrome.storage.local.get("apiKey");
    if (!apiKey) {
      // Show onboarding banner if not dismissed this session
      if (!sessionStorage.getItem("viziai-banner-dismissed")) {
        showOnboardingBanner();
      }
      return;
    }

    observeForAccordion();
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
