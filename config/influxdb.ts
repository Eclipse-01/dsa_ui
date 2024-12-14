interface InfluxDBConfig {
  url: string;
  token: string;
  org: string;
  bucket: string;
}

// 获取配置的函数改为客户端专用
const getInfluxDBConfig = (): InfluxDBConfig => {
  if (typeof window === 'undefined') {
    return {
      url: 'http://localhost:8086',
      token: 'your-token',
      org: 'your-org',
      bucket: 'your-bucket'
    }
  }

  const savedConfig = window.localStorage.getItem('influxdb_config');
  if (savedConfig) {
    return JSON.parse(savedConfig);
  }
  
  // 默认配置
  return {
    url: 'http://localhost:8086',
    token: 'your-token',
    org: 'your-org',
    bucket: 'your-bucket'
  };
};

// 保存配置的函数
const saveInfluxDBConfig = (config: InfluxDBConfig): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('influxdb_config', JSON.stringify(config));
  }
};

export { getInfluxDBConfig, saveInfluxDBConfig };
export type { InfluxDBConfig };
