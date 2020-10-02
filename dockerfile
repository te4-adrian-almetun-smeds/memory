FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
ENV PORT 8080
