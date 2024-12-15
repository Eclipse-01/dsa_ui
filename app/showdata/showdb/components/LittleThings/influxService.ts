interface InfluxDBResponse {
  result: string;
  table: number;
  _start: string;
  _stop: string;
  _time: string;
  _value: number;
  _field: string;
  _measurement: string;
  bed: string;
  type: string;
  unit: string;
}

export interface DataStats {
  total: number;
  minValue: number;
  maxValue: number;
  unit: string;
}

interface PaginatedResponse {
  data: InfluxDBResponse[];
  stats: DataStats;
  hasMore: boolean;
  nextCursor?: string;
}

interface CacheData {
  timestamp: number;
  response: PaginatedResponse;
}

const CACHE_EXPIRY = 5 * 60 * 1000;
const PAGE_SIZE = 100;
const dataCache = new Map<string, CacheData>();

export const fetchVitalData = async (
  type: string,
  bed: string,
  startDate: Date,
  endDate: Date,
  cursor?: string
): Promise<PaginatedResponse> => {
  console.log('fetchVitalData 被调用，参数:', { type, bed, startDate, endDate, cursor });

  const cacheKey = `${type}-${bed}-${startDate.getTime()}-${endDate.getTime()}-${cursor || 'initial'}`;
  
  const cachedData = dataCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
    return cachedData.response;
  }

  const savedConfig = localStorage.getItem('influxdb_config');
  if (!savedConfig) {
    console.error('未找到 InfluxDB 配置');
    throw new Error('请先在系统设置中配置数据库连接信息');
  }

  console.log('InfluxDB 配置:', JSON.parse(savedConfig));

  const config = JSON.parse(savedConfig);
  if (!config.url || !config.token || !config.org || !config.bucket) {
    throw new Error('数据库配置不完整，请检查配置');
  }

  try {
    console.log('发送查询请求:', {
      type,
      bed,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const response = await fetch('/api/influxdb/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-influxdb-config': savedConfig
      },
      body: JSON.stringify({
        type,
        bed: `${bed}号床`,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pageSize: PAGE_SIZE,
        cursor
      }),
    });

    console.log('API 响应状态:', response.status);
    const responseData = await response.json();
    console.log('API 响应数据:', responseData);

    if (!response.ok) {
      throw new Error(responseData.message || `查询失败: ${response.status}`);
    }

    const rawData: InfluxDBResponse[] = responseData;
    
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('未找到符合条件的数据');
    }
    
    const stats: DataStats = {
      total: rawData.length,
      minValue: Math.min(...rawData.map(d => d._value)),
      maxValue: Math.max(...rawData.map(d => d._value)),
      unit: rawData[0]?.unit || ''
    };

    const paginatedResponse: PaginatedResponse = {
      data: rawData.slice(0, PAGE_SIZE),
      stats,
      hasMore: rawData.length > PAGE_SIZE,
      nextCursor: rawData.length > PAGE_SIZE ? 
        rawData[PAGE_SIZE - 1]._time : undefined
    };

    dataCache.set(cacheKey, {
      timestamp: Date.now(),
      response: paginatedResponse
    });

    return paginatedResponse;
  } catch (error) {
    console.error('查询失败:', error);
    throw new Error(error instanceof Error ? error.message : '未知错误');
  }
};

export const clearCache = async () => {
  dataCache.clear();
  // 如果你使用了其他缓存机制，也在这里清理
  // 例如，如果你使用了 localStorage：
  // localStorage.removeItem('someCache');

  // 如果你需要在服务器端清除缓存，可以在这里调用相应的 API
  // 例如：
  // await fetch('/api/clearCache', { method: 'POST' });
};

export const transformInfluxData = (data: InfluxDBResponse[]) => {
  return data.map(item => ({
    timestamp: new Date(item._time).getTime(),
    value: item._value.toString(),
    unit: item.unit,
  }));
};

export const writeVitalData = async (data: any[], onProgress?: (progress: number) => void) => {
  const savedConfig = localStorage.getItem('influxdb_config');
  if (!savedConfig) {
    throw new Error('请先在系统设置中配置数据库连接信息');
  }

  const config = JSON.parse(savedConfig);
  if (!config.url || !config.token || !config.org || !config.bucket) {
    throw new Error('数据库配置不完整');
  }

  // 分批处理数据，每批1000条
  const batchSize = 1000;
  const batches = Math.ceil(data.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, data.length);
    const batchData = data.slice(start, end);

    await fetch('/api/influxdb/write', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: batchData,
        config
      }),
    });

    if (onProgress) {
      onProgress((end / data.length) * 100);
    }

    // 添加一个小延迟，以防止请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
