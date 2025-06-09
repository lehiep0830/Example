FROM node:20 AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies using the latest npm version
RUN npm install -g npm@latest && npm install

# Copy all application code
COPY . .

# Build TypeScript code to JavaScript
RUN npm run build

# Production stage
FROM node:20 AS production

# Set working directory
WORKDIR /app

# Copy built files and necessary configs from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install -g npm@latest && npm install --omit=dev && npm install ts-node @nestjs/cli

# Expose port 3000 for the NestJS app
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]