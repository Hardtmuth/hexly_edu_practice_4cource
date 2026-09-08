--функционал из задания: просмотра партнеров, редактирования их данных и вывода истории отгрузок

SELECT * FROM partners;

UPDATE partners
    SET contact_email = 'some@new-email.ru'
    WHERE partner_id = 3
    RETURNING partner_id, company_name, inn, contact_email, phone, address, rating, created_at, updated_at;

SELECT * FROM sales
	WHERE partner_id = 3
	ORDER BY sale_date DESC;