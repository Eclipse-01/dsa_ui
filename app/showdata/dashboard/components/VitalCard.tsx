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
  value: number | string
  unit: string
  icon: keyof typeof IconMap
  color: string
  chartData?: VitalHistoryData[]
  chartData2?: VitalHistoryData[]
  chartColor?: string
  chartColor2?: string
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
}: VitalCardProps) => {
  const [showCharts, setShowCharts] = useState(true);
  const Icon = IconMap[icon];

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const { showMiniCharts } = JSON.parse(savedSettings);
      setShowCharts(showMiniCharts);
    }

    const handleSettingsChange = (event: CustomEvent) => {
      const { showMiniCharts } = event.detail.settings;
      setShowCharts(showMiniCharts);
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
        {title}
        <Icon className={`w-6 h-6 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={`text-3xl font-bold ${color}`}>
            {value} <span className="text-base font-normal">{unit}</span>
          </div>
          {showCharts && chartData && chartData2 && chartColor && chartColor2 ? (
            <BloodPressureChart systolicData={chartData} diastolicData={chartData2} />
          ) : (
            showCharts && chartData && chartColor && <VitalChart data={chartData} color={chartColor} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
