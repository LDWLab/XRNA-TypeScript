"use strict";
// import { ComplexScene2D } from "./xrnaDataStructures/ComplexScene2D"; 
// import { Raphael } from "./raphael-2.3.0/raphael";
exports.__esModule = true;
exports.XRNA = void 0;
var BUTTON_INDEX;
(function (BUTTON_INDEX) {
    BUTTON_INDEX[BUTTON_INDEX["LEFT"] = 1] = "LEFT";
    BUTTON_INDEX[BUTTON_INDEX["MIDDLE"] = 4] = "MIDDLE";
    BUTTON_INDEX[BUTTON_INDEX["RIGHT"] = 2] = "RIGHT";
})(BUTTON_INDEX || (BUTTON_INDEX = {}));
var Nucleotide = /** @class */ (function () {
    function Nucleotide(symbol, x, y, index, basePairIndex, labelLine, labelContent, font, color) {
        if (x === void 0) { x = 0.0; }
        if (y === void 0) { y = 0.0; }
        if (index === void 0) { index = Nucleotide.serialIndex; }
        if (basePairIndex === void 0) { basePairIndex = -1; }
        if (labelLine === void 0) { labelLine = null; }
        if (labelContent === void 0) { labelContent = null; }
        if (font === void 0) { font = [8, 'dialog']; }
        if (color === void 0) { color = [255, 255, 255]; }
        this.symbol = symbol;
        this.x = x;
        this.y = y;
        this.index = index;
        Nucleotide.serialIndex = index + 1;
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
        var index = Nucleotide.serialIndex;
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
                index = parseInt(inputData[0]);
                symbol = inputData[1];
                break;
            default:
                throw new Error("Unrecognized Nuc2D format");
        }
        return new Nucleotide(symbol, x, y, index, basePairIndex);
    };
    // In case the index field is not provided, use the auto-incremented serialIndex
    Nucleotide.serialIndex = 0;
    return Nucleotide;
}());
var XRNA = /** @class */ (function () {
    function XRNA() {
    }
    XRNA.mainWithArgumentParsing = function (args) {
        // Parse the command-line arguments
        throw new Error("Argument parsing is not implemented.");
    };
    XRNA.main = function (inputUrl, outputUrls, printVersionFlag) {
        if (printVersionFlag === void 0) { printVersionFlag = false; }
        XRNA.canvas = document.getElementById('canvas');
        if (printVersionFlag) {
            console.log("XRNA-GT-TypeScript 9/20/21");
        }
        if (inputUrl) {
            XRNA.handleInputUrl(inputUrl);
            if (outputUrls) {
                outputUrls.forEach(function (outputUrl) { return XRNA.handleOutputUrl(outputUrl); });
            }
        }
        XRNA.reset();
        // window.addEventListener('resize', _event => XRNA.renderScene(), true);
        XRNA.canvas.addEventListener('wheel', function (event) {
            XRNA.sceneTickScale += Math.sign(-event.deltaY);
            XRNA.renderScene();
        });
        XRNA.canvas.addEventListener('mouseup', function (event) { return XRNA.handleButtonRelease(event); });
        XRNA.canvas.addEventListener('mousemove', function (event) { return XRNA.handleMouseMove(event); });
        XRNA.canvas.addEventListener('mousedown', function (event) { return XRNA.handleButtonPress(event); });
        XRNA.canvas.addEventListener('contextmenu', function (event) { return event.preventDefault(); });
        // Collect the allowable input file extensions.
        document.getElementById('input').setAttribute('accept', Object.keys(XRNA.inputParserDictionary).map(function (extension) { return "." + extension; }).join(', '));
        // Collect the allowable output file extensions.
        document.getElementById('output').setAttribute('accept', Object.keys(XRNA.outputWriterDictionary).map(function (extension) { return "." + extension; }).join(', '));
    };
    XRNA.handleMouseMove = function (event) {
        switch (XRNA.buttonIndex) {
            case BUTTON_INDEX.LEFT:
                break;
            case BUTTON_INDEX.MIDDLE:
                break;
            case BUTTON_INDEX.RIGHT:
                if (XRNA.onDragFlag) {
                    var displacementX = event.pageX - XRNA.onDragX, displacementY = event.pageY - XRNA.onDragY;
                    if (XRNA.selectedNucleotideIDs.size == 0) {
                        XRNA.sceneOriginX = XRNA.cacheCanvasOriginX + displacementX;
                        XRNA.sceneOriginY = XRNA.cacheCanvasOriginY + displacementY;
                    }
                    XRNA.renderScene();
                }
                break;
        }
    };
    XRNA.handleButtonPress = function (event) {
        XRNA.buttonIndex = XRNA.getButtonIndex(event);
        switch (XRNA.buttonIndex) {
            case BUTTON_INDEX.LEFT:
                // let
                //     idsOfElementsWithBoundingBoxesContainingMouse = XRNA.idsOfElementsWithBoundingBoxesContainingMouse(event.pageX, event.pageY);
                break;
            case BUTTON_INDEX.MIDDLE:
                break;
            case BUTTON_INDEX.RIGHT:
                XRNA.onDragX = event.pageX;
                XRNA.onDragY = event.pageY;
                XRNA.onDragFlag = true;
                break;
        }
    };
    XRNA.handleButtonRelease = function (event) {
        switch (XRNA.buttonIndex) {
            case BUTTON_INDEX.LEFT:
                XRNA.onDragFlag = false;
                break;
            case BUTTON_INDEX.MIDDLE:
                break;
            case BUTTON_INDEX.RIGHT:
                XRNA.onDragFlag = false;
                if (XRNA.selectedNucleotideIDs.size == 0) {
                    XRNA.cacheCanvasOriginY = XRNA.sceneOriginY;
                    XRNA.cacheCanvasOriginX = XRNA.sceneOriginX;
                }
                else {
                    XRNA.selectedNucleotideIDs.forEach(function (selectedNucleotideID) {
                        var idStrings = selectedNucleotideID.match(/\d+/g), nucleotide = XRNA.rnaMolecules[parseInt(idStrings[0])][0][parseInt(idStrings[1])];
                        nucleotide.x += event.pageX - XRNA.onDragX;
                        nucleotide.y += event.pageY - XRNA.onDragY;
                    });
                    XRNA.prepareScene();
                    XRNA.renderScene();
                }
                break;
        }
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
    XRNA.reset = function (resetRNAMoleculesFlag, resetSceneFlag) {
        if (resetRNAMoleculesFlag === void 0) { resetRNAMoleculesFlag = true; }
        if (resetSceneFlag === void 0) { resetSceneFlag = true; }
        if (resetRNAMoleculesFlag) {
            XRNA.rnaMolecules = new Array();
        }
        XRNA.sceneOriginX = 0;
        XRNA.sceneOriginY = 0;
        XRNA.cacheCanvasOriginX = 0;
        XRNA.cacheCanvasOriginY = 0;
        XRNA.sceneTickScale = 0;
        XRNA.onDragFlag = false;
        if (resetSceneFlag) {
            XRNA.renderScene();
        }
    };
    XRNA.handleInputUrl = function (inputUrl) {
        inputUrl = inputUrl.trim().toLowerCase();
        var fileExtension = inputUrl.split('.')[1];
        XRNA.handleInputFile(XRNA.openUrl(inputUrl), fileExtension);
    };
    XRNA.handleInputFile = function (inputFile, fileExtension) {
        XRNA.reset(false, false);
        var inputParser = XRNA.inputParserDictionary[fileExtension];
        inputParser(inputFile);
    };
    XRNA.handleOutputUrl = function (outputUrl) {
        outputUrl = outputUrl.trim().toLowerCase();
        var fileExtension = outputUrl.split('.')[1];
        XRNA.handleOutputFile(XRNA.openUrl(outputUrl), fileExtension);
    };
    XRNA.handleOutputFile = function (outputFile, fileExtension) {
        var outputWriter = XRNA.outputWriterDictionary[fileExtension];
        outputWriter(outputFile);
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
    XRNA.parseXMLHelper = function (root) {
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
                    XRNA.refIDs = new Array();
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
                    var refIDs = refIDsString.split(',').forEach(function (splitElement) {
                        var matchedGroups = splitElement.match(/^(-?\d+)-(-?\d+)$/);
                        if (matchedGroups) {
                            XRNA.refIDs.push([parseInt(matchedGroups[1]) - firstNucleotideIndex_1, parseInt(matchedGroups[2]) - firstNucleotideIndex_1]);
                        }
                        else {
                            var refID = parseInt(splitElement) - firstNucleotideIndex_1;
                            XRNA.refIDs.push([refID, refID]);
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
                    XRNA.refIDs.forEach(function (refIDPair) {
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
            XRNA.parseXMLHelper(subElement);
        };
        for (var index = 0; index < root.children.length; index++) {
            _loop_1(index);
        }
    };
    XRNA.parseXML = function (inputFile) {
        var reader = new FileReader();
        reader.addEventListener('load', function () {
            var parsed = new DOMParser().parseFromString(this.result.toString(), "text/xml");
            XRNA.parseXMLHelper(parsed);
            XRNA.renderScene();
        });
        reader.readAsText(inputFile, "UTF-8");
    };
    XRNA.parseXRNA = function (inputFile) {
        var reader = new FileReader();
        reader.addEventListener('load', function () {
            var xmlContent = this.result.toString();
            if (!xmlContent.match(/^\s*<!DOCTYPE/)) {
                xmlContent = "<!DOCTYPE ComplexDocument [\
                    <!ELEMENT ComplexDocument (SceneNodeGeom?, ComplexDocument*, Label*, LabelList*, Complex*, WithComplex*)>\
                    <!ATTLIST ComplexDocument Name CDATA #REQUIRED Author CDATA #IMPLIED ExpandUponWrite CDATA #IMPLIED PSScale CDATA #IMPLIED LandscapeMode CDATA #IMPLIED> \
                    \
                    <!ELEMENT Complex (SceneNodeGeom?, Label*, LabelList*, RNAMolecule*, ProteinMolecule*)>\
                    <!ATTLIST Complex Name CDATA #REQUIRED Author CDATA #IMPLIED> \
                    \
                    <!ELEMENT WithComplex (SceneNodeGeom?, Label*, LabelList*, RNAMolecule*, ProteinMolecule*)>\
                    <!ATTLIST WithComplex Name CDATA #REQUIRED Author CDATA #IMPLIED> \
                    \
                    <!ELEMENT RNAMolecule (SceneNodeGeom?, Label*, LabelList*, Nuc*, NucSegment*, (NucListData | Nuc)*, RNAFile*, BasePairs*, BasePair*, Parent?, AlignmentFile?)>\
                    <!ATTLIST RNAMolecule Name CDATA #REQUIRED Author CDATA #IMPLIED>\
                    <!-- parent is like for e.coli being the numbering --> \
                    \
                    <!ELEMENT Parent (RNAMolecule)>\
                    \
                    <!ELEMENT AlignmentFile (#PCDATA)> \
                    \
                    <!ELEMENT BasePairs EMPTY>\
                    <!ATTLIST BasePairs nucID CDATA #REQUIRED bpNucID CDATA #REQUIRED length CDATA #REQUIRED bpName CDATA #IMPLIED>\
                    \
                    <!-- BasePair can be used after above BasePairs is implemented and refers to base pairs already set, even across strands. -->\
                    <!ELEMENT BasePair EMPTY>\
                    <!ATTLIST BasePair RefID CDATA #IMPLIED RefIDs CDATA #IMPLIED Type (Canonical | Wobble | MisMatch | Weak | Phosphate | Unknown) 'Unknown' Line5PDeltaX CDATA #IMPLIED Line5PDeltaY CDATA #IMPLIED Line3PDeltaX CDATA #IMPLIED Line3PDeltaY CDATA #IMPLIED LabelDeltaX CDATA #IMPLIED LabelDeltaY CDATA #IMPLIED Label5PSide CDATA #IMPLIED> \
                    \
                    <!ELEMENT NucListData (#PCDATA)>\
                    <!ATTLIST NucListData StartNucID CDATA #IMPLIED DataType (NucChar | NucID.NucChar | NucID.NucChar.XPos.YPos | NucChar.XPos.YPos | NucID.NucChar.XPos.YPos.FormatType.BPID) 'NucID.NucChar.XPos.YPos.FormatType.BPID'> \
                    \
                    <!ELEMENT Label (StringLabel | CircleLabel | Trianglelabel | LineLabel | ParallelogramLabel)>\
                    <!ATTLIST Label XPos CDATA #REQUIRED YPos CDATA #REQUIRED Color CDATA #IMPLIED>\
                    \
                    <!ELEMENT StringLabel EMPTY> \
                    <!ATTLIST StringLabel FontName CDATA #IMPLIED FontType CDATA #IMPLIED FontSize CDATA #REQUIRED Angle CDATA #IMPLIED  Text CDATA #REQUIRED>\
                    \
                    <!ELEMENT CircleLabel EMPTY> \
                    <!ATTLIST CircleLabel Arc0 CDATA #IMPLIED Arc1 CDATA #IMPLIED Radius CDATA #IMPLIED LineWidth CDATA #IMPLIED IsOpen CDATA #IMPLIED>\
                    \
                    <!ELEMENT TriangleLabel EMPTY>\
                    <!ATTLIST TriangleLabel TopPtX CDATA #REQUIRED TopPtY CDATA #REQUIRED LeftPtX CDATA #REQUIRED LeftPtY CDATA #REQUIRED RightPtX CDATA #REQUIRED RightPtY CDATA #REQUIRED LineWidth CDATA #IMPLIED IsOpen CDATA #IMPLIED>\
                    \
                    <!ELEMENT LineLabel EMPTY> \
                    <!ATTLIST LineLabel X1 CDATA #REQUIRED Y1 CDATA #REQUIRED LineWidth CDATA #IMPLIED> \
                    \
                    <!ELEMENT ParallelogramLabel EMPTY>\
                    <!ATTLIST ParallelogramLabel Angle1 CDATA #REQUIRED Side1 CDATA #REQUIRED Angle2 CDATA #REQUIRED Side2 CDATA #REQUIRED LineWidth CDATA #IMPLIED IsOpen CDATA #IMPLIED> \
                    \
                    <!ELEMENT LabelList (#PCDATA)>\
                    \
                    <!ELEMENT NucSegment (NucChars)> \
                    <!ATTLIST NucSegment StartNucID CDATA #IMPLIED> \
                    \
                    <!ELEMENT NucChars (#PCDATA)>\
                    \
                    <!ELEMENT NucSymbol (#PCDATA)> \
                    \
                    <!ELEMENT Nuc (Label*, LabelList?, NucSymbol?)>\
                    <!ATTLIST Nuc NucID CDATA #IMPLIED NucChar CDATA #IMPLIED XPos CDATA #IMPLIED YPos CDATA #IMPLIED Color CDATA #IMPLIED FontID CDATA #IMPLIED FontSize CDATA #IMPLIED FormatType CDATA #IMPLIED BPParent CDATA #IMPLIED BPNucID CDATA #IMPLIED RefID CDATA #IMPLIED RefIDs CDATA #IMPLIED IsHidden CDATA #IMPLIED GroupName CDATA #IMPLIED IsSchematic CDATA #IMPLIED SchematicColor CDATA #IMPLIED SchematicLineWidth CDATA #IMPLIED SchematicBPLineWidth CDATA #IMPLIED SchematicBPGap CDATA #IMPLIED SchematicFPGap CDATA #IMPLIED SchematicTPGap CDATA #IMPLIED IsNucPath CDATA #IMPLIED NucPathColor CDATA #IMPLIED NucPathLineWidth CDATA #IMPLIED>\
                    \
                    <!ELEMENT RNAFile EMPTY>\
                    <!ATTLIST RNAFile FileName CDATA #REQUIRED FileType (NucChar | NucID.NucChar | NucID.NucChar.XPos.YPos | NucID.NucChar.XPos.YPos.FormatType.BPID) 'NucID.NucChar.XPos.YPos.FormatType.BPID'>\
                    \
                    <!ELEMENT SceneNodeGeom EMPTY>\
                    <!ATTLIST SceneNodeGeom CenterX CDATA #IMPLIED CenterY CDATA #IMPLIED Scale CDATA #IMPLIED>\
                ]>\n" + xmlContent;
            }
            var parsed = new DOMParser().parseFromString(xmlContent, "text/xml");
            XRNA.parseXMLHelper(parsed);
            XRNA.prepareScene();
            XRNA.renderScene();
        });
        reader.readAsText(inputFile, "UTF-8");
    };
    XRNA.parseSVG = function (inputFile) {
    };
    XRNA.parseSTR = function (inputFile) {
    };
    XRNA.writeSVG = function (outputFile) {
    };
    XRNA.writeCSV = function (outputFile) {
    };
    XRNA.writeXRNA = function (outputFile) {
    };
    XRNA.writeBPSeq = function (outputFile) {
    };
    XRNA.writeTR = function (outputFile) {
    };
    XRNA.toggleNucleotide = function (id) {
        // Toggle the presenece of id in XRNA.selectedNucleotideIDs
        if (!XRNA.selectedNucleotideIDs["delete"](id)) {
            XRNA.selectedNucleotideIDs.add(id);
        }
        XRNA.prepareScene();
        XRNA.renderScene();
    };
    XRNA.prepareScene = function () {
        var rnaMoleculesNucleotidesInnerHTMLs = new Array(), rnaMoleculesLabelLinesInnerHTMLs = new Array(), rnaMoleculesLabelContentsInnerHTMLs = new Array();
        for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < XRNA.rnaMolecules.length; rnaMoleculeIndex++) {
            var rnaMolecule = XRNA.rnaMolecules[rnaMoleculeIndex];
            var nucleotides = rnaMolecule[0];
            var nucleotideFirstIndex = rnaMolecule[1];
            for (var nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                var nucleotide = nucleotides[nucleotideIndex];
                var nucleotideID = XRNA.nucleotideID(rnaMoleculeIndex, nucleotideIndex);
                var nucleotideColor = XRNA.selectedNucleotideIDs.has(nucleotideID) ? [255, 0, 0] : nucleotide.color;
                rnaMoleculesNucleotidesInnerHTMLs.push('<text id=\'' + nucleotideID + '\' x=\'' + nucleotide.x + '\' y=\'' + nucleotide.y + '\' font-size=\'' + nucleotide.font[0] + '\' font-family=\'' + nucleotide.font[1] + '\' stroke=\'rgb(' + nucleotideColor[0] + ' ' + nucleotideColor[1] + ' ' + nucleotideColor[2] + ')\' onclick=\'XRNA.toggleNucleotide(this.id);\'>' + nucleotide.symbol + '</text>');
                var nucleotideLabelContent = nucleotide.labelContent;
                if (nucleotideLabelContent) {
                    var nucleotideLabelContentColor = nucleotideLabelContent[3];
                    rnaMoleculesLabelContentsInnerHTMLs.push('<text id=\'' + XRNA.labelContentID(rnaMoleculeIndex, nucleotideIndex) + '\' x=\'' + (nucleotideLabelContent[0] + nucleotide.x) + '\' y=\'' + (nucleotideLabelContent[1] + nucleotide.y) + '\' font-size=\'' + nucleotide.font[0] + '\' font-family=\'' + nucleotide.font[1] + '\' stroke=\'rgb(' + nucleotideLabelContentColor[0] + ' ' + nucleotideLabelContentColor[1] + ' ' + nucleotideLabelContentColor[2] + ')\'>' + nucleotideLabelContent[2] + '</text>');
                }
                var nucleotideLabelLine = nucleotide.labelLine;
                if (nucleotideLabelLine) {
                    rnaMoleculesLabelLinesInnerHTMLs.push('<line x1=\'' + (nucleotideLabelLine[0] + nucleotide.x) + '\' y1=\'' + (nucleotideLabelLine[1] + nucleotide.y) + '\' x2=\'' + (nucleotideLabelLine[2] + nucleotide.x) + '\' y2=\'' + (nucleotideLabelLine[3] + nucleotide.y) + '\' stroke=\'white\'></line>');
                }
            }
        }
        XRNA.canvasInnerHTML = rnaMoleculesNucleotidesInnerHTMLs.join('') + rnaMoleculesLabelContentsInnerHTMLs.join('') + rnaMoleculesLabelLinesInnerHTMLs.join('');
    };
    // public static idsOfElementsWithBoundingBoxesContainingMouse(x : number, y : number) : Array<string> {
    //     let boundingBoxesContainingMouse = new Array<string>();
    //     for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < XRNA.rnaMolecules.length; rnaMoleculeIndex++) {
    //         for (let ) {
    //         }
    //     }
    //     return boundingBoxesContainingMouse;
    // }
    XRNA.renderScene = function () {
        XRNA.canvas.innerHTML = XRNA.canvasInnerHTML;
        var rnaMoleculesBondLinesInnerHTMLs = new Array();
        for (var rnaMoleculeIndex = 0; rnaMoleculeIndex < XRNA.rnaMolecules.length; rnaMoleculeIndex++) {
            var nucleotides = XRNA.rnaMolecules[rnaMoleculeIndex][0];
            for (var nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                var nucleotide = nucleotides[nucleotideIndex];
                if (nucleotide.index < nucleotide.basePairIndex && nucleotide.basePairIndex >= 0 && nucleotide.basePairIndex < nucleotides.length) {
                    var boundingBox0 = document.getElementById(XRNA.nucleotideID(rnaMoleculeIndex, nucleotideIndex)).getBBox(), boundingBox1 = document.getElementById(XRNA.nucleotideID(rnaMoleculeIndex, nucleotide.basePairIndex)).getBBox();
                    rnaMoleculesBondLinesInnerHTMLs.push('<line x1=\'' + (boundingBox0.x + boundingBox0.width / 2.0) + '\' y1=\'' + (boundingBox0.y + boundingBox0.height / 2.0) + '\' x2=\'' + (boundingBox1.x + boundingBox1.width / 2.0) + '\' y2=\'' + (boundingBox1.y + boundingBox1.height / 2.0) + '\' stroke=\'white\'/>');
                }
            }
        }
        XRNA.canvas.innerHTML += rnaMoleculesBondLinesInnerHTMLs.join('');
    };
    XRNA.rnaMoleculeID = function (rnaMoleculeIndex) {
        return 'RNA Molecule #' + rnaMoleculeIndex;
    };
    XRNA.nucleotideID = function (rnaMoleculeIndex, nucleotideIndex) {
        return XRNA.rnaMoleculeID(rnaMoleculeIndex) + ' - Nucleotide #' + nucleotideIndex;
    };
    XRNA.labelContentID = function (rnaMoleculeIndex, nucleotideIndex) {
        return XRNA.nucleotideID(rnaMoleculeIndex, nucleotideIndex) + ' - Label Content';
    };
    // Controls the scene scale exponentially.
    XRNA.sceneTickScale = 0;
    XRNA.sceneOriginX = 0;
    XRNA.sceneOriginY = 0;
    XRNA.cacheCanvasOriginX = 0;
    XRNA.cacheCanvasOriginY = 0;
    XRNA.onDragX = 0;
    XRNA.onDragY = 0;
    XRNA.onDragFlag = false;
    XRNA.buttonIndex = BUTTON_INDEX.LEFT;
    XRNA.canvasInnerHTML = '';
    XRNA.selectedNucleotideIDs = new Set();
    XRNA.inputParserDictionary = {
        'xml': XRNA.parseXML,
        'xrna': XRNA.parseXRNA,
        'ss': XRNA.parseXML,
        'ps': XRNA.parseXML,
        'svg': XRNA.parseSVG,
        'str': XRNA.parseSTR
    };
    XRNA.outputWriterDictionary = {
        'svg': XRNA.writeSVG,
        'csv': XRNA.writeCSV,
        'xrna': XRNA.writeXRNA,
        'bpseq': XRNA.writeBPSeq,
        'tr': XRNA.writeTR
    };
    return XRNA;
}());
exports.XRNA = XRNA;
