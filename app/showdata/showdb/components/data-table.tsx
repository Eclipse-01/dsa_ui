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

interface DataTableProps {
  data: VitalData[];
  currentPage: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
  totalCount: number;
  pageSize: number;
  fetchAllData: () => Promise<VitalData[]>;
  onEdit: (data: VitalData) => Promise<void>;
  onDelete: (data: VitalData) => Promise<void>;
  onDeleteMultiple: (data: VitalData[]) => Promise<void>;
}

export function DataTable({ 
  data, 
  currentPage, 
  onPageChange, 
  hasMore, 
  totalCount, 
  pageSize,
  fetchAllData,
  onEdit,
  onDelete,
  onDeleteMultiple
}: DataTableProps) {
  const [selected, setSelected] = React.useState<VitalData[]>([])
  const [isSelectingAll, setIsSelectingAll] = React.useState(false)
  const [showChart, setShowChart] = React.useState(false)
  const [jumpPage, setJumpPage] = React.useState("")
  const [editingData, setEditingData] = React.useState<VitalData | null>(null)

  const toggleSelectAll = async (checked: boolean) => {
    if (checked) {
      const allData = await fetchAllData()
      // 创建一个函数来检查两个数据项是否相同
      const isSameItem = (a: VitalData, b: VitalData) => 
        a._time === b._time && 
        a.type === b.type && 
        a.bed === b.bed;

      // 过滤掉已经在当前页面的数据
      const uniqueData = allData.filter(item => 
        !data.some(currentItem => isSameItem(item, currentItem))
      );

      // 合并当前页面的数据和其他唯一数据
      setSelected([...data, ...uniqueData]);
      setIsSelectingAll(true)
    } else {
      setSelected([])
      setIsSelectingAll(false)
    }
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
          i.bed === item.bed
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
    const pageNum = parseInt(jumpPage)
    if (!isNaN(pageNum) && pageNum >= 1) {
      onPageChange(pageNum)
      setJumpPage("")
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

  const totalPages = Math.ceil(totalCount / pageSize)
  const start = ((currentPage - 1) * pageSize) + 1
  const end = start + data.length - 1

  return (
    <div className="space-y-4">
      <div className="rounded-md border shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSelectAll(!isSelectingAll)}
          >
            {isSelectingAll ? '取消全选' : '全选'}
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

        {selected.length > 0 && (
          <VitalSignsChart 
            data={selected} 
            type={selected[0].type}
            open={showChart}
            onClose={() => setShowChart(false)}
          />
        )}

        <div className="rounded-md border data-table-container">
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
              {data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={item._time + index}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(item)}
                        onCheckedChange={() => toggleSelect(item)}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(item._time), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{item._value}</span>
                        {item.isExtreme && (
                          <Badge variant={item._value === Math.max(...data.map(d => d._value)) ? "success" : "destructive"}>
                            {item._value === Math.max(...data.map(d => d._value)) ? "最大值" : "最小值"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.bed}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
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

        {data.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                上一页
              </Button>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  className="w-24 h-9"
                  placeholder={currentPage.toString()}
                />
                <span className="text-sm text-muted-foreground">
                  / {totalPages} 页
                </span>
                <Button 
                  variant="outline"
                  onClick={handleJump}
                  disabled={!jumpPage || isNaN(parseInt(jumpPage)) || 
                    parseInt(jumpPage) < 1 || parseInt(jumpPage) > totalPages}
                >
                  跳转
                </Button>
              </div>

              <Button 
                variant="outline"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasMore}
              >
                下一页
              </Button>
            </div>
          </div>
        )}

        {data.length > 0 && (
          <div className="text-sm text-muted-foreground text-right mt-2">
            第 {currentPage} 页，共 {totalPages} 页，
            当前展示第 {start}-{end} 条，共 {totalCount} 条
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
    </div>
  )
}
