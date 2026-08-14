# 翻译整合、插件安装与注册（步骤 3-5）

## 步骤 3：整合汉化文件

1. **确定游戏根目录**：类型 A（无 `www/`）= 游戏目录本身；类型 B（有 `www/`）= `www/`，以下路径操作都在 `www/` 下进行。
2. **创建翻译目录**：`mkdir -p "<游戏根目录>/translations"`
3. **放置翻译文件**：把 MTool 导出的翻译 JSON 复制为 `translations/zh.json`：
   ```bash
   cp "<游戏根目录>/翻译文件.json" "<游戏根目录>/translations/zh.json"
   ```
4. **格式校验**：合法 JSON、UTF-8、`{"原文": "译文"}` key-value 结构；支持 RPG Maker 的 `%1`/`%2` 占位符：
   ```json
   { "日文原文1": "中文译文1", "%1を覚えた！": "学会了 %1！" }
   ```
   完整示例见 `assets/zh.json`（键是日文原文，必须与游戏原文逐字一致）。
5. **多语言支持**：`translations/` 下文件名即语言代码（`zh.json`/`en.json`/`ja.json`），插件自动载入全部；本 Skill 面向中文，默认 `zh.json`。

## 步骤 4：安装 DynamicTranslation 翻译插件

插件本体在 `assets/DynamicTranslation.js`（与本 skill 同仓库，DSH 会以 resource base 给出本 skill 目录的绝对路径），复制到游戏目录：

```bash
SKILL_DIR="<本 skill 目录的绝对路径>"   # 通常为 ~/.dsh/skills/rpg-maker-mac-skill
cp "$SKILL_DIR/assets/DynamicTranslation.js" "<游戏根目录>/js/plugins/DynamicTranslation.js"
```

## 步骤 5：注册插件（关键步骤）

`parameters` 参数说明：
- `Default Language`：默认语言代码（`zh`）
- `Translation Path`：翻译文件目录（`translations/`）
- `Auto Detect Translations`：是否自动载入 `translations/` 下所有语言文件（`true`）
- `Translation Mode`：`full` 开启子串/多行提取——RPG Maker 常把一句话拆成多次绘制，推荐 `full`；`simple` 只做整句精确匹配

### 情况 A：plugins.js 是可读的明文数组

在 `var $plugins = [...];` 数组末尾的 `]` 之前插入：

```javascript
{"name":"DynamicTranslation","status":true,"description":"Dynamic Translation Plugin","parameters":{"Default Language":"zh","Translation Path":"translations/","Auto Detect Translations":"true","Translation Mode":"full"}}
```

### 情况 B：plugins.js 是混淆/压缩的单行代码（更常见）

**绝对不能重写或格式化这个文件**，只能**在文件末尾安全地追加**：

```bash
printf '\n;$plugins.push({"name":"DynamicTranslation","status":true,"description":"Dynamic Translation Plugin","parameters":{"Default Language":"zh","Translation Path":"translations/","Auto Detect Translations":"true","Translation Mode":"full"}});' >> "<游戏根目录>/js/plugins.js"
```

追加完成后用 `tail` 确认末尾内容正确。
