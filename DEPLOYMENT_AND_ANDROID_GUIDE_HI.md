# Sonpur Dental Clinic — Cloud Deployment + Android APK Guide

## Goal

Deploy one central clinic system so every phone, tablet, and computer uses the same cloud MySQL database and the same uploaded QR/logo/payment-proof files. The Android APK is a client of this cloud system; it does not create a separate database on each phone.

**Chosen deployment target:** Render (Singapore region), because this project already uses Docker and Render supports Docker services, private MySQL hosting with persistent disks, and static React hosting. The included `render.yaml` is a starting Blueprint.

## Important before going live

1. Do not run `docker compose down -v` on the current Windows installation.
2. Do not delete the existing local `sonpur_mysql_data` or `sonpur_uploads` volumes.
3. The new Render MySQL service starts empty. Existing local bookings, patient accounts, clinic settings, QR/logo files, and payment proofs do **not** automatically move to Render. Make a local backup with `backup-local-data.bat` first. Keep it private. Finish a database-and-upload restore before accepting real online bookings if those existing records must remain available.
4. Never commit `.env`, SQL backups, uploads, payment screenshots, admin passwords, or JWT secrets to GitHub.

## A. Prepare the source repository on Windows

1. Extract the ZIP and open CMD in the folder containing `render.yaml` and `start.bat`.
2. Run the local backup first, while the old local containers are running:

   ```cmd
   backup-local-data.bat
   ```

   It creates `backups\sonpur_clinic.sql` and `backups\sonpur_uploads.tar.gz`. These contain private patient and payment data; keep them off GitHub.

3. Build the JAR for Render (Render's backend Dockerfile copies this JAR):

   ```cmd
   build-backend-for-render.bat
   ```

   Confirm this file exists:

   ```text
   backend\target\sonpur-dental-clinic-api-1.0.0.jar
   ```

4. Create a **private** GitHub repository, for example `SonpurDentalClinic`, and push this project. Example commands:

   ```cmd
   git init
   git add .
   git status
   git commit -m "Prepare Sonpur Dental Clinic cloud deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/SonpurDentalClinic.git
   git push -u origin main
   ```

   Check `git status` before committing. `.env`, `backups`, and `frontend/.env.production` are ignored. The one generated backend JAR is intentionally included so the Render Docker runtime can copy it.

## B. Create cloud services on Render

1. Sign in to Render and choose **New → Blueprint**.
2. Connect the private GitHub repository and select its `main` branch. Render reads `render.yaml` and proposes three resources:
   - `sonpur-clinic-mysql` — private MySQL 8.4 with a persistent 10 GB disk.
   - `sonpur-clinic-api` — Spring Boot API with a persistent `/var/data` disk for uploads.
   - `sonpur-clinic-web` — public React static website.
3. During Blueprint setup, enter the secret values:
   - `MYSQL_ROOT_PASSWORD`: create a long random password.
   - `DB_PASSWORD`: enter **the exact same value** as `MYSQL_ROOT_PASSWORD`.
   - `ADMIN_PASSWORD`: strong first-admin password. The first admin is initialized only when the admin table is empty.
   - `APP_ALLOWED_ORIGINS`: after Render shows the frontend URL, use a comma-separated list with no spaces, for example `https://sonpur-clinic-web.onrender.com,https://localhost,capacitor://localhost`.
   - `VITE_API_BASE`: the public API URL, for example `https://sonpur-clinic-api.onrender.com`.
4. If Render assigns different `onrender.com` URLs, update `APP_ALLOWED_ORIGINS` on the API service and `VITE_API_BASE` on the static site to the actual URLs, then redeploy both services.
5. Keep the MySQL service **private**. Do not add a public database port or allow public internet access to port 3306.
6. Wait until API and website deployments are Live. Test:
   - Website: `https://YOUR-WEB-SERVICE.onrender.com`
   - API: `https://YOUR-API-SERVICE.onrender.com/api/public/settings` (should return clinic settings JSON)
7. The database and upload disks must remain attached at `/var/lib/mysql` and `/var/data`. Do not remove either disk when changing service settings.

### Render cost note

Render's current published pricing shows paid private services from about **US$7/month**, paid web services from about **US$7/month**, and persistent disks from about **US$0.25/GB/month**; a 1 CPU / 2 GB service is listed at about **US$25/month**. The Blueprint chooses 1 CPU / 2 GB for the Java API, a smaller MySQL private service, 10 GB database disk, 2 GB upload disk, and a free static site. Expect roughly **US$35/month before taxes/other usage**, depending on the exact current plan and storage. The API can be changed to a smaller plan to reduce cost, but 512 MB may be tight for a Java/Spring production process. Check the Render dashboard's final quote before creating paid services.

## C. Existing local records and file migration

The backup files are prepared locally, but they are **not yet restored** into Render. Do not assume the cloud database already contains the local bookings. A safe cutover needs a one-time import of `sonpur_clinic.sql` into the Render MySQL private service and extraction of `sonpur_uploads.tar.gz` into the API's `/var/data/uploads` disk. Because the database is private, perform that import through an authenticated private-network/Render shell or a temporary secured migration job; do not expose port 3306 to the public internet. Keep the local copy untouched until you verify appointment counts, patient accounts, QR/logo assets, and payment-proof files in the cloud.

## D. Build the Android APK after the cloud URL is live

The source already includes Capacitor 8.6.2 integration. It bundles the website into an Android app and points its API requests at the **same public cloud API**, so all phones share central data. Android build requirements are Node.js 22+, Android Studio, and an Android SDK (Capacitor 8 supports Android API 24+).

1. Open CMD in `frontend`:

   ```cmd
   cd frontend
   ```

2. Copy the example API URL file:

   ```cmd
   copy .env.android.example .env.production
   ```

3. Open `.env.production` and replace the placeholder with the real API URL from Render:

   ```text
   VITE_API_BASE=https://YOUR-ACTUAL-API.onrender.com
   ```

4. In CMD, go into the `frontend` folder and run the builder:

   ```cmd
   cd frontend
   build-apk.bat
   ```

   The script installs the Capacitor packages, builds the React web assets, creates the Android project if needed, syncs the web assets, and builds a debug APK.

5. The APK will be at:

   ```text
   frontend\android\app\build\outputs\apk\debug\app-debug.apk
   ```

6. Copy this APK to the clinic phones (USB, nearby share, or a private download page). On each phone, allow installation from the file manager/browser when Android asks. All users must have internet access and sign in to their own patient account; the admin can sign in on authorized devices.

For a Play Store/public release, create a **signed release APK or AAB** in Android Studio. Keep the signing keystore and passwords private and backed up. Do not distribute a debug APK as a public Play Store release.

## E. What synchronizes across phones?

When all devices use the Render website or APK and the same cloud services:

- New patient registrations and profiles are stored in one cloud MySQL database.
- Booking requests, selected times, payment statuses, cancellations, and admin updates are stored centrally.
- QR, logo, and uploaded payment-proof files are stored on the API's persistent disk.
- A change made from one phone is available to other phones when they refresh/reopen the relevant dashboard. This version does not implement push/live websocket updates, so it is shared cloud data rather than instant live push notifications.
- The APK requires internet access to reach the cloud. The app is not an offline clinic database.

## F. Production checklist

- [ ] Change all bootstrap/admin/database secrets.
- [ ] Keep MySQL private and its persistent disk attached.
- [ ] Keep the uploads persistent disk attached.
- [ ] Configure exact CORS origins for the Render website and Capacitor (`https://localhost`, `capacitor://localhost`).
- [ ] Restore and verify existing SQL data and uploads, if they are needed.
- [ ] Test one patient registration, duplicate-phone rejection, login, booking, payment proof, admin confirmation, cancellation, and profile updates.
- [ ] Test website and APK on at least two phones on different networks (mobile data and Wi-Fi).
- [ ] Set up periodic encrypted backups of MySQL and uploads; test restoring a backup.
- [ ] Create a signed release APK/AAB before public distribution.

## Useful links

- Render Blueprint: https://render.com/docs/blueprint-spec
- Render MySQL hosting: https://render.com/hosting/mysql
- Render MySQL deployment guide: https://render.com/docs/deploy-mysql
- Capacitor Android setup: https://capacitorjs.com/docs/android
- Capacitor environment setup: https://capacitorjs.com/docs/getting-started/environment-setup
