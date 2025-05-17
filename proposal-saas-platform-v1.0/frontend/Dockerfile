
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN echo "FROM nginx:alpine\nCOPY index.html /usr/share/nginx/html/index.html" > Dockerfile.run && sh -c "cat Dockerfile.run > Dockerfile"
RUN echo "$frontend_index" > index.html

FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
