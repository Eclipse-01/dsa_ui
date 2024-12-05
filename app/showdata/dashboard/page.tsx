"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
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

interface VitalHistoryData {
  timestamp: number;
  value: number;
}

interface VitalsHistory {
  heartRate: VitalHistoryData[];
  bloodO2: VitalHistoryData[];
  temperature: VitalHistoryData[];
  respirationRate: VitalHistoryData[];
  bloodGlucose: VitalHistoryData[];
  heartRateVariability: VitalHistoryData[];
  stressLevel: VitalHistoryData[];
  systolic: VitalHistoryData[]; // 收缩压
  diastolic: VitalHistoryData[]; // 舒张压
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

  const [vitalsHistory, setVitalsHistory] = useState<VitalsHistory>({
    heartRate: [],
    bloodO2: [],
    temperature: [],
    respirationRate: [],
    bloodGlucose: [],
    heartRateVariability: [],
    stressLevel: [],
    systolic: [],
    diastolic: [],
  })

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const systolic = getRandomValue(110, 130);
      const diastolic = getRandomValue(70, 90);
      
      const newVitals = {
        heartRate: getRandomValue(60, 100),
        bloodO2: getRandomValue(95, 100),
        bloodPressure: `${systolic}/${diastolic}`,
        temperature: Number((getRandomValue(365, 375) / 10).toFixed(1)),
        respirationRate: getRandomValue(12, 20),
        bloodGlucose: Number((getRandomValue(40, 70) / 10).toFixed(1)),
        heartRateVariability: getRandomValue(20, 100),
        stressLevel: getRandomValue(1, 5),
      }

      setVitals(newVitals)
      
      setVitalsHistory(prev => {
        const updateHistory = (arr: VitalHistoryData[], newValue: number) => {
          const newArr = [...arr, { timestamp: currentTime, value: newValue }]
          // 只保留最近30秒的数据
          return newArr.filter(item => currentTime - item.timestamp <= 30000)
        }

        return {
          heartRate: updateHistory(prev.heartRate, newVitals.heartRate),
          bloodO2: updateHistory(prev.bloodO2, newVitals.bloodO2),
          temperature: updateHistory(prev.temperature, newVitals.temperature),
          respirationRate: updateHistory(prev.respirationRate, newVitals.respirationRate),
          bloodGlucose: updateHistory(prev.bloodGlucose, newVitals.bloodGlucose),
          heartRateVariability: updateHistory(prev.heartRateVariability, newVitals.heartRateVariability),
          stressLevel: updateHistory(prev.stressLevel, newVitals.stressLevel),
          systolic: updateHistory(prev.systolic, systolic),
          diastolic: updateHistory(prev.diastolic, diastolic),
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const renderVitalChart = (data: VitalHistoryData[], color: string) => (
    <div className="h-12 w-24"> {/* 修改图表容器尺寸 */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#gradient-${color})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )

  const renderBloodPressureChart = (
    systolicData: VitalHistoryData[], 
    diastolicData: VitalHistoryData[]
  ) => {
    // 合并数据以确保两条曲线使用相同的时间轴
    const combinedData = systolicData.map((item, index) => ({
      timestamp: item.timestamp,
      systolic: item.value,
      diastolic: diastolicData[index]?.value
    }));

    return (
      <div className="h-12 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={combinedData}>
            <defs>
              <linearGradient id="gradient-systolic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="gradient-diastolic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="systolic"
              stroke="#9333ea"
              fill="url(#gradient-systolic)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="diastolic"
              stroke="#c084fc"
              fill="url(#gradient-diastolic)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

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
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-red-500">
                      {vitals.heartRate} <span className="text-base font-normal">BPM</span>
                    </div>
                    {renderVitalChart(vitalsHistory.heartRate, '#ef4444')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  血氧饱和度
                  <Stethoscope className="w-6 h-6 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-blue-500">
                      {vitals.bloodO2}%
                    </div>
                    {renderVitalChart(vitalsHistory.bloodO2, '#3b82f6')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  血压
                  <Activity className="w-6 h-6 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-purple-500">
                      {vitals.bloodPressure} <span className="text-base font-normal">mmHg</span>
                    </div>
                    {renderBloodPressureChart(vitalsHistory.systolic, vitalsHistory.diastolic)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  体温
                  <Thermometer className="w-6 h-6 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-orange-500">
                      {vitals.temperature}°C
                    </div>
                    {renderVitalChart(vitalsHistory.temperature, '#f97316')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  呼吸率
                  <Wind className="w-6 h-6 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-green-500">
                      {vitals.respirationRate} <span className="text-base font-normal">次/分</span>
                    </div>
                    {renderVitalChart(vitalsHistory.respirationRate, '#10b981')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  血糖
                  <Droplet className="w-6 h-6 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-yellow-500">
                      {vitals.bloodGlucose} <span className="text-base font-normal">mmol/L</span>
                    </div>
                    {renderVitalChart(vitalsHistory.bloodGlucose, '#f59e0b')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  心率变异性
                  <HeartPulse className="w-6 h-6 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-green-500">
                      {vitals.heartRateVariability} <span className="text-base font-normal">ms</span>
                    </div>
                    {renderVitalChart(vitalsHistory.heartRateVariability, '#10b981')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                  压力水平
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-red-500">
                      {vitals.stressLevel} <span className="text-base font-normal">/5</span>
                    </div>
                    {renderVitalChart(vitalsHistory.stressLevel, '#ef4444')}
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
