var readline = require('readline');
var fs = require('fs');

//#region LetterNode

/**
 * Нода дерева.
 * 
 * @param {any} value
 * @constructor
 */
function LetterNode(value) {
    this.value = value;
    this.children = [];
}

/**
 * Список детей ноды.
 * 
 * @type {Array?}
 */
LetterNode.prototype.children = null;

/**
 * Значение ноды
 * 
 * @type {String}
 */
LetterNode.prototype.value = null;

/**
 * Дополнтильные данные для ноды
 * 
 * @type {object}
 */
LetterNode.prototype.data = null;

/**
 * Добавить ребенка к ноде.
 * 
 * @param {any} value
 */
LetterNode.prototype.addChildren = function (value) {
    var node = this.find(value);

    if (!node) {
        node = new LetterNode(value);
        this.children.push(node);
    }
    return node;
}

/**
 * Данные ноды
 * 
 * @param {object} data
 */
LetterNode.prototype.setData = function (data) {
    this.data = data;
}

/**
 * Вывести структуру всего дерева
 * 
 * @param {any} level
 */
LetterNode.prototype.dumpStructure = function (level) {
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
 * @returns {LetterNode}
 */
LetterNode.prototype.find = function (value) {
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
    LetterNode.prototype.constructor.apply(this, arguments);
}

// Полностью наследуемся от ноды.
WordsTree.prototype = Object.create(LetterNode.prototype);
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
 * @returns {LetterNode}
 */
WordsTree.prototype.findString = function (str) {
    var node = this;

    if (typeof (str) == "string") {
        str = str.toLowerCase().split("");
    }
    while (node !== null && str.length) {
        node = node.find(str.shift());
    }
    return node;
}

//#endregion

/**
 * Хэлпер для работу с Ispell словарями
 * 
 * @constructor
 */
function Ispell() {

}

/**
 * Загрузить словари
 * 
 * @param {any} list
 * @returns {Promise}
 */
Ispell.prototype.loadDictionaries = function (list) {
    var tree = new WordsTree();

    return new Promise(function (resolve) {
        var total = list.length;
        var done = 0;

        for (var i = 0; i < total; ++i) {
            var dictionary = list[i];
            var lineReader = readline.createInterface({
                input: fs.createReadStream(list[i])
            });

            lineReader.on('line', function (line) {
                var data = line.split("/");

                tree.addString(data[0], {
                    "flags": (data[1] || "").split("")
                });
            }).on('close', () => {
                done++;
                if (total == done) {
                    resolve(tree);
                }
            });
        }
    });
}

// Экспорт.
module.exports = new Ispell();