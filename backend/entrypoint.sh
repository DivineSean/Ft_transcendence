#!/bin/bash

# Generating static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Populate the Database with available Games
python manage.py add_games
python manage.py add_achievements

celery -A backend.celery:app worker --loglevel=debug &

# Run the uvicorn server
exec $@
