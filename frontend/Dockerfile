# 1. 빌드 단계
FROM node:18-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 패키지 파일 복사 및 의존성 설치
COPY package.json package-lock.json ./
RUN npm ci

# 4. 소스 코드 복사
COPY . .

# 5. 환경 변수 설정 (필요한 경우)
# ENV NEXT_PUBLIC_API_URL=https://api.example.com

# 6. Next.js 애플리케이션 빌드
RUN npm run build

# 7. Production dependencies 설치
RUN npm prune --production

# 8. 런타임 단계
FROM node:18-alpine

# 9. 작업 디렉토리 설정
WORKDIR /app

# 10. 빌드된 파일 및 필요한 파일 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# 11. 포트 개방
EXPOSE 3000

# 12. 애플리케이션 실행
CMD ["node", "node_modules/.bin/next", "start"]
