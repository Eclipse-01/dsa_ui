import { NextResponse } from 'next/server'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { getInfluxDBConfig } from '@/config/influxdb'

export async function POST(req: Request) {
  try {
    const vitalData = await req.json()
    const { url, token, org, bucket } = getInfluxDBConfig()
    const influxDB = new InfluxDB({ url, token })
    const writeApi = influxDB.getWriteApi(org, bucket)

    const point = new Point('vital_signs')
      .tag('bed', vitalData.bed)
      .tag('type', vitalData.type)
      .stringField('value', vitalData.value)
      .tag('unit', vitalData.unit)
      .timestamp(new Date(vitalData.timestamp))

    await writeApi.writePoint(point)
    await writeApi.flush()
    await writeApi.close()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Write error:', error)
    return NextResponse.json(
      { error: 'Failed to write data' },
      { status: 500 }
    )
  }
}
