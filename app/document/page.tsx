'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { Sidebar } from "@/components/sidebar-app"
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
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">项目文档</h1>
              <ModeToggle />
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
