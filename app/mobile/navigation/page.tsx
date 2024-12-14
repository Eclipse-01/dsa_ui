"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ModeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Podcast,
  PanelsTopLeft,
  UserCircle2,
} from "lucide-react"

export default function MobileNavigation() {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/')
  }

  const mainNavItems = [
    {
      title: "数据监控面板",
      icon: <LayoutDashboard className="w-6 h-6" />,
      path: "/showdata/dashboard",
      description: "实时监控数据分析"
    },
    {
      title: "数据历史记录",
      icon: <History className="w-6 h-6" />,
      path: "/showdata/showdb",
      description: "查看历史数据统计"
    },
    {
      title: "传感器",
      icon: <Podcast className="w-6 h-6" />,
      path: "/showdata/sensors",
      description: "连接和管理传感器"
    },
    {
      title: "系统设置",
      icon: <Settings className="w-6 h-6" />,
      path: "/functions/settings",
      description: "管理系统配置项"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          医疗智能数据系统
        </h1>
        <ModeToggle />
      </div>

      {/* 修改后的用户信息卡片 */}
      <Card className="p-6 shadow-lg bg-card/50 backdrop-blur-sm">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src="https://www.flysworld.top/img/favicon.png" alt="Avatar" />
              </Avatar>
              <div className="space-y-1 text-left">
                <h2 className="text-xl font-semibold">COTOMO</h2>
                <p className="text-sm text-muted-foreground bg-primary/10 inline-block px-2 py-0.5 rounded-full">
                  管理员权限
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[calc(100vw-2rem)] backdrop-blur-lg bg-popover/90">
            <DropdownMenuLabel className="font-semibold">我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/showdata/profile')} className="gap-2">
              <UserCircle2 className="h-4 w-4" />
              <span>个人资料</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/functions/settings')} className="gap-2">
              <Settings className="h-4 w-4" />
              <span>账户设置</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="https://www.flysworld.top" target="_blank" rel="noopener noreferrer" className="cursor-pointer gap-2">
                <PanelsTopLeft className="h-4 w-4" />
                <span>访问作者网站</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-red-600 dark:text-red-400 gap-2 focus:text-red-600 dark:focus:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      {/* 主要导航选项 */}
      <div className="grid gap-4">
        {mainNavItems.map((item) => (
          <Button
            key={item.path}
            variant="outline"
            className="w-full h-20 justify-start text-left group"
            onClick={() => router.push(item.path)}
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-primary/10">
                {item.icon}
              </div>
              <div>
                <div className="text-lg font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
