import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"

export interface VitalHistoryData {
  timestamp: number
  value: number
}

interface VitalChartProps {
  data: VitalHistoryData[]
  color: string
}

interface BloodPressureChartProps {
  systolicData: VitalHistoryData[]
  diastolicData: VitalHistoryData[]
}

// 改为组件形式
export function VitalChart({ data, color }: VitalChartProps) {
  const [isAnimationActive, setIsAnimationActive] = useState(true);

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const { chartAnimation } = JSON.parse(savedSettings);
      setIsAnimationActive(chartAnimation);
    }

    const handleSettingsChange = (event: CustomEvent) => {
      const { chartAnimation } = event.detail.settings;
      setIsAnimationActive(chartAnimation);
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#gradient-${color})`}
            isAnimationActive={isAnimationActive}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BloodPressureChart({ systolicData, diastolicData }: BloodPressureChartProps) {
  const [isAnimationActive, setIsAnimationActive] = useState(true);

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const { chartAnimation } = JSON.parse(savedSettings);
      setIsAnimationActive(chartAnimation);
    }

    const handleSettingsChange = (event: CustomEvent) => {
      const { chartAnimation } = event.detail.settings;
      setIsAnimationActive(chartAnimation);
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  const combinedData = systolicData.map((item, index) => ({
    timestamp: item.timestamp,
    systolic: item.value,
    diastolic: diastolicData[index]?.value
  }))

  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={combinedData}>
          <defs>
            <linearGradient id="gradient-systolic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradient-diastolic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c084fc" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#c084fc" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="systolic"
            stroke="#9333ea"
            fill="url(#gradient-systolic)"
            isAnimationActive={isAnimationActive}
          />
          <Area
            type="monotone"
            dataKey="diastolic"
            stroke="#c084fc"
            fill="url(#gradient-diastolic)"
            isAnimationActive={isAnimationActive}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
