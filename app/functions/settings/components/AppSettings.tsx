"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SETTINGS_CHANGED_EVENT = 'settingsChanged';

export function AppSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState({
    autoAlert: false,
    alertThreshold: 80,
    chartAnimation: true, // 新增图表动画设置
    showMiniCharts: true  // 新增小图表显示控制
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(prev => ({
        ...prev,
        ...parsed
      }))
    }
  }, [])

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('app_settings', JSON.stringify(newSettings))
    
    // 发出设置变更事件
    const event = new CustomEvent(SETTINGS_CHANGED_EVENT, {
      detail: { settings: newSettings }
    });
    window.dispatchEvent(event);
  }

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">
        界面设置
      </CardHeader>
      <CardContent className="space-y-6">
        {mounted && ( // 只在客户端渲染主题选择器
          <div className="space-y-2">
            <Label>深色模式</Label>
            <Select value={theme || "system"} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择主题模式" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>主题模式</SelectLabel>
                  <SelectItem value="light">浅色</SelectItem>
                  <SelectItem value="dark">深色</SelectItem>
                  <SelectItem value="system">跟随系统</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="autoAlert">自动报警</Label>
            <p className="text-sm text-muted-foreground">
              启用后将自动监测并显示异常生命体征警报
            </p>
          </div>
          <Switch 
            id="autoAlert"
            checked={settings.autoAlert}
            onCheckedChange={(checked) => handleSettingChange('autoAlert', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="chartAnimation">图表动画</Label>
            <p className="text-sm text-muted-foreground">
              启用后图表将显示平滑的动画效果
            </p>
          </div>
          <Switch 
            id="chartAnimation"
            checked={settings.chartAnimation}
            onCheckedChange={(checked) => handleSettingChange('chartAnimation', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="showMiniCharts">监测卡片图表</Label>
            <p className="text-sm text-muted-foreground">
              在生命体征卡片中显示实时趋势图表
            </p>
          </div>
          <Switch 
            id="showMiniCharts"
            checked={settings.showMiniCharts}
            onCheckedChange={(checked) => handleSettingChange('showMiniCharts', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
