FROM	python:3.11.4-slim-buster as builder

# Set working directory
WORKDIR	/app/backend

# Prevents Python from buffering stdout and stderr
ENV		PYTHONUNBUFFERED 1

# Prevents Python from writing pyc files to disc
ENV 	PYTHONDONTWRITEBYTECODE 1

# Copy dependencies list
COPY	./backend/requirements.txt .

# Build wheel archives (for smaller image sizes and faster installation)
RUN		pip wheel --no-cache-dir --no-deps --wheel-dir /app/backend/wheels -r requirements.txt

FROM	python:3.11.4-slim-buster

# Make a separate dir for the app user
RUN		mkdir -p /home/app

# Create the app user and group
RUN		adduser --system --group app

WORKDIR	/home/app/

COPY	--from=builder /app/backend/wheels /wheels
COPY	--from=builder /app/backend/requirements.txt .

RUN		pip install --upgrade pip
RUN		pip install --no-cache /wheels/*

COPY	./backend/ .

RUN		chmod +x /home/app/entrypoint.sh
RUN		chown -R app:app /home/app/

USER	app
ENTRYPOINT ["bash", "./entrypoint.sh"]
CMD ["uvicorn", "backend.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "debug"]
