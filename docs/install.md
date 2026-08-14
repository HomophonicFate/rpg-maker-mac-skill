# rpg-maker-mac-skill — 安装指南

## 给用户

复制下面这句话发给你的 AI Agent：

```
帮我安装这个 skill：https://raw.githubusercontent.com/HomophonicFate/rpg-maker-mac-skill/main/docs/install.md
```

## 给 AI Agent

### 目标

将本仓库的 skill（`SKILL.md` 及其引用资源）安装到 DeepSeek Harness 的 skills 目录，使其可被调用。安装后 `SKILL.md` 位于 skill 目录根，`assets/DynamicTranslation.js` 可按 resource base 相对解析，运行游戏时插件无需外部下载。

### 安装步骤

1. 确认 DeepSeek Harness 的 skills 目录。默认安装到用户级 DSH 专用目录 `~/.dsh/skills/`（若只想在某个工作区生效，也可用项目级 `<项目根>/.dsh/skills/`）；若已有 `rpg-maker-mac-skill/` 目录，先确认是否为旧版本。
2. 将本仓库的以下内容复制到 `~/.dsh/skills/rpg-maker-mac-skill/`（或对应的项目级目录）：
   - `SKILL.md` — skill 本体（必需）
   - `references/` — 分步详细手册（必需，SKILL.md 按需引用）
   - `assets/` — 翻译插件 `DynamicTranslation.js` 与格式示例 `zh.json`（必需，SKILL.md 步骤 4 使用）
   - `scripts/` — 检测脚本（推荐）
3. 确认 `SKILL.md` 位于 skill 目录根，`references/`、`assets/`、`scripts/` 与其同级。
4. 验证：下次会话该 skill 应出现在 DSH 的 skills 目录中，可通过 `/rpg-maker-mac-skill` 直接调用，或在任务匹配时按 description 触发。

### 边界

- 只安装上述文件，不要修改本仓库的其他文件。
- 不要使用 `sudo` 修改系统文件。
- 不要把文件装入 Agent 的工作区/项目目录，只装入 skills 目录。
- 游戏运行所需的 nwjs 运行时不由本指南安装，由 `SKILL.md` 步骤 1 在游戏场景中按需处理。
