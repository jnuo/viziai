"use client";

import { useEffect, useRef, useState } from "react";
import type { TocHeading } from "@/lib/blog";

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -80% 0px" },
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto text-sm"
    >
      <ul className="space-y-1.5 border-l border-border pl-4">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(h.id)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`block py-0.5 transition-colors ${
                activeId === h.id
                  ? "text-primary font-medium border-l-2 border-primary -ml-[calc(1rem+1px)] pl-[calc(1rem-1px)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
