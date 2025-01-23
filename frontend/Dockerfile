# 使用官方的 Node.js 运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 将 package.json 和 package-lock.json 复制到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目的所有文件到容器中
COPY . .

# 构建项目（将 React 应用打包为静态文件）
RUN npm run build

# 使用 Nginx 作为静态文件服务器
FROM nginx:stable-alpine

# 复制构建输出到 Nginx 的默认静态文件目录
COPY --from=0 /app/build /usr/share/nginx/html

# 暴露 Nginx 默认端口
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