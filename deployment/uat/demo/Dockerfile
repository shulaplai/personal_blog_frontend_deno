FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./ .
COPY ./deployment/uat/demo/.env ./.env
RUN npm run build

FROM nginx:1.25-alpine
WORKDIR /var/www/public
COPY ./deployment/uat/demo/nginx.conf /etc/nginx/nginx.conf
COPY ./deployment/uat/demo/cert.pem /etc/nginx/cert.pem
COPY ./deployment/uat/demo/key.pem /etc/nginx/key.pem
COPY --from=builder /app/dist/ ./

EXPOSE 443
