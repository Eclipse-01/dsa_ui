export interface VitalData {
  id: string  // 将 id 类型从 number 改为 string
  timestamp: string
  type: string
  value: string
  unit: string
  bed: string
}

export interface VitalDataResponse {
  vitalDataList: VitalData[]
}

export const VITAL_DATA_TYPES = [
  "心率",
  "血氧饱和度", 
  "血压",
  "体温",
  "呼吸率",
  "血糖",
  "心率变异性",
  "压力水平"
] as const;

export const UNITS_MAP = {
  "心率": "BPM",
  "血氧饱和度": "%",
  "血压": "mmHg",
  "体温": "°C",
  "呼吸率": "次/分", 
  "血糖": "mmol/L",
  "心率变异性": "ms",
  "压力水平": "/5"
} as const;

export const NORMAL_RANGES = {
  "心率": { min: 60, max: 100 },
  "血氧饱和度": { min: 95, max: 100 },
  "血压": { 
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 }
  },
  "体温": { min: 36.3, max: 37.2 },
  "呼吸率": { min: 12, max: 20 },
  "血糖": { min: 4.4, max: 6.7 },
  "心率变异性": { min: 30, max: 90 },
  "压力水平": { min: 1, max: 4 }
} as const;

// 移除静态数据列表
export const vitalDataList: VitalData[] = []

// 添加加载数据的函数
export async function loadVitalData(): Promise<VitalData[]> {
  try {
    // 修改请求路径
    const response = await fetch('/data/vitalData.json')
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      throw new Error('Failed to load data')
    }
    const data: VitalDataResponse = await response.json()
    return data.vitalDataList
  } catch (error) {
    console.error('Error loading vital data:', error)
    return []
  }
}
