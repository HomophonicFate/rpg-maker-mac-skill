#!/bin/bash
# rpg-maker-mac-skill 检测脚本：快速检查 RPG Maker 游戏目录结构与状态
# 用法: bash scripts/check.sh <游戏目录路径>

GAME_DIR="$1"

if [ -z "$GAME_DIR" ]; then
    echo "用法: $0 <游戏目录路径>"
    exit 1
fi

echo "=== 游戏目录结构检测 ==="
echo "目标目录: $GAME_DIR"
echo ""

# 检测 nwjs 标志文件
if [ -f "$GAME_DIR/nw.dll" ] || [ -f "$GAME_DIR/node.dll" ] || [ -f "$GAME_DIR/package.json" ]; then
    echo "[✓] 疑似 nwjs 环境"
else
    echo "[✗] 未检测到 nwjs 标志文件"
fi

# 检测 RPG Maker 版本
if [ -f "$GAME_DIR/js/rmmz_core.js" ]; then
    echo "[✓] 检测到 RPG Maker MZ (rmmz_core.js)"
elif [ -f "$GAME_DIR/js/rpg_core.js" ]; then
    echo "[✓] 检测到 RPG Maker MV (rpg_core.js)"
else
    echo "[?] 未检测到标准 RPG Maker 核心文件"
fi

# 检测 www 子目录
if [ -d "$GAME_DIR/www" ]; then
    echo "[✓] 检测到 www/ 子目录（类型 B 结构）"
    ROOT="$GAME_DIR/www"
else
    echo "[✓] 无 www/ 子目录（类型 A 结构）"
    ROOT="$GAME_DIR"
fi

# 检测游戏是否已是中文版（已汉化则跳过翻译流程）
echo ""
echo "=== 语言检测 ==="
GAME_TITLE=$(python3 -c "import json; d=json.load(open('$GAME_DIR/data/System.json')); print(d.get('gameTitle',''))" 2>/dev/null)
FONT=$(python3 -c "import json; d=json.load(open('$GAME_DIR/data/System.json')); print(d.get('advanced',{}).get('mainFontFilename',''))" 2>/dev/null)
if echo "$GAME_TITLE$FONT" | grep -qE "[一-龥]|msjhbd|msyh|simsun|msjh|MingLiU"; then
    echo "[!] 疑似已汉化版本（标题/字体含中文），可直接运行，跳过翻译流程"
else
    echo "[✓] 未检测到已汉化迹象，按需走翻译流程"
fi

# 检测翻译文件
echo ""
echo "=== 翻译文件检测 ==="
for f in "翻译文件.json" "translation.json" "translationData.json" "zh.json"; do
    if [ -f "$GAME_DIR/$f" ]; then
        echo "[✓] 发现: $GAME_DIR/$f ($(wc -c < "$GAME_DIR/$f") 字节)"
    fi
done

if [ -d "$ROOT/translations" ]; then
    echo "[✓] translations/ 目录已存在"
    ls -lh "$ROOT/translations/"
else
    echo "[✗] translations/ 目录不存在"
fi

# 检测 package.json
echo ""
echo "=== package.json 检测 ==="
if [ -f "$GAME_DIR/package.json" ]; then
    echo "[✓] 外层 package.json 存在"
    cat "$GAME_DIR/package.json" | grep -E '"name"|"main"'
fi
if [ -f "$ROOT/package.json" ]; then
    echo "[✓] 根目录 package.json 存在"
    cat "$ROOT/package.json" | grep -E '"name"|"main"'
fi

# 检测 plugins.js
echo ""
echo "=== plugins.js 检测 ==="
PLUGINS_JS="$ROOT/js/plugins.js"
if [ -f "$PLUGINS_JS" ]; then
    SIZE=$(wc -c < "$PLUGINS_JS")
    LINES=$(wc -l < "$PLUGINS_JS")
    echo "[✓] plugins.js 存在 ($SIZE 字节, $LINES 行)"
    if [ "$LINES" -eq 1 ] && [ "$SIZE" -gt 100000 ]; then
        echo "[!] 警告: plugins.js 似乎是混淆/压缩的单行代码，只能安全追加"
    else
        echo "[✓] plugins.js 似乎是人类可读的明文"
    fi
    # 检测是否已注册 DynamicTranslation
    if grep -q "DynamicTranslation" "$PLUGINS_JS"; then
        echo "[!] DynamicTranslation 似乎已被注册"
    else
        echo "[✗] DynamicTranslation 尚未注册"
    fi
else
    echo "[✗] plugins.js 不存在"
fi

# 检测 DynamicTranslation.js
echo ""
echo "=== 翻译插件检测 ==="
if [ -f "$ROOT/js/plugins/DynamicTranslation.js" ]; then
    echo "[✓] DynamicTranslation.js 已安装"
else
    echo "[✗] DynamicTranslation.js 未安装"
fi

# 检测 .app 启动器
echo ""
echo "=== 启动器检测 ==="
if find "$GAME_DIR" -maxdepth 1 -name "*.app" -type d | grep -q .; then
    echo "[✓] 游戏目录内存在 .app 启动器"
    find "$GAME_DIR" -maxdepth 1 -name "*.app" -type d
else
    echo "[✗] 未检测到 .app 启动器"
fi

echo ""
echo "=== 检测完成 ==="
