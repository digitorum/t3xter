var assert = require('assert');

describe("Словоформы", function () {
    var trees = null;
    var cases = [
        ["Пушкиным", "Пушкин"],
        ["эпитеты", "эпитет"],
        ["метафоричные", "метафоричный"],
        ["кварталов", "квартал"],
        ["квартальными", "квартальный"]
    ];

    // Перед началом тестов загружаем словари.
    before(function () {
        return new Promise(function (resolve) {
            ispell = require('../utilities/ispell.js').ready(function () {
                resolve();
            });
        })
        
    });

    // Тесты по поиску словоформ.
    cases.forEach(function (words) {
        it(words.join(" -> "), function () {
            assert.equal(ispell.getWordPossibleSimpleForms(words[0])[0], words[1]);
        });
    });
});



