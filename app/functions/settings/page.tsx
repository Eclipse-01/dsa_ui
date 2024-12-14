"use client"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
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
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">系统设置</h1>
              <ModeToggle />
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
