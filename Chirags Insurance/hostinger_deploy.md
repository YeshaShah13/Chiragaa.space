# Chirags Insurance - Hostinger Deployment & AI MCP Execution Guide

This document is a deployment blueprint and execution manual for deploying the **Chirags Insurance ERP & Fleet Management System** to **Hostinger**. It is specifically structured for automated deployment using an AI agent equipped with **Hostinger MCP Server Tools** or for DevOps engineers.

---

## 1. System Architecture Overview

| Component | Technology | Target Hosting Environment | Port / Route |
| :--- | :--- | :--- | :--- |
| **Backend API** | Laravel 11 (PHP 8.2+) | Hostinger PHP Hosting / VPS (Nginx) | `https://api.yourdomain.com/api/v1` |
| **Frontend** | Next.js 15+ (Node.js/React) | Hostinger VPS (Node/PM2) or Static/Node Web | `https://yourdomain.com` |
| **Database** | MySQL 8.0+ | Hostinger Managed MySQL / VPS MySQL | Port `3306` (76,700+ records) |
| **Authentication** | Laravel Sanctum | Stateful + Bearer API (24h TTL) | `/api/v1/auth/*` |

---

## 2. Hostinger MCP Server Tool Reference

When using an AI agent connected to Hostinger MCP tools, use the corresponding MCP functions below:

### A. Database Management (`hostinger-hosting` / `hostinger-agency-hosting`)
- `hosting_createAccountDatabase` / `agency-hosting_createWebsiteDatabaseV1`: Create the MySQL database (e.g., `u123456_chirags`).
- `agency-hosting_createWebsiteDatabaseUserV1`: Create user and assign all database privileges.
- `hosting_getPhpMyAdminLink`: Obtain temporary phpMyAdmin URL for data inspection or database dump import.

### B. PHP & Environment Setup (`hostinger-hosting` / `hostinger-agency-hosting`)
- `hosting_updatePHPVersionV1` / `agency-hosting_updateWebsitePHPVersionV1`: Set PHP version to **`8.2`** or **`8.3`**.
- `hosting_updatePHPExtensionsV1`: Enable `pdo_mysql`, `bcmath`, `curl`, `mbstring`, `openssl`, `tokenizer`, `xml`, `zip`, `fileinfo`.
- `hosting_updatePHPOptionsV1`:
  - `memory_limit` = `512M`
  - `max_execution_time` = `300`
  - `upload_max_filesize` = `64M`
  - `post_max_size` = `64M`

### C. File Uploads & Archive Deployment
- `hosting_generateUploadURLV1` / `agency-hosting_generateUploadURLV1`: Generate pre-signed upload URL for zipped codebase.
- `agency-hosting_importWebsiteFromArchiveV1` / `hosting_deployStaticSiteArchiveV1`: Extract and deploy code archives directly.

### D. Node.js & Next.js Build (`hostinger-hosting` / `hostinger-agency-hosting`)
- `agency-hosting_buildWebsiteNodeJSAssetsV1`: Run remote Node.js production asset builds.
- `hosting_restartNode_jsApplicationV1`: Restart the Next.js runtime daemon.

### E. Domains & DNS Configuration (`hostinger-dns` & `hostinger-domains`)
- `DNS_getDNSRecordsV1`: Inspect existing DNS zone.
- `DNS_updateDNSRecordsV1`: Create or point `A` and `CNAME` records:
  - `@` (Root) $\rightarrow$ Points to Frontend server IP.
  - `api` (Subdomain) $\rightarrow$ Points to Backend server IP.

### F. Hostinger VPS Tools (`hostinger-vps` - Recommended for Full Control)
- `VPS_createNewProject` / `VPS_startProjectV1`: Spin up Docker/Node/PHP containerized environment.
- `VPS_activateFirewallV1` / `VPS_updateFirewallRuleV1`: Open ports `80`, `443`, `22`.

---

## 3. Step-by-Step Deployment Runbook

### Step 1: Database Setup
1. Create a new MySQL database named `chirags_insurance`.
2. Set collation to **`utf8mb4_unicode_ci`**.
3. Import the initial database schema and fleet data (`76,709` vehicles):
   ```bash
   mysql -u [db_user] -p[db_password] -h [db_host] [db_name] < database_dump.sql
   ```
4. If migrating from scratch via artisan:
   ```bash
   php artisan migrate --force
   ```

---

### Step 2: Backend (Laravel) Configuration & Deployment

#### A. Target Directory
Deploy the backend files into `public_html/api` or a dedicated subdomain root `api.yourdomain.com`.

#### B. Configure Environment (`.env`)
Create `.env` in the Laravel root:
```ini
APP_NAME="Chirags Insurance ERP"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_hostinger_db_name
DB_USERNAME=your_hostinger_db_user
DB_PASSWORD=your_hostinger_db_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=database
SESSION_LIFETIME=1440
SESSION_ENCRYPT=false

SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SANCTUM_EXPIRATION_MINUTES=1440

CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### C. Nginx / Apache Document Root Configuration
> [!IMPORTANT]
> The web root **MUST** point to the Laravel `/public` subfolder, NOT the root project folder.

If using Apache / LiteSpeed (Hostinger default), ensure the `.htaccess` inside `public/` is active:
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

#### D. Production Optimization Commands
Run the following commands in the backend root:
```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

### Step 3: Frontend (Next.js) Configuration & Deployment

#### A. Configure Environment (`.env.production`)
In `frontend/.env.production`:
```ini
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

#### B. Build the Production Application
```bash
cd frontend
npm install --production=false
npm run build
```

#### C. Running the Next.js Server on Hostinger VPS / Node Hosting
Using **PM2**:
```bash
npm install -g pm2
pm2 start npm --name "chirags-frontend" -- start -- -p 3000
pm2 save
pm2 startup
```

#### D. Nginx Reverse Proxy Config (For Hostinger VPS)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    root /var/www/chirags-insurance/backend/public;
    index index.php index.html;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## 4. Post-Deployment Verification Checklist

Verify all of the following after deployment:

- [ ] **Health Check API**: `GET https://api.yourdomain.com/api/v1/auth/me` returns `401 Unauthenticated` (healthy response).
- [ ] **Login & 24h Session**: Log in with credentials; verify token is issued with `expires_at = now + 24 hours`.
- [ ] **Dashboard Metrics**: Confirm `GET https://api.yourdomain.com/api/v1/dashboard/overview` loads the `76,709` total vehicle counts, distinct expiries (`64,950`), and recent 6 activity logs within ~200ms.
- [ ] **Admin & Settings Security**: Log in with a non-admin account; confirm `/settings` and `/admin` routes return `403 Access Denied`.
- [ ] **CORS Verification**: Inspect browser console network calls to confirm `Access-Control-Allow-Origin` matches your frontend domain with credentials.
- [ ] **SSL / HTTPS**: Confirm SSL certificate is active on both `yourdomain.com` and `api.yourdomain.com`.

---

## 5. Automated AI Deployment Prompt

To have your AI agent automatically execute the deployment with its Hostinger MCP server, give it the following prompt:

```text
Please read the instructions in hostinger_deploy.md and execute the deployment for Chirags Insurance using the Hostinger MCP tools:
1. Create the MySQL database and assign credentials.
2. Configure PHP version to 8.2 with pdo_mysql, bcmath, and curl.
3. Deploy the backend to the api subdomain with document root set to /public.
4. Deploy and start the Next.js frontend configured with NEXT_PUBLIC_API_URL.
5. Verify SSL and test the /api/v1/dashboard/overview endpoint.
```
