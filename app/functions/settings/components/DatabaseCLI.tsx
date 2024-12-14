"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Database,
  Table,
  Search,
  History,
  HelpCircle,
  Terminal,
  TableProperties,
  RefreshCw,
} from "lucide-react"
import { executeFluxQuery, getPredefinedQueries } from '@/lib/influxdb'
import { InfluxDBService, DeleteFilters, ExistsFilter } from "@/src/services/influxdb"

interface CommandHistory {
  command: string
  output: string
  isError?: boolean
}

export function DatabaseCLI() {
  const [command, setCommand] = useState("")
  const [history, setHistory] = useState<CommandHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const executeCommand = async (cmdText: string) => {
    if (!cmdText.trim()) return

    setIsLoading(true)
    try {
      const response = await executeInfluxCommand(cmdText)
      setHistory(prev => [...prev, {
        command: cmdText,
        output: response,
        isError: false
      }])
    } catch (error) {
      setHistory(prev => [...prev, {
        command: cmdText,
        output: error instanceof Error ? error.message : "执行出错",
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    setHistory([])
  }

  const commandSuggestions = [
    {
      icon: <Search className="mr-2 h-4 w-4" />,
      text: "SELECT * FROM vital_signs LIMIT 10",
      description: "查询最近10条生命体征数据"
    },
    {
      icon: <Table className="mr-2 h-4 w-4" />,
      text: "SHOW MEASUREMENTS",
      description: "显示所有测量指标"
    },
    {
      icon: <TableProperties className="mr-2 h-4 w-4" />,
      text: "SHOW FIELDS",
      description: "显示所有字段"
    },
    {
      icon: <Database className="mr-2 h-4 w-4" />,
      text: "SHOW DATABASES",
      description: "显示所有数据库"
    },
    {
      icon: <Database className="mr-2 h-4 w-4" />,
      text: "INSERT TEST_DATA",
      description: "插入测试数据"
    },
    {
      icon: <Database className="mr-2 h-4 w-4" />,
      text: "DELETE TEST_DATA",
      description: "删除测试数据"
    },
    {
      icon: <Database className="mr-2 h-4 w-4" />,
      text: "CLEAR ALL DATA",
      description: "清除所有数据（谨慎使用）"
    }
  ]

  const handleCommandExecute = async (cmdText: string) => {
    if (!cmdText.trim()) return
    
    await executeCommand(cmdText)
    setCommand("") // 清除输入框
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>数据库命令行</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearHistory}
          >
            清除历史
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] mb-4 rounded-md border bg-muted p-4">
          {history.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex gap-2">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span>{item.command}</span>
              </div>
              <div className={`ml-6 ${item.isError ? "text-red-500" : "text-green-500"}`}>
                {item.output}
              </div>
            </div>
          ))}
        </ScrollArea>

        <Command className="rounded-lg border">
          <CommandInput 
            placeholder="输入数据库命令..." 
            disabled={isLoading}
            value={command}
            onValueChange={setCommand}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleCommandExecute(command)
              }
            }}
          />
          <CommandList>
            <CommandEmpty>没有找到匹配的命令</CommandEmpty>
            <CommandGroup heading="常用命令">
              {commandSuggestions.map((suggestion, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => {
                    setCommand(suggestion.text)
                    handleCommandExecute(suggestion.text)
                  }}
                >
                  {suggestion.icon}
                  <div className="flex flex-col">
                    <span className="font-mono text-sm">{suggestion.text}</span>
                    <span className="text-xs text-muted-foreground">{suggestion.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="帮助">
              <CommandItem 
                onSelect={() => {
                  setCommand("HELP")
                  handleCommandExecute("HELP")
                }}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>显示帮助信息</span>
              </CommandItem>
              <CommandItem 
                onSelect={() => {
                  setCommand("SHOW HISTORY")
                  handleCommandExecute("SHOW HISTORY")
                }}
              >
                <History className="mr-2 h-4 w-4" />
                <span>查看命令历史</span>
              </CommandItem>
              <CommandItem 
                onSelect={() => {
                  setCommand("CLEAR CACHE")
                  handleCommandExecute("CLEAR CACHE")
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>清除查询缓存</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CardContent>
    </Card>
  )
}

const executeInfluxCommand = async (command: string): Promise<string> => {
  try {
    const predefinedQueries = getPredefinedQueries()
    const config = JSON.parse(localStorage.getItem('influxdb_config') || '{}')
    
    if (command.toLowerCase() === "show databases") {
      const results = await executeFluxQuery(predefinedQueries.showDatabases)
      return formatResults(results, "数据库列表")
    }
    
    if (command.toLowerCase() === "show measurements") {
      const results = await executeFluxQuery(predefinedQueries.showMeasurements)
      return formatResults(results, "测量指标列表")
    }
    
    if (command.toLowerCase() === "show tables") {
      const results = await executeFluxQuery(predefinedQueries.showTables)
      return formatResults(results, "数据表列表")
    }
    
    if (command.toLowerCase() === "show fields") {
      const results = await executeFluxQuery(predefinedQueries.showFields)
      return formatResults(results, "字段列表")
    }

    if (command.toLowerCase().startsWith("select")) {
      const results = await executeFluxQuery(convertSQLToFlux(command, config.bucket))
      return formatResults(results, "查询结果")
    }

    if (command.toLowerCase() === "insert test_data") {
      const results = await insertTestData(config.bucket)
      return "测试数据插入成功"
    }

    if (command.toLowerCase() === "delete test_data") {
      const results = await deleteTestData(config.bucket)
      return "测试数据删除成功"
    }

    if (command.toLowerCase() === "clear all data") {
      await clearAllData(config.bucket)
      return "所有数据已清除"
    }

    if (command.toLowerCase() === "help") {
      return `可用命令：
- SHOW DATABASES: 显示所有数据库
- SHOW MEASUREMENTS: 显示所有测量指标
- SHOW TABLES: 显示所有数据表
- SHOW FIELDS: 显示所有字段
- SELECT ...: 执行查询（将自动转换为Flux查询）
- INSERT TEST_DATA: 插入测试数据
- DELETE TEST_DATA: 删除测试数据
- CLEAR ALL DATA: 清除所有数据（谨慎使用）
- HELP: 显示本帮助信息`
    }

    throw new Error("未知命令")
  } catch (error) {
    throw error
  }
}

const formatResults = (results: any[], title: string): string => {
  if (!results.length) return `${title}: 无数据`
  
  return `${title}:\n${results
    .map(row => JSON.stringify(row, null, 2))
    .join('\n')}`
}

const convertSQLToFlux = (sql: string, bucket: string): string => {
  const match = sql.match(/SELECT\s+(.+?)\s+FROM\s+(.+?)(?:\s+WHERE\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i)
  if (!match) throw new Error("无效的SQL查询")

  const [, fields, measurement, whereClause, limit] = match

  const config = JSON.parse(localStorage.getItem('influxdb_config') || '{}')
  
  let flux = `from(bucket: "${config.bucket || bucket}")
    |> range(start: -1h)`

  if (measurement !== "*") {
    flux += `\n  |> filter(fn: (r) => r["_measurement"] == "${measurement}")`
  }

  if (whereClause) {
    const conditions = whereClause.split(/\s+AND\s+/i)
    conditions.forEach(condition => {
      const [field, op, value] = condition.split(/\s+/)
      flux += `\n  |> filter(fn: (r) => r["${field}"] ${op} ${value})`
    })
  }

  if (limit) {
    flux += `\n  |> limit(n: ${limit})`
  }

  return flux
}

const insertTestData = async (bucket: string): Promise<void> => {
  const config = JSON.parse(localStorage.getItem('influxdb_config') || '{}')
  const influxDB = new InfluxDBService(
    config.url,
    config.token,
    config.org,
    bucket
  )

  const testData = [
    {
      tags: {
        bed: "-1",  // 使用-1作为测试数据的床位号
        type: "体温",
        unit: "°C"
      },
      fields: {
        value: 36.9,
        id: 74282
      }
    },
    {
      tags: {
        bed: "-1",  // 使用-1作为测试数据的床位号
        type: "心率",
        unit: "次/分"
      },
      fields: {
        value: 75.0,
        id: 74283
      }
    },
    {
      tags: {
        bed: "-1",  // 使用-1作为测试数据的床位号
        type: "血氧",
        unit: "%"
      },
      fields: {
        value: 98.0,
        id: 74284
      }
    }
  ]

  // 写入测试数据
  for (const data of testData) {
    await influxDB.writeData("vital_signs", data.tags, data.fields)
  }
}

const deleteTestData = async (bucket: string): Promise<void> => {
  const config = JSON.parse(localStorage.getItem('influxdb_config') || '{}')
  const influxDB = new InfluxDBService(
    config.url,
    config.token,
    config.org,
    bucket
  )

  try {
    const deleteFilters: DeleteFilters = {
      _measurement: "vital_signs",
      bed: "-1",
      id: { $exists: true } as ExistsFilter
    };

    const result = await influxDB.deleteData(deleteFilters);

    if (!result) {
      throw new Error('删除操作失败');
    }
  } catch (error) {
    console.error('删除测试数据失败:', error);
    throw error;
  }
}

// 修改删除单条数据的方法
const deleteDataById = async (bucket: string, id: string, timestamp: string): Promise<void> => {
  const config = JSON.parse(localStorage.getItem('influxdb_config') || '{}')
  const influxDB = new InfluxDBService(
    config.url,
    config.token,
    config.org,
    bucket
  )

  try {
    // 使用 id 和 timestamp 精确定位要删除的数据
    const result = await influxDB.deleteData({
      _measurement: "vital_signs",
      id: id,
      _time: timestamp
    });

    if (!result) {
      throw new Error('删除操作失败');
    }
  } catch (error) {
    console.error('删除数据失败:', error);
    throw error;
  }
}

const clearAllData = async (bucket: string): Promise<void> => {
  const config = JSON.parse(localStorage.getItem('influxdb_config') || '{}')
  const influxDB = new InfluxDBService(
    config.url,
    config.token,
    config.org,
    bucket
  )

  try {
    // 删除所有生命体征数据
    const result = await influxDB.deleteData({
      _measurement: "vital_signs"
    });

    if (!result) {
      throw new Error('清除操作失败');
    }
  } catch (error) {
    console.error('清除所有数据失败:', error);
    throw error;
  }
}
