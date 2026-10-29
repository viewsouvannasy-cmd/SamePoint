FROM node:24-alpine as base
WORKDIR /app 
COPY package.json package-lock.json ./ 

# dev
FROM base as development
ENV NODE_ENV=development
RUN npm ic 
COPY . .
EXPOSE 4000 

# build
FROM base as build 
RUN npm ic 
COPY . .
RUN npm run build 

# prod
FROM base as production 
ENV NODE_ENV=production 
RUN npm ic --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4000