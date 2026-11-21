# Sonpur Dental Clinic — Appointment Booking MVP

A full-stack appointment booking starter for Sonpur Dental Clinic.

## Patient login is required for every new booking

- The public homepage and availability calendar remain viewable without login.
- Visiting `/book` redirects an unauthenticated visitor to patient login/registration.
- New appointments can only be created through `POST /api/patient/bookings` with a valid patient JWT.
- `POST /api/public/bookings` is disabled and returns HTTP 401.
- Patient name and phone are taken from the authenticated account on the server; the client cannot book under another name or mobile.
- Payment proof upload is also authenticated and must belong to the logged-in patient account.
- Patient registration accepts one 10-digit Indian mobile number per account. A database unique constraint and duplicate check prevent a second account for the same phone; duplicate registration returns HTTP 409 and asks the patient to log in.
- Existing older guest bookings with the same phone are linked when that patient first registers, so previous records are not discarded.


## Included in this version

- Public clinic homepage and Hindi/English interface. Appointment creation is restricted to authenticated patient accounts; public visitors can view clinic details and availability but must log in before booking.
- Patients can either select an admin-published time slot or enter their own preferred date and time (minute-level precision). Before booking, the system checks availability. If a time is occupied, it suggests 20 minutes later when free, otherwise the next available clinic-published slot; the patient must accept the suggestion. The backend rechecks availability during booking to prevent double-booking.
- Admin-configurable booking fee from **₹50 to ₹100**. The fee is saved with each booking, so later fee changes do not alter existing requests.
- Clinic QR image upload from the admin dashboard.
- Patients upload a payment screenshot and enter the UPI transaction/reference ID.
- Payment screenshots are stored in a private upload folder and can only be viewed through the authenticated admin endpoint.
- Admin manually approves or rejects payment proof. Only an approved payment can become a confirmed appointment.
- One active appointment can occupy each slot. A slot is released after rejection or cancellation.
- Admin can add and remove future availability slots, update public clinic details, and change the clinic name and logo.
- Patient can track a booking using its booking ID.
- Patient registration and login with a 10-digit mobile number and password. Passwords are stored as BCrypt hashes; patient sessions use signed JWTs separate from admin sessions.
- A patient dashboard lists appointments connected to the signed-in account, shows payment/confirmation progress, and keeps cancelled/rejected appointments in the history.
- A logged-in patient can cancel a future active appointment and must provide a reason. The cancelled slot is released; the admin appointment list displays the cancellation reason.
- Existing guest bookings with a matching mobile number are linked to the patient account when that mobile number registers.
- Admin dashboard includes registered patient accounts, patient-account-linked bookings, cancelled-appointment totals, and cancellation reasons.
- Patients can update their own name, mobile number, email address and password from **My account → Edit profile**. The current password is required; a new password is optional. Changing a mobile number updates the account-linked appointment records and returns a refreshed patient session.
- Admins can view registered patient accounts from **Admin → Patients**. Patient profile changes are made by the patient from their own account; the administrator can update only their own admin profile.
- Admins can update their own username, full name, email, phone and password from **Admin → Admin profile**. The current password is required for changes. Administrator credentials are stored as BCrypt hashes in the database.

## Technology

- Frontend: React 19, Vite 7, React Router
- Backend: Java 21, Spring Boot 3.5, Spring Data JPA
- Database: MySQL 8.4
- Local/container run: Docker Compose; `start.bat` first compiles the backend JAR in a Maven container, then builds the runtime image.

## Run on Windows (recommended)

1. Install and start **Docker Desktop**.
2. Extract this ZIP to a folder such as `D:\Projects\SonpurDentalClinic`.
3. Copy `.env.example` to `.env` (the included `start.bat` does this automatically the first time).
4. Open the `.env` file and change `ADMIN_PASSWORD`, `DB_ROOT_PASSWORD`, and `JWT_SECRET` before using the site beyond local testing. `JWT_SECRET` must remain Base64 text that decodes to at least 32 random bytes. To generate one in PowerShell, run:

   ```powershell
   [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
   ```

   Paste the result as the `JWT_SECRET` value.
5. Double-click `start.bat`, or open Command Prompt in this folder and run:

   ```bat
   docker compose up --build
   ```

6. Open the website:
   - Patient website: `http://localhost:8081`
   - Patient registration: `http://localhost:8081/register`
   - Patient login: `http://localhost:8081/login`
   - Patient dashboard: `http://localhost:8081/account`
   - Admin dashboard: `http://localhost:8081/admin`
   - Backend API check: `http://localhost:8080/api/public/settings`

Default local admin login for a new/empty database (change before real use):

- Username: the value of `ADMIN_USERNAME` in `.env` (default `admin`)
- Password: the value of `ADMIN_PASSWORD` in `.env` (default `ChangeMe@123`)

On first startup, these environment credentials create the first administrator record in `admin_accounts` and are stored as a BCrypt hash. After that, the database record is authoritative: changing `.env` does not overwrite an existing administrator account. Use **Admin profile** to change the account credentials.

To stop services, run `stop.bat` or `docker compose down`.

## First-time clinic setup

1. Sign in at `http://localhost:8081/admin`.
2. Open **Clinic settings**.
3. Enter the clinic's real address, contact phone, email and working hours.
4. Set the appointment booking fee to any whole amount from ₹50 through ₹100.
5. Upload the clinic's real UPI QR image. Test the QR with a small payment before sharing the website publicly.
6. Open **Availability** and add each date/time slot that the clinic can accept. Only published, unoccupied slots appear to patients.
7. Register a patient account with a unique mobile number, log in, then complete a test booking. Upload payment proof from the same signed-in account and approve it from the admin dashboard.

## Patient account and cancellation workflow

1. A new patient opens **Patient login** and chooses **Create an account**. Registration requires the patient's name, a valid 10-digit Indian mobile number and a password of at least 8 characters (up to 72 UTF-8 bytes). One mobile number can have only one account; a duplicate registration returns HTTP 409 and the patient must log in instead.
2. The patient logs in with the mobile number and password. The site stores a signed patient session token separately from the admin token. Visiting **Book appointment** without a valid login redirects the visitor to login/registration.
3. Previous legacy guest bookings with the same mobile number are attached to the new account during registration. All new bookings are created only through the patient-authenticated API and are attached to the signed-in account. The backend uses the account's saved name and phone as the appointment identity.
4. Payment proof is also restricted to the patient account that owns the appointment. The public payment-proof endpoint is disabled; a different patient's account cannot upload proof for another patient's booking.
5. The **My account** dashboard lists linked appointments, payment status, confirmation progress, booking fee, date/time and history.
6. A patient can cancel only a future appointment in `PENDING_PAYMENT`, `PAYMENT_SUBMITTED` or `CONFIRMED`. The patient must supply a cancellation reason. Past, rejected or already-cancelled appointments cannot be cancelled by the patient. The slot is released once the status changes to `CANCELLED`.
7. Admins can review registered patients under **Patients**, filter cancelled appointments under **Appointments**, and read the cancellation reason in the booking row. Refunds, where applicable, remain a manual clinic process.

Patient API endpoints:

- `POST /api/patient/auth/register` — `{ "fullName": "Patient Name", "phone": "9876543210", "password": "at-least-8-characters" }`
- `POST /api/patient/auth/login` — `{ "phone": "9876543210", "password": "your-password" }`
- `GET /api/patient/me` — signed-in patient's profile
- `PUT /api/patient/me` — update name, phone and email; `currentPassword` is required and `newPassword` is optional. Returns a refreshed patient token and profile.
- `GET /api/patient/appointments` — appointments belonging to that account
- `POST /api/patient/bookings` — create a booking linked to the signed-in patient (Bearer patient token required)
- `POST /api/patient/bookings/{bookingCode}/payment-proof` — upload payment proof for a booking owned by that patient (Bearer patient token required)
- `POST /api/public/bookings` and the public payment-proof POST are disabled and return HTTP 401
- `POST /api/patient/appointments/{id}/cancel` — `{ "reason": "Reason for cancelling" }`
- `GET /api/admin/patients` — registered patient list (admin token required)
- `GET /api/admin/me` — signed-in administrator profile
- `PUT /api/admin/me` — update admin username, name, email, phone and optional password; requires `currentPassword`, and returns a refreshed admin token
- `PUT /api/admin/patients/{id}` — admin edits a patient profile and may optionally set a new patient password

**Mobile-number verification limitation:** this selected mobile-number + password flow does not send an SMS OTP. A new account therefore does not prove that the registrant controls that phone number. Before using this login for real patient records, add OTP verification or another verified-phone activation step; do not treat the password alone as proof of mobile ownership.

The `patient_accounts` table, the patient email column, the `admin_accounts` table and the nullable appointment-to-patient relation are created/updated by Hibernate's existing `ddl-auto: update` setting. Existing appointment rows are retained; matching guest bookings are linked when a patient registers or changes their profile phone number.


## Profile management

Patient profile: sign in at `/login`, open **My account**, then choose **Edit profile**. The patient can update full name, mobile number and optional email, and may set a new password. The current password must be provided to save. When the mobile number changes, existing account-linked bookings are updated to the new phone and name.

Administrator profile: sign in at `/admin`, select **Admin profile** in the sidebar, and update username, full name, email, mobile number or password. The current password is required. The server returns a new admin token when the username/password is changed, and the browser stores the refreshed session.

Admin patient editing: open **Patients**, select **Edit** beside an account, update the patient's name/mobile/email, and optionally set a new password. Linked appointment contact details are synchronized. Patient passwords are never displayed to the admin; only a newly entered reset password is hashed and stored.

Profile APIs:
- `PUT /api/patient/me` — `{ "fullName": "Patient Name", "phone": "9876543210", "email": "patient@example.com", "currentPassword": "current-password", "newPassword": "optional-new-password" }`
- `PUT /api/admin/me` — `{ "username": "admin-new", "fullName": "Clinic Administrator", "email": "admin@example.com", "phone": "9876543210", "currentPassword": "current-password", "newPassword": "optional-new-password" }`
- `PUT /api/admin/patients/{id}` — `{ "fullName": "Patient Name", "phone": "9876543210", "email": "patient@example.com", "newPassword": null }`

## Important payment behaviour

This MVP does **not** automatically verify UPI transactions. A patient-submitted screenshot and UPI reference ID are only evidence for your review; they are not proof that money reached the clinic. Check the clinic's bank/UPI app independently before pressing **Approve & confirm**. Do not confirm an appointment based only on the screenshot.

A booking created but not yet paid stays in `PENDING_PAYMENT` and blocks its slot until an admin rejects or cancels it. This avoids two patients taking the same appointment time, but the clinic should review old unpaid requests and reject/cancel them to release the slot. Automatic payment timeouts, SMS/WhatsApp reminders and online gateway verification are not part of this first version.

## Data and uploaded images

Docker Compose uses named volumes:

- `sonpur_mysql_data`: database tables and bookings
- `sonpur_uploads`: clinic QR image and payment screenshots

`docker compose down` keeps the volumes. To intentionally delete all clinic data and all uploaded files, run `docker compose down -v` (this is destructive).

## Local development without Docker

Start a MySQL 8 database named `sonpur_clinic`, then:

Backend (from `backend/`):

```bat
set DB_URL=jdbc:mysql://localhost:3306/sonpur_clinic?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
set DB_USERNAME=root
set DB_PASSWORD=your_mysql_password
set ADMIN_USERNAME=admin
set ADMIN_PASSWORD=change-this-password
set JWT_SECRET=c29ucHVyLWNsaW5pYy1kZXZlbG9wbWVudC1zaWduaW5nLWtleS1jaGFuZ2UtbWU=
set JAVA_TOOL_OPTIONS=-Duser.timezone=Asia/Kolkata
mvn spring-boot:run
```

Frontend (from `frontend/` in another terminal):

```bat
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to `http://localhost:8080`.

## API summary

Public endpoints:
- `GET /api/public/settings`
- `GET /api/public/slots?date=YYYY-MM-DD`
- `GET /api/public/booking-time-suggestion?date=YYYY-MM-DD&time=HH:mm`
- `POST /api/public/bookings`
- `POST /api/public/bookings/{bookingCode}/payment-proof`
- `GET /api/public/bookings/{bookingCode}`
- `GET /api/public/qr`
- `GET /api/public/logo`

Admin endpoints require `Authorization: Bearer <token>` except login:
- `POST /api/admin/auth/login`
- `POST /api/admin/settings/logo`
- `GET /api/admin/summary`
- `GET /api/admin/bookings?status=ALL`
- `PUT /api/admin/bookings/{id}/status`
- `GET|POST /api/admin/slots`, `DELETE /api/admin/slots/{id}`
- `GET|PUT /api/admin/settings`
- `POST /api/admin/settings/qr`
- `GET /api/admin/bookings/{id}/payment-proof`

## Before real-world launch

This is a runnable MVP, not a completed production deployment. Before publishing it on a public domain, configure HTTPS, strong unique secrets, production database backups, rate limiting, monitoring, an admin password-change/rotation procedure and a privacy notice. The clinic should review applicable patient-data and record-retention requirements. Also verify all clinic contact details, fee policy, booking rules and the UPI QR account with the clinic owner.

## Recent website updates

- **Patient-selected appointment time:** Patients can either choose an open slot published by the admin or select **Choose my own time** to enter any preferred date and time. A custom request automatically creates the date/time slot in the database and locks it against another active booking. Custom requests remain subject to clinic availability and are not confirmed until the clinic approves them. Admin-published slots remain available as a separate choice.
- **Hindi and English:** The patient-facing website now opens in Hindi by default. The language switch in the top navigation toggles between Hindi and English, and the selection is remembered in that browser.
- **Clinic identity:** From **Admin → Clinic settings → Clinic name and logo**, the administrator can update the public clinic name and upload a JPG, PNG or WEBP logo (maximum 5 MB). The name/logo appear in the public header and footer; the logo is also used as the browser tab icon.

The logo filename is stored in the existing `clinic_settings` table and the image itself is stored in the existing uploads volume. On the next backend startup, Hibernate's configured `ddl-auto: update` adds the nullable logo column automatically. Existing appointments, QR images, payment screenshots and MySQL data are not intentionally deleted or reset by this update.


### Appointment conflict suggestions

When a patient selects a date and time that is already occupied, the booking page checks whether the same date/time 20 minutes later is available. If not, it searches the next 90 days of clinic-published slots for the next enabled, unoccupied option. The patient must explicitly accept the suggested time or choose another time. The booking API performs its own locked availability check, and if another patient books the time in the meantime, the page refreshes the suggestion instead of silently changing the appointment.


## Cloud deployment and Android APK

See [DEPLOYMENT_AND_ANDROID_GUIDE_HI.md](DEPLOYMENT_AND_ANDROID_GUIDE_HI.md). This project uses one central Render MySQL database and persistent upload storage so multiple phones share the same cloud data. Build the backend JAR with `build-backend-for-render.bat` before pushing to GitHub; create cloud services from `render.yaml`. Build the Android APK after the Render API URL is available by setting `frontend/.env.production` and running `build-apk.bat`.
