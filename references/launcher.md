# package.json 修复与 .app 启动器（步骤 6-7）

## 步骤 6：修复 package.json

检查字段：
- **`name`**：缺失会报错 `Required value 'name' is missing or invalid`，补任意值（如 `"name": "rmmz-game"`）。
- **`main`**：指向 `index.html`（类型 B 时指向 `www/index.html`）。
- **`chromium-args`**：游戏自带通常已够用；遇到「无法加载扩展程序」报错时追加 `--disable-extensions`。

```json
{
    "name": "rmmz-game",
    "main": "index.html",
    "chromium-args": "--force-color-profile=srgb --disable-devtools",
    "window": { "title": "Game Title", "width": 1280, "height": 720 }
}
```

## 步骤 7：创建 .app 启动器

目标：游戏目录内部生成 `游戏名.app`，双击启动，支持整个文件夹移动。

```bash
#!/bin/bash

GAME_PATH="/path/to/your/game"
APP_NAME="游戏名"

APP_DIR="$GAME_PATH/$APP_NAME.app"
mkdir -p "$APP_DIR/Contents/MacOS"
mkdir -p "$APP_DIR/Contents/Resources"

# 1. launcher（exec 直接调 nwjs，相对路径定位游戏目录）
cat > "$APP_DIR/Contents/MacOS/$APP_NAME" << 'LAUNCHEREOF'
#!/bin/bash
cd "$(dirname "$0")/../../.."
exec /Applications/nwjs.app/Contents/MacOS/nwjs "$PWD"
LAUNCHEREOF
chmod +x "$APP_DIR/Contents/MacOS/$APP_NAME"

# 2. icon/icon.png -> icon.icns
ICON_PNG="$GAME_PATH/icon/icon.png"
if [ -f "$ICON_PNG" ]; then
    ICONSET_DIR="/tmp/game_icon_$$.iconset"
    mkdir -p "$ICONSET_DIR"

    sips -z 16 16     "$ICON_PNG" --out "$ICONSET_DIR/icon_16x16.png" 2>/dev/null
    sips -z 32 32     "$ICON_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png" 2>/dev/null
    sips -z 32 32     "$ICON_PNG" --out "$ICONSET_DIR/icon_32x32.png" 2>/dev/null
    sips -z 64 64     "$ICON_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png" 2>/dev/null
    sips -z 128 128   "$ICON_PNG" --out "$ICONSET_DIR/icon_128x128.png" 2>/dev/null
    sips -z 256 256   "$ICON_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png" 2>/dev/null
    sips -z 256 256   "$ICON_PNG" --out "$ICONSET_DIR/icon_256x256.png" 2>/dev/null
    sips -z 512 512   "$ICON_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png" 2>/dev/null

    iconutil -c icns "$ICONSET_DIR" -o "$APP_DIR/Contents/Resources/icon.icns" 2>/dev/null
    rm -rf "$ICONSET_DIR"
    echo "Icon created successfully"
else
    echo "Warning: icon/icon.png not found, .app will use default icon"
fi

# 3. Info.plist
cat > "$APP_DIR/Contents/Info.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>$APP_NAME</string>
    <key>CFBundleIdentifier</key>
    <string>com.user.$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')</string>
    <key>CFBundleName</key>
    <string>$APP_NAME</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
</dict>
</plist>
PLIST

# 4. 清除可能阻止启动的安全属性
xattr -cr "$APP_DIR" 2>/dev/null || true

echo ".app created at: $APP_DIR"
```

**关键要点**：
- `.app` 放游戏目录内部，和 `data/`、`js/` 同级；launcher 用 `exec` 直接调 nwjs 二进制。
- `CFBundleExecutable` 与 `Contents/MacOS/` 下实际文件名必须完全一致（可含空格）。
- `CFBundleIdentifier` 不能含空格（用 `tr` 替换为连字符）。
- 双击无响应时：`xattr -cr "游戏名.app"`，再去「系统设置 → 隐私与安全性 → 仍要打开」。

## 启动方式

- **推荐**：双击 `游戏名.app`；可拖到 Dock 固定。
- **备选**：`/Applications/nwjs.app/Contents/MacOS/nwjs "/path/to/game"`
- **不推荐**：双击 `Game.exe`（Windows 可执行文件，macOS 无法运行）；把游戏文件夹拖到 nwjs.app 图标上（会以浏览器模式打开）。
- 首次运行若弹「无法打开，因为无法验证开发者」：系统设置 → 隐私与安全性 → 安全性 → 仍要打开。
