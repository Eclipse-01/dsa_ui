export interface PaginationParams {
    limit?: number;
    offset?: number;
    after?: string;
}

export class InfluxDBService {
    private url: string;
    private token: string;
    private org: string;
    private bucket: string;

    constructor(url: string, token: string, org: string, bucket: string) {
        this.url = url;
        this.token = token;
        this.org = org;
        this.bucket = bucket;
    }

    private getHeaders(contentType: string = 'application/json') {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': contentType,
            'Accept': contentType
        };
    }

    private handleErrorResponse(response: Response, operation: string): Promise<never> {
        return response.text().then(errorText => {
            let message: string;
            switch (response.status) {
                case 400:
                    message = `请求格式错误: ${errorText}`;
                    break;
                case 401:
                    message = '未授权，请检查token';
                    break;
                case 404:
                    message = '请求的资源不存在';
                    break;
                case 413:
                    message = '请求数据过大';
                    break;
                case 422:
                    message = `数据无效: ${errorText}`;
                    break;
                case 429:
                    message = '请求过于频繁，请稍后重试';
                    break;
                case 503:
                    message = '服务暂时不可用，请稍后重试';
                    break;
                default:
                    message = `${operation}失败: ${errorText}`;
            }
            throw new Error(message);
        });
    }

    // 查询数据
    async query(fluxQuery: string, pagination?: PaginationParams) {
        const params = new URLSearchParams({ org: this.org });
        if (pagination) {
            if (pagination.limit) params.append('limit', pagination.limit.toString());
            if (pagination.offset) params.append('offset', pagination.offset.toString());
            if (pagination.after) params.append('after', pagination.after);
        }

        try {
            const response = await fetch(`/api/query?${params}`, {
                method: 'POST',
                headers: this.getHeaders('application/vnd.flux'),
                body: fluxQuery
            });

            if (!response.ok) {
                return this.handleErrorResponse(response, '查询');
            }

            return await response.json();
        } catch (error) {
            console.error('查询错误:', error);
            throw error;
        }
    }

    // 写入数据
    async writeData(measurement: string, tags: Record<string, string>, fields: Record<string, any>) {
        const line = `${measurement},${Object.entries(tags).map(([k, v]) => `${k}=${v}`).join(',')} ${Object.entries(fields).map(([k, v]) => `${k}=${typeof v === 'number' ? v : `"${v}"`}`).join(',')}`;

        try {
            const response = await fetch(`/api/write?org=${this.org}&bucket=${this.bucket}&precision=ns`, {
                method: 'POST',
                headers: this.getHeaders('text/plain'),
                body: line
            });

            if (!response.ok) {
                return this.handleErrorResponse(response, '写入');
            }
        } catch (error) {
            console.error('写入错误:', error);
            throw error;
        }
    }

    // 删除数据
    async deleteData(predicates: Record<string, string>, start: string = '2000-01-01T00:00:00Z', stop: string = new Date().toISOString()) {
        const predicateString = Object.entries(predicates)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' AND ');

        const body = {
            start: start,
            stop: stop,
            predicate: predicateString
        };

        try {
            const params = new URLSearchParams({ 
                org: this.org,
                bucket: this.bucket
            });

            const response = await fetch(`${this.url}/api/v2/delete?${params}`, {
                method: 'POST',
                headers: this.getHeaders('application/json'),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                return this.handleErrorResponse(response, '删除');
            }

            return true;
        } catch (error) {
            console.error('删除错误:', error);
            throw error;
        }
    }

    // 检查连接健康状态
    async handlePing() {
        try {
            const response = await fetch('/health', {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'pass') {
                    return { 
                        type: 'success', 
                        message: `连接正常 (${data.version})` 
                    };
                }
            }
            const errorText = await response.text();
            return { type: 'error', message: `连接失败: ${errorText}` };
        } catch (error) {
            console.error('Health检查错误:', error);
            return { type: 'error', message: '连接失败，请检查服务器地址是否正确' };
        }
    }
}