# rpg-maker-mac-skill — DeepSeek Harness Skill

> 一个面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 skill：在 macOS 上原生运行 RPG Maker MV/MZ 游戏，并加载 MTool 翻译文件。

当用户想在自己的 Mac 上运行 RPG Maker MV/MZ 引擎的游戏并套用 MTool 翻译文件时，由 DeepSeek Harness 的 agent 按 `SKILL.md` 自动完成环境搭建、翻译文件整合、插件注册与启动器创建，全程无需用户手动操作。

> 翻译插件 `DynamicTranslation.js` 来源于 [knowlet/RPGDynamicTranslation](https://github.com/knowlet/RPGDynamicTranslation)，保留署名，详见「上游插件说明」。

## 目录结构

```
rpg-maker-mac-skill/
├── SKILL.md               # skill 本体（核心手册，细节按需引用）
├── references/            # 分步详细手册（nwjs / 翻译 / 启动器 / 故障排查）
├── scripts/check.sh       # 游戏目录一键检测脚本
├── assets/                # DynamicTranslation.js 翻译插件 + zh.json 格式示例
├── docs/install.md        # 安装指南
└── README.md              # 本文件
```

## 安装到 DeepSeek Harness

把下面这句话发给 DeepSeek Harness 的 agent：

```
帮我安装这个 skill：https://raw.githubusercontent.com/HomophonicFate/rpg-maker-mac-skill/main/docs/install.md
```

agent 会读取安装指南，把 skill 装进 DSH 的 skills 目录（默认 `~/.dsh/skills/rpg-maker-mac-skill/`）。

安装后有两种触发方式：

- 显式调用：直接发 `/rpg-maker-mac-skill`
- 自动触发：说「帮我把这个 RPG Maker 游戏在 Mac 上跑起来，并加载 MTool 翻译文件」，匹配 `SKILL.md` 的 description 自动触发

> 注意：本 Skill 只能加载**已有的** MTool 翻译文件（MTool 无 macOS 版，无法在 Mac 上运行），不能代替 MTool 生成翻译。

## 这个 Skill 能做什么

对 DeepSeek Harness 说一句「帮我把这个 RPG Maker 游戏在 Mac 上跑起来」，它会自动完成：

- **在 Mac 上运行 RPG Maker 游戏**：MV / MZ 通用，原生运行，不需要 Windows、虚拟机或 Wine。
- **汉化**：游戏没汉化、且你提供了 MTool 翻译文件时，自动整合进游戏并启用翻译；游戏本身已是中文的，直接开跑。
- **双击即玩**：在游戏目录里生成一个带游戏图标的 App，双击启动，整个文件夹随便移动都能玩。
- **全程自动**：自动识别游戏类型与结构、搭建运行环境、备份文件、修复缺失配置、启动验证，遇到问题按手册排查。

## 上游插件说明

`DynamicTranslation.js` 来源于 [knowlet/RPGDynamicTranslation](https://github.com/knowlet/RPGDynamicTranslation)：

- 完整使用说明见 `SKILL.md`；上游原版 README 见 [knowlet/RPGDynamicTranslation](https://github.com/knowlet/RPGDynamicTranslation)
