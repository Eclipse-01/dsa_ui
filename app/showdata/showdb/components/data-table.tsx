"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChartLine, Download, MoreHorizontal, Trash, ChevronsLeft, ChevronsRight } from "lucide-react"
import { VitalSignsChart } from "./LittleThings/VitalSignsChart"
import { exportToCSV } from "./LittleThings/exportService"
import { Input } from "@/components/ui/input"
import "./data-table.css"
import { VitalData } from "../types"
import { EditDialog } from "./edit-dialog"
import { Badge } from "@/components/ui/badge"
import { AddItemDialog } from "./add-item"
import { PlzWait } from "@/components/ui/plz-wait"

interface DataTableProps {
  data: VitalData[];
  currentPage: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
  totalCount: number;
  pageSize: 10; // 将类型从 number 改为字面量类型 10
  fetchAllData: () => Promise<VitalData[]>;
  onEdit: (data: VitalData) => Promise<void>;
  onDelete: (data: VitalData) => Promise<void>;
  onDeleteMultiple: (data: VitalData[]) => Promise<void>;
  onAdd?: (data: VitalData) => Promise<void>;  // 将 onAdd 改为可选属性
}

export function DataTable({ 
  data, 
  currentPage, 
  onPageChange, 
  hasMore, 
  totalCount, 
  pageSize, // 这个值现在只能是 10
  fetchAllData,
  onEdit,
  onDelete,
  onDeleteMultiple,
  onAdd
}: DataTableProps) {
  const [selected, setSelected] = React.useState<VitalData[]>([])
  const [isSelectingAll, setIsSelectingAll] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showChart, setShowChart] = React.useState(false)
  const [jumpPage, setJumpPage] = React.useState("")
  const [editingData, setEditingData] = React.useState<VitalData | null>(null)
  const [showAddDialog, setShowAddDialog] = React.useState(false)

  const displayData = React.useMemo(() => {
    // 如果数据少于10条，直接显示所有数据
    if (data.length <= 10) return data;
    // 否则精确截取10条数据
    return data.slice(0, 10);
  }, [data]);

  const totalPages = Math.ceil(totalCount / 10) // 直接使用 10
  const start = ((currentPage - 1) * 10) + 1
  const end = Math.min(start + (displayData.length - 1), totalCount) // 确保不超过总数

  const toggleSelectAll = async (checked: boolean) => {
    if (checked) {
      try {
        setIsLoading(true)
        const allData = await fetchAllData()
        if (allData.length > 100000) {
          // 显示加载提示
          setIsLoading(true)
        }
        setSelected(allData)
        setIsSelectingAll(true)
      } finally {
        setIsLoading(false)
      }
    } else {
      setSelected([])
      setIsSelectingAll(false)
    }
  }

  // 新增函数：检查某个项目是否被选中
  const isItemSelected = (item: VitalData) => {
    return selected.some(i => 
      i._time === item._time && 
      i.type === item.type && 
      i.bed === item.bed
    )
  }

  const toggleSelect = (item: VitalData) => {
    if (isSelectingAll) {
      setSelected(prev => prev.filter(i => 
        i._time !== item._time || 
        i.type !== item.type || 
        i.bed !== item.bed
      ))
      setIsSelectingAll(false)
    } else {
      setSelected(prev => 
        prev.some(i => 
          i._time === item._time && 
          i.type === item.type && 
          i.bed !== item.bed
        )
          ? prev.filter(i => 
              i._time !== item._time || 
              i.type !== item.type || 
              i.bed !== item.bed
            )
          : [...prev, item]
      )
    }
  }

  const handleExportSelected = () => {
    if (selected.length === 0) return
    exportToCSV(selected, '生理指标数据')
  }

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return
    if (!confirm(`确定要删除选中的 ${selected.length} 条数据吗？`)) return

    try {
      await onDeleteMultiple(selected)
      setSelected([])
      setIsSelectingAll(false)
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault()
    // 将输入值转换为数字，使用parseInt而不是Number
    const pageNum = parseInt(jumpPage, 10)
    
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      // 直接调用onPageChange，不需要任何额外的计算
      onPageChange(pageNum)
      setJumpPage("")
      // 可以添加一个console.log来调试
      console.log('跳转到页码:', pageNum)
    } else {
      alert(`请输入1到${totalPages}之间的有效页码`)
    }
  }

  const formatValue = (row: VitalData) => {
    if (row.type === "血压") {
      return row._value?.toFixed(1) || '0.0'
    }
    return row._value?.toFixed(1) || '0.0'
  }

  const handleEdit = async (data: VitalData) => {
    try {
      await onEdit(data)
      setEditingData(null)
    } catch (error) {
      console.error('编辑失败:', error)
    }
  }

  const handleDelete = async (item: VitalData) => {
    if (!confirm('确定要删除这条数据吗？')) return
    try {
      await onDelete(item)
      setSelected(prev => prev.filter(i => 
        i._time !== item._time || 
        i.type !== item.type || 
        i.bed !== item.bed
      ))
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  // 简化分页处理函数
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      console.log('Changing to page:', newPage); // 用于调试
      onPageChange(newPage);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading && <PlzWait message="正在加载数据，请稍候..." />}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSelectAll(!isSelectingAll)}
              className="min-w-[100px]"
            >
              {isSelectingAll ? '取消全选' : '全选所有页'}
              {isSelectingAll && selected.length > 0 && ` (${selected.length})`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSelected}
              disabled={selected.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              导出所选 {selected.length > 0 && `(${selected.length})`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChart(!showChart)}
              disabled={selected.length === 0}
            >
              <ChartLine className="mr-2 h-4 w-4" />
              {showChart ? '隐藏图表' : '显示图表'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={selected.length === 0}
            >
              <Trash className="mr-2 h-4 w-4" />
              删除所选 {selected.length > 0 && `(${selected.length})`}
            </Button>
          </div>
          {onAdd && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowAddDialog(true)}
            >
              添加数据
            </Button>
          )}
        </div>

        {selected.length > 0 && (
          <VitalSignsChart 
            data={selected} 
            type={selected[0].type}
            open={showChart}
            onClose={() => setShowChart(false)}
          />
        )}

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[180px]">时间</TableHead>
                <TableHead>数值</TableHead>
                <TableHead>单位</TableHead>
                <TableHead>床位</TableHead>
                <TableHead>指标类型</TableHead>
                <TableHead className="w-[60px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.length > 0 ? (
                displayData.map((item, index) => (
                  <TableRow key={item._time + index} className="h-9">
                    <TableCell className="p-0 pl-2 py-1">
                      <Checkbox
                        checked={isItemSelected(item) || isSelectingAll}
                        onCheckedChange={() => toggleSelect(item)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="compact-cell py-1.5">
                      {format(new Date(item._time), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell className="compact-cell py-1.5">
                      <div className="flex items-center gap-1">
                        <span>{item._value}</span>
                        {item.isExtreme && (
                          <Badge variant={item._value === Math.max(...data.map(d => d._value)) ? "success" : "destructive"}>
                            {item._value === Math.max(...data.map(d => d._value)) ? "最大" : "最小"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="compact-cell py-1.5">{item.unit}</TableCell>
                    <TableCell className="compact-cell py-1.5">{item.bed}</TableCell>
                    <TableCell className="compact-cell py-1.5">{item.type}</TableCell>
                    <TableCell className="p-0 py-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setEditingData(item)}>
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(item)}
                            className="text-red-600"
                          >
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页控件 */}
        {data.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                上一页
              </Button>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPage}
                  onChange={(e) => {
                    // 限制输入为正整数
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setJumpPage(value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleJump(e)
                    }
                  }}
                  className="w-20 h-8 text-center"
                  placeholder={currentPage.toString()}
                />
                <span className="text-sm text-muted-foreground">
                  / {totalPages} 页
                </span>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleJump}
                  disabled={!jumpPage || isNaN(parseInt(jumpPage, 10)) || 
                    parseInt(jumpPage, 10) < 1 || parseInt(jumpPage, 10) > totalPages}
                >
                  跳转
                </Button>
              </div>

              <Button 
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                下一页
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              第 {currentPage} 页，共 {totalPages} 页，当前展示第 {start}-{end} 条，共 {totalCount} 条
            </div>
          </div>
        )}
      </div>

      {editingData && (
        <EditDialog
          data={editingData}
          open={true}
          onClose={() => setEditingData(null)}
          onSave={handleEdit}
        />
      )}

      {showAddDialog && (
        <AddItemDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSave={onAdd}
        />
      )}
    </div>
  )
}
