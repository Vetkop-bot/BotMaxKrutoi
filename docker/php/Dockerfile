FROM php:8.4-fpm-bookworm

# Опциональное зеркало apt. Пример: --build-arg APT_MIRROR=mirror.yandex.ru
# По умолчанию — официальные репозитории Debian (deb.debian.org).
ARG APT_MIRROR=

RUN set -eux; \
    if [ -n "${APT_MIRROR}" ]; then \
      for f in /etc/apt/sources.list /etc/apt/sources.list.d/debian.sources /etc/apt/sources.list.d/*.list; do \
        [ -f "$f" ] || continue; \
        sed -i \
          -e "s|deb.debian.org/debian-security|${APT_MIRROR}/debian-security|g" \
          -e "s|security.debian.org/debian-security|${APT_MIRROR}/debian-security|g" \
          -e "s|deb.debian.org/debian|${APT_MIRROR}/debian|g" \
          "$f"; \
      done; \
    fi; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        git \
        unzip \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        libicu-dev \
        libpq-dev \
        libzip-dev \
        $PHPIZE_DEPS; \
    docker-php-ext-configure gd --with-freetype --with-jpeg; \
    docker-php-ext-install -j"$(nproc)" gd intl zip pgsql pdo_pgsql exif sockets; \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false $PHPIZE_DEPS; \
    rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN groupadd -g 1000 www 2>/dev/null || true \
    && useradd -u 1000 -ms /bin/bash -g www www 2>/dev/null || true

COPY zz-pool.conf /usr/local/etc/php-fpm.d/zz-pool.conf
COPY zz-uploads.ini /usr/local/etc/php/conf.d/zz-uploads.ini
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm", "-F"]
