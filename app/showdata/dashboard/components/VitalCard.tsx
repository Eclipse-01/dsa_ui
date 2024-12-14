"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heart, Stethoscope, Activity, Thermometer, Wind, Droplet, HeartPulse, AlertTriangle } from "lucide-react"
import { VitalChart, BloodPressureChart, VitalHistoryData } from "./VitalCharts"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

// 定义图标映射
const IconMap = {
  Heart,
  Stethoscope,
  Activity,
  Thermometer,
  Wind,
  Droplet,
  HeartPulse,
  AlertTriangle,
} as const

interface VitalCardProps {
  title: string
  value?: number | string
  unit: string
  icon: keyof typeof IconMap
  color: string
  chartData?: VitalHistoryData[]
  chartData2?: VitalHistoryData[]
  chartColor?: string
  chartColor2?: string
  sensorId?: string
  isConnected?: boolean
}

export const VitalCard = ({
  title,
  value,
  unit,
  icon,
  color,
  chartData,
  chartData2,
  chartColor,
  chartColor2,
  sensorId,
  isConnected = true,
}: VitalCardProps) => {
  const [showCharts, setShowCharts] = useState(true);
  const [showUninstalled, setShowUninstalled] = useState(true);
  const Icon = IconMap[icon];

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const { showMiniCharts, showUninstalledSensors } = JSON.parse(savedSettings);
      setShowCharts(showMiniCharts);
      setShowUninstalled(showUninstalledSensors);
    }

    const handleSettingsChange = (event: CustomEvent) => {
      const { showMiniCharts, showUninstalledSensors } = event.detail.settings;
      setShowCharts(showMiniCharts);
      setShowUninstalled(showUninstalledSensors);
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  if (!sensorId && !showUninstalled) {
    return null;
  }

  if (!sensorId) {
    return (
      <Card className="opacity-50">
        <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
          {title}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">未安装传感器</span>
            <Icon className="w-6 h-6" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20 text-muted-foreground">
            暂无数据
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={!isConnected ? "opacity-50" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
        <div className="flex flex-col">
          {title}
          <span className="text-xs text-muted-foreground">{sensorId}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isConnected && <span className="text-xs text-muted-foreground">已断开</span>}
          <Icon className={`w-6 h-6 ${isConnected ? color : 'text-muted-foreground'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={`text-3xl font-bold ${isConnected ? color : 'text-muted-foreground'}`}>
            {value ?? '-- '}<span className="text-base font-normal">{unit}</span>
          </div>
          {isConnected && showCharts && chartData && chartData2 && chartColor && chartColor2 ? (
            <BloodPressureChart systolicData={chartData} diastolicData={chartData2} />
          ) : (
            isConnected && showCharts && chartData && chartColor && <VitalChart data={chartData} color={chartColor} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
