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
exports.XRNA = exports.MatrixOperations2D = exports.VectorOperations = exports.AffineMatrix3x3 = exports.Nucleotide = void 0;
var BUTTON_INDEX;
(function (BUTTON_INDEX) {
    BUTTON_INDEX[BUTTON_INDEX["NONE"] = 0] = "NONE";
    BUTTON_INDEX[BUTTON_INDEX["LEFT"] = 1] = "LEFT";
    BUTTON_INDEX[BUTTON_INDEX["RIGHT"] = 2] = "RIGHT";
    BUTTON_INDEX[BUTTON_INDEX["LEFT_RIGHT"] = 3] = "LEFT_RIGHT";
    BUTTON_INDEX[BUTTON_INDEX["MIDDLE"] = 4] = "MIDDLE";
    BUTTON_INDEX[BUTTON_INDEX["LEFT_MIDDLE"] = 5] = "LEFT_MIDDLE";
    BUTTON_INDEX[BUTTON_INDEX["RIGHT_MIDDLE"] = 6] = "RIGHT_MIDDLE";
    BUTTON_INDEX[BUTTON_INDEX["LEFT_MIDDLE_RIGHT"] = 7] = "LEFT_MIDDLE_RIGHT";
})(BUTTON_INDEX || (BUTTON_INDEX = {}));
var ParsingData = /** @class */ (function () {
    function ParsingData() {
        this.refIds = new Array();
    }
    return ParsingData;
}());
var Nucleotide = /** @class */ (function () {
    function Nucleotide(parent, symbol, font, x, y, basePairIndex, labelLine, labelContent, color) {
        if (x === void 0) { x = 0.0; }
        if (y === void 0) { y = 0.0; }
        if (basePairIndex === void 0) { basePairIndex = -1; }
        if (labelLine === void 0) { labelLine = null; }
        if (labelContent === void 0) { labelContent = null; }
        if (color === void 0) { color = { red: 0, green: 0, blue: 0 }; }
        this.symbol = symbol.toUpperCase();
        if (!this.symbol.match(/^[ACGU]$/)) {
            throw new Error('The input nucleotide symbol is an invalid: ' + symbol + ' is not one of {A, C, G, U}.');
        }
        this.point = {
            x: x,
            y: y
        };
        this.basePairIndex = basePairIndex;
        this.labelLine = labelLine;
        if (labelLine) {
            this.labelLine.v0.x += x;
            this.labelLine.v0.y += y;
            this.labelLine.v1.x += x;
            this.labelLine.v1.y += y;
        }
        this.labelContent = labelContent;
        if (labelContent) {
            this.labelContent.x += x;
            this.labelContent.y += y;
        }
        this.font = font;
        this.color = color;
        this.parent = parent;
    }
    Nucleotide.parse = function (currentRNAMolecule, inputLine, font, template) {
        if (font === void 0) { font = null; }
        if (template === void 0) { template = Nucleotide.template; }
        var inputData = inputLine.split(/\s+/), symbol, x = 0.0, y = 0.0, basePairIndex = -1;
        switch (template) {
            case "NucChar.XPos.YPos":
                x = parseFloat(inputData[1]);
                y = parseFloat(inputData[2]);
            case "NucChar":
                symbol = inputData[0];
                break;
            case "NucID.NucChar.XPos.YPos.FormatType.BPID":
                basePairIndex = parseInt(inputData[5]);
            case "NucID.NucChar.XPos.YPos":
                x = parseFloat(inputData[2]);
                y = parseFloat(inputData[3]);
            case "NucID.NucChar":
                symbol = inputData[1];
                break;
            default:
                throw new Error("Unrecognized Nuc2D format");
        }
        return new Nucleotide(currentRNAMolecule, symbol, font, x, y, basePairIndex);
    };
    return Nucleotide;
}());
exports.Nucleotide = Nucleotide;
var RNAMolecule = /** @class */ (function () {
    function RNAMolecule(parent, nucleotides, firstNucleotideIndex, name) {
        this.nucleotides = nucleotides;
        this.firstNucleotideIndex = firstNucleotideIndex;
        this.name = name;
    }
    return RNAMolecule;
}());
var RNAComplex = /** @class */ (function () {
    function RNAComplex(name) {
        this.rnaMolecules = new Array();
        this.name = name;
    }
    return RNAComplex;
}());
var SelectionConstraint = /** @class */ (function () {
    function SelectionConstraint() {
    }
    SelectionConstraint.createErrorMessage = function (requirementDescription, selectableDescription) {
        return 'The selection constraint \"' + XRNA.selectionConstraintHTML.value + '\" requires selection of ' + requirementDescription + '. Select ' + selectableDescription + ' or change the selection constraint.';
    };
    return SelectionConstraint;
}());
var svgNameSpaceURL = 'http://www.w3.org/2000/svg';
var SelectedElement = /** @class */ (function () {
    function SelectedElement(x, y, invertYFlag, xyAreDisplacementsFlag) {
        this.cache = {
            x: x,
            y: y
        };
        this.invertYFlag = invertYFlag;
        this.xyAreDisplacementsFlag = xyAreDisplacementsFlag;
    }
    return SelectedElement;
}());
;
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.clamp = function (minimum, value, maximum) {
        return Math.min(Math.max(minimum, value), maximum);
    };
    return Utils;
}());
var AffineMatrix3x3 = /** @class */ (function () {
    function AffineMatrix3x3(xx, xy, xz, yx, yy, yz) {
        if (xx === void 0) { xx = 0; }
        if (xy === void 0) { xy = 0; }
        if (xz === void 0) { xz = 0; }
        if (yx === void 0) { yx = 0; }
        if (yy === void 0) { yy = 0; }
        if (yz === void 0) { yz = 0; }
        this.scaleX = xx;
        this.skewX = xy;
        this.displaceX = xz;
        this.skewY = yx;
        this.scaleY = yy;
        this.displaceY = yz;
    }
    AffineMatrix3x3.prototype.toString = function () {
        return '[' + [this.scaleX, this.skewX, this.displaceX].join(', ') + ']\n[' + [this.skewY, this.scaleY, this.displaceY].join(', ') + ']';
    };
    AffineMatrix3x3.translate = function (dx, dy) {
        var translation = new AffineMatrix3x3();
        translation.scaleX = 1;
        translation.scaleY = 1;
        translation.displaceX = dx;
        translation.displaceY = dy;
        return translation;
    };
    AffineMatrix3x3.scale = function (sx, sy) {
        var scale = new AffineMatrix3x3();
        scale.scaleX = sx;
        scale.scaleY = sy;
        return scale;
    };
    return AffineMatrix3x3;
}());
exports.AffineMatrix3x3 = AffineMatrix3x3;
;
var VectorOperations = /** @class */ (function () {
    function VectorOperations() {
    }
    VectorOperations.dotProduct = function (a, b) {
        return a.x * b.x + a.y * b.y;
    };
    VectorOperations.scalarProjection = function (a, b) {
        // a^k * b^k == (a * b)^k
        // sqrt(a * a) * sqrt(b * b) == sqrt(a * a * b * b)
        return VectorOperations.dotProduct(a, b) / Math.sqrt(VectorOperations.magnitudeSquared(a.x, a.y) * VectorOperations.magnitudeSquared(b.x, b.y));
    };
    VectorOperations.divide = function (point, divisor) {
        var scalar = 1.0 / divisor;
        return {
            x: point.x * scalar,
            y: point.y * scalar
        };
    };
    VectorOperations.normalize = function (point) {
        return VectorOperations.divide(point, VectorOperations.magnitude(point.x, point.y));
    };
    VectorOperations.linearlyInterpolate = function (v0, v1, interpolationFactor) {
        // See https://en.wikipedia.org/wiki/Linear_interpolation
        return (1 - interpolationFactor) * v0 + interpolationFactor * v1;
    };
    VectorOperations.magnitudeSquared = function (x, y) {
        return x * x + y * y;
    };
    VectorOperations.magnitude = function (x, y) {
        return Math.sqrt(VectorOperations.magnitudeSquared(x, y));
    };
    VectorOperations.distanceSquared = function (p0, p1) {
        return VectorOperations.magnitudeSquared(p1.x - p0.x, p1.y - p0.y);
    };
    VectorOperations.distance = function (p0, p1) {
        return Math.sqrt(VectorOperations.distanceSquared(p0, p1));
    };
    return VectorOperations;
}());
exports.VectorOperations = VectorOperations;
var MatrixOperations2D = /** @class */ (function () {
    function MatrixOperations2D() {
    }
    MatrixOperations2D.fromTransform = function (transform) {
        // Note that DOMMatrix did not work, appeared to contain a bug when multiplying a translation and a scale.
        var matrix = new AffineMatrix3x3();
        matrix.scaleX = 1;
        matrix.scaleY = 1;
        transform.trim().split(/\)\s+/g).forEach(function (transformI) {
            var coordinates = transformI.match(/-?[\d\.]+/g);
            if (transformI.startsWith('translate')) {
                var translation = AffineMatrix3x3.translate(parseFloat(coordinates[0]), parseFloat(coordinates[1]));
                matrix = MatrixOperations2D.multiply(matrix, translation);
            }
            else if (transformI.startsWith('scale')) {
                var scale = AffineMatrix3x3.scale(parseFloat(coordinates[0]), parseFloat(coordinates[1]));
                matrix = MatrixOperations2D.multiply(matrix, scale);
            }
        });
        return matrix;
    };
    MatrixOperations2D.multiply = function (matrix0, matrix1) {
        /*
        [sx0  skx0 dx0] * [sx1  skx1 dx1] = [sx0 * sx1 + skx0 * sky1   sx0 * skx1 + skx0 * sy1   sx0 * dx1 + skx0 * dy1 + dx0]
        [sky0 sy0  dy0]   [sky1 sy1  dy1]   [sky0 * sx1 + sy0 * sky1   sky0 * skx1 + sy0 * sy1   sky0 * dx1 + sy0 * dy1 + dy0]
        [0    0    1  ]   [0    0    1  ]   [0                         0                         1                           ]
        */
        return new AffineMatrix3x3(matrix0.scaleX * matrix1.scaleX + matrix0.skewX * matrix1.skewY, matrix0.scaleX * matrix1.skewX + matrix0.skewX * matrix1.scaleY, matrix0.scaleX * matrix1.displaceX + matrix0.skewX * matrix1.displaceY + matrix0.displaceX, matrix0.skewY * matrix1.scaleX + matrix0.scaleY * matrix1.skewY, matrix0.skewY * matrix1.skewX + matrix0.scaleY * matrix1.scaleY, matrix0.skewY * matrix1.displaceX + matrix0.scaleY * matrix1.displaceY + matrix0.displaceY);
    };
    MatrixOperations2D.transform = function (matrix, point) {
        /*
        [sx  skx dx]   [x]   [sx * x + skx * y + dx]
        [sky sy  dy] * [y] = [sky * x + sy * y + dy]
        [0   0   1 ]   [1]   [1                    ]
        */
        return {
            x: matrix.scaleX * point.x + matrix.skewX * point.y + matrix.displaceX,
            y: matrix.skewY * point.x + matrix.scaleY * point.y + matrix.displaceY
        };
    };
    return MatrixOperations2D;
}());
exports.MatrixOperations2D = MatrixOperations2D;
var XRNA = /** @class */ (function () {
    function XRNA() {
    }
    XRNA.mainWithArgumentParsing = function (args) {
        if (args === void 0) { args = []; }
        // Parse the command-line arguments
        throw new Error("Argument parsing is not implemented.");
    };
    XRNA.main = function (inputUrl, outputUrls, printVersionFlag) {
        if (inputUrl === void 0) { inputUrl = null; }
        if (outputUrls === void 0) { outputUrls = null; }
        if (printVersionFlag === void 0) { printVersionFlag = false; }
        var zoomSlider = document.getElementById('zoom slider');
        zoomSlider.setAttribute('min', '' + XRNA.sceneDressingData.minimumZoom);
        zoomSlider.setAttribute('max', '' + XRNA.sceneDressingData.maximumZoom);
        if (printVersionFlag) {
            console.log("XRNA-GT-TypeScript 9/30/21");
        }
        XRNA.canvasHTML = document.getElementById('canvas');
        XRNA.sceneDressingHTML = document.createElementNS(svgNameSpaceURL, 'g');
        XRNA.sceneDressingHTML.setAttribute('id', 'sceneDressing');
        XRNA.canvasHTML.appendChild(XRNA.sceneDressingHTML);
        XRNA.canvasBounds = XRNA.canvasHTML.getBoundingClientRect();
        if (inputUrl) {
            XRNA.handleInputUrl(inputUrl);
            if (outputUrls) {
                outputUrls.forEach(function (outputUrl) { return XRNA.handleOutputUrl(outputUrl); });
            }
        }
        // Populate the selection-constraining drop-down with the supported constraints.
        XRNA.selectionConstraintHTML = document.getElementById('selection constraint');
        for (var _i = 0, _a = Object.keys(XRNA.selectionConstraintDescriptionDictionary); _i < _a.length; _i++) {
            var selectionConstraint = _a[_i];
            XRNA.selectionConstraintHTML.appendChild(new Option(selectionConstraint));
        }
        // Collect the supported input file extensions.
        document.getElementById('input').setAttribute('accept', Object.keys(XRNA.inputParserDictionary).map(function (extension) { return "." + extension; }).join(', '));
        // Collect the supported output file extensions.
        var outputFileExtensionElement = document.getElementById('output file extension');
        Object.keys(XRNA.outputWriterDictionary).forEach(function (extension) {
            var option = document.createElement('option');
            extension = '.' + extension;
            option.value = extension;
            option.innerHTML = extension;
            outputFileExtensionElement.appendChild(option);
        });
        XRNA.canvasHTML.oncontextmenu = function (event) {
            event.preventDefault();
            return false;
        };
        XRNA.canvasHTML.onmousedown = XRNA.sceneHandleMouseDown;
        XRNA.canvasHTML.onmousemove = XRNA.sceneHandleMouseMove;
        XRNA.canvasHTML.onmouseup = XRNA.sceneHandleMouseUp;
        document.getElementById('contextMenu').onmouseup = XRNA.sceneHandleMouseUp;
    };
    XRNA.getButtonIndex = function (event) {
        var index = -1;
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
            index = -1;
        }
        else if ('buttons' in event) {
            index = event.buttons;
        }
        else if ('which' in event) {
            index = event.which;
        }
        else {
            index = event.button;
        }
        if (index in BUTTON_INDEX) {
            return index;
        }
        throw new Error("Unrecognized button index: " + index);
    };
    XRNA.reset = function () {
        XRNA.rnaComplexes = new Array();
        XRNA.resetSelection();
        XRNA.resetView();
    };
    XRNA.resetSelection = function () {
        // Clear the previous selection highlighting
        XRNA.selection.highlighted.forEach(function (highlightedI) {
            highlightedI.setAttribute('visibility', 'hidden');
        });
        XRNA.selection = {
            highlighted: new Array(),
            selected: new Array(),
            dragOrigin: {
                x: 0,
                y: 0
            }
        };
    };
    XRNA.sceneHandleMouseDown = function (mouseEvent) {
        var newButtonIndex = XRNA.getButtonIndex(mouseEvent), pressedButtonIndex = newButtonIndex - XRNA.buttonIndex, pageX = mouseEvent.pageX, pageY = XRNA.correctYCoordinate(mouseEvent.pageY);
        XRNA.buttonIndex = newButtonIndex;
        if (pressedButtonIndex & BUTTON_INDEX.LEFT) {
            XRNA.selection.dragOrigin.x = pageX;
            XRNA.selection.dragOrigin.y = pageY;
        }
        if (pressedButtonIndex & BUTTON_INDEX.RIGHT) {
            XRNA.sceneDressingData.dragCoordinates.origin.x = pageX;
            XRNA.sceneDressingData.dragCoordinates.origin.y = pageY;
        }
        return false;
    };
    XRNA.sceneHandleMouseMove = function (mouseEvent) {
        var pageX = mouseEvent.pageX, pageY = XRNA.correctYCoordinate(mouseEvent.pageY), buttonIndex = XRNA.getButtonIndex(mouseEvent);
        if (buttonIndex & BUTTON_INDEX.LEFT) {
            var scale = XRNA.sceneDressingData.scale * XRNA.sceneScale, dx_1 = (pageX - XRNA.selection.dragOrigin.x) / scale, dy_1 = -(pageY - XRNA.selection.dragOrigin.y) / scale;
            XRNA.selection.selected.forEach(function (selectedI) {
                var dyI = selectedI.invertYFlag ? -dy_1 : dy_1, x, y;
                if (selectedI.xyAreDisplacementsFlag) {
                    x = dx_1;
                    y = dyI;
                }
                else {
                    x = selectedI.cache.x + dx_1;
                    y = selectedI.cache.y + dyI;
                }
                selectedI.updateXYHelper(x, y);
            });
        }
        if (buttonIndex & BUTTON_INDEX.RIGHT) {
            XRNA.sceneDressingData.origin.x = XRNA.sceneDressingData.dragCoordinates.cacheOrigin.x + pageX - XRNA.sceneDressingData.dragCoordinates.origin.x;
            XRNA.sceneDressingData.origin.y = XRNA.sceneDressingData.dragCoordinates.cacheOrigin.y + pageY - XRNA.sceneDressingData.dragCoordinates.origin.y;
            XRNA.updateSceneDressing();
        }
        return false;
    };
    XRNA.sceneHandleMouseUp = function (mouseEvent) {
        var newButtonIndex = XRNA.getButtonIndex(mouseEvent), releasedButtonIndex = XRNA.buttonIndex - newButtonIndex, pageX = mouseEvent.pageX, pageY = XRNA.correctYCoordinate(mouseEvent.pageY);
        XRNA.buttonIndex = newButtonIndex;
        if (releasedButtonIndex & BUTTON_INDEX.LEFT) {
        }
        if (releasedButtonIndex & BUTTON_INDEX.RIGHT) {
            XRNA.sceneDressingData.dragCoordinates.cacheOrigin.x = XRNA.sceneDressingData.origin.x;
            XRNA.sceneDressingData.dragCoordinates.cacheOrigin.y = XRNA.sceneDressingData.origin.y;
        }
        return false;
    };
    XRNA.resetView = function () {
        XRNA.sceneDressingData.origin.x = 0;
        XRNA.sceneDressingData.origin.y = 0;
        XRNA.sceneDressingData.dragCoordinates.cacheOrigin.x = 0;
        XRNA.sceneDressingData.dragCoordinates.cacheOrigin.y = 0;
        XRNA.setZoom(0);
        XRNA.updateSceneDressing();
        document.getElementById('zoom slider').value = XRNA.sceneDressingData.zoom;
    };
    XRNA.setZoom = function (zoom) {
        XRNA.sceneDressingData.zoom = Utils.clamp(XRNA.sceneDressingData.minimumZoom, zoom, XRNA.sceneDressingData.maximumZoom);
        XRNA.sceneDressingData.scale = XRNA.zoomToScale(XRNA.sceneDressingData.zoom);
        XRNA.updateSceneDressing();
    };
    XRNA.zoomToScale = function (zoom) {
        return Math.pow(1.05, zoom);
    };
    XRNA.updateSceneDressing = function () {
        document.getElementById('sceneDressing').setAttribute('transform', 'translate(' + XRNA.sceneDressingData.origin.x + ' ' + XRNA.sceneDressingData.origin.y + ') scale(' + XRNA.sceneDressingData.scale + ' ' + XRNA.sceneDressingData.scale + ')');
    };
    XRNA.handleInputUrl = function (inputUrl) {
        inputUrl = inputUrl.trim();
        XRNA.handleInputFile(XRNA.openUrl(inputUrl), inputUrl.split('.')[1].toLowerCase());
    };
    XRNA.handleInputFile = function (inputFile, fileExtension) {
        XRNA.reset();
        new Promise(function (executor) {
            var fileReader = new FileReader();
            fileReader.addEventListener('load', function () { return executor(fileReader.result.toString()); });
            fileReader.readAsText(inputFile, 'UTF-8');
        }).then(function (fileAsText) {
            var inputParser = XRNA.inputParserDictionary[fileExtension];
            inputParser(fileAsText);
            XRNA.prepareScene();
            window.onresize = function (event) {
                XRNA.canvasBounds = XRNA.canvasHTML.getBoundingClientRect();
                XRNA.fitSceneToBounds();
            };
            XRNA.canvasHTML.onwheel = function (event) {
                // Intuitive scrolling of the middle-mouse wheel requires negation of deltaY.
                XRNA.setZoom(XRNA.sceneDressingData.zoom - Math.sign(event.deltaY));
                document.getElementById('zoom slider').value = XRNA.sceneDressingData.zoom;
                return false;
            };
        });
    };
    XRNA.handleOutputUrl = function (outputUrl) {
        if (XRNA.previousOutputUrl) {
            window.URL.revokeObjectURL(XRNA.previousOutputUrl);
        }
        XRNA.previousOutputUrl = outputUrl;
        outputUrl = outputUrl.trim();
        var fileExtension = outputUrl.split('.')[1].toLowerCase(), outputWriter = XRNA.outputWriterDictionary[fileExtension], url = window.URL.createObjectURL(new Blob([outputWriter()], { type: 'text/plain' })), downloader = document.createElement('a');
        downloader.setAttribute('href', url);
        downloader.download = outputUrl;
        document.body.appendChild(downloader);
        downloader.click();
        document.body.removeChild(downloader);
    };
    XRNA.openUrl = function (fileUrl) {
        var request = new XMLHttpRequest();
        request.open('GET', fileUrl, false);
        request.responseType = "blob";
        var blob;
        request.onload = function () {
            blob = request.response;
        };
        request.send();
        return blob;
    };
    XRNA.parseRGB = function (rgbAsString) {
        var rgbAsNumber = parseInt(rgbAsString), validColorFlag = true;
        if (isNaN(rgbAsNumber)) {
            // Attempt parsing colorAsString as a hexadecimal string.
            rgbAsNumber = parseInt('0x' + rgbAsString);
            validColorFlag = !isNaN(rgbAsNumber);
        }
        var rgb;
        if (validColorFlag) {
            rgb = {
                red: (rgbAsNumber >> 16) & 0xFF,
                green: (rgbAsNumber >> 8) & 0xFF,
                blue: rgbAsNumber & 0xFF
            };
        }
        else {
            rgb = {
                red: 0,
                green: 0,
                blue: 0
            };
            console.error('Invalid color string: ' + rgbAsString + ' is an invalid color. Only hexadecimal or integer values are accepted.');
        }
        return rgb;
    };
    // Converts the input RGB values to a hexadecimal string 
    XRNA.compressRGB = function (rgb) {
        return ((rgb.red << 16) | (rgb.green << 8) | (rgb.blue)).toString(16);
    };
    XRNA.applyHelperFunctionsToRefIDs = function (refIDs, helperFunctions) {
        refIDs.forEach(function (refIDPair) {
            for (var refIndex = refIDPair[0]; refIndex <= refIDPair[1]; refIndex++) {
                var mostRecentRNAComplex = XRNA.rnaComplexes[XRNA.rnaComplexes.length - 1], mostRecentRNAMolecule = mostRecentRNAComplex.rnaMolecules[mostRecentRNAComplex.rnaMolecules.length - 1], nucleotide = mostRecentRNAMolecule.nucleotides[refIndex];
                for (var helperFunctionIndex = 0; helperFunctionIndex < helperFunctions.length; helperFunctionIndex++) {
                    var helperFunction = helperFunctions[helperFunctionIndex];
                    helperFunction(nucleotide);
                }
            }
        });
    };
    XRNA.parseXMLHelper = function (root, parsingData) {
        var _a, _b, _c;
        var _loop_1 = function (index) {
            var subElement;
            subElement = root.children[index];
            switch (subElement.tagName) {
                case "ComplexDocument": {
                    XRNA.complexDocumentName = (_a = subElement.getAttribute('Name')) !== null && _a !== void 0 ? _a : 'Unknown';
                    break;
                }
                case "Complex": {
                    var currentComplex = new RNAComplex((_b = subElement.getAttribute('Name')) !== null && _b !== void 0 ? _b : 'Unknown');
                    parsingData.currentComplex = currentComplex;
                    XRNA.rnaComplexes.push(currentComplex);
                    break;
                }
                case "WithComplex": {
                    break;
                }
                case "RNAMolecule": {
                    var currentRNAMolecule = new RNAMolecule(parsingData.currentComplex, null, null, (_c = subElement.getAttribute('Name')) !== null && _c !== void 0 ? _c : 'Unknown');
                    parsingData.currentComplex.rnaMolecules.push(currentRNAMolecule);
                    parsingData.currentRNAMolecule = currentRNAMolecule;
                    break;
                }
                case "Nuc": {
                    parsingData.refIds = new Array();
                    var refIdsString = subElement.getAttribute('RefID');
                    if (!refIdsString) {
                        refIdsString = subElement.getAttribute('RefIDs');
                        if (!refIdsString) {
                            throw new Error("Within the input file, a <Nuc> element is missing its RefID and RefIDs attributes.");
                        }
                    }
                    if (!refIdsString) {
                        throw new Error('Within the input file, a <Nuc> element is missing its RefID(s) attribute.');
                    }
                    refIdsString = refIdsString.replace(/\s+/, '');
                    // comma-separated list of (potentially ordered-paired, potentially negative) integers.
                    if (!refIdsString.match(/^(?:(?:-?\d+-)?-?\d+)(?:,(?:-?\d+-)?-?\d+)*$/)) {
                        throw new Error('Within the input file, a <Nuc> element\'s refID(s) attribute is improperly formatted. It should be a comma-separated list of integers, or ordered integer pairs separated by \'-\'.');
                    }
                    var firstNucleotideIndex_1 = parsingData.currentRNAMolecule.firstNucleotideIndex;
                    refIdsString.split(',').forEach(function (splitElement) {
                        var matchedGroups = splitElement.match(/^(-?\d+)-(-?\d+)$/);
                        if (matchedGroups) {
                            parsingData.refIds.push([parseInt(matchedGroups[1]) - firstNucleotideIndex_1, parseInt(matchedGroups[2]) - firstNucleotideIndex_1]);
                        }
                        else {
                            var refID = parseInt(splitElement) - firstNucleotideIndex_1;
                            parsingData.refIds.push([refID, refID]);
                        }
                    });
                    var helperFunctions = new Array(), colorAsString_1 = subElement.getAttribute('Color');
                    if (colorAsString_1) {
                        helperFunctions.push(function (nucleotide) { return nucleotide.color = XRNA.parseRGB(colorAsString_1); });
                    }
                    var fontIDAsString_1 = subElement.getAttribute('FontID');
                    if (fontIDAsString_1) {
                        var fontID_1 = parseInt(fontIDAsString_1);
                        if (isNaN(fontID_1)) {
                            throw new Error('Invalid fontID: ' + fontIDAsString_1 + ' is not an integer.');
                        }
                        helperFunctions.push(function (nucleotide) { return nucleotide.font = XRNA.fontIDToFont(fontID_1); });
                    }
                    helperFunctions.push(function (nucleotide) { return nucleotide.font.size = subElement.getAttribute('FontSize') ? parseFloat(fontIDAsString_1) : 8.0; });
                    XRNA.applyHelperFunctionsToRefIDs(parsingData.refIds, helperFunctions);
                    break;
                }
                case "NucChars": {
                    break;
                }
                case "NucSegment": {
                    break;
                }
                case "NucListData": {
                    var innerHTML = subElement.innerHTML;
                    innerHTML = innerHTML.replace(/^\n/, '');
                    innerHTML = innerHTML.replace(/\n$/, '');
                    var innerHTMLLines = innerHTML.split('\n');
                    Nucleotide.template = subElement.getAttribute('DataType');
                    var startingNucleotideIndexString = subElement.getAttribute('StartNucID');
                    if (!startingNucleotideIndexString) {
                        console.error("Within the input file, a <NucListData> element is missing its StartNucID attribute.");
                        // We cannot continue without a starting nucleotide index.
                        // Continuing to attempt to parse the current RNAMolecule will introduce errors.
                        throw new Error("Missing StartNucID attribute prevents RNAMolecule parsing.");
                    }
                    var startingNucleotideIndex = parseInt(startingNucleotideIndexString), currentNucleotides = new Array();
                    for (var index_1 = 0; index_1 < innerHTMLLines.length; index_1++) {
                        var line = innerHTMLLines[index_1];
                        if (!line.match(/^\s*$/)) {
                            currentNucleotides.push(Nucleotide.parse(parsingData.currentRNAMolecule, line.trim(), XRNA.fontIDToFont(0)));
                        }
                    }
                    var newestRnaMolecule = parsingData.currentRNAMolecule;
                    newestRnaMolecule.nucleotides = currentNucleotides;
                    newestRnaMolecule.firstNucleotideIndex = startingNucleotideIndex;
                    break;
                }
                case "LabelList": {
                    var innerHTML = subElement.innerHTML;
                    innerHTML = innerHTML.replace(/^\n/, '');
                    innerHTML = innerHTML.replace(/\n$/, '');
                    var innerHTMLLines = innerHTML.split('\n'), labelContent_1 = null, labelLine_1 = null;
                    innerHTMLLines.forEach(function (innerHTMLLine) {
                        var splitLineElements = innerHTMLLine.split(/\s+/);
                        switch (splitLineElements[0].toLowerCase()) {
                            case 'l': {
                                labelLine_1 = {
                                    v0: {
                                        x: parseFloat(splitLineElements[1]),
                                        y: parseFloat(splitLineElements[2])
                                    },
                                    v1: {
                                        x: parseFloat(splitLineElements[3]),
                                        y: parseFloat(splitLineElements[4])
                                    },
                                    strokeWidth: parseFloat(splitLineElements[5]),
                                    color: XRNA.parseRGB(splitLineElements[6])
                                };
                                break;
                            }
                            case 's': {
                                // From XRNA source code (ComplexXMLParser.java):
                                // l x y ang size fontID color content
                                // ang is ignored by XRNA source code.
                                var font = XRNA.fontIDToFont(parseInt(splitLineElements[5]));
                                font.size = parseFloat(splitLineElements[4]);
                                labelContent_1 = {
                                    x: parseFloat(splitLineElements[1]),
                                    y: parseFloat(splitLineElements[2]),
                                    content: splitLineElements[7].replace(/\"/g, ''),
                                    font: font,
                                    color: XRNA.parseRGB(splitLineElements[6])
                                };
                                break;
                            }
                        }
                    });
                    XRNA.applyHelperFunctionsToRefIDs(parsingData.refIds, [function (nucleotide) {
                            nucleotide.labelContent = labelContent_1;
                            nucleotide.labelLine = labelLine_1;
                        }]);
                    break;
                }
                case "NucSymbol": {
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
                case "BasePairs": {
                    var indexString = subElement.getAttribute("nucID"), lengthString = subElement.getAttribute("length"), basePairedIndexString = subElement.getAttribute("bpNucID");
                    if (!indexString) {
                        console.error("Within the input file a <BasePairs> element is missing its nucID attribute.");
                        // We cannot continue without an index.
                        break;
                    }
                    var index_2 = parseInt(indexString);
                    if (isNaN(index_2)) {
                        console.error("Within the input file a <BasePairs> element is defined incorrectly; nucID = \"" + indexString + "\" is not an integer.");
                        // We cannot continue without an index.
                        break;
                    }
                    var length_1 = void 0;
                    if (!lengthString) {
                        length_1 = 1;
                    }
                    else {
                        length_1 = parseInt(lengthString);
                        if (isNaN(length_1)) {
                            console.error("Within the input file a <BasePairs> element is defined incorrectly; length = \"" + lengthString + "\" is not an integer.");
                            // We cannot continue without a length.
                            break;
                        }
                    }
                    if (!basePairedIndexString) {
                        console.error("Within the input file a <BasePairs> element is missing its bpNucID attribute.");
                        // We cannot continue without a base-paired index.
                        break;
                    }
                    var basePairedIndex = parseInt(basePairedIndexString);
                    if (isNaN(basePairedIndex)) {
                        console.error("Within the input file a <BasePairs> element is defined incorrectly; bpNucID = \"" + basePairedIndexString + "\" is not an integer.");
                        // We cannot continue without a base-paired index.
                        break;
                    }
                    var currentRNAMolecule = parsingData.currentRNAMolecule, firstNucleotideIndex = currentRNAMolecule.firstNucleotideIndex;
                    index_2 -= firstNucleotideIndex;
                    basePairedIndex -= firstNucleotideIndex;
                    // Pair nucleotides.
                    for (var innerIndex = 0; innerIndex < length_1; innerIndex++) {
                        var nucleotideIndex0 = index_2 + innerIndex, nucleotideIndex1 = basePairedIndex - innerIndex, nucleotides = currentRNAMolecule.nucleotides;
                        if (nucleotideIndex0 < 0) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index_2 + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex0 + " < 0");
                            continue;
                        }
                        if (nucleotideIndex0 >= nucleotides.length) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index_2 + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex0 + " >= " + currentRNAMolecule.nucleotides.length);
                            continue;
                        }
                        if (nucleotideIndex1 < 0) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index_2 + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex1 + " < 0");
                            continue;
                        }
                        if (nucleotideIndex1 >= nucleotides.length) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index_2 + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex1 + " >= " + currentRNAMolecule.nucleotides.length);
                            continue;
                        }
                        nucleotides[nucleotideIndex0].basePairIndex = nucleotideIndex1;
                        nucleotides[nucleotideIndex1].basePairIndex = nucleotideIndex0;
                    }
                    break;
                }
                case "BasePair": {
                    break;
                }
                case "SceneNodeGeom": {
                    break;
                }
            }
            XRNA.parseXMLHelper(subElement, parsingData);
        };
        for (var index = 0; index < root.children.length; index++) {
            _loop_1(index);
        }
    };
    XRNA.parseXML = function (fileAsText) {
        XRNA.parseXMLHelper(new DOMParser().parseFromString(fileAsText, 'text/xml'), null);
    };
    XRNA.parseXRNA = function (inputFileAsText) {
        if (!inputFileAsText.match(/^\s*<!DOCTYPE/)) {
            inputFileAsText = "<!DOCTYPE ComplexDocument [\
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
            ]>\n" + inputFileAsText;
        }
        XRNA.parseXMLHelper(new DOMParser().parseFromString(inputFileAsText, "text/xml"), new ParsingData());
    };
    XRNA.writeXRNA = function () {
        var xrnaFrontHalf = '', xrnaBackHalf = '';
        xrnaFrontHalf += '<ComplexDocument Name=\'' + XRNA.complexDocumentName + '\'>\n';
        xrnaBackHalf = '\n</ComplexDocument>' + xrnaBackHalf;
        xrnaFrontHalf += '<SceneNodeGeom CenterX=\'' + 0 + '\' CenterY=\'' + 0 + '\' Scale=\'' + 1 + '\'/>\n';
        for (var rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            xrnaFrontHalf += '<Complex Name=\'' + XRNA.complexName + '\'>\n';
            xrnaBackHalf = '\n</Complex>' + xrnaBackHalf;
            var complex = XRNA.rnaComplexes[rnaComplexIndex];
            for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < complex.rnaMolecules.length; rnaMoleculeIndex++) {
                var rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex], nucleotides = rnaMolecule.nucleotides, firstNucleotideIndex = rnaMolecule.firstNucleotideIndex;
                xrnaFrontHalf += '<RNAMolecule Name=\'' + rnaMolecule.name + '\'>\n';
                xrnaBackHalf = '\n</RNAMolecule>' + xrnaBackHalf;
                xrnaFrontHalf += '<NucListData StartNucID=\'' + firstNucleotideIndex + '\' DataType=\'NucChar.XPos.YPos\'>\n';
                var nucs = '', nucLabelLists = '', basePairs = '';
                for (var nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    var nucleotide = nucleotides[nucleotideIndex];
                    xrnaFrontHalf += nucleotide.symbol + ' ' + nucleotide.point.x + ' ' + nucleotide.point.y + '\n';
                    nucs += '<Nuc RefID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\' Color=\'' + XRNA.compressRGB(nucleotide.color) + '\' FontID=\'' + XRNA.fontToFontID(nucleotide.font) + '\'></Nuc>';
                    if (nucleotide.labelContent || nucleotide.labelContent) {
                        nucLabelLists += '<Nuc RefID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\'>\n<LabelList>\n';
                        if (nucleotide.labelLine) {
                            var line = nucleotide.labelLine, lineColor = line.color;
                            nucLabelLists += 'l ' + line.v0.x + ' ' + line.v0.y + ' ' + line.v1.x + ' ' + line.v1.y + ' ' + line.strokeWidth + ' ' + XRNA.compressRGB(lineColor) + ' 0.0 0 0 0 0\n';
                        }
                        if (nucleotide.labelContent) {
                            var content = nucleotide.labelContent, contentColor = content.color, contentFont = content.font;
                            nucLabelLists += 's ' + content.x + ' ' + content.y + ' 0.0 ' + contentFont.size + ' ' + XRNA.fontToFontID(contentFont) + ' ' + XRNA.compressRGB(contentColor) + ' \"' + content.content + '\"\n';
                        }
                        nucLabelLists += '</LabelList>\n</Nuc>\n';
                    }
                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex < nucleotide.basePairIndex) {
                        basePairs += '<BasePairs nucID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\' length=\'1\' bpNucID=\'' + (firstNucleotideIndex + nucleotide.basePairIndex) + '\' />\n';
                    }
                }
                xrnaFrontHalf += '</NucListData>\n';
                xrnaFrontHalf += '<Nuc RefIDs=\'' + firstNucleotideIndex + '-' + (firstNucleotideIndex + nucleotides.length - 1) + '\' IsSchematic=\'false\' SchematicColor=\'0\' SchematicLineWidth=\'1.5\' SchematicBPLineWidth=\'1.0\' SchematicBPGap=\'2.0\' SchematicFPGap=\'2.0\' SchematicTPGap=\'2.0\' IsNucPath=\'false\' NucPathColor=\'ff0000\' NucPathLineWidth=\'0.0\' />\n';
                xrnaFrontHalf += nucs;
                xrnaFrontHalf += nucLabelLists;
                xrnaFrontHalf += basePairs;
            }
        }
        return xrnaFrontHalf + xrnaBackHalf;
    };
    XRNA.writeSVG = function () {
        var canvas = XRNA.canvasHTML.cloneNode(true);
        canvas.removeAttribute('id');
        canvas.removeAttribute('class');
        for (var rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            var complex = XRNA.rnaComplexes[rnaComplexIndex];
            for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < complex.rnaMolecules.length; rnaMoleculeIndex++) {
                var rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex], nucleotides = rnaMolecule.nucleotides;
            }
        }
        return canvas.outerHTML;
    };
    XRNA.writeTR = function () {
        var trContents = '<structure>';
        for (var rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            var rnaComplex = XRNA.rnaComplexes[rnaComplexIndex];
            for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < rnaComplex.rnaMolecules.length; rnaMoleculeIndex++) {
                var rnaMolecule = rnaComplex.rnaMolecules[rnaMoleculeIndex], nucleotides = rnaMolecule.nucleotides;
                for (var nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    var nucleotide = nucleotides[nucleotideIndex];
                    trContents += '\n<point x=\"' + nucleotide.point.x.toFixed(3) + '\" y=\"' + nucleotide.point.y.toFixed(3) + '\" b=\"' + nucleotide.symbol + '\" numbering-label=\"' + (rnaMolecule.firstNucleotideIndex + nucleotideIndex) + '\" />';
                }
            }
        }
        trContents += '\n</structure>';
        return trContents;
    };
    XRNA.correctYCoordinate = function (y) {
        return y - XRNA.canvasBounds.y;
    };
    XRNA.getBoundingBox = function (htmlElement) {
        var boundingBox = htmlElement.getBoundingClientRect();
        boundingBox.y = XRNA.correctYCoordinate(boundingBox.y);
        return boundingBox;
    };
    XRNA.getBoundingBoxHTML = function (boundingBox, parentID) {
        var boundingBoxHTML = document.createElementNS(svgNameSpaceURL, 'rect');
        boundingBoxHTML.setAttribute('id', XRNA.boundingBoxID(parentID));
        boundingBoxHTML.setAttribute('x', '' + boundingBox.x);
        boundingBoxHTML.setAttribute('y', '' + boundingBox.y);
        boundingBoxHTML.setAttribute('width', '' + boundingBox.width);
        boundingBoxHTML.setAttribute('height', '' + boundingBox.height);
        boundingBoxHTML.setAttribute('visibility', 'hidden');
        boundingBoxHTML.setAttribute('stroke', 'red');
        boundingBoxHTML.setAttribute('stroke-width', '0.2');
        boundingBoxHTML.setAttribute('fill', 'none');
        return boundingBoxHTML;
    };
    XRNA.rnaComplexID = function (rnaComplexIndex) {
        return 'RNA Complex #' + rnaComplexIndex;
    };
    XRNA.rnaMoleculeID = function (parentID, rnaMoleculeIndex) {
        return parentID + ': RNA Molecule #' + rnaMoleculeIndex;
    };
    XRNA.nucleotideID = function (parentID, nucleotideIndex) {
        return parentID + ': Nucleotide #' + nucleotideIndex;
    };
    XRNA.labelContentID = function (parentID) {
        return parentID + ': Label Content';
    };
    XRNA.labelLineID = function (parentID) {
        return parentID + ': Label Line';
    };
    XRNA.labelLineBodyID = function (parentID) {
        return parentID + ': Body';
    };
    XRNA.labelLineCap0ID = function (parentID) {
        return parentID + ': Cap #0';
    };
    XRNA.labelLineCap1ID = function (parentID) {
        return parentID + ': Cap #1';
    };
    XRNA.boundingBoxID = function (parentID) {
        return parentID + ': Bounding Box';
    };
    XRNA.circleID = function (parentID) {
        return parentID + ': Circle';
    };
    XRNA.bondLineID = function (parentID) {
        return parentID + ': Bond Line';
    };
    XRNA.fitSceneToBounds = function () {
        // Scale to fit the screen
        XRNA.sceneScale = Math.min(XRNA.canvasBounds.width / (XRNA.sceneBounds.maximumX - XRNA.sceneBounds.minimumX), XRNA.canvasBounds.height / (XRNA.sceneBounds.maximumY - XRNA.sceneBounds.minimumY));
        XRNA.sceneTransform.unshift('scale(' + XRNA.sceneScale + ' ' + XRNA.sceneScale + ')');
        document.getElementById('scene').setAttribute('transform', XRNA.sceneTransform.join(' '));
        // Remove the elements of XRNA.sceneTransform which were added by fitSceneToBounds().
        // This is necessary to ensure correct scene fitting when fitSceneToBounds() is called multiple times.
        // This occurs during window resizing.
        XRNA.sceneTransform.shift();
    };
    XRNA.invertYTransform = function (y) {
        return 'translate(0 ' + y + ') scale(1 -1) translate(0 ' + -y + ')';
    };
    XRNA.fontIDToFont = function (fontID) {
        // Adapted from StringUtil.java:ssFontToFont
        switch (fontID) {
            case 0:
                return {
                    size: null,
                    family: 'Helvetica',
                    style: 'normal',
                    weight: 'normal'
                };
            case 1:
                return {
                    size: null,
                    family: 'Helvetica',
                    style: 'italic',
                    weight: 'normal'
                };
            case 2:
                return {
                    size: null,
                    family: 'Helvetica',
                    style: 'normal',
                    weight: 'bold'
                };
            case 3:
                return {
                    size: null,
                    family: 'Helvetica',
                    style: 'italic',
                    weight: 'bold'
                };
            case 4:
                return {
                    size: null,
                    family: 'TimesRoman',
                    style: 'normal',
                    weight: 'normal'
                };
            case 5:
                return {
                    size: null,
                    family: 'TimesRoman',
                    style: 'italic',
                    weight: 'normal'
                };
            case 6:
                return {
                    size: null,
                    family: 'TimesRoman',
                    style: 'normal',
                    weight: 'bold'
                };
            case 7:
                return {
                    size: null,
                    family: 'TimesRoman',
                    style: 'italic',
                    weight: 'bold'
                };
            case 8:
                return {
                    size: null,
                    family: 'Courier',
                    style: 'normal',
                    weight: 'normal'
                };
            case 9:
                return {
                    size: null,
                    family: 'Courier',
                    style: 'italic',
                    weight: 'normal'
                };
            case 10:
                return {
                    size: null,
                    family: 'Courier',
                    style: 'normal',
                    weight: 'bold'
                };
            case 11:
                return {
                    size: null,
                    family: 'Courier',
                    style: 'italic',
                    weight: 'bold'
                };
            case 12:
                return {
                    size: null,
                    family: 'TimesRoman',
                    style: 'normal',
                    weight: 'normal'
                };
            case 13:
                return {
                    size: null,
                    family: 'Dialog',
                    style: 'normal',
                    weight: 'normal'
                };
            case 14:
                return {
                    size: null,
                    family: 'Dialog',
                    style: 'italic',
                    weight: 'normal'
                };
            case 15:
                return {
                    size: null,
                    family: 'Dialog',
                    style: 'normal',
                    weight: 'bold'
                };
            case 16:
                return {
                    size: null,
                    family: 'Dialog',
                    style: 'italic',
                    weight: 'bold'
                };
            case 17:
                return {
                    size: null,
                    family: 'DialogInput',
                    style: 'normal',
                    weight: 'normal'
                };
            case 18:
                return {
                    size: null,
                    family: 'DialogInput',
                    style: 'italic',
                    weight: 'normal'
                };
            case 19:
                return {
                    size: null,
                    family: 'DialogInput',
                    style: 'normal',
                    weight: 'bold'
                };
            case 20:
                return {
                    size: null,
                    family: 'DialogInput',
                    style: 'italic',
                    weight: 'bold'
                };
            default:
                return {
                    size: null,
                    family: 'Helvetica',
                    style: 'normal',
                    weight: 'normal'
                };
        }
    };
    XRNA.fontToFontID = function (font) {
        // A logical inversion of fontIDToFont. Implemented for backward compatibility.
        switch (font.family + '_' + font.style + '_' + font.weight) {
            default:
            case 'Helvetica_normal_normal':
                return 0;
            case 'Helvetica_italic_normal':
                return 1;
            case 'Helvetica_normal_bold':
                return 2;
            case 'Helvetica_italic_bold':
                return 3;
            case 'TimesRoman_normal_normal':
                return 4;
            case 'TimesRoman_italic_normal':
                return 5;
            case 'TimesRoman_normal_bold':
                return 6;
            case 'TimesRoman_italic_bold':
                return 7;
            case 'Courier_normal_normal':
                return 8;
            case 'Courier_italic_normal':
                return 9;
            case 'Courier_normal_bold':
                return 10;
            case 'Courier_italic_bold':
                return 11;
            case 'TimesRoman_normal_normal':
                return 12;
            case 'Dialog_normal_normal':
                return 13;
            case 'Dialog_italic_normal':
                return 14;
            case 'Dialog_normal_bold':
                return 15;
            case 'Dialog_italic_bold':
                return 16;
            case 'DialogInput_normal_normal':
                return 17;
            case 'DialogInput_italic_normal':
                return 18;
            case 'DialogInput_normal_bold':
                return 19;
            case 'DialogInput_italic_bold':
                return 20;
        }
    };
    XRNA.onClickLabelContent = function (labelContentHTML) {
        XRNA.resetSelection();
        var indices = labelContentHTML.id.match(/#\d+/g), boundingBoxHTML = document.getElementById(XRNA.boundingBoxID(labelContentHTML.id)), labelContent = XRNA.rnaComplexes[parseInt(indices[0].substring(1))].rnaMolecules[parseInt(indices[1].substring(1))].nucleotides[parseInt(indices[2].substring(1))].labelContent;
        boundingBoxHTML.setAttribute('visibility', 'visible');
        XRNA.selection.highlighted.push(boundingBoxHTML);
        XRNA.selection.selected.push({
            updateXYHelper: function (x, y) {
                labelContentHTML.setAttribute('x', '' + x);
                labelContentHTML.setAttribute('y', '' + y);
            },
            cache: {
                x: parseFloat(labelContentHTML.getAttribute('x')),
                y: parseFloat(labelContentHTML.getAttribute('y'))
            },
            invertYFlag: true,
            xyAreDisplacementsFlag: false
        });
        XRNA.selection.selected.push({
            updateXYHelper: function (x, y) {
                boundingBoxHTML.setAttribute('x', '' + x);
                boundingBoxHTML.setAttribute('y', '' + y);
            },
            cache: {
                x: parseFloat(boundingBoxHTML.getAttribute('x')),
                y: parseFloat(boundingBoxHTML.getAttribute('y'))
            },
            invertYFlag: false,
            xyAreDisplacementsFlag: false
        });
        XRNA.selection.selected.push({
            updateXYHelper: function (x, y) {
                labelContent.x = x;
                labelContent.y = y;
            },
            cache: {
                x: labelContent.x,
                y: labelContent.y
            },
            invertYFlag: false,
            xyAreDisplacementsFlag: false
        });
    };
    XRNA.onClickLabelLineCap = function (mouseEvent, labelLineCapHTML) {
        XRNA.resetSelection();
        var graphicalTransform = MatrixOperations2D.fromTransform(XRNA.sceneDressingHTML.getAttribute('transform') + ' ' + document.getElementById('scene').getAttribute('transform')), id = labelLineCapHTML.id, indices = id.match(/#\d+/g), rnaComplexIndex = parseInt(indices[0].substring(1)), rnaMoleculeIndex = parseInt(indices[1].substring(1)), nucleotideIndex = parseInt(indices[2].substring(1)), capIndex = parseInt(indices[3].substring(1)), otherCapIndex = capIndex ^ 1, nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex], labelLine = nucleotide.labelLine, labelLineID = id.substring(0, id.lastIndexOf(':')), labelLineHTML = document.getElementById(labelLineID), capEndpointOffset = labelLine['v' + capIndex], otherCapEndpointOffset = labelLine['v' + otherCapIndex], nucleotideID = XRNA.nucleotideID(XRNA.rnaMoleculeID(XRNA.rnaComplexID(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex), nucleotideBoundingBox = document.getElementById(XRNA.boundingBoxID(nucleotideID)), center = {
            x: parseFloat(nucleotideBoundingBox.getAttribute('x')) + parseFloat(nucleotideBoundingBox.getAttribute('width')) / 2.0,
            y: parseFloat(nucleotideBoundingBox.getAttribute('y')) + parseFloat(nucleotideBoundingBox.getAttribute('height')) / 2.0
        }, capEndpoint = MatrixOperations2D.transform(graphicalTransform, {
            x: center.x + capEndpointOffset.x,
            y: center.y + capEndpointOffset.y
        }), otherCapEndpoint = MatrixOperations2D.transform(graphicalTransform, {
            x: center.x + otherCapEndpointOffset.x,
            y: center.y + otherCapEndpointOffset.y
        }), interpolationFactor = 1.0 / VectorOperations.scalarProjection({
            x: mouseEvent.pageX - otherCapEndpoint.x,
            y: XRNA.correctYCoordinate(mouseEvent.pageY) - otherCapEndpoint.y
        }, {
            x: capEndpoint.x - otherCapEndpoint.x,
            y: capEndpoint.y - otherCapEndpoint.y
        }), cap0 = document.getElementById(XRNA.labelLineCap0ID(labelLineID)), body = document.getElementById(XRNA.labelLineBodyID(labelLineID)), cap1 = document.getElementById(XRNA.labelLineCap1ID(labelLineID));
        cap0.setAttribute('transform', '');
        body.setAttribute('transform', '');
        cap1.setAttribute('transform', '');
        var paths = XRNA.getPathsFromLine({
            x: center.x + labelLine.v0.x,
            y: center.y + labelLine.v0.y
        }, {
            x: center.x + labelLine.v1.x,
            y: center.y + labelLine.v1.y
        });
        cap0.setAttribute('d', paths.cap0Path);
        body.setAttribute('d', paths.bodyPath);
        cap1.setAttribute('d', paths.cap1Path);
        labelLineCapHTML.setAttribute('visibility', 'visible');
        XRNA.selection.highlighted.push(labelLineCapHTML);
        XRNA.selection.selected.push(new /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.updateXYHelper = function (dx, dy) {
                capEndpointOffset.x = this.cache.x + dx * interpolationFactor;
                capEndpointOffset.y = this.cache.y + dy * interpolationFactor;
                var paths = XRNA.getPathsFromLine({
                    x: center.x + labelLine.v0.x,
                    y: center.y + labelLine.v0.y
                }, {
                    x: center.x + labelLine.v1.x,
                    y: center.y + labelLine.v1.y
                });
                cap0.setAttribute('d', paths.cap0Path);
                body.setAttribute('d', paths.bodyPath);
                cap1.setAttribute('d', paths.cap1Path);
            };
            return class_1;
        }(SelectedElement))(capEndpointOffset.x, capEndpointOffset.y, false, true));
        XRNA.selection.selected.push(new /** @class */ (function (_super) {
            __extends(class_2, _super);
            function class_2() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_2.prototype.updateXYHelper = function (dx, dy) {
                labelLineHTML.setAttribute('x' + (capIndex + 1), '' + (this.cache.x + dx * interpolationFactor));
                labelLineHTML.setAttribute('y' + (capIndex + 1), '' + (this.cache.y + dy * interpolationFactor));
            };
            return class_2;
        }(SelectedElement))(parseFloat(labelLineHTML.getAttribute('x' + (capIndex + 1))), parseFloat(labelLineHTML.getAttribute('y' + (capIndex + 1))), false, true));
    };
    XRNA.onClickLabelLineBody = function (labelLineBody) {
        XRNA.resetSelection();
        var id = labelLineBody.id, indices = id.match(/#\d+/g), rnaComplexIndex = parseInt(indices[0].substring(1)), rnaMoleculeIndex = parseInt(indices[1].substring(1)), nucleotideIndex = parseInt(indices[2].substring(1)), nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex], labelLine = nucleotide.labelLine, labelLineID = labelLineBody.id.substring(0, labelLineBody.id.lastIndexOf(':')), labelLineHTML = document.getElementById(labelLineID);
        labelLineBody.setAttribute('visibility', 'visible');
        XRNA.selection.highlighted.push(labelLineBody);
        XRNA.selection.selected.push({
            updateXYHelper: function (x, y) {
                labelLineHTML.setAttribute('x1', '' + x);
                labelLineHTML.setAttribute('y1', '' + y);
            },
            cache: {
                x: parseFloat(labelLineHTML.getAttribute('x1')),
                y: parseFloat(labelLineHTML.getAttribute('y1'))
            },
            invertYFlag: false,
            xyAreDisplacementsFlag: false
        });
        XRNA.selection.selected.push({
            updateXYHelper: function (x, y) {
                labelLineHTML.setAttribute('x2', '' + x);
                labelLineHTML.setAttribute('y2', '' + y);
            },
            cache: {
                x: parseFloat(labelLineHTML.getAttribute('x2')),
                y: parseFloat(labelLineHTML.getAttribute('y2'))
            },
            invertYFlag: false,
            xyAreDisplacementsFlag: false
        });
        XRNA.selection.selected.push({
            updateXYHelper: function (x, y) {
                labelLine.v0.x = x;
                labelLine.v0.y = y;
            },
            cache: {
                x: labelLine.v0.x,
                y: labelLine.v0.y
            },
            invertYFlag: false,
            xyAreDisplacementsFlag: false
        });
        XRNA.selection.selected.push({
            updateXYHelper: function (x, y) {
                labelLine.v1.x = x;
                labelLine.v1.y = y;
            },
            cache: {
                x: labelLine.v1.x,
                y: labelLine.v1.y
            },
            invertYFlag: false,
            xyAreDisplacementsFlag: false
        });
        var transform = labelLineBody.getAttribute('transform'), cap0Cache, bodyCache, cap1Cache;
        if (transform) {
            var transformCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(transform);
            bodyCache = {
                x: parseFloat(transformCoordinates[1]),
                y: parseFloat(transformCoordinates[2])
            };
        }
        else {
            bodyCache = {
                x: 0,
                y: 0
            };
        }
        var cap0HTML = document.getElementById(XRNA.labelLineCap0ID(labelLineID));
        transform = cap0HTML.getAttribute('transform');
        if (transform) {
            var transformCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(transform);
            cap0Cache = {
                x: parseFloat(transformCoordinates[1]),
                y: parseFloat(transformCoordinates[2])
            };
        }
        else {
            cap0Cache = {
                x: 0,
                y: 0
            };
        }
        var cap1HTML = document.getElementById(XRNA.labelLineCap1ID(labelLineID));
        transform = cap1HTML.getAttribute('transform');
        if (transform) {
            var transformCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(transform);
            cap1Cache = {
                x: parseFloat(transformCoordinates[1]),
                y: parseFloat(transformCoordinates[2])
            };
        }
        else {
            cap1Cache = {
                x: 0,
                y: 0
            };
        }
        XRNA.selection.selected.push({
            updateXYHelper: function (x, y) {
                cap0HTML.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
            },
            cache: cap0Cache,
            invertYFlag: false,
            xyAreDisplacementsFlag: false
        });
        XRNA.selection.selected.push({
            updateXYHelper: function (x, y) {
                labelLineBody.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
            },
            cache: bodyCache,
            invertYFlag: false,
            xyAreDisplacementsFlag: false
        });
        XRNA.selection.selected.push({
            updateXYHelper: function (x, y) {
                cap1HTML.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
            },
            cache: cap1Cache,
            invertYFlag: false,
            xyAreDisplacementsFlag: false
        });
    };
    XRNA.onClickNucleotide = function (mouseEvent, nucleotideHTML) {
        XRNA.getButtonIndex(mouseEvent);
        var newButtonIndex = XRNA.getButtonIndex(mouseEvent), pressedButtonIndex = newButtonIndex - XRNA.buttonIndex, indices = nucleotideHTML.id.match(/#\d+/g), rnaComplexIndex = parseInt(indices[0].substring(1)), rnaMoleculeIndex = parseInt(indices[1].substring(1)), nucleotideIndex = parseInt(indices[2].substring(1)), selectionConstraint = XRNA.selectionConstraintDescriptionDictionary[XRNA.selectionConstraintHTML.value];
        if (pressedButtonIndex & BUTTON_INDEX.LEFT) {
            XRNA.resetSelection();
            if (selectionConstraint.approveSelectedIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex)) {
                selectionConstraint.getSelectedNucleotideIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex).forEach(function (selectedNucleotideIndices) {
                    var rnaComplexIndex = selectedNucleotideIndices.rnaComplexIndex, rnaMoleculeIndex = selectedNucleotideIndices.rnaMoleculeIndex, nucleotideIndex = selectedNucleotideIndices.nucleotideIndex, nucleotideID = XRNA.nucleotideID(XRNA.rnaMoleculeID(XRNA.rnaComplexID(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex), nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex], nucleotideHTML = document.getElementById(nucleotideID), nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxID(nucleotideID)), selected = new Array({ htmlElement: nucleotideHTML, invertYFlag: true }, { htmlElement: nucleotideBoundingBoxHTML, invertYFlag: false });
                    XRNA.selection.highlighted.push(nucleotideBoundingBoxHTML);
                    if (nucleotide.labelContent) {
                        var labelContentID = XRNA.labelContentID(nucleotideID), boundingBoxHTML = document.getElementById(XRNA.boundingBoxID(labelContentID)), labelContent = nucleotide.labelContent;
                        XRNA.selection.highlighted.push(boundingBoxHTML);
                        selected.push({
                            htmlElement: boundingBoxHTML,
                            invertYFlag: false
                        });
                        selected.push({
                            htmlElement: document.getElementById(labelContentID),
                            invertYFlag: true
                        });
                    }
                    if (nucleotide.labelLine) {
                        var labelLineID = XRNA.labelLineID(nucleotideID), cap0ID = XRNA.labelLineCap0ID(labelLineID), bodyID = XRNA.labelLineBodyID(labelLineID), cap1ID = XRNA.labelLineCap1ID(labelLineID), labelLineHTML_1 = document.getElementById(labelLineID), cap0HTML_1 = document.getElementById(cap0ID), bodyHTML_1 = document.getElementById(bodyID), cap1HTML_1 = document.getElementById(cap1ID), labelLine = nucleotide.labelLine;
                        XRNA.selection.highlighted.push(cap0HTML_1);
                        XRNA.selection.highlighted.push(bodyHTML_1);
                        XRNA.selection.highlighted.push(cap1HTML_1);
                        XRNA.selection.selected.push({
                            updateXYHelper: function (x, y) {
                                labelLineHTML_1.setAttribute('x1', '' + x);
                                labelLineHTML_1.setAttribute('y1', '' + y);
                            },
                            cache: {
                                x: parseFloat(labelLineHTML_1.getAttribute('x1')),
                                y: parseFloat(labelLineHTML_1.getAttribute('y1'))
                            },
                            invertYFlag: false,
                            xyAreDisplacementsFlag: false
                        });
                        XRNA.selection.selected.push({
                            updateXYHelper: function (x, y) {
                                labelLineHTML_1.setAttribute('x2', '' + x);
                                labelLineHTML_1.setAttribute('y2', '' + y);
                            },
                            cache: {
                                x: parseFloat(labelLineHTML_1.getAttribute('x2')),
                                y: parseFloat(labelLineHTML_1.getAttribute('y2'))
                            },
                            invertYFlag: false,
                            xyAreDisplacementsFlag: false
                        });
                        var cap0Transform = cap0HTML_1.getAttribute('transform'), bodyTransform = bodyHTML_1.getAttribute('transform'), cap1Transform = cap1HTML_1.getAttribute('transform'), cap0Cache = void 0, bodyCache = void 0, cap1Cache = void 0;
                        if (cap0Transform) {
                            var transformCoordinates = /^translate\((-?[\d\.]+) (-?[\d\.]+)\)$/.exec(cap0Transform);
                            cap0Cache = {
                                x: parseFloat(transformCoordinates[1]),
                                y: parseFloat(transformCoordinates[2])
                            };
                        }
                        else {
                            cap0Cache = {
                                x: 0,
                                y: 0
                            };
                        }
                        if (bodyTransform) {
                            var transformCoordinates = /^translate\((-?[\d\.]+) (-?[\d\.]+)\)$/.exec(bodyTransform);
                            bodyCache = {
                                x: parseFloat(transformCoordinates[1]),
                                y: parseFloat(transformCoordinates[2])
                            };
                        }
                        else {
                            bodyCache = {
                                x: 0,
                                y: 0
                            };
                        }
                        if (cap1Transform) {
                            var transformCoordinates = /^translate\((-?[\d\.]+) (-?[\d\.]+)\)$/.exec(cap1Transform);
                            cap1Cache = {
                                x: parseFloat(transformCoordinates[1]),
                                y: parseFloat(transformCoordinates[2])
                            };
                        }
                        else {
                            cap1Cache = {
                                x: 0,
                                y: 0
                            };
                        }
                        XRNA.selection.selected.push({
                            updateXYHelper: function (x, y) {
                                cap0HTML_1.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
                            },
                            cache: cap0Cache,
                            invertYFlag: false,
                            xyAreDisplacementsFlag: false
                        });
                        XRNA.selection.selected.push({
                            updateXYHelper: function (x, y) {
                                bodyHTML_1.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
                            },
                            cache: bodyCache,
                            invertYFlag: false,
                            xyAreDisplacementsFlag: false
                        });
                        XRNA.selection.selected.push({
                            updateXYHelper: function (x, y) {
                                cap1HTML_1.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
                            },
                            cache: cap1Cache,
                            invertYFlag: false,
                            xyAreDisplacementsFlag: false
                        });
                    }
                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex > nucleotide.basePairIndex) {
                        var nucleotideBondSymbolHTML_1 = document.getElementById(XRNA.circleID(nucleotideID));
                        if (nucleotideBondSymbolHTML_1) {
                            XRNA.selection.selected.push(new /** @class */ (function (_super) {
                                __extends(class_3, _super);
                                function class_3() {
                                    return _super !== null && _super.apply(this, arguments) || this;
                                }
                                class_3.prototype.updateXYHelper = function (x, y) {
                                    nucleotideBondSymbolHTML_1.setAttribute('cx', '' + x);
                                    nucleotideBondSymbolHTML_1.setAttribute('cy', '' + y);
                                };
                                return class_3;
                            }(SelectedElement))(parseFloat(nucleotideBondSymbolHTML_1.getAttribute('cx')), parseFloat(nucleotideBondSymbolHTML_1.getAttribute('cy')), false, false));
                        }
                        else {
                            nucleotideBondSymbolHTML_1 = document.getElementById(XRNA.bondLineID(nucleotideID));
                            XRNA.selection.selected.push(new /** @class */ (function (_super) {
                                __extends(class_4, _super);
                                function class_4() {
                                    return _super !== null && _super.apply(this, arguments) || this;
                                }
                                class_4.prototype.updateXYHelper = function (x, y) {
                                    nucleotideBondSymbolHTML_1.setAttribute('x1', '' + x);
                                    nucleotideBondSymbolHTML_1.setAttribute('y1', '' + y);
                                };
                                return class_4;
                            }(SelectedElement))(parseFloat(nucleotideBondSymbolHTML_1.getAttribute('x1')), parseFloat(nucleotideBondSymbolHTML_1.getAttribute('y1')), false, false));
                            XRNA.selection.selected.push(new /** @class */ (function (_super) {
                                __extends(class_5, _super);
                                function class_5() {
                                    return _super !== null && _super.apply(this, arguments) || this;
                                }
                                class_5.prototype.updateXYHelper = function (x, y) {
                                    nucleotideBondSymbolHTML_1.setAttribute('x2', '' + x);
                                    nucleotideBondSymbolHTML_1.setAttribute('y2', '' + y);
                                };
                                return class_5;
                            }(SelectedElement))(parseFloat(nucleotideBondSymbolHTML_1.getAttribute('x2')), parseFloat(nucleotideBondSymbolHTML_1.getAttribute('y2')), false, false));
                        }
                    }
                    selected.forEach(function (selectedI) {
                        ;
                        XRNA.selection.selected.push({
                            updateXYHelper: function (x, y) {
                                selectedI.htmlElement.setAttribute('x', '' + x);
                                selectedI.htmlElement.setAttribute('y', '' + y);
                            },
                            cache: {
                                x: parseFloat(selectedI.htmlElement.getAttribute('x')),
                                y: parseFloat(selectedI.htmlElement.getAttribute('y'))
                            },
                            invertYFlag: selectedI.invertYFlag,
                            xyAreDisplacementsFlag: false
                        });
                    });
                    XRNA.selection.selected.push({
                        updateXYHelper: function (x, y) {
                            nucleotide.point.x = x;
                            nucleotide.point.y = y;
                        },
                        cache: {
                            x: nucleotide.point.x,
                            y: nucleotide.point.y
                        },
                        invertYFlag: false,
                        xyAreDisplacementsFlag: false
                    });
                });
                XRNA.selection.highlighted.forEach(function (highlightedI) { return highlightedI.setAttribute('visibility', 'visible'); });
            }
            else {
                alert(selectionConstraint.getErrorMessage());
            }
        }
        if (pressedButtonIndex & BUTTON_INDEX.MIDDLE) {
            var contextMenuHTML = document.getElementById('contextMenu'), contextMenuDimension = Math.ceil(Math.min(window.innerWidth, window.innerHeight) / 3.0), contextMenuDimensionAsString = contextMenuDimension + 'px';
            while (contextMenuHTML.firstChild) {
                contextMenuHTML.removeChild(contextMenuHTML.firstChild);
            }
            contextMenuHTML.style.display = 'block';
            contextMenuHTML.style.width = contextMenuDimensionAsString;
            contextMenuHTML.style.height = contextMenuDimensionAsString;
            // Provide a buffer for the context menu's border.
            contextMenuHTML.style.left = Math.min(window.innerWidth - contextMenuDimension - 6, mouseEvent.pageX) + 'px';
            contextMenuHTML.style.top = Math.min(window.innerHeight - contextMenuDimension - 6, mouseEvent.pageY) + 'px';
            selectionConstraint.populateContextMenu(contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
        }
    };
    XRNA.getPathsFromLine = function (p0, p1) {
        var dx = p1.x - p0.x, dy = p1.y - p0.y, interpolation0X = VectorOperations.linearlyInterpolate(p0.x, p1.x, 0.25), interpolation0Y = VectorOperations.linearlyInterpolate(p0.y, p1.y, 0.25), interpolation1X = VectorOperations.linearlyInterpolate(p0.x, p1.x, 0.75), interpolation1Y = VectorOperations.linearlyInterpolate(p0.y, p1.y, 0.75), clickableScalar = 1, magnitude = VectorOperations.magnitude(dx, dy);
        dx /= magnitude;
        dy /= magnitude;
        var interpolation0Translated0 = { x: interpolation0X - dy * clickableScalar, y: interpolation0Y + dx * clickableScalar }, interpolation0Translated1 = { x: interpolation0X + dy * clickableScalar, y: interpolation0Y - dx * clickableScalar }, interpolation1Translated0 = { x: interpolation1X - dy * clickableScalar, y: interpolation1Y + dx * clickableScalar }, interpolation1Translated1 = { x: interpolation1X + dy * clickableScalar, y: interpolation1Y - dx * clickableScalar };
        return {
            cap0Path: 'M ' + interpolation0Translated1.x + ' ' + interpolation0Translated1.y + ' L ' + (p0.x + dy * clickableScalar) + ' ' + (p0.y - dx * clickableScalar) + ' a 0.5 0.5 0 0 0 ' + (-2 * dy * clickableScalar) + ' ' + (2 * dx * clickableScalar) + ' L ' + interpolation0Translated0.x + ' ' + interpolation0Translated0.y + ' z',
            bodyPath: 'M ' + interpolation0Translated0.x + ' ' + interpolation0Translated0.y + ' L ' + interpolation1Translated0.x + ' ' + interpolation1Translated0.y + ' L ' + interpolation1Translated1.x + ' ' + interpolation1Translated1.y + ' L ' + interpolation0Translated1.x + ' ' + interpolation0Translated1.y + ' z',
            cap1Path: 'M ' + interpolation1Translated0.x + ' ' + interpolation1Translated0.y + ' L ' + (p1.x - dy * clickableScalar) + ' ' + (p1.y + dx * clickableScalar) + ' a 0.5 0.5 0 0 0 ' + (2 * dy * clickableScalar) + ' ' + (-2 * dx * clickableScalar) + ' L ' + interpolation1Translated1.x + ' ' + interpolation1Translated1.y + ' z'
        };
    };
    XRNA.prepareScene = function () {
        while (XRNA.sceneDressingHTML.firstChild) {
            XRNA.sceneDressingHTML.removeChild(XRNA.sceneDressingHTML.firstChild);
        }
        document.getElementById('background').onmousedown = function (mouseEvent) {
            var buttonIndex = XRNA.getButtonIndex(mouseEvent);
            if (buttonIndex & BUTTON_INDEX.LEFT) {
                XRNA.resetSelection();
            }
            var contextMenuHTML = document.getElementById('contextMenu');
            contextMenuHTML.style.display = 'none';
        };
        var sceneHTML = document.createElementNS(svgNameSpaceURL, 'g');
        sceneHTML.setAttribute('id', 'scene');
        XRNA.sceneDressingHTML.appendChild(sceneHTML);
        XRNA.sceneBounds.minimumX = Number.MAX_VALUE,
            XRNA.sceneBounds.maximumX = -Number.MAX_VALUE,
            XRNA.sceneBounds.minimumY = Number.MAX_VALUE,
            XRNA.sceneBounds.maximumY = -Number.MAX_VALUE;
        for (var rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            var complex = XRNA.rnaComplexes[rnaComplexIndex], complexID = XRNA.rnaComplexID(rnaComplexIndex);
            for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < complex.rnaMolecules.length; rnaMoleculeIndex++) {
                var rnaMoleculeHTML = document.createElementNS(svgNameSpaceURL, 'g'), rnaMoleculeID = XRNA.rnaMoleculeID(complexID, rnaMoleculeIndex);
                rnaMoleculeHTML.setAttribute('id', rnaMoleculeID);
                sceneHTML.appendChild(rnaMoleculeHTML);
                var labelContentsGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
                labelContentsGroupHTML.setAttribute('id', rnaMoleculeID + ': Labels: Contents');
                rnaMoleculeHTML.appendChild(labelContentsGroupHTML);
                var labelLinesGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
                labelLinesGroupHTML.setAttribute('id', rnaMoleculeID + ': Labels: Lines');
                rnaMoleculeHTML.appendChild(labelLinesGroupHTML);
                var bondSymbolsGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
                bondSymbolsGroupHTML.setAttribute('id', rnaMoleculeID + ': Bond Lines');
                rnaMoleculeHTML.appendChild(bondSymbolsGroupHTML);
                var boundingBoxesHTML = document.createElementNS(svgNameSpaceURL, 'g');
                boundingBoxesHTML.setAttribute('id', rnaMoleculeID + ': Bounding Boxes');
                rnaMoleculeHTML.appendChild(boundingBoxesHTML);
                var rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex], nucleotides = rnaMolecule.nucleotides;
                var _loop_2 = function (nucleotideIndex) {
                    var nucleotide = nucleotides[nucleotideIndex], nucleotideHTML = document.createElementNS(svgNameSpaceURL, 'text');
                    nucleotideHTML.textContent = nucleotide.symbol;
                    var nucleotideID = XRNA.nucleotideID(rnaMoleculeID, nucleotideIndex);
                    nucleotideHTML.setAttribute('id', nucleotideID);
                    nucleotideHTML.setAttribute('x', '' + nucleotide.point.x);
                    nucleotideHTML.setAttribute('y', '' + nucleotide.point.y);
                    var nucleotideColor = nucleotide.color;
                    nucleotideHTML.setAttribute('stroke', 'rgb(' + nucleotideColor.red + ' ' + nucleotideColor.green + ' ' + nucleotideColor.blue + ')');
                    nucleotideHTML.setAttribute('font-size', '' + nucleotide.font.size);
                    nucleotideHTML.setAttribute('font-family', nucleotide.font.family);
                    nucleotideHTML.setAttribute('font-style', nucleotide.font.style);
                    nucleotideHTML.setAttribute('font-weight', nucleotide.font.weight);
                    nucleotideHTML.setAttribute('transform', XRNA.invertYTransform(nucleotide.point.y));
                    nucleotideHTML.onmousedown = function (mouseEvent) { return XRNA.onClickNucleotide(mouseEvent, nucleotideHTML); };
                    rnaMoleculeHTML.appendChild(nucleotideHTML);
                    var boundingBoxes = new Array(), nucleotideBoundingBox = XRNA.getBoundingBox(nucleotideHTML), boundingBoxHTML = XRNA.getBoundingBoxHTML(nucleotideBoundingBox, nucleotideID);
                    boundingBoxesHTML.appendChild(boundingBoxHTML);
                    boundingBoxes.push(nucleotideBoundingBox);
                    var nucleotideBoundingBoxCenterX = nucleotideBoundingBox.x + nucleotideBoundingBox.width / 2.0, nucleotideBoundingBoxCenterY = nucleotideBoundingBox.y + nucleotideBoundingBox.height / 2.0;
                    if (nucleotide.labelLine) {
                        var labelLineHTML = document.createElementNS(svgNameSpaceURL, 'line'), labelLineClickableBodyHTML_1 = document.createElementNS(svgNameSpaceURL, 'path'), labelLineClickableCap0HTML_1 = document.createElementNS(svgNameSpaceURL, 'path'), labelLineClickableCap1HTML_1 = document.createElementNS(svgNameSpaceURL, 'path'), labelLine = nucleotide.labelLine, x0 = nucleotideBoundingBoxCenterX + labelLine.v0.x, y0 = nucleotideBoundingBoxCenterY + labelLine.v0.y, x1 = nucleotideBoundingBoxCenterX + labelLine.v1.x, y1 = nucleotideBoundingBoxCenterY + labelLine.v1.y, paths = XRNA.getPathsFromLine({
                            x: x0,
                            y: y0
                        }, {
                            x: x1,
                            y: y1
                        }), lineColor = labelLine.color, labelLineID = XRNA.labelLineID(nucleotideID), labelLineBodyID = XRNA.labelLineBodyID(labelLineID), labelLineCap0ID = XRNA.labelLineCap0ID(labelLineID), labelLineCap1ID = XRNA.labelLineCap1ID(labelLineID);
                        labelLineClickableBodyHTML_1.setAttribute('d', paths.bodyPath);
                        labelLineClickableBodyHTML_1.setAttribute('id', '' + labelLineBodyID);
                        labelLineClickableBodyHTML_1.onmousedown = function (mouseEvent) {
                            XRNA.onClickLabelLineBody(labelLineClickableBodyHTML_1);
                        };
                        labelLineClickableBodyHTML_1.setAttribute('visibility', 'hidden');
                        labelLineClickableBodyHTML_1.setAttribute('fill', 'none');
                        labelLineClickableBodyHTML_1.setAttribute('stroke', 'red');
                        labelLineClickableBodyHTML_1.setAttribute('stroke-width', '0.2');
                        labelLineClickableBodyHTML_1.setAttribute('pointer-events', 'all');
                        labelLinesGroupHTML.appendChild(labelLineClickableBodyHTML_1);
                        labelLineClickableCap0HTML_1.setAttribute('d', paths.cap0Path);
                        labelLineClickableCap0HTML_1.setAttribute('id', '' + labelLineCap0ID);
                        labelLineClickableCap0HTML_1.onmousedown = function (mouseEvent) {
                            XRNA.onClickLabelLineCap(mouseEvent, labelLineClickableCap0HTML_1);
                        };
                        labelLineClickableCap0HTML_1.setAttribute('visibility', 'hidden');
                        labelLineClickableCap0HTML_1.setAttribute('fill', 'none');
                        labelLineClickableCap0HTML_1.setAttribute('stroke', 'red');
                        labelLineClickableCap0HTML_1.setAttribute('stroke-width', '0.2');
                        labelLineClickableCap0HTML_1.setAttribute('pointer-events', 'all');
                        labelLinesGroupHTML.appendChild(labelLineClickableCap0HTML_1);
                        labelLineClickableCap1HTML_1.setAttribute('d', paths.cap1Path);
                        labelLineClickableCap1HTML_1.setAttribute('id', '' + labelLineCap1ID);
                        labelLineClickableCap1HTML_1.onmousedown = function (mouseEvent) {
                            XRNA.onClickLabelLineCap(mouseEvent, labelLineClickableCap1HTML_1);
                        };
                        labelLineClickableCap1HTML_1.setAttribute('visibility', 'hidden');
                        labelLineClickableCap1HTML_1.setAttribute('fill', 'none');
                        labelLineClickableCap1HTML_1.setAttribute('stroke', 'red');
                        labelLineClickableCap1HTML_1.setAttribute('stroke-width', '0.2');
                        labelLineClickableCap1HTML_1.setAttribute('pointer-events', 'all');
                        labelLinesGroupHTML.appendChild(labelLineClickableCap1HTML_1);
                        labelLineHTML.setAttribute('id', XRNA.labelLineID(nucleotideID));
                        labelLineHTML.setAttribute('id', '' + labelLineID);
                        labelLineHTML.setAttribute('x1', '' + x0);
                        labelLineHTML.setAttribute('y1', '' + y0);
                        labelLineHTML.setAttribute('x2', '' + x1);
                        labelLineHTML.setAttribute('y2', '' + y1);
                        labelLineHTML.setAttribute('stroke-width', '' + labelLine.strokeWidth);
                        labelLineHTML.setAttribute('stroke', 'rgb(' + lineColor.red + ' ' + lineColor.green + ' ' + lineColor.blue + ')');
                        labelLineHTML.setAttribute('pointer-events', 'none');
                        labelLinesGroupHTML.appendChild(labelLineHTML);
                    }
                    if (nucleotide.labelContent) {
                        var labelContentHTML_1 = document.createElementNS(svgNameSpaceURL, 'text');
                        labelContentHTML_1.setAttribute('id', XRNA.labelContentID(nucleotideID));
                        var labelContent = nucleotide.labelContent, x = nucleotideBoundingBoxCenterX + labelContent.x;
                        labelContentHTML_1.setAttribute('x', '' + x);
                        var y = nucleotideBoundingBoxCenterY + labelContent.y;
                        labelContentHTML_1.setAttribute('y', '' + y);
                        labelContentHTML_1.textContent = labelContent.content;
                        var labelColor = labelContent.color;
                        labelContentHTML_1.setAttribute('stroke', 'rgb(' + labelColor.red + ' ' + labelColor.green + ' ' + labelColor.blue + ')');
                        var labelFont = labelContent.font, labelID = XRNA.labelContentID(nucleotideID);
                        labelContentHTML_1.setAttribute('id', labelID);
                        labelContentHTML_1.setAttribute('font-size', '' + labelFont.size);
                        labelContentHTML_1.setAttribute('font-family', labelFont.family);
                        labelContentHTML_1.setAttribute('font-style', labelFont.style);
                        labelContentHTML_1.setAttribute('font-weight', labelFont.weight);
                        labelContentHTML_1.setAttribute('transform', XRNA.invertYTransform(y));
                        labelContentHTML_1.onmousedown = function (mouseEvent) {
                            XRNA.onClickLabelContent(labelContentHTML_1);
                        };
                        labelContentsGroupHTML.appendChild(labelContentHTML_1);
                        var boundingBox = XRNA.getBoundingBox(labelContentHTML_1);
                        // Make corrections to the content's position
                        labelContentHTML_1.setAttribute('x', '' + (x - boundingBox.width / 2.0));
                        labelContentHTML_1.setAttribute('y', '' + (y + boundingBox.height / 3.0));
                        // Recalculate the bounding box. Manual correction appears ineffective.
                        boundingBox = XRNA.getBoundingBox(labelContentHTML_1);
                        boundingBoxes.push(boundingBox);
                        boundingBoxesHTML.appendChild(XRNA.getBoundingBoxHTML(boundingBox, labelID));
                    }
                    // Only render the bond lines once.
                    // If we use the nucleotide with the greater index, we can can reference the other nucleotide's HTML.
                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex > nucleotide.basePairIndex) {
                        var basePairedNucleotide = complex.rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotide.basePairIndex], basePairedNucleotideBounds = XRNA.getBoundingBox(document.getElementById(XRNA.nucleotideID(rnaMoleculeID, nucleotide.basePairIndex))), basePairedNucleotideBoundsCenterX_1 = basePairedNucleotideBounds.x + basePairedNucleotideBounds.width / 2.0, basePairedNucleotideBoundsCenterY_1 = basePairedNucleotideBounds.y + basePairedNucleotideBounds.height / 2.0, bondSymbolHTML_1, circleHTMLHelper = function (fill) {
                            bondSymbolHTML_1 = document.createElementNS(svgNameSpaceURL, 'circle');
                            bondSymbolHTML_1.setAttribute('id', XRNA.circleID(nucleotideID));
                            bondSymbolHTML_1.setAttribute('fill', fill);
                            bondSymbolHTML_1.setAttribute('cx', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX_1, 0.5));
                            bondSymbolHTML_1.setAttribute('cy', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY_1, 0.5));
                            bondSymbolHTML_1.setAttribute('r', '' + VectorOperations.distance({
                                x: nucleotideBoundingBoxCenterX,
                                y: nucleotideBoundingBoxCenterY
                            }, {
                                x: basePairedNucleotideBoundsCenterX_1,
                                y: basePairedNucleotideBoundsCenterY_1
                            }) / 8.0);
                        };
                        // Hardcode black for now. This appears to be consistent with XRNA-GT (Java).
                        var strokeAndFill = 'black';
                        switch (nucleotide.symbol + basePairedNucleotide.symbol) {
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
                                bondSymbolHTML_1 = document.createElementNS(svgNameSpaceURL, 'line');
                                bondSymbolHTML_1.setAttribute('id', XRNA.bondLineID(nucleotideID));
                                bondSymbolHTML_1.setAttribute('x1', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX_1, 0.25));
                                bondSymbolHTML_1.setAttribute('y1', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY_1, 0.25));
                                bondSymbolHTML_1.setAttribute('x2', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX_1, 0.75));
                                bondSymbolHTML_1.setAttribute('y2', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY_1, 0.75));
                                break;
                            }
                        }
                        bondSymbolHTML_1.setAttribute('stroke', strokeAndFill);
                        bondSymbolsGroupHTML.appendChild(bondSymbolHTML_1);
                    }
                    boundingBoxes.forEach(function (boundingBox) {
                        var xPlusWidth = boundingBox.x + boundingBox.width, yPlusHeight = boundingBox.y + boundingBox.height;
                        if (boundingBox.x < XRNA.sceneBounds.minimumX) {
                            XRNA.sceneBounds.minimumX = boundingBox.x;
                        }
                        if (xPlusWidth > XRNA.sceneBounds.maximumX) {
                            XRNA.sceneBounds.maximumX = xPlusWidth;
                        }
                        if (boundingBox.y < XRNA.sceneBounds.minimumY) {
                            XRNA.sceneBounds.minimumY = boundingBox.y;
                        }
                        if (yPlusHeight > XRNA.sceneBounds.maximumY) {
                            XRNA.sceneBounds.maximumY = yPlusHeight;
                        }
                    });
                };
                for (var nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    _loop_2(nucleotideIndex);
                }
            }
        }
        XRNA.sceneTransform = new Array();
        // Translate the scene to the origin.
        XRNA.sceneTransform.unshift('translate(' + -XRNA.sceneBounds.minimumX + ' ' + -XRNA.sceneBounds.minimumY + ')');
        // Invert the y axis. Note that graphical y axes are inverted in comparison to standard cartesian coordinates.
        XRNA.sceneTransform.unshift('scale(1 -1)');
        // Center the scene along the y axis.
        XRNA.sceneTransform.unshift('translate(0 ' + (XRNA.sceneBounds.maximumY - XRNA.sceneBounds.minimumY) + ')');
        XRNA.fitSceneToBounds();
    };
    XRNA.sceneDressingData = {
        maximumZoom: 48,
        minimumZoom: -48,
        // zoom is on a linear scale. It is converted to an exponential scale before use.
        zoom: 0,
        scale: 1,
        origin: {
            x: 0,
            y: 0
        },
        dragCoordinates: {
            cacheOrigin: {
                x: 0,
                y: 0
            },
            origin: {
                x: 0,
                y: 0
            }
        }
    };
    XRNA.inputParserDictionary = {
        'xml': XRNA.parseXML,
        'xrna': XRNA.parseXRNA,
        'ss': XRNA.parseXML,
        'ps': XRNA.parseXML
    };
    XRNA.outputWriterDictionary = {
        'xrna': XRNA.writeXRNA,
        'svg': XRNA.writeSVG,
        'tr': XRNA.writeTR
    };
    XRNA.selectionConstraintDescriptionDictionary = {
        'RNA Single Nucleotide': new /** @class */ (function (_super) {
            __extends(class_6, _super);
            function class_6() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_6.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex < 0;
            };
            class_6.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return [{
                        rnaComplexIndex: rnaComplexIndex,
                        rnaMoleculeIndex: rnaMoleculeIndex,
                        nucleotideIndex: nucleotideIndex
                    }];
            };
            class_6.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide without a base pair', 'a non-base-paired nucleotide');
            };
            class_6.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var createTextElement = function (text) {
                    var textElement = document.createElement('text');
                    textElement.setAttribute('stroke', 'black');
                    textElement.setAttribute('font-size', '12');
                    textElement.textContent = text;
                    return textElement;
                }, complex = XRNA.rnaComplexes[rnaComplexIndex], rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex], nucleotides = rnaMolecule.nucleotides, nucleotide = nucleotides[nucleotideIndex], textContent = 'Nuc: ' + (nucleotideIndex + rnaMolecule.firstNucleotideIndex) + ' ' + nucleotide.symbol;
                if (nucleotide.basePairIndex >= 0) {
                    textContent += ', Base Pair: ' + (nucleotide.basePairIndex + rnaMolecule.firstNucleotideIndex) + ' ' + nucleotides[nucleotide.basePairIndex].symbol;
                }
                contextMenuHTML.appendChild(createTextElement(textContent));
                contextMenuHTML.appendChild(document.createElement('br'));
                contextMenuHTML.appendChild(createTextElement('In RNA strand: ' + rnaMolecule.name));
                contextMenuHTML.appendChild(document.createElement('br'));
                if (nucleotideIndex > 0) {
                    var previousNucleotide = nucleotides[nucleotideIndex - 1];
                    contextMenuHTML.appendChild(createTextElement('Distance to last nuc: ' + VectorOperations.distance({
                        x: nucleotide.point.x,
                        y: nucleotide.point.y
                    }, {
                        x: previousNucleotide.point.x,
                        y: previousNucleotide.point.y
                    }).toFixed(2)));
                    contextMenuHTML.appendChild(document.createElement('br'));
                }
                if (nucleotideIndex < nucleotides.length - 1) {
                    var nextNucleotide = nucleotides[nucleotideIndex + 1];
                    contextMenuHTML.appendChild(createTextElement('Distance to next nuc: ' + VectorOperations.distance({
                        x: nucleotide.point.x,
                        y: nucleotide.point.y
                    }, {
                        x: nextNucleotide.point.x,
                        y: nextNucleotide.point.y
                    }).toFixed(2)));
                    contextMenuHTML.appendChild(document.createElement('br'));
                }
                var nucleotideID = XRNA.nucleotideID(XRNA.rnaMoleculeID(XRNA.rnaComplexID(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex), nucleotideHTML = document.getElementById(nucleotideID), nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxID(nucleotideID)), centerX = parseFloat(nucleotideBoundingBoxHTML.getAttribute('x')) + parseFloat(nucleotideBoundingBoxHTML.getAttribute('width')) / 2.0, centerY = parseFloat(nucleotideBoundingBoxHTML.getAttribute('y')) + parseFloat(nucleotideBoundingBoxHTML.getAttribute('height')) / 2.0, cacheCenterX = centerX, cacheCenterY = centerY, coordinateMap = [
                    {
                        updateXHelper: function (x) { return nucleotide.point.x = x; },
                        updateYHelper: function (y) { return nucleotide.point.y = y; },
                        cache: {
                            x: nucleotide.point.x,
                            y: nucleotide.point.y
                        },
                        invertYFlag: false
                    },
                    {
                        updateXHelper: function (x) { return nucleotideHTML.setAttribute('x', '' + x); },
                        updateYHelper: function (y) { return nucleotideHTML.setAttribute('y', '' + y); },
                        cache: {
                            x: parseFloat(nucleotideHTML.getAttribute('x')),
                            y: parseFloat(nucleotideHTML.getAttribute('y'))
                        },
                        invertYFlag: false
                    },
                    {
                        updateXHelper: function (x) { return nucleotideBoundingBoxHTML.setAttribute('x', '' + x); },
                        updateYHelper: function (y) { return nucleotideBoundingBoxHTML.setAttribute('y', '' + y); },
                        cache: {
                            x: parseFloat(nucleotideBoundingBoxHTML.getAttribute('x')),
                            y: parseFloat(nucleotideBoundingBoxHTML.getAttribute('y'))
                        },
                        invertYFlag: true
                    }
                ];
                if (nucleotide.labelContent) {
                    var labelContentID = XRNA.labelContentID(nucleotideID), labelContentHTML_2 = document.getElementById(labelContentID), labelContentBoundingBoxHTML_1 = document.getElementById(XRNA.boundingBoxID(labelContentID));
                    coordinateMap.push({
                        updateXHelper: function (x) { return nucleotide.labelContent.x = x; },
                        updateYHelper: function (y) { return nucleotide.labelContent.y = y; },
                        cache: {
                            x: nucleotide.labelContent.x,
                            y: nucleotide.labelContent.y
                        },
                        invertYFlag: false
                    });
                    coordinateMap.push({
                        updateXHelper: function (x) { return labelContentHTML_2.setAttribute('x', '' + x); },
                        updateYHelper: function (y) { return labelContentHTML_2.setAttribute('y', '' + y); },
                        cache: {
                            x: parseFloat(labelContentHTML_2.getAttribute('x')),
                            y: parseFloat(labelContentHTML_2.getAttribute('y'))
                        },
                        invertYFlag: false
                    });
                    coordinateMap.push({
                        updateXHelper: function (x) { return labelContentBoundingBoxHTML_1.setAttribute('x', '' + x); },
                        updateYHelper: function (y) { return labelContentBoundingBoxHTML_1.setAttribute('y', '' + y); },
                        cache: {
                            x: parseFloat(labelContentBoundingBoxHTML_1.getAttribute('x')),
                            y: parseFloat(labelContentBoundingBoxHTML_1.getAttribute('y'))
                        },
                        invertYFlag: true
                    });
                }
                if (nucleotide.labelLine) {
                    var labelLineID = XRNA.labelLineID(nucleotideID), labelLineBodyID = XRNA.labelLineBodyID(labelLineID), labelLineCap0ID = XRNA.labelLineCap0ID(labelLineID), labelLineCap1ID = XRNA.labelLineCap1ID(labelLineID), labelLineHTML_2 = document.getElementById(labelLineID), labelLineBodyHTML = document.getElementById(labelLineBodyID), labelLineCap0HTML = document.getElementById(labelLineCap0ID), labelLineCap1HTML = document.getElementById(labelLineCap1ID);
                    coordinateMap.push({
                        updateXHelper: function (x) { return nucleotide.labelLine.v0.x = x; },
                        updateYHelper: function (y) { return nucleotide.labelLine.v0.y = y; },
                        cache: {
                            x: nucleotide.labelLine.v0.x,
                            y: nucleotide.labelLine.v0.y
                        },
                        invertYFlag: false
                    });
                    coordinateMap.push({
                        updateXHelper: function (x) { return nucleotide.labelLine.v1.x = x; },
                        updateYHelper: function (y) { return nucleotide.labelLine.v1.y = y; },
                        cache: {
                            x: nucleotide.labelLine.v1.x,
                            y: nucleotide.labelLine.v1.y
                        },
                        invertYFlag: false
                    });
                    coordinateMap.push({
                        updateXHelper: function (x) { return labelLineHTML_2.setAttribute('x1', '' + x); },
                        updateYHelper: function (y) { return labelLineHTML_2.setAttribute('y1', '' + y); },
                        cache: {
                            x: parseFloat(labelLineHTML_2.getAttribute('x1')),
                            y: parseFloat(labelLineHTML_2.getAttribute('y1'))
                        },
                        invertYFlag: true
                    });
                    coordinateMap.push({
                        updateXHelper: function (x) { return labelLineHTML_2.setAttribute('x2', '' + x); },
                        updateYHelper: function (y) { return labelLineHTML_2.setAttribute('y2', '' + y); },
                        cache: {
                            x: parseFloat(labelLineHTML_2.getAttribute('x2')),
                            y: parseFloat(labelLineHTML_2.getAttribute('y2'))
                        },
                        invertYFlag: true
                    });
                    [labelLineBodyHTML, labelLineCap0HTML, labelLineCap1HTML].forEach(function (htmlElement) {
                        var cacheCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(htmlElement.getAttribute('transform')), cacheX, cacheY;
                        if (cacheCoordinates) {
                            cacheX = parseFloat(cacheCoordinates[1]);
                            cacheY = parseFloat(cacheCoordinates[2]);
                        }
                        else {
                            cacheX = 0;
                            cacheY = 0;
                            htmlElement.setAttribute('transform', 'translate(0 0)');
                        }
                        coordinateMap.push({
                            updateXHelper: function (x) {
                                var transformCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(htmlElement.getAttribute('transform'));
                                htmlElement.setAttribute('transform', 'translate(' + x + ' ' + transformCoordinates[2] + ')');
                            },
                            updateYHelper: function (y) {
                                var transformCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(htmlElement.getAttribute('transform'));
                                htmlElement.setAttribute('transform', 'translate(' + transformCoordinates[1] + ' ' + y + ')');
                            },
                            cache: {
                                x: cacheX,
                                y: cacheY
                            },
                            invertYFlag: true
                        });
                    });
                }
                if (nucleotide.basePairIndex < 0) {
                    var centerXInputHTML_1 = document.createElement('input'), centerYInputHTML_1 = document.createElement('input');
                    centerXInputHTML_1.value = centerX.toFixed(2);
                    centerYInputHTML_1.value = centerY.toFixed(2);
                    centerXInputHTML_1.setAttribute('type', 'text');
                    centerYInputHTML_1.setAttribute('type', 'text');
                    var centerXUpdateHelper_1 = function (newCenterX) {
                        centerX = newCenterX;
                        var dx = newCenterX - cacheCenterX;
                        coordinateMap.forEach(function (coordinateMapI) {
                            coordinateMapI.updateXHelper(coordinateMapI.cache.x + dx);
                        });
                    }, centerYUpdateHelper_1 = function (newCenterY) {
                        centerY = newCenterY;
                        var dy = newCenterY - cacheCenterY;
                        coordinateMap.forEach(function (coordinateMapI) {
                            coordinateMapI.updateYHelper(coordinateMapI.invertYFlag ? coordinateMapI.cache.y - dy : coordinateMapI.cache.y + dy);
                        });
                    };
                    centerXInputHTML_1.onchange = function () { return centerXUpdateHelper_1(parseFloat(centerXInputHTML_1.value)); };
                    centerYInputHTML_1.onchange = function () { return centerYUpdateHelper_1(parseFloat(centerYInputHTML_1.value)); };
                    contextMenuHTML.appendChild(createTextElement('Center X: '));
                    contextMenuHTML.appendChild(centerXInputHTML_1);
                    var xIncrementButton = document.createElement('button'), xDecrementButton = document.createElement('button');
                    xIncrementButton.textContent = '+';
                    xDecrementButton.textContent = '-';
                    xIncrementButton.onclick = function () {
                        var newCenterX = centerX + 0.5;
                        centerXUpdateHelper_1(newCenterX);
                        centerXInputHTML_1.value = newCenterX.toFixed(2);
                    };
                    xDecrementButton.onclick = function () {
                        var newCenterX = centerX - 0.5;
                        centerXUpdateHelper_1(newCenterX);
                        centerXInputHTML_1.value = newCenterX.toFixed(2);
                    };
                    contextMenuHTML.appendChild(xDecrementButton);
                    contextMenuHTML.appendChild(xIncrementButton);
                    contextMenuHTML.appendChild(document.createElement('br'));
                    contextMenuHTML.appendChild(createTextElement('Center Y: '));
                    contextMenuHTML.appendChild(centerYInputHTML_1);
                    var yIncrementButton = document.createElement('button'), yDecrementButton = document.createElement('button');
                    yIncrementButton.textContent = '+';
                    yDecrementButton.textContent = '-';
                    yIncrementButton.onclick = function () {
                        var newCenterY = centerY + 0.5;
                        centerYUpdateHelper_1(newCenterY);
                        centerYInputHTML_1.value = newCenterY.toFixed(2);
                    };
                    yDecrementButton.onclick = function () {
                        var newCenterY = centerY - 0.5;
                        centerYUpdateHelper_1(newCenterY);
                        centerYInputHTML_1.value = newCenterY.toFixed(2);
                    };
                    contextMenuHTML.appendChild(yDecrementButton);
                    contextMenuHTML.appendChild(yIncrementButton);
                    contextMenuHTML.appendChild(document.createElement('br'));
                }
                else {
                    contextMenuHTML.appendChild(createTextElement('Center X: ' + centerX.toFixed(2)));
                    contextMenuHTML.appendChild(document.createElement('br'));
                    contextMenuHTML.appendChild(createTextElement('Center Y: ' + centerY.toFixed(2)));
                    contextMenuHTML.appendChild(document.createElement('br'));
                }
            };
            return class_6;
        }(SelectionConstraint)),
        'RNA Single Strand': new /** @class */ (function (_super) {
            __extends(class_7, _super);
            function class_7() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_7.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex < 0;
            };
            class_7.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, adjacentNucleotideIndices = new Array();
                for (var adjacentNucleotideIndex = nucleotideIndex - 1; adjacentNucleotideIndex >= 0 && nucleotides[adjacentNucleotideIndex].basePairIndex < 0; adjacentNucleotideIndex--) {
                    adjacentNucleotideIndices.push({
                        rnaComplexIndex: rnaComplexIndex,
                        rnaMoleculeIndex: rnaMoleculeIndex,
                        nucleotideIndex: adjacentNucleotideIndex
                    });
                }
                adjacentNucleotideIndices.push({
                    rnaComplexIndex: rnaComplexIndex,
                    rnaMoleculeIndex: rnaMoleculeIndex,
                    nucleotideIndex: nucleotideIndex
                });
                for (var adjacentNucleotideIndex = nucleotideIndex + 1; adjacentNucleotideIndex < nucleotides.length && nucleotides[adjacentNucleotideIndex].basePairIndex < 0; adjacentNucleotideIndex++) {
                    adjacentNucleotideIndices.push({
                        rnaComplexIndex: rnaComplexIndex,
                        rnaMoleculeIndex: rnaMoleculeIndex,
                        nucleotideIndex: adjacentNucleotideIndex
                    });
                }
                return adjacentNucleotideIndices;
            };
            class_7.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide without a base pair', 'a non-base-paired nucleotide');
            };
            class_7.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_7;
        }(SelectionConstraint)),
        'RNA Single Base Pair': new /** @class */ (function (_super) {
            __extends(class_8, _super);
            function class_8() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_8.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                // Special case: base-paired immediately adjacent nucleotides.
                return basePairIndex >= 0 && (Math.abs(nucleotideIndex - basePairIndex) == 1 || ((nucleotideIndex == 0 || nucleotides[nucleotideIndex - 1].basePairIndex != basePairIndex + 1) && (nucleotideIndex == nucleotides.length - 1 || nucleotides[nucleotideIndex + 1].basePairIndex != basePairIndex - 1)));
            };
            class_8.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var selectedNucleotideIndices = new Array(), nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, basePairedIndex = nucleotides[nucleotideIndex].basePairIndex;
                selectedNucleotideIndices.push({
                    rnaComplexIndex: rnaComplexIndex,
                    rnaMoleculeIndex: rnaMoleculeIndex,
                    nucleotideIndex: nucleotideIndex
                });
                selectedNucleotideIndices.push({
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
            class_8.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide with a base pair and no contiguous base pairs', 'a base-paired nucleotide outside a series of base pairs');
            };
            class_8.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_8;
        }(SelectionConstraint)),
        'RNA Helix': new /** @class */ (function (_super) {
            __extends(class_9, _super);
            function class_9() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_9.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            };
            class_9.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
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
            class_9.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide with a base pair', 'a base-paired nucleotide');
            };
            class_9.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_9;
        }(SelectionConstraint)),
        'RNA Stacked Helix': new /** @class */ (function (_super) {
            __extends(class_10, _super);
            function class_10() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_10.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
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
            class_10.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var _this = this;
                this.getSelectedNucleotideIndicesHelper(rnaComplexIndex, rnaMoleculeIndex, function () { return _this.adjacentNucleotideIndex0--; }, function () { return _this.adjacentNucleotideIndex1++; }, function (nucleotides) { return _this.adjacentNucleotideIndex0 < 0 || _this.adjacentNucleotideIndex1 >= nucleotides.length; });
                return this.adjacentNucleotideIndices;
            };
            class_10.prototype.getSelectedNucleotideIndicesHelper = function (rnaComplexIndex, rnaMoleculeIndex, adjacentNucleotideIndex0Incrementer, adjacentNucleotideIndex1Incrementer, adjacentNucleotideIndicesAreOutsideBoundsChecker) {
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
            class_10.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a base-paired nucleotide within a stacked helix', 'a base-paired nucleotide with proximate nucleotides on either side exclusively bonded to the other');
            };
            class_10.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_10;
        }(SelectionConstraint)),
        'RNA Sub-domain': new /** @class */ (function (_super) {
            __extends(class_11, _super);
            function class_11() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_11.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            };
            class_11.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
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
            class_11.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide with a base pair', 'a base-paired nucleotide');
            };
            class_11.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_11;
        }(SelectionConstraint)),
        'RNA Cycle': new /** @class */ (function (_super) {
            __extends(class_12, _super);
            function class_12() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_12.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_12.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
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
            class_12.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            class_12.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_12;
        }(SelectionConstraint)),
        'RNA List Nucs': new /** @class */ (function (_super) {
            __extends(class_13, _super);
            function class_13() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_13.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return false;
            };
            class_13.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error("This code should be unreachable.");
            };
            class_13.prototype.getErrorMessage = function () {
                return "This selection constraint is not used for left-click nucleotide selection.";
            };
            class_13.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_13;
        }(SelectionConstraint)),
        'RNA Strand': new /** @class */ (function (_super) {
            __extends(class_14, _super);
            function class_14() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_14.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_14.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var adjacentNucleotideIndices = new Array(), nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaComplexIndex].nucleotides;
                for (var adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                }
                return adjacentNucleotideIndices;
            };
            class_14.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            class_14.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_14;
        }(SelectionConstraint)),
        'RNA Color Unit': new /** @class */ (function (_super) {
            __extends(class_15, _super);
            function class_15() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_15.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_15.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, color = nucleotides[nucleotideIndex].color, adjacentNucleotideIndices = new Array();
                for (var adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    var adjacentNucleotideColor = nucleotides[adjacentNucleotideIndex].color;
                    if (adjacentNucleotideColor.red == color.red && adjacentNucleotideColor.green == color.green && adjacentNucleotideColor.blue == color.blue) {
                        adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                    }
                }
                return adjacentNucleotideIndices;
            };
            class_15.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            class_15.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_15;
        }(SelectionConstraint)),
        'RNA Named Group': new /** @class */ (function (_super) {
            __extends(class_16, _super);
            function class_16() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_16.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                // For now, named-group support is not implemented.
                return false;
            };
            class_16.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error("This code should be unreachable.");
            };
            class_16.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide within a named group', 'a nucleotide within a named group');
            };
            class_16.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_16;
        }(SelectionConstraint)),
        'RNA Strand Group': new /** @class */ (function (_super) {
            __extends(class_17, _super);
            function class_17() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_17.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_17.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var strandNucleotideIndices = new Array(), rnaComplex = XRNA.rnaComplexes[rnaComplexIndex];
                for (var rnaMoleculeIndex_1 = 0; rnaMoleculeIndex_1 < rnaComplex.rnaMolecules.length; rnaMoleculeIndex_1++) {
                    var nucleotides = rnaComplex.rnaMolecules[rnaMoleculeIndex_1].nucleotides;
                    for (var nucleotideIndex_1 = 0; nucleotideIndex_1 < nucleotides.length; nucleotideIndex_1++) {
                        strandNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex_1, nucleotideIndex: nucleotideIndex_1 });
                    }
                }
                return strandNucleotideIndices;
            };
            class_17.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            class_17.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_17;
        }(SelectionConstraint)),
        'Labels Only': new /** @class */ (function (_super) {
            __extends(class_18, _super);
            function class_18() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_18.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_18.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                // Select no nucleotides, but do not produce an error.
                // This replicates XRNA-GT behavior.
                return [];
            };
            class_18.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            class_18.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_18;
        }(SelectionConstraint)),
        'Entire Scene': new /** @class */ (function (_super) {
            __extends(class_19, _super);
            function class_19() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_19.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_19.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                // Select no indices.
                return [];
            };
            class_19.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            class_19.prototype.populateContextMenu = function (contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error('Not implemented.');
            };
            return class_19;
        }(SelectionConstraint))
    };
    XRNA.sceneBounds = {
        minimumX: null,
        maximumX: null,
        minimumY: null,
        maximumY: null
    };
    // buttonIndex is always equal to the current mouse button(s) (see BUTTON_INDEX) depressed within the canvas.
    XRNA.buttonIndex = BUTTON_INDEX.NONE;
    XRNA.selection = {
        highlighted: new Array(),
        selected: new Array(),
        dragOrigin: {
            x: 0,
            y: 0
        }
    };
    return XRNA;
}());
exports.XRNA = XRNA;
