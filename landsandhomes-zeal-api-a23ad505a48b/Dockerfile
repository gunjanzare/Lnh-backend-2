# Use an official Node.js runtime as the base image
FROM node:lts-alpine3.19

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json, .npmrc, pnpm-workspace.yaml, and pnpm-lock.yaml to the working directory
COPY package*.json .npmrc .env ./


# Install the application dependencies
RUN npm install 

# Copy the rest of the application code to the working directory
COPY . .

# Pull the latest schema from the Prisma API and generate TypeScript types
RUN npm run schema:pull
RUN npm run schema:gen

# Expose the port that the application runs on
EXPOSE 81

# Define the command to run the application
CMD [ "npm", "run","start" ]