"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function Function() {
  const [enableDataSync, setEnableDataSync] = useState(true)
  const [showUninstalledSensors, setShowUninstalledSensors] = useState(true)

  // 加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setEnableDataSync(settings.enableDataSync ?? true)
      setShowUninstalledSensors(settings.showUninstalledSensors ?? true)
    }
  }, [])

  // 保存设置
  const saveSettings = (settings: Record<string, boolean>) => {
    const savedSettings = localStorage.getItem('app_settings')
    const existingSettings = savedSettings ? JSON.parse(savedSettings) : {}
    const updatedSettings = { ...existingSettings, ...settings }
    localStorage.setItem('app_settings', JSON.stringify(updatedSettings))
    window.dispatchEvent(
      new CustomEvent('settingsChanged', { detail: { settings: updatedSettings } })
    )
  }

  // 处理数据同步设置变更
  const handleDataSyncChange = (checked: boolean) => {
    setEnableDataSync(checked)
    saveSettings({ enableDataSync: checked })
  }

  // 处理未安装传感器显示设置变更
  const handleUninstalledSensorsChange = (checked: boolean) => {
    setShowUninstalledSensors(checked)
    saveSettings({ showUninstalledSensors: checked })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据功能</CardTitle>
        <CardDescription>
          配置数据采集和显示选项
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="data-sync">数据同步</Label>
            <div className="text-sm text-muted-foreground">
              控制是否将实时生成的数据写入数据库
            </div>
          </div>
          <Switch
            id="data-sync"
            checked={enableDataSync}
            onCheckedChange={handleDataSyncChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-uninstalled">显示未安装传感器</Label>
            <div className="text-sm text-muted-foreground">
              在监测面板中显示未添加的传感器卡片
            </div>
          </div>
          <Switch
            id="show-uninstalled"
            checked={showUninstalledSensors}
            onCheckedChange={handleUninstalledSensorsChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}
