"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ModeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// 预设的管理员密码哈希值（JiangNan的SHA-256哈希值）
const ADMIN_PASSWORD_HASH = "c8f204e21aaf3cda702a0205266cca4e299fef365cec0e10f24a5ce0801f85df";
const ADMIN_USERNAME = "Administrator";

// 添加一个更兼容的SHA-256实现
async function sha256Compatible(message: string) {
  try {
    // 首先尝试使用 SubtleCrypto API
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    // 如果SubtleCrypto失败，直接比较密码（临时解决方案）
    // 注意：这只是一个临时的解决方案，实际生产环境应该使用更安全的方法
    console.warn('SHA-256 hashing failed, falling back to direct comparison');
    return message === 'JiangNan' ? ADMIN_PASSWORD_HASH : 'invalid';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  useEffect(() => {
    // 页面加载时检查localStorage中是否有保存的登录信息
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }

    // 检查设备尺寸
    const checkDeviceSize = () => {
      setIsSmallDevice(window.innerWidth < 768); // 设置768px作为临界点
    };

    // 初始检查
    checkDeviceSize();

    // 监听窗口大小变化
    window.addEventListener('resize', checkDeviceSize);

    // 清理监听器
    return () => window.removeEventListener('resize', checkDeviceSize);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (username !== ADMIN_USERNAME) {
      setError("用户名不正确");
      return;
    }

    // 使用新的兼容函数
    const passwordHash = await sha256Compatible(password);
    if (passwordHash !== ADMIN_PASSWORD_HASH) {
      setError("密码不正确");
      return;
    }

    // 如果选中了"记住密码"，则保存登录信息
    if (rememberMe) {
      localStorage.setItem("savedUsername", username);
      localStorage.setItem("savedPassword", password);
    } else {
      localStorage.removeItem("savedUsername");
      localStorage.removeItem("savedPassword");
    }

    // 根据设备尺寸跳转到不同页面
    if (isSmallDevice) {
      router.push("/mobile/navigation"); // 跳转到移动端导航页面
    } else {
      router.push("/showdata/dashboard"); // 跳转到桌面端仪表板
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-end">
          <ModeToggle />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-6">登录</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div>
            <Label htmlFor="username">用户名</Label>
            <Input 
              id="username" 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div>
            <Label htmlFor="password">密码</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="rememberMe" className="text-sm font-medium leading-none">
              记住密码
            </Label>
          </div>
          <Button type="submit" variant="default" className="w-full">
            登录
          </Button>
        </form>
      </Card>
    </div>
  );
}

