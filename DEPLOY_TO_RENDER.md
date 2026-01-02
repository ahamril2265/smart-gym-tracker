# Deploying Smart Gym Tracker to Render.com

## 1. Prerequisites
- Push this code to **GitHub** (Render needs a repo).
- Sign up for [Render.com](https://render.com).

## 2. Create a Database (PostgreSQL)
1. On Render Dashboard, click **New +** -> **PostgreSQL**.
2. Name: `smart-gym-db` (or similar).
3. Region: `Singapore` (closest to India) or `Frankfurt`.
4. Plan: **Free**.
5. Click **Create Database**.
6. **Wait** for it to be created.
7. Copy the **Internal Database URL** (e.g., `postgres://user:pass@host/db`).

## 3. Create the Web Service
1. Click **New +** -> **Web Service**.
2. Connect your **GitHub Repository**.
3. **Settings**:
   - **Name**: `smart-gym-app`
   - **Region**: Same as Database.
   - **Branch**: `main` (or your working branch).
   - **Root Directory**: `.` (Leave empty).
   - **Runtime**: `Node`.
   - **Build Command**: `./render-build.sh`
   - **Start Command**: `node server/server.js`
   - **Plan**: **Free**.

4. **Environment Variables** (Click "Advanced" or "Environment"):
   Add the following keys:
   
   | Key | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | *(Paste the Internal Database URL from Step 2)* |
   | `JWT_SECRET` | `super_secret_key_change_me` |
   | `CLIENT_URL` | `https://smart-gym-app.onrender.com` *(The URL Render assigns you)* |
   | `SMTP_USER` | *(Your email for sending links)* |
   | `SMTP_PASS` | *(Your email app password)* |

## 4. Deploy
1. Click **Create Web Service**.
2. Watch the logs. It will:
   - Install dependencies.
   - Build the React Frontend.
   - Start the Server.
3. Access your app at the URL provided by Render!

## Troubleshooting
- **Database Connection**: If the app crashes on start, ensure `server/config/config.js` or `db.js` is using `process.env.DATABASE_URL`.
  - *Note: I checked the code, and Sequelize usually expects `DATABASE_URL`. If not, we might need a small tweak to `server/config/config.json` config.*
