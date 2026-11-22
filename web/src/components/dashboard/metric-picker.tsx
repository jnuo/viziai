"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CATEGORY_ORDER,
  SORT_KINDS,
  changeAt,
  highlightRange,
  searchMetrics,
  sorter,
  type DashMetric,
  type SortKind,
} from "@/lib/chart/model";
import { fmtDelta, fmtV } from "@/lib/chart/scale";
import {
  IconChart,
  IconCheck,
  IconChev,
  IconDown,
  IconGrip,
  IconPlus,
  IconSearch,
  IconUp,
  IconX,
  metricRangeText,
  statusClass,
  type DateFormats,
} from "./shared";

export type PickerPrefs = {
  sort: SortKind;
  collapsed: Record<string, boolean>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** ≥1280px: drawer pushes the page instead of covering it */
  wide: boolean;
  isPhone: boolean;
  metrics: DashMetric[];
  home: string[];
  canEdit: boolean;
  onToggleHome: (id: string) => void;
  onReorderHome: (next: string[]) => void;
  selected: string[];
  toggleChart: (id: string) => void;
  query: string;
  setQuery: (q: string) => void;
  prefs: PickerPrefs;
  setPrefs: (patch: Partial<PickerPrefs>) => void;
  fmt: DateFormats;
  returnFocus: () => void;
};

export function MetricPicker(props: Props) {
  const {
    open,
    onClose,
    wide,
    isPhone,
    metrics,
    home,
    canEdit,
    onToggleHome,
    onReorderHome,
    selected,
    toggleChart,
    query,
    setQuery,
    prefs,
    setPrefs,
    fmt,
    returnFocus,
  } = props;
  const t = useTranslations("pages.dashboard.picker");
  const tc = useTranslations("pages.dashboard.categories");
  const inputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState({ out: false, latest: false });

  const listed = useMemo(
    () => metrics.filter((m) => m.pts.length > 0),
    [metrics],
  );
  const byId = useMemo(() => new Map(listed.map((m) => [m.id, m])), [listed]);
  const sortFn = useMemo(() => sorter(prefs.sort, home), [prefs.sort, home]);
  const pass = (m: DashMetric) =>
    (!filters.out || m.stat.out) && (!filters.latest || m.stat.inLatest);
  const anyFilter = filters.out || filters.latest;
  const res = searchMetrics(listed, query, sortFn);

  const move = (id: string, dir: -1 | 1) => {
    const i = home.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= home.length) return;
    const next = home.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onReorderHome(next);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = home.indexOf(String(active.id));
    const to = home.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    const next = home.slice();
    next.splice(to, 0, next.splice(from, 1)[0]);
    onReorderHome(next);
  };

  const rowProps = {
    q: res ? res.q : "",
    home,
    canEdit,
    onToggleHome,
    selected,
    toggleChart,
    fmt,
  };

  let body: React.ReactNode;
  if (res) {
    const list = res.list.filter(pass);
    body = (
      <div>
        <div className="pk-alias" aria-live="polite">
          {res.alias && (
            <>
              {t.rich("aliasIs", {
                q: query.trim(),
                label: res.alias,
                b: (c) => <b>{c}</b>,
              })}
              {" · "}
            </>
          )}
          {t("results", { count: list.length })}
        </div>
        {list.length ? (
          list.map((m) => (
            <div key={m.id} className="pk-row">
              <PickerRow m={m} {...rowProps} />
            </div>
          ))
        ) : (
          <div className="pk-empty">{t("noResults", { q: query.trim() })}</div>
        )}
      </div>
    );
  } else {
    const hm = home
      .map((id) => byId.get(id))
      .filter((m): m is DashMetric => !!m);
    body = (
      <div>
        <section className="pk-sec" aria-labelledby="pk-sec-home">
          <h3 className="pk-sec-h" id="pk-sec-home">
            {t("homeSection")} <span className="n">({hm.length})</span>
          </h3>
          {hm.length ? (
            <div className="pk-note">
              {t("homeHint")}{" "}
              {canEdit
                ? isPhone
                  ? t("homeHintPhone")
                  : t("homeHintDesk")
                : t("readOnly")}
            </div>
          ) : (
            <div className="pk-empty">
              {canEdit ? t("homeEmpty") : t("readOnly")}
            </div>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={hm.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {hm.map((m, i) => (
                <HomeRow
                  key={m.id}
                  m={m}
                  index={i}
                  count={hm.length}
                  canEdit={canEdit}
                  move={move}
                  rowProps={rowProps}
                />
              ))}
            </SortableContext>
          </DndContext>
        </section>
        {CATEGORY_ORDER.map((k) => {
          const members = listed
            .filter((m) => m.category === k && pass(m))
            .sort(sortFn);
          if (!members.length) return null;
          const open =
            prefs.collapsed[k] === undefined
              ? anyFilter || members.some((m) => home.includes(m.id))
              : !prefs.collapsed[k];
          const outN = members.filter(
            (m) => m.stat.out && m.stat.ageDays <= 30,
          ).length;
          return (
            <section key={k} className="pk-sec">
              <button
                type="button"
                className="pk-sec-h"
                aria-expanded={open}
                onClick={() =>
                  setPrefs({ collapsed: { ...prefs.collapsed, [k]: open } })
                }
              >
                {tc(k)} <span className="n">{members.length}</span>
                {outN > 0 && (
                  <span className="outn">{t("outCount", { count: outN })}</span>
                )}
                <IconChev />
              </button>
              {open &&
                members.map((m) => (
                  <div key={m.id} className="pk-row">
                    <PickerRow m={m} {...rowProps} />
                  </div>
                ))}
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} modal={!wide}>
      <SheetContent
        side="right"
        className="vzd vz-picker"
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const el = inputRef.current;
          if (el) {
            el.focus();
            el.setSelectionRange(el.value.length, el.value.length);
          }
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocus();
        }}
        onInteractOutside={(e) => {
          // pushed drawer: the dashboard stays usable next to it
          if (wide) e.preventDefault();
        }}
      >
        <div className="pk-head">
          <SheetTitle asChild>
            <h2>{t("title")}</h2>
          </SheetTitle>
          <SheetDescription asChild>
            <span className="sub">
              {t("counter", { total: listed.length, home: home.length })}
            </span>
          </SheetDescription>
        </div>
        <div className="pk-tools">
          <div className="vz-search pk-search">
            <IconSearch size={16} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchAria")}
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                className="vz-icon-btn clear"
                aria-label={t("clear")}
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                <IconX size={13} />
              </button>
            )}
          </div>
          <div className="pk-filters">
            <label className="pk-sort">
              {t("sort")}
              <select
                value={prefs.sort}
                onChange={(e) => setPrefs({ sort: e.target.value as SortKind })}
              >
                {SORT_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(`sorts.${k}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="vz-check inline">
              <input
                type="checkbox"
                checked={filters.out}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, out: e.target.checked }))
                }
              />
              {t("filterOut")}
            </label>
            <label className="vz-check inline">
              <input
                type="checkbox"
                checked={filters.latest}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, latest: e.target.checked }))
                }
              />
              {t("filterLatest")}
            </label>
          </div>
        </div>
        <div className="pk-body">{body}</div>
      </SheetContent>
    </Sheet>
  );
}

type RowProps = {
  m: DashMetric;
  q: string;
  home: string[];
  canEdit: boolean;
  onToggleHome: (id: string) => void;
  selected: string[];
  toggleChart: (id: string) => void;
  fmt: DateFormats;
  reorder?: React.ReactNode;
};

function HomeRow({
  m,
  index,
  count,
  canEdit,
  move,
  rowProps,
}: {
  m: DashMetric;
  index: number;
  count: number;
  canEdit: boolean;
  move: (id: string, dir: -1 | 1) => void;
  rowProps: Omit<RowProps, "m">;
}) {
  const t = useTranslations("pages.dashboard.picker");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: m.id,
    disabled: !canEdit,
  });
  return (
    <div
      ref={setNodeRef}
      data-fid={m.id}
      className={`pk-row f-row${isDragging ? " dragging" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="pk-handle"
        aria-label={t("reorder", { name: m.name })}
        title={t("drag")}
        disabled={!canEdit}
        {...attributes}
        {...listeners}
      >
        <IconGrip />
      </button>
      <PickerRow
        m={m}
        {...rowProps}
        q=""
        reorder={
          canEdit ? (
            <span style={{ display: "inline-flex" }}>
              <button
                type="button"
                className="pk-ud"
                disabled={index === 0}
                aria-label={t("moveUp", { name: m.name })}
                onClick={() => move(m.id, -1)}
              >
                <IconUp />
              </button>
              <button
                type="button"
                className="pk-ud"
                disabled={index === count - 1}
                aria-label={t("moveDown", { name: m.name })}
                onClick={() => move(m.id, 1)}
              >
                <IconDown />
              </button>
            </span>
          ) : null
        }
      />
    </div>
  );
}

function HomeButton({
  m,
  on,
  canEdit,
  onClick,
}: {
  m: DashMetric;
  on: boolean;
  canEdit: boolean;
  onClick: () => void;
}) {
  const t = useTranslations("pages.dashboard");
  // right after adding, keep "Ana ekranda" until the pointer leaves, so the
  // label doesn't flip to "çıkar" under the cursor
  const [just, setJust] = useState(false);
  return (
    <button
      type="button"
      className={`home-btn${just ? " just" : ""}`}
      aria-pressed={on}
      disabled={!canEdit}
      title={canEdit ? undefined : t("viewerReadOnly")}
      aria-label={t("addHomeAria", { name: m.name })}
      onClick={() => {
        setJust(true);
        onClick();
      }}
      onPointerLeave={() => setJust(false)}
      onBlur={() => setJust(false)}
    >
      {on ? (
        <>
          <span className="on">
            <IconCheck />
            {t("onHome")}
          </span>
          <span className="off">
            <IconX size={13} />
            {t("removeHome")}
          </span>
        </>
      ) : (
        <span>
          <IconPlus />
          {t("addHome")}
        </span>
      )}
    </button>
  );
}

function PickerRow({
  m,
  q,
  home,
  canEdit,
  onToggleHome,
  selected,
  toggleChart,
  fmt,
  reorder,
}: RowProps) {
  const t = useTranslations("pages.dashboard");
  const tp = useTranslations("pages.dashboard.picker");
  const ts = useTranslations("pages.dashboard.status");
  const s = m.stat;
  const isHome = home.includes(m.id);
  const isSel = selected.includes(m.id);
  const hr = highlightRange(m.name, q);
  const name = hr ? (
    <>
      {m.name.slice(0, hr[0])}
      <mark>{m.name.slice(hr[0], hr[1])}</mark>
      {m.name.slice(hr[1])}
    </>
  ) : (
    m.name
  );
  const last = s.last!;
  const ch = changeAt(m, last);
  const change =
    ch == null ? null : ch === "first" ? tp("firstMeasurement") : fmtDelta(ch);
  const meta = [change, fmt.when(last.t)].filter(Boolean).join(" · ");
  const rt = metricRangeText(m);
  const sub = [
    m.full !== m.name ? m.full : null,
    rt ? tp("normalRange", { range: rt }) : tp("noRef"),
  ]
    .filter(Boolean)
    .join(" · ");
  const unit = last.unit || m.unit;
  return (
    <>
      <span className={`sdot ${statusClass(s.st)}`} title={ts(s.st)} />
      <div className="pk-name" title={m.full}>
        <span className="nm">{name}</span>
        <span className="full dk">{sub}</span>
        <span className="full ph">
          <b>{fmtV(last.v)}</b> {unit} · {meta}
        </span>
      </div>
      <div className="pk-val">
        {fmtV(last.v)}
        <span className="u">{unit}</span>
        <small>{meta}</small>
      </div>
      <div className="pk-acts">
        {reorder}
        <HomeButton
          m={m}
          on={isHome}
          canEdit={canEdit}
          onClick={() => onToggleHome(m.id)}
        />
        <button
          type="button"
          className="add-btn"
          aria-pressed={isSel}
          aria-label={`${m.name}: ${isSel ? t("chartRemove") : t("chartAdd")}`}
          title={isSel ? t("chartRemove") : t("chartAdd")}
          onClick={() => toggleChart(m.id)}
        >
          {isSel ? <IconCheck /> : <IconChart />}
          <span className="txt">{isSel ? t("chartOn") : t("chartAdd")}</span>
        </button>
      </div>
    </>
  );
}
