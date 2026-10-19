## What changed


## Security checklist (SSDLC phase 3)
- [ ] No secrets, keys or real student data in this PR
- [ ] All new inputs validated with Zod (APS marks are integers 0-100)
- [ ] Any new table has RLS enabled and policies written in `/db`
- [ ] No `dangerouslySetInnerHTML` without sanitising
- [ ] Errors do not leak stack traces or SQL
- [ ] Reviewed by a second team member (not the author)

## How I tested it
