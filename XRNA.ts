// import { ComplexScene2D } from "./xrnaDataStructures/ComplexScene2D"; 
// import { Raphael } from "./raphael-2.3.0/raphael";

enum BUTTON_INDEX {
    LEFT = 1,
    MIDDLE = 4,
    RIGHT = 2,
}

interface FileHandler {
    (inputFile : Blob) : void;
}

class Nucleotide {
    // The nucleotide symbol (A|C|G|T|U)
    public symbol : string;
    public x : number;
    public y : number;
    public index : number
    public basePairIndex : number;
    // [x0, y0, x1, y1]
    public labelLine : [number, number, number, number];
    // [x, y, content, [r, g, b]]
    public labelContent : [number, number, string, [number, number, number]];
    // [fontSize, fontFamily]
    public font : [number, string];
    // rgb color space
    public color : [number, number, number];
    // The html template for nucleotide data (specified in XML DtD)
    public static template : string;
    // In case the index field is not provided, use the auto-incremented serialIndex
    private static serialIndex : number = 0;

    public constructor(symbol : string, x : number = 0.0, y : number = 0.0, index : number = Nucleotide.serialIndex, basePairIndex = -1, labelLine = <[number, number, number, number]>null, labelContent = <[number, number, string, [number, number, number]]>null, font : [number, string] = [8, 'dialog'], color : [number, number, number] = [255, 255, 255]) {
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

    public static parse(inputLine : string, template = Nucleotide.template) : Nucleotide {
        let inputData = inputLine.split(/\s+/);
        let symbol : string;
        let x = 0.0;
        let y = 0.0;
        let index = Nucleotide.serialIndex
        let basePairIndex = -1;
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
    }
}

export class XRNA {
    // Allow for multiple RNA molecules, each containing nucleotides.
    // [Nucleotide[], firstNucleotideIndex][]
    private static rnaMolecules : Array<[Array<Nucleotide>, number]>;

    private static canvas : HTMLElement;

    // Controls the scene scale exponentially.
    private static sceneTickScale = 0;

    private static sceneOriginX = 0;

    private static sceneOriginY = 0;

    private static cacheCanvasOriginX = 0;
    
    private static cacheCanvasOriginY = 0;

    private static onDragX = 0;

    private static onDragY = 0;

    private static onDragFlag = false;

    private static buttonIndex = BUTTON_INDEX.LEFT;

    private static canvasInnerHTML = '';

    private static selectedNucleotideIDs = new Set<string>();

    static inputParserDictionary : Record<string, FileHandler> = {
        'xml' : XRNA.parseXML,
        'xrna' : XRNA.parseXRNA,
        'ss' : XRNA.parseXML,
        'ps' : XRNA.parseXML,
        'svg' : XRNA.parseSVG,
        'str' : XRNA.parseSTR
    };

    static outputWriterDictionary : Record<string, FileHandler> = {
        'svg' : XRNA.writeSVG,
        'csv' : XRNA.writeCSV,
        'xrna' : XRNA.writeXRNA,
        'bpseq' : XRNA.writeBPSeq,
        'tr' : XRNA.writeTR
    }

    public static mainWithArgumentParsing(args : string[]) : void {
        // Parse the command-line arguments
        throw new Error("Argument parsing is not implemented.");
    }

    public static main(inputUrl? : string, outputUrls? : string[], printVersionFlag = false) : void {
        XRNA.canvas = document.getElementById('canvas');
        if (printVersionFlag) {
            console.log("XRNA-GT-TypeScript 9/20/21");
        }
        if (inputUrl) {
            XRNA.handleInputUrl(inputUrl);

            if (outputUrls) {
                outputUrls.forEach(outputUrl => XRNA.handleOutputUrl(outputUrl));
            }
        }
        XRNA.reset();
        // window.addEventListener('resize', _event => XRNA.renderScene(), true);
        XRNA.canvas.addEventListener('wheel', function(event) {
            XRNA.sceneTickScale += Math.sign(-event.deltaY);
            XRNA.renderScene();
        });
        XRNA.canvas.addEventListener('mouseup', event => XRNA.handleButtonRelease(event));
        XRNA.canvas.addEventListener('mousemove', event => XRNA.handleMouseMove(event));
        XRNA.canvas.addEventListener('mousedown', event => XRNA.handleButtonPress(event));
        XRNA.canvas.addEventListener('contextmenu', event => event.preventDefault());

        // Collect the allowable input file extensions.
        document.getElementById('input').setAttribute('accept', (Object.keys(XRNA.inputParserDictionary) as Array<string>).map(extension => "." + extension).join(', '));
        // Collect the allowable output file extensions.
        document.getElementById('output').setAttribute('accept', (Object.keys(XRNA.outputWriterDictionary) as Array<string>).map(extension => "." + extension).join(', '));
    }

    private static handleMouseMove(event) : void {
        switch (XRNA.buttonIndex) {
            case BUTTON_INDEX.LEFT:
                break;
            case BUTTON_INDEX.MIDDLE:
                break;
            case BUTTON_INDEX.RIGHT:
                if (XRNA.onDragFlag) {
                    let
                        displacementX = event.pageX - XRNA.onDragX,
                        displacementY = event.pageY - XRNA.onDragY;
                    if (XRNA.selectedNucleotideIDs.size == 0) {
                        XRNA.sceneOriginX = XRNA.cacheCanvasOriginX + displacementX;
                        XRNA.sceneOriginY = XRNA.cacheCanvasOriginY + displacementY;
                    }
                    XRNA.renderScene();
                }
                break;
        }
    }

    private static handleButtonPress(event) : void {
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
    }

    private static handleButtonRelease(event) : void {
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
                } else {
                    XRNA.selectedNucleotideIDs.forEach(selectedNucleotideID => {
                        let
                            idStrings = selectedNucleotideID.match(/\d+/g),
                            nucleotide = XRNA.rnaMolecules[parseInt(idStrings[0])][0][parseInt(idStrings[1])];
                        nucleotide.x += event.pageX - XRNA.onDragX;
                        nucleotide.y += event.pageY - XRNA.onDragY;
                    });
                    XRNA.prepareScene();
                    XRNA.renderScene();
                }
                break;
        }
    }

    private static getButtonIndex(event): BUTTON_INDEX {
        let index = -1;
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
            index = -1;
        } else if ('buttons' in event) {
            index = event.buttons;
        } else if ('which' in event) {
            index = event.which ;
        } else {
            index = event.button;
        }
        if (index in BUTTON_INDEX) {
            return <BUTTON_INDEX>index;
        }
        throw new Error("Unrecognized button index: " + index);
    }

    private static reset(resetRNAMoleculesFlag = true, resetSceneFlag = true) : void {
        if (resetRNAMoleculesFlag) {
            XRNA.rnaMolecules = new Array<[Array<Nucleotide>, number]>();
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
    }

    public static handleInputUrl(inputUrl : string) : void {
        inputUrl = inputUrl.trim().toLowerCase();
        let fileExtension = inputUrl.split('.')[1];
        XRNA.handleInputFile(XRNA.openUrl(inputUrl), fileExtension);
    }

    public static handleInputFile(inputFile : Blob, fileExtension : string) : void {
        XRNA.reset(false, false);
        let inputParser = XRNA.inputParserDictionary[fileExtension];
        inputParser(inputFile);

    }

    public static handleOutputUrl(outputUrl : string) : void {
        outputUrl = outputUrl.trim().toLowerCase();
        let fileExtension = outputUrl.split('.')[1];
        XRNA.handleOutputFile(XRNA.openUrl(outputUrl), fileExtension);
    }

    public static handleOutputFile(outputFile : Blob, fileExtension : string) : void {
        let outputWriter = XRNA.outputWriterDictionary[fileExtension];
        outputWriter(outputFile);
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

    private static refIDs : [number, number][];

    public static parseXMLHelper(root : Document | Element) {
        for (let index = 0; index < root.children.length; index++) {
            let subElement : Element;
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
                    XRNA.refIDs = new Array<[number, number]>();
                    let refIDsString = subElement.getAttribute('RefID') ?? subElement.getAttribute('RefIDs');
                    if (!refIDsString) {
                        throw new Error('Within the input file, a <Nuc> element is missing its RefID(s) attribute.');
                    }
                    refIDsString = refIDsString.replace(/\s+/, '');
                    // comma-separated list of (potentially ordered-paired, potentially negative) integers.
                    if (!refIDsString.match(/^(?:(?:-?\d+-)?-?\d+)(?:,(?:-?\d+-)?-?\d+)*$/)) {
                        throw new Error('Within the input file, a <Nuc> element\'s refID(s) attribute is improperly formatted. It should be a comma-separated list of integers, or ordered integer pairs separated by \'-\'.');
                    }
                    let firstNucleotideIndex = XRNA.rnaMolecules[XRNA.rnaMolecules.length - 1][1];
                    let refIDs = refIDsString.split(',').forEach(splitElement => {
                        let matchedGroups = splitElement.match(/^(-?\d+)-(-?\d+)$/);
                        if (matchedGroups) {
                            XRNA.refIDs.push([parseInt(matchedGroups[1]) - firstNucleotideIndex, parseInt(matchedGroups[2]) - firstNucleotideIndex]);
                        } else {
                            let refID = parseInt(splitElement) - firstNucleotideIndex;
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
                    let innerHTML = subElement.innerHTML;
                    innerHTML = innerHTML.replace(/^\n/, '');
                    innerHTML = innerHTML.replace(/\n$/, '');
                    let innerHTMLLines = innerHTML.split('\n');
                    Nucleotide.template = subElement.getAttribute('DataType');
                    let startingNucleotideIndexString = subElement.getAttribute('StartNucID');
                    if (!startingNucleotideIndexString) {
                        console.error("Within the input file, a <NucListData> element is missing its StartNucID attribute.");
                        // We cannot continue without a starting nucleotide index.
                        // Continuing to attempt to parse the current RNAMolecule will introduce errors.
                        throw new Error("Missing StartNucID attribute prevents RNAMolecule parsing.");
                    }
                    let startingNucleotideIndex = parseInt(startingNucleotideIndexString);
                    let currentNucleotides = new Array<Nucleotide>();
                    for (let index = 0; index < innerHTMLLines.length; index++) {
                        let line = innerHTMLLines[index];
                        if (!line.match(/^\s*$/)) {
                            currentNucleotides.push(Nucleotide.parse(line.trim()));
                        }
                    }
                    XRNA.rnaMolecules.push([currentNucleotides, startingNucleotideIndex]);
                    break;
                }
                case "LabelList": {
                    let innerHTML = subElement.innerHTML;
                    innerHTML = innerHTML.replace(/^\n/, '');
                    innerHTML = innerHTML.replace(/\n$/, '');
                    let innerHTMLLines = innerHTML.split('\n');
                    let labelContent : [number, number, string, [number, number, number]] = null;
                    let labelLine : [number, number, number, number] = null;
                    innerHTMLLines.forEach(innerHTMLLine => {
                        let splitLineElements = innerHTMLLine.split(/\s+/);
                        switch (splitLineElements[0].toLowerCase()[0]) {
                            case 'l':
                                labelLine = [parseFloat(splitLineElements[1]), parseFloat(splitLineElements[2]), parseFloat(splitLineElements[3]),parseFloat(splitLineElements[4])];
                                break;
                            case 's':
                                // Directly from XRNA source code (ComplexXMLParser.java):
                                // x y ang size font color
                                // Hardcode white for now.
                                let rgb = 0xFFFFFF;//parseInt(splitLineElements[splitLineElements.length - 2]);
                                labelContent = [parseFloat(splitLineElements[1]), parseFloat(splitLineElements[2]), splitLineElements[splitLineElements.length - 1].replace(/\"/g, ''), [(rgb >> 4) & 0xFF, (rgb >> 2) & 0xFF, rgb & 0xFF]];
                                break;
                        }
                    });
                    let nucleotides = XRNA.rnaMolecules[XRNA.rnaMolecules.length - 1][0];
                    XRNA.refIDs.forEach(refIDPair => {
                        for (let i = refIDPair[0]; i <= refIDPair[1]; i++) {
                            nucleotides[i].labelContent = labelContent;
                            nucleotides[i].labelLine = labelLine;
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
                    let indexString = subElement.getAttribute("nucID");
                    let lengthString = subElement.getAttribute("length");
                    let basePairedIndexString = subElement.getAttribute("bpNucID");
                    if (!indexString) {
                        console.error("Within the input file a <BasePairs> element is missing its nucID attribute.");
                        // We cannot continue without an index.
                        break;
                    }
                    let index = parseInt(indexString);
                    if (isNaN(index)) {
                        console.error("Within the input file a <BasePairs> element is defined incorrectly; nucID = \"" + indexString + "\" is not an integer.");
                        // We cannot continue without an index.
                        break;
                    }
                    let length : number;
                    if (!lengthString) {
                        length = 1;
                    } else {
                        length = parseInt(lengthString);
                        if (isNaN(length)) {
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
                    let basePairedIndex = parseInt(basePairedIndexString);
                    if (isNaN(basePairedIndex)) {
                        console.error("Within the input file a <BasePairs> element is defined incorrectly; bpNucID = \"" + basePairedIndexString + "\" is not an integer.");
                        // We cannot continue without a base-paired index.
                        break;
                    }
                    // Peek the most recently created rna molecule.
                    let currentRNAMolecule = XRNA.rnaMolecules[XRNA.rnaMolecules.length - 1];
                    let firstNucleotideIndex = currentRNAMolecule[1];
                    index -= firstNucleotideIndex;
                    basePairedIndex -= firstNucleotideIndex;
                    // Pair nucleotides.
                    for (let innerIndex = 0; innerIndex < length; innerIndex++) {
                        let nucleotideIndex0 = index + innerIndex;
                        let nucleotideIndex1 = basePairedIndex - innerIndex;
                        if (nucleotideIndex0 < 0) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex0 + " < 0");
                            continue;
                        }
                        if (nucleotideIndex0 >= currentRNAMolecule[0].length) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex0 + " >= " + currentRNAMolecule[0].length);
                            continue;
                        }
                        if (nucleotideIndex1 < 0) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex1 + " < 0");
                            continue;
                        }
                        if (nucleotideIndex1 >= currentRNAMolecule[0].length) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex1 + " >= " + currentRNAMolecule[0].length);
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
            XRNA.prepareScene();
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

    private static toggleNucleotide(id : string) : void {
        // Toggle the presenece of id in XRNA.selectedNucleotideIDs
        if (!XRNA.selectedNucleotideIDs.delete(id)) {
            XRNA.selectedNucleotideIDs.add(id);
        }
        XRNA.prepareScene();
        XRNA.renderScene();
    }

    public static prepareScene() : void {
        let
            rnaMoleculesNucleotidesInnerHTMLs = new Array<string>(),
            rnaMoleculesLabelLinesInnerHTMLs = new Array<string>(),
            rnaMoleculesLabelContentsInnerHTMLs = new Array<string>();

        for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < XRNA.rnaMolecules.length; rnaMoleculeIndex++) {
            let rnaMolecule = XRNA.rnaMolecules[rnaMoleculeIndex];
            let nucleotides = rnaMolecule[0];
            let nucleotideFirstIndex = rnaMolecule[1];
            for (let nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                let nucleotide = nucleotides[nucleotideIndex];
                let nucleotideID = XRNA.nucleotideID(rnaMoleculeIndex, nucleotideIndex);
                let nucleotideColor = XRNA.selectedNucleotideIDs.has(nucleotideID) ? [255, 0, 0] : nucleotide.color;
                rnaMoleculesNucleotidesInnerHTMLs.push('<text id=\'' + nucleotideID + '\' x=\'' + nucleotide.x + '\' y=\'' + nucleotide.y + '\' font-size=\'' + nucleotide.font[0] + '\' font-family=\'' + nucleotide.font[1] + '\' stroke=\'rgb(' + nucleotideColor[0] + ' ' + nucleotideColor[1] + ' ' + nucleotideColor[2] + ')\' onclick=\'XRNA.toggleNucleotide(this.id);\'>' + nucleotide.symbol + '</text>');
                let nucleotideLabelContent = nucleotide.labelContent;
                if (nucleotideLabelContent) {
                    let nucleotideLabelContentColor = nucleotideLabelContent[3];
                    rnaMoleculesLabelContentsInnerHTMLs.push('<text id=\'' + XRNA.labelContentID(rnaMoleculeIndex, nucleotideIndex) + '\' x=\'' + (nucleotideLabelContent[0] + nucleotide.x) + '\' y=\'' + (nucleotideLabelContent[1] + nucleotide.y) + '\' font-size=\'' + nucleotide.font[0] + '\' font-family=\'' + nucleotide.font[1] + '\' stroke=\'rgb(' + nucleotideLabelContentColor[0] + ' ' + nucleotideLabelContentColor[1] + ' ' + nucleotideLabelContentColor[2] + ')\'>' + nucleotideLabelContent[2] + '</text>');
                }
                let nucleotideLabelLine = nucleotide.labelLine;
                if (nucleotideLabelLine) {
                    rnaMoleculesLabelLinesInnerHTMLs.push('<line x1=\'' + (nucleotideLabelLine[0] + nucleotide.x) + '\' y1=\'' + (nucleotideLabelLine[1] + nucleotide.y) + '\' x2=\'' + (nucleotideLabelLine[2] + nucleotide.x) +'\' y2=\'' + (nucleotideLabelLine[3] + nucleotide.y) + '\' stroke=\'white\'></line>');
                }
            }
        }
        XRNA.canvasInnerHTML = rnaMoleculesNucleotidesInnerHTMLs.join('') + rnaMoleculesLabelContentsInnerHTMLs.join('') + rnaMoleculesLabelLinesInnerHTMLs.join('');
    }

    // public static idsOfElementsWithBoundingBoxesContainingMouse(x : number, y : number) : Array<string> {
    //     let boundingBoxesContainingMouse = new Array<string>();
    //     for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < XRNA.rnaMolecules.length; rnaMoleculeIndex++) {

    //         for (let ) {

    //         }
    //     }
    //     return boundingBoxesContainingMouse;
    // }

    public static renderScene() : void {
        XRNA.canvas.innerHTML = XRNA.canvasInnerHTML;
        let rnaMoleculesBondLinesInnerHTMLs = new Array<string>();

        for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < XRNA.rnaMolecules.length; rnaMoleculeIndex++) {
            let nucleotides = XRNA.rnaMolecules[rnaMoleculeIndex][0];
            for (let nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                let nucleotide = nucleotides[nucleotideIndex];
                if (nucleotide.index < nucleotide.basePairIndex && nucleotide.basePairIndex >= 0 && nucleotide.basePairIndex < nucleotides.length) {
                    let
                        boundingBox0 = (<any>document.getElementById(XRNA.nucleotideID(rnaMoleculeIndex, nucleotideIndex))).getBBox(),
                        boundingBox1 = (<any>document.getElementById(XRNA.nucleotideID(rnaMoleculeIndex, nucleotide.basePairIndex))).getBBox();
                    rnaMoleculesBondLinesInnerHTMLs.push('<line x1=\'' + (boundingBox0.x + boundingBox0.width / 2.0) + '\' y1=\'' + (boundingBox0.y + boundingBox0.height / 2.0) + '\' x2=\'' + (boundingBox1.x + boundingBox1.width / 2.0) + '\' y2=\'' + (boundingBox1.y + boundingBox1.height / 2.0) + '\' stroke=\'white\'/>');
                }
            }
        }
        XRNA.canvas.innerHTML += rnaMoleculesBondLinesInnerHTMLs.join('');
    }

    public static rnaMoleculeID(rnaMoleculeIndex : number) : string {
        return 'RNA Molecule #' + rnaMoleculeIndex;
    }

    public static nucleotideID(rnaMoleculeIndex : number, nucleotideIndex : number) : string {
        return XRNA.rnaMoleculeID(rnaMoleculeIndex) + ' - Nucleotide #' + nucleotideIndex;
    }

    public static labelContentID(rnaMoleculeIndex : number, nucleotideIndex : number) : string {
        return XRNA.nucleotideID(rnaMoleculeIndex, nucleotideIndex) + ' - Label Content';
    }
}