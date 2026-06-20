# Offline Setup Guide: Site Manager Infrastructure Management

This guide explains how to set up and run the **Site Manager** application on an offline PC (a computer without an internet connection).

---

## 1. Prerequisites

Before copying the application to your offline PC, make sure you have the following installed on it:
1. **Node.js** (v20 or newer).
2. **MySQL Database Server** (v8.0 or newer).

> [!NOTE]
> Because the destination PC is offline, you must ensure Node.js and MySQL installers are downloaded on an online computer and transferred via USB/external storage.

---

## 2. Transferring the Project & Dependencies

Since `npm install` requires an internet connection to download packages:
1. Run `npm install` on an **online PC** first in this project directory.
2. Copy the entire project folder (including the `node_modules` directory) to a USB drive.
3. Transfer the project folder from the USB drive to the **offline PC**.

---

## 3. Configuration (.env)

Create a file named `.env` in the root of the project folder on your offline PC and specify your local database credentials:

```env
# ── Database ───────────────────────────────────────────────────
DATABASE_URL=mysql://<db_user>:<db_password>@localhost:3306/<db_name>

# ── Backend ─────────────────────────────────────────────────────
# Note: Offline mode uses local fallbacks for encryption/JWT signing.
# You can leave these blank or set custom static strings:
APP_ID=sitemanager-local-app
APP_SECRET=local-development-secret-key-for-sitemanager-app-12345
```

Replace `<db_user>`, `<db_password>`, and `<db_name>` with your MySQL database details. Make sure you create the database in MySQL first (e.g., `CREATE DATABASE sitemanager;`).

---

## 4. Initializing the Database & Seeding

Open a command prompt or terminal in the project directory on your offline PC and run:

1. **Push the database schema**:
   ```bash
   npm run db:push
   ```
   *This will automatically create all the required tables in your local MySQL database.*

2. **Seed the database with default infrastructure data and the admin user**:
   ```bash
   npm run db:seed
   ```
   *This inserts default sites, devices, racks, prefixes, IP addresses, and the default admin user.*

---

## 5. Running the Application

You can run the application in two modes:

### Development Mode (Recommended for testing/editing)
Runs the server with hot-reloading for development:
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:3000`**

### Production Mode (For deploying locally)
Builds the bundle and runs the compiled, optimized server:
```bash
npm run build
```
```bash
npm run start
```
Open your browser and navigate to: **`http://localhost:3000`**

---

## 6. Logging In (Default Credentials)

Since the PC is offline, OAuth is bypassed and a local login is used. Use the following default admin credentials:

- **Username**: `admin`
- **Password**: `admin`

You can log out or switch users at any time using the user profile dropdown in the top-right corner of the interface.
