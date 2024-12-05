import { InfluxDB } from '@influxdata/influxdb-client'

interface DBConfig {
  url: string
  token: string
  org: string
  bucket: string
}

function getStoredConfig(): DBConfig {
  const defaultConfig = {
    url: 'http://localhost:8086',
    token: '',
    org: '',
    bucket: 'hospital_data'
  }

  try {
    const stored = localStorage.getItem('influxdb_config')
    return stored ? JSON.parse(stored) : defaultConfig
  } catch {
    return defaultConfig
  }
}

export async function executeFluxQuery(query: string): Promise<any[]> {
  const config = getStoredConfig()
  const influxDB = new InfluxDB({ url: config.url, token: config.token })
  const queryApi = influxDB.getQueryApi(config.org)

  try {
    const fluxQuery = query.replace(/\$bucket/g, config.bucket)
    return await queryApi.collectRows(fluxQuery)
  } catch (error) {
    throw new Error(`查询执行失败: ${error instanceof Error ? error.message : String(error)}`)
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
