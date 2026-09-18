# 🚀 Deployment Guide — Circular Economy Asset Exchanging System

This guide outlines the simplest ways to deploy your application to the cloud.

---

## 🌟 Option 1: Free Cloud Deployment (Recommended)

### A. Deploy Backend on **Render.com** (or Railway.app)
1. Push your repository to **GitHub**.
2. Log into [Render.com](https://render.com) $\rightarrow$ Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository.
4. Fill in the configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Java` (or choose `Docker`)
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/exchange-0.0.1-SNAPSHOT.jar`
5. Under **Environment Variables**, add:
   - `GCP_API_KEY` = `<Your Gemini API Key>`
   - `PORT` = `8081`
6. Click **Deploy Web Service**. You will receive a live URL like `https://circular-backend.onrender.com`.

---

### B. Deploy Frontend on **Vercel** (or Netlify)
1. Log into [Vercel.com](https://vercel.com) $\rightarrow$ Click **Add New Project**.
2. Import your GitHub repository.
3. In the project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your app will be live at `https://circular-exchange.vercel.app`.

*(Optional: Update the backend URL in your frontend to point to your live Render backend URL).*

---

## 🐳 Option 2: 1-Click Docker Deployment (Any Cloud VM / VPS)

If you have a Linux server (AWS EC2, DigitalOcean Droplet, Google Cloud VM, or Linode):

1. **Install Docker & Docker Compose** on your server:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   ```

2. **Clone your repository**:
   ```bash
   git clone <YOUR_REPO_URL>
   cd Circular-Economy-Asset-Exchanging-System
   ```

3. **Set your Gemini API Key** (optional):
   ```bash
   export GCP_API_KEY="your_api_key_here"
   ```

4. **Launch the entire stack**:
   ```bash
   docker-compose up -d --build
   ```

5. **Done!**
   - Frontend is live on port **`80`** (`http://<your-server-ip>`).
   - Backend is proxied automatically through Nginx.

---

## 💻 Option 3: Traditional JAR + Dev Server

### Backend (Production JAR)
```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/exchange-0.0.1-SNAPSHOT.jar
```

### Frontend (Production Build)
```bash
cd frontend
npm install
npm run build
# Serve with any static web server (nginx, caddy, serve)
npx serve -s dist -l 5173
```

---

## 🔑 Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`
