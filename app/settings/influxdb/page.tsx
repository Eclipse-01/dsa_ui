"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { InfluxDB } from '@influxdata/influxdb-client'
import { saveInfluxDBConfig } from '@/config/influxdb'
import { useInfluxDB } from '@/hooks/useInfluxDB'

export default function InfluxDBSettingsPage() {
  const { config, updateConfig } = useInfluxDB();
  const [settings, setSettings] = useState(config);

  useEffect(() => {
    const savedSettings = localStorage.getItem('influxdb_config')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const testConnection = async () => {
    try {
      const influxDB = new InfluxDB({
        url: settings.url,
        token: settings.token
      })

      // 使用简单查询测试连接
      const queryApi = influxDB.getQueryApi(settings.org)
      await queryApi.queryRaw('buckets()')
      
      toast.success("连接成功！")
      return true
    } catch (error) {
      toast.error("连接失败：" + (error as Error).message)
      return false
    }
  }

  const handleSave = async () => {
    if (await testConnection()) {
      updateConfig(settings);
      toast.success("设置已保存");
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>InfluxDB 设置</CardTitle>
          <CardDescription>配置 InfluxDB 连接信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">服务器地址</Label>
            <Input
              id="url"
              value={settings.url}
              onChange={(e) => setSettings(prev => ({ ...prev, url: e.target.value }))}
              placeholder="http://localhost:8086"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">API Token</Label>
            <Input
              id="token"
              value={settings.token}
              onChange={(e) => setSettings(prev => ({ ...prev, token: e.target.value }))}
              type="password"
              placeholder="your-token"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org">Organization</Label>
            <Input
              id="org"
              value={settings.org}
              onChange={(e) => setSettings(prev => ({ ...prev, org: e.target.value }))}
              placeholder="your-org"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bucket">Bucket</Label>
            <Input
              id="bucket"
              value={settings.bucket}
              onChange={(e) => setSettings(prev => ({ ...prev, bucket: e.target.value }))}
              placeholder="your-bucket"
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={testConnection}>测试连接</Button>
            <Button onClick={handleSave}>保存设置</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
