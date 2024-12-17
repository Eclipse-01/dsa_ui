import { InfluxDB, Point } from '@influxdata/influxdb-client'

// 定义并导出接口和类型
export interface ExistsFilter {
  $exists: boolean;
}

export interface DeleteFilters {
  _measurement?: string;
  bed?: string;
  type?: string;
  id?: string | ExistsFilter;
  _time?: string;
}

export type FilterValue = string | ExistsFilter;

export class InfluxDBService {
  private client: InfluxDB;
  private org: string;
  private bucket: string;

  constructor(url: string, token: string, org: string, bucket: string) {
    this.client = new InfluxDB({ url, token });
    this.org = org;
    this.bucket = bucket;
  }

  async writeData(measurement: string, tags: Record<string, string>, fields: Record<string, number | string>) {
    const writeApi = this.client.getWriteApi(this.org, this.bucket, 'ns');
    
    const point = new Point(measurement);
    
    // 添加标签
    Object.entries(tags).forEach(([key, value]) => {
      point.tag(key, value);
    });
    
    // 添加字段
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value === 'number') {
        point.floatField(key, value);
      } else {
        point.stringField(key, value);
      }
    });
    
    writeApi.writePoint(point);
    await writeApi.flush();
    await writeApi.close();
    
    return true;
  }

  async handlePing(): Promise<{ type: 'success' | 'error' | null, message: string }> {
    try {
      const queryApi = this.client.getQueryApi(this.org);
      await queryApi.collectRows(`from(bucket:"_monitoring")
        |> range(start: -1m)
        |> limit(n:1)`);
      return {
        type: 'success',
        message: '连接成功'
      };
    } catch (error: any) {
      return {
        type: 'error',
        message: `连接失败: ${error?.message || '未知错误'}`
      };
    }
  }

  async deleteData(filters: DeleteFilters): Promise<boolean> {
    try {
      const queryApi = this.client.getQueryApi(this.org);
      
      const predicates: string[] = [];
      Object.entries(filters).forEach(([key, value]) => {
        if (value && typeof value === 'object' && '$exists' in value) {
          predicates.push(`exists(r["${key}"])`);
        } else if (value) {
          predicates.push(`r["${key}"] == "${value}"`);
        }
      });
      
      const predicate = predicates.length > 0 ? predicates.join(' and ') : '_measurement exists';
      
      // 使用 Flux 查询来删除数据
      const query = `
        from(bucket: "${this.bucket}")
          |> range(start: -30d)
          |> filter(fn: (r) => ${predicate})
          |> drop()`;
      
      await queryApi.collectRows(query);
      return true;
    } catch (error) {
      console.error('Error deleting data:', error);
      return false;
    }
  }

  // ...existing code...
}
