export interface VitalData {
  id: string; // 改为string类型
  timestamp: string;
  type: string;
  value: string;
  unit: string;
  bed: string;
}

export interface VitalDataResponse {
  vitalDataList: VitalData[]
}

export const VITAL_DATA_TYPES = [
  "心率",
  "血氧饱和度",
  "血压",
  "体温",
  "呼吸率",
  "血糖",
  "心率变异性",
  "压力水平"
] as const;

export type VitalDataType = typeof VITAL_DATA_TYPES[number];

export const VITAL_RANGES = {
  "心率": { min: 60, max: 100, unit: "BPM" },
  "血氧饱和度": { min: 95, max: 100, unit: "%" },
  "血压": { min: 90, max: 140, unit: "mmHg" },
  "体温": { min: 36, max: 37.5, unit: "°C" },
  "呼吸率": { min: 12, max: 20, unit: "次/分" },
  "血糖": { min: 3.9, max: 6.1, unit: "mmol/L" },
  "心率变异性": { min: 20, max: 100, unit: "ms" },
  "压力水平": { min: 1, max: 5, unit: "/5" }
} as const;

export const UNITS_MAP = {
  "心率": "BPM",
  "血氧饱和度": "%",
  "血压": "mmHg",
  "体温": "°C",
  "呼吸率": "次/分", 
  "血糖": "mmol/L",
  "心率变异性": "ms",
  "压力水平": "/5"
} as const;

export const NORMAL_RANGES = {
  "心率": { min: 60, max: 100 },
  "血氧饱和度": { min: 95, max: 100 },
  "血压": { 
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 }
  },
  "体温": { min: 36.3, max: 37.2 },
  "呼吸率": { min: 12, max: 20 },
  "血糖": { min: 4.4, max: 6.7 },
  "心率变异性": { min: 30, max: 90 },
  "压力水平": { min: 1, max: 4 }
} as const;

// 移除静态数据列表
export const vitalDataList: VitalData[] = []

// 添加查询参数接口
export interface QueryParams {
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  dataType?: string;
  bedFilter?: string;
}

export interface QueryResponse {
  data: VitalData[];
  total: number;
  hasNextPage: boolean;
}

// 改进 getStoredConfig 函数，添加配置验证
function getStoredConfig() {
  try {
    if (typeof window === 'undefined') return null;
    const config = localStorage.getItem('influxdb_config');
    if (!config) return null;
    
    const parsedConfig = JSON.parse(config);
    // 验证必要的配置字段
    if (!parsedConfig.url || !parsedConfig.token || !parsedConfig.org || !parsedConfig.bucket) {
      throw new Error('数据库配置不完整');
    }
    return parsedConfig;
  } catch (error) {
    console.error('读取配置失败:', error);
    return null;
  }
}

// 改进重试函数
const retryFetch = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  let lastError: Error = new Error(''); // 将类型改为 Error
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        // 添加超时处理
        signal: AbortSignal.timeout(30000), // 30秒超时
      });
      
      // 检查响应状态
      if (response.ok) {
        return response;
      }
      
      // 如果是 401/403，不需要重试
      if (response.status === 401 || response.status === 403) {
        throw new Error('认证失败，请检查数据库配置');
      }
      
      lastError = new Error(`HTTP错误: ${response.status}`);
    } catch (error: unknown) {  // 明确指定错误类型
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时');
      }
      // 最后一次重试失败才抛出错误
      if (i === retries - 1) {
        break;
      }
      // 等待时间随重试次数增加
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  throw lastError;
};

// 修改数据加载函数
import { dataCache } from '@/app/store/data-cache';

export const loadVitalData = async (params: QueryParams): Promise<QueryResponse> => {
  try {
    // 检查缓存
    const cached = dataCache.get(params);
    if (cached) {
      console.log('从缓存获取数据');
      return cached;
    }

    const config = getStoredConfig();
    if (!config) {
      throw new Error('数据库配置未找到或无效，请检查配置');
    }

    // 构建查询参数
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    console.log('请求参数:', Object.fromEntries(queryParams.entries()));

    const response = await retryFetch(
      `/api/vital-data?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-influxdb-config': JSON.stringify(config),
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API响应错误:', response.status, errorText);
      throw new Error(`请求失败: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('API响应:', {
      total: result.total,
      dataLength: result.data?.length,
      hasNextPage: result.hasNextPage,
      success: result.success,
      debug: result.debug
    });

    // 添加数据验证
    if (!result.success || !Array.isArray(result.data)) {
      console.error('Invalid API response:', result);
      throw new Error('返回的数据格式不正确');
    }

    // 确保数据量不超过页面大小
    const validData = result.data.slice(0, params.pageSize);
    const total = typeof result.total === 'number' ? result.total : validData.length;

    const responseData = {
      data: validData,
      total,
      hasNextPage: result.hasNextPage
    };
    
    dataCache.set(params, responseData.data, responseData.total, responseData.hasNextPage);
    return responseData;

  } catch (error) {
    console.error('数据加载失败:', error);
    throw new Error(error instanceof Error ? error.message : '加载数据失败，请检查网络连接');
  }
};

// 改进删除数据函数
export async function deleteVitalData(ids: string[]): Promise<boolean> {
  try {
    const config = getStoredConfig();
    if (!config) {
      throw new Error('数据库配置未找到，请先配置数据库连接');
    }

    const response = await retryFetch('/api/influxdb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-influxdb-config': JSON.stringify(config)
      },
      body: JSON.stringify({ 
        action: 'delete', 
        ids,
        timestamp: new Date().toISOString() // 添加时间戳
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || '删除失败');
    }

    return true;
  } catch (error) {
    console.error('删除数据失败:', error);
    throw error;
  }
}

// 添加数据操作函数
export async function addVitalData(data: Partial<VitalData>): Promise<boolean> {
  try {
    const config = getStoredConfig()
    if (!config) throw new Error('InfluxDB configuration not found')

    const response = await fetch('/api/influxdb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-influxdb-config': JSON.stringify(config)
      },
      body: JSON.stringify({ action: 'write', ...data }),
    })
    return response.ok
  } catch (error) {
    console.error('Error adding data:', error)
    return false
  }
}
