"use client"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VitalData } from "@/app/data/vitalData"

interface DataTableProps {
  data: VitalData[]
  selectedItems: number[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  pageInput: string
  newData: Partial<VitalData>
  isDeleteDialogOpen: boolean
  handleSelect: (id: number) => void
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDelete: (id: number) => void
  handleAdd: () => void
  setNewData: (data: Partial<VitalData>) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  handleDeleteSelected: () => void
  handleExport: () => void
  handlePageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handlePageJump: () => void
  handlePrevPage: () => void
  handleNextPage: () => void
  getCurrentPageData: () => VitalData[]
  showAlert: (title: string, description: string) => void
}

export function DataTable({
  data,
  selectedItems,
  currentPage,
  itemsPerPage,
  totalPages,
  pageInput,
  newData,
  isDeleteDialogOpen,
  handleSelect,
  handleSelectAll,
  handleDelete,
  handleAdd,
  setNewData,
  setIsDeleteDialogOpen,
  handleDeleteSelected,
  handleExport,
  handlePageInputChange,
  handlePageInputKeyDown,
  handlePageJump,
  handlePrevPage,
  handleNextPage,
  getCurrentPageData,
  showAlert,
}: DataTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="text-lg font-semibold">数据列表</div>
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">新增数据</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新数据</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label>数据类型</label>
                  <Select onValueChange={(v) => setNewData({...newData, type: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择数据类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="心率">心率</SelectItem>
                      <SelectItem value="血压">血压</SelectItem>
                      <SelectItem value="血氧饱和度">血氧饱和度</SelectItem>
                      <SelectItem value="体温">体温</SelectItem>
                      <SelectItem value="呼吸率">呼吸率</SelectItem>
                      <SelectItem value="血糖">血糖</SelectItem>
                      <SelectItem value="心率变异性">心率变异性</SelectItem>
                      <SelectItem value="压力水平">压力水平</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>数值</label>
                  <Input 
                    value={newData.value} 
                    onChange={(e) => setNewData({...newData, value: e.target.value})}
                  />
                </div>
                <Button onClick={handleAdd}>确定</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <Button 
              variant="outline"
              className={selectedItems.length === 0 ? "opacity-50 text-red-500" : "text-red-500"}
              onClick={() => {
                if (selectedItems.length === 0) {
                  showAlert("未选择数据", "请至少选择一条数据进行删除");
                  return;
                }
                setIsDeleteDialogOpen(true);
              }}
            >
              删除选中
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认删除</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>是否确认删除选中的 {selectedItems.length} 条数据？</p>
                <p className="text-sm text-muted-foreground mt-2">此操作不可撤销</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelected}
                >
                  确认删除
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            onClick={() => {
              if (selectedItems.length === 0) {
                showAlert("未选择数据", "请至少选择一条数据导出");
                return;
              }
              handleExport();
            }}
            className={selectedItems.length === 0 ? "opacity-50" : ""}
          >
            导出数据
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selectedItems.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>时间</TableHead>
                <TableHead>数据类型</TableHead>
                <TableHead>数值</TableHead>
                <TableHead>单位</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentPageData().map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={selectedItems.includes(row.id)}
                      onChange={() => handleSelect(row.id)}
                      aria-label="Select row" 
                    />
                  </TableCell>
                  <TableCell>{row.timestamp}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.value}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(row.id)}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 space-y-4 sm:space-y-0">
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            显示 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, data.length)} 条，共 {data.length} 条
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentPage === 1) {
                  showAlert("已是第一页", "无法前往上一页");
                  return;
                }
                handlePrevPage();
              }}
              className={currentPage === 1 ? "opacity-50" : ""}
            >
              上一页
            </Button>
            <div className="flex flex-wrap items-center gap-1 flex-1 sm:flex-none justify-center">
              <span className="text-sm whitespace-nowrap">第 {currentPage}/{totalPages} 页</span>
              <Input
                className="w-16 text-center"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputKeyDown}
                placeholder="页码"
              />
              <Button 
                variant="outline"
                onClick={handlePageJump}
                className={!pageInput ? "opacity-50" : ""}
              >
                跳转
              </Button>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentPage * itemsPerPage >= data.length) {
                  showAlert("已是最后一页", "无法前往下一页");
                  return;
                }
                handleNextPage();
              }}
              className={currentPage * itemsPerPage >= data.length ? "opacity-50" : ""}
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
