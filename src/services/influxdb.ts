import { InfluxDB, QueryApi } from '@influxdata/influxdb-client'

// 定义并导出接口和类型
export interface ExistsFilter {
  $exists: boolean;
}

export type FilterValue = string | ExistsFilter;
export type DeleteFilters = Record<string, FilterValue>;

export class InfluxDBService {
  private client: InfluxDB;
  protected bucket: string;
  protected queryApi: QueryApi;

  constructor(url: string, token: string, org: string, bucket: string) {
    this.client = new InfluxDB({ url, token });
    this.bucket = bucket;
    this.queryApi = this.client.getQueryApi(org);
  }

  async deleteData(filters: DeleteFilters): Promise<boolean> {
    try {
      let predicate = '';
      
      Object.entries(filters).forEach(([key, value], index) => {
        if (index > 0) predicate += ' and ';
        
        if (typeof value === 'object' && '$exists' in value) {
          predicate += `exists ${key}`;
        } else if (key === '_time') {
          predicate += `${key} = time(v: "${value}")`;
        } else {
          predicate += `${key} = "${value}"`;
        }
      });

      const deleteQuery = `
        from(bucket: "${this.bucket}")
          |> range(start: 0)
          |> filter(fn: (r) => ${predicate})
          |> delete()
      `;

      await this.queryApi.collectRows(deleteQuery);
      return true;
    } catch (error) {
      console.error('Error deleting data:', error);
      return false;
    }
  }

  // ...existing code...
}
