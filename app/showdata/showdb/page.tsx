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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { VitalData, vitalDataList } from "@/app/data/vitalData"

export default function ShowDBPage() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [dataType, setDataType] = useState("")
  const [data, setData] = useState<VitalData[]>(vitalDataList)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [newData, setNewData] = useState<Partial<VitalData>>({
    timestamp: format(new Date(), "yyyy-MM-dd HH:mm"),
    type: "",
    value: "",
    unit: ""
  })

  // 添加分页相关状态
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // 每页显示的数据条数
  
  // 计算当前页的数据
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  // 处理下一页
  const handleNextPage = () => {
    if (currentPage * itemsPerPage < data.length) {
      setCurrentPage(prev => prev + 1)
    }
  }

  // 处理上一页
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }
  
  // 查询数据
  const handleSearch = () => {
    let filteredData = [...vitalDataList]
    
    if (dataType) {
      // 直接使用完整的类型名称进行筛选
      filteredData = filteredData.filter(item => item.type === dataType)
    }
    
    if (startDate && endDate) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.timestamp)
        return itemDate >= startDate && itemDate <= endDate
      })
    }
    
    setData(filteredData)
  }

  // 添加清除筛选器函数
  const handleClearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setDataType("")
    setData(vitalDataList)
  }

  // 新增数据
  const handleAdd = () => {
    if (!newData.type || !newData.value) return

    const newItem: VitalData = {
      id: data.length + 1,
      timestamp: newData.timestamp || format(new Date(), "yyyy-MM-dd HH:mm"),
      type: newData.type,
      value: newData.value,
      unit: newData.unit || ""
    }

    setData([...data, newItem])
    setNewData({
      timestamp: format(new Date(), "yyyy-MM-dd HH:mm"),
      type: "",
      value: "",
      unit: ""
    })
  }

  // 删除单条数据
  const handleDelete = (id: number) => {
    setData(data.filter(item => item.id !== id))
    setSelectedItems(selectedItems.filter(itemId => itemId !== id))
  }

  // 添加确认对话框状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // 修改删除选中数据的函数
  const handleDeleteSelected = () => {
    setData(data.filter(item => !selectedItems.includes(item.id)))
    setSelectedItems([])
    setIsDeleteDialogOpen(false) // 关闭对话框
  }

  // 修改导出数据函数
  const handleExport = () => {
    // 如果没有选中任何数据，提示用户并返回
    if (selectedItems.length === 0) {
      alert("请至少选择一条数据进行导出");
      return;
    }

    // 过滤出选中的数据
    const selectedData = data.filter(item => selectedItems.includes(item.id));

    const headers = ["时间", "数据类型", "数值", "单位"];
    const csvContent = [
      headers.join(","),
      ...selectedData.map(item => 
        [item.timestamp, item.type, item.value, item.unit].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `生命体征数据_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
  }

  // 处理选中状态
  const handleSelect = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  // 添加处理全选的函数
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // 选择当前显示的所有数据
      setSelectedItems(data.map(item => item.id))
    } else {
      // 取消所有选择
      setSelectedItems([])
    }
  }

  // 添加页码输入状态
  const [pageInput, setPageInput] = useState("")
  
  // 计算总页数
  const totalPages = Math.ceil(data.length / itemsPerPage)

  // 处理页码跳转
  const handlePageJump = () => {
    const pageNumber = parseInt(pageInput)
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      setPageInput("") // 清空输入
    } else {
      alert(`请输入1-${totalPages}之间的页码`)
    }
  }

  // 处理页码输入
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // 只允许输入数字
    if (/^\d*$/.test(value)) {
      setPageInput(value)
    }
  }

  // 处理回车键跳转
  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageJump()
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className={cn(
        "min-h-screen bg-background",
        "lg:pl-[240px]"
      )}>
        <div className="flex items-center p-4 lg:hidden">
          <h1 className="ml-2 text-xl font-bold">DSA智能监测系统</h1>
        </div>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">历史数据</h1>
              <ModeToggle />
            </div>

            <Card className="mb-6">
              <CardHeader className="text-lg font-semibold">数据筛选</CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Select value={dataType} onValueChange={setDataType}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="选择数据类型" />
                    </SelectTrigger>
                    <SelectContent>
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

                  <Button onClick={handleSearch}>查询</Button>
                  <Button variant="outline" onClick={handleClearFilters}>清除筛选</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="text-lg font-semibold">数据列表</div>
                <div className="flex flex-wrap gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">新增数据</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加新数据</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label>数据类型</label>
                          <Select onValueChange={(v) => setNewData({...newData, type: v})}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择数据类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="心率">心率</SelectItem>
                              <SelectItem value="血压">血压</SelectItem>
                              <SelectItem value="血氧饱和度">血氧饱和度</SelectItem>
                              <SelectItem value="体温">体温</SelectItem>
                              <SelectItem value="呼吸率">呼吸率</SelectItem>
                              <SelectItem value="血糖">血糖</SelectItem>
                              <SelectItem value="心率变异性">心率变异性</SelectItem>
                              <SelectItem value="压力水平">压力水平</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label>数值</label>
                          <Input 
                            value={newData.value} 
                            onChange={(e) => setNewData({...newData, value: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleAdd}>确定</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="text-red-500"
                        disabled={selectedItems.length === 0}
                      >
                        删除选中
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>确认删除</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>是否确认删除选中的 {selectedItems.length} 条数据？</p>
                        <p className="text-sm text-muted-foreground mt-2">此操作不可撤销</p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteSelected}
                        >
                          确认删除
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    onClick={handleExport}
                    disabled={selectedItems.length === 0}
                  >
                    导出数据
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <label>
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedItems.length === data.length && data.length > 0}
                              onChange={handleSelectAll}
                              aria-label="Select all"
                            />
                          </label>
                        </TableHead>
                        <TableHead>时间</TableHead>
                        <TableHead>数据类型</TableHead>
                        <TableHead>数值</TableHead>
                        <TableHead>单位</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCurrentPageData().map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <label>
                              <input 
                                type="checkbox" 
                                className="rounded" 
                                checked={selectedItems.includes(row.id)}
                                onChange={() => handleSelect(row.id)}
                                aria-label="Select row" 
                              />
                            </label>
                          </TableCell>
                          <TableCell>{row.timestamp}</TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell>{row.value}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(row.id)}
                            >
                              删除
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 space-y-4 sm:space-y-0">
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    显示 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, data.length)} 条，共 {data.length} 条
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none"
                    >
                      上一页
                    </Button>
                    <div className="flex flex-wrap items-center gap-1 flex-1 sm:flex-none justify-center">
                      <span className="text-sm whitespace-nowrap">第 {currentPage}/{totalPages} 页</span>
                      <Input
                        className="w-16 text-center"
                        value={pageInput}
                        onChange={handlePageInputChange}
                        onKeyDown={handlePageInputKeyDown}
                        placeholder="页码"
                      />
                      <Button 
                        variant="outline"
                        onClick={handlePageJump}
                        disabled={!pageInput}
                        className="whitespace-nowrap"
                      >
                        跳转
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleNextPage}
                      disabled={currentPage * itemsPerPage >= data.length}
                      className="flex-1 sm:flex-none"
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
