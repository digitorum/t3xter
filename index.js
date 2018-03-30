require('./utilities/ispell.js').loadDictionaries([
    './ispell-dictionaries/russian.dict'
], [
    './ispell-dictionaries/russian.aff'
]).then(function (trees) {
    var text = "Эпитеты как бы это ни казалось парадоксальным иллюстрируют метафоричные символы";

    console.log(text);
    text.toLowerCase().split(" ").forEach(function (word) {
        console.log(" >", word);
        trees.affixes.getWordPossibleSimpleForms(word).forEach(function (possibility) {
            if (trees.words.findWord(possibility)) {
                console.log("  <", possibility);
            }
        });
    });
});