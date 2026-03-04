(function () {
  "use strict";

  // Language detection: Turkish vs English
  const isTurkish =
    document.documentElement.lang === "tr" ||
    document.querySelector('html[lang="tr"]') !== null ||
    document.body.innerText.includes("Sonuç");

  const LABELS = isTurkish
    ? {
        sendToViziai: "ViziAI'a Gönder",
        importAll: "Tümünü İçe Aktar",
        importing: "Gönderiliyor…",
        imported: "Gönderildi",
        failed: "Hata",
        alreadyImported: "Zaten aktarılmış",
        noMetrics: "Metrik bulunamadı",
      }
    : {
        sendToViziai: "Send to ViziAI",
        importAll: "Import All",
        importing: "Importing…",
        imported: "Imported",
        failed: "Failed",
        alreadyImported: "Already imported",
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
    const trimmed = refStr.trim();

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

  // Scrape metrics from an expanded accordion panel
  // Each .tahlilList card is one metric with header (name) and body (value/unit/ref)
  function scrapeMetrics(panel) {
    const metrics = [];
    const cards = panel.querySelectorAll(".tahlilList");

    cards.forEach((card) => {
      const nameEl = card.querySelector(".tahlilHeader span");
      if (!nameEl) return;
      const name = nameEl.textContent.trim();
      if (!name) return;

      const bodyRows = card.querySelectorAll(".tahlilBody .columnContainer");
      const valueStr = extractField(bodyRows, "Sonuç :");
      const unit = extractField(bodyRows, "Sonuç Birimi :");
      const refStr = extractField(bodyRows, "Referans Değeri :");

      // Skip non-numeric values (Pozitif/Negatif etc.)
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

  // Parse header to get date and hospital
  function parseHeader(header) {
    let date = null;
    let hospital = null;

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

    return { date, hospital };
  }

  // Create a styled button
  function createButton(text, onClick, className = "") {
    const btn = document.createElement("button");
    btn.textContent = text;
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
    btn.textContent = text;
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

  // Send reports to background script
  function sendToViziAI(reports) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: "IMPORT_REPORTS", reports },
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

    const { date, hospital } = parseHeader(header);
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

    return { date, hospital, metrics };
  }

  // Import a single report
  async function importSingle(item, btn) {
    setButtonState(btn, "loading", LABELS.importing);

    const report = await scrapeReport(item);
    if (!report) {
      setButtonState(btn, "error", LABELS.noMetrics);
      return;
    }

    const result = await sendToViziAI([report]);

    if (result.success) {
      if (result.skipped > 0 && result.imported === 0) {
        setButtonState(btn, "success", LABELS.alreadyImported);
      } else {
        setButtonState(
          btn,
          "success",
          `${LABELS.imported} (${report.metrics.length})`,
        );
      }
    } else {
      setButtonState(btn, "error", `${LABELS.failed}: ${result.error}`);
    }
  }

  // Import all reports
  async function importAll(btn) {
    setButtonState(btn, "loading", LABELS.importing);

    const items = document.querySelectorAll(
      "#accordionTahlilListe .accordion-item",
    );

    const reports = [];
    for (const item of items) {
      const report = await scrapeReport(item);
      if (report) reports.push(report);
    }

    if (reports.length === 0) {
      setButtonState(btn, "error", LABELS.noMetrics);
      return;
    }

    const result = await sendToViziAI(reports);

    if (result.success) {
      const msg = `${LABELS.imported} (${result.imported}/${reports.length})`;
      setButtonState(btn, "success", msg);
    } else {
      setButtonState(btn, "error", `${LABELS.failed}: ${result.error}`);
    }
  }

  // Inject buttons into the accordion
  function injectButtons(accordion) {
    // Remove any previously injected buttons
    accordion.parentElement
      .querySelectorAll(".viziai-import-all")
      .forEach((el) => el.remove());
    accordion.querySelectorAll(".viziai-btn-sm").forEach((el) => el.remove());

    // Add "Import All" button at the top
    const importAllBtn = createButton(
      LABELS.importAll,
      (btn) => importAll(btn),
      "viziai-btn-primary viziai-import-all",
    );
    accordion.parentElement.insertBefore(importAllBtn, accordion);

    // Add "Send to ViziAI" button per accordion item
    const items = accordion.querySelectorAll(".accordion-item");

    items.forEach((item) => {
      const header = item.querySelector(".accordion-header");
      if (!header) return;

      const btn = createButton(
        LABELS.sendToViziai,
        (b) => importSingle(item, b),
        "viziai-btn-sm",
      );
      header.style.position = "relative";
      header.appendChild(btn);
    });
  }

  // Watch for accordion changes — AJAX may replace the entire element or just its children
  function observeForAccordion() {
    let currentAccordion = null;

    function tryInject() {
      const accordion = document.querySelector("#accordionTahlilListe");
      if (!accordion) return;

      // Track if the accordion element was replaced
      if (accordion !== currentAccordion) {
        currentAccordion = accordion;
      }

      const items = accordion.querySelectorAll(".accordion-item");
      // Only inject if there are items and buttons aren't already present
      const hasButtons =
        accordion.parentElement?.querySelector(".viziai-import-all");
      if (items.length > 0 && !hasButtons) {
        injectButtons(accordion);
      }
    }

    // Observe body for any DOM changes that might affect the accordion
    const observer = new MutationObserver(tryInject);
    observer.observe(document.body, { childList: true, subtree: true });

    // Also try immediately
    tryInject();
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
    if (!apiKey) return;

    observeForAccordion();
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
