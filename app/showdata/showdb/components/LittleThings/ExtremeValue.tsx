import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ExtremeValueProps {
  open: boolean;
  onClose: () => void;
  data: {
    max: { value: number; time: string };
    min: { value: number; time: string };
  };
  type: string;
  unit: string;
}

export function ExtremeValue({ open, onClose, data, type, unit }: ExtremeValueProps) {
  const formatDate = (dateString: string) => {
    try {
      if (dateString === '暂无数据') return dateString;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '无效日期';
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return '无效日期';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{type}极值数据</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <span className="font-medium">最大值</span>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {data.max.value} {unit}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(data.max.time)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <span className="font-medium">最小值</span>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {data.min.value} {unit}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(data.min.time)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
