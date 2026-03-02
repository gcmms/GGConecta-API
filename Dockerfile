FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY tsconfig*.json nest-cli.json .eslintrc.js .prettierrc ./
COPY src ./src

RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=base /usr/src/app/package*.json ./
RUN npm install --omit=dev --ignore-scripts
COPY --from=base /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
