# Stage 1: Build the frontend React app
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Stage 2: Build and run the backend Express server
FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

# Copy backend source code
COPY backend ./

# Copy built frontend static files from Stage 1 into the backend container based on our frontend/dist path expectation
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose backend port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
