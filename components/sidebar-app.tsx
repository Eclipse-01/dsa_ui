import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  User,
  ChevronUp,
  PanelsTopLeft,
} from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarFooter({ className }: { className?: string }) {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/')
  }

  return (
    <div className={cn("border-t bg-background p-3", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between"
          >
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-2">
                <AvatarImage src="https://www.flysworld.top/img/favicon.png" alt="Avatar" />
              </Avatar>
              <div className="flex flex-col items-start">
                <span>COTOMO</span>
                <span className="text-xs text-muted-foreground">管理员权限</span>
              </div>
            </div>
            <ChevronUp className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" side="top">
          <DropdownMenuLabel>我的账户</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="flex items-center w-full">
              <User className="mr-2 h-4 w-4" />
              <span>个人资料</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex items-center w-full">
              <PanelsTopLeft className="mr-2 h-4 w-4" />
              <span>访问网站</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
            <div className="flex items-center w-full">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-3 h-screen relative flex flex-col", className)}>
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">医疗智能分析系统</h2>
            <div className="space-y-1">
              <Link href="/dashboard">
                <Button
                  variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  医疗监控面板
                </Button>
              </Link>
              <Link href="/history">
                <Button
                  variant={pathname === "/history" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <History className="mr-2 h-4 w-4" />
                  诊断历史记录
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant={pathname === "/settings" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  系统设置
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SidebarFooter />
    </div>
  )
}
