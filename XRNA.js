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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.XRNA = exports.Utils = exports.AffineMatrix3D = exports.VectorOperations2D = exports.ButtonIndex = void 0;
var svgNameSpaceURL = "http://www.w3.org/2000/svg";
var DEFAULT_STROKE_WIDTH = 0.2;
var SelectionConstraint = /** @class */ (function () {
    function SelectionConstraint() {
    }
    SelectionConstraint.prototype.populateXRNASelection = function (clickedOnNucleotideHTML, selectedNucleotideIndices) {
        selectedNucleotideIndices.forEach(function (selectedNucleotideIndicesI) {
            var nucleotide = XRNA.rnaComplexes[selectedNucleotideIndicesI.rnaComplexIndex].rnaMolecules[selectedNucleotideIndicesI.rnaMoleculeIndex].nucleotides[selectedNucleotideIndicesI.nucleotideIndex], nucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(selectedNucleotideIndicesI.rnaComplexIndex), selectedNucleotideIndicesI.rnaMoleculeIndex), selectedNucleotideIndicesI.nucleotideIndex), nucleotideHTML = document.getElementById(nucleotideId), transformCoordinates = /\s*translate\s*\(\s*(-?\d+(?:\.\d*)?)\s+(-?\d+(?:\.\d*)?)\s*\)\s*/.exec(nucleotideHTML.getAttribute("transform"));
            SelectionConstraint.populateXRNASelectionHighlightsHelper(selectedNucleotideIndicesI.rnaComplexIndex, selectedNucleotideIndicesI.rnaMoleculeIndex, selectedNucleotideIndicesI.nucleotideIndex, nucleotideId, nucleotide);
            XRNA.selection.selectedElementListeners.push(new /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_1.prototype.updateXYHelper = function (x, y) {
                    nucleotide.position = {
                        x: x,
                        y: y
                    };
                };
                return class_1;
            }(SelectedElementListener))(nucleotide.position.x, nucleotide.position.y, true, false), new /** @class */ (function (_super) {
                __extends(class_2, _super);
                function class_2() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_2.prototype.updateXYHelper = function (x, y) {
                    nucleotideHTML.setAttribute("transform", "translate(" + x + " " + y + ")");
                };
                return class_2;
            }(SelectedElementListener))(parseFloat(transformCoordinates[1]), parseFloat(transformCoordinates[2]), false, false));
        });
    };
    SelectionConstraint.populateXRNASelectionHighlightsHelper = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex, nucleotideId, nucleotide) {
        if (nucleotideId === void 0) { nucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex); }
        if (nucleotide === void 0) { nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex]; }
        var boundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(nucleotideId));
        boundingBoxHTML.setAttribute("visibility", "block");
        XRNA.selection.highlighted.push(boundingBoxHTML);
        if (nucleotide.labelLine) {
            var labelLineHTMLId = XRNA.labelLineHTMLId(nucleotideId), labelLineClickableBodyHTML = document.getElementById(XRNA.labelLineClickableBodyHTMLId(labelLineHTMLId)), labelLineClickableCap0HTML = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineHTMLId, 0)), labelLineClickableCap1HTML = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineHTMLId, 1));
            labelLineClickableBodyHTML.setAttribute("visibility", "block");
            labelLineClickableCap0HTML.setAttribute("visibility", "block");
            labelLineClickableCap1HTML.setAttribute("visibility", "block");
            XRNA.selection.highlighted.push(labelLineClickableBodyHTML, labelLineClickableCap0HTML, labelLineClickableCap1HTML);
        }
        if (nucleotide.labelContent) {
            var labelContentBoundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(XRNA.labelContentHTMLId(nucleotideId)));
            labelContentBoundingBoxHTML.setAttribute("visibility", "block");
            XRNA.selection.highlighted.push(labelContentBoundingBoxHTML);
        }
    };
    SelectionConstraint.createErrorMessageForSelection = function (requirementDescription, selectableDescription, furtherExplanation) {
        if (furtherExplanation === void 0) { furtherExplanation = ""; }
        return "The selection constraint \"" + XRNA.selectionConstraintHTML.value + "\" requires selection of " + requirementDescription + ". Select " + selectableDescription + " or change the selection constraint. " + furtherExplanation;
    };
    return SelectionConstraint;
}());
var SelectedElementListener = /** @class */ (function () {
    function SelectedElementListener(x, y, invertYFlag, xyAreDisplacementsFlag) {
        this.cache = {
            x: x,
            y: y
        };
        this.invertYFlag = invertYFlag;
        this.xyAreDisplacementsFlag = xyAreDisplacementsFlag;
    }
    return SelectedElementListener;
}());
;
var OutputFileExtensionHandler = /** @class */ (function () {
    function OutputFileExtensionHandler() {
    }
    OutputFileExtensionHandler.prototype.handleSelectedOutputFileExtension = function () {
        while (XRNA.outputFileSpecificationsDivHTML.firstChild) {
            XRNA.outputFileSpecificationsDivHTML.removeChild(XRNA.outputFileSpecificationsDivHTML.firstChild);
        }
    };
    return OutputFileExtensionHandler;
}());
;
var ButtonIndex;
(function (ButtonIndex) {
    ButtonIndex[ButtonIndex["NONE"] = 0] = "NONE";
    ButtonIndex[ButtonIndex["LEFT"] = 1] = "LEFT";
    ButtonIndex[ButtonIndex["RIGHT"] = 2] = "RIGHT";
    ButtonIndex[ButtonIndex["LEFT_RIGHT"] = 3] = "LEFT_RIGHT";
    ButtonIndex[ButtonIndex["MIDDLE"] = 4] = "MIDDLE";
    ButtonIndex[ButtonIndex["LEFT_MIDDLE"] = 5] = "LEFT_MIDDLE";
    ButtonIndex[ButtonIndex["RIGHT_MIDDLE"] = 6] = "RIGHT_MIDDLE";
    ButtonIndex[ButtonIndex["LEFT_RIGHT_MIDDLE"] = 7] = "LEFT_RIGHT_MIDDLE";
})(ButtonIndex = exports.ButtonIndex || (exports.ButtonIndex = {}));
var VectorOperations2D = /** @class */ (function () {
    function VectorOperations2D() {
    }
    VectorOperations2D.dotProduct = function (v0, v1) {
        return v0.x * v1.x + v0.y * v1.y;
    };
    VectorOperations2D.scalarProjection = function (v0, v1) {
        // a^k * b^k == (a * b)^k
        // sqrt(a * a) * sqrt(b * b) == sqrt(a * a * b * b)
        return VectorOperations2D.dotProduct(v0, v1) / Math.sqrt(VectorOperations2D.magnitudeSquared(v0) * VectorOperations2D.magnitudeSquared(v1));
    };
    VectorOperations2D.vectorProjection = function (v0, v1) {
        return VectorOperations2D.scaleUp(v1, VectorOperations2D.scalarProjection(v0, v1));
    };
    VectorOperations2D.vectorRejection = function (v0, v1) {
        return VectorOperations2D.subtract(v0, VectorOperations2D.vectorProjection(v0, v1));
    };
    VectorOperations2D.projectOntoLine = function (v, l) {
        var dv = VectorOperations2D.subtract(l.v1, l.v0);
        return VectorOperations2D.add(l.v0, VectorOperations2D.vectorProjection(v, dv));
    };
    VectorOperations2D.reflectAboutLine = function (v, l) {
        return VectorOperations2D.subtract(v, VectorOperations2D.scaleUp(VectorOperations2D.vectorRejection(VectorOperations2D.subtract(v, l.v0), VectorOperations2D.subtract(l.v1, l.v0)), 2.0));
    };
    VectorOperations2D.scaleUp = function (vector, scalar) {
        return {
            x: vector.x * scalar,
            y: vector.y * scalar
        };
    };
    VectorOperations2D.scaleDown = function (vector, divisor) {
        return VectorOperations2D.scaleUp(vector, 1.0 / divisor);
    };
    VectorOperations2D.normalize = function (vector) {
        return VectorOperations2D.scaleDown(vector, VectorOperations2D.magnitude(vector));
    };
    VectorOperations2D.linearlyInterpolate = function (n0, n1, interpolationFactor) {
        // See https://en.wikipedia.org/wiki/Linear_interpolation
        return (1 - interpolationFactor) * n0 + interpolationFactor * n1;
    };
    VectorOperations2D.add = function (v0, v1) {
        return {
            x: v0.x + v1.x,
            y: v0.y + v1.y
        };
    };
    VectorOperations2D.subtract = function (v0, v1) {
        return {
            x: v0.x - v1.x,
            y: v0.y - v1.y
        };
    };
    VectorOperations2D.negate = function (v) {
        return {
            x: -v.x,
            y: -v.y
        };
    };
    VectorOperations2D.multiply = function (v0, v1) {
        return {
            x: v0.x * v1.x,
            y: v0.y * v1.y
        };
    };
    VectorOperations2D.divide = function (v0, v1) {
        return {
            x: v0.x / v1.x,
            y: v0.y / v1.y
        };
    };
    VectorOperations2D.magnitudeSquared = function (v) {
        return v.x * v.x + v.y * v.y;
    };
    VectorOperations2D.magnitude = function (v) {
        return Math.sqrt(VectorOperations2D.magnitudeSquared(v));
    };
    VectorOperations2D.distanceSquared = function (v0, v1) {
        return VectorOperations2D.magnitudeSquared(VectorOperations2D.subtract(v1, v0));
    };
    VectorOperations2D.distance = function (v0, v1) {
        return Math.sqrt(VectorOperations2D.distanceSquared(v0, v1));
    };
    VectorOperations2D.crossProduct = function (v0, v1) {
        return v0.x * v1.y - v0.y * v1.x;
    };
    VectorOperations2D.crossProduct2D = function (v0, v1) {
        return v0.x * v1.y - v0.y * v1.x;
    };
    VectorOperations2D.orthogonalize = function (v) {
        return {
            x: -v.y,
            y: v.x
        };
    };
    VectorOperations2D.lineIntersection = function (line0, line1) {
        // See https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
        var dX0 = line0.v1.x - line0.v0.x, dY0 = line0.v1.y - line0.v0.y, dX1 = line1.v1.x - line1.v0.x, dY1 = line1.v1.y - line1.v0.y, rCrossS = VectorOperations2D.crossProduct2D({
            x: dX0,
            y: dY0
        }, {
            x: dX1,
            y: dY1
        }), qMinusPCrossR = VectorOperations2D.crossProduct2D(VectorOperations2D.subtract(line1.v0, line0.v0), {
            x: dX0,
            y: dY0
        });
        if (Utils.areApproximatelyEqual(rCrossS, 0)) {
            if (Utils.areApproximatelyEqual(qMinusPCrossR, 0)) {
                // The lines are colinear
                return line0;
            }
            else {
                return null;
            }
        }
        else {
            var u = qMinusPCrossR / rCrossS;
            return {
                x: VectorOperations2D.linearlyInterpolate(line1.v0.x, line1.v1.x, u),
                y: VectorOperations2D.linearlyInterpolate(line1.v0.y, line1.v1.y, u)
            };
        }
    };
    VectorOperations2D.unsignedAngleBetweenVectors = function (v0, v1) {
        // a * b == cos(theta) * ||a|| * ||b||
        // a * b / (||a|| * ||b||) == cos(theta)
        // acos(a * b / (||a|| * ||b||)) == theta
        return Math.acos(VectorOperations2D.dotProduct(v0, v1) / Math.sqrt(VectorOperations2D.magnitudeSquared(v0) * VectorOperations2D.magnitudeSquared(v1)));
    };
    return VectorOperations2D;
}());
exports.VectorOperations2D = VectorOperations2D;
var AffineMatrix3D = /** @class */ (function () {
    function AffineMatrix3D(n0, n1, n2, n3, n4, n5, rowMajorOrder) {
        if (rowMajorOrder === void 0) { rowMajorOrder = false; }
        if (rowMajorOrder) {
            this.scaleX = n0;
            this.skewX = n1;
            this.translateX = n2;
            this.skewY = n3;
            this.scaleY = n4;
            this.translateY = n5;
        }
        else {
            this.scaleX = n0;
            this.skewY = n1;
            this.skewX = n2;
            this.scaleY = n3;
            this.translateX = n4;
            this.translateY = n5;
        }
    }
    AffineMatrix3D.identity = function () {
        return new AffineMatrix3D(1, 0, 0, 0, 1, 0, true);
    };
    AffineMatrix3D.translate = function (dx, dy) {
        return new AffineMatrix3D(1, 0, dx, 0, 1, dy, true);
    };
    AffineMatrix3D.scale = function (sx, sy) {
        return new AffineMatrix3D(sx, 0, 0, 0, sy, 0, true);
    };
    AffineMatrix3D.parseTransform = function (transform) {
        // Note that DOMMatrix did not work, appeared to contain a bug when multiplying a translation and a scale.
        var matrix = new AffineMatrix3D(1, 0, 0, 0, 1, 0, true);
        transform.trim().split(/\)\s+/g).forEach(function (transformI) {
            var coordinates = transformI.match(/-?[\d\.]+/g);
            if (transformI.startsWith('translate')) {
                var translation = AffineMatrix3D.translate(parseFloat(coordinates[0]), parseFloat(coordinates[1]));
                matrix = AffineMatrix3D.multiply(matrix, translation);
            }
            else if (transformI.startsWith('scale')) {
                var scale = AffineMatrix3D.scale(parseFloat(coordinates[0]), parseFloat(coordinates[1]));
                matrix = AffineMatrix3D.multiply(matrix, scale);
            }
        });
        return matrix;
    };
    AffineMatrix3D.multiply = function (left, right) {
        /*
        [sx0  skx0 dx0] * [sx1  skx1 dx1] = [sx0 * sx1 + skx0 * sky1   sx0 * skx1 + skx0 * sy1   sx0 * dx1 + skx0 * dy1 + dx0]
        [sky0 sy0  dy0]   [sky1 sy1  dy1]   [sky0 * sx1 + sy0 * sky1   sky0 * skx1 + sy0 * sy1   sky0 * dx1 + sy0 * dy1 + dy0]
        [0    0    1  ]   [0    0    1  ]   [0                         0                         1                           ]
        */
        return new AffineMatrix3D(left.scaleX * right.scaleX + left.skewX * right.skewY, left.scaleX * right.skewX + left.skewX * right.scaleY, left.scaleX * right.translateX + left.skewX * right.translateY + left.translateX, left.skewY * right.scaleX + left.scaleY * right.skewY, left.skewY * right.skewX + left.scaleY * right.scaleY, left.skewY * right.translateX + left.scaleY * right.translateY + left.translateY, true);
    };
    AffineMatrix3D.transform = function (matrix, vector2) {
        /*
        [sx  skx dx]   [x]   [sx * x + skx * y + dx]
        [sky sy  dy] * [y] = [sky * x + sy * y + dy]
        [0   0   1 ]   [1]   [1                    ]
        */
        return {
            x: matrix.scaleX * vector2.x + matrix.skewX * vector2.y + matrix.translateX,
            y: matrix.skewY * vector2.x + matrix.scaleY * vector2.y + matrix.translateY
        };
    };
    return AffineMatrix3D;
}());
exports.AffineMatrix3D = AffineMatrix3D;
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.getFileExtension = function (fileUrl) {
        fileUrl = fileUrl.trim();
        return fileUrl.substring(fileUrl.lastIndexOf(".") + 1);
    };
    Utils.openUrl = function (fileUrl) {
        fileUrl = fileUrl.trim();
        var request = new XMLHttpRequest();
        request.open("GET", fileUrl, false);
        request.responseType = "blob";
        var blob;
        request.onload = function () {
            blob = request.response;
        };
        request.send();
        return {
            blob: blob,
            extension: Utils.getFileExtension(fileUrl)
        };
    };
    Utils.getFileContent = function (blob, fileContentHandler) {
        var fileContent;
        new Promise(function (executor) {
            var fileReader = new FileReader();
            fileReader.addEventListener("load", function () { return executor(fileReader.result.toString()); });
            fileReader.readAsText(blob, "UTF-8");
        }).then(function (readFileContent) {
            fileContentHandler(readFileContent);
        });
    };
    Utils.clamp = function (minimum, value, maximum) {
        return Math.min(Math.max(minimum, value), maximum);
    };
    Utils.sign = function (n, epsilon) {
        if (epsilon === void 0) { epsilon = Utils.DEFAULT_EPSILON; }
        return n < -epsilon ? -1 : n < epsilon ? 0 : 1;
    };
    Utils.compare = function (n0, n1, epsilon) {
        if (epsilon === void 0) { epsilon = Utils.DEFAULT_EPSILON; }
        return Utils.sign(n1 - n0, epsilon);
    };
    Utils.areApproximatelyEqual = function (n0, n1, epsilon) {
        if (epsilon === void 0) { epsilon = Utils.DEFAULT_EPSILON; }
        return Utils.compare(n0, n1, epsilon) == 0;
    };
    Utils.parseRGB = function (rgbAsString) {
        var rgbAsNumber = parseInt(rgbAsString), validColorFlag = true;
        if (isNaN(rgbAsNumber)) {
            // Attempt parsing as a hexadecimal string.
            rgbAsNumber = parseInt("0x" + rgbAsString);
            validColorFlag = !isNaN(rgbAsNumber);
        }
        if (validColorFlag) {
            return {
                red: (rgbAsNumber >> 16) & 0xFF,
                green: (rgbAsNumber >> 8) & 0xFF,
                blue: rgbAsNumber & 0xFF
            };
        }
        else {
            throw new Error("Invalid color string: " + rgbAsString + " is an invalid color. Only hexadecimal or integer values are accepted.");
        }
    };
    Utils.compressRGB = function (rgb) {
        return ((rgb.red << 16) | (rgb.green << 8) | (rgb.blue));
    };
    Utils.expandRGB = function (rgb) {
        return {
            red: rgb & 0xFF0000,
            green: rgb & 0xFF00,
            blue: rgb & 0xFF
        };
    };
    Utils.toHexadecimalString = function (color) {
        return Utils.compressRGB(color).toString(16);
    };
    Utils.getButtonIndex = function (event) {
        var index = -1;
        /*if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
            index = -1;
        } else */ if ("buttons" in event) {
            index = event.buttons;
        }
        else if ("which" in event) {
            index = event.which;
        }
        else {
            index = event.button;
        }
        if (index in ButtonIndex) {
            return index;
        }
        throw new Error("Unrecognized button index: " + index);
    };
    Utils.invertYCoordinateTransform = function (y) {
        return "translate(0 " + y + ") scale(1 -1) translate(0 " + -y + ")";
    };
    Utils.setBoundingBoxHTMLAttributes = function (boundingBoxLikeHTML, id) {
        boundingBoxLikeHTML.setAttribute("id", id);
        boundingBoxLikeHTML.setAttribute("visibility", "hidden");
        boundingBoxLikeHTML.setAttribute("stroke", "red");
        boundingBoxLikeHTML.setAttribute("stroke-width", "" + DEFAULT_STROKE_WIDTH);
        boundingBoxLikeHTML.setAttribute("fill", "none");
    };
    Utils.createBoundingBoxHTML = function (boundingBox, id) {
        var boundingBoxHTML = document.createElementNS(svgNameSpaceURL, "rect");
        boundingBoxHTML.setAttribute("x", "" + boundingBox.x);
        boundingBoxHTML.setAttribute("y", "" + boundingBox.y);
        boundingBoxHTML.setAttribute("width", "" + boundingBox.width);
        boundingBoxHTML.setAttribute("height", "" + boundingBox.height);
        Utils.setBoundingBoxHTMLAttributes(boundingBoxHTML, id);
        return boundingBoxHTML;
    };
    Utils.getClickablePathDefinitionsFromLine = function (line, clickablePathWidth) {
        if (clickablePathWidth === void 0) { clickablePathWidth = 1; }
        var dv = VectorOperations2D.scaleUp(VectorOperations2D.normalize(VectorOperations2D.subtract(line.v1, line.v0)), clickablePathWidth), dvOrtholog = VectorOperations2D.orthogonalize(dv), interpolation0 = VectorOperations2D.add(line.v0, dv), interpolation1 = VectorOperations2D.subtract(line.v1, dv), 
        // Note that the negative/positve directionality is arbitrary.
        // Only consistency is significant.
        interpolatedEndpoint0TranslatedPositively = VectorOperations2D.add(interpolation0, dvOrtholog), interpolatedEndpoint0TranslatedNegatively = VectorOperations2D.subtract(interpolation0, dvOrtholog), interpolatedEndpoint1TranslatedPositively = VectorOperations2D.add(interpolation1, dvOrtholog), interpolatedEndpoint1TranslatedNegatively = VectorOperations2D.subtract(interpolation1, dvOrtholog);
        return {
            cap0PathDefinition: 'M ' + interpolatedEndpoint0TranslatedNegatively.x + ' ' + interpolatedEndpoint0TranslatedNegatively.y + ' L ' + (line.v0.x + dv.y) + ' ' + (line.v0.y - dv.x) + ' a 0.5 0.5 0 0 0 ' + (-2 * dv.y) + ' ' + (2 * dv.x) + ' L ' + interpolatedEndpoint0TranslatedPositively.x + ' ' + interpolatedEndpoint0TranslatedPositively.y + ' z',
            cap1PathDefinition: 'M ' + interpolatedEndpoint1TranslatedPositively.x + ' ' + interpolatedEndpoint1TranslatedPositively.y + ' L ' + (line.v1.x - dv.y) + ' ' + (line.v1.y + dv.x) + ' a 0.5 0.5 0 0 0 ' + (2 * dv.y) + ' ' + (-2 * dv.x) + ' L ' + interpolatedEndpoint1TranslatedNegatively.x + ' ' + interpolatedEndpoint1TranslatedNegatively.y + ' z',
            bodyPathDefinition: 'M ' + interpolatedEndpoint0TranslatedPositively.x + ' ' + interpolatedEndpoint0TranslatedPositively.y + ' L ' + interpolatedEndpoint1TranslatedPositively.x + ' ' + interpolatedEndpoint1TranslatedPositively.y + ' L ' + interpolatedEndpoint1TranslatedNegatively.x + ' ' + interpolatedEndpoint1TranslatedNegatively.y + ' L ' + interpolatedEndpoint0TranslatedNegatively.x + ' ' + interpolatedEndpoint0TranslatedNegatively.y + ' z'
        };
    };
    Utils.DEFAULT_EPSILON = 1E-4;
    return Utils;
}());
exports.Utils = Utils;
var XRNA = /** @class */ (function () {
    function XRNA() {
    }
    XRNA.main = function (inputFile, outputFileUrls, printVersionFlag) {
        if (inputFile === void 0) { inputFile = null; }
        if (outputFileUrls === void 0) { outputFileUrls = []; }
        if (printVersionFlag === void 0) { printVersionFlag = false; }
        XRNA.canvasHTML = document.getElementById("canvas");
        XRNA.canvasHTML.onwheel = function (event) {
            // Intuitive scrolling of the middle-mouse wheel requires negation of deltaY.
            XRNA.setZoom(XRNA.sceneTransformData.zoom - Math.sign(event.deltaY));
            XRNA.zoomSliderHTML.value = "" + XRNA.sceneTransformData.zoom;
            return false;
        };
        var canvasBackgroundHTML = document.createElementNS(svgNameSpaceURL, "rect");
        XRNA.canvasHTML.appendChild(canvasBackgroundHTML);
        canvasBackgroundHTML.setAttribute("style", "width:100%;height:100%;");
        canvasBackgroundHTML.setAttribute("visibility", "hidden");
        canvasBackgroundHTML.setAttribute("pointer-events", "all");
        canvasBackgroundHTML.onmousedown = function (mouseEvent) {
            XRNA.resetSelection();
            XRNA.contextMenuHTML.style.display = "none";
            return false;
        };
        XRNA.canvasHTML.onmousedown = function (mouseEvent) {
            var newButtonIndex = Utils.getButtonIndex(mouseEvent), pressedButtonIndex = newButtonIndex - XRNA.buttonIndex, mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x, mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y;
            XRNA.buttonIndex = newButtonIndex;
            if (pressedButtonIndex & ButtonIndex.LEFT) {
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x: mouseInCanvasX,
                    y: mouseInCanvasY
                };
            }
            return false;
        };
        XRNA.canvasHTML.onmousemove = function (mouseEvent) {
            if (XRNA.buttonIndex & ButtonIndex.LEFT) {
                var mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x, mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y;
                if (XRNA.selection.selectedElementListeners.length > 0) {
                    var scalar = 1.0 / (XRNA.sceneDataToCanvasBoundsScalar * XRNA.sceneTransformData.scale), dx_1 = (mouseInCanvasX - XRNA.draggingCoordinates.startDragCoordinates.x) * scalar, dy_1 = -(mouseInCanvasY - XRNA.draggingCoordinates.startDragCoordinates.y) * scalar;
                    XRNA.selection.selectedElementListeners.forEach(function (selectedElementListenerI) {
                        var dyI = selectedElementListenerI.invertYFlag ? -dy_1 : dy_1, x, y;
                        if (selectedElementListenerI.xyAreDisplacementsFlag) {
                            x = dx_1;
                            y = dyI;
                        }
                        else {
                            x = selectedElementListenerI.cache.x + dx_1;
                            y = selectedElementListenerI.cache.y + dyI;
                        }
                        selectedElementListenerI.updateXYHelper(x, y);
                    });
                }
                else {
                    XRNA.sceneTransformData.origin = {
                        x: XRNA.draggingCoordinates.cacheDragCoordinates.x + mouseInCanvasX - XRNA.draggingCoordinates.startDragCoordinates.x,
                        y: XRNA.draggingCoordinates.cacheDragCoordinates.y + mouseInCanvasY - XRNA.draggingCoordinates.startDragCoordinates.y
                    };
                    XRNA.updateSceneTransform();
                }
            }
            return false;
        };
        XRNA.canvasHTML.onmouseup = function (mouseEvent) {
            var newButtonIndex = Utils.getButtonIndex(mouseEvent), releasedMouseIndex = XRNA.buttonIndex - newButtonIndex;
            XRNA.buttonIndex = newButtonIndex;
            if (releasedMouseIndex & ButtonIndex.LEFT) {
                if (XRNA.selection.selectedElementListeners.length == 0) {
                    XRNA.draggingCoordinates.cacheDragCoordinates.x = XRNA.sceneTransformData.origin.x;
                    XRNA.draggingCoordinates.cacheDragCoordinates.y = XRNA.sceneTransformData.origin.y;
                }
            }
            return false;
        };
        XRNA.canvasHTML.onmouseleave = function (mouseEvent) {
            XRNA.resetSelection();
            XRNA.buttonIndex = ButtonIndex.NONE;
            XRNA.draggingCoordinates.cacheDragCoordinates.x = XRNA.sceneTransformData.origin.x;
            XRNA.draggingCoordinates.cacheDragCoordinates.y = XRNA.sceneTransformData.origin.y;
            return false;
        };
        // Disable the context menu.
        XRNA.canvasHTML.oncontextmenu = function (mouseEvent) {
            return false;
        };
        XRNA.downloaderHTML = document.createElement("a");
        XRNA.canvasHTML.appendChild(XRNA.downloaderHTML);
        XRNA.downloaderHTML.setAttribute("style", "display:none;");
        XRNA.sceneHTML = document.createElementNS(svgNameSpaceURL, "g");
        XRNA.canvasHTML.appendChild(XRNA.sceneHTML);
        XRNA.sketchesHTML = document.createElementNS(svgNameSpaceURL, "g");
        XRNA.sceneHTML.appendChild(XRNA.sketchesHTML);
        XRNA.canvasBounds = XRNA.canvasHTML.getBoundingClientRect();
        XRNA.sceneDataBounds = new DOMRect(0, 0, 1, 1);
        XRNA.sceneDataToCanvasBoundsScalar = Math.min(XRNA.canvasBounds.width, XRNA.canvasBounds.height);
        XRNA.sceneTransformStart = "";
        XRNA.sceneTransformMiddle = "";
        XRNA.sceneTransformEnd = "";
        window.onresize = function () {
            XRNA.canvasBounds = XRNA.canvasHTML.getBoundingClientRect();
            XRNA.fitSceneDataToCanvasBounds();
        };
        XRNA.zoomSliderHTML = document.getElementById("zoomSlider");
        XRNA.zoomSliderHTML.setAttribute("min", "" + XRNA.sceneTransformData.minimumZoom);
        XRNA.zoomSliderHTML.setAttribute("max", "" + XRNA.sceneTransformData.maximumZoom);
        XRNA.contextMenuHTML = document.getElementById("contextMenu");
        XRNA.rnaComplexSelectorHTML = document.getElementById("rnaComplexSelector");
        XRNA.outputFileSpecificationsDivHTML = document.getElementById("outputFileSpecificationsDiv");
        XRNA.selection = {
            highlighted: new Array(),
            selectedElementListeners: new Array()
        };
        XRNA.reset();
        document.getElementById("inputFileHandler").setAttribute("accept", Object.keys(XRNA.inputFileHandlerMap).map(function (extension) { return "." + extension; }).join(", "));
        var outputFileExtensionSelectorHTML = document.getElementById("outputFileExtensionSelector");
        for (var _i = 0, _a = Object.keys(XRNA.outputFileHandlerMap); _i < _a.length; _i++) {
            var outputFileExtension = _a[_i];
            outputFileExtensionSelectorHTML.appendChild(new Option("." + outputFileExtension, outputFileExtension));
        }
        outputFileExtensionSelectorHTML.selectedIndex = -1;
        XRNA.selectionConstraintHTML = document.getElementById("selectionConstraint");
        for (var _b = 0, _c = Object.keys(XRNA.namedSelectionConstraintsMap); _b < _c.length; _b++) {
            var selectionConstraintName = _c[_b];
            XRNA.selectionConstraintHTML.appendChild(new Option(selectionConstraintName, selectionConstraintName));
        }
        XRNA.buttonIndex = ButtonIndex.NONE;
        if (printVersionFlag) {
            console.log("XRNA-GT-TypeScript 2.0");
        }
        if (inputFile) {
            XRNA.handleInputFile(inputFile);
        }
        outputFileUrls.forEach(function (outputFileUrl) {
            XRNA.handleOutputUrl(outputFileUrl);
        });
    };
    XRNA.handleInputFile = function (inputFile) {
        XRNA.reset();
        Utils.getFileContent(inputFile.blob, function (fileContent) {
            XRNA.inputFileHandlerMap[inputFile.extension](fileContent);
            XRNA.populateScene();
            for (var i = 0; i < XRNA.rnaComplexes.length; i++) {
                XRNA.rnaComplexSelectorHTML.appendChild(new Option(XRNA.rnaComplexes[i].name, "" + i));
            }
            XRNA.rnaComplexSelectorHTML.selectedIndex = -1;
        });
    };
    XRNA.handleOutputUrl = function (outputFileUrl) {
        XRNA.downloaderHTML.setAttribute("href", window.URL.createObjectURL(new Blob([XRNA.outputFileHandlerMap[Utils.getFileExtension(outputFileUrl)].writeOutputFile()], {
            type: "text/plain"
        })));
        XRNA.downloaderHTML.download = outputFileUrl;
        XRNA.downloaderHTML.click();
        window.URL.revokeObjectURL(outputFileUrl);
    };
    XRNA.parseInputXMLFile = function (inputFileContent) {
        if (!/^\s*<!DOCTYPE/.test(inputFileContent)) {
            inputFileContent = "<!DOCTYPE ComplexDocument [\
                <!ELEMENT ComplexDocument (SceneNodeGeom?, ComplexDocument*, Label*, LabelList*, Complex*, WithComplex*)>\
                <!ATTLIST ComplexDocument Name CDATA #REQUIRED Author CDATA #IMPLIED ExpandUponWrite CDATA #IMPLIED PSScale CDATA #IMPLIED LandscapeMode CDATA #IMPLIED> \
                <!ELEMENT Complex (SceneNodeGeom?, Label*, LabelList*, RNAMolecule*, ProteinMolecule*)>\
                <!ATTLIST Complex Name CDATA #REQUIRED Author CDATA #IMPLIED> \
                <!ELEMENT WithComplex (SceneNodeGeom?, Label*, LabelList*, RNAMolecule*, ProteinMolecule*)>\
                <!ATTLIST WithComplex Name CDATA #REQUIRED Author CDATA #IMPLIED> \
                <!ELEMENT RNAMolecule (SceneNodeGeom?, Label*, LabelList*, Nuc*, NucSegment*, (NucListData | Nuc)*, RNAFile*, BasePairs*, BasePair*, Parent?, AlignmentFile?)>\
                <!ATTLIST RNAMolecule Name CDATA #REQUIRED Author CDATA #IMPLIED>\
                <!-- parent is like for e.coli being the numbering --> \
                <!ELEMENT Parent (RNAMolecule)>\
                <!ELEMENT AlignmentFile (#PCDATA)> \
                <!ELEMENT BasePairs EMPTY>\
                <!ATTLIST BasePairs nucID CDATA #REQUIRED bpNucID CDATA #REQUIRED length CDATA #REQUIRED bpName CDATA #IMPLIED>\
                <!-- BasePair can be used after above BasePairs is implemented and refers to base pairs already set, even across strands. -->\
                <!ELEMENT BasePair EMPTY>\
                <!ATTLIST BasePair RefID CDATA #IMPLIED RefIDs CDATA #IMPLIED Type (Canonical | Wobble | MisMatch | Weak | Phosphate | Unknown) 'Unknown' Line5PDeltaX CDATA #IMPLIED Line5PDeltaY CDATA #IMPLIED Line3PDeltaX CDATA #IMPLIED Line3PDeltaY CDATA #IMPLIED LabelDeltaX CDATA #IMPLIED LabelDeltaY CDATA #IMPLIED Label5PSide CDATA #IMPLIED> \
                <!ELEMENT NucListData (#PCDATA)>\
                <!ATTLIST NucListData StartNucID CDATA #IMPLIED DataType (NucChar | NucID.NucChar | NucID.NucChar.XPos.YPos | NucChar.XPos.YPos | NucID.NucChar.XPos.YPos.FormatType.BPID) 'NucID.NucChar.XPos.YPos.FormatType.BPID'> \
                <!ELEMENT Label (StringLabel | CircleLabel | Trianglelabel | LineLabel | ParallelogramLabel)>\
                <!ATTLIST Label XPos CDATA #REQUIRED YPos CDATA #REQUIRED Color CDATA #IMPLIED>\
                <!ELEMENT StringLabel EMPTY> \
                <!ATTLIST StringLabel FontName CDATA #IMPLIED FontType CDATA #IMPLIED FontSize CDATA #REQUIRED Angle CDATA #IMPLIED  Text CDATA #REQUIRED>\
                <!ELEMENT CircleLabel EMPTY> \
                <!ATTLIST CircleLabel Arc0 CDATA #IMPLIED Arc1 CDATA #IMPLIED Radius CDATA #IMPLIED LineWidth CDATA #IMPLIED IsOpen CDATA #IMPLIED>\
                <!ELEMENT TriangleLabel EMPTY>\
                <!ATTLIST TriangleLabel TopPtX CDATA #REQUIRED TopPtY CDATA #REQUIRED LeftPtX CDATA #REQUIRED LeftPtY CDATA #REQUIRED RightPtX CDATA #REQUIRED RightPtY CDATA #REQUIRED LineWidth CDATA #IMPLIED IsOpen CDATA #IMPLIED>\
                <!ELEMENT LineLabel EMPTY> \
                <!ATTLIST LineLabel X1 CDATA #REQUIRED Y1 CDATA #REQUIRED LineWidth CDATA #IMPLIED> \
                <!ELEMENT ParallelogramLabel EMPTY>\
                <!ATTLIST ParallelogramLabel Angle1 CDATA #REQUIRED Side1 CDATA #REQUIRED Angle2 CDATA #REQUIRED Side2 CDATA #REQUIRED LineWidth CDATA #IMPLIED IsOpen CDATA #IMPLIED> \
                <!ELEMENT LabelList (#PCDATA)>\
                <!ELEMENT NucSegment (NucChars)> \
                <!ATTLIST NucSegment StartNucID CDATA #IMPLIED> \
                <!ELEMENT NucChars (#PCDATA)>\
                <!ELEMENT NucSymbol (#PCDATA)> \
                <!ELEMENT Nuc (Label*, LabelList?, NucSymbol?)>\
                <!ATTLIST Nuc NucID CDATA #IMPLIED NucChar CDATA #IMPLIED XPos CDATA #IMPLIED YPos CDATA #IMPLIED Color CDATA #IMPLIED FontID CDATA #IMPLIED FontSize CDATA #IMPLIED FormatType CDATA #IMPLIED BPParent CDATA #IMPLIED BPNucID CDATA #IMPLIED RefID CDATA #IMPLIED RefIDs CDATA #IMPLIED IsHidden CDATA #IMPLIED GroupName CDATA #IMPLIED IsSchematic CDATA #IMPLIED SchematicColor CDATA #IMPLIED SchematicLineWidth CDATA #IMPLIED SchematicBPLineWidth CDATA #IMPLIED SchematicBPGap CDATA #IMPLIED SchematicFPGap CDATA #IMPLIED SchematicTPGap CDATA #IMPLIED IsNucPath CDATA #IMPLIED NucPathColor CDATA #IMPLIED NucPathLineWidth CDATA #IMPLIED>\
                <!ELEMENT RNAFile EMPTY>\
                <!ATTLIST RNAFile FileName CDATA #REQUIRED FileType (NucChar | NucID.NucChar | NucID.NucChar.XPos.YPos | NucID.NucChar.XPos.YPos.FormatType.BPID) 'NucID.NucChar.XPos.YPos.FormatType.BPID'>\
                <!ELEMENT SceneNodeGeom EMPTY>\
                <!ATTLIST SceneNodeGeom CenterX CDATA #IMPLIED CenterY CDATA #IMPLIED Scale CDATA #IMPLIED>\
            ]>\n" + inputFileContent;
        }
        var currentComplex = null, currentRNAMolecule = null, referencedIds = new Array(), xmlParser = function (xmlElement) {
            var _a, _b, _c, _d;
            var _loop_1 = function (childElementIndex) {
                var xmlSubElement = xmlElement.children[childElementIndex];
                switch (xmlSubElement.tagName) {
                    case "ComplexDocument": {
                        XRNA.complexDocumentName = (_a = xmlSubElement.getAttribute("Name")) !== null && _a !== void 0 ? _a : "Unknown";
                        break;
                    }
                    case "Complex": {
                        var complex = {
                            rnaMolecules: new Array(),
                            name: (_b = xmlSubElement.getAttribute("Name")) !== null && _b !== void 0 ? _b : "Unknown"
                        };
                        currentComplex = complex;
                        XRNA.rnaComplexes.push(complex);
                        break;
                    }
                    case "RNAMolecule": {
                        var rnaMolecule = {
                            nucleotides: new Array(),
                            firstNucleotideIndex: -1,
                            name: (_c = xmlSubElement.getAttribute("Name")) !== null && _c !== void 0 ? _c : "Unknown"
                        };
                        currentComplex.rnaMolecules.push(rnaMolecule);
                        currentRNAMolecule = rnaMolecule;
                        break;
                    }
                    case "NucListData": {
                        var innerHTMLLines = xmlSubElement.innerHTML.replace(/^\s*\n\s*/, "").replace(/\s*\n\s*$/, "").split("\n"), template_1 = xmlSubElement.getAttribute("DataType"), startingNucleotideIndexString = xmlSubElement.getAttribute("StartNucID");
                        if (!startingNucleotideIndexString) {
                            // We cannot continue without a starting nucleotide index.
                            // Continuing to attempt to parse the current RNAMolecule will introduce errors.
                            throw new Error("Missing \"StartNucID\" attribute prevents RNAMolecule parsing.");
                        }
                        currentRNAMolecule.nucleotides = new Array(innerHTMLLines.length);
                        var nucleotideIndex_1 = 0;
                        currentRNAMolecule.firstNucleotideIndex = parseInt(startingNucleotideIndexString);
                        innerHTMLLines.forEach(function (innerHTMLLine) {
                            innerHTMLLine = innerHTMLLine.trim();
                            if (innerHTMLLine.length != 0) {
                                var split = innerHTMLLine.split(/ /g), x = 0.0, y = 0.0, symbol = void 0, basePairIndex = -1;
                                switch (template_1) {
                                    case "NucChar.XPos.YPos":
                                        y = parseFloat(split[2]);
                                        x = parseFloat(split[1]);
                                    case "NucChar":
                                        symbol = split[0];
                                        break;
                                    case "NucID.NucChar.XPos.YPos.FormatType.BPID":
                                        // FormatType is ignored by XRNA-GT source code.
                                        basePairIndex = parseInt(split[5]);
                                    case "NucID.NucChar.XPos.YPos":
                                        y = parseFloat(split[3]);
                                        x = parseFloat(split[2]);
                                    case "NucID.NucChar":
                                        symbol = split[1];
                                        nucleotideIndex_1 = parseInt(split[0]) - currentRNAMolecule.firstNucleotideIndex;
                                        break;
                                    default:
                                        throw new Error("Unrecognized Nuc2D format");
                                }
                                currentRNAMolecule.nucleotides[nucleotideIndex_1] = {
                                    position: {
                                        x: x,
                                        y: y
                                    },
                                    symbol: __assign(__assign({ string: symbol }, XRNA.fontIdToFont(0)), { red: 0, green: 0, blue: 0 }),
                                    basePairIndex: basePairIndex,
                                    labelLine: null,
                                    labelContent: null
                                };
                                nucleotideIndex_1++;
                            }
                        });
                        if (/NucID/.test(template_1)) {
                            for (var nucleotideIndex_2 = 0; nucleotideIndex_2 < currentRNAMolecule.nucleotides.length; nucleotideIndex_2++) {
                                if (!currentRNAMolecule.nucleotides[nucleotideIndex_2]) {
                                    throw new Error("XRNA does not currently support input nucleotides with non-contiguous nucleotide ids.");
                                }
                            }
                        }
                        break;
                    }
                    case "LabelList": {
                        var innerHTMLLines = xmlSubElement.innerHTML.replace(/^\n/, "").replace(/\n$/, "").split("\n"), labelContent_1 = null, labelLine_1 = null;
                        innerHTMLLines.forEach(function (innerHTMLLine) {
                            var split = innerHTMLLine.split(/\s+/);
                            switch (split[0].toLowerCase()) {
                                case "l": {
                                    labelLine_1 = Object.assign({
                                        v0: {
                                            x: parseFloat(split[1]),
                                            y: parseFloat(split[2])
                                        },
                                        v1: {
                                            x: parseFloat(split[3]),
                                            y: parseFloat(split[4])
                                        },
                                        strokeWidth: parseFloat(split[5])
                                    }, Utils.expandRGB(parseInt(split[6])));
                                    break;
                                }
                                case "s": {
                                    // From XRNA source code (ComplexXMLParser.java):
                                    // l x y ang size fontID color content
                                    // ang is ignored by XRNA source code.
                                    var font = XRNA.fontIdToFont(parseInt(split[5]));
                                    font.size = parseFloat(split[4]);
                                    labelContent_1 = __assign(__assign({ string: split[7].replace(/\"/g, ""), x: parseFloat(split[1]), y: parseFloat(split[2]) }, font), Utils.parseRGB(split[6]));
                                    break;
                                }
                            }
                        });
                        referencedIds.forEach(function (referencedIdPair) {
                            for (var index = referencedIdPair.fromIndex; index <= referencedIdPair.toIndex; index++) {
                                var nucleotide = currentRNAMolecule.nucleotides[index];
                                // Clone the label content and label line.
                                nucleotide.labelContent = Object.assign({}, labelContent_1);
                                nucleotide.labelLine = Object.assign({}, labelLine_1);
                            }
                        });
                        break;
                    }
                    case "Nuc": {
                        referencedIds = new Array();
                        var refIdsString = (_d = xmlSubElement.getAttribute("RefID")) !== null && _d !== void 0 ? _d : xmlSubElement.getAttribute("RefIDs");
                        if (!refIdsString) {
                            throw new Error("Within the input file, a <Nuc> element is missing its RefID and RefIDs attributes.");
                        }
                        refIdsString = refIdsString.replace(/\s+/g, "");
                        // comma-separated list of (potentially coupled, potentially negative) integers.
                        if (!refIdsString.match(/^(?:(?:-?\d+-)?-?\d+)(?:,(?:-?\d+-)?-?\d+)*$/)) {
                            throw new Error("Within the input file, a <Nuc> element's refID(s) attribute is improperly formatted. It should be a comma-separated list of integers, or ordered integer pairs separated by \"-\".");
                        }
                        refIdsString.split(",").forEach(function (splitI) {
                            var matchedGroups = splitI.match(/^(-?\d+)-(-?\d+)$/), fromIndex, toIndex;
                            if (matchedGroups) {
                                fromIndex = parseInt(matchedGroups[1]) - currentRNAMolecule.firstNucleotideIndex;
                                toIndex = parseInt(matchedGroups[2]) - currentRNAMolecule.firstNucleotideIndex;
                            }
                            else {
                                var refID = parseInt(splitI) - currentRNAMolecule.firstNucleotideIndex;
                                fromIndex = refID;
                                toIndex = refID;
                            }
                            referencedIds.push({
                                fromIndex: fromIndex,
                                toIndex: toIndex
                            });
                        });
                        var helperFunctions_1 = new Array(), colorAsString = xmlSubElement.getAttribute("Color");
                        if (colorAsString) {
                            var color_1 = Utils.parseRGB(colorAsString);
                            // Override the nucleotide's color.
                            helperFunctions_1.push(function (nucleotide) { return Object.assign(nucleotide.symbol, color_1); });
                        }
                        var fontIdAsString = xmlSubElement.getAttribute("FontID");
                        if (fontIdAsString) {
                            var fontID = parseInt(fontIdAsString);
                            if (isNaN(fontID)) {
                                throw new Error("Invalid fontID: " + fontIdAsString + " is not an integer.");
                            }
                            var font_1 = XRNA.fontIdToFont(fontID);
                            // Override the nucleotide's font.
                            helperFunctions_1.push(function (nucleotide) { return Object.assign(nucleotide.symbol, font_1); });
                        }
                        var fontSizeAsString = xmlSubElement.getAttribute("FontSize");
                        if (fontSizeAsString) {
                            var fontSize_1 = parseFloat(fontSizeAsString);
                            helperFunctions_1.push(function (nucleotide) { return nucleotide.symbol.size = fontSize_1; });
                        }
                        referencedIds.forEach(function (referencedIdPair) {
                            var _loop_2 = function (index) {
                                var nucleotide = currentRNAMolecule.nucleotides[index];
                                helperFunctions_1.forEach(function (helperFunction) { return helperFunction(nucleotide); });
                            };
                            for (var index = referencedIdPair.fromIndex; index <= referencedIdPair.toIndex; index++) {
                                _loop_2(index);
                            }
                        });
                        break;
                    }
                    case "BasePairs": {
                        var indexString = xmlSubElement.getAttribute("nucID"), lengthString = xmlSubElement.getAttribute("length"), basePairedIndexString = xmlSubElement.getAttribute("bpNucID");
                        if (!indexString) {
                            // We cannot continue without an index.
                            throw new Error("Within the input file a <BasePairs> element is missing its nucID attribute.");
                        }
                        var index = parseInt(indexString);
                        if (isNaN(index)) {
                            // We cannot continue without an index.
                            throw new Error("Within the input file a <BasePairs> element is defined incorrectly; nucID = \"" + indexString + "\" is not an integer.");
                        }
                        var length_1 = void 0;
                        if (!lengthString) {
                            length_1 = 1;
                        }
                        else {
                            length_1 = parseInt(lengthString);
                            if (isNaN(length_1)) {
                                // We cannot continue without a length.
                                throw new Error("Within the input file a <BasePairs> element is defined incorrectly; length = \"" + lengthString + "\" is not an integer.");
                            }
                        }
                        if (!basePairedIndexString) {
                            // We cannot continue without a base-paired index.
                            throw new Error("Within the input file a <BasePairs> element is missing its bpNucID attribute.");
                        }
                        var basePairedIndex = parseInt(basePairedIndexString);
                        if (isNaN(basePairedIndex)) {
                            // We cannot continue without a base-paired index.
                            throw new Error("Within the input file a <BasePairs> element is defined incorrectly; bpNucID = \"" + basePairedIndexString + "\" is not an integer.");
                        }
                        index -= currentRNAMolecule.firstNucleotideIndex;
                        basePairedIndex -= currentRNAMolecule.firstNucleotideIndex;
                        // Pair nucleotides.
                        for (var innerIndex = 0; innerIndex < length_1; innerIndex++) {
                            var nucleotideIndex0 = index + innerIndex, nucleotideIndex1 = basePairedIndex - innerIndex, nucleotides = currentRNAMolecule.nucleotides;
                            if (nucleotideIndex0 < 0) {
                                console.error("Out of bounds error in (<BasePairs nucID='" + (index + currentRNAMolecule.firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + currentRNAMolecule.firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex0 + " < 0");
                                continue;
                            }
                            if (nucleotideIndex0 >= nucleotides.length) {
                                console.error("Out of bounds error in (<BasePairs nucID='" + (index + currentRNAMolecule.firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + currentRNAMolecule.firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex0 + " >= " + currentRNAMolecule.nucleotides.length);
                                continue;
                            }
                            if (nucleotideIndex1 < 0) {
                                console.error("Out of bounds error in (<BasePairs nucID='" + (index + currentRNAMolecule.firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + currentRNAMolecule.firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex1 + " < 0");
                                continue;
                            }
                            if (nucleotideIndex1 >= nucleotides.length) {
                                console.error("Out of bounds error in (<BasePairs nucID='" + (index + currentRNAMolecule.firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + currentRNAMolecule.firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex1 + " >= " + currentRNAMolecule.nucleotides.length);
                                continue;
                            }
                            nucleotides[nucleotideIndex0].basePairIndex = nucleotideIndex1;
                            nucleotides[nucleotideIndex1].basePairIndex = nucleotideIndex0;
                        }
                        break;
                    }
                    case "WithComplex": {
                        break;
                    }
                    case "NucSymbol": {
                        break;
                    }
                    case "NucChars": {
                        break;
                    }
                    case "NucSegment": {
                        break;
                    }
                    case "Label": {
                        break;
                    }
                    case "StringLabel": {
                        break;
                    }
                    case "CircleLabel": {
                        break;
                    }
                    case "TriangleLabel": {
                        break;
                    }
                    case "ParallelogramLabel": {
                        break;
                    }
                    case "LineLabel": {
                        break;
                    }
                    case "RNAFile": {
                        break;
                    }
                    case "BasePair": {
                        break;
                    }
                    case "SceneNodeGeom": {
                        break;
                    }
                }
                xmlParser(xmlSubElement);
            };
            for (var childElementIndex = 0; childElementIndex < xmlElement.children.length; childElementIndex++) {
                _loop_1(childElementIndex);
            }
        };
        xmlParser(new DOMParser().parseFromString(inputFileContent, "text/xml"));
    };
    XRNA.parseInputSTRFile = function (inputFileContent) {
        throw new Error("This method is not implemented yet!");
    };
    XRNA.parseInputSVGFile = function (inputFileContent) {
        throw new Error("This method is not implemented yet!");
    };
    XRNA.parseInputJSONFile = function (inputFileContent) {
        var jsonData = JSON.parse(inputFileContent), allRNAComplexesFlag = true, allRNAMoleculesFlag = true, keys = Object.keys(jsonData), rnaMoleculeRegex = /^RNA Molecule (.*)/, names = new Array(keys.length);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i], rnaComplexMatch = key.match(/^RNA Complex (.*)/), rnaMoleculeMatch = key.match(rnaMoleculeRegex);
            if (!rnaComplexMatch) {
                allRNAComplexesFlag = false;
            }
            else {
                names[i] = rnaComplexMatch[1];
            }
            if (!rnaMoleculeMatch) {
                allRNAMoleculesFlag = false;
            }
            else {
                names[i] = rnaMoleculeMatch[i];
            }
        }
        var readRNAMoleculeJSONHelper = function (name, rnaMoleculeJSON) {
            var nucleotides, firstNucleotideIndex;
            if ("Sequence" in rnaMoleculeJSON) {
                var sequenceJSON = rnaMoleculeJSON.Sequence;
                firstNucleotideIndex = Number.MAX_VALUE;
                nucleotides = new Array(sequenceJSON.length);
                for (var _i = 0, sequenceJSON_1 = sequenceJSON; _i < sequenceJSON_1.length; _i++) {
                    var sequenceI = sequenceJSON_1[_i];
                    if (sequenceI.ResID < firstNucleotideIndex) {
                        firstNucleotideIndex = sequenceI.ResID;
                    }
                }
                for (var _a = 0, sequenceJSON_2 = sequenceJSON; _a < sequenceJSON_2.length; _a++) {
                    var sequenceI = sequenceJSON_2[_a];
                    if (!("ResID" in sequenceI) || !("ResName" in sequenceI) || !("X" in sequenceI) || !("Y" in sequenceI)) {
                        throw new Error("Unrecognized input JSON Format.");
                    }
                    var nucleotideIndex = sequenceI.ResID - firstNucleotideIndex;
                    if (nucleotideIndex >= nucleotides.length || nucleotides[nucleotideIndex]) {
                        throw new Error("An incomplete (non-contiguous) list of nucleotide indices was provided within the input JSON file.");
                    }
                    var font = "Font" in sequenceI ? {
                        size: sequenceI.Font.Size,
                        family: sequenceI.Font.Family,
                        style: sequenceI.Font.Style,
                        weight: sequenceI.Font.Weight
                    } : XRNA.fontIdToFont(0), color = "Color" in sequenceI ? {
                        red: sequenceI.Color.Red,
                        green: sequenceI.Color.Green,
                        blue: sequenceI.Color.Blue
                    } : {
                        red: 0,
                        green: 0,
                        blue: 0
                    };
                    nucleotides[nucleotideIndex] = {
                        position: {
                            x: sequenceI.X,
                            y: sequenceI.Y
                        },
                        symbol: Object.assign({
                            string: sequenceI.ResName
                        }, font, color),
                        basePairIndex: -1,
                        labelLine: null,
                        labelContent: null
                    };
                }
            }
            else {
                throw new Error("Unrecognized JSON format.");
            }
            if ("BasePairs" in rnaMoleculeJSON) {
                for (var _b = 0, _c = rnaMoleculeJSON.BasePairs; _b < _c.length; _b++) {
                    var basePairJSON = _c[_b];
                    var nucleotideIndex = basePairJSON.ResID1 - firstNucleotideIndex, basePairIndex = basePairJSON.ResID2 - firstNucleotideIndex;
                    if (nucleotideIndex < 0 || nucleotideIndex >= nucleotides.length) {
                        throw new Error("The input JSON number ResID1 = " + basePairJSON.ResID1 + " is outside the range of sequence indices [" + firstNucleotideIndex + ", " + (nucleotides.length + firstNucleotideIndex) + ").");
                    }
                    if (basePairIndex < 0 || basePairIndex >= nucleotides.length) {
                        throw new Error("The input JSON number ResID2 = " + basePairJSON.ResID2 + " is outside the range of sequence indices [" + firstNucleotideIndex + ", " + (nucleotides.length + firstNucleotideIndex) + ").");
                    }
                    nucleotides[nucleotideIndex].basePairIndex = basePairIndex;
                    nucleotides[basePairIndex].basePairIndex = nucleotideIndex;
                }
            }
            if ("LabelsAndAnnotations" in rnaMoleculeJSON) {
                for (var _d = 0, _e = rnaMoleculeJSON.LabelsAndAnnotations; _d < _e.length; _d++) {
                    var labelsAndAnnotationsJSON = _e[_d];
                    if (!("ResID" in labelsAndAnnotationsJSON)) {
                        throw new Error("Unrecognized JSON format.");
                    }
                    var nucleotideIndex = labelsAndAnnotationsJSON.ResID - firstNucleotideIndex;
                    if (nucleotideIndex < 0 || nucleotideIndex >= nucleotides.length) {
                        throw new Error("The input JSON number ResID = " + labelsAndAnnotationsJSON.ResID + " is outside the range of sequence indices [" + firstNucleotideIndex + ", " + (nucleotides.length + firstNucleotideIndex) + ").");
                    }
                    var nucleotide = nucleotides[nucleotideIndex];
                    if ("LabelLine" in labelsAndAnnotationsJSON) {
                        var color = "Color" in labelsAndAnnotationsJSON.LabelLine ? {
                            red: labelsAndAnnotationsJSON.LabelLine.Color.Red,
                            green: labelsAndAnnotationsJSON.LabelLine.Color.Green,
                            blue: labelsAndAnnotationsJSON.LabelLine.Color.Blue
                        } : {
                            red: 0,
                            green: 0,
                            blue: 0
                        }, strokeWidth = "StrokeWidth" in labelsAndAnnotationsJSON ? labelsAndAnnotationsJSON.StrokeWidth : DEFAULT_STROKE_WIDTH;
                        nucleotide.labelLine = Object.assign({
                            v0: {
                                x: labelsAndAnnotationsJSON.LabelLine.X1,
                                y: labelsAndAnnotationsJSON.LabelLine.Y1
                            },
                            v1: {
                                x: labelsAndAnnotationsJSON.LabelLine.X2,
                                y: labelsAndAnnotationsJSON.LabelLine.Y2
                            },
                            strokeWidth: strokeWidth
                        }, color);
                    }
                    if ("LabelContent" in labelsAndAnnotationsJSON) {
                        var color = "Color" in labelsAndAnnotationsJSON.LabelContent ? {
                            red: labelsAndAnnotationsJSON.LabelContent.Color.Red,
                            green: labelsAndAnnotationsJSON.LabelContent.Color.Green,
                            blue: labelsAndAnnotationsJSON.LabelContent.Color.Blue
                        } : {
                            red: 0,
                            green: 0,
                            blue: 0
                        }, font = "Font" in labelsAndAnnotationsJSON.LabelContent ? {
                            size: labelsAndAnnotationsJSON.LabelContent.Font.Size,
                            family: labelsAndAnnotationsJSON.LabelContent.Font.Family,
                            style: labelsAndAnnotationsJSON.LabelContent.Font.Style,
                            weight: labelsAndAnnotationsJSON.LabelContent.Font.Weight
                        } : XRNA.fontIdToFont(0);
                        nucleotide.labelContent = Object.assign({
                            string: labelsAndAnnotationsJSON.LabelContent.Label,
                            x: labelsAndAnnotationsJSON.LabelContent.X,
                            y: labelsAndAnnotationsJSON.LabelContent.Y
                        }, color, font);
                    }
                }
            }
            return {
                name: name,
                nucleotides: nucleotides,
                firstNucleotideIndex: firstNucleotideIndex
            };
        };
        if (allRNAComplexesFlag) {
            for (var rnaComplexIndex = 0; rnaComplexIndex < keys.length; rnaComplexIndex++) {
                var rnaComplex = {
                    name: names[rnaComplexIndex],
                    rnaMolecules: new Array()
                }, rnaComplexJSON = jsonData[keys[rnaComplexIndex]];
                for (var _i = 0, _a = Object.keys(rnaComplexJSON); _i < _a.length; _i++) {
                    var key = _a[_i];
                    var rnaMoleculeMatch = key.match(rnaMoleculeRegex);
                    if (!rnaMoleculeMatch) {
                        throw new Error("Unrecognized JSON format.");
                    }
                    rnaComplex.rnaMolecules.push(readRNAMoleculeJSONHelper(rnaMoleculeMatch[1], rnaComplexJSON[key]));
                }
                XRNA.rnaComplexes.push(rnaComplex);
            }
        }
        else if (allRNAMoleculesFlag) {
            var rnaComplex = {
                name: "Unknown",
                rnaMolecules: new Array(keys.length)
            };
            for (var i = 0; i < keys.length; i++) {
                rnaComplex.rnaMolecules[i] = readRNAMoleculeJSONHelper(names[i], jsonData[keys[i]]);
            }
            XRNA.rnaComplexes.push(rnaComplex);
        }
        else {
            throw new Error("Unsupported JSON format.");
        }
    };
    XRNA.generateOutputXRNAFile = function () {
        var xrnaFrontHalf = "", xrnaBackHalf = "";
        xrnaFrontHalf += "<ComplexDocument Name='" + XRNA.complexDocumentName + "'>\n";
        xrnaBackHalf = "\n</ComplexDocument>" + xrnaBackHalf;
        xrnaFrontHalf += "<SceneNodeGeom CenterX='" + 0 + "' CenterY='" + 0 + "' Scale='" + 1 + "'/>\n";
        for (var rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            var complex = XRNA.rnaComplexes[rnaComplexIndex];
            xrnaFrontHalf += "<Complex Name='" + complex.name + "'>\n";
            xrnaBackHalf = "\n</Complex>" + xrnaBackHalf;
            for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < complex.rnaMolecules.length; rnaMoleculeIndex++) {
                var rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex], nucleotides = rnaMolecule.nucleotides, firstNucleotideIndex = rnaMolecule.firstNucleotideIndex;
                xrnaFrontHalf += "<RNAMolecule Name='" + rnaMolecule.name + "'>\n";
                xrnaBackHalf = "\n</RNAMolecule>" + xrnaBackHalf;
                xrnaFrontHalf += "<NucListData StartNucID='" + firstNucleotideIndex + "' DataType='NucChar.XPos.YPos'>\n";
                var nucs = "", nucLabelLists = "", basePairs = "";
                for (var nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    var nucleotide = nucleotides[nucleotideIndex];
                    xrnaFrontHalf += nucleotide.symbol.string + " " + nucleotide.position.x + " " + nucleotide.position.y + "\n";
                    nucs += "<Nuc RefID='" + (firstNucleotideIndex + nucleotideIndex) + "' Color='" + Utils.compressRGB(nucleotide.symbol) + "' FontID='" + XRNA.fontToFontId(nucleotide.symbol) + "'></Nuc>";
                    if (nucleotide.labelContent || nucleotide.labelContent) {
                        nucLabelLists += "<Nuc RefID='" + (firstNucleotideIndex + nucleotideIndex) + "'>\n<LabelList>\n";
                        if (nucleotide.labelLine) {
                            var line = nucleotide.labelLine;
                            nucLabelLists += "l " + line.v0.x + " " + line.v0.y + " " + line.v1.x + " " + line.v1.y + " " + line.strokeWidth + " " + Utils.compressRGB(line) + " 0.0 0 0 0 0\n";
                        }
                        if (nucleotide.labelContent) {
                            var content = nucleotide.labelContent;
                            nucLabelLists += "s " + content.x + " " + content.y + " 0.0 " + content.size + " " + XRNA.fontToFontId(content) + " " + Utils.compressRGB(content) + " \"" + content.string + "\"\n";
                        }
                        nucLabelLists += "</LabelList>\n</Nuc>\n";
                    }
                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex < nucleotide.basePairIndex) {
                        basePairs += "<BasePairs nucID='" + (firstNucleotideIndex + nucleotideIndex) + "' length='1' bpNucID='" + (firstNucleotideIndex + nucleotide.basePairIndex) + "' />\n";
                    }
                }
                xrnaFrontHalf += "</NucListData>\n";
                xrnaFrontHalf += "<Nuc RefIDs='" + firstNucleotideIndex + "-" + (firstNucleotideIndex + nucleotides.length - 1) + "' IsSchematic='false' SchematicColor='0' SchematicLineWidth='1.5' SchematicBPLineWidth='1.0' SchematicBPGap='2.0' SchematicFPGap='2.0' SchematicTPGap='2.0' IsNucPath='false' NucPathColor='ff0000' NucPathLineWidth='0.0' />\n";
                xrnaFrontHalf += nucs;
                xrnaFrontHalf += nucLabelLists;
                xrnaFrontHalf += basePairs;
            }
        }
        return xrnaFrontHalf + xrnaBackHalf;
    };
    XRNA.generateOutputSVGFile = function () {
        var canvas = XRNA.canvasHTML.cloneNode(true);
        canvas.removeAttribute("id");
        canvas.removeAttribute("class");
        for (var rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            var complex = XRNA.rnaComplexes[rnaComplexIndex];
            for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < complex.rnaMolecules.length; rnaMoleculeIndex++) {
                var rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex], nucleotides = rnaMolecule.nucleotides;
            }
        }
        return canvas.outerHTML;
    };
    XRNA.generateOutputTRFile = function () {
        var trContents = "<structure>";
        for (var rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            var rnaComplex = XRNA.rnaComplexes[rnaComplexIndex];
            for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < rnaComplex.rnaMolecules.length; rnaMoleculeIndex++) {
                var rnaMolecule = rnaComplex.rnaMolecules[rnaMoleculeIndex], nucleotides = rnaMolecule.nucleotides;
                for (var nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    var nucleotide = nucleotides[nucleotideIndex];
                    trContents += "\n<point x=\"" + nucleotide.position.x.toFixed(3) + "\" y=\"" + nucleotide.position.y.toFixed(3) + "\" b=\"" + nucleotide.symbol.string + "\" numbering-label=\"" + (rnaMolecule.firstNucleotideIndex + nucleotideIndex) + "\" />";
                }
            }
        }
        trContents += "\n</structure>";
        return trContents;
    };
    XRNA.generateOutputCSVFile = function () {
        throw new Error("This method is not implemented yet!");
    };
    XRNA.generateOutputBPSEQFile = function () {
        throw new Error("This method is not implemented yet!");
    };
    XRNA.generateOutputJPGFile = function () {
        throw new Error("This method is not implemented yet!");
    };
    XRNA.generateOutputJSONFile = function () {
        var outputJSONFileElements = new Array(XRNA.rnaComplexes.length);
        for (var i = 0; i < XRNA.rnaComplexes.length; i++) {
            outputJSONFileElements[i] = (XRNA.generateOutputJSONFileForRNAComplex(XRNA.rnaComplexes[i], 1));
        }
        return outputJSONFileElements.join(",");
    };
    XRNA.generateOutputJSONFileForRNAComplex = function (rnaComplex, indentation) {
        if (indentation === void 0) { indentation = 1; }
        var baseIndentation = "\t".repeat(indentation), outputJSONFileElements = new Array(rnaComplex.rnaMolecules.length);
        for (var i = 0; i < rnaComplex.rnaMolecules.length; i++) {
            outputJSONFileElements[i] = XRNA.generateOutputJSONFileForRNAMolecule(rnaComplex.rnaMolecules[i], indentation + 1);
        }
        return "\n" + baseIndentation + "\"RNA Complex " + rnaComplex.name + "\" : {" + outputJSONFileElements.join(",") + "\n"
            + baseIndentation + "}";
    };
    XRNA.generateOutputJSONFileForRNAMolecule = function (rnaMolecule, indentation) {
        if (indentation === void 0) { indentation = 1; }
        var innerOutputJSONFileToStringElements = new Array(), outerOutputJSONFileToStringElements = new Array(), baseIndentation = "\t".repeat(indentation), outerSequenceIndentation = baseIndentation + "\t\t", innerSequenceIndentation = outerSequenceIndentation + "\t";
        for (var i = 0; i < rnaMolecule.nucleotides.length; i++) {
            var nucleotide = rnaMolecule.nucleotides[i];
            innerOutputJSONFileToStringElements.push("\n" + outerSequenceIndentation + "{\n"
                + innerSequenceIndentation + "\"ResID\" : " + (rnaMolecule.firstNucleotideIndex + i) + ",\n"
                + innerSequenceIndentation + "\"ResName\" : \"" + nucleotide.symbol.string + "\",\n"
                + innerSequenceIndentation + "\"X\" : " + nucleotide.position.x + ",\n"
                + innerSequenceIndentation + "\"Y\" : " + nucleotide.position.y + ",\n"
                + innerSequenceIndentation + "\"Color\" : {\n"
                + innerSequenceIndentation + "\t\"Red\" : " + nucleotide.symbol.red + ",\n"
                + innerSequenceIndentation + "\t\"Green\" : " + nucleotide.symbol.green + ",\n"
                + innerSequenceIndentation + "\t\"Blue\" : " + nucleotide.symbol.blue + "\n"
                + innerSequenceIndentation + "},\n"
                + innerSequenceIndentation + "\"Font\" : {\n"
                + innerSequenceIndentation + "\t\"Size\" : " + nucleotide.symbol.size + ",\n"
                + innerSequenceIndentation + "\t\"Family\" : \"" + nucleotide.symbol.family + "\",\n"
                + innerSequenceIndentation + "\t\"Style\" : \"" + nucleotide.symbol.style + "\",\n"
                + innerSequenceIndentation + "\t\"Weight\" : \"" + nucleotide.symbol.weight + "\"\n"
                + innerSequenceIndentation + "}\n"
                + outerSequenceIndentation + "}");
        }
        outerOutputJSONFileToStringElements.push("\n" + baseIndentation + "\t\"Sequence\" : [" + innerOutputJSONFileToStringElements.join(",") + "\n" + baseIndentation + "\t]");
        innerOutputJSONFileToStringElements = new Array();
        for (var i = 0; i < rnaMolecule.nucleotides.length; i++) {
            var nucleotide = rnaMolecule.nucleotides[i];
            if (nucleotide.basePairIndex > i) {
                innerOutputJSONFileToStringElements.push("\n" + outerSequenceIndentation + "{\n"
                    + innerSequenceIndentation + "\"ResID1\" : " + (i + rnaMolecule.firstNucleotideIndex) + ",\n"
                    + innerSequenceIndentation + "\"ResID2\" : " + (nucleotide.basePairIndex + rnaMolecule.firstNucleotideIndex) + ",\n"
                    + innerSequenceIndentation + "\"BasePairType\" : null\n"
                    + outerSequenceIndentation + "}");
            }
        }
        outerOutputJSONFileToStringElements.push("\n" + baseIndentation + "\t\"BasePairs\" : [" + innerOutputJSONFileToStringElements.join(",") + "\n" + baseIndentation + "\t]");
        var annotationJSONObjects = new Array();
        for (var i = 0; i < rnaMolecule.nucleotides.length; i++) {
            var annotationsToStringElements = new Array(), nucleotide = rnaMolecule.nucleotides[i];
            if (nucleotide.labelLine) {
                annotationsToStringElements.push("\n" + innerSequenceIndentation + "\"LabelLine\" : {\n"
                    + innerSequenceIndentation + "\t\"X1\" : " + nucleotide.labelLine.v0.x + ",\n"
                    + innerSequenceIndentation + "\t\"Y1\" : " + nucleotide.labelLine.v0.y + ",\n"
                    + innerSequenceIndentation + "\t\"X2\" : " + nucleotide.labelLine.v1.x + ",\n"
                    + innerSequenceIndentation + "\t\"Y2\" : " + nucleotide.labelLine.v1.y + ",\n"
                    + innerSequenceIndentation + "\t\"StrokeWidth\" : " + nucleotide.labelLine.strokeWidth + ",\n"
                    + innerSequenceIndentation + "\t\"Color\" : {\n"
                    + innerSequenceIndentation + "\t\t\"Red\" : " + nucleotide.labelLine.red + ",\n"
                    + innerSequenceIndentation + "\t\t\"Green\" : " + nucleotide.labelLine.green + ",\n"
                    + innerSequenceIndentation + "\t\t\"Blue\" : " + nucleotide.labelLine.blue + "\n"
                    + innerSequenceIndentation + "\t}\n"
                    + innerSequenceIndentation + "}");
            }
            if (nucleotide.labelContent) {
                annotationsToStringElements.push("\n" + innerSequenceIndentation + "\"LabelContent\" : {\n"
                    + innerSequenceIndentation + "\t\"Label\" : \"" + nucleotide.labelContent.string + "\",\n"
                    + innerSequenceIndentation + "\t\"X\" : " + nucleotide.labelContent.x + ",\n"
                    + innerSequenceIndentation + "\t\"Y\" : " + nucleotide.labelContent.y + ",\n"
                    + innerSequenceIndentation + "\t\"Font\" : {\n"
                    + innerSequenceIndentation + "\t\t\"Size\" : " + nucleotide.symbol.size + ",\n"
                    + innerSequenceIndentation + "\t\t\"Family\" : \"" + nucleotide.symbol.family + "\",\n"
                    + innerSequenceIndentation + "\t\t\"Style\" : \"" + nucleotide.symbol.style + "\",\n"
                    + innerSequenceIndentation + "\t\t\"Weight\" : \"" + nucleotide.symbol.weight + "\"\n"
                    + innerSequenceIndentation + "\t},\n"
                    + innerSequenceIndentation + "\t\"Color\" : {\n"
                    + innerSequenceIndentation + "\t\t\"Red\" : " + nucleotide.symbol.red + ",\n"
                    + innerSequenceIndentation + "\t\t\"Green\" : " + nucleotide.symbol.green + ",\n"
                    + innerSequenceIndentation + "\t\t\"Blue\" : " + nucleotide.symbol.blue + "\n"
                    + innerSequenceIndentation + "\t}\n"
                    + innerSequenceIndentation + "" + "}");
            }
            if (annotationsToStringElements.length > 0) {
                annotationsToStringElements.unshift("\n" + innerSequenceIndentation + "\"ResID\" : " + (rnaMolecule.firstNucleotideIndex + i));
                annotationJSONObjects.push("\n" + outerSequenceIndentation + "{" + annotationsToStringElements.join(",") + "\n"
                    + outerSequenceIndentation + "}");
            }
        }
        outerOutputJSONFileToStringElements.push("\n" + baseIndentation + "\t\"LabelsAndAnnotations\" : [" + annotationJSONObjects.join(",") + "\n" + baseIndentation + "\t]");
        return "\n" + baseIndentation + "\"RNA Molecule " + rnaMolecule.name + "\" : {" + outerOutputJSONFileToStringElements.join(",") + "\n" + baseIndentation + "}";
    };
    XRNA.reset = function () {
        // Clear all data from the scene.
        XRNA.rnaComplexes = new Array();
        XRNA.resetSelection();
        XRNA.resetView();
    };
    XRNA.resetSelection = function () {
        // Clear the previous selection highlighting
        XRNA.selection.highlighted.forEach(function (highlightedI) { return highlightedI.setAttribute("visibility", "hidden"); });
        XRNA.selection = {
            highlighted: new Array(),
            selectedElementListeners: new Array()
        };
    };
    XRNA.resetView = function () {
        XRNA.sceneDataBounds = XRNA.sceneHTML.getBoundingClientRect();
        XRNA.sceneDataBounds.x -= XRNA.canvasBounds.x;
        XRNA.sceneDataBounds.y -= XRNA.canvasBounds.y;
        XRNA.sceneTransformData.origin = {
            x: 0,
            y: 0
        };
        XRNA.draggingCoordinates = {
            cacheDragCoordinates: {
                x: 0,
                y: 0
            },
            startDragCoordinates: {
                x: 0,
                y: 0
            }
        };
        XRNA.setZoom(0);
        XRNA.zoomSliderHTML.value = "0";
    };
    XRNA.setZoom = function (zoom) {
        XRNA.sceneTransformData.zoom = Utils.clamp(XRNA.sceneTransformData.minimumZoom, zoom, XRNA.sceneTransformData.maximumZoom);
        XRNA.sceneTransformData.scale = Math.pow(1.05, XRNA.sceneTransformData.zoom);
        XRNA.updateSceneTransform();
    };
    XRNA.updateSceneTransform = function () {
        XRNA.sceneTransformEnd = "translate(" + XRNA.sceneTransformData.origin.x + " " + XRNA.sceneTransformData.origin.y + ") scale(" + XRNA.sceneTransformData.scale + " " + XRNA.sceneTransformData.scale + ")";
        // Note that transformations are applied from right to left.
        XRNA.sceneHTML.setAttribute("transform", XRNA.sceneTransformEnd + " " + XRNA.sceneTransformMiddle + " " + XRNA.sceneTransformStart);
    };
    XRNA.fitSceneDataToCanvasBounds = function () {
        // Scale to fit the screen
        XRNA.sceneDataToCanvasBoundsScalar = Math.min(XRNA.canvasBounds.width / (XRNA.sceneDataBounds.right - XRNA.sceneDataBounds.left), XRNA.canvasBounds.height / (XRNA.sceneDataBounds.bottom - XRNA.sceneDataBounds.top));
        XRNA.sceneTransformMiddle = "scale(" + XRNA.sceneDataToCanvasBoundsScalar + " " + XRNA.sceneDataToCanvasBoundsScalar + ")";
        // Note that transformations are applied from right to left.
        XRNA.sceneHTML.setAttribute("transform", XRNA.sceneTransformEnd + " " + XRNA.sceneTransformMiddle + " " + XRNA.sceneTransformStart);
    };
    XRNA.rnaComplexHTMLId = function (rnaComplexHTMLId) {
        return "RNA Complex #" + rnaComplexHTMLId;
    };
    XRNA.rnaMoleculeHTMLId = function (parentHTMLId, rnaMoleculeIndex) {
        return parentHTMLId + XRNA.ID_DELIMITER + "RNA Molecule #" + rnaMoleculeIndex;
    };
    XRNA.nucleotideHTMLId = function (parentHTMLId, nucleotideIndex) {
        return parentHTMLId + XRNA.ID_DELIMITER + "Nucleotide #" + nucleotideIndex;
    };
    XRNA.nucleotideSymbolHTMLId = function (parentHTMLId) {
        return parentHTMLId + XRNA.ID_DELIMITER + "Symbol";
    };
    XRNA.labelContentHTMLId = function (parentHTMLId) {
        return parentHTMLId + XRNA.ID_DELIMITER + "Label Content";
    };
    XRNA.labelLineHTMLId = function (parentHTMLId) {
        return parentHTMLId + XRNA.ID_DELIMITER + "Label Line";
    };
    XRNA.parentHTMLId = function (htmlId) {
        return htmlId.substring(0, htmlId.lastIndexOf(XRNA.ID_DELIMITER));
    };
    XRNA.labelLineClickableBodyHTMLId = function (parentHTMLId) {
        return parentHTMLId + XRNA.ID_DELIMITER + "Clickable Body";
    };
    XRNA.labelLineClickableCapHTMLId = function (parentHTMLId, capIndex) {
        return parentHTMLId + XRNA.ID_DELIMITER + "Clickable Cap #" + capIndex;
    };
    XRNA.nucleotideBondSymbolHTMLId = function (parentHTMLId) {
        return parentHTMLId + XRNA.ID_DELIMITER + "Bond Symbol";
    };
    XRNA.boundingBoxHTMLId = function (parentHTMLId) {
        return parentHTMLId + XRNA.ID_DELIMITER + "Bounding Box";
    };
    XRNA.createBoundingBox = function (htmlElement) {
        var boundingBox = htmlElement.getBoundingClientRect();
        boundingBox.x -= XRNA.canvasBounds.x;
        boundingBox.y -= XRNA.canvasBounds.y;
        return boundingBox;
    };
    XRNA.fontIdToFont = function (fontID) {
        // Adapted from StringUtil.java:ssFontToFont
        switch (fontID) {
            case 0:
                return {
                    size: 8,
                    family: "Helvetica",
                    style: "normal",
                    weight: "normal"
                };
            case 1:
                return {
                    size: 8,
                    family: "Helvetica",
                    style: "italic",
                    weight: "normal"
                };
            case 2:
                return {
                    size: 8,
                    family: "Helvetica",
                    style: "normal",
                    weight: "bold"
                };
            case 3:
                return {
                    size: 8,
                    family: "Helvetica",
                    style: "italic",
                    weight: "bold"
                };
            case 4:
                return {
                    size: 8,
                    family: "TimesRoman",
                    style: "normal",
                    weight: "normal"
                };
            case 5:
                return {
                    size: 8,
                    family: "TimesRoman",
                    style: "italic",
                    weight: "normal"
                };
            case 6:
                return {
                    size: 8,
                    family: "TimesRoman",
                    style: "normal",
                    weight: "bold"
                };
            case 7:
                return {
                    size: 8,
                    family: "TimesRoman",
                    style: "italic",
                    weight: "bold"
                };
            case 8:
                return {
                    size: 8,
                    family: "Courier",
                    style: "normal",
                    weight: "normal"
                };
            case 9:
                return {
                    size: 8,
                    family: "Courier",
                    style: "italic",
                    weight: "normal"
                };
            case 10:
                return {
                    size: 8,
                    family: "Courier",
                    style: "normal",
                    weight: "bold"
                };
            case 11:
                return {
                    size: 8,
                    family: "Courier",
                    style: "italic",
                    weight: "bold"
                };
            case 12:
                return {
                    size: 8,
                    family: "TimesRoman",
                    style: "normal",
                    weight: "normal"
                };
            case 13:
                return {
                    size: 8,
                    family: "Dialog",
                    style: "normal",
                    weight: "normal"
                };
            case 14:
                return {
                    size: 8,
                    family: "Dialog",
                    style: "italic",
                    weight: "normal"
                };
            case 15:
                return {
                    size: 8,
                    family: "Dialog",
                    style: "normal",
                    weight: "bold"
                };
            case 16:
                return {
                    size: 8,
                    family: "Dialog",
                    style: "italic",
                    weight: "bold"
                };
            case 17:
                return {
                    size: 8,
                    family: "DialogInput",
                    style: "normal",
                    weight: "normal"
                };
            case 18:
                return {
                    size: 8,
                    family: "DialogInput",
                    style: "italic",
                    weight: "normal"
                };
            case 19:
                return {
                    size: 8,
                    family: "DialogInput",
                    style: "normal",
                    weight: "bold"
                };
            case 20:
                return {
                    size: 8,
                    family: "DialogInput",
                    style: "italic",
                    weight: "bold"
                };
            default:
                return {
                    size: 8,
                    family: "Helvetica",
                    style: "normal",
                    weight: "normal"
                };
        }
    };
    XRNA.fontToFontId = function (font) {
        // A logical inversion of fontIDToFont. Implemented for backward compatibility.
        switch (font.family + "_" + font.style + "_" + font.weight) {
            default:
            case "Helvetica_normal_normal":
                return 0;
            case "Helvetica_italic_normal":
                return 1;
            case "Helvetica_normal_bold":
                return 2;
            case "Helvetica_italic_bold":
                return 3;
            case "TimesRoman_normal_normal":
                return 4;
            case "TimesRoman_italic_normal":
                return 5;
            case "TimesRoman_normal_bold":
                return 6;
            case "TimesRoman_italic_bold":
                return 7;
            case "Courier_normal_normal":
                return 8;
            case "Courier_italic_normal":
                return 9;
            case "Courier_normal_bold":
                return 10;
            case "Courier_italic_bold":
                return 11;
            case "TimesRoman_normal_normal":
                return 12;
            case "Dialog_normal_normal":
                return 13;
            case "Dialog_italic_normal":
                return 14;
            case "Dialog_normal_bold":
                return 15;
            case "Dialog_italic_bold":
                return 16;
            case "DialogInput_normal_normal":
                return 17;
            case "DialogInput_italic_normal":
                return 18;
            case "DialogInput_normal_bold":
                return 19;
            case "DialogInput_italic_bold":
                return 20;
        }
    };
    XRNA.populateAndShowContextMenu = function (mouseEvent, populateContextMenuHelper) {
        while (XRNA.contextMenuHTML.firstChild) {
            XRNA.contextMenuHTML.removeChild(XRNA.contextMenuHTML.firstChild);
        }
        var contextMenuDimension = Math.ceil(Math.min(XRNA.canvasBounds.width, XRNA.canvasBounds.height) / 2.0), contextMenuDimensionAsString = contextMenuDimension + "px";
        XRNA.contextMenuHTML.style.display = "block";
        XRNA.contextMenuHTML.style.width = contextMenuDimensionAsString;
        XRNA.contextMenuHTML.style.height = contextMenuDimensionAsString;
        // Provide a buffer for the context menu's border.
        var borderWidth = parseFloat(XRNA.contextMenuHTML.style.borderWidth.match(/\d+(?:\.\d*)?/)[0]);
        XRNA.contextMenuHTML.style.left = (Math.min(XRNA.canvasBounds.x + XRNA.canvasBounds.width - contextMenuDimension - 2 * borderWidth, mouseEvent.pageX)) + 'px';
        XRNA.contextMenuHTML.style.top = (Math.min(XRNA.canvasBounds.y + XRNA.canvasBounds.height - contextMenuDimension - 2 * borderWidth, mouseEvent.pageY)) + 'px';
        populateContextMenuHelper();
    };
    XRNA.handleNucleotideOnMouseDown = function (nucleotideHTML, mouseEvent) {
        var newButtonIndex = Utils.getButtonIndex(mouseEvent), pressedButtonIndex = newButtonIndex - XRNA.buttonIndex, mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x, mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y, selectionConstraint = XRNA.namedSelectionConstraintsMap[XRNA.selectionConstraintHTML.value], indicesAsStrings = nucleotideHTML.id.match(/#\d+/g), rnaComplexIndex = parseInt(indicesAsStrings[0].substring(1)), rnaMoleculeIndex = parseInt(indicesAsStrings[1].substring(1)), nucleotideIndex = parseInt(indicesAsStrings[2].substring(1));
        XRNA.buttonIndex = newButtonIndex;
        if (pressedButtonIndex & ButtonIndex.LEFT) {
            if (document.getElementById("editTab").style.display == "block") {
                XRNA.resetSelection();
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x: mouseInCanvasX,
                    y: mouseInCanvasY
                };
                if (selectionConstraint.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex)) {
                    selectionConstraint.populateXRNASelection(nucleotideHTML, selectionConstraint.getSelectedNucleotideIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex));
                }
                else {
                    alert(selectionConstraint.getErrorMessageForSelection());
                }
            }
            else {
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x: mouseInCanvasX,
                    y: mouseInCanvasY
                };
            }
        }
        else if (pressedButtonIndex & ButtonIndex.RIGHT) {
            if (document.getElementById("editTab").style.display == "block") {
                if (selectionConstraint.approveSelectedNucleotideForContextMenu(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex)) {
                    XRNA.populateAndShowContextMenu(mouseEvent, function () { return selectionConstraint.populateEditContextMenu(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex); });
                }
                else {
                    alert(selectionConstraint.getErrorMessageForContextMenu());
                }
            }
            else if (document.getElementById("formatTab").style.display == "block") {
                XRNA.populateAndShowContextMenu(mouseEvent, function () { return selectionConstraint.populateFormatContextMenu(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex); });
            }
        }
        return false;
    };
    XRNA.handleLabelContentOnMouseDown = function (labelContentHTML, mouseEvent) {
        var newButtonIndex = Utils.getButtonIndex(mouseEvent), pressedButtonIndex = XRNA.buttonIndex - newButtonIndex, mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x, mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y;
        XRNA.buttonIndex = newButtonIndex;
        if (pressedButtonIndex & ButtonIndex.LEFT) {
            if (document.getElementById("editTab").style.display == "block") {
                XRNA.resetSelection();
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x: mouseInCanvasX,
                    y: mouseInCanvasY
                };
                var boundingBoxHTML_1 = document.getElementById(XRNA.boundingBoxHTMLId(labelContentHTML.id)), nucleotideId = XRNA.parentHTMLId(labelContentHTML.id), indicesAsStrings = nucleotideId.match(/#(\d+)/g), labelContent_2 = XRNA.rnaComplexes[parseInt(indicesAsStrings[0].substring(1))].rnaMolecules[parseInt(indicesAsStrings[1].substring(1))].nucleotides[parseInt(indicesAsStrings[2].substring(1))].labelContent;
                boundingBoxHTML_1.setAttribute("visibility", "visible");
                XRNA.selection.highlighted.push(boundingBoxHTML_1);
                XRNA.selection.selectedElementListeners.push(new /** @class */ (function (_super) {
                    __extends(class_3, _super);
                    function class_3() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    class_3.prototype.updateXYHelper = function (x, y) {
                        labelContentHTML.setAttribute("x", "" + x);
                        labelContentHTML.setAttribute("y", "" + y);
                    };
                    return class_3;
                }(SelectedElementListener))(parseFloat(labelContentHTML.getAttribute("x")), parseFloat(labelContentHTML.getAttribute("y")), true, false), new /** @class */ (function (_super) {
                    __extends(class_4, _super);
                    function class_4() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    class_4.prototype.updateXYHelper = function (x, y) {
                        boundingBoxHTML_1.setAttribute("x", "" + x);
                        boundingBoxHTML_1.setAttribute("y", "" + y);
                    };
                    return class_4;
                }(SelectedElementListener))(parseFloat(boundingBoxHTML_1.getAttribute("x")), parseFloat(boundingBoxHTML_1.getAttribute("y")), false, false), new /** @class */ (function (_super) {
                    __extends(class_5, _super);
                    function class_5() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    class_5.prototype.updateXYHelper = function (x, y) {
                        labelContent_2.x = x;
                        labelContent_2.y = y;
                    };
                    return class_5;
                }(SelectedElementListener))(labelContent_2.x, labelContent_2.y, false, false));
            }
            else {
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x: mouseInCanvasX,
                    y: mouseInCanvasY
                };
            }
        }
        else {
            // TODO: populate the context menu for label content.
        }
        return false;
    };
    XRNA.handleLabelLineClickableBodyOnMouseDown = function (labelLineClickableBodyHTML, mouseEvent) {
        var newButtonIndex = Utils.getButtonIndex(mouseEvent), pressedButtonIndex = newButtonIndex - XRNA.buttonIndex, mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x, mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y;
        XRNA.buttonIndex = newButtonIndex;
        if (pressedButtonIndex & ButtonIndex.LEFT) {
            if (document.getElementById("editTab").style.display == "block") {
                XRNA.resetSelection();
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x: mouseInCanvasX,
                    y: mouseInCanvasY
                };
                var id = labelLineClickableBodyHTML.id, indices = id.match(/#\d+/g), rnaComplexIndex = parseInt(indices[0].substring(1)), rnaMoleculeIndex = parseInt(indices[1].substring(1)), nucleotideIndex = parseInt(indices[2].substring(1)), nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex], labelLine_2 = nucleotide.labelLine, labelLineId = XRNA.parentHTMLId(labelLineClickableBodyHTML.id), labelLineHTML_1 = document.getElementById(labelLineId), nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(XRNA.parentHTMLId(labelLineId))), nucleotideBoundingBoxCenter_1 = {
                    x: parseFloat(nucleotideBoundingBoxHTML.getAttribute("x")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("width")) / 2.0,
                    y: parseFloat(nucleotideBoundingBoxHTML.getAttribute("y")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("height")) / 2.0
                }, cacheV0_1 = {
                    x: labelLine_2.v0.x,
                    y: labelLine_2.v0.y
                }, cacheV1_1 = {
                    x: labelLine_2.v1.x,
                    y: labelLine_2.v1.y
                }, labelLineClickableCap0HTML_1 = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineId, 0)), labelLineClickableCap1HTML_1 = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineId, 1));
                labelLineClickableBodyHTML.setAttribute('visibility', 'visible');
                XRNA.selection.highlighted.push(labelLineClickableBodyHTML);
                XRNA.selection.selectedElementListeners.push(new /** @class */ (function (_super) {
                    __extends(class_6, _super);
                    function class_6() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    class_6.prototype.updateXYHelper = function (dx, dy) {
                        labelLine_2.v0 = {
                            x: cacheV0_1.x + dx,
                            y: cacheV0_1.y + dy
                        };
                        labelLine_2.v1 = {
                            x: cacheV1_1.x + dx,
                            y: cacheV1_1.y + dy
                        };
                        var labelLineHTMLX1 = nucleotideBoundingBoxCenter_1.x + labelLine_2.v0.x, labelLineHTMLY1 = nucleotideBoundingBoxCenter_1.y + labelLine_2.v0.y, labelLineHTMLX2 = nucleotideBoundingBoxCenter_1.x + labelLine_2.v1.x, labelLineHTMLY2 = nucleotideBoundingBoxCenter_1.y + labelLine_2.v1.y, pathDefinitions = Utils.getClickablePathDefinitionsFromLine({
                            v0: {
                                x: labelLineHTMLX1,
                                y: labelLineHTMLY1
                            },
                            v1: {
                                x: labelLineHTMLX2,
                                y: labelLineHTMLY2
                            }
                        });
                        labelLineHTML_1.setAttribute("x1", "" + labelLineHTMLX1);
                        labelLineHTML_1.setAttribute("y1", "" + labelLineHTMLY1);
                        labelLineHTML_1.setAttribute("x2", "" + labelLineHTMLX2);
                        labelLineHTML_1.setAttribute("y2", "" + labelLineHTMLY2);
                        labelLineClickableBodyHTML.setAttribute("d", pathDefinitions.bodyPathDefinition);
                        labelLineClickableCap0HTML_1.setAttribute("d", pathDefinitions.cap0PathDefinition);
                        labelLineClickableCap1HTML_1.setAttribute("d", pathDefinitions.cap1PathDefinition);
                    };
                    return class_6;
                }(SelectedElementListener))(0, 0, false, true));
            }
            else {
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x: mouseInCanvasX,
                    y: mouseInCanvasY
                };
            }
        }
        else {
            // TODO: populate context menu.
        }
        return false;
    };
    XRNA.handleLabelLineClickableCapOnMouseDown = function (labelLineClickableCapHTML, mouseEvent) {
        var newButtonIndex = Utils.getButtonIndex(mouseEvent), pressedButtonIndex = newButtonIndex - XRNA.buttonIndex, mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x, mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y;
        XRNA.buttonIndex = newButtonIndex;
        if (pressedButtonIndex & ButtonIndex.LEFT) {
            if (document.getElementById("editTab").style.display == "block") {
                XRNA.resetSelection();
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x: mouseInCanvasX,
                    y: mouseInCanvasY
                };
                var labelLineId = XRNA.parentHTMLId(labelLineClickableCapHTML.id), labelLineClickableBodyHTML_1 = document.getElementById(XRNA.labelLineClickableBodyHTMLId(labelLineId)), indicesAsStrings = labelLineClickableCapHTML.id.match(/#\d+/g), capIndex_1 = parseInt(indicesAsStrings[indicesAsStrings.length - 1].substring(1)), labelLineClickableCap0HTML_2 = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineId, 0)), labelLineClickableCap1HTML_2 = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineId, 1)), rnaComplexIndex = parseInt(indicesAsStrings[0].substring(1)), rnaMoleculeIndex = parseInt(indicesAsStrings[1].substring(1)), nucleotideIndex = parseInt(indicesAsStrings[2].substring(1)), nucleotide_1 = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex], labelLineEndpoint_1, labelLineHTML_2 = document.getElementById(labelLineId), nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex))), nucleotideBoundingBoxCenter_2 = {
                    x: parseFloat(nucleotideBoundingBoxHTML.getAttribute("x")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("width")) / 2.0,
                    y: parseFloat(nucleotideBoundingBoxHTML.getAttribute("y")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("height")) / 2.0
                };
                if (capIndex_1 == 0) {
                    labelLineEndpoint_1 = nucleotide_1.labelLine.v0;
                }
                else {
                    labelLineEndpoint_1 = nucleotide_1.labelLine.v1;
                }
                labelLineClickableCapHTML.setAttribute("visibility", "block");
                XRNA.selection.highlighted.push(labelLineClickableCapHTML);
                var cacheLabelLineHTMLCoordinates_1 = {
                    x: parseFloat(labelLineHTML_2.getAttribute("x" + (capIndex_1 + 1))),
                    y: parseFloat(labelLineHTML_2.getAttribute("y" + (capIndex_1 + 1)))
                };
                XRNA.selection.selectedElementListeners.push(new /** @class */ (function (_super) {
                    __extends(class_7, _super);
                    function class_7() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    class_7.prototype.updateXYHelper = function (dx, dy) {
                        labelLineEndpoint_1.x = this.cache.x + dx;
                        labelLineEndpoint_1.y = this.cache.y + dy;
                        labelLineHTML_2.setAttribute("x" + (capIndex_1 + 1), "" + (cacheLabelLineHTMLCoordinates_1.x + dx));
                        labelLineHTML_2.setAttribute("y" + (capIndex_1 + 1), "" + (cacheLabelLineHTMLCoordinates_1.y + dy));
                        var pathDefinitions = Utils.getClickablePathDefinitionsFromLine({
                            v0: VectorOperations2D.add(nucleotideBoundingBoxCenter_2, nucleotide_1.labelLine.v0),
                            v1: VectorOperations2D.add(nucleotideBoundingBoxCenter_2, nucleotide_1.labelLine.v1)
                        });
                        labelLineClickableCap0HTML_2.setAttribute("d", pathDefinitions.cap0PathDefinition);
                        labelLineClickableCap1HTML_2.setAttribute("d", pathDefinitions.cap1PathDefinition);
                        labelLineClickableBodyHTML_1.setAttribute("d", pathDefinitions.bodyPathDefinition);
                    };
                    return class_7;
                }(SelectedElementListener))(labelLineEndpoint_1.x, labelLineEndpoint_1.y, false, true));
            }
            else {
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x: mouseInCanvasX,
                    y: mouseInCanvasY
                };
            }
        }
        else {
            // TODO: populate the context menu.
        }
        return false;
    };
    XRNA.populateScene = function () {
        XRNA.sceneHTML.setAttribute("transform", "");
        // Clear the scene.
        for (var childIndex = 0; childIndex < XRNA.sceneHTML.children.length; childIndex++) {
            var child = XRNA.sceneHTML.children[childIndex];
            if (child != XRNA.sketchesHTML) {
                XRNA.sceneHTML.removeChild(child);
            }
        }
        // Populate the scene.
        for (var rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            var rnaComplex = XRNA.rnaComplexes[rnaComplexIndex], rnaComplexId = XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaComplexHTML = document.createElementNS(svgNameSpaceURL, "g");
            XRNA.sceneHTML.appendChild(rnaComplexHTML);
            rnaComplexHTML.setAttribute("id", rnaComplexId);
            for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < rnaComplex.rnaMolecules.length; rnaMoleculeIndex++) {
                var rnaMolecule = rnaComplex.rnaMolecules[rnaMoleculeIndex], nucleotides = rnaMolecule.nucleotides, rnaMoleculeId = XRNA.rnaMoleculeHTMLId(rnaComplexId, rnaMoleculeIndex), rnaMoleculeHTML = document.createElementNS(svgNameSpaceURL, "g");
                rnaComplexHTML.appendChild(rnaMoleculeHTML);
                rnaMoleculeHTML.setAttribute("id", rnaMoleculeId);
                var _loop_3 = function (nucleotideIndex) {
                    var nucleotide = nucleotides[nucleotideIndex], nucleotideId = XRNA.nucleotideHTMLId(rnaMoleculeId, nucleotideIndex), nucleotideHTML = document.createElementNS(svgNameSpaceURL, "g");
                    rnaMoleculeHTML.appendChild(nucleotideHTML);
                    nucleotideHTML.setAttribute("id", nucleotideId);
                    nucleotideHTML.setAttribute("transform", "translate(" + nucleotide.position.x + " " + nucleotide.position.y + ")");
                    nucleotideHTML.onmousedown = function (mouseEvent) { return XRNA.handleNucleotideOnMouseDown(nucleotideHTML, mouseEvent); };
                    var symbolHTML = document.createElementNS(svgNameSpaceURL, "text");
                    // The displacement from the nucleotide html element is {x: 0, y: 0}.
                    nucleotideHTML.appendChild(symbolHTML);
                    symbolHTML.setAttribute("id", XRNA.nucleotideSymbolHTMLId(nucleotideId));
                    symbolHTML.setAttribute("stroke", "rgb(" + nucleotide.symbol.red + " " + nucleotide.symbol.green + " " + nucleotide.symbol.blue + ")");
                    symbolHTML.setAttribute("transform", "scale(1 -1)");
                    symbolHTML.setAttribute("font-size", "" + nucleotide.symbol.size);
                    symbolHTML.setAttribute("font-family", "" + nucleotide.symbol.family);
                    symbolHTML.setAttribute("font-style", "" + nucleotide.symbol.style);
                    symbolHTML.setAttribute("font-weight", "" + nucleotide.symbol.weight);
                    symbolHTML.textContent = nucleotide.symbol.string;
                    var nucleotideBoundingBox = XRNA.createBoundingBox(symbolHTML);
                    nucleotideBoundingBox.x -= nucleotide.position.x;
                    nucleotideBoundingBox.y -= nucleotide.position.y;
                    var boundingBoxHTML = Utils.createBoundingBoxHTML(nucleotideBoundingBox, XRNA.boundingBoxHTMLId(nucleotideId)), nucleotideBoundingBoxCenterX = nucleotideBoundingBox.x + nucleotideBoundingBox.width / 2.0, nucleotideBoundingBoxCenterY = nucleotideBoundingBox.y + nucleotideBoundingBox.height / 2.0;
                    nucleotideHTML.appendChild(boundingBoxHTML);
                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex > nucleotide.basePairIndex) {
                        XRNA.createNucleotideBondSymbol(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex, rnaMoleculeIndex, nucleotide.basePairIndex);
                    }
                    if (nucleotide.labelLine) {
                        var labelLineHTML = document.createElementNS(svgNameSpaceURL, "line"), labelLineId = XRNA.labelLineHTMLId(nucleotideId), v0X = nucleotideBoundingBoxCenterX + nucleotide.labelLine.v0.x, v0Y = nucleotideBoundingBoxCenterY + nucleotide.labelLine.v0.y, v1X = nucleotideBoundingBoxCenterX + nucleotide.labelLine.v1.x, v1Y = nucleotideBoundingBoxCenterY + nucleotide.labelLine.v1.y;
                        nucleotideHTML.appendChild(labelLineHTML);
                        labelLineHTML.setAttribute("id", labelLineId);
                        labelLineHTML.setAttribute("stroke-width", "" + nucleotide.labelLine.strokeWidth);
                        labelLineHTML.setAttribute("stroke", "rgb(" + nucleotide.labelLine.red + " " + nucleotide.labelLine.green + " " + nucleotide.labelLine.blue + ")");
                        labelLineHTML.setAttribute("x1", "" + v0X);
                        labelLineHTML.setAttribute("y1", "" + v0Y);
                        labelLineHTML.setAttribute("x2", "" + v1X);
                        labelLineHTML.setAttribute("y2", "" + v1Y);
                        labelLineHTML.setAttribute("pointer-events", "none");
                        var labelLineClickableBodyHTML_2 = document.createElementNS(svgNameSpaceURL, "path"), labelLineClickableCap0HTML_3 = document.createElementNS(svgNameSpaceURL, "path"), labelLineClickableCap1HTML_3 = document.createElementNS(svgNameSpaceURL, "path"), labelLineClickablePathDefinitions = Utils.getClickablePathDefinitionsFromLine({
                            v0: {
                                x: v0X,
                                y: v0Y
                            },
                            v1: {
                                x: v1X,
                                y: v1Y
                            }
                        });
                        [
                            {
                                htmlElement: labelLineClickableBodyHTML_2,
                                path: labelLineClickablePathDefinitions.bodyPathDefinition,
                                onmousedown: function (mouseEvent) { return XRNA.handleLabelLineClickableBodyOnMouseDown(labelLineClickableBodyHTML_2, mouseEvent); },
                                id: XRNA.labelLineClickableBodyHTMLId(labelLineId)
                            },
                            {
                                htmlElement: labelLineClickableCap0HTML_3,
                                path: labelLineClickablePathDefinitions.cap0PathDefinition,
                                onmousedown: function (mouseEvent) { return XRNA.handleLabelLineClickableCapOnMouseDown(labelLineClickableCap0HTML_3, mouseEvent); },
                                id: XRNA.labelLineClickableCapHTMLId(labelLineId, 0)
                            },
                            {
                                htmlElement: labelLineClickableCap1HTML_3,
                                path: labelLineClickablePathDefinitions.cap1PathDefinition,
                                onmousedown: function (mouseEvent) { return XRNA.handleLabelLineClickableCapOnMouseDown(labelLineClickableCap1HTML_3, mouseEvent); },
                                id: XRNA.labelLineClickableCapHTMLId(labelLineId, 1)
                            }
                        ].forEach(function (htmlElementWithData) {
                            Utils.setBoundingBoxHTMLAttributes(htmlElementWithData.htmlElement, htmlElementWithData.id);
                            nucleotideHTML.appendChild(htmlElementWithData.htmlElement);
                            htmlElementWithData.htmlElement.setAttribute("pointer-events", "all");
                            htmlElementWithData.htmlElement.setAttribute("d", htmlElementWithData.path);
                            htmlElementWithData.htmlElement.onmousedown = function (mouseEvent) { return htmlElementWithData.onmousedown(mouseEvent); };
                        });
                    }
                    if (nucleotide.labelContent) {
                        var labelContentHTML_1 = document.createElementNS(svgNameSpaceURL, "text"), labelContentId = XRNA.labelContentHTMLId(nucleotideId);
                        nucleotideHTML.appendChild(labelContentHTML_1);
                        labelContentHTML_1.setAttribute("id", labelContentId);
                        labelContentHTML_1.setAttribute("stroke", "rgb(" + nucleotide.labelContent.red + " " + nucleotide.labelContent.green + " " + nucleotide.labelContent.blue + ")");
                        labelContentHTML_1.setAttribute("font-size", "" + nucleotide.labelContent.size);
                        labelContentHTML_1.setAttribute("font-family", "" + nucleotide.labelContent.family);
                        labelContentHTML_1.setAttribute("font-style", "" + nucleotide.labelContent.style);
                        labelContentHTML_1.setAttribute("font-weight", "" + nucleotide.labelContent.weight);
                        labelContentHTML_1.setAttribute("transform", "scale(1 -1)");
                        labelContentHTML_1.onmousedown = function (mouseEvent) { return XRNA.handleLabelContentOnMouseDown(labelContentHTML_1, mouseEvent); };
                        labelContentHTML_1.textContent = nucleotide.labelContent.string;
                        var labelContentBoundingBox = XRNA.createBoundingBox(labelContentHTML_1), labelContentHTMLX = nucleotideBoundingBoxCenterX - nucleotideBoundingBox.x + nucleotide.labelContent.x - labelContentBoundingBox.width / 2.0, labelContentHTMLY = nucleotideBoundingBoxCenterY - nucleotideBoundingBox.y - nucleotide.labelContent.y - labelContentBoundingBox.height / 2.0;
                        labelContentHTML_1.setAttribute("x", "" + labelContentHTMLX);
                        labelContentHTML_1.setAttribute("y", "" + labelContentHTMLY);
                        // Reset the bounding box to the position of the transformed labelContentHTML.
                        labelContentBoundingBox = XRNA.createBoundingBox(labelContentHTML_1);
                        labelContentBoundingBox.x -= nucleotide.position.x;
                        labelContentBoundingBox.y -= nucleotide.position.y;
                        nucleotideHTML.appendChild(Utils.createBoundingBoxHTML(labelContentBoundingBox, XRNA.boundingBoxHTMLId(labelContentId)));
                    }
                };
                for (var nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    _loop_3(nucleotideIndex);
                }
            }
        }
        XRNA.sceneDataBounds = XRNA.sceneHTML.getBoundingClientRect();
        XRNA.sceneDataBounds.x -= XRNA.canvasBounds.x;
        XRNA.sceneDataBounds.y -= XRNA.canvasBounds.y;
        // Translate the scene to the origin.
        // Invert the y axis. Note that graphical y axes are inverted in comparison to standard cartesian coordinates.
        // Center the scene along the y axis.
        XRNA.sceneTransformStart = "translate(0 " + (XRNA.sceneDataBounds.bottom - XRNA.sceneDataBounds.top) + ") scale(1 -1) translate(" + -XRNA.sceneDataBounds.left + " " + -XRNA.sceneDataBounds.top + ")";
        XRNA.fitSceneDataToCanvasBounds();
    };
    XRNA.createNucleotideBond = function (rnaComplexIndex, rnaMoleculeIndex0, nucleotideIndex0, rnaMoleculeIndex1, nucleotideIndex1, boundingBoxOffset) {
        if (boundingBoxOffset === void 0) { boundingBoxOffset = null; }
        XRNA.createNucleotideBondSymbol(rnaComplexIndex, rnaMoleculeIndex0, nucleotideIndex0, rnaMoleculeIndex1, nucleotideIndex1, boundingBoxOffset);
        var rnaComplex = XRNA.rnaComplexes[rnaComplexIndex], nucleotide0 = rnaComplex.rnaMolecules[rnaMoleculeIndex0].nucleotides[nucleotideIndex0], nucleotide1 = rnaComplex.rnaMolecules[rnaMoleculeIndex1].nucleotides[nucleotideIndex1];
        nucleotide0.basePairIndex = nucleotideIndex1;
        nucleotide1.basePairIndex = nucleotideIndex0;
    };
    XRNA.createNucleotideBondSymbol = function (rnaComplexIndex, rnaMoleculeIndex0, nucleotideIndex0, rnaMoleculeIndex1, nucleotideIndex1, boundingBoxOffset) {
        if (boundingBoxOffset === void 0) { boundingBoxOffset = null; }
        if (((rnaMoleculeIndex1 - rnaMoleculeIndex0) || (nucleotideIndex1 - nucleotideIndex0)) > 0) {
            // Enforce that the zeroth rnaMoleculeIndex, nucleotideIndex pair is greater than the other.
            var tempRnaMoleculeIndex = rnaMoleculeIndex0, tempNucleotideIndex = nucleotideIndex0;
            rnaMoleculeIndex0 = rnaMoleculeIndex1;
            nucleotideIndex0 = nucleotideIndex1;
            rnaMoleculeIndex1 = tempRnaMoleculeIndex;
            nucleotideIndex1 = tempNucleotideIndex;
        }
        var nucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaMoleculeIndex0), nucleotideIndex0), nucleotideHTML = document.getElementById(nucleotideId);
        if (!boundingBoxOffset) {
            var boundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(nucleotideId));
            boundingBoxOffset = {
                x: parseFloat(boundingBoxHTML.getAttribute("x")) + parseFloat(boundingBoxHTML.getAttribute("width")) / 2.0,
                y: parseFloat(boundingBoxHTML.getAttribute("y")) + parseFloat(boundingBoxHTML.getAttribute("height")) / 2.0
            };
        }
        var rnaComplex = XRNA.rnaComplexes[rnaComplexIndex], nucleotide = rnaComplex.rnaMolecules[rnaMoleculeIndex0].nucleotides[nucleotideIndex0], basePairedNucleotide = rnaComplex.rnaMolecules[rnaMoleculeIndex1].nucleotides[nucleotideIndex1], dv = VectorOperations2D.subtract(basePairedNucleotide.position, nucleotide.position), bondSymbolHTML, circleHTMLHelper = function (fill) {
            bondSymbolHTML = document.createElementNS(svgNameSpaceURL, 'circle');
            bondSymbolHTML.setAttribute('fill', fill);
            var interpolation = VectorOperations2D.add(boundingBoxOffset, VectorOperations2D.scaleUp(dv, 0.5));
            bondSymbolHTML.setAttribute('cx', '' + interpolation.x);
            bondSymbolHTML.setAttribute('cy', '' + interpolation.y);
            bondSymbolHTML.setAttribute('r', '' + VectorOperations2D.magnitude(dv) / 8.0);
        };
        // Hardcode black for now. This appears to be consistent with XRNA-GT (Java).
        var strokeAndFill = 'black';
        switch (nucleotide.symbol.string + basePairedNucleotide.symbol.string) {
            case 'AA':
            case 'CC':
            case 'GG':
            case 'UU':
            case 'AC':
            case 'CA':
            case 'CU':
            case 'UC': {
                circleHTMLHelper('none');
                break;
            }
            case 'AG':
            case 'GA':
            case 'GU':
            case 'UG': {
                circleHTMLHelper(strokeAndFill);
                break;
            }
            case 'AU':
            case 'UA':
            case 'CG':
            case 'GC': {
                bondSymbolHTML = document.createElementNS(svgNameSpaceURL, 'line');
                var interpolation0 = VectorOperations2D.add(boundingBoxOffset, VectorOperations2D.scaleUp(dv, 0.25)), interpolation1 = VectorOperations2D.add(boundingBoxOffset, VectorOperations2D.scaleUp(dv, 0.75));
                bondSymbolHTML.setAttribute('x1', '' + interpolation0.x);
                bondSymbolHTML.setAttribute('y1', '' + interpolation0.y);
                bondSymbolHTML.setAttribute('x2', '' + interpolation1.x);
                bondSymbolHTML.setAttribute('y2', '' + interpolation1.y);
                break;
            }
        }
        // Note that the bondSymbolHTML is a child exclusively of the nucleotideHTML with the greater nucleotide index.
        nucleotideHTML.appendChild(bondSymbolHTML);
        bondSymbolHTML.setAttribute('stroke', strokeAndFill);
        bondSymbolHTML.setAttribute('id', XRNA.nucleotideBondSymbolHTMLId(nucleotideId));
    };
    XRNA.deleteNucleotideBond = function (rnaComplexIndex, rnaMoleculeIndex0, nucleotideIndex0, rnaMoleculeIndex1, nucleotideIndex1) {
        if (((rnaMoleculeIndex1 - rnaMoleculeIndex0) || (nucleotideIndex1 - nucleotideIndex0)) > 0) {
            // Enforce that the zeroth rnaMoleculeIndex, nucleotideIndex pair is greater than the other.
            var tempRnaMoleculeIndex = rnaMoleculeIndex0, tempNucleotideIndex = nucleotideIndex0;
            rnaMoleculeIndex0 = rnaMoleculeIndex1;
            nucleotideIndex0 = nucleotideIndex1;
            rnaMoleculeIndex1 = tempRnaMoleculeIndex;
            nucleotideIndex1 = tempNucleotideIndex;
        }
        var nucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaMoleculeIndex0), nucleotideIndex0);
        document.getElementById(nucleotideId).removeChild(document.getElementById(XRNA.nucleotideBondSymbolHTMLId(nucleotideId)));
        var rnaComplex = XRNA.rnaComplexes[rnaComplexIndex];
        rnaComplex.rnaMolecules[rnaMoleculeIndex0].nucleotides[nucleotideIndex0].basePairIndex = -1;
        rnaComplex.rnaMolecules[rnaMoleculeIndex1].nucleotides[nucleotideIndex1].basePairIndex = -1;
    };
    XRNA.updateSelectedOutputFileExtension = function (outputFileExtension) {
        XRNA.outputFileHandlerMap[outputFileExtension].handleSelectedOutputFileExtension();
    };
    XRNA.ID_DELIMITER = ": ";
    XRNA.canvasBounds = {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        top: 0,
        left: 0,
        bottom: 1,
        right: 1
    };
    XRNA.sceneDataBounds = {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        top: 0,
        left: 0,
        bottom: 1,
        right: 1
    };
    XRNA.sceneDataToCanvasBoundsScalar = 1;
    XRNA.sceneTransformStart = "";
    XRNA.sceneTransformMiddle = "";
    XRNA.sceneTransformEnd = "";
    XRNA.sceneTransformData = {
        minimumZoom: -48,
        maximumZoom: 48,
        // zoom is on a linear scale. It is converted to an exponential scale before use in the scene transform.
        zoom: 0,
        scale: 1,
        origin: {
            x: 0,
            y: 0
        }
    };
    XRNA.inputFileHandlerMap = {
        "xml": XRNA.parseInputXMLFile,
        "ps": XRNA.parseInputXMLFile,
        "ss": XRNA.parseInputXMLFile,
        "xrna": XRNA.parseInputXMLFile,
        "str": XRNA.parseInputSTRFile,
        "svg": XRNA.parseInputSVGFile,
        "json": XRNA.parseInputJSONFile
    };
    XRNA.outputFileHandlerMap = {
        "xrna": new /** @class */ (function (_super) {
            __extends(class_8, _super);
            function class_8() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.writeOutputFile = XRNA.generateOutputXRNAFile;
                return _this;
            }
            return class_8;
        }(OutputFileExtensionHandler)),
        "svg": new /** @class */ (function (_super) {
            __extends(class_9, _super);
            function class_9() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.writeOutputFile = XRNA.generateOutputSVGFile;
                return _this;
            }
            return class_9;
        }(OutputFileExtensionHandler)),
        "tr": new /** @class */ (function (_super) {
            __extends(class_10, _super);
            function class_10() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.writeOutputFile = XRNA.generateOutputTRFile;
                return _this;
            }
            return class_10;
        }(OutputFileExtensionHandler)),
        "csv": new /** @class */ (function (_super) {
            __extends(class_11, _super);
            function class_11() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.writeOutputFile = XRNA.generateOutputCSVFile;
                return _this;
            }
            return class_11;
        }(OutputFileExtensionHandler)),
        "bpseq": new /** @class */ (function (_super) {
            __extends(class_12, _super);
            function class_12() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.writeOutputFile = XRNA.generateOutputBPSEQFile;
                return _this;
            }
            return class_12;
        }(OutputFileExtensionHandler)),
        "jpg": new /** @class */ (function (_super) {
            __extends(class_13, _super);
            function class_13() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.writeOutputFile = XRNA.generateOutputJPGFile;
                return _this;
            }
            return class_13;
        }(OutputFileExtensionHandler)),
        "json": new /** @class */ (function (_super) {
            __extends(class_14, _super);
            function class_14() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.selectedRNAComplex = null;
                _this.selectedRNAMolecule = null;
                _this.writeOutputFile = function () {
                    var outputFile = "{";
                    if (_this.selectedRNAMolecule) {
                        outputFile += XRNA.generateOutputJSONFileForRNAMolecule(_this.selectedRNAMolecule);
                    }
                    else if (_this.selectedRNAComplex) {
                        outputFile += XRNA.generateOutputJSONFileForRNAComplex(_this.selectedRNAComplex);
                    }
                    else {
                        outputFile += XRNA.generateOutputJSONFile();
                    }
                    outputFile += "\n}";
                    return outputFile;
                };
                _this.handleSelectedOutputFileExtension = function () {
                    _super.prototype.handleSelectedOutputFileExtension.call(_this);
                    var rnaComplexSelector = document.createElement("select"), rnaMoleculeSelector = document.createElement("select");
                    for (var i = 0; i < XRNA.rnaComplexes.length; i++) {
                        rnaComplexSelector.appendChild(new Option("" + XRNA.rnaComplexes[i].name, "" + i));
                    }
                    rnaComplexSelector.appendChild(new Option("", "-1"));
                    rnaComplexSelector.selectedIndex = -1;
                    rnaComplexSelector.onchange = function () {
                        _this.selectedRNAComplex = XRNA.rnaComplexes[parseInt(rnaComplexSelector.value)];
                        if (_this.selectedRNAComplex) {
                            var rnaMolecules = _this.selectedRNAComplex.rnaMolecules;
                            for (var i = 0; i < rnaMolecules.length; i++) {
                                rnaMoleculeSelector.appendChild(new Option("" + rnaMolecules[i].name, "" + i));
                            }
                            rnaMoleculeSelector.appendChild(new Option("", "-1"));
                            rnaMoleculeSelector.selectedIndex = -1;
                        }
                        _this.selectedRNAMolecule = null;
                    };
                    rnaMoleculeSelector.onchange = function () {
                        _this.selectedRNAMolecule = _this.selectedRNAComplex.rnaMolecules[parseInt(rnaMoleculeSelector.value)];
                    };
                    var rnaComplexTextHTML = document.createElement("text"), rnaMoleculeTextHTML = document.createElement("text");
                    rnaComplexTextHTML.textContent = "RNA Complex: ";
                    rnaMoleculeTextHTML.textContent = "RNA Molecule: ";
                    XRNA.outputFileSpecificationsDivHTML.appendChild(rnaComplexTextHTML);
                    XRNA.outputFileSpecificationsDivHTML.appendChild(rnaComplexSelector);
                    XRNA.outputFileSpecificationsDivHTML.appendChild(rnaMoleculeTextHTML);
                    XRNA.outputFileSpecificationsDivHTML.appendChild(rnaMoleculeSelector);
                    // parentHTMLElement.insertBefore(rnaComplexSelector, downloadButton);
                    // parentHTMLElement.insertBefore(rnaMoleculeSelector, downloadButton);
                };
                return _this;
            }
            return class_14;
        }(OutputFileExtensionHandler))
    };
    XRNA.namedSelectionConstraintsMap = {
        "RNA Single Nucleotide": new /** @class */ (function (_super) {
            __extends(class_15, _super);
            function class_15() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_15.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex < 0;
            };
            class_15.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_15.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return [{
                        rnaComplexIndex: rnaComplexIndex,
                        rnaMoleculeIndex: rnaMoleculeIndex,
                        nucleotideIndex: nucleotideIndex
                    }];
            };
            class_15.prototype.getErrorMessageForSelection = function () {
                return SelectionConstraint.createErrorMessageForSelection("a nucleotide without a base pair", "a non-base-paired nucleotide");
            };
            class_15.prototype.getErrorMessageForContextMenu = function () {
                throw new Error("This method instance should be unreachable.");
            };
            class_15.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var createTextElement = function (text, fontSize, fontWeight, fontFamily, fontStyle) {
                    if (fontSize === void 0) { fontSize = 12; }
                    if (fontWeight === void 0) { fontWeight = "normal"; }
                    if (fontFamily === void 0) { fontFamily = "Dialog"; }
                    if (fontStyle === void 0) { fontStyle = "normal"; }
                    var textElement = document.createElement("text");
                    textElement.setAttribute("stroke", "black");
                    textElement.style.fontSize = "" + fontSize;
                    textElement.style.fontWeight = fontWeight;
                    textElement.style.fontFamily = fontFamily;
                    textElement.style.fontStyle = fontStyle;
                    textElement.textContent = text;
                    return textElement;
                }, complex = XRNA.rnaComplexes[rnaComplexIndex], rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex], nucleotides = rnaMolecule.nucleotides, nucleotide = nucleotides[nucleotideIndex], nucleotideTextContent = "Nucleotide: " + (nucleotideIndex + rnaMolecule.firstNucleotideIndex) + " " + nucleotide.symbol.string;
                if (nucleotide.basePairIndex >= 0) {
                    nucleotideTextContent += ", Base Pair: " + (nucleotide.basePairIndex + rnaMolecule.firstNucleotideIndex) + " " + nucleotides[nucleotide.basePairIndex].symbol.string;
                }
                XRNA.contextMenuHTML.appendChild(createTextElement("Nucleotide Properties:", 14, "bold"));
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                XRNA.contextMenuHTML.appendChild(createTextElement(nucleotideTextContent));
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                XRNA.contextMenuHTML.appendChild(createTextElement("In RNA Strand \"" + rnaMolecule.name + "\""));
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                var previousNucleotideDistanceHTML = null, nextNucleotideDistanceHTML = null, distanceToPreviousNucleotideTextContentHelper = function () { return "Distance to previous nucleotide: " + VectorOperations2D.distance(nucleotide.position, nucleotides[nucleotideIndex - 1].position).toFixed(2); }, distanceToNextNucleotideTextContentHelper = function () { return "Distance to next nucleotide: " + VectorOperations2D.distance(nucleotide.position, nucleotides[nucleotideIndex + 1].position).toFixed(2); };
                if (nucleotideIndex > 0) {
                    previousNucleotideDistanceHTML = createTextElement(distanceToPreviousNucleotideTextContentHelper());
                    XRNA.contextMenuHTML.appendChild(previousNucleotideDistanceHTML);
                    XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                }
                if (nucleotideIndex < nucleotides.length - 1) {
                    nextNucleotideDistanceHTML = createTextElement(distanceToNextNucleotideTextContentHelper());
                    XRNA.contextMenuHTML.appendChild(nextNucleotideDistanceHTML);
                    XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                }
                XRNA.contextMenuHTML.appendChild(createTextElement("X:"));
                var xInputHTML = document.createElement("input"), yInputHTML = document.createElement("input"), displacementMagnitude = 0.5, nucleotideHTML = document.getElementById(XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex));
                XRNA.contextMenuHTML.appendChild(xInputHTML);
                xInputHTML.setAttribute("type", "text");
                xInputHTML.value = "" + nucleotide.position.x;
                xInputHTML.onchange = function () {
                    var x = parseFloat(xInputHTML.value);
                    nucleotide.position.x = x;
                    nucleotideHTML.setAttribute("transform", "translate(" + xInputHTML.value + " " + nucleotide.position.y + ")");
                    if (previousNucleotideDistanceHTML) {
                        previousNucleotideDistanceHTML.textContent = distanceToPreviousNucleotideTextContentHelper();
                    }
                    if (nextNucleotideDistanceHTML) {
                        nextNucleotideDistanceHTML.textContent = distanceToNextNucleotideTextContentHelper();
                    }
                };
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                XRNA.contextMenuHTML.appendChild(createTextElement("Y:"));
                XRNA.contextMenuHTML.appendChild(yInputHTML);
                yInputHTML.setAttribute("type", "text");
                yInputHTML.value = "" + nucleotide.position.y;
                yInputHTML.onchange = function () {
                    var y = parseFloat(yInputHTML.value);
                    nucleotide.position.y = y;
                    nucleotideHTML.setAttribute("transform", "translate(" + nucleotide.position.x + " " + yInputHTML.value + ")");
                    if (previousNucleotideDistanceHTML) {
                        previousNucleotideDistanceHTML.textContent = distanceToPreviousNucleotideTextContentHelper();
                    }
                    if (nextNucleotideDistanceHTML) {
                        nextNucleotideDistanceHTML.textContent = distanceToNextNucleotideTextContentHelper();
                    }
                };
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                if (nucleotide.basePairIndex < 0) {
                    var svgHTML_1 = document.createElementNS(svgNameSpaceURL, "svg"), pathDimension_1 = parseFloat(XRNA.contextMenuHTML.style.width) / 9.0;
                    XRNA.contextMenuHTML.appendChild(svgHTML_1);
                    svgHTML_1.setAttribute("version", "1.1");
                    svgHTML_1.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    svgHTML_1.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
                    svgHTML_1.setAttribute("xml:space", "preserve");
                    [
                        {
                            // Up arrow
                            pathDefinitionVertices: [
                                {
                                    x: 0.25,
                                    y: 1.0
                                },
                                {
                                    x: 0.25,
                                    y: 0.5
                                },
                                {
                                    x: 0.0,
                                    y: 0.5
                                },
                                {
                                    x: 0.5,
                                    y: 0.0
                                },
                                {
                                    x: 1.0,
                                    y: 0.5
                                },
                                {
                                    x: 0.75,
                                    y: 0.5
                                },
                                {
                                    x: 0.75,
                                    y: 1.0
                                }
                            ],
                            pathDefinitionOrigin: {
                                x: 1,
                                y: 0
                            },
                            onMouseDownHelper: function () {
                                nucleotide.position.y += displacementMagnitude;
                                var yAsString = "" + nucleotide.position.y;
                                nucleotideHTML.setAttribute("transform", "translate(" + nucleotide.position.x + " " + yAsString + ")");
                                yInputHTML.value = yAsString;
                            }
                        },
                        {
                            // Right arrow
                            pathDefinitionVertices: [
                                {
                                    x: 0.0,
                                    y: 0.25
                                },
                                {
                                    x: 0.5,
                                    y: 0.25
                                },
                                {
                                    x: 0.5,
                                    y: 0.0
                                },
                                {
                                    x: 1.0,
                                    y: 0.5
                                },
                                {
                                    x: 0.5,
                                    y: 1.0
                                },
                                {
                                    x: 0.5,
                                    y: 0.75
                                },
                                {
                                    x: 0.0,
                                    y: 0.75
                                }
                            ],
                            pathDefinitionOrigin: {
                                x: 2,
                                y: 1
                            },
                            onMouseDownHelper: function () {
                                nucleotide.position.x += displacementMagnitude;
                                var xAsString = "" + nucleotide.position.x;
                                nucleotideHTML.setAttribute("transform", "translate(" + xAsString + " " + nucleotide.position.y + ")");
                                xInputHTML.value = xAsString;
                            }
                        },
                        {
                            // Down arrow
                            pathDefinitionVertices: [
                                {
                                    x: 0.75,
                                    y: 0.0
                                },
                                {
                                    x: 0.75,
                                    y: 0.5
                                },
                                {
                                    x: 1.0,
                                    y: 0.5
                                },
                                {
                                    x: 0.5,
                                    y: 1.0
                                },
                                {
                                    x: 0.0,
                                    y: 0.5
                                },
                                {
                                    x: 0.25,
                                    y: 0.5
                                },
                                {
                                    x: 0.25,
                                    y: 0.0
                                }
                            ],
                            pathDefinitionOrigin: {
                                x: 1,
                                y: 2
                            },
                            onMouseDownHelper: function () {
                                nucleotide.position.y -= displacementMagnitude;
                                var yAsString = "" + nucleotide.position.y;
                                nucleotideHTML.setAttribute("transform", "translate(" + nucleotide.position.x + " " + yAsString + ")");
                                yInputHTML.value = yAsString;
                            }
                        },
                        {
                            // Left arrow
                            pathDefinitionVertices: [
                                {
                                    x: 1.0,
                                    y: 0.75
                                },
                                {
                                    x: 0.5,
                                    y: 0.75
                                },
                                {
                                    x: 0.5,
                                    y: 1.0
                                },
                                {
                                    x: 0.0,
                                    y: 0.5
                                },
                                {
                                    x: 0.5,
                                    y: 0.0
                                },
                                {
                                    x: 0.5,
                                    y: 0.25
                                },
                                {
                                    x: 1.0,
                                    y: 0.25
                                }
                            ],
                            pathDefinitionOrigin: {
                                x: 0,
                                y: 1
                            },
                            onMouseDownHelper: function () {
                                nucleotide.position.x -= displacementMagnitude;
                                var xAsString = "" + nucleotide.position.x;
                                nucleotideHTML.setAttribute("transform", "translate(" + xAsString + " " + nucleotide.position.y + ")");
                                xInputHTML.value = xAsString;
                            }
                        }
                    ].forEach(function (pathDataI) {
                        pathDataI.pathDefinitionOrigin = VectorOperations2D.scaleUp(pathDataI.pathDefinitionOrigin, pathDimension_1);
                        pathDataI.pathDefinitionVertices = pathDataI.pathDefinitionVertices.map(function (pathDefinitionVertexI) { return VectorOperations2D.scaleUp(pathDefinitionVertexI, pathDimension_1); });
                        var pathSVGElement = document.createElementNS(svgNameSpaceURL, "path"), pathDefinitionVertex0 = pathDataI.pathDefinitionVertices[0], pathDefinition = "M " + pathDefinitionVertex0.x + " " + pathDefinitionVertex0.y;
                        for (var pathDefinitionVertexIndex = 1; pathDefinitionVertexIndex < pathDataI.pathDefinitionVertices.length; pathDefinitionVertexIndex++) {
                            var pathDefinitionVertex = pathDataI.pathDefinitionVertices[pathDefinitionVertexIndex];
                            pathDefinition += " L " + pathDefinitionVertex.x + " " + pathDefinitionVertex.y;
                        }
                        pathDefinition += " z";
                        svgHTML_1.appendChild(pathSVGElement);
                        pathSVGElement.setAttribute("d", pathDefinition);
                        pathSVGElement.setAttribute("stroke", "rgb(0 0 0)");
                        pathSVGElement.setAttribute("fill", "darkgray");
                        pathSVGElement.setAttribute("transform", "translate(" + pathDataI.pathDefinitionOrigin.x + " " + pathDataI.pathDefinitionOrigin.y + ")");
                        pathSVGElement.onmousedown = function (mouseEvent) {
                            pathSVGElement.setAttribute("fill", "green");
                            pathDataI.onMouseDownHelper();
                            if (previousNucleotideDistanceHTML) {
                                previousNucleotideDistanceHTML.textContent = distanceToPreviousNucleotideTextContentHelper();
                            }
                            if (nextNucleotideDistanceHTML) {
                                nextNucleotideDistanceHTML.textContent = distanceToNextNucleotideTextContentHelper();
                            }
                            return false;
                        };
                        pathSVGElement.onmouseup = function (mouseEvent) {
                            pathSVGElement.setAttribute("fill", "darkgray");
                            return false;
                        };
                    });
                }
                else {
                    xInputHTML.disabled = true;
                    yInputHTML.disabled = true;
                }
            };
            class_15.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var htmlTextElement = document.createElement("text"), rnaMolecule = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex];
                htmlTextElement.textContent = "Nucleotide " + nucleotideIndex + " " + rnaMolecule.nucleotides[nucleotideIndex].symbol.string;
                XRNA.contextMenuHTML.appendChild(htmlTextElement);
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                htmlTextElement = document.createElement("text");
                htmlTextElement.textContent = "In RNA Strand \"" + rnaMolecule.name + "\"";
                XRNA.contextMenuHTML.appendChild(htmlTextElement);
            };
            return class_15;
        }(SelectionConstraint)),
        "RNA Single Strand": new /** @class */ (function (_super) {
            __extends(class_16, _super);
            function class_16() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_16.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides;
                if (nucleotides[nucleotideIndex].basePairIndex < 0) {
                    this.selectedNucleotideIndices = new Array();
                    for (var adjacentNucleotideIndex = nucleotideIndex - 1; adjacentNucleotideIndex >= 0 && nucleotides[adjacentNucleotideIndex].basePairIndex < 0; adjacentNucleotideIndex--) {
                        this.selectedNucleotideIndices.unshift({
                            rnaComplexIndex: rnaComplexIndex,
                            rnaMoleculeIndex: rnaMoleculeIndex,
                            nucleotideIndex: adjacentNucleotideIndex
                        });
                    }
                    this.selectedNucleotideIndices.push({
                        rnaComplexIndex: rnaComplexIndex,
                        rnaMoleculeIndex: rnaMoleculeIndex,
                        nucleotideIndex: nucleotideIndex
                    });
                    for (var adjacentNucleotideIndex = nucleotideIndex + 1; adjacentNucleotideIndex < nucleotides.length && nucleotides[adjacentNucleotideIndex].basePairIndex < 0; adjacentNucleotideIndex++) {
                        this.selectedNucleotideIndices.push({
                            rnaComplexIndex: rnaComplexIndex,
                            rnaMoleculeIndex: rnaMoleculeIndex,
                            nucleotideIndex: adjacentNucleotideIndex
                        });
                    }
                    if (this.selectedNucleotideIndices.length > 1 && (nucleotideIndex == 0 || nucleotideIndex == nucleotides.length - 1)) {
                        this.errorMessage = "If the selected strand contains multiple nucleotides, the clicked-on nucleotide must not be a terminal nucleotide (5\' or 3\')";
                        return false;
                    }
                    return true;
                }
                else {
                    this.errorMessage = SelectionConstraint.createErrorMessageForSelection("a nucleotide without a base pair", "a non-base-paired nucleotide");
                    return false;
                }
            };
            class_16.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_16.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.selectedNucleotideIndices;
            };
            class_16.prototype.getErrorMessageForSelection = function () {
                return this.errorMessage;
            };
            class_16.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_16.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var rnaComplex = XRNA.rnaComplexes[rnaComplexIndex], rnaMolecule = rnaComplex.rnaMolecules[rnaMoleculeIndex], nucleotide = rnaMolecule.nucleotides[nucleotideIndex], htmlTextElement = document.createElement("text");
                htmlTextElement.textContent = "Picked nucleotide " + (rnaMolecule.firstNucleotideIndex + nucleotideIndex) + " " + nucleotide.symbol.string + " in RNA Complex \"" + rnaComplex.name + "\", RNA Molecule \"" + rnaMolecule.name + "\"";
                XRNA.contextMenuHTML.appendChild(htmlTextElement);
                var selectedNucleotideIndices = this.getSelectedNucleotideIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex), leastNucleotideIndex = Number.MAX_VALUE, greatestNucleotideIndex = -Number.MAX_VALUE;
                selectedNucleotideIndices.forEach(function (nucleotideIndexTuple) {
                    if (nucleotideIndexTuple.nucleotideIndex < leastNucleotideIndex) {
                        leastNucleotideIndex = nucleotideIndexTuple.nucleotideIndex;
                    }
                    if (nucleotideIndexTuple.nucleotideIndex > greatestNucleotideIndex) {
                        greatestNucleotideIndex = nucleotideIndexTuple.nucleotideIndex;
                    }
                });
                leastNucleotideIndex = Math.max(leastNucleotideIndex, 1);
                greatestNucleotideIndex = Math.min(greatestNucleotideIndex, rnaMolecule.nucleotides.length - 2);
                leastNucleotideIndex += rnaMolecule.firstNucleotideIndex;
                greatestNucleotideIndex += rnaMolecule.firstNucleotideIndex;
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                htmlTextElement = document.createElement("text");
                htmlTextElement.textContent = "Includes nucleotides " + leastNucleotideIndex + " - " + greatestNucleotideIndex;
                XRNA.contextMenuHTML.appendChild(htmlTextElement);
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                htmlTextElement = document.createElement("text");
                htmlTextElement.textContent = "Bounding nucleotides: " + (leastNucleotideIndex - 1) + ", " + (greatestNucleotideIndex + 1);
                XRNA.contextMenuHTML.appendChild(htmlTextElement);
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                // contextMenuElementHTML.textContent = "Contains nucleotides " + ;
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
            };
            class_16.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_16.prototype.populateXRNASelection = function (clickedOnNucleotideHTML, selectedNucleotideIndices) {
                selectedNucleotideIndices.forEach(function (selectedNucleotideIndices) {
                    SelectionConstraint.populateXRNASelectionHighlightsHelper(selectedNucleotideIndices.rnaComplexIndex, selectedNucleotideIndices.rnaMoleculeIndex, selectedNucleotideIndices.nucleotideIndex);
                });
                var selectedNucleotideIndicesTuple0 = selectedNucleotideIndices[0];
                if (selectedNucleotideIndices.length == 1 && (selectedNucleotideIndicesTuple0.nucleotideIndex == 0 || selectedNucleotideIndicesTuple0.nucleotideIndex == XRNA.rnaComplexes[selectedNucleotideIndicesTuple0.rnaComplexIndex].rnaMolecules[selectedNucleotideIndicesTuple0.rnaMoleculeIndex].nucleotides.length - 1)) {
                    var nucleotide_2 = XRNA.rnaComplexes[selectedNucleotideIndicesTuple0.rnaComplexIndex].rnaMolecules[selectedNucleotideIndicesTuple0.rnaMoleculeIndex].nucleotides[selectedNucleotideIndicesTuple0.nucleotideIndex], nucleotideHTML_1 = document.getElementById(XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(selectedNucleotideIndicesTuple0.rnaComplexIndex), selectedNucleotideIndicesTuple0.rnaMoleculeIndex), selectedNucleotideIndicesTuple0.nucleotideIndex));
                    XRNA.selection.selectedElementListeners.push(new /** @class */ (function (_super) {
                        __extends(class_17, _super);
                        function class_17() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        class_17.prototype.updateXYHelper = function (x, y) {
                            nucleotide_2.position = {
                                x: x,
                                y: y
                            };
                            nucleotideHTML_1.setAttribute("transform", "translate(" + x + " " + y + ")");
                        };
                        return class_17;
                    }(SelectedElementListener))(nucleotide_2.position.x, nucleotide_2.position.y, false, false));
                }
                else {
                    var transformRegex = /translate\((-?\d+(?:\.\d*)?) (-?\d+(?:\.\d*)?)\)/, minimumNucleotideIndexTuple = selectedNucleotideIndices[0], maximumNucleotideIndexTuple = selectedNucleotideIndices[selectedNucleotideIndices.length - 1], precedingNucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(minimumNucleotideIndexTuple.rnaComplexIndex), minimumNucleotideIndexTuple.rnaMoleculeIndex), Math.max(minimumNucleotideIndexTuple.nucleotideIndex - 1, 0)), succedingNucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(maximumNucleotideIndexTuple.rnaComplexIndex), maximumNucleotideIndexTuple.rnaMoleculeIndex), Math.min(maximumNucleotideIndexTuple.nucleotideIndex + 1, XRNA.rnaComplexes[maximumNucleotideIndexTuple.rnaComplexIndex].rnaMolecules[maximumNucleotideIndexTuple.rnaMoleculeIndex].nucleotides.length - 1)), precedingNucleotideHTML = document.getElementById(precedingNucleotideId), succedingNucleotideHTML = document.getElementById(succedingNucleotideId), precedingNucleotideHTMLBoundingBox = document.getElementById(XRNA.boundingBoxHTMLId(precedingNucleotideId)), succedingNucleotideHTMLBoundingBox = document.getElementById(XRNA.boundingBoxHTMLId(succedingNucleotideId)), precedingCoordinatesAsStrings = transformRegex.exec(precedingNucleotideHTML.getAttribute("transform")), succedingCoordinatesAsStrings = transformRegex.exec(succedingNucleotideHTML.getAttribute("transform")), lineBetweenBoundingNucleotides_1 = {
                        v0: {
                            x: parseFloat(precedingCoordinatesAsStrings[1]) + parseFloat(precedingNucleotideHTMLBoundingBox.getAttribute("x")) + parseFloat(precedingNucleotideHTMLBoundingBox.getAttribute("width")) / 2.0,
                            y: parseFloat(precedingCoordinatesAsStrings[2]) + parseFloat(precedingNucleotideHTMLBoundingBox.getAttribute("y")) + parseFloat(precedingNucleotideHTMLBoundingBox.getAttribute("height")) / 2.0
                        },
                        v1: {
                            x: parseFloat(succedingCoordinatesAsStrings[1]) + parseFloat(succedingNucleotideHTMLBoundingBox.getAttribute("x")) + parseFloat(succedingNucleotideHTMLBoundingBox.getAttribute("width")) / 2.0,
                            y: parseFloat(succedingCoordinatesAsStrings[2]) + parseFloat(succedingNucleotideHTMLBoundingBox.getAttribute("y")) + parseFloat(succedingNucleotideHTMLBoundingBox.getAttribute("height")) / 2.0
                        }
                    }, nucleotideCoordinatesAsStrings = transformRegex.exec(clickedOnNucleotideHTML.getAttribute("transform")), nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(clickedOnNucleotideHTML.id)), generateOrthogonalLine_1 = function (line2D) {
                        var orthogonalDv = VectorOperations2D.scaleDown(VectorOperations2D.orthogonalize(VectorOperations2D.subtract(line2D.v1, line2D.v0)), 2.0), center = VectorOperations2D.scaleDown(VectorOperations2D.add(line2D.v0, line2D.v1), 2.0);
                        return {
                            v0: VectorOperations2D.add(center, orthogonalDv),
                            v1: VectorOperations2D.subtract(center, orthogonalDv)
                        };
                    }, betweenClickedOnNucleotideAndBoundingNucleotideLine_1 = {
                        v0: {
                            x: parseFloat(nucleotideCoordinatesAsStrings[1]) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("x")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("width")) / 2.0,
                            y: parseFloat(nucleotideCoordinatesAsStrings[2]) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("y")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("height")) / 2.0
                        },
                        v1: lineBetweenBoundingNucleotides_1.v0
                    }, betweenBoundingNucleotidesLine = {
                        v0: lineBetweenBoundingNucleotides_1.v0,
                        v1: lineBetweenBoundingNucleotides_1.v1
                    }, betweenBoundingNucleotidesOrthogonalLine_1 = generateOrthogonalLine_1(betweenBoundingNucleotidesLine), betweenClickedOnNucleotideAndBoundingNucleotideLineHTML_1 = document.createElementNS(svgNameSpaceURL, "line"), betweenClickedOnNucleotideAndBoundingNucleotideOrthogonalLineHTML_1 = document.createElementNS(svgNameSpaceURL, "line");
                    var nucleotideBoundingBoxCoordinates_1 = new Array();
                    for (var i = 0; i < selectedNucleotideIndices.length; i++) {
                        var nucleotideIndicesTuple = selectedNucleotideIndices[i], nucleotideBoundingBoxHTML_1 = document.getElementById(XRNA.boundingBoxHTMLId(XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(nucleotideIndicesTuple.rnaComplexIndex), nucleotideIndicesTuple.rnaMoleculeIndex), nucleotideIndicesTuple.nucleotideIndex)));
                        nucleotideBoundingBoxCoordinates_1.push({
                            x: -0.5 * parseFloat(nucleotideBoundingBoxHTML_1.getAttribute("width")) - parseFloat(nucleotideBoundingBoxHTML_1.getAttribute("x")),
                            y: -0.5 * parseFloat(nucleotideBoundingBoxHTML_1.getAttribute("height")) - parseFloat(nucleotideBoundingBoxHTML_1.getAttribute("y"))
                        });
                    }
                    var linearCenterCache_1 = VectorOperations2D.scaleUp(VectorOperations2D.add(lineBetweenBoundingNucleotides_1.v0, lineBetweenBoundingNucleotides_1.v1), 0.5);
                    XRNA.selection.selectedElementListeners.push(new /** @class */ (function (_super) {
                        __extends(class_18, _super);
                        function class_18() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        class_18.prototype.updateXYHelper = function (dX, dY) {
                            var x = this.cache.x + dX, y = this.cache.y + dY;
                            betweenClickedOnNucleotideAndBoundingNucleotideLine_1.v0 = {
                                x: x,
                                y: y
                            };
                            betweenClickedOnNucleotideAndBoundingNucleotideLineHTML_1.setAttribute("x1", "" + x);
                            betweenClickedOnNucleotideAndBoundingNucleotideLineHTML_1.setAttribute("y1", "" + y);
                            var updatedOrthogonalLine = generateOrthogonalLine_1(betweenClickedOnNucleotideAndBoundingNucleotideLine_1);
                            betweenClickedOnNucleotideAndBoundingNucleotideOrthogonalLineHTML_1.setAttribute("x1", "" + updatedOrthogonalLine.v0.x);
                            betweenClickedOnNucleotideAndBoundingNucleotideOrthogonalLineHTML_1.setAttribute("y1", "" + updatedOrthogonalLine.v0.y);
                            betweenClickedOnNucleotideAndBoundingNucleotideOrthogonalLineHTML_1.setAttribute("x2", "" + updatedOrthogonalLine.v1.x);
                            betweenClickedOnNucleotideAndBoundingNucleotideOrthogonalLineHTML_1.setAttribute("y2", "" + updatedOrthogonalLine.v1.y);
                            var updateNucleotidePositionsFromCenterHelper = function (center) {
                                var axisDv = VectorOperations2D.subtract(lineBetweenBoundingNucleotides_1.v0, center), dTheta = (2.0 * Math.PI - VectorOperations2D.unsignedAngleBetweenVectors(VectorOperations2D.subtract(lineBetweenBoundingNucleotides_1.v0, center), VectorOperations2D.subtract(lineBetweenBoundingNucleotides_1.v1, center))) / (selectedNucleotideIndices.length + 1), radius = VectorOperations2D.distance(lineBetweenBoundingNucleotides_1.v0, center), dThetaSign;
                                if (VectorOperations2D.crossProduct2D(VectorOperations2D.subtract(center, lineBetweenBoundingNucleotides_1.v0), VectorOperations2D.subtract(center, lineBetweenBoundingNucleotides_1.v1)) > 0) {
                                    dThetaSign = -1;
                                }
                                else {
                                    dThetaSign = 1;
                                }
                                var angleOfNoRotation = Math.atan2(axisDv.y, axisDv.x);
                                for (var i = 0; i < selectedNucleotideIndices.length; i++) {
                                    var angleI = angleOfNoRotation + (i + 1) * dThetaSign * dTheta, nucleotideIndicesTuple = selectedNucleotideIndices[i], nucleotideHTML = document.getElementById(XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(nucleotideIndicesTuple.rnaComplexIndex), nucleotideIndicesTuple.rnaMoleculeIndex), nucleotideIndicesTuple.nucleotideIndex)), x_1 = center.x + radius * Math.cos(angleI), y_1 = center.y + radius * Math.sin(angleI), boundingBoxOffset = nucleotideBoundingBoxCoordinates_1[i];
                                    nucleotideHTML.setAttribute("transform", "translate(" + (x_1 + boundingBoxOffset.x) + " " + (y_1 + boundingBoxOffset.y) + ")");
                                    XRNA.rnaComplexes[nucleotideIndicesTuple.rnaComplexIndex].rnaMolecules[nucleotideIndicesTuple.rnaMoleculeIndex].nucleotides[nucleotideIndicesTuple.nucleotideIndex].position = {
                                        x: x_1,
                                        y: y_1
                                    };
                                }
                            }, intersection = VectorOperations2D.lineIntersection(updatedOrthogonalLine, betweenBoundingNucleotidesOrthogonalLine_1);
                            if ("x" in intersection && "y" in intersection) {
                                updateNucleotidePositionsFromCenterHelper(intersection);
                            }
                            else {
                                updateNucleotidePositionsFromCenterHelper(VectorOperations2D.add(linearCenterCache_1, {
                                    x: dX,
                                    y: dY
                                }));
                            }
                        };
                        return class_18;
                    }(SelectedElementListener))(betweenClickedOnNucleotideAndBoundingNucleotideLine_1.v0.x, betweenClickedOnNucleotideAndBoundingNucleotideLine_1.v0.y, false, true));
                }
            };
            return class_16;
        }(SelectionConstraint)),
        "RNA Single Base Pair": new /** @class */ (function (_super) {
            __extends(class_19, _super);
            function class_19() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_19.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                // Special case: base-paired immediately adjacent nucleotides.
                return basePairIndex >= 0 && (Math.abs(nucleotideIndex - basePairIndex) == 1 || ((nucleotideIndex == 0 || nucleotides[nucleotideIndex - 1].basePairIndex != basePairIndex + 1) && (nucleotideIndex == nucleotides.length - 1 || nucleotides[nucleotideIndex + 1].basePairIndex != basePairIndex - 1)));
            };
            class_19.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_19.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var selectedNucleotideIndices = new Array(), nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, basePairedIndex = nucleotides[nucleotideIndex].basePairIndex;
                selectedNucleotideIndices.push({
                    rnaComplexIndex: rnaComplexIndex,
                    rnaMoleculeIndex: rnaMoleculeIndex,
                    nucleotideIndex: nucleotideIndex
                }, {
                    rnaComplexIndex: rnaComplexIndex,
                    rnaMoleculeIndex: rnaMoleculeIndex,
                    nucleotideIndex: basePairedIndex
                });
                var selectedNucleotideInBetweenIndices = new Array(), lesserInBetweenNucleotideIndex, greaterInBetweenNucleotideIndex, basePairedNucleotideEncounteredFlag = false;
                if (nucleotideIndex < basePairedIndex) {
                    lesserInBetweenNucleotideIndex = nucleotideIndex;
                    greaterInBetweenNucleotideIndex = basePairedIndex;
                }
                else {
                    lesserInBetweenNucleotideIndex = basePairedIndex;
                    greaterInBetweenNucleotideIndex = nucleotideIndex;
                }
                for (var inBetweenNucleotideIndex = lesserInBetweenNucleotideIndex + 1; inBetweenNucleotideIndex < greaterInBetweenNucleotideIndex; inBetweenNucleotideIndex++) {
                    if (nucleotides[inBetweenNucleotideIndex].basePairIndex >= 0) {
                        basePairedNucleotideEncounteredFlag = true;
                    }
                    selectedNucleotideInBetweenIndices.push({
                        rnaComplexIndex: rnaComplexIndex,
                        rnaMoleculeIndex: rnaMoleculeIndex,
                        nucleotideIndex: inBetweenNucleotideIndex
                    });
                }
                if (!basePairedNucleotideEncounteredFlag) {
                    selectedNucleotideIndices = selectedNucleotideIndices.concat(selectedNucleotideInBetweenIndices);
                }
                return selectedNucleotideIndices;
            };
            class_19.prototype.getErrorMessageForSelection = function () {
                return SelectionConstraint.createErrorMessageForSelection("a nucleotide with a base pair and no contiguous base pairs", "a base-paired nucleotide outside a series of base pairs");
            };
            class_19.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_19.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error("Not implemented.");
            };
            class_19.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_19;
        }(SelectionConstraint)),
        'RNA Helix': new /** @class */ (function (_super) {
            __extends(class_20, _super);
            function class_20() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_20.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            };
            class_20.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_20.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var helixIndices = new Array(), nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                helixIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: nucleotideIndex });
                helixIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: basePairIndex });
                if (Math.abs(nucleotideIndex - basePairIndex) == 1) {
                    return helixIndices;
                }
                var adjacentNucleotideIndex = nucleotideIndex + 1, adjacentBasePairIndex = basePairIndex - 1;
                for (; adjacentNucleotideIndex < nucleotides.length && adjacentBasePairIndex >= 0; adjacentNucleotideIndex++, adjacentBasePairIndex--) {
                    var basePairIndexOfAdjacentNucleotide = nucleotides[adjacentNucleotideIndex].basePairIndex;
                    if (basePairIndexOfAdjacentNucleotide < 0) {
                        // The base-pair series has ended.
                        // Check the intermediate single strand for inclusion.
                        if (adjacentNucleotideIndex < adjacentBasePairIndex) {
                            var intermediateIndices = new Array(), includeIntermediateIndicesFlag = void 0;
                            // Upon encountering a base pair, set addIntermediateIndicesFlag to false.
                            // Checking the single-strandedness of adjacentBasePairIndex must be included because of the for-loop's decrementing it.
                            for (; adjacentNucleotideIndex <= adjacentBasePairIndex && (includeIntermediateIndicesFlag = nucleotides[adjacentNucleotideIndex].basePairIndex < 0); adjacentNucleotideIndex++) {
                                intermediateIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                            }
                            if (includeIntermediateIndicesFlag) {
                                helixIndices = helixIndices.concat(intermediateIndices);
                            }
                        }
                        break;
                    }
                    if (basePairIndexOfAdjacentNucleotide != adjacentBasePairIndex) {
                        // The base-pair series has diverged.
                        break;
                    }
                    helixIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                    helixIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentBasePairIndex });
                    if (adjacentNucleotideIndex == adjacentBasePairIndex - 2) {
                        // Avoid duplicating the selection of nucleotides.
                        break;
                    }
                }
                adjacentNucleotideIndex = nucleotideIndex - 1;
                adjacentBasePairIndex = basePairIndex + 1;
                for (; adjacentNucleotideIndex >= 0 && adjacentBasePairIndex < nucleotides.length; adjacentNucleotideIndex--, adjacentBasePairIndex++) {
                    var basePairIndexOfAdjacentNucleotide = nucleotides[adjacentNucleotideIndex].basePairIndex;
                    if (basePairIndexOfAdjacentNucleotide < 0) {
                        // The base-pair series has ended.
                        // Check the intermediate single strand for inclusion.
                        if (adjacentNucleotideIndex > adjacentBasePairIndex) {
                            var intermediateIndices = new Array(), includeIntermediateIndicesFlag = void 0;
                            // Upon encountering a base pair, set  addIntermediateIndicesFlag to false.
                            // Checking the single-strandedness of adjacentBasePairIndex must be included because of the for-loop's decrementing it.
                            for (; adjacentNucleotideIndex >= adjacentBasePairIndex && (includeIntermediateIndicesFlag = nucleotides[adjacentNucleotideIndex].basePairIndex < 0); adjacentNucleotideIndex--) {
                                intermediateIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                            }
                            if (includeIntermediateIndicesFlag) {
                                helixIndices = helixIndices.concat(intermediateIndices);
                            }
                        }
                        break;
                    }
                    if (basePairIndexOfAdjacentNucleotide != adjacentBasePairIndex) {
                        // The base-pair series has diverged.
                        break;
                    }
                    helixIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                    helixIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentBasePairIndex });
                    if (adjacentNucleotideIndex == adjacentBasePairIndex + 2) {
                        // Avoid duplicating the selection of nucleotides.
                        break;
                    }
                }
                return helixIndices;
            };
            class_20.prototype.getErrorMessageForSelection = function () {
                return SelectionConstraint.createErrorMessageForSelection('a nucleotide with a base pair', 'a base-paired nucleotide');
            };
            class_20.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_20.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_20.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_20;
        }(SelectionConstraint)),
        'RNA Stacked Helix': new /** @class */ (function (_super) {
            __extends(class_21, _super);
            function class_21() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_21.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var _this = this;
                this.adjacentNucleotideIndices = new Array();
                this.adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: nucleotideIndex });
                var nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                if (basePairIndex >= 0) {
                    this.adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: basePairIndex });
                    this.adjacentNucleotideIndex0 = nucleotideIndex;
                    this.adjacentNucleotideIndex1 = basePairIndex;
                    // In this case, we must complement the action of getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number).
                    this.getSelectedNucleotideIndicesHelper(rnaComplexIndex, rnaMoleculeIndex, function () { return _this.adjacentNucleotideIndex0++; }, function () { return _this.adjacentNucleotideIndex1--; }, function () { return _this.adjacentNucleotideIndex0 >= nucleotides.length || _this.adjacentNucleotideIndex1 < 0; });
                    this.adjacentNucleotideIndex0 = nucleotideIndex;
                    this.adjacentNucleotideIndex1 = basePairIndex;
                    return true;
                }
                this.adjacentNucleotideIndex0 = nucleotideIndex - 1;
                this.adjacentNucleotideIndex1 = nucleotideIndex + 1;
                // Locate the nearest base-paired nucleotide index < nucleotideIndex
                for (;; this.adjacentNucleotideIndex0--) {
                    if (this.adjacentNucleotideIndex0 < 0) {
                        return false;
                    }
                    if (nucleotides[this.adjacentNucleotideIndex0].basePairIndex >= 0) {
                        break;
                    }
                    this.adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: this.adjacentNucleotideIndex0 });
                }
                // Locate the nearest base-paired nucleotide index > nucleotideIndex
                for (;; this.adjacentNucleotideIndex1++) {
                    if (this.adjacentNucleotideIndex1 >= nucleotides.length) {
                        return false;
                    }
                    if (nucleotides[this.adjacentNucleotideIndex1].basePairIndex >= 0) {
                        break;
                    }
                    this.adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: this.adjacentNucleotideIndex1 });
                }
                this.adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: this.adjacentNucleotideIndex0 });
                this.adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: this.adjacentNucleotideIndex1 });
                // Check whether the nearest base-paired nucleotides are base-paired together.
                return nucleotides[this.adjacentNucleotideIndex0].basePairIndex == this.adjacentNucleotideIndex1;
            };
            class_21.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_21.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var _this = this;
                this.getSelectedNucleotideIndicesHelper(rnaComplexIndex, rnaMoleculeIndex, function () { return _this.adjacentNucleotideIndex0--; }, function () { return _this.adjacentNucleotideIndex1++; }, function (nucleotides) { return _this.adjacentNucleotideIndex0 < 0 || _this.adjacentNucleotideIndex1 >= nucleotides.length; });
                return this.adjacentNucleotideIndices;
            };
            class_21.prototype.getSelectedNucleotideIndicesHelper = function (rnaComplexIndex, rnaMoleculeIndex, adjacentNucleotideIndex0Incrementer, adjacentNucleotideIndex1Incrementer, adjacentNucleotideIndicesAreOutsideBoundsChecker) {
                var nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, intermediateIndices = new Array();
                for (;;) {
                    if (Math.abs(this.adjacentNucleotideIndex0 - this.adjacentNucleotideIndex1) < 2) {
                        this.adjacentNucleotideIndices = this.adjacentNucleotideIndices.concat(intermediateIndices);
                        // Avoid duplicating selected elements.
                        break;
                    }
                    var cacheNucleotideIndex0 = this.adjacentNucleotideIndex0;
                    var cacheNucleotideIndex1 = this.adjacentNucleotideIndex1;
                    adjacentNucleotideIndex0Incrementer();
                    adjacentNucleotideIndex1Incrementer();
                    if (adjacentNucleotideIndicesAreOutsideBoundsChecker(nucleotides)) {
                        break;
                    }
                    var adjacentNucleotideIndex0BasePair = nucleotides[this.adjacentNucleotideIndex0].basePairIndex;
                    var adjacentNucleotideIndex1BasePair = nucleotides[this.adjacentNucleotideIndex1].basePairIndex;
                    var adjacentNucleotideIndex0HasBasePair = adjacentNucleotideIndex0BasePair >= 0;
                    var adjacentNucleotideIndex1HasBasePair = adjacentNucleotideIndex1BasePair >= 0;
                    if (adjacentNucleotideIndex0HasBasePair && adjacentNucleotideIndex1HasBasePair) {
                        if (adjacentNucleotideIndex0BasePair == this.adjacentNucleotideIndex1) {
                            // The probe nucleotides are bonded to one another.
                            this.adjacentNucleotideIndices.push({
                                rnaComplexIndex: rnaComplexIndex,
                                rnaMoleculeIndex: rnaMoleculeIndex,
                                nucleotideIndex: this.adjacentNucleotideIndex0
                            });
                            this.adjacentNucleotideIndices.push({
                                rnaComplexIndex: rnaComplexIndex,
                                rnaMoleculeIndex: rnaMoleculeIndex,
                                nucleotideIndex: this.adjacentNucleotideIndex1
                            });
                            // Include the intermediate nucleotides (those between bonded-together probe nucleotides).
                            this.adjacentNucleotideIndices = this.adjacentNucleotideIndices.concat(intermediateIndices);
                            intermediateIndices = new Array();
                        }
                        else {
                            // The probe nucleotides have diverged (they are no longer exclusively bonded to one another).
                            break;
                        }
                    }
                    else if (adjacentNucleotideIndex0HasBasePair) {
                        // Stall adjacentNucleotideIndex0 until adjacentNucleotideIndex1 has a base pair.
                        this.adjacentNucleotideIndex0 = cacheNucleotideIndex0;
                        intermediateIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: this.adjacentNucleotideIndex1 });
                    }
                    else if (adjacentNucleotideIndex1HasBasePair) {
                        // Stall adjacentNucleotideIndex1 until adjacentNucleotideIndex0 has a base pair.
                        this.adjacentNucleotideIndex1 = cacheNucleotideIndex1;
                        intermediateIndices.push({
                            rnaComplexIndex: rnaComplexIndex,
                            rnaMoleculeIndex: rnaMoleculeIndex,
                            nucleotideIndex: this.adjacentNucleotideIndex0
                        });
                    }
                    else {
                        // Neither nucleotide has a base pair (they are in single strands).
                        intermediateIndices.push({
                            rnaComplexIndex: rnaComplexIndex,
                            rnaMoleculeIndex: rnaMoleculeIndex,
                            nucleotideIndex: this.adjacentNucleotideIndex0
                        });
                        intermediateIndices.push({
                            rnaComplexIndex: rnaComplexIndex,
                            rnaMoleculeIndex: rnaMoleculeIndex,
                            nucleotideIndex: this.adjacentNucleotideIndex1
                        });
                    }
                }
            };
            class_21.prototype.getErrorMessageForSelection = function () {
                return SelectionConstraint.createErrorMessageForSelection('a base-paired nucleotide within a stacked helix', 'a base-paired nucleotide with proximate nucleotides on either side exclusively bonded to the other');
            };
            class_21.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_21.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_21.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_21;
        }(SelectionConstraint)),
        'RNA Sub-domain': new /** @class */ (function (_super) {
            __extends(class_22, _super);
            function class_22() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_22.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            };
            class_22.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_22.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var adjacentNucleotideIndices = new Array(), nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                adjacentNucleotideIndices.push({
                    rnaComplexIndex: rnaComplexIndex,
                    rnaMoleculeIndex: rnaComplexIndex,
                    nucleotideIndex: nucleotideIndex
                });
                adjacentNucleotideIndices.push({
                    rnaComplexIndex: rnaComplexIndex,
                    rnaMoleculeIndex: rnaComplexIndex,
                    nucleotideIndex: basePairIndex
                });
                var lesserAdjacentNucleotideIndex, greaterAdjacentNucleotideIndex;
                if (nucleotideIndex < basePairIndex) {
                    lesserAdjacentNucleotideIndex = nucleotideIndex;
                    greaterAdjacentNucleotideIndex = basePairIndex;
                }
                else {
                    lesserAdjacentNucleotideIndex = basePairIndex;
                    greaterAdjacentNucleotideIndex = nucleotideIndex;
                }
                var positiveDisplacement;
                for (positiveDisplacement = 1; lesserAdjacentNucleotideIndex + positiveDisplacement < nucleotides.length && (basePairIndex = nucleotides[lesserAdjacentNucleotideIndex + positiveDisplacement].basePairIndex) >= 0 && basePairIndex == greaterAdjacentNucleotideIndex - positiveDisplacement; positiveDisplacement++) {
                    adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lesserAdjacentNucleotideIndex + positiveDisplacement });
                    adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: greaterAdjacentNucleotideIndex - positiveDisplacement });
                }
                var negativeDisplacement;
                for (negativeDisplacement = 1; greaterAdjacentNucleotideIndex + negativeDisplacement < nucleotides.length && (basePairIndex = nucleotides[greaterAdjacentNucleotideIndex + negativeDisplacement].basePairIndex) >= 0 && basePairIndex == lesserAdjacentNucleotideIndex - negativeDisplacement; negativeDisplacement++) {
                    adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lesserAdjacentNucleotideIndex - negativeDisplacement });
                    adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: greaterAdjacentNucleotideIndex + negativeDisplacement });
                }
                for (var adjacentNucleotideIndex = lesserAdjacentNucleotideIndex + positiveDisplacement; adjacentNucleotideIndex < greaterAdjacentNucleotideIndex + negativeDisplacement; adjacentNucleotideIndex++) {
                    adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                }
                return adjacentNucleotideIndices;
            };
            class_22.prototype.getErrorMessageForSelection = function () {
                return SelectionConstraint.createErrorMessageForSelection('a nucleotide with a base pair', 'a base-paired nucleotide');
            };
            class_22.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_22.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_22.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_22;
        }(SelectionConstraint)),
        'RNA Cycle': new /** @class */ (function (_super) {
            __extends(class_23, _super);
            function class_23() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_23.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_23.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_23.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var cycleIndices = new Array(), nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, lowerAdjacentNucleotideIndex, upperAdjacentNucleotideIndex;
                if (nucleotides[nucleotideIndex].basePairIndex < 0) {
                    cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: nucleotideIndex });
                    for (lowerAdjacentNucleotideIndex = nucleotideIndex - 1;; lowerAdjacentNucleotideIndex--) {
                        if (lowerAdjacentNucleotideIndex < 0) {
                            return cycleIndices;
                        }
                        if (nucleotides[lowerAdjacentNucleotideIndex].basePairIndex >= 0) {
                            break;
                        }
                        cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex });
                    }
                    for (upperAdjacentNucleotideIndex = nucleotideIndex + 1;; upperAdjacentNucleotideIndex++) {
                        if (upperAdjacentNucleotideIndex == nucleotides.length) {
                            return cycleIndices;
                        }
                        if (nucleotides[upperAdjacentNucleotideIndex].basePairIndex >= 0) {
                            break;
                        }
                        cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex });
                    }
                    for (; lowerAdjacentNucleotideIndex >= 0 && nucleotides[lowerAdjacentNucleotideIndex].basePairIndex == upperAdjacentNucleotideIndex; lowerAdjacentNucleotideIndex--, upperAdjacentNucleotideIndex++) {
                        cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex });
                        cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex });
                    }
                }
                else {
                    lowerAdjacentNucleotideIndex = nucleotideIndex;
                    upperAdjacentNucleotideIndex = nucleotides[nucleotideIndex].basePairIndex;
                    if (lowerAdjacentNucleotideIndex > upperAdjacentNucleotideIndex) {
                        var temp = lowerAdjacentNucleotideIndex;
                        lowerAdjacentNucleotideIndex = upperAdjacentNucleotideIndex;
                        upperAdjacentNucleotideIndex = temp;
                    }
                    cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex });
                    cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex });
                    var negativeDisplacementMagnitude = 1, positiveDisplacementMagnitude = 1;
                    while (lowerAdjacentNucleotideIndex - negativeDisplacementMagnitude >= 0) {
                        if (nucleotides[lowerAdjacentNucleotideIndex - negativeDisplacementMagnitude].basePairIndex != upperAdjacentNucleotideIndex + negativeDisplacementMagnitude) {
                            break;
                        }
                        cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex - negativeDisplacementMagnitude });
                        cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex + negativeDisplacementMagnitude });
                        negativeDisplacementMagnitude++;
                    }
                    while (lowerAdjacentNucleotideIndex + positiveDisplacementMagnitude < nucleotides.length) {
                        if (nucleotides[lowerAdjacentNucleotideIndex + positiveDisplacementMagnitude].basePairIndex != upperAdjacentNucleotideIndex - positiveDisplacementMagnitude) {
                            break;
                        }
                        cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex + positiveDisplacementMagnitude });
                        cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex - positiveDisplacementMagnitude });
                        positiveDisplacementMagnitude++;
                    }
                    var encounteredBondedNucleotideFlag = false;
                    for (var adjacentNucleotideIndex = lowerAdjacentNucleotideIndex + positiveDisplacementMagnitude; adjacentNucleotideIndex <= upperAdjacentNucleotideIndex - positiveDisplacementMagnitude; adjacentNucleotideIndex++) {
                        encounteredBondedNucleotideFlag || (encounteredBondedNucleotideFlag = nucleotides[adjacentNucleotideIndex].basePairIndex >= 0);
                        cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                    }
                    if (encounteredBondedNucleotideFlag) {
                        return cycleIndices;
                    }
                    else {
                        lowerAdjacentNucleotideIndex -= negativeDisplacementMagnitude;
                        upperAdjacentNucleotideIndex += negativeDisplacementMagnitude;
                    }
                }
                while (nucleotides[lowerAdjacentNucleotideIndex].basePairIndex < upperAdjacentNucleotideIndex) {
                    cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex });
                    if (lowerAdjacentNucleotideIndex == 0) {
                        return cycleIndices;
                    }
                    lowerAdjacentNucleotideIndex--;
                }
                var basePairIndex;
                while ((basePairIndex = nucleotides[upperAdjacentNucleotideIndex].basePairIndex) < 0 || basePairIndex > lowerAdjacentNucleotideIndex) {
                    cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex });
                    if (upperAdjacentNucleotideIndex == nucleotides.length - 1) {
                        return cycleIndices;
                    }
                    upperAdjacentNucleotideIndex++;
                }
                for (var negativeDisplacementMagnitude = 0; nucleotides[lowerAdjacentNucleotideIndex - negativeDisplacementMagnitude].basePairIndex == upperAdjacentNucleotideIndex + negativeDisplacementMagnitude; negativeDisplacementMagnitude++) {
                    cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex - negativeDisplacementMagnitude });
                    cycleIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex + negativeDisplacementMagnitude });
                }
                return cycleIndices;
            };
            class_23.prototype.getErrorMessageForSelection = function () {
                throw new Error("This code should be unreachable.");
            };
            class_23.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_23.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_23.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_23;
        }(SelectionConstraint)),
        'RNA List Nucs': new /** @class */ (function (_super) {
            __extends(class_24, _super);
            function class_24() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_24.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return false;
            };
            class_24.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_24.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error("This code should be unreachable.");
            };
            class_24.prototype.getErrorMessageForSelection = function () {
                return "This selection constraint is not used for left-click nucleotide selection.";
            };
            class_24.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_24.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_24.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_24;
        }(SelectionConstraint)),
        'RNA Strand': new /** @class */ (function (_super) {
            __extends(class_25, _super);
            function class_25() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_25.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_25.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_25.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var adjacentNucleotideIndices = new Array(), nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaComplexIndex].nucleotides;
                for (var adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                }
                return adjacentNucleotideIndices;
            };
            class_25.prototype.getErrorMessageForSelection = function () {
                throw new Error("This code should be unreachable.");
            };
            class_25.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_25.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_25.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_25;
        }(SelectionConstraint)),
        'RNA Color Unit': new /** @class */ (function (_super) {
            __extends(class_26, _super);
            function class_26() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_26.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_26.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_26.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, color = nucleotides[nucleotideIndex].symbol, adjacentNucleotideIndices = new Array();
                for (var adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    var adjacentNucleotideColor = nucleotides[adjacentNucleotideIndex].symbol;
                    if (adjacentNucleotideColor.red == color.red && adjacentNucleotideColor.green == color.green && adjacentNucleotideColor.blue == color.blue) {
                        adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                    }
                }
                return adjacentNucleotideIndices;
            };
            class_26.prototype.getErrorMessageForSelection = function () {
                throw new Error("This code should be unreachable.");
            };
            class_26.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_26.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_26.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_26;
        }(SelectionConstraint)),
        'RNA Named Group': new /** @class */ (function (_super) {
            __extends(class_27, _super);
            function class_27() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_27.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                // For now, named-group support is not implemented.
                return false;
            };
            class_27.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_27.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error("This code should be unreachable.");
            };
            class_27.prototype.getErrorMessageForSelection = function () {
                return SelectionConstraint.createErrorMessageForSelection('a nucleotide within a named group', 'a nucleotide within a named group');
            };
            class_27.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_27.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_27.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_27;
        }(SelectionConstraint)),
        'RNA Strand Group': new /** @class */ (function (_super) {
            __extends(class_28, _super);
            function class_28() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_28.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_28.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_28.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var strandNucleotideIndices = new Array(), rnaComplex = XRNA.rnaComplexes[rnaComplexIndex];
                for (var rnaMoleculeIndex_1 = 0; rnaMoleculeIndex_1 < rnaComplex.rnaMolecules.length; rnaMoleculeIndex_1++) {
                    var nucleotides = rnaComplex.rnaMolecules[rnaMoleculeIndex_1].nucleotides;
                    for (var nucleotideIndex_3 = 0; nucleotideIndex_3 < nucleotides.length; nucleotideIndex_3++) {
                        strandNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex_1, nucleotideIndex: nucleotideIndex_3 });
                    }
                }
                return strandNucleotideIndices;
            };
            class_28.prototype.getErrorMessageForSelection = function () {
                throw new Error("This code should be unreachable.");
            };
            class_28.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_28.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_28.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_28;
        }(SelectionConstraint)),
        'Labels Only': new /** @class */ (function (_super) {
            __extends(class_29, _super);
            function class_29() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_29.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_29.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_29.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                // Select no nucleotides, but do not produce an error.
                // This replicates XRNA-GT behavior.
                return [];
            };
            class_29.prototype.getErrorMessageForSelection = function () {
                throw new Error("This code should be unreachable.");
            };
            class_29.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_29.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_29.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_29;
        }(SelectionConstraint)),
        'Entire Scene': new /** @class */ (function (_super) {
            __extends(class_30, _super);
            function class_30() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_30.prototype.approveSelectedNucleotideForSelection = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_30.prototype.approveSelectedNucleotideForContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            };
            class_30.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                // Select no indices.
                return [];
            };
            class_30.prototype.getErrorMessageForSelection = function () {
                throw new Error("This code should be unreachable.");
            };
            class_30.prototype.getErrorMessageForContextMenu = function () {
                return this.getErrorMessageForSelection();
            };
            class_30.prototype.populateEditContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            class_30.prototype.populateFormatContextMenu = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_30;
        }(SelectionConstraint))
    };
    return XRNA;
}());
exports.XRNA = XRNA;
