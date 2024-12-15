import { NextResponse } from 'next/server'
import { InfluxDB } from '@influxdata/influxdb-client'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  console.log('API 路由被调用');
  try {
    const params = await request.json()
    console.log('请求参数:', params)
    
    // 从请求头获取配置
    const configHeader = request.headers.get('x-influxdb-config')
    if (!configHeader) {
      console.error('未找到配置头信息');
      return NextResponse.json({ message: '未找到数据库配置' }, { status: 400 })
    }

    let config;
    try {
      config = JSON.parse(configHeader);
      console.log('解析到的配置:', {
        hasUrl: !!config.url,
        hasToken: !!config.token,
        hasOrg: !!config.org,
        hasBucket: !!config.bucket
      });
    } catch (e) {
      console.error('配置解析失败:', e);
      return NextResponse.json({ message: '数据库配置格式错误' }, { status: 400 })
    }

    const client = new InfluxDB({ url: config.url, token: config.token })
    const queryApi = client.getQueryApi(config.org)

    const fluxQuery = `
      from(bucket: "${config.bucket}")
        |> range(start: ${params.startDate}, stop: ${params.endDate})
        |> filter(fn: (r) => r._measurement == "vital_signs")
        |> filter(fn: (r) => r.type == "${params.type}")
        |> filter(fn: (r) => r.bed == "${params.bed}")
        |> sort(columns: ["_time"])
    `
    console.log('执行查询:', fluxQuery);

    // 添加更详细的日志
    console.log('查询参数:', {
      bucket: config.bucket,
      measurement: "vital_signs",
      type: params.type,
      bed: params.bed,
      startDate: params.startDate,
      endDate: params.endDate
    });

    const result = await queryApi.collectRows(fluxQuery)
    console.log('查询结果数量:', result.length);

    if (result.length === 0) {
      return NextResponse.json({ message: '未找到符合条件的数据' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

// 更新 CORS 配置
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-influxdb-config',
    },
  })
}
