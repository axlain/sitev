# Imagen base: Apache + PHP 8.1
FROM php:8.1-apache

# Habilitar mod_rewrite y headers (útiles para .htaccess y CORS)
RUN a2enmod rewrite headers

# Permitir .htaccess en /var/www/html
RUN sed -ri 's/AllowOverride\s+None/AllowOverride All/i' /etc/apache2/apache2.conf

# Evitar warning de ServerName
RUN printf "\nServerName localhost\n" >> /etc/apache2/apache2.conf
