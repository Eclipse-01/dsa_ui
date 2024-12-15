"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { generateTestData } from "./LittleThings/generateTestData"
import { useToast } from "@/components/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { writeVitalData } from "./LittleThings/influxService"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { clearCache } from "./LittleThings/influxService"

interface VitalSign {
  id: string;
  name: string;
  unit: string;
}

const vitalSigns: VitalSign[] = [
  { id: '心率', name: '心率', unit: 'BPM' },
  { id: '血氧饱和度', name: '血氧饱和度', unit: '%' },
  { id: '血压', name: '血压', unit: 'mmHg' },
  { id: '体温', name: '体温', unit: '°C' },
  { id: '呼吸率', name: '呼吸率', unit: '次/分' },
  { id: '血糖', name: '血糖', unit: 'mmol/L' },
  { id: '心率变异性', name: '心率变异性', unit: 'ms' },
  { id: '压力水平', name: '压力水平', unit: '级' }
]

const timeIntervals = [
  { value: 0.00833, label: '0.5秒' },
  { value: 0.01667, label: '1秒' },
  { value: 0.08333, label: '5秒' },
  { value: 0.16667, label: '10秒' },
  { value: 0.5, label: '30秒' },
  { value: 1, label: '1分钟' },
  { value: 2, label: '2分钟' },
  { value: 5, label: '5分钟' },
  { value: 10, label: '10分钟' },
  { value: 15, label: '15分钟' },
  { value: 30, label: '30分钟' }
];

const bedNumbers = Array.from({length: 5}, (_, i) => ({
  id: `${i + 1}`,
  name: `${i + 1}号床`
}));

interface VitalData {
  _time: string;
  _value: number;
  unit: string;
  bed: string;
  type: string;
}

interface GenerateDataDialogProps {
  onDataGenerated: (data: VitalData[]) => void;
}

export function GenerateDataDialog({ onDataGenerated }: GenerateDataDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState("")
  const [startDate, setStartDate] = React.useState<Date>()
  const [endDate, setEndDate] = React.useState<Date>()
  const [progress, setProgress] = React.useState(0)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [selectedTypes, setSelectedTypes] = React.useState<VitalSign[]>([])
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [interval, setInterval] = React.useState(5)
  const [selectedBeds, setSelectedBeds] = React.useState<typeof bedNumbers>([])
  const [bedSelectOpen, setBedSelectOpen] = React.useState(false)
  const [generatingProgress, setGeneratingProgress] = React.useState(0)
  const [worker, setWorker] = React.useState<Worker | null>(null);
  const [totalDataPoints, setTotalDataPoints] = React.useState(0);
  const [generatedDataPoints, setGeneratedDataPoints] = React.useState(0);
  const [taskProgress, setTaskProgress] = React.useState(0);
  const [currentTask, setCurrentTask] = React.useState(0);
  const [totalTasks, setTotalTasks] = React.useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const w = new Worker(new URL('./LittleThings/generateDataWorker.ts', import.meta.url));
      setWorker(w);
    }
    return () => worker?.terminate();
  }, []);

  const handleGenerate = async () => {
    if (selectedTypes.length === 0 || selectedBeds.length === 0 || !startDate || !endDate) {
      toast({
        title: "错误",
        description: "请填写完整的生成参数",
        variant: "destructive",
      })
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "错误",
        description: "开始时间不能晚于结束时间",
        variant: "destructive",
      })
      return;
    }

    setIsGenerating(true)
    setGeneratingProgress(0)
    setProgress(0)
    setTotalDataPoints(0)
    setGeneratedDataPoints(0)
    setTaskProgress(0)
    setCurrentTask(0)
    setTotalTasks(0)

    try {
      const allData: VitalData[] = [];
      const totalCombinations = selectedTypes.length * selectedBeds.length;
      let completedCombinations = 0;
      let overallTotalDataPoints = 0;

      for (const type of selectedTypes) {
        for (const bed of selectedBeds) {
          if (!worker) {
            throw new Error('Worker not initialized');
          }

          worker.onmessage = (e: MessageEvent<any>) => {
            if (e.data.type === 'init') {
              overallTotalDataPoints += e.data.totalDataPoints;
              setTotalDataPoints(overallTotalDataPoints);
              setTotalTasks(Math.ceil(e.data.totalDataPoints / 1000000));
            } else if (e.data.type === 'progress') {
              const combinationProgress = e.data.progress;
              const overallProgress = (completedCombinations * 100 + combinationProgress) / totalCombinations;
              setGeneratingProgress(overallProgress);
              setGeneratedDataPoints(prev => prev + e.data.generated - (prev % e.data.total));
            } else if (e.data.type === 'batch') {
              allData.push(...e.data.data);
            } else if (e.data.type === 'taskProgress') {
              setTaskProgress(e.data.progress);
              setCurrentTask(e.data.currentTask);
            } else if (e.data.type === 'complete') {
              completedCombinations++;
            }
          };

          worker.postMessage({
            config: {
              startDate,
              endDate,
              type: type.id,
              bedNumber: bed.id,
              interval
            },
            batchSize: 1000
          });

          // Wait for worker to complete
          await new Promise<void>(resolve => {
            const messageHandler = (e: MessageEvent<any>) => {
              if (e.data.type === 'complete') {
                worker!.removeEventListener('message', messageHandler);
                resolve();
              }
            };
            worker.addEventListener('message', messageHandler);
          });
        }
      }

      // 展示数据
      onDataGenerated(allData);
      
      // 写入数据库
      await writeVitalData(allData, (progress) => {
        setProgress(progress);
      });

      setOpen(false);
      toast({
        title: "成功",
        description: `已生成并写入 ${allData.length} 条测试数据`,
      })
    } catch (error) {
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "生成数据失败",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setGeneratingProgress(0)
      setProgress(0)
      setTotalDataPoints(0)
      setGeneratedDataPoints(0)
      setTaskProgress(0)
      setCurrentTask(0)
      setTotalTasks(0)
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">生成测试数据</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>生成测试数据</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 生理指标选择器 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">选择生理指标</label>
            <div className="border rounded-md p-4">
              <div className="grid grid-cols-2 gap-2">
                {vitalSigns.map((type) => (
                  <div 
                    key={type.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      checked={selectedTypes.some(t => t.id === type.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTypes(prev => [...prev, type]);
                        } else {
                          setSelectedTypes(prev => 
                            prev.filter(t => t.id !== type.id)
                          );
                        }
                      }}
                    />
                    <label className="text-sm flex justify-between w-full">
                      <span>{type.name}</span>
                      <span className="text-muted-foreground">{type.unit}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {selectedTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTypes.map(type => (
                  <Badge
                    key={type.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {type.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setSelectedTypes(prev => 
                        prev.filter(t => t.id !== type.id)
                      )}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 床位选择器 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">选择床位</label>
            <div className="border rounded-md p-4">
              <div className="grid grid-cols-3 gap-2">
                {bedNumbers.map((bed) => (
                  <div 
                    key={bed.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      checked={selectedBeds.some(b => b.id === bed.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBeds(prev => [...prev, bed]);
                        } else {
                          setSelectedBeds(prev => 
                            prev.filter(b => b.id !== bed.id)
                          );
                        }
                      }}
                    />
                    <label className="text-sm">{bed.name}</label>
                  </div>
                ))}
              </div>
            </div>
            {selectedBeds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedBeds.map(bed => (
                  <Badge
                    key={bed.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {bed.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setSelectedBeds(prev => 
                        prev.filter(b => b.id !== bed.id)
                      )}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "yyyy-MM-dd") : <span>开始日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "yyyy-MM-dd") : <span>结束日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              数据生成间隔
            </label>
            <Select 
              value={interval.toString()} 
              onValueChange={(value) => setInterval(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择时间间隔">
                  {timeIntervals.find(t => t.value === interval)?.label || '选择时间间隔'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeIntervals.map((interval) => (
                  <SelectItem 
                    key={interval.value} 
                    value={interval.value.toString()}
                  >
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              选择数据点之间的时间间隔
            </p>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">生成数据进度</label>
                <Progress value={generatingProgress} />
                <p className="text-sm text-muted-foreground">
                  正在生成数据 ({generatingProgress.toFixed(1)}%) - {generatedDataPoints} / {totalDataPoints} 条
                </p>
                <p className="text-sm text-muted-foreground">
                  当前任务: {currentTask} / {totalTasks} ({taskProgress.toFixed(1)}%)
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">写入数据进度</label>
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">
                  正在写入数据 ({progress.toFixed(1)}%)
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
          >
            {isGenerating ? "生成中..." : "生成数据"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
