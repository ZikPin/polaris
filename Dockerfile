# One image for Render (and for running the whole app locally with docker): the Angular build is served by Flask.
FROM node:24-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY angular.json tsconfig.json ./
COPY frontend frontend
RUN npm run build

FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend backend
COPY --from=frontend /app/dist/polaris/browser dist/polaris/browser
ENV APP_ENV=production
# The migrations run on every start, before the new version takes requests. Render sets PORT.
CMD ["sh", "-c", "flask --app backend.app db upgrade && exec gunicorn --workers 2 --bind 0.0.0.0:${PORT:-10000} 'backend.app:create_app()'"]
