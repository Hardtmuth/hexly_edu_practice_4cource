CREATE TABLE IF NOT EXISTS partners (
	partner_id     INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	company_name   VARCHAR(255) NOT NULL,
	inn            VARCHAR(12) NOT NULL UNIQUE,
	contact_email  VARCHAR(255) NOT NULL UNIQUE,
	phone 		     VARCHAR(20)  DEFAULT 'Not specified',
	address        TEXT DEFAULT 'Not specified',
	rating         NUMERIC(10, 2) CHECK (rating >= 1 AND rating <= 5) DEFAULT 3,
	created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
	product_id    INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	product_name  VARCHAR(255) NOT NULL,
	sku					  VARCHAR(20) NOT NULL UNIQUE,
	stock	        INT NOT NULL DEFAULT 0,
	price         NUMERIC(10, 2) NOT NULL,
	created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
	sale_id       INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	partner_id    INT NOT NULL REFERENCES partners(partner_id) ON DELETE CASCADE,
	product_id    INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
	quantity      INT NOT NULL CHECK (quantity > 0),
	sale_price    NUMERIC(10, 2) NOT NULL,
  total_amount  NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * sale_price) STORED,
	created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE VIEW sales_history AS
SELECT
    s.sale_id,
    s.created_at AS sale_date,
    pr.company_name AS partner_name,
    pr.inn AS partner_inn,
    p.product_name,
    p.sku,
    s.quantity,
    s.sale_price,
    s.total_amount
FROM sales s
INNER JOIN products p ON s.product_id = p.product_id
INNER JOIN partners pr ON s.partner_id = pr.partner_id;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_partners_updated_at
BEFORE UPDATE ON partners
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sales_updated_at
BEFORE UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
