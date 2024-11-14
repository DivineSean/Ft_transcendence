#!/bin/sh

envsubst '$REDIS_PORT $REDIS_PASSWORD $REDIS_MAXMEMORY' </usr/local/etc/redis/template.conf >/usr/local/etc/redis/redis.conf
rm /usr/local/etc/redis/template.conf

# Run the redis server
exec $@
