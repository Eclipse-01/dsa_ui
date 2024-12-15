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

  async deleteData(filters: DeleteFilters): Promise<boolean> {
    try {
      const deleteApi = this.client.getDeleteApi(this.org);
    
      const start = new Date();
      start.setDate(start.getDate() - 30); // 默认删除30天内的数据
      const stop = new Date();
      
      const predicates: string[] = [];
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && typeof value === 'object' && '$exists' in value) {
          predicates.push(`exists(r["${key}"])`);
        } else if (value) {
          predicates.push(`r["${key}"] == "${value}"`);
        }
      });
      
      const predicate = predicates.length > 0 ? predicates.join(' and ') : '_measurement exists';
      
      await deleteApi.delete(start, stop, predicate, this.bucket);
      
      return true;
    } catch (error) {
      console.error('Error deleting data:', error);
      return false;
    }
  }

  // ...existing code...
}
