import { NextResponse } from 'next/server';
import { InfluxDB, FluxTableMetaData } from '@influxdata/influxdb-client';

export async function GET(request: Request) {
  try {
    // 获取查询参数，移除undefined值
    const url = new URL(request.url);
    const searchParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (value !== 'undefined' && value !== '') {
        searchParams.append(key, value);
      }
    });

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const dataType = searchParams.get('dataType');
    const bedFilter = searchParams.get('bedFilter');

    // 获取并验证InfluxDB配置
    const influxConfig = request.headers.get('x-influxdb-config');
    if (!influxConfig) {
      return NextResponse.json({ error: '数据库配置未找到' }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    const config = JSON.parse(influxConfig);
    if (!config.url || !config.token || !config.org || !config.bucket) {
      return NextResponse.json({ error: '数据库配置不完整' }, { status: 400 });
    }

    // 创建InfluxDB客户端并设置超时
    const client = new InfluxDB({
      url: config.url,
      token: config.token,
      timeout: 30000
    });

    const queryApi = client.getQueryApi(config.org);

    // 修改计数查询
    const countQuery = `
      from(bucket: "${config.bucket}")
        |> range(start: ${startDate ? `time(v: "${startDate}")` : '-30d'}, stop: ${endDate ? `time(v: "${endDate}")` : 'now()'})
        |> filter(fn: (r) => r["_measurement"] == "vital_signs")
        ${dataType && dataType !== 'all' ? `\n  |> filter(fn: (r) => r["type"] == "${dataType}")` : ''}
        ${bedFilter && bedFilter !== 'all' ? `\n  |> filter(fn: (r) => r["bed"] == "${bedFilter}")` : ''}
        |> group()
        |> count()
        |> yield(name: "count")
    `;

    let total = 0;
    try {
      console.log('执行计数查询:', countQuery);
      const countResults = await queryApi.collectRows(countQuery);
      // 修改计数结果的获取方式
      total = countResults.reduce((sum, row) => sum + (parseInt(row._value) || 0), 0);
      console.log('总记录数:', total);
    } catch (error) {
      console.error('计数查询失败:', error);
      total = 0;
    }

    // 修改数据查询，确保准确的分页
    const dataQuery = `
      from(bucket: "${config.bucket}")
        |> range(start: ${startDate ? `time(v: "${startDate}")` : '-30d'}, stop: ${endDate ? `time(v: "${endDate}")` : 'now()'})
        |> filter(fn: (r) => r["_measurement"] == "vital_signs")
        ${dataType && dataType !== 'all' ? `\n  |> filter(fn: (r) => r["type"] == "${dataType}")` : ''}
        ${bedFilter && bedFilter !== 'all' ? `\n  |> filter(fn: (r) => r["bed"] == "${bedFilter}")` : ''}
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: ${pageSize + 1}, offset: ${(page - 1) * pageSize})
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    const data: Array<any> = [];
    try {
      console.log('执行数据查询:', dataQuery);
      await new Promise((resolve, reject) => {
        queryApi.queryRows(dataQuery, {
          next: (row: string[], tableMeta: FluxTableMetaData) => {
            const o = tableMeta.toObject(row);
            data.push({
              id: String(o.id || o._value || new Date().getTime()),
              timestamp: o._time,
              type: o.type || '',
              value: String(o.value || o._value || ''),
              unit: o.unit || '',
              bed: o.bed || '',
            });
          },
          error: (error: Error) => {
            console.error('数据查询错误:', error);
            reject(error);
          },
          complete: () => {
            console.log('数据查询完成, 记录数:', data.length);
            resolve(data);
          },
        });
      });
    } catch (error) {
      console.error('数据查询失败:', error);
      throw error;
    }

    // 严格限制返回的数据量
    if (data.length > pageSize) {
      const hasNextPage = data.length > pageSize;
      data.length = pageSize;
      console.log(`当前页数据量: ${data.length}, 是否有下一页: ${hasNextPage}`);
    }

    // 返回响应
    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      success: true,
      hasNextPage: data.length === pageSize,
      debug: {
        countQuery,
        dataQuery,
        params: {
          startDate,
          endDate,
          dataType,
          bedFilter,
          page,
          pageSize
        },
        returnedDataCount: data.length
      }
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('API error:', error);
    
    // 返回格式化的错误响应
    return NextResponse.json({
      error: error instanceof Error ? error.message : '查询失败',
      success: false
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
}
