---
name: rpg-maker-mac-skill
description: "仅在用户想于 macOS 上运行 RPG Maker MV/MZ 游戏并集成 MTool 中文翻译时使用。触发词：RPG Maker、nwjs、MTool、汉化、macOS 运行、translations、DynamicTranslation。"
---
## 前置条件检查

在执行任何修改之前，先检查游戏目录（可先运行 `scripts/check.sh <游戏目录>` 快速检测）：

1. **nwjs 环境**：多数包含 `package.json`、`index.html`、`nw.dll`/`node.dll`（Windows 遗留文件）、`js/rmmz_core.js`（MZ）或 `js/rpg_core.js`（MV）、`data/System.json` 等。
2. **结构类型**：类型 A（文件在根目录）或 类型 B（文件在 `www/` 下，所有路径操作都在 `www/` 内进行）。
3. **翻译文件**：MTool 导出的 key-value JSON（常见名：`翻译文件.json`、`translation.json`、`zh.json`）。
   - **若游戏本身就是中文版**（检查 `data/System.json` 的 `gameTitle`、字体、地图名），则**跳过步骤 3-5，直接进入运行流程**。
4. **plugins.js 状态**：`js/plugins.js`（或 `www/js/plugins.js`）是明文数组还是混淆单行——决定注册方式，详见 references/translate.md。

## 完整流程（8 步）

1. **安装 nwjs SDK** → [references/nwjs.md](references/nwjs.md)
2. **备份游戏文件**：先 `cp -R` 整个游戏目录，再动任何文件（`js/plugins.js`、`package.json` 尤其要备份）。
3. **整合汉化文件** → [references/translate.md](references/translate.md)
4. **安装翻译插件**（`assets/DynamicTranslation.js`）→ [references/translate.md](references/translate.md)
5. **注册插件**（明文插入 / 混淆末尾追加 `$plugins.push(...)`）→ [references/translate.md](references/translate.md)
6. **修复 package.json**（缺 `name`/`main` 时）→ [references/launcher.md](references/launcher.md)
7. **创建 .app 启动器**（含图标，可整体移动）→ [references/launcher.md](references/launcher.md)
8. **启动并验证**（F12 日志 / 进程 / 画面）→ [references/troubleshooting.md](references/troubleshooting.md)

## 核心原则

- **绝不重写混淆版的 `plugins.js`**——只能文件末尾追加 `;$plugins.push(...)`，追加是安全的。
- **备份是第一步，不是可选步骤**。
- **游戏已汉化 → 直接开跑**：跳过步骤 3-5，只做运行环境 + 启动器。
- 不要把游戏文件夹拖到 nwjs.app 图标上（会以浏览器模式打开而非运行游戏）。

## 资源

| 文件 | 用途 |
|---|---|
| `references/nwjs.md` | nwjs 安装与版本兼容（步骤 1） |
| `references/translate.md` | 翻译整合、插件安装、plugins.js 注册、参数说明（步骤 3-5） |
| `references/launcher.md` | package.json 修复、.app 创建脚本、启动方式（步骤 6-7） |
| `references/troubleshooting.md` | 验证日志、注意事项、故障排除 Q&A（步骤 8） |
| `scripts/check.sh` | 游戏目录一键检测脚本 |
| `assets/DynamicTranslation.js` | 翻译插件本体（复制到游戏 `js/plugins/`） |
| `assets/zh.json` | 翻译文件格式示例 |
