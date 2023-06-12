# TerraMours-Gpt

[简体中文](./README.md) | English

TerraMours practical project, the frontend of ChatGPT project based on vue3.0+ts+naive UI+vite. It realizes functions such as user login, chat based on SK language model, and multi-model image generation based on chatgpt and SD.

## 1. Directory Structure
```
├─ docker-compose (Deployment)
├─ kubernetes (Deployment)
├─ public (Logo Images)
├─ service (API)
├─ src (Front-End Code)
│  ├─ api (API Calls)
│  ├─ components (Components)
│  ├─ hooks (Hooks)
│  ├─ plugins (Plugins)
│  ├─ router (Router)
│  ├─ store (Remembering Local Cache)
│  ├─ views (Pages)
│  │  └─ chat
│  │  │  └─ components
│  │  │  └─ layout (Layout)
│  │  │  │  └─ Layout.vue (Layout Vue, Basic)
│  │  │  │  └─ Permission.vue (Disclaimer and Verification Code Pop-Up Window, Important, Modify Login Box According to This)
│  │  │  └─ index.vue (Chat Page)
│  └─ README.md
├─ .gitignore
└─ package.json
```

## 2. Project Running
#### Run Test
```bash
pnpm dev
```

#### Docker build & Run

```bash
docker build -t TerraMours_Gpt_Web .

# Run in foreground
docker run --name TerraMours_Gpt_Web -d -p 3002:4173 --restart always TerraMours_Gpt_Web

# Save image
docker save -o chatweb.tar TerraMours_Gpt_Web
# Running address
http://localhost:3002/
```