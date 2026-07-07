<div align="center">

# ⚡ Nahan Installer

### Automated Cloudflare Worker Deployment

[![English](https://img.shields.io/badge/English-blue)](README.md)
[![فارسی](https://img.shields.io/badge/فارسی-green)](README.fa.md)

</div>

---

## 🎯 What is Nahan?

**Nahan** is a serverless proxy gateway running on **Cloudflare Workers** that supports **VLESS** and **Trojan** protocols. All configuration is stored in a **D1 database**.

This installer automatically deploys the entire stack for you — no terminal, no manual configuration, just a few clicks.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🚀 **One-Click Deploy** | Deploy Nahan with a single API token — no CLI needed |
| 🗄️ **Auto D1 Database** | Creates and configures the database automatically |
| 🔗 **Auto Worker Deploy** | Uploads code, deploys, and enables workers.dev URL |
| 🌐 **Bilingual UI** | Full Persian (فارسی) and English support |
| 🔐 **Secure Proxy** | API calls are proxied through a restricted Worker |
| 📊 **Analytics Ready** | Token includes analytics permissions for monitoring |

---

## 📋 What Gets Created

When you run the installer, the following resources are created on your Cloudflare account:

| Resource | Purpose |
|----------|---------|
| 🗄️ **D1 Database** | Stores user configs, rules, and settings |
| ⚡ **Worker** | The main Nahan gateway (VLESS/Trojan proxy) |
| 🔗 **D1 Binding** | Connects the database to the Worker |
| 🌐 **workers.dev URL** | Your public access URL |

---

## 🚀 Quick Start

### Step 1: Create an API Token

Click the button below to create a token with the required permissions pre-filled:

**🔗 [Create API Token](https://dash.cloudflare.com/profile/api-tokens)**

Required permissions:
- ✅ Workers Scripts — Edit
- ✅ D1 — Edit
- ✅ Account Settings — Read
- ✅ Account Analytics — Read

### Step 2: Open the Installer

Open `index.html` in your browser:

```
file:///path/to/nahan-installer/index.html
```

Or host it on GitHub Pages / any static host.

### Step 3: Follow the Steps

1. 📝 Enter your API Token
2. ⚙️ Configure Worker name and database
3. 🚀 Click Deploy
4. 🎉 Done! Your panel is ready

---

## 📁 Project Structure

```
nahan-installer/
├── index.html          # 🌐 Main installer UI (open in browser)
├── installer-proxy.js      # 🔒 Proxy Worker code (for self-hosting)
└── README.md               # 📖 This file (English)
    README.fa.md            # 📖 فارسی
```

### 📄 File Descriptions

| File | Who needs it? | Description |
|------|---------------|-------------|
| `index.html` | **Everyone** | The main installer — open in any browser to deploy Nahan |
| `installer-proxy.js` | **Proxy maintainers** | Cloudflare Worker code for the API proxy. Used by the installer to relay Cloudflare API calls when direct browser access is blocked (CORS). Deploy this on your own account if you want to self-host the proxy. |

---

## 🔒 About the Proxy

The installer needs to call the Cloudflare API from the browser. Due to **CORS restrictions**, direct browser access to the API is often blocked.

The solution is a **proxy Worker** (`installer-proxy.js`) deployed on a Cloudflare account that:
- ✅ Only allows specific API paths (D1, Workers, Account)
- ✅ Blocks all other requests
- ✅ Passes through your API token without storing it
- ✅ Runs on Cloudflare's edge (fast & reliable)

**Default proxy:** The installer uses a hosted proxy at `nahan-installer.edge1-erpy.workers.dev`.

**Self-hosting:** If you prefer your own proxy, deploy `installer-proxy.js` on your Cloudflare account and update the URL in the installer.

---

## ⚙️ Configuration Options

During installation, you can configure:

| Option | Default | Description |
|--------|---------|-------------|
| Worker Name | `nahan-core` | Name of the deployed Worker |
| D1 Database | `iot_db` | Name of the D1 database |
| Panel Password | `admin` | Default login password (change after first login!) |
| API Route | `sync` | Dashboard URL path |
| Telegram Bot Token | — | Optional: for notifications |
| Telegram Admin ID | — | Optional: admin user ID |

---

## 🛠️ Self-Hosting the Proxy

If you want to run your own proxy Worker:

1. Go to [Cloudflare Dashboard → Workers](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create)
2. Create a new Worker (e.g., `my-nahan-proxy`)
3. Replace the default code with the contents of `installer-proxy.js`
4. Click **Save and Deploy**
5. Copy the Worker URL (e.g., `https://my-nahan-proxy.your-subdomain.workers.dev`)
6. Open the installer and enter your proxy URL when prompted

---

## 🔧 Development

This project is a static HTML file — no build step required.

```bash
# Clone the repo
git clone https://github.com/erpycode/nahan-installer.git

# Open in browser
open index.html
```

---

## 📝 License

MIT — Use it however you want.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

---

<div align="center">

**Made with ❤️ by [ErPyCode](https://github.com/erpycode)**

[![GitHub](https://img.shields.io/badge/GitHub-erpycode-181717?style=flat&logo=github)](https://github.com/erpycode)

</div>
