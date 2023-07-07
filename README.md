# TerraMours-Gpt

简体中文 | [English](./README-En.md)

TerraMours实战项目，基于vue3.0+ts+naive UI+vite的ChatGPT项目前端。实现用户登陆和基于SK的多语言模型聊天、基于chatgpt和SD的多模型图片生成等功能。

## 1.目录结构
```
├─ docker-compose（部署）
├─ kubernetes（部署）
├─ public(logo图片)
├─ service(接口)
├─ src(前端代码)
│  ├─ api（接口调用）
│  ├─ components（组件）
│  ├─ hooks（钩子）
│  ├─ plugins（插件）
│  ├─ router（路由）
│  ├─ store（主要记的本地缓存）
│  ├─ views（页面）
│  │  └─ chat
│  │  │  └─ components
│  │  │  └─layout(布局)
│  │  │  │  └─ Layout.vue(布局vue，基础)
│  │  │  │  └─ Permission.vue(免责声明和验证码弹窗，重要，登录框根据这个改)
│  │  │  └─index.vue(聊天页面)
│  └─ README.md
├─ .gitignore
└─ package.json
```

## 2.项目运行
#### 运行测试
```bash
pnpm dev
```
#### Docker 构建

```bash
docker build -t terramoursgptweb .

# 前台运行
docker run --name TerraMours_Gpt_Web -d -p 3002:4173 --restart always TerraMours_Gpt_Web

# 保存镜像
docker save -o chatweb.tar TerraMours_Gpt_Web
# 运行地址
http://localhost:3002/
```

