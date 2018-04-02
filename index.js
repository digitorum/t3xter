require('./utilities/ispell.js').ready(function (ispell) {
    var text = "Эпитеты как бы это ни казалось парадоксальным иллюстрируют метафоричные символы";

    console.log(text);
    text.toLowerCase().split(" ").forEach(function (word) {
        console.log(" >", word);
        ispell.getWordPossibleSimpleForms(word).forEach(function (possibility) {
            console.log("  <", possibility);
        });
    });

    console.log("\nИспользовано памяти: ");
    var used = process.memoryUsage();

    for (let key in used) {
        console.log(`  ${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    }
});