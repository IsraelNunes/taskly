-- Integração Asaas: adiciona campos de gateway de pagamento

ALTER TABLE "users"
  ADD COLUMN "cpf" varchar(14),
  ADD COLUMN "asaas_customer_id" varchar(50);

ALTER TABLE "payments"
  ADD COLUMN "asaas_payment_id" varchar(50),
  ADD COLUMN "pix_qr_code" text,
  ADD COLUMN "pix_copia_cola" text;
