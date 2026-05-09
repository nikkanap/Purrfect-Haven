# Purrfect Haven

---

> **HEADS UP — DB SCHEMA UPDATED.** The schema has been bumped from v2 to v3. New tables added: `Welfare_Checks`, `welfare_check_photos`, `Post_Adoption_Updates`, `post_adoption_update_photos`, `Stories`, `story_photos`. The `Adoptions` table also got new columns. **You need to drop and remigrate the database before pulling will work.**
>
> ```bash
> mysql -u root -p -e "DROP DATABASE purrfect_haven;"
> cd server
> npm run migrate
> npm run seed
> ```
>
> Don't forget to re-promote your admin account afterwards.

---

## Quick Start

Run these in order:

- `git clone <repo-url>` — clone the repo
- `cd purrfect-haven/server && npm install` — install backend deps
- `cd ../app && npm install` — install frontend deps
- Create `server/.env` 
- `cd ../server && npm run migrate` — create the tables
- `npm run seed` — insert sample pets/species
- Drop the 11 sample pet photos into `server/uploads/pets/` (see [Sample Pet Photos](#sample-pet-photos))
- `npm run dev` — start backend on `http://localhost:3000`
- In a new terminal: `cd app && npm run dev` — start frontend on `http://localhost:5173`

## Becoming an Admin

After signing up through the UI:

- Open MySQL CLI or Workbench
- Run:
  ```sql
  USE purrfect_haven;
  UPDATE Users SET is_admin = 1 WHERE email = 'your@email.com';
  ```
- Log out and back in (the `is_admin` flag loads on login)
- You should now see "Admin" in the navbar

## Sample Pet Photos

The seed file references 11 photo filenames. Save these in `server/uploads/pets/`:

```
chico-1.jpg, chico-2.jpg
luna-1.jpg, luna-2.jpg
mochi-1.jpg, mochi-2.jpg
koko-1.jpg
cottonball-1.jpg, cottonball-2.jpg
bantay-1.jpg
nala-1.jpg
```

## Database Schema (v3)

### Core tables

- **`Species`** — lookup table (Dog, Cat, etc.)
- **`Users`** — accounts with `is_admin` flag (0 or 1)
- **`Pets`** — adoptable pets, has `is_adopted` flag
- **`pet_photos`** — multiple photos per pet

### Adoption flow tables

- **`Adoptions`** — full application + status timeline
  - Status enum: `pending` → `appointment_scheduled` → `under_review` → `approved` → `completed`
  - Or: any earlier state → `rejected`
- **`Welfare_Checks`** — Phase 4a, admin-requested post-adoption checks (status: `pending` / `completed`)
- **`welfare_check_photos`** — photos uploaded by adopter when responding to a welfare check
- **`Post_Adoption_Updates`** — Phase 4b, adopter's pet updates
- **`post_adoption_update_photos`** — photos per update
- **`Stories`** — featured adoption stories (status: `pending` / `submitted` / `published` / `rejected`)
- **`story_photos`** — photos per story

### Community + rescue tables

- **`Rescue_Reports`** — reports of strays/injured animals needing rescue
  - Status enum: `pending` → `in_progress` → `resolved` / `closed`
- **`rescue_report_photos`** — photos per rescue report
- **`Community_Posts`** — user posts wanting to rehome a pet
  - When approved by admin, auto-creates a `Pets` row via `created_pet_id`
- **`community_post_photos`** — photos per community post

### Re-running the schema

Important: `CREATE TABLE IF NOT EXISTS` won't update existing tables. To apply schema changes:

- Drop and remigrate (loses data):
  ```bash
  mysql -u root -p -e "DROP DATABASE purrfect_haven;"
  cd server
  npm run migrate
  npm run seed
  ```
- Or write an `ALTER TABLE` patch in MySQL directly (preserves data, recommended mid-development)

---

## API Endpoints

All endpoints prefixed with `/api`. Auth is **session-based** (cookie `connect.sid`).

### Auth — `/api/auth`

- `POST /signup` — create account, returns user
- `POST /login` — log in, sets session cookie, returns user with `is_admin`
- `POST /logout` — destroys session

### Users — `/api/users` (auth required)

- `GET /profile` — current user's profile
- `PUT /profile` — update profile fields (only sends changed fields)

### Pets — `/api/pets`

- `GET /` — list available pets
  - Optional filters: `species`, `breed`, `age`, `location`
- `GET /adopted` — list already-adopted pets
- `GET /species` — list all species (for dropdowns)
- `GET /:id` — single pet with photos
- `POST /` — create pet with photos in one multipart request (admin only)
- `PUT /:id` — update pet details (admin only)
- `DELETE /:id` — delete pet, refuses if active applications exist (admin only)
- `POST /:pet_id/photos` — add more photos to existing pet (admin only)
- `DELETE /photos/:photo_id` — remove a single photo (admin only)

### Adoptions — `/api/adoptions`

- `POST /` — submit application (auth required)
- `GET /me` — current user's applications (auth required)
- `GET /` — all applications with applicant info (admin only)
- `PUT /:id/status` — update status (admin only)
  - Validates transitions — can't go `rejected` → `approved`
  - When status hits `completed`, auto-flips Pet's `is_adopted` to 1
  - Accepts `appointment_date` for Phase 0 scheduling
- `POST /:id/welfare-checks` — admin requests a welfare check (admin only)
- `GET /:id/welfare-checks` — list welfare checks for an adoption (auth required)
- `POST /:id/updates` — share a post-adoption update (auth required)
- `GET /:id/updates` — list updates for an adoption (auth required)

### Welfare Checks — `/api/welfare-checks` (auth required)

- `GET /pending` — current user's pending welfare checks
- `PUT /:id/respond` — adopter responds with condition + notes + photos (multipart)

### Stories — `/api/stories`

- `GET /featured` — public, latest published story for homepage
- `GET /me` — current user's stories (auth required)
- `POST /request` — admin requests adopter to write a story (admin only)
- `PUT /:id/submit` — adopter submits requested story with photos (auth required)
- `POST /initiate` — adopter writes own story proactively (auth required, multipart)
- `POST /admin-create` — admin authors and auto-publishes a story (admin only, multipart)
- `PUT /:id/review` — admin publishes or rejects a submitted story (admin only)
- `PUT /:id/unpublish` — admin removes a published story (admin only)

### Health

- `GET /api/health` — DB ping, returns 200 if reachable

---

## Adoption Status Flow

How an application moves through the system:

- **`pending`** — just submitted, awaiting admin review
- **`appointment_scheduled`** — admin set a date for applicant to meet the pet
- **`under_review`** — appointment done, admin is deciding
- **`approved`** — admin said yes
- **`rejected`** — admin said no (final state)
- **`completed`** — pet has been claimed, adoption is official (final state)

### Allowed transitions

- `pending` → any of: `appointment_scheduled`, `under_review`, `approved`, `rejected`
- `appointment_scheduled` → any of: `under_review`, `approved`, `rejected`
- `under_review` → `approved` or `rejected`
- `approved` → `completed` or `rejected` (rejected allowed for "undo")
- `rejected` → nowhere (final)
- `completed` → nowhere (final)

---

## Sample Postman Payloads

### Sign up

```json
POST /api/auth/signup
{
  "first_name": "Jolyne",
  "last_name":  "Cujoh",
  "city":       "Orlando",
  "email":      "jcujoh@email.com",
  "cell_num":   "09171234567",
  "password":   "securepass123"
}
```

### Log in

```json
POST /api/auth/login
{
  "email":    "jcujoh@email.com",
  "password": "securepass123"
}
```

### Submit adoption

```json
POST /api/adoptions
{
  "pet_id": 1,
  "applicant_address": "Downtown Tacloban",
  "is_first_pet": true,
  "has_experience": false,
  "has_other_pets": false,
  "has_children": false,
  "owns_home": true,
  "financial_capability": "Stable income",
  "motivation": "I love cats."
}
```

### Approve an adoption (admin)

```json
PUT /api/adoptions/5/status
{
  "status": "approved",
  "decision_note": "Welcome to the family!"
}
```

### Schedule appointment (admin)

```json
PUT /api/adoptions/5/status
{
  "status": "appointment_scheduled",
  "appointment_date": "2026-04-15 14:00:00"
}
```

### Filter pets

- `GET /api/pets?species=dog`
- `GET /api/pets?breed=aspin`
- `GET /api/pets?location=tacloban`
- `GET /api/pets?species=cat&age=2`

---

## Implementation Status

### Done

- ~~User signup, login, logout, profile management~~
- ~~Pet listing with filters~~
- ~~Pet detail view with photos~~
- ~~Adoption application submission (Phase 1)~~
- ~~Admin role + middleware (`requireAdmin`)~~
- ~~Admin route protection on frontend (`AdminRoute`)~~
- ~~Admin dashboard fetching real adoption data~~
- ~~Collapsible cards, status filters, badges~~
- ~~Approve/reject with decision note (Phase 3)~~
- ~~Status transition validation~~
- ~~Adopter profile dashboard with status badges (Phase 2 view)~~
- ~~Phase 0 — appointment scheduling with date picker~~
- ~~Phase 4a — welfare checks (admin-requested, adopter-fulfilled with photos)~~
- ~~Phase 4b — post-adoption updates from adopter~~
- ~~Featured Story system — three flows (admin-requested, adopter-initiated, admin-authored) with photos~~
- ~~Click-to-view story modal on profile~~
- ~~Pet creation, edit, and delete (admin only) — Add Pet button + hover Edit/Delete on cards~~
- ~~Photo uploads working across welfare checks, stories, and pets (multer + disk storage)~~
- ~~Reusable PhotoUploader component~~
- ~~Themed ConfirmModal + Toast (replaced native confirm/alert)~~
- ~~Existing backend for community posts~~

### Partially done

- Rescue reports — frontend and backend updated, photo uploading feature to follow. Also, fixed some styles issues by refactoring into components. 
Added routing to report/:id as well (this route should have a protect mechanism to be added). Then addid a rescue report receipt page. **NOTE:** adoption 
page reroutes to /profile showing the adoptions -- could be changed to receipt as well for uniformity. Also rescue report data should render on /profile.

### Not started

- Email notifications (UI says it does, nothing actually sends)
- Rescue report admin view
- Persistent session storage (sessions wipe on server restart — accepted dev papercut)
- Account settings password change endpoint (UI exists, no endpoint)

---

## Before You Contribute

### 1. Pull and reinstall

- `git pull`
- `cd server && npm install`
- `cd ../app && npm install`

If `package.json` changed, you need fresh `node_modules`.

### 2. Re-sync your schema

**If you're pulling for the first time after the v2 → v3 bump, just drop and remigrate** — there's too much that changed for a clean ALTER patch.

```bash
mysql -u root -p -e "DROP DATABASE purrfect_haven;"
cd server
npm run migrate
npm run seed
```

For smaller mid-development changes, check if columns are missing:

- `DESCRIBE Users;` — should have `is_admin`
- `DESCRIBE Adoptions;` — should have `status`, `motivation`, `has_experience`, `appointment_date`, `decision_note`, etc.
- `SHOW TABLES;` — should include `Welfare_Checks`, `Post_Adoption_Updates`, `Stories`, plus their photo tables

If missing, drop and remigrate, or write an `ALTER TABLE` patch and share it with the team.

### 3. Pick something to work on

Recommended order (smallest first):

- **Community posts backend** — mirrors the adoption pattern almost exactly
- **Rescue reports backend** — same shape as community posts

- **Welfare checks** — new feature, fairly self-contained
- **Pet creation + photo upload** — multer involved, more complex
- **Rescue report admin view** — once the backend exists, mirror the AdminPage adoption tab
- **Email notifications** — would replace the "we'll notify you via email" placeholder text everywhere
- **Persistent session storage** — swap in `express-mysql-session` so sessions survive server restarts

Something to work on (low priority)
- Frontend styles fix to /profile
- Clean up on redundant CSS files
- Component creation for redundant lines of code that could be converted to components
- Featured story recco:
  - Random featured story showing based on DB query instead of just "Henhen" entry
