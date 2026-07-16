FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./ .
COPY ./deployment/prod/lsl/.env ./.env
RUN npm run build

FROM nginx:1.25-alpine
WORKDIR /var/www/public
COPY ./deployment/prod/lsl/nginx.conf /etc/nginx/nginx.conf
COPY ./deployment/prod/lsl/cert.pem /etc/nginx/cert.pem
COPY ./deployment/prod/lsl/key.pem /etc/nginx/key.pem
COPY --from=builder /app/dist/ ./

EXPOSE 443
