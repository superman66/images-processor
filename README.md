# Image Processor PNG 图片透明区域裁剪工具

自动移除 PNG 图片中多余的透明区域，支持批量处理

## Getting Started

First, run the development server:

```bash
pnpm dev
```

## Docker 部署

### 使用 Docker Compose（推荐）

1. 构建并启动容器：

```bash
docker-compose up -d
```

2. 访问应用：
打开浏览器访问 http://localhost:3000

3. 停止服务：

```bash
docker-compose down
```

### 手动使用 Docker

1. 构建镜像：

```bash
docker build -t image-processor .
```

2. 运行容器：

```bash
docker run -d -p 3000:3000 image-processor
```

3. 停止容器：

```bash
# 查看容器 ID
docker ps
# 停止容器
docker stop <container-id>
```

## 功能特点

- 支持单个或多个 PNG 图片上传
- 自动裁剪图片中的透明区域
- 多图片处理时自动打包为 ZIP
- 深色主题界面
- 拖拽上传支持
- 实时处理状态反馈
