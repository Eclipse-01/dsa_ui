"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/components/hooks/use-toast"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const vitalSigns = [
  { id: '心率', name: '心率', unit: 'BPM' },       // 修改这里
  { id: '血氧饱和度', name: '血氧饱和度', unit: '%' }, 
  { id: '血压', name: '血压', unit: 'mmHg' },
  { id: '体温', name: '体温', unit: '°C' },
  { id: '呼吸率', name: '呼吸率', unit: '次/分' },
  { id: '血糖', name: '血糖', unit: 'mmol/L' },
  { id: '心率变异性', name: '心率变异性', unit: 'ms' },
  { id: '压力水平', name: '压力水平', unit: '级' }
]

interface FilterSectionProps {
  dataType: string;
  setDataType: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  endDate: Date | undefined;
  setEndDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  onFilter: (filters: {
    vitalSign: string;
    bedNumber: string;
    startDate?: Date;
    endDate?: Date;
  }) => Promise<void>; // 修改为异步函数类型
}

export function FilterSection({ 
  dataType, 
  setDataType,
  startDate, 
  setStartDate,
  endDate, 
  setEndDate,
  onFilter 
}: FilterSectionProps) {
  const { toast } = useToast()
  const [bedNumber, setBedNumber] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)

  const validateForm = () => {
    if (!dataType) {
      toast({
        title: "错误",
        description: "请选择生理指标",
        variant: "destructive",
      })
      return false
    }
    if (!bedNumber) {
      toast({
        title: "错误",
        description: "请选择病床号",
        variant: "destructive",
      })
      return false
    }
    if (!startDate || !endDate) {
      toast({
        title: "错误",
        description: "请选择完整的日期范围",
        variant: "destructive",
      })
      return false
    }
    if (startDate > endDate) {
      toast({
        title: "错误",
        description: "起始日期不能晚于结束日期",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleFilter = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onFilter({
        vitalSign: dataType,
        bedNumber,
        startDate,
        endDate
      });
      
      toast({
        title: "成功",
        description: "数据筛选完成",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      toast({
        title: "筛选失败",
        description: `出错原因: ${errorMessage}`,
        variant: "destructive",
      });
      console.error("筛选错误:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-background rounded-lg shadow">
      <div className="flex flex-wrap gap-4">
        <Select value={dataType} onValueChange={setDataType}>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue 
              className="select-value" 
              placeholder="选择生理指标" 
            />
          </SelectTrigger>
          <SelectContent>
            {vitalSigns.map((sign) => (
              <SelectItem 
                key={sign.id} 
                value={sign.id}
                className="text-foreground"
              >
                {sign.name} ({sign.unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={bedNumber} onValueChange={setBedNumber}>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue 
              className="select-value" 
              placeholder="选择病床号" 
            />
          </SelectTrigger>
          <SelectContent>
            {Array.from({length: 5}, (_, i) => (
              <SelectItem key={i + 1} value={`${i + 1}`} className="text-foreground">
                {i + 1}号床
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "yyyy-MM-dd") : <span>起始日期</span>}
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
                  "w-[200px] justify-start text-left font-normal",
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

        <Button 
          onClick={handleFilter}
          className="w-[100px]"
          disabled={isLoading}
        >
          {isLoading ? "筛选中..." : "筛选"}
        </Button>
      </div>
    </div>
  )
}
