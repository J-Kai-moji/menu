# 🏠 家庭菜单

家庭菜单管理应用，家人可以浏览菜品、标记"想吃"，共同决定今天做什么菜。

## 功能

- 📋 **五大分类**：荤菜、素菜、汤、主食、饮品
- ➕ **手动录入**：菜名、分类、图标、备注、配料
- ❤️ **想吃标记**：家人各自在手机上标记
- 📅 **今日菜单**：一起选今天的菜，云端同步，所有设备看到同一份
- 🔄 **自动同步**：管理员更新 `data.json` 推送 GitHub，所有手机自动获取新菜
- 📱 **PWA 支持**：可添加到手机桌面，像原生 APP 一样使用
- 📡 **离线可用**：Service Worker 缓存，没网也能浏览

## 部署到 GitHub Pages

### 1. 仓库与分支

项目仓库：`J-Kai-moji/menu`，主分支是 `master`（不是 `main`）。日常发布只需提交并推送，Pages 会自动构建：

```bash
git push origin master
```

### 2. 开启 GitHub Pages

仓库 → Settings → Pages → Source 选 `master` 分支 → Save（本项目已配置好）

部署后 APP 地址：`https://j-kai-moji.github.io/menu/`

### 3. 添加菜品

两种方式，效果一样：手机上打开 APP，长按页面大标题 3 秒输入 GitHub Token 后直接加菜；或直接编辑仓库里的 `data.json` 再推送。

```json
{ "id": "d003", "name": "清炒时蔬", "cat": "veggie", "emoji": "🥬", "note": "", "tags": [], "ingredients": "" }
```

所有手机打开 APP 时自动同步新菜。改 `data.json` 后请同时升 `index.html` 里的 `APP_VERSION` 和 `sw.js` 里的缓存版本，详见 `AGENTS.md`。

## 本地开发

```bash
node server.js
# → http://localhost:3000
```

## 文件结构

```
菜单/
├── index.html     # 前端页面（全部 HTML/CSS/JS 内联）
├── data.json      # 官方菜库（权威数据源）
├── today.json     # 今日菜单云端共享状态
├── server.js      # 本地开发服务器
├── manifest.json  # PWA 配置
├── sw.js          # Service Worker（离线缓存）
├── icon.svg       # 桌面图标
├── start.bat      # Windows 一键启动
└── AGENTS.md      # 项目说明与发布约定
```

## 技术栈

纯 HTML/CSS/JS + GitHub Pages，零第三方依赖。
