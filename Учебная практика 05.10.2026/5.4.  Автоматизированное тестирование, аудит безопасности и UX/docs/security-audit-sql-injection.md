# Аудит безопасности SQL-запросов

**Дата проведения:** 08.10.2026  
**Проект:** Учебная практика — CRM-система управления партнёрами  
**Стек:** Node.js, Fastify, PostgreSQL (`node-postgres` / `pg`), React + Redux Toolkit  
**Проверяемые файлы:**
- `server/routes/partners/partners.service.js`
- `server/routes/products/products.service.js`

---

## 1. Цель аудита

Проверка всех динамических SQL-запросов к базе данных на соответствие требованию:
> Все динамические запросы к базе данных (особенно текстовый поиск на главной форме
> или сохранение полей карточки) должны быть параметризованы.
> Прямая конкатенация строк в SQL-запросах запрещена.

---

## 2. Методология

- Ручной анализ исходного кода каждого SQL-запроса.
- Проверка: использует ли запрос плейсхолдеры (`$1`, `$2`, ...) для передачи пользовательских данных.
- Проверка: отсутствует ли прямая конкатенация строк с пользовательским вводом в SQL-тексте.
- Проверка: корректна ли нумерация параметров (нет конфликтов между `$N` в разных частях запроса).
- Проверка: динамическая сборка SQL-текста (если есть) не включает пользовательские данные напрямую.

---

## 3. Результаты аудита

### 3.1. Файл `partners.service.js`

#### `getPartnerById(id)`

```sql
SELECT * FROM partners WHERE partner_id = $1
```

| Параметр | Источник | Плейсхолдер | Конкатенация |
|---|---|---|---|
| `id` | `request.params.id` (из URL) | `$1` | нет |

**Вердикт: ✅ Параметризован.**

---

#### `getPartners(page, limit, search)`

```js
if (search) {
  query = `SELECT * FROM partners
           WHERE name ILIKE $1 OR email ILIKE $1
           ORDER BY partner_id DESC LIMIT $2 OFFSET $3`
  countQuery = `SELECT COUNT(*) FROM partners
                WHERE name ILIKE $1 OR email ILIKE $1`
  params = [`%${search}%`, limit, offset]
  countParams = [`%${search}%`]
} else {
  query = `SELECT * FROM partners
           ORDER BY partner_id DESC LIMIT $1 OFFSET $2`
  countQuery = `SELECT COUNT(*) FROM partners`
  params = [limit, offset]
  countParams = []
}
```

| Параметр | Источник | Плейсхолдер | Конкатенация |
|---|---|---|---|
| `search` | `request.query.search` (текстовый поиск) | `$1` | нет |
| `limit` | `request.query.limit` (пагинация) | `$2` (с поиском) / `$1` (без) | нет |
| `offset` | вычисляется из `page` и `limit` | `$3` (с поиском) / `$2` (без) | нет |

**Динамическая сборка SQL:** условие `WHERE` включается/отключается на основе булевой проверки `if (search)`. Сама строка `WHERE name ILIKE $1 OR email ILIKE $1` — статична, пользовательские данные передаются только через плейсхолдер `$1`.

**Вердикт: ✅ Параметризован. Конкатенации пользовательского ввода нет.**

---

#### `createPartner(data)`

```sql
INSERT INTO partners (legal_form, partner_name, inn, email, phone, address, director_name, rating)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
```

| Параметр | Источник | Плейсхолдер | Конкатенация |
|---|---|---|---|
| `legal_form` | `request.body` | `$1` | нет |
| `partner_name` | `request.body` | `$2` | нет |
| `inn` | `request.body` | `$3` | нет |
| `email` | `request.body` | `$4` | нет |
| `phone` | `request.body` | `$5` | нет |
| `address` | `request.body` | `$6` | нет |
| `director_name` | `request.body` | `$7` | нет |
| `rating` | `request.body` | `$8` | нет |

**Вердикт: ✅ Параметризован.**

---

#### `updatePartner(partnerId, partnerData)`

```sql
UPDATE partners
SET
  legal_form   = COALESCE($1, legal_form),
  partner_name = COALESCE($2, partner_name),
  email        = COALESCE($3, email),
  phone        = COALESCE($4, phone),
  address     = COALESCE($5, address),
  rating       = COALESCE($6, rating),
  director_name = COALESCE($7, director_name),
  inn          = COALESCE($8, inn)
WHERE partner_id = $9
RETURNING *
```

| Параметр | Источник | Плейсхолдер | Конкатенация |
|---|---|---|---|
| `legal_form` | `request.body` | `$1` | нет |
| `partner_name` | `request.body` | `$2` | нет |
| `email` | `request.body` | `$3` | нет |
| `phone` | `request.body` | `$4` | нет |
| `address` | `request.body` | `$5` | нет |
| `rating` (нормализованный) | `request.body` | `$6` | нет |
| `director_name` | `request.body` | `$7` | нет |
| `inn` | `request.body` | `$8` | нет |
| `partnerId` | `request.params.id` (из URL) | `$9` | нет |

**Дополнительная защита:** перед сохранением вызывается `validatePartnerData()`, которая проверяет обязательные поля (`partner_name`, `email`, `inn`), тип и диапазон `rating`. Все ошибки валидации выбрасываются с `statusCode = 400` до выполнения SQL-запроса.

**Вердикт: ✅ Параметризован.**

---

#### `deletePartner(id)`

```sql
DELETE FROM partners WHERE partner_id = $1
```

| Параметр | Источник | Плейсхолдер | Конкатенация |
|---|---|---|---|
| `id` | `request.params.id` (из URL) | `$1` | нет |

**Вердикт: ✅ Параметризован.**

---

#### `getAllPartnersWithTotalQuantity()`

```sql
SELECT
  p.partner_id, p.legal_form, p.partner_name, p.director_name,
  p.inn, p.email, p.phone, p.address, p.rating,
  COALESCE(SUM(s.quantity), 0) AS total_quantity
FROM partners p
LEFT JOIN sales_history s ON p.partner_id = s.partner_id
GROUP BY p.partner_id, p.legal_form, p.partner_name, p.director_name,
         p.inn, p.email, p.phone, p.address, p.rating
ORDER BY p.inn
```

Параметров нет — статический запрос без пользовательского ввода.

**Вердикт: ✅ Безопасен (нет пользовательских параметров).**

---

#### `getSalesHistory(partnerId)`

```sql
SELECT
  s.sale_id, p.product_name, s.quantity,
  TO_CHAR(s.sale_date, 'DD.MM.YYYY') AS sale_date
FROM sales_history s
INNER JOIN products p ON s.product_id = p.product_id
WHERE s.partner_id = $1
ORDER BY s.sale_date DESC
```

| Параметр | Источник | Плейсхолдер | Конкатенация |
|---|---|---|---|
| `partnerId` | `request.params.partnerId` (из URL) | `$1` | нет |

**Вердикт: ✅ Параметризован.**

---

### 3.2. Файл `products.service.js`

#### `getProduct(productId)`

```sql
SELECT product_id, product_name, product_type_id, material_type_id
FROM products WHERE product_id = $1
```

| Параметр | Источник | Плейсхолдер | Конкатенация |
|---|---|---|---|
| `productId` | `request.params.id` / `request.body` | `$1` | нет |

**Вердикт: ✅ Параметризован.**

---

#### `getProducts()`

```sql
SELECT product_id, product_name, product_type_id, material_type_id FROM products
```

Параметров нет — статический запрос.

**Вердикт: ✅ Безопасен (нет пользовательских параметров).**

---

#### `getProductCoefficient(productTypeId)`

```sql
SELECT coefficient FROM product_types WHERE product_type_id = $1
```

| Параметр | Источник | Плейсхолдер | Конкатенация |
|---|---|---|---|
| `productTypeId` | `request.body` / аргумент функции | `$1` | нет |

**Вердикт: ✅ Параметризован.**

---

#### `getMaterialDefectPercent(materialTypeId)`

```sql
SELECT waste_percent FROM material_types WHERE material_type_id = $1
```

| Параметр | Источник | Плейсхолдер | Конкатенация |
|---|---|---|---|
| `materialTypeId` | `request.body` / аргумент функции | `$1` | нет |

**Вердикт: ✅ Параметризован.**

---

## 4. Сводная таблица

| № | Функция | Файл | Кол-во параметров | Параметризация | Конкатенация | Статус |
|---|---|---|---|---|---|---|
| 1 | `getPartnerById` | partners.service.js | 1 | `$1` | нет | ✅ |
| 2 | `getPartners` | partners.service.js | 3 (с поиском) / 2 (без) | `$1`–`$3` | нет | ✅ |
| 3 | `createPartner` | partners.service.js | 8 | `$1`–`$8` | нет | ✅ |
| 4 | `updatePartner` | partners.service.js | 9 | `$1`–`$9` | нет | ✅ |
| 5 | `deletePartner` | partners.service.js | 1 | `$1` | нет | ✅ |
| 6 | `getAllPartnersWithTotalQuantity` | partners.service.js | 0 | — | нет | ✅ |
| 7 | `getSalesHistory` | partners.service.js | 1 | `$1` | нет | ✅ |
| 8 | `getProduct` | products.service.js | 1 | `$1` | нет | ✅ |
| 9 | `getProducts` | products.service.js | 0 | — | нет | ✅ |
| 10 | `getProductCoefficient` | products.service.js | 1 | `$1` | нет | ✅ |
| 11 | `getMaterialDefectPercent` | products.service.js | 1 | `$1` | нет | ✅ |

**Всего проверено запросов: 11**  
**Запросов с параметризацией: 9** (из 9 динамических)  
**Статических запросов: 2**  
**Запросов с конкатенацией пользовательского ввода: 0**

---

## 5. Дополнительные меры безопасности

1. **Серверная валидация данных.** Функция `validatePartnerData()` проверяет все обязательные поля (`partner_name`, `email`, `inn`) и тип `rating` до выполнения SQL-запроса. Некорректные данные отбрасываются с кодом 400.

2. **Использование `COALESCE` при обновлении.** В `updatePartner` значения `null` не перезаписывают существующие данные в БД — вместо них сохраняется текущее значение колонки. Это предотвращает случайное обнуление полей.

3. **Динамическая сборка SQL безопасна.** В `getPartners` условие `WHERE` добавляется на основе булевой проверки, а не на основе пользовательских данных. Сам текст `WHERE name ILIKE $1 OR email ILIKE $1` — статичная строка.

4. **Параметризация `%search%`.** Поисковый термин оборачивается в `%${search}%` и передаётся как значение плейсхолдера, а не вставляется в SQL-текст. Даже если пользователь введёт `' OR 1=1 --`, это будет передано как литеральная строка, а не как SQL-код.

---

## 6. Заключение

Все 11 SQL-запросов в проекте параметризованы. Прямой конкатенации строк с пользовательским вводом в SQL-запросах не обнаружено. Динамическая сборка SQL-текста (в `getPartners`) не включает пользовательские данные — только статичные строки с плейсхолдерами.

Аудит пройден. Уязвимостей типа SQL Injection не выявлено.
