/**
 * Помощник для работы со словарями ISPELL (https://www.cs.hmc.edu/~geoff/ispell.html).
 * 
 * @author digitorum
 */

(function (root, fabric) {
    if (typeof root.define === 'function' && root.define.amd) {
        root.define('t3xter/utilities/ispell', ['t3xter/utilities/reader'], fabric);
    } else if (typeof module != 'undefined' && module.exports) {
        module.exports = fabric(require('./reader.js'));
    } else {
        root.T3xterUtilitiesIspell = fabric(root.T3xterUtilitiesReader);
    }
})(
    this,
    function (reader) {

        //#region TreeNode

        /**
         * Нода дерева.
         * 
         * @param {any} value
         * @constructor
         */
        function TreeNode(value) {
            this.value = value;
            this.children = [];
        }

        /**
         * Список детей ноды.
         * 
         * @type {Array?}
         */
        TreeNode.prototype.children = null;

        /**
         * Значение ноды
         * 
         * @type {String}
         */
        TreeNode.prototype.value = null;

        /**
         * Дополнтильные данные для ноды
         * 
         * @type {object}
         */
        TreeNode.prototype.data = null;

        /**
         * Добавить ребенка к ноде.
         * 
         * @param {any} value
         */
        TreeNode.prototype.addChildren = function (value) {
            var node = this.find(value);

            if (!node) {
                node = new TreeNode(value);
                this.children.push(node);
            }
            return node;
        }

        /**
         * Данные ноды
         * 
         * @param {object} data
         */
        TreeNode.prototype.setData = function (data) {
            this.data = data;
        }

        /**
         * Данные ноды
         * 
         * @returns {Object}
         */
        TreeNode.prototype.getData = function () {
            return this.data || {};
        }

        /**
         * Вывести структуру всего дерева
         * 
         * @param {any} level
         */
        TreeNode.prototype.dumpStructure = function (level) {
            var str = "";

            if (!level) {
                level = 1;
            }
            str += this.value + "\n";
            this.children.forEach(function (item) {
                str += " ".repeat(level) + item.dumpStructure(level + 1);
            });
            return str;
        }

        /**
         * Найти ноду среди дочерних
         * 
         * @param {any} value
         * @returns {TreeNode}
         */
        TreeNode.prototype.find = function (value) {
            return this.children.filter(function (item) {
                return item.value == value;
            })[0] || null;
        }

        //#endregion

        //#region WordsTree

        /**
         * Дерево.
         * 
         * @constructor
         */
        function WordsTree() {
            TreeNode.prototype.constructor.apply(this, arguments);
        }

        // Полностью наследуемся от ноды.
        WordsTree.prototype = Object.create(TreeNode.prototype);
        WordsTree.prototype.constructor = WordsTree;

        /**
         * Добавить строку в дерево
         * 
         * @param {string} str
         * @param {object} data
         */
        WordsTree.prototype.addString = function (str, data) {
            var node = this;

            if (typeof (str) == "string") {
                str = str.toLowerCase().split("");
            }
            while (str.length) {
                node = node.addChildren(str.shift());
            }
            node.setData(data);
        }

        /**
         * Найти строку в дереве.
         * 
         * @param {any} str
         * @returns {TreeNode}
         */
        WordsTree.prototype.findWord = function (str) {
            var node = this;

            if (typeof (str) == "string") {
                str = str.toLowerCase().split("");
            }
            while (node !== null && str.length) {
                node = node.find(str.shift());
            }
            if (node && node.data) {
                // Если привязаны данные, значит это слово, а не промежуточная нода.
                return node;
            }
            return null;
        }

        //#endregion

        //#region AffixesTree

        function AffixesTree() {
            TreeNode.prototype.constructor.apply(this, arguments);
        }

        // Полностью наследуемся от ноды.
        AffixesTree.prototype = Object.create(TreeNode.prototype);
        AffixesTree.prototype.constructor = AffixesTree;

        /**
         * Добавить аффикс в дерево
         * 
         */
        AffixesTree.prototype.addAffix = function (modes, pattern, replacement, affix) {
            var node = this.addChildren(affix.toLowerCase());
            var data = node.getData();

            if (!data.modes) {
                data.modes = {};
            }
            modes.forEach(function (item) {
                if (!data.modes[item]) {
                    data.modes[item] = [];
                }
                data.modes[item].push({
                    pattern: pattern,
                    regexp: new RegExp(pattern + "$", "i"),
                    replacement: (replacement || "").toLowerCase()
                });
            });
            node.setData(data);
        }

        /**
         * Получить возможные навальные формы слова
         * 
         * @param {any} word
         * @returns {Array}
         */
        AffixesTree.prototype.getWordPossibleSimpleForms = function (word) {
            var total = this.children.length;
            var wordLen = word.length;
            var result = [
                word // Поумолчанию включаем слово в потенциально возможные словоформы.
            ];

            for (var i = 0; i < total; ++i) {
                var node = this.children[i];
                var data = node.getData();
                var affix = node.value;
                var affixLen = affix.length;

                if (wordLen < affixLen) {
                    continue;
                }

                if (word.substr(wordLen - affixLen, affixLen) == affix) {
                    for (var j in data.modes) {
                        data.modes[j].forEach(function (item) {
                            var possible = word.substr(0, wordLen - affixLen) + (item.replacement || "");

                            if (item.regexp.test(possible)) {
                                result.push(possible);
                            }
                        });
                    }
                }
            }
            // Возвращаем только уникальные значения.
            return result.filter(function (value, index, self) {
                return self.indexOf(value) === index;
            });
        }

        //#endregion

        /**
         * Хэлпер для работу с Ispell словарями
         * 
         * @constructor
         */
        function Ispell() { }

        /**
         * Построчно обработать файл
         * 
         * @param {any} list
         * @param {any} linePerform
         * @returns {Promise}
         */
        Ispell.prototype.loadFilesListByLine = function (list, linePerform) {
            return new Promise(function (resolve) {
                var done = 0;
                var total = list ? list.length : 0;

                if (total) {
                    for (var i = 0; i < total; ++i) {
                        var dictionary = list[i];

                        reader.lineByLine(dictionary, linePerform, function () {
                            done++;
                            if (total == done) {
                                resolve()
                            }
                        });
                    }
                } else {
                    resolve();
                }
            });
        }

        /**
         * Загрузить словари
         * 
         * @param {any} words
         * @param {any} affixes
         * @returns {Promise}
         */
        Ispell.prototype.loadDictionaries = function (words, affixes) {
            var that = this;
            var totalLists = arguments.length;
            var wordsTree = new WordsTree();
            var affixesTree = new AffixesTree();
            var affixModes = null;

            return new Promise(function (resolve) {
                var done = 0;

                /**
                 * Зарезолвить промис в момент когда все списки будут загружены
                 */
                function doResolve() {
                    done++;
                    if (totalLists == done) {
                        resolve({
                            words: wordsTree,
                            affixes: affixesTree
                        });
                    }
                }

                // Форируем дерево слов.
                that.loadFilesListByLine(words, function (line) {
                    var data = line.split("/");

                    wordsTree.addString(data[0], {
                        "flags": (data[1] || "").split("")
                    });
                }).then(doResolve);

                // Формируем дерево аффиксов.
                that.loadFilesListByLine(affixes, function (line) {
                    line = line.replace(/^[\s\t]+|[\s\t]+$/g, '');

                    if (line != "" && line[0] != "#") {
                        // Проверяем есть ли признак флага
                        var tryFlagFind = line.match(/^flag[\s\t]+\*([a-z])+:/i);

                        if (tryFlagFind) {
                            affixModes = tryFlagFind[1].split("");
                        } else {
                            if (affixModes !== null) {
                                // Проверяем есть ли правила для замены `... > -A,B`
                                var tryAffixReplace = line.match(/^(.*?)[\s\t]+>[\s\t]+\-([^\s]+),([^\s]+)/i);

                                if (tryAffixReplace) {
                                    affixModes.forEach(function () {
                                        affixesTree.addAffix(affixModes, tryAffixReplace[1].replace(/[\s\t]*/g, ''), tryAffixReplace[2], tryAffixReplace[3]);
                                    });
                                } else {
                                    // Проверяем есть ли правила добпавления `... > A`
                                    var tryAffixAdd = line.match(/^(.*?)[\s\t]+>[\s\t]+([^\s]+)/i);

                                    if (tryAffixAdd) {
                                        affixModes.forEach(function () {
                                            affixesTree.addAffix(affixModes, tryAffixAdd[1].replace(/[\s\t]*/g, ''), null, tryAffixAdd[2]);
                                        });
                                    }
                                }
                            }
                        }
                    }
                }).then(doResolve);

            });
        }

        return new Ispell();

    }
);