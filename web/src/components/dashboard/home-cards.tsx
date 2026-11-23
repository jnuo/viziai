"use client";

import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  changeAt,
  displayUnit,
  moveItem,
  statusOf,
  pointStatus,
  type DashMetric,
  type Pt,
  type Status,
} from "@/lib/chart/model";
import { fmtDelta, fmtV } from "@/lib/chart/scale";
import {
  IconChart,
  IconLeft,
  IconMore,
  IconPlus,
  IconRight,
  IconX,
  metricRangeText,
  statusClass,
  type DateFormats,
} from "./shared";

type Props = {
  ids: string[];
  byId: Map<string, DashMetric>;
  vis: Map<string, Pt[]>;
  showAvg: boolean;
  selected: string[];
  toggleChart: (id: string) => void;
  /** true: cards are the saved Ana ekran (reorderable); false: empty-state picks */
  isHome: boolean;
  canEdit: boolean;
  onReorder: (next: string[]) => void;
  onSetHome: (id: string, on: boolean) => void;
  fmt: DateFormats;
  isPhone: boolean;
};

export function HomeCards(props: Props) {
  const { ids, isHome, canEdit, onReorder, isPhone } = props;
  const sortable = isHome && canEdit;
  // Mouse: drag after 6px so a plain click still opens the chart.
  // Touch: long-press (250ms) so tap opens the chart and the row still scrolls.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );
  // dnd-kit swallows the click that ends a drag, so a drag never toggles a chart
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const next = moveItem(
      ids,
      ids.indexOf(String(active.id)),
      ids.indexOf(String(over.id)),
    );
    if (next !== ids) onReorder(next);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={ids}
        strategy={rectSortingStrategy}
        disabled={!sortable}
      >
        <div
          className={`vz-mgrid${isPhone ? " strip" : ""}`}
          data-testid="home-cards"
        >
          {ids.map((id, i) => (
            <Card
              key={id}
              id={id}
              index={i}
              {...props}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function Card({
  id,
  index,
  ids,
  byId,
  vis,
  showAvg,
  selected,
  toggleChart,
  isHome,
  canEdit,
  onReorder,
  onSetHome,
  fmt,
}: Props & {
  id: string;
  index: number;
}) {
  const t = useTranslations("pages.dashboard");
  const ts = useTranslations("pages.dashboard.status");
  const sortable = isHome && canEdit;
  const { setNodeRef, listeners, transform, transition, isDragging } =
    useSortable({
      id,
      disabled: !sortable,
    });
  const m = byId.get(id);
  if (!m) return null;

  const v = vis.get(id) ?? [];
  let value: number | null = null;
  let sub: React.ReactNode;
  let st: Status = "none";
  const stale = v.length === 0;
  if (stale) {
    sub = m.stat.last
      ? t("lastMeasured", { date: fmt.short(m.stat.last.t) })
      : t("notInRange");
  } else if (showAvg) {
    value = v.reduce((s, p) => s + p.v, 0) / v.length;
    st = statusOf(value, m.ref_min, m.ref_max);
    sub = t("nMeasurements", { count: v.length });
  } else {
    const l = v[v.length - 1];
    value = l.v;
    st = pointStatus(m, l);
    const ch = changeAt(m, l);
    sub = (
      <>
        {fmt.short(l.t)}
        {ch != null && (
          <>
            {" · "}
            <span className="dl">
              {ch === "first" ? t("firstMeasurement") : fmtDelta(ch)}
            </span>
          </>
        )}
      </>
    );
  }
  const sel = selected.includes(id);
  const cls = stale ? "stale" : statusClass(st);
  const rt = metricRangeText(m);
  const lastSt = m.stat.st;

  return (
    <div
      ref={setNodeRef}
      className={`vz-mcard-wrap${isDragging ? " dragging" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-id={id}
      {...(sortable ? listeners : {})}
    >
      <button
        type="button"
        className={`vz-mcard ${cls}${sel ? " sel" : ""}`}
        aria-pressed={sel}
        title={m.full}
        onClick={() => toggleChart(id)}
      >
        <span className="mc-name">{m.name}</span>
        <span className={`mc-val ${cls}`}>
          {value != null ? fmtV(value) : "—"}{" "}
          <span className="mc-unit">
            {displayUnit(m.stat.last?.unit || m.unit)}
          </span>
        </span>
        <span className="mc-sub">{sub}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="mc-more"
            aria-label={t("cardMenu", { name: m.name })}
            title={t("cardMenu", { name: m.name })}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <IconMore />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="vzd vz-menu">
          <div className="vz-menu-info">
            <b>{m.full}</b>
            <br />
            {t("refRange")}: {rt ? `${rt} ${displayUnit(m.unit)}` : t("noRef")}
            {m.stat.out ? ` · ${ts(lastSt)}` : ""}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => toggleChart(id)}>
            <IconChart />
            {sel ? t("chartRemove") : t("chartAdd")}
          </DropdownMenuItem>
          {isHome && canEdit && (
            <>
              <DropdownMenuItem
                disabled={index === 0}
                onSelect={() => onReorder(moveItem(ids, index, index - 1))}
              >
                <IconLeft />
                {t("moveLeft")}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={index === ids.length - 1}
                onSelect={() => onReorder(moveItem(ids, index, index + 1))}
              >
                <IconRight />
                {t("moveRight")}
              </DropdownMenuItem>
            </>
          )}
          {canEdit ? (
            isHome ? (
              <DropdownMenuItem
                className="vz-menu-item danger"
                onSelect={() => onSetHome(id, false)}
              >
                <IconX size={14} />
                {t("removeHome")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => onSetHome(id, true)}>
                <IconPlus />
                {t("addHome")}
              </DropdownMenuItem>
            )
          ) : (
            <div className="vz-menu-note">{t("viewerReadOnly")}</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
