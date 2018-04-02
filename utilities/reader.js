
/**
 * Помощник для работы с данными.
 * 
 * @author digitorum
 */

(function (root, fabric) {
    if (typeof root.define === 'function' && root.define.amd) {
        root.define('utilities/reader', [], fabric);
    } else if (typeof module != 'undefined' && module.exports) {
        module.exports = fabric(require('readline'), require('fs'));
    } else {
        root.T3xterUtilitiesReader = fabric();
    }
})(
    this,
    function (readline, fs) {

        /**
         * Конструктор
         * 
         * @constructor
         */
        function Reader() {}

        /**
         * Прочитать файл построчно.
         * 
         * @param {string} line - Ссылка или путь до файла
         * @param {function} line - Колбэк выполняемый для каждой строки
         * @param {function} close - Колбэк выполняемый при завершении чтения
         */
        Reader.prototype.lineByLine = function (file, line, close) {
            var lineReader = readline.createInterface({
                input: fs.createReadStream(file)
            });

            lineReader.on('line', line).on('close', close);
        }

        // на экспорт отдаем иснтанс ридера.
        return new Reader();
    }
);