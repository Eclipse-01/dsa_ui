import { Dialog, DialogContent } from "./dialog"
import { Loader2 } from "lucide-react"

interface PlzWaitProps {
  message?: string
}

export function PlzWait({ message = "请稍候..." }: PlzWaitProps) {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex items-center justify-center gap-4 py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
