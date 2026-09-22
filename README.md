# 🏠 私人菜单

个人菜谱管理应用，可浏览菜品、标记"想吃"、挑今天做什么菜。

> ⚠️ **本仓库站点已加访问控制，仅机主本人可查看。**
> 菜库以密文形式存放在 `data.json`，只有用正确的访问密码才能解密显示；
> 家人或其他人打开网址只会看到锁屏。原理见下方「访问控制」一节。

## 功能

- 📋 **五大分类**：荤菜、素菜、汤、主食、饮品
- ➕ **手动录入**：菜名、分类、图标、备注
- ❤️ **想吃标记**
- 🔄 **自动同步**：更新 `data.json` 推送 GitHub，打开 APP 自动获取新菜
- 📱 **PWA 支持**：可添加到手机桌面，像原生 APP 一样使用
- 📡 **离线可用**：Service Worker 缓存，没网也能浏览
- 🔒 **密码锁屏**：解密前不渲染任何菜品

## 访问控制

- `data.json` 不再是明文菜库，而是密文信封：

  ```json
  { "fmEnc": 1, "iter": 200000, "salt": "...", "iv": "...", "data": "<密文>" }
  ```

- 密码 → PBKDF2-SHA256（20 万次迭代）→ AES-GCM 256 位密钥，用密钥加解密菜库。
- 密码不写在任何文件里，**忘记密码 = 数据无法恢复**。明文备份请自行离线保存。
- 首次在某台设备输对密码后会记住，之后免输；换设备/清缓存需重新输入。
- 未解锁的设备打开页面时，会自动清空本地缓存的菜谱。

## 更换密码

密码变更后必须重新加密 `data.json`，否则旧密码仍可解密：

1. 在仓库外的安全目录留一份明文备份，例如 `data.plaintext.backup.json`。
2. 用新密码重新生成密文（PBKDF2 + AES-GCM，参数同上），覆盖 `data.json`。
3. 提交推送后，在每台设备上清一次站点数据，重新输密码。

> 注意：git 历史中仍保留着加密码之前的明文 `data.json`。若要求彻底清除，
> 需要重写历史（`git filter-repo`）后强推。日常使用无影响。

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

在 APP 里点「+」录入，或用长按删除 / 点击编辑——改动会用当前密码加密后写回 `data.json`。

⚠️ **不要手工编辑 `data.json`**：它现在是密文，手改会让 APP 解不开。
批量加菜请先解出明文、改完再按「更换密码」里的方法重新加密。

## 本地开发

```bash
node server.js
# → http://localhost:3000
```

## 文件结构

```
菜单/
├── index.html     # 前端页面（含锁屏与加解密逻辑）
├── data.json      # 菜库，密文存储（不要手工编辑）
├── server.js      # 本地开发服务器
├── manifest.json  # PWA 配置
├── sw.js          # Service Worker（离线缓存）
├── icon.svg       # 桌面图标
└── start.bat      # Windows 一键启动
```

## 技术栈

纯 HTML/CSS/JS + GitHub Pages，零第三方依赖。
