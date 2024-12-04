"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ModeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // 处理登录逻辑
    router.push("/showdata/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-end">
          <ModeToggle />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-6">登录</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">密码</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" variant="default" className="w-full">
            登录
          </Button>
        </form>
      </Card>
    </div>
  );
}

