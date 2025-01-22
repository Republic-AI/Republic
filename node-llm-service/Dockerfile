FROM node:18-alpine

WORKDIR /app
COPY . /app
RUN npm install

ENV OPENAI_API_KEY=""
EXPOSE 5002
CMD ["npm", "start"]