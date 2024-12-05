"use client"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { VitalData } from "@/app/data/vitalData"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartPaintProps {
  isOpen: boolean
  onClose: () => void
  data: VitalData[]
}

const chartConfig = {
  value: {
    label: "数值",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChartPaint({ isOpen, onClose, data }: ChartPaintProps) {
  const [timeRange, setTimeRange] = React.useState("all")
  const [isAnimationActive, setIsAnimationActive] = React.useState(true)

  // 读取动画设置
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      const { chartAnimation } = JSON.parse(savedSettings);
      setIsAnimationActive(chartAnimation);
    }

    // 监听设置变更
    const handleSettingsChange = (event: CustomEvent) => {
      const { chartAnimation } = event.detail.settings;
      setIsAnimationActive(chartAnimation);
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  // 转换数据格式
  const chartData = data.map(item => ({
    date: item.timestamp,
    value: parseFloat(item.value) || 0
  }))

  // 根据时间范围过滤数据
  const filteredData = React.useMemo(() => {
    if (timeRange === "all") return chartData

    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case "3d":
        startDate.setDate(now.getDate() - 3)
        break
      case "1d":
        startDate.setDate(now.getDate() - 1)
        break
      case "12h":
        startDate.setHours(now.getHours() - 12)
        break
      case "6h":
        startDate.setHours(now.getHours() - 6)
        break
      case "3h":
        startDate.setHours(now.getHours() - 3)
        break
      case "1h":
        startDate.setHours(now.getHours() - 1)
        break
      case "30min":
        startDate.setMinutes(now.getMinutes() - 30)
        break
      default:
        return chartData
    }

    return chartData.filter(item => new Date(item.date) >= startDate)
  }, [chartData, timeRange])

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>数据趋势图表</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1 text-center sm:text-left">
              <CardTitle>趋势图表</CardTitle>
              <CardDescription>
                显示所选数据的变化趋势
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="选择时间范围"
              >
                <SelectValue placeholder="全部数据" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部数据</SelectItem>
                <SelectItem value="3d">最近3天</SelectItem>
                <SelectItem value="1d">最近1天</SelectItem>
                <SelectItem value="12h">最近12小时</SelectItem>
                <SelectItem value="6h">最近6小时</SelectItem>
                <SelectItem value="3h">最近3小时</SelectItem>
                <SelectItem value="1h">最近1小时</SelectItem>
                <SelectItem value="30min">最近30分钟</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[350px] w-full"
            >
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-value)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-value)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("zh-CN", {
                      month: "numeric",
                      day: "numeric",
                    })
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      }}
                    />
                  }
                />
                <Area
                  dataKey="value"
                  type="monotone"
                  fill="url(#fillValue)"
                  stroke="var(--color-value)"
                  isAnimationActive={isAnimationActive}  /* 去掉逗号 */
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
