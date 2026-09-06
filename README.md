# ESTREVAL — City Archive

Отдельный дизайн для архива географии ролевой «Эстреваль».

## Содержимое
- `public/index.html` — сайт
- `public/style.css` — дизайн
- `public/script.js` — каталог, поиск и просмотр
- `public/admin.html` — админка
- `worker.js` — API для Cloudflare Workers + D1
- `schema.sql` — таблица публикаций
- `wrangler.jsonc` — конфигурация Cloudflare

## Установка
1. Создать D1 database.
2. Вставить её ID в `wrangler.jsonc`.
3. Выполнить `wrangler d1 execute estreval_archive --remote --file=schema.sql`.
4. Задать `ADMIN_PASSWORD` в secrets/vars.
5. Развернуть Worker.

Админка: `/admin.html`.
