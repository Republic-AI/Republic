# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 设置生产环境变量
ENV NODE_ENV=production

# 构建静态文件
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 删除默认 Nginx 配置（可选）
RUN rm /etc/nginx/conf.d/default.conf

# 复制构建产物到 Nginx 默认路径
COPY --from=builder /app/build /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]


RUN apk add --no-cache python3 make g++





# FROM node:18-alpine as builder
# WORKDIR /app
# COPY . /app
# RUN npm install
# RUN npm run build

# FROM nginx:alpine
# COPY --from=builder /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"] 