import { redirect } from "next/navigation";
export default function World({ params }){ redirect(`/marketing/worlds/${params.world}`); }
