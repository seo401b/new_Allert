# Node.js 20을 기반으로 함
FROM node:20

# 앱을 넣을 작업 디렉토리
WORKDIR /usr/src/app

# 현재 폴더 모든 파일을 Docker 이미지 안으로 복사
COPY . .

# 의존성 설치
RUN npm install

# GCP Cloud Run이 사용할 포트
ENV PORT=8080
EXPOSE 8080

# 서버 실행 명령
CMD [ "node", "app.js" ]
