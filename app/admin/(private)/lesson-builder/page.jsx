import LessonBuilder from "@/components/lessons/LessonBuilder";

export default function AdminLessonBuilderPage() {
  return (
    <div className="p-6">
      <div className="mb-1 text-xl font-semibold">Lesson Builder</div>
      <div className="mb-6 text-sm text-slate-500">
        Import lesson jobs, generate lessons with your Llama endpoint, then generate image assets in batches of 25 via ComfyUI.
      </div>
      <LessonBuilder />
    </div>
  );
}
