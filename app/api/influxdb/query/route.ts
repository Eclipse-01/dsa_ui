import { NextResponse } from 'next/server'
import { getInfluxDBConfig } from '@/config/influxdb'
import { InfluxDB, FluxTableMetaData } from '@influxdata/influxdb-client'

interface InfluxResult {
  _time: string
  _value: number
  _field: string
  bed: string
}

export async function POST(request: Request) {
  try {
    const { dataType, startDate, endDate, bedFilter, page = 1, pageSize = 10 } = await request.json()
    const config = getInfluxDBConfig()
    const influxDB = new InfluxDB({ url: config.url, token: config.token })
    const queryApi = influxDB.getQueryApi(config.org)

    // 构建 Flux 查询语句
    let fluxQuery = `from(bucket: "${config.bucket}")
      |> range(start: ${startDate || '-30d'}, stop: ${endDate || 'now()'})
      |> filter(fn: (r) => r._measurement == "vital_signs")`

    // 添加条件过滤
    if (dataType && dataType !== 'all') {
      fluxQuery += `\n  |> filter(fn: (r) => r._field == "${dataType}")`
    }
    if (bedFilter && bedFilter !== 'all') {
      fluxQuery += `\n  |> filter(fn: (r) => r.bed == "${bedFilter}")`
    }

    // 添加排序和分页
    fluxQuery += `
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${pageSize}, offset: ${(page - 1) * pageSize})`

    // 执行查询并获取结果
    const result: any[] = []
    
    // 修复查询执行
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next: (row: string[], tableMeta: FluxTableMetaData) => {
          const o = tableMeta.toObject(row) as InfluxResult
          result.push({
            id: `${o._time}-${o.bed}-${o._field}`,
            timestamp: o._time,
            bed: o.bed,
            type: o._field,
            value: o._value.toString(),
            unit: getUnit(o._field)
          })
        },
        error: (error: Error) => reject(error),
        complete: () => resolve()
      })
    })

    // 获取总数量
    const countResult = await new Promise<any[]>((resolve, reject) => {
      const counts: any[] = []
      const countQuery = fluxQuery.split('|> limit')[0] + '|> count()'
      
      queryApi.queryRows(countQuery, {
        next: (row: string[], tableMeta: FluxTableMetaData) => {
          counts.push(tableMeta.toObject(row))
        },
        error: (error: Error) => reject(error),
        complete: () => resolve(counts)
      })
    })

    const total = countResult[0]?._value || 0

    return NextResponse.json({
      data: result,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    })

  } catch (error) {
    console.error('查询失败:', error)
    return NextResponse.json(
      { error: '查询数据失败' },
      { status: 500 }
    )
  }
}

// 根据数据类型获取单位
function getUnit(type: string): string {
  const units: Record<string, string> = {
    heartRate: 'BPM',
    bloodO2: '%',
    systolic: 'mmHg',
    diastolic: 'mmHg',
    temperature: '°C',
    respirationRate: '次/分',
    bloodGlucose: 'mmol/L',
    heartRateVariability: 'ms',
    stressLevel: '/5'
  }
  return units[type] || ''
}
