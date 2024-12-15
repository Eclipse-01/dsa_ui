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

interface VitalData {
  _time: string;
  _value: number;
  unit: string;
  bed: string;
  type: string;
}

interface DataTableProps {
  data: VitalData[];
}

export function DataTable({ data }: DataTableProps) {
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<VitalData[]>([])
  const [showChart, setShowChart] = React.useState(false)
  const [jumpPage, setJumpPage] = React.useState("")
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const paginatedData = data.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  const toggleSelectAll = (checked: boolean) => {
    setSelected(checked ? paginatedData : [])
  }

  const toggleSelect = (item: VitalData) => {
    setSelected(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const handleExportSelected = () => {
    if (selected.length === 0) return
    exportToCSV(selected, '生理指标数据')
  }

  const handleDeleteSelected = () => {
    // 实现删除选中数据的逻辑
    alert("删除功能待实现")
  }

  const getPageNumbers = (total: number, current: number) => {
    const delta = 2; // 当前页前后显示的页数
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 || // 首页
        i === total || // 末页
        (i >= current - delta && i <= current + delta) // 当前页附近
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNum = parseInt(jumpPage)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum)
      setJumpPage("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
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

      {showChart && selected.length > 0 && (
        <VitalSignsChart 
          data={selected} 
          type={selected[0].type}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selected.length === paginatedData.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[180px]">时间</TableHead>
              <TableHead>数值</TableHead>
              <TableHead>单位</TableHead>
              <TableHead>床位</TableHead>
              <TableHead>指标类型</TableHead>
              <TableHead className="w-[40px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, index) => (
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
                <TableCell>{item._value}</TableCell>
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
                      <DropdownMenuItem onClick={() => alert("编辑功能待实现")}>
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert("删除功能待实现")}>
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="h-9 w-9"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">首页</span>
                </Button>
              </PaginationItem>

              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(p => Math.max(1, p - 1))
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                >
                  上一页
                </PaginationPrevious>
              </PaginationItem>
              
              {getPageNumbers(totalPages, page).map((pageNum, idx) => (
                <PaginationItem key={idx}>
                  {pageNum === '...' ? (
                    <span className="px-4 py-2 text-muted-foreground">...</span>
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(Number(pageNum))
                      }}
                      isActive={page === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(p => Math.min(totalPages, p + 1))
                  }}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                >
                  下一页
                </PaginationNext>
              </PaginationItem>

              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="h-9 w-9"
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">末页</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <form 
            onSubmit={handleJump}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                className="w-16 h-9"
                placeholder="页码"
              />
              <span className="text-sm text-muted-foreground">
                / {totalPages}
              </span>
            </div>
            <Button 
              type="submit"
              variant="outline"
              size="sm"
              className="h-9"
              disabled={!jumpPage || isNaN(parseInt(jumpPage)) || 
                parseInt(jumpPage) < 1 || parseInt(jumpPage) > totalPages}
            >
              跳转
            </Button>
          </form>
        </div>
      )}

      <div className="text-sm text-muted-foreground text-right">
        总计 {data.length} 条记录
      </div>
    </div>
  )
}
