"use strict";
// import { ComplexScene2D } from "./xrnaDataStructures/ComplexScene2D"; 
// import { Nuc2D } from "./xrnaDataStructures/Nuc2D";
exports.__esModule = true;
exports.XRNA = void 0;
var Nucleotide = /** @class */ (function () {
    function Nucleotide(symbol, x, y, index, basePairIndex, label, font, color) {
        if (x === void 0) { x = 0.0; }
        if (y === void 0) { y = 0.0; }
        if (index === void 0) { index = Nucleotide.serialIndex; }
        if (basePairIndex === void 0) { basePairIndex = -1; }
        if (label === void 0) { label = null; }
        if (font === void 0) { font = [8, 'dialog']; }
        if (color === void 0) { color = [255, 255, 255]; }
        this.symbol = symbol;
        this.x = x;
        this.y = y;
        this.index = index;
        Nucleotide.serialIndex = index + 1;
        this.basePairIndex = basePairIndex;
        this.label = label;
        this.font = font;
        this.color = color;
    }
    Nucleotide.parse = function (inputLine, template) {
        if (template === void 0) { template = Nucleotide.template; }
        var inputData = inputLine.split(/\s+/);
        var character;
        var x = 0.0;
        var y = 0.0;
        var index = Nucleotide.serialIndex;
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
        return new Nucleotide(character, x, y, index, basePairIndex, null);
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
        if (printVersionFlag) {
            console.log("XRNA-GT-TypeScript 9/20/21");
        }
        if (inputUrl) {
            XRNA.handleInputUrl(inputUrl);
            if (outputUrls) {
                outputUrls.forEach(function (outputUrl) {
                    XRNA.handleOutputUrl(outputUrl);
                });
            }
        }
    };
    XRNA.reset = function () {
        XRNA.nucleotides = new Array();
    };
    XRNA.handleInputUrl = function (inputUrl) {
        inputUrl = inputUrl.trim().toLowerCase();
        var fileExtension = inputUrl.split('.')[1];
        XRNA.handleInputFile(XRNA.openUrl(inputUrl), fileExtension);
    };
    XRNA.handleInputFile = function (inputFile, fileExtension) {
        XRNA.reset();
        inputParserDictionary[fileExtension](inputFile);
    };
    XRNA.handleOutputUrl = function (outputUrl) {
        outputUrl = outputUrl.trim().toLowerCase();
        var fileExtension = outputUrl.split('.')[1];
        XRNA.handleOutputFile(XRNA.openUrl(outputUrl), fileExtension);
    };
    XRNA.handleOutputFile = function (outputFile, fileExtension) {
        outputWriterDictionary[fileExtension](outputFile);
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
        for (var index = 0; index < root.children.length; index++) {
            var subElement = void 0;
            subElement = root.children[index];
            // console.log('\t'.repeat(XRNA.tabCount) + subElement.tagName);
            switch (subElement.tagName) {
                case "ComplexDocument":
                    break;
                case "Complex":
                    break;
                case "WithComplex":
                    break;
                case "RNAMolecule":
                    break;
                case "Nuc":
                    break;
                case "NucChars":
                    break;
                case "NucSegment":
                    break;
                case "NucListData":
                    var innerHtml = subElement.innerHTML;
                    innerHtml = innerHtml.replace(/^\n/, '');
                    innerHtml = innerHtml.replace(/\n$/, '');
                    var innerHtmlLines = innerHtml.split('\n');
                    Nucleotide.template = subElement.getAttribute('DataType');
                    var currentRNAMolecule = new Array();
                    for (var index_1 = 0; index_1 < innerHtmlLines.length; index_1++) {
                        var line = innerHtmlLines[index_1];
                        if (!line.match(/^\s*$/)) {
                            currentRNAMolecule.push(Nucleotide.parse(line.trim()));
                        }
                    }
                    XRNA.nucleotides.push(currentRNAMolecule);
                    break;
                case "LabelList":
                    break;
                case "NucSymbol":
                    break;
                case "Label":
                    break;
                case "StringLabel":
                    break;
                case "CircleLabel":
                    break;
                case "TriangleLabel":
                    break;
                case "ParallelogramLabel":
                    break;
                case "LineLabel":
                    break;
                case "RNAFile":
                    break;
                case "BasePairs":
                    break;
                case "BasePair":
                    break;
                case "SceneNodeGeom":
                    break;
            }
            XRNA.tabCount++;
            XRNA.parseXMLHelper(subElement);
            XRNA.tabCount--;
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
    XRNA.renderScene = function () {
        var svgCanvas = document.getElementById('svgCanvas');
        var innerHTML = '';
        XRNA.nucleotides.forEach(function (rnaMolecule) {
            var minX = Number.MAX_VALUE;
            var minY = Number.MAX_VALUE;
            var maxX = -Number.MAX_VALUE;
            var maxY = -Number.MAX_VALUE;
            var nucleotideWithMinimumY = null;
            rnaMolecule.forEach(function (nucleotide) {
                if (nucleotide.x < minX) {
                    minX = nucleotide.x;
                }
                else if (nucleotide.x > maxX) {
                    maxX = nucleotide.x;
                }
                if (nucleotide.y < minY) {
                    minY = nucleotide.y;
                    nucleotideWithMinimumY = nucleotide;
                }
                else if (nucleotide.y > maxY) {
                    maxY = nucleotide.y;
                }
            });
            var canvasBoundingRectangle = svgCanvas.getBoundingClientRect();
            var scalar = Math.min(canvasBoundingRectangle.width / (maxX - minX), canvasBoundingRectangle.height / (maxY - minY));
            rnaMolecule.forEach(function (nucleotide) {
                // correct for off-screen elements.
                var x = nucleotide.x - minX;
                var y = nucleotide.y - minY;
                // correct for scale.
                x *= scalar;
                y *= scalar;
                // correct for inverted y axis.
                y = canvasBoundingRectangle.height - y;
                var nucleotideColor = nucleotide.color;
                // Add the nucleotide <text> element to the <svg> canvas.
                innerHTML += "<text x='" + x + "' y='" + y + "' fill='rgb(" + nucleotideColor[0] + ", " + nucleotideColor[1] + ", " + nucleotideColor[2] + ")' font-size='8'>" + nucleotide.symbol + "</text>";
                // If it exists, add the nucleotide's base pair <line> element to the <svg> canvas.
                if (nucleotide.basePairIndex != -1 && nucleotide.index > nucleotide.basePairIndex) {
                    var otherNucleotide = null;
                    var x1 = x;
                    var x2 = 0;
                    var y1 = y;
                    var y2 = 0;
                    innerHTML += "<line x1='" + x1 + " y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' />";
                }
            });
        });
        svgCanvas.innerHTML = innerHTML;
    };
    XRNA.tabCount = 0;
    return XRNA;
}());
exports.XRNA = XRNA;
var inputParserDictionary;
inputParserDictionary = {
    'xml': XRNA.parseXML,
    'xrna': XRNA.parseXRNA,
    'ss': XRNA.parseXML,
    'ps': XRNA.parseXML,
    'svg': XRNA.parseSVG,
    'str': XRNA.parseSTR
};
var outputWriterDictionary;
outputWriterDictionary = {
    'svg': XRNA.writeSVG,
    'csv': XRNA.writeCSV,
    'xrna': XRNA.writeXRNA,
    'bpseq': XRNA.writeBPSeq,
    'tr': XRNA.writeTR
};
var acceptableInputFileExtensions = Object.keys(inputParserDictionary);
var acceptableOutputFileExtensions = Object.keys(outputWriterDictionary);
for (var index = 0; index < acceptableInputFileExtensions.length; index++) {
    acceptableInputFileExtensions[index] = "." + acceptableInputFileExtensions[index];
}
for (var index = 0; index < acceptableOutputFileExtensions.length; index++) {
    acceptableOutputFileExtensions[index] = "." + acceptableOutputFileExtensions[index];
}
document.getElementById('input').setAttribute('accept', acceptableInputFileExtensions.join(', '));
document.getElementById('output').setAttribute('accept', acceptableOutputFileExtensions.join(', '));
XRNA.main(null, [], false);
