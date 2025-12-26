import { redirect } from "next/navigation";

export default async function WorldsAliasWorld({ params }) {
  const w = params?.world;
  redirect(`/app/world/${w}`);
}
