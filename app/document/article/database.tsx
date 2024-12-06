import { Card, CardContent } from "@/components/ui/card"

export default function DatabaseArticle() {
  return (
    <div className="w-full space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">数据库连接配置</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-6 space-y-3">
              <li>本地数据库配置:
                <pre className="bg-gray-100 p-2 mt-2 rounded">
{`const databaseConfig = {
  dbName: "localdb",
  tables: {
    users: "users",
    settings: "settings"
  }
}`}
                </pre>
              </li>
              <li>初始化配置:
                <ul className="list-circle pl-6 mt-2 space-y-2">
                  <li>数据库文件存储在 ./data 目录</li>
                  <li>首次运行自动创建数据表</li>
                  <li>默认开启数据同步</li>
                </ul>
              </li>
              <li>基础设置:
                <ul className="list-circle pl-6 mt-2 space-y-2">
                  <li>支持自动备份</li>
                  <li>数据版本控制</li>
                  <li>异常回滚机制</li>
                </ul>
              </li>
              <li>InfluxDB 连接配置:
                <pre className="bg-gray-100 p-2 mt-2 rounded">
{`const influxConfig = {
  url: 'http://localhost:8086',
  token: 'your-token',
  org: 'your-org',
  bucket: 'your-bucket',
  precision: 'ms'
}`}
                </pre>
              </li>
              <li>初始化配置:
                <ul className="list-circle pl-6 mt-2 space-y-2">
                  <li>默认端口: 8086</li>
                  <li>数据保留策略: 30天</li>
                  <li>默认开启 HTTP 认证</li>
                </ul>
              </li>
              <li>基础设置:
                <ul className="list-circle pl-6 mt-2 space-y-2">
                  <li>时序数据写入</li>
                  <li>数据压缩开启</li>
                  <li>连续查询支持</li>
                </ul>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">数据模型</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h3 className="font-medium mb-2">本地数据结构</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>users: 用户信息表</li>
                <li>settings: 系统配置表</li>
                <li>data: 业务数据表</li>
                <li>logs: 操作日志表</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">数据同步策略</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>实时同步: 立即写入磁盘</li>
                <li>定时同步: 每5分钟备份</li>
                <li>手动同步: 用户触发</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">时序数据结构</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>measurement: 测量指标</li>
                <li>timestamp: 时间戳</li>
                <li>fields: 字段值</li>
                <li>tags: 标签集</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">数据写入格式</h3>
              <pre className="bg-gray-100 p-2 rounded">
{`// 行协议格式
measurement,tag_key=tag_value field_key=field_value timestamp

// 示例
cpu,host=server01,region=us-west usage_idle=98.2 1434055562000000000`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">查询操作</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">基本操作示例</h3>
                <pre className="bg-gray-100 p-2 rounded">
{`// 查询数据
db.get('users')
  .find({ active: true })
  .value()

// 更新数据
db.get('settings')
  .update({ theme: 'dark' })
  .write()`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2">常用操作</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>get(): 获取数据表</li>
                  <li>find(): 查询数据</li>
                  <li>write(): 写入数据</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Flux 查询示例</h3>
                <pre className="bg-gray-100 p-2 rounded">
{`// 基础查询
from(bucket: "your-bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> yield()

// 聚合查询
from(bucket: "your-bucket")
  |> range(start: -1d)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> mean()`}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2">常用操作函数</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>range(): 时间范围</li>
                  <li>filter(): 数据过滤</li>
                  <li>map(): 数据转换</li>
                  <li>reduce(): 数据聚合</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">性能优化</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-6 space-y-3">
              <li>查询优化:
                <ul className="list-circle pl-6 mt-2 space-y-2">
                  <li>使用精确的时间范围</li>
                  <li>避免SELECT *查询</li>
                  <li>合理使用标签索引</li>
                  <li>优先使用预计算的汇总数据</li>
                  <li>优化数据分片策略</li>
                </ul>
              </li>
              <li>写入优化:
                <ul className="list-circle pl-6 mt-2 space-y-2">
                  <li>批量写入提升性能</li>
                  <li>使用行协议批量写入</li>
                  <li>控制标签数量</li>
                  <li>使用适当的时间精度</li>
                  <li>设置合适的分片间隔</li>
                  <li>避免过多的tag key</li>
                  <li>启用压缩算法</li>
                </ul>
              </li>
              <li>存储优化:
                <ul className="list-circle pl-6 mt-2 space-y-2">
                  <li>设置合理的保留策略</li>
                  <li>定期清理过期数据</li>
                  <li>监控磁盘使用情况</li>
                </ul>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}