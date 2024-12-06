import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"

export default function DeploymentArticle() {
  return (
    <div className="w-full space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">环境要求</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="list-disc pl-6 space-y-2">
              <li>Node.js 16+</li>
              <li>Docker</li>
              <li>InfluxDB 2.0+</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">前端部署</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Windows 部署指南</h3>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">1. 环境配置</h4>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>下载并安装 <a href="https://nodejs.org/" className="text-blue-500 hover:underline">Node.js 16+</a>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>访问 Node.js 官网，下载 LTS 版本</li>
                        <li>运行安装程序，按提示完成安装</li>
                      </ul>
                    </li>
                    <li>安装 <a href="https://git-scm.com/downloads" className="text-blue-500 hover:underline">Git</a>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>访问 Git 官网，下载 Windows 版本</li>
                        <li>运行安装程序，使用默认配置即可</li>
                      </ul>
                    </li>
                    <li>验证安装
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>node -v</code> # 应显示 v16.x 或更高版本<br/>
                        <code>npm -v</code> # 应显示 8.x 或更高版本<br/>
                        <code>git --version</code> # 确认 Git 安装成功
                      </div>
                    </li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">2. 项目部署</h4>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>克隆项目仓库
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>git clone https://github.com/Eclipse-01/dsa_ui.git</code>
                      </div>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>确保有足够的磁盘空间（建议预留 1GB 以上）</li>
                        <li>选择合适的目录路径（避免中文路径）</li>
                        <li>如果网络较慢可以使用镜像：<code>git config --global url."https://ghproxy.com/https://github.com".insteadOf "https://github.com"</code></li>
                      </ul>
                    </li>
                    <li>进入项目目录
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>cd dsa_ui</code>
                      </div>
                    </li>
                    <li>安装依赖
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>npm install</code>
                      </div>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>确保网络连接稳定</li>
                        <li>如遇安装慢，可使用以下命令切换镜像：</li>
                      </ul>
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>npm config set registry https://registry.npmmirror.com</code>
                      </div>
                    </li>
                    <li>构建项目
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>npm run build</code>
                      </div>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>构建过程可能需要几分钟</li>
                        <li>确保构建过程中无错误信息</li>
                        <li>检查 dist 目录是否生成</li>
                      </ul>
                    </li>
                    <li>启动服务
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>npm start</code>
                      </div>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>默认启动在 3000 端口</li>
                        <li>保持命令窗口开启状态</li>
                      </ul>
                    </li>
                    <li>验证部署
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>访问 <a href="http://localhost:3000" className="text-blue-500 hover:underline">http://localhost:3000</a></li>
                        <li>检查页面是否完整加载</li>
                        <li>验证基本功能是否正常</li>
                        <li>查看浏览器控制台是否有报错</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">3. 常见问题</h4>
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong>端口被占用:</strong> 
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>Windows: 在管理员命令行中运行 <code>netstat -ano | findstr 3000</code> 找到占用进程</li>
                        <li>Linux: 运行 <code>lsof -i :3000</code> 查看占用进程</li>
                        <li>使用任务管理器关闭占用端口的程序</li>
                      </ul>
                    </li>
                    <li><strong>npm install 失败:</strong>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>清除 npm 缓存: <code>npm cache clean --force</code></li>
                        <li>删除 node_modules 文件夹后重试</li>
                        <li>检查 Node.js 版本是否符合要求</li>
                        <li>尝试使用管理员权限运行</li>
                      </ul>
                    </li>
                    <li><strong>构建失败:</strong>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>确保所有依赖安装完整</li>
                        <li>检查磁盘空间是否充足</li>
                        <li>查看错误日志定位具体问题</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Linux 部署指南</h3>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">1. 环境配置</h4>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>安装 Node.js 和 npm
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -</code><br/>
                        <code>sudo apt-get install -y nodejs</code>
                      </div>
                    </li>
                    <li>安装 Git
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>sudo apt-get install git</code>
                      </div>
                    </li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-3">2. 项目部署</h4>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>克隆项目仓库
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>git clone https://github.com/Eclipse-01/dsa_ui.git</code>
                      </div>
                    </li>
                    <li>进入项目目录
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>cd dsa_ui</code>
                      </div>
                    </li>
                    <li>安装项目依赖
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>npm install</code>
                      </div>
                      <p className="mt-1 text-gray-600">如果速度较慢，可以使用以下命令切换到淘宝镜像源：</p>
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>npm config set registry https://registry.npmmirror.com</code>
                      </div>
                    </li>
                    <li>构建项目
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>npm run build</code>
                      </div>
                    </li>
                    <li>启动项目
                      <div className="bg-muted p-3 rounded mt-2">
                        <code>npm start</code>
                      </div>
                    </li>
                    <li>验证部署
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>在浏览器中访问 <a href="http://localhost:3000" className="text-blue-500 hover:underline">http://localhost:3000</a></li>
                        <li>确认页面正常显示，无报错信息</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}