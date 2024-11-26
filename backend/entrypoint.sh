#!/bin/bash

# Generating static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Populate the Database with available Games
python manage.py add_games

# Run the uvicorn server
exec $@
