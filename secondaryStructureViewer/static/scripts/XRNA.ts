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

type Color = {
    red : number,
    green : number,
    blue : number
};

type LabelLine = {
    v0 : Point,
    v1 : Point,
    strokeWidth : number,
    color : Color
};

type Font = {
    size : number,
    family : string,
    style : string,
    weight : string
};

type LabelContent = Point & {
    content : string,
    font : Font,
    color : Color
};

export class Nucleotide {
    public point : Point;
    public parent : RNAMolecule;
    // The nucleotide symbol (A|C|G|U)
    public symbol : string;
    // The index of the base-paired Nucleotide within the parent RNAMolecule's Nucleotide[]
    public basePairIndex : number;
    public labelLine : LabelLine;
    public labelContent : LabelContent;
    public font : Font;
    public color : Color;
    // The html template for nucleotide data (specified within input XML files' DtD header element)
    public static template : string;

    public constructor(parent : RNAMolecule, symbol : string, font : Font, x : number = 0.0, y : number = 0.0, basePairIndex = -1, labelLine = null, labelContent = null, color = {red: 0, green: 0, blue: 0}) {
        this.symbol = symbol.toUpperCase();
        if (!this.symbol.match(/^[ACGU]$/)) {
            throw new Error('The input nucleotide symbol is an invalid: ' + symbol + ' is not one of {A, C, G, U}.');
        }
        this.point = {
            x : x,
            y : y
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

    public static parse(currentRNAMolecule : RNAMolecule, inputLine : string, font : Font = null, template = Nucleotide.template) : Nucleotide {
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

    abstract populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void;

    static createErrorMessage(requirementDescription : string, selectableDescription : string) : string {
        return 'The selection constraint \"' + XRNA.selectionConstraintHTML.value + '\" requires selection of ' + requirementDescription + '. Select ' + selectableDescription + ' or change the selection constraint.';
    }
}

const svgNameSpaceURL = 'http://www.w3.org/2000/svg';

type SelectedIndicesTuple = {
    rnaComplexIndex: number,
    rnaMoleculeIndex: number,
    nucleotideIndex: number
};

abstract class SelectedElement {
    constructor(x : number, y : number, invertYFlag : boolean, xyAreDisplacementsFlag : boolean) {
        this.cache = {
            x : x,
            y : y
        };
        this.invertYFlag = invertYFlag;
        this.xyAreDisplacementsFlag = xyAreDisplacementsFlag;
    }

    abstract updateXYHelper(x : number, y : number) : void;
    public cache : Point;
    public invertYFlag : boolean;
    public xyAreDisplacementsFlag : boolean
};

type Selection = {
    highlighted : (HTMLElement | SVGPathElement)[],
    selected : SelectedElement[],
    dragOrigin : {
        x : number,
        y : number
    };
};

type Point = {
    x : number,
    y : number
};

class Utils {
    public static clamp(minimum : number, value : number, maximum : number) : number {
        return Math.min(Math.max(minimum, value), maximum);
    }
}

export class AffineMatrix3x3 {
    /* Structure:
    * [scaleX skewX displaceX]
    * [skewY scaleY displaceY]
    * [0     0      1        ]
    */
    public scaleX : number;
    public skewX : number;
    public displaceX : number;
    public skewY : number;
    public scaleY : number;
    public displaceY : number;

    constructor(xx = 0, xy = 0, xz = 0, yx = 0, yy = 0, yz = 0) {
        this.scaleX = xx;
        this.skewX = xy;
        this.displaceX = xz;
        this.skewY = yx;
        this.scaleY = yy;
        this.displaceY = yz;
    }

    public toString() : string {
        return '[' + [this.scaleX, this.skewX, this.displaceX].join(', ') + ']\n[' + [this.skewY, this.scaleY, this.displaceY].join(', ') + ']'
    }

    public static translate(dx : number, dy : number) : AffineMatrix3x3 {
        let
            translation = new AffineMatrix3x3();
        translation.scaleX = 1;
        translation.scaleY = 1;
        translation.displaceX = dx;
        translation.displaceY = dy;
        return translation;
    }

    public static scale(sx : number, sy : number) : AffineMatrix3x3 {
        let
            scale = new AffineMatrix3x3();
        scale.scaleX = sx;
        scale.scaleY = sy;
        return scale;
    }
};

export class VectorOperations {
    public static dotProduct(a : Point, b : Point) : number {
        return a.x * b.x + a.y * b.y;
    }

    public static scalarProjection(a : Point, b : Point) : number {
        // a^k * b^k == (a * b)^k
        // sqrt(a * a) * sqrt(b * b) == sqrt(a * a * b * b)
        return VectorOperations.dotProduct(a, b) / Math.sqrt(VectorOperations.magnitudeSquared(a.x, a.y) * VectorOperations.magnitudeSquared(b.x, b.y));
    }

    public static divide(point : Point, divisor : number) : Point {
        let
            scalar = 1.0 / divisor;
        return {
            x : point.x * scalar,
            y : point.y * scalar
        };
    }

    public static normalize(point : Point) : Point {
        return VectorOperations.divide(point, VectorOperations.magnitude(point.x, point.y));
    }

    public static linearlyInterpolate(v0 : number, v1 : number, interpolationFactor : number) : number {
        // See https://en.wikipedia.org/wiki/Linear_interpolation
        return (1 - interpolationFactor) * v0 + interpolationFactor * v1;
    }

    public static magnitudeSquared(x : number, y : number) : number {
        return x * x + y * y;
    }

    public static magnitude(x : number, y : number) : number {
        return Math.sqrt(VectorOperations.magnitudeSquared(x, y));
    }

    public static distanceSquared(p0 : Point, p1 : Point) : number {
        return VectorOperations.magnitudeSquared(p1.x - p0.x, p1.y - p0.y);
    }

    public static distance(p0 : Point, p1 : Point) : number {
        return Math.sqrt(VectorOperations.distanceSquared(p0, p1));
    }
}

export class MatrixOperations2D {
    public static fromTransform(transform : string) : AffineMatrix3x3 {
        // Note that DOMMatrix did not work, appeared to contain a bug when multiplying a translation and a scale.
        let
            matrix = new AffineMatrix3x3();
        matrix.scaleX = 1;
        matrix.scaleY = 1;
        transform.trim().split(/\)\s+/g).forEach(transformI => {
            let
                coordinates = transformI.match(/-?[\d\.]+/g);
            if (transformI.startsWith('translate')) {
                let
                    translation = AffineMatrix3x3.translate(parseFloat(coordinates[0]), parseFloat(coordinates[1]));
                matrix = MatrixOperations2D.multiply(matrix, translation);
            } else if (transformI.startsWith('scale')) {
                let
                    scale = AffineMatrix3x3.scale(parseFloat(coordinates[0]), parseFloat(coordinates[1]));
                matrix = MatrixOperations2D.multiply(matrix, scale);
            }
        });
        return matrix;
    }

    public static multiply(matrix0 : AffineMatrix3x3, matrix1 : AffineMatrix3x3) : AffineMatrix3x3 {
        /*
        [sx0  skx0 dx0] * [sx1  skx1 dx1] = [sx0 * sx1 + skx0 * sky1   sx0 * skx1 + skx0 * sy1   sx0 * dx1 + skx0 * dy1 + dx0]
        [sky0 sy0  dy0]   [sky1 sy1  dy1]   [sky0 * sx1 + sy0 * sky1   sky0 * skx1 + sy0 * sy1   sky0 * dx1 + sy0 * dy1 + dy0]
        [0    0    1  ]   [0    0    1  ]   [0                         0                         1                           ]
        */
       return new AffineMatrix3x3(
           matrix0.scaleX * matrix1.scaleX + matrix0.skewX * matrix1.skewY, matrix0.scaleX * matrix1.skewX + matrix0.skewX * matrix1.scaleY, matrix0.scaleX * matrix1.displaceX + matrix0.skewX * matrix1.displaceY + matrix0.displaceX,
           matrix0.skewY * matrix1.scaleX + matrix0.scaleY * matrix1.skewY, matrix0.skewY * matrix1.skewX + matrix0.scaleY * matrix1.scaleY, matrix0.skewY * matrix1.displaceX + matrix0.scaleY * matrix1.displaceY + matrix0.displaceY
        );
    }

    public static transform(matrix : AffineMatrix3x3, point : Point) : Point {
        /*
        [sx  skx dx]   [x]   [sx * x + skx * y + dx]
        [sky sy  dy] * [y] = [sky * x + sy * y + dy]
        [0   0   1 ]   [1]   [1                    ]
        */
        return {
            x : matrix.scaleX * point.x + matrix.skewX * point.y + matrix.displaceX,
            y : matrix.skewY * point.x + matrix.scaleY * point.y + matrix.displaceY
        };
    }
}

export class XRNA {
    private static rnaComplexes : Array<RNAComplex>;

    private static canvasHTML : HTMLElement;

    private static sceneDressingHTML: SVGElement;

    static selectionConstraintHTML : HTMLSelectElement;

    private static canvasBounds : DOMRect;

    private static complexDocumentName : string;

    private static complexName : string;

    private static sceneDressingData = {
        maximumZoom : 48,
        minimumZoom : -48,
        // zoom is on a linear scale. It is converted to an exponential scale before use.
        zoom : 0,
        scale : 1,
        origin : {
            x : 0,
            y : 0
        },
        dragCoordinates : {
            cacheOrigin : {
                x : 0,
                y : 0
            },
            origin : {
                x : 0,
                y : 0
            }
        }
    };

    private static inputParserDictionary : Record<string, FileParser> = {
        'xml' : XRNA.parseXML,
        'xrna' : XRNA.parseXRNA,
        'ss' : XRNA.parseXML,
        'ps' : XRNA.parseXML
    };

    private static outputWriterDictionary : Record<string, FileWriter> = {
        'xrna' : XRNA.writeXRNA,
        'svg' : XRNA.writeSVG,
        'tr' : XRNA.writeTR
    };

    private static selectionConstraintDescriptionDictionary : Record<string, SelectionConstraint> = {
        'RNA Single Nucleotide' : new class extends SelectionConstraint {
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex < 0;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                return [{
                    rnaComplexIndex : rnaComplexIndex,
                    rnaMoleculeIndex : rnaMoleculeIndex,
                    nucleotideIndex : nucleotideIndex
                }];
            }
            getErrorMessage() : string {
                return SelectionConstraint.createErrorMessage('a nucleotide without a base pair', 'a non-base-paired nucleotide');
            }
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                let
                    createTextElement = (text : string) => {
                        let
                            textElement = document.createElement('text');
                        textElement.setAttribute('stroke', 'black');
                        textElement.setAttribute('font-size', '12');
                        textElement.textContent = text;
                        return textElement;
                    },
                    complex = XRNA.rnaComplexes[rnaComplexIndex],
                    rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex],
                    nucleotides = rnaMolecule.nucleotides,
                    nucleotide = nucleotides[nucleotideIndex],
                    textContent = 'Nuc: ' + (nucleotideIndex + rnaMolecule.firstNucleotideIndex) + ' ' + nucleotide.symbol
                if (nucleotide.basePairIndex >= 0) {
                    textContent += ', Base Pair: ' + (nucleotide.basePairIndex + rnaMolecule.firstNucleotideIndex) + ' ' + nucleotides[nucleotide.basePairIndex].symbol
                }
                contextMenuHTML.appendChild(createTextElement(textContent));
                contextMenuHTML.appendChild(document.createElement('br'));

                contextMenuHTML.appendChild(createTextElement('In RNA strand: ' + rnaMolecule.name));
                contextMenuHTML.appendChild(document.createElement('br'));

                if (nucleotideIndex > 0) {
                    let
                        previousNucleotide = nucleotides[nucleotideIndex - 1];
                    contextMenuHTML.appendChild(createTextElement('Distance to last nuc: ' + VectorOperations.distance({
                        x : nucleotide.point.x, 
                        y : nucleotide.point.y
                    }, {
                        x : previousNucleotide.point.x, 
                        y : previousNucleotide.point.y
                    }).toFixed(2)));
                    contextMenuHTML.appendChild(document.createElement('br'));
                }
                if (nucleotideIndex < nucleotides.length - 1) {
                    let
                        nextNucleotide = nucleotides[nucleotideIndex + 1];
                    contextMenuHTML.appendChild(createTextElement('Distance to next nuc: ' + VectorOperations.distance({
                        x : nucleotide.point.x,
                        y : nucleotide.point.y
                    }, {
                        x : nextNucleotide.point.x,
                        y : nextNucleotide.point.y
                    }).toFixed(2)));
                    contextMenuHTML.appendChild(document.createElement('br'));
                }
                let
                    nucleotideID = XRNA.nucleotideID(XRNA.rnaMoleculeID(XRNA.rnaComplexID(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex),
                    nucleotideHTML = document.getElementById(nucleotideID),
                    nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxID(nucleotideID)),
                    centerX = parseFloat(nucleotideBoundingBoxHTML.getAttribute('x')) + parseFloat(nucleotideBoundingBoxHTML.getAttribute('width')) / 2.0,
                    centerY = parseFloat(nucleotideBoundingBoxHTML.getAttribute('y')) + parseFloat(nucleotideBoundingBoxHTML.getAttribute('height')) / 2.0,
                    cacheCenterX = centerX,
                    cacheCenterY = centerY,
                    coordinateMap : Array<{updateXHelper : (x : number) => void, updateYHelper : (y : number) => void, cache : Point, invertYFlag : boolean}> = [
                        {
                            updateXHelper : x => nucleotide.point.x = x,
                            updateYHelper : y => nucleotide.point.y = y,
                            cache : {
                                x : nucleotide.point.x,
                                y : nucleotide.point.y
                            },
                            invertYFlag : false
                        },
                        {
                            updateXHelper : x => nucleotideHTML.setAttribute('x', '' + x),
                            updateYHelper : y => nucleotideHTML.setAttribute('y', '' + y),
                            cache : {
                                x : parseFloat(nucleotideHTML.getAttribute('x')),
                                y : parseFloat(nucleotideHTML.getAttribute('y'))
                            },
                            invertYFlag : false
                        },
                        {
                            updateXHelper : x => nucleotideBoundingBoxHTML.setAttribute('x', '' + x),
                            updateYHelper : y => nucleotideBoundingBoxHTML.setAttribute('y', '' + y),
                            cache : {
                                x : parseFloat(nucleotideBoundingBoxHTML.getAttribute('x')),
                                y : parseFloat(nucleotideBoundingBoxHTML.getAttribute('y'))
                            },
                            invertYFlag : true
                        }
                    ];
                if (nucleotide.labelContent) {
                    let
                        labelContentID = XRNA.labelContentID(nucleotideID),
                        labelContentHTML = document.getElementById(labelContentID),
                        labelContentBoundingBoxHTML = document.getElementById(XRNA.boundingBoxID(labelContentID));
                    coordinateMap.push({
                        updateXHelper : x => nucleotide.labelContent.x = x,
                        updateYHelper : y => nucleotide.labelContent.y = y,
                        cache : {
                            x : nucleotide.labelContent.x,
                            y : nucleotide.labelContent.y
                        },
                        invertYFlag : false
                    });
                    coordinateMap.push({
                        updateXHelper : x => labelContentHTML.setAttribute('x', '' + x),
                        updateYHelper : y => labelContentHTML.setAttribute('y', '' + y),
                        cache : {
                            x : parseFloat(labelContentHTML.getAttribute('x')),
                            y : parseFloat(labelContentHTML.getAttribute('y')),
                        },
                        invertYFlag : false
                    });
                    coordinateMap.push({
                        updateXHelper : x => labelContentBoundingBoxHTML.setAttribute('x', '' + x),
                        updateYHelper : y => labelContentBoundingBoxHTML.setAttribute('y', '' + y),
                        cache : {
                            x : parseFloat(labelContentBoundingBoxHTML.getAttribute('x')),
                            y : parseFloat(labelContentBoundingBoxHTML.getAttribute('y')),
                        },
                        invertYFlag : true
                    });
                }
                if (nucleotide.labelLine) {
                    let
                        labelLineID = XRNA.labelLineID(nucleotideID),
                        labelLineBodyID = XRNA.labelLineBodyID(labelLineID),
                        labelLineCap0ID = XRNA.labelLineCap0ID(labelLineID),
                        labelLineCap1ID = XRNA.labelLineCap1ID(labelLineID),
                        labelLineHTML = document.getElementById(labelLineID),
                        labelLineBodyHTML = document.getElementById(labelLineBodyID),
                        labelLineCap0HTML = document.getElementById(labelLineCap0ID),
                        labelLineCap1HTML = document.getElementById(labelLineCap1ID);
                    coordinateMap.push({
                        updateXHelper : x => nucleotide.labelLine.v0.x = x,
                        updateYHelper : y => nucleotide.labelLine.v0.y = y,
                        cache : {
                            x : nucleotide.labelLine.v0.x,
                            y : nucleotide.labelLine.v0.y
                        },
                        invertYFlag : false
                    });
                    coordinateMap.push({
                        updateXHelper : x => nucleotide.labelLine.v1.x = x,
                        updateYHelper : y => nucleotide.labelLine.v1.y = y,
                        cache : {
                            x : nucleotide.labelLine.v1.x,
                            y : nucleotide.labelLine.v1.y
                        },
                        invertYFlag : false
                    });
                    coordinateMap.push({
                        updateXHelper : x => labelLineHTML.setAttribute('x1', '' + x),
                        updateYHelper : y => labelLineHTML.setAttribute('y1', '' + y),
                        cache : {
                            x : parseFloat(labelLineHTML.getAttribute('x1')),
                            y : parseFloat(labelLineHTML.getAttribute('y1'))
                        },
                        invertYFlag : true
                    });
                    coordinateMap.push({
                        updateXHelper : x => labelLineHTML.setAttribute('x2', '' + x),
                        updateYHelper : y => labelLineHTML.setAttribute('y2', '' + y),
                        cache : {
                            x : parseFloat(labelLineHTML.getAttribute('x2')),
                            y : parseFloat(labelLineHTML.getAttribute('y2'))
                        },
                        invertYFlag : true
                    });
                    [labelLineBodyHTML, labelLineCap0HTML, labelLineCap1HTML].forEach(htmlElement => {
                        let
                            cacheCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(htmlElement.getAttribute('transform')),
                            cacheX : number,
                            cacheY : number;
                        if (cacheCoordinates) {
                            cacheX = parseFloat(cacheCoordinates[1]);
                            cacheY = parseFloat(cacheCoordinates[2]);
                        } else {
                            cacheX = 0;
                            cacheY = 0;
                            htmlElement.setAttribute('transform', 'translate(0 0)');
                        }
                        coordinateMap.push({
                            updateXHelper : x => {
                                let
                                    transformCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(htmlElement.getAttribute('transform'));
                                htmlElement.setAttribute('transform', 'translate(' + x + ' ' + transformCoordinates[2] + ')');
                            },
                            updateYHelper : y => {
                                let
                                    transformCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(htmlElement.getAttribute('transform'));
                                htmlElement.setAttribute('transform', 'translate(' + transformCoordinates[1] + ' ' + y + ')');
                            },
                            cache: {
                                x : cacheX,
                                y : cacheY
                            },
                            invertYFlag: true
                        });
                    });
                }
                if (nucleotide.basePairIndex < 0) {
                    let
                        centerXInputHTML = document.createElement('input'),
                        centerYInputHTML = document.createElement('input');
                    centerXInputHTML.value = centerX.toFixed(2);
                    centerYInputHTML.value = centerY.toFixed(2);
                    centerXInputHTML.setAttribute('type', 'text');
                    centerYInputHTML.setAttribute('type', 'text');
                    let
                        centerXUpdateHelper = (newCenterX : number) => {
                            centerX = newCenterX;
                            let
                                dx = newCenterX - cacheCenterX;
                            coordinateMap.forEach(coordinateMapI => {
                                coordinateMapI.updateXHelper(coordinateMapI.cache.x + dx);
                            });
                        },
                        centerYUpdateHelper = (newCenterY : number) => {
                            centerY = newCenterY;
                            let
                                dy = newCenterY - cacheCenterY;
                            coordinateMap.forEach(coordinateMapI => {
                                coordinateMapI.updateYHelper(coordinateMapI.invertYFlag ? coordinateMapI.cache.y - dy : coordinateMapI.cache.y + dy);
                            })
                        };
                    centerXInputHTML.onchange = () => centerXUpdateHelper(parseFloat(centerXInputHTML.value));
                    centerYInputHTML.onchange = () => centerYUpdateHelper(parseFloat(centerYInputHTML.value));
                    contextMenuHTML.appendChild(createTextElement('Center X: '));
                    contextMenuHTML.appendChild(centerXInputHTML);
                    let
                        xIncrementButton = document.createElement('button'),
                        xDecrementButton = document.createElement('button');
                    xIncrementButton.textContent = '+';
                    xDecrementButton.textContent = '-';
                    xIncrementButton.onclick = () => {
                        let
                            newCenterX = centerX + 0.5;
                        centerXUpdateHelper(newCenterX);
                        centerXInputHTML.value = newCenterX.toFixed(2);
                    };
                    xDecrementButton.onclick = () => {
                        let
                            newCenterX = centerX - 0.5;
                        centerXUpdateHelper(newCenterX);
                        centerXInputHTML.value = newCenterX.toFixed(2);
                    }
                    contextMenuHTML.appendChild(xDecrementButton);
                    contextMenuHTML.appendChild(xIncrementButton);
                    contextMenuHTML.appendChild(document.createElement('br'));
                    contextMenuHTML.appendChild(createTextElement('Center Y: '));
                    contextMenuHTML.appendChild(centerYInputHTML);
                    let
                        yIncrementButton = document.createElement('button'),
                        yDecrementButton = document.createElement('button');
                    yIncrementButton.textContent = '+';
                    yDecrementButton.textContent = '-';
                    yIncrementButton.onclick = () => {
                        let
                            newCenterY = centerY + 0.5;
                        centerYUpdateHelper(newCenterY);
                        centerYInputHTML.value = newCenterY.toFixed(2);
                    };
                    yDecrementButton.onclick = () => {
                        let
                            newCenterY = centerY - 0.5;
                        centerYUpdateHelper(newCenterY);
                        centerYInputHTML.value = newCenterY.toFixed(2);
                    }
                    contextMenuHTML.appendChild(yDecrementButton);
                    contextMenuHTML.appendChild(yIncrementButton);
                    contextMenuHTML.appendChild(document.createElement('br'));
                } else {
                    contextMenuHTML.appendChild(createTextElement('Center X: ' + centerX.toFixed(2)));
                    contextMenuHTML.appendChild(document.createElement('br'));
                    contextMenuHTML.appendChild(createTextElement('Center Y: ' + centerY.toFixed(2)));
                    contextMenuHTML.appendChild(document.createElement('br'));
                }
            }
        },
        'RNA Single Strand' : new class extends SelectionConstraint {
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex < 0;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
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
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
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
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                let
                    selectedNucleotideIndices = new Array<SelectedIndicesTuple>(),
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    basePairedIndex = nucleotides[nucleotideIndex].basePairIndex;
                selectedNucleotideIndices.push({
                    rnaComplexIndex : rnaComplexIndex, 
                    rnaMoleculeIndex : rnaMoleculeIndex, 
                    nucleotideIndex : nucleotideIndex
                });
                selectedNucleotideIndices.push({
                    rnaComplexIndex : rnaComplexIndex,
                    rnaMoleculeIndex : rnaMoleculeIndex,
                    nucleotideIndex : basePairedIndex
                });
                let
                    selectedNucleotideInBetweenIndices = new Array<SelectedIndicesTuple>(),
                    lesserInBetweenNucleotideIndex : number,
                    greaterInBetweenNucleotideIndex : number,
                    basePairedNucleotideEncounteredFlag = false;
                if (nucleotideIndex < basePairedIndex) {
                    lesserInBetweenNucleotideIndex = nucleotideIndex;
                    greaterInBetweenNucleotideIndex = basePairedIndex;
                } else {
                    lesserInBetweenNucleotideIndex = basePairedIndex;
                    greaterInBetweenNucleotideIndex = nucleotideIndex;
                }
                for (let inBetweenNucleotideIndex = lesserInBetweenNucleotideIndex + 1; inBetweenNucleotideIndex < greaterInBetweenNucleotideIndex; inBetweenNucleotideIndex++) {
                    if (nucleotides[inBetweenNucleotideIndex].basePairIndex >= 0) {
                        basePairedNucleotideEncounteredFlag = true;
                    }
                    selectedNucleotideInBetweenIndices.push({
                        rnaComplexIndex : rnaComplexIndex,
                        rnaMoleculeIndex : rnaMoleculeIndex,
                        nucleotideIndex : inBetweenNucleotideIndex
                    });
                }
                if (!basePairedNucleotideEncounteredFlag) {
                    selectedNucleotideIndices = selectedNucleotideIndices.concat(selectedNucleotideInBetweenIndices);
                }
                return selectedNucleotideIndices;
            }
            getErrorMessage() : string {
                return SelectionConstraint.createErrorMessage('a nucleotide with a base pair and no contiguous base pairs', 'a base-paired nucleotide outside a series of base pairs');
            }
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Helix' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                let
                    helixIndices = new Array<SelectedIndicesTuple>(),
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
                                intermediateIndices = new Array<SelectedIndicesTuple>(),
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
                                intermediateIndices = new Array<SelectedIndicesTuple>(),
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
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Stacked Helix' : new class extends SelectionConstraint{
            adjacentNucleotideIndices : Array<SelectedIndicesTuple>;
            adjacentNucleotideIndex0 : number;
            adjacentNucleotideIndex1 : number;

            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                this.adjacentNucleotideIndices = new Array<SelectedIndicesTuple>();
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
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                this.getSelectedNucleotideIndicesHelper(rnaComplexIndex, rnaMoleculeIndex, () => this.adjacentNucleotideIndex0--, () => this.adjacentNucleotideIndex1++, nucleotides => this.adjacentNucleotideIndex0 < 0 || this.adjacentNucleotideIndex1 >= nucleotides.length);
                return this.adjacentNucleotideIndices;
            }
            getSelectedNucleotideIndicesHelper(rnaComplexIndex : number, rnaMoleculeIndex : number, adjacentNucleotideIndex0Incrementer : () => void, adjacentNucleotideIndex1Incrementer : () => void, adjacentNucleotideIndicesAreOutsideBoundsChecker : (nucleotides : Nucleotide[]) => boolean) : void {
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    intermediateIndices = new Array<SelectedIndicesTuple>();
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
                            intermediateIndices = new Array<SelectedIndicesTuple>();
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
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Sub-domain' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                let
                    adjacentNucleotideIndices = new Array<SelectedIndicesTuple>(),
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
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Cycle' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                let
                    cycleIndices = new Array<SelectedIndicesTuple>(),
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
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA List Nucs' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return false;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessage() : string {
                return "This selection constraint is not used for left-click nucleotide selection.";
            }
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Strand' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : 
            Array<SelectedIndicesTuple> {
                let
                    adjacentNucleotideIndices = new Array<SelectedIndicesTuple>(),
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaComplexIndex].nucleotides;
                for (let adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
                }
                return adjacentNucleotideIndices;
            }
            getErrorMessage() : string {
                throw new Error("This code should be unreachable.");
            }
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Color Unit' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    color = nucleotides[nucleotideIndex].color,
                    adjacentNucleotideIndices = new Array<SelectedIndicesTuple>();
                for (let adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    let
                        adjacentNucleotideColor = nucleotides[adjacentNucleotideIndex].color;
                    if (adjacentNucleotideColor.red == color.red && adjacentNucleotideColor.green == color.green && adjacentNucleotideColor.blue == color.blue) {
                        adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
                    }
                }
                return adjacentNucleotideIndices;
            }
            getErrorMessage() : string {
                throw new Error("This code should be unreachable.");
            }
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Named Group' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                // For now, named-group support is not implemented.
                return false;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessage() : string {
                return SelectionConstraint.createErrorMessage('a nucleotide within a named group', 'a nucleotide within a named group');
            }
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Strand Group' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                let
                    strandNucleotideIndices = new Array<SelectedIndicesTuple>(),
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
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'Labels Only' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                // Select no nucleotides, but do not produce an error.
                // This replicates XRNA-GT behavior.
                return [];   
            }
            getErrorMessage() : string {
                throw new Error("This code should be unreachable.");
            }
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'Entire Scene' : new class extends SelectionConstraint{
            approveSelectedIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<SelectedIndicesTuple> {
                // Select no indices.
                return [];
            }
            getErrorMessage() : string {
                throw new Error("This code should be unreachable.")
            }
            populateContextMenu(contextMenuHTML : HTMLElement, rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
    };

    private static sceneScale : number;

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

    private static selection : Selection = {
        highlighted : new Array<HTMLElement>(),
        selected : new Array<SelectedElement>(),
        dragOrigin : {
            x : 0,
            y : 0
        }
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
        XRNA.sceneDressingHTML = <SVGElement>document.createElementNS(svgNameSpaceURL, 'g');
        XRNA.sceneDressingHTML.setAttribute('id', 'sceneDressing');
        XRNA.canvasHTML.appendChild(XRNA.sceneDressingHTML);
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
        XRNA.canvasHTML.onmousedown = XRNA.sceneHandleMouseDown;
        XRNA.canvasHTML.onmousemove = XRNA.sceneHandleMouseMove;
        XRNA.canvasHTML.onmouseup = XRNA.sceneHandleMouseUp;
        document.getElementById('contextMenu').onmouseup = XRNA.sceneHandleMouseUp;
    }

    private static getButtonIndex(event: MouseEvent) : BUTTON_INDEX {
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
        // Clear the previous selection highlighting
        XRNA.selection.highlighted.forEach(highlightedI => {
            highlightedI.setAttribute('visibility', 'hidden');
        });
        XRNA.selection = {
            highlighted : new Array<HTMLElement>(),
            selected : new Array<SelectedElement>(),
            dragOrigin : {
                x : 0,
                y : 0
            }
        };
    }

    public static sceneHandleMouseDown(mouseEvent : MouseEvent) : boolean {
        let
            newButtonIndex = XRNA.getButtonIndex(mouseEvent),
            pressedButtonIndex = newButtonIndex - XRNA.buttonIndex,
            pageX = mouseEvent.pageX,
            pageY = XRNA.correctYCoordinate(mouseEvent.pageY);
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
    }

    public static sceneHandleMouseMove(mouseEvent : MouseEvent) : boolean {
        let
            pageX = mouseEvent.pageX,
            pageY = XRNA.correctYCoordinate(mouseEvent.pageY),
            buttonIndex = XRNA.getButtonIndex(mouseEvent);
        if (buttonIndex & BUTTON_INDEX.LEFT) {
            let
                scale = XRNA.sceneDressingData.scale * XRNA.sceneScale,
                dx = (pageX - XRNA.selection.dragOrigin.x) / scale,
                dy = -(pageY - XRNA.selection.dragOrigin.y) / scale;
            XRNA.selection.selected.forEach(selectedI => {
                let
                    dyI = selectedI.invertYFlag ? -dy : dy,
                    x : number,
                    y : number;
                if (selectedI.xyAreDisplacementsFlag) {
                    x = dx;
                    y = dyI;
                } else {
                    x = selectedI.cache.x + dx;
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
    }

    public static sceneHandleMouseUp(mouseEvent : MouseEvent) : boolean {
        let
            newButtonIndex = XRNA.getButtonIndex(mouseEvent),
            releasedButtonIndex = XRNA.buttonIndex - newButtonIndex,
            pageX = mouseEvent.pageX,
            pageY = XRNA.correctYCoordinate(mouseEvent.pageY);
        XRNA.buttonIndex = newButtonIndex;
        if (releasedButtonIndex & BUTTON_INDEX.LEFT) {
        }
        if (releasedButtonIndex & BUTTON_INDEX.RIGHT) {
            XRNA.sceneDressingData.dragCoordinates.cacheOrigin.x = XRNA.sceneDressingData.origin.x;
            XRNA.sceneDressingData.dragCoordinates.cacheOrigin.y = XRNA.sceneDressingData.origin.y;
        }
        return false;
    }

    public static resetView() : void {
        XRNA.sceneDressingData.origin.x = 0;
        XRNA.sceneDressingData.origin.y = 0;
        XRNA.sceneDressingData.dragCoordinates.cacheOrigin.x = 0;
        XRNA.sceneDressingData.dragCoordinates.cacheOrigin.y = 0;
        XRNA.setZoom(0);
        XRNA.updateSceneDressing();
        (<any>document.getElementById('zoom slider')).value = XRNA.sceneDressingData.zoom;
    }

    public static setZoom(zoom : number) : void {
        XRNA.sceneDressingData.zoom = Utils.clamp(XRNA.sceneDressingData.minimumZoom, zoom, XRNA.sceneDressingData.maximumZoom);
        XRNA.sceneDressingData.scale = XRNA.zoomToScale(XRNA.sceneDressingData.zoom);
        XRNA.updateSceneDressing();
    }

    public static zoomToScale(zoom : number) : number {
        return Math.pow(1.05, zoom);
    }

    public static updateSceneDressing() : void {
        document.getElementById('sceneDressing').setAttribute('transform', 'translate(' + XRNA.sceneDressingData.origin.x + ' ' + XRNA.sceneDressingData.origin.y + ') scale(' + XRNA.sceneDressingData.scale + ' ' + XRNA.sceneDressingData.scale + ')');
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

    public static parseRGB(rgbAsString : string) : Color {
        let
            rgbAsNumber = parseInt(rgbAsString),
            validColorFlag = true;
        if (isNaN(rgbAsNumber)) {
            // Attempt parsing colorAsString as a hexadecimal string.
            rgbAsNumber = parseInt('0x' + rgbAsString);
            validColorFlag = !isNaN(rgbAsNumber);
        }
        let
            rgb : Color;
        if (validColorFlag) {
            rgb = {
                red: (rgbAsNumber >> 16) & 0xFF,
                green: (rgbAsNumber >> 8) & 0xFF,
                blue:rgbAsNumber & 0xFF
            };
        } else {
            rgb = {
                red: 0,
                green: 0,
                blue: 0
            };
            console.error('Invalid color string: ' + rgbAsString + ' is an invalid color. Only hexadecimal or integer values are accepted.');
        }
        return rgb;
    }

    // Converts the input RGB values to a hexadecimal string 
    public static compressRGB(rgb : Color) : string {
        return ((rgb.red << 16) | (rgb.green << 8) | (rgb.blue)).toString(16);
    }

    public static applyHelperFunctionsToRefIDs(refIDs : Array<[number, number]>, helperFunctions : Array<(nucleotide : Nucleotide) => void>) : void {
        refIDs.forEach(refIDPair => {
            for (let refIndex = refIDPair[0]; refIndex <= refIDPair[1]; refIndex++) {
                let 
                    mostRecentRNAComplex = XRNA.rnaComplexes[XRNA.rnaComplexes.length - 1],
                    mostRecentRNAMolecule = mostRecentRNAComplex.rnaMolecules[mostRecentRNAComplex.rnaMolecules.length - 1],
                    nucleotide = mostRecentRNAMolecule.nucleotides[refIndex];
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
                        helperFunctions = new Array<(nucleotide : Nucleotide) => void>(),
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
                    helperFunctions.push(nucleotide => nucleotide.font.size = subElement.getAttribute('FontSize') ? parseFloat(fontIDAsString) : 8.0);
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
                        labelContent : LabelContent = null,
                        labelLine : LabelLine = null;
                    innerHTMLLines.forEach(innerHTMLLine => {
                        let
                            splitLineElements = innerHTMLLine.split(/\s+/);
                        switch (splitLineElements[0].toLowerCase()) {
                            case 'l': {
                                labelLine = {
                                    v0: {
                                        x: parseFloat(splitLineElements[1]),
                                        y: parseFloat(splitLineElements[2])
                                    },
                                    v1 : {
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
                                let
                                    font = XRNA.fontIDToFont(parseInt(splitLineElements[5]));
                                font.size = parseFloat(splitLineElements[4]);
                                labelContent = {
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
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex0 + " >= " + currentRNAMolecule.nucleotides.length);
                            continue;
                        }
                        if (nucleotideIndex1 < 0) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex1 + " < 0");
                            continue;
                        }
                        if (nucleotideIndex1 >= nucleotides.length) {
                            console.error("Out of bounds error in (<BasePairs nucID='" + (index + firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex1 + " >= " + currentRNAMolecule.nucleotides.length);
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
                    xrnaFrontHalf += nucleotide.symbol + ' ' + nucleotide.point.x + ' ' + nucleotide.point.y + '\n';
                    nucs += '<Nuc RefID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\' Color=\'' + XRNA.compressRGB(nucleotide.color) + '\' FontID=\'' + XRNA.fontToFontID(nucleotide.font) + '\'></Nuc>'
                    
                    if (nucleotide.labelContent || nucleotide.labelContent) {
                        nucLabelLists += '<Nuc RefID=\'' + (firstNucleotideIndex + nucleotideIndex) + '\'>\n<LabelList>\n';
                        if (nucleotide.labelLine) {
                            let
                                line = nucleotide.labelLine,
                                lineColor = line.color;
                            nucLabelLists += 'l ' + line.v0.x + ' ' + line.v0.y + ' ' + line.v1.x + ' ' + line.v1.y + ' ' + line.strokeWidth + ' ' + XRNA.compressRGB(lineColor) + ' 0.0 0 0 0 0\n';
                        }
                        if (nucleotide.labelContent) {
                            let
                                content = nucleotide.labelContent,
                                contentColor = content.color,
                                contentFont = content.font;
                            nucLabelLists += 's ' + content.x + ' ' + content.y + ' 0.0 ' + contentFont.size + ' ' + XRNA.fontToFontID(contentFont) + ' ' + XRNA.compressRGB(contentColor) + ' \"' + content.content + '\"\n';
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

    public static writeTR() : string {
        let
            trContents = '<structure>';
        for (let rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            let
                rnaComplex = XRNA.rnaComplexes[rnaComplexIndex];
            for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < rnaComplex.rnaMolecules.length; rnaMoleculeIndex++) {
                let
                    rnaMolecule = rnaComplex.rnaMolecules[rnaMoleculeIndex],
                    nucleotides = rnaMolecule.nucleotides;
                for (let nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    let
                        nucleotide = nucleotides[nucleotideIndex];
                    trContents += '\n<point x=\"' + nucleotide.point.x.toFixed(3) + '\" y=\"' + nucleotide.point.y.toFixed(3) + '\" b=\"' + nucleotide.symbol + '\" numbering-label=\"' + (rnaMolecule.firstNucleotideIndex + nucleotideIndex) + '\" />';
                }
            }
        }
        trContents += '\n</structure>';
        return trContents;
    }

    public static correctYCoordinate(y : number) : number {
        return y - XRNA.canvasBounds.y;
    }

    private static getBoundingBox(htmlElement : SVGTextElement | SVGLineElement | SVGPathElement | HTMLElement) : DOMRect {
        let
            boundingBox = htmlElement.getBoundingClientRect();
        boundingBox.y = XRNA.correctYCoordinate(boundingBox.y);
        return boundingBox;
    }

    private static getBoundingBoxHTML(boundingBox : DOMRect, parentID : string) : SVGRectElement {
        let
            boundingBoxHTML = document.createElementNS(svgNameSpaceURL, 'rect');
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
    }

    public static rnaComplexID(rnaComplexIndex : number) : string {
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

    public static labelLineBodyID(parentID : string) : string {
        return parentID + ': Body';
    }

    public static labelLineCap0ID(parentID : string) : string {
        return parentID + ': Cap #0';
    }

    public static labelLineCap1ID(parentID : string) : string {
        return parentID + ': Cap #1';
    }

    public static boundingBoxID(parentID : string) : string {
        return parentID + ': Bounding Box';
    }

    public static circleID(parentID : string) : string {
        return parentID + ': Circle';
    }

    public static bondLineID(parentID : string) : string {
        return parentID + ': Bond Line';
    }

    public static fitSceneToBounds() : void {
        // Scale to fit the screen
        XRNA.sceneScale = Math.min(XRNA.canvasBounds.width / (XRNA.sceneBounds.maximumX - XRNA.sceneBounds.minimumX), XRNA.canvasBounds.height / (XRNA.sceneBounds.maximumY - XRNA.sceneBounds.minimumY));
        XRNA.sceneTransform.unshift('scale(' + XRNA.sceneScale + ' ' + XRNA.sceneScale + ')');
        document.getElementById('scene').setAttribute('transform', XRNA.sceneTransform.join(' '));
        // Remove the elements of XRNA.sceneTransform which were added by fitSceneToBounds().
        // This is necessary to ensure correct scene fitting when fitSceneToBounds() is called multiple times.
        // This occurs during window resizing.
        XRNA.sceneTransform.shift();
    }

    public static invertYTransform(y : number) : string {
        return 'translate(0 ' + y + ') scale(1 -1) translate(0 ' + -y +')';
    }

    public static fontIDToFont(fontID : number) : Font {
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
    }

    public static fontToFontID(font : Font) : number {
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
    }

    public static onClickLabelContent(labelContentHTML : SVGTextElement) {
        XRNA.resetSelection();

        let
            indices = labelContentHTML.id.match(/#\d+/g),
            boundingBoxHTML = document.getElementById(XRNA.boundingBoxID(labelContentHTML.id)),
            labelContent = XRNA.rnaComplexes[parseInt(indices[0].substring(1))].rnaMolecules[parseInt(indices[1].substring(1))].nucleotides[parseInt(indices[2].substring(1))].labelContent;
        boundingBoxHTML.setAttribute('visibility', 'visible');
        XRNA.selection.highlighted.push(boundingBoxHTML);
        XRNA.selection.selected.push({
            updateXYHelper : (x : number, y : number) => {
                labelContentHTML.setAttribute('x', '' + x);
                labelContentHTML.setAttribute('y', '' + y);
            },
            cache : {
                x : parseFloat(labelContentHTML.getAttribute('x')),
                y : parseFloat(labelContentHTML.getAttribute('y'))
            },
            invertYFlag : true,
            xyAreDisplacementsFlag : false
        });
        XRNA.selection.selected.push({
            updateXYHelper : (x : number, y : number) => {
                boundingBoxHTML.setAttribute('x', '' + x);
                boundingBoxHTML.setAttribute('y', '' + y);
            },
            cache : {
                x : parseFloat(boundingBoxHTML.getAttribute('x')),
                y : parseFloat(boundingBoxHTML.getAttribute('y'))
            },
            invertYFlag : false,
            xyAreDisplacementsFlag : false
        });
        XRNA.selection.selected.push({
            updateXYHelper : (x : number, y : number) => {
                labelContent.x = x;
                labelContent.y = y;
            },
            cache : {
                x : labelContent.x,
                y : labelContent.y
            },
            invertYFlag : false,
            xyAreDisplacementsFlag : false
        });
    }

    public static onClickLabelLineCap(mouseEvent : MouseEvent, labelLineCapHTML : SVGPathElement) : void {
        XRNA.resetSelection();
        let
            graphicalTransform = MatrixOperations2D.fromTransform(XRNA.sceneDressingHTML.getAttribute('transform') + ' ' + document.getElementById('scene').getAttribute('transform')),
            id = labelLineCapHTML.id,
            indices = id.match(/#\d+/g),
            rnaComplexIndex = parseInt(indices[0].substring(1)),
            rnaMoleculeIndex = parseInt(indices[1].substring(1)),
            nucleotideIndex = parseInt(indices[2].substring(1)),
            capIndex = parseInt(indices[3].substring(1)),
            otherCapIndex = capIndex ^ 1,
            nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex],
            labelLine = nucleotide.labelLine,
            labelLineID = id.substring(0, id.lastIndexOf(':')),
            labelLineHTML = document.getElementById(labelLineID),
            capEndpointOffset = <Point>labelLine['v' + capIndex],
            otherCapEndpointOffset = <Point>labelLine['v' + otherCapIndex],
            nucleotideID = XRNA.nucleotideID(XRNA.rnaMoleculeID(XRNA.rnaComplexID(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex),
            nucleotideBoundingBox = document.getElementById(XRNA.boundingBoxID(nucleotideID)),
            center = {
                x : parseFloat(nucleotideBoundingBox.getAttribute('x')) + parseFloat(nucleotideBoundingBox.getAttribute('width')) / 2.0,
                y : parseFloat(nucleotideBoundingBox.getAttribute('y')) + parseFloat(nucleotideBoundingBox.getAttribute('height')) / 2.0
            },
            capEndpoint = MatrixOperations2D.transform(graphicalTransform, {
                x : center.x + capEndpointOffset.x,
                y : center.y + capEndpointOffset.y
            }),
            otherCapEndpoint = MatrixOperations2D.transform(graphicalTransform, {
                x : center.x + otherCapEndpointOffset.x,
                y : center.y + otherCapEndpointOffset.y
            }),
            interpolationFactor = 1.0 / VectorOperations.scalarProjection(
                {
                    x : mouseEvent.pageX - otherCapEndpoint.x,
                    y : XRNA.correctYCoordinate(mouseEvent.pageY) - otherCapEndpoint.y
                },
                {
                    x : capEndpoint.x - otherCapEndpoint.x,
                    y : capEndpoint.y - otherCapEndpoint.y
                }
            ),
            cap0 = document.getElementById(XRNA.labelLineCap0ID(labelLineID)),
            body = document.getElementById(XRNA.labelLineBodyID(labelLineID)),
            cap1 = document.getElementById(XRNA.labelLineCap1ID(labelLineID));
        cap0.setAttribute('transform', '');
        body.setAttribute('transform', '');
        cap1.setAttribute('transform', '');
        let
            paths = XRNA.getPathsFromLine({
                x : center.x + labelLine.v0.x,
                y : center.y + labelLine.v0.y
            }, {
                x : center.x + labelLine.v1.x,
                y : center.y + labelLine.v1.y
            });
        cap0.setAttribute('d', paths.cap0Path);
        body.setAttribute('d', paths.bodyPath);
        cap1.setAttribute('d', paths.cap1Path);
        labelLineCapHTML.setAttribute('visibility', 'visible');
        XRNA.selection.highlighted.push(labelLineCapHTML);
        XRNA.selection.selected.push(new class extends SelectedElement {
            updateXYHelper(dx : number, dy : number) : void {
                capEndpointOffset.x = this.cache.x + dx * interpolationFactor;
                capEndpointOffset.y = this.cache.y + dy * interpolationFactor;
                let
                    paths = XRNA.getPathsFromLine({
                        x : center.x + labelLine.v0.x,
                        y : center.y + labelLine.v0.y
                    }, {
                        x : center.x + labelLine.v1.x,
                        y : center.y + labelLine.v1.y
                    });
                cap0.setAttribute('d', paths.cap0Path);
                body.setAttribute('d', paths.bodyPath);
                cap1.setAttribute('d', paths.cap1Path);
            }
        }(capEndpointOffset.x, capEndpointOffset.y, false, true));

        XRNA.selection.selected.push(new class extends SelectedElement {
            updateXYHelper(dx : number, dy : number) {
                labelLineHTML.setAttribute('x' + (capIndex + 1), '' + (this.cache.x + dx * interpolationFactor));
                labelLineHTML.setAttribute('y' + (capIndex + 1), '' + (this.cache.y + dy * interpolationFactor));
            }
        }(parseFloat(labelLineHTML.getAttribute('x' + (capIndex + 1))), parseFloat(labelLineHTML.getAttribute('y' + (capIndex + 1))), false, true));
    }

    public static onClickLabelLineBody(labelLineBody : SVGPathElement) : void {
        XRNA.resetSelection();
        let
            id = labelLineBody.id,
            indices = id.match(/#\d+/g),
            rnaComplexIndex = parseInt(indices[0].substring(1)),
            rnaMoleculeIndex = parseInt(indices[1].substring(1)),
            nucleotideIndex = parseInt(indices[2].substring(1)),
            nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex],
            labelLine = nucleotide.labelLine,
            labelLineID = labelLineBody.id.substring(0, labelLineBody.id.lastIndexOf(':')),
            labelLineHTML = document.getElementById(labelLineID);
        labelLineBody.setAttribute('visibility', 'visible');
        XRNA.selection.highlighted.push(labelLineBody);
        
        XRNA.selection.selected.push({
            updateXYHelper : (x : number, y : number) => {
                labelLineHTML.setAttribute('x1', '' + x);
                labelLineHTML.setAttribute('y1', '' + y);
            },
            cache : {
                x : parseFloat(labelLineHTML.getAttribute('x1')),
                y : parseFloat(labelLineHTML.getAttribute('y1'))
            },
            invertYFlag : false,
            xyAreDisplacementsFlag : false
        });
        XRNA.selection.selected.push({
            updateXYHelper : (x : number, y : number) => {
                labelLineHTML.setAttribute('x2', '' + x);
                labelLineHTML.setAttribute('y2', '' + y);
            },
            cache : {
                x : parseFloat(labelLineHTML.getAttribute('x2')),
                y : parseFloat(labelLineHTML.getAttribute('y2'))
            },
            invertYFlag : false,
            xyAreDisplacementsFlag : false
        });
        XRNA.selection.selected.push({
            updateXYHelper : (x : number, y : number) => {
                labelLine.v0.x = x;
                labelLine.v0.y = y;
            },
            cache : {
                x : labelLine.v0.x,
                y : labelLine.v0.y
            },
            invertYFlag : false,
            xyAreDisplacementsFlag : false
        });
        XRNA.selection.selected.push({
            updateXYHelper : (x : number, y : number) => {
                labelLine.v1.x = x;
                labelLine.v1.y = y;
            },
            cache : {
                x : labelLine.v1.x,
                y : labelLine.v1.y
            },
            invertYFlag : false,
            xyAreDisplacementsFlag : false
        });
        let
            transform = labelLineBody.getAttribute('transform'),
            cap0Cache : Point,
            bodyCache : Point,
            cap1Cache : Point;
        if (transform) {
            let
                transformCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(transform)
            bodyCache = {
                x : parseFloat(transformCoordinates[1]),
                y : parseFloat(transformCoordinates[2])
            };
        } else {
            bodyCache = {
                x : 0,
                y : 0
            };
        }
        let
            cap0HTML = document.getElementById(XRNA.labelLineCap0ID(labelLineID));
        transform = cap0HTML.getAttribute('transform');
        if (transform) {
            let
                transformCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(transform)
            cap0Cache = {
                x : parseFloat(transformCoordinates[1]),
                y : parseFloat(transformCoordinates[2])
            };
        } else {
            cap0Cache = {
                x : 0,
                y : 0
            };
        }
        let
            cap1HTML = document.getElementById(XRNA.labelLineCap1ID(labelLineID));
        transform = cap1HTML.getAttribute('transform');
        if (transform) {
            let
                transformCoordinates = /translate\((-?[\d\.]+) (-?[\d\.]+)\)/.exec(transform)
            cap1Cache = {
                x : parseFloat(transformCoordinates[1]),
                y : parseFloat(transformCoordinates[2])
            };
        } else {
            cap1Cache = {
                x : 0,
                y : 0
            };
        }
        XRNA.selection.selected.push({
            updateXYHelper : (x : number, y : number) => {
                cap0HTML.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
            },
            cache : cap0Cache,
            invertYFlag : false,
            xyAreDisplacementsFlag : false
        });
        XRNA.selection.selected.push({
            updateXYHelper : (x : number, y : number) => {
                labelLineBody.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
            },
            cache : bodyCache,
            invertYFlag : false,
            xyAreDisplacementsFlag : false
        });
        XRNA.selection.selected.push({
            updateXYHelper : (x : number, y : number) => {
                cap1HTML.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
            },
            cache : cap1Cache,
            invertYFlag : false,
            xyAreDisplacementsFlag : false
        });
    }

    public static onClickNucleotide(mouseEvent : MouseEvent, nucleotideHTML : SVGTextElement) : void {
        XRNA.getButtonIndex(mouseEvent);
        let
            newButtonIndex = XRNA.getButtonIndex(mouseEvent),
            pressedButtonIndex = newButtonIndex - XRNA.buttonIndex,
            indices = nucleotideHTML.id.match(/#\d+/g),
            rnaComplexIndex = parseInt(indices[0].substring(1)),
            rnaMoleculeIndex = parseInt(indices[1].substring(1)),
            nucleotideIndex = parseInt(indices[2].substring(1)),
            selectionConstraint = XRNA.selectionConstraintDescriptionDictionary[XRNA.selectionConstraintHTML.value];
        if (pressedButtonIndex & BUTTON_INDEX.LEFT) {
            XRNA.resetSelection();
    
            if (selectionConstraint.approveSelectedIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex)) {
                selectionConstraint.getSelectedNucleotideIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex).forEach(selectedNucleotideIndices => {
                    let
                        rnaComplexIndex = selectedNucleotideIndices.rnaComplexIndex,
                        rnaMoleculeIndex = selectedNucleotideIndices.rnaMoleculeIndex,
                        nucleotideIndex = selectedNucleotideIndices.nucleotideIndex,
                        nucleotideID = XRNA.nucleotideID(XRNA.rnaMoleculeID(XRNA.rnaComplexID(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex),
                        nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex],
                        nucleotideHTML = document.getElementById(nucleotideID),
                        nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxID(nucleotideID)),
                        selected = new Array<{htmlElement : HTMLElement, invertYFlag : boolean}>({htmlElement : nucleotideHTML, invertYFlag : true}, {htmlElement : nucleotideBoundingBoxHTML, invertYFlag : false});
                    XRNA.selection.highlighted.push(nucleotideBoundingBoxHTML);
                    if (nucleotide.labelContent) {
                        let
                            labelContentID = XRNA.labelContentID(nucleotideID),
                            boundingBoxHTML = document.getElementById(XRNA.boundingBoxID(labelContentID)),
                            labelContent = nucleotide.labelContent;
                        XRNA.selection.highlighted.push(boundingBoxHTML);
                        selected.push({
                            htmlElement : boundingBoxHTML,
                            invertYFlag : false
                        });
                        selected.push({
                            htmlElement : document.getElementById(labelContentID),
                            invertYFlag : true
                        });
                    }
                    if (nucleotide.labelLine) {
                        let
                            labelLineID = XRNA.labelLineID(nucleotideID),
                            cap0ID = XRNA.labelLineCap0ID(labelLineID),
                            bodyID = XRNA.labelLineBodyID(labelLineID),
                            cap1ID = XRNA.labelLineCap1ID(labelLineID),
                            labelLineHTML = document.getElementById(labelLineID),
                            cap0HTML = document.getElementById(cap0ID),
                            bodyHTML = document.getElementById(bodyID),
                            cap1HTML = document.getElementById(cap1ID),
                            labelLine = nucleotide.labelLine;
                        XRNA.selection.highlighted.push(cap0HTML);
                        XRNA.selection.highlighted.push(bodyHTML);
                        XRNA.selection.highlighted.push(cap1HTML);

                        XRNA.selection.selected.push({
                            updateXYHelper : (x : number, y : number) => {
                                labelLineHTML.setAttribute('x1', '' + x);
                                labelLineHTML.setAttribute('y1', '' + y);
                            },
                            cache : {
                                x : parseFloat(labelLineHTML.getAttribute('x1')),
                                y : parseFloat(labelLineHTML.getAttribute('y1'))
                            },
                            invertYFlag : false,
                            xyAreDisplacementsFlag : false
                        });
                        XRNA.selection.selected.push({
                            updateXYHelper : (x : number, y : number) => {
                                labelLineHTML.setAttribute('x2', '' + x);
                                labelLineHTML.setAttribute('y2', '' + y);
                            },
                            cache : {
                                x : parseFloat(labelLineHTML.getAttribute('x2')),
                                y : parseFloat(labelLineHTML.getAttribute('y2'))
                            },
                            invertYFlag : false,
                            xyAreDisplacementsFlag : false
                        });
                        let
                            cap0Transform = cap0HTML.getAttribute('transform'),
                            bodyTransform = bodyHTML.getAttribute('transform'),
                            cap1Transform = cap1HTML.getAttribute('transform'),
                            cap0Cache : Point,
                            bodyCache : Point,
                            cap1Cache : Point;
                        if (cap0Transform) {
                            let
                                transformCoordinates = /^translate\((-?[\d\.]+) (-?[\d\.]+)\)$/.exec(cap0Transform);
                            cap0Cache = {
                                x : parseFloat(transformCoordinates[1]),
                                y : parseFloat(transformCoordinates[2])
                            };
                        } else {
                            cap0Cache = {
                                x : 0,
                                y : 0
                            };
                        }
                        if (bodyTransform) {
                            let
                                transformCoordinates = /^translate\((-?[\d\.]+) (-?[\d\.]+)\)$/.exec(bodyTransform);
                            bodyCache = {
                                x : parseFloat(transformCoordinates[1]),
                                y : parseFloat(transformCoordinates[2])
                            };
                        } else {
                            bodyCache = {
                                x : 0,
                                y : 0
                            };
                        }
                        if (cap1Transform) {
                            let
                                transformCoordinates = /^translate\((-?[\d\.]+) (-?[\d\.]+)\)$/.exec(cap1Transform);
                            cap1Cache = {
                                x : parseFloat(transformCoordinates[1]),
                                y : parseFloat(transformCoordinates[2])
                            };
                        } else {
                            cap1Cache = {
                                x : 0,
                                y : 0
                            };
                        }
                        XRNA.selection.selected.push({
                            updateXYHelper : (x : number, y : number) => {
                                cap0HTML.setAttribute('transform', 'translate(' + x + ' ' + y +  ')');
                            },
                            cache : cap0Cache,
                            invertYFlag : false,
                            xyAreDisplacementsFlag : false
                        });
                        XRNA.selection.selected.push({
                            updateXYHelper : (x : number, y : number) => {
                                bodyHTML.setAttribute('transform', 'translate(' + x + ' ' + y +  ')');
                            },
                            cache : bodyCache,
                            invertYFlag : false,
                            xyAreDisplacementsFlag : false
                        });
                        XRNA.selection.selected.push({
                            updateXYHelper : (x : number, y : number) => {
                                cap1HTML.setAttribute('transform', 'translate(' + x + ' ' + y +  ')');
                            },
                            cache : cap1Cache,
                            invertYFlag : false,
                            xyAreDisplacementsFlag : false
                        });
                    }
                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex > nucleotide.basePairIndex) {
                        let
                            nucleotideBondSymbolHTML = document.getElementById(XRNA.circleID(nucleotideID));
                        if (nucleotideBondSymbolHTML) {
                            XRNA.selection.selected.push(new class extends SelectedElement {
                                updateXYHelper(x : number, y : number) {
                                    nucleotideBondSymbolHTML.setAttribute('cx', '' + x);
                                    nucleotideBondSymbolHTML.setAttribute('cy', '' + y);
                                }
                            }(parseFloat(nucleotideBondSymbolHTML.getAttribute('cx')), parseFloat(nucleotideBondSymbolHTML.getAttribute('cy')), false, false));
                        } else {
                            nucleotideBondSymbolHTML = document.getElementById(XRNA.bondLineID(nucleotideID));
                            XRNA.selection.selected.push(new class extends SelectedElement {
                                updateXYHelper(x : number, y : number) {
                                    nucleotideBondSymbolHTML.setAttribute('x1', '' + x);
                                    nucleotideBondSymbolHTML.setAttribute('y1', '' + y);
                                }
                            }(parseFloat(nucleotideBondSymbolHTML.getAttribute('x1')), parseFloat(nucleotideBondSymbolHTML.getAttribute('y1')), false, false));
                            XRNA.selection.selected.push(new class extends SelectedElement {
                                updateXYHelper(x : number, y : number) {
                                    nucleotideBondSymbolHTML.setAttribute('x2', '' + x);
                                    nucleotideBondSymbolHTML.setAttribute('y2', '' + y);
                                }
                            }(parseFloat(nucleotideBondSymbolHTML.getAttribute('x2')), parseFloat(nucleotideBondSymbolHTML.getAttribute('y2')), false, false));
                        }
                        
                    }
                    selected.forEach(selectedI => {;
                        XRNA.selection.selected.push({
                            updateXYHelper : (x : number, y : number) => {
                                selectedI.htmlElement.setAttribute('x', '' + x);
                                selectedI.htmlElement.setAttribute('y', '' + y);
                            },
                            cache : {
                                x : parseFloat(selectedI.htmlElement.getAttribute('x')),
                                y : parseFloat(selectedI.htmlElement.getAttribute('y'))
                            },
                            invertYFlag : selectedI.invertYFlag,
                            xyAreDisplacementsFlag : false
                        });
                    });
                    XRNA.selection.selected.push({
                        updateXYHelper : (x : number, y : number) => {
                            nucleotide.point.x = x;
                            nucleotide.point.y = y;
                        },
                        cache : {
                            x : nucleotide.point.x,
                            y : nucleotide.point.y
                        },
                        invertYFlag : false,
                        xyAreDisplacementsFlag : false
                    });
                });
                XRNA.selection.highlighted.forEach(highlightedI => highlightedI.setAttribute('visibility', 'visible'));
            } else {
                alert(selectionConstraint.getErrorMessage());
            }
        }
        if (pressedButtonIndex & BUTTON_INDEX.MIDDLE) {
            let
                contextMenuHTML = document.getElementById('contextMenu'),
                contextMenuDimension = Math.ceil(Math.min(window.innerWidth, window.innerHeight) / 3.0),
                contextMenuDimensionAsString = contextMenuDimension + 'px';
            while (contextMenuHTML.firstChild) {
                contextMenuHTML.removeChild(contextMenuHTML.firstChild);
            }
            contextMenuHTML.style.display='block';
            contextMenuHTML.style.width = contextMenuDimensionAsString;
            contextMenuHTML.style.height = contextMenuDimensionAsString;
            // Provide a buffer for the context menu's border.
            contextMenuHTML.style.left = Math.min(window.innerWidth - contextMenuDimension - 6, mouseEvent.pageX) + 'px';
            contextMenuHTML.style.top = Math.min(window.innerHeight - contextMenuDimension - 6, mouseEvent.pageY) + 'px';

            selectionConstraint.populateContextMenu(contextMenuHTML, rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
        }
    }

    public static getPathsFromLine(p0 : Point, p1 : Point) : {cap0Path : string, bodyPath : string, cap1Path : string} {
        let
            dx = p1.x - p0.x,
            dy = p1.y - p0.y,
            interpolation0X = VectorOperations.linearlyInterpolate(p0.x, p1.x, 0.25),
            interpolation0Y = VectorOperations.linearlyInterpolate(p0.y, p1.y, 0.25),
            interpolation1X = VectorOperations.linearlyInterpolate(p0.x, p1.x, 0.75),
            interpolation1Y = VectorOperations.linearlyInterpolate(p0.y, p1.y, 0.75),
            clickableScalar = 1,
            magnitude = VectorOperations.magnitude(dx, dy);
        dx /= magnitude;
        dy /= magnitude;
        let
            interpolation0Translated0 = {x: interpolation0X - dy * clickableScalar, y: interpolation0Y + dx * clickableScalar},
            interpolation0Translated1 = {x: interpolation0X + dy * clickableScalar, y: interpolation0Y - dx * clickableScalar},
            interpolation1Translated0 = {x: interpolation1X - dy * clickableScalar, y: interpolation1Y + dx * clickableScalar},
            interpolation1Translated1 = {x: interpolation1X + dy * clickableScalar, y: interpolation1Y - dx * clickableScalar};
        return {
            cap0Path: 'M ' + interpolation0Translated1.x + ' ' + interpolation0Translated1.y + ' L ' + (p0.x + dy * clickableScalar) + ' ' + (p0.y - dx * clickableScalar) + ' a 0.5 0.5 0 0 0 ' + (-2 * dy * clickableScalar) + ' ' + (2 * dx * clickableScalar) + ' L ' + interpolation0Translated0.x + ' ' + interpolation0Translated0.y + ' z',
            bodyPath: 'M ' + interpolation0Translated0.x + ' ' + interpolation0Translated0.y + ' L ' + interpolation1Translated0.x + ' ' + interpolation1Translated0.y + ' L ' + interpolation1Translated1.x + ' ' + interpolation1Translated1.y + ' L ' + interpolation0Translated1.x + ' ' + interpolation0Translated1.y + ' z',
            cap1Path: 'M ' + interpolation1Translated0.x + ' ' + interpolation1Translated0.y + ' L ' + (p1.x - dy * clickableScalar) + ' ' + (p1.y + dx * clickableScalar) + ' a 0.5 0.5 0 0 0 ' + (2 * dy * clickableScalar) + ' ' + (-2 * dx * clickableScalar) + ' L ' + interpolation1Translated1.x + ' ' + interpolation1Translated1.y + ' z'
        };
    }

    public static prepareScene() : void {
        while (XRNA.sceneDressingHTML.firstChild) {
            XRNA.sceneDressingHTML.removeChild(XRNA.sceneDressingHTML.firstChild);
        }
        document.getElementById('background').onmousedown = (mouseEvent : MouseEvent) => {
            let
                buttonIndex = XRNA.getButtonIndex(mouseEvent);
            if (buttonIndex & BUTTON_INDEX.LEFT) {
                XRNA.resetSelection();
            }
            let
                contextMenuHTML = document.getElementById('contextMenu');
            contextMenuHTML.style.display = 'none';
        };
        let
            sceneHTML = document.createElementNS(svgNameSpaceURL, 'g');
        sceneHTML.setAttribute('id', 'scene');
        XRNA.sceneDressingHTML.appendChild(sceneHTML);
        XRNA.sceneBounds.minimumX = Number.MAX_VALUE,
        XRNA.sceneBounds.maximumX = -Number.MAX_VALUE,
        XRNA.sceneBounds.minimumY = Number.MAX_VALUE,
        XRNA.sceneBounds.maximumY = -Number.MAX_VALUE;
        for (let rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            let
                complex = XRNA.rnaComplexes[rnaComplexIndex],
                complexID = XRNA.rnaComplexID(rnaComplexIndex);
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
                    nucleotideHTML.setAttribute('x', '' + nucleotide.point.x);
                    nucleotideHTML.setAttribute('y', '' + nucleotide.point.y);
                    let
                        nucleotideColor = nucleotide.color;
                    nucleotideHTML.setAttribute('stroke', 'rgb(' + nucleotideColor.red + ' ' + nucleotideColor.green + ' ' + nucleotideColor.blue + ')');
                    nucleotideHTML.setAttribute('font-size', '' + nucleotide.font.size);
                    nucleotideHTML.setAttribute('font-family', nucleotide.font.family);
                    nucleotideHTML.setAttribute('font-style', nucleotide.font.style);
                    nucleotideHTML.setAttribute('font-weight', nucleotide.font.weight);
                    nucleotideHTML.setAttribute('transform', XRNA.invertYTransform(nucleotide.point.y));
                    nucleotideHTML.onmousedown = (mouseEvent : MouseEvent) => XRNA.onClickNucleotide(mouseEvent, nucleotideHTML);
                    rnaMoleculeHTML.appendChild(nucleotideHTML);
                    let 
                        boundingBoxes = new Array<DOMRect>(),
                        nucleotideBoundingBox = XRNA.getBoundingBox(nucleotideHTML),
                        boundingBoxHTML = XRNA.getBoundingBoxHTML(nucleotideBoundingBox, nucleotideID);
                    boundingBoxesHTML.appendChild(boundingBoxHTML);
                    boundingBoxes.push(nucleotideBoundingBox);
                    let
                        nucleotideBoundingBoxCenterX = nucleotideBoundingBox.x + nucleotideBoundingBox.width / 2.0,
                        nucleotideBoundingBoxCenterY = nucleotideBoundingBox.y + nucleotideBoundingBox.height / 2.0;
                    if (nucleotide.labelLine) {
                        let
                            labelLineHTML = document.createElementNS(svgNameSpaceURL, 'line'),
                            labelLineClickableBodyHTML = document.createElementNS(svgNameSpaceURL, 'path'),
                            labelLineClickableCap0HTML = document.createElementNS(svgNameSpaceURL, 'path'),
                            labelLineClickableCap1HTML = document.createElementNS(svgNameSpaceURL, 'path'),
                            labelLine = nucleotide.labelLine,
                            x0 = nucleotideBoundingBoxCenterX + labelLine.v0.x,
                            y0 = nucleotideBoundingBoxCenterY + labelLine.v0.y,
                            x1 = nucleotideBoundingBoxCenterX + labelLine.v1.x,
                            y1 = nucleotideBoundingBoxCenterY + labelLine.v1.y,
                            paths = XRNA.getPathsFromLine({
                                x : x0,
                                y : y0
                            }, {
                                x : x1,
                                y : y1
                            }),
                            lineColor = labelLine.color,
                            labelLineID = XRNA.labelLineID(nucleotideID),
                            labelLineBodyID = XRNA.labelLineBodyID(labelLineID),
                            labelLineCap0ID = XRNA.labelLineCap0ID(labelLineID),
                            labelLineCap1ID = XRNA.labelLineCap1ID(labelLineID);
                        labelLineClickableBodyHTML.setAttribute('d', paths.bodyPath);
                        labelLineClickableBodyHTML.setAttribute('id', '' + labelLineBodyID);
                        labelLineClickableBodyHTML.onmousedown = (mouseEvent : MouseEvent) => {
                            XRNA.onClickLabelLineBody(labelLineClickableBodyHTML);
                        };
                        labelLineClickableBodyHTML.setAttribute('visibility', 'hidden');
                        labelLineClickableBodyHTML.setAttribute('fill', 'none');
                        labelLineClickableBodyHTML.setAttribute('stroke', 'red');
                        labelLineClickableBodyHTML.setAttribute('stroke-width', '0.2');
                        labelLineClickableBodyHTML.setAttribute('pointer-events', 'all');
                        labelLinesGroupHTML.appendChild(labelLineClickableBodyHTML);

                        labelLineClickableCap0HTML.setAttribute('d', paths.cap0Path);
                        labelLineClickableCap0HTML.setAttribute('id', '' + labelLineCap0ID);
                        labelLineClickableCap0HTML.onmousedown = (mouseEvent : MouseEvent) => {
                            XRNA.onClickLabelLineCap(mouseEvent, labelLineClickableCap0HTML);
                        };
                        labelLineClickableCap0HTML.setAttribute('visibility', 'hidden');
                        labelLineClickableCap0HTML.setAttribute('fill', 'none');
                        labelLineClickableCap0HTML.setAttribute('stroke', 'red');
                        labelLineClickableCap0HTML.setAttribute('stroke-width', '0.2');
                        labelLineClickableCap0HTML.setAttribute('pointer-events', 'all');
                        labelLinesGroupHTML.appendChild(labelLineClickableCap0HTML);
                        
                        labelLineClickableCap1HTML.setAttribute('d', paths.cap1Path);
                        labelLineClickableCap1HTML.setAttribute('id', '' + labelLineCap1ID);
                        labelLineClickableCap1HTML.onmousedown = (mouseEvent : MouseEvent) => {
                            XRNA.onClickLabelLineCap(mouseEvent, labelLineClickableCap1HTML);
                        };
                        labelLineClickableCap1HTML.setAttribute('visibility', 'hidden');
                        labelLineClickableCap1HTML.setAttribute('fill', 'none');
                        labelLineClickableCap1HTML.setAttribute('stroke', 'red');
                        labelLineClickableCap1HTML.setAttribute('stroke-width', '0.2');
                        labelLineClickableCap1HTML.setAttribute('pointer-events', 'all');
                        labelLinesGroupHTML.appendChild(labelLineClickableCap1HTML);

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
                        let
                            labelContentHTML = document.createElementNS(svgNameSpaceURL, 'text');
                        labelContentHTML.setAttribute('id', XRNA.labelContentID(nucleotideID));
                        let 
                            labelContent = nucleotide.labelContent,
                            x = nucleotideBoundingBoxCenterX + labelContent.x;
                        labelContentHTML.setAttribute('x', '' + x);
                        let
                            y = nucleotideBoundingBoxCenterY + labelContent.y;
                        labelContentHTML.setAttribute('y', '' + y);
                        labelContentHTML.textContent = labelContent.content;
                        let
                            labelColor = labelContent.color;
                        labelContentHTML.setAttribute('stroke', 'rgb(' + labelColor.red + ' ' + labelColor.green + ' ' + labelColor.blue + ')');
                        let
                            labelFont = labelContent.font,
                            labelID = XRNA.labelContentID(nucleotideID);
                        labelContentHTML.setAttribute('id', labelID);
                        labelContentHTML.setAttribute('font-size', '' + labelFont.size);
                        labelContentHTML.setAttribute('font-family', labelFont.family);
                        labelContentHTML.setAttribute('font-style', labelFont.style);
                        labelContentHTML.setAttribute('font-weight', labelFont.weight);
                        labelContentHTML.setAttribute('transform', XRNA.invertYTransform(y));
                        labelContentHTML.onmousedown = (mouseEvent : MouseEvent) => {
                            XRNA.onClickLabelContent(labelContentHTML);
                        };
                        labelContentsGroupHTML.appendChild(labelContentHTML);
                        let
                            boundingBox = XRNA.getBoundingBox(labelContentHTML);
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
                        let
                            basePairedNucleotide = complex.rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotide.basePairIndex],
                            basePairedNucleotideBounds = XRNA.getBoundingBox(document.getElementById(XRNA.nucleotideID(rnaMoleculeID, nucleotide.basePairIndex))),
                            basePairedNucleotideBoundsCenterX = basePairedNucleotideBounds.x + basePairedNucleotideBounds.width / 2.0,
                            basePairedNucleotideBoundsCenterY = basePairedNucleotideBounds.y + basePairedNucleotideBounds.height / 2.0,
                            bondSymbolHTML : SVGElement,
                            circleHTMLHelper = (fill : string) => {
                                bondSymbolHTML = document.createElementNS(svgNameSpaceURL, 'circle');
                                bondSymbolHTML.setAttribute('id', XRNA.circleID(nucleotideID));
                                bondSymbolHTML.setAttribute('fill', fill);
                                bondSymbolHTML.setAttribute('cx', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX, 0.5));
                                bondSymbolHTML.setAttribute('cy', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY, 0.5));
                                bondSymbolHTML.setAttribute('r', '' + VectorOperations.distance({
                                    x : nucleotideBoundingBoxCenterX,
                                    y : nucleotideBoundingBoxCenterY
                                }, {
                                    x : basePairedNucleotideBoundsCenterX, 
                                    y : basePairedNucleotideBoundsCenterY
                                }) / 8.0);
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
                                bondSymbolHTML.setAttribute('id', XRNA.bondLineID(nucleotideID));
                                bondSymbolHTML.setAttribute('x1', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX, 0.25));
                                bondSymbolHTML.setAttribute('y1', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY, 0.25));
                                bondSymbolHTML.setAttribute('x2', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterX, basePairedNucleotideBoundsCenterX, 0.75));
                                bondSymbolHTML.setAttribute('y2', '' + VectorOperations.linearlyInterpolate(nucleotideBoundingBoxCenterY, basePairedNucleotideBoundsCenterY, 0.75));
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