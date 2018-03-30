require('./utilities/ispell.js').loadDictionaries([
    './ispell-dictionaries/russian.dict'
]).then(function (tree) {
    console.log("словари загружены");
});