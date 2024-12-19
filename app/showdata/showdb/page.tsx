"use client"

import { Sidebar } from "@/components/sidebar-app"
import { ModeToggle } from "@/components/theme-toggle"
import { DataFilter } from "./components/data-filter"
import { DataQuery } from "./components/data-query"
import { GenerateDataDialog } from "./components/generate-data-dialog"
import { Button } from "@/components/ui/button"
import { FileDown, Database } from "lucide-react"
import { useState } from "react"
import { DateRange } from "react-day-picker"

interface QueryParams {
  dateRange: DateRange
  vitalSign: string
  bedNumber: string
  findExtremes?: boolean // 添加最值查询标志
}

export default function ShowdbPage() {
  const [queryParams, setQueryParams] = useState<QueryParams | null>(null)
  const [shouldQuery, setShouldQuery] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [queryData, setQueryData] = useState<any[]>([]) // 添加状态存储查询到的数据

  const handleQuery = (params: QueryParams) => {
    setQueryParams(params)
    setShouldQuery(true)  // 设置查询触发标志
  }

  const handleQueryComplete = () => {
    setShouldQuery(false)  // 重置查询触发标志
  }

  const handleNormalQuery = (params: QueryParams) => {
    setQueryParams(params)
    setShouldQuery(true)  // 设置查询触发标志
  }

  // 添加一个回调函数来接收DataQuery的数据
  const handleQueryData = (data: any[]) => {
    setQueryData(data)
  }

  const handleExtremeQuery = async (params: QueryParams) => {
    try {
      if (!queryData || queryData.length === 0) {
        throw new Error('请先进行数据查询')
      }

      // 直接从现有数据中查找最大值和最小值
      const validData = queryData
        .filter(item => item && typeof item._value !== 'undefined')
        .map(item => ({
          ...item,
          _value: Number(item._value)
        }))

      if (validData.length === 0) {
        throw new Error('没有有效数据')
      }

      const maxValue = validData.reduce((max, current) => 
        (current._value > max._value) ? current : max, validData[0])
      
      const minValue = validData.reduce((min, current) => 
        (current._value < min._value) ? current : min, validData[0])

      return {
        max: { 
          value: Number(maxValue._value),
          time: maxValue._time
        },
        min: { 
          value: Number(minValue._value),
          time: minValue._time
        }
      }
    } catch (error) {
      console.error('获取极值数据失败:', error)
      return {
        max: { value: 0, time: '暂无数据' },
        min: { value: 0, time: '暂无数据' }
      }
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className="min-h-screen bg-background lg:pl-[240px]">
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">数据历史记录</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowGenerateDialog(true)}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  生成测试数据
                </Button>
                <ModeToggle />
              </div>
            </div>

            <DataFilter
              onQuery={handleNormalQuery}
              onExtremeQuery={handleExtremeQuery}
            />
            
            {/* 添加分隔和间距 */}
            <div className="my-8 border-t border-border" />
            
            <DataQuery 
              queryParams={queryParams} 
              shouldQuery={shouldQuery}
              onQueryComplete={handleQueryComplete}
              onData={handleQueryData} // 添加数据回调
            />
            <GenerateDataDialog
              open={showGenerateDialog}
              onOpenChange={setShowGenerateDialog}
              vitalSigns={[]}
              bedNumbers={[]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
