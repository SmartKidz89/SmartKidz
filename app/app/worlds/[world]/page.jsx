import { redirect } from "next/navigation";

export default function WorldAliasPage({ params }) {
  redirect(`/app/world/${params.world}`);
}
