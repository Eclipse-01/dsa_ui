"use client"

import { useState } from "react"
import { FilterSection } from "./components/FilterSection"
import { fetchVitalData } from "./components/LittleThings/influxService"
import { DataTable } from "./components/DataTable"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GenerateDataDialog } from "./components/GenerateDataDialog"

export default function ShowDBPage() {
  const [dataType, setDataType] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [data, setData] = useState<any[]>([])

  const handleFilter = async (filters: {
    vitalSign: string;
    bedNumber: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    try {
      console.log('开始筛选，参数:', filters);
      if (!filters.startDate || !filters.endDate) {
        throw new Error("日期范围不完整");
      }

      const result = await fetchVitalData(
        filters.vitalSign,
        filters.bedNumber,
        filters.startDate,
        filters.endDate
      );

      console.log('筛选结果:', result);
      setData(result.data);
    } catch (error) {
      console.error("数据获取失败:", error);
      // 显示错误消息给用户
      // ...
    }
  };

  const handleGeneratedData = (generatedData: any[]) => {
    setData(generatedData);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">数据库查询</h2>
        <GenerateDataDialog onDataGenerated={handleGeneratedData} />
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>筛选条件</CardTitle>
            <CardDescription>
              选择需要查询的生理指标、床位和时间范围
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FilterSection
              dataType={dataType}
              setDataType={setDataType}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              onFilter={handleFilter}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>查询结果</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <DataTable data={data} />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                暂无数据，请选择筛选条件进行查询
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
