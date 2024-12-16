"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VitalData } from "../types"
import { getStoredConfig } from "@/lib/influxdb"

interface AddItemDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: VitalData) => Promise<void>
}

const VITAL_RANGES = {
  "心率": { min: 60, max: 100, unit: "BPM" },
  "血氧饱和度": { min: 95, max: 100, unit: "%" },
  "血压": { min: 90, max: 140, unit: "mmHg" },
  "体温": { min: 36, max: 37.5, unit: "°C" },
  "呼吸率": { min: 12, max: 20, unit: "次/分" },
  "血糖": { min: 3.9, max: 6.1, unit: "mmol/L" },
  "心率变异性": { min: 20, max: 100, unit: "ms" },
  "压力水平": { min: 1, max: 5, unit: "/5" }
}

export function AddItemDialog({ open, onClose, onSave }: AddItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    value: "",
    type: "",
    bed: "",
    timestamp: new Date().toISOString().slice(0, 16) // 添加时间戳字段，格式：YYYY-MM-DDTHH:mm
  })

  // 使用 useMemo 缓存床位选项
  const bedOptions = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      value: String(i + 1),
      label: `${i + 1}号床`
    })), []
  )

  // 使用 useCallback 优化表单更新处理器
  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // 使用 useCallback 优化表单提交
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type || !formData.value || !formData.bed || !formData.timestamp) {
      alert('请填写完整信息')
      return
    }

    setLoading(true)

    try {
      // 从 localStorage 读取配置
      const configStr = localStorage.getItem('influxdb_config')
      if (!configStr) {
        throw new Error('未找到 InfluxDB 配置')
      }
      const config = JSON.parse(configStr)

      // 构造 Line Protocol 格式数据
      const timestamp = new Date(formData.timestamp).getTime() * 1000000 // 转换为纳秒
      const measurement = 'vital_signs'
      const tags = `bed=${formData.bed}号床,type=${formData.type},unit=${VITAL_RANGES[formData.type as keyof typeof VITAL_RANGES].unit}`
      const fields = `value=${parseFloat(formData.value)}`
      const lineProtocol = `${measurement},${tags} ${fields} ${timestamp}`

      // 构造请求 URL
      const url = `${config.url}/api/v2/write?org=${config.org}&bucket=${config.bucket}&precision=ns`

      // 发送请求
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${config.token}`,
          'Content-Type': 'text/plain',
        },
        body: lineProtocol
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 数据写入成功后，构造返回数据
      const newData: VitalData = {
        _time: formData.timestamp,
        _value: parseFloat(formData.value),
        type: formData.type,
        bed: `${formData.bed}号床`,
        unit: VITAL_RANGES[formData.type as keyof typeof VITAL_RANGES].unit,
        isExtreme: false
      }

      if (typeof onSave === 'function') {
        await onSave(newData)
      }

      setFormData({ 
        value: "", 
        type: "", 
        bed: "", 
        timestamp: new Date().toISOString().slice(0, 16) 
      })
      onClose()
    } catch (error) {
      console.error('保存失败:', error)
      alert(error instanceof Error ? `保存失败: ${error.message}` : '保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [formData, onSave, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>添加新数据</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">指标类型</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleFormChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择指标类型" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(VITAL_RANGES).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">数值</Label>
            <Input
              id="value"
              type="number"
              step="0.1"
              value={formData.value}
              onChange={(e) => handleFormChange('value', e.target.value)}
              placeholder="输入数值"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bed">床位号</Label>
            <Select
              value={formData.bed}
              onValueChange={(value) => handleFormChange('bed', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择床位号" />
              </SelectTrigger>
              <SelectContent>
                {bedOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 添加时间选择器 */}
          <div className="space-y-2">
            <Label htmlFor="timestamp">时间</Label>
            <Input
              id="timestamp"
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) => handleFormChange('timestamp', e.target.value)}
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.type || !formData.value || !formData.bed}
            >
              {loading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
