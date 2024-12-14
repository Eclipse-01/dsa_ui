"use client"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VitalData, UNITS_MAP } from "@/app/data/vitalData"
import { format } from "date-fns"

interface DataTableProps {
  data: VitalData[]
  selectedItems: string[]
  onSelect: (id: string) => void
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDelete: (id: string) => Promise<void>
  currentPage: number
  totalPages: number
  totalRecords: number // 新增：总记录数
  handleNextPage: () => void
  handlePrevPage: () => void
  pageInput: string // 添加这个属性
  handlePageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handlePageJump: () => void
  handleExport: () => void
  handleShowExtremes: () => void
  handleShowChart: () => void
  loading: boolean
  itemsPerPage: number
  showAlert: (title: string, description: string) => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  handleDeleteSelected: () => Promise<void>
  newData: Partial<VitalData>
  setNewData: (data: Partial<VitalData>) => void
  handleAdd: () => Promise<void>
  hasNextPage: boolean;
  setSelectedItems: (items: string[]) => void  // 添加这个属性
}

export function DataTable({
  data,
  selectedItems,
  onSelect,
  onSelectAll,
  handleDelete,
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0, // 设置默认值
  handleNextPage,
  handlePrevPage,
  pageInput, // 确保包含这个参数
  handlePageInputChange,
  handlePageInputKeyDown,
  handlePageJump,
  handleExport,
  handleShowExtremes,
  handleShowChart,
  loading,
  itemsPerPage = 10, // 确保 itemsPerPage 设置为 10
  showAlert,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  handleDeleteSelected,
  newData,
  setNewData,
  handleAdd,
  hasNextPage,
  setSelectedItems,  // 添加这个参数
}: DataTableProps) {
  // 添加固定的页面大小常量
  const PAGE_SIZE = 10;
  
  // 修改全选逻辑，只处理当前页面的数据
  const currentPageData = data.slice(0, PAGE_SIZE);
  const isAllSelected = currentPageData.length > 0 && 
    currentPageData.every(item => selectedItems.includes(item.id));

  // 修改全选处理函数
  const handleSelectAllLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentIds = currentPageData.map(item => item.id);
    if (e.target.checked) {
      // 合并当前页数据ID和已选择的其他页面数据ID
      const newSelected = Array.from(new Set([...selectedItems, ...currentIds]));
      setSelectedItems(newSelected);
    } else {
      // 仅移除当前页数据的ID
      const newSelected = selectedItems.filter(id => !currentIds.includes(id));
      setSelectedItems(newSelected);
    }
  };

  // 修改显示范围的计算函数
  const getDisplayRange = () => {
    if (totalRecords === 0) return "暂无数据";
    const start = ((currentPage - 1) * itemsPerPage) + 1;
    const end = Math.min(currentPage * itemsPerPage, totalRecords);
    console.log('Display range:', { start, end, total: totalRecords });
    return `显示 ${start} - ${end} 条，共 ${totalRecords} 条`;
  };

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
                  <label>时间</label>
                  <Input 
                    type="datetime-local"
                    value={newData.timestamp}
                    onChange={(e) => setNewData({...newData, timestamp: e.target.value})}
                  />
                </div>
                <div>
                  <label>床位</label>
                  <Select onValueChange={(v) => setNewData({...newData, bed: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择床位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1号床">1号床</SelectItem>
                      <SelectItem value="2号床">2号床</SelectItem>
                      <SelectItem value="3号床">3号床</SelectItem>
                      <SelectItem value="4号床">4号床</SelectItem>
                      <SelectItem value="5号床">5号床</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>数据类型</label>
                  <Select 
                    onValueChange={(v) => {
                      const unit = UNITS_MAP[v as keyof typeof UNITS_MAP] || '';
                      setNewData({...newData, type: v, unit})
                    }}
                  >
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

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className={`font-medium ${selectedItems.length === 0 ? 'opacity-50' : ''}`}
              onClick={() => {
                if (selectedItems.length === 0) {
                  showAlert("未选择数据", "请至少选择一条数据进行删除");
                  return;
                }
                setIsDeleteDialogOpen(true);
              }}
            >
              批量删除
            </Button>
            <Button
              variant="secondary"
              className={`font-medium ${selectedItems.length === 0 ? 'opacity-50' : ''}`}
              onClick={() => {
                if (selectedItems.length === 0) {
                  showAlert("未选择数据", "请至少选择一条数据进行导出");
                  return;
                }
                handleExport();
              }}
            >
              导出数据
            </Button>
            <Button 
              variant="secondary"
              className="bg-primary/10 hover:bg-primary/20 font-medium"
              onClick={() => {
                if (selectedItems.length === 0) {
                  showAlert("未选择数据", "请至少选择一条数据进行图表展示");
                  return;
                }
                handleShowChart();
              }}
            >
              图表展示
            </Button>
            {/* 删除查询按钮 */}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p>加载中...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={isAllSelected}
                        onChange={handleSelectAllLocal}  // 使用新的本地处理函数
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>床位</TableHead>
                    <TableHead>时间</TableHead>
                    <TableHead>数据类型</TableHead>
                    <TableHead>数值</TableHead>
                    <TableHead>单位</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    // 强制限制只显示前10条数据
                    currentPageData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <input 
                            type="checkbox" 
                            className="rounded" 
                            checked={selectedItems.includes(row.id)}
                            onChange={() => onSelect(row.id)}
                            aria-label="Select row" 
                          />
                        </TableCell>
                        <TableCell>{row.bed}</TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 space-y-4 sm:space-y-0">
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {loading ? (
                  "加载中..."
                ) : (
                  <>
                    {getDisplayRange()}
                    {process.env.NODE_ENV === 'development' && (
                      <span className="ml-2 text-xs opacity-50">
                        (页码: {currentPage}/{totalPages}, 每页: {itemsPerPage})
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={handlePrevPage}
                  disabled={loading || currentPage <= 1}
                  className={loading || currentPage <= 1 ? "opacity-50" : ""}
                >
                  上一页
                </Button>
                <div className="flex flex-wrap items-center gap-1 flex-1 sm:flex-none justify-center">
                  <span className="text-sm whitespace-nowrap">
                    {loading ? "加载中..." : `第 ${currentPage}/${Math.max(1, totalPages)} 页`}
                  </span>
                  <Input
                    className="w-16 text-center"
                    value={pageInput || ''}
                    onChange={handlePageInputChange}
                    onKeyDown={handlePageInputKeyDown}
                    placeholder="页码"
                    disabled={loading}
                  />
                  <Button 
                    variant="outline"
                    onClick={handlePageJump}
                    disabled={loading || !pageInput || Number(pageInput) > totalPages || Number(pageInput) < 1}
                    className={loading || !pageInput || Number(pageInput) > totalPages || Number(pageInput) < 1 ? "opacity-50" : ""}
                  >
                    跳转
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleNextPage}
                  disabled={loading || !hasNextPage}
                  className={loading || !hasNextPage ? "opacity-50" : ""}
                >
                  下一页
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
