import { NextResponse } from 'next/server'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { getInfluxDBConfig } from '@/config/influxdb'

export async function POST(request: Request) {
  try {
    const { data, config } = await request.json()
    
    const client = new InfluxDB({ url: config.url, token: config.token })
    const writeApi = client.getWriteApi(config.org, config.bucket)
    
    // 批量写入数据
    for (const item of data) {
      const point = new Point('vital_signs')
        .tag('type', item.type)
        .tag('bed', item.bed)
        .floatField('value', item._value)
        .timestamp(new Date(item._time))
      
      writeApi.writePoint(point)
    }
    
    await writeApi.close()
    return NextResponse.json({ success: true, count: data.length })
  } catch (error) {
    console.error('写入失败:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
