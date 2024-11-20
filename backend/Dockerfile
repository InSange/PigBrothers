# Python 3.12 이미지를 베이스로 사용
FROM python:3.12

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 파일들을 복사
COPY requirements.txt requirements.txt

# 패키지 설치
RUN pip install --no-cache-dir -r requirements.txt
Run pip install gunicorn
COPY . .

# Flask 애플리케이션 실행
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]