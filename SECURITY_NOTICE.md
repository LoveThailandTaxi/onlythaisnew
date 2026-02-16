# Security Notice - Important Actions Required

## ⚠️ CRITICAL: API Keys Have Been Exposed

Your API keys were previously committed to version control and may have been exposed.

### Immediate Actions Required

**You MUST rotate these keys immediately:**

1. **PayPal Credentials**
   - Current Client ID: `AaqllI_xCaSNFX6QqNsvFhiW6DbtZKUadfrAGqPKY_dtDxwaIO_LOTH5PcH7TiIRhy21pBkJKLl0UkKW`
   - Go to: https://developer.paypal.com/dashboard/
   - Create new API credentials
   - Delete or revoke the exposed credentials
   - Update your `.env` file with new credentials

2. **Resend API Key**
   - Current Key: `re_G5c1LG18_6XbXiHMYKFTnyt2cNNkiu71M`
   - Go to: https://resend.com/api-keys
   - Revoke the exposed key
   - Generate a new API key
   - Update your `.env` file with the new key

3. **Supabase Keys**
   - URL: `https://cvuohthhyhfbrmmfbvba.supabase.co`
   - Anon Key is exposed
   - Go to: https://app.supabase.com/project/cvuohthhyhfbrmmfbvba/settings/api
   - Consider resetting your anon key (this will require updating all clients)
   - Ensure your RLS policies are secure

4. **PayPal Plan IDs**
   - Standard Plan: `P-7PU656235U2202130NGJMYOQ`
   - VIP Plan: `P-1L840324NP322151DNGJM5GQ`
   - These are exposed but less critical
   - Consider creating new billing plans if you suspect abuse

### What Was Fixed

✅ **Created `.env.example`** - Template file with placeholder values (safe to commit)

✅ **Added security warnings to `.env`** - Reminds developers to never commit this file

✅ **Removed `create-admin` edge function** - This function had hardcoded admin credentials:
   - Email: `ads@lovethailand.co`
   - Password: `Thailand2030@@@`
   - This account should be considered compromised

✅ **Verified `.gitignore`** - Confirms `.env` is excluded from version control

### Next Steps

1. **Immediately** rotate all exposed API keys using the links above

2. **Change admin credentials** if the `ads@lovethailand.co` account exists:
   - Go to Supabase Authentication dashboard
   - Reset the password for this account
   - Or delete it and create a new admin account using `ADMIN_SETUP.md` instructions

3. **Check your git history** - If you've pushed to a remote repository:
   ```bash
   # Check if .env was ever committed
   git log --all --full-history -- .env
   ```

   If it was committed, you should:
   - Use tools like `git-filter-repo` or BFG Repo-Cleaner to remove it from history
   - Force push the cleaned history
   - Still rotate all keys (anyone who cloned the repo has them)

4. **Set up environment variables properly**:
   - For local development: Keep values in `.env` (already in .gitignore)
   - For production deployment: Use your hosting platform's environment variable system
   - Never commit actual secrets to version control

5. **Review your repository**:
   - Check if the repo is public on GitHub/GitLab
   - If public, assume all keys are compromised
   - If private, still rotate keys as a precaution

### Prevention Going Forward

- ✅ `.env` is in `.gitignore` - verified
- ✅ `.env.example` created with placeholder values
- ✅ Security notices added to environment files
- ⚠️ Always double-check before committing: `git diff --staged`
- ⚠️ Use pre-commit hooks to scan for secrets
- ⚠️ Consider using tools like `git-secrets` or `trufflehog`

### Admin Account Security

The hardcoded admin credentials have been removed. To create admin accounts securely:

- Follow instructions in `ADMIN_SETUP.md`
- Never hardcode credentials in source code
- Use strong, unique passwords
- Enable 2FA when available

### Questions?

If you need help rotating keys or cleaning git history, please ask.

## Status

- [x] Security vulnerabilities identified
- [x] Insecure code removed
- [x] Documentation created
- [ ] **USER ACTION REQUIRED**: Rotate all exposed API keys
- [ ] **USER ACTION REQUIRED**: Update admin account credentials
- [ ] **USER ACTION REQUIRED**: Review git history and clean if necessary
