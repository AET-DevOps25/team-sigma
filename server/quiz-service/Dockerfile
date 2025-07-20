FROM python:3.13-alpine

WORKDIR /app
COPY .python-version document_service_client.py genai_client.py main.py models.py pyproject.toml uv.lock .
RUN --mount=from=ghcr.io/astral-sh/uv:0.8.0,source=/uv,target=/bin/uv \
    uv sync --frozen --no-cache --no-dev

CMD ["/app/.venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
