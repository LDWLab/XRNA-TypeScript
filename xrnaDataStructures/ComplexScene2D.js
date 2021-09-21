"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ComplexScene2D = void 0;
var ComplexScene_1 = require("./ComplexScene");
var ComplexScene2D = /** @class */ (function (_super) {
    __extends(ComplexScene2D, _super);
    function ComplexScene2D(name, author, psScale, landscapeModeFlag) {
        if (psScale === void 0) { psScale = 1.0; }
        if (landscapeModeFlag === void 0) { landscapeModeFlag = false; }
        return _super.call(this, name, author) || this;
    }
    return ComplexScene2D;
}(ComplexScene_1.ComplexScene));
exports.ComplexScene2D = ComplexScene2D;
