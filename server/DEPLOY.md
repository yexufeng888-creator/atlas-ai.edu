# Deploying the protected Ollama API on ECS

The GitHub Pages site remains static. This API runs on ECS, verifies each
Supabase access token, limits each user to 20 chat requests per UTC day, and
forwards requests only to Ollama on `127.0.0.1:11434`.

## 1. Add the API DNS record

In Squarespace DNS for `wwwatlasai.com`, add:

- Type: `A`
- Name: `api`
- Data: the ECS public IPv4 address
- TTL: default

Wait until `api.wwwatlasai.com` resolves to the ECS address. Do not change the
existing website A records or Google mail records.

## 2. Restrict ECS inbound ports

In the ECS security group, allow inbound TCP 80 and 443 for the API website.
Keep SSH (22) limited to your own IP. Do not open ports 8787 or 11434.

## 3. Upload the API files

Create `/opt/atlas-api` on ECS, then use Workbench File Management to upload
these repository files into it:

- `server/atlas_api.py`
- `server/atlas-api.service`
- `server/nginx-atlas-api.conf`

The installed Ollama model must already be available to the local Ollama
service. The API defaults to `qwen2.5:1.5b`; set `OLLAMA_MODEL=atlas` if you
have created that custom Ollama model.

## 4. Configure the service

Run these commands as root:

```bash
groupadd --system atlas-api
useradd --system --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin --gid atlas-api atlas-api
mkdir -p /var/lib/atlas-api
chown atlas-api:atlas-api /var/lib/atlas-api
chmod 750 /var/lib/atlas-api
```

Create `/etc/atlas-api.env` with the following values. Copy the publishable
key from `assets/js/supabase-config.js`; never use a Supabase `service_role`
or secret key here.

```ini
SUPABASE_URL=https://qyxsknignotmouyrhqqw.supabase.co
SUPABASE_PUBLISHABLE_KEY=REPLACE_WITH_THE_PUBLISHABLE_KEY
ATLAS_ALLOWED_ORIGINS=https://wwwatlasai.com
ATLAS_DAILY_LIMIT=20
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:1.5b
```

Protect the environment file and install the service:

```bash
chown root:root /etc/atlas-api.env
chmod 600 /etc/atlas-api.env
cp /opt/atlas-api/atlas-api.service /etc/systemd/system/atlas-api.service
systemctl daemon-reload
systemctl enable --now atlas-api
systemctl is-active atlas-api
curl http://127.0.0.1:8787/health
```

The service should report `active`, and the local health endpoint should
return `{"status":"ok"}`. An unauthenticated request to `/api/usage` should
return HTTP 401.

## 5. Add HTTPS with Nginx

Install Nginx and Certbot:

```bash
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx
cp /opt/atlas-api/nginx-atlas-api.conf /etc/nginx/sites-available/atlas-api
ln -s /etc/nginx/sites-available/atlas-api /etc/nginx/sites-enabled/atlas-api
nginx -t
systemctl enable --now nginx
```

After DNS is resolving and port 80 is reachable, issue the HTTPS certificate:

```bash
certbot --nginx -d api.wwwatlasai.com
```

Follow Certbot's prompts. Then check:

```bash
curl https://api.wwwatlasai.com/health
curl -i https://api.wwwatlasai.com/api/usage
```

The health endpoint should return HTTP 200. `/api/usage` should return HTTP
401 without a signed-in user's Supabase access token.

## 6. Publish the website changes

Publish the updated `ask.html`, `assets/js/ask.js`,
`assets/js/atlas-ai-config.js`, and Supabase config/auth scripts through
GitHub Pages. The ask page redirects signed-out visitors to `login.html`.
Signed-in users call `https://api.wwwatlasai.com/api/chat`; the server fixes
the model name and enforces the daily quota.

Do not put Ollama's port 11434 on the public internet. Keep API credentials,
Supabase service-role keys, and cloud access keys out of browser files and
the Git repository.
