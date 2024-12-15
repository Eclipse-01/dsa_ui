"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface VitalData {
  _time: string;
  _value: number;
  unit: string;
  bed: string;
  type: string;
}

interface VitalSignsChartProps {
  data: VitalData[];
  type: string;
}

export function VitalSignsChart({ data, type }: VitalSignsChartProps) {
  const chartData = data.map(item => ({
    time: new Date(item._time).toLocaleString(),
    value: item._value
  }));

  const maxValue = Math.max(...data.map(d => d._value));
  const minValue = Math.min(...data.map(d => d._value));
  const trend = data[data.length - 1]?._value > data[0]?._value;
  const trendPercentage = ((data[data.length - 1]?._value - data[0]?._value) / data[0]?._value * 100).toFixed(1);

  const chartConfig = {
    value: {
      label: type,
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type}趋势图</CardTitle>
        <CardDescription>
          显示选中数据的变化趋势
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            height={300}
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
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-1))"
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend ? "上升" : "下降"}趋势 {Math.abs(Number(trendPercentage))}% 
              {trend ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              最大值: {maxValue.toFixed(2)} | 最小值: {minValue.toFixed(2)}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
