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

  // Scrape metrics from an expanded accordion panel
  function scrapeMetrics(panel) {
    const metrics = [];
    // Look for metric cards/rows within the panel
    const rows = panel.querySelectorAll(
      ".tahlilList .card, .tahlilList tr, .tahlilList .list-group-item",
    );

    if (rows.length === 0) {
      // Try alternative selectors
      const altRows = panel.querySelectorAll(
        "table tbody tr, .result-row, [class*='tahlil']",
      );
      altRows.forEach((row) => parseMetricRow(row, metrics));
    } else {
      rows.forEach((row) => parseMetricRow(row, metrics));
    }

    return metrics;
  }

  function parseMetricRow(row, metrics) {
    // Try to find name, value, unit, reference from the row
    const cells = row.querySelectorAll("td, .card-body > div, span, p");
    if (cells.length < 2) return;

    // Strategy: look for text content patterns
    const texts = Array.from(cells).map((c) => c.textContent.trim());

    // Find the metric name (usually first non-empty cell)
    let name = null;
    let valueStr = null;
    let unit = null;
    let refStr = null;

    // Try structured approach: name in first significant cell, value/unit/ref in others
    for (const cell of cells) {
      const text = cell.textContent.trim();
      if (!text) continue;

      // If cell has a specific class hint
      const cls = cell.className || "";
      if (
        cls.includes("test-name") ||
        cls.includes("testName") ||
        cls.includes("tahlilAdi")
      ) {
        name = text;
      } else if (
        cls.includes("test-value") ||
        cls.includes("testValue") ||
        cls.includes("sonuc")
      ) {
        valueStr = text;
      } else if (cls.includes("test-unit") || cls.includes("birim")) {
        unit = text;
      } else if (cls.includes("test-ref") || cls.includes("referans")) {
        refStr = text;
      }
    }

    // Fallback: use positional heuristic for table rows
    if (!name && cells.length >= 2) {
      const cellTexts = Array.from(cells)
        .map((c) => c.textContent.trim())
        .filter(Boolean);

      if (cellTexts.length >= 2) {
        name = cellTexts[0];
        valueStr = cellTexts[1];
        if (cellTexts.length >= 3) unit = cellTexts[2];
        if (cellTexts.length >= 4) refStr = cellTexts[3];
      }
    }

    if (!name || !valueStr) return;

    // Skip non-numeric values (Pozitif/Negatif etc.)
    const value = parseNumericValue(valueStr);
    if (value === null) return;

    const { low, high } = parseRefRange(refStr);

    metrics.push({
      name: name,
      value: value,
      unit: unit || undefined,
      ref_low: low,
      ref_high: high,
    });
  }

  // Parse header to get date and hospital
  function parseHeader(header) {
    const text = header.textContent || "";
    let date = null;
    let hospital = null;

    // Find date pattern DD.MM.YYYY
    const dateMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
    if (dateMatch) {
      date = parseDate(dateMatch[1]);
    }

    // Hospital is typically after a separator or in a specific element
    const spans = header.querySelectorAll("span, div, small");
    for (const span of spans) {
      const t = span.textContent.trim();
      // Skip if it's just the date
      if (t.match(/^\d{2}\.\d{2}\.\d{4}$/)) continue;
      // Skip very short strings
      if (t.length > 3 && !t.match(/^\d/) && t !== "Tahlil" && t !== "Test") {
        hospital = t;
        break;
      }
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
    const header = item.querySelector(
      ".accordion-header, .accordion-button, .card-header",
    );
    if (!header) return null;

    const { date, hospital } = parseHeader(header);
    if (!date) return null;

    // Ensure panel is expanded to scrape metrics
    const collapseBtn =
      header.querySelector("button[data-bs-toggle], [data-toggle]") || header;
    const panel = item.querySelector(
      ".accordion-collapse, .collapse, .card-body",
    );

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
      "#accordionTahlilListe .accordion-item, #accordionTahlilListe > .card",
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

  // Inject buttons into the page
  async function init() {
    try {
      await waitForElement("#accordionTahlilListe");
    } catch {
      // Accordion not found — not on the right page
      return;
    }

    const accordion = document.querySelector("#accordionTahlilListe");
    if (!accordion) return;

    // Check if API key is configured
    const { apiKey } = await chrome.storage.local.get("apiKey");
    if (!apiKey) return;

    // Add "Import All" button at the top
    const importAllBtn = createButton(
      LABELS.importAll,
      (btn) => importAll(btn),
      "viziai-btn-primary viziai-import-all",
    );
    accordion.parentElement.insertBefore(importAllBtn, accordion);

    // Add "Send to ViziAI" button per accordion item
    const items = accordion.querySelectorAll(".accordion-item, > .card");

    items.forEach((item) => {
      const header = item.querySelector(".accordion-header, .card-header");
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

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
