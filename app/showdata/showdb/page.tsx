"use client"
import { useState, useEffect } from "react"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { cn } from "@/lib/utils"
import { VitalData, loadVitalData, addVitalData, deleteVitalData, QueryParams, UNITS_MAP } from "@/app/data/vitalData"
import { FilterSection } from "./components/FilterSection"
import { DataTable } from "./components/DataTable"
import { format } from "date-fns"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChartPaint } from "./components/ChartPaint"
import { dataCache } from '@/app/store/data-cache'

// 添加类型定义
type DataItem = VitalData & {
  id: string; // 将id改为string类型
}

export default function ShowDBPage() {
  // 确保使用相同的页面大小常量
  const PAGE_SIZE = 10;

  // 修改状态初始化，使用新的类型
  const [data, setData] = useState<DataItem[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [dataType, setDataType] = useState("all")
  const [bedFilter, setBedFilter] = useState("all")
  const [selectedItems, setSelectedItems] = useState<string[]>([]) // 改为string[]
  const [newData, setNewData] = useState<Partial<VitalData>>({
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: "",
    value: "",
    unit: "",
    bed: ""  // 添加床位字段
  })

  // 添加分页相关状态
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // 每页显示的数据条数
  const [totalPages, setTotalPages] = useState(1)  // 添加此行
  const [totalRecords, setTotalRecords] = useState(0); // 添加此行
  const [hasNextPage, setHasNextPage] = useState(false);

  // 修改 getCurrentPageData 方法，确保返回正确的数据数量
  const getCurrentPageData = () => {
    if (!data || !Array.isArray(data)) {
      console.error('数据无效');
      return [];
    }
    return data; // 直接返回当前页数据，因为后端已经处理了分页
  }

  // 删除错误的 getPageData 函数，添加正确的 handleNextPage 函数
  // 修改分页处理函数
  const handleNextPage = () => {
    if (hasNextPage && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1 && !isLoading) {
      setCurrentPage(prev => prev - 1);
    }
  }
  
  // 添加数据加载效果
  const [isLoading, setIsLoading] = useState(true)

  // 修改数据加载逻辑
  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading page:', currentPage); // 调试日志

      const params: QueryParams = {
        page: currentPage,
        pageSize: PAGE_SIZE,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        dataType: dataType === 'all' ? undefined : dataType,
        bedFilter: bedFilter === 'all' ? undefined : bedFilter
      };
      
      const response = await loadVitalData(params);
      
      if (response && Array.isArray(response.data)) {
        // 确保数据长度不超过页面大小
        const limitedData = response.data.slice(0, PAGE_SIZE);
        setData(limitedData);
        setTotalRecords(response.total);
        setTotalPages(Math.ceil(response.total / PAGE_SIZE));
        setHasNextPage(response.hasNextPage);
        
        // 如果当前页无数据且不是第一页，自动回到上一页
        if (limitedData.length === 0 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      } else {
        console.error('Invalid response format:', response);
        setData([]);
        setTotalRecords(0);
        setTotalPages(1);
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      showAlert("错误", "加载数据失败，请重试");
      setData([]);
      setTotalRecords(0);
      setTotalPages(1);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (mounted) {
        await loadData();
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [currentPage, startDate, endDate, dataType, bedFilter]);

  // 修改查询数据逻辑
  const handleSearch = async () => {
    try {
      setCurrentPage(1); // 重置到第一页
      setIsLoading(true);
      const params: QueryParams = {
        page: 1,
        pageSize: itemsPerPage,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        dataType: dataType === 'all' ? undefined : dataType,
        bedFilter: bedFilter === 'all' ? undefined : bedFilter
      };
      
      const response = await loadVitalData(params);
      if (response) {
        const { data: loadedData, total } = response;
        setData(loadedData as DataItem[]);
        setTotalRecords(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
      }
    } catch (error) {
      console.error('查询数据失败:', error);
      showAlert("错误", error instanceof Error ? error.message : "查询数据失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 添加清除缓存功能
  const clearCache = () => {
    dataCache.clear();
    showAlert("提示", "数据缓存已清除");
  };

  // 修改清除筛选器函数
  const handleClearFilters = async () => {
    clearCache(); // 清除缓存
    setStartDate(undefined);
    setEndDate(undefined);
    setDataType("all");
    setBedFilter("all");
    setCurrentPage(1);
    
    const params: QueryParams = {
      page: 1,
      pageSize: itemsPerPage
    };
    
    try {
      const response = await loadVitalData(params);
      setData(response.data as DataItem[]);
      setTotalRecords(response.total);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
    } catch (error) {
      console.error('清除筛选器失败:', error);
      showAlert("错误", "重置数据失败");
    }
  };

  // 新增数据
  const handleAdd = async () => {
    if (!newData.type || !newData.value || !newData.bed || !newData.timestamp) {
      showAlert("错误", "请填写完整信息");
      return;
    }

    try {
      const dataToAdd = {
        ...newData,
        unit: UNITS_MAP[newData.type as keyof typeof UNITS_MAP] || '',
        timestamp: new Date(newData.timestamp).toISOString()
      };

      const success = await addVitalData(dataToAdd);
      if (success) {
        showAlert("成功", "数据添加成功");
        
        // 重置表单
        setNewData({
          timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          type: "",
          value: "",
          unit: "",
          bed: ""
        });
        
        // 重新加载数据
        await handleSearch();
      } else {
        showAlert("错误", "添加数据失败");
      }
    } catch (error) {
      console.error('添加数据失败:', error);
      showAlert("错误", "添加数据失败");
    }
  };

  // 删除单条数据
  const handleDelete = async (id: string) => {
    try {
      const success = await deleteVitalData([id]);
      if (success) {
        setData(data.filter(item => item.id !== id));
        setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        showAlert("成功", "数据删除成功");
      } else {
        showAlert("错误", "删除数据失败");
      }
    } catch (error) {
      console.error('删除数据失败:', error);
      showAlert("错误", "删除数据失败");
    }
  };

  // 添加确认对话框状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // 修改删除选中数据的函数
  const handleDeleteSelected = async () => {
    try {
      const success = await deleteVitalData(selectedItems);
      if (success) {
        setData(data.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        setIsDeleteDialogOpen(false);
        showAlert("成功", "批量删除成功");
      } else {
        showAlert("错误", "批量删除失败");
      }
    } catch (error) {
      console.error('批量删除失败:', error);
      showAlert("错误", "批量删除失败");
    }
  };

  // 修改导出数据函数
  const handleExport = () => {
    if (selectedItems.length === 0) {
      showAlert("未选择数据", "请至少选择一条数据进行导出");
      return;
    }

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
  const handleSelect = (id: string) => {
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
  
  // 处理页码跳转
  const handlePageJump = () => {
    const pageNumber = parseInt(pageInput);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setPageInput(""); // 清空输入
    } else {
      showAlert("页码无效", `请输入1-${totalPages}之间的页码`);
    }
  };

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

  // 添加数据获取函数用于ChartPaint组件
  const fetchData = async () => {
    return data.filter(item => selectedItems.includes(item.id))
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
              fetchData={fetchData}
              loading={isLoading}
            />

            <DataTable
              data={getCurrentPageData()}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}  // 添加这行
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              handleDelete={handleDelete}
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords} // 添加此行
              handleNextPage={handleNextPage}
              handlePrevPage={handlePrevPage}
              pageInput={pageInput}
              handlePageInputChange={handlePageInputChange}
              handlePageInputKeyDown={handlePageInputKeyDown}
              handlePageJump={handlePageJump}
              handleExport={handleExport}
              handleShowExtremes={handleShowExtremes}
              handleShowChart={handleShowChart}
              loading={isLoading}
              itemsPerPage={itemsPerPage}
              showAlert={showAlert}
              isDeleteDialogOpen={isDeleteDialogOpen}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
              handleDeleteSelected={handleDeleteSelected}
              newData={newData}
              setNewData={setNewData}
              handleAdd={handleAdd}
              hasNextPage={hasNextPage}
            />

            {isChartOpen && (
              <ChartPaint
                isOpen={isChartOpen}
                onClose={() => setIsChartOpen(false)}
                data={data.filter(item => selectedItems.includes(item.id))}
                fetchData={fetchData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
