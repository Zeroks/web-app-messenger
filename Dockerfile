FROM python:3.13-slim

RUN pip install poetry

WORKDIR /app

COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false && poetry install --no-root

COPY app.py .
COPY models/ ./models/
COPY schemas/ ./schemas/

EXPOSE 5000

CMD ["python", "app.py"]