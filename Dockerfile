# Dockerfile

# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# Using --frozen-lockfile for npm ci equivalent if applicable, or just npm install
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment variable for Node.js
ENV NODE_ENV production
# Set PORT environment variable - Next.js listens on this port
ENV PORT 4000

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# If you have a custom server, copy that too. e.g., COPY --from=builder /app/server.js ./server.js
# Copy node_modules from builder (only production dependencies if you pruned them)
# For Next.js, often running `npm install --omit=dev` in this stage is better
# or copying the entire node_modules and relying on Next.js's standalone output if used.
# For simplicity here, we'll copy all node_modules, but this can be optimized.
COPY --from=builder /app/node_modules ./node_modules


# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
# Using "next start" which respects the PORT environment variable
CMD ["npm", "start"] 