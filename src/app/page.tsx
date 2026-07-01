import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  const adminExists = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true }
  })

  if (!adminExists) {
    redirect("/admin/setup")
  }

  redirect("/login")
}
