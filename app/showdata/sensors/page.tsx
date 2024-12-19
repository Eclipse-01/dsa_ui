"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ModeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar-app"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Podcast, Plus, Link2, BatteryMedium, Trash2, RefreshCcw, Wifi, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastViewport } from "@/components/ui/toast"

export default function SensorsPage() {
  const bedOptions = ["1号床", "2号床", "3号床", "4号床","5号床"]
  const typeOptions = [
    "心率", 
    "血压", 
    "体温", 
    "血氧饱和度", 
    "压力水平",
    "呼吸率",      // 添加新的类型
    "血糖"        // 添加新的类型
  ]
  
  // 传感器型号映射表
  const sensorModels = {
    "心率": "XD-58C",
    "血压": "BP-102A",
    "体温": "DS18B20",
    "血氧饱和度": "MAX30102",
    "压力水平": "FSR402",
    "呼吸率": "RR-100",
    "血糖": "BG-200"
  }

  // 生成传感器编号
  const generateSensorId = (type: string) => {
    const prefix = type.slice(0, 2)  // 取类型首字
    const timestamp = Date.now().toString().slice(-6)  // 取时间戳后6位
    return `${prefix}${timestamp}`
  }

  // 生成随机电量 (55-100之间)
  const generateRandomBattery = () => {
    return Math.floor(Math.random() * (100 - 55 + 1)) + 55
  }

  // 初始传感器数据
  const initialSensors = typeOptions.map((type, index) => ({
    id: index + 1,
    sensorId: `${type.slice(0, 1)}${Date.now().toString().slice(-6)}`,
    type,
    model: sensorModels[type as keyof typeof sensorModels],
    status: "connected",
    port: `COM${index + 3}`,
    battery: generateRandomBattery(),
    bed: "1号床",
    isNetwork: false
  }))

  const [sensors, setSensors] = useState<Array<any>>([])
  const [portError, setPortError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [newSensor, setNewSensor] = useState({ 
    sensorId: "",
    type: "", 
    model: "",
    port: "", 
    bed: "",
    isNetwork: false 
  })
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<'error' | 'warning'>('error')
  const [toastTitle, setToastTitle] = useState('')

  // 检查端口是否已存在
  const isPortExist = (port: string) => {
    return sensors.some(sensor => 
      !sensor.isNetwork && sensor.port.toLowerCase() === port.toLowerCase()
    )
  }

  // 添加检查是否存在重复传感器的函数
  const isDuplicateSensor = (type: string, bed: string) => {
    return sensors.some(sensor => 
      sensor.type === type && sensor.bed === bed
    )
  }

  // 从localStorage加载传感器数据
  useEffect(() => {
    const savedSensors = localStorage.getItem('medical_sensors')
    if (savedSensors) {
      setSensors(JSON.parse(savedSensors))
    } else {
      // 如果没有保存的数据，使用初始化的1号床传感器数据
      saveSensors(initialSensors)
    }
  }, [])

  // 保存传感器数据到localStorage
  const saveSensors = (newSensors: any[]) => {
    localStorage.setItem('medical_sensors', JSON.stringify(newSensors))
    setSensors(newSensors)
  }

  // 添加手动刷新函数（暂时只打印日志）
  const handleRefresh = () => {
    console.log('Manual refresh triggered')
    // 这里可以添加实际的刷新逻辑
  }

  // 更新表单验证逻辑
  const isFormValid = () => {
    if (!newSensor.type || !newSensor.bed) return false
    if (!newSensor.isNetwork && !newSensor.port) return false
    
    // 检查端口冲突
    if (!newSensor.isNetwork && isPortExist(newSensor.port)) {
      return false
    }

    // 检查重复传感器
    if (isDuplicateSensor(newSensor.type, newSensor.bed)) {
      return false
    }

    return true
  }

  // 显示提示的辅助函数
  const showWarningToast = (message: string, title: string = '警告') => {
    setToastType('warning')
    setToastTitle(title)
    setPortError(message)
    setShowToast(true)
  }

  // 修改床位选择的处理函数
  const handleBedChange = (bed: string) => {
    const updatedSensor = { ...newSensor, bed }
    
    // 如果已经选择了类型，立即检查是否重复
    if (updatedSensor.type && isDuplicateSensor(updatedSensor.type, bed)) {
      showWarningToast(`${updatedSensor.bed}已存在${updatedSensor.type}传感器`, '重复传感器')
    }
    
    setNewSensor(updatedSensor)
  }

  // 修改类型选择的处理函数
  const handleTypeChange = (type: string) => {
    const updatedSensor = {
      ...newSensor,
      type,
      model: sensorModels[type as keyof typeof sensorModels],
      sensorId: generateSensorId(type)
    }
    
    // 如果已经选择了床位，立即检查是否重复
    if (updatedSensor.bed && isDuplicateSensor(type, updatedSensor.bed)) {
      showWarningToast(`${updatedSensor.bed}已存在${type}传感器`, '重复传感器')
    } else {
      setPortError(null)
    }
    
    setNewSensor(updatedSensor)
  }

  const handleAddSensor = () => {
    // 在这里进行错误检查和设置
    if (!newSensor.type || !newSensor.bed) {
      setPortError("请填写完整信息")
      setToastType('error')
      setToastTitle('表单错误')
      setShowToast(true)
      return
    }

    if (!newSensor.isNetwork && !newSensor.port) {
      setPortError("请填写端口号")
      setToastType('error')
      setToastTitle('表单错误')
      setShowToast(true)
      return
    }

    if (!newSensor.isNetwork && isPortExist(newSensor.port)) {
      setPortError(`端口 ${newSensor.port} 已被使用`)
      setToastType('warning')
      setToastTitle('端口冲突')
      setShowToast(true)
      return
    }

    if (isDuplicateSensor(newSensor.type, newSensor.bed)) {
      setPortError(`${newSensor.bed}已存在${newSensor.type}传感器`)
      setToastType('warning')
      setToastTitle('重复传感器')
      setShowToast(true)
      return
    }
    
    const sensorToAdd = { 
      id: sensors.length + 1, 
      ...newSensor, 
      status: "disconnected",
      battery: generateRandomBattery() 
    }
    
    const updatedSensors = [...sensors, sensorToAdd]
    saveSensors(updatedSensors)
    setNewSensor({ sensorId: "", type: "", model: "", port: "", bed: "", isNetwork: false })
    setPortError(null)
    setIsOpen(false)
  }

  const handleDeleteSensor = (id: number) => {
    const updatedSensors = sensors.filter(sensor => sensor.id !== id)
    saveSensors(updatedSensors)
  }

  const toggleConnection = (id: number) => {
    const updatedSensors = sensors.map(sensor => 
      sensor.id === id 
        ? { ...sensor, status: sensor.status === "connected" ? "disconnected" : "connected" }
        : sensor
    )
    saveSensors(updatedSensors)
  }

  // 更新初始化1号床传感器函数
  const initializeBed1Sensors = () => {
    // 确保清除现有的1号床传感器
    const otherBedSensors = sensors.filter(sensor => sensor.bed !== "1号床")
    
    const bed1Sensors = typeOptions.map((type, index) => ({
      id: Date.now() + index, // 使用时间戳+索引确保ID唯一性
      sensorId: `${type.slice(0, 1)}${Date.now().toString().slice(-6)}`,
      type,
      model: sensorModels[type as keyof typeof sensorModels],
      status: "connected",
      port: `COM${index + 3}`,
      battery: generateRandomBattery(),
      bed: "1号床",
      isNetwork: false
    }))
    
    saveSensors([...otherBedSensors, ...bed1Sensors])
  }

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Sidebar className="hidden lg:block" />
        <div className="min-h-screen bg-background lg:pl-[240px]">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Podcast className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">传感器管理</h1>
                </div>
                <div className="flex items-center gap-2">
                  <ModeToggle />
                </div>
              </div>

              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">已连接的传感器</h2>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Loader2 className="h-4 w-4 mr-2" />
                          初始化1号床传感器
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认初始化传感器</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作将删除所有现有传感器，并为1号床添加所有类型的传感器。确定要继续吗？
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={initializeBed1Sensors}>
                            确认
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      刷新
                    </Button>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          添加传感器
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>添加新传感器</DialogTitle>
                          <DialogDescription>配置新传感器的连接信息</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {newSensor.sensorId && (
                            <div className="space-y-2">
                              <Label>传感器编号</Label>
                              <p className="text-sm font-medium">{newSensor.sensorId}</p>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label htmlFor="type">传感器类型</Label>
                            <Select
                              value={newSensor.type}
                              onValueChange={handleTypeChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="选择传感器类型" />
                              </SelectTrigger>
                              <SelectContent>
                                {typeOptions.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {newSensor.model && (
                              <p className="text-sm text-muted-foreground mt-1">
                                型号: {newSensor.model}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bed">床位号</Label>
                            <Select
                              value={newSensor.bed}
                              onValueChange={handleBedChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="选择床位" />
                              </SelectTrigger>
                              <SelectContent>
                                {bedOptions.map((bed) => (
                                  <SelectItem key={bed} value={bed}>
                                    {bed}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="port">端口号</Label>
                            <Input
                              id="port"
                              value={newSensor.port}
                              onChange={(e) => {
                                setNewSensor({...newSensor, port: e.target.value})
                                setPortError(null) // 清除错误信息当用户开始输入
                              }}
                              placeholder="如: COM3"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isNetwork"
                              checked={newSensor.isNetwork}
                              onCheckedChange={(checked) => 
                                setNewSensor({...newSensor, isNetwork: checked as boolean})
                              }
                            />
                            <Label htmlFor="isNetwork">网络传感器</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsOpen(false)}>取消</Button>
                          <Button 
                            onClick={handleAddSensor}
                            disabled={!isFormValid()}
                          >
                            确认添加
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>传感器编号</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>型号</TableHead>
                      <TableHead>床位</TableHead>
                      <TableHead>端口</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>电量</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensors.map((sensor) => (
                      <TableRow key={sensor.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {sensor.sensorId}
                            {sensor.isNetwork && <Wifi className="h-4 w-4 text-blue-500" />}
                          </div>
                        </TableCell>
                        <TableCell>{sensor.type}</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">
                            {sensor.model}
                          </span>
                        </TableCell>
                        <TableCell>{sensor.bed}</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {sensor.isNetwork ? "网络连接" : sensor.port}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sensor.status === "connected" ? "default" : "secondary"}>
                            {sensor.status === "connected" ? "已连接" : "未连接"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BatteryMedium className={`h-4 w-4 ${
                              sensor.battery > 80 ? "text-green-500" :
                              sensor.battery > 20 ? "text-yellow-500" : 
                              "text-red-500"
                            }`} />
                            <span>{sensor.battery}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleConnection(sensor.id)}
                            >
                              <Link2 className={`h-4 w-4 ${sensor.status === "connected" ? "text-green-500" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSensor(sensor.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        </div>
        {/* 修改 ToastViewport 的位置和样式 */}
        <ToastViewport 
          className="fixed top-4 left-1/2 transform -translate-x-1/2 flex flex-col p-4 gap-2 w-full max-w-[420px] z-[100]" 
        />
        {showToast && (
          <Toast 
            onOpenChange={setShowToast}
            variant={toastType === 'error' ? 'destructive' : 'default'}
            className="bg-white dark:bg-gray-800 border shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          >
            <div className="flex items-center gap-2">
              {toastType === 'warning' && (
                <div className="rounded-full bg-yellow-500 w-2 h-2" />
              )}
              <ToastTitle className="text-base font-medium">{toastTitle}</ToastTitle>
            </div>
            <ToastDescription className="text-sm mt-1">
              {portError}
            </ToastDescription>
          </Toast>
        )}
      </div>
    </ToastProvider>
  )
}