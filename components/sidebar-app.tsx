import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  PanelsTopLeft,
  UserCircle2,
  FileText,
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

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // 这里可以添加清除token等登出逻辑
    router.push('/')
  }

  const handleDashboard = () => {
    router.push('/showdata/dashboard')
  }

  return (
    <div className={cn(
      "fixed top-0 left-0 h-screen border-r w-[240px]",
      "transition-all duration-300 ease-in-out z-40 bg-background",
      className
    )}>
      <div className="h-[calc(100%-70px)] overflow-y-auto">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">医疗智能数据系统</h2>
            <div className="space-y-1">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={handleDashboard}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>数据监控面板</span>
              </Button>
              <Link href="/showdata/showdb">
                <Button
                  variant={pathname === "/showdata/showdb" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <History className="mr-2 h-4 w-4" />
                  <span>数据历史记录</span>
                </Button>
              </Link>
              <Link href="/functions/settings">
                <Button
                  variant={pathname === "/functions/settings" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>系统设置</span>
                </Button>
              </Link>
              <Link href="/document">
                <Button
                  variant={pathname === "/document" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>文档</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 border-t bg-background">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="https://www.flysworld.top/img/favicon.png" alt="Avatar" />
              </Avatar>
              <div className="flex flex-col items-start">
                <span>COTOMO</span>
                <span className="text-xs text-muted-foreground">管理员权限</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" alignOffset={-10}>
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/showdata/profile')}>
              <UserCircle2 className="mr-2 h-4 w-4" />
              <span>个人资料</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/functions/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>账户设置</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="https://www.flysworld.top" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                <PanelsTopLeft className="mr-2 h-4 w-4" />
                <span>访问作者网站</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-100">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
