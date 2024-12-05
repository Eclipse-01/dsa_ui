"use client"
import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { BedSelector } from "./components/BedSelector"
import { VitalAlerts, type AlertMessage } from "./components/VitalAlerts"
import { VitalChart, BloodPressureChart } from "./components/VitalCharts"  // 更新导入
import { VitalCard } from "./components/VitalCard"
import { VITAL_RANGES } from "./constants"

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
  systolic: VitalHistoryData[];
  diastolic: VitalHistoryData[];
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
  const [autoAlertEnabled, setAutoAlertEnabled] = useState(false);

  // 在组件加载时读取设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const { autoAlert } = JSON.parse(savedSettings);
      setAutoAlertEnabled(autoAlert);
    }
  }, []);

  // 添加检查数据的函数
  const checkVitalSigns = (newVitals: VitalData) => {
    // 如果自动报警未启用，则不执行检查
    if (!autoAlertEnabled) {
      setAlerts([]);
      return;
    }

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

  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className={cn("min-h-screen bg-background", "lg:pl-[240px]")}>
        <VitalAlerts alerts={alerts} />
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">生命体征监测</h1>
                <BedSelector selectedBed={selectedBed} onBedChange={setSelectedBed} />
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
                    <VitalCard title="心率" value={data.heartRate} unit="BPM" icon="Heart" color="text-red-500" />
                    <VitalCard title="血氧饱和度" value={data.bloodO2} unit="%" icon="Stethoscope" color="text-blue-500" />
                    <VitalCard title="血压" value={data.bloodPressure} unit="mmHg" icon="Activity" color="text-purple-500" />
                    <VitalCard title="体温" value={data.temperature} unit="°C" icon="Thermometer" color="text-orange-500" />
                    <VitalCard title="呼吸率" value={data.respirationRate} unit="次/分" icon="Wind" color="text-green-500" />
                    <VitalCard title="血糖" value={data.bloodGlucose} unit="mmol/L" icon="Droplet" color="text-yellow-500" />
                    <VitalCard title="心率变异性" value={data.heartRateVariability} unit="ms" icon="HeartPulse" color="text-green-500" />
                    <VitalCard title="压力水平" value={data.stressLevel} unit="/5" icon="AlertTriangle" color="text-red-500" />
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
                  <VitalCard title="心率" value={bedsData[selectedBed].heartRate} unit="BPM" icon="Heart" color="text-red-500" chartData={vitalsHistory.heartRate} chartColor="#ef4444" />
                  <VitalCard title="血氧饱和度" value={bedsData[selectedBed].bloodO2} unit="%" icon="Stethoscope" color="text-blue-500" chartData={vitalsHistory.bloodO2} chartColor="#3b82f6" />
                  <VitalCard title="血压" value={bedsData[selectedBed].bloodPressure} unit="mmHg" icon="Activity" color="text-purple-500" chartData={vitalsHistory.systolic} chartData2={vitalsHistory.diastolic} chartColor="#9333ea" chartColor2="#c084fc" />
                  <VitalCard title="体温" value={bedsData[selectedBed].temperature} unit="°C" icon="Thermometer" color="text-orange-500" chartData={vitalsHistory.temperature} chartColor="#f97316" />
                  <VitalCard title="呼吸率" value={bedsData[selectedBed].respirationRate} unit="次/分" icon="Wind" color="text-green-500" chartData={vitalsHistory.respirationRate} chartColor="#10b981" />
                  <VitalCard title="血糖" value={bedsData[selectedBed].bloodGlucose} unit="mmol/L" icon="Droplet" color="text-yellow-500" chartData={vitalsHistory.bloodGlucose} chartColor="#f59e0b" />
                  <VitalCard title="心率变异性" value={bedsData[selectedBed].heartRateVariability} unit="ms" icon="HeartPulse" color="text-green-500" chartData={vitalsHistory.heartRateVariability} chartColor="#10b981" />
                  <VitalCard title="压力水平" value={bedsData[selectedBed].stressLevel} unit="/5" icon="AlertTriangle" color="text-red-500" chartData={vitalsHistory.stressLevel} chartColor="#ef4444" />
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
