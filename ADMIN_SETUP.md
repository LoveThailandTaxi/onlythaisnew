# Admin Account Setup Instructions

## Security Notice

The insecure `create-admin` edge function has been removed for security reasons.
Follow these instructions to create admin accounts securely.

## Creating an Admin Account

### Step 1: Create a Regular Account

1. Sign up for a regular account through the application's normal registration flow
2. Note the email address you used

### Step 2: Promote User to Admin (Via Supabase Dashboard)

1. Go to your Supabase Dashboard: https://app.supabase.com/project/_/editor
2. Navigate to the SQL Editor
3. Run the following SQL query (replace with your email):

```sql
-- Update the user's profile to admin role
UPDATE profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- Verify the admin was created successfully
SELECT
  p.user_id,
  p.display_name,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.role = 'admin';
```

### Step 3: Verify Admin Access

1. Log in to the application with your admin account
2. Navigate to `/admin` to access the admin dashboard
3. Verify you can see admin controls

## Revoking Admin Access

To remove admin privileges from a user:

```sql
UPDATE profiles
SET role = NULL
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user-email@example.com'
);
```

## Security Best Practices

- Never commit admin credentials to version control
- Use strong, unique passwords for admin accounts
- Enable two-factor authentication when available
- Regularly audit admin accounts
- Remove admin access for users who no longer need it
- Keep admin account emails private and separate from public-facing accounts

## Audit Trail

Consider logging all admin actions by creating an audit log:

```sql
-- Create audit log table (optional but recommended)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id),
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```
