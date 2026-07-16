FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./ .
COPY ./deployment/dev/.env ./.env
RUN npm run build

FROM nginx:1.25-alpine
WORKDIR /var/www/public
COPY ./deployment/dev/nginx.conf /etc/nginx/nginx.conf
COPY ./deployment/dev/cert.pem /etc/nginx/cert.pem
COPY ./deployment/dev/key.pem /etc/nginx/key.pem
COPY --from=builder /app/dist/ ./

EXPOSE 443
