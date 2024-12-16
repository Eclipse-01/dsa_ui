"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ModeToggle } from "@/components/theme-toggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AppSettings() {
  const [autoAlert, setAutoAlert] = useState(true)
  const [chartAnimation, setChartAnimation] = useState(true)
  const [showMiniCharts, setShowMiniCharts] = useState(true)
  const [fontFamily, setFontFamily] = useState("system-ui")
  const [tableScrollMode, setTableScrollMode] = useState(false)

  // 加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setAutoAlert(settings.autoAlert ?? true)
      setChartAnimation(settings.chartAnimation ?? true)
      setShowMiniCharts(settings.showMiniCharts ?? true)
      setFontFamily(settings.fontFamily ?? "system-ui")
      setTableScrollMode(settings.tableScrollMode ?? false)
    }
  }, [])

  // 保存设置
  const saveSettings = (settings: Record<string, any>) => {
    const savedSettings = localStorage.getItem('app_settings')
    const existingSettings = savedSettings ? JSON.parse(savedSettings) : {}
    const updatedSettings = { ...existingSettings, ...settings }
    localStorage.setItem('app_settings', JSON.stringify(updatedSettings))
    window.dispatchEvent(
      new CustomEvent('settingsChanged', { detail: { settings: updatedSettings } })
    )
  }

  const handleFontChange = (value: string) => {
    setFontFamily(value)
    document.documentElement.style.setProperty('--font-family', value)
    // 强制触发重新渲染
    document.body.style.fontFamily = value
    saveSettings({ fontFamily: value })
    
    // 派发自定义事件通知字体变化
    window.dispatchEvent(
      new CustomEvent('fontChanged', { 
        detail: { fontFamily: value }
      })
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>界面设置</CardTitle>
        <CardDescription>
          配置应用程序的显示和交互选项
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>显示模式</Label>
            <div className="text-sm text-muted-foreground">
              切换浅色/深色主题显示模式
            </div>
          </div>
          <ModeToggle />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-alert">自动报警</Label>
            <div className="text-sm text-muted-foreground">
              启用后将自动监测并显示异常生命体征警报
            </div>
          </div>
          <Switch
            id="auto-alert"
            checked={autoAlert}
            onCheckedChange={(checked) => {
              setAutoAlert(checked)
              saveSettings({ autoAlert: checked })
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="chart-animation">图表动画</Label>
            <div className="text-sm text-muted-foreground">
              启用后图表将显示平滑的动画效果
            </div>
          </div>
          <Switch
            id="chart-animation"
            checked={chartAnimation}
            onCheckedChange={(checked) => {
              setChartAnimation(checked)
              saveSettings({ chartAnimation: checked })
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="mini-charts">监测卡片图表</Label>
            <div className="text-sm text-muted-foreground">
              在生命体征卡片中显示实时趋势图表
            </div>
          </div>
          <Switch
            id="mini-charts"
            checked={showMiniCharts}
            onCheckedChange={(checked) => {
              setShowMiniCharts(checked)
              saveSettings({ showMiniCharts: checked })
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="table-scroll">数据表格滚动模式</Label>
            <div className="text-sm text-muted-foreground">
              启用后将在单页显示所有数据,通过滚动查看
            </div>
          </div>
          <Switch
            id="table-scroll"
            checked={tableScrollMode}
            onCheckedChange={(checked) => {
              setTableScrollMode(checked)
              saveSettings({ tableScrollMode: checked })
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>字体设置</Label>
            <div className="text-sm text-muted-foreground">
              选择界面显示字体
            </div>
          </div>
          <Select 
            value={fontFamily}
            onValueChange={handleFontChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择字体" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system-ui">系统默认</SelectItem>
              <SelectItem value="MiSans">MiSans</SelectItem>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="PingFang SC">苹方</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </CardContent>
    </Card>
  )
}
