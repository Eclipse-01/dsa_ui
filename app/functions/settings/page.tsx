"use client"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { Settings } from "lucide-react"
import { DatabaseConfig } from "./components/DatabaseConfig"
import { AppSettings } from "./components/AppSettings"
import { DatabaseCLI } from "./components/DatabaseCLI"
import { Function } from "./components/Function"

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className="min-h-screen bg-background lg:pl-[240px]">
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">系统设置</h1>
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
              </div>
            </div>

            <div className="space-y-6">
              <AppSettings />
              <Function />
              <DatabaseConfig />
              <DatabaseCLI />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
