"use client"

import { useEffect, useState } from "react"
import { executeFluxQuery, executeDeleteRequest, type InfluxConfig } from "@/lib/influxdb"
import { DateRange } from "react-day-picker"
import { DataTable } from "./data-table"
import { VitalData } from "../types"
import { InfluxDB, Point } from '@influxdata/influxdb-client'

// 更新 QueryParams 接口
interface QueryParams {
  dateRange: DateRange;
  vitalSign: string;
  bedNumber: string;
  findExtremes?: boolean;
}

// 修改 QueryProps 接口
interface DataQueryProps {
  queryParams: QueryParams | null;  // 使用完整的 QueryParams 接口
  shouldQuery: boolean;
  onQueryComplete: () => void;
}

interface QueryConfig {
  bucket: string;
  url: string;
  token: string;
  org: string;
}

interface QueryResult {
  _time: string;
  _value?: number;
  value?: number;
  systolic?: number;
  diastolic?: number;
  unit?: string;
  bed?: string;
  type?: string;
}

// 修复 buildFluxQuery 函数
const buildFluxQuery = (params: QueryParams, config: QueryConfig): string => {
  const { from, to } = getTimeRange(params.dateRange)
  let query = `
    from(bucket: "${config.bucket}")
      |> range(start: ${from.toISOString()}, stop: ${to.toISOString()})
      |> filter(fn: (r) => r["_measurement"] == "vital_signs")
  `
  
  if (params.bedNumber) {
    query += `|> filter(fn: (r) => r["bed"] == "${params.bedNumber}号床")`
  }
  
  if (params.vitalSign) {
    query += `|> filter(fn: (r) => r["type"] == "${params.vitalSign}")`
  }

  query += `
    |> filter(fn: (r) => r["_field"] == "value")
    |> keep(columns: ["_time", "_value", "bed", "type", "unit"])
  `

  return query
}

// 添加 getTimeRange 实现
const getTimeRange = (dateRange: DateRange | undefined) => {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (!dateRange?.from || !dateRange?.to) {
    return {
      from: yesterday,
      to: now
    }
  }
  
  return {
    from: new Date(dateRange.from),
    to: new Date(dateRange.to)
  }
}

const buildCountQuery = (config: QueryConfig, params: any, from: Date, to: Date) => {
  const { vitalSign, bedNumber } = params
  return `
    from(bucket: "${config.bucket}")
      |> range(start: ${from.toISOString()}, stop: ${to.toISOString()})
      |> filter(fn: (r) => r["_measurement"] == "vital_signs")
      |> filter(fn: (r) => r["type"] == "${vitalSign}")
      |> filter(fn: (r) => r["bed"] == "${bedNumber}号床")
      ${vitalSign === "血压" 
        ? '|> filter(fn: (r) => r["_field"] == "value")'
        : '|> filter(fn: (r) => r["_field"] == "value")'}
      |> group()
      |> count(column: "_value")
  `
}

const buildDataQuery = (config: QueryConfig, params: any, from: Date, to: Date, page: number, pageSize: number) => {
  const { vitalSign, bedNumber } = params
  return `
    from(bucket: "${config.bucket}")
      |> range(start: ${from.toISOString()}, stop: ${to.toISOString()})
      |> filter(fn: (r) => r["_measurement"] == "vital_signs")
      |> filter(fn: (r) => r["type"] == "${vitalSign}")
      |> filter(fn: (r) => r["bed"] == "${bedNumber}号床")
      |> filter(fn: (r) => r["_field"] == "value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${pageSize + 1}, offset: ${(page - 1) * pageSize})
  `
}

// 修改 convertToVitalData 函数
const convertToVitalData = (result: QueryResult): VitalData => {
  return {
    _time: result._time,
    _value: result._value || result.value || 0,
    systolic: result.systolic,
    diastolic: result.diastolic,
    unit: result.unit || '',
    bed: result.bed || '',
    type: result.type || '',
    isExtreme: false // 添加 isExtreme 属性
  }
}

// 添加类型保护函数
const isValidQueryResult = (result: any): result is { _value: number } => {
  return result && typeof result._value === 'number';
};

// 添加 fetchAllData 实现
const fetchAllData = async (config: QueryConfig, queryParams: QueryParams): Promise<VitalData[]> => {
  const { from, to } = getTimeRange(queryParams.dateRange);
  const query = `
    from(bucket: "${config.bucket}")
      |> range(start: ${from.toISOString()}, stop: ${to.toISOString()})
      |> filter(fn: (r) => r["_measurement"] == "vital_signs")
      |> filter(fn: (r) => r["type"] == "${queryParams.vitalSign}")
      |> filter(fn: (r) => r["bed"] == "${queryParams.bedNumber}号床")
      |> filter(fn: (r) => r["_field"] == "value")
      |> sort(columns: ["_time"], desc: true)
  `;

  const results = await executeFluxQuery(query, config) as QueryResult[];
  return results.map(convertToVitalData);
};

export function DataQuery({ queryParams, shouldQuery, onQueryComplete }: DataQueryProps) {
  const [data, setData] = useState<VitalData[]>([])
  const [extremeData, setExtremeData] = useState<VitalData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const PAGE_SIZE = 10

  const getDateRange = (dateRange: DateRange | undefined) => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (!dateRange?.from || !dateRange?.to) {
      return {
        from: yesterday,
        to: now
      }
    }
    
    return {
      from: new Date(dateRange.from),
      to: new Date(dateRange.to)
    }
  }

  // 添加查找极值的函数
  const findExtremeValues = (data: VitalData[]) => {
    if (data.length === 0) return []

    // 找出最大和最小值
    let maxValue = data[0]
    let minValue = data[0]

    data.forEach(item => {
      if (item._value > maxValue._value) maxValue = item
      if (item._value < minValue._value) minValue = item
    })

    return [maxValue, minValue]
  }

  // 修复 fetchData 函数
  const fetchData = async () => {
    if (!queryParams) return;
    
    try {
      setLoading(true);
      
      const configStr = localStorage.getItem('influxdb_config')
      if (!configStr) throw new Error("未找到数据库配置")
      const config = JSON.parse(configStr) as QueryConfig
      const { from, to } = getDateRange(queryParams.dateRange)
      
      // 获取总数
      const countQuery = buildCountQuery(config, queryParams, from, to)
      const countResult = await executeFluxQuery(countQuery, config)
      const total = isValidQueryResult(countResult[0]) ? countResult[0]._value : 0;
      setTotalCount(total)
      
      // 计算最大页数
      const maxPage = Math.ceil(total / 10)
      
      // 确保当前页不超过最大页数
      const validCurrentPage = Math.min(currentPage, maxPage)
      if (validCurrentPage !== currentPage) {
        setCurrentPage(validCurrentPage)
      }
      
      // 获取当前页数据
      const dataQuery = buildDataQuery(config, queryParams, from, to, validCurrentPage, 10)
      const results = await executeFluxQuery(dataQuery, config) as QueryResult[]
      
      // 处理数据
      const pageData = results.map(convertToVitalData)
      
      if (queryParams.findExtremes) {
        const extremes = findExtremeValues(pageData);
        setData(extremes.map(d => ({ ...d, isExtreme: true })));
      } else {
        setData(pageData);
      }
      
      // 更新是否有下一页
      setHasMore(validCurrentPage < maxPage)
      
    } catch (error) {
      console.error('查询失败:', error);
      setError(error instanceof Error ? error.message : '查询失败');
    } finally {
      setLoading(false);
      onQueryComplete();
    }
  };

  // 实现组件级别的 fetchAllData
  const handleFetchAllData = async () => {
    if (!queryParams) return [];
    
    const configStr = localStorage.getItem('influxdb_config')
    if (!configStr) throw new Error("未找到数据库配置")
    const config = JSON.parse(configStr) as QueryConfig
    
    return fetchAllData(config, queryParams);
  };

  // 修改 handlePageChange
  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    await fetchData();
  };

  // 修改 useEffect
  useEffect(() => {
    if (shouldQuery) {
      setCurrentPage(1);
      fetchData();
    }
  }, [queryParams, shouldQuery]);

  const handleEdit = async (editedData: VitalData) => {
    if (!queryParams) return

    const configStr = localStorage.getItem('influxdb_config')
    if (!configStr) throw new Error("未找到数据库配置")
    
    const config = JSON.parse(configStr) as InfluxConfig

    try {
      // 1. 先删除原有数据
      const timestamp = new Date(editedData._time);
      const deleteStart = new Date(timestamp.getTime() - 1);
      const deleteStop = new Date(timestamp.getTime() + 1);
      const predicate = `_measurement="vital_signs" AND type="${editedData.type}" AND bed="${editedData.bed}"`;
      
      await executeDeleteRequest(config, predicate, deleteStart.toISOString(), deleteStop.toISOString());

      // 2. 写入新数据，使用 InfluxDB API 而不是 Flux 查询
      const writeApi = new InfluxDB({url: config.url, token: config.token})
        .getWriteApi(config.org, config.bucket, 'ns')

      if (editedData.type === "血压") {
        const point = new Point('vital_signs')
          .tag('bed', editedData.bed)
          .tag('type', editedData.type)
          .tag('unit', editedData.unit)
          .floatField('systolic', editedData.systolic || editedData._value)
          .floatField('diastolic', editedData.diastolic || 0)
          .timestamp(timestamp)
        
        writeApi.writePoint(point)
      } else {
        const point = new Point('vital_signs')
          .tag('bed', editedData.bed)
          .tag('type', editedData.type)
          .tag('unit', editedData.unit)
          .floatField('value', editedData._value)
          .timestamp(timestamp)
        
        writeApi.writePoint(point)
      }

      await writeApi.flush()
      await writeApi.close()
      
      await fetchData();
    } catch (error) {
      console.error('编辑失败:', error)
      throw error
    }
  }

  const handleDelete = async (data: VitalData) => {
    if (!queryParams) return

    const configStr = localStorage.getItem('influxdb_config')
    if (!configStr) throw new Error("未找到数据库配置")
    
    const config = JSON.parse(configStr) as InfluxConfig
    
    try {
      const predicate = `_measurement="vital_signs" AND type="${data.type}" AND bed="${data.bed}"`;
      const timestamp = new Date(data._time);
      const deleteStart = new Date(timestamp.getTime() - 1);  // 1ms before
      const deleteStop = new Date(timestamp.getTime() + 1);   // 1ms after

      await executeDeleteRequest(config, predicate, deleteStart.toISOString(), deleteStop.toISOString());
      await fetchData();
    } catch (error) {
      console.error('删除失败:', error);
      throw error;
    }
  }

  const handleDeleteMultiple = async (selectedData: VitalData[]) => {
    if (!queryParams) return

    const configStr = localStorage.getItem('influxdb_config')
    if (!configStr) throw new Error("未找到数据库配置")
    
    const config = JSON.parse(configStr) as InfluxConfig
    
    try {
      for (const data of selectedData) {
        const predicate = `_measurement="vital_signs" AND type="${data.type}" AND bed="${data.bed}"`;
        const timestamp = new Date(data._time);
        const deleteStart = new Date(timestamp.getTime() - 1);
        const deleteStop = new Date(timestamp.getTime() + 1);
        
        await executeDeleteRequest(config, predicate, deleteStart.toISOString(), deleteStop.toISOString());
      }
      
      await fetchData();
    } catch (error) {
      console.error('批量删除失败:', error);
      throw error;
    }
  }

  if (loading) return <div className="text-center p-4">加载中...</div>
  if (error) return <div className="text-red-500 p-4">{error}</div>

  return (
    <DataTable 
      data={data}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      hasMore={hasMore}
      totalCount={totalCount}
      pageSize={10} // 固定为10
      fetchAllData={handleFetchAllData}  // 使用新实现的函数
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDeleteMultiple={handleDeleteMultiple}
    />
  )
}
