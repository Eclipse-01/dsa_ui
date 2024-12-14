import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"

export default function MySQLArticle() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4">MySQL 简介</h2>
          <p className="leading-relaxed text-foreground">
            MySQL 是一个开源的关系型数据库管理系统（RDBMS），由瑞典公司 MySQL AB 开发，目前属于 Oracle 公司。MySQL 是最流行的关系型数据库之一，广泛应用于各种应用场景，包括网站、数据仓库和商业应用。
          </p>
          <p className="leading-relaxed text-foreground">
            MySQL 以其高性能、高可靠性和易用性著称，支持多种存储引擎和多种编程语言接口。它的开源特性使得开发者可以自由地使用和修改 MySQL 代码，以满足特定需求。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4">MySQL 安装指南</h2>
          <h3 className="text-lg font-semibold mb-4">Windows 安装步骤</h3>
          <ol className="list-decimal list-inside space-y-2 leading-relaxed text-foreground">
            <li>访问 MySQL 官网下载 MySQL Installer</li>
            <li>运行安装程序，选择"Server only"或"Custom"安装类型</li>
            <li>按照安装向导完成配置</li>
            <li>记住设置的 root 密码</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Linux (Ubuntu) 安装步骤</h3>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto leading-relaxed text-foreground">
{`# 安装MySQL服务器
sudo apt update
sudo apt install mysql-server

# 配置安全设置
sudo mysql_secure_installation

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">配置远程访问</h3>
          <ol className="list-decimal list-inside space-y-2 mb-4 leading-relaxed text-foreground">
            <li>编辑MySQL配置文件 my.cnf</li>
            <li>将bind-address改为0.0.0.0</li>
            <li>创建可远程访问的数据库用户:</li>
          </ol>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-foreground">
{`CREATE USER 'username'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON database_name.* TO 'username'@'%';
FLUSH PRIVILEGES;`}
          </pre>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          注意：生产环境部署时，请设置复杂密码并限制远程访问IP，确保数据库安全。
        </AlertDescription>
      </Alert>
    </div>
  )
}
