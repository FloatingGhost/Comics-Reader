FROM node:12.6.0 AS build

WORKDIR /usr/src/app

RUN mkdir /usr/src/app/static

# Run yarn install early to allow a quick
# rebuild if the package.json didn't change
COPY package.json yarn.lock ./
RUN yarn install --non-interactive && yarn cache clean

COPY src/ /usr/src/app/src/
COPY crafty.config.js /usr/src/app/crafty.config.js

RUN yarn crafty:build

FROM node:12.6.0

# Install extensions : zip, rar, imagick
RUN (sed -i "s/main/main contrib non-free/g" /etc/apt/sources.list) && \
    apt-get update && apt-get install -y \
		zip \
		unrar \
		imagemagick \
		ghostscript \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Symlink volume
VOLUME /comics
RUN ln -s /comics /usr/src/app/images

VOLUME /cache
RUN ln -s /cache /usr/src/app/cache

# Run yarn install early to allow a quick
# rebuild if the package.json didn't change
COPY package.json yarn.lock ./
RUN yarn install --production --non-interactive && yarn cache clean

# Copy files
COPY --from=build /usr/src/app/dist/ /usr/src/app/dist/
COPY crafty.config.js /usr/src/app/crafty.config.js
COPY pages/ /usr/src/app/pages/
COPY server/ /usr/src/app/server/
COPY src/ /usr/src/app/src/
COPY comics manifest.json next.config.js /usr/src/app/

RUN yarn build

EXPOSE 8080

# Generate final autoloader
CMD [ "yarn", "start" ]
