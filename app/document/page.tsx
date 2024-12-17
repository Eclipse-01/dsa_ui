'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { FileText } from "lucide-react"
import DeploymentArticle from './article/deployment'
import InfluxDBArticle from './article/influxdb'
import DatabaseArticle from './article/database'
import UsageArticle from './article/usage'

export default function DocumentPage() {
  return (
    <div className="min-h-screen">
      <Sidebar className="hidden lg:block" />
      <div className="lg:pl-[240px] min-h-screen bg-background">
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">项目文档</h1>
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="usage" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="usage">使用说明</TabsTrigger>
                    <TabsTrigger value="deployment">部署前端</TabsTrigger>
                    <TabsTrigger value="database">数据库设计</TabsTrigger>
                    <TabsTrigger value="influxdb">部署数据库</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="usage" className="space-y-4">
                    <UsageArticle />
                  </TabsContent>

                  <TabsContent value="deployment" className="space-y-4">
                    <DeploymentArticle />
                  </TabsContent>

                  <TabsContent value="database" className="space-y-4">
                    <DatabaseArticle />
                  </TabsContent>

                  <TabsContent value="influxdb" className="space-y-4">
                    <InfluxDBArticle />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
