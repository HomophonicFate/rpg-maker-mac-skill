# nwjs 运行环境安装与版本兼容（步骤 1）

## 安装 SDK 版（带开发者工具，F12 验证依赖它）

优先从官网下载 macOS SDK 版：https://nwjs.io/downloads/

Apple Silicon（arm64）：

```bash
curl -LO https://dl.nwjs.io/v0.114.0/nwjs-sdk-v0.114.0-osx-arm64.zip
unzip nwjs-sdk-v0.114.0-osx-arm64.zip -d /tmp/nwjs-dl
mv /tmp/nwjs-dl/nwjs-sdk-v0.114.0-osx-arm64/nwjs.app /Applications/
xattr -cr /Applications/nwjs.app
```

Intel / Rosetta：把 URL 中的 `osx-arm64` 换成 `osx-x64`。

**备用（brew）**：`brew install --cask nwjs` 目前仍可安装（同为 SDK 版），但该 cask 已标记 deprecated，预计 2026-09-01 停用；停用后走官网下载。

## 版本兼容

- RPG Maker MV/MZ 游戏通常用较老版本 nwjs 打包；若新版 nwjs 白屏或报错，下载与游戏原版本接近的 SDK 版。
- URL 格式：`https://dl.nwjs.io/vX.Y.Z/nwjs-sdk-vX.Y.Z-osx-arm64.zip`
- Apple Silicon 上老版本仅有 x64 版，需 Rosetta 2 运行。
- 查看已装版本：`/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" /Applications/nwjs.app/Contents/Info.plist`
- 查看芯片架构：`uname -m`

## 注意

- 若游戏自带 `--disable-devtools`（见 package.json 的 `chromium-args`），F12 无效，改按 references/troubleshooting.md 的进程/画面方式验证。
