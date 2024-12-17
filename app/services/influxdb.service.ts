import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';

export class InfluxDBService {
    private client: InfluxDB;
    private queryApi: QueryApi;

    constructor(url: string, token: string) {
        this.client = new InfluxDB({ url, token });
        this.queryApi = this.client.getQueryApi('');
    }
    
    async handlePing(): Promise<{ type: 'success' | 'error' | null, message: string }> {
        try {
            // 执行一个简单的查询来测试连接
            await this.queryApi.collectRows(`from(bucket:"_monitoring")
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

    // ...existing code...
}
