import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

function Spacer({ size }) {
  const cls =
    size === "sm" ? "h-4" : size === "lg" ? "h-16" : "h-8";
  return <div className={cls} />;
}

function CtaLink({ href, children }) {
  if (!href) return null;
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-6 h-11",
        "font-extrabold tracking-wide",
        "text-white bg-slate-900 hover:bg-slate-800",
        "shadow-[0_4px_14px_0_rgba(15,23,42,0.25)]"
      )}
    >
      {children}
    </Link>
  );
}

export function RenderBlocks({ content, selectable = false, selectedBlockId = null, onSelectBlock }) {
  const blocks = Array.isArray(content?.blocks) ? content.blocks : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      {blocks.map((b) => {
        const isSelected = selectable && selectedBlockId && selectedBlockId === b?.id;
        const wrapperClass = selectable
          ? cn(
              "relative rounded-2xl transition",
              "hover:outline hover:outline-2 hover:outline-slate-300",
              isSelected ? "outline outline-2 outline-slate-900" : "outline-none"
            )
          : "";

        switch (b?.type) {
          case "hero":
            return (
              <div
                key={b.id}
                className={cn("py-6", wrapperClass)}
                onClick={
                  selectable
                    ? (e) => {
                        e.stopPropagation();
                        onSelectBlock?.(b.id);
                      }
                    : undefined
                }
              >
                <div className="rounded-[2rem] border border-slate-200 bg-white/70 backdrop-blur px-8 py-12 shadow-sm">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                      {b.headline}
                    </h1>
                    {b.subheadline && (
                      <p className="mt-4 text-lg text-slate-700">{b.subheadline}</p>
                    )}
                    <div className="mt-7 flex flex-wrap gap-3">
                      {b.ctaText && <CtaLink href={b.ctaHref}>{b.ctaText}</CtaLink>}
                    </div>
                  </div>
                </div>
              </div>
            );

          case "section":
            return (
              <div
                key={b.id}
                className={cn("py-6", wrapperClass)}
                onClick={
                  selectable
                    ? (e) => {
                        e.stopPropagation();
                        onSelectBlock?.(b.id);
                      }
                    : undefined
                }
              >
                <h2 className="text-2xl font-black text-slate-900">{b.title}</h2>
                {b.body && <p className="mt-3 text-slate-700 leading-relaxed">{b.body}</p>}
              </div>
            );

          case "cards":
            return (
              <div
                key={b.id}
                className={cn("py-6", wrapperClass)}
                onClick={
                  selectable
                    ? (e) => {
                        e.stopPropagation();
                        onSelectBlock?.(b.id);
                      }
                    : undefined
                }
              >
                {b.title && <h2 className="text-2xl font-black text-slate-900">{b.title}</h2>}
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(b.cards || []).map((c) => (
                    <Card key={c.id} className="p-6">
                      <div className="font-extrabold text-slate-900">{c.title}</div>
                      {c.body && <div className="mt-2 text-sm text-slate-600">{c.body}</div>}
                    </Card>
                  ))}
                </div>
              </div>
            );

          case "markdown":
            return (
              <div
                key={b.id}
                className={cn("py-6 prose prose-slate max-w-none", wrapperClass)}
                onClick={
                  selectable
                    ? (e) => {
                        e.stopPropagation();
                        onSelectBlock?.(b.id);
                      }
                    : undefined
                }
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {b.markdown || ""}
                </ReactMarkdown>
              </div>
            );


          case "image":
            return (
              <div
                key={b.id}
                className={cn("py-6", wrapperClass)}
                onClick={
                  selectable
                    ? (e) => {
                        e.stopPropagation();
                        onSelectBlock?.(b.id);
                      }
                    : undefined
                }
              >
                {b.url ? (
                  <figure className={cn("mx-auto", b.maxWidth === "sm" ? "max-w-sm" : b.maxWidth === "md" ? "max-w-md" : b.maxWidth === "lg" ? "max-w-lg" : "max-w-3xl")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.url}
                      alt={b.alt || ""}
                      className={cn("w-full h-auto border border-slate-200 shadow-sm", b.rounded !== false ? "rounded-2xl" : "rounded-none")}
                    />
                    {b.caption ? <figcaption className="mt-2 text-sm text-slate-500">{b.caption}</figcaption> : null}
                  </figure>
                ) : (
                  <div className="text-sm text-slate-500">No image selected.</div>
                )}
              </div>
            );

          case "divider":
            return (
              <div
                key={b.id}
                className={cn("py-6", wrapperClass)}
                onClick={
                  selectable
                    ? (e) => {
                        e.stopPropagation();
                        onSelectBlock?.(b.id);
                      }
                    : undefined
                }
              >
                {b.style === "space" ? (
                  <div className="h-8" />
                ) : (
                  <div className="border-t border-slate-200" />
                )}
              </div>
            );

          case "spacer":
            return (
              <div
                key={b.id}
                className={wrapperClass}
                onClick={
                  selectable
                    ? (e) => {
                        e.stopPropagation();
                        onSelectBlock?.(b.id);
                      }
                    : undefined
                }
              >
                <Spacer size={b.size} />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

export default RenderBlocks;
