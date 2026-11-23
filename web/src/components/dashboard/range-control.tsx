"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import type { DateRange as DayRange } from "react-day-picker";
import { de, enUS, es, fr, nl, tr } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toLocale } from "@/i18n/config";
import {
  RANGE_PRESETS,
  localDateToUtc,
  normalizeCustom,
  utcToLocalDate,
  type RangeChoice,
  type RangePreset,
} from "@/lib/chart/range";
import type { DateFormats } from "./shared";

const DAY_PICKER_LOCALES = { tr, en: enUS, de, es, fr, nl };

type Props = {
  /** explicit choice, or null while the range is automatic */
  choice: RangeChoice | null;
  /** what "Otomatik" resolves to right now */
  auto: RangePreset;
  /** first and last day with data (custom ranges are clamped to it) */
  span: [number, number] | null;
  /** current visible window, to prefill the calendar */
  bounds: [number, number];
  onChange: (choice: RangeChoice | null) => void;
  /** >= md: segmented control; below: a compact Select */
  isDesk: boolean;
  fmt: DateFormats;
};

/**
 * Date range: presets anchored to the latest draw, "Özel…" with a calendar,
 * and an automatic default (hinted while active, one click to return to).
 */
export function RangeControl({
  choice,
  auto,
  span,
  bounds,
  onChange,
  isDesk,
  fmt,
}: Props) {
  const t = useTranslations("pages.dashboard.range");
  const locale = toLocale(useLocale());
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DayRange | undefined>();
  const selectRef = useRef<HTMLButtonElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);

  const isAuto = choice == null;
  const isCustom = choice?.kind === "custom";
  const active: RangePreset | "custom" = isCustom
    ? "custom"
    : (choice?.preset ?? auto);
  const label = (p: RangePreset) => t(`presets.${p}`);

  const openCustom = (next: boolean) => {
    if (next) {
      const from = span ? Math.max(bounds[0], span[0]) : undefined;
      const to = span ? Math.min(bounds[1], span[1]) : undefined;
      setDraft(
        from != null && to != null && from <= to
          ? { from: utcToLocalDate(from), to: utcToLocalDate(to) }
          : undefined,
      );
    }
    setOpen(next);
  };

  const result = useMemo(
    () =>
      draft?.from
        ? normalizeCustom(
            localDateToUtc(draft.from),
            localDateToUtc(draft.to ?? draft.from),
            span,
          )
        : null,
    [draft, span],
  );
  const apply = () => {
    if (!result) return;
    onChange(result);
    setOpen(false);
  };

  const minDate = span ? utcToLocalDate(span[0]) : undefined;
  const maxDate = span ? utcToLocalDate(span[1]) : undefined;
  const months = isDesk ? 2 : 1;
  const lastShown = draft?.to ?? draft?.from ?? maxDate ?? new Date();
  const firstMonth = new Date(
    lastShown.getFullYear(),
    lastShown.getMonth() - (months - 1),
    1,
  );

  return (
    <Popover open={open} onOpenChange={openCustom}>
      <PopoverAnchor asChild>
        <div className="vz-range">
          {isDesk ? (
            <>
              <div className="vz-seg" role="group" aria-label={t("label")}>
                {RANGE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={active === p}
                    onClick={() => onChange({ kind: "preset", preset: p })}
                  >
                    {label(p)}
                    {isAuto && active === p && (
                      <span className="vz-auto-hint" title={t("autoHelp")}>
                        {t("autoHint")}
                      </span>
                    )}
                  </button>
                ))}
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-pressed={isCustom}
                    aria-haspopup="dialog"
                  >
                    {t("custom")}
                  </button>
                </PopoverTrigger>
              </div>
              {!isAuto && (
                <button
                  type="button"
                  className="vz-link vz-auto-reset"
                  title={t("autoHelp")}
                  onClick={() => onChange(null)}
                >
                  {t("backToAuto")}
                </button>
              )}
            </>
          ) : (
            <>
              <Select
                value={isAuto ? "auto" : active}
                onValueChange={(v) => {
                  if (v === "auto") onChange(null);
                  else if (v === "custom")
                    // let the Select close and hand focus back first
                    window.setTimeout(() => openCustom(true), 0);
                  else onChange({ kind: "preset", preset: v as RangePreset });
                }}
              >
                <SelectTrigger
                  ref={selectRef}
                  className="w-auto h-7 text-xs"
                  aria-label={t("label")}
                  style={{ touchAction: "manipulation" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    {t("autoItem", { range: label(auto) })}
                  </SelectItem>
                  {RANGE_PRESETS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {label(p)}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">{t("custom")}</SelectItem>
                </SelectContent>
              </Select>
              {isCustom && (
                <button
                  ref={editRef}
                  type="button"
                  className="vz-icon-btn vz-range-edit"
                  aria-label={t("editCustom")}
                  onClick={() => openCustom(true)}
                >
                  <CalendarDays size={14} aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="vzd vz-range-pop w-auto p-0"
        align="end"
        aria-label={t("customTitle")}
        onCloseAutoFocus={(e) => {
          if (isDesk) return; // the "Özel…" trigger gets focus back
          e.preventDefault();
          (editRef.current ?? selectRef.current)?.focus();
        }}
      >
        <Calendar
          mode="range"
          resetOnSelect
          numberOfMonths={months}
          selected={draft}
          onSelect={setDraft}
          defaultMonth={firstMonth}
          startMonth={minDate}
          endMonth={maxDate}
          disabled={
            minDate && maxDate
              ? [{ before: minDate }, { after: maxDate }]
              : undefined
          }
          locale={DAY_PICKER_LOCALES[locale]}
        />
        <div className="vz-range-foot">
          <span className="vz-range-sel" aria-live="polite">
            {result && draft?.from && !draft.to
              ? `${fmt.short(result.from)} – …`
              : result
                ? result.from === result.to
                  ? fmt.short(result.from)
                  : `${fmt.short(result.from)} – ${fmt.short(result.to)}`
                : t("customPick")}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button size="sm" disabled={!result} onClick={apply}>
            {t("apply")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
