export interface VitalData {
  _time: string;
  _value: number;
  unit: string;
  bed: string;
  type: string;
}

// 添加图表数据类型定义
export interface ChartDataPoint {
  time: string;
  value: number;
  original: VitalData;
}
