import { NextResponse } from 'next/server'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { DeleteAPI } from '@influxdata/influxdb-client-apis'

// 添加类型定义
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

// 从请求头获取InfluxDB配置
function getConfigFromHeaders(headers: Headers) {
  try {
    const config = headers.get('x-influxdb-config')
    if (!config) {
      throw new Error('InfluxDB configuration not found in headers')
    }
    const parsedConfig = JSON.parse(config)
    
    // 验证必要的配置项
    if (!parsedConfig.url || !parsedConfig.token || !parsedConfig.org || !parsedConfig.bucket) {
      throw new Error('Missing required InfluxDB configuration parameters')
    }
    
    return parsedConfig
  } catch (error) {
    console.error('Config parsing error:', error)
    throw new Error('Invalid InfluxDB configuration')
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      )
    }

    const { action, ...data } = body
    const config = getConfigFromHeaders(req.headers)
    const influxDB = new InfluxDB({
      url: config.url,
      token: config.token,
      timeout: 10000 // 添加超时设置
    })

    try {
      switch (action) {
        case 'query':
          return await handleQuery(influxDB, data, config)
        case 'write':
          return await handleWrite(influxDB, data, config)
        case 'delete':
          return await handleDelete(influxDB, data, config)
        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          )
      }
    } catch (operationError: unknown) {
      console.error(`${action} operation error:`, operationError)
      return NextResponse.json(
        { 
          error: `Failed to ${action} data: ${
            operationError instanceof Error 
              ? operationError.message 
              : 'Unknown error'
          }` 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Request processing error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

async function handleQuery(influxDB: InfluxDB, queryData: any, config: any) {
  if (!queryData.page || !queryData.pageSize) {
    throw new Error('Missing pagination parameters')
  }

  const { startDate, endDate, dataType, bedFilter, page, pageSize } = queryData
  const queryApi = influxDB.getQueryApi(config.org)

  let fluxQuery = `from(bucket: "${config.bucket}")
    |> range(start: ${startDate || '-30d'}, stop: ${endDate || 'now()'})`

  if (dataType) {
    fluxQuery += `|> filter(fn: (r) => r["type"] == "${dataType}")`
  }
  if (bedFilter) {
    fluxQuery += `|> filter(fn: (r) => r["bed"] == "${bedFilter}")`
  }

  const countQuery = `${fluxQuery}|> count()`
  const totalRows = await queryApi.collectRows<{_value: number}>(countQuery)
  const totalCount = totalRows[0]?._value || 0

  fluxQuery += `
    |> sort(columns: ["_time"], desc: true)
    |> limit(n: ${pageSize}, offset: ${(page - 1) * pageSize})`

  const rows = await queryApi.collectRows<InfluxDBRow>(fluxQuery)
  const responseData = rows.map(row => ({
    id: row._time,
    timestamp: new Date(row._time).toISOString(),
    type: row.type,
    value: row._value.toString(),
    unit: row.unit,
    bed: row.bed
  }))

  return NextResponse.json({ data: responseData, total: totalCount })
}

async function handleWrite(influxDB: InfluxDB, data: any, config: any) {
  if (!data.bed || !data.type || !data.value) {
    throw new Error('Missing required data fields')
  }

  const writeApi = influxDB.getWriteApi(config.org, config.bucket)
  const point = new Point('vital_signs')
    .tag('bed', data.bed)
    .tag('type', data.type)
    .stringField('value', data.value)
    .tag('unit', data.unit)
    .timestamp(new Date(data.timestamp))

  await writeApi.writePoint(point)
  await writeApi.flush()
  await writeApi.close()

  return NextResponse.json({ success: true })
}

async function handleDelete(influxDB: InfluxDB, deleteData: any, config: any) {
  if (!deleteData.ids || !Array.isArray(deleteData.ids) || deleteData.ids.length === 0) {
    throw new Error('Invalid or missing ids parameter')
  }

  const { ids } = deleteData
  const deleteApi = new DeleteAPI(influxDB)

  await Promise.all(ids.map(async (id: string) => {
    const start = new Date(id)
    const stop = new Date(start.getTime() + 1)
    
    await deleteApi.postDelete({
      bucket: config.bucket,
      org: config.org,
      body: {
        start: start.toISOString(),
        stop: stop.toISOString(),
        predicate: '_measurement="vital_signs"'
      }
    })
  }))

  return NextResponse.json({ success: true })
}
