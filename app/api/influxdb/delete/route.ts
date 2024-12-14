import { NextResponse } from 'next/server'
import { InfluxDB } from '@influxdata/influxdb-client'
import { DeleteAPI } from '@influxdata/influxdb-client-apis'
import { getInfluxDBConfig } from '@/config/influxdb'

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json()
    const config = getInfluxDBConfig()
    const influxDB = new InfluxDB({ url: config.url, token: config.token })
    const deleteApi = new DeleteAPI(influxDB)

    const deletePromises = ids.map(async (id: string) => {
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
    })

    await Promise.all(deletePromises)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    )
  }
}
