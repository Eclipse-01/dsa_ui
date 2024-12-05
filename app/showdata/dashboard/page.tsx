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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";  // 引入动画库

// 模拟实时数据
const getRandomValue = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 添加正常值范围常量
const VITAL_RANGES = {
  heartRate: { min: 60, max: 100, unit: 'BPM' },
  bloodO2: { min: 95, max: 100, unit: '%' },
  systolic: { min: 90, max: 140, unit: 'mmHg' },
  diastolic: { min: 60, max: 90, unit: 'mmHg' },
  temperature: { min: 36.1, max: 37.2, unit: '°C' },
  respirationRate: { min: 12, max: 20, unit: '次/分' },
  bloodGlucose: { min: 3.9, max: 6.1, unit: 'mmol/L' },
  heartRateVariability: { min: 20, max: 200, unit: 'ms' },
  stressLevel: { min: 1, max: 3, unit: '/5' }
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
  systolic: VitalHistoryData[];
  diastolic: VitalHistoryData[];
}

interface AlertMessage {
  title: string;
  description: string;
  type: 'warning' | 'error';
}

interface VitalData {
  bed: string;
  heartRate: number;
  bloodO2: number;
  bloodPressure: string;
  temperature: number;
  respirationRate: number;
  bloodGlucose: number;
  heartRateVariability: number;
  stressLevel: number;
}

export default function DashboardPage() {
  const [selectedBed, setSelectedBed] = useState("1号床")
  const [bedsData, setBedsData] = useState<Record<string, VitalData>>({})
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

  const [alerts, setAlerts] = useState<AlertMessage[]>([])

  // 添加检查数据的函数
  const checkVitalSigns = (newVitals: VitalData) => {
    const newAlerts: AlertMessage[] = [];

    // 检查心率
    if (newVitals.heartRate < VITAL_RANGES.heartRate.min || newVitals.heartRate > VITAL_RANGES.heartRate.max) {
      newAlerts.push({
        title: "心率异常",
        description: `当前心率 ${newVitals.heartRate} ${VITAL_RANGES.heartRate.unit} 超出正常范围 (${VITAL_RANGES.heartRate.min}-${VITAL_RANGES.heartRate.max} ${VITAL_RANGES.heartRate.unit})`,
        type: "error"
      });
    }

    // 检查血氧
    if (newVitals.bloodO2 < VITAL_RANGES.bloodO2.min) {
      newAlerts.push({
        title: "血氧饱和度过低",
        description: `当前血氧 ${newVitals.bloodO2}% 低于正常范围 (${VITAL_RANGES.bloodO2.min}%)`,
        type: "error"
      });
    }

    // 检查血压
    const [systolic, diastolic] = newVitals.bloodPressure.split('/').map(Number);
    if (systolic < VITAL_RANGES.systolic.min || systolic > VITAL_RANGES.systolic.max) {
      newAlerts.push({
        title: "收缩压异常",
        description: `当前收缩压 ${systolic} mmHg 超出正常范围 (${VITAL_RANGES.systolic.min}-${VITAL_RANGES.systolic.max} mmHg)`,
        type: "error"
      });
    }
    if (diastolic < VITAL_RANGES.diastolic.min || diastolic > VITAL_RANGES.diastolic.max) {
      newAlerts.push({
        title: "舒张压异常",
        description: `当前舒张压 ${diastolic} mmHg 超出正常范围 (${VITAL_RANGES.diastolic.min}-${VITAL_RANGES.diastolic.max} mmHg)`,
        type: "error"
      });
    }

    // 检查体温
    if (newVitals.temperature < VITAL_RANGES.temperature.min || newVitals.temperature > VITAL_RANGES.temperature.max) {
      newAlerts.push({
        title: "体温异常",
        description: `当前体温 ${newVitals.temperature}°C 超出正常范围 (${VITAL_RANGES.temperature.min}-${VITAL_RANGES.temperature.max}°C)`,
        type: newVitals.temperature > 38 ? "error" : "warning"
      });
    }

    setAlerts(newAlerts);
  }

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      const beds = Array.from({length: 5}, (_, i) => `${i + 1}号床`);
      const currentTime = Date.now();
      
      const newBedsData = {...bedsData};
      beds.forEach(bed => {
        const systolic = getRandomValue(110, 130);
        const diastolic = getRandomValue(70, 90);
        
        newBedsData[bed] = {
          bed,
          heartRate: getRandomValue(60, 100),
          bloodO2: getRandomValue(95, 100),
          bloodPressure: `${systolic}/${diastolic}`,
          temperature: Number((getRandomValue(365, 375) / 10).toFixed(1)),
          respirationRate: getRandomValue(12, 20),
          bloodGlucose: Number((getRandomValue(40, 70) / 10).toFixed(1)),
          heartRateVariability: getRandomValue(20, 100),
          stressLevel: getRandomValue(1, 5),
        };
      });

      setBedsData(newBedsData);

      // 只在选择单个床位时更新历史数据和检查生命体征
      if (selectedBed !== "所有床位") {
        // 检查生命体征
        checkVitalSigns(newBedsData[selectedBed]);
        
        // 更新历史数据
        setVitalsHistory(prev => {
          const updateHistory = (arr: VitalHistoryData[], newValue: number) => {
            const newArr = [...arr, { timestamp: currentTime, value: newValue }];
            return newArr.filter(item => currentTime - item.timestamp <= 30000);
          };

          const bedData = newBedsData[selectedBed];
          if (!bedData) return prev; // 如果没有数据，返回之前的状态

          const [systolic, diastolic] = bedData.bloodPressure.split('/').map(Number);

          return {
            heartRate: updateHistory(prev.heartRate, bedData.heartRate),
            bloodO2: updateHistory(prev.bloodO2, bedData.bloodO2),
            temperature: updateHistory(prev.temperature, bedData.temperature),
            respirationRate: updateHistory(prev.respirationRate, bedData.respirationRate),
            bloodGlucose: updateHistory(prev.bloodGlucose, bedData.bloodGlucose),
            heartRateVariability: updateHistory(prev.heartRateVariability, bedData.heartRateVariability),
            stressLevel: updateHistory(prev.stressLevel, bedData.stressLevel),
            systolic: updateHistory(prev.systolic, systolic),
            diastolic: updateHistory(prev.diastolic, diastolic),
          };
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedBed]);

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
            isAnimationActive={true} // 启用动画
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
              isAnimationActive={true} // 启用动画
            />
            <Area
              type="monotone"
              dataKey="diastolic"
              stroke="#c084fc"
              fill="url(#gradient-diastolic)"
              isAnimationActive={true} // 启用动画
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 修改床位选择器为ShadCN风格
  const BedSelector = () => (
    <Select value={selectedBed} onValueChange={(value) => setSelectedBed(value)}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="选择床位" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="所有床位">所有床位</SelectItem>
        {Array.from({length: 5}, (_, i) => (
          <SelectItem key={i} value={`${i + 1}号床`}>
            {`${i + 1}号床`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className={cn(
        "min-h-screen bg-background",
        "lg:pl-[240px]" // 为侧边栏预留空间
      )}>
        {/* 添加警告显示区域 */}
        {alerts.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                variant={alert.type === "error" ? "destructive" : "default"}
                className={cn(
                  "animate-in slide-in-from-top-2",
                  alert.type === "error" ? "border-red-600 bg-red-600" : "border-yellow-600 bg-yellow-600"
                )}
              >
                <AlertTitle className="text-white">
                  {alert.title}
                </AlertTitle>
                <AlertDescription className="text-white/90">
                  {alert.description}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">生命体征监测</h1>
                <BedSelector />
              </div>
              <ModeToggle />
            </div>
            
            {/* 使用选中床位的数据显示生命体征，并添加动画 */}
            {selectedBed === "所有床位" ? (
              Object.entries(bedsData).map(([bed, data]) => (
                <motion.div
                  key={bed}
                  className="col-span-full bg-muted/50 rounded-lg p-4 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-bold mb-4">{bed}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                        心率
                        <Heart className="w-6 h-6 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-red-500">
                          {data.heartRate} <span className="text-base font-normal">BPM</span>
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
                          {data.bloodO2}%
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
                          {data.bloodPressure} <span className="text-base font-normal">mmHg</span>
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
                          {data.temperature}°C
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
                          {data.respirationRate} <span className="text-base font-normal">次/分</span>
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
                          {data.bloodGlucose} <span className="text-base font-normal">mmol/L</span>
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
                          {data.heartRateVariability} <span className="text-base font-normal">ms</span>
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
                          {data.stressLevel} <span className="text-base font-normal">/5</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))
            ) : (
              // 原有的单床位显示逻辑
              bedsData[selectedBed] && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                      心率
                      <Heart className="w-6 h-6 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold text-red-500">
                          {bedsData[selectedBed].heartRate} <span className="text-base font-normal">BPM</span>
                        </div>
                        {renderVitalChart(vitalsHistory.heartRate, '#ef4444')}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 其他卡片同样包裹在motion.div中以启用动画 */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between text-lg font-semibold">
                      血氧饱和度
                      <Stethoscope className="w-6 h-6 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold text-blue-500">
                          {bedsData[selectedBed].bloodO2}%
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
                          {bedsData[selectedBed].bloodPressure} <span className="text-base font-normal">mmHg</span>
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
                          {bedsData[selectedBed].temperature}°C
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
                          {bedsData[selectedBed].respirationRate} <span className="text-base font-normal">次/分</span>
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
                          {bedsData[selectedBed].bloodGlucose} <span className="text-base font-normal">mmol/L</span>
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
                          {bedsData[selectedBed].heartRateVariability} <span className="text-base font-normal">ms</span>
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
                          {bedsData[selectedBed].stressLevel} <span className="text-base font-normal">/5</span>
                        </div>
                        {renderVitalChart(vitalsHistory.stressLevel, '#ef4444')}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
