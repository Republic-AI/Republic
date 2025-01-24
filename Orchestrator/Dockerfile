FROM node:18-alpine

# Install build dependencies
RUN apk update && \
    apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    gcc \
    git \
    libc6-compat

# Set Python as default
RUN ln -sf python3 /usr/bin/python

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with verbose logging to see errors
RUN npm install --verbose

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the service
CMD ["npm", "start"]