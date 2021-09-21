"use strict";
exports.__esModule = true;
exports.Nuc2D = void 0;
var Nuc2D = /** @class */ (function () {
    function Nuc2D(character, x, y, index, basePairIndex) {
        if (x === void 0) { x = 0.0; }
        if (y === void 0) { y = 0.0; }
        if (index === void 0) { index = Nuc2D.serialIndex; }
        if (basePairIndex === void 0) { basePairIndex = -1; }
        this.character = character;
        this.x = x;
        this.y = y;
        this.index = index;
        Nuc2D.serialIndex = index + 1;
        this.basePairIndex = basePairIndex;
    }
    Nuc2D.parse = function (inputLine, template) {
        if (template === void 0) { template = Nuc2D.template; }
        var inputData = inputLine.split(/\s+/);
        var character;
        var x = 0.0;
        var y = 0.0;
        var index = Nuc2D.serialIndex;
        var basePairIndex = -1;
        switch (template) {
            case "NucChar.XPos.YPos":
                x = parseFloat(inputData[1]);
                y = parseFloat(inputData[2]);
            case "NucChar":
                character = inputData[0];
                break;
            case "NucID.NucChar.XPos.YPos.FormatType.BPID":
                basePairIndex = parseInt(inputData[5]);
            case "NucID.NucChar.XPos.YPos":
                x = parseFloat(inputData[2]);
                y = parseFloat(inputData[3]);
            case "NucID.NucChar":
                index = parseInt(inputData[0]);
                character = inputData[1];
                break;
            default:
                throw new Error("Unrecognized Nuc2D format");
        }
        return new Nuc2D(character, x, y, index, basePairIndex);
    };
    Nuc2D.serialIndex = 0;
    return Nuc2D;
}());
exports.Nuc2D = Nuc2D;
