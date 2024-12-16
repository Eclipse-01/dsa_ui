"use client"

import { Sidebar } from "@/components/sidebar-app"
import { DataFilter } from "./components/data-filter"
import { DataQuery } from "./components/data-query"
import { GenerateDataDialog } from "./components/generate-data-dialog"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useState } from "react"
import { DateRange } from "react-day-picker"
// 删除 AddItemDialog 和 VitalData 的导入

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
  // 删除 open state

  const handleQuery = (params: QueryParams) => {
    setQueryParams(params)
    setShouldQuery(true)  // 设置查询触发标志
  }

  const handleQueryComplete = () => {
    setShouldQuery(false)  // 重置查询触发标志
  }

  // 删除 handleSaveData 函数

  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className="min-h-screen bg-background lg:pl-[240px]">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">数据历史记录</h1>
              <Button
                variant="outline"
                onClick={() => setShowGenerateDialog(true)}
              >
                <FileDown className="mr-2 h-4 w-4" />
                生成测试数据
              </Button>
            </div>
            <DataFilter onQuery={handleQuery} />
            
            {/* 添加分隔和间距 */}
            <div className="my-8 border-t border-border" />
            
            <DataQuery 
              queryParams={queryParams} 
              shouldQuery={shouldQuery}
              onQueryComplete={handleQueryComplete}
            />
            <GenerateDataDialog
              open={showGenerateDialog}
              onOpenChange={setShowGenerateDialog}
              vitalSigns={[]}  // 修改这里
              bedNumbers={[]}  // 修改这里
            />
            {/* 删除 Button 和 AddItemDialog 组件 */}
          </div>
        </div>
      </div>
    </div>
  )
}
