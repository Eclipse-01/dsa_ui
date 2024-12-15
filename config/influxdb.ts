interface InfluxDBConfig {
  url: string;
  token: string;
  org: string;
  bucket: string;
}

export const getInfluxDBConfig = (): InfluxDBConfig | null => {
  if (typeof window === 'undefined') return null;
  
  const savedConfig = localStorage.getItem('influxdb_config');
  if (!savedConfig) return null;

  try {
    const config = JSON.parse(savedConfig);
    return config;
  } catch (error) {
    console.error('解析 InfluxDB 配置失败:', error);
    return null;
  }
};

// 保存配置的函数
const saveInfluxDBConfig = (config: InfluxDBConfig): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('influxdb_config', JSON.stringify(config));
  }
};

export { 
  saveInfluxDBConfig,
  type InfluxDBConfig 
};
