import { redirect } from "next/navigation"

export default function AdminClientIndex() {
  redirect("/admin/dashboard?tab=clients")
}
