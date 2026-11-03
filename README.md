# BLUE TEAM — Wat Ratchabophit

Responsive sports roster website built with HTML, CSS, vanilla JavaScript modules and Supabase.

## Run locally

Because this project uses JavaScript modules, open it through a local web server (not `file://`). From this folder run:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Demo mode

Open `admin.html` and choose **เข้าโหมดทดลอง**. Demo data is stored in this browser's `localStorage`; it is not shared with other devices and is not protected by real authentication. Do not use demo mode for real student data.

## Connect Supabase

1. Create a Supabase project.
2. In **SQL Editor**, run all of `supabase/schema.sql`.
3. In **Project Settings → API**, copy the Project URL and anon/publishable key.
4. Paste them into `js/config.js` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never use the `service_role` key in browser code.
5. In **Authentication → Users**, create an admin user with an email and a new strong password.
6. In SQL Editor, grant that account admin rights (replace the email):

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'your-admin-email@example.com';
```

7. Open `admin.html`, sign in with that email and password. Public visitors can read sports and roster; only users listed in `admin_users` can create, edit or delete records.

## Deploy

Push the folder to GitHub and deploy the repository with GitHub Pages, Netlify or Vercel as a static site. Keep `index.html` as the public entry page. If using GitHub Pages, choose the repository root as the publish directory.

## Important security notes

- Do not put admin passwords or Supabase `service_role` keys in frontend files.
- The key in `config.js` is the public anon/publishable key; database access is controlled by Row Level Security policies in `schema.sql`.
- Student names are personal data. Only publish information approved by the school and guardians where required. Keep private identifiers, phone numbers and sensitive details out of the public roster.
- Change any password that has been shared in chat or elsewhere; create a fresh admin credential directly in Supabase Auth.

## Current assumptions to review

- Football, table tennis, badminton and athletics are provisionally shown with all three school levels because no separate eligibility rule was supplied yet.
- The swimming age divisions are represented as `ม.1-ม.3` and `ม.4-ม.5`.
- Badminton singles/doubles and relay lineup positions are stored in the optional `event_label` field.
- Volleyball is represented as one combined `รวมทุกระดับ` division.


## v2 updates
- SVG favicon: `assets/icons/favicon.svg` (included in public and admin pages).
- Sport icons are inline SVG from `js/icons.js`; `sports.icon` now stores a symbol name, not an emoji.
- Public roster grade filter is generated from the selected sport `divisions` only.
- Admin athlete grade dropdown also follows the selected sport divisions.
- Old demo data may contain emoji icons; use the admin demo reset or clear localStorage `blue-team-demo-v1` to load updated seed sports.
