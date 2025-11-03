-- Add indexes for optimizing fee-related queries
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_student_term ON payments(student_id, term_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_class_term ON fee_structures(class_id, term_id);
CREATE INDEX IF NOT EXISTS idx_payments_date_student ON payments(payment_date, student_id);

-- Add constraint for payment amount validation
ALTER TABLE payments ADD CONSTRAINT check_payment_amount CHECK (amount > 0);

-- Add constraint for fee structure amount validation
ALTER TABLE fee_structures ADD CONSTRAINT check_fee_amount CHECK (amount > 0);

-- Add trigger for payment receipt generation
CREATE OR REPLACE FUNCTION trigger_generate_receipt()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate receipt for completed payments
  IF NEW.status = 'completed' AND 
     (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Receipt generation logic will be handled by the application
    -- This trigger just ensures the payment is valid
    IF NEW.amount <= 0 THEN
      RAISE EXCEPTION 'Payment amount must be greater than 0';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_receipt
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_receipt();