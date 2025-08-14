# syntax=docker/dockerfile:1

# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy package metadata and install dependencies. The optional copy of
# pnpm-lock.yaml enables deterministic builds if the lockfile exists.
COPY package.json ./
COPY pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the production version of the app
RUN pnpm build

# --- runtime stage ---
FROM nginx:1.25-alpine AS runtime
# Copy NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html
# Expose the HTTP port
EXPOSE 80
# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]