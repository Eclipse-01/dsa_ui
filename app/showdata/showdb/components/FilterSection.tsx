"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface FilterSectionProps {
  dataType: string
  setDataType: (value: string) => void
  startDate: Date | undefined
  setStartDate: (date: Date | undefined) => void
  endDate: Date | undefined
  setEndDate: (date: Date | undefined) => void
  handleSearch: () => void
  handleClearFilters: () => void
  handleShowExtremes: () => void
  isExtremeDialogOpen: boolean
  setIsExtremeDialogOpen: (open: boolean) => void
  selectedItems: number[]
  extremeValues: { max: string; min: string }
  showAlert: (title: string, description: string) => void
}

export function FilterSection({
  dataType,
  setDataType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleSearch,
  handleClearFilters,
  handleShowExtremes,
  isExtremeDialogOpen,
  setIsExtremeDialogOpen,
  selectedItems,
  extremeValues,
  showAlert
}: FilterSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="text-lg font-semibold">数据筛选</CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {/* 数据类型选择器 */}
          <Select value={dataType} onValueChange={setDataType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="选择数据类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-bold text-primary">所有类型</SelectItem>
              <SelectItem value="心率">心率</SelectItem>
              <SelectItem value="血氧饱和度">血氧饱和度</SelectItem>
              <SelectItem value="血压">血压</SelectItem>
              <SelectItem value="体温">体温</SelectItem>
              <SelectItem value="呼吸率">呼吸率</SelectItem>
              <SelectItem value="血糖">血糖</SelectItem>
              <SelectItem value="心率变异性">心率变异性</SelectItem>
              <SelectItem value="压力水平">压力水平</SelectItem>
            </SelectContent>
          </Select>

          {/* 开始日期选择器 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[180px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "yyyy-MM-dd") : "开始日期"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
            </PopoverContent>
          </Popover>

          {/* 结束日期选择器 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[180px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "yyyy-MM-dd") : "结束日期"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
            </PopoverContent>
          </Popover>

          {/* 按钮组 */}
          <Button onClick={handleSearch}>查询</Button>
          <Button variant="outline" onClick={handleClearFilters}>清除筛选</Button>
          <Button 
            variant="secondary" 
            className="bg-primary/10 hover:bg-primary/20"
            onClick={() => {
              if (selectedItems.length === 0) {
                showAlert("未选择数据", "请至少选择一条数据进行极值统计");
                return;
              }
              handleShowExtremes();
            }}
          >
            查看极值
          </Button>

          {/* 极值对话框 */}
          <Dialog open={isExtremeDialogOpen} onOpenChange={setIsExtremeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>数据极值统计</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-primary/5">
                    <p className="text-sm text-muted-foreground">最大值</p>
                    <p className="text-2xl font-bold text-primary">{extremeValues.max}</p>
                  </Card>
                  <Card className="p-4 bg-primary/5">
                    <p className="text-sm text-muted-foreground">最小值</p>
                    <p className="text-2xl font-bold text-primary">{extremeValues.min}</p>
                  </Card>
                </div>
                <p className="text-sm text-muted-foreground">
                  * 统计范围：当前选中的 {selectedItems.length} 条数据
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsExtremeDialogOpen(false)}
                >
                  关闭
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
