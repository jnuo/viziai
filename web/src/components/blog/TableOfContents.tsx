"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { TocHeading } from "@/lib/blog";

export function TableOfContents({
  headings,
  label = "Contents",
}: {
  headings: TocHeading[];
  label?: string;
}) {
  const [activeId, setActiveId] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "0px 0px -80% 0px" },
    );
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];
    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  }, []);

  if (headings.length === 0) return null;

  return (
    <div
      ref={ref}
      className="fixed right-3 top-1/2 -translate-y-1/2 z-40 flex items-center"
    >
      {/* Panel */}
      <div
        className={`overflow-hidden transition-[max-width,opacity] duration-200 ease-out ${
          open
            ? "max-w-[260px] opacity-100"
            : "max-w-0 opacity-0 pointer-events-none"
        }`}
      >
        <nav
          aria-label="Table of contents"
          className="mr-2 w-[220px] rounded-lg border border-border bg-background/95 shadow-lg backdrop-blur-sm p-3 max-h-[60vh] overflow-y-auto"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {label}
          </p>
          <ul className="space-y-0.5">
            {headings.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(h.id)}
                  className={`block w-full text-left text-[13px] leading-snug py-1 truncate cursor-pointer transition-colors duration-150 ${
                    h.level === 3 ? "pl-3" : ""
                  } ${
                    activeId === h.id
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {h.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Lines indicator */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close table of contents" : "Open table of contents"}
        aria-expanded={open}
        className={`flex flex-col gap-[7px] py-3 px-2 rounded-lg border cursor-pointer transition-all duration-150 ${
          open
            ? "border-border/40 bg-background shadow-sm"
            : "border-transparent bg-transparent hover:border-border/40 hover:bg-background hover:shadow-sm"
        }`}
      >
        {headings.map((h) => (
          <span
            key={h.id}
            className={`block rounded-full transition-all duration-200 ${
              activeId === h.id
                ? "w-[18px] h-[2.5px] bg-primary"
                : h.level === 3
                  ? "w-[10px] h-[2px] bg-muted-foreground/20"
                  : "w-[14px] h-[2px] bg-muted-foreground/30"
            }`}
          />
        ))}
      </button>
    </div>
  );
}
