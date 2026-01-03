import { redirect } from 'next/navigation';

export default function CurriculumRedirect() {
  // Curriculum content is presented within the marketing features flow.
  redirect('/marketing/features');
}
