FROM node as build-deps

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and install the dependencies
COPY package.json ./
RUN npm i

# Copy the application and build the webpack bundle
COPY . ./
RUN npm run build

# Copy the Webpack bundle and launch in Nginx
FROM node:alpine

COPY --from=build-deps /usr/src/app /app

EXPOSE 9000

CMD ["node", "/app/bin/www"]