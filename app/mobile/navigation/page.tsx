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
  FileText,
  MessageCircle,
} from "lucide-react"
import { motion } from "framer-motion" // 需要安装 framer-motion

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
    {
      title: "文档",
      icon: <FileText className="w-6 h-6" />,
      path: "/document",
      description: "查看系统文档"
    },
    {
      title: "聊天",
      icon: <MessageCircle className="w-6 h-6" />,
      path: "/showdata/chat",
      description: "智能对话服务"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-4 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
          医疗智能数据系统
        </h1>
        <div className="backdrop-blur-sm bg-background/30 rounded-lg p-1">
          <ModeToggle />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 shadow-lg bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-colors">
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
      </motion.div>

      <div className="grid gap-4">
        {mainNavItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Button
              variant="outline"
              className="w-full h-20 justify-start text-left group relative overflow-hidden backdrop-blur-sm bg-card/50 hover:bg-card/70 transition-all duration-300 border-primary/10 hover:border-primary/20"
              onClick={() => router.push(item.path)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center space-x-4 relative z-10">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
                  {item.icon}
                </div>
                <div>
                  <div className="text-lg font-medium group-hover:text-primary transition-colors">
                    {item.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* 添加底部装饰 */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  )
}
