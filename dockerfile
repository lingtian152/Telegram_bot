# 第一阶段：Node.js 构建阶段
FROM node:22.10.0-slim AS build

# 设置工作目录
WORKDIR /app

# 安装依赖
RUN yarn install

# 第二阶段：创建运行环境
FROM python:3.10-alpine3.19


RUN apk add --no-cache ffmpeg

# 设置工作目录
WORKDIR /app

# 启动应用
CMD ["yarn", "start"]