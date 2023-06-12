FROM node:lts-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm install pnpm -g


RUN npm run build


EXPOSE 3002

CMD ["pnpm", "run", "preview"]
