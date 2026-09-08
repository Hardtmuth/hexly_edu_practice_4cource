CREATE TABLE IF NOT EXISTS partners (
	partner_id         INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	company_name       VARCHAR(255) NOT NULL,
	inn                VARCHAR(12) NOT NULL UNIQUE,
	contact_email      VARCHAR(255) NOT NULL UNIQUE,
	phone 		         VARCHAR(20)  DEFAULT 'Not specified',
	address            TEXT DEFAULT 'Not specified',
	rating             NUMERIC(10, 2) CHECK (rating >= 1 AND rating <= 5) DEFAULT 3,
	created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
	sale_id      INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	partner_id   INT NOT NULL REFERENCES partners(partner_id) ON DELETE CASCADE,
	product_name VARCHAR(255) NOT NULL,
	sale_date    DATE NOT NULL,
	quantity     INT NOT NULL CHECK (quantity > 0),
	total_amount NUMERIC(10, 2) NOT NULL,
	created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
