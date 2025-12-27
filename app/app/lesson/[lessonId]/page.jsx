import LessonClient from "./LessonClient";

export const dynamic = "force-dynamic";

// IMPORTANT:
// Do NOT fetch lessons on the server with the anon key.
// The lessons table is protected by RLS (authenticated + entitlement),
// so we fetch client-side using the user's session.

export default function LessonPage({ params }) {
  return <LessonClient lessonId={params.lessonId} />;
}
