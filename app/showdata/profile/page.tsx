"use client"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className={cn(
        "min-h-screen bg-background",
        "lg:pl-[240px]"
      )}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">个人资料</h1>
              <ModeToggle />
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="https://www.flysworld.top/img/favicon.png" alt="Avatar" />
                    </Avatar>
                    <h2 className="text-2xl font-semibold">方乐阳</h2>
                    <p className="text-sm text-muted-foreground">管理员</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-lg font-semibold">
                  基本信息
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">用户名</p>
                      <p className="text-sm text-muted-foreground">方乐阳</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">邮箱</p>
                      <p className="text-sm text-muted-foreground">1034230231@stu.jiangnan.edu.cn</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">电话</p>
                      <p className="text-sm text-muted-foreground">18651568560</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">角色</p>
                      <p className="text-sm text-muted-foreground">管理员</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-lg font-semibold">
                  开发团队介绍
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-md font-medium">指导教师</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        张善新 - 江南大学物联网工程学院副教授，主要研究方向为模式识别与人工智能、云原生数字技术。
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-md font-medium">开发团队</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">方乐阳（组长）</p>
                          <p className="text-sm text-muted-foreground">
                            负责项目整体架构设计和前端开发，专注于用户界面和交互体验优化。
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">王宇斌</p>
                          <p className="text-sm text-muted-foreground">
                            负责后端开发和数据库设计，专注于系统性能优化和数据安全。
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">白峻臣</p>
                          <p className="text-sm text-muted-foreground">
                            负责算法研究和模型优化，专注于医疗数据分析和预测模型开发。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-md font-medium">团队介绍</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        我们是一个有爱的团队，在本项目的开发过程中，我们相互协作、共同进步，度过了许多难忘的时光。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}