//=============================================================================
// DynamicTranslation.js
//=============================================================================

/*:
 * @plugindesc 动态翻译系统 - 支援 mtool 工具的 key-value 翻译档案格式
 * @author Supernova
 *
 * @param Default Language
 * @desc 预设语言代码 (例如: zh, en, ja)
 * @default zh
 *
 * @param Translation Path
 * @desc 翻译档案路径 (相对于游戏根目录)
 * @default translations/
 *
 * @param Auto Detect Translations
 * @desc 是否自动侦测并载入所有可用的翻译档案
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * 动态翻译系统 - 支援 mtool 工具格式
 * ============================================================================
 *
 * 此外挂支援从 mtool 工具生成的 key-value 格式翻译档案。
 * 可以在游戏运行时动态载入翻译档案并即时切换语言。
 *
 * 翻译档案结构:
 * translations/
 *   ├── zh.json  (中文翻译)
 *   ├── en.json  (英文翻译)
 *   └── ja.json  (日文翻译)
 *
 * 翻译档案格式 (mtool 工具生成的格式):
 * {
 *   "原文文字1": "译文文字1",
 *   "原文文字2": "译文文字2",
 *   "等级": "Level",
 *   "HP": "HP",
 *   "MP": "MP",
 *   "攻击": "Attack",
 *   "防御": "Defense",
 *   "物品": "Item",
 *   "技能": "Skill",
 *   "装备": "Equip",
 *   "储存": "Save",
 *   "载入": "Load",
 *   "选项": "Options",
 *   "结束游戏": "Exit Game",
 *   "新游戏": "New Game",
 *   "继续": "Continue",
 *   "取消": "Cancel",
 *   "买入": "Buy",
 *   "卖出": "Sell",
 *   "要储存这个档案吗？": "Save this file?",
 *   "要载入这个档案吗？": "Load this file?",
 *   "%1 出现了！": "%1 appeared!",
 *   "%1 先发制人！": "%1 got the preemptive strike!",
 *   "%1 受到了 %2 点伤害！": "%1 took %2 damage!",
 *   "得到了 %1 %2！": "Gained %1 %2!",
 *   "得到了 %1 枚金币！": "Gained %1 gold!"
 * }
 *
 * 使用方法:
 * 1. 使用 mtool 工具生成翻译档案并放在 translations/ 目录中
 * 2. 系统会自动载入所有可用的翻译档案
 * 3. 在选项选单中选择语言，或使用脚本呼叫切换语言
 * 4. 所有界面文字会自动更新为新语言
 *
 * 脚本呼叫:
 *   TranslationManager.setLanguage('en');     // 切换到英文
 *   TranslationManager.getCurrentLanguage(); // 取得当前语言
 *   TranslationManager.getAvailableLanguages(); // 取得可用语言列表
 *
 * 外挂命令:
 *   SetLanguage en    // 切换到英文
 *   SetLanguage zh    // 切换到中文
 *
 * ============================================================================
 */

(function () {
    'use strict';

    // 外挂参数
    var parameters = PluginManager.parameters('DynamicTranslation');
    var defaultLanguage = parameters['Default Language'] || 'zh';
    var translationPath = parameters['Translation Path'] || 'translations/';
    var autoDetectTranslations = parameters['Auto Detect Translations'] === 'true';
    var translationMode = parameters['Translation Mode'] || 'simple'; // simple, full

    // TranslationManager 类别 - 支援 mtool 工具的 key-value 格式
    var TranslationManager = function () {
        this._currentLanguage = defaultLanguage;
        this._translations = {}; // key-value 格式的翻译字典
        this._originalTexts = {}; // 记录原文的映射
        this._isInitialized = false;
        this._refreshCallbacks = [];
        this._availableLanguages = [];
        this._enableSubstringExtraction = translationMode === 'full';
    };

    // 初始化翻译管理器
    TranslationManager.prototype.initialize = function () {
        if (this._isInitialized) return;

        this._buildOriginalTextMapping();
        if (autoDetectTranslations) {
            this._detectAvailableLanguages();
        } else {
            this._availableLanguages = [defaultLanguage];
            this.loadLanguage(defaultLanguage, function () {
                this._isInitialized = true;
                this._applyTranslations();
            }.bind(this));
        }
    };

    // 建立原文对映（从 TextManager 和系统资料建立）
    TranslationManager.prototype._buildOriginalTextMapping = function () {
        this._originalTexts = {};

        // 从 $dataSystem.terms 建立原文对映
        if ($dataSystem && $dataSystem.terms) {
            var terms = $dataSystem.terms;
            for (var category in terms) {
                if (terms.hasOwnProperty(category)) {
                    for (var id in terms[category]) {
                        if (terms[category].hasOwnProperty(id)) {
                            var originalText = terms[category][id];
                            if (originalText) {
                                this._originalTexts[originalText] = { category: category, id: id };
                            }
                        }
                    }
                }
            }
        }

        // 记录货币单位
        if ($dataSystem && $dataSystem.currencyUnit) {
            this._originalTexts[$dataSystem.currencyUnit] = { category: 'currencyUnit', id: 'currencyUnit' };
        }
    };

    // 自动侦测可用的语言档案
    TranslationManager.prototype._detectAvailableLanguages = function () {
        var testFiles = ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru'];
        var loadedCount = 0;

        testFiles.forEach(function (lang) {
            this.loadLanguage(lang, function (success) {
                loadedCount++;
                if (success && this._availableLanguages.indexOf(lang) === -1) {
                    this._availableLanguages.push(lang);
                }

                // 当所有测试完成后，载入预设语言
                if (loadedCount === testFiles.length) {
                    if (this._availableLanguages.length === 0) {
                        this._availableLanguages = [defaultLanguage];
                    }

                    this._isInitialized = true;
                    this._applyTranslations();
                }
            }.bind(this));
        }.bind(this));
    };

    // 载入指定语言的翻译档案
    TranslationManager.prototype.loadLanguage = function (language, callback) {
        var filename = translationPath + language + '.json';
        var xhr = new XMLHttpRequest();

        xhr.open('GET', filename);
        xhr.overrideMimeType('application/json');
        xhr.onload = function () {
            if (xhr.status < 400) {
                try {
                    var translations = JSON.parse(xhr.responseText);
                    this._translations[language] = translations;
                    console.log('翻译载入成功:', language, Object.keys(translations).length, '个项目');
                    console.log('载入的翻译项目范例:', Object.keys(translations).slice(0, 5));
                    if (callback) callback(true);
                } catch (e) {
                    console.error('翻译档案解析失败:', filename, e);
                    if (callback) callback(false);
                }
            } else {
                console.warn('翻译档案载入失败:', filename, '状态码:', xhr.status);
                if (callback) callback(false);
            }
        }.bind(this);

        xhr.onerror = function () {
            console.warn('无法载入翻译档案:', filename);
            if (callback) callback(false);
        };

        xhr.send();
    };

    // 设定当前语言
    TranslationManager.prototype.setLanguage = function (language) {
        if (this._currentLanguage === language) return;

        if (!this._translations[language]) {
            this.loadLanguage(language, function (success) {
                if (success) {
                    this._currentLanguage = language;
                    this._applyTranslations();
                    this._refreshAllWindows();
                }
            }.bind(this));
        } else {
            this._currentLanguage = language;
            this._applyTranslations();
            this._refreshAllWindows();
        }
    };

    // 取得当前语言
    TranslationManager.prototype.getCurrentLanguage = function () {
        return this._currentLanguage;
    };

    // 取得可用语言列表
    TranslationManager.prototype.getAvailableLanguages = function () {
        return this._availableLanguages.slice();
    };

    // 提取对应的翻译部分
    TranslationManager.prototype._extractCorrespondingTranslation = function (originalPart, fullKey, fullTranslation, keyIndex) {
        // 专门处理 RPG Maker 中的讯息分割情况

        // 分割原文和翻译为行
        var originalLines = fullKey.split('\n');
        var translationLines = fullTranslation.split('\n');

        // 如果行数相同，尝试按行匹配
        if (originalLines.length === translationLines.length && originalLines.length > 1) {
            // 计算子字串在哪一行
            var currentPos = 0;
            for (var i = 0; i < originalLines.length; i++) {
                var lineStart = currentPos;
                var lineEnd = currentPos + originalLines[i].length + (i < originalLines.length - 1 ? 1 : 0); // +1 for \n

                if (keyIndex >= lineStart && keyIndex < lineEnd) {
                    // 子字串在这一行中
                    var relativeIndex = keyIndex - lineStart;
                    var relativeLength = Math.min(originalPart.length, originalLines[i].length - relativeIndex);

                    // 在对应的翻译行中提取
                    var translatedLine = translationLines[i];
                    if (translatedLine) {
                        // 使用比例映射起始和结束位置
                        var lineRatio = translatedLine.length / originalLines[i].length;

                        var transStart = Math.floor(relativeIndex * lineRatio);
                        var transEnd;

                        // 如果原文子字串延伸到行尾，则译文也延伸到行尾
                        if (relativeIndex + relativeLength >= originalLines[i].length) {
                            transEnd = translatedLine.length;
                        } else {
                            transEnd = Math.floor((relativeIndex + relativeLength) * lineRatio);
                        }

                        return translatedLine.substring(transStart, transEnd);
                    }
                }

                currentPos = lineEnd;
            }
        }

        // 方法2: 如果长度比例接近，使用比例提取
        if (Math.abs(fullTranslation.length - fullKey.length) / fullKey.length < 0.5) {
            var startRatio = keyIndex / fullKey.length;
            var endRatio = (keyIndex + originalPart.length) / fullKey.length;

            var translationStart = Math.round(startRatio * fullTranslation.length);
            var translationEnd = Math.round(endRatio * fullTranslation.length);

            translationStart = Math.max(0, Math.min(translationStart, fullTranslation.length));
            translationEnd = Math.max(translationStart, Math.min(translationEnd, fullTranslation.length));

            var result = fullTranslation.substring(translationStart, translationEnd);

            // 如果结果包含换行但原文不包含，清理换行
            if (originalPart.indexOf('\n') === -1 && result.indexOf('\n') !== -1) {
                // 只保留第一行
                result = result.split('\n')[0];
            }

            return result;
        }

        // 方法3: 简单的长度比例估计（最后的后备方案）
        var estimatedLength = Math.round(originalPart.length * (fullTranslation.length / fullKey.length));
        var estimatedStart = Math.round(keyIndex * (fullTranslation.length / fullKey.length));

        estimatedStart = Math.max(0, Math.min(estimatedStart, fullTranslation.length));
        estimatedLength = Math.max(1, Math.min(estimatedLength, fullTranslation.length - estimatedStart));

        var result = fullTranslation.substring(estimatedStart, estimatedStart + estimatedLength);

        // 清理结果：移除不必要的换行
        if (originalPart.indexOf('\n') === -1 && result.indexOf('\n') !== -1) {
            result = result.replace(/\n/g, '');
        }

        return result;
    };

    // 翻译文字（支援 mtool 工具的 key-value 格式）
    TranslationManager.prototype.translate = function (originalText) {
        if (!originalText || !this._isInitialized) {
            return originalText;
        }

        var currentTranslations = this._translations[this._currentLanguage];
        if (!currentTranslations) {
            return originalText;
        }

        // 直接查找翻译
        var translatedText = currentTranslations[originalText];
        if (translatedText !== undefined) {
            // 调试：记录成功翻译的文字
            if (Math.random() < 0.01) { // 只记录 1% 的翻译以避免刷屏
                console.log('翻译:', originalText.substring(0, 50) + (originalText.length > 50 ? '...' : ''), '->', translatedText.substring(0, 50) + (translatedText.length > 50 ? '...' : ''));
            }
            return translatedText;
        }

        // 如果找不到完整翻译，尝试清理可能的格式差异后再查找
        var cleanedText = originalText.trim();
        if (cleanedText !== originalText) {
            translatedText = currentTranslations[cleanedText];
            if (translatedText !== undefined) {
                return translatedText;
            }
        }

        // 处理单行文字的特殊情况 (Substring Extraction)
        if (this._enableSubstringExtraction && originalText.indexOf('\n') === -1) {
            // 查找包含此文字的完整讯息翻译
            for (var key in currentTranslations) {
                if (currentTranslations.hasOwnProperty(key)) {
                    // 如果原文是某个完整讯息的子字串，尝试提取对应的翻译部分
                    var keyIndex = key.indexOf(originalText);
                    if (keyIndex !== -1 && key !== originalText) { // 排除已经检查过的直接匹配
                        var translatedKey = currentTranslations[key];
                        // 正确提取对应的翻译部分，保持相对位置
                        var translatedPart = this._extractCorrespondingTranslation(originalText, key, translatedKey, keyIndex);
                        // console.log('子字串翻译找到:', originalText, '->', translatedPart, '(来自完整讯息)');
                        return translatedPart;
                    }
                }
            }
        }

        return originalText;
    };

    // 取得翻译系统状态（用于调试）
    TranslationManager.prototype.getStatus = function () {
        return {
            isInitialized: this._isInitialized,
            currentLanguage: this._currentLanguage,
            availableLanguages: this._availableLanguages,
            loadedTranslations: Object.keys(this._translations),
            translationCount: this._availableLanguages.reduce((count, lang) => {
                return count + (this._translations[lang] ? Object.keys(this._translations[lang]).length : 0);
            }, 0)
        };
    };

    // 套用翻译到 TextManager
    TranslationManager.prototype._applyTranslations = function () {
        if (!this._isInitialized) return;

        // 备份原始的 TextManager 方法
        if (!TextManager._originalBasic) {
            TextManager._originalBasic = TextManager.basic;
            TextManager._originalParam = TextManager.param;
            TextManager._originalCommand = TextManager.command;
            TextManager._originalMessage = TextManager.message;
            TextManager._originalGetter = TextManager.getter;
        }

        var self = this;

        // 覆盖 TextManager 方法
        TextManager.basic = function (basicId) {
            var originalText = TextManager._originalBasic ? TextManager._originalBasic(basicId) : $dataSystem.terms.basic[basicId] || '';
            return self.translate(originalText);
        };

        TextManager.param = function (paramId) {
            var originalText = TextManager._originalParam ? TextManager._originalParam(paramId) : $dataSystem.terms.params[paramId] || '';
            return self.translate(originalText);
        };

        TextManager.command = function (commandId) {
            var originalText = TextManager._originalCommand ? TextManager._originalCommand(commandId) : $dataSystem.terms.commands[commandId] || '';
            return self.translate(originalText);
        };

        TextManager.message = function (messageId) {
            var originalText = TextManager._originalMessage ? TextManager._originalMessage(messageId) : $dataSystem.terms.messages[messageId] || '';
            return self.translate(originalText);
        };

        // 处理动态属性
        if (TextManager._originalGetter) {
            var originalGetter = TextManager._originalGetter;
            TextManager.getter = function (method, param) {
                return {
                    get: function () {
                        var originalText = this[method](param);
                        return self.translate(originalText);
                    }.bind(originalGetter(method, param))
                };
            };
        }

        // 处理货币单位
        if (typeof TextManager.currencyUnit === 'object' && TextManager.currencyUnit.get) {
            var originalCurrencyUnit = $dataSystem ? $dataSystem.currencyUnit : '';
            Object.defineProperty(TextManager, 'currencyUnit', {
                get: function () {
                    return self.translate(originalCurrencyUnit);
                },
                configurable: true
            });
        }
    };

    // 重新整理所有视窗
    TranslationManager.prototype._refreshAllWindows = function () {
        if (SceneManager._scene) {
            SceneManager._scene._refreshAllWindows();
        }

        // 呼叫所有注册的重新整理回呼
        this._refreshCallbacks.forEach(function (callback) {
            if (typeof callback === 'function') {
                callback();
            }
        });
    };

    // 注册重新整理回呼
    TranslationManager.prototype.onRefresh = function (callback) {
        if (typeof callback === 'function') {
            this._refreshCallbacks.push(callback);
        }
    };

    // 移除重新整理回呼
    TranslationManager.prototype.offRefresh = function (callback) {
        var index = this._refreshCallbacks.indexOf(callback);
        if (index >= 0) {
            this._refreshCallbacks.splice(index, 1);
        }
    };

    // 建立全域实例
    window.TranslationManager = TranslationManager;
    window.$translationManager = new TranslationManager();

    // 在 DataManager 载入完成后初始化翻译管理器
    var _DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function (object) {
        _DataManager_onLoad.call(this, object);

        if (object === $dataSystem) {
            // 系统资料载入完成后初始化翻译管理器
            $translationManager.initialize();
        }
    };

    // 扩展 Scene_Base 来支援视窗重新整理
    var _Scene_Base_create = Scene_Base.prototype.create;
    Scene_Base.prototype.create = function () {
        _Scene_Base_create.call(this);
        this._refreshAllWindows = this._refreshAllWindows || function () {
            this.children.forEach(function (child) {
                if (child.refresh && typeof child.refresh === 'function') {
                    child.refresh();
                }
            });
        };
    };

    // 扩展 Window_Options 来支援语言选择
    var _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
    Window_Options.prototype.makeCommandList = function () {
        _Window_Options_makeCommandList.call(this);
        this.addLanguageOption();
    };

    Window_Options.prototype.addLanguageOption = function () {
        var languages = this.getAvailableLanguages();
        if (languages.length > 1) {
            this.addCommand('Language / 语言', 'language');
        }
    };

    Window_Options.prototype.getAvailableLanguages = function () {
        return $translationManager ? $translationManager.getAvailableLanguages() : ['zh'];
    };

    var _Window_Options_statusText = Window_Options.prototype.statusText;
    Window_Options.prototype.statusText = function (index) {
        var symbol = this.commandSymbol(index);
        if (symbol === 'language') {
            return this.getCurrentLanguageName();
        }
        return _Window_Options_statusText.call(this, index);
    };

    Window_Options.prototype.getCurrentLanguageName = function () {
        var currentLang = $translationManager ? $translationManager.getCurrentLanguage() : 'zh';
        var langNames = {
            'zh': '中文',
            'en': 'English',
            'ja': '日本语',
            'ko': '한국어',
            'fr': 'Français',
            'de': 'Deutsch',
            'es': 'Español',
            'pt': 'Português',
            'ru': 'Русский'
        };
        return langNames[currentLang] || currentLang.toUpperCase();
    };

    Window_Options.prototype.processOk = function () {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        if (symbol === 'language') {
            this.changeLanguage();
        } else {
            Window_Command.prototype.processOk.call(this);
        }
    };

    Window_Options.prototype.changeLanguage = function () {
        var languages = this.getAvailableLanguages();
        var currentLang = $translationManager ? $translationManager.getCurrentLanguage() : 'zh';
        var currentIndex = languages.indexOf(currentLang);
        var nextIndex = (currentIndex + 1) % languages.length;

        if ($translationManager) {
            $translationManager.setLanguage(languages[nextIndex]);
            ConfigManager.language = languages[nextIndex];
            this.redrawCurrentItem();
            SoundManager.playCursor();
        }
    };

    // 扩展 ConfigManager 来支援语言设定
    var _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function () {
        var config = _ConfigManager_makeData.call(this);
        config.language = this.language;
        return config;
    };

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function (config) {
        _ConfigManager_applyData.call(this, config);
        this.language = config.language || 'zh';
        if ($translationManager && this.language !== $translationManager.getCurrentLanguage()) {
            $translationManager.setLanguage(this.language);
        }
    };

    // 外挂命令
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'SetLanguage' && args.length > 0 && $translationManager) {
            $translationManager.setLanguage(args[0]);
        }
    };

    // 建立全域实例并公开 API
    window.TranslationManager = TranslationManager;
    window.$translationManager = new TranslationManager();

    // 覆盖 Game_Message 的 add 方法来支援翻译
    var _Game_Message_add = Game_Message.prototype.add;
    Game_Message.prototype.add = function (text) {
        if (window.$translationManager && window.$translationManager._isInitialized) {
            text = window.$translationManager.translate(text);
        }
        _Game_Message_add.call(this, text);
    };

    // 覆盖 Window_Message 的 startMessage 方法来支援多行翻译
    var _Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function () {
        _Window_Message_startMessage.call(this);

        // 如果翻译系统已初始化，处理多行文字翻译
        if (window.$translationManager && window.$translationManager._isInitialized) {
            var originalText = this._textState.text;

            // 首先尝试翻译完整的多行文字
            var fullTranslation = window.$translationManager.translate(originalText);

            // 如果完整翻译成功，检查是否包含换行符并正确处理
            if (fullTranslation !== originalText) {
                this._textState.text = fullTranslation;
            } else {
                // 如果完整翻译失败，尝试按行翻译（保持向后兼容）
                var translatedLines = [];
                var lines = originalText.split('\n');

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.trim()) { // 只翻译非空行
                        var translatedLine = window.$translationManager.translate(line);
                        translatedLines.push(translatedLine !== line ? translatedLine : line);
                    } else {
                        translatedLines.push(line); // 保留空行
                    }
                }

                // 重新组合翻译后的文字
                this._textState.text = translatedLines.join('\n');
            }
        }
    };

    // 为构造函数添加静态方法
    TranslationManager.getStatus = function () {
        if (window.$translationManager) {
            return window.$translationManager.getStatus();
        }
        return null;
    };

    TranslationManager.setLanguage = function (language) {
        if (window.$translationManager) {
            return window.$translationManager.setLanguage(language);
        }
        return null;
    };

    TranslationManager.getCurrentLanguage = function () {
        if (window.$translationManager) {
            return window.$translationManager.getCurrentLanguage();
        }
        return null;
    };

    TranslationManager.getAvailableLanguages = function () {
        if (window.$translationManager) {
            return window.$translationManager.getAvailableLanguages();
        }
        return [];
    };

    // 为 DTextPicture 外挂提供的方法
    TranslationManager.translateIfNeed = function (text, callback) {
        if (window.$translationManager && window.$translationManager._isInitialized) {
            var translatedText = window.$translationManager.translate(text);
            if (callback && typeof callback === 'function') {
                callback(translatedText);
            }
            return translatedText;
        } else {
            if (callback && typeof callback === 'function') {
                callback(text);
            }
            return text;
        }
    };

    // 立即初始化翻译管理器（如果系统资料已载入）
    var initTranslationManager = function () {
        if (window.$translationManager && !$translationManager._isInitialized) {
            if ($dataSystem) {
                $translationManager.initialize();
            } else {
                // 在 DataManager 载入完成后初始化翻译管理器
                var _DataManager_onLoad = DataManager.onLoad;
                DataManager.onLoad = function (object) {
                    _DataManager_onLoad.call(this, object);

                    if (object === $dataSystem) {
                        // 系统资料载入完成后初始化翻译管理器
                        $translationManager.initialize();
                    }
                };
            }
        }
    };

    // 尝试立即初始化
    initTranslationManager();

})();
