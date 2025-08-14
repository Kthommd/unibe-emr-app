# syntax=docker/dockerfile:1

# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# --- runtime stage ---
FROM nginx:1.25-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
