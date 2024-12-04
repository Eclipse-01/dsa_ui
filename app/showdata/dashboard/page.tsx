"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { 
  Heart, 
  Stethoscope, 
  Activity, 
  Thermometer, 
  Wind, 
  Droplet,
  HeartPulse,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"

// 模拟实时数据
const getRandomValue = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export default function DashboardPage() {
  const [vitals, setVitals] = useState({
    heartRate: 75,
    bloodO2: 98,
    bloodPressure: "120/80",
    temperature: 36.6,
    respirationRate: 16,     
    bloodGlucose: 5.5,      
    heartRateVariability: 50, 
    stressLevel: 2,           
  })

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals({
        heartRate: getRandomValue(60, 100),
        bloodO2: getRandomValue(95, 100),
        bloodPressure: `${getRandomValue(110, 130)}/${getRandomValue(70, 90)}`,
        temperature: Number((getRandomValue(365, 375) / 10).toFixed(1)),
        respirationRate: getRandomValue(12, 20),
        bloodGlucose: Number((getRandomValue(40, 70) / 10).toFixed(1)),
        heartRateVariability: getRandomValue(20, 100),
        stressLevel: getRandomValue(1, 5),
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className={cn(
        "min-h-screen bg-background",
        "lg:pl-[240px]" // 为侧边栏预留空间
      )}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">生命体征监测</h1>
              <ModeToggle />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  心率
                  <Heart className="w-6 h-6 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">
                    {vitals.heartRate} <span className="text-base font-normal">BPM</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  血氧饱和度
                  <Stethoscope className="w-6 h-6 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">
                    {vitals.bloodO2}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  血压
                  <Activity className="w-6 h-6 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-500">
                    {vitals.bloodPressure} <span className="text-base font-normal">mmHg</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  体温
                  <Thermometer className="w-6 h-6 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-500">
                    {vitals.temperature}°C
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  呼吸率
                  <Wind className="w-6 h-6 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">
                    {vitals.respirationRate} <span className="text-base font-normal">次/分</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  血糖
                  <Droplet className="w-6 h-6 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-500">
                    {vitals.bloodGlucose} <span className="text-base font-normal">mmol/L</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  心率变异性
                  <HeartPulse className="w-6 h-6 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">
                    {vitals.heartRateVariability} <span className="text-base font-normal">ms</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  压力水平
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">
                    {vitals.stressLevel} <span className="text-base font-normal">/5</span>
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
