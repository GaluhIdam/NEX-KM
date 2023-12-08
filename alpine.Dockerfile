# FROM alpine
FROM node:18.12.0-alpine as node
WORKDIR /app
COPY . .

# Remove lock files
RUN rm -f *lock*

# Install dependencies using Yarn
RUN yarn

# Build the Angular app
RUN npm run build --prod

FROM nginx:stable-alpine3.17
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=node /app/dist/nex-fe /usr/share/nginx/html
