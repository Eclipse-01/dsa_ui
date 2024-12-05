"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { InfluxDBService } from "@/src/services/influxdb"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DatabaseConfig() {
  const [dbConfig, setDbConfig] = useState({
    url: '',
    token: '',
    org: '',
    bucket: ''
  });
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null,
    message: string
  }>({ type: null, message: '' });

  useEffect(() => {
    const savedConfig = localStorage.getItem('influxdb_config');
    if (savedConfig) {
      setDbConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSaveConfig = async () => {
    const defaultConfig = {
      url: 'http://localhost:8086',
      token: '',
      org: '',
      bucket: ''
    };

    const finalConfig = {
      url: dbConfig.url || defaultConfig.url,
      token: dbConfig.token || defaultConfig.token,
      org: dbConfig.org || defaultConfig.org,
      bucket: dbConfig.bucket || defaultConfig.bucket
    };

    try {
      const response = await fetch(`${finalConfig.url}/api/v2/delete/-1`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${finalConfig.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setSaveStatus({ 
          type: 'error', 
          message: `未授权访问 (HTTP 401): 请检查Token是否正确` 
        });
        return;
      }

      await response.json();
      localStorage.setItem('influxdb_config', JSON.stringify(finalConfig));
      setSaveStatus({ 
        type: 'success', 
        message: `配置已保存，连接验证成功` 
      });

    } catch (error) {
      setSaveStatus({ 
        type: 'error', 
        message: '连接失败，请检查服务器地址是否正确 (HTTP 连接错误)' 
      });
    }
  };

  const handlePing = async () => {
    const influxDB = new InfluxDBService(
      dbConfig.url,
      dbConfig.token,
      dbConfig.org,
      dbConfig.bucket
    );

    const result = await influxDB.handlePing();
    setSaveStatus(result as { type: 'success' | 'error' | null, message: string });
  };

  return (
    <Card>
      <CardHeader className="text-lg font-semibold">
        数据库配置
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dbUrl">数据库地址 (含端口)</Label>
            <Input
              id="dbUrl"
              placeholder="http://localhost:8086"
              value={dbConfig.url}
              onChange={(e) => setDbConfig(prev => ({...prev, url: e.target.value}))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dbToken">Token</Label>
            <Input
              id="dbToken"
              type="password"
              value={dbConfig.token}
              onChange={(e) => setDbConfig(prev => ({...prev, token: e.target.value}))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dbOrg">组织</Label>
            <Input
              id="dbOrg"
              value={dbConfig.org}
              onChange={(e) => setDbConfig(prev => ({...prev, org: e.target.value}))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dbBucket">Bucket</Label>
            <Input
              id="dbBucket"
              value={dbConfig.bucket}
              onChange={(e) => setDbConfig(prev => ({...prev, bucket: e.target.value}))}
            />
          </div>
          <Button onClick={handleSaveConfig}>
            保存并测试连接
          </Button>
          <Button onClick={handlePing}>
            Ping
          </Button>
        </div>
        
        {saveStatus.type && (
          <Alert variant={saveStatus.type === 'success' ? 'default' : 'destructive'}>
            <AlertDescription>
              {saveStatus.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
