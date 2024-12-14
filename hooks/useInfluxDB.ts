"use client"
import { useState, useEffect } from 'react'
import { InfluxDB } from '@influxdata/influxdb-client'

interface InfluxDBConfig {
  url: string;
  token: string;
  org: string;
  bucket: string;
}

const defaultConfig: InfluxDBConfig = {
  url: 'http://localhost:8086',
  token: 'your-token',
  org: 'your-org',
  bucket: 'your-bucket'
};

export function useInfluxDB() {
  const [config, setConfig] = useState<InfluxDBConfig>(defaultConfig);
  const [client, setClient] = useState<InfluxDB | null>(null);
  const [writeApi, setWriteApi] = useState<any>(null);

  useEffect(() => {
    // 从 localStorage 读取配置
    const savedConfig = window.localStorage.getItem('influxdb_config');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      
      const influxDB = new InfluxDB({
        url: parsedConfig.url,
        token: parsedConfig.token
      });
      
      setClient(influxDB);
      setWriteApi(influxDB.getWriteApi(parsedConfig.org, parsedConfig.bucket));
    }
  }, []);

  const updateConfig = (newConfig: InfluxDBConfig) => {
    window.localStorage.setItem('influxdb_config', JSON.stringify(newConfig));
    setConfig(newConfig);
    
    // 更新客户端实例
    const influxDB = new InfluxDB({
      url: newConfig.url,
      token: newConfig.token
    });
    
    setClient(influxDB);
    setWriteApi(influxDB.getWriteApi(newConfig.org, newConfig.bucket));
  };

  return {
    config,
    client,
    writeApi,
    updateConfig
  };
}

export type { InfluxDBConfig };
