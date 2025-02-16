# Use Node.js 20
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install build dependencies, including Python, make, g++, and Linux headers
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    linux-headers \
    eudev-dev \
    libc6-compat

# Install npm packages, including node-gyp globally
RUN npm install --no-optional stream-http https-browserify buffer crypto-browserify react-app-rewired process stream-browserify browserify-zlib url

# Copy the rest of the application
COPY . .
COPY config-overrides.js .

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 