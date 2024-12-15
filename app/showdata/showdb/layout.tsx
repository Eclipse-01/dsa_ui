import { Metadata } from "next"
import { Sidebar } from "@/components/sidebar-app"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "数据库查看",
  description: "查看和管理数据库中的生理数据记录",
}

export default function ShowDBLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className={cn("min-h-screen bg-background", "lg:pl-[240px]")}>
        {children}
      </div>
    </div>
  )
}
