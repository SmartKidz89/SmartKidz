import { redirect } from 'next/navigation';

// Root entrypoint.
// In production we use middleware to serve the marketing experience at `/`.
// This file guarantees local/dev builds never 404 at the root.
export default function RootPage() {
  redirect('/marketing');
}
