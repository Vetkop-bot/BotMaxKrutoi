#!/bin/sh
set -e

cd /var/www/html

mkdir -p \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache/data \
    storage/logs \
    bootstrap/cache

if ! su -s /bin/sh www -c "test -w storage/logs"; then
    chown -R www:www storage bootstrap/cache
    chmod -R ug+rwx storage bootstrap/cache
fi

# На свежем клоне vendor ещё нет — не падаем, пока не сделают composer install
if [ -f vendor/autoload.php ]; then
    if [ ! -L public/storage ] || [ ! -e public/storage ]; then
        rm -rf public/storage 2>/dev/null || true
        su -s /bin/sh www -c "php artisan storage:link --no-interaction" || php artisan storage:link --no-interaction || true
    fi
fi

exec "$@"
