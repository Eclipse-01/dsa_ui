"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

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

            <div className="space-y-4">
              <Card>
                <CardHeader className="text-lg font-semibold">
                  通知设置
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alerts">生命体征异常提醒</Label>
                    <Switch id="alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="updates">系统更新通知</Label>
                    <Switch id="updates" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-lg font-semibold">
                  数据设置
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoSync">自动同步数据</Label>
                    <Switch id="autoSync" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="backup">自动备份</Label>
                    <Switch id="backup" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
