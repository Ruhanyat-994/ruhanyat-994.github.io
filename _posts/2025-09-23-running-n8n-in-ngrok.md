---
title: "Running n8n in ngrok"
date: 2025-09-23 03:39:57 +0600
categories: [ai-automation, server]
tags: [automation, server, n8n-workflow, installation]
image:
  path: /assets/posts/n8n.png
  alt: n8n
---

![Substack Image](https://substackcdn.com/image/fetch/$s_!-_kO!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F08d1a8ba-0c6b-46e8-b9ca-d0d5e1521f43_1275x559.png)

# Install Docker and Docker Compose

```bash
mkdir -p ~/.docker/cli-plugins/

curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose

chmod +x ~/.docker/cli-plugins/docker-compose

docker compose version
```

---

# DNS Setup

### Create an `.env` file

```bash
mkdir n8n-compose
cd n8n-compose
nano .env
```

Paste the following:

```dotenv
# DOMAIN_NAME and SUBDOMAIN together determine where n8n will be reachable from

# The top level domain to serve from
DOMAIN_NAME=[your ngrok domain]

# The subdomain to serve from
SUBDOMAIN=[your ngrok subdomain]

# Example: serves n8n at https://n8n.example.com

# Optional timezone for Cron and other scheduling nodes
# New York is default if not set
GENERIC_TIMEZONE=Europe/Berlin

# Email address to use for TLS/SSL certificate creation
SSL_EMAIL=user@example.com
```

> Example values:
> `DOMAIN_NAME=ngrok-free.app`
> `SUBDOMAIN=close-especially-opossum`

---

### Create local files directory

```bash
mkdir local-files
```

---

### Create `docker-compose.yml`

```bash
nano docker-compose.yml
```

Paste the following YAML:

```yaml
services:
  traefik:
    image: "traefik"
    restart: always
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.mytlschallenge.acme.tlschallenge=true"
      - "--certificatesresolvers.mytlschallenge.acme.email=${SSL_EMAIL}"
      - "--certificatesresolvers.mytlschallenge.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - traefik_data:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock:ro

  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    ports:
      - "127.0.0.1:5678:5678"
    labels:
      - traefik.enable=true
      - traefik.http.routers.n8n.rule=Host(`${SUBDOMAIN}.${DOMAIN_NAME}`)
      - traefik.http.routers.n8n.tls=true
      - traefik.http.routers.n8n.entrypoints=web,websecure
      - traefik.http.routers.n8n.tls.certresolver=mytlschallenge
      - traefik.http.middlewares.n8n.headers.SSLRedirect=true
      - traefik.http.middlewares.n8n.headers.STSSeconds=315360000
      - traefik.http.middlewares.n8n.headers.browserXSSFilter=true
      - traefik.http.middlewares.n8n.headers.contentTypeNosniff=true
      - traefik.http.middlewares.n8n.headers.forceSTSHeader=true
      - traefik.http.middlewares.n8n.headers.SSLHost=${DOMAIN_NAME}
      - traefik.http.middlewares.n8n.headers.STSIncludeSubdomains=true
      - traefik.http.middlewares.n8n.headers.STSPreload=true
      - traefik.http.routers.n8n.middlewares=n8n@docker
    environment:
      - N8N_HOST=${SUBDOMAIN}.${DOMAIN_NAME}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://${SUBDOMAIN}.${DOMAIN_NAME}/
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
    volumes:
      - n8n_data:/home/node/.n8n
      - ./local-files:/files

volumes:
  n8n_data:
  traefik_data:
```

---

# Start Docker Compose

```bash
sudo docker compose up -d
```

* If it doesn’t work, try running without `sudo`.
* To stop the containers:

```bash
sudo docker compose stop
```

---

# Download ngrok

![Substack Image](https://substackcdn.com/image/fetch/$s_!rXEb!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F906ffbbb-3e4f-47c2-b452-d81165d2c78f_1066x445.png)

1. Login to [ngrok.com](https://ngrok.com/) and download the zip file for Windows.
2. Extract it to `C:\Program Files\ngrok`.
3. Add the location to your **System PATH**.
4. Verify installation:

```cmd
ngrok --version
```

---

# Running ngrok Server

```bash
ngrok http --url=[your ngrok web url] 5678
```

* Use port `5678` because n8n is configured on this port.
* Authorize with your ngrok token:

```bash
ngrok config add-authtoken [paste your token]
```

* Start the server again:

```bash
ngrok http --url=[your ngrok web url] 5678
```

You will now see the n8n login page at your ngrok web URL.

> **Note:** Start the Docker instance first before running ngrok.

