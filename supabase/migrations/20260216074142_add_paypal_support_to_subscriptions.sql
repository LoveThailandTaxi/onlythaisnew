/*
  # Add PayPal Support to Subscriptions

  1. Changes
    - Add `paypal_subscription_id` column to track PayPal recurring subscriptions
    - Add `paypal_order_id` column to track one-time PayPal payments
    - These fields are optional and will only be populated when using PayPal
    - Existing Stripe fields remain for backwards compatibility

  2. Notes
    - No data loss - just adding new columns
    - Allows supporting both Stripe and PayPal payment methods
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'paypal_subscription_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN paypal_subscription_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'paypal_order_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN paypal_order_id text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_subscription_id ON subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_order_id ON subscriptions(paypal_order_id);
