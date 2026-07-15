# 🏠 家庭菜单

家庭菜单管理应用，家人可以浏览菜品、标记"想吃"，共同决定今天做什么菜。

## 功能

- 📋 **三大分类**：荤菜、素菜、汤
- ➕ **手动录入**：菜名、分类、图标、备注
- ❤️ **想吃标记**：家人各自在手机上标记
- 🔄 **自动同步**：管理员更新 `data.json` 推送 GitHub，所有手机自动获取新菜
- 📱 **PWA 支持**：可添加到手机桌面，像原生 APP 一样使用
- 📡 **离线可用**：Service Worker 缓存，没网也能浏览

## 部署到 GitHub Pages

### 1. 创建 GitHub 仓库

在 GitHub 创建一个新仓库（例如 `family-menu`），把代码推送上去：

```bash
git init
git add .
git commit -m "家庭菜单 v1"
git remote add origin https://github.com/你的用户名/family-menu.git
git push -u origin main
```

### 2. 开启 GitHub Pages

仓库 → Settings → Pages → Source 选 `main` 分支 → Save

部署后 APP 地址：`https://你的用户名.github.io/family-menu/`

### 3. 添加菜品

直接编辑仓库里的 `data.json`，按已有格式添加菜品，提交推送即可：

```json
{ "id": "d003", "name": "清炒时蔬", "cat": "veggie", "emoji": "🥬", "note": "" }
```

所有手机打开 APP 时自动同步新菜。

## 本地开发

```bash
node server.js
# → http://localhost:3000
```

## 文件结构

```
菜单/
├── index.html     # 前端页面
├── data.json      # 官方菜库（管理员维护）
├── server.js      # 本地开发服务器
├── manifest.json  # PWA 配置
├── sw.js          # Service Worker（离线缓存）
├── icon.svg       # 桌面图标
└── start.bat      # Windows 一键启动
```

## 技术栈

纯 HTML/CSS/JS + GitHub Pages，零第三方依赖。
