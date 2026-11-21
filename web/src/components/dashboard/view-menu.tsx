"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { IconSliders, type ChartSize, type ViewSettings } from "./shared";

type Props = {
  view: ViewSettings;
  setView: (patch: Partial<ViewSettings>) => void;
  isPhone: boolean;
};

/** "Görünüm": popover on desktop, bottom sheet on phones. */
export function ViewMenu({ view, setView, isPhone }: Props) {
  const t = useTranslations("pages.dashboard.view");
  const [open, setOpen] = useState(false);
  const customized = view.full || !view.labels || view.pers;

  const check = (
    key: "full" | "pers" | "labels",
    label: string,
    help?: string,
  ) => (
    <label className="vz-check">
      <input
        type="checkbox"
        checked={view[key]}
        onChange={(e) => setView({ [key]: e.target.checked })}
      />
      <span>{label}</span>
      {help && <small>{help}</small>}
    </label>
  );

  const body = (
    <>
      <div className="vz-grp">
        {check("full", t("showNormal"), t("showNormalHelp"))}
        {check("pers", t("showPersonal"), t("showPersonalHelp"))}
        {check("labels", t("showLabels"))}
      </div>
      <div className="vz-sep" />
      {!isPhone && (
        <div className="vz-grp">
          <span className="vz-grp-lbl" id="vz-lbl-cols">
            {t("layout")}
          </span>
          <div
            className="vz-seg full"
            role="group"
            aria-labelledby="vz-lbl-cols"
          >
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={view.cols === n}
                onClick={() => setView({ cols: n })}
              >
                {t("columns", { count: n })}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="vz-grp">
        <span className="vz-grp-lbl" id="vz-lbl-size">
          {t("height")}
        </span>
        <div className="vz-seg full" role="group" aria-labelledby="vz-lbl-size">
          {(
            [
              ["s", t("small")],
              ["m", t("medium")],
              ["l", t("large")],
            ] as [ChartSize, string][]
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={view.size === k}
              onClick={() => setView({ size: k })}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const trigger = (
    <button
      type="button"
      className="vz-btn"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={isPhone ? () => setOpen(true) : undefined}
    >
      <IconSliders />
      <span>{t("button")}</span>
      {customized && <span className="dot" aria-label={t("customized")} />}
    </button>
  );

  if (isPhone) {
    return (
      <>
        {trigger}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="vzd vz-pop rounded-t-2xl px-4 pt-4 pb-[calc(20px+env(safe-area-inset-bottom))]"
          >
            <SheetTitle className="text-[13px] font-semibold">
              {t("title")}
            </SheetTitle>
            {body}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="vzd vz-pop w-[300px] rounded-xl"
        aria-label={t("title")}
      >
        <h2>{t("title")}</h2>
        {body}
      </PopoverContent>
    </Popover>
  );
}
