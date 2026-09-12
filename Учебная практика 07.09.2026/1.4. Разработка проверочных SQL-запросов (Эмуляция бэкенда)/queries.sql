/*
1. Запрос для вывода списка партнеров с сортировкой по названию
и выводом общего количества сделанных ими доставок
(используйте LEFT JOIN и COUNT)
*/

SELECT
    p.partner_id,
    p.company_name,
    COUNT(s.sale_id) AS total_sales,
    p.rating,
    p.contact_email,
    p.phone,
    p.created_at
FROM partners p
LEFT JOIN sales s ON p.partner_id = s.partner_id
GROUP BY
    p.partner_id
ORDER BY
    p.company_name ASC;

/*
2. Запрос для добавления/обновления данных
демонстрация транзакции: создание нового партнера и запись о его первой тестовой доставке
в рамках одного блока BEGIN...COMMIT.
*/

BEGIN;
-- Обновление счетчиков после ручного импорта данных из CSV-файлов
SELECT setval(
    pg_get_serial_sequence('partners', 'partner_id'),
    COALESCE(MAX(partner_id), 1)
)
FROM partners;

SELECT setval(
    pg_get_serial_sequence('sales', 'sale_id'),
    COALESCE(MAX(sale_id), 1)
)
FROM sales;

-- Создание нового партнера
WITH new_partner AS (
    INSERT INTO partners (company_name, inn, contact_email, phone)
    VALUES ('ООО Сименс Мобайл', '7072203406', 'mobile@siemens.ru', '+79209209200')
    RETURNING partner_id
)
-- Запись о его первой тестовой доставке
INSERT INTO sales (partner_id, product_id, quantity, sale_price)
SELECT 
    np.partner_id,
    p.product_id,
    22 as quantity,
    p.price as sale_price
FROM products p
CROSS JOIN new_partner np
WHERE p.product_id = 1
RETURNING *;

COMMIT;

/*
3. Запрос для истории реализации:
вывод детальной истории отгрузок конкретного партнера
за указанный период
(с названиями продуктов, датами, объемами в штуках и итоговой суммой поставки).
*/

SELECT * FROM sales_history
WHERE partner_inn = '7072203406'
  AND sale_date BETWEEN '2026-01-01' AND '2026-12-31'
ORDER BY sale_date DESC;