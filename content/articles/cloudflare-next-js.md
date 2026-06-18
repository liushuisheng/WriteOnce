---
title: Cloudflare 部署 Next.js 教程（静态网站 + 全栈网站）
slug: cloudflare-next-js
status: published
updatedAt: 2026-06-17
category: 技术笔记
---

适合：

```txt
前端开发
Next.js开发
独立开发者
AI应用开发
```

目标：

```txt
1. 部署静态网站（Pages）
2. 部署全栈网站（Workers + OpenNext）
3. 配置自动化CI/CD
```

---

# 一、Cloudflare 两种部署模式

## 方案1：静态部署（Pages）

适用于：

```txt
官网
博客
文档站
落地页
工具站
作品集
```

架构：

```txt
Next.js
    ↓
npm run build
    ↓
out目录
    ↓
Cloudflare Pages
    ↓
pages.dev
```

特点：

```txt
无服务器
无SSR
无API
纯静态
```

---

## 方案2：全栈部署（Workers）

适用于：

```txt
登录系统
管理后台
AI应用
SaaS产品
支付系统
数据库系统
```

架构：

```txt
Next.js
    ↓
OpenNext
    ↓
Cloudflare Worker
    ↓
workers.dev
```

特点：

```txt
SSR
API Route
Middleware
Server Action
数据库
鉴权
```

---

# 二、静态网站部署

---

## 创建项目

```bash
npx create-next-app@latest next-pages-demo
```

---

## 修改 next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

---

## 配置说明

### output: "export"

作用：

```txt
Next.js
↓
生成纯静态网站
```

输出：

```txt
out/
├── index.html
├── about/index.html
└── _next
```

---

### images.unoptimized

关闭：

```txt
Next Image Optimization
```

因为：

```txt
Pages没有Node服务器
```

否则会报：

```txt
Image Optimization using the default loader is not compatible with export
```

---

## 本地测试

```bash
npm run build
```

生成：

```txt
out
```

预览：

```bash
npx serve out
```

---

## 推送GitHub

```bash
git init
git add .
git commit -m "init"

git branch -M main

git remote add origin 仓库地址

git push -u origin main
```

---

## Cloudflare Pages配置

Cloudflare后台：

```txt
Workers & Pages
↓
Create
↓
Pages
↓
Connect to Git
```

配置：

```txt
Build Command:
npm run build

Build Output:
out

Node Version:
22
```

---

## 部署成功

访问：

```txt
https://项目名.pages.dev
```

---

# 三、全栈网站部署

---

## 原理

Next.js默认：

```txt
Node.js Runtime
```

Cloudflare：

```txt
Worker Runtime
```

两者不兼容。

需要：

```txt
OpenNext
```

进行适配。

---

## OpenNext是什么

本质：

```txt
Runtime Adapter
```

不是编译源码。

流程：

```txt
Next源码
    ↓

next build

    ↓

.next

    ↓

OpenNext分析Manifest

    ↓

.open-next

    ↓

Worker入口
```

生成：

```txt
.open-next
├── worker.js
├── assets
├── cache
└── server-functions
```

---

## 创建项目

推荐：

```bash
npm create cloudflare@latest my-next-fullstack -- --framework=next --platform=workers
```

---

## 如果已有Next项目

安装：

```bash
npm install @opennextjs/cloudflare
npm install -D wrangler
```

---

## 修改next.config

删除：

```ts
output: "export"
```

改成：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

---

## package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && wrangler deploy"
  }
}
```

---

# 四、测试API

创建：

```txt
app/api/hello/route.ts
```

```ts
export async function GET() {
  return Response.json({
    message: "hello"
  });
}
```

访问：

```txt
/api/hello
```

返回：

```json
{
  "message": "hello"
}
```

---

# 五、Cloudflare Worker是什么

传统：

```txt
用户
 ↓
Nginx
 ↓
Node
 ↓
MySQL
```

Cloudflare：

```txt
用户
 ↓
Cloudflare Edge
 ↓
Worker
 ↓
数据库
```

Worker运行在：

```txt
V8 Isolate
```

不是：

```txt
Node服务器
```

优势：

```txt
启动快
成本低
全球节点
```

---

# 六、Windows部署踩坑总结

---

## 问题1

```txt
OpenNext is not fully compatible with Windows
```

原因：

```txt
官方推荐WSL
```

解决：

```txt
使用WSL
```

---

## 问题2

```txt
Could not find compiled Open Next config
```

原因：

```txt
build失败
```

检查：

```bash
ls .open-next
```

是否存在。

---

## 问题3

WSL里：

```txt
npm有
node没有
```

检查：

```bash
which node
which npm
```

---

安装Node：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

source ~/.bashrc

nvm install 22

nvm use 22
```

---

# 七、Wrangler登录

---

## 登录

```bash
npx wrangler login
```

验证：

```bash
npx wrangler whoami
```

---

## WSL OAuth问题

现象：

```txt
浏览器授权成功
终端无反应
```

检查：

```bash
ss -lntp | grep 8976
```

如果看到：

```txt
127.0.0.1:8976 LISTEN
```

说明：

```txt
OAuth回调服务正常
```

---

## 常见错误

```txt
Received query string parameter doesn't match the one sent
```

原因：

```txt
state校验失败
```

解决：

```bash
rm -rf ~/.config/.wrangler
rm -rf ~/.wrangler
```

重新登录。

---

# 八、部署

---

## 手动部署

```bash
npm run deploy
```

等价：

```bash
opennextjs-cloudflare build
wrangler deploy
```

---

## 部署成功

得到：

```txt
https://xxx.workers.dev
```

---

# 九、自动化部署（GitHub Actions）

---

## 创建目录

VSCode直接创建：

```txt
.github/workflows/deploy.yml
```

自动生成：

```txt
.github
└── workflows
    └── deploy.yml
```

---

## deploy.yml

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Deploy
        run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## 为什么用npm ci

开发：

```bash
npm install
```

CI/CD：

```bash
npm ci
```

特点：

```txt
更快
严格按照package-lock
不会修改lock文件
```

---

# 十、Cloudflare API Token

后台：

```txt
头像
↓
My Profile
↓
API Tokens
↓
Create Token
```

选择：

```txt
Edit Cloudflare Workers
```

模板。

---

GitHub配置：

```txt
Repository
↓
Settings
↓
Secrets and Variables
↓
Actions
↓
New Repository Secret
```

名称：

```txt
CLOUDFLARE_API_TOKEN
```

值：

```txt
Cloudflare Token
```

---

# 十一、最终推荐架构

对于 AI 全栈项目：

```txt
Next.js
+
OpenNext
+
Cloudflare Workers
+
D1(Database)
+
R2(Storage)
+
KV(Cache)
+
GitHub Actions
```

开发流程：

```txt
本地开发
    ↓
git push
    ↓
GitHub Actions
    ↓
OpenNext Build
    ↓
Wrangler Deploy
    ↓
Cloudflare Workers
    ↓
全球上线
```

这是目前独立开发者和 AI SaaS 项目非常主流的一套低成本全栈方案。
