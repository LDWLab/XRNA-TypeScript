// import { ComplexScene2D } from "./xrnaDataStructures/ComplexScene2D"; 
// import { Nuc2D } from "./xrnaDataStructures/Nuc2D";

class Nucleotide {
    // The nucleotide symbol (A|C|G|T|U)
    public symbol : string;
    public x : number;
    public y : number;
    public index : number
    public basePairIndex : number;
    // [[x0, y0, x1, y1], [x, y, labelContent]]
    public label : [[number, number, number, number], [number, number, string]]
    // [fontSize, fontFamily]
    public font : [number, string]
    // rgb color space
    public color : [number, number, number];
    // The html template for nucleotide data (specified in XML DtD)
    public static template : string;
    // In case the index field is not provided, use the auto-incremented serialIndex
    private static serialIndex : number = 0;

    public constructor(symbol : string, x : number = 0.0, y : number = 0.0, index : number = Nucleotide.serialIndex, basePairIndex = -1, label = <[[number, number, number, number], [number, number, string]]>null, font : [number, string] = [8, 'dialog'], color : [number, number, number] = [255, 255, 255]) {
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

    public static parse(inputLine : string, template = Nucleotide.template) : Nucleotide {
        let inputData = inputLine.split(/\s+/);
        let character : string;
        let x = 0.0;
        let y = 0.0;
        let index = Nucleotide.serialIndex
        let basePairIndex = -1;
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
    }
}

export class XRNA {
    // Allow for multiple RNA molecules, each containing nucleotides.
    private static rnaMolecules : Array<[Array<Nucleotide>, number]>;

    public static mainWithArgumentParsing(args : string[]) : void {
        // Parse the command-line arguments
        throw new Error("Argument parsing is not implemented.");
    }

    public static main(inputUrl? : string, outputUrls? : string[], printVersionFlag = false) : void {
        if (printVersionFlag) {
            console.log("XRNA-GT-TypeScript 9/20/21");
        }
        if (inputUrl) {
            XRNA.handleInputUrl(inputUrl);

            if (outputUrls) {
                outputUrls.forEach(outputUrl => {
                    XRNA.handleOutputUrl(outputUrl);
                });
            }
        }
    }

    private static reset() : void {
        XRNA.rnaMolecules = new Array<[Array<Nucleotide>, number]>();
    }

    public static handleInputUrl(inputUrl : string) : void {
        inputUrl = inputUrl.trim().toLowerCase();
        let fileExtension = inputUrl.split('.')[1];
        XRNA.handleInputFile(XRNA.openUrl(inputUrl), fileExtension);
    }

    public static handleInputFile(inputFile : Blob, fileExtension : string) : void {
        XRNA.reset();
        inputParserDictionary[fileExtension](inputFile);
    }

    public static handleOutputUrl(outputUrl : string) : void {
        outputUrl = outputUrl.trim().toLowerCase();
        let fileExtension = outputUrl.split('.')[1];
        XRNA.handleOutputFile(XRNA.openUrl(outputUrl), fileExtension);
    }

    public static handleOutputFile(outputFile : Blob, fileExtension : string) : void {
        outputWriterDictionary[fileExtension](outputFile);
    }

    public static openUrl(fileUrl : string) : Blob {
        let request = new XMLHttpRequest();
        request.open('GET', fileUrl, false);
        request.responseType = "blob";
        let blob : Blob;
        request.onload = function() {
            blob = request.response;
        };
        request.send();
        return blob;
    }

    private static tabCount = 0;

    public static parseXMLHelper(root : Document | Element) {
        for (let index = 0; index < root.children.length; index++) {
            let subElement : Element;
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
                    let innerHtml = subElement.innerHTML;
                    innerHtml = innerHtml.replace(/^\n/, '');
                    innerHtml = innerHtml.replace(/\n$/, '');
                    let innerHtmlLines = innerHtml.split('\n');
                    Nucleotide.template = subElement.getAttribute('DataType');
                    let startingNucleotideIndex = subElement.getAttribute('');
                    let currentNucleotides = new Array<Nucleotide>();
                    for (let index = 0; index < innerHtmlLines.length; index++) {
                        let line = innerHtmlLines[index];
                        if (!line.match(/^\s*$/)) {
                            currentNucleotides.push(Nucleotide.parse(line.trim()));
                        }
                    }
                    XRNA.rnaMolecules.push([currentNucleotides, 0]);
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
    }

    public static parseXML(inputFile : Blob) : void {
        let reader = new FileReader();
        reader.addEventListener('load', function() {
            let parsed = new DOMParser().parseFromString(this.result.toString(), "text/xml");
            XRNA.parseXMLHelper(parsed);
            XRNA.renderScene();
        });
        reader.readAsText(inputFile, "UTF-8");
    }

    public static parseXRNA(inputFile : Blob) : void {
        let reader = new FileReader();
        reader.addEventListener('load', function() {
            let xmlContent = this.result.toString();
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
            let parsed = new DOMParser().parseFromString(xmlContent, "text/xml");
            XRNA.parseXMLHelper(parsed);
            XRNA.renderScene();
        });
        reader.readAsText(inputFile, "UTF-8");
        
    }

    public static parseSVG(inputFile : Blob) : void {

    }

    public static parseSTR(inputFile : Blob) : void {

    }

    public static writeSVG(outputFile : Blob) : void {

    }

    public static writeCSV(outputFile : Blob) : void {

    }

    public static writeXRNA(outputFile : Blob) : void {

    }

    public static writeBPSeq(outputFile : Blob) : void {

    }

    public static writeTR(outputFile : Blob) : void {

    }

    public static renderScene() : void {
        let svgCanvas = <any>document.getElementById('svgCanvas');
        let innerHTML = '';
        
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = -Number.MAX_VALUE;
        let maxY = -Number.MAX_VALUE;
        XRNA.rnaMolecules.forEach(rnaMolecule => {
            rnaMolecule.forEach(nucleotide => {
                if (nucleotide.x < minX) {
                    minX = nucleotide.x;
                } else if (nucleotide.x > maxX) {
                    maxX = nucleotide.x;
                }

                // Make room for text elements drawn at the top of the svg canvas.
                if (nucleotide.y - nucleotide.font[0] < minY) {
                    minY = nucleotide.y - nucleotide.font[0];
                } else if (nucleotide.y > maxY) {
                    maxY = nucleotide.y;
                }
            });
        });
        let canvasBoundingRectangle = svgCanvas.getBoundingClientRect()
        let scalar = Math.min(canvasBoundingRectangle.width / (maxX - minX), canvasBoundingRectangle.height / (maxY - minY));
        // NOTE: transformations are applied RIGHT-TO-LEFT!
        // Place elements' apparent origin at (0, 0).
        let transformText = "translate(" + -minX + " " + -minY + ")";
        // Correct for scale.
        transformText = "scale(" + scalar + " " + scalar +  ") " + transformText;
        // Correct the inverted y axis.
        transformText = "scale(" + 1 + " " + -1 +  ") " + transformText;
        // 
        innerHTML += "<g id = 'Rendering Correction' transform = '" + transformText + ">";
        innerHTML += "<g id = 'Nucleotides'>";
        let rnaMoleculeCounter = 0;
        XRNA.rnaMolecules.forEach(rnaMolecule => {
            innerHTML += "<g id = 'RNA Molecule #'" + rnaMoleculeCounter + "'>";
            rnaMolecule.forEach(nucleotide => {
                let nucleotideColor = nucleotide.color;
                let nucleotideFont = nucleotide.font;
                // Add the nucleotide <text> element to the <svg> canvas.
                innerHTML += "<text x='" + nucleotide.x + "' y='" + nucleotide.y + "' fill='rgb(" + nucleotideColor[0] + ", " + nucleotideColor[1] +  ", " + nucleotideColor[2] + ")' font-size='" + nucleotideFont[0] + "' font-family='" + nucleotideFont[1] + "'>" + nucleotide.symbol + "</text>";
                // If it exists, add the nucleotide's base pair <line> element to the <svg> canvas.
                if (nucleotide.basePairIndex != -1 && nucleotide.index > nucleotide.basePairIndex) {
                    let otherNucleotide = <Nucleotide>;
                    let x1 = nucleotide.x;
                    let x2 = otherNucleotide.x;
                    let y1 = nucleotide.y;
                    let y2 = otherNucleotide.y;
                    innerHTML += "<line x1 = '" + x1 + " y1 = '" + y1 + "' x2 = '" + x2 + "' y2 = '" + y2 + "'/>";
                }
            });
            innerHTML += "</g>"
            rnaMoleculeCounter++;
        });
        innerHTML += "</g>"
        svgCanvas.innerHTML = innerHTML;
    }
}

interface FileHandler {
    (inputFile : Blob) : void;
}

interface Renderable {
    // Renderable objects generate svg strings.
    () : string;
}

let inputParserDictionary : Record<string, FileHandler>;
inputParserDictionary = {
    'xml' : XRNA.parseXML,
    'xrna' : XRNA.parseXRNA,
    'ss' : XRNA.parseXML,
    'ps' : XRNA.parseXML,
    'svg' : XRNA.parseSVG,
    'str' : XRNA.parseSTR
};

let outputWriterDictionary : Record<string, FileHandler>;
outputWriterDictionary = {
    'svg' : XRNA.writeSVG,
    'csv' : XRNA.writeCSV,
    'xrna' : XRNA.writeXRNA,
    'bpseq' : XRNA.writeBPSeq,
    'tr' : XRNA.writeTR
}

var acceptableInputFileExtensions = Object.keys(inputParserDictionary) as Array<string>;
var acceptableOutputFileExtensions = Object.keys(outputWriterDictionary) as Array<string>;
for (let index = 0; index < acceptableInputFileExtensions.length; index++) {
    acceptableInputFileExtensions[index] = "." + acceptableInputFileExtensions[index];
}
for (let index = 0; index < acceptableOutputFileExtensions.length; index++) {
    acceptableOutputFileExtensions[index] = "." + acceptableOutputFileExtensions[index];
}
document.getElementById('input').setAttribute('accept', acceptableInputFileExtensions.join(', '));
document.getElementById('output').setAttribute('accept', acceptableOutputFileExtensions.join(', '));

XRNA.main(null, [], false);