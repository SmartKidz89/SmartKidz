import ComfyWorkflows from "@/components/lessons/ComfyWorkflows";

export default function AdminWorkflowsPage() {
  return (
    <div className="p-6">
      <div className="mb-1 text-xl font-semibold">ComfyUI Workflows</div>
      <div className="mb-6 text-sm text-slate-500">
        Manage ComfyUI workflow templates stored in Supabase. Set <span className="font-mono">COMFYUI_WORKFLOW_SOURCE=db</span> (or <span className="font-mono">auto</span>) to load templates from the database.
      </div>
      <ComfyWorkflows />
    </div>
  );
}
