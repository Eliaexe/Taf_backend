FROM ghcr.io/puppeteer/puppeteer:23.1.0
# FROM ghcr.io/puppeteer/puppeteer-cluster:0.24.0

ENV PUPPETEER_SKIP_CHROMINUM_DOWLOAD=true  
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci 
COPY . .
CMD ["npm", "start"]