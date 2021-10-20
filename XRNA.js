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
exports.XRNA = void 0;
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
        this.x = x;
        this.y = y;
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
        XRNA.canvasHTML.onmousedown = function (event) {
            var newButtonIndex = XRNA.getButtonIndex(event), pressedButtonIndex = newButtonIndex - XRNA.buttonIndex;
            XRNA.buttonIndex = newButtonIndex;
            if (pressedButtonIndex & BUTTON_INDEX.LEFT) {
                if (XRNA.selection.selected.length > 0) {
                    XRNA.selection.dragCoordinates.origin.x = event.pageX;
                    XRNA.selection.dragCoordinates.origin.y = event.pageY;
                }
            }
            if (pressedButtonIndex & BUTTON_INDEX.RIGHT) {
                XRNA.sceneDressingData.dragCoordinates.origin.x = event.pageX;
                XRNA.sceneDressingData.dragCoordinates.origin.y = event.pageY;
            }
            return false;
        };
        XRNA.canvasHTML.onmouseup = function (event) {
            var newButtonIndex = XRNA.getButtonIndex(event), releasedButtonIndex = XRNA.buttonIndex - newButtonIndex;
            XRNA.buttonIndex = newButtonIndex;
            if (releasedButtonIndex & BUTTON_INDEX.LEFT) {
                XRNA.selection.selected.forEach(function (selectedI) {
                    // This code is important in clicking and dragging text elements around the scene.
                    // Do not remove it.
                    selectedI.boundingBoxes.forEach(function (boundingBox) { return boundingBox.setAttribute('transform', ' ' + boundingBox.getAttribute('transform')); });
                    selectedI.htmlElements.forEach(function (htmlElement) { return htmlElement.setAttribute('transform', ' ' + htmlElement.getAttribute('transform')); });
                    if (selectedI.textElement) {
                        var transform = selectedI.textElement.getAttribute('transform'), transformComponents = /^(?:translate\([^\)]+\))? translate\((-?[\d\.]+) (-?[\d\.]+)\)(.+)$/.exec(transform);
                        selectedI.textElement.setAttribute('transform', ' translate(' + (parseFloat(transformComponents[1]) + XRNA.selection.dx) + ' ' + (parseFloat(transformComponents[2]) + XRNA.selection.dy) + ')' + transformComponents[3]);
                    }
                    selectedI.elements.forEach(function (element) {
                        element.x += XRNA.selection.dx;
                        element.y += XRNA.selection.dy;
                    });
                    selectedI.onMouseUpAttributeUpdateHelpers.forEach(function (attributeUpdateHelper) {
                        attributeUpdateHelper.htmlElement.setAttribute(attributeUpdateHelper.attribute, attributeUpdateHelper.helper(XRNA.selection.dx, XRNA.selection.dy));
                    });
                });
            }
            if (releasedButtonIndex & BUTTON_INDEX.RIGHT) {
                XRNA.sceneDressingData.dragCoordinates.cacheOrigin.x = XRNA.sceneDressingData.origin.x;
                XRNA.sceneDressingData.dragCoordinates.cacheOrigin.y = XRNA.sceneDressingData.origin.y;
            }
            return false;
        };
        XRNA.canvasHTML.onmousemove = function (event) {
            if (XRNA.buttonIndex & BUTTON_INDEX.LEFT) {
                var scale = XRNA.sceneDressingData.scale * XRNA.sceneScale;
                XRNA.selection.dx = (event.pageX - XRNA.selection.dragCoordinates.origin.x) / scale,
                    XRNA.selection.dy = -(event.pageY - XRNA.selection.dragCoordinates.origin.y) / scale;
                XRNA.selection.selected.forEach(function (selectedI) {
                    var transformHelper = function (htmlElement) {
                        var transform = htmlElement.getAttribute('transform');
                        htmlElement.setAttribute('transform', 'translate(' + XRNA.selection.dx + ',' + XRNA.selection.dy + ')' + transform.substring(transform.indexOf(' ')));
                    };
                    selectedI.boundingBoxes.forEach(function (boundingBox) {
                        transformHelper(boundingBox);
                    });
                    selectedI.htmlElements.forEach(function (htmlElement) {
                        transformHelper(htmlElement);
                    });
                    if (selectedI.textElement) {
                        transformHelper(selectedI.textElement);
                    }
                    selectedI.onMouseMoveAttributeUpdateHelpers.forEach(function (attributeUpdateHelper) {
                        attributeUpdateHelper.htmlElement.setAttribute(attributeUpdateHelper.attribute, attributeUpdateHelper.helper(XRNA.selection.dx, XRNA.selection.dy));
                    });
                });
            }
            if (XRNA.buttonIndex & BUTTON_INDEX.RIGHT) {
                XRNA.sceneDressingData.origin.x = XRNA.sceneDressingData.dragCoordinates.cacheOrigin.x + event.pageX - XRNA.sceneDressingData.dragCoordinates.origin.x;
                XRNA.sceneDressingData.origin.y = XRNA.sceneDressingData.dragCoordinates.cacheOrigin.y + event.pageY - XRNA.sceneDressingData.dragCoordinates.origin.y;
                XRNA.updateSceneDressing();
            }
            return false;
        };
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
        // Clear the previous selection
        XRNA.selection.selected.forEach(function (selectedI) { return selectedI.boundingBoxes.forEach(function (boundingBox) { return boundingBox.setAttribute('stroke', 'none'); }); });
        XRNA.selection.selected = [];
    };
    XRNA.resetView = function () {
        XRNA.sceneDressingData.origin.x = 0;
        XRNA.sceneDressingData.origin.y = 0;
        XRNA.sceneDressingData.dragCoordinates.cacheOrigin.x = 0;
        XRNA.sceneDressingData.dragCoordinates.cacheOrigin.y = 0;
        XRNA.sceneDressingData.zoom = 0;
        XRNA.updateSceneDressing();
        document.getElementById('zoom slider').value = XRNA.sceneDressingData.zoom;
    };
    XRNA.setZoom = function (zoom) {
        XRNA.sceneDressingData.zoom = XRNA.clamp(XRNA.sceneDressingData.minimumZoom, zoom, XRNA.sceneDressingData.maximumZoom);
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
    XRNA.clamp = function (minimum, value, maximum) {
        return Math.min(Math.max(minimum, value), maximum);
    };
    XRNA.applyHelperFunctionsToRefIDs = function (refIDs, helperFunctions) {
        refIDs.forEach(function (refIDPair) {
            for (var refIndex = refIDPair[0]; refIndex <= refIDPair[1]; refIndex++) {
                var nucleotide = XRNA.rnaComplexes.at(-1).rnaMolecules.at(-1).nucleotides[refIndex];
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
                    xrnaFrontHalf += nucleotide.symbol + ' ' + nucleotide.x + ' ' + nucleotide.y + '\n';
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
    XRNA.getBoundingBox = function (htmlElement) {
        var boundingBox = htmlElement.getBoundingClientRect();
        boundingBox.y -= XRNA.canvasBounds.y;
        return boundingBox;
    };
    XRNA.getBoundingBoxHTML = function (boundingBox, parentID) {
        var boundingBoxHTML = document.createElementNS(svgNameSpaceURL, 'rect');
        boundingBoxHTML.setAttribute('id', XRNA.boundingBoxID(parentID));
        // This is used when clicking and dragging elements around the scene.
        // Do not remove it.
        boundingBoxHTML.setAttribute('transform', ' ');
        boundingBoxHTML.setAttribute('x', '' + boundingBox.x);
        boundingBoxHTML.setAttribute('y', '' + boundingBox.y);
        boundingBoxHTML.setAttribute('width', '' + boundingBox.width);
        boundingBoxHTML.setAttribute('height', '' + boundingBox.height);
        boundingBoxHTML.setAttribute('stroke', 'none');
        boundingBoxHTML.setAttribute('fill', 'none');
        return boundingBoxHTML;
    };
    XRNA.complexID = function (rnaComplexIndex) {
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
    XRNA.linearlyInterpolate = function (x0, x1, interpolationFactor) {
        // See https://en.wikipedia.org/wiki/Linear_interpolation
        return (1 - interpolationFactor) * x0 + interpolationFactor * x1;
    };
    XRNA.invertYTransform = function (y) {
        // The space at the beginning is used when clicking text elements to move them around the scene. 
        // Do not remove it.
        return ' translate(0 ' + y + ') scale(1 -1) translate(0 ' + -y + ')';
    };
    XRNA.magnitudeSquared = function (x, y) {
        return x * x + y * y;
    };
    XRNA.magnitude = function (x, y) {
        return Math.sqrt(XRNA.magnitudeSquared(x, y));
    };
    XRNA.distanceSquared = function (x0, y0, x1, y1) {
        return XRNA.magnitudeSquared(x1 - x0, y1 - y0);
    };
    XRNA.distance = function (x0, y0, x1, y1) {
        return Math.sqrt(XRNA.distanceSquared(x0, y0, x1, y1));
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
    XRNA.onClickLabel = function (labelHTML) {
        XRNA.resetSelection();
        var boundingBoxHTML = document.getElementById(XRNA.boundingBoxID(labelHTML.getAttribute('id'))), id = labelHTML.id, indices = id.match(/#\d+/g), rnaComplexIndex = parseInt(indices[0].substring(1)), rnaMoleculeIndex = parseInt(indices[1].substring(1)), nucleotideIndex = parseInt(indices[2].substring(1)), nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex], elements = new Array(), boundingBoxes = [
            boundingBoxHTML
        ], htmlElements = [], textElement = null, labelLineID = id.substring(0, id.lastIndexOf(':')), cap0ID = XRNA.labelLineCap0ID(labelLineID), cap1ID = XRNA.labelLineCap1ID(labelLineID), bodyID = XRNA.labelLineBodyID(labelLineID), onMouseMoveAttributeUpdateHelpers = new Array(), onMouseUpAttributeUpdateHelpers = new Array(), cap0 = document.getElementById(cap0ID), body = document.getElementById(bodyID), cap1 = document.getElementById(cap1ID), cap0BoundingBox = document.getElementById(XRNA.boundingBoxID(cap0ID)), cap1BoundingBox = document.getElementById(XRNA.boundingBoxID(cap1ID)), bodyBoundingBox = document.getElementById(XRNA.boundingBoxID(bodyID));
        if (indices.length > 3) {
            // Select a single label-line endpoint.
            var htmlElement = document.getElementById(labelLineID), x1_1 = parseFloat(htmlElement.getAttribute('x1')), y1_1 = parseFloat(htmlElement.getAttribute('y1')), x2_1 = parseFloat(htmlElement.getAttribute('x2')), y2_1 = parseFloat(htmlElement.getAttribute('y2')), paths_1, boundingBox_1;
            switch (indices[3].substring(1)) {
                case '0': {
                    elements = [
                        nucleotide.labelLine.v0
                    ];
                    onMouseMoveAttributeUpdateHelpers.push({ htmlElement: htmlElement, attribute: 'x1', helper: function (dx, dy) { return '' + (x1_1 + dx); } });
                    onMouseMoveAttributeUpdateHelpers.push({ htmlElement: htmlElement, attribute: 'y1', helper: function (dx, dy) { return '' + (y1_1 + dy); } });
                    onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap0, attribute: 'd', helper: function (dx, dy) {
                            paths_1 = XRNA.getPathsFromLine(x1_1 + dx, y1_1 + dy, x2_1, y2_1);
                            return paths_1.cap0Path;
                        } });
                    break;
                }
                case '1': {
                    elements = [
                        nucleotide.labelLine.v1
                    ];
                    onMouseMoveAttributeUpdateHelpers.push({ htmlElement: htmlElement, attribute: 'x2', helper: function (dx, dy) { return '' + (x2_1 + dx); } });
                    onMouseMoveAttributeUpdateHelpers.push({ htmlElement: htmlElement, attribute: 'y2', helper: function (dx, dy) { return '' + (y2_1 + dy); } });
                    onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap0, attribute: 'd', helper: function (dx, dy) {
                            paths_1 = XRNA.getPathsFromLine(x1_1, y1_1, x2_1 + dx, y2_1 + dy);
                            return paths_1.cap0Path;
                        } });
                    break;
                }
            }
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: body, attribute: 'd', helper: function (dx, dy) {
                    return paths_1.bodyPath;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap1, attribute: 'd', helper: function (dx, dy) {
                    return paths_1.cap1Path;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap0BoundingBox, attribute: 'x', helper: function (dx, dy) {
                    boundingBox_1 = XRNA.getBoundingBox(cap0);
                    return '' + boundingBox_1.x;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap0BoundingBox, attribute: 'y', helper: function (dx, dy) {
                    return '' + boundingBox_1.y;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap0BoundingBox, attribute: 'width', helper: function (dx, dy) {
                    return '' + boundingBox_1.width;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap0BoundingBox, attribute: 'height', helper: function (dx, dy) {
                    return '' + boundingBox_1.height;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: bodyBoundingBox, attribute: 'x', helper: function (dx, dy) {
                    boundingBox_1 = XRNA.getBoundingBox(body);
                    return '' + boundingBox_1.x;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: bodyBoundingBox, attribute: 'y', helper: function (dx, dy) {
                    return '' + boundingBox_1.y;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: bodyBoundingBox, attribute: 'width', helper: function (dx, dy) {
                    return '' + boundingBox_1.width;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: bodyBoundingBox, attribute: 'height', helper: function (dx, dy) {
                    return '' + boundingBox_1.height;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap1BoundingBox, attribute: 'x', helper: function (dx, dy) {
                    boundingBox_1 = XRNA.getBoundingBox(cap1);
                    return '' + boundingBox_1.x;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap1BoundingBox, attribute: 'y', helper: function (dx, dy) {
                    return '' + boundingBox_1.y;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap1BoundingBox, attribute: 'width', helper: function (dx, dy) {
                    return '' + boundingBox_1.width;
                } });
            onMouseUpAttributeUpdateHelpers.push({ htmlElement: cap1BoundingBox, attribute: 'height', helper: function (dx, dy) {
                    return '' + boundingBox_1.height;
                } });
        }
        else if (/(?:B|b)ody/.test(id)) {
            // Select both label-line endpoints.
            elements = [
                nucleotide.labelLine.v0,
                nucleotide.labelLine.v1
            ];
            // The entire line is selected. The line will move as one shape.
            boundingBoxes.push(cap0BoundingBox);
            boundingBoxes.push(cap1BoundingBox);
            htmlElements.push(cap0);
            htmlElements.push(cap1);
            htmlElements.push(body);
            htmlElements.push(document.getElementById(labelLineID));
        }
        else {
            textElement = labelHTML;
            elements = [
                nucleotide.labelContent
            ];
        }
        XRNA.selection.selected.push({
            boundingBoxes: boundingBoxes,
            htmlElements: htmlElements,
            textElement: textElement,
            elements: elements,
            onMouseMoveAttributeUpdateHelpers: onMouseMoveAttributeUpdateHelpers,
            onMouseUpAttributeUpdateHelpers: onMouseUpAttributeUpdateHelpers
        });
        boundingBoxes.forEach(function (boundingBoxHTML) { return boundingBoxHTML.setAttribute('stroke', 'red'); });
    };
    XRNA.onClickNucleotide = function (nucleotideHTML) {
        XRNA.resetSelection();
        var indices = nucleotideHTML.id.match(/#\d+/g), rnaComplexIndex = parseInt(indices[0].substring(1)), rnaMoleculeIndex = parseInt(indices[1].substring(1)), nucleotideIndex = parseInt(indices[2].substring(1)), selectionConstraint = XRNA.selectionConstraintDescriptionDictionary[XRNA.selectionConstraintHTML.value];
        if (selectionConstraint.approveSelectedIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex)) {
            selectionConstraint.getSelectedNucleotideIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex).forEach(function (adjacentNucleotideIndices) {
                var rnaComplexIndex = adjacentNucleotideIndices.rnaComplexIndex, rnaMoleculeIndex = adjacentNucleotideIndices.rnaMoleculeIndex, nucleotideIndex = adjacentNucleotideIndices.nucleotideIndex, nucleotideID = XRNA.nucleotideID(XRNA.rnaMoleculeID(XRNA.complexID(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex), nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex];
                XRNA.selection.selected.push({
                    boundingBoxes: [
                        document.getElementById(XRNA.boundingBoxID(nucleotideID))
                    ],
                    htmlElements: [],
                    textElement: document.getElementById(nucleotideID),
                    elements: [
                        nucleotide
                    ],
                    onMouseMoveAttributeUpdateHelpers: [],
                    onMouseUpAttributeUpdateHelpers: []
                });
                if (nucleotide.labelContent) {
                    var labelContentID = XRNA.labelContentID(nucleotideID);
                    XRNA.selection.selected.push({
                        boundingBoxes: [
                            document.getElementById(XRNA.boundingBoxID(labelContentID))
                        ],
                        htmlElements: [],
                        textElement: document.getElementById(labelContentID),
                        elements: [
                            nucleotide.labelContent
                        ],
                        onMouseMoveAttributeUpdateHelpers: [],
                        onMouseUpAttributeUpdateHelpers: []
                    });
                }
                if (nucleotide.labelLine) {
                    var labelLineID = XRNA.labelLineID(nucleotideID), cap0ID = XRNA.labelLineCap0ID(labelLineID), bodyID = XRNA.labelLineBodyID(labelLineID), cap1ID = XRNA.labelLineCap1ID(labelLineID);
                    XRNA.selection.selected.push({
                        boundingBoxes: [
                            document.getElementById(XRNA.boundingBoxID(cap0ID)),
                            document.getElementById(XRNA.boundingBoxID(bodyID)),
                            document.getElementById(XRNA.boundingBoxID(cap1ID))
                        ],
                        htmlElements: [
                            document.getElementById(labelLineID),
                            document.getElementById(cap0ID),
                            document.getElementById(bodyID),
                            document.getElementById(cap1ID)
                        ],
                        textElement: null,
                        elements: [
                            nucleotide.labelLine.v0,
                            nucleotide.labelLine.v1
                        ],
                        onMouseMoveAttributeUpdateHelpers: [],
                        onMouseUpAttributeUpdateHelpers: []
                    });
                }
                XRNA.selection.selected.forEach(function (selectedI) { return selectedI.boundingBoxes.forEach(function (boundingBox) { return boundingBox.setAttribute('stroke', 'red'); }); });
            });
        }
        else {
            alert(selectionConstraint.getErrorMessage());
        }
    };
    XRNA.getPathsFromLine = function (x0, y0, x1, y1) {
        var dx = x1 - x0, dy = y1 - y0, interpolation0X = XRNA.linearlyInterpolate(x0, x1, 0.25), interpolation0Y = XRNA.linearlyInterpolate(y0, y1, 0.25), interpolation1X = XRNA.linearlyInterpolate(x0, x1, 0.75), interpolation1Y = XRNA.linearlyInterpolate(y0, y1, 0.75), clickableScalar = 1, magnitude = XRNA.magnitude(dx, dy);
        dx /= magnitude;
        dy /= magnitude;
        var interpolation0Translated0 = { x: interpolation0X - dy * clickableScalar, y: interpolation0Y + dx * clickableScalar }, interpolation0Translated1 = { x: interpolation0X + dy * clickableScalar, y: interpolation0Y - dx * clickableScalar }, interpolation1Translated0 = { x: interpolation1X - dy * clickableScalar, y: interpolation1Y + dx * clickableScalar }, interpolation1Translated1 = { x: interpolation1X + dy * clickableScalar, y: interpolation1Y - dx * clickableScalar };
        return {
            cap0Path: 'M ' + interpolation0Translated1.x + ' ' + interpolation0Translated1.y + ' L ' + (x0 + dy * clickableScalar) + ' ' + (y0 - dx * clickableScalar) + ' a 0.5 0.5 0 0 0 ' + (-2 * dy * clickableScalar) + ' ' + (2 * dx * clickableScalar) + ' L ' + interpolation0Translated0.x + ' ' + interpolation0Translated0.y + ' z',
            bodyPath: 'M ' + interpolation0Translated0.x + ' ' + interpolation0Translated0.y + ' L ' + interpolation1Translated0.x + ' ' + interpolation1Translated0.y + ' L ' + interpolation1Translated1.x + ' ' + interpolation1Translated1.y + ' L ' + interpolation0Translated1.x + ' ' + interpolation0Translated1.y + ' z',
            cap1Path: 'M ' + interpolation1Translated0.x + ' ' + interpolation1Translated0.y + ' L ' + (x1 - dy * clickableScalar) + ' ' + (y1 + dx * clickableScalar) + ' a 0.5 0.5 0 0 0 ' + (2 * dy * clickableScalar) + ' ' + (-2 * dx * clickableScalar) + ' L ' + interpolation1Translated1.x + ' ' + interpolation1Translated1.y + ' z'
        };
    };
    XRNA.prepareScene = function () {
        var sceneDressingHTML = document.getElementById('sceneDressing');
        sceneDressingHTML.setAttribute('id', 'sceneDressing');
        while (sceneDressingHTML.firstChild) {
            sceneDressingHTML.removeChild(sceneDressingHTML.firstChild);
        }
        document.getElementById('background').setAttribute('onmousedown', 'XRNA.resetSelection();');
        XRNA.canvasHTML.appendChild(sceneDressingHTML);
        var sceneHTML = document.createElementNS(svgNameSpaceURL, 'g');
        sceneHTML.setAttribute('id', 'scene');
        sceneDressingHTML.appendChild(sceneHTML);
        XRNA.sceneBounds.minimumX = Number.MAX_VALUE,
            XRNA.sceneBounds.maximumX = -Number.MAX_VALUE,
            XRNA.sceneBounds.minimumY = Number.MAX_VALUE,
            XRNA.sceneBounds.maximumY = -Number.MAX_VALUE;
        for (var rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            var complex = XRNA.rnaComplexes[rnaComplexIndex], complexID = XRNA.complexID(rnaComplexIndex);
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
                    nucleotideHTML.setAttribute('x', '' + nucleotide.x);
                    nucleotideHTML.setAttribute('y', '' + nucleotide.y);
                    var nucleotideColor = nucleotide.color;
                    nucleotideHTML.setAttribute('stroke', 'rgb(' + nucleotideColor.red + ' ' + nucleotideColor.green + ' ' + nucleotideColor.blue + ')');
                    nucleotideHTML.setAttribute('font-size', '' + nucleotide.font.size);
                    nucleotideHTML.setAttribute('font-family', nucleotide.font.family);
                    nucleotideHTML.setAttribute('font-style', nucleotide.font.style);
                    nucleotideHTML.setAttribute('font-weight', nucleotide.font.weight);
                    nucleotideHTML.setAttribute('transform', XRNA.invertYTransform(nucleotide.y));
                    nucleotideHTML.setAttribute('onclick', 'XRNA.onClickNucleotide(this);');
                    rnaMoleculeHTML.appendChild(nucleotideHTML);
                    var boundingBoxes = new Array(), nucleotideBoundingBox = XRNA.getBoundingBox(nucleotideHTML), boundingBoxHTML = XRNA.getBoundingBoxHTML(nucleotideBoundingBox, nucleotideID);
                    boundingBoxesHTML.appendChild(boundingBoxHTML);
                    boundingBoxes.push(nucleotideBoundingBox);
                    var nucleotideBoundingBoxCenterX = nucleotideBoundingBox.x + nucleotideBoundingBox.width / 2.0, nucleotideBoundingBoxCenterY = nucleotideBoundingBox.y + nucleotideBoundingBox.height / 2.0;
                    if (nucleotide.labelLine) {
                        var labelLineHTML = document.createElementNS(svgNameSpaceURL, 'line'), labelLineClickableBodyHTML = document.createElementNS(svgNameSpaceURL, 'path'), labelLineClickableCap0HTML = document.createElementNS(svgNameSpaceURL, 'path'), labelLineClickableCap1HTML = document.createElementNS(svgNameSpaceURL, 'path'), labelLine = nucleotide.labelLine, x0 = nucleotideBoundingBoxCenterX + labelLine.v0.x, y0 = nucleotideBoundingBoxCenterY + labelLine.v0.y, x1 = nucleotideBoundingBoxCenterX + labelLine.v1.x, y1 = nucleotideBoundingBoxCenterY + labelLine.v1.y, paths = XRNA.getPathsFromLine(x0, y0, x1, y1), lineColor = labelLine.color, labelLineID = XRNA.labelLineID(nucleotideID), labelLineBodyID = XRNA.labelLineBodyID(labelLineID), labelLineCap0ID = XRNA.labelLineCap0ID(labelLineID), labelLineCap1ID = XRNA.labelLineCap1ID(labelLineID);
                        labelLineClickableBodyHTML.setAttribute('d', paths.bodyPath);
                        labelLineClickableBodyHTML.setAttribute('id', '' + labelLineBodyID);
                        labelLineClickableBodyHTML.setAttribute('onclick', 'XRNA.onClickLabel(this);');
                        // labelLineClickableBodyHTML.setAttribute('visibility', 'hidden');
                        labelLineClickableBodyHTML.setAttribute('fill', 'red');
                        // This is important in dragging elements around the scene.
                        // Do not remove it.
                        labelLineClickableBodyHTML.setAttribute('transform', ' ');
                        labelLineClickableBodyHTML.setAttribute('pointer-events', 'all');
                        labelLinesGroupHTML.appendChild(labelLineClickableBodyHTML);
                        labelLineClickableCap0HTML.setAttribute('d', paths.cap0Path);
                        labelLineClickableCap0HTML.setAttribute('id', '' + labelLineCap0ID);
                        labelLineClickableCap0HTML.setAttribute('onclick', 'XRNA.onClickLabel(this);');
                        // labelLineClickableCap0HTML.setAttribute('visibility', 'hidden');
                        labelLineClickableCap0HTML.setAttribute('fill', 'green');
                        // This is important in dragging elements around the scene.
                        // Do not remove it.
                        labelLineClickableCap0HTML.setAttribute('transform', ' ');
                        labelLineClickableCap0HTML.setAttribute('pointer-events', 'all');
                        labelLinesGroupHTML.appendChild(labelLineClickableCap0HTML);
                        labelLineClickableCap1HTML.setAttribute('d', paths.cap1Path);
                        labelLineClickableCap1HTML.setAttribute('id', '' + labelLineCap1ID);
                        labelLineClickableCap1HTML.setAttribute('onclick', 'XRNA.onClickLabel(this);');
                        // labelLineClickableCap1HTML.setAttribute('visibility', 'hidden');
                        labelLineClickableCap1HTML.setAttribute('fill', 'blue');
                        // This is important in dragging elements around the scene.
                        // Do not remove it.
                        labelLineClickableCap1HTML.setAttribute('transform', ' ');
                        labelLineClickableCap1HTML.setAttribute('pointer-events', 'all');
                        labelLinesGroupHTML.appendChild(labelLineClickableCap1HTML);
                        boundingBoxesHTML.appendChild(XRNA.getBoundingBoxHTML(XRNA.getBoundingBox(labelLineClickableBodyHTML), labelLineBodyID));
                        boundingBoxesHTML.appendChild(XRNA.getBoundingBoxHTML(XRNA.getBoundingBox(labelLineClickableCap0HTML), labelLineCap0ID));
                        boundingBoxesHTML.appendChild(XRNA.getBoundingBoxHTML(XRNA.getBoundingBox(labelLineClickableCap1HTML), labelLineCap1ID));
                        labelLineHTML.setAttribute('id', XRNA.labelLineID(nucleotideID));
                        labelLineHTML.setAttribute('id', '' + labelLineID);
                        labelLineHTML.setAttribute('x1', '' + x0);
                        labelLineHTML.setAttribute('y1', '' + y0);
                        labelLineHTML.setAttribute('x2', '' + x1);
                        labelLineHTML.setAttribute('y2', '' + y1);
                        // This is used in dragging elements around the scene.
                        // Do not remove it.
                        labelLineHTML.setAttribute('transform', ' ');
                        labelLineHTML.setAttribute('stroke-width', '' + labelLine.strokeWidth);
                        labelLineHTML.setAttribute('stroke', 'rgb(' + lineColor.red + ' ' + lineColor.green + ' ' + lineColor.blue + ')');
                        labelLineHTML.setAttribute('pointer-events', 'none');
                        labelLinesGroupHTML.appendChild(labelLineHTML);
                    }
                    if (nucleotide.labelContent) {
                        var labelContentHTML = document.createElementNS(svgNameSpaceURL, 'text');
                        labelContentHTML.setAttribute('id', XRNA.labelContentID(nucleotideID));
                        var labelContent = nucleotide.labelContent, x = nucleotideBoundingBoxCenterX + labelContent.x;
                        labelContentHTML.setAttribute('x', '' + x);
                        var y = nucleotideBoundingBoxCenterY + labelContent.y;
                        labelContentHTML.setAttribute('y', '' + y);
                        labelContentHTML.textContent = labelContent.content;
                        var labelColor = labelContent.color;
                        labelContentHTML.setAttribute('stroke', 'rgb(' + labelColor.red + ' ' + labelColor.green + ' ' + labelColor.blue + ')');
                        var labelFont = labelContent.font, labelID = XRNA.labelContentID(nucleotideID);
                        labelContentHTML.setAttribute('id', labelID);
                        labelContentHTML.setAttribute('font-size', '' + labelFont.size);
                        labelContentHTML.setAttribute('font-family', labelFont.family);
                        labelContentHTML.setAttribute('font-style', labelFont.style);
                        labelContentHTML.setAttribute('font-weight', labelFont.weight);
                        labelContentHTML.setAttribute('transform', XRNA.invertYTransform(y));
                        labelContentHTML.setAttribute('onclick', 'XRNA.onClickLabel(this)');
                        labelContentsGroupHTML.appendChild(labelContentHTML);
                        var boundingBox = XRNA.getBoundingBox(labelContentHTML);
                        // Make corrections to the content's position
                        labelContentHTML.setAttribute('x', '' + (x - boundingBox.width / 2.0));
                        labelContentHTML.setAttribute('y', '' + (y + boundingBox.height / 3.0));
                        // Recalculate the bounding box. Manual correction appears ineffective.
                        boundingBox = XRNA.getBoundingBox(labelContentHTML);
                        boundingBoxes.push(boundingBox);
                        boundingBoxesHTML.appendChild(XRNA.getBoundingBoxHTML(boundingBox, labelID));
                    }
                    // Only render the bond lines once.
                    // If we use the nucleotide with the greater index, we can can reference the other nucleotide's HTML.
                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex > nucleotide.basePairIndex) {
                        var basePairedNucleotide = complex.rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotide.basePairIndex], basePairedNucleotideBounds = XRNA.getBoundingBox(document.getElementById(XRNA.nucleotideID(rnaMoleculeID, nucleotide.basePairIndex))), basePairedNucleotideBoundsCenterX_1 = basePairedNucleotideBounds.x + basePairedNucleotideBounds.width / 2.0, basePairedNucleotideBoundsCenterY_1 = basePairedNucleotideBounds.y + basePairedNucleotideBounds.height / 2.0, bondSymbolHTML_1, circleHTMLHelper = function (fill) {
                            bondSymbolHTML_1 = document.createElementNS(svgNameSpaceURL, 'circle');
                            bondSymbolHTML_1.setAttribute('fill', fill);
                            bondSymbolHTML_1.setAttribute('cx', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX_1, 0.5));
                            bondSymbolHTML_1.setAttribute('cy', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY_1, 0.5));
                            bondSymbolHTML_1.setAttribute('r', '' + XRNA.distance(nucleotideBoundingBoxCenterX, nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterX_1, basePairedNucleotideBoundsCenterY_1) / 8.0);
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
                                bondSymbolHTML_1.setAttribute('x1', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX_1, 0.25));
                                bondSymbolHTML_1.setAttribute('y1', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY_1, 0.25));
                                bondSymbolHTML_1.setAttribute('x2', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX_1, 0.75));
                                bondSymbolHTML_1.setAttribute('y2', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY_1, 0.75));
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
        'svg': XRNA.writeSVG
    };
    XRNA.selectionConstraintDescriptionDictionary = {
        'RNA Single Nucleotide': new /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex < 0;
            };
            class_1.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return [{
                        rnaComplexIndex: rnaComplexIndex,
                        rnaMoleculeIndex: rnaMoleculeIndex,
                        nucleotideIndex: nucleotideIndex
                    }];
            };
            class_1.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide without a base pair', 'a non-base-paired nucleotide');
            };
            return class_1;
        }(SelectionConstraint)),
        'RNA Single Strand': new /** @class */ (function (_super) {
            __extends(class_2, _super);
            function class_2() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_2.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex < 0;
            };
            class_2.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
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
            class_2.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide without a base pair', 'a non-base-paired nucleotide');
            };
            return class_2;
        }(SelectionConstraint)),
        'RNA Single Base Pair': new /** @class */ (function (_super) {
            __extends(class_3, _super);
            function class_3() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_3.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                // Special case: base-paired immediately adjacent nucleotides.
                return basePairIndex >= 0 && (Math.abs(nucleotideIndex - basePairIndex) == 1 || ((nucleotideIndex == 0 || nucleotides[nucleotideIndex - 1].basePairIndex != basePairIndex + 1) && (nucleotideIndex == nucleotides.length - 1 || nucleotides[nucleotideIndex + 1].basePairIndex != basePairIndex - 1)));
            };
            class_3.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return [{ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: nucleotideIndex }, { rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex }];
            };
            class_3.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide with a base pair and no contiguous base pairs', 'a base-paired nucleotide outside a series of base pairs');
            };
            return class_3;
        }(SelectionConstraint)),
        'RNA Helix': new /** @class */ (function (_super) {
            __extends(class_4, _super);
            function class_4() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_4.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            };
            class_4.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
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
            class_4.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide with a base pair', 'a base-paired nucleotide');
            };
            return class_4;
        }(SelectionConstraint)),
        'RNA Stacked Helix': new /** @class */ (function (_super) {
            __extends(class_5, _super);
            function class_5() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_5.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
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
            class_5.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var _this = this;
                this.getSelectedNucleotideIndicesHelper(rnaComplexIndex, rnaMoleculeIndex, function () { return _this.adjacentNucleotideIndex0--; }, function () { return _this.adjacentNucleotideIndex1++; }, function (nucleotides) { return _this.adjacentNucleotideIndex0 < 0 || _this.adjacentNucleotideIndex1 >= nucleotides.length; });
                return this.adjacentNucleotideIndices;
            };
            class_5.prototype.getSelectedNucleotideIndicesHelper = function (rnaComplexIndex, rnaMoleculeIndex, adjacentNucleotideIndex0Incrementer, adjacentNucleotideIndex1Incrementer, adjacentNucleotideIndicesAreOutsideBoundsChecker) {
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
            class_5.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a base-paired nucleotide within a stacked helix', 'a base-paired nucleotide with proximate nucleotides on either side exclusively bonded to the other');
            };
            return class_5;
        }(SelectionConstraint)),
        'RNA Sub-domain': new /** @class */ (function (_super) {
            __extends(class_6, _super);
            function class_6() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_6.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            };
            class_6.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
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
            class_6.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide with a base pair', 'a base-paired nucleotide');
            };
            return class_6;
        }(SelectionConstraint)),
        'RNA Cycle': new /** @class */ (function (_super) {
            __extends(class_7, _super);
            function class_7() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_7.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_7.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
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
            class_7.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            return class_7;
        }(SelectionConstraint)),
        'RNA List Nucs': new /** @class */ (function (_super) {
            __extends(class_8, _super);
            function class_8() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_8.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return false;
            };
            class_8.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error("This code should be unreachable.");
            };
            class_8.prototype.getErrorMessage = function () {
                return "This selection constraint is not used for left-click nucleotide selection.";
            };
            return class_8;
        }(SelectionConstraint)),
        'RNA Strand': new /** @class */ (function (_super) {
            __extends(class_9, _super);
            function class_9() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_9.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_9.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var adjacentNucleotideIndices = new Array(), nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaComplexIndex].nucleotides;
                for (var adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                }
                return adjacentNucleotideIndices;
            };
            class_9.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            return class_9;
        }(SelectionConstraint)),
        'RNA Color Unit': new /** @class */ (function (_super) {
            __extends(class_10, _super);
            function class_10() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_10.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_10.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides, color = nucleotides[nucleotideIndex].color, adjacentNucleotideIndices = new Array();
                for (var adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    var adjacentNucleotideColor = nucleotides[adjacentNucleotideIndex].color;
                    if (adjacentNucleotideColor.red == color.red && adjacentNucleotideColor.green == color.green && adjacentNucleotideColor.blue == color.blue) {
                        adjacentNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex });
                    }
                }
                return adjacentNucleotideIndices;
            };
            class_10.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            return class_10;
        }(SelectionConstraint)),
        'RNA Named Group': new /** @class */ (function (_super) {
            __extends(class_11, _super);
            function class_11() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_11.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                // For now, named-group support is not implemented.
                return false;
            };
            class_11.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                throw new Error("This code should be unreachable.");
            };
            class_11.prototype.getErrorMessage = function () {
                return SelectionConstraint.createErrorMessage('a nucleotide within a named group', 'a nucleotide within a named group');
            };
            return class_11;
        }(SelectionConstraint)),
        'RNA Strand Group': new /** @class */ (function (_super) {
            __extends(class_12, _super);
            function class_12() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_12.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_12.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                var strandNucleotideIndices = new Array(), rnaComplex = XRNA.rnaComplexes[rnaComplexIndex];
                for (var rnaMoleculeIndex_1 = 0; rnaMoleculeIndex_1 < rnaComplex.rnaMolecules.length; rnaMoleculeIndex_1++) {
                    var nucleotides = rnaComplex.rnaMolecules[rnaMoleculeIndex_1].nucleotides;
                    for (var nucleotideIndex_1 = 0; nucleotideIndex_1 < nucleotides.length; nucleotideIndex_1++) {
                        strandNucleotideIndices.push({ rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex_1, nucleotideIndex: nucleotideIndex_1 });
                    }
                }
                return strandNucleotideIndices;
            };
            class_12.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            return class_12;
        }(SelectionConstraint)),
        'Labels Only': new /** @class */ (function (_super) {
            __extends(class_13, _super);
            function class_13() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_13.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_13.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                // Select no nucleotides, but do not produce an error.
                // This replicates XRNA-GT behavior.
                return [];
            };
            class_13.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            return class_13;
        }(SelectionConstraint)),
        'Entire Scene': new /** @class */ (function (_super) {
            __extends(class_14, _super);
            function class_14() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_14.prototype.approveSelectedIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                return true;
            };
            class_14.prototype.getSelectedNucleotideIndices = function (rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex) {
                // Select no indices.
                return [];
            };
            class_14.prototype.getErrorMessage = function () {
                throw new Error("This code should be unreachable.");
            };
            return class_14;
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
        selected: new Array(),
        dx: 0,
        dy: 0,
        dragCoordinates: {
            origin: {
                x: 0,
                y: 0
            },
            cacheOrigin: {
                x: 0,
                y: 0
            }
        }
    };
    return XRNA;
}());
exports.XRNA = XRNA;
