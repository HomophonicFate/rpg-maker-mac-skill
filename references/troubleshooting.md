# 验证、注意事项与故障排除（步骤 8）

## 验证汉化是否生效

游戏启动后按 **F12** 打开开发者工具 → Console（若游戏自带 `--disable-devtools` 则 F12 无效，改用进程存活 + 画面确认），查找：

```
翻译载入成功: zh XXXX 个项目
```

看到即插件已成功加载翻译文件；游戏中的对话、菜单、物品描述应自动为中文。

**游戏内切语言**：插件自动在「选项（Options）」菜单加 `Language / 语言` 项（需 `translations/` 下有 ≥2 个语言文件才会显示）；也可用事件插件命令 `SetLanguage en`、脚本调用 `TranslationManager.setLanguage('en')` 切换，选择随存档保存。

未看到日志的可能原因：
1. `translations/zh.json` 路径不正确（游戏根目录 vs `www/`）
2. `zh.json` 格式损坏（非法 JSON）
3. `plugins.js` 注册失败（检查追加内容是否完整）
4. 游戏目录被 nwjs 的 CORS/安全策略限制

## 注意事项

1. **文件修改前必须备份**：`js/plugins.js` 一旦被破坏游戏将无法启动；混淆版绝对不能被格式化、压缩或重写。
2. **翻译文件格式**：标准 UTF-8 JSON、`{"原文": "译文"}` key-value；不支持 MTool 加密格式（二进制/不可读）。
3. **路径一致性**：有 `www/` 时，`translations/`、`js/plugins/DynamicTranslation.js`、`plugins.js` 的修改都必须在 `www/` 下；`package.json` 在外层时 `main` 指向 `www/index.html`。
4. **Gatekeeper**：首次运行可能弹「无法打开，因为无法验证开发者」→ 系统设置 → 隐私与安全性 → 仍要打开。
5. **xattr**：下载的游戏可能带 `com.apple.quarantine` 隔离属性，执行 `xattr -cr "/path/to/game"`。
6. **nwjs 版本**：新版白屏时下载与游戏原版本接近的 SDK 版（见 references/nwjs.md）；Apple Silicon 老版本仅 x64，需 Rosetta 2。
7. **翻译覆盖率**：MTool 翻译不一定覆盖 100% 文本；图片文字、脚本动态文字、插件自定义 UI 无法翻译，需回 MTool 补充。
8. **插件冲突**：部分自定义文本渲染插件（DTextPicture.js、AXY_Text.js 等）可能与 DynamicTranslation 冲突，部分 UI 未翻译属正常现象。

## 故障排除

### Q1：运行命令后没有任何窗口弹出
检查终端报错；`package.json` 的 `main` 是否指向 `index.html`；改用绝对路径。

### Q2：窗口弹出但白屏/黑屏
F12 看 Console 红色报错。常见原因：`plugins.js` 被破坏（恢复备份）、`js/main.js` 加载失败、nwjs 版本太新不兼容（换旧版）。

### Q3：游戏运行了但没有汉化
F12 搜「翻译」或「translation」。检查：`translations/zh.json` 是否在游戏根目录、`plugins.js` 末尾是否成功追加、`DynamicTranslation.js` 是否在 `js/plugins/`。

### Q4：报错 "Failed to load extension from: ... Required value 'name' is missing or invalid"
`package.json` 缺 `name` 字段，补任意名称。

### Q5：部分文字被翻译了，部分还是日文
正常——MTool 翻译文件未覆盖全部文本，插件只翻译 `zh.json` 中存在的 key；需补充翻译文件内容。

### Q6：双击 .app 无响应 / Dock 里看到 nwjs 但无窗口
Gatekeeper 阻止未签名 .app：系统设置 → 隐私与安全性 → 仍要打开；`xattr -cr "游戏名.app"`；仍不行改用命令行启动。

### Q7：报错"无法加载以下来源的扩展程序...清单文件缺失或不可读取"
nwjs 扫描到 `.app` 包：在 `package.json` 的 `chromium-args` 追加 `--disable-extensions`。

### Q8：.app 没有显示游戏图标
`Contents/Resources/icon.icns` 未正确放置或 `Info.plist` 的 `CFBundleIconFile` 缺失/错误；修复后 `killall Finder` 或重新打开文件夹。
