import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function InfluxDBArticle() {
  return (
    <div className="w-full space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Windows 安装指南</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">1. 直接安装</h3>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  下载安装包
                  <ul className="list-disc pl-6 mt-2 text-gray-600">
                    <li>访问 <a href="https://portal.influxdata.com/downloads/" className="text-blue-500 hover:underline">InfluxDB 下载页面</a></li>
                    <li>选择 Windows 版本下载</li>
                  </ul>
                </li>
                <li>
                  运行安装程序
                  <ul className="list-disc pl-6 mt-2 text-gray-600">
                    <li>双击下载的 .exe 文件</li>
                    <li>按照安装向导提示完成安装</li>
                    <li>默认安装路径: C:\Program Files\InfluxDB</li>
                  </ul>
                </li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">2. Docker 安装</h3>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  拉取镜像并运行
                  <Alert className="overflow-x-auto">
                    <AlertDescription>
                      <code className="break-words whitespace-pre-wrap block bg-muted p-4 rounded-md">
                        docker run -d --name influxdb -p 8086:8086 -v influxdb:/var/lib/influxdb2 -v influxdb-config:/etc/influxdb2 -e DOCKER_INFLUXDB_INIT_MODE=setup -e DOCKER_INFLUXDB_INIT_USERNAME=admin -e DOCKER_INFLUXDB_INIT_PASSWORD=your-password -e DOCKER_INFLUXDB_INIT_ORG=your-org -e DOCKER_INFLUXDB_INIT_BUCKET=your-bucket influxdb:2.0
                      </code>
                    </AlertDescription>
                  </Alert>
                </li>
                <li>
                  验证安装
                  <ul className="list-disc pl-6 mt-2 text-gray-600">
                    <li>访问 <a href="http://localhost:8086" className="text-blue-500 hover:underline">http://localhost:8086</a></li>
                    <li>使用配置的用户名和密码登录</li>
                  </ul>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Linux 安装指南</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">1. 包管理器安装</h3>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  添加存储库
                  <div className="overflow-x-auto">
                    <pre className="bg-muted p-3 rounded mt-2 w-full">
                      <code className="block whitespace-pre overflow-x-auto text-sm">wget -q https://repos.influxdata.com/influxdb.key</code>
                      <code className="block whitespace-pre overflow-x-auto text-sm">echo '23a1c8836f0afc5ed24e0486339d7cc8f6790b83886c4c96995b88a061c5bb5d influxdb.key' | sha256sum -c && cat influxdb.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/influxdb.gpg > /dev/null</code>
                      <code className="block whitespace-pre overflow-x-auto text-sm">echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdb.gpg] https://repos.influxdata.com/debian stable main' | sudo tee /etc/apt/sources.list.d/influxdata.list</code>
                    </pre>
                  </div>
                </li>
                <li>
                  安装 InfluxDB
                  <pre className="bg-muted p-3 rounded mt-2">
                    <code>sudo apt-get update && sudo apt-get install influxdb2</code>
                  </pre>
                </li>
                <li>
                  启动服务
                  <pre className="bg-muted p-3 rounded mt-2">
                    <code>sudo systemctl start influxdb</code>
                  </pre>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">2. Docker 安装</h3>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  安装 Docker（如果未安装）
                  <pre className="bg-muted p-3 rounded mt-2">
                    <code>curl -fsSL https://get.docker.com | sh</code>
                  </pre>
                </li>
                <li>
                  运行 InfluxDB 容器
                  <Alert className="overflow-x-auto">
                    <AlertDescription>
                      <code className="break-words whitespace-pre-wrap block bg-muted p-4 rounded-md">
                        docker run -d --name influxdb -p 8086:8086 -v influxdb:/var/lib/influxdb2 -v influxdb-config:/etc/influxdb2 -e DOCKER_INFLUXDB_INIT_MODE=setup -e DOCKER_INFLUXDB_INIT_USERNAME=admin -e DOCKER_INFLUXDB_INIT_PASSWORD=your-password -e DOCKER_INFLUXDB_INIT_ORG=your-org -e DOCKER_INFLUXDB_INIT_BUCKET=your-bucket influxdb:2.0
                      </code>
                    </AlertDescription>
                  </Alert>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">初始配置</h2>
        <Card>
          <CardContent className="pt-6">
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                访问 Web 控制台
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>打开浏览器访问 <a href="http://localhost:8086" className="text-blue-500 hover:underline">http://localhost:8086</a></li>
                  <li>使用设置的管理员账号登录</li>
                </ul>
              </li>
              <li>
                获取访问令牌
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>在 Web 界面中导航到 "Data" > "API Tokens"</li>
                  <li>记录生成的访问令牌，用于程序连接</li>
                </ul>
              </li>
              <li>
                创建数据桶（Bucket）
                <ul className="list-disc pl-6 mt-2 text-gray-600">
                  <li>导航到 "Data" > "Buckets"</li>
                  <li>点击 "Create Bucket" 创建新的数据桶</li>
                  <li>设置适当的数据保留策略</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}