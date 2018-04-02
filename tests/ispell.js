var assert = require('assert');

describe("Заглушка", function () {
    it("Пройден", function (done) {
        done();
    });
    it("Провален", function (done) {
        done("Расшифровка");
    });
});