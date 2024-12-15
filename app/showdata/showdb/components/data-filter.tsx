"use client"

import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { DateRange } from "react-day-picker"
import { Search } from "lucide-react"

// 更新生命体征类型
const VITAL_SIGNS = [
  { id: 'heart_rate', name: '心率', unit: 'BPM' },
  { id: 'blood_oxygen', name: '血氧饱和度', unit: '%' },
  { id: 'blood_pressure', name: '血压', unit: 'mmHg' },
  { id: 'temperature', name: '体温', unit: '°C' },
  { id: 'respiratory_rate', name: '呼吸率', unit: '次/分' },
  { id: 'blood_glucose', name: '血糖', unit: 'mmol/L' },
  { id: 'heart_rate_var', name: '心率变异性', unit: 'ms' },
  { id: 'stress_level', name: '压力水平', unit: '/5' }
]

interface DataFilterProps {
  onQuery: (params: {
    dateRange: DateRange;
    vitalSign: string;
    bedNumber: string;
    findExtremes?: boolean;
  }) => void
}

export function DataFilter({ onQuery }: DataFilterProps) {
  const [date, setDate] = useState<DateRange | undefined>()
  const [vitalSign, setVitalSign] = useState("")
  const [bedNumber, setBedNumber] = useState("")

  // 检查是否所有必填项都已选择
  const isFormComplete = date?.from && date?.to && vitalSign && bedNumber

  const handleQuery = (findExtremes: boolean = false) => {
    if (!isFormComplete || !date) return
    
    onQuery({
      dateRange: date,
      vitalSign,
      bedNumber,
      findExtremes
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>查询条件</CardTitle>
        <CardDescription>
          选择要查询的生命体征数据范围
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <DatePickerWithRange
              date={date}
              setDate={setDate}
              className="w-full md:w-[300px]"
            />
            <Select value={vitalSign} onValueChange={setVitalSign}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="选择生命体征" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>生命体征</SelectLabel>
                  {VITAL_SIGNS.map((sign) => (
                    <SelectItem key={sign.id} value={sign.name}>
                      {sign.name}
                      <span className="ml-2 text-gray-500 text-sm">
                        ({sign.unit})
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={bedNumber} onValueChange={setBedNumber}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="选择床位" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>床位号</SelectLabel>
                  {Array.from({length: 5}, (_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1}`}>
                      {i + 1}号床
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button 
              className="w-full md:w-auto" 
              onClick={() => handleQuery(false)}
              disabled={!isFormComplete}
              title={!isFormComplete ? "请完成所有选项再查询" : "点击查询"}
            >
              <Search className="mr-2 h-4 w-4" />
              查询
            </Button>
            <Button 
              className="w-full md:w-auto" 
              onClick={() => handleQuery(true)}
              disabled={!isFormComplete}
              title={!isFormComplete ? "请完成所有选项再查询" : "点击查找最值"}
            >
              <Search className="mr-2 h-4 w-4" />
              查找最值
            </Button>
          </div>
          {!isFormComplete && (
            <p className="text-sm text-muted-foreground">
              请选择完整的日期范围、生命体征和床位后再进行查询
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
