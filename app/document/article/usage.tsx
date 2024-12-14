import { Card, CardContent } from "@/components/ui/card"

export default function UsageArticle() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">功能介绍</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">实时监控</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>支持多设备数据同时监控</li>
                <li>数据可视化展示，包括折线图、仪表盘等</li>
                <li>自定义监控时间间隔</li>
                <li>异常数据高亮显示</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">数据管理</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>历史数据查询与导出</li>
                <li>数据过滤与筛选</li>
                <li>自定义数据报表生成</li>
                <li>数据备份与恢复</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">系统设置</h3>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>用户权限管理</li>
                <li>告警规则配置</li>
                <li>数据源连接管理</li>
                <li>系统参数调整</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">使用步骤</h2>
        <Card>
          <CardContent className="pt-6">
            <ol className="list-decimal pl-6 space-y-4 text-foreground">
              <li>
                登录系统
                <ul className="list-disc pl-6 mt-2 text-foreground">
                  <li>输入分配的用户名和密码</li>
                  <li>首次登录需要修改默认密码</li>
                </ul>
              </li>
              <li>
                配置数据源
                <ul className="list-disc pl-6 mt-2 text-foreground">
                  <li>进入系统设置页面</li>
                  <li>添加或修改数据源连接信息</li>
                  <li>测试连接是否成功</li>
                </ul>
              </li>
              <li>
                开始监控
                <ul className="list-disc pl-6 mt-2 text-foreground">
                  <li>选择需要监控的设备</li>
                  <li>设置监控参数</li>
                  <li>启动数据采集</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">常见问题</h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">数据显示异常</h3>
                <ul className="list-disc pl-6 mt-2 text-foreground">
                  <li>检查数据源连接是否正常</li>
                  <li>确认数据采集参数配置是否正确</li>
                  <li>查看系统日志了解详细错误信息</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground">系统响应缓慢</h3>
                <ul className="list-disc pl-6 mt-2 text-foreground">
                  <li>检查网络连接状态</li>
                  <li>适当调整数据采集频率</li>
                  <li>优化数据查询条件</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground">权限相关问题</h3>
                <ul className="list-disc pl-6 mt-2 text-foreground">
                  <li>确认当前用户权限级别</li>
                  <li>联系系统管理员调整权限</li>
                  <li>查看操作日志排查问题</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}