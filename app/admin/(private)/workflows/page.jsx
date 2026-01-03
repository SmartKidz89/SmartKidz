import ComfyWorkflows from "@/components/lessons/ComfyWorkflows";

export default function AdminWorkflowsPage() {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">ComfyUI Workflows</div>
          <div className="mt-1 text-sm text-slate-500">
            Manage ComfyUI workflow templates stored in Supabase. These templates are used by the lesson asset pipeline.
            If your deployment uses a non-database workflow source, set{" "}
            <span className="font-mono">COMFYUI_WORKFLOW_SOURCE</span> to{" "}
            <span className="font-mono">file</span> or{" "}
            <span className="font-mono">auto</span>.
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ComfyWorkflows />
      </div>
    </div>
  );
}
