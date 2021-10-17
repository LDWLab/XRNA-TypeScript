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
    public refIds = new Array<[number, number]>();
    public currentComplex : RNAComplex;
    public currentRNAMolecule : RNAMolecule;
}

interface VoidFunction<T> {
    (t : T) : void;
}

class Nucleotide {
    public parent : RNAMolecule;
    // The nucleotide symbol (A|C|G|U)
    public symbol : string;
    // The cartesian x coordinate
    public x : number;
    // The cartesian y coordinate
    public y : number;
    // The index of the base-paired Nucleotide within the parent RNAMolecule's Nucleotide[]
    public basePairIndex : number;
    // [x0, y0, x1, y1, stroke-width, [r, g, b]]
    public labelLine : [number, number, number, number, number, [number, number, number]];
    // [x, y, content, [font-size, font-family, font-style, font-weight], [r, g, b]]
    public labelContent : [number, number, string, [number, string, string, string], [number, number, number]];
    // [font-size, font-family, font-style, font-weight]
    public font : [number, string, string, string];
    // [r, g, b]
    public color : [number, number, number];
    // The html template for nucleotide data (specified within input XML files' DtD header element)
    public static template : string;

    public constructor(parent : RNAMolecule, symbol : string, font : [number, string, string, string], x : number = 0.0, y : number = 0.0, basePairIndex = -1, labelLine = <[number, number, number, number, number, [number, number, number]]>null, labelContent = <[number, number, string, [number, string, string, string], [number, number, number]]>null, color : [number, number, number] = [0, 0, 0]) {
        this.symbol = symbol.toUpperCase();
        if (!this.symbol.match(/^[ACGU]$/)) {
            throw new Error('The input nucleotide symbol is an invalid: ' + symbol + ' is not one of {A, C, G, U}.');
        }
        this.x = x;
        this.y = y;
        this.basePairIndex = basePairIndex;
        this.labelLine = labelLine;
        if (labelLine) {
            this.labelLine[0] += x;
            this.labelLine[1] += y;
            this.labelLine[2] += x;
            this.labelLine[3] += y;
        }
        this.labelContent = labelContent;
        if (labelContent) {
            this.labelContent[0] += x;
            this.labelContent[1] += y;
        }
        this.font = font;
        this.color = color;
        this.parent = parent;
    }

    public static parse(currentRNAMolecule : RNAMolecule, inputLine : string, font : [number, string, string, string] = null, template = Nucleotide.template) : Nucleotide {
        let
            inputData = inputLine.split(/\s+/),
            symbol : string,
            x = 0.0,
            y = 0.0,
            basePairIndex = -1;
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
    }
}

class RNAMolecule {
    parent : RNAComplex;
    nucleotides : Array<Nucleotide>;
    firstNucleotideIndex : number;
    name : string;

    constructor(parent : RNAComplex, nucleotides : Array<Nucleotide>, firstNucleotideIndex : number, name : string) {
        this.nucleotides = nucleotides;
        this.firstNucleotideIndex = firstNucleotideIndex;
        this.name = name;
    }
}

class RNAComplex {
    rnaMolecules : Array<RNAMolecule>;
    name : string;

    constructor(name : string) {
        this.rnaMolecules = new Array<RNAMolecule>();
        this.name = name;
    }
}

abstract class SelectionConstraint {
    abstract approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean;

    abstract getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{ rnaComplexIndex: number; rnaMoleculeIndex: number; nucleotideIndex: number; }>;

    abstract getErrorMessage() : string;

    static createErrorMessage(requirementDescription : string, selectableDescription : string) : string {
        return 'The selection constraint \"' + XRNA.selectionConstraintHTML.value + '\" requires selection of ' + requirementDescription + '. Select ' + selectableDescription + ' or change the selection constraint.';
    }
}

const svgNameSpaceURL = 'http://www.w3.org/2000/svg';

export class XRNA {
    private static rnaComplexes : Array<RNAComplex>;

    private static canvasHTML : HTMLElement;

    static selectionConstraintHTML : HTMLSelectElement;

    private static canvasBounds : DOMRect;

    private static complexDocumentName : string;

    private static complexName : string;

    private static sceneDressingData = {
        maximumZoom : 48,
        minimumZoom : -48,
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

    private static selectionConstraintDescriptionDictionary : Record<string, SelectionConstraint> = {
        'RNA Single Nucleotide' : new class extends SelectionConstraint {
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex < 0;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex: number; rnaMoleculeIndex: number; nucleotideIndex: number;}> {
                return [{
                    rnaComplexIndex : rnaComplexIndex,
                    rnaMoleculeIndex : rnaMoleculeIndex,
                    nucleotideIndex : nucleotideIndex
                }];
            }
            getErrorMessage() : string {
                return SelectionConstraint.createErrorMessage('a nucleotide without a base pair', 'a non-base-paired nucleotide');
            }
        },
        'RNA Single Strand' : new class extends SelectionConstraint {
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex < 0;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex: number; rnaMoleculeIndex: number; nucleotideIndex: number;}> {
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    adjacentNucleotideIndices = new Array<{ rnaComplexIndex: number; rnaMoleculeIndex: number; nucleotideIndex: number; }>();
                for (let adjacentNucleotideIndex = nucleotideIndex - 1; adjacentNucleotideIndex >= 0 && nucleotides[adjacentNucleotideIndex].basePairIndex < 0; adjacentNucleotideIndex--) {
                    adjacentNucleotideIndices.push({
                        rnaComplexIndex : rnaComplexIndex,
                        rnaMoleculeIndex : rnaMoleculeIndex,
                        nucleotideIndex : adjacentNucleotideIndex
                    });
                }
                adjacentNucleotideIndices.push({
                    rnaComplexIndex : rnaComplexIndex,
                    rnaMoleculeIndex : rnaMoleculeIndex,
                    nucleotideIndex : nucleotideIndex
                });
                for (let adjacentNucleotideIndex = nucleotideIndex + 1; adjacentNucleotideIndex < nucleotides.length && nucleotides[adjacentNucleotideIndex].basePairIndex < 0; adjacentNucleotideIndex++) {
                    adjacentNucleotideIndices.push({
                        rnaComplexIndex : rnaComplexIndex,
                        rnaMoleculeIndex : rnaMoleculeIndex,
                        nucleotideIndex : adjacentNucleotideIndex
                    });
                }
                return adjacentNucleotideIndices;
            }
            getErrorMessage() : string {
                return SelectionConstraint.createErrorMessage('a nucleotide without a base pair', 'a non-base-paired nucleotide');
            }
        },
        'RNA Single Base Pair' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                // Special case: base-paired immediately adjacent nucleotides.
                return basePairIndex >= 0 && (Math.abs(nucleotideIndex - basePairIndex) == 1 || ((nucleotideIndex == 0 || nucleotides[nucleotideIndex - 1].basePairIndex != basePairIndex + 1) && (nucleotideIndex == nucleotides.length - 1 || nucleotides[nucleotideIndex + 1].basePairIndex != basePairIndex - 1)));
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                return [{rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : nucleotideIndex}, {rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex}];
            }
            getErrorMessage() : string {
                return SelectionConstraint.createErrorMessage('a nucleotide with a base pair and no contiguous base pairs', 'a base-paired nucleotide outside a series of base pairs');
            }
        },
        'RNA Helix' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                let
                    helixIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>(),
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                helixIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : nucleotideIndex});
                helixIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : basePairIndex});
                if (Math.abs(nucleotideIndex - basePairIndex) == 1) {
                    return helixIndices;
                }
                let
                    adjacentNucleotideIndex = nucleotideIndex + 1,
                    adjacentBasePairIndex = basePairIndex - 1;
                for (; adjacentNucleotideIndex < nucleotides.length && adjacentBasePairIndex >= 0; adjacentNucleotideIndex++, adjacentBasePairIndex--) {
                    let
                        basePairIndexOfAdjacentNucleotide = nucleotides[adjacentNucleotideIndex].basePairIndex;
                    if (basePairIndexOfAdjacentNucleotide < 0) {
                        // The base-pair series has ended.
                        // Check the intermediate single strand for inclusion.
                        if (adjacentNucleotideIndex < adjacentBasePairIndex) {
                            let
                                intermediateIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>(),
                                includeIntermediateIndicesFlag : boolean;
                            // Upon encountering a base pair, set addIntermediateIndicesFlag to false.
                            // Checking the single-strandedness of adjacentBasePairIndex must be included because of the for-loop's decrementing it.
                            for (; adjacentNucleotideIndex <= adjacentBasePairIndex && (includeIntermediateIndicesFlag = nucleotides[adjacentNucleotideIndex].basePairIndex < 0); adjacentNucleotideIndex++) {
                                intermediateIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
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
                    helixIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
                    helixIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentBasePairIndex});
                    if (adjacentNucleotideIndex == adjacentBasePairIndex - 2) {
                        // Avoid duplicating the selection of nucleotides.
                        break;
                    }
                }
                adjacentNucleotideIndex = nucleotideIndex - 1;
                adjacentBasePairIndex = basePairIndex + 1;
                for (; adjacentNucleotideIndex >= 0 && adjacentBasePairIndex < nucleotides.length; adjacentNucleotideIndex--, adjacentBasePairIndex++) {
                    let
                        basePairIndexOfAdjacentNucleotide = nucleotides[adjacentNucleotideIndex].basePairIndex;
                    if (basePairIndexOfAdjacentNucleotide < 0) {
                        // The base-pair series has ended.
                        // Check the intermediate single strand for inclusion.
                        if (adjacentNucleotideIndex > adjacentBasePairIndex) {
                            let
                                intermediateIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>(),
                                includeIntermediateIndicesFlag : boolean;
                            // Upon encountering a base pair, set  addIntermediateIndicesFlag to false.
                            // Checking the single-strandedness of adjacentBasePairIndex must be included because of the for-loop's decrementing it.
                            for (; adjacentNucleotideIndex >= adjacentBasePairIndex && (includeIntermediateIndicesFlag = nucleotides[adjacentNucleotideIndex].basePairIndex < 0); adjacentNucleotideIndex--) {
                                intermediateIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
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
                    helixIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
                    helixIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentBasePairIndex});
                    if (adjacentNucleotideIndex == adjacentBasePairIndex + 2) {
                        // Avoid duplicating the selection of nucleotides.
                        break;
                    }
                }
                return helixIndices;
            }
            getErrorMessage() : string {
                return SelectionConstraint.createErrorMessage('a nucleotide with a base pair', 'a base-paired nucleotide');
            }
        },
        'RNA Stacked Helix' : new class extends SelectionConstraint{
            adjacentNucleotideIndices : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>;
            adjacentNucleotideIndex0 : number;
            adjacentNucleotideIndex1 : number;

            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                this.adjacentNucleotideIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>();
                this.adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex});
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                if (basePairIndex >= 0) {
                    this.adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : basePairIndex});
                    this.adjacentNucleotideIndex0 = nucleotideIndex;
                    this.adjacentNucleotideIndex1 = basePairIndex;
                    // In this case, we must complement the action of getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number).
                    this.getSelectedNucleotideIndicesHelper(rnaComplexIndex, rnaMoleculeIndex, () => this.adjacentNucleotideIndex0++, () => this.adjacentNucleotideIndex1--, () => this.adjacentNucleotideIndex0 >= nucleotides.length || this.adjacentNucleotideIndex1 < 0);
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
                    this.adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : this.adjacentNucleotideIndex0});
                }
                // Locate the nearest base-paired nucleotide index > nucleotideIndex
                for (;; this.adjacentNucleotideIndex1++) {
                    if (this.adjacentNucleotideIndex1 >= nucleotides.length) {
                        return false;
                    }
                    if (nucleotides[this.adjacentNucleotideIndex1].basePairIndex >= 0) {
                        break;
                    }
                    this.adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : this.adjacentNucleotideIndex1});
                }
                this.adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : this.adjacentNucleotideIndex0});
                this.adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : this.adjacentNucleotideIndex1});
                // Check whether the nearest base-paired nucleotides are base-paired together.
                return nucleotides[this.adjacentNucleotideIndex0].basePairIndex == this.adjacentNucleotideIndex1;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                this.getSelectedNucleotideIndicesHelper(rnaComplexIndex, rnaMoleculeIndex, () => this.adjacentNucleotideIndex0--, () => this.adjacentNucleotideIndex1++, nucleotides => this.adjacentNucleotideIndex0 < 0 || this.adjacentNucleotideIndex1 >= nucleotides.length);
                return this.adjacentNucleotideIndices;
            }
            getSelectedNucleotideIndicesHelper(rnaComplexIndex : number, rnaMoleculeIndex : number, adjacentNucleotideIndex0Incrementer : () => void, adjacentNucleotideIndex1Incrementer : () => void, adjacentNucleotideIndicesAreOutsideBoundsChecker : (nucleotides : Nucleotide[]) => boolean) : void {
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    intermediateIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>();
                for (;;) {
                    if (Math.abs(this.adjacentNucleotideIndex0 - this.adjacentNucleotideIndex1) < 2) {
                        this.adjacentNucleotideIndices = this.adjacentNucleotideIndices.concat(intermediateIndices);
                        // Avoid duplicating selected elements.
                        break;
                    }
                    let cacheNucleotideIndex0 = this.adjacentNucleotideIndex0;
                    let cacheNucleotideIndex1 = this.adjacentNucleotideIndex1;
                    adjacentNucleotideIndex0Incrementer();
                    adjacentNucleotideIndex1Incrementer();
                    if (adjacentNucleotideIndicesAreOutsideBoundsChecker(nucleotides)) {
                        break;
                    }
                    let adjacentNucleotideIndex0BasePair = nucleotides[this.adjacentNucleotideIndex0].basePairIndex;
                    let adjacentNucleotideIndex1BasePair = nucleotides[this.adjacentNucleotideIndex1].basePairIndex;
                    let adjacentNucleotideIndex0HasBasePair = adjacentNucleotideIndex0BasePair >= 0;
                    let adjacentNucleotideIndex1HasBasePair = adjacentNucleotideIndex1BasePair >= 0;
                    if (adjacentNucleotideIndex0HasBasePair && adjacentNucleotideIndex1HasBasePair) {
                        if (adjacentNucleotideIndex0BasePair == this.adjacentNucleotideIndex1) {
                            // The probe nucleotides are bonded to one another.
                            this.adjacentNucleotideIndices.push({
                                rnaComplexIndex : rnaComplexIndex,
                                rnaMoleculeIndex : rnaMoleculeIndex,
                                nucleotideIndex : this.adjacentNucleotideIndex0
                            });
                            this.adjacentNucleotideIndices.push({
                                rnaComplexIndex : rnaComplexIndex,
                                rnaMoleculeIndex : rnaMoleculeIndex,
                                nucleotideIndex : this.adjacentNucleotideIndex1
                            });
                            // Include the intermediate nucleotides (those between bonded-together probe nucleotides).
                            this.adjacentNucleotideIndices = this.adjacentNucleotideIndices.concat(intermediateIndices);
                            intermediateIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>();
                        } else {
                            // The probe nucleotides have diverged (they are no longer exclusively bonded to one another).
                            break;
                        }
                    } else if (adjacentNucleotideIndex0HasBasePair) {
                        // Stall adjacentNucleotideIndex0 until adjacentNucleotideIndex1 has a base pair.
                        this.adjacentNucleotideIndex0 = cacheNucleotideIndex0;
                        intermediateIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex: this.adjacentNucleotideIndex1});
                    } else if (adjacentNucleotideIndex1HasBasePair) {
                        // Stall adjacentNucleotideIndex1 until adjacentNucleotideIndex0 has a base pair.
                        this.adjacentNucleotideIndex1 = cacheNucleotideIndex1;
                        intermediateIndices.push({
                            rnaComplexIndex : rnaComplexIndex,
                            rnaMoleculeIndex : rnaMoleculeIndex,
                            nucleotideIndex : this.adjacentNucleotideIndex0
                        });
                    } else {
                        // Neither nucleotide has a base pair (they are in single strands).
                        intermediateIndices.push({
                            rnaComplexIndex : rnaComplexIndex,
                            rnaMoleculeIndex : rnaMoleculeIndex,
                            nucleotideIndex : this.adjacentNucleotideIndex0
                        });
                        intermediateIndices.push({
                            rnaComplexIndex : rnaComplexIndex,
                            rnaMoleculeIndex : rnaMoleculeIndex,
                            nucleotideIndex : this.adjacentNucleotideIndex1
                        });
                    }
                }
            }
            getErrorMessage() : string {
                return SelectionConstraint.createErrorMessage('a base-paired nucleotide within a stacked helix', 'a base-paired nucleotide with proximate nucleotides on either side exclusively bonded to the other');
            }
        },
        'RNA Sub-domain' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                let
                    adjacentNucleotideIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>(),
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                adjacentNucleotideIndices.push({
                    rnaComplexIndex : rnaComplexIndex,
                    rnaMoleculeIndex : rnaComplexIndex,
                    nucleotideIndex : nucleotideIndex
                });
                adjacentNucleotideIndices.push({
                    rnaComplexIndex : rnaComplexIndex,
                    rnaMoleculeIndex : rnaComplexIndex,
                    nucleotideIndex : basePairIndex
                });
                let
                    lesserAdjacentNucleotideIndex : number,
                    greaterAdjacentNucleotideIndex : number;
                if (nucleotideIndex < basePairIndex) {
                    lesserAdjacentNucleotideIndex = nucleotideIndex;
                    greaterAdjacentNucleotideIndex = basePairIndex;
                } else {
                    lesserAdjacentNucleotideIndex = basePairIndex;
                    greaterAdjacentNucleotideIndex = nucleotideIndex;
                }
                let
                    positiveDisplacement : number;
                for (positiveDisplacement = 1; lesserAdjacentNucleotideIndex + positiveDisplacement < nucleotides.length && (basePairIndex = nucleotides[lesserAdjacentNucleotideIndex + positiveDisplacement].basePairIndex) >= 0 && basePairIndex == greaterAdjacentNucleotideIndex - positiveDisplacement; positiveDisplacement++) {
                    adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : lesserAdjacentNucleotideIndex + positiveDisplacement});
                    adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : greaterAdjacentNucleotideIndex - positiveDisplacement});
                }
                let
                    negativeDisplacement : number;
                for (negativeDisplacement = 1; greaterAdjacentNucleotideIndex + negativeDisplacement < nucleotides.length && (basePairIndex = nucleotides[greaterAdjacentNucleotideIndex + negativeDisplacement].basePairIndex) >= 0 && basePairIndex == lesserAdjacentNucleotideIndex - negativeDisplacement; negativeDisplacement++) {
                    adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : lesserAdjacentNucleotideIndex - negativeDisplacement});
                    adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : greaterAdjacentNucleotideIndex + negativeDisplacement});
                }
                for (let adjacentNucleotideIndex = lesserAdjacentNucleotideIndex + positiveDisplacement; adjacentNucleotideIndex < greaterAdjacentNucleotideIndex + negativeDisplacement; adjacentNucleotideIndex++) {
                    adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
                }
                return adjacentNucleotideIndices;
            }
            getErrorMessage() : string {
                return SelectionConstraint.createErrorMessage('a nucleotide with a base pair', 'a base-paired nucleotide');
            }
        },
        'RNA Cycle' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                let
                    cycleIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>(),
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    lowerAdjacentNucleotideIndex : number,
                    upperAdjacentNucleotideIndex : number;
                if (nucleotides[nucleotideIndex].basePairIndex < 0) {
                    cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: nucleotideIndex});
                    for (lowerAdjacentNucleotideIndex = nucleotideIndex - 1;; lowerAdjacentNucleotideIndex--) {
                        if (lowerAdjacentNucleotideIndex < 0) {
                            return cycleIndices;
                        }
                        if (nucleotides[lowerAdjacentNucleotideIndex].basePairIndex >= 0) {
                            break;
                        }
                        cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex});
                    }
                    for (upperAdjacentNucleotideIndex = nucleotideIndex + 1;; upperAdjacentNucleotideIndex++) {
                        if (upperAdjacentNucleotideIndex == nucleotides.length) {
                            return cycleIndices;
                        }
                        if (nucleotides[upperAdjacentNucleotideIndex].basePairIndex >= 0) {
                            break;
                        }
                        cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex});
                    }
                    for (; lowerAdjacentNucleotideIndex >= 0 && nucleotides[lowerAdjacentNucleotideIndex].basePairIndex == upperAdjacentNucleotideIndex; lowerAdjacentNucleotideIndex--, upperAdjacentNucleotideIndex++) {
                        cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex});
                        cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex});
                    }
                } else {
                    lowerAdjacentNucleotideIndex = nucleotideIndex;
                    upperAdjacentNucleotideIndex = nucleotides[nucleotideIndex].basePairIndex;
                    if (lowerAdjacentNucleotideIndex > upperAdjacentNucleotideIndex) {
                        let
                            temp = lowerAdjacentNucleotideIndex;
                        lowerAdjacentNucleotideIndex = upperAdjacentNucleotideIndex;
                        upperAdjacentNucleotideIndex = temp;
                    }
                    cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex});
                    cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex});
                    let
                        negativeDisplacementMagnitude = 1,
                        positiveDisplacementMagnitude = 1;
                    while (lowerAdjacentNucleotideIndex - negativeDisplacementMagnitude >= 0) {
                        if (nucleotides[lowerAdjacentNucleotideIndex - negativeDisplacementMagnitude].basePairIndex != upperAdjacentNucleotideIndex + negativeDisplacementMagnitude) {
                            break;
                        }
                        cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex - negativeDisplacementMagnitude});
                        cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex + negativeDisplacementMagnitude});
                        negativeDisplacementMagnitude++;
                    }
                    while (lowerAdjacentNucleotideIndex + positiveDisplacementMagnitude < nucleotides.length) {
                        if (nucleotides[lowerAdjacentNucleotideIndex + positiveDisplacementMagnitude].basePairIndex != upperAdjacentNucleotideIndex - positiveDisplacementMagnitude) {
                            break;
                        }
                        cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex + positiveDisplacementMagnitude});
                        cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex - positiveDisplacementMagnitude});
                        positiveDisplacementMagnitude++;
                    }
                    let
                        encounteredBondedNucleotideFlag = false;
                    for (let adjacentNucleotideIndex = lowerAdjacentNucleotideIndex + positiveDisplacementMagnitude; adjacentNucleotideIndex <= upperAdjacentNucleotideIndex - positiveDisplacementMagnitude; adjacentNucleotideIndex++) {
                        encounteredBondedNucleotideFlag ||= nucleotides[adjacentNucleotideIndex].basePairIndex >= 0;
                        cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: adjacentNucleotideIndex});
                    }
                    if (encounteredBondedNucleotideFlag) {
                        return cycleIndices;
                    } else {
                        lowerAdjacentNucleotideIndex -= negativeDisplacementMagnitude;
                        upperAdjacentNucleotideIndex += negativeDisplacementMagnitude;
                    }
                }
                while (nucleotides[lowerAdjacentNucleotideIndex].basePairIndex < upperAdjacentNucleotideIndex) {
                    cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex});
                    if (lowerAdjacentNucleotideIndex == 0) {
                        return cycleIndices;
                    }
                    lowerAdjacentNucleotideIndex--;
                }
                let
                    basePairIndex : number;
                while ((basePairIndex = nucleotides[upperAdjacentNucleotideIndex].basePairIndex) < 0 || basePairIndex > lowerAdjacentNucleotideIndex) {
                    cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex});
                    if (upperAdjacentNucleotideIndex == nucleotides.length - 1) {
                        return cycleIndices;
                    }
                    upperAdjacentNucleotideIndex++;
                }
                for (let negativeDisplacementMagnitude = 0; nucleotides[lowerAdjacentNucleotideIndex - negativeDisplacementMagnitude].basePairIndex == upperAdjacentNucleotideIndex + negativeDisplacementMagnitude; negativeDisplacementMagnitude++) {
                    cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: lowerAdjacentNucleotideIndex - negativeDisplacementMagnitude});
                    cycleIndices.push({rnaComplexIndex: rnaComplexIndex, rnaMoleculeIndex: rnaMoleculeIndex, nucleotideIndex: upperAdjacentNucleotideIndex + negativeDisplacementMagnitude});
                }
                return cycleIndices;
            }
            getErrorMessage() : string {
                throw new Error("This code should be unreachable.");
            }
        },
        'RNA List Nucs' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return false;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessage() : string {
                return "This selection constraint is not used for left-click nucleotide selection.";
            }
        },
        'RNA Strand' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : 
            Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                let
                    adjacentNucleotideIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>(),
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaComplexIndex].nucleotides;
                for (let adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
                }
                return adjacentNucleotideIndices;
            }
            getErrorMessage() : string {
                throw new Error("This code should be unreachable.");
            }
        },
        'RNA Color Unit' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    color = nucleotides[nucleotideIndex].color,
                    adjacentNucleotideIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>();
                for (let adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    let
                        adjacentNucleotideColor = nucleotides[adjacentNucleotideIndex].color;
                    if (adjacentNucleotideColor[0] == color[0] && adjacentNucleotideColor[1] == color[1] && adjacentNucleotideColor[2] == color[2]) {
                        adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
                    }
                }
                return adjacentNucleotideIndices;
            }
            getErrorMessage() : string {
                throw new Error("This code should be unreachable.");
            }
        },
        'RNA Named Group' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                // For now, named-group support is not implemented.
                return false;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessage() : string {
                return SelectionConstraint.createErrorMessage('a nucleotide within a named group', 'a nucleotide within a named group');
            }
        },
        'RNA Strand Group' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                let
                    strandNucleotideIndices = new Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}>(),
                    rnaComplex = XRNA.rnaComplexes[rnaComplexIndex];
                for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < rnaComplex.rnaMolecules.length; rnaMoleculeIndex++) {
                    let
                        nucleotides = rnaComplex.rnaMolecules[rnaMoleculeIndex].nucleotides;
                    for (let nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                        strandNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : nucleotideIndex});
                    }
                }
                return strandNucleotideIndices;
            }
            getErrorMessage() : string {
                throw new Error("This code should be unreachable.");
            }
        },
        'Labels Only' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                // Select no nucleotides, but do not produce an error.
                // This replicates XRNA-GT behavior.
                return [];   
            }
            getErrorMessage() : string {
                throw new Error("This code should be unreachable.");
            }
        },
        'Entire Scene' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<{rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number}> {
                // Select no indices.
                return [];
            }
            getErrorMessage() : string {
                throw new Error("This code should be unreachable.")
            }
        },
    };

    private static sceneBounds = {
        minimumX : null,
        maximumX : null,
        minimumY : null,
        maximumY : null
    };

    private static sceneTransform : string[];

    // buttonIndex is always equal to the current mouse button(s) (see BUTTON_INDEX) depressed within the canvas.
    private static buttonIndex = BUTTON_INDEX.NONE;

    private static previousOutputUrl : string;

    private static selection = {
        boundingBoxHTMLs : new Array<HTMLElement>(),
        nucleotides : new Array<Nucleotide>(),
    };

    public static mainWithArgumentParsing(args = <string[]>[]) : void {
        // Parse the command-line arguments
        throw new Error("Argument parsing is not implemented.");
    }

    public static main(inputUrl = <string>null, outputUrls = <string[]>null, printVersionFlag = false) : void {
        let
            zoomSlider = document.getElementById('zoom slider');
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
                outputUrls.forEach(outputUrl => XRNA.handleOutputUrl(outputUrl));
            }
        }

        // Populate the selection-constraining drop-down with the supported constraints.
        XRNA.selectionConstraintHTML = <HTMLSelectElement>document.getElementById('selection constraint');
        for (let selectionConstraint of Object.keys(XRNA.selectionConstraintDescriptionDictionary)) {
            XRNA.selectionConstraintHTML.appendChild(new Option(selectionConstraint));
        }

        // Collect the supported input file extensions.
        document.getElementById('input').setAttribute('accept', (Object.keys(XRNA.inputParserDictionary) as Array<string>).map(extension => "." + extension).join(', '));
        // Collect the supported output file extensions.
        let
            outputFileExtensionElement = document.getElementById('output file extension');
        (Object.keys(XRNA.outputWriterDictionary) as Array<string>).forEach(extension => {
            let option = document.createElement('option');
            extension = '.' + extension;
            option.value = extension;
            option.innerHTML = extension;

            outputFileExtensionElement.appendChild(option);
        });

        XRNA.canvasHTML.oncontextmenu = event => {
            event.preventDefault();
            return false;
        }
        XRNA.canvasHTML.onmousedown = event => {
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
        XRNA.canvasHTML.onmouseup = event => {
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
        XRNA.canvasHTML.onmousemove = event => {
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

    private static getButtonIndex(event) : BUTTON_INDEX {
        let
            index = -1;
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
        XRNA.rnaComplexes = new Array<RNAComplex>();
        XRNA.resetSelection();
        XRNA.resetView();
    }

    public static resetSelection() : void {
        // Clear the previous selection
        XRNA.selection.boundingBoxHTMLs.forEach(boundingBoxHTML => {
            boundingBoxHTML.setAttribute('stroke', 'none');
        });
        XRNA.selection.boundingBoxHTMLs = new Array<HTMLElement>();
        XRNA.selection.nucleotides = new Array<Nucleotide>();
    }

    public static resetView() : void {
        XRNA.sceneDressingData.originX = 0;
        XRNA.sceneDressingData.originY = 0;
        XRNA.sceneDressingData.zoom = 0;
        XRNA.sceneDressingData.cacheOriginX = 0;
        XRNA.sceneDressingData.cacheOriginY = 0;
        XRNA.updateSceneDressing();
        (<any>document.getElementById('zoom slider')).value = XRNA.sceneDressingData.zoom;
    }

    public static setZoom(zoom : number) : void {
        XRNA.sceneDressingData.zoom = XRNA.clamp(XRNA.sceneDressingData.minimumZoom, zoom, XRNA.sceneDressingData.maximumZoom);
        XRNA.updateSceneDressing();
    }

    public static updateSceneDressing() : void {
        let
            scale = Math.pow(1.05, XRNA.sceneDressingData.zoom);
        document.getElementById('sceneDressing').setAttribute('transform', 'translate(' + XRNA.sceneDressingData.originX + ' ' + XRNA.sceneDressingData.originY + ') scale(' + scale + ' ' + scale + ')');
    }

    public static handleInputUrl(inputUrl : string) : void {
        inputUrl = inputUrl.trim();
        XRNA.handleInputFile(XRNA.openUrl(inputUrl), inputUrl.split('.')[1].toLowerCase());
    }

    public static handleInputFile(inputFile : Blob, fileExtension : string) : void {
        XRNA.reset();
        new Promise(executor => {
            let
                fileReader = new FileReader();
            fileReader.addEventListener('load', () => executor(fileReader.result.toString()));
            fileReader.readAsText(inputFile, 'UTF-8');
        }).then(fileAsText => {
            let
                inputParser = XRNA.inputParserDictionary[fileExtension];
            inputParser(<string>fileAsText);
            XRNA.prepareScene();
            window.onresize = event => {
                XRNA.canvasBounds = XRNA.canvasHTML.getBoundingClientRect();
                XRNA.fitSceneToBounds();
            };
            XRNA.canvasHTML.onwheel = event => {
                // Intuitive scrolling of the middle-mouse wheel requires negation of deltaY.
                XRNA.setZoom(XRNA.sceneDressingData.zoom - Math.sign(event.deltaY));
                (<any>document.getElementById('zoom slider')).value = XRNA.sceneDressingData.zoom;
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
        let
            fileExtension = outputUrl.split('.')[1].toLowerCase(),
            outputWriter = XRNA.outputWriterDictionary[fileExtension],
            url = window.URL.createObjectURL(new Blob([outputWriter()], {type: 'text/plain'})),
            downloader = document.createElement('a');
        downloader.setAttribute('href', url);
        downloader.download = outputUrl;
        document.body.appendChild(downloader);
        downloader.click();
        document.body.removeChild(downloader);
    }

    public static openUrl(fileUrl : string) : Blob {
        let
            request = new XMLHttpRequest();
        request.open('GET', fileUrl, false);
        request.responseType = "blob";
        let
            blob : Blob;
        request.onload = function() {
            blob = request.response;
        };
        request.send();
        return blob;
    }

    public static parseRGB(rgbAsString : string) : [number, number, number] {
        let
            rgbAsNumber = parseInt(rgbAsString),
            validColorFlag = true;
        if (isNaN(rgbAsNumber)) {
            // Attempt parsing colorAsString as a hexadecimal string.
            rgbAsNumber = parseInt('0x' + rgbAsString);
            validColorFlag = !isNaN(rgbAsNumber);
        }
        let
            rgb : [number, number, number];
        if (validColorFlag) {
            rgb = [(rgbAsNumber >> 16) & 0xFF, (rgbAsNumber >> 8) & 0xFF, rgbAsNumber & 0xFF];
        } else {
            rgb = [0, 0, 0];
            console.error('Invalid color string: ' + rgbAsString + ' is an invalid color. Only hexadecimal or integer values are accepted.');
        }
        return rgb;
    }

    // Converts the input RGB values to a hexadecimal string 
    public static compressRGB(rgb : [number, number, number]) : string {
        return ((rgb[0] << 16) | (rgb[1] << 8) | (rgb[2])).toString(16);
    }

    public static clamp(minimum : number, value : number, maximum : number) : number {
        return Math.min(Math.max(minimum, value), maximum);
    }

    public static applyHelperFunctionsToRefIDs(refIDs : Array<[number, number]>, helperFunctions : Array<VoidFunction<Nucleotide>>) : void {
        refIDs.forEach(refIDPair => {
            for (let refIndex = refIDPair[0]; refIndex <= refIDPair[1]; refIndex++) {
                let 
                    nucleotide = XRNA.rnaComplexes.at(-1).rnaMolecules.at(-1).nucleotides[refIndex];
                for (let helperFunctionIndex = 0; helperFunctionIndex < helperFunctions.length; helperFunctionIndex++) {
                    let
                        helperFunction = helperFunctions[helperFunctionIndex];
                    helperFunction(nucleotide);
                }
            }
        });
    }

    public static parseXMLHelper(root : Document | Element, parsingData : ParsingData) : void {
        for (let index = 0; index < root.children.length; index++) {
            let
                subElement : Element;
            subElement = root.children[index];
            switch (subElement.tagName) {
                case "ComplexDocument": {
                    XRNA.complexDocumentName = subElement.getAttribute('Name') ?? 'Unknown';
                    break;
                } 
                case "Complex": {
                    let
                        currentComplex = new RNAComplex(subElement.getAttribute('Name') ?? 'Unknown');
                    parsingData.currentComplex = currentComplex;
                    XRNA.rnaComplexes.push(currentComplex);
                    break;
                }
                case "WithComplex": {
                    break;
                }
                case "RNAMolecule": {
                    let
                        currentRNAMolecule = new RNAMolecule(parsingData.currentComplex, null, null, subElement.getAttribute('Name') ?? 'Unknown');
                    parsingData.currentComplex.rnaMolecules.push(currentRNAMolecule);
                    parsingData.currentRNAMolecule = currentRNAMolecule;
                    break;
                }
                case "Nuc": {
                    parsingData.refIds = new Array<[number, number]>();
                    let
                        refIdsString = subElement.getAttribute('RefID');
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
                    let
                        firstNucleotideIndex = parsingData.currentRNAMolecule.firstNucleotideIndex;
                    refIdsString.split(',').forEach(splitElement => {
                        let
                            matchedGroups = splitElement.match(/^(-?\d+)-(-?\d+)$/);
                        if (matchedGroups) {
                            parsingData.refIds.push([parseInt(matchedGroups[1]) - firstNucleotideIndex, parseInt(matchedGroups[2]) - firstNucleotideIndex]);
                        } else {
                            let
                                refID = parseInt(splitElement) - firstNucleotideIndex;
                            parsingData.refIds.push([refID, refID]);
                        }
                    });
                    let
                        helperFunctions = new Array<VoidFunction<Nucleotide>>(),
                        colorAsString = subElement.getAttribute('Color');
                    if (colorAsString) {
                        helperFunctions.push(nucleotide => nucleotide.color = XRNA.parseRGB(colorAsString));
                    }
                    let
                        fontIDAsString = subElement.getAttribute('FontID');
                    if (fontIDAsString) {
                        let
                            fontID = parseInt(fontIDAsString);
                        if (isNaN(fontID)) {
                            throw new Error('Invalid fontID: ' + fontIDAsString + ' is not an integer.');
                        }
                        helperFunctions.push(nucleotide => nucleotide.font = XRNA.fontIDToFont(fontID));
                    }
                    helperFunctions.push(nucleotide => nucleotide.font[0] = subElement.getAttribute('FontSize') ? parseFloat(fontIDAsString) : 8.0);
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
                    let
                        innerHTML = subElement.innerHTML;
                    innerHTML = innerHTML.replace(/^\n/, '');
                    innerHTML = innerHTML.replace(/\n$/, '');
                    let
                        innerHTMLLines = innerHTML.split('\n');
                    Nucleotide.template = subElement.getAttribute('DataType');
                    let
                        startingNucleotideIndexString = subElement.getAttribute('StartNucID');
                    if (!startingNucleotideIndexString) {
                        console.error("Within the input file, a <NucListData> element is missing its StartNucID attribute.");
                        // We cannot continue without a starting nucleotide index.
                        // Continuing to attempt to parse the current RNAMolecule will introduce errors.
                        throw new Error("Missing StartNucID attribute prevents RNAMolecule parsing.");
                    }
                    let
                        startingNucleotideIndex = parseInt(startingNucleotideIndexString),
                        currentNucleotides = new Array<Nucleotide>();
                    for (let index = 0; index < innerHTMLLines.length; index++) {
                        let
                            line = innerHTMLLines[index];
                        if (!line.match(/^\s*$/)) {
                            currentNucleotides.push(Nucleotide.parse(parsingData.currentRNAMolecule, line.trim(), XRNA.fontIDToFont(0)));
                        }
                    }
                    let
                        newestRnaMolecule = parsingData.currentRNAMolecule;
                    newestRnaMolecule.nucleotides = currentNucleotides;
                    newestRnaMolecule.firstNucleotideIndex = startingNucleotideIndex;
                    break;
                }
                case "LabelList": {
                    let
                        innerHTML = subElement.innerHTML;
                    innerHTML = innerHTML.replace(/^\n/, '');
                    innerHTML = innerHTML.replace(/\n$/, '');
                    let
                        innerHTMLLines = innerHTML.split('\n'),
                        labelContent : [number, number, string, [number, string, string, string], [number, number, number]] = null,
                        labelLine : [number, number, number, number, number, [number, number, number]] = null;
                    innerHTMLLines.forEach(innerHTMLLine => {
                        let
                            splitLineElements = innerHTMLLine.split(/\s+/);
                        switch (splitLineElements[0].toLowerCase()) {
                            case 'l': {
                                labelLine = [parseFloat(splitLineElements[1]), parseFloat(splitLineElements[2]), parseFloat(splitLineElements[3]), parseFloat(splitLineElements[4]), parseFloat(splitLineElements[5]), XRNA.parseRGB(splitLineElements[6])];
                                break;
                            }
                            case 's': {
                                // From XRNA source code (ComplexXMLParser.java):
                                // l x y ang size fontID color content
                                // ang is ignored by XRNA source code.
                                let
                                    font = XRNA.fontIDToFont(parseInt(splitLineElements[5]));
                                font[0] = parseFloat(splitLineElements[4]);
                                labelContent = [parseFloat(splitLineElements[1]), parseFloat(splitLineElements[2]), splitLineElements[7].replace(/\"/g, ''), font, XRNA.parseRGB(splitLineElements[6])];
                                break;
                            }
                        }
                    });
                    XRNA.applyHelperFunctionsToRefIDs(parsingData.refIds, [nucleotide => {
                        nucleotide.labelContent = labelContent;
                        nucleotide.labelLine = labelLine;
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
                    let
                        indexString = subElement.getAttribute("nucID"),
                        lengthString = subElement.getAttribute("length"),
                        basePairedIndexString = subElement.getAttribute("bpNucID");
                    if (!indexString) {
                        console.error("Within the input file a <BasePairs> element is missing its nucID attribute.");
                        // We cannot continue without an index.
                        break;
                    }
                    let
                        index = parseInt(indexString);
                    if (isNaN(index)) {
                        console.error("Within the input file a <BasePairs> element is defined incorrectly; nucID = \"" + indexString + "\" is not an integer.");
                        // We cannot continue without an index.
                        break;
                    }
                    let
                        length : number;
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
                    let
                        basePairedIndex = parseInt(basePairedIndexString);
                    if (isNaN(basePairedIndex)) {
                        console.error("Within the input file a <BasePairs> element is defined incorrectly; bpNucID = \"" + basePairedIndexString + "\" is not an integer.");
                        // We cannot continue without a base-paired index.
                        break;
                    }
                    let
                        currentRNAMolecule = parsingData.currentRNAMolecule,
                        firstNucleotideIndex = currentRNAMolecule.firstNucleotideIndex;
                    index -= firstNucleotideIndex;
                    basePairedIndex -= firstNucleotideIndex;
                    // Pair nucleotides.
                    for (let innerIndex = 0; innerIndex < length; innerIndex++) {
                        let 
                            nucleotideIndex0 = index + innerIndex,
                            nucleotideIndex1 = basePairedIndex - innerIndex,
                            nucleotides = currentRNAMolecule.nucleotides;
                        if (nucleotideIndex0 < 0) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex0 + " < 0");
                            continue;
                        }
                        if (nucleotideIndex0 >= nucleotides.length) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex0 + " >= " + currentRNAMolecule[0].length);
                            continue;
                        }
                        if (nucleotideIndex1 < 0) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex1 + " < 0");
                            continue;
                        }
                        if (nucleotideIndex1 >= nucleotides.length) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex1 + " >= " + currentRNAMolecule[0].length);
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
        let
            xrnaFrontHalf = '',
            xrnaBackHalf = '';
        xrnaFrontHalf += '<ComplexDocument Name=\'' + XRNA.complexDocumentName + '\'>\n';
        xrnaBackHalf = '\n</ComplexDocument>' + xrnaBackHalf;
        xrnaFrontHalf += '<SceneNodeGeom CenterX=\'' + 0 + '\' CenterY=\'' + 0 + '\' Scale=\'' + 1 + '\'/>\n';
        for (let rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            xrnaFrontHalf += '<Complex Name=\'' + XRNA.complexName + '\'>\n'
            xrnaBackHalf = '\n</Complex>' + xrnaBackHalf
            let
                complex = XRNA.rnaComplexes[rnaComplexIndex];
            for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < complex.rnaMolecules.length; rnaMoleculeIndex++) {
                let
                    rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex],
                    nucleotides = rnaMolecule.nucleotides,
                    firstNucleotideIndex = rnaMolecule.firstNucleotideIndex;
                xrnaFrontHalf += '<RNAMolecule Name=\'' + rnaMolecule.name + '\'>\n';
                xrnaBackHalf = '\n</RNAMolecule>' + xrnaBackHalf;
                xrnaFrontHalf += '<NucListData StartNucID=\'' + firstNucleotideIndex + '\' DataType=\'NucChar.XPos.YPos\'>\n';
                let
                    nucs = '',
                    nucLabelLists = '',
                    basePairs = '';
                for (let nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    let
                        nucleotide = nucleotides[nucleotideIndex];
                    xrnaFrontHalf += nucleotide.symbol + ' ' + nucleotide.x + ' ' + nucleotide.y + '\n';
                    nucs += '<Nuc RefID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\' Color=\'' + XRNA.compressRGB(nucleotide.color) + '\' FontID=\'' + XRNA.fontToFontID(nucleotide.font) + '\'></Nuc>'
                    
                    if (nucleotide.labelContent || nucleotide.labelContent) {
                        nucLabelLists += '<Nuc RefID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\'>\n<LabelList>\n';
                        if (nucleotide.labelLine) {
                            let
                                line = nucleotide.labelLine,
                                lineColor = line[5];
                            nucLabelLists += 'l ' + line[0] + ' ' + line[1] + ' ' + line[2] + ' ' + line[3] + ' ' + line[4] + ' ' + XRNA.compressRGB(lineColor) + ' 0.0 0 0 0 0\n';
                        }
                        if (nucleotide.labelContent) {
                            let
                                content = nucleotide.labelContent,
                                contentColor = content[4],
                                contentFont = content[3];
                            nucLabelLists += 's ' + content[0] + ' ' + content[1] + ' 0.0 ' + contentFont[0] + ' ' + XRNA.fontToFontID(contentFont) + ' ' + XRNA.compressRGB(contentColor) + ' \"' + content[2] + '\"\n';
                        }
                        nucLabelLists += '</LabelList>\n</Nuc>\n';
                    }
                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex < nucleotide.basePairIndex) {
                        basePairs += '<BasePairs nucID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\' length=\'1\' bpNucID=\'' + (firstNucleotideIndex + nucleotide.basePairIndex) + '\' />\n'
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
    }

    public static writeSVG() : string {
        let
            canvas = <HTMLElement>XRNA.canvasHTML.cloneNode(true);
        canvas.removeAttribute('id');
        canvas.removeAttribute('class');
        for (let rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            let
                complex = XRNA.rnaComplexes[rnaComplexIndex];
            for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < complex.rnaMolecules.length; rnaMoleculeIndex++) {
                let
                    rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex],
                    nucleotides = rnaMolecule.nucleotides;
            }
        }
        return canvas.outerHTML;
    }

    private static getBoundingBox(htmlElement : SVGTextElement | SVGLineElement | HTMLElement) : DOMRect {
        let
            boundingBox = htmlElement.getBoundingClientRect();
        boundingBox.y -= XRNA.canvasBounds.y;
        return boundingBox;
    }

    public static complexID(rnaComplexIndex : number) : string {
        return 'RNA Complex #' + rnaComplexIndex;
    }

    public static rnaMoleculeID(parentID : string, rnaMoleculeIndex : number) : string {
        return parentID + ': RNA Molecule #' + rnaMoleculeIndex;
    }

    public static nucleotideID(parentID : string, nucleotideIndex : number) : string {
        return parentID + ': Nucleotide #' + nucleotideIndex;
    }

    public static labelContentID(parentID : string) : string {
        return parentID + ': Label Content';
    }

    public static labelLineID(parentID : string) : string {
        return parentID + ': Label Line';
    }

    public static boundingBoxID(parentID : string) : string {
        return parentID + ': Bounding Box';
    }

    public static fitSceneToBounds() : void {
        // Scale to fit the screen
        let
            sceneScale = Math.min(XRNA.canvasBounds.width / (XRNA.sceneBounds.maximumX - XRNA.sceneBounds.minimumX), XRNA.canvasBounds.height / (XRNA.sceneBounds.maximumY - XRNA.sceneBounds.minimumY));
        XRNA.sceneTransform.unshift('scale(' + sceneScale + ' ' + sceneScale + ')');
        document.getElementById('scene').setAttribute('transform', XRNA.sceneTransform.join(' '));
        // Remove the elements of XRNA.sceneTransform which were added by fitSceneToBounds().
        // This is necessary to ensure correct scene fitting when fitSceneToBounds() is called multiple times.
        // This occurs during window resizing.
        XRNA.sceneTransform.shift();
    }

    public static linearlyInterpolate(x0 : number, x1 : number, interpolationFactor : number) : number {
        // See https://en.wikipedia.org/wiki/Linear_interpolation
        return (1 - interpolationFactor) * x0 + interpolationFactor * x1;
    }

    public static invertYTransform(y : number) : string {
        return 'translate(0 ' + y + ') scale(1 -1) translate(0 ' + -y +')';
    }

    public static distanceSquared(x0 : number, y0 : number, x1 : number, y1 : number) : number {
        let
            dx = x1 - x0,
            dy = y1 - y0;
        return dx * dx + dy * dy;
    }

    public static distance(x0 : number, y0 : number, x1 : number, y1 : number) : number {
        return Math.sqrt(XRNA.distanceSquared(x0, y0, x1, y1));
    }

    public static fontIDToFont(fontID : number) : [number, string, string, string] {
        // Adapted from StringUtil.java:ssFontToFont
        switch (fontID) {
            case 0:
                return [null, 'Helvetica', 'normal', 'normal'];
            case 1:
                return [null, 'Helvetica', 'italic', 'normal'];
            case 2:
                return [null, 'Helvetica', 'normal', 'bold'];
            case 3:
                return [null, 'Helvetica', 'italic', 'bold'];
            case 4:
                return [null, 'TimesRoman', 'normal', 'normal'];
            case 5:
                return [null, 'TimesRoman', 'italic', 'normal'];
            case 6:
                return [null, 'TimesRoman', 'normal', 'bold'];
            case 7:
                return [null, 'TimesRoman', 'italic', 'bold'];
            case 8:
                return [null, 'Courier', 'normal', 'normal'];
            case 9:
                return [null, 'Courier', 'italic', 'normal'];
            case 10:
                return [null, 'Courier', 'normal', 'bold'];
            case 11:
                return [null, 'Courier', 'italic', 'bold'];
            case 12:
                return [null, 'TimesRoman', 'normal', 'normal'];
            case 13:
                return [null, 'Dialog', 'normal', 'normal'];
            case 14:
                return [null, 'Dialog', 'italic', 'normal'];
            case 15:
                return [null, 'Dialog', 'normal', 'bold'];
            case 16:
                return [null, 'Dialog', 'italic', 'bold'];
            case 17:
                return [null, 'DialogInput', 'normal', 'normal'];
            case 18:
                return [null, 'DialogInput', 'italic', 'normal'];
            case 19:
                return [null, 'DialogInput', 'normal', 'bold'];
            case 20:
                return [null, 'DialogInput', 'italic', 'bold'];
            default:
                return [null, 'Helvetica', 'normal', 'normal'];
        }
    }

    public static fontToFontID(font : [number, string, string, string]) : number {
        // A logical inversion of fontIDToFont. Implemented for backward compatibility.
        switch (font[1] + '_' + font[2] + '_' + font[3]) {
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
    }

    public static onClickLabel(labelHTML : HTMLElement) : void {
        XRNA.resetSelection();
        let
            boundingBoxHTML = document.getElementById(XRNA.boundingBoxID(labelHTML.getAttribute('id')));
        boundingBoxHTML.setAttribute('stroke', 'red');
        XRNA.selection.boundingBoxHTMLs.push(boundingBoxHTML);
    }

    public static onClickNucleotide(nucleotideHTML : HTMLElement) : void {
        XRNA.resetSelection();

        let 
            indices = /^.*#(\d+).*#(\d+).*#(\d+).*$/g.exec(nucleotideHTML.id),
            rnaComplexIndex = parseInt(indices[1]),
            rnaMoleculeIndex = parseInt(indices[2]),
            nucleotideIndex = parseInt(indices[3]),
            selectionConstraint = XRNA.selectionConstraintDescriptionDictionary[XRNA.selectionConstraintHTML.value];
        if (selectionConstraint.approveSelectedIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex)) {
            selectionConstraint.getSelectedNucleotideIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex).forEach(adjacentNucleotideIndices => {
                let
                    rnaComplexIndex = adjacentNucleotideIndices.rnaComplexIndex,
                    rnaMoleculeIndex = adjacentNucleotideIndices.rnaMoleculeIndex,
                    nucleotideIndex = adjacentNucleotideIndices.nucleotideIndex,
                    boundingBoxHTML = document.getElementById(XRNA.boundingBoxID(XRNA.nucleotideID(XRNA.rnaMoleculeID(XRNA.complexID(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex)));
                XRNA.selection.boundingBoxHTMLs.push(boundingBoxHTML);
                XRNA.selection.nucleotides.push(XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex]);
                boundingBoxHTML.setAttribute('stroke', 'red');
            });
        } else {
            alert(selectionConstraint.getErrorMessage());
        }
    }

    public static prepareScene() : void {
        let
            sceneDressingHTML = document.getElementById('sceneDressing');
        sceneDressingHTML.setAttribute('id', 'sceneDressing');
        while (sceneDressingHTML.firstChild) {
            sceneDressingHTML.removeChild(sceneDressingHTML.firstChild);
        }
        document.getElementById('background').setAttribute('onclick', 'XRNA.resetSelection();');
        XRNA.canvasHTML.appendChild(sceneDressingHTML);
        let
            sceneHTML = document.createElementNS(svgNameSpaceURL, 'g');
        sceneHTML.setAttribute('id', 'scene');
        sceneDressingHTML.appendChild(sceneHTML);
        XRNA.sceneBounds.minimumX = Number.MAX_VALUE,
        XRNA.sceneBounds.maximumX = -Number.MAX_VALUE,
        XRNA.sceneBounds.minimumY = Number.MAX_VALUE,
        XRNA.sceneBounds.maximumY = -Number.MAX_VALUE;
        for (let rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            let
                complex = XRNA.rnaComplexes[rnaComplexIndex],
                complexID = XRNA.complexID(rnaComplexIndex);
            for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < complex.rnaMolecules.length; rnaMoleculeIndex++) {
                let
                    rnaMoleculeHTML = document.createElementNS(svgNameSpaceURL, 'g'),
                    rnaMoleculeID = XRNA.rnaMoleculeID(complexID, rnaMoleculeIndex);
                rnaMoleculeHTML.setAttribute('id', rnaMoleculeID);
                sceneHTML.appendChild(rnaMoleculeHTML);
                let
                    labelContentsGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
                labelContentsGroupHTML.setAttribute('id', rnaMoleculeID + ': Labels: Contents');
                rnaMoleculeHTML.appendChild(labelContentsGroupHTML);
                let
                    labelLinesGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
                labelLinesGroupHTML.setAttribute('id', rnaMoleculeID + ': Labels: Lines');
                rnaMoleculeHTML.appendChild(labelLinesGroupHTML);
                let
                    bondSymbolsGroupHTML = document.createElementNS(svgNameSpaceURL, 'g');
                bondSymbolsGroupHTML.setAttribute('id', rnaMoleculeID + ': Bond Lines');
                rnaMoleculeHTML.appendChild(bondSymbolsGroupHTML);
                let
                    boundingBoxesHTML = document.createElementNS(svgNameSpaceURL, 'g');
                boundingBoxesHTML.setAttribute('id', rnaMoleculeID + ': Bounding Boxes');
                rnaMoleculeHTML.appendChild(boundingBoxesHTML);
                let
                    rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex],
                    nucleotides = rnaMolecule.nucleotides;
                for (let nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    let 
                        nucleotide = nucleotides[nucleotideIndex],
                        nucleotideHTML = document.createElementNS(svgNameSpaceURL, 'text');
                    nucleotideHTML.textContent = nucleotide.symbol;
                    let
                        nucleotideID = XRNA.nucleotideID(rnaMoleculeID, nucleotideIndex);
                    nucleotideHTML.setAttribute('id', nucleotideID);
                    nucleotideHTML.setAttribute('x', '' + nucleotide.x);
                    nucleotideHTML.setAttribute('y', '' + nucleotide.y);
                    let
                        nucleotideColor = nucleotide.color;
                    nucleotideHTML.setAttribute('stroke', 'rgb(' + nucleotideColor[0] + ' ' + nucleotideColor[1] + ' ' + nucleotideColor[2] + ')');
                    nucleotideHTML.setAttribute('font-size', '' + nucleotide.font[0]);
                    nucleotideHTML.setAttribute('font-family', nucleotide.font[1]);
                    nucleotideHTML.setAttribute('font-style', nucleotide.font[2]);
                    nucleotideHTML.setAttribute('font-weight', nucleotide.font[3]);
                    nucleotideHTML.setAttribute('transform', XRNA.invertYTransform(nucleotide.y));
                    nucleotideHTML.setAttribute('onclick', 'XRNA.onClickNucleotide(this);');
                    rnaMoleculeHTML.appendChild(nucleotideHTML);
                    let 
                        boundingBoxes = new Array<DOMRect>(),
                        nucleotideBoundingBox = XRNA.getBoundingBox(nucleotideHTML),
                        boundingBoxHTML = document.createElementNS(svgNameSpaceURL, 'rect');
                    boundingBoxHTML.setAttribute('id', XRNA.boundingBoxID(nucleotideID));
                    boundingBoxHTML.setAttribute('x', '' + nucleotideBoundingBox.x);
                    boundingBoxHTML.setAttribute('y', '' + nucleotideBoundingBox.y);
                    boundingBoxHTML.setAttribute('width', '' + nucleotideBoundingBox.width);
                    boundingBoxHTML.setAttribute('height', '' + nucleotideBoundingBox.height);
                    boundingBoxHTML.setAttribute('stroke', 'none');
                    boundingBoxHTML.setAttribute('fill', 'none');
                    boundingBoxesHTML.appendChild(boundingBoxHTML);
                    boundingBoxes.push(nucleotideBoundingBox);
                    let
                        nucleotideBoundingBoxCenterX = nucleotideBoundingBox.x + nucleotideBoundingBox.width / 2.0,
                        nucleotideBoundingBoxCenterY = nucleotideBoundingBox.y + nucleotideBoundingBox.height / 2.0;
                    if (nucleotide.labelLine) {
                        let
                            lineHTML = document.createElementNS(svgNameSpaceURL, 'line');
                        lineHTML.setAttribute('id', nucleotideID + ': Label Line #' + nucleotideIndex);
                        let
                            labelLine = nucleotide.labelLine,
                            labelLineID = XRNA.labelLineID(nucleotideID);
                        lineHTML.setAttribute('id', '' + labelLineID);
                        lineHTML.setAttribute('x1', '' + (nucleotideBoundingBoxCenterX + labelLine[0]));
                        lineHTML.setAttribute('y1', '' + (nucleotideBoundingBoxCenterY + labelLine[1]));
                        lineHTML.setAttribute('x2', '' + (nucleotideBoundingBoxCenterX + labelLine[2]));
                        lineHTML.setAttribute('y2', '' + (nucleotideBoundingBoxCenterY + labelLine[3]));
                        lineHTML.setAttribute('stroke-width', '' + labelLine[4]);
                        lineHTML.setAttribute('onclick', 'XRNA.onClickLabel(this);');
                        let
                            lineColor = labelLine[5];
                        lineHTML.setAttribute('stroke', 'rgb(' + lineColor[0] + ' ' + lineColor[1] + ' ' + lineColor[2] + ')');
                        labelLinesGroupHTML.appendChild(lineHTML);
                        let
                            labelLineBoundingBox = XRNA.getBoundingBox(lineHTML),
                            boundingBoxHTML = document.createElementNS(svgNameSpaceURL, 'rect');
                        boundingBoxHTML.setAttribute('id', XRNA.boundingBoxID(labelLineID));
                        boundingBoxHTML.setAttribute('x', '' + labelLineBoundingBox.x);
                        boundingBoxHTML.setAttribute('y', '' + labelLineBoundingBox.y);
                        boundingBoxHTML.setAttribute('width', '' + labelLineBoundingBox.width);
                        boundingBoxHTML.setAttribute('height', '' + labelLineBoundingBox.height);
                        boundingBoxHTML.setAttribute('stroke', 'none');
                        boundingBoxHTML.setAttribute('fill', 'none');
                        boundingBoxesHTML.appendChild(boundingBoxHTML);
                    }
                    if (nucleotide.labelContent) {
                        let
                            contentHTML = document.createElementNS(svgNameSpaceURL, 'text');
                        contentHTML.setAttribute('id', XRNA.labelContentID(nucleotideID));
                        let 
                            labelContent = nucleotide.labelContent,
                            x = nucleotideBoundingBoxCenterX + labelContent[0];
                        contentHTML.setAttribute('x', '' + x);
                        let
                            y = nucleotideBoundingBoxCenterY + labelContent[1];
                        contentHTML.setAttribute('y', '' + y);
                        contentHTML.textContent = labelContent[2];
                        let
                            labelColor = labelContent[4];
                        contentHTML.setAttribute('stroke', 'rgb(' + labelColor[0] + ' ' + labelColor[1] + ' ' + labelColor[2] + ')');
                        let
                            labelFont = labelContent[3],
                            labelID = XRNA.labelContentID(nucleotideID);
                        contentHTML.setAttribute('id', labelID);
                        contentHTML.setAttribute('font-size', '' + labelFont[0]);
                        contentHTML.setAttribute('font-family', labelFont[1]);
                        contentHTML.setAttribute('font-style', labelFont[2]);
                        contentHTML.setAttribute('font-weight', labelFont[3]);
                        contentHTML.setAttribute('transform', XRNA.invertYTransform(y));
                        contentHTML.setAttribute('onclick', 'XRNA.onClickLabel(this)');
                        labelContentsGroupHTML.appendChild(contentHTML);
                        let
                            boundingBox = XRNA.getBoundingBox(contentHTML);
                        // Make corrections to the content's position
                        contentHTML.setAttribute('x', '' + (x - boundingBox.width / 2.0));
                        contentHTML.setAttribute('y', '' + (y + boundingBox.height / 3.0));
                        // Recalculate the bounding box. Manual correction appears ineffective.
                        boundingBox = XRNA.getBoundingBox(contentHTML);
                        boundingBoxes.push(boundingBox);
                        let
                            boundingBoxHTML = document.createElementNS(svgNameSpaceURL, 'rect');
                        boundingBoxHTML.setAttribute('id', XRNA.boundingBoxID(labelID));
                        boundingBoxHTML.setAttribute('x', '' + boundingBox.x);
                        boundingBoxHTML.setAttribute('y', '' + boundingBox.y);
                        boundingBoxHTML.setAttribute('width', '' + boundingBox.width);
                        boundingBoxHTML.setAttribute('height', '' + boundingBox.height);
                        boundingBoxHTML.setAttribute('stroke', 'none');
                        boundingBoxHTML.setAttribute('fill', 'none');
                        boundingBoxesHTML.appendChild(boundingBoxHTML);
                    }
                    // Only render the bond lines once.
                    // If we use the nucleotide with the greater index, we can can reference the other nucleotide's HTML.
                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex > nucleotide.basePairIndex) {
                        let
                            basePairedNucleotide = complex.rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotide.basePairIndex],
                            basePairedNucleotideBounds = XRNA.getBoundingBox(document.getElementById(XRNA.nucleotideID(rnaMoleculeID, nucleotide.basePairIndex))),
                            basePairedNucleotideBoundsCenterX = basePairedNucleotideBounds.x + basePairedNucleotideBounds.width / 2.0,
                            basePairedNucleotideBoundsCenterY = basePairedNucleotideBounds.y + basePairedNucleotideBounds.height / 2.0,
                            bondSymbolHTML : SVGElement,
                            circleHTMLHelper = (fill : string) => {
                                bondSymbolHTML = document.createElementNS(svgNameSpaceURL, 'circle');
                                bondSymbolHTML.setAttribute('fill', fill);
                                bondSymbolHTML.setAttribute('cx', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX, 0.5));
                                bondSymbolHTML.setAttribute('cy', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY, 0.5));
                                bondSymbolHTML.setAttribute('r', '' + XRNA.distance(nucleotideBoundingBoxCenterX, nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterX, basePairedNucleotideBoundsCenterY) / 8.0);
                            };
                        // Hardcode black for now. This appears to be consistent with XRNA-GT (Java).
                        let
                            strokeAndFill = 'black';
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
                                bondSymbolHTML = document.createElementNS(svgNameSpaceURL, 'line');
                                bondSymbolHTML.setAttribute('x1', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX, 0.25));
                                bondSymbolHTML.setAttribute('y1', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY, 0.25));
                                bondSymbolHTML.setAttribute('x2', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX, 0.75));
                                bondSymbolHTML.setAttribute('y2', '' + XRNA.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY, 0.75));
                                break;
                            }
                        }
                        bondSymbolHTML.setAttribute('stroke', strokeAndFill);
                        bondSymbolsGroupHTML.appendChild(bondSymbolHTML);
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
        }
        XRNA.sceneTransform = new Array<string>();
        // Translate the scene to the origin.
        XRNA.sceneTransform.unshift('translate(' + -XRNA.sceneBounds.minimumX + ' ' + -XRNA.sceneBounds.minimumY + ')');
        // Invert the y axis. Note that graphical y axes are inverted in comparison to standard cartesian coordinates.
        XRNA.sceneTransform.unshift('scale(1 -1)');
        // Center the scene along the y axis.
        XRNA.sceneTransform.unshift('translate(0 ' + (XRNA.sceneBounds.maximumY - XRNA.sceneBounds.minimumY) + ')');
        XRNA.fitSceneToBounds();
    }
}