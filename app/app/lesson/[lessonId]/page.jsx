import LessonClient from "./LessonClient";

export const dynamic = "force-dynamic";

// IMPORTANT:
// We fetch client-side using the user's session (LessonClient) to respect RLS.
// In Next.js 15+, params is a Promise that must be awaited.

export default async function LessonPage({ params }) {
  const { lessonId } = await params;
  return <LessonClient lessonId={lessonId} />;
}