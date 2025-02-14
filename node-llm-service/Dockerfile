FROM node:18-alpine

WORKDIR /app

# Add build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

ENV OPENAI_API_KEY=""
EXPOSE 5002

# Explicitly set the entry point
CMD ["node", "src/app.js"]