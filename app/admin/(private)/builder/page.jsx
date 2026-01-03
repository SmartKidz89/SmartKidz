import SiteBuilderEditor from "@/components/cms/SiteBuilderEditor";

export default function AdminBuilderPage() {
  return (
    <div className="p-6">
      <div className="mb-1 text-xl font-semibold">Pages</div>
      <div className="mb-6 text-sm text-slate-500">
        Create, edit, publish, and preview pages. Use Media Manager to upload assets and link them here.
      </div>
      <SiteBuilderEditor />
    </div>
  );
}
