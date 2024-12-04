"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export default function ShowDBPage() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [dataType, setDataType] = useState("")

  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className={cn(
        "min-h-screen bg-background",
        "lg:pl-[240px]"
      )}>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">历史数据</h1>
              <ModeToggle />
            </div>

            <Card className="mb-6">
              <CardHeader className="text-lg font-semibold">数据筛选</CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Select value={dataType} onValueChange={setDataType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择数据类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heart_rate">心率</SelectItem>
                      <SelectItem value="blood_pressure">血压</SelectItem>
                      <SelectItem value="blood_oxygen">血氧</SelectItem>
                      <SelectItem value="temperature">体温</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "yyyy-MM-dd") : "开始日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[180px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "yyyy-MM-dd") : "结束日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                    </PopoverContent>
                  </Popover>

                  <Button>查询</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="text-lg font-semibold">数据列表</div>
                <div className="space-x-2">
                  <Button variant="outline">新增数据</Button>
                  <Button variant="outline" className="text-red-500">删除选中</Button>
                  <Button variant="outline">导出数据</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">选择</TableHead>
                      <TableHead>时间</TableHead>
                      <TableHead>数据类型</TableHead>
                      <TableHead>数值</TableHead>
                      <TableHead>单位</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 这里将通过API获取数据并渲染 */}
                    <TableRow>
                      <TableCell>
                        <label>
                          <input type="checkbox" className="rounded" aria-label="Select row" />
                        </label>
                      </TableCell>
                      <TableCell>2024-01-20 10:30</TableCell>
                      <TableCell>心率</TableCell>
                      <TableCell>75</TableCell>
                      <TableCell>次/分</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">删除</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
