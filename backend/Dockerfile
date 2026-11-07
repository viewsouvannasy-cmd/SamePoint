FROM node:24-alpine as base 
WORKDIR /app
COPY package.json package-lock.json ./  


# ---------- development ----------
FROM base AS development
ENV NODE_ENV=development
RUN npm ic 
COPY  . .
EXPOSE 4000

# ---------- build ----------
FROM base AS build 
RUN npm ci 
COPY . . 
RUN npm run build 


# ---------- production ----------
FROM base AS production 
ENV NODE_ENV=production
RUN npm ci --omit=dev 
COPY --from=build /app/dist ./dist 
EXPOSE 4000