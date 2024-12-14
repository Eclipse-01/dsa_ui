interface InfluxDBConfig {
  url: string
  token: string
  org: string
  bucket: string
}

function getInfluxDBConfig(): InfluxDBConfig {
  return {
    url: process.env.INFLUXDB_URL || 'http://localhost:8086',
    token: process.env.INFLUXDB_TOKEN || 'your-token',
    org: process.env.INFLUXDB_ORG || 'your-org',
    bucket: process.env.INFLUXDB_BUCKET || 'vital_signs'
  }
}

// 保存配置的函数
const saveInfluxDBConfig = (config: InfluxDBConfig): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('influxdb_config', JSON.stringify(config));
  }
};

export { 
  getInfluxDBConfig,
  saveInfluxDBConfig,
  type InfluxDBConfig 
};
