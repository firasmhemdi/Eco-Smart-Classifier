FROM node:22-alpine AS frontend-build

WORKDIR /frontend

COPY eco-smart-frontend/package*.json ./
RUN npm ci

COPY eco-smart-frontend/ ./
ARG REACT_APP_API_URL=
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY models ./models
COPY --from=frontend-build /frontend/build ./static

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:%s/health' % os.getenv('PORT', '8000'), timeout=3)"

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
