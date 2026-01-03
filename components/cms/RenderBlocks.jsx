import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Play } from "lucide-react";

// Marketing Components
import MarketingHero from "@/components/marketing/MarketingHero";
import { FeatureGrid, SubjectTiles, CTA, LogoStrip } from "@/components/marketing/LandingSections";
import ScreenshotsShowcase from "@/components/marketing/ScreenshotsShowcase";
import FAQAccordion from "@/components/marketing/FAQAccordion";

// App Components
import DashboardClient from "@/components/app/DashboardClient";
import RewardsClient from "@/components/app/RewardsClient";
import ParentHomeClient from "@/components/app/ParentHomeClient";

// --- Style System ---

const BG_MAP = {
  white: "bg-white",
  light: "bg-slate-50",
  dark: "bg-slate-900 text-white",
  brand: "bg-indigo-600 text-white",
};

const PAD_MAP = {
  none: "py-0",
  sm: "py-6",
  md: "py-12",
  lg: "py-20",
  xl: "py-32",
};

const ALIGN_MAP = {
  left: "text-left",
  center: "text-center mx-auto",
  right: "text-right ml-auto",
};

function SectionWrapper({ style, className, children, ...props }) {
  const bg = BG_MAP[style?.bg] || BG_MAP.white;
  const pad = PAD_MAP[style?.padding] || PAD_MAP.md;
  const align = ALIGN_MAP[style?.align] || ALIGN_MAP.left;

  return (
    <section className={cn(bg, pad, className)} {...props}>
      <div className={cn("container-pad max-w-5xl", align)}>
        {children}
      </div>
    </section>
  );
}

// --- Components ---

function CtaLink({ href, children, variant = "primary", selectable }) {
  if (!href) return null;
  if (selectable) {
    return <Button variant={variant} className="pointer-events-none">{children}</Button>;
  }
  return <Link href={href}><Button variant={variant}>{children}</Button></Link>;
}

function FaqItem({ question, answer }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white open:bg-slate-50 transition-colors">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-bold text-slate-900">
        {question}
        <span className="transition group-open:rotate-180"><ChevronDown className="h-4 w-4" /></span>
      </summary>
      <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100/50 pt-2">
        {answer}
      </div>
    </details>
  );
}

function VideoEmbed({ url }) {
  let embedUrl = url;
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const id = url.split("v=")[1] || url.split("/").pop();
    embedUrl = `https://www.youtube.com/embed/${id}`;
  }
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-500">
          <Play className="h-12 w-12 opacity-20" />
        </div>
      )}
    </div>
  );
}

export function RenderBlocks({ content, selectable = false, selectedBlockId = null, onSelectBlock }) {
  const blocks = Array.isArray(content?.blocks) ? content.blocks : [];

  return (
    <div className="flex flex-col w-full">
      {blocks.map((b) => {
        const isSelected = selectable && selectedBlockId === b?.id;
        const selectProps = selectable
          ? {
              onClick: (e) => {
                e.stopPropagation();
                onSelectBlock?.(b.id);
              },
              className: cn(
                "relative transition-all cursor-pointer",
                isSelected && "ring-2 ring-indigo-500 ring-inset z-10"
              ),
            }
          : {};

        const s = b.style || {};

        switch (b.type) {
          case "component":
            const Component = {
              MarketingHero,
              FeatureGrid,
              SubjectTiles,
              CTA,
              LogoStrip,
              ScreenshotsShowcase,
              DashboardClient,
              RewardsClient,
              ParentHomeClient
            }[b.componentName];

            if (!Component) return <div {...selectProps} className="p-4 bg-rose-50 text-rose-600 border border-rose-200">Unknown Component: {b.componentName}</div>;
            
            return (
              <div key={b.id} {...selectProps}>
                <Component {...(b.props || {})} />
              </div>
            );

          case "hero":
            return (
              <SectionWrapper key={b.id} style={s} {...selectProps}>
                <div className="max-w-3xl">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">{b.headline}</h1>
                  <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl">{b.subheadline}</p>
                  <div className="flex flex-wrap gap-4">
                    {b.ctaText && <CtaLink href={b.ctaHref} selectable={selectable}>{b.ctaText}</CtaLink>}
                  </div>
                </div>
              </SectionWrapper>
            );

          case "section":
            return (
              <SectionWrapper key={b.id} style={s} {...selectProps}>
                <h2 className="text-3xl font-bold mb-4">{b.title}</h2>
                {b.body && <div className="prose prose-slate max-w-none opacity-90">{b.body}</div>}
              </SectionWrapper>
            );

          case "split":
            return (
              <SectionWrapper key={b.id} style={s} {...selectProps}>
                <div className={`grid md:grid-cols-2 gap-12 items-center ${b.imagePosition === "left" ? "md:grid-flow-dense" : ""}`}>
                  <div className={b.imagePosition === "left" ? "md:col-start-2" : ""}>
                    <h2 className="text-3xl font-bold mb-4">{b.title}</h2>
                    <div className="prose prose-slate max-w-none opacity-90">{b.body}</div>
                  </div>
                  <div className={b.imagePosition === "left" ? "md:col-start-1" : ""}>
                    {b.imageUrl ? (
                      <img src={b.imageUrl} alt="" className="rounded-3xl shadow-xl w-full h-auto object-cover" />
                    ) : (
                      <div className="aspect-[4/3] bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">Image</div>
                    )}
                  </div>
                </div>
              </SectionWrapper>
            );

          case "cards":
            return (
              <SectionWrapper key={b.id} style={s} {...selectProps}>
                {b.title && <h2 className="text-3xl font-bold mb-8 text-center">{b.title}</h2>}
                <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-${b.columns || 3}`}>
                  {(b.cards || []).map((c) => (
                    <Card key={c.id} className="p-6 h-full">
                      <div className="font-extrabold text-lg mb-2">{c.title}</div>
                      <div className="text-sm opacity-80">{c.body}</div>
                    </Card>
                  ))}
                </div>
              </SectionWrapper>
            );

          case "faq":
            return (
              <SectionWrapper key={b.id} style={s} {...selectProps}>
                <div className="max-w-3xl mx-auto">
                  {b.title && <h2 className="text-3xl font-bold mb-8 text-center">{b.title}</h2>}
                  <div className="space-y-4">
                    {(b.items || []).map((item) => (
                      <FaqItem key={item.id} question={item.question} answer={item.answer} />
                    ))}
                  </div>
                </div>
              </SectionWrapper>
            );

          case "pricing":
            return (
              <SectionWrapper key={b.id} style={s} {...selectProps}>
                {b.title && <h2 className="text-3xl font-bold mb-10 text-center">{b.title}</h2>}
                <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
                  {(b.plans || []).map((p) => (
                    <div key={p.id} className="rounded-3xl border p-6 bg-white shadow-sm flex flex-col">
                      <div className="text-lg font-bold text-slate-900">{p.name}</div>
                      <div className="text-3xl font-black text-slate-900 mt-2">{p.price}</div>
                      <div className="mt-6 space-y-3 flex-1">
                        {(p.features || "").split("\n").map((f, i) => (
                          <div key={i} className="flex gap-2 text-sm text-slate-600">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" /> {f}
                          </div>
                        ))}
                      </div>
                      <Button className="w-full mt-6">Choose {p.name}</Button>
                    </div>
                  ))}
                </div>
              </SectionWrapper>
            );

          case "video":
            return (
              <SectionWrapper key={b.id} style={s} {...selectProps}>
                <div className="max-w-4xl mx-auto">
                   <VideoEmbed url={b.url || ""} />
                   {b.caption && <p className="text-center text-sm text-slate-500 mt-3">{b.caption}</p>}
                </div>
              </SectionWrapper>
            );

          case "markdown":
            return (
              <SectionWrapper key={b.id} style={s} {...selectProps}>
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                    {b.markdown || ""}
                  </ReactMarkdown>
                </div>
              </SectionWrapper>
            );

          case "image":
            return (
              <SectionWrapper key={b.id} style={s} {...selectProps}>
                {b.url ? (
                  <figure className={cn("mx-auto", b.maxWidth === "sm" ? "max-w-sm" : b.maxWidth === "md" ? "max-w-md" : "max-w-4xl")}>
                    <img
                      src={b.url}
                      alt={b.alt || ""}
                      className={cn("w-full h-auto shadow-lg", b.rounded !== false ? "rounded-2xl" : "rounded-none")}
                    />
                    {b.caption && <figcaption className="mt-3 text-center text-sm text-slate-500">{b.caption}</figcaption>}
                  </figure>
                ) : (
                  <div className="h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">Select Image</div>
                )}
              </SectionWrapper>
            );

          case "divider":
            return (
              <div {...selectProps} className="py-8 px-6">
                <hr className={cn("border-t-2", b.lineStyle === "dashed" ? "border-dashed" : "border-solid", "border-slate-100")} />
              </div>
            );

          case "spacer":
            return (
              <div {...selectProps} style={{ height: b.size === "lg" ? 96 : b.size === "md" ? 48 : 24 }} />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}