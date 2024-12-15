import { InfluxDB } from '@influxdata/influxdb-client'

export interface InfluxConfig {
  url: string
  token: string
  org: string
  bucket: string
}

export function getStoredConfig(): InfluxConfig {
  const configStr = localStorage.getItem('influxdb_config')
  if (!configStr) {
    throw new Error('数据库配置未找到')
  }
  return JSON.parse(configStr)
}

export async function executeFluxQuery(query: string, config?: InfluxConfig) {
  const conf = config || getStoredConfig()
  const queryApi = new InfluxDB({url: conf.url, token: conf.token})
    .getQueryApi(conf.org)

  try {
    const result = await queryApi.collectRows(query)
    return result
  } catch (error) {
    console.error('Query failed', error)
    throw new Error('查询失败：' + (error instanceof Error ? error.message : String(error)))
  }
}

export function getPredefinedQueries() {
  const config = getStoredConfig()
  
  return {
    showDatabases: `buckets()
      |> sort(columns: ["name"])
      |> limit(n: 10)`,
      
    showMeasurements: `import "influxdata/influxdb/schema"
      schema.measurements(bucket: "${config.bucket}")`,
      
    showTables: `import "influxdata/influxdb/schema"
      schema.measurementTagKeys(bucket: "${config.bucket}")`,
      
    showFields: `import "influxdata/influxdb/schema"
      schema.measurementFieldKeys(bucket: "${config.bucket}")`,
  }
}

interface InfluxDBConfig {
  url: string
  token: string
  org: string
  bucket: string
}

export function getInfluxDBConfig(): InfluxDBConfig | null {
  const config = localStorage.getItem('influxdb_config')
  return config ? JSON.parse(config) : null
}

export async function queryVitalSigns(params: {
  dateRange: { from: Date; to: Date }
  vitalSign: string
  bedNumber: string
}) {
  const config = getStoredConfig()
  if (!config) throw new Error('InfluxDB配置未找到')

  const { dateRange, vitalSign, bedNumber } = params
  const query = `
    from(bucket: "${config.bucket}")
      |> range(start: ${dateRange.from.toISOString()}, stop: ${dateRange.to.toISOString()})
      |> filter(fn: (r) => r["_measurement"] == "vital_signs")
      |> filter(fn: (r) => r["type"] == "${vitalSign}")
      |> filter(fn: (r) => r["bed"] == "${bedNumber}")
      |> filter(fn: (r) => r["_field"] == "value")
  `

  console.log("Executing query:", query)

  const response = await fetch(`${config.url}/api/v2/query?org=${config.org}`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${config.token}`,
      'Content-Type': 'application/vnd.flux',
      'Accept': 'application/csv',
    },
    body: query,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("查询错误:", errorText)
    throw new Error('查询失败: ' + errorText)
  }

  const csv = await response.text()
  console.log("Query result:", csv) // 添加日志
  return parseInfluxDBResponse(csv)
}

function parseInfluxDBResponse(csv: string) {
  // 简单的CSV解析实现
  const lines = csv.trim().split('\n')
  const headers = lines[0].split(',')
  const values = lines.slice(1).map(line => {
    const row: any = {}
    line.split(',').forEach((value, index) => {
      row[headers[index]] = value
    })
    return row
  })
  return values
}

export async function executeDeleteRequest(
  config: InfluxConfig, 
  predicate: string,
  start: string,
  stop: string
): Promise<void> {
  const url = `${config.url}/api/v2/delete?org=${encodeURIComponent(config.org)}&bucket=${encodeURIComponent(config.bucket)}`;
  
  const body = {
    start,
    stop,
    predicate
  };

  console.log('Executing delete request:', { url, body });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete request failed:', response.status, response.statusText, errorText);
      throw new Error(`删除请求失败: ${response.status} ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error executing delete request:', error);
    throw error;
  }
}
