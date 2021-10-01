"use strict";
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
        this.refIDs = new Array();
    }
    return ParsingData;
}());
var Nucleotide = /** @class */ (function () {
    function Nucleotide(symbol, x, y, basePairIndex, labelLine, labelContent, font, color) {
        if (x === void 0) { x = 0.0; }
        if (y === void 0) { y = 0.0; }
        if (basePairIndex === void 0) { basePairIndex = -1; }
        if (labelLine === void 0) { labelLine = null; }
        if (labelContent === void 0) { labelContent = null; }
        if (font === void 0) { font = [8, 'dialog']; }
        if (color === void 0) { color = [255, 255, 255]; }
        this.symbol = symbol;
        this.x = x;
        this.y = y;
        this.basePairIndex = basePairIndex;
        this.labelLine = labelLine;
        if (labelLine) {
            this.labelLine = [labelLine[1] + x, labelLine[1] + y, labelLine[2] + x, labelLine[3] + y];
        }
        this.labelContent = labelContent;
        if (labelContent) {
            this.labelContent = [labelContent[0] + x, labelContent[1] + y, labelContent[2], labelContent[3]];
        }
        this.font = font;
        this.color = color;
    }
    Nucleotide.parse = function (inputLine, template) {
        if (template === void 0) { template = Nucleotide.template; }
        var inputData = inputLine.split(/\s+/);
        var symbol;
        var x = 0.0;
        var y = 0.0;
        var basePairIndex = -1;
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
        return new Nucleotide(symbol, x, y, basePairIndex);
    };
    return Nucleotide;
}());
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
        if (printVersionFlag) {
            console.log("XRNA-GT-TypeScript 9/30/21");
        }
        XRNA.canvas = document.getElementById('canvas');
        XRNA.canvasBounds = XRNA.canvas.getBoundingClientRect();
        if (inputUrl) {
            XRNA.handleInputUrl(inputUrl);
            if (outputUrls) {
                outputUrls.forEach(function (outputUrl) { return XRNA.handleOutputUrl(outputUrl); });
            }
        }
        // Collect the allowable input file extensions.
        document.getElementById('input').setAttribute('accept', Object.keys(XRNA.inputParserDictionary).map(function (extension) { return "." + extension; }).join(', '));
        // Collect the allowable output file extensions.
        // document.getElementById('output').setAttribute('accept', (Object.keys(XRNA.outputWriterDictionary) as Array<string>).map(extension => "." + extension).join(', '));
        var outputFileExtensionElement = document.getElementById('output file extension');
        Object.keys(XRNA.outputWriterDictionary).forEach(function (extension) {
            var option = document.createElement('option');
            extension = '.' + extension;
            option.value = extension;
            option.innerHTML = extension;
            outputFileExtensionElement.appendChild(option);
        });
        XRNA.canvas.oncontextmenu = function (event) {
            event.preventDefault();
            return false;
        };
        XRNA.canvas.onmousedown = function (event) {
            var newButtonIndex = XRNA.getButtonIndex(event);
            var pressedButtonIndex = newButtonIndex - XRNA.buttonIndex;
            XRNA.buttonIndex = newButtonIndex;
            switch (pressedButtonIndex) {
                case BUTTON_INDEX.RIGHT:
                    XRNA.sceneDressingData.onDragX = event.pageX;
                    XRNA.sceneDressingData.onDragY = event.pageY;
                    return false;
            }
        };
        XRNA.canvas.onmouseup = function (event) {
            var newButtonIndex = XRNA.getButtonIndex(event);
            var releasedButtonIndex = XRNA.buttonIndex - newButtonIndex;
            XRNA.buttonIndex = newButtonIndex;
            switch (releasedButtonIndex) {
                case BUTTON_INDEX.RIGHT:
                    XRNA.sceneDressingData.cacheOriginX = XRNA.sceneDressingData.originX;
                    XRNA.sceneDressingData.cacheOriginY = XRNA.sceneDressingData.originY;
                    return false;
            }
        };
        XRNA.canvas.onmousemove = function (event) {
            switch (XRNA.buttonIndex) {
                case BUTTON_INDEX.RIGHT:
                case BUTTON_INDEX.LEFT_RIGHT:
                case BUTTON_INDEX.LEFT_MIDDLE_RIGHT:
                    XRNA.sceneDressingData.originX = XRNA.sceneDressingData.cacheOriginX + event.pageX - XRNA.sceneDressingData.onDragX;
                    XRNA.sceneDressingData.originY = XRNA.sceneDressingData.cacheOriginY + event.pageY - XRNA.sceneDressingData.onDragY;
                    XRNA.updateSceneDressing();
                    break;
            }
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
        XRNA.rnaMolecules = new Array();
        XRNA.resetView();
    };
    XRNA.resetView = function () {
        XRNA.sceneDressingData.originX = 0;
        XRNA.sceneDressingData.originY = 0;
        XRNA.sceneDressingData.zoom = 0;
        XRNA.sceneDressingData.cacheOriginX = 0;
        XRNA.sceneDressingData.cacheOriginY = 0;
        XRNA.updateSceneDressing();
    };
    XRNA.updateSceneDressing = function () {
        var scale = Math.pow(1.1, XRNA.sceneDressingData.zoom);
        document.getElementById('sceneDressing').setAttribute('transform', 'translate(' + XRNA.sceneDressingData.originX + ' ' + XRNA.sceneDressingData.originY + ') scale(' + scale + ' ' + scale + ')');
    };
    XRNA.handleInputUrl = function (inputUrl) {
        inputUrl = inputUrl.trim();
        var fileExtension = inputUrl.split('.')[1].toLowerCase();
        XRNA.handleInputFile(XRNA.openUrl(inputUrl), fileExtension);
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
                XRNA.canvasBounds = XRNA.canvas.getBoundingClientRect();
                XRNA.fitSceneToBounds();
            };
            XRNA.canvas.onwheel = function (event) {
                XRNA.sceneDressingData.zoom += Math.sign(event.deltaY);
                XRNA.updateSceneDressing();
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
        var fileExtension = outputUrl.split('.')[1].toLowerCase();
        var outputWriter = XRNA.outputWriterDictionary[fileExtension];
        var url = window.URL.createObjectURL(new Blob([outputWriter()], { type: 'text/plain' }));
        var downloader = document.createElement('a');
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
    XRNA.parseXMLHelper = function (root, parsingData) {
        var _a;
        var _loop_1 = function (index) {
            var subElement = void 0;
            subElement = root.children[index];
            switch (subElement.tagName) {
                case "ComplexDocument": {
                    break;
                }
                case "Complex": {
                    break;
                }
                case "WithComplex": {
                    break;
                }
                case "RNAMolecule": {
                    break;
                }
                case "Nuc": {
                    parsingData.refIDs = new Array();
                    var refIDsString = (_a = subElement.getAttribute('RefID')) !== null && _a !== void 0 ? _a : subElement.getAttribute('RefIDs');
                    if (!refIDsString) {
                        throw new Error('Within the input file, a <Nuc> element is missing its RefID(s) attribute.');
                    }
                    refIDsString = refIDsString.replace(/\s+/, '');
                    // comma-separated list of (potentially ordered-paired, potentially negative) integers.
                    if (!refIDsString.match(/^(?:(?:-?\d+-)?-?\d+)(?:,(?:-?\d+-)?-?\d+)*$/)) {
                        throw new Error('Within the input file, a <Nuc> element\'s refID(s) attribute is improperly formatted. It should be a comma-separated list of integers, or ordered integer pairs separated by \'-\'.');
                    }
                    var firstNucleotideIndex_1 = XRNA.rnaMolecules[XRNA.rnaMolecules.length - 1][1];
                    refIDsString.split(',').forEach(function (splitElement) {
                        var matchedGroups = splitElement.match(/^(-?\d+)-(-?\d+)$/);
                        if (matchedGroups) {
                            parsingData.refIDs.push([parseInt(matchedGroups[1]) - firstNucleotideIndex_1, parseInt(matchedGroups[2]) - firstNucleotideIndex_1]);
                        }
                        else {
                            var refID = parseInt(splitElement) - firstNucleotideIndex_1;
                            parsingData.refIDs.push([refID, refID]);
                        }
                    });
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
                    var startingNucleotideIndex = parseInt(startingNucleotideIndexString);
                    var currentNucleotides = new Array();
                    for (var index_1 = 0; index_1 < innerHTMLLines.length; index_1++) {
                        var line = innerHTMLLines[index_1];
                        if (!line.match(/^\s*$/)) {
                            currentNucleotides.push(Nucleotide.parse(line.trim()));
                        }
                    }
                    XRNA.rnaMolecules.push([currentNucleotides, startingNucleotideIndex]);
                    break;
                }
                case "LabelList": {
                    var innerHTML = subElement.innerHTML;
                    innerHTML = innerHTML.replace(/^\n/, '');
                    innerHTML = innerHTML.replace(/\n$/, '');
                    var innerHTMLLines = innerHTML.split('\n');
                    var labelContent_1 = null;
                    var labelLine_1 = null;
                    innerHTMLLines.forEach(function (innerHTMLLine) {
                        var splitLineElements = innerHTMLLine.split(/\s+/);
                        switch (splitLineElements[0].toLowerCase()[0]) {
                            case 'l':
                                labelLine_1 = [parseFloat(splitLineElements[1]), parseFloat(splitLineElements[2]), parseFloat(splitLineElements[3]), parseFloat(splitLineElements[4])];
                                break;
                            case 's':
                                // Directly from XRNA source code (ComplexXMLParser.java):
                                // x y ang size font color
                                // Hardcode white for now.
                                var rgb = 0xFFFFFF; //parseInt(splitLineElements[splitLineElements.length - 2]);
                                labelContent_1 = [parseFloat(splitLineElements[1]), parseFloat(splitLineElements[2]), splitLineElements[splitLineElements.length - 1].replace(/\"/g, ''), [(rgb >> 4) & 0xFF, (rgb >> 2) & 0xFF, rgb & 0xFF]];
                                break;
                        }
                    });
                    var nucleotides_1 = XRNA.rnaMolecules[XRNA.rnaMolecules.length - 1][0];
                    parsingData.refIDs.forEach(function (refIDPair) {
                        for (var i = refIDPair[0]; i <= refIDPair[1]; i++) {
                            nucleotides_1[i].labelContent = labelContent_1;
                            nucleotides_1[i].labelLine = labelLine_1;
                        }
                    });
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
                    var indexString = subElement.getAttribute("nucID");
                    var lengthString = subElement.getAttribute("length");
                    var basePairedIndexString = subElement.getAttribute("bpNucID");
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
                    // Peek the most recently created rna molecule.
                    var currentRNAMolecule = XRNA.rnaMolecules[XRNA.rnaMolecules.length - 1];
                    var firstNucleotideIndex = currentRNAMolecule[1];
                    index_2 -= firstNucleotideIndex;
                    basePairedIndex -= firstNucleotideIndex;
                    // Pair nucleotides.
                    for (var innerIndex = 0; innerIndex < length_1; innerIndex++) {
                        var nucleotideIndex0 = index_2 + innerIndex;
                        var nucleotideIndex1 = basePairedIndex - innerIndex;
                        if (nucleotideIndex0 < 0) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index_2 + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex0 + " < 0");
                            continue;
                        }
                        if (nucleotideIndex0 >= currentRNAMolecule[0].length) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index_2 + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex0 + " >= " + currentRNAMolecule[0].length);
                            continue;
                        }
                        if (nucleotideIndex1 < 0) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index_2 + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex1 + " < 0");
                            continue;
                        }
                        if (nucleotideIndex1 >= currentRNAMolecule[0].length) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index_2 + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length_1 + "'>): " + nucleotideIndex1 + " >= " + currentRNAMolecule[0].length);
                            continue;
                        }
                        currentRNAMolecule[0][nucleotideIndex0].basePairIndex = nucleotideIndex1;
                        currentRNAMolecule[0][nucleotideIndex1].basePairIndex = nucleotideIndex0;
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
        var xrnaFrontHalf = '';
        var xrnaBackHalf = '';
        var name = 'Unknown';
        xrnaFrontHalf += '<ComplexDocument Name=\'' + name + '\'>\n';
        xrnaBackHalf = '\n</ComplexDocument>' + xrnaBackHalf;
        xrnaFrontHalf += '<SceneNodeGeom CenterX=\'' + 0 + '\' CenterY=\'' + 0 + '\' Scale=\'' + 1 + '\'/>\n';
        xrnaFrontHalf += '<Complex Name=\'' + name + '\'>\n';
        xrnaBackHalf = '\n</Complex>' + xrnaBackHalf;
        for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < XRNA.rnaMolecules.length; rnaMoleculeIndex++) {
            var rnaMolecule = XRNA.rnaMolecules[rnaMoleculeIndex];
            var nucleotides = rnaMolecule[0];
            var firstNucleotideIndex = rnaMolecule[1];
            xrnaFrontHalf += '<RNAMolecule Name=\'' + name + '\'>\n';
            xrnaBackHalf = '\n</RNAMolecule>' + xrnaBackHalf;
            xrnaFrontHalf += '<NucListData StartNucID=\'' + firstNucleotideIndex + '\' DataType=\'NucChar.XPos.YPos\'>\n';
            var nucLabelLists = '';
            var basePairs = '';
            for (var nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                var nucleotide = nucleotides[nucleotideIndex];
                xrnaFrontHalf += nucleotide.symbol + ' ' + nucleotide.x + ' ' + nucleotide.y + '\n';
                if (nucleotide.labelContent || nucleotide.labelContent) {
                    nucLabelLists += '<Nuc RefID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\'>\n<LabelList>\n';
                    if (nucleotide.labelLine) {
                        var line = nucleotide.labelLine;
                        nucLabelLists += 'l ' + line[0] + ' ' + line[1] + ' ' + line[2] + ' ' + line[3] + ' ' + '0.2 0 0.0 0 0 0 0\n';
                    }
                    if (nucleotide.labelContent) {
                        var content = nucleotide.labelContent;
                        nucLabelLists += 's ' + content[0] + ' ' + content[1] + ' 0.0 ' + nucleotide.font[0] + ' 0 0 \"' + content[2] + '\"\n';
                    }
                    nucLabelLists += '</LabelList>\n</Nuc>\n';
                }
                if (nucleotide.basePairIndex >= 0 && nucleotideIndex < nucleotide.basePairIndex) {
                    basePairs += '<BasePairs nucID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\' length=\'1\' bpNucID=\'' + (firstNucleotideIndex + nucleotide.basePairIndex) + '\' />\n';
                }
            }
            xrnaFrontHalf += '</NucListData>\n';
            xrnaFrontHalf += '<Nuc RefIDs=\'' + firstNucleotideIndex + '-' + (firstNucleotideIndex + nucleotides.length - 1) + '\' IsSchematic=\'false\' SchematicColor=\'0\' SchematicLineWidth=\'1.5\' SchematicBPLineWidth=\'1.0\' SchematicBPGap=\'2.0\' SchematicFPGap=\'2.0\' SchematicTPGap=\'2.0\' IsNucPath=\'false\' NucPathColor=\'ff0000\' NucPathLineWidth=\'0.0\' />\n';
            xrnaFrontHalf += nucLabelLists;
            xrnaFrontHalf += basePairs;
        }
        return xrnaFrontHalf + xrnaBackHalf;
    };
    XRNA.writeSVG = function () {
        throw new Error('Not implemented yet.');
    };
    XRNA.getBoundingBox = function (htmlElement) {
        var boundingBox = htmlElement.getBoundingClientRect();
        boundingBox.y -= XRNA.canvasBounds.y;
        return boundingBox;
    };
    XRNA.rnaMoleculeID = function (rnaMoleculeIndex) {
        return 'RNA Molecule #' + rnaMoleculeIndex;
    };
    XRNA.nucleotideID = function (rnaMoleculeIndex, nucleotideIndex) {
        return XRNA.rnaMoleculeID(rnaMoleculeIndex) + ': Nucleotide #' + nucleotideIndex;
    };
    XRNA.labelContentID = function (rnaMoleculeIndex, nucleotideIndex) {
        return XRNA.nucleotideID(rnaMoleculeIndex, nucleotideIndex) + ': Label Content';
    };
    XRNA.fitSceneToBounds = function () {
        // Scale to fit the screen
        var sceneScale = Math.min(XRNA.canvasBounds.width / (XRNA.sceneBounds.maximumX - XRNA.sceneBounds.minimumX), XRNA.canvasBounds.height / (XRNA.sceneBounds.maximumY - XRNA.sceneBounds.minimumY));
        XRNA.sceneTransform.unshift('scale(' + sceneScale + ' ' + sceneScale + ')');
        // Center scene along the y axis.
        XRNA.sceneTransform.unshift('translate(0 ' + XRNA.canvasBounds.height + ')');
        document.getElementById('scene').setAttribute('transform', XRNA.sceneTransform.join(' '));
        // Remove the elements of XRNA.sceneTransform which were added by fitSceneToBounds().
        // This is necessary to ensure correct scene fitting when fitSceneToBounds() is called multiple times.
        // This occurs during window resizing.
        XRNA.sceneTransform.shift();
        XRNA.sceneTransform.shift();
    };
    XRNA.linearlyInterpolate = function (x0, x1, interpolationFactor) {
        // See https://en.wikipedia.org/wiki/Linear_interpolation
        return (1 - interpolationFactor) * x0 + interpolationFactor * x1;
    };
    XRNA.invertYTransform = function (y) {
        return 'translate(0 ' + y + ') scale(1 -1) translate(0 ' + -y + ')';
    };
    XRNA.prepareScene = function () {
        var svgNameSpaceURL = 'http://www.w3.org/2000/svg';
        while (XRNA.canvas.firstChild) {
            XRNA.canvas.removeChild(XRNA.canvas.firstChild);
        }
        var sceneDressingHTML = document.createElementNS(svgNameSpaceURL, 'g');
        sceneDressingHTML.setAttribute('id', 'sceneDressing');
        XRNA.canvas.appendChild(sceneDressingHTML);
        var sceneHTML = document.createElementNS(svgNameSpaceURL, 'g');
        sceneHTML.setAttribute('id', 'scene');
        sceneDressingHTML.appendChild(sceneHTML);
        XRNA.sceneBounds.minimumX = Number.MAX_VALUE,
            XRNA.sceneBounds.maximumX = -Number.MAX_VALUE,
            XRNA.sceneBounds.minimumY = Number.MAX_VALUE,
            XRNA.sceneBounds.maximumY = -Number.MAX_VALUE;
        for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < XRNA.rnaMolecules.length; rnaMoleculeIndex++) {
            var rnaMoleculeHTML = document.createElementNS(svgNameSpaceURL, 'g');
            var rnaMoleculeID = XRNA.rnaMoleculeID(rnaMoleculeIndex);
            rnaMoleculeHTML.setAttribute('id', rnaMoleculeID);
            sceneHTML.appendChild(rnaMoleculeHTML);
            var labelContentsGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
            labelContentsGroupHTML.setAttribute('id', rnaMoleculeID + ': Labels: Contents');
            rnaMoleculeHTML.appendChild(labelContentsGroupHTML);
            var labelLinesGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
            labelLinesGroupHTML.setAttribute('id', rnaMoleculeID + ': Labels: Lines');
            rnaMoleculeHTML.appendChild(labelLinesGroupHTML);
            var bondLinesGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
            bondLinesGroupHTML.setAttribute('id', rnaMoleculeID + ': Bond Lines');
            rnaMoleculeHTML.appendChild(bondLinesGroupHTML);
            var rnaMolecule = XRNA.rnaMolecules[rnaMoleculeIndex];
            var nucleotides = rnaMolecule[0];
            for (var nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                var nucleotide = nucleotides[nucleotideIndex];
                var nucleotideHTML = document.createElementNS(svgNameSpaceURL, 'text');
                nucleotideHTML.textContent = nucleotide.symbol;
                nucleotideHTML.setAttribute('id', XRNA.nucleotideID(rnaMoleculeIndex, nucleotideIndex));
                nucleotideHTML.setAttribute('x', '' + nucleotide.x);
                nucleotideHTML.setAttribute('y', '' + nucleotide.y);
                var nucleotideColor = nucleotide.color;
                nucleotideHTML.setAttribute('stroke', 'rgb(' + nucleotideColor[0] + ' ' + nucleotideColor[1] + ' ' + nucleotideColor[2] + ')');
                nucleotideHTML.setAttribute('font-size', '' + nucleotide.font[0]);
                nucleotideHTML.setAttribute('font-family', nucleotide.font[1]);
                nucleotideHTML.setAttribute('transform', XRNA.invertYTransform(nucleotide.y));
                rnaMoleculeHTML.appendChild(nucleotideHTML);
                var boundingBoxes = new Array();
                var nucleotideBoundingBox = XRNA.getBoundingBox(nucleotideHTML);
                boundingBoxes.push(nucleotideBoundingBox);
                var nucleotideBoundingBoxCenterX = nucleotideBoundingBox.x + nucleotideBoundingBox.width / 2.0;
                var nucleotideBoundingBoxCenterY = nucleotideBoundingBox.y + nucleotideBoundingBox.height / 2.0;
                if (nucleotide.labelLine) {
                    var lineHTML = document.createElementNS(svgNameSpaceURL, 'line');
                    var labelLine = nucleotide.labelLine;
                    lineHTML.setAttribute('x1', '' + (nucleotideBoundingBoxCenterX + labelLine[0]));
                    lineHTML.setAttribute('y1', '' + (nucleotideBoundingBoxCenterY + labelLine[1]));
                    lineHTML.setAttribute('x2', '' + (nucleotideBoundingBoxCenterX + labelLine[2]));
                    lineHTML.setAttribute('y2', '' + (nucleotideBoundingBoxCenterY + labelLine[3]));
                    // Hardcode white for now.
                    lineHTML.setAttribute('stroke', 'white');
                    labelLinesGroupHTML.appendChild(lineHTML);
                }
                if (nucleotide.labelContent) {
                    var contentHTML = document.createElementNS(svgNameSpaceURL, 'text');
                    var labelContent = nucleotide.labelContent;
                    contentHTML.setAttribute('x', '' + (nucleotideBoundingBoxCenterX + labelContent[0]));
                    var y = (nucleotideBoundingBoxCenterY + labelContent[1]);
                    contentHTML.setAttribute('y', '' + y);
                    contentHTML.textContent = labelContent[2];
                    var labelColor = labelContent[3];
                    contentHTML.setAttribute('stroke', 'rgb(' + labelColor[0] + ' ' + labelColor[1] + ' ' + labelColor[2] + ')');
                    contentHTML.setAttribute('font-size', '' + nucleotide.font[0]);
                    contentHTML.setAttribute('font-family', nucleotide.font[1]);
                    contentHTML.setAttribute('transform', XRNA.invertYTransform(y));
                    labelContentsGroupHTML.appendChild(contentHTML);
                    boundingBoxes.push(contentHTML.getBoundingClientRect());
                }
                // Only render the bond lines once.
                // If we use the nucleotide with the greater index, we can can reference the other nucleotide's HTML.
                if (nucleotide.basePairIndex >= 0 && nucleotideIndex > nucleotide.basePairIndex) {
                    var bondLineHTML = document.createElementNS(svgNameSpaceURL, 'line');
                    var basePairedNucleotideBounds = XRNA.getBoundingBox(document.getElementById(XRNA.nucleotideID(rnaMoleculeIndex, nucleotide.basePairIndex)));
                    var basePairedNucleotideBoundsCenterX = basePairedNucleotideBounds.x + basePairedNucleotideBounds.width / 2.0;
                    var basePairedNucleotideBoundsCenterY = basePairedNucleotideBounds.y + basePairedNucleotideBounds.height / 2.0;
                    bondLineHTML.setAttribute('x1', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX, 0.25));
                    bondLineHTML.setAttribute('y1', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY, 0.25));
                    bondLineHTML.setAttribute('x2', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX, 0.75));
                    bondLineHTML.setAttribute('y2', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY, 0.75));
                    // Hardcode white for now.
                    bondLineHTML.setAttribute('stroke', 'white');
                    bondLinesGroupHTML.appendChild(bondLineHTML);
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
            }
        }
        XRNA.sceneTransform = new Array();
        // Translate the scene to the origin.
        XRNA.sceneTransform.unshift('translate(' + -XRNA.sceneBounds.minimumX + ' ' + -XRNA.sceneBounds.minimumY + ')');
        // Invert the y axis.
        XRNA.sceneTransform.unshift('scale(1 -1)');
        XRNA.fitSceneToBounds();
    };
    XRNA.sceneDressingData = {
        originX: 0,
        originY: 0,
        // zoom is on a linear scale. It is converted to exponential before use.
        zoom: 0,
        cacheOriginX: 0,
        cacheOriginY: 0,
        onDragX: 0,
        onDragY: 0
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
    XRNA.sceneBounds = {
        minimumX: null,
        maximumX: null,
        minimumY: null,
        maximumY: null
    };
    // buttonIndex is always equal to the current mouse buttons (see BUTTON_INDEX) depressed within the canvas.
    XRNA.buttonIndex = BUTTON_INDEX.NONE;
    return XRNA;
}());
exports.XRNA = XRNA;
