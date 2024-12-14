import { NextResponse } from 'next/server'
import { InfluxDB } from '@influxdata/influxdb-client'
import { getInfluxDBConfig } from '@/config/influxdb'

interface InfluxDBRow {
  _time: string
  _value: any
  type: string
  unit: string
  bed: string
  result: string
  table: number
  _field: string
  _measurement: string
}

export async function POST(req: Request) {
  try {
    const { startDate, endDate, dataType, bedFilter, page, pageSize } = await req.json()
    const config = getInfluxDBConfig()
    const influxDB = new InfluxDB({ url: config.url, token: config.token })
    const queryApi = influxDB.getQueryApi(config.org)

    // 构建基础查询
    let fluxQuery = `from(bucket: "${config.bucket}")
      |> range(start: ${startDate || '-30d'}, stop: ${endDate || 'now()'})`

    // 添加过滤条件
    if (dataType) {
      fluxQuery += `|> filter(fn: (r) => r["type"] == "${dataType}")`
    }
    if (bedFilter) {
      fluxQuery += `|> filter(fn: (r) => r["bed"] == "${bedFilter}")`
    }

    // 计算总数
    const countQuery = `${fluxQuery}
      |> count()`
    
    // 修改计数查询的类型断言
    const total = await queryApi.collectRows<{_value: number}>(countQuery)
    const totalCount = total[0]?._value || 0

    // 添加分页
    fluxQuery += `
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${pageSize}, offset: ${(page - 1) * pageSize})`

    const rows = await queryApi.collectRows<InfluxDBRow>(fluxQuery)
    
    // 转换数据格式
    const data = rows.map(row => ({
      id: row._time,
      timestamp: new Date(row._time).toISOString(),
      type: row.type,
      value: row._value.toString(),
      unit: row.unit,
      bed: row.bed
    }))

    return NextResponse.json({ 
      data, 
      total: totalCount
    })

  } catch (error) {
    console.error('Query error:', error)
    return NextResponse.json(
      { error: 'Failed to query data' },
      { status: 500 }
    )
  }
}
