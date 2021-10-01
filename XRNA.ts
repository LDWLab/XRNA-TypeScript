enum BUTTON_INDEX {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
    LEFT_RIGHT = 3,
    MIDDLE = 4,
    LEFT_MIDDLE = 5,
    RIGHT_MIDDLE = 6,
    LEFT_MIDDLE_RIGHT = 7
}

interface FileParser {
    (inputFileAsText : string) : void;
}

interface FileWriter {
    () : string;
}

class ParsingData {
    public refIDs = new Array<[number, number]>();
}

class Nucleotide {
    // The nucleotide symbol (A|C|G|T|U)
    public symbol : string;
    public x : number;
    public y : number;
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

    public constructor(symbol : string, x : number = 0.0, y : number = 0.0, basePairIndex = -1, labelLine = <[number, number, number, number]>null, labelContent = <[number, number, string, [number, number, number]]>null, font : [number, string] = [8, 'dialog'], color : [number, number, number] = [255, 255, 255]) {
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

    public static parse(inputLine : string, template = Nucleotide.template) : Nucleotide {
        let inputData = inputLine.split(/\s+/);
        let symbol : string;
        let x = 0.0;
        let y = 0.0;
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
                symbol = inputData[1];
                break;
            default:
                throw new Error("Unrecognized Nuc2D format");
        }
        return new Nucleotide(symbol, x, y, basePairIndex);
    }
}

export class XRNA {
    // Allow for multiple RNA molecules, each containing nucleotides.
    // [Nucleotide[], firstNucleotideIndex][]
    private static rnaMolecules : Array<[Array<Nucleotide>, number]>;

    private static canvas : HTMLElement;

    private static canvasBounds : DOMRect;

    private static sceneDressingData = {
        originX : 0,
        originY : 0,
        // zoom is on a linear scale. It is converted to exponential before use.
        zoom : 0,
        cacheOriginX : 0,
        cacheOriginY : 0,
        onDragX : 0,
        onDragY : 0
    };

    private static inputParserDictionary : Record<string, FileParser> = {
        'xml' : XRNA.parseXML,
        'xrna' : XRNA.parseXRNA,
        'ss' : XRNA.parseXML,
        'ps' : XRNA.parseXML
    };

    private static outputWriterDictionary : Record<string, FileWriter> = {
        'xrna' : XRNA.writeXRNA,
        'svg' : XRNA.writeSVG
    };

    private static sceneBounds = {
        minimumX : null,
        maximumX : null,
        minimumY : null,
        maximumY : null
    };

    private static sceneTransform : string[];

    // buttonIndex is always equal to the current mouse buttons (see BUTTON_INDEX) depressed within the canvas.
    private static buttonIndex = BUTTON_INDEX.NONE;

    private static previousOutputUrl : string;

    public static mainWithArgumentParsing(args = <string[]>[]) : void {
        // Parse the command-line arguments
        throw new Error("Argument parsing is not implemented.");
    }

    public static main(inputUrl = <string>null, outputUrls = <string[]>null, printVersionFlag = false) : void {
        if (printVersionFlag) {
            console.log("XRNA-GT-TypeScript 9/30/21");
        }
        XRNA.canvas = document.getElementById('canvas');
        XRNA.canvasBounds = XRNA.canvas.getBoundingClientRect();
        if (inputUrl) {
            XRNA.handleInputUrl(inputUrl);

            if (outputUrls) {
                outputUrls.forEach(outputUrl => XRNA.handleOutputUrl(outputUrl));
            }
        }

        // Collect the supported input file extensions.
        document.getElementById('input').setAttribute('accept', (Object.keys(XRNA.inputParserDictionary) as Array<string>).map(extension => "." + extension).join(', '));
        // Collect the supported output file extensions.
        let outputFileExtensionElement = document.getElementById('output file extension');
        (Object.keys(XRNA.outputWriterDictionary) as Array<string>).forEach(extension => {
            let option = document.createElement('option');
            extension = '.' + extension;
            option.value = extension;
            option.innerHTML = extension;

            outputFileExtensionElement.appendChild(option);
        });

        XRNA.canvas.oncontextmenu = event => {
            event.preventDefault();
            return false;
        }
        XRNA.canvas.onmousedown = event => {
            let newButtonIndex = XRNA.getButtonIndex(event)
            let pressedButtonIndex = newButtonIndex - XRNA.buttonIndex;
            XRNA.buttonIndex = newButtonIndex;
            switch (pressedButtonIndex) {
                case BUTTON_INDEX.RIGHT:
                    XRNA.sceneDressingData.onDragX = event.pageX;
                    XRNA.sceneDressingData.onDragY = event.pageY;
                    return false;
            }
        };
        XRNA.canvas.onmouseup = event => {
            let newButtonIndex = XRNA.getButtonIndex(event);
            let releasedButtonIndex = XRNA.buttonIndex - newButtonIndex;
            XRNA.buttonIndex = newButtonIndex;
            switch (releasedButtonIndex) {
                case BUTTON_INDEX.RIGHT:
                    XRNA.sceneDressingData.cacheOriginX = XRNA.sceneDressingData.originX;
                    XRNA.sceneDressingData.cacheOriginY = XRNA.sceneDressingData.originY;
                    return false;
            }
        };
        XRNA.canvas.onmousemove = event => {
            switch (XRNA.buttonIndex) {
                case BUTTON_INDEX.RIGHT:
                case BUTTON_INDEX.LEFT_RIGHT:
                case BUTTON_INDEX.LEFT_MIDDLE_RIGHT:
                    XRNA.sceneDressingData.originX = XRNA.sceneDressingData.cacheOriginX + event.pageX - XRNA.sceneDressingData.onDragX;
                    XRNA.sceneDressingData.originY = XRNA.sceneDressingData.cacheOriginY + event.pageY - XRNA.sceneDressingData.onDragY;
                    XRNA.updateSceneDressing();
                    break;
            }
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

    public static reset() : void {
        XRNA.rnaMolecules = new Array<[Nucleotide[], number]>();
        XRNA.resetView();
    }

    public static resetView() : void {
        XRNA.sceneDressingData.originX = 0;
        XRNA.sceneDressingData.originY = 0;
        XRNA.sceneDressingData.zoom = 0;
        XRNA.sceneDressingData.cacheOriginX = 0;
        XRNA.sceneDressingData.cacheOriginY = 0;
        XRNA.updateSceneDressing();
    }

    public static updateSceneDressing() : void {
        let scale = Math.pow(1.1, XRNA.sceneDressingData.zoom);
        document.getElementById('sceneDressing').setAttribute('transform', 'translate(' + XRNA.sceneDressingData.originX + ' ' + XRNA.sceneDressingData.originY + ') scale(' + scale + ' ' + scale + ')');
    }

    public static handleInputUrl(inputUrl : string) : void {
        inputUrl = inputUrl.trim();
        let fileExtension = inputUrl.split('.')[1].toLowerCase();
        XRNA.handleInputFile(XRNA.openUrl(inputUrl), fileExtension);
    }

    public static handleInputFile(inputFile : Blob, fileExtension : string) : void {
        XRNA.reset();
        new Promise(executor => {
            let fileReader = new FileReader();
            fileReader.addEventListener('load', () => executor(fileReader.result.toString()));
            fileReader.readAsText(inputFile, 'UTF-8');
        }).then(fileAsText => {
            let inputParser = XRNA.inputParserDictionary[fileExtension];
            inputParser(<string>fileAsText);
            XRNA.prepareScene();
            window.onresize = event => {
                XRNA.canvasBounds = XRNA.canvas.getBoundingClientRect();
                XRNA.fitSceneToBounds();
            };
            XRNA.canvas.onwheel = event => {
                XRNA.sceneDressingData.zoom += Math.sign(event.deltaY);
                XRNA.updateSceneDressing();
                return false;
            };
        });
    } 

    public static handleOutputUrl(outputUrl : string) : void {
        if (XRNA.previousOutputUrl) {
            window.URL.revokeObjectURL(XRNA.previousOutputUrl);
        }
        XRNA.previousOutputUrl = outputUrl;
        outputUrl = outputUrl.trim();
        let fileExtension = outputUrl.split('.')[1].toLowerCase();
        let outputWriter = XRNA.outputWriterDictionary[fileExtension];
        let url = window.URL.createObjectURL(new Blob([outputWriter()], {type: 'text/plain'}));
        let downloader = document.createElement('a');
        downloader.setAttribute('href', url);
        downloader.download = outputUrl;
        document.body.appendChild(downloader);
        downloader.click();
        document.body.removeChild(downloader);
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

    public static parseXMLHelper(root : Document | Element, parsingData : ParsingData) : void {
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
                    parsingData.refIDs = new Array<[number, number]>();
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
                    refIDsString.split(',').forEach(splitElement => {
                        let matchedGroups = splitElement.match(/^(-?\d+)-(-?\d+)$/);
                        if (matchedGroups) {
                            parsingData.refIDs.push([parseInt(matchedGroups[1]) - firstNucleotideIndex, parseInt(matchedGroups[2]) - firstNucleotideIndex]);
                        } else {
                            let refID = parseInt(splitElement) - firstNucleotideIndex;
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
                    parsingData.refIDs.forEach(refIDPair => {
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
            XRNA.parseXMLHelper(subElement, parsingData);
        }
    }

    public static parseXML(fileAsText : string) : void {
        XRNA.parseXMLHelper(new DOMParser().parseFromString(fileAsText, 'text/xml'), null);
    }

    public static parseXRNA(inputFileAsText : string) : void {
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
    }

    public static writeXRNA() : string {
        let xrnaFrontHalf = '';
        let xrnaBackHalf = '';
        let name = 'Unknown';
        xrnaFrontHalf += '<ComplexDocument Name=\'' + name + '\'>\n';
        xrnaBackHalf = '\n</ComplexDocument>' + xrnaBackHalf;
        xrnaFrontHalf += '<SceneNodeGeom CenterX=\'' + 0 + '\' CenterY=\'' + 0 + '\' Scale=\'' + 1 + '\'/>\n';
        xrnaFrontHalf += '<Complex Name=\'' + name + '\'>\n'
        xrnaBackHalf = '\n</Complex>' + xrnaBackHalf
        for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < XRNA.rnaMolecules.length; rnaMoleculeIndex++) {
            let rnaMolecule = XRNA.rnaMolecules[rnaMoleculeIndex];
            let nucleotides = rnaMolecule[0];
            let firstNucleotideIndex = rnaMolecule[1];
            xrnaFrontHalf += '<RNAMolecule Name=\'' + name + '\'>\n';
            xrnaBackHalf = '\n</RNAMolecule>' + xrnaBackHalf;
            xrnaFrontHalf += '<NucListData StartNucID=\'' + firstNucleotideIndex + '\' DataType=\'NucChar.XPos.YPos\'>\n';
            let nucLabelLists = '';
            let basePairs = '';
            for (let nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                let nucleotide = nucleotides[nucleotideIndex];
                xrnaFrontHalf += nucleotide.symbol + ' ' + nucleotide.x + ' ' + nucleotide.y + '\n';
                
                if (nucleotide.labelContent || nucleotide.labelContent) {
                    nucLabelLists += '<Nuc RefID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\'>\n<LabelList>\n';
                    if (nucleotide.labelLine) {
                        let line = nucleotide.labelLine;
                        nucLabelLists += 'l ' + line[0] + ' ' + line[1] + ' ' + line[2] + ' ' + line[3] + ' ' + '0.2 0 0.0 0 0 0 0\n';
                    }
                    if (nucleotide.labelContent) {
                        let content = nucleotide.labelContent;
                        nucLabelLists += 's ' + content[0] + ' ' + content[1] + ' 0.0 ' + nucleotide.font[0] + ' 0 0 \"' + content[2] + '\"\n';
                    }
                    nucLabelLists += '</LabelList>\n</Nuc>\n';
                }
                if (nucleotide.basePairIndex >= 0 && nucleotideIndex < nucleotide.basePairIndex) {
                    basePairs += '<BasePairs nucID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\' length=\'1\' bpNucID=\'' + (firstNucleotideIndex + nucleotide.basePairIndex) + '\' />\n'
                }
            }
            xrnaFrontHalf += '</NucListData>\n';
            xrnaFrontHalf += '<Nuc RefIDs=\'' + firstNucleotideIndex + '-' + (firstNucleotideIndex + nucleotides.length - 1) + '\' IsSchematic=\'false\' SchematicColor=\'0\' SchematicLineWidth=\'1.5\' SchematicBPLineWidth=\'1.0\' SchematicBPGap=\'2.0\' SchematicFPGap=\'2.0\' SchematicTPGap=\'2.0\' IsNucPath=\'false\' NucPathColor=\'ff0000\' NucPathLineWidth=\'0.0\' />\n';
            xrnaFrontHalf += nucLabelLists;
            xrnaFrontHalf += basePairs;
        }
        return xrnaFrontHalf + xrnaBackHalf;
    }

    public static writeSVG() : string {
        throw new Error('Not implemented yet.');
    }

    private static getBoundingBox(htmlElement : SVGTextElement | HTMLElement) : DOMRect {
        let boundingBox = htmlElement.getBoundingClientRect();
        boundingBox.y -= XRNA.canvasBounds.y;
        return boundingBox;
    }

    public static rnaMoleculeID(rnaMoleculeIndex : number) : string {
        return 'RNA Molecule #' + rnaMoleculeIndex;
    }

    public static nucleotideID(rnaMoleculeIndex : number, nucleotideIndex : number) : string {
        return XRNA.rnaMoleculeID(rnaMoleculeIndex) + ': Nucleotide #' + nucleotideIndex;
    }

    public static labelContentID(rnaMoleculeIndex : number, nucleotideIndex : number) : string {
        return XRNA.nucleotideID(rnaMoleculeIndex, nucleotideIndex) + ': Label Content';
    }

    public static fitSceneToBounds() : void {
        // Scale to fit the screen
        let sceneScale = Math.min(XRNA.canvasBounds.width / (XRNA.sceneBounds.maximumX - XRNA.sceneBounds.minimumX), XRNA.canvasBounds.height / (XRNA.sceneBounds.maximumY - XRNA.sceneBounds.minimumY));
        XRNA.sceneTransform.unshift('scale(' + sceneScale + ' ' + sceneScale + ')');
        // Center scene along the y axis.
        XRNA.sceneTransform.unshift('translate(0 ' + XRNA.canvasBounds.height + ')');
        document.getElementById('scene').setAttribute('transform', XRNA.sceneTransform.join(' '));
        // Remove the elements of XRNA.sceneTransform which were added by fitSceneToBounds().
        // This is necessary to ensure correct scene fitting when fitSceneToBounds() is called multiple times.
        // This occurs during window resizing.
        XRNA.sceneTransform.shift();
        XRNA.sceneTransform.shift();
    }

    public static linearlyInterpolate(x0 : number, x1 : number, interpolationFactor : number) : number {
        // See https://en.wikipedia.org/wiki/Linear_interpolation
        return (1 - interpolationFactor) * x0 + interpolationFactor * x1;
    }

    public static invertYTransform(y : number) : string {
        return 'translate(0 ' + y + ') scale(1 -1) translate(0 ' + -y +')';
    }

    public static prepareScene() : void {
        const svgNameSpaceURL = 'http://www.w3.org/2000/svg';
        while (XRNA.canvas.firstChild) {
            XRNA.canvas.removeChild(XRNA.canvas.firstChild);
        }
        let sceneDressingHTML = document.createElementNS(svgNameSpaceURL, 'g');
        sceneDressingHTML.setAttribute('id', 'sceneDressing');
        XRNA.canvas.appendChild(sceneDressingHTML);
        let sceneHTML = document.createElementNS(svgNameSpaceURL, 'g');
        sceneHTML.setAttribute('id', 'scene');
        sceneDressingHTML.appendChild(sceneHTML);
        XRNA.sceneBounds.minimumX = Number.MAX_VALUE,
        XRNA.sceneBounds.maximumX = -Number.MAX_VALUE,
        XRNA.sceneBounds.minimumY = Number.MAX_VALUE,
        XRNA.sceneBounds.maximumY = -Number.MAX_VALUE;
        for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < XRNA.rnaMolecules.length; rnaMoleculeIndex++) {
            let rnaMoleculeHTML = document.createElementNS(svgNameSpaceURL, 'g');
            let rnaMoleculeID = XRNA.rnaMoleculeID(rnaMoleculeIndex);
            rnaMoleculeHTML.setAttribute('id', rnaMoleculeID);
            sceneHTML.appendChild(rnaMoleculeHTML);
            let labelContentsGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
            labelContentsGroupHTML.setAttribute('id', rnaMoleculeID + ': Labels: Contents');
            rnaMoleculeHTML.appendChild(labelContentsGroupHTML);
            let labelLinesGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
            labelLinesGroupHTML.setAttribute('id', rnaMoleculeID + ': Labels: Lines');
            rnaMoleculeHTML.appendChild(labelLinesGroupHTML);
            let bondLinesGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
            bondLinesGroupHTML.setAttribute('id', rnaMoleculeID + ': Bond Lines');
            rnaMoleculeHTML.appendChild(bondLinesGroupHTML);
            let rnaMolecule = XRNA.rnaMolecules[rnaMoleculeIndex];
            let nucleotides = rnaMolecule[0];
            for (let nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                let nucleotide = nucleotides[nucleotideIndex];
                let nucleotideHTML = document.createElementNS(svgNameSpaceURL, 'text');
                nucleotideHTML.textContent = nucleotide.symbol;
                nucleotideHTML.setAttribute('id', XRNA.nucleotideID(rnaMoleculeIndex, nucleotideIndex));
                nucleotideHTML.setAttribute('x', '' + nucleotide.x);
                nucleotideHTML.setAttribute('y', '' + nucleotide.y);
                let nucleotideColor = nucleotide.color;
                nucleotideHTML.setAttribute('stroke', 'rgb(' + nucleotideColor[0] + ' ' + nucleotideColor[1] + ' ' + nucleotideColor[2] + ')');
                nucleotideHTML.setAttribute('font-size', '' + nucleotide.font[0]);
                nucleotideHTML.setAttribute('font-family', nucleotide.font[1]);
                nucleotideHTML.setAttribute('transform', XRNA.invertYTransform(nucleotide.y));
                rnaMoleculeHTML.appendChild(nucleotideHTML);
                let boundingBoxes = new Array<DOMRect>();
                let nucleotideBoundingBox = XRNA.getBoundingBox(nucleotideHTML);
                boundingBoxes.push(nucleotideBoundingBox);
                let nucleotideBoundingBoxCenterX = nucleotideBoundingBox.x + nucleotideBoundingBox.width / 2.0;
                let nucleotideBoundingBoxCenterY = nucleotideBoundingBox.y + nucleotideBoundingBox.height / 2.0;
                if (nucleotide.labelLine) {
                    let lineHTML = document.createElementNS(svgNameSpaceURL, 'line');
                    let labelLine = nucleotide.labelLine;
                    lineHTML.setAttribute('x1', '' + (nucleotideBoundingBoxCenterX + labelLine[0]));
                    lineHTML.setAttribute('y1', '' + (nucleotideBoundingBoxCenterY + labelLine[1]));
                    lineHTML.setAttribute('x2', '' + (nucleotideBoundingBoxCenterX + labelLine[2]));
                    lineHTML.setAttribute('y2', '' + (nucleotideBoundingBoxCenterY + labelLine[3]));
                    // Hardcode white for now.
                    lineHTML.setAttribute('stroke', 'white');
                    labelLinesGroupHTML.appendChild(lineHTML);
                }
                if (nucleotide.labelContent) {
                    let contentHTML = document.createElementNS(svgNameSpaceURL, 'text');
                    let labelContent = nucleotide.labelContent;
                    contentHTML.setAttribute('x', '' + (nucleotideBoundingBoxCenterX + labelContent[0]));
                    let y = (nucleotideBoundingBoxCenterY + labelContent[1]);
                    contentHTML.setAttribute('y', '' + y);
                    contentHTML.textContent = labelContent[2];
                    let labelColor = labelContent[3];
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
                    let bondLineHTML = document.createElementNS(svgNameSpaceURL, 'line');
                    let basePairedNucleotideBounds = XRNA.getBoundingBox(document.getElementById(XRNA.nucleotideID(rnaMoleculeIndex, nucleotide.basePairIndex)));
                    let basePairedNucleotideBoundsCenterX = basePairedNucleotideBounds.x + basePairedNucleotideBounds.width / 2.0;
                    let basePairedNucleotideBoundsCenterY = basePairedNucleotideBounds.y + basePairedNucleotideBounds.height / 2.0;
                    bondLineHTML.setAttribute('x1', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX, 0.25));
                    bondLineHTML.setAttribute('y1', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY, 0.25));
                    bondLineHTML.setAttribute('x2', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX, 0.75));
                    bondLineHTML.setAttribute('y2', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY, 0.75));
                    // Hardcode white for now.
                    bondLineHTML.setAttribute('stroke', 'white');
                    bondLinesGroupHTML.appendChild(bondLineHTML);
                }

                boundingBoxes.forEach(boundingBox => {
                    let
                        xPlusWidth = boundingBox.x + boundingBox.width,
                        yPlusHeight = boundingBox.y + boundingBox.height;
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
        XRNA.sceneTransform = new Array<string>();
        // Translate the scene to the origin.
        XRNA.sceneTransform.unshift('translate(' + -XRNA.sceneBounds.minimumX + ' ' + -XRNA.sceneBounds.minimumY + ')');
        // Invert the y axis.
        XRNA.sceneTransform.unshift('scale(1 -1)');
        XRNA.fitSceneToBounds();
    }
}