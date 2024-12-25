"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { executeFluxQuery, getStoredConfig, type InfluxConfig } from "@/lib/influxdb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { Progress } from "@/components/ui/progress"

// 扩展进度类型定义
interface GenerationProgress {
  totalPoints: number
  currentBatch: number
  totalBatches: number
  stage: 'preparing' | 'generating' | 'writing' | 'complete'  // 确保这里的类型定义正确
  startTime: number
  estimatedTimeRemaining: number | null
  processedBatches: number[]  // 修改为记录批次进度
  processedTimes: number[]
}

interface GenerateDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vitalSigns: string[]
  bedNumbers: string[]
}

interface Ranges {
  [key: string]: { min: number; max: number; unit: string };
}

const VITAL_RANGES: Ranges = {
  "心率": { min: 60, max: 100, unit: "BPM" },
  "血氧饱和度": { min: 95, max: 100, unit: "%" },
  "血压": { min: 90, max: 140, unit: "mmHg" },
  "体温": { min: 36, max: 37.5, unit: "°C" },
  "呼吸率": { min: 12, max: 20, unit: "次/分" },
  "血糖": { min: 3.9, max: 6.1, unit: "mmol/L" },
  "心率变异性": { min: 20, max: 100, unit: "ms" },
  "压力水平": { min: 1, max: 5, unit: "/5" }
}

interface TimeUnit {
  value: number;
  label: string;
}

const TIME_UNITS: TimeUnit[] = [
  { value: 1000, label: '秒' },
  { value: 60 * 1000, label: '分钟' },
  { value: 60 * 60 * 1000, label: '小时' }
]

// 修改类型映射的定义方式
type VitalTypeKey = "心率" | "血氧饱和度" | "血压" | "体温" | "呼吸率" | "血糖" | "心率变异性" | "压力水平";

const VITAL_TYPE_MAP: Record<VitalTypeKey, { field: string; unit: string }> = {
  "心率": { field: 'heartRate', unit: 'BPM' },
  "血氧饱和度": { field: 'bloodO2', unit: '%' },
  "血压": { field: 'bloodPressure', unit: 'mmHg' },
  "体温": { field: 'temperature', unit: '°C' },
  "呼吸率": { field: 'respirationRate', unit: '次/分' },
  "血糖": { field: 'bloodGlucose', unit: 'mmol/L' },
  "心率变异性": { field: 'heartRateVariability', unit: 'ms' },
  "压力水平": { field: 'stressLevel', unit: '/5' }
};

// 添加批处理延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function GenerateDataDialog({
  open,
  onOpenChange,
  vitalSigns: defaultVitalSigns = [],
  bedNumbers: defaultBedNumbers = [],
}: GenerateDataDialogProps) {
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState("100")
  const [error, setError] = useState<string | null>(null)
  const [vitalSigns, setVitalSigns] = useState<string[]>(defaultVitalSigns)
  const [bedNumbers, setBedNumbers] = useState<string[]>(defaultBedNumbers)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const BATCH_SIZE = 10000 // 每批次处理的数据点数量
  const [shouldCancel, setShouldCancel] = useState(false)

  // 在 GenerateDataDialog 函数前添加新的时间单位接口和常量
  interface TimeSpan {
    value: number;
    unit: string;
  }

  const [timeSpan, setTimeSpan] = useState<TimeSpan>({
    value: 1,
    unit: "hours"
  })

  // 修改数据生成函数中的时间戳计算
  const generateDataBatch = useCallback((
    batchIndex: number,
    batchSize: number,
    startTime: number,
    intervalMs: number,
    bedNumbers: string[],
    vitalSigns: string[]
  ): Point[] => {
    const points: Point[] = []
    let generatedCount = 0
    
    const targetPoints = batchSize / (bedNumbers.length * vitalSigns.length)
    
    for (let i = 0; i < targetPoints; i++) {
      const pointIndex = batchIndex * (BATCH_SIZE / (bedNumbers.length * vitalSigns.length)) + i
      const currentTimestamp = startTime + (pointIndex * intervalMs)
      const timestampNs = BigInt(Math.floor(currentTimestamp)) * BigInt(1000000) // 转换为整数后再转换为 BigInt
  
      for (const bedNumber of bedNumbers) {
        for (const vitalSign of vitalSigns) {
          if (generatedCount >= batchSize) break
          const range = VITAL_RANGES[vitalSign]
          
          const value = vitalSign === "压力水平" 
            ? Math.floor(1 + Math.random() * 5)
            : Number((range.min + Math.random() * (range.max - range.min)).toFixed(1))
          
          const point = new Point('vital_signs')
            .tag('bed', `${bedNumber}号床`)
            .tag('type', vitalSign)
            .tag('unit', range.unit)
            .floatField('value', value)
            .timestamp(timestampNs.toString())
          
          points.push(point)
          generatedCount++
        }
      }
    }
    
    return points
  }, [])

  // 计算估计剩余时间
  const calculateEstimatedTime = (progress: GenerationProgress): number => {
    const now = Date.now()
    const elapsedTime = now - progress.startTime
    
    const MAX_HISTORY = 10
    progress.processedBatches.push(progress.currentBatch)
    progress.processedTimes.push(now)
    
    if (progress.processedBatches.length > MAX_HISTORY) {
      progress.processedBatches.shift()
      progress.processedTimes.shift()
    }

    if (progress.processedBatches.length < 2) return 0

    // 使用批次数计算速度
    const recentBatches = progress.processedBatches[progress.processedBatches.length - 1] - 
                         progress.processedBatches[0]
    const recentTime = progress.processedTimes[progress.processedTimes.length - 1] - 
                      progress.processedTimes[0]
    const batchesPerMs = recentBatches / recentTime

    // 计算剩余时间
    const remainingBatches = progress.totalBatches - progress.currentBatch
    return Math.round(remainingBatches / batchesPerMs)
  }

  // 格式化时间显示
  const formatEstimatedTime = (ms: number): string => {
    if (ms < 1000) return '小于1秒'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `约${hours}小时${minutes % 60}分钟`
    } else if (minutes > 0) {
      return `约${minutes}分钟${seconds % 60}秒`
    } else {
      return `约${seconds}秒`
    }
  }

  // 修改数据写入函数，添加进度更新
  const writeDataBatch = async (
    points: Point[], 
    writeApi: any, 
    batchIndex: number,
    progressRef: { current: GenerationProgress }
  ): Promise<void> => {
    if (shouldCancel) {
      throw new Error("操作已取消")
    }

    // 批量写入所有点
    await new Promise<void>((resolve) => {
      points.forEach(point => writeApi.writePoint(point))
      writeApi.flush().then(() => resolve())
    })

    // 只更新批次进度
    progressRef.current.currentBatch = batchIndex + 1
    progressRef.current.estimatedTimeRemaining = calculateEstimatedTime(progressRef.current)
    setProgress({ ...progressRef.current })

    await delay(10)
  }

  const handleCancel = async () => {
    if (!loading) {
      onOpenChange(false)
      return
    }
    
    setShouldCancel(true)
    setError("正在取消操作...")
  }

  // 在 handleGenerate 函数中修改时间计算逻辑
  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setShouldCancel(false)
    
    try {
      const numPoints = parseInt(count)
      if (isNaN(numPoints) || numPoints <= 0) throw new Error("请输入有效的数据点数量")
      if (!vitalSigns.length) throw new Error("请至少选择一个生命体征类型")
      if (!bedNumbers.length) throw new Error("请至少选择一个床位")

      // 计算时间范围（毫秒）
      const timeSpanMs = timeSpan.value * (
        timeSpan.unit === "hours" ? 3600000 :
        timeSpan.unit === "days" ? 86400000 :
        timeSpan.unit === "weeks" ? 604800000 : 3600000
      )

      const now = Date.now()
      const startTime = now - timeSpanMs
      
      // 计算实际需要生成的时间点数量
      const timePointsNeeded = Math.ceil(numPoints / (bedNumbers.length * vitalSigns.length))
      
      // 计算时间间隔
      const intervalMs = Math.floor(timeSpanMs / (timePointsNeeded - 1))
      
      // 修正批次大小计算
      const totalPoints = timePointsNeeded * bedNumbers.length * vitalSigns.length
      const totalBatches = Math.ceil(totalPoints / BATCH_SIZE)
  
      console.log(`Generating ${totalPoints} points (${timePointsNeeded} time points × ${bedNumbers.length} beds × ${vitalSigns.length} vital signs)`)

      // 使用引用对象存储进度，修复类型问题
      const progressRef = {
        current: {
          totalPoints: numPoints,
          currentBatch: 0,
          totalBatches,
          stage: 'preparing',
          startTime: Date.now(),
          estimatedTimeRemaining: null,
          processedBatches: [],
          processedTimes: []
        } as GenerationProgress  // 使用 as 类型断言
      }

      setProgress(progressRef.current)
      await delay(100)

      const config = getStoredConfig()
      const writeApi = new InfluxDB({url: config.url, token: config.token})
        .getWriteApi(config.org, config.bucket, 'ns', {
          batchSize: 1000,
          flushInterval: 1000,
        })

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        if (shouldCancel) {
          throw new Error("操作已取消")
        }

        const batchSize = Math.min(BATCH_SIZE, numPoints - batchIndex * BATCH_SIZE)

        // 使用毫秒级时间戳直接传递
        const points = generateDataBatch(
          batchIndex,
          batchSize,
          startTime,    // 直接使用毫秒时间戳
          intervalMs,   // 直接使用毫秒间隔
          bedNumbers,
          vitalSigns
        )

        // 更新生成进度
        progressRef.current = {
          ...progressRef.current,
          stage: 'writing' as const
        }
        setProgress({ ...progressRef.current })

        // 写入数据前添加短暂延迟
        await delay(50)

        await writeDataBatch(points, writeApi, batchIndex, progressRef)

        // 批次间添加适当延迟
        await delay(100)
      }

      await writeApi.close()
      
      if (!shouldCancel) {
        progressRef.current = {
          ...progressRef.current,
          stage: 'complete' as const
        }
        setProgress({ ...progressRef.current })

        await delay(1500)
      }

      onOpenChange(false)
      setProgress(null)

    } catch (err) {
      console.error('Error details:', err)
      setError(err instanceof Error ? err.message : "生成数据失败")
    } finally {
      setLoading(false)
      setShouldCancel(false)
    }
  }

  // 修改进度显示逻辑
  const renderProgress = () => {
    if (!progress) return null

    const percentComplete = Math.round(
      (progress.stage === 'complete' ? 100 : (progress.currentBatch / progress.totalBatches * 100))
    )

    return (
      <div className="space-y-2">
        <Progress value={percentComplete} className="w-full h-2 transition-all duration-300" />
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span className="transition-all duration-300">
            {progress.stage === 'preparing' && "准备中..."}
            {(progress.stage === 'generating' || progress.stage === 'writing') && 
              `正在处理第 ${progress.currentBatch}/${progress.totalBatches} 批数据`}
            {progress.stage === 'complete' && "数据生成完成！"}
          </span>
          <span className="transition-all duration-300">{percentComplete}%</span>
        </div>
        <div className="text-xs space-y-1">
          <div className="text-gray-400 dark:text-gray-500">
            已完成批次: {progress.currentBatch}/{progress.totalBatches} 
            (共 {progress.totalPoints.toLocaleString()} 个数据点)
          </div>
          {progress.estimatedTimeRemaining !== null && progress.stage !== 'complete' && (
            <div className="text-blue-500 dark:text-blue-400">
              预计剩余时间: {formatEstimatedTime(progress.estimatedTimeRemaining)}
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleVitalSignChange = (sign: string) => {
    setVitalSigns(prev =>
      prev.includes(sign) ? prev.filter(s => s !== sign) : [...prev, sign]
    )
  }

  const handleBedNumberChange = (bed: string) => {
    setBedNumbers(prev =>
      prev.includes(bed) ? prev.filter(currentBed => currentBed !== bed) : [...prev, bed]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl transform duration-200 ease-in-out dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
            批量生成数据
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400 mt-2">
            为指定的生命体征和床位生成指定时间的模拟数据
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Label className="text-lg font-semibold mb-4 block dark:text-gray-200">生命体征类型</Label>
              <div className="space-y-3">
                {Object.entries(VITAL_RANGES).map(([name, range]) => (
                  <div key={name} 
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <Checkbox
                      id={name}
                      checked={vitalSigns.includes(name)}
                      onCheckedChange={() => handleVitalSignChange(name)}
                      className="data-[state=checked]:bg-blue-500 dark:border-gray-600"
                    />
                    <Label htmlFor={name} className="cursor-pointer dark:text-gray-200">
                      <span className="font-medium">{name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        ({range.min}-{range.max} {range.unit})
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Label className="text-lg font-semibold mb-4 block dark:text-gray-200">床位号</Label>
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i + 1} 
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <Checkbox
                      id={`bed-${i + 1}`}
                      checked={bedNumbers.includes(`${i + 1}`)}
                      onCheckedChange={() => handleBedNumberChange(`${i + 1}`)}
                      className="data-[state=checked]:bg-blue-500 dark:border-gray-600"
                    />
                    <Label htmlFor={`bed-${i + 1}`} className="cursor-pointer font-medium dark:text-gray-200">
                      {i + 1}号床
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label className="text-sm font-medium dark:text-gray-200">数据点数量</Label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                max="1000"
                className="focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                placeholder="输入数据点数量"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label className="text-sm font-medium dark:text-gray-200">时间跨度</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={timeSpan.value}
                  onChange={(e) => setTimeSpan(prev => ({ ...prev, value: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                />
                <select
                  value={timeSpan.unit}
                  onChange={(e) => setTimeSpan(prev => ({ ...prev, unit: e.target.value }))}
                  className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                  aria-label="选择时间单位"
                >
                  <option value="hours">小时</option>
                  <option value="days">天</option>
                  <option value="weeks">周</option>
                </select>
              </div>
            </div>
          </div>
          {/* 添加进度显示 */}
          {(loading || progress) && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {renderProgress()}
            </div>
          )}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
              ⚠️ {error}
            </p>
          )}
        </div>
        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            {loading ? "取消生成" : "取消"}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中...
              </span>
            ) : "生成数据"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
