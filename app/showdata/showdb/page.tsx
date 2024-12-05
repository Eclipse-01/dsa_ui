"use client"
import { useState, useEffect } from "react"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { cn } from "@/lib/utils"
import { VitalData, loadVitalData } from "@/app/data/vitalData"
import { FilterSection } from "./components/FilterSection"
import { DataTable } from "./components/DataTable"
import { format } from "date-fns"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChartPaint } from "./components/ChartPaint"

export default function ShowDBPage() {
  // 修改状态初始化
  const [data, setData] = useState<VitalData[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [dataType, setDataType] = useState("all")
  const [bedFilter, setBedFilter] = useState("all")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [newData, setNewData] = useState<Partial<VitalData>>({
    timestamp: format(new Date(), "yyyy-MM-dd HH:mm"),
    type: "",
    value: "",
    unit: "",
    bed: ""  // 添加床位字段
  })

  // 添加分页相关状态
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // 每页显示的数据条数
  
  // 修改 getCurrentPageData 方法，添加日志
  const getCurrentPageData = () => {
    if (!data || !Array.isArray(data)) {
      console.error('数据无效');
      return [];
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = data.slice(startIndex, endIndex);
    console.log('当前页数据:', pageData);
    return pageData;
  }

  // 删除错误的 getPageData 函数，添加正确的 handleNextPage 函数
  // 修改分页处理函数
  const handleNextPage = () => {
    if (currentPage * itemsPerPage < data.length) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }
  
  // 添加数据加载效果
  const [isLoading, setIsLoading] = useState(true)

  // 修改数据加载逻辑
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const loadedData = await loadVitalData()
        if (Array.isArray(loadedData)) {
          setData(loadedData)
        } else {
          console.error('数据格式错误:', loadedData)
          setData([])
          showAlert("错误", "数据格式错误")
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        setData([])
        showAlert("错误", "加载数据失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 修改查询数据逻辑
  const handleSearch = () => {
    try {
      const loadData = async () => {
        const loadedData = await loadVitalData()
        let filteredData = [...loadedData]
        
        if (dataType && dataType !== "all") {
          filteredData = filteredData.filter(item => item.type === dataType)
        }
        
        if (bedFilter && bedFilter !== "all") {
          filteredData = filteredData.filter(item => item.bed === bedFilter)
        }
        
        if (startDate && endDate) {
          filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.timestamp)
            return itemDate >= startDate && itemDate <= endDate
          })
        }
        
        setData(filteredData)
        setCurrentPage(1) // 重置页码
      }

      loadData()
    } catch (error) {
      console.error('筛选数据失败:', error)
      showAlert("错误", "筛选数据失败")
    }
  }

  // 修改清除筛选器函数
  const handleClearFilters = async () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setDataType("all")
    setBedFilter("all")
    const loadedData = await loadVitalData()
    setData(loadedData)
    setCurrentPage(1)
  }

  // 新增数据
  const handleAdd = () => {
    if (!newData.type || !newData.value || !newData.bed) return  // 添加床位检查

    const newItem: VitalData = {
      id: data.length + 1,
      timestamp: newData.timestamp || format(new Date(), "yyyy-MM-dd HH:mm"),
      type: newData.type,
      value: newData.value,
      unit: newData.unit || "",
      bed: newData.bed  // 添加床位
    }

    setData([...data, newItem])
    setNewData({
      timestamp: format(new Date(), "yyyy-MM-dd HH:mm"),
      type: "",
      value: "",
      unit: "",
      bed: ""  // 重置床位
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
    if (selectedItems.length === 0) {
      showAlert("未选择数据", "请至少选择一条数据进行导出");
      return;
    }

    const selectedData = data.filter(item => selectedItems.includes(item.id));

    const headers = ["时间", "数据类型", "��值", "单位"];
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
      showAlert("页码无效", `请输入1-${totalPages}之间的���码`);
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

  // 在useState声明部分添加新的状态
  const [isExtremeDialogOpen, setIsExtremeDialogOpen] = useState(false)
  const [extremeValues, setExtremeValues] = useState<{
    max: { value: string; record: VitalData | null };
    min: { value: string; record: VitalData | null };
  }>({
    max: { value: '', record: null },
    min: { value: '', record: null }
  })

  // 修改计算极值的函数
  const calculateExtremes = () => {
    const selectedData = data.filter(item => selectedItems.includes(item.id))
    
    if (selectedData.length === 0) {
      return null
    }
  
    const numericData = selectedData.map(item => parseFloat(item.value))
    const validData = numericData.filter(value => !isNaN(value))
  
    if (validData.length === 0) {
      return { max: '无有效数值', min: '无有效数值' }
    }
  
    const max = Math.max(...validData).toString()
    const min = Math.min(...validData).toString()
    return { max, min }
  }
  
  // 修改处理极值查询的函数
  const handleShowExtremes = () => {
    const selectedData = data.filter(item => selectedItems.includes(item.id));
    if (selectedData.length === 0) {
      setExtremeValues({
        max: { value: '无数据', record: null },
        min: { value: '无数据', record: null }
      });
      return;
    }
  
    // 过滤出有效的数值数据
    const validData = selectedData.filter(item => !isNaN(parseFloat(item.value)));
    if (validData.length === 0) {
      setExtremeValues({
        max: { value: '无有效数值', record: null },
        min: { value: '无有效数值', record: null }
      });
      return;
    }
  
    const maxRecord = validData.reduce((max, item) => 
      parseFloat(item.value) > parseFloat(max.value) ? item : max
    , validData[0]);
  
    const minRecord = validData.reduce((min, item) => 
      parseFloat(item.value) < parseFloat(min.value) ? item : min
    , validData[0]);
  
    setExtremeValues({
      max: { value: maxRecord.value, record: maxRecord },
      min: { value: minRecord.value, record: minRecord }
    });
    setIsExtremeDialogOpen(true);
  }

  // 添加一个全局提示状态
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    title: string;
    description: string;
  }>({
    show: false,
    title: "",
    description: ""
  });

  // 修改 setAlertInfo 的调用方式，创建一个新的函数来处理
  const showAlert = (title: string, description: string) => {
    setAlertInfo({
      show: true,
      title,
      description
    });

    // 5秒后自动关闭
    setTimeout(() => {
      setAlertInfo(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // 添加状态
  const [isChartOpen, setIsChartOpen] = useState(false)

  // 添加图表处理函数
  const handleShowChart = () => {
    if (selectedItems.length > 0) {
      setIsChartOpen(true)
    }
  }

  return (
    <div className="min-h-screen">
      {/* 全局提示 */}
      {alertInfo.show && (
        <div className="fixed top-4 right-4 z-50 w-80">
          <Alert 
            variant="destructive" 
            className="animate-in slide-in-from-top-2 border bg-red-600"
          >
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-white" />
              <div className="flex-1">
                <AlertTitle className="text-white">{alertInfo.title}</AlertTitle>
                <AlertDescription className="text-white/90">{alertInfo.description}</AlertDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 text-white hover:bg-white/20"
                onClick={() => setAlertInfo(prev => ({ ...prev, show: false }))}
              >
                ×
              </Button>
            </div>
          </Alert>
        </div>
      )}

      <Sidebar className="hidden lg:block" />
      <div className={cn("min-h-screen bg-background", "lg:pl-[240px]")}>
        <div className="flex items-center p-4 lg:hidden">
          <h1 className="ml-2 text-xl font-bold">DSA智能监测系统</h1>
        </div>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <p>加载中...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <p>暂无数据</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold">历史数据</h1>
                  <ModeToggle />
                </div>
                <FilterSection
                  dataType={dataType}
                  setDataType={setDataType}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  handleSearch={handleSearch}
                  handleClearFilters={handleClearFilters}
                  handleShowExtremes={handleShowExtremes}
                  isExtremeDialogOpen={isExtremeDialogOpen}
                  setIsExtremeDialogOpen={setIsExtremeDialogOpen}
                  selectedItems={selectedItems}
                  extremeValues={extremeValues}
                  showAlert={showAlert}
                  bedFilter={bedFilter}
                  setBedFilter={setBedFilter}
                  handleShowChart={handleShowChart}
                  isChartOpen={isChartOpen}
                  setIsChartOpen={setIsChartOpen}
                />

                <DataTable
                  data={data}
                  currentPageData={getCurrentPageData()} // 新增此行
                  selectedItems={selectedItems}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalPages={totalPages}
                  pageInput={pageInput}
                  newData={newData}
                  isDeleteDialogOpen={isDeleteDialogOpen}
                  handleSelect={handleSelect}
                  handleSelectAll={handleSelectAll}
                  handleDelete={handleDelete}
                  handleAdd={handleAdd}
                  setNewData={setNewData}
                  setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                  handleDeleteSelected={handleDeleteSelected}
                  handleExport={handleExport}
                  handlePageInputChange={handlePageInputChange}
                  handlePageInputKeyDown={handlePageInputKeyDown}
                  handlePageJump={handlePageJump}
                  handlePrevPage={handlePrevPage}
                  handleNextPage={handleNextPage}
                  showAlert={showAlert}
                  handleShowChart={handleShowChart} // 添加这一行
                />
              </>
            )}
          </div>
        </div>
      </div>
      {/* 图表组件 */}
      <ChartPaint
        isOpen={isChartOpen}
        onClose={() => setIsChartOpen(false)}
        data={data.filter(item => selectedItems.includes(item.id))}
      />
    </div>
  )
}
