"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import type { VitalData, ChartDataPoint } from "../../types"

// 添加线性回归计算函数
const calculateLinearRegression = (data: VitalData[]): {
  slope: number;
  intercept: number;
  r2: number;
} => {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  // 将时间转换为相对时间（以首个时间点为0）
  const baseTime = new Date(data[0]._time).getTime();
  const xValues = data.map(d => (new Date(d._time).getTime() - baseTime) / (1000 * 60)); // 转换为分钟
  const yValues = data.map(d => d._value);

  // 计算均值
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = yValues.reduce((a, b) => a + b, 0) / n;

  // 计算斜率和截距
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // 计算R²
  const yPredicted = xValues.map(x => slope * x + intercept);
  const ssRes = yValues.reduce((sum, y, i) => sum + Math.pow(y - yPredicted[i], 2), 0);
  const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const r2 = 1 - (ssRes / ssTot);

  return { slope, intercept, r2 };
}

// 修改为平均值降采样法
const sampleData = (data: VitalData[], sampleSize: number = 100): VitalData[] => {
  if (data.length <= sampleSize) return data;
  
  const sampled: VitalData[] = [];
  const windowSize = Math.floor(data.length / sampleSize);
  
  // 始终保留第一个点
  sampled.push(data[0]);
  
  // 对每个窗口计算平均值
  for (let i = 1; i < data.length - windowSize; i += windowSize) {
    let sum = 0;
    let timeSum = 0;
    
    for (let j = i; j < i + windowSize && j < data.length; j++) {
      sum += data[j]._value;
      timeSum += new Date(data[j]._time).getTime();
    }
    
    const avgValue = sum / windowSize;
    const avgTime = new Date(timeSum / windowSize).toISOString();
    
    sampled.push({
      ...data[i],
      _value: avgValue,
      _time: avgTime,
    });
  }
  
  // 始终保留最后一个点
  sampled.push(data[data.length - 1]);
  
  return sampled;
}

// 修改 getMinMaxValues 函数的类型处理
const getMinMaxValues = (data: VitalData[]): { min: number; max: number } => {
  let max = Number.NEGATIVE_INFINITY;
  let min = Number.POSITIVE_INFINITY;
  
  for (const item of data) {
    max = Math.max(max, item._value);
    min = Math.min(min, item._value);
  }
  
  return { 
    min: min === Number.POSITIVE_INFINITY ? 0 : min,
    max: max === Number.NEGATIVE_INFINITY ? 0 : max
  };
}

// 添加一个获取动画设置的工具函数
const getChartAnimationSetting = (): boolean => {
  try {
    const settings = localStorage.getItem('app_settings')
    if (settings) {
      const parsed = JSON.parse(settings)
      return !!parsed.chartAnimation
    }
  } catch (error) {
    console.error('读取图表动画设置失败:', error)
  }
  return false
}

interface VitalSignsChartProps {
  data: VitalData[];
  type: string;
  open: boolean;
  onClose: () => void;
}

export function VitalSignsChart({ data, type, open, onClose }: VitalSignsChartProps) {
  const sampledData = sampleData(data);
  const { min: minValue, max: maxValue } = getMinMaxValues(sampledData);

  // 使用线性回归计算趋势
  const { slope, r2 } = calculateLinearRegression(sampledData);
  const trend = slope !== 0 ? slope > 0 : false;
  
  // 计算整体变化百分比（基于回归线）
  const firstValue = sampledData[0]?._value ?? 0;
  const totalMinutes = (new Date(sampledData[sampledData.length - 1]._time).getTime() - 
                       new Date(sampledData[0]._time).getTime()) / (1000 * 60);
  const totalChange = slope * totalMinutes;
  const trendPercentage = firstValue !== 0 ? (totalChange / firstValue * 100) : 0;

  // 修改数据处理逻辑，移除血压特殊处理
  const chartData: ChartDataPoint[] = sampledData.map(item => ({
    time: new Date(item._time).toLocaleString(),
    value: item._value,
    original: item
  }));

  const chartConfig = {
    value: {
      label: type,
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.[0]?.payload) return null;
    const data = payload[0].payload.original as VitalData;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium">
          {new Date(label).toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {type}: {Number(payload[0].value).toFixed(1)} {data.unit}
        </p>
      </div>
    );
  };

  const isAnimationEnabled = getChartAnimationSetting()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{type}趋势图</DialogTitle>
          <DialogDescription>
            显示选中数据的变化趋势
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ChartContainer config={chartConfig}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              height={400}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-1))"
                fill="url(#colorValue)"
                isAnimationActive={isAnimationEnabled}
                animationDuration={1000}
                animationBegin={0}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ChartContainer>

          <div className="space-y-8"> {/* 增加 space-y-8 使卡片之间的间距更大 */}
            {/* 趋势卡片 */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {trend ? "上升" : "下降"}趋势
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {Math.abs(Number(trendPercentage)).toFixed(1)}%
                </span>
                {trend ? 
                  <TrendingUp className="h-4 w-4 text-green-500" /> : 
                  <TrendingDown className="h-4 w-4 text-red-500" />
                }
                <span className="text-sm text-gray-500 ml-2">
                  (R² = {r2.toFixed(3)})
                </span>
              </div>
              <div className="text-sm text-gray-500">
                每分钟{Math.abs(slope).toFixed(3)}的速率{trend ? "增长" : "下降"}
              </div>
            </div>

            {/* 数值范围卡片 */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">最大值</span>
                  <span className="text-green-600 dark:text-green-400">
                    {maxValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">最小值</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {minValue.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  数据采样数量: {sampledData.length}
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-right">
              {isAnimationEnabled ? '图表动画已启用' : '图表动画已禁用'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
