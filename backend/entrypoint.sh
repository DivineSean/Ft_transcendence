#!/bin/bash

# Generating static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Run the uvicorn server
exec uvicorn backend.asgi:application --host 0.0.0.0 --port 8000 --reload --log-level debug
