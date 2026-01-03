"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cx } from "@/components/admin/adminUi";

export default function AdminPageHeader({ title, subtitle, backLink, actions, children, className }) {
  return (
    <div className={cx("flex flex-col gap-6 mb-8", className)}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          {backLink && (
            <Link 
              href={backLink} 
              className="mt-1 p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{title}</h1>
            {subtitle && <p className="text-slate-500 font-medium mt-1 text-base">{subtitle}</p>}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
      
      {children && (
        <div className="w-full">
           {children}
        </div>
      )}
      
      <div className="h-px w-full bg-slate-200" />
    </div>
  );
}