"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, User, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { slugifyAuthor } from "@/lib/blog-utils";

interface SerializedPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  author?: { name: string; email: string };
  readingTime: number;
  formattedDate: string;
}

interface BlogListFilterProps {
  posts: SerializedPost[];
  locale: string;
  readMinLabel: string;
  translations: {
    articlesBy: string;
    allPosts: string;
    filterByTag: string;
    listEmpty: string;
  };
}

export function BlogListFilter({
  posts,
  locale,
  readMinLabel,
  translations: t,
}: BlogListFilterProps): React.ReactElement {
  const searchParams = useSearchParams();
  const activeAuthor = searchParams.get("author");
  const activeTag = searchParams.get("tag");

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags ?? []))).sort(),
    [posts],
  );

  let filtered = posts;
  if (activeAuthor) {
    filtered = filtered.filter(
      (p) => p.author && slugifyAuthor(p.author.name) === activeAuthor,
    );
  }
  if (activeTag) {
    filtered = filtered.filter((p) => p.tags?.includes(activeTag));
  }

  const authorDisplayName = activeAuthor
    ? (filtered[0]?.author?.name ?? null)
    : null;

  // undefined = keep current filter, null = clear filter, string = set filter
  function buildHref(overrides: {
    author?: string | null;
    tag?: string | null;
  }): string {
    const sp = new URLSearchParams();
    const author =
      overrides.author !== undefined ? overrides.author : activeAuthor;
    const tag = overrides.tag !== undefined ? overrides.tag : activeTag;
    if (author) sp.set("author", author);
    if (tag) sp.set("tag", tag);
    const qs = sp.toString();
    return `/${locale}/blog${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      {(activeAuthor || activeTag) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {activeAuthor && authorDisplayName && (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {t.articlesBy.replace("{author}", authorDisplayName)}
              </h2>
              <Link
                href={buildHref({ author: null })}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
                {t.allPosts}
              </Link>
            </div>
          )}
          {activeTag && (
            <div className="flex items-center gap-2">
              {!activeAuthor && (
                <h2 className="text-lg font-semibold">
                  {t.filterByTag}: {activeTag}
                </h2>
              )}
              {activeAuthor && (
                <span className="text-sm text-muted-foreground">
                  + {activeTag}
                </span>
              )}
              <Link
                href={buildHref({ tag: null })}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const isActive = activeTag === tag;
            return (
              <Link
                key={tag}
                href={isActive ? buildHref({ tag: null }) : buildHref({ tag })}
              >
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {tag}
                </Badge>
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-lg">{t.listEmpty}</p>
      ) : (
        <ul className="space-y-6">
          {filtered.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="block group"
              >
                <Card className="transition-shadow duration-200 group-hover:shadow-lg border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {post.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <time
                        dateTime={post.publishedAt}
                        className="flex items-center gap-1.5"
                      >
                        <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
                        {post.formattedDate}
                      </time>
                      <span className="flex items-center gap-1.5">
                        <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                        {post.readingTime} {readMinLabel}
                      </span>
                      {post.author && (
                        <span
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <User aria-hidden="true" className="h-3.5 w-3.5" />
                          <Link
                            href={buildHref({
                              author: slugifyAuthor(post.author.name),
                              tag: null,
                            })}
                            className="hover:text-foreground transition-colors hover:underline"
                          >
                            {post.author.name}
                          </Link>
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
