"use client"
import React, { useState, useEffect } from 'react';
import { FilterSection } from './FilterSection';
import { DataTable } from './DataTable';
import { useAlert } from '@/hooks/useAlert';
import { VitalData } from "@/app/data/vitalData"

// 删除本地的 VitalData 接口定义

export default function ShowDBPage() {
  const [filters, setFilters] = useState({});
  const [data, setData] = useState<VitalData[]>([]); // 修改此行
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // 修改此行
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const [newData, setNewData] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dataType, setDataType] = useState('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [bedFilter, setBedFilter] = useState('all');
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isExtremeDialogOpen, setIsExtremeDialogOpen] = useState(false);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showAlert } = useAlert(); // 使用 hook

  useEffect(() => {
    fetchData(); // 组件加载时获取数据
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/influxdb/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataType,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          bedFilter,
          page: currentPage,
          pageSize: itemsPerPage
        })
      });

      if (!response.ok) {
        throw new Error('获取数据失败');
      }

      const { data, total, totalPages: pages } = await response.json();
      setData(data);
      setTotalPages(pages);

      // 如果当前页码超出范围，重置为第一页
      if (currentPage > pages) {
        setCurrentPage(1);
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      setError(message);
      showAlert('错误', `获取数据失败: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // 重置页码
    fetchData();
  };

  const handleClearFilters = () => {
    setDataType('all');
    setBedFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setFilters({});
    setCurrentPage(1);
    fetchData();
  };

  const currentPageData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleShowChart = () => {
    setIsChartOpen(true);
  };

  const handleShowExtremes = () => {
    setIsExtremeDialogOpen(true);
  };

  // 其他处理函数
  const handleSelect = (id: string) => { // 修改参数类型
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedItems(e.target.checked ? data.map(item => item.id) : []);
  };

  const handleAdd = async () => {
    // 添加数据的逻辑
  };

  const handleDelete = async (id: string) => { // 修改参数类型
    // 删除数据的逻辑
  };

  const handleDeleteSelected = async () => {
    // 批量删除的逻辑
  };

  const handleExport = () => {
    // 导出数据的逻辑
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageJump();
    }
  };

  const handlePageJump = () => {
    const pageNumber = parseInt(pageInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // 计算极值
  const extremeValues = React.useMemo(() => {
    const selectedData = data.filter(item => selectedItems.includes(item.id));
    if (selectedData.length === 0) {
      return {
        max: { value: '', record: null },
        min: { value: '', record: null }
      };
    }

    return {
      max: {
        value: Math.max(...selectedData.map(item => parseFloat(item.value))).toString(),
        record: selectedData.find(item => 
          parseFloat(item.value) === Math.max(...selectedData.map(item => parseFloat(item.value)))
        )
      },
      min: {
        value: Math.min(...selectedData.map(item => parseFloat(item.value))).toString(),
        record: selectedData.find(item => 
          parseFloat(item.value) === Math.min(...selectedData.map(item => parseFloat(item.value)))
        )
      }
    };
  }, [data, selectedItems]);

  return (
    <div>
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
        loading={loading}
      />
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      <DataTable
        data={data}
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
        currentPageData={currentPageData}
        handleShowChart={handleShowChart}
        fetchData={fetchData}
        loading={loading}
      />
    </div>
  );
}
