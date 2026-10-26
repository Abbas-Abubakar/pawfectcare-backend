# PawfectCare Backend

REST API for PawfectCare, a platform for pet owners, veterinarians and animal shelters. Built with Node.js, Express and MongoDB, in JavaScript with ES modules. The client is in [pawfectcare-frontend](https://github.com/Abbas-Abubakar/pawfectcare-frontend).

> Hosted on a free tier, so the first request after an idle period can take up to a minute.

## Features

- **Auth:** registration with OTP email verification, login, logout, silent token refresh and password recovery. Access and refresh JWTs travel in httpOnly cookies.
- **Role-based access control** for pet owners, veterinarians and shelter admins
- **Pets** with photo upload, and **health records** (vaccination, deworming, allergy, checkup) with due-date reminders
- **Appointments:** vets publish availability slots; owners book, reschedule and cancel; vets confirm, reject and complete. Checks prevent double booking and booking past slots.
- **Medical records** with image attachments
- **Adoption:** listings and requests. Approving a request creates the pet in the adopter's account and rejects competing requests.
- Store and wishlist, blog and bookmarks, success stories, contact and volunteer messages, feedback
- **Notifications** and a daily reminder job
- **Typo-tolerant search** using MongoDB Atlas Search
- Pagination, request validation, rate limiting, input sanitization and centralized error handling
- A demo mode for portfolio deployments

## Tech stack

Node.js, Express, MongoDB with Mongoose, MongoDB Atlas Search, JWT (jsonwebtoken) with bcryptjs, express-validator, helmet, cors, express-rate-limit, multer with Cloudinary, nodemailer, node-cron.

## Getting started

**Prerequisites**
- Node.js 20 or newer (developed on 22)
- A MongoDB Atlas cluster. Search uses Atlas Search, so a local MongoDB won't run those queries.
- A Cloudinary account for image uploads
- SMTP credentials (Mailtrap works for development)

```bash
git clone https://github.com/Abbas-Abubakar/pawfectcare-backend.git
cd pawfectcare-backend
npm install
cp .env.example .env              # then fill in the values
npm run create-search-indexes     # one-time; indexes take a minute or two to become Active in Atlas
npm run seed -- --force           # sample data and demo accounts (see warning below)
npm run dev
```

The server runs at http://localhost:5000. Check `/api/health`.

**Seeding warning:** `npm run seed -- --force` wipes users, pets, health records, availability, appointments, products, blog posts and adoption listings before recreating them. Only run it against a database you are happy to reset. It refuses to run when `NODE_ENV=production`.

**Seeded accounts** (all use `Password123`; they are flagged as demo accounts, so password changes and deactivation are blocked)

| Role | Email |
|---|---|
| Pet Owner | owner1@pawfectcare.test, owner2@pawfectcare.test |
| Veterinarian | vet1@pawfectcare.test |
| Shelter Admin | shelter1@pawfectcare.test |

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string, including the database name |
| `JWT_ACCESS_SECRET` | yes | Secret for access tokens |
| `JWT_REFRESH_SECRET` | yes | Secret for refresh tokens (use a different value) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | yes | SMTP settings for OTP and reset emails |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | yes | Image storage |
| `EMAIL_FROM` | no | Sender name and address |
| `CLIENT_URL` | no | Frontend origin, used for CORS and email links. Default `http://localhost:5173` |
| `NODE_ENV` | no | `production` enables secure cookies |
| `PORT` | no | Default `5000` (hosts usually set this for you) |
| `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | no | Default `15m` and `7d` |
| `TRUST_PROXY_HOPS` | no | Number of reverse proxies in front of the app. Default 0 locally and 1 in production. |
| `DEMO_MODE` | no | See Demo mode below. Default `false`. |
| `SHELTER_ADDRESS`, `SHELTER_LAT`, `SHELTER_LNG`, `SHELTER_PHONE`, `SHELTER_EMAIL`, `SHELTER_HOURS` | no | Contact details served at `/api/contact-info` |

## API overview

Responses use `{ success, ... }`; errors use `{ success: false, message }`. List endpoints support `?page=` and `?limit=`. Authenticated routes read the session from cookies, so clients must send credentials.

| Base path | Covers | Access |
|---|---|---|
| `/api/auth` | register, verify-otp, resend-otp, login, logout, refresh, me, forgot-password, reset-password/:token | Public (`me` needs login) |
| `/api/users` | list vets; update profile, change password, deactivate account | Vets list public, rest needs login |
| `/api/pets` | pet CRUD with photo; nested health records; medical history | Owners (staff can read) |
| `/api/availability` | create, list and delete slots; open slots for a vet | Vets (open slots need login) |
| `/api/appointments` | book, list mine, reschedule, cancel, confirm, reject, complete; nested medical record | Owners and vets |
| `/api/vet/dashboard` | today's appointments, all appointments, assigned pets | Vets |
| `/api/products`, `/api/wishlist` | browse and search products; wishlist | Products public (writes: shelter admin), wishlist owners |
| `/api/blog`, `/api/bookmarks` | read and search articles; write articles; bookmarks | Read public, write vets and shelter admins, bookmarks any login |
| `/api/adoptions` | public browsing; shelter listing CRUD; apply, withdraw, approve and reject requests | Mixed |
| `/api/success-stories` | public gallery; create and delete | Read public, write shelter admins |
| `/api/contact`, `/api/contact-info` | submit a message; review messages; shelter contact details | Submit public, review shelter admins |
| `/api/notifications` | list, mark read, delete | Any login |
| `/api/feedback` | submit; list all | Submit any login, list vets and shelter admins |
| `/api/search?q=` | unified search across products, articles and adoptable pets | Public |
| `/api/health` | health check | Public |

## How it works

- **Sessions.** A 15-minute access token and a 7-day refresh token are stored in httpOnly cookies. The refresh cookie is scoped to `/api/auth/refresh`. Every request re-loads the user, so a deactivated account loses access immediately.
- **One-time secrets are hashed.** OTP codes (5-minute expiry) and password-reset tokens (15-minute expiry) are stored as hashes, never in plain text.
- **Soft deletes.** Pets, records, listings and similar data are flagged inactive instead of removed, so history stays intact.
- **Reminders.** A daily `node-cron` job notifies owners about due health records and next-day appointments. Sent markers stop repeat notifications and reset when a due date changes.
- **Booking safety.** Booking and rescheduling reject taken or past slots, and rescheduling frees the old slot.
- **Search.** Atlas Search `$search` with fuzzy matching and per-field boosting for products, articles and adoption listings; plain queries when there is no search term.
- **Proxy awareness.** `TRUST_PROXY_HOPS` is set to the number of proxies in front of the app so rate limiting sees real client IPs. Behind Vercel and Render it was measured as 4.

## Demo mode

Set `DEMO_MODE=true` for portfolio deployments where real email delivery isn't available. Registration and resend then skip sending email and return the OTP in the API response, and new accounts are limited to Pet Owners. **Never enable this for real users:** anyone can verify any address.

## Deployment

Deployed on Render (web service, Node runtime).

- Build command: `npm install`. Start command: `npm start`. Health check path: `/api/health`.
- Set `NODE_VERSION`, `NODE_ENV=production`, `TRUST_PROXY_HOPS`, and the required variables above.
- Atlas must allow Render's outbound IP ranges, listed on the service's Outbound tab. If Render changes them, database access fails until the allowlist is updated.
- On Render's free tier, outbound SMTP ports 25, 465 and 587 are blocked. Mailtrap's sandbox port, 2525, works.

## Known limitations

- Notifications are in-app only; there is no push or email reminder delivery
- The reminder job runs inside the server process, so on a hosting tier that sleeps it may not fire on time
- No checkout, and no admin UI for managing store products (the API supports it; the seed script provides the data)
- Image uploads only (JPEG, PNG, WEBP, up to 5 MB)
- No automated tests yet; CI is a smoke check
- No backup schedule beyond what the Atlas cluster provides

## About

Built from a software requirements specification for a pet care app. Developed with AI pair-programming assistance (Claude).
