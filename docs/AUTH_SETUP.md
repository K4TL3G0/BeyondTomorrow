# Auth setup (Supabase)

Owner: Daniel. Dashboard wording changes over time; if a label differs, look nearby.

## 1. Email sign up
Authentication > Sign In / Providers (or Providers) > Email
- Enabled
- Confirm email: ON for real users
- Minimum password length: 8 or more (the login form already requires 8)
Authentication > Rate Limits: review the sign-up and sign-in limits.

Built-in email sending is heavily limited and may only deliver to your own team's
addresses. Check Supabase's current docs. For public sign-ups set up a custom SMTP
provider; for judges, pre-create a demo account with "Auto Confirm User" ticked.

## 2. URL configuration
Authentication > URL Configuration
- Site URL: your hosted address (use http://localhost:5173 until you deploy)
- Redirect URLs (allow list): http://localhost:5173/** and your hosted address with /**

## 3. Google sign-in
Google Cloud Console (new project is fine):
1. OAuth consent screen / Google Auth Platform: app name, support email, scopes email, profile, openid.
2. Credentials > Create credentials > OAuth client ID > Web application.
   - Authorised JavaScript origins: http://localhost:5173 and your hosted address
   - Authorised redirect URI: https://<your-project-ref>.supabase.co/auth/v1/callback
     (copy the exact Callback URL shown in Supabase > Authentication > Providers > Google)
3. Copy the Client ID and Client Secret.
4. Supabase > Authentication > Providers > Google: enable, paste both, save.
   The Client Secret lives ONLY there. Never put it in the repo, .env files or chat.
5. While the Google app is in "Testing" status only listed test users can sign in.
   Move it to "In production" before judging so judges' accounts work (check Google's current rules).

## 4. Admin role
Admin is a flag in app_metadata, set with the SQL in db/01_schema_and_rls.sql (section 9).
Always use the `returning` clause and confirm exactly one row changed. Admins must sign out and in again.

## 5. Test checklist
- [ ] Email sign up -> confirmation email -> sign in
- [ ] Wrong password shows an error, no crash
- [ ] Google sign in works on localhost and on the hosted site
- [ ] New user can read courses but not other students' rows (db/03_rls_tests.sql)
- [ ] Google and email accounts with the same address behave as you expect (Supabase may link them: check its identity-linking setting)
