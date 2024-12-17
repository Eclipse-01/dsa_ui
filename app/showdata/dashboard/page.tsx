"use client"
import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { BedSelector } from "./components/BedSelector"
import { VitalAlerts, type AlertMessage } from "./components/VitalAlerts"
import { VitalChart, BloodPressureChart } from "./components/VitalCharts"  // 更新导入
import { VitalCard } from "./components/VitalCard"
import { VITAL_RANGES } from "./constants"
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { getInfluxDBConfig } from '@/config/influxdb'
import { useInfluxDB } from '@/hooks/useInfluxDB'

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
  sensors: {
    heartRate?: { id: string; connected: boolean };
    bloodO2?: { id: string; connected: boolean };
    bloodPressure?: { id: string; connected: boolean };
    temperature?: { id: string; connected: boolean };
    respirationRate?: { id: string; connected: boolean };
    bloodGlucose?: { id: string; connected: boolean };
    heartRateVariability?: { id: string; connected: boolean };
    stressLevel?: { id: string; connected: boolean };
  };
  heartRate?: number;
  bloodO2?: number;
  bloodPressure?: string;
  temperature?: number;
  respirationRate?: number;
  bloodGlucose?: number;
  heartRateVariability?: number;
  stressLevel?: number;
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
  const [enableDataSync, setEnableDataSync] = useState(true)

  // 添加状态来保存传感器配置
  const [sensorConfigs, setSensorConfigs] = useState<Record<string, {
    installed: Record<string, boolean>;
    connected: Record<string, boolean>;
  }>>({});

  const { writeApi } = useInfluxDB();

  // 添加配置监听
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'influxdb_config') {
        window.location.reload() // 配置改变时重新加载页面
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 检查生命体征函数修复
  const checkVitalSigns = (newVitals: VitalData) => {
    if (!autoAlertEnabled) {
      setAlerts([]);
      return;
    }

    const newAlerts: AlertMessage[] = [];

    // 检查心率
    if (newVitals.heartRate && (newVitals.heartRate < VITAL_RANGES.heartRate.min || newVitals.heartRate > VITAL_RANGES.heartRate.max)) {
      newAlerts.push({
        title: "心率异常",
        description: `当前心率 ${newVitals.heartRate} ${VITAL_RANGES.heartRate.unit} 超出正常范围 (${VITAL_RANGES.heartRate.min}-${VITAL_RANGES.heartRate.max} ${VITAL_RANGES.heartRate.unit})`,
        type: "error"
      });
    }

    // 检查血氧
    if (newVitals.bloodO2 && newVitals.bloodO2 < VITAL_RANGES.bloodO2.min) {
      newAlerts.push({
        title: "血氧饱和度过低",
        description: `当前血氧 ${newVitals.bloodO2}% 低于正常范围 (${VITAL_RANGES.bloodO2.min}%)`,
        type: "error"
      });
    }

    // 检查血压
    if (newVitals.bloodPressure) {
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
    }

    // 检查体温
    if (newVitals.temperature && (newVitals.temperature < VITAL_RANGES.temperature.min || newVitals.temperature > VITAL_RANGES.temperature.max)) {
      newAlerts.push({
        title: "体温异常",
        description: `当前体温 ${newVitals.temperature}°C 超出正常范围 (${VITAL_RANGES.temperature.min}-${VITAL_RANGES.temperature.max}°C)`,
        type: newVitals.temperature > 38 ? "error" : "warning"
      });
    }

    setAlerts(newAlerts);
  };

  // 组件卸载时确保数据写入
  useEffect(() => {
    return () => {
      // 组件卸载时刷新所有未写入的数据
      if (writeApi) {
        writeApi.flush().then(() => {
          console.log('所有数据已成功写入')
          writeApi.close().then(() => {
            console.log('InfluxDB 连接已关闭')
          })
        }).catch((error: unknown) => {
          console.error('写入数据时发生错误:', error)
        })
      }
    }
  }, [writeApi])

  // 修改初始化传感器配置的逻辑
  useEffect(() => {
    const beds = Array.from({ length: 5 }, (_, i) => `${i + 1}号床`);
    const sensorTypeMap = {
      '心率': 'heartRate',
      '血氧饱和度': 'bloodO2',
      '血压': 'bloodPressure',
      '体温': 'temperature',
      '呼吸率': 'respirationRate',
      '血糖': 'bloodGlucose',
      '心率变异性': 'heartRateVariability',
      '压力水平': 'stressLevel'
    };

    // 从localStorage读取传感器配置
    const savedSensors = localStorage.getItem('medical_sensors');
    const medicalSensors = savedSensors ? JSON.parse(savedSensors) : [];

    const configs: Record<string, {
      installed: Record<string, boolean>;
      connected: Record<string, boolean>;
    }> = {};

    // 初始化所有床位的配置
    beds.forEach(bed => {
      configs[bed] = {
        installed: {},
        connected: {}
      };

      // 遍历所有可能的传感器类型
      Object.entries(sensorTypeMap).forEach(([typeName, typeKey]) => {
        const sensor = medicalSensors.find(
          (s: any) => s.bed === bed && s.type === typeName
        );
        configs[bed].installed[typeKey] = !!sensor;
        configs[bed].connected[typeKey] = sensor?.status === 'connected';
      });
    });

    setSensorConfigs(configs);
  }, []);

  // 在组件加载时读取设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const { autoAlert, enableDataSync } = JSON.parse(savedSettings);
      setAutoAlertEnabled(autoAlert);
      setEnableDataSync(enableDataSync); // 新增此行
    }
  }, []);

  // 添加传感器配置变化监听
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'medical_sensors' && e.newValue) {
        const beds = Array.from({ length: 5 }, (_, i) => `${i + 1}号床`);
        const sensorTypeMap = {
          '心率': 'heartRate',
          '血氧饱和度': 'bloodO2',
          '血压': 'bloodPressure',
          '体温': 'temperature',
          '呼吸率': 'respirationRate',
          '血糖': 'bloodGlucose',
          '心率变异性': 'heartRateVariability',
          '压力水平': 'stressLevel'
        };

        const medicalSensors = JSON.parse(e.newValue);
        const newConfigs: Record<string, {
          installed: Record<string, boolean>;
          connected: Record<string, boolean>;
        }> = {};

        beds.forEach(bed => {
          newConfigs[bed] = {
            installed: {},
            connected: {}
          };

          Object.entries(sensorTypeMap).forEach(([typeName, typeKey]) => {
            const sensor = medicalSensors.find(
              (s: any) => s.bed === bed && s.type === typeName
            );
            newConfigs[bed].installed[typeKey] = !!sensor;
            newConfigs[bed].connected[typeKey] = sensor?.status === 'connected';
          });
        });

        setSensorConfigs(newConfigs);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(async () => {
      const beds = Array.from({ length: 5 }, (_, i) => `${i + 1}号床`);
      const currentTime = Date.now();

      const newBedsData = { ...bedsData };
      beds.forEach(async bed => {
        const systolic = getRandomValue(110, 130);
        const diastolic = getRandomValue(70, 90);

        // 使用固定的传感器配置
        const bedConfig = sensorConfigs[bed];
        if (!bedConfig) return;

        newBedsData[bed] = {
          bed,
          sensors: {
            heartRate: bedConfig.installed.heartRate ?
              { id: `HR-${bed}-001`, connected: bedConfig.connected.heartRate } : undefined,
            bloodO2: bedConfig.installed.bloodO2 ?
              { id: `BO-${bed}-001`, connected: bedConfig.connected.bloodO2 } : undefined,
            bloodPressure: bedConfig.installed.bloodPressure ?
              { id: `BP-${bed}-001`, connected: bedConfig.connected.bloodPressure } : undefined,
            temperature: bedConfig.installed.temperature ?
              { id: `TM-${bed}-001`, connected: bedConfig.connected.temperature } : undefined,
            respirationRate: bedConfig.installed.respirationRate ?
              { id: `RR-${bed}-001`, connected: bedConfig.connected.respirationRate } : undefined,
            bloodGlucose: bedConfig.installed.bloodGlucose ?
              { id: `BG-${bed}-001`, connected: bedConfig.connected.bloodGlucose } : undefined,
            // 心率变异性使用心率传感器
            heartRateVariability: bedConfig.installed.heartRate ?
              { id: `HR-${bed}-001`, connected: bedConfig.connected.heartRate } : undefined,
            stressLevel: bedConfig.installed.stressLevel ?
              { id: `SL-${bed}-001`, connected: bedConfig.connected.stressLevel } : undefined,
          }
        };

        // 只有安装了传感器且连接正常时才生成数据
        if (bedConfig.installed.heartRate && bedConfig.connected.heartRate) {
          newBedsData[bed].heartRate = getRandomValue(60, 100);
          // 心率变异性数据从心率传感器获得
          newBedsData[bed].heartRateVariability = getRandomValue(20, 100);
        }
        if (bedConfig.installed.bloodO2 && bedConfig.connected.bloodO2) {
          newBedsData[bed].bloodO2 = getRandomValue(95, 100);
        }
        if (bedConfig.installed.bloodPressure && bedConfig.connected.bloodPressure) {
          newBedsData[bed].bloodPressure = `${systolic}/${diastolic}`;
        }
        if (bedConfig.installed.temperature && bedConfig.connected.temperature) {
          newBedsData[bed].temperature = Number((getRandomValue(365, 375) / 10).toFixed(1));
        }
        if (bedConfig.installed.respirationRate && bedConfig.connected.respirationRate) {
          newBedsData[bed].respirationRate = getRandomValue(12, 20);
        }
        if (bedConfig.installed.bloodGlucose && bedConfig.connected.bloodGlucose) {
          newBedsData[bed].bloodGlucose = Number((getRandomValue(40, 70) / 10).toFixed(1));
        }
        if (bedConfig.installed.heartRateVariability && bedConfig.connected.heartRateVariability) {
          newBedsData[bed].heartRateVariability = getRandomValue(20, 100);
        }
        if (bedConfig.installed.stressLevel && bedConfig.connected.stressLevel) {
          newBedsData[bed].stressLevel = getRandomValue(1, 5);
        }

        // 同步数据到 InfluxDB (使用 await)
        await syncToInfluxDB(bed, newBedsData[bed])
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

          const [systolic, diastolic] = bedData.bloodPressure?.split('/').map(Number) || [0, 0];

          return {
            heartRate: bedData.heartRate ? updateHistory(prev.heartRate, bedData.heartRate) : prev.heartRate,
            bloodO2: bedData.bloodO2 ? updateHistory(prev.bloodO2, bedData.bloodO2) : prev.bloodO2,
            temperature: bedData.temperature ? updateHistory(prev.temperature, bedData.temperature) : prev.temperature,
            respirationRate: bedData.respirationRate ? updateHistory(prev.respirationRate, bedData.respirationRate) : prev.respirationRate,
            bloodGlucose: bedData.bloodGlucose ? updateHistory(prev.bloodGlucose, bedData.bloodGlucose) : prev.bloodGlucose,
            heartRateVariability: bedData.heartRateVariability ? updateHistory(prev.heartRateVariability, bedData.heartRateVariability) : prev.heartRateVariability,
            stressLevel: bedData.stressLevel ? updateHistory(prev.stressLevel, bedData.stressLevel) : prev.stressLevel,
            systolic: systolic ? updateHistory(prev.systolic, systolic) : prev.systolic,
            diastolic: diastolic ? updateHistory(prev.diastolic, diastolic) : prev.diastolic,
          };
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedBed, sensorConfigs, autoAlertEnabled]);

  // 添加数据类型和单位的映射
  const VITAL_TYPE_MAP = {
    heartRate: { type: '心率', unit: 'BPM' },
    bloodO2: { type: '血氧饱和度', unit: '%' },
    systolic: { type: '血压', unit: 'mmHg' },
    diastolic: { type: '血压', unit: 'mmHg' },
    temperature: { type: '体温', unit: '°C' },
    respirationRate: { type: '呼吸率', unit: '次/分' },
    bloodGlucose: { type: '血糖', unit: 'mmol/L' },
    heartRateVariability: { type: '心率变异性', unit: 'ms' },
    stressLevel: { type: '压力水平', unit: '/5' }
  } as const;

  // 修改 syncToInfluxDB 函数
  const syncToInfluxDB = async (bed: string, data: VitalData) => {
    if (!writeApi || !enableDataSync) return;
    
    try {
      // 遍历每个生命体征指标，分别写入数据点
      const writeDataPoint = (value: number, field: keyof typeof VITAL_TYPE_MAP) => {
        const { type, unit } = VITAL_TYPE_MAP[field];
        const point = new Point('vital_signs')
          .tag('bed', bed)
          .tag('type', type)
          .tag('unit', unit)
          .floatField('value', value)
          .timestamp(new Date());
        
        writeApi.writePoint(point);
      };

      if (data.heartRate) writeDataPoint(data.heartRate, 'heartRate');
      if (data.bloodO2) writeDataPoint(data.bloodO2, 'bloodO2');
      if (data.bloodPressure) {
        const [systolic, diastolic] = data.bloodPressure.split('/').map(Number);
        writeDataPoint(systolic, 'systolic');
        writeDataPoint(diastolic, 'diastolic');
      }
      if (data.temperature) writeDataPoint(data.temperature, 'temperature');
      if (data.respirationRate) writeDataPoint(data.respirationRate, 'respirationRate');
      if (data.bloodGlucose) writeDataPoint(data.bloodGlucose, 'bloodGlucose');
      if (data.heartRateVariability) writeDataPoint(data.heartRateVariability, 'heartRateVariability');
      if (data.stressLevel) writeDataPoint(data.stressLevel, 'stressLevel');

      await writeApi.flush();
      console.log(`成功写入数据: 床位=${bed}`, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`写入数据失败: 床位=${bed}`, errorMessage);
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className="min-h-screen bg-background lg:pl-[240px]">
        <VitalAlerts alerts={alerts} />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">生命体征监测</h1>
              </div>
              <div className="flex items-center gap-4">
                <BedSelector selectedBed={selectedBed} onBedChange={setSelectedBed} />
                <ModeToggle />
              </div>
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
                    <VitalCard
                      title="心率"
                      value={data.heartRate}
                      unit="BPM"
                      icon="Heart"
                      color="text-red-500"
                      sensorId={data.sensors.heartRate?.id}
                      isConnected={data.sensors.heartRate?.connected}
                    />
                    <VitalCard
                      title="血氧饱和度"
                      value={data.bloodO2}
                      unit="%"
                      icon="Stethoscope"
                      color="text-blue-500"
                      sensorId={data.sensors.bloodO2?.id}
                      isConnected={data.sensors.bloodO2?.connected}
                    />
                    <VitalCard
                      title="血压"
                      value={data.bloodPressure}
                      unit="mmHg"
                      icon="Activity"
                      color="text-purple-500"
                      sensorId={data.sensors.bloodPressure?.id}
                      isConnected={data.sensors.bloodPressure?.connected}
                    />
                    <VitalCard
                      title="体温"
                      value={data.temperature}
                      unit="°C"
                      icon="Thermometer"
                      color="text-orange-500"
                      sensorId={data.sensors.temperature?.id}
                      isConnected={data.sensors.temperature?.connected}
                    />
                    <VitalCard
                      title="呼吸率"
                      value={data.respirationRate}
                      unit="次/分"
                      icon="Wind"
                      color="text-green-500"
                      sensorId={data.sensors.respirationRate?.id}
                      isConnected={data.sensors.respirationRate?.connected}
                    />
                    <VitalCard
                      title="血糖"
                      value={data.bloodGlucose}
                      unit="mmol/L"
                      icon="Droplet"
                      color="text-yellow-500"
                      sensorId={data.sensors.bloodGlucose?.id}
                      isConnected={data.sensors.bloodGlucose?.connected}
                    />
                    <VitalCard
                      title="心率变异性"
                      value={data.heartRateVariability}
                      unit="ms"
                      icon="HeartPulse"
                      color="text-green-500"
                      sensorId={data.sensors.heartRateVariability?.id}
                      isConnected={data.sensors.heartRateVariability?.connected}
                    />
                    <VitalCard
                      title="压力水平"
                      value={data.stressLevel}
                      unit="/5"
                      icon="AlertTriangle"
                      color="text-red-500"
                      sensorId={data.sensors.stressLevel?.id}
                      isConnected={data.sensors.stressLevel?.connected}
                    />
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
                  <VitalCard
                    title="心率"
                    value={bedsData[selectedBed].heartRate}
                    unit="BPM"
                    icon="Heart"
                    color="text-red-500"
                    chartData={vitalsHistory.heartRate}
                    chartColor="#ef4444"
                    sensorId={bedsData[selectedBed].sensors.heartRate?.id}
                    isConnected={bedsData[selectedBed].sensors.heartRate?.connected}
                  />
                  <VitalCard
                    title="血氧饱和度"
                    value={bedsData[selectedBed].bloodO2}
                    unit="%"
                    icon="Stethoscope"
                    color="text-blue-500"
                    chartData={vitalsHistory.bloodO2}
                    chartColor="#3b82f6"
                    sensorId={bedsData[selectedBed].sensors.bloodO2?.id}
                    isConnected={bedsData[selectedBed].sensors.bloodO2?.connected}
                  />
                  <VitalCard
                    title="血压"
                    value={bedsData[selectedBed].bloodPressure}
                    unit="mmHg"
                    icon="Activity"
                    color="text-purple-500"
                    chartData={vitalsHistory.systolic}
                    chartData2={vitalsHistory.diastolic}
                    chartColor="#9333ea"
                    chartColor2="#c084fc"
                    sensorId={bedsData[selectedBed].sensors.bloodPressure?.id}
                    isConnected={bedsData[selectedBed].sensors.bloodPressure?.connected}
                  />
                  <VitalCard
                    title="体温"
                    value={bedsData[selectedBed].temperature}
                    unit="°C"
                    icon="Thermometer"
                    color="text-orange-500"
                    chartData={vitalsHistory.temperature}
                    chartColor="#f97316"
                    sensorId={bedsData[selectedBed].sensors.temperature?.id}
                    isConnected={bedsData[selectedBed].sensors.temperature?.connected}
                  />
                  <VitalCard
                    title="呼吸率"
                    value={bedsData[selectedBed].respirationRate}
                    unit="次/分"
                    icon="Wind"
                    color="text-green-500"
                    chartData={vitalsHistory.respirationRate}
                    chartColor="#10b981"
                    sensorId={bedsData[selectedBed].sensors.respirationRate?.id}
                    isConnected={bedsData[selectedBed].sensors.respirationRate?.connected}
                  />
                  <VitalCard
                    title="血糖"
                    value={bedsData[selectedBed].bloodGlucose}
                    unit="mmol/L"
                    icon="Droplet"
                    color="text-yellow-500"
                    chartData={vitalsHistory.bloodGlucose}
                    chartColor="#f59e0b"
                    sensorId={bedsData[selectedBed].sensors.bloodGlucose?.id}
                    isConnected={bedsData[selectedBed].sensors.bloodGlucose?.connected}
                  />
                  <VitalCard
                    title="心率变异性"
                    value={bedsData[selectedBed].heartRateVariability}
                    unit="ms"
                    icon="HeartPulse"
                    color="text-green-500"
                    chartData={vitalsHistory.heartRateVariability}
                    chartColor="#10b981"
                    sensorId={bedsData[selectedBed].sensors.heartRateVariability?.id}
                    isConnected={bedsData[selectedBed].sensors.heartRateVariability?.connected}
                  />
                  <VitalCard
                    title="压力水平"
                    value={bedsData[selectedBed].stressLevel}
                    unit="/5"
                    icon="AlertTriangle"
                    color="text-red-500"
                    chartData={vitalsHistory.stressLevel}
                    sensorId={bedsData[selectedBed].sensors.stressLevel?.id}
                    chartColor="#ef4444"
                    isConnected={bedsData[selectedBed].sensors.stressLevel?.connected}
                  />
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}