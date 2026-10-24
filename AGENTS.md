# AGENTS.md — 家庭菜单

给在此工作区工作的 AI（DeepSeek Harness）的项目说明。开工前先读本文件；改代码前先读 `index.html` 对应段落。

## 一句话

家庭共用的「今天吃什么」PWA：浏览菜库、标记想吃、共同决定今日菜单。纯静态站点，部署在 GitHub Pages，**零第三方依赖、无构建步骤**。

- 线上：https://j-kai-moji.github.io/menu/
- 仓库：`J-Kai-moji/menu`，主分支 `master`（不是 `main`）
- 发布方式：推到 `master`，GitHub Pages 自动构建，几十秒后生效

## 文件职责

| 文件 | 作用 |
| --- | --- |
| `index.html` | 全部前端：HTML + CSS + JS 内联在一个文件（约 2200 行）。含 5 个分类、搜索、随机选菜、想吃标记、今日菜单、增删改弹窗、GitHub API 同步 |
| `data.json` | 官方菜库（唯一权威数据源），`POST/PUT` 由应用或人工维护 |
| `today.json` | 今日菜单的云端共享状态：`{"date":"2026-8-3","dishes":["d477"]}`，日期**不补零** |
| `sw.js` | Service Worker。`CACHE` 常量 + `BASE = '/menu'` 前缀；`index.html`/`data.json`/`today.json` 走 network-first，静态资源 cache-first |
| `manifest.json` | PWA 配置，`start_url`/`scope` 均为 `/menu/` |
| `server.js` | 本地开发服务器（`node server.js` → :3000，带局域网 IP 提示） |
| `start.bat` | Windows 一键起服务并开浏览器 |
| `icon.svg` | 桌面图标 |
| `.claude/settings.local.json` | Cursor/Claude Code 遗留的权限白名单，**本项目运行不依赖它**，保留勿动 |
| `.gitignore` | 仅忽略 `node_modules/`、`.DS_Store`、`*.log` |

## 数据模型

`data.json` 是数组，每项：

```json
{ "id": "d001", "name": "广式萝卜牛腩煲", "cat": "meat", "emoji": "🥘", "note": "", "tags": [], "ingredients": "" }
```

- `cat` 只能是 `meat`（荤菜）/ `veggie`（素菜）/ `soup`（汤）/ `staple`（主食）/ `drink`（饮品）
- `id` 形如 `d` + 三位数字，新增时取现有最大号 +1；**不复用空号**
- `tags` 目前使用：`海鲜`、`辣`、`凉菜`、`B站`、`酱料`（`autoTag()` 只会按菜名自动打前三个）
- `ingredients`（配料，顿号分隔）由用户手工按需补，**不要求每道菜都有**；AI 不要批量生成或自动填充
- `note`（备注）同样可为空

现状（2026-10-25）：499 道，荤 209 / 素 123 / 主食 91 / 汤 72 / 饮品 4；id 范围 d001–d530，有 31 个空号；`ingredients` 已填 47/499（手工补，非必填）。

## 关键机制（改之前必须懂）

1. **混合架构**：`data.json` 是官方菜库；`localStorage` 存家人自己加的菜、想吃标记、今日菜单本地副本。`syncFromServer()` 每次启动/切回前台拉 `data.json`，**服务端为准**：会清理 id 以 `d` 开头但服务器已不存在的菜，因此删除只需从 `data.json` 移除。
2. **内嵌种子数据** `SEED_DISHES`（`index.html:1152` 起）只是首次离线兜底，**无需随菜品更新**，不要手动维护。
3. **版本号**：`APP_VERSION`（`index.html:959`）变化时清空本地菜品缓存强制重拉（Token 与今日菜单保留）。历史约定：**每次发版同时升 `APP_VERSION` 和 `sw.js:1` 的 `CACHE` 版本**（如 v109 / family-menu-v29）。纯加菜由应用内路径完成时不升版本，靠 network-first 生效。
4. **管理员 Token**：应用内写 GitHub 需要 Personal Access Token（Fine-grained → `J-Kai-moji/menu` → Contents 读写），存在 `localStorage['fm_gh_token']`。入口是**长按页面大标题 3 秒**（`index.html:2124` 附近的 `.header` 长按监听，触发 `promptToken()`），无 Token 时今日菜单仅本机可见。
5. **今日菜单云同步**：任何设备加/删菜都 `PUT today.json`（`pushTodayOp`，op 类型 `set`/`add`/`remove`/`clear`，409 冲突重试 3 次）；其他设备轮询（有 Token 10s、无 Token 30s，均带 ETag 避免限流）。
6. **CDN 回退**：`fetchWithCdnFallback()` 逐个尝试 raw/CDN 地址，GitHub 被墙时仍能读；失败按 30s→5min 退避重试。
7. **本地开发注意**：`sw.js` 与 `manifest.json` 写死 `/menu/` 前缀，`localhost:3000` 根路径下 SW 注册会 404、不是 bug；真机/线上才走 `/menu/`。

## 改动规则

- **不引入**框架、打包器、npm 依赖、CSS 预处理器；继续单文件内联 + 原生 JS。
- 界面文案、注释、commit message 全部用中文，风格跟随现有代码（emoji 前缀的 toast、`// ===== 分区注释 =====`）。
- 改 `data.json`：保持按 id 升序、JSON 合法、id 唯一、`cat` 合法；写文件用 UTF-8 无 BOM，结尾保留换行。改完必须按上文升 `APP_VERSION` + `CACHE`。
- 兼容移动端优先：现有布局是手机竖屏设计，宽屏只是居中，不要为正则桌面大改样式。
- 破坏性操作（删菜、改 id、改分类枚举）先跟用户确认，因为会清掉家人手机上的本地缓存或想吃标记。

## 发布流程（在本工作区）

```bash
git status                 # 先确认干净、无意外文件
node -e "JSON.parse(require('fs').readFileSync('data.json','utf8'))"   # 改过数据则校验
git add -A
git commit -m "新增素菜：葱烧豆腐…；版本号升v109，SW缓存升级v29"
git push origin master
```

提交信息沿用历史格式：`新增/修改<分类>：菜名（配料：…）；版本号升vNNN，SW缓存升级vNN`。推完可开线上地址确认；界面改动建议起本地服务并渲染截图自查。

## 验证清单（交付前）

- `data.json` 可解析、无重复 id、分类合法、按 id 排序
- `APP_VERSION` 与 `sw.js` 的 `CACHE` 都升了（若本次是发版）
- `index.html` 无语法错误（浏览器控制台无报错）、移动端宽度 375px 下不溢出
- `git status` 只剩预期改动

## 工作约定（用户明确）

- **配料由用户自己慢慢补**，不着急，也不是每道菜都需要。不要把空 `ingredients` 当缺陷，不要主动提议"批量补全配料"，也不要自动生成配料内容。
- 同理，用户没提的优化项（重构、换框架、加新功能）不要主动开工，先问。

## 已知问题 / 可选题

- `.claude/settings.local.json` 里还硬编码了 `F:\cursor\菜单` 路径，属历史遗留

## 工作区与备份

- **主工作区**：`D:\deepseek\家庭菜单`（本仓库，DSH 唯一可写位置）
- **备份**：`F:\cursor\菜单` 是迁移前的原件，**只读参考，不要再在 F 盘改**；两边不会自动同步
- 若需改 F 盘需单独授权完全权限，一般不必要
