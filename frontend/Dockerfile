# 1. 빌드 단계
FROM node:18-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 패키지 파일 복사
COPY package.json yarn.lock ./

# 4. 의존성 설치
RUN yarn install --frozen-lockfile

# 5. 소스 코드 복사
COPY . .

# 6. Next.js 애플리케이션 빌드
RUN yarn build

# 7. 프로덕션용 의존성만 남기기
RUN yarn install --production --frozen-lockfile

# 8. 런타임 단계
FROM node:18-alpine

# 9. 작업 디렉토리 설정
WORKDIR /app

# 10. 빌드 결과물 및 필요한 파일 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# 11. 포트 개방
EXPOSE 3000

# 12. 애플리케이션 실행
CMD ["yarn", "start"]
