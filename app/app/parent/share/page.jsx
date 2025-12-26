"use client";

import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from "@/components/app/PaywallGate";
import { readProgressLog } from "@/lib/progress/log";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
async function exportAsPng(el, filename = "smartkidz-milestone.png") {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#FAFAFA" });
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function exportAsPdf(el, filename = "smartkidz-milestone.pdf") {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#FAFAFA" });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 72;
  const ratio = canvas.height / canvas.width;
  const imgHeight = imgWidth * ratio;
  const x = 36;
  const y = 36;

  pdf.addImage(imgData, "PNG", x, y, imgWidth, Math.min(imgHeight, pageHeight - 72));
  pdf.save(filename);
}

function niceKind(a) {
  if (!a) return "Activity";
  if (a.kind === "lesson") return "Lesson";
  if (a.kind === "reading") return "Reading";
  if (a.kind === "writing") return "Writing";
  return "Activity";
}

export default function ParentSharePage() {
  const cardRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const latest = useMemo(() => {
    const log = readProgressLog();
    return log?.[0] || null;
  }, []);

  const title = latest?.title || latest?.lessonTitle || "A learning milestone";
  const subtitle = latest ? `${niceKind(latest)} • ${new Date(latest.ts || Date.now()).toLocaleDateString()}` : "SmartKidz";
  const coins = latest?.coins ?? 0;
  const xp = latest?.xp ?? 0;
  const acc = latest?.quiz?.accuracy;

  return (
    
    <PageScaffold title="Share">
<main className="bg-gradient-to-br from-slate-50 to-white min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <Card className="p-6">
            <div className="text-2xl font-extrabold">Share a milestone</div>
            <p className="mt-2 text-slate-700 max-w-2xl">
              Export a polished milestone card as a PNG or PDF. This is designed to be parent-friendly and shareable.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                data-testid="share-export-png"
                disabled={busy || !latest}
                onClick={async () => {
                  if (!cardRef.current) return;
                  setBusy(true);
                  try {
                    await exportAsPng(cardRef.current);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Export PNG
              </Button>
              <Button
                variant="outline"
                data-testid="share-export-pdf"
                disabled={busy || !latest}
                onClick={async () => {
                  if (!cardRef.current) return;
                  setBusy(true);
                  try {
                    await exportAsPdf(cardRef.current);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Export PDF
              </Button>
            </div>

            {!latest && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                No recent activity found yet. Complete a lesson first, then come back here.
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <div
                ref={cardRef}
                className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.12)] overflow-hidden"
                data-testid="share-card"
              >
                <div className="p-8 bg-[radial-gradient(circle_at_20%_20%,rgba(0,191,165,0.18),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(255,111,97,0.18),transparent_45%),linear-gradient(135deg,#FAFAFA,#FFFFFF)]">
                  <div className="text-sm font-semibold tracking-wide text-slate-600">SMARTKIDZ MILESTONE</div>
                  <div className="mt-3 text-3xl font-extrabold text-slate-900">{title}</div>
                  <div className="mt-2 text-slate-700">{subtitle}</div>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                      <div className="text-xs text-slate-500">Coins</div>
                      <div className="text-xl font-extrabold">{coins}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                      <div className="text-xs text-slate-500">XP</div>
                      <div className="text-xl font-extrabold">{xp}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                      <div className="text-xs text-slate-500">Accuracy</div>
                      <div className="text-xl font-extrabold">{typeof acc === "number" ? `${Math.round(acc * 100)}%` : "—"}</div>
                    </div>
                  </div>
                  <div className="mt-6 text-xs text-slate-500">
                    Powered by SmartKidz — premium learning that kids love.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </PaywallGate>
      </div>
    </main>
  
    </PageScaffold>
  );
}