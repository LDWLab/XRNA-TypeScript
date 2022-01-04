const svgNameSpaceURL = "http://www.w3.org/2000/svg";

const DEFAULT_STROKE_WIDTH = 0.2;

abstract class SelectionConstraint {
    abstract approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean;

    abstract approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean;

    abstract getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple>;

    abstract getErrorMessageForSelection() : string;

    abstract getErrorMessageForContextMenu() : string;

    abstract populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void;

    abstract populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void;

    populateXRNASelection(clickedOnNucleotideHTML : SVGElement, selectedNucleotideIndices : Array<NucleotideIndicesTuple>) : void {
        selectedNucleotideIndices.forEach(selectedNucleotideIndicesI => {
            let
                nucleotide = XRNA.rnaComplexes[selectedNucleotideIndicesI.rnaComplexIndex].rnaMolecules[selectedNucleotideIndicesI.rnaMoleculeIndex].nucleotides[selectedNucleotideIndicesI.nucleotideIndex],
                nucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(selectedNucleotideIndicesI.rnaComplexIndex), selectedNucleotideIndicesI.rnaMoleculeIndex), selectedNucleotideIndicesI.nucleotideIndex),
                nucleotideHTML = document.getElementById(nucleotideId),
                transformCoordinates = /\s*translate\s*\(\s*(-?\d+(?:\.\d*)?)\s+(-?\d+(?:\.\d*)?)\s*\)\s*/.exec(nucleotideHTML.getAttribute("transform"));
            SelectionConstraint.populateXRNASelectionHighlightsHelper(selectedNucleotideIndicesI.rnaComplexIndex, selectedNucleotideIndicesI.rnaMoleculeIndex, selectedNucleotideIndicesI.nucleotideIndex, nucleotideId, nucleotide);
            XRNA.selection.selectedElementListeners.push(
                new class extends SelectedElementListener {
                    updateXYHelper(x : number, y : number) : void {
                        nucleotide.position = {
                            x : x,
                            y : y
                        };
                    }
                }(nucleotide.position.x, nucleotide.position.y, true, false),
                new class extends SelectedElementListener {
                    updateXYHelper(x : number, y : number) : void {
                        nucleotideHTML.setAttribute("transform", "translate(" + x + " " + y + ")")
                    }
                }(parseFloat(transformCoordinates[1]), parseFloat(transformCoordinates[2]), false, false)
            );
        });
    }

    static populateXRNASelectionHighlightsHelper(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number, nucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex), nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex]) : void {
        let
            boundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(nucleotideId));
        boundingBoxHTML.setAttribute("visibility", "block")
        XRNA.selection.highlighted.push(boundingBoxHTML);
        if (nucleotide.labelLine) {
            let
                labelLineHTMLId = XRNA.labelLineHTMLId(nucleotideId),
                labelLineClickableBodyHTML = document.getElementById(XRNA.labelLineClickableBodyHTMLId(labelLineHTMLId)),
                labelLineClickableCap0HTML = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineHTMLId, 0)),
                labelLineClickableCap1HTML = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineHTMLId, 1));
            labelLineClickableBodyHTML.setAttribute("visibility", "block");
            labelLineClickableCap0HTML.setAttribute("visibility", "block");
            labelLineClickableCap1HTML.setAttribute("visibility", "block");
            XRNA.selection.highlighted.push(labelLineClickableBodyHTML, labelLineClickableCap0HTML, labelLineClickableCap1HTML);
        }
        if (nucleotide.labelContent) {
            let
                labelContentBoundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(XRNA.labelContentHTMLId(nucleotideId)));
            labelContentBoundingBoxHTML.setAttribute("visibility", "block");
            XRNA.selection.highlighted.push(labelContentBoundingBoxHTML);
        }
    }

    static createErrorMessageForSelection(requirementDescription : string, selectableDescription : string, furtherExplanation : string = "") : string {
        return "The selection constraint \"" + XRNA.selectionConstraintHTML.value + "\" requires selection of " + requirementDescription + ". Select " + selectableDescription + " or change the selection constraint. " + furtherExplanation;
    }
}

abstract class SelectedElementListener {
    constructor(x : number, y : number, invertYFlag : boolean, xyAreDisplacementsFlag : boolean) {
        this.cache = {
            x : x,
            y : y
        };
        this.invertYFlag = invertYFlag;
        this.xyAreDisplacementsFlag = xyAreDisplacementsFlag;
    }

    abstract updateXYHelper(x : number, y : number) : void;
    public readonly cache : Vector2D;
    public readonly invertYFlag : boolean;
    public readonly xyAreDisplacementsFlag : boolean
};

type BlobWithExtension = {
    blob : Blob,
    extension : string
}

type GraphicalLine = Line2D & Color & {
    strokeWidth : number
};

type AugmentedString = Font & Color & {
    string : string
};

type GraphicalString = Vector2D & AugmentedString;

type NucleotideIndicesTuple = {
    rnaComplexIndex: number,
    rnaMoleculeIndex: number,
    nucleotideIndex: number
};

abstract class OutputFileExtensionHandler {
    abstract writeOutputFile() : string;
    handleSelectedOutputFileExtension() : void {
        while (XRNA.outputFileSpecificationsDivHTML.firstChild) {
            XRNA.outputFileSpecificationsDivHTML.removeChild(XRNA.outputFileSpecificationsDivHTML.firstChild);
        }
    }
};

export enum ButtonIndex {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
    LEFT_RIGHT = 3,
    MIDDLE = 4,
    LEFT_MIDDLE = 5,
    RIGHT_MIDDLE = 6,
    LEFT_RIGHT_MIDDLE = 7
}

export type Vector2D = {
    x : number,
    y : number
};

export type Line2D = {
    v0 : Vector2D,
    v1 : Vector2D
};

export type Color = {
    red : number,
    green : number,
    blue : number
};

export type Font = {
    size : number,
    family : string,
    style : string,
    weight : string
};

export class VectorOperations2D {
    public static dotProduct(v0 : Vector2D, v1 : Vector2D) : number {
        return v0.x * v1.x + v0.y * v1.y;
    }

    public static scalarProjection(v0 : Vector2D, v1 : Vector2D) : number {
        // a^k * b^k == (a * b)^k
        // sqrt(a * a) * sqrt(b * b) == sqrt(a * a * b * b)
        return VectorOperations2D.dotProduct(v0, v1) / Math.sqrt(VectorOperations2D.magnitudeSquared(v0) * VectorOperations2D.magnitudeSquared(v1));
    }

    public static vectorProjection(v0 : Vector2D, v1 : Vector2D) : Vector2D {
        return VectorOperations2D.scaleUp(v1, VectorOperations2D.scalarProjection(v0, v1));
    }

    public static vectorRejection(v0 : Vector2D, v1 : Vector2D) : Vector2D {
        return VectorOperations2D.subtract(v0, VectorOperations2D.vectorProjection(v0, v1));
    }

    public static projectOntoLine(v : Vector2D, l : Line2D) : Vector2D {
        let
            dv = VectorOperations2D.subtract(l.v1, l.v0);
        return VectorOperations2D.add(l.v0, VectorOperations2D.vectorProjection(v, dv));
    }

    public static reflectAboutLine(v : Vector2D, l : Line2D) : Vector2D {
        return VectorOperations2D.subtract(v, VectorOperations2D.scaleUp(VectorOperations2D.vectorRejection(VectorOperations2D.subtract(v, l.v0), VectorOperations2D.subtract(l.v1, l.v0)), 2.0));
    }

    public static scaleUp(vector : Vector2D, scalar : number) : Vector2D {
        return {
            x : vector.x * scalar,
            y : vector.y * scalar
        };
    }

    public static scaleDown(vector : Vector2D, divisor : number) : Vector2D {
        return VectorOperations2D.scaleUp(vector, 1.0 / divisor);
    }

    public static normalize(vector : Vector2D) : Vector2D {
        return VectorOperations2D.scaleDown(vector, VectorOperations2D.magnitude(vector));
    }

    public static linearlyInterpolate(n0 : number, n1 : number, interpolationFactor : number) : number {
        // See https://en.wikipedia.org/wiki/Linear_interpolation
        return (1 - interpolationFactor) * n0 + interpolationFactor * n1;
    }

    public static add(v0 : Vector2D, v1 : Vector2D) : Vector2D {
        return {
            x : v0.x + v1.x,
            y : v0.y + v1.y
        };
    }

    public static subtract(v0 : Vector2D, v1 : Vector2D) : Vector2D {
        return {
            x : v0.x - v1.x,
            y : v0.y - v1.y
        };
    }

    public static negate(v : Vector2D) : Vector2D {
        return {
            x : -v.x,
            y : -v.y
        };
    }

    public static multiply(v0 : Vector2D, v1 : Vector2D) : Vector2D {
        return {
            x : v0.x * v1.x,
            y : v0.y * v1.y
        };
    }

    public static divide(v0 : Vector2D, v1 : Vector2D) : Vector2D {
        return {
            x : v0.x / v1.x,
            y : v0.y / v1.y
        };
    }

    public static magnitudeSquared(v : Vector2D) : number {
        return v.x * v.x + v.y * v.y;
    }

    public static magnitude(v : Vector2D) : number {
        return Math.sqrt(VectorOperations2D.magnitudeSquared(v));
    }

    public static distanceSquared(v0 : Vector2D, v1 : Vector2D) : number {
        return VectorOperations2D.magnitudeSquared(VectorOperations2D.subtract(v1, v0));
    }

    public static distance(v0 : Vector2D, v1 : Vector2D) : number {
        return Math.sqrt(VectorOperations2D.distanceSquared(v0, v1));
    }

    public static crossProduct(v0 : Vector2D, v1 : Vector2D) : number {
        return v0.x * v1.y - v0.y * v1.x;
    }

    public static crossProduct2D(v0 : Vector2D, v1 : Vector2D) : number {
        return v0.x * v1.y - v0.y * v1.x;
    }

    public static orthogonalize(v : Vector2D) : Vector2D {
        return {
            x : -v.y,
            y : v.x
        };
    }

    public static lineIntersection(line0 : Line2D, line1 : Line2D) : Vector2D | Line2D {
        // See https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
        let
            dX0 = line0.v1.x - line0.v0.x,
            dY0 = line0.v1.y - line0.v0.y,
            dX1 = line1.v1.x - line1.v0.x,
            dY1 = line1.v1.y - line1.v0.y,
            rCrossS = VectorOperations2D.crossProduct2D({
                x : dX0,
                y : dY0
            },
            {
                x : dX1,
                y : dY1
            }),
            qMinusPCrossR = VectorOperations2D.crossProduct2D(VectorOperations2D.subtract(line1.v0, line0.v0), {
                x : dX0,
                y : dY0
            });
        if (Utils.areApproximatelyEqual(rCrossS, 0)) {
            if (Utils.areApproximatelyEqual(qMinusPCrossR, 0)) {
                // The lines are colinear
                return line0;
            } else {
                return null;
            }
        } else {
            let
                u = qMinusPCrossR / rCrossS;
            return {
                x : VectorOperations2D.linearlyInterpolate(line1.v0.x, line1.v1.x, u),
                y : VectorOperations2D.linearlyInterpolate(line1.v0.y, line1.v1.y, u)
            };
        }
    }

    public static unsignedAngleBetweenVectors(v0 : Vector2D, v1 : Vector2D) : number {
        // a * b == cos(theta) * ||a|| * ||b||
        // a * b / (||a|| * ||b||) == cos(theta)
        // acos(a * b / (||a|| * ||b||)) == theta
        return Math.acos(VectorOperations2D.dotProduct(v0, v1) / Math.sqrt(VectorOperations2D.magnitudeSquared(v0) * VectorOperations2D.magnitudeSquared(v1)));
    }
}

export class AffineMatrix3D {
    scaleX : number;
    scaleY : number;
    translateX : number;
    translateY : number;
    skewX : number;
    skewY : number

    constructor(n0 : number, n1 : number, n2 : number, n3 : number, n4 : number, n5 : number, rowMajorOrder = false) {
        if (rowMajorOrder) {
            this.scaleX = n0;
            this.skewX = n1;
            this.translateX = n2;
            this.skewY = n3;
            this.scaleY = n4;
            this.translateY = n5;
        } else {
            this.scaleX = n0;
            this.skewY = n1;
            this.skewX = n2;
            this.scaleY = n3;
            this.translateX = n4;
            this.translateY = n5;
        }
    }

    public static identity() : AffineMatrix3D {
        return new AffineMatrix3D(1, 0, 0, 0, 1, 0, true);
    }

    public static translate(dx : number, dy : number) : AffineMatrix3D {
        return new AffineMatrix3D(1, 0, dx, 0, 1, dy, true);
    }

    public static scale(sx : number, sy : number) : AffineMatrix3D {
        return new AffineMatrix3D(sx, 0, 0, 0, sy, 0, true);
    }

    public static parseTransform(transform : string) : AffineMatrix3D {
        // Note that DOMMatrix did not work, appeared to contain a bug when multiplying a translation and a scale.
        let
            matrix = new AffineMatrix3D(1, 0, 0, 0, 1, 0, true);
        transform.trim().split(/\)\s+/g).forEach(transformI => {
            let
                coordinates = transformI.match(/-?[\d\.]+/g);
            if (transformI.startsWith('translate')) {
                let
                    translation = AffineMatrix3D.translate(parseFloat(coordinates[0]), parseFloat(coordinates[1]));
                matrix = AffineMatrix3D.multiply(matrix, translation);
            } else if (transformI.startsWith('scale')) {
                let
                    scale = AffineMatrix3D.scale(parseFloat(coordinates[0]), parseFloat(coordinates[1]));
                matrix = AffineMatrix3D.multiply(matrix, scale);
            }
        });
        return matrix;
    }

    public static multiply(left : AffineMatrix3D, right : AffineMatrix3D) : AffineMatrix3D {
        /*
        [sx0  skx0 dx0] * [sx1  skx1 dx1] = [sx0 * sx1 + skx0 * sky1   sx0 * skx1 + skx0 * sy1   sx0 * dx1 + skx0 * dy1 + dx0]
        [sky0 sy0  dy0]   [sky1 sy1  dy1]   [sky0 * sx1 + sy0 * sky1   sky0 * skx1 + sy0 * sy1   sky0 * dx1 + sy0 * dy1 + dy0]
        [0    0    1  ]   [0    0    1  ]   [0                         0                         1                           ]
        */
        return new AffineMatrix3D(
            left.scaleX * right.scaleX + left.skewX * right.skewY, left.scaleX * right.skewX + left.skewX * right.scaleY, left.scaleX * right.translateX + left.skewX * right.translateY + left.translateX,
            left.skewY * right.scaleX + left.scaleY * right.skewY, left.skewY * right.skewX + left.scaleY * right.scaleY, left.skewY * right.translateX + left.scaleY * right.translateY + left.translateY,
            true
        );
    }

    public static transform(matrix : AffineMatrix3D, vector2 : Vector2D) : Vector2D {
        /*
        [sx  skx dx]   [x]   [sx * x + skx * y + dx]
        [sky sy  dy] * [y] = [sky * x + sy * y + dy]
        [0   0   1 ]   [1]   [1                    ]
        */
        return {
            x : matrix.scaleX * vector2.x + matrix.skewX * vector2.y + matrix.translateX,
            y : matrix.skewY * vector2.x + matrix.scaleY * vector2.y + matrix.translateY
        };
    }
}

export class Utils {
    static readonly DEFAULT_EPSILON = 1E-4;

    public static getFileExtension(fileUrl : string) : string {
        fileUrl = fileUrl.trim();
        return fileUrl.substring(fileUrl.lastIndexOf(".") + 1);
    }

    public static openUrl(fileUrl : string) : BlobWithExtension {
        fileUrl = fileUrl.trim();
        let
            request = new XMLHttpRequest();
        request.open("GET", fileUrl, false);
        request.responseType = "blob";
        let
            blob : Blob;
        request.onload = function() {
            blob = request.response;
        };
        request.send();
        return {
            blob : blob,
            extension : Utils.getFileExtension(fileUrl)
        };
    }

    public static getFileContent(blob : Blob, fileContentHandler : (fileContent : string) => void) : void {
        let
            fileContent : string;
        new Promise(executor => {
            let
                fileReader = new FileReader();
            fileReader.addEventListener("load", () => executor(fileReader.result.toString()));
            fileReader.readAsText(blob, "UTF-8");
        }).then(readFileContent => {
            fileContentHandler(<string>readFileContent);
        });
    }

    public static clamp(minimum : number, value : number, maximum : number) : number {
        return Math.min(Math.max(minimum, value), maximum);
    }

    public static sign(n : number, epsilon = Utils.DEFAULT_EPSILON) : number {
        return n < -epsilon ? -1 : n < epsilon ? 0 : 1;
    }

    public static compare(n0 : number, n1 : number, epsilon = Utils.DEFAULT_EPSILON) : number{
        return Utils.sign(n1 - n0, epsilon);
    }

    public static areApproximatelyEqual(n0 : number, n1 : number, epsilon = Utils.DEFAULT_EPSILON) : boolean {
        return Utils.compare(n0, n1, epsilon) == 0;
    }

    public static parseRGB(rgbAsString : string) : Color {
        let
            rgbAsNumber = parseInt(rgbAsString),
            validColorFlag = true;
        if (isNaN(rgbAsNumber)) {
            // Attempt parsing as a hexadecimal string.
            rgbAsNumber = parseInt("0x" + rgbAsString);
            validColorFlag = !isNaN(rgbAsNumber);
        }
        if (validColorFlag) {
            return {
                red : (rgbAsNumber >> 16) & 0xFF,
                green : (rgbAsNumber >> 8) & 0xFF,
                blue : rgbAsNumber & 0xFF
            };
        } else {
            throw new Error("Invalid color string: " + rgbAsString + " is an invalid color. Only hexadecimal or integer values are accepted.");
        }
    }

    public static compressRGB(rgb : Color) : number {
        return ((rgb.red << 16) | (rgb.green << 8) | (rgb.blue));
    }

    public static expandRGB(rgb : number) : Color {
        return {
            red : rgb & 0xFF0000,
            green : rgb & 0xFF00,
            blue : rgb & 0xFF
        }
    }

    public static toHexadecimalString(color : Color) {
        return Utils.compressRGB(color).toString(16);
    }

    public static getButtonIndex(event : MouseEvent) : ButtonIndex {
        let
            index = -1;
        /*if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
            index = -1;
        } else */if ("buttons" in event) {
            index = event.buttons;
        } else if ("which" in event) {
            index = event.which ;
        } else {
            index = event.button;
        }
        if (index in ButtonIndex) {
            return <ButtonIndex>index;
        }
        throw new Error("Unrecognized button index: " + index);
    }

    public static invertYCoordinateTransform(y : number) : string {
        return "translate(0 " + y + ") scale(1 -1) translate(0 " + -y +")";
    }

    public static setBoundingBoxHTMLAttributes(boundingBoxLikeHTML : SVGRectElement | SVGPathElement, id : string) {
        boundingBoxLikeHTML.setAttribute("id", id);
        boundingBoxLikeHTML.setAttribute("visibility", "hidden");
        boundingBoxLikeHTML.setAttribute("stroke", "red");
        boundingBoxLikeHTML.setAttribute("stroke-width", "" + DEFAULT_STROKE_WIDTH);
        boundingBoxLikeHTML.setAttribute("fill", "none");
    }

    public static createBoundingBoxHTML(boundingBox : DOMRect, id : string) : SVGRectElement {
        let
            boundingBoxHTML = document.createElementNS(svgNameSpaceURL, "rect");
        boundingBoxHTML.setAttribute("x", "" + boundingBox.x);
        boundingBoxHTML.setAttribute("y", "" + boundingBox.y);
        boundingBoxHTML.setAttribute("width", "" + boundingBox.width);
        boundingBoxHTML.setAttribute("height", "" + boundingBox.height);
        Utils.setBoundingBoxHTMLAttributes(boundingBoxHTML, id);
        return boundingBoxHTML;
    }

    public static getClickablePathDefinitionsFromLine(line : Line2D, clickablePathWidth = 1) : {cap0PathDefinition : string, bodyPathDefinition : string, cap1PathDefinition : string} {
        let
            dv = VectorOperations2D.scaleUp(VectorOperations2D.normalize(VectorOperations2D.subtract(line.v1, line.v0)), clickablePathWidth),
            dvOrtholog = VectorOperations2D.orthogonalize(dv),
            interpolation0 = VectorOperations2D.add(line.v0, dv),
            interpolation1 = VectorOperations2D.subtract(line.v1, dv),
            // Note that the negative/positve directionality is arbitrary.
            // Only consistency is significant.
            interpolatedEndpoint0TranslatedPositively = VectorOperations2D.add(interpolation0, dvOrtholog),
            interpolatedEndpoint0TranslatedNegatively = VectorOperations2D.subtract(interpolation0, dvOrtholog),
            interpolatedEndpoint1TranslatedPositively = VectorOperations2D.add(interpolation1, dvOrtholog),
            interpolatedEndpoint1TranslatedNegatively = VectorOperations2D.subtract(interpolation1, dvOrtholog);
        return {
            cap0PathDefinition: 'M ' + interpolatedEndpoint0TranslatedNegatively.x + ' ' + interpolatedEndpoint0TranslatedNegatively.y + ' L ' + (line.v0.x + dv.y) + ' ' + (line.v0.y - dv.x) + ' a 0.5 0.5 0 0 0 ' + (-2 * dv.y) + ' ' + (2 * dv.x) + ' L ' + interpolatedEndpoint0TranslatedPositively.x + ' ' + interpolatedEndpoint0TranslatedPositively.y + ' z',
            cap1PathDefinition: 'M ' + interpolatedEndpoint1TranslatedPositively.x + ' ' + interpolatedEndpoint1TranslatedPositively.y + ' L ' + (line.v1.x - dv.y) + ' ' + (line.v1.y + dv.x) + ' a 0.5 0.5 0 0 0 ' + (2 * dv.y) + ' ' + (-2 * dv.x) + ' L ' + interpolatedEndpoint1TranslatedNegatively.x + ' ' + interpolatedEndpoint1TranslatedNegatively.y + ' z',
            bodyPathDefinition: 'M ' + interpolatedEndpoint0TranslatedPositively.x + ' ' + interpolatedEndpoint0TranslatedPositively.y + ' L ' + interpolatedEndpoint1TranslatedPositively.x + ' ' + interpolatedEndpoint1TranslatedPositively.y + ' L ' + interpolatedEndpoint1TranslatedNegatively.x + ' ' + interpolatedEndpoint1TranslatedNegatively.y + ' L ' + interpolatedEndpoint0TranslatedNegatively.x + ' ' + interpolatedEndpoint0TranslatedNegatively.y + ' z'
        };
    }
}

export type RNAComplex = {
    rnaMolecules : Array<RNAMolecule>,
    name : string
};

export type RNAMolecule = {
    nucleotides : Array<Nucleotide>,
    firstNucleotideIndex : number,
    name : string
};

export type Nucleotide = {
    position : Vector2D,
    // The nucleotide symbol (A|C|G|U)
    symbol : AugmentedString,
    // The index of the base-paired Nucleotide
    basePairIndex : number,
    // Note that the coordinates of the label line are relative coordinates.
    labelLine : GraphicalLine,
    // Note that the coordinates of the label content are relative coordinates.
    // Label lines and content may exist independently.
    labelContent : GraphicalString
};

export class XRNA {
    private static complexDocumentName : string;

    static rnaComplexes : Array<RNAComplex>;

    public static canvasHTML : HTMLElement;

    static selectionConstraintHTML : HTMLSelectElement;

    private static sceneHTML : SVGElement;

    private static sketchesHTML : SVGElement;

    private static downloaderHTML : HTMLAnchorElement;

    private static zoomSliderHTML : HTMLInputElement;

    private static contextMenuHTML : HTMLDivElement;

    private static rnaComplexSelectorHTML : HTMLSelectElement;

    static outputFileSpecificationsDivHTML : HTMLDivElement;
    
    public static readonly ID_DELIMITER = ": ";

    static selection : {
        highlighted : (HTMLElement | SVGPathElement)[],
        selectedElementListeners : SelectedElementListener[];
    };

    private static canvasBounds = {
        x : 0,
        y : 0,
        width : 1,
        height : 1,
        top : 0,
        left : 0,
        bottom : 1,
        right : 1
    };

    private static sceneDataBounds = {
        x : 0,
        y : 0,
        width : 1,
        height : 1,
        top : 0,
        left : 0,
        bottom : 1,
        right : 1
    };

    private static sceneDataToCanvasBoundsScalar : number = 1;

    private static sceneTransformStart : string = "";
    
    private static sceneTransformMiddle : string = "";

    private static sceneTransformEnd : string = "";

    private static sceneTransformData = {
        minimumZoom : -48,
        maximumZoom : 48,
        // zoom is on a linear scale. It is converted to an exponential scale before use in the scene transform.
        zoom : 0,
        scale : 1,
        origin : {
            x : 0,
            y : 0
        }
    };

    private static draggingCoordinates : {
        cacheDragCoordinates : Vector2D,
        // Note it is VITAL that startDragCoordinates be updated upon each mouse-handling operation.
        startDragCoordinates : Vector2D
    }

    // Note it is VITAL that buttonIndex be updated upon each mouse-handling operation.
    private static buttonIndex : ButtonIndex;

    private static inputFileHandlerMap : Record<string, (inputFileContent : string) => void> = {
        "xml" : XRNA.parseInputXMLFile,
        "ps" : XRNA.parseInputXMLFile,
        "ss" : XRNA.parseInputXMLFile,
        "xrna" : XRNA.parseInputXMLFile,
        "str" : XRNA.parseInputSTRFile,
        "svg" : XRNA.parseInputSVGFile,
        "json" : XRNA.parseInputJSONFile
    };

    private static outputFileHandlerMap : Record<string, OutputFileExtensionHandler> = {
        "xrna" : new class extends OutputFileExtensionHandler {
            writeOutputFile = XRNA.generateOutputXRNAFile;
        },
        "svg" : new class extends OutputFileExtensionHandler {
            writeOutputFile = XRNA.generateOutputSVGFile;
        },
        "tr" : new class extends OutputFileExtensionHandler {
            writeOutputFile = XRNA.generateOutputTRFile;
        },
        "csv" : new class extends OutputFileExtensionHandler {
            writeOutputFile = XRNA.generateOutputCSVFile;
        },
        "bpseq" : new class extends OutputFileExtensionHandler {
            writeOutputFile = XRNA.generateOutputBPSEQFile;
        },
        "jpg" : new class extends OutputFileExtensionHandler {
            writeOutputFile = XRNA.generateOutputJPGFile;
        },
        "json" : new class extends OutputFileExtensionHandler {
            selectedRNAComplex = null;
            selectedRNAMolecule = null;
            writeOutputFile = () => {
                let
                    outputFile = "{";
                if (this.selectedRNAMolecule) {
                    outputFile += XRNA.generateOutputJSONFileForRNAMolecule(this.selectedRNAMolecule);
                } else if (this.selectedRNAComplex) {
                    outputFile += XRNA.generateOutputJSONFileForRNAComplex(this.selectedRNAComplex);
                } else {
                    outputFile += XRNA.generateOutputJSONFile();
                }
                outputFile += "\n}";
                return outputFile;
            };
            handleSelectedOutputFileExtension = () => {
                super.handleSelectedOutputFileExtension();
                let
                    rnaComplexSelector = document.createElement("select"),
                    rnaMoleculeSelector = document.createElement("select");
                for (let i = 0; i < XRNA.rnaComplexes.length; i++) {
                    rnaComplexSelector.appendChild(new Option("" + XRNA.rnaComplexes[i].name, "" + i));
                }
                rnaComplexSelector.appendChild(new Option("", "-1"));
                rnaComplexSelector.selectedIndex = -1;
                rnaComplexSelector.onchange = () => {
                    this.selectedRNAComplex = XRNA.rnaComplexes[parseInt(rnaComplexSelector.value)];
                    if (this.selectedRNAComplex) {
                        let
                            rnaMolecules = this.selectedRNAComplex.rnaMolecules;
                        for (let i = 0; i < rnaMolecules.length; i++) {
                            rnaMoleculeSelector.appendChild(new Option("" + rnaMolecules[i].name, "" + i));
                        }
                        rnaMoleculeSelector.appendChild(new Option("", "-1"));
                        rnaMoleculeSelector.selectedIndex = -1;
                    }
                    this.selectedRNAMolecule = null;
                };
                rnaMoleculeSelector.onchange = () => {
                    this.selectedRNAMolecule = this.selectedRNAComplex.rnaMolecules[parseInt(rnaMoleculeSelector.value)];
                };
                let
                    rnaComplexTextHTML = document.createElement("text"),
                    rnaMoleculeTextHTML = document.createElement("text");
                rnaComplexTextHTML.textContent = "RNA Complex: ";
                rnaMoleculeTextHTML.textContent = "RNA Molecule: ";
                XRNA.outputFileSpecificationsDivHTML.appendChild(rnaComplexTextHTML);
                XRNA.outputFileSpecificationsDivHTML.appendChild(rnaComplexSelector);
                XRNA.outputFileSpecificationsDivHTML.appendChild(rnaMoleculeTextHTML);
                XRNA.outputFileSpecificationsDivHTML.appendChild(rnaMoleculeSelector);
                // parentHTMLElement.insertBefore(rnaComplexSelector, downloadButton);
                // parentHTMLElement.insertBefore(rnaMoleculeSelector, downloadButton);
            };
        }
    };

    private static namedSelectionConstraintsMap : Record<string, SelectionConstraint> = {
        "RNA Single Nucleotide" : new class extends SelectionConstraint {
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex < 0;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                return [{
                    rnaComplexIndex : rnaComplexIndex,
                    rnaMoleculeIndex : rnaMoleculeIndex,
                    nucleotideIndex : nucleotideIndex
                }];
            }
            getErrorMessageForSelection() : string {
                return SelectionConstraint.createErrorMessageForSelection("a nucleotide without a base pair", "a non-base-paired nucleotide");
            }
            getErrorMessageForContextMenu() : string {
                throw new Error("This method instance should be unreachable.");
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                let
                    createTextElement = (text : string, fontSize : number = 12, fontWeight = "normal", fontFamily : string = "Dialog", fontStyle : string = "normal") => {
                        let
                            textElement = document.createElement("text");
                        textElement.setAttribute("stroke", "black");
                        textElement.style.fontSize = "" + fontSize;
                        textElement.style.fontWeight = fontWeight;
                        textElement.style.fontFamily = fontFamily;
                        textElement.style.fontStyle = fontStyle;
                        textElement.textContent = text;
                        return textElement;
                    },
                    complex = XRNA.rnaComplexes[rnaComplexIndex],
                    rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex],
                    nucleotides = rnaMolecule.nucleotides,
                    nucleotide = nucleotides[nucleotideIndex],
                    nucleotideTextContent = "Nucleotide: " + (nucleotideIndex + rnaMolecule.firstNucleotideIndex) + " " + nucleotide.symbol.string;
                if (nucleotide.basePairIndex >= 0) {
                    nucleotideTextContent += ", Base Pair: " + (nucleotide.basePairIndex + rnaMolecule.firstNucleotideIndex) + " " + nucleotides[nucleotide.basePairIndex].symbol.string;
                }
                XRNA.contextMenuHTML.appendChild(createTextElement("Nucleotide Properties:", 14, "bold"));
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                XRNA.contextMenuHTML.appendChild(createTextElement(nucleotideTextContent));
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                XRNA.contextMenuHTML.appendChild(createTextElement("In RNA Strand \"" + rnaMolecule.name + "\""));
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                let
                    previousNucleotideDistanceHTML = null,
                    nextNucleotideDistanceHTML = null,
                    distanceToPreviousNucleotideTextContentHelper = () => "Distance to previous nucleotide: " + VectorOperations2D.distance(nucleotide.position, nucleotides[nucleotideIndex - 1].position).toFixed(2),
                    distanceToNextNucleotideTextContentHelper = () => "Distance to next nucleotide: " + VectorOperations2D.distance(nucleotide.position, nucleotides[nucleotideIndex + 1].position).toFixed(2);
                if (nucleotideIndex > 0) {
                    previousNucleotideDistanceHTML = createTextElement(distanceToPreviousNucleotideTextContentHelper());
                    XRNA.contextMenuHTML.appendChild(previousNucleotideDistanceHTML);
                    XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                }
                if (nucleotideIndex < nucleotides.length - 1) {
                    nextNucleotideDistanceHTML = createTextElement(distanceToNextNucleotideTextContentHelper());
                    XRNA.contextMenuHTML.appendChild(nextNucleotideDistanceHTML);
                    XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                }
                XRNA.contextMenuHTML.appendChild(createTextElement("X:"));
                let
                    xInputHTML = document.createElement("input"),
                    yInputHTML = document.createElement("input"),
                    displacementMagnitude = 0.5,
                    nucleotideHTML = document.getElementById(XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex));
                XRNA.contextMenuHTML.appendChild(xInputHTML);
                xInputHTML.setAttribute("type", "text");
                xInputHTML.value = "" + nucleotide.position.x;
                xInputHTML.onchange = () => {
                    let
                        x = parseFloat(xInputHTML.value);
                    nucleotide.position.x = x;
                    nucleotideHTML.setAttribute("transform", "translate(" + xInputHTML.value + " " + nucleotide.position.y + ")");
                    if (previousNucleotideDistanceHTML) {
                        previousNucleotideDistanceHTML.textContent = distanceToPreviousNucleotideTextContentHelper();
                    }
                    if (nextNucleotideDistanceHTML) {
                        nextNucleotideDistanceHTML.textContent = distanceToNextNucleotideTextContentHelper();
                    }
                };
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                XRNA.contextMenuHTML.appendChild(createTextElement("Y:"));
                XRNA.contextMenuHTML.appendChild(yInputHTML);
                yInputHTML.setAttribute("type", "text");
                yInputHTML.value = "" + nucleotide.position.y;
                yInputHTML.onchange = () => {
                    let
                        y = parseFloat(yInputHTML.value);
                    nucleotide.position.y = y;
                    nucleotideHTML.setAttribute("transform", "translate(" + nucleotide.position.x + " " + yInputHTML.value + ")");
                    if (previousNucleotideDistanceHTML) {
                        previousNucleotideDistanceHTML.textContent = distanceToPreviousNucleotideTextContentHelper();
                    }
                    if (nextNucleotideDistanceHTML) {
                        nextNucleotideDistanceHTML.textContent = distanceToNextNucleotideTextContentHelper();
                    }
                };
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                if (nucleotide.basePairIndex < 0) {
                    let
                        svgHTML = document.createElementNS(svgNameSpaceURL, "svg"),
                        pathDimension = parseFloat(XRNA.contextMenuHTML.style.width) / 9.0;
                    XRNA.contextMenuHTML.appendChild(svgHTML);
                    svgHTML.setAttribute("version", "1.1");
                    svgHTML.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    svgHTML.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
                    svgHTML.setAttribute("xml:space", "preserve");
                    [
                        {
                            // Up arrow
                            pathDefinitionVertices : [
                                {
                                    x : 0.25,
                                    y : 1.0
                                },
                                {
                                    x : 0.25,
                                    y : 0.5
                                },
                                {
                                    x : 0.0,
                                    y : 0.5
                                },
                                {
                                    x : 0.5,
                                    y : 0.0
                                },
                                {
                                    x : 1.0,
                                    y : 0.5
                                },
                                {
                                    x : 0.75,
                                    y : 0.5
                                },
                                {
                                    x : 0.75,
                                    y : 1.0
                                }
                            ],
                            pathDefinitionOrigin : {
                                x : 1,
                                y : 0
                            },
                            onMouseDownHelper : () => {
                                nucleotide.position.y += displacementMagnitude;
                                let
                                    yAsString = "" + nucleotide.position.y
                                nucleotideHTML.setAttribute("transform", "translate(" + nucleotide.position.x + " " + yAsString + ")");
                                yInputHTML.value = yAsString;
                            }
                        },
                        {
                            // Right arrow
                            pathDefinitionVertices : [
                                {
                                    x : 0.0,
                                    y : 0.25
                                },
                                {
                                    x : 0.5,
                                    y : 0.25
                                },
                                {
                                    x : 0.5,
                                    y : 0.0
                                },
                                {
                                    x : 1.0,
                                    y : 0.5
                                },
                                {
                                    x : 0.5,
                                    y : 1.0
                                },
                                {
                                    x : 0.5,
                                    y : 0.75
                                },
                                {
                                    x : 0.0,
                                    y : 0.75
                                }
                            ],
                            pathDefinitionOrigin : {
                                x : 2,
                                y : 1
                            },
                            onMouseDownHelper : () => {
                                nucleotide.position.x += displacementMagnitude;
                                let
                                    xAsString = "" + nucleotide.position.x
                                nucleotideHTML.setAttribute("transform", "translate(" + xAsString + " " + nucleotide.position.y + ")");
                                xInputHTML.value = xAsString;
                            }
                        },
                        {
                            // Down arrow
                            pathDefinitionVertices : [
                                {
                                    x : 0.75,
                                    y : 0.0
                                },
                                {
                                    x : 0.75,
                                    y : 0.5
                                },
                                {
                                    x : 1.0,
                                    y : 0.5
                                },
                                {
                                    x : 0.5,
                                    y : 1.0
                                },
                                {
                                    x : 0.0,
                                    y : 0.5
                                },
                                {
                                    x : 0.25,
                                    y : 0.5
                                },
                                {
                                    x : 0.25,
                                    y : 0.0
                                }
                            ],
                            pathDefinitionOrigin : {
                                x : 1,
                                y : 2
                            },
                            onMouseDownHelper : () => {
                                nucleotide.position.y -= displacementMagnitude;
                                let
                                    yAsString = "" + nucleotide.position.y
                                nucleotideHTML.setAttribute("transform", "translate(" + nucleotide.position.x + " " + yAsString + ")");
                                yInputHTML.value = yAsString;
                            }
                        },
                        {
                            // Left arrow
                            pathDefinitionVertices : [
                                {
                                    x : 1.0,
                                    y : 0.75
                                },
                                {
                                    x : 0.5,
                                    y : 0.75
                                },
                                {
                                    x : 0.5,
                                    y : 1.0
                                },
                                {
                                    x : 0.0,
                                    y : 0.5
                                },
                                {
                                    x : 0.5,
                                    y : 0.0
                                },
                                {
                                    x : 0.5,
                                    y : 0.25
                                },
                                {
                                    x : 1.0,
                                    y : 0.25
                                }
                            ],
                            pathDefinitionOrigin : {
                                x : 0,
                                y : 1
                            },
                            onMouseDownHelper : () => {
                                nucleotide.position.x -= displacementMagnitude;
                                let
                                    xAsString = "" + nucleotide.position.x
                                nucleotideHTML.setAttribute("transform", "translate(" + xAsString + " " + nucleotide.position.y + ")");
                                xInputHTML.value = xAsString;
                            }
                        }
                    ].forEach(pathDataI => {
                        pathDataI.pathDefinitionOrigin = VectorOperations2D.scaleUp(pathDataI.pathDefinitionOrigin, pathDimension);
                        pathDataI.pathDefinitionVertices = pathDataI.pathDefinitionVertices.map(pathDefinitionVertexI => VectorOperations2D.scaleUp(pathDefinitionVertexI, pathDimension));
                        let
                            pathSVGElement = document.createElementNS(svgNameSpaceURL, "path"),
                            pathDefinitionVertex0 = pathDataI.pathDefinitionVertices[0],
                            pathDefinition = "M " + pathDefinitionVertex0.x + " " + pathDefinitionVertex0.y;
                        for (let pathDefinitionVertexIndex = 1; pathDefinitionVertexIndex < pathDataI.pathDefinitionVertices.length; pathDefinitionVertexIndex++) {
                            let
                                pathDefinitionVertex = pathDataI.pathDefinitionVertices[pathDefinitionVertexIndex];
                            pathDefinition += " L " + pathDefinitionVertex.x + " " + pathDefinitionVertex.y;
                        }
                        pathDefinition += " z";
                        svgHTML.appendChild(pathSVGElement);
                        pathSVGElement.setAttribute("d", pathDefinition);
                        pathSVGElement.setAttribute("stroke", "rgb(0 0 0)");
                        pathSVGElement.setAttribute("fill", "darkgray");
                        pathSVGElement.setAttribute("transform", "translate(" + pathDataI.pathDefinitionOrigin.x + " " + pathDataI.pathDefinitionOrigin.y + ")");
                        pathSVGElement.onmousedown = (mouseEvent : MouseEvent) => {
                            pathSVGElement.setAttribute("fill", "green");
                            pathDataI.onMouseDownHelper();
                            if (previousNucleotideDistanceHTML) {
                                previousNucleotideDistanceHTML.textContent = distanceToPreviousNucleotideTextContentHelper();
                            }
                            if (nextNucleotideDistanceHTML) {
                                nextNucleotideDistanceHTML.textContent = distanceToNextNucleotideTextContentHelper();
                            }
                            return false;
                        }
                        pathSVGElement.onmouseup = (mouseEvent : MouseEvent) => {
                            pathSVGElement.setAttribute("fill", "darkgray");
                            return false;
                        };
                    });
                } else {
                    xInputHTML.disabled = true;
                    yInputHTML.disabled = true;
                }
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                let
                    htmlTextElement = document.createElement("text"),
                    rnaMolecule = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex];
                htmlTextElement.textContent = "Nucleotide " + nucleotideIndex + " " + rnaMolecule.nucleotides[nucleotideIndex].symbol.string;
                XRNA.contextMenuHTML.appendChild(htmlTextElement);
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                htmlTextElement = document.createElement("text");
                htmlTextElement.textContent = "In RNA Strand \"" + rnaMolecule.name + "\"";
                XRNA.contextMenuHTML.appendChild(htmlTextElement);
            }
        },
        "RNA Single Strand" : new class extends SelectionConstraint {
            selectedNucleotideIndices : Array<NucleotideIndicesTuple>;
            errorMessage : string;

            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides;
                if (nucleotides[nucleotideIndex].basePairIndex < 0) {
                    this.selectedNucleotideIndices = new Array<NucleotideIndicesTuple>();
                    for (let adjacentNucleotideIndex = nucleotideIndex - 1; adjacentNucleotideIndex >= 0 && nucleotides[adjacentNucleotideIndex].basePairIndex < 0; adjacentNucleotideIndex--) {
                        this.selectedNucleotideIndices.unshift({
                            rnaComplexIndex : rnaComplexIndex,
                            rnaMoleculeIndex : rnaMoleculeIndex,
                            nucleotideIndex : adjacentNucleotideIndex
                        });
                    }
                    this.selectedNucleotideIndices.push({
                        rnaComplexIndex : rnaComplexIndex,
                        rnaMoleculeIndex : rnaMoleculeIndex,
                        nucleotideIndex : nucleotideIndex
                    });
                    for (let adjacentNucleotideIndex = nucleotideIndex + 1; adjacentNucleotideIndex < nucleotides.length && nucleotides[adjacentNucleotideIndex].basePairIndex < 0; adjacentNucleotideIndex++) {
                        this.selectedNucleotideIndices.push({
                            rnaComplexIndex : rnaComplexIndex,
                            rnaMoleculeIndex : rnaMoleculeIndex,
                            nucleotideIndex : adjacentNucleotideIndex
                        });
                    }
                    if (this.selectedNucleotideIndices.length > 1 && (nucleotideIndex == 0 || nucleotideIndex == nucleotides.length - 1)) {
                        this.errorMessage = "If the selected strand contains multiple nucleotides, the clicked-on nucleotide must not be a terminal nucleotide (5\' or 3\')";
                        return false;
                    }
                    return true;
                } else {
                    this.errorMessage = SelectionConstraint.createErrorMessageForSelection("a nucleotide without a base pair", "a non-base-paired nucleotide");
                    return false;
                }
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                return this.selectedNucleotideIndices;
            }
            getErrorMessageForSelection() : string {
                return this.errorMessage;
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                let
                    rnaComplex = XRNA.rnaComplexes[rnaComplexIndex],
                    rnaMolecule = rnaComplex.rnaMolecules[rnaMoleculeIndex],
                    nucleotide = rnaMolecule.nucleotides[nucleotideIndex],
                    htmlTextElement = document.createElement("text");
                htmlTextElement.textContent = "Picked nucleotide " + (rnaMolecule.firstNucleotideIndex + nucleotideIndex) + " " + nucleotide.symbol.string + " in RNA Complex \"" + rnaComplex.name + "\", RNA Molecule \"" + rnaMolecule.name + "\"";
                XRNA.contextMenuHTML.appendChild(htmlTextElement);

                let
                    selectedNucleotideIndices = this.getSelectedNucleotideIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex),
                    leastNucleotideIndex = Number.MAX_VALUE,
                    greatestNucleotideIndex = -Number.MAX_VALUE;
                selectedNucleotideIndices.forEach(nucleotideIndexTuple => {
                    if (nucleotideIndexTuple.nucleotideIndex < leastNucleotideIndex) {
                        leastNucleotideIndex = nucleotideIndexTuple.nucleotideIndex;
                    }
                    if (nucleotideIndexTuple.nucleotideIndex > greatestNucleotideIndex) {
                        greatestNucleotideIndex = nucleotideIndexTuple.nucleotideIndex;
                    }
                });
                leastNucleotideIndex = Math.max(leastNucleotideIndex, 1);
                greatestNucleotideIndex = Math.min(greatestNucleotideIndex, rnaMolecule.nucleotides.length - 2);
                leastNucleotideIndex += rnaMolecule.firstNucleotideIndex;
                greatestNucleotideIndex += rnaMolecule.firstNucleotideIndex;
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                htmlTextElement = document.createElement("text");
                htmlTextElement.textContent = "Includes nucleotides " + leastNucleotideIndex + " - " + greatestNucleotideIndex;
                XRNA.contextMenuHTML.appendChild(htmlTextElement);
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                htmlTextElement = document.createElement("text");
                htmlTextElement.textContent = "Bounding nucleotides: " + (leastNucleotideIndex - 1) + ", " + (greatestNucleotideIndex + 1);
                XRNA.contextMenuHTML.appendChild(htmlTextElement);
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
                
                // contextMenuElementHTML.textContent = "Contains nucleotides " + ;
                XRNA.contextMenuHTML.appendChild(document.createElement("br"));
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateXRNASelection(clickedOnNucleotideHTML : SVGElement, selectedNucleotideIndices : Array<NucleotideIndicesTuple>) : void {
                selectedNucleotideIndices.forEach(selectedNucleotideIndices => {
                    SelectionConstraint.populateXRNASelectionHighlightsHelper(selectedNucleotideIndices.rnaComplexIndex, selectedNucleotideIndices.rnaMoleculeIndex, selectedNucleotideIndices.nucleotideIndex);
                });
                let
                    selectedNucleotideIndicesTuple0 = selectedNucleotideIndices[0];
                if (selectedNucleotideIndices.length == 1 && (selectedNucleotideIndicesTuple0.nucleotideIndex == 0 || selectedNucleotideIndicesTuple0.nucleotideIndex == XRNA.rnaComplexes[selectedNucleotideIndicesTuple0.rnaComplexIndex].rnaMolecules[selectedNucleotideIndicesTuple0.rnaMoleculeIndex].nucleotides.length - 1)) {
                    let
                        nucleotide = XRNA.rnaComplexes[selectedNucleotideIndicesTuple0.rnaComplexIndex].rnaMolecules[selectedNucleotideIndicesTuple0.rnaMoleculeIndex].nucleotides[selectedNucleotideIndicesTuple0.nucleotideIndex],
                        nucleotideHTML = document.getElementById(XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(selectedNucleotideIndicesTuple0.rnaComplexIndex), selectedNucleotideIndicesTuple0.rnaMoleculeIndex), selectedNucleotideIndicesTuple0.nucleotideIndex));
                    XRNA.selection.selectedElementListeners.push(new class extends SelectedElementListener {
                        updateXYHelper(x : number, y : number) {
                            nucleotide.position = {
                                x : x,
                                y : y
                            };
                            nucleotideHTML.setAttribute("transform", "translate(" + x + " " + y + ")");
                        }
                    }(nucleotide.position.x, nucleotide.position.y, false, false));
                } else {
                    let
                        transformRegex = /translate\((-?\d+(?:\.\d*)?) (-?\d+(?:\.\d*)?)\)/,
                        minimumNucleotideIndexTuple = selectedNucleotideIndices[0],
                        maximumNucleotideIndexTuple = selectedNucleotideIndices[selectedNucleotideIndices.length - 1],
                        precedingNucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(minimumNucleotideIndexTuple.rnaComplexIndex), minimumNucleotideIndexTuple.rnaMoleculeIndex), Math.max(minimumNucleotideIndexTuple.nucleotideIndex - 1, 0)),
                        succedingNucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(maximumNucleotideIndexTuple.rnaComplexIndex), maximumNucleotideIndexTuple.rnaMoleculeIndex), Math.min(maximumNucleotideIndexTuple.nucleotideIndex + 1, XRNA.rnaComplexes[maximumNucleotideIndexTuple.rnaComplexIndex].rnaMolecules[maximumNucleotideIndexTuple.rnaMoleculeIndex].nucleotides.length - 1)),
                        precedingNucleotideHTML = document.getElementById(precedingNucleotideId),
                        succedingNucleotideHTML = document.getElementById(succedingNucleotideId),
                        precedingNucleotideHTMLBoundingBox = document.getElementById(XRNA.boundingBoxHTMLId(precedingNucleotideId)),
                        succedingNucleotideHTMLBoundingBox = document.getElementById(XRNA.boundingBoxHTMLId(succedingNucleotideId)),
                        precedingCoordinatesAsStrings = transformRegex.exec(precedingNucleotideHTML.getAttribute("transform")),
                        succedingCoordinatesAsStrings = transformRegex.exec(succedingNucleotideHTML.getAttribute("transform")),
                        lineBetweenBoundingNucleotides = {
                            v0 : {
                                x : parseFloat(precedingCoordinatesAsStrings[1]) + parseFloat(precedingNucleotideHTMLBoundingBox.getAttribute("x")) + parseFloat(precedingNucleotideHTMLBoundingBox.getAttribute("width")) / 2.0,
                                y : parseFloat(precedingCoordinatesAsStrings[2]) + parseFloat(precedingNucleotideHTMLBoundingBox.getAttribute("y")) + parseFloat(precedingNucleotideHTMLBoundingBox.getAttribute("height")) / 2.0
                            },
                            v1 : {
                                x : parseFloat(succedingCoordinatesAsStrings[1]) + parseFloat(succedingNucleotideHTMLBoundingBox.getAttribute("x")) + parseFloat(succedingNucleotideHTMLBoundingBox.getAttribute("width")) / 2.0,
                                y : parseFloat(succedingCoordinatesAsStrings[2]) + parseFloat(succedingNucleotideHTMLBoundingBox.getAttribute("y")) + parseFloat(succedingNucleotideHTMLBoundingBox.getAttribute("height")) / 2.0
                            }
                        },
                        nucleotideCoordinatesAsStrings = transformRegex.exec(clickedOnNucleotideHTML.getAttribute("transform")),
                        nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(clickedOnNucleotideHTML.id)),
                        generateOrthogonalLine = (line2D : Line2D) => {
                            let
                                orthogonalDv = VectorOperations2D.scaleDown(VectorOperations2D.orthogonalize(VectorOperations2D.subtract(line2D.v1, line2D.v0)), 2.0),
                                center = VectorOperations2D.scaleDown(VectorOperations2D.add(line2D.v0, line2D.v1), 2.0);
                            return {
                                v0 : VectorOperations2D.add(center, orthogonalDv),
                                v1 : VectorOperations2D.subtract(center, orthogonalDv)
                            }
                        },
                        betweenClickedOnNucleotideAndBoundingNucleotideLine = {
                            v0 : {
                                x : parseFloat(nucleotideCoordinatesAsStrings[1]) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("x")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("width")) / 2.0,
                                y : parseFloat(nucleotideCoordinatesAsStrings[2]) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("y")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("height")) / 2.0
                            },
                            v1 : lineBetweenBoundingNucleotides.v0,
                        },
                        betweenBoundingNucleotidesLine = {
                            v0 : lineBetweenBoundingNucleotides.v0,
                            v1 : lineBetweenBoundingNucleotides.v1
                        },
                        betweenBoundingNucleotidesOrthogonalLine = generateOrthogonalLine(betweenBoundingNucleotidesLine),
                        betweenClickedOnNucleotideAndBoundingNucleotideLineHTML = document.createElementNS(svgNameSpaceURL, "line"),
                        betweenClickedOnNucleotideAndBoundingNucleotideOrthogonalLineHTML = document.createElementNS(svgNameSpaceURL, "line");
                    let
                        nucleotideBoundingBoxCoordinates = new Array<Vector2D>();
                    for (let i = 0; i < selectedNucleotideIndices.length; i++) {
                        let
                            nucleotideIndicesTuple = selectedNucleotideIndices[i],
                            nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(nucleotideIndicesTuple.rnaComplexIndex), nucleotideIndicesTuple.rnaMoleculeIndex), nucleotideIndicesTuple.nucleotideIndex)));
                        nucleotideBoundingBoxCoordinates.push({
                            x : -0.5 * parseFloat(nucleotideBoundingBoxHTML.getAttribute("width")) - parseFloat(nucleotideBoundingBoxHTML.getAttribute("x")),
                            y : -0.5 * parseFloat(nucleotideBoundingBoxHTML.getAttribute("height")) - parseFloat(nucleotideBoundingBoxHTML.getAttribute("y"))
                        });
                    }
                    let
                        linearCenterCache = VectorOperations2D.scaleUp(VectorOperations2D.add(lineBetweenBoundingNucleotides.v0, lineBetweenBoundingNucleotides.v1), 0.5);
                    XRNA.selection.selectedElementListeners.push(new class extends SelectedElementListener {
                        updateXYHelper(dX : number, dY : number) {
                            let
                                x = this.cache.x + dX,
                                y = this.cache.y + dY;
                            betweenClickedOnNucleotideAndBoundingNucleotideLine.v0 = {
                                x : x,
                                y : y
                            };
                            betweenClickedOnNucleotideAndBoundingNucleotideLineHTML.setAttribute("x1", "" + x);
                            betweenClickedOnNucleotideAndBoundingNucleotideLineHTML.setAttribute("y1", "" + y);

                            let
                                updatedOrthogonalLine = generateOrthogonalLine(betweenClickedOnNucleotideAndBoundingNucleotideLine);
                            betweenClickedOnNucleotideAndBoundingNucleotideOrthogonalLineHTML.setAttribute("x1", "" + updatedOrthogonalLine.v0.x);
                            betweenClickedOnNucleotideAndBoundingNucleotideOrthogonalLineHTML.setAttribute("y1", "" + updatedOrthogonalLine.v0.y);
                            betweenClickedOnNucleotideAndBoundingNucleotideOrthogonalLineHTML.setAttribute("x2", "" + updatedOrthogonalLine.v1.x);
                            betweenClickedOnNucleotideAndBoundingNucleotideOrthogonalLineHTML.setAttribute("y2", "" + updatedOrthogonalLine.v1.y);

                            let
                                updateNucleotidePositionsFromCenterHelper = (center : Vector2D) => {
                                    let
                                        axisDv = VectorOperations2D.subtract(lineBetweenBoundingNucleotides.v0, center),
                                        dTheta = (2.0 * Math.PI - VectorOperations2D.unsignedAngleBetweenVectors(VectorOperations2D.subtract(lineBetweenBoundingNucleotides.v0, center), VectorOperations2D.subtract(lineBetweenBoundingNucleotides.v1, center))) / (selectedNucleotideIndices.length + 1),
                                        radius = VectorOperations2D.distance(lineBetweenBoundingNucleotides.v0, center),
                                        dThetaSign : number;
                                    if (VectorOperations2D.crossProduct2D(VectorOperations2D.subtract(center, lineBetweenBoundingNucleotides.v0), VectorOperations2D.subtract(center, lineBetweenBoundingNucleotides.v1)) > 0) {
                                        dThetaSign = -1;
                                    } else {
                                        dThetaSign = 1;
                                    }
                                    let
                                        angleOfNoRotation = Math.atan2(axisDv.y, axisDv.x);
                                    for (let i = 0; i < selectedNucleotideIndices.length; i++) {
                                        let
                                            angleI = angleOfNoRotation + (i + 1) * dThetaSign * dTheta,
                                            nucleotideIndicesTuple = selectedNucleotideIndices[i],
                                            nucleotideHTML = document.getElementById(XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(nucleotideIndicesTuple.rnaComplexIndex), nucleotideIndicesTuple.rnaMoleculeIndex), nucleotideIndicesTuple.nucleotideIndex)),
                                            x = center.x + radius * Math.cos(angleI),
                                            y = center.y + radius * Math.sin(angleI),
                                            boundingBoxOffset = nucleotideBoundingBoxCoordinates[i];
                                        nucleotideHTML.setAttribute("transform", "translate(" + (x + boundingBoxOffset.x) + " " + (y + boundingBoxOffset.y) + ")");
                                        XRNA.rnaComplexes[nucleotideIndicesTuple.rnaComplexIndex].rnaMolecules[nucleotideIndicesTuple.rnaMoleculeIndex].nucleotides[nucleotideIndicesTuple.nucleotideIndex].position = {
                                            x : x,
                                            y : y
                                        }
                                    }
                                },
                                intersection = VectorOperations2D.lineIntersection(updatedOrthogonalLine, betweenBoundingNucleotidesOrthogonalLine);
                            if ("x" in intersection && "y" in intersection) {
                                updateNucleotidePositionsFromCenterHelper(<Vector2D>intersection);
                            } else {
                                updateNucleotidePositionsFromCenterHelper(VectorOperations2D.add(linearCenterCache, {
                                    x : dX,
                                    y : dY
                                }));
                            }
                        }
                    }(betweenClickedOnNucleotideAndBoundingNucleotideLine.v0.x, betweenClickedOnNucleotideAndBoundingNucleotideLine.v0.y, false, true));
                }
            }
        },
        "RNA Single Base Pair" : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    basePairIndex = nucleotides[nucleotideIndex].basePairIndex;
                // Special case: base-paired immediately adjacent nucleotides.
                return basePairIndex >= 0 && (Math.abs(nucleotideIndex - basePairIndex) == 1 || ((nucleotideIndex == 0 || nucleotides[nucleotideIndex - 1].basePairIndex != basePairIndex + 1) && (nucleotideIndex == nucleotides.length - 1 || nucleotides[nucleotideIndex + 1].basePairIndex != basePairIndex - 1)));
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                let
                    selectedNucleotideIndices = new Array<NucleotideIndicesTuple>(),
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    basePairedIndex = nucleotides[nucleotideIndex].basePairIndex;
                selectedNucleotideIndices.push({
                    rnaComplexIndex : rnaComplexIndex, 
                    rnaMoleculeIndex : rnaMoleculeIndex, 
                    nucleotideIndex : nucleotideIndex
                },
                {
                    rnaComplexIndex : rnaComplexIndex,
                    rnaMoleculeIndex : rnaMoleculeIndex,
                    nucleotideIndex : basePairedIndex
                });
                let
                    selectedNucleotideInBetweenIndices = new Array<NucleotideIndicesTuple>(),
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
            getErrorMessageForSelection() : string {
                return SelectionConstraint.createErrorMessageForSelection("a nucleotide with a base pair and no contiguous base pairs", "a base-paired nucleotide outside a series of base pairs");
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error("Not implemented.");
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Helix' : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                let
                    helixIndices = new Array<NucleotideIndicesTuple>(),
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
                                intermediateIndices = new Array<NucleotideIndicesTuple>(),
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
                                intermediateIndices = new Array<NucleotideIndicesTuple>(),
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
            getErrorMessageForSelection() : string {
                return SelectionConstraint.createErrorMessageForSelection('a nucleotide with a base pair', 'a base-paired nucleotide');
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Stacked Helix' : new class extends SelectionConstraint{
            adjacentNucleotideIndices : Array<NucleotideIndicesTuple>;
            adjacentNucleotideIndex0 : number;
            adjacentNucleotideIndex1 : number;

            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                this.adjacentNucleotideIndices = new Array<NucleotideIndicesTuple>();
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
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                this.getSelectedNucleotideIndicesHelper(rnaComplexIndex, rnaMoleculeIndex, () => this.adjacentNucleotideIndex0--, () => this.adjacentNucleotideIndex1++, nucleotides => this.adjacentNucleotideIndex0 < 0 || this.adjacentNucleotideIndex1 >= nucleotides.length);
                return this.adjacentNucleotideIndices;
            }
            getSelectedNucleotideIndicesHelper(rnaComplexIndex : number, rnaMoleculeIndex : number, adjacentNucleotideIndex0Incrementer : () => void, adjacentNucleotideIndex1Incrementer : () => void, adjacentNucleotideIndicesAreOutsideBoundsChecker : (nucleotides : Nucleotide[]) => boolean) : void {
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    intermediateIndices = new Array<NucleotideIndicesTuple>();
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
                            intermediateIndices = new Array<NucleotideIndicesTuple>();
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
            getErrorMessageForSelection() : string {
                return SelectionConstraint.createErrorMessageForSelection('a base-paired nucleotide within a stacked helix', 'a base-paired nucleotide with proximate nucleotides on either side exclusively bonded to the other');
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Sub-domain' : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex].basePairIndex >= 0;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                let
                    adjacentNucleotideIndices = new Array<NucleotideIndicesTuple>(),
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
            getErrorMessageForSelection() : string {
                return SelectionConstraint.createErrorMessageForSelection('a nucleotide with a base pair', 'a base-paired nucleotide');
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Cycle' : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                let
                    cycleIndices = new Array<NucleotideIndicesTuple>(),
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
            getErrorMessageForSelection() : string {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA List Nucs' : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return false;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessageForSelection() : string {
                return "This selection constraint is not used for left-click nucleotide selection.";
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Strand' : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : 
            Array<NucleotideIndicesTuple> {
                let
                    adjacentNucleotideIndices = new Array<NucleotideIndicesTuple>(),
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaComplexIndex].nucleotides;
                for (let adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
                }
                return adjacentNucleotideIndices;
            }
            getErrorMessageForSelection() : string {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Color Unit' : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                let
                    nucleotides = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides,
                    color = nucleotides[nucleotideIndex].symbol,
                    adjacentNucleotideIndices = new Array<NucleotideIndicesTuple>();
                for (let adjacentNucleotideIndex = 0; adjacentNucleotideIndex < nucleotides.length; adjacentNucleotideIndex++) {
                    let
                        adjacentNucleotideColor = nucleotides[adjacentNucleotideIndex].symbol;
                    if (adjacentNucleotideColor.red == color.red && adjacentNucleotideColor.green == color.green && adjacentNucleotideColor.blue == color.blue) {
                        adjacentNucleotideIndices.push({rnaComplexIndex : rnaComplexIndex, rnaMoleculeIndex : rnaMoleculeIndex, nucleotideIndex : adjacentNucleotideIndex});
                    }
                }
                return adjacentNucleotideIndices;
            }
            getErrorMessageForSelection() : string {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Named Group' : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                // For now, named-group support is not implemented.
                return false;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessageForSelection() : string {
                return SelectionConstraint.createErrorMessageForSelection('a nucleotide within a named group', 'a nucleotide within a named group');
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'RNA Strand Group' : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                let
                    strandNucleotideIndices = new Array<NucleotideIndicesTuple>(),
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
            getErrorMessageForSelection() : string {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'Labels Only' : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                // Select no nucleotides, but do not produce an error.
                // This replicates XRNA-GT behavior.
                return [];   
            }
            getErrorMessageForSelection() : string {
                throw new Error("This code should be unreachable.");
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
        'Entire Scene' : new class extends SelectionConstraint{
            approveSelectedNucleotideForSelection(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return true;
            }
            approveSelectedNucleotideForContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : boolean {
                return this.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex);
            }
            getSelectedNucleotideIndices(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : Array<NucleotideIndicesTuple> {
                // Select no indices.
                return [];
            }
            getErrorMessageForSelection() : string {
                throw new Error("This code should be unreachable.")
            }
            getErrorMessageForContextMenu() : string {
                return this.getErrorMessageForSelection();
            }
            populateEditContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
            populateFormatContextMenu(rnaComplexIndex : number, rnaMoleculeIndex : number, nucleotideIndex : number) : void {
                throw new Error('Not implemented.');
            }
        },
    };

    public static main(inputFile : BlobWithExtension = null, outputFileUrls : Array<string> = [], printVersionFlag = false) {
        XRNA.canvasHTML = document.getElementById("canvas");
        XRNA.canvasHTML.onwheel = event => {
            // Intuitive scrolling of the middle-mouse wheel requires negation of deltaY.
            XRNA.setZoom(XRNA.sceneTransformData.zoom - Math.sign(event.deltaY));
            XRNA.zoomSliderHTML.value = "" + XRNA.sceneTransformData.zoom;
            return false;
        };

        let
            canvasBackgroundHTML = document.createElementNS(svgNameSpaceURL, "rect");
        XRNA.canvasHTML.appendChild(canvasBackgroundHTML);
        canvasBackgroundHTML.setAttribute("style", "width:100%;height:100%;");
        canvasBackgroundHTML.setAttribute("visibility", "hidden");
        canvasBackgroundHTML.setAttribute("pointer-events", "all");
        canvasBackgroundHTML.onmousedown = (mouseEvent : MouseEvent) => {
            XRNA.resetSelection();
            XRNA.contextMenuHTML.style.display = "none";
            return false;
        }
        XRNA.canvasHTML.onmousedown = (mouseEvent : MouseEvent) => {
            let
                newButtonIndex = Utils.getButtonIndex(mouseEvent),
                pressedButtonIndex = newButtonIndex - XRNA.buttonIndex,
                mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x,
                mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y;
            XRNA.buttonIndex = newButtonIndex;
            if (pressedButtonIndex & ButtonIndex.LEFT) {
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x : mouseInCanvasX,
                    y : mouseInCanvasY
                }
            }
            return false;
        };
        XRNA.canvasHTML.onmousemove = (mouseEvent : MouseEvent) => {
            if (XRNA.buttonIndex & ButtonIndex.LEFT) {
                let
                    mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x,
                    mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y;
                if (XRNA.selection.selectedElementListeners.length > 0) {
                    let
                        scalar = 1.0 / (XRNA.sceneDataToCanvasBoundsScalar * XRNA.sceneTransformData.scale),
                        dx = (mouseInCanvasX - XRNA.draggingCoordinates.startDragCoordinates.x) * scalar,
                        dy = -(mouseInCanvasY - XRNA.draggingCoordinates.startDragCoordinates.y) * scalar;
                    XRNA.selection.selectedElementListeners.forEach(selectedElementListenerI => {
                        let
                            dyI = selectedElementListenerI.invertYFlag ? -dy : dy,
                            x : number,
                            y : number;
                        if (selectedElementListenerI.xyAreDisplacementsFlag) {
                            x = dx;
                            y = dyI;
                        } else {
                            x = selectedElementListenerI.cache.x + dx;
                            y = selectedElementListenerI.cache.y + dyI;
                        }
                        selectedElementListenerI.updateXYHelper(x, y);
                    });
                } else {
                    XRNA.sceneTransformData.origin = {
                        x : XRNA.draggingCoordinates.cacheDragCoordinates.x + mouseInCanvasX - XRNA.draggingCoordinates.startDragCoordinates.x,
                        y : XRNA.draggingCoordinates.cacheDragCoordinates.y + mouseInCanvasY - XRNA.draggingCoordinates.startDragCoordinates.y
                    };
                    XRNA.updateSceneTransform();
                }
            }
            return false;
        };
        XRNA.canvasHTML.onmouseup = (mouseEvent : MouseEvent) => {
            let
                newButtonIndex = Utils.getButtonIndex(mouseEvent),
                releasedMouseIndex = XRNA.buttonIndex - newButtonIndex;
            XRNA.buttonIndex = newButtonIndex;
            if (releasedMouseIndex & ButtonIndex.LEFT) {
                if (XRNA.selection.selectedElementListeners.length == 0) {
                    XRNA.draggingCoordinates.cacheDragCoordinates.x = XRNA.sceneTransformData.origin.x;
                    XRNA.draggingCoordinates.cacheDragCoordinates.y = XRNA.sceneTransformData.origin.y;
                }
            }
            return false;
        };
        XRNA.canvasHTML.onmouseleave = (mouseEvent : MouseEvent) => {
            XRNA.resetSelection();
            XRNA.buttonIndex = ButtonIndex.NONE;
            XRNA.draggingCoordinates.cacheDragCoordinates.x = XRNA.sceneTransformData.origin.x;
            XRNA.draggingCoordinates.cacheDragCoordinates.y = XRNA.sceneTransformData.origin.y;
            return false;
        };
        // Disable the context menu.
        XRNA.canvasHTML.oncontextmenu = (mouseEvent : MouseEvent) => {
            return false;
        };

        XRNA.downloaderHTML = document.createElement("a");
        XRNA.canvasHTML.appendChild(XRNA.downloaderHTML);
        XRNA.downloaderHTML.setAttribute("style", "display:none;");

        XRNA.sceneHTML = document.createElementNS(svgNameSpaceURL, "g");
        XRNA.canvasHTML.appendChild(XRNA.sceneHTML);

        XRNA.sketchesHTML = document.createElementNS(svgNameSpaceURL, "g");
        XRNA.sceneHTML.appendChild(XRNA.sketchesHTML);

        XRNA.canvasBounds = XRNA.canvasHTML.getBoundingClientRect();
        XRNA.sceneDataBounds = new DOMRect(0, 0, 1, 1);
        XRNA.sceneDataToCanvasBoundsScalar = Math.min(XRNA.canvasBounds.width, XRNA.canvasBounds.height);
        XRNA.sceneTransformStart = "";
        XRNA.sceneTransformMiddle = "";
        XRNA.sceneTransformEnd = "";
        window.onresize = () => {
            XRNA.canvasBounds = XRNA.canvasHTML.getBoundingClientRect();
            XRNA.fitSceneDataToCanvasBounds();
        }

        XRNA.zoomSliderHTML = <HTMLInputElement>document.getElementById("zoomSlider");
        XRNA.zoomSliderHTML.setAttribute("min", "" + XRNA.sceneTransformData.minimumZoom);
        XRNA.zoomSliderHTML.setAttribute("max", "" + XRNA.sceneTransformData.maximumZoom);

        XRNA.contextMenuHTML = <HTMLDivElement>document.getElementById("contextMenu");

        XRNA.rnaComplexSelectorHTML = <HTMLSelectElement>document.getElementById("rnaComplexSelector");

        XRNA.outputFileSpecificationsDivHTML = <HTMLDivElement>document.getElementById("outputFileSpecificationsDiv");

        XRNA.selection = {
            highlighted : new Array<HTMLElement | SVGPathElement>(),
            selectedElementListeners : new Array<SelectedElementListener>()
        };
        XRNA.reset();

        document.getElementById("inputFileHandler").setAttribute("accept", (Object.keys(XRNA.inputFileHandlerMap) as Array<string>).map(extension => "." + extension).join(", "));

        let
            outputFileExtensionSelectorHTML = <HTMLSelectElement>document.getElementById("outputFileExtensionSelector");
        for (let outputFileExtension of Object.keys(XRNA.outputFileHandlerMap)) {
            outputFileExtensionSelectorHTML.appendChild(new Option("." + outputFileExtension, outputFileExtension));
        }
        outputFileExtensionSelectorHTML.selectedIndex = -1;

        XRNA.selectionConstraintHTML = <HTMLSelectElement>document.getElementById("selectionConstraint");
        for (let selectionConstraintName of Object.keys(XRNA.namedSelectionConstraintsMap)) {
            XRNA.selectionConstraintHTML.appendChild(new Option(selectionConstraintName, selectionConstraintName));
        }

        XRNA.buttonIndex = ButtonIndex.NONE;

        if (printVersionFlag) {
            console.log("XRNA-GT-TypeScript 2.0");
        }
        if (inputFile) {
            XRNA.handleInputFile(inputFile);
        }
        outputFileUrls.forEach(outputFileUrl => {
            XRNA.handleOutputUrl(outputFileUrl);
        });
    }

    public static handleInputFile(inputFile : BlobWithExtension) : void {
        XRNA.reset();
        Utils.getFileContent(inputFile.blob, (fileContent : string) => {
            XRNA.inputFileHandlerMap[inputFile.extension](fileContent);
            XRNA.populateScene();
            for (let i = 0; i < XRNA.rnaComplexes.length; i++) {
                XRNA.rnaComplexSelectorHTML.appendChild(new Option(XRNA.rnaComplexes[i].name, "" + i));
            }
            XRNA.rnaComplexSelectorHTML.selectedIndex = -1;
        });
    }

    public static handleOutputUrl(outputFileUrl : string) : void {
        XRNA.downloaderHTML.setAttribute("href", window.URL.createObjectURL(new Blob([XRNA.outputFileHandlerMap[Utils.getFileExtension(outputFileUrl)].writeOutputFile()], {
            type : "text/plain"
        })));
        XRNA.downloaderHTML.download = outputFileUrl;
        XRNA.downloaderHTML.click();
        window.URL.revokeObjectURL(outputFileUrl);
    }

    private static parseInputXMLFile(inputFileContent : string) : void {
        if (!/^\s*<!DOCTYPE/.test(inputFileContent)) {
            inputFileContent = "<!DOCTYPE ComplexDocument [\
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
            ]>\n" + inputFileContent;
        }
        let
            currentComplex : RNAComplex = null,
            currentRNAMolecule : RNAMolecule = null,
            referencedIds = new Array<{
                fromIndex : number,
                toIndex : number
            }>(),
            xmlParser = (xmlElement : Document | Element) => {
                for (let childElementIndex = 0; childElementIndex < xmlElement.children.length; childElementIndex++) {
                    let
                        xmlSubElement = xmlElement.children[childElementIndex];
                    switch (xmlSubElement.tagName) {
                        case "ComplexDocument": {
                            XRNA.complexDocumentName = xmlSubElement.getAttribute("Name") ?? "Unknown";
                            break;
                        }
                        case "Complex": {
                            let
                                complex : RNAComplex = {
                                    rnaMolecules : new Array<RNAMolecule>(),
                                    name : xmlSubElement.getAttribute("Name") ?? "Unknown"
                                };
                            currentComplex = complex;
                            XRNA.rnaComplexes.push(complex);
                            break;
                        }
                        case "RNAMolecule": {
                            let
                                rnaMolecule : RNAMolecule = {
                                    nucleotides : new Array<Nucleotide>(),
                                    firstNucleotideIndex : -1,
                                    name : xmlSubElement.getAttribute("Name") ?? "Unknown"
                                };
                                currentComplex.rnaMolecules.push(rnaMolecule);
                                currentRNAMolecule = rnaMolecule;
                            break;
                        }
                        case "NucListData": {
                            let
                                innerHTMLLines = xmlSubElement.innerHTML.replace(/^\s*\n\s*/, "").replace(/\s*\n\s*$/, "").split("\n"),
                                template = xmlSubElement.getAttribute("DataType"),
                                startingNucleotideIndexString = xmlSubElement.getAttribute("StartNucID");
                            if (!startingNucleotideIndexString) {
                                // We cannot continue without a starting nucleotide index.
                                // Continuing to attempt to parse the current RNAMolecule will introduce errors.
                                throw new Error("Missing \"StartNucID\" attribute prevents RNAMolecule parsing.")
                            }
                            currentRNAMolecule.nucleotides = new Array<Nucleotide>(innerHTMLLines.length);
                            let
                                nucleotideIndex = 0;
                            currentRNAMolecule.firstNucleotideIndex = parseInt(startingNucleotideIndexString);
                            innerHTMLLines.forEach(innerHTMLLine => {
                                innerHTMLLine = innerHTMLLine.trim();
                                if (innerHTMLLine.length != 0) {
                                    let
                                        split = innerHTMLLine.split(/ /g),
                                        x = 0.0,
                                        y = 0.0,
                                        symbol : string,
                                        basePairIndex = -1;
                                    switch (template) {
                                        case "NucChar.XPos.YPos":
                                            y = parseFloat(split[2]);
                                            x = parseFloat(split[1]);
                                        case "NucChar":
                                            symbol = split[0];
                                            break;
                                        case "NucID.NucChar.XPos.YPos.FormatType.BPID":
                                            // FormatType is ignored by XRNA-GT source code.
                                            basePairIndex = parseInt(split[5]);
                                        case "NucID.NucChar.XPos.YPos":
                                            y = parseFloat(split[3]);
                                            x = parseFloat(split[2]);
                                        case "NucID.NucChar":
                                            symbol = split[1];
                                            nucleotideIndex = parseInt(split[0]) - currentRNAMolecule.firstNucleotideIndex;
                                            break;
                                        default:
                                            throw new Error("Unrecognized Nuc2D format");
                                    }
                                    currentRNAMolecule.nucleotides[nucleotideIndex] = {
                                        position : {
                                            x : x,
                                            y : y
                                        },
                                        symbol : {
                                            string : symbol,
                                            ...XRNA.fontIdToFont(0),
                                            red : 0,
                                            green : 0,
                                            blue : 0
                                        },
                                        basePairIndex : basePairIndex,
                                        labelLine : null,
                                        labelContent : null
                                    };
                                    nucleotideIndex++;
                                }
                            });
                            if (/NucID/.test(template)) {
                                for (let nucleotideIndex = 0; nucleotideIndex < currentRNAMolecule.nucleotides.length; nucleotideIndex++) {
                                    if (!currentRNAMolecule.nucleotides[nucleotideIndex]) {
                                        throw new Error("XRNA does not currently support input nucleotides with non-contiguous nucleotide ids.");
                                    }
                                }
                            }
                            break;
                        }
                        case "LabelList": {
                            let
                                innerHTMLLines = xmlSubElement.innerHTML.replace(/^\n/, "").replace(/\n$/, "").split("\n"),
                                labelContent : GraphicalString = null,
                                labelLine : GraphicalLine = null;
                            innerHTMLLines.forEach(innerHTMLLine => {
                                let
                                    split = innerHTMLLine.split(/\s+/);
                                switch (split[0].toLowerCase()) {
                                    case "l": {
                                        labelLine = Object.assign({
                                            v0 : {
                                                x : parseFloat(split[1]),
                                                y : parseFloat(split[2])
                                            },
                                            v1 : {
                                                x : parseFloat(split[3]),
                                                y : parseFloat(split[4])
                                            },
                                            strokeWidth : parseFloat(split[5])
                                        }, Utils.expandRGB(parseInt(split[6])));
                                        break;
                                    }
                                    case "s": {
                                        // From XRNA source code (ComplexXMLParser.java):
                                        // l x y ang size fontID color content
                                        // ang is ignored by XRNA source code.
                                        let
                                            font = XRNA.fontIdToFont(parseInt(split[5]));
                                        font.size = parseFloat(split[4]);
                                        labelContent = {
                                            string : split[7].replace(/\"/g, ""),
                                            x : parseFloat(split[1]),
                                            y : parseFloat(split[2]),
                                            ...font,
                                            ...Utils.parseRGB(split[6])
                                        }
                                        break;
                                    }
                                }
                            });
                            referencedIds.forEach(referencedIdPair => {
                                for (let index = referencedIdPair.fromIndex; index <= referencedIdPair.toIndex; index++) {
                                    let
                                        nucleotide = currentRNAMolecule.nucleotides[index];
                                    // Clone the label content and label line.
                                    nucleotide.labelContent = Object.assign({}, labelContent);
                                    nucleotide.labelLine = Object.assign({}, labelLine);
                                }
                            });
                            break;
                        }
                        case "Nuc": {
                            referencedIds = new Array<{
                                fromIndex : number,
                                toIndex : number
                            }>();
                            let
                                refIdsString = xmlSubElement.getAttribute("RefID") ?? xmlSubElement.getAttribute("RefIDs");
                            if (!refIdsString) {
                                throw new Error("Within the input file, a <Nuc> element is missing its RefID and RefIDs attributes.");
                            }
                            refIdsString = refIdsString.replace(/\s+/g, "");
                            // comma-separated list of (potentially coupled, potentially negative) integers.
                            if (!refIdsString.match(/^(?:(?:-?\d+-)?-?\d+)(?:,(?:-?\d+-)?-?\d+)*$/)) {
                                throw new Error("Within the input file, a <Nuc> element's refID(s) attribute is improperly formatted. It should be a comma-separated list of integers, or ordered integer pairs separated by \"-\".");
                            }
                            refIdsString.split(",").forEach(splitI => {
                                let
                                    matchedGroups = splitI.match(/^(-?\d+)-(-?\d+)$/),
                                    fromIndex : number,
                                    toIndex : number;
                                if (matchedGroups) {
                                    fromIndex = parseInt(matchedGroups[1]) - currentRNAMolecule.firstNucleotideIndex;
                                    toIndex = parseInt(matchedGroups[2]) - currentRNAMolecule.firstNucleotideIndex
                                } else {
                                    let
                                        refID = parseInt(splitI) - currentRNAMolecule.firstNucleotideIndex;
                                    fromIndex = refID;
                                    toIndex = refID;
                                }
                                referencedIds.push({
                                    fromIndex : fromIndex,
                                    toIndex : toIndex
                                });
                            });
                            let
                                helperFunctions = new Array<(nucleotide : Nucleotide) => void>(),
                                colorAsString = xmlSubElement.getAttribute("Color");
                            if (colorAsString) {
                                let
                                    color = Utils.parseRGB(colorAsString);
                                // Override the nucleotide's color.
                                helperFunctions.push(nucleotide => Object.assign(nucleotide.symbol, color));
                            }
                            let
                                fontIdAsString = xmlSubElement.getAttribute("FontID");
                            if (fontIdAsString) {
                                let
                                    fontID = parseInt(fontIdAsString);
                                if (isNaN(fontID)) {
                                    throw new Error("Invalid fontID: " + fontIdAsString + " is not an integer.");
                                }
                                let
                                    font = XRNA.fontIdToFont(fontID);
                                // Override the nucleotide's font.
                                helperFunctions.push(nucleotide => Object.assign(nucleotide.symbol, font));
                            }
                            let
                                fontSizeAsString = xmlSubElement.getAttribute("FontSize");
                            if (fontSizeAsString) {
                                let
                                    fontSize = parseFloat(fontSizeAsString);
                                helperFunctions.push(nucleotide => nucleotide.symbol.size = fontSize);
                            }
                            referencedIds.forEach(referencedIdPair => {
                                for (let index = referencedIdPair.fromIndex; index <= referencedIdPair.toIndex; index++) {
                                    let
                                        nucleotide = currentRNAMolecule.nucleotides[index];
                                    helperFunctions.forEach(helperFunction => helperFunction(nucleotide));
                                }
                            });
                            break;
                        }
                        case "BasePairs": {
                            let
                                indexString = xmlSubElement.getAttribute("nucID"),
                                lengthString = xmlSubElement.getAttribute("length"),
                                basePairedIndexString = xmlSubElement.getAttribute("bpNucID");
                            if (!indexString) {
                                // We cannot continue without an index.
                                throw new Error("Within the input file a <BasePairs> element is missing its nucID attribute.");
                            }
                            let
                                index = parseInt(indexString);
                            if (isNaN(index)) {
                                // We cannot continue without an index.
                                throw new Error("Within the input file a <BasePairs> element is defined incorrectly; nucID = \"" + indexString + "\" is not an integer.");
                            }
                            let
                                length : number;
                            if (!lengthString) {
                                length = 1;
                            } else {
                                length = parseInt(lengthString);
                                if (isNaN(length)) {
                                    // We cannot continue without a length.
                                    throw new Error("Within the input file a <BasePairs> element is defined incorrectly; length = \"" + lengthString + "\" is not an integer.");
                                }
                            }
                            if (!basePairedIndexString) {
                                // We cannot continue without a base-paired index.
                                throw new Error("Within the input file a <BasePairs> element is missing its bpNucID attribute.");
                            }
                            let
                                basePairedIndex = parseInt(basePairedIndexString);
                            if (isNaN(basePairedIndex)) {
                                // We cannot continue without a base-paired index.
                                throw new Error("Within the input file a <BasePairs> element is defined incorrectly; bpNucID = \"" + basePairedIndexString + "\" is not an integer.");
                            }
                            index -= currentRNAMolecule.firstNucleotideIndex;
                            basePairedIndex -= currentRNAMolecule.firstNucleotideIndex;
                            // Pair nucleotides.
                            for (let innerIndex = 0; innerIndex < length; innerIndex++) {
                                let 
                                    nucleotideIndex0 = index + innerIndex,
                                    nucleotideIndex1 = basePairedIndex - innerIndex,
                                    nucleotides = currentRNAMolecule.nucleotides;
                                if (nucleotideIndex0 < 0) {
                                    console.error("Out of bounds error in (<BasePairs nucID='" + (index + currentRNAMolecule.firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + currentRNAMolecule.firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex0 + " < 0");
                                    continue;
                                }
                                if (nucleotideIndex0 >= nucleotides.length) {
                                    console.error("Out of bounds error in (<BasePairs nucID='" + (index + currentRNAMolecule.firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + currentRNAMolecule.firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex0 + " >= " + currentRNAMolecule.nucleotides.length);
                                    continue;
                                }
                                if (nucleotideIndex1 < 0) {
                                    console.error("Out of bounds error in (<BasePairs nucID='" + (index + currentRNAMolecule.firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + currentRNAMolecule.firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex1 + " < 0");
                                    continue;
                                }
                                if (nucleotideIndex1 >= nucleotides.length) {
                                    console.error("Out of bounds error in (<BasePairs nucID='" + (index + currentRNAMolecule.firstNucleotideIndex) + "' bpNucID='" + (basePairedIndex + currentRNAMolecule.firstNucleotideIndex) + "' length='" + length + "'>): " + nucleotideIndex1 + " >= " + currentRNAMolecule.nucleotides.length);
                                    continue;
                                }
                                nucleotides[nucleotideIndex0].basePairIndex = nucleotideIndex1;
                                nucleotides[nucleotideIndex1].basePairIndex = nucleotideIndex0;
                            }
                            break;
                        }
                        case "WithComplex": {
                            break;
                        }
                        case "NucSymbol": {
                            break;
                        }
                        case "NucChars": {
                            break;
                        }
                        case "NucSegment": {
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
                        case "BasePair": {
                            break;
                        }
                        case "SceneNodeGeom": {
                            break;
                        }
                    }
                    xmlParser(xmlSubElement);
                }
            };
        xmlParser(new DOMParser().parseFromString(inputFileContent, "text/xml"));
    }

    private static parseInputSTRFile(inputFileContent : string) : void {
        throw new Error("This method is not implemented yet!");
    }

    private static parseInputSVGFile(inputFileContent : string) : void {
        throw new Error("This method is not implemented yet!");
    }

    private static parseInputJSONFile(inputFileContent : string) : void {
        let
            jsonData = JSON.parse(inputFileContent),
            allRNAComplexesFlag = true,
            allRNAMoleculesFlag = true,
            keys = Object.keys(jsonData),
            rnaMoleculeRegex = /^RNA Molecule (.*)/,
            names = new Array<string>(keys.length);
        for (let i = 0; i < keys.length; i++) {
            let
                key = keys[i],
                rnaComplexMatch = key.match(/^RNA Complex (.*)/),
                rnaMoleculeMatch = key.match(rnaMoleculeRegex);
            if (!rnaComplexMatch) {
                allRNAComplexesFlag = false;
            } else {
                names[i] = rnaComplexMatch[1];
            }
            if (!rnaMoleculeMatch) {
                allRNAMoleculesFlag = false;
            } else {
                names[i] = rnaMoleculeMatch[i];
            }
        }
        let
            readRNAMoleculeJSONHelper = (name : string, rnaMoleculeJSON : any) => {
                let
                    nucleotides : Array<Nucleotide>,
                    firstNucleotideIndex : number;
                if ("Sequence" in rnaMoleculeJSON) {
                    let
                        sequenceJSON = rnaMoleculeJSON.Sequence;
                    firstNucleotideIndex = Number.MAX_VALUE;
                    nucleotides = new Array<Nucleotide>(sequenceJSON.length);
                    for (let sequenceI of sequenceJSON) {
                        if (sequenceI.ResID < firstNucleotideIndex) {
                            firstNucleotideIndex = sequenceI.ResID;
                        }
                    }
                    for (let sequenceI of sequenceJSON) {
                        if (!("ResID" in sequenceI) || !("ResName" in sequenceI) || !("X" in sequenceI) || !("Y" in sequenceI)) {
                            throw new Error("Unrecognized input JSON Format.");
                        }
                        let
                            nucleotideIndex = sequenceI.ResID - firstNucleotideIndex;
                        if (nucleotideIndex >= nucleotides.length || nucleotides[nucleotideIndex]) {
                            throw new Error("An incomplete (non-contiguous) list of nucleotide indices was provided within the input JSON file.");
                        }
                        let
                            font = "Font" in sequenceI ? {
                                size : sequenceI.Font.Size,
                                family : sequenceI.Font.Family,
                                style : sequenceI.Font.Style,
                                weight : sequenceI.Font.Weight
                            } : XRNA.fontIdToFont(0),
                            color = "Color" in sequenceI ? {
                                red : sequenceI.Color.Red,
                                green : sequenceI.Color.Green,
                                blue : sequenceI.Color.Blue
                            } : {
                                red : 0,
                                green : 0,
                                blue : 0
                            };
                        nucleotides[nucleotideIndex] = {
                            position : {
                                x : sequenceI.X,
                                y : sequenceI.Y
                            },
                            symbol : Object.assign({
                                string : sequenceI.ResName
                            }, font, color),
                            basePairIndex : -1,
                            labelLine : null,
                            labelContent : null
                        };
                    }
                } else {
                    throw new Error("Unrecognized JSON format.");
                }
                if ("BasePairs" in rnaMoleculeJSON) {
                    for (let basePairJSON of rnaMoleculeJSON.BasePairs) {
                        let
                            nucleotideIndex = basePairJSON.ResID1 - firstNucleotideIndex,
                            basePairIndex = basePairJSON.ResID2 - firstNucleotideIndex;
                        if (nucleotideIndex < 0 || nucleotideIndex >= nucleotides.length) {
                            throw new Error("The input JSON number ResID1 = " + basePairJSON.ResID1 + " is outside the range of sequence indices [" + firstNucleotideIndex + ", " + (nucleotides.length + firstNucleotideIndex) + ").");
                        }
                        if (basePairIndex < 0 || basePairIndex >= nucleotides.length) {
                            throw new Error("The input JSON number ResID2 = " + basePairJSON.ResID2 + " is outside the range of sequence indices [" + firstNucleotideIndex + ", " + (nucleotides.length + firstNucleotideIndex) + ").");
                        }
                        nucleotides[nucleotideIndex].basePairIndex = basePairIndex;
                        nucleotides[basePairIndex].basePairIndex = nucleotideIndex;
                    }
                }
                if ("LabelsAndAnnotations" in rnaMoleculeJSON) {
                    for (let labelsAndAnnotationsJSON of rnaMoleculeJSON.LabelsAndAnnotations) {
                        if (!("ResID" in labelsAndAnnotationsJSON)) {
                            throw new Error("Unrecognized JSON format.");
                        }
                        let
                            nucleotideIndex = labelsAndAnnotationsJSON.ResID - firstNucleotideIndex;
                        if (nucleotideIndex < 0 || nucleotideIndex >= nucleotides.length) {
                            throw new Error("The input JSON number ResID = " + labelsAndAnnotationsJSON.ResID + " is outside the range of sequence indices [" + firstNucleotideIndex + ", " + (nucleotides.length + firstNucleotideIndex) + ").");
                        }
                        let
                            nucleotide = nucleotides[nucleotideIndex];
                        if ("LabelLine" in labelsAndAnnotationsJSON) {
                            let
                                color = "Color" in labelsAndAnnotationsJSON.LabelLine ? {
                                    red : labelsAndAnnotationsJSON.LabelLine.Color.Red,
                                    green : labelsAndAnnotationsJSON.LabelLine.Color.Green,
                                    blue : labelsAndAnnotationsJSON.LabelLine.Color.Blue
                                } : {
                                    red : 0,
                                    green : 0,
                                    blue : 0
                                },
                                strokeWidth = "StrokeWidth" in labelsAndAnnotationsJSON ? <number>labelsAndAnnotationsJSON.StrokeWidth :  DEFAULT_STROKE_WIDTH;
                            nucleotide.labelLine = Object.assign({
                                v0 : {
                                    x : <number>labelsAndAnnotationsJSON.LabelLine.X1,
                                    y : <number>labelsAndAnnotationsJSON.LabelLine.Y1
                                },
                                v1 : {
                                    x : <number>labelsAndAnnotationsJSON.LabelLine.X2,
                                    y : <number>labelsAndAnnotationsJSON.LabelLine.Y2
                                },
                                strokeWidth : strokeWidth
                            }, color);
                        }
                        if ("LabelContent" in labelsAndAnnotationsJSON) {
                            let
                                color = "Color" in labelsAndAnnotationsJSON.LabelContent ? {
                                    red : <number>labelsAndAnnotationsJSON.LabelContent.Color.Red,
                                    green : <number>labelsAndAnnotationsJSON.LabelContent.Color.Green,
                                    blue : <number>labelsAndAnnotationsJSON.LabelContent.Color.Blue
                                } : {
                                    red : 0,
                                    green : 0,
                                    blue : 0
                                },
                                font = "Font" in labelsAndAnnotationsJSON.LabelContent ? {
                                    size : <number>labelsAndAnnotationsJSON.LabelContent.Font.Size,
                                    family : <string>labelsAndAnnotationsJSON.LabelContent.Font.Family,
                                    style : <string>labelsAndAnnotationsJSON.LabelContent.Font.Style,
                                    weight : <string>labelsAndAnnotationsJSON.LabelContent.Font.Weight
                                } : XRNA.fontIdToFont(0);
                            nucleotide.labelContent = Object.assign({
                                string : <string>labelsAndAnnotationsJSON.LabelContent.Label,
                                x : <number>labelsAndAnnotationsJSON.LabelContent.X,
                                y : <number>labelsAndAnnotationsJSON.LabelContent.Y
                            }, color, font);
                        }
                    }
                }
                return {
                    name : name,
                    nucleotides : nucleotides,
                    firstNucleotideIndex : firstNucleotideIndex
                };
            };
        if (allRNAComplexesFlag) {
            for (let rnaComplexIndex = 0; rnaComplexIndex < keys.length; rnaComplexIndex++) {
                let
                    rnaComplex = {
                        name : names[rnaComplexIndex],
                        rnaMolecules : new Array<RNAMolecule>()
                    },
                    rnaComplexJSON = jsonData[keys[rnaComplexIndex]];
                for (let key of Object.keys(rnaComplexJSON)) {
                    let
                        rnaMoleculeMatch = key.match(rnaMoleculeRegex);
                    if (!rnaMoleculeMatch) {
                        throw new Error("Unrecognized JSON format.");
                    }
                    rnaComplex.rnaMolecules.push(readRNAMoleculeJSONHelper(rnaMoleculeMatch[1], rnaComplexJSON[key]));
                }
                XRNA.rnaComplexes.push(rnaComplex);
            }
        } else if (allRNAMoleculesFlag) {
            let
                rnaComplex : RNAComplex = {
                    name : "Unknown",
                    rnaMolecules : new Array<RNAMolecule>(keys.length)
                };
            for (let i = 0; i < keys.length; i++) {
                rnaComplex.rnaMolecules[i] = readRNAMoleculeJSONHelper(names[i], jsonData[keys[i]]);
            }
            XRNA.rnaComplexes.push(rnaComplex);
        } else {
            throw new Error("Unsupported JSON format.");
        }
    }

    private static generateOutputXRNAFile() : string {
        let
            xrnaFrontHalf = "",
            xrnaBackHalf = "";
        xrnaFrontHalf += "<ComplexDocument Name='" + XRNA.complexDocumentName + "'>\n";
        xrnaBackHalf = "\n</ComplexDocument>" + xrnaBackHalf;
        xrnaFrontHalf += "<SceneNodeGeom CenterX='" + 0 + "' CenterY='" + 0 + "' Scale='" + 1 + "'/>\n";
        for (let rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            let
                complex = XRNA.rnaComplexes[rnaComplexIndex];
            xrnaFrontHalf += "<Complex Name='" + complex.name + "'>\n"
            xrnaBackHalf = "\n</Complex>" + xrnaBackHalf
            for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < complex.rnaMolecules.length; rnaMoleculeIndex++) {
                let
                    rnaMolecule = complex.rnaMolecules[rnaMoleculeIndex],
                    nucleotides = rnaMolecule.nucleotides,
                    firstNucleotideIndex = rnaMolecule.firstNucleotideIndex;
                xrnaFrontHalf += "<RNAMolecule Name='" + rnaMolecule.name + "'>\n";
                xrnaBackHalf = "\n</RNAMolecule>" + xrnaBackHalf;
                xrnaFrontHalf += "<NucListData StartNucID='" + firstNucleotideIndex + "' DataType='NucChar.XPos.YPos'>\n";
                let
                    nucs = "",
                    nucLabelLists = "",
                    basePairs = "";
                for (let nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    let
                        nucleotide = nucleotides[nucleotideIndex];
                    xrnaFrontHalf += nucleotide.symbol.string + " " + nucleotide.position.x + " " + nucleotide.position.y + "\n";
                    nucs += "<Nuc RefID='" + (firstNucleotideIndex + nucleotideIndex) + "' Color='" + Utils.compressRGB(nucleotide.symbol) + "' FontID='" + XRNA.fontToFontId(nucleotide.symbol) + "'></Nuc>"
                    
                    if (nucleotide.labelContent || nucleotide.labelContent) {
                        nucLabelLists += "<Nuc RefID='" + (firstNucleotideIndex + nucleotideIndex) + "'>\n<LabelList>\n";
                        if (nucleotide.labelLine) {
                            let
                                line = nucleotide.labelLine;
                            nucLabelLists += "l " + line.v0.x + " " + line.v0.y + " " + line.v1.x + " " + line.v1.y + " " + line.strokeWidth + " " + Utils.compressRGB(line) + " 0.0 0 0 0 0\n";
                        }
                        if (nucleotide.labelContent) {
                            let
                                content = nucleotide.labelContent;
                            nucLabelLists += "s " + content.x + " " + content.y + " 0.0 " + content.size + " " + XRNA.fontToFontId(content) + " " + Utils.compressRGB(content) + " \"" + content.string + "\"\n";
                        }
                        nucLabelLists += "</LabelList>\n</Nuc>\n";
                    }
                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex < nucleotide.basePairIndex) {
                        basePairs += "<BasePairs nucID='" + (firstNucleotideIndex + nucleotideIndex) + "' length='1' bpNucID='" + (firstNucleotideIndex + nucleotide.basePairIndex) + "' />\n"
                    }
                }
                xrnaFrontHalf += "</NucListData>\n";
                xrnaFrontHalf += "<Nuc RefIDs='" + firstNucleotideIndex + "-" + (firstNucleotideIndex + nucleotides.length - 1) + "' IsSchematic='false' SchematicColor='0' SchematicLineWidth='1.5' SchematicBPLineWidth='1.0' SchematicBPGap='2.0' SchematicFPGap='2.0' SchematicTPGap='2.0' IsNucPath='false' NucPathColor='ff0000' NucPathLineWidth='0.0' />\n";
                xrnaFrontHalf += nucs;
                xrnaFrontHalf += nucLabelLists;
                xrnaFrontHalf += basePairs;
            }
        }
        return xrnaFrontHalf + xrnaBackHalf;
    }

    private static generateOutputSVGFile() : string {
        let
            canvas = <HTMLElement>XRNA.canvasHTML.cloneNode(true);
        canvas.removeAttribute("id");
        canvas.removeAttribute("class");
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

    private static generateOutputTRFile() : string {
        let
            trContents = "<structure>";
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
                    trContents += "\n<point x=\"" + nucleotide.position.x.toFixed(3) + "\" y=\"" + nucleotide.position.y.toFixed(3) + "\" b=\"" + nucleotide.symbol.string + "\" numbering-label=\"" + (rnaMolecule.firstNucleotideIndex + nucleotideIndex) + "\" />";
                }
            }
        }
        trContents += "\n</structure>";
        return trContents;
    }

    private static generateOutputCSVFile() : string {
        throw new Error("This method is not implemented yet!");
    }

    private static generateOutputBPSEQFile() : string {
        throw new Error("This method is not implemented yet!");
    }

    private static generateOutputJPGFile() : string {
        throw new Error("This method is not implemented yet!");
    }

    private static generateOutputJSONFile() : string {
        let
            outputJSONFileElements = new Array<string>(XRNA.rnaComplexes.length);
        for (let i = 0; i < XRNA.rnaComplexes.length; i++) {
            outputJSONFileElements[i] = (XRNA.generateOutputJSONFileForRNAComplex(XRNA.rnaComplexes[i], 1));
        }
        return outputJSONFileElements.join(",");
    }

    private static generateOutputJSONFileForRNAComplex(rnaComplex : RNAComplex, indentation = 1) : string {
        let
            baseIndentation = "\t".repeat(indentation),
            outputJSONFileElements = new Array<string>(rnaComplex.rnaMolecules.length);
        for (let i = 0; i < rnaComplex.rnaMolecules.length; i++) {
            outputJSONFileElements[i] = XRNA.generateOutputJSONFileForRNAMolecule(rnaComplex.rnaMolecules[i], indentation + 1);
        }
        return "\n" + baseIndentation + "\"RNA Complex " + rnaComplex.name + "\" : {" + outputJSONFileElements.join(",") + "\n"
            + baseIndentation + "}";
    }

    private static generateOutputJSONFileForRNAMolecule(rnaMolecule : RNAMolecule, indentation = 1) : string {
        let
            innerOutputJSONFileToStringElements = new Array<string>(),
            outerOutputJSONFileToStringElements = new Array<string>(),
            baseIndentation = "\t".repeat(indentation),
            outerSequenceIndentation = baseIndentation + "\t\t",
            innerSequenceIndentation = outerSequenceIndentation + "\t";
        for (let i = 0; i < rnaMolecule.nucleotides.length; i++) {
            let
                nucleotide = rnaMolecule.nucleotides[i];
            innerOutputJSONFileToStringElements.push(
                "\n" + outerSequenceIndentation + "{\n"
                + innerSequenceIndentation + "\"ResID\" : " + (rnaMolecule.firstNucleotideIndex + i) + ",\n"
                + innerSequenceIndentation + "\"ResName\" : \"" + nucleotide.symbol.string + "\",\n"
                + innerSequenceIndentation + "\"X\" : " + nucleotide.position.x + ",\n"
                + innerSequenceIndentation + "\"Y\" : " + nucleotide.position.y + ",\n"
                + innerSequenceIndentation + "\"Color\" : {\n"
                + innerSequenceIndentation + "\t\"Red\" : " + nucleotide.symbol.red + ",\n"
                + innerSequenceIndentation + "\t\"Green\" : " + nucleotide.symbol.green + ",\n"
                + innerSequenceIndentation + "\t\"Blue\" : " + nucleotide.symbol.blue + "\n"
                + innerSequenceIndentation + "},\n"
                + innerSequenceIndentation + "\"Font\" : {\n"
                + innerSequenceIndentation + "\t\"Size\" : " + nucleotide.symbol.size + ",\n"
                + innerSequenceIndentation + "\t\"Family\" : \"" + nucleotide.symbol.family + "\",\n"
                + innerSequenceIndentation + "\t\"Style\" : \"" + nucleotide.symbol.style + "\",\n"
                + innerSequenceIndentation + "\t\"Weight\" : \"" + nucleotide.symbol.weight + "\"\n"
                + innerSequenceIndentation + "}\n"
                + outerSequenceIndentation + "}"
            );
        }
        outerOutputJSONFileToStringElements.push("\n" + baseIndentation + "\t\"Sequence\" : [" + innerOutputJSONFileToStringElements.join(",") + "\n" + baseIndentation + "\t]");
        innerOutputJSONFileToStringElements = new Array<string>();
        for (let i = 0; i < rnaMolecule.nucleotides.length; i++) {
            let
                nucleotide = rnaMolecule.nucleotides[i];
            if (nucleotide.basePairIndex > i) {
                innerOutputJSONFileToStringElements.push(
                    "\n" + outerSequenceIndentation + "{\n"
                    + innerSequenceIndentation + "\"ResID1\" : " + (i + rnaMolecule.firstNucleotideIndex) + ",\n"
                    + innerSequenceIndentation + "\"ResID2\" : " + (nucleotide.basePairIndex + rnaMolecule.firstNucleotideIndex) + ",\n"
                    + innerSequenceIndentation + "\"BasePairType\" : null\n"
                    + outerSequenceIndentation + "}"
                );
            }
        }
        outerOutputJSONFileToStringElements.push("\n" + baseIndentation + "\t\"BasePairs\" : [" + innerOutputJSONFileToStringElements.join(",")+ "\n" + baseIndentation + "\t]");
        let
            annotationJSONObjects = new Array<string>();
        for (let i = 0; i < rnaMolecule.nucleotides.length; i++) {
            let
                annotationsToStringElements = new Array<string>(),
                nucleotide = rnaMolecule.nucleotides[i];
            if (nucleotide.labelLine) {
                annotationsToStringElements.push(
                    "\n" + innerSequenceIndentation + "\"LabelLine\" : {\n"
                    + innerSequenceIndentation + "\t\"X1\" : " + nucleotide.labelLine.v0.x + ",\n"
                    + innerSequenceIndentation + "\t\"Y1\" : " + nucleotide.labelLine.v0.y + ",\n"
                    + innerSequenceIndentation + "\t\"X2\" : " + nucleotide.labelLine.v1.x + ",\n"
                    + innerSequenceIndentation + "\t\"Y2\" : " + nucleotide.labelLine.v1.y + ",\n"
                    + innerSequenceIndentation + "\t\"StrokeWidth\" : " + nucleotide.labelLine.strokeWidth + ",\n"
                    + innerSequenceIndentation + "\t\"Color\" : {\n"
                    + innerSequenceIndentation + "\t\t\"Red\" : " + nucleotide.labelLine.red + ",\n"
                    + innerSequenceIndentation + "\t\t\"Green\" : " + nucleotide.labelLine.green + ",\n"
                    + innerSequenceIndentation + "\t\t\"Blue\" : " + nucleotide.labelLine.blue + "\n"
                    + innerSequenceIndentation + "\t}\n"
                    + innerSequenceIndentation + "}"
                );
            }
            if (nucleotide.labelContent) {
                annotationsToStringElements.push(
                    "\n" + innerSequenceIndentation + "\"LabelContent\" : {\n" 
                    + innerSequenceIndentation + "\t\"Label\" : \"" + nucleotide.labelContent.string + "\",\n"
                    + innerSequenceIndentation + "\t\"X\" : " + nucleotide.labelContent.x + ",\n"
                    + innerSequenceIndentation + "\t\"Y\" : " + nucleotide.labelContent.y + ",\n"
                    + innerSequenceIndentation + "\t\"Font\" : {\n"
                    + innerSequenceIndentation + "\t\t\"Size\" : " + nucleotide.symbol.size + ",\n"
                    + innerSequenceIndentation + "\t\t\"Family\" : \"" + nucleotide.symbol.family + "\",\n"
                    + innerSequenceIndentation + "\t\t\"Style\" : \"" + nucleotide.symbol.style + "\",\n"
                    + innerSequenceIndentation + "\t\t\"Weight\" : \"" + nucleotide.symbol.weight + "\"\n"
                    + innerSequenceIndentation + "\t},\n"
                    + innerSequenceIndentation + "\t\"Color\" : {\n"
                    + innerSequenceIndentation + "\t\t\"Red\" : " + nucleotide.symbol.red + ",\n"
                    + innerSequenceIndentation + "\t\t\"Green\" : " + nucleotide.symbol.green + ",\n"
                    + innerSequenceIndentation + "\t\t\"Blue\" : " + nucleotide.symbol.blue + "\n"
                    + innerSequenceIndentation + "\t}\n"
                    + innerSequenceIndentation + "" + "}"
                );
            }
            if (annotationsToStringElements.length > 0) {
                annotationsToStringElements.unshift("\n" + innerSequenceIndentation + "\"ResID\" : " + (rnaMolecule.firstNucleotideIndex + i));
                annotationJSONObjects.push(
                    "\n" + outerSequenceIndentation + "{" + annotationsToStringElements.join(",") + "\n"
                    + outerSequenceIndentation + "}"
                );
            }
        }
        outerOutputJSONFileToStringElements.push("\n" + baseIndentation + "\t\"LabelsAndAnnotations\" : [" + annotationJSONObjects.join(",") + "\n" + baseIndentation + "\t]");
        return "\n" + baseIndentation + "\"RNA Molecule " + rnaMolecule.name + "\" : {" + outerOutputJSONFileToStringElements.join(",") + "\n" + baseIndentation + "}";
    }

    private static reset() : void {
        // Clear all data from the scene.
        XRNA.rnaComplexes = new Array<RNAComplex>();
        XRNA.resetSelection();
        XRNA.resetView();
    }

    private static resetSelection() : void {
        // Clear the previous selection highlighting
        XRNA.selection.highlighted.forEach(highlightedI => highlightedI.setAttribute("visibility", "hidden"));
        XRNA.selection = {
            highlighted : new Array<HTMLElement>(),
            selectedElementListeners : new Array<SelectedElementListener>()
        };
    }

    public static resetView() : void {
        XRNA.sceneDataBounds = XRNA.sceneHTML.getBoundingClientRect();
        XRNA.sceneDataBounds.x -= XRNA.canvasBounds.x
        XRNA.sceneDataBounds.y -= XRNA.canvasBounds.y;
        XRNA.sceneTransformData.origin = {
            x : 0,
            y : 0
        };
        XRNA.draggingCoordinates = {
            cacheDragCoordinates : {
                x : 0,
                y : 0
            },
            startDragCoordinates : {
                x : 0,
                y : 0
            }
        }
        XRNA.setZoom(0);
        XRNA.zoomSliderHTML.value = "0";
    }

    public static setZoom(zoom : number) : void {
        XRNA.sceneTransformData.zoom = Utils.clamp(XRNA.sceneTransformData.minimumZoom, zoom, XRNA.sceneTransformData.maximumZoom);
        XRNA.sceneTransformData.scale = Math.pow(1.05, XRNA.sceneTransformData.zoom);
        XRNA.updateSceneTransform();
    }

    public static updateSceneTransform() : void {
        XRNA.sceneTransformEnd = "translate(" + XRNA.sceneTransformData.origin.x + " " + XRNA.sceneTransformData.origin.y + ") scale(" + XRNA.sceneTransformData.scale + " " + XRNA.sceneTransformData.scale + ")";
        // Note that transformations are applied from right to left.
        XRNA.sceneHTML.setAttribute("transform", XRNA.sceneTransformEnd + " " + XRNA.sceneTransformMiddle + " " + XRNA.sceneTransformStart);
    }

    private static fitSceneDataToCanvasBounds() : void {
        // Scale to fit the screen
        XRNA.sceneDataToCanvasBoundsScalar = Math.min(XRNA.canvasBounds.width / (XRNA.sceneDataBounds.right - XRNA.sceneDataBounds.left), XRNA.canvasBounds.height / (XRNA.sceneDataBounds.bottom - XRNA.sceneDataBounds.top));
        XRNA.sceneTransformMiddle = "scale(" + XRNA.sceneDataToCanvasBoundsScalar + " " + XRNA.sceneDataToCanvasBoundsScalar + ")";
        // Note that transformations are applied from right to left.
        XRNA.sceneHTML.setAttribute("transform", XRNA.sceneTransformEnd + " " + XRNA.sceneTransformMiddle + " " + XRNA.sceneTransformStart);
    }

    public static rnaComplexHTMLId(rnaComplexHTMLId : number) : string {
        return "RNA Complex #" + rnaComplexHTMLId;
    }

    public static rnaMoleculeHTMLId(parentHTMLId : string, rnaMoleculeIndex : number) : string {
        return parentHTMLId + XRNA.ID_DELIMITER + "RNA Molecule #" + rnaMoleculeIndex;
    }

    public static nucleotideHTMLId(parentHTMLId : string, nucleotideIndex : number) : string {
        return parentHTMLId + XRNA.ID_DELIMITER + "Nucleotide #" + nucleotideIndex;
    }

    public static nucleotideSymbolHTMLId(parentHTMLId : string) : string {
        return parentHTMLId + XRNA.ID_DELIMITER + "Symbol";
    }

    public static labelContentHTMLId(parentHTMLId : string) : string {
        return parentHTMLId + XRNA.ID_DELIMITER + "Label Content";
    }

    public static labelLineHTMLId(parentHTMLId : string) : string {
        return parentHTMLId + XRNA.ID_DELIMITER + "Label Line";
    }

    public static parentHTMLId(htmlId : string) : string {
        return htmlId.substring(0, htmlId.lastIndexOf(XRNA.ID_DELIMITER));
    }

    public static labelLineClickableBodyHTMLId(parentHTMLId : string) : string {
        return parentHTMLId + XRNA.ID_DELIMITER + "Clickable Body";
    }

    public static labelLineClickableCapHTMLId(parentHTMLId : string, capIndex : number) : string {
        return parentHTMLId + XRNA.ID_DELIMITER + "Clickable Cap #" + capIndex;
    }

    public static nucleotideBondSymbolHTMLId(parentHTMLId : string) : string {
        return parentHTMLId + XRNA.ID_DELIMITER + "Bond Symbol";
    }

    public static boundingBoxHTMLId(parentHTMLId : string) : string {
        return parentHTMLId + XRNA.ID_DELIMITER + "Bounding Box";
    }

    private static createBoundingBox(htmlElement : SVGTextElement | SVGLineElement | SVGPathElement | HTMLElement) : DOMRect {
        let
            boundingBox = htmlElement.getBoundingClientRect();
        boundingBox.x -= XRNA.canvasBounds.x;
        boundingBox.y -= XRNA.canvasBounds.y;
        return boundingBox;
    }

    public static fontIdToFont(fontID : number) : Font {
        // Adapted from StringUtil.java:ssFontToFont
        switch (fontID) {
            case 0:
                return {
                    size: 8,
                    family: "Helvetica",
                    style: "normal",
                    weight: "normal"
                };
            case 1:
                return {
                    size: 8,
                    family: "Helvetica",
                    style: "italic",
                    weight: "normal"
                };
            case 2:
                return {
                    size: 8,
                    family: "Helvetica",
                    style: "normal",
                    weight: "bold"
                };
            case 3:
                return {
                    size: 8,
                    family: "Helvetica",
                    style: "italic",
                    weight: "bold"
                };
            case 4:
                return {
                    size: 8,
                    family: "TimesRoman",
                    style: "normal",
                    weight: "normal"
                };
            case 5:
                return {
                    size: 8,
                    family: "TimesRoman",
                    style: "italic",
                    weight: "normal"
                };
            case 6:
                return {
                    size: 8,
                    family: "TimesRoman",
                    style: "normal",
                    weight: "bold"
                };
            case 7:
                return {
                    size: 8,
                    family: "TimesRoman",
                    style: "italic",
                    weight: "bold"
                };
            case 8:
                return {
                    size: 8,
                    family: "Courier",
                    style: "normal",
                    weight: "normal"
                };
            case 9:
                return {
                    size: 8,
                    family: "Courier",
                    style: "italic",
                    weight: "normal"
                };
            case 10:
                return {
                    size: 8,
                    family: "Courier",
                    style: "normal",
                    weight: "bold"
                };
            case 11:
                return {
                    size: 8,
                    family: "Courier",
                    style: "italic",
                    weight: "bold"
                };
            case 12:
                return {
                    size: 8,
                    family: "TimesRoman",
                    style: "normal",
                    weight: "normal"
                };
            case 13:
                return {
                    size: 8,
                    family: "Dialog",
                    style: "normal",
                    weight: "normal"
                };
            case 14:
                return {
                    size: 8,
                    family: "Dialog",
                    style: "italic",
                    weight: "normal"
                };
            case 15:
                return {
                    size: 8,
                    family: "Dialog",
                    style: "normal",
                    weight: "bold"
                };
            case 16:
                return {
                    size: 8,
                    family: "Dialog",
                    style: "italic",
                    weight: "bold"
                };
            case 17:
                return {
                    size: 8,
                    family: "DialogInput",
                    style: "normal",
                    weight: "normal"
                };
            case 18:
                return {
                    size: 8,
                    family: "DialogInput",
                    style: "italic",
                    weight: "normal"
                };
            case 19:
                return {
                    size: 8,
                    family: "DialogInput",
                    style: "normal",
                    weight: "bold"
                };
            case 20:
                return {
                    size: 8,
                    family: "DialogInput",
                    style: "italic",
                    weight: "bold"
                };
            default:
                return {
                    size: 8,
                    family: "Helvetica",
                    style: "normal",
                    weight: "normal"
                };
        }
    }

    public static fontToFontId(font : Font) : number {
        // A logical inversion of fontIDToFont. Implemented for backward compatibility.
        switch (font.family + "_" + font.style + "_" + font.weight) {
            default:
            case "Helvetica_normal_normal":
                return 0;
            case "Helvetica_italic_normal":
                return 1;
            case "Helvetica_normal_bold":
                return 2;
            case "Helvetica_italic_bold":
                return 3;
            case "TimesRoman_normal_normal":
                return 4;
            case "TimesRoman_italic_normal":
                return 5;
            case "TimesRoman_normal_bold":
                return 6;
            case "TimesRoman_italic_bold":
                return 7;
            case "Courier_normal_normal":
                return 8;
            case "Courier_italic_normal":
                return 9;
            case "Courier_normal_bold":
                return 10;
            case "Courier_italic_bold":
                return 11;
            case "TimesRoman_normal_normal":
                return 12;
            case "Dialog_normal_normal":
                return 13;
            case "Dialog_italic_normal":
                return 14;
            case "Dialog_normal_bold":
                return 15;
            case "Dialog_italic_bold":
                return 16;
            case "DialogInput_normal_normal":
                return 17;
            case "DialogInput_italic_normal":
                return 18;
            case "DialogInput_normal_bold":
                return 19;
            case "DialogInput_italic_bold":
                return 20;
        }
    }

    private static populateAndShowContextMenu(mouseEvent : MouseEvent, populateContextMenuHelper : () => void) : void {
        while (XRNA.contextMenuHTML.firstChild) {
            XRNA.contextMenuHTML.removeChild(XRNA.contextMenuHTML.firstChild);
        }
        let
            contextMenuDimension = Math.ceil(Math.min(XRNA.canvasBounds.width, XRNA.canvasBounds.height) / 2.0),
            contextMenuDimensionAsString = contextMenuDimension + "px";
        XRNA.contextMenuHTML.style.display = "block";
        XRNA.contextMenuHTML.style.width = contextMenuDimensionAsString;
        XRNA.contextMenuHTML.style.height = contextMenuDimensionAsString;
        // Provide a buffer for the context menu's border.
        let
            borderWidth = parseFloat(XRNA.contextMenuHTML.style.borderWidth.match(/\d+(?:\.\d*)?/)[0]);
        XRNA.contextMenuHTML.style.left = (Math.min(XRNA.canvasBounds.x + XRNA.canvasBounds.width - contextMenuDimension - 2 * borderWidth, mouseEvent.pageX)) + 'px';
        XRNA.contextMenuHTML.style.top = (Math.min(XRNA.canvasBounds.y + XRNA.canvasBounds.height - contextMenuDimension - 2 * borderWidth, mouseEvent.pageY)) + 'px';
        populateContextMenuHelper();
    }

    private static handleNucleotideOnMouseDown(nucleotideHTML : SVGElement, mouseEvent : MouseEvent) : boolean {
        let
            newButtonIndex = Utils.getButtonIndex(mouseEvent),
            pressedButtonIndex = newButtonIndex - XRNA.buttonIndex,
            mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x,
            mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y,
            selectionConstraint = XRNA.namedSelectionConstraintsMap[XRNA.selectionConstraintHTML.value],
            indicesAsStrings = nucleotideHTML.id.match(/#\d+/g),
            rnaComplexIndex = parseInt(indicesAsStrings[0].substring(1)),
            rnaMoleculeIndex = parseInt(indicesAsStrings[1].substring(1)),
            nucleotideIndex = parseInt(indicesAsStrings[2].substring(1));
        XRNA.buttonIndex = newButtonIndex;
        if (pressedButtonIndex & ButtonIndex.LEFT) {
            if (document.getElementById("editTab").style.display == "block") {
                XRNA.resetSelection();
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x : mouseInCanvasX,
                    y : mouseInCanvasY
                };
                if (selectionConstraint.approveSelectedNucleotideForSelection(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex)) {
                    selectionConstraint.populateXRNASelection(nucleotideHTML, selectionConstraint.getSelectedNucleotideIndices(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex))
                } else {
                    alert(selectionConstraint.getErrorMessageForSelection());
                }
            } else {
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x : mouseInCanvasX,
                    y : mouseInCanvasY
                };
            }
        } else if (pressedButtonIndex & ButtonIndex.RIGHT) {
            if (document.getElementById("editTab").style.display == "block") {
                if (selectionConstraint.approveSelectedNucleotideForContextMenu(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex)) {
                    XRNA.populateAndShowContextMenu(mouseEvent, () => selectionConstraint.populateEditContextMenu(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex));
                } else {
                    alert(selectionConstraint.getErrorMessageForContextMenu());
                }
            } else if (document.getElementById("formatTab").style.display == "block") {
                XRNA.populateAndShowContextMenu(mouseEvent, () => selectionConstraint.populateFormatContextMenu(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex));
            }
        }
        return false;
    }

    private static handleLabelContentOnMouseDown(labelContentHTML : SVGTextElement, mouseEvent : MouseEvent) : boolean {
        let
            newButtonIndex = Utils.getButtonIndex(mouseEvent),
            pressedButtonIndex = XRNA.buttonIndex - newButtonIndex,
            mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x,
            mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y;
        XRNA.buttonIndex = newButtonIndex;
        if (pressedButtonIndex & ButtonIndex.LEFT) {
            if (document.getElementById("editTab").style.display == "block") {
                XRNA.resetSelection();
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x : mouseInCanvasX,
                    y : mouseInCanvasY
                };

                let
                    boundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(labelContentHTML.id)),
                    nucleotideId = XRNA.parentHTMLId(labelContentHTML.id),
                    indicesAsStrings = nucleotideId.match(/#(\d+)/g),
                    labelContent = XRNA.rnaComplexes[parseInt(indicesAsStrings[0].substring(1))].rnaMolecules[parseInt(indicesAsStrings[1].substring(1))].nucleotides[parseInt(indicesAsStrings[2].substring(1))].labelContent;
                boundingBoxHTML.setAttribute("visibility", "visible");
                XRNA.selection.highlighted.push(boundingBoxHTML);
                XRNA.selection.selectedElementListeners.push(
                    new class extends SelectedElementListener {
                        updateXYHelper(x : number, y : number) {
                            labelContentHTML.setAttribute("x", "" + x);
                            labelContentHTML.setAttribute("y", "" + y);
                        }
                    }(parseFloat(labelContentHTML.getAttribute("x")), parseFloat(labelContentHTML.getAttribute("y")), true, false),
                    new class extends SelectedElementListener {
                        updateXYHelper(x : number, y : number) : void {
                            boundingBoxHTML.setAttribute("x", "" + x);
                            boundingBoxHTML.setAttribute("y", "" + y);
                        }
                    }(parseFloat(boundingBoxHTML.getAttribute("x")), parseFloat(boundingBoxHTML.getAttribute("y")), false, false),
                    new class extends SelectedElementListener {
                        updateXYHelper(x : number, y : number) {
                            labelContent.x = x;
                            labelContent.y = y;
                        }
                    }(labelContent.x, labelContent.y, false, false)
                );
            } else {
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x : mouseInCanvasX,
                    y : mouseInCanvasY
                };
            }
        } else {
            // TODO: populate the context menu for label content.
        }
        return false;
    }

    private static handleLabelLineClickableBodyOnMouseDown(labelLineClickableBodyHTML : SVGPathElement, mouseEvent : MouseEvent) : boolean {
        let
            newButtonIndex = Utils.getButtonIndex(mouseEvent),
            pressedButtonIndex = newButtonIndex - XRNA.buttonIndex,
            mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x,
            mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y;
        XRNA.buttonIndex = newButtonIndex;
        if (pressedButtonIndex & ButtonIndex.LEFT) {
            if (document.getElementById("editTab").style.display == "block") {
                XRNA.resetSelection();
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x : mouseInCanvasX,
                    y : mouseInCanvasY
                };
                let
                    id = labelLineClickableBodyHTML.id,
                    indices = id.match(/#\d+/g),
                    rnaComplexIndex = parseInt(indices[0].substring(1)),
                    rnaMoleculeIndex = parseInt(indices[1].substring(1)),
                    nucleotideIndex = parseInt(indices[2].substring(1)),
                    nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex],
                    labelLine = nucleotide.labelLine,
                    labelLineId = XRNA.parentHTMLId(labelLineClickableBodyHTML.id),
                    labelLineHTML = document.getElementById(labelLineId),
                    nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(XRNA.parentHTMLId(labelLineId))),
                    nucleotideBoundingBoxCenter = {
                        x : parseFloat(nucleotideBoundingBoxHTML.getAttribute("x")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("width")) / 2.0,
                        y : parseFloat(nucleotideBoundingBoxHTML.getAttribute("y")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("height")) / 2.0
                    },
                    cacheV0 = {
                        x : labelLine.v0.x,
                        y : labelLine.v0.y
                    },
                    cacheV1 = {
                        x : labelLine.v1.x,
                        y : labelLine.v1.y
                    },
                    labelLineClickableCap0HTML = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineId, 0)),
                    labelLineClickableCap1HTML = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineId, 1));
                labelLineClickableBodyHTML.setAttribute('visibility', 'visible');
                XRNA.selection.highlighted.push(labelLineClickableBodyHTML);
                
                XRNA.selection.selectedElementListeners.push(
                    new class extends SelectedElementListener {
                        updateXYHelper(dx : number, dy : number) {
                            labelLine.v0 = {
                                x : cacheV0.x + dx,
                                y : cacheV0.y + dy
                            };
                            labelLine.v1 = {
                                x : cacheV1.x + dx,
                                y : cacheV1.y + dy
                            };
                            let
                                labelLineHTMLX1 = nucleotideBoundingBoxCenter.x + labelLine.v0.x,
                                labelLineHTMLY1 = nucleotideBoundingBoxCenter.y + labelLine.v0.y,
                                labelLineHTMLX2 = nucleotideBoundingBoxCenter.x + labelLine.v1.x,
                                labelLineHTMLY2 = nucleotideBoundingBoxCenter.y + labelLine.v1.y,
                                pathDefinitions = Utils.getClickablePathDefinitionsFromLine({
                                    v0 : {
                                        x : labelLineHTMLX1,
                                        y : labelLineHTMLY1
                                    },
                                    v1 : {
                                        x : labelLineHTMLX2,
                                        y : labelLineHTMLY2
                                    }
                                });
                            labelLineHTML.setAttribute("x1", "" + labelLineHTMLX1);
                            labelLineHTML.setAttribute("y1", "" + labelLineHTMLY1);
                            labelLineHTML.setAttribute("x2", "" + labelLineHTMLX2);
                            labelLineHTML.setAttribute("y2", "" + labelLineHTMLY2);
                            labelLineClickableBodyHTML.setAttribute("d", pathDefinitions.bodyPathDefinition);
                            labelLineClickableCap0HTML.setAttribute("d", pathDefinitions.cap0PathDefinition);
                            labelLineClickableCap1HTML.setAttribute("d", pathDefinitions.cap1PathDefinition);
                        }
                    }(0, 0, false, true)
                );
            } else {
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x : mouseInCanvasX,
                    y : mouseInCanvasY
                };
            }
        } else {
            // TODO: populate context menu.
        }
        return false;
    }

    private static handleLabelLineClickableCapOnMouseDown(labelLineClickableCapHTML : SVGPathElement, mouseEvent : MouseEvent) : boolean {
        let
            newButtonIndex = Utils.getButtonIndex(mouseEvent),
            pressedButtonIndex = newButtonIndex - XRNA.buttonIndex,
            mouseInCanvasX = mouseEvent.pageX - XRNA.canvasBounds.x,
            mouseInCanvasY = mouseEvent.pageY - XRNA.canvasBounds.y;
        XRNA.buttonIndex = newButtonIndex;
        if (pressedButtonIndex & ButtonIndex.LEFT) {
            if (document.getElementById("editTab").style.display == "block") {
                XRNA.resetSelection();
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x : mouseInCanvasX,
                    y : mouseInCanvasY
                };
                let
                    labelLineId = XRNA.parentHTMLId(labelLineClickableCapHTML.id),
                    labelLineClickableBodyHTML = document.getElementById(XRNA.labelLineClickableBodyHTMLId(labelLineId)),
                    indicesAsStrings = labelLineClickableCapHTML.id.match(/#\d+/g),
                    capIndex = parseInt(indicesAsStrings[indicesAsStrings.length - 1].substring(1)),
                    labelLineClickableCap0HTML = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineId, 0)),
                    labelLineClickableCap1HTML = document.getElementById(XRNA.labelLineClickableCapHTMLId(labelLineId, 1)),
                    rnaComplexIndex = parseInt(indicesAsStrings[0].substring(1)),
                    rnaMoleculeIndex = parseInt(indicesAsStrings[1].substring(1)),
                    nucleotideIndex = parseInt(indicesAsStrings[2].substring(1)),
                    nucleotide = XRNA.rnaComplexes[rnaComplexIndex].rnaMolecules[rnaMoleculeIndex].nucleotides[nucleotideIndex],
                    labelLineEndpoint : Vector2D,
                    labelLineHTML = document.getElementById(labelLineId),
                    nucleotideBoundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaMoleculeIndex), nucleotideIndex))),
                    nucleotideBoundingBoxCenter = {
                        x : parseFloat(nucleotideBoundingBoxHTML.getAttribute("x")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("width")) / 2.0,
                        y : parseFloat(nucleotideBoundingBoxHTML.getAttribute("y")) + parseFloat(nucleotideBoundingBoxHTML.getAttribute("height")) / 2.0
                    };
                if (capIndex == 0) {
                    labelLineEndpoint = nucleotide.labelLine.v0;
                } else {
                    labelLineEndpoint = nucleotide.labelLine.v1;
                }
                labelLineClickableCapHTML.setAttribute("visibility", "block");
                XRNA.selection.highlighted.push(labelLineClickableCapHTML);

                let
                    cacheLabelLineHTMLCoordinates = {
                        x : parseFloat(labelLineHTML.getAttribute("x" + (capIndex + 1))),
                        y : parseFloat(labelLineHTML.getAttribute("y" + (capIndex + 1)))
                    }
                XRNA.selection.selectedElementListeners.push(new class extends SelectedElementListener {
                    updateXYHelper(dx : number, dy : number) {
                        labelLineEndpoint.x = this.cache.x + dx;
                        labelLineEndpoint.y = this.cache.y + dy;
                        labelLineHTML.setAttribute("x" + (capIndex + 1), "" + (cacheLabelLineHTMLCoordinates.x + dx));
                        labelLineHTML.setAttribute("y" + (capIndex + 1), "" + (cacheLabelLineHTMLCoordinates.y + dy));
                        let
                            pathDefinitions = Utils.getClickablePathDefinitionsFromLine({
                                v0 : VectorOperations2D.add(nucleotideBoundingBoxCenter, nucleotide.labelLine.v0),
                                v1 : VectorOperations2D.add(nucleotideBoundingBoxCenter, nucleotide.labelLine.v1)
                            });
                        labelLineClickableCap0HTML.setAttribute("d", pathDefinitions.cap0PathDefinition);
                        labelLineClickableCap1HTML.setAttribute("d", pathDefinitions.cap1PathDefinition);
                        labelLineClickableBodyHTML.setAttribute("d", pathDefinitions.bodyPathDefinition);
                    }
                }(labelLineEndpoint.x, labelLineEndpoint.y, false, true));
            } else {
                XRNA.draggingCoordinates.startDragCoordinates = {
                    x : mouseInCanvasX,
                    y : mouseInCanvasY
                };
            }
        } else {
            // TODO: populate the context menu.
        }
        return false;
    }

    private static populateScene() : void {
        XRNA.sceneHTML.setAttribute("transform", "");
        // Clear the scene.
        for (let childIndex = 0; childIndex < XRNA.sceneHTML.children.length; childIndex++) {
            let
                child = XRNA.sceneHTML.children[childIndex];
            if (child != XRNA.sketchesHTML) {
                XRNA.sceneHTML.removeChild(child);
            }
        }
        // Populate the scene.
        for (let rnaComplexIndex = 0; rnaComplexIndex < XRNA.rnaComplexes.length; rnaComplexIndex++) {
            let
                rnaComplex = XRNA.rnaComplexes[rnaComplexIndex],
                rnaComplexId = XRNA.rnaComplexHTMLId(rnaComplexIndex),
                rnaComplexHTML = document.createElementNS(svgNameSpaceURL, "g");
            XRNA.sceneHTML.appendChild(rnaComplexHTML);
            rnaComplexHTML.setAttribute("id", rnaComplexId);
            for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < rnaComplex.rnaMolecules.length; rnaMoleculeIndex++) {
                let
                    rnaMolecule = rnaComplex.rnaMolecules[rnaMoleculeIndex],
                    nucleotides = rnaMolecule.nucleotides,
                    rnaMoleculeId = XRNA.rnaMoleculeHTMLId(rnaComplexId, rnaMoleculeIndex),
                    rnaMoleculeHTML = document.createElementNS(svgNameSpaceURL, "g");
                rnaComplexHTML.appendChild(rnaMoleculeHTML);
                rnaMoleculeHTML.setAttribute("id", rnaMoleculeId);
                for (let nucleotideIndex = 0; nucleotideIndex < nucleotides.length; nucleotideIndex++) {
                    let
                        nucleotide = nucleotides[nucleotideIndex],
                        nucleotideId = XRNA.nucleotideHTMLId(rnaMoleculeId, nucleotideIndex),
                        nucleotideHTML = document.createElementNS(svgNameSpaceURL, "g");
                    rnaMoleculeHTML.appendChild(nucleotideHTML);
                    nucleotideHTML.setAttribute("id", nucleotideId);
                    nucleotideHTML.setAttribute("transform", "translate(" + nucleotide.position.x + " " + nucleotide.position.y + ")");
                    nucleotideHTML.onmousedown = (mouseEvent : MouseEvent) => XRNA.handleNucleotideOnMouseDown(nucleotideHTML, mouseEvent);

                    let
                        symbolHTML = document.createElementNS(svgNameSpaceURL, "text");
                    // The displacement from the nucleotide html element is {x: 0, y: 0}.
                    nucleotideHTML.appendChild(symbolHTML);
                    symbolHTML.setAttribute("id", XRNA.nucleotideSymbolHTMLId(nucleotideId));
                    symbolHTML.setAttribute("stroke", "rgb(" + nucleotide.symbol.red + " " + nucleotide.symbol.green + " " + nucleotide.symbol.blue + ")");
                    symbolHTML.setAttribute("transform", "scale(1 -1)");
                    symbolHTML.setAttribute("font-size", "" + nucleotide.symbol.size);
                    symbolHTML.setAttribute("font-family", "" + nucleotide.symbol.family);
                    symbolHTML.setAttribute("font-style", "" + nucleotide.symbol.style);
                    symbolHTML.setAttribute("font-weight", "" + nucleotide.symbol.weight);
                    symbolHTML.textContent = nucleotide.symbol.string;

                    let
                        nucleotideBoundingBox = XRNA.createBoundingBox(symbolHTML);
                    nucleotideBoundingBox.x -= nucleotide.position.x;
                    nucleotideBoundingBox.y -= nucleotide.position.y;
                    let
                        boundingBoxHTML = Utils.createBoundingBoxHTML(nucleotideBoundingBox, XRNA.boundingBoxHTMLId(nucleotideId)),
                        nucleotideBoundingBoxCenterX = nucleotideBoundingBox.x + nucleotideBoundingBox.width / 2.0,
                        nucleotideBoundingBoxCenterY = nucleotideBoundingBox.y + nucleotideBoundingBox.height / 2.0;
                    nucleotideHTML.appendChild(boundingBoxHTML);

                    if (nucleotide.basePairIndex >= 0 && nucleotideIndex > nucleotide.basePairIndex) {
                        XRNA.createNucleotideBondSymbol(rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex, rnaMoleculeIndex, nucleotide.basePairIndex);
                    }

                    if (nucleotide.labelLine) {
                        let
                            labelLineHTML = document.createElementNS(svgNameSpaceURL, "line"),
                            labelLineId = XRNA.labelLineHTMLId(nucleotideId),
                            v0X = nucleotideBoundingBoxCenterX + nucleotide.labelLine.v0.x,
                            v0Y = nucleotideBoundingBoxCenterY + nucleotide.labelLine.v0.y,
                            v1X = nucleotideBoundingBoxCenterX + nucleotide.labelLine.v1.x,
                            v1Y = nucleotideBoundingBoxCenterY + nucleotide.labelLine.v1.y;
                        nucleotideHTML.appendChild(labelLineHTML);
                        labelLineHTML.setAttribute("id", labelLineId);
                        labelLineHTML.setAttribute("stroke-width", "" + nucleotide.labelLine.strokeWidth);
                        labelLineHTML.setAttribute("stroke", "rgb(" + nucleotide.labelLine.red + " " + nucleotide.labelLine.green + " " + nucleotide.labelLine.blue + ")");
                        labelLineHTML.setAttribute("x1", "" + v0X);
                        labelLineHTML.setAttribute("y1", "" + v0Y);
                        labelLineHTML.setAttribute("x2", "" + v1X);
                        labelLineHTML.setAttribute("y2", "" + v1Y);
                        labelLineHTML.setAttribute("pointer-events", "none");

                        let
                            labelLineClickableBodyHTML = document.createElementNS(svgNameSpaceURL, "path"),
                            labelLineClickableCap0HTML = document.createElementNS(svgNameSpaceURL, "path"),
                            labelLineClickableCap1HTML = document.createElementNS(svgNameSpaceURL, "path"),
                            labelLineClickablePathDefinitions = Utils.getClickablePathDefinitionsFromLine({
                                v0 : {
                                    x : v0X,
                                    y : v0Y
                                },
                                v1 : {
                                    x : v1X,
                                    y : v1Y
                                }
                            });
                        [
                            {
                                htmlElement : labelLineClickableBodyHTML,
                                path : labelLineClickablePathDefinitions.bodyPathDefinition,
                                onmousedown : (mouseEvent : MouseEvent) => XRNA.handleLabelLineClickableBodyOnMouseDown(labelLineClickableBodyHTML, mouseEvent),
                                id : XRNA.labelLineClickableBodyHTMLId(labelLineId)
                            },
                            {
                                htmlElement : labelLineClickableCap0HTML,
                                path : labelLineClickablePathDefinitions.cap0PathDefinition,
                                onmousedown : (mouseEvent : MouseEvent) => XRNA.handleLabelLineClickableCapOnMouseDown(labelLineClickableCap0HTML, mouseEvent),
                                id : XRNA.labelLineClickableCapHTMLId(labelLineId, 0)
                            },
                            {
                                htmlElement : labelLineClickableCap1HTML,
                                path : labelLineClickablePathDefinitions.cap1PathDefinition,
                                onmousedown : (mouseEvent : MouseEvent) => XRNA.handleLabelLineClickableCapOnMouseDown(labelLineClickableCap1HTML, mouseEvent),
                                id : XRNA.labelLineClickableCapHTMLId(labelLineId, 1)
                            }
                        ].forEach(htmlElementWithData => {
                            Utils.setBoundingBoxHTMLAttributes(htmlElementWithData.htmlElement, htmlElementWithData.id);
                            nucleotideHTML.appendChild(htmlElementWithData.htmlElement);
                            htmlElementWithData.htmlElement.setAttribute("pointer-events", "all")
                            htmlElementWithData.htmlElement.setAttribute("d", htmlElementWithData.path)
                            htmlElementWithData.htmlElement.onmousedown = (mouseEvent : MouseEvent) => htmlElementWithData.onmousedown(mouseEvent);
                        });
                    }

                    if (nucleotide.labelContent) {
                        let
                            labelContentHTML = document.createElementNS(svgNameSpaceURL, "text"),
                            labelContentId = XRNA.labelContentHTMLId(nucleotideId);
                        nucleotideHTML.appendChild(labelContentHTML);
                        labelContentHTML.setAttribute("id", labelContentId);
                        labelContentHTML.setAttribute("stroke", "rgb(" + nucleotide.labelContent.red + " " + nucleotide.labelContent.green + " " + nucleotide.labelContent.blue + ")");
                        labelContentHTML.setAttribute("font-size", "" + nucleotide.labelContent.size);
                        labelContentHTML.setAttribute("font-family", "" + nucleotide.labelContent.family);
                        labelContentHTML.setAttribute("font-style", "" + nucleotide.labelContent.style);
                        labelContentHTML.setAttribute("font-weight", "" + nucleotide.labelContent.weight);
                        labelContentHTML.setAttribute("transform", "scale(1 -1)");
                        labelContentHTML.onmousedown = (mouseEvent : MouseEvent) => XRNA.handleLabelContentOnMouseDown(labelContentHTML, mouseEvent);
                        labelContentHTML.textContent = nucleotide.labelContent.string;

                        let
                            labelContentBoundingBox = XRNA.createBoundingBox(labelContentHTML),
                            labelContentHTMLX = nucleotideBoundingBoxCenterX - nucleotideBoundingBox.x + nucleotide.labelContent.x - labelContentBoundingBox.width / 2.0,
                            labelContentHTMLY = nucleotideBoundingBoxCenterY - nucleotideBoundingBox.y - nucleotide.labelContent.y - labelContentBoundingBox.height / 2.0;
                        labelContentHTML.setAttribute("x", "" + labelContentHTMLX);
                        labelContentHTML.setAttribute("y", "" + labelContentHTMLY);
                        // Reset the bounding box to the position of the transformed labelContentHTML.
                        labelContentBoundingBox = XRNA.createBoundingBox(labelContentHTML);
                        labelContentBoundingBox.x -= nucleotide.position.x;
                        labelContentBoundingBox.y -= nucleotide.position.y;
                        nucleotideHTML.appendChild(Utils.createBoundingBoxHTML(labelContentBoundingBox, XRNA.boundingBoxHTMLId(labelContentId)));
                    }
                }
            }
        }
        XRNA.sceneDataBounds = XRNA.sceneHTML.getBoundingClientRect();
        XRNA.sceneDataBounds.x -= XRNA.canvasBounds.x
        XRNA.sceneDataBounds.y -= XRNA.canvasBounds.y;
        // Translate the scene to the origin.
        // Invert the y axis. Note that graphical y axes are inverted in comparison to standard cartesian coordinates.
        // Center the scene along the y axis.
        XRNA.sceneTransformStart = "translate(0 " + (XRNA.sceneDataBounds.bottom - XRNA.sceneDataBounds.top) + ") scale(1 -1) translate(" + -XRNA.sceneDataBounds.left + " " + -XRNA.sceneDataBounds.top + ")";
        XRNA.fitSceneDataToCanvasBounds();
    }

    static createNucleotideBond(rnaComplexIndex : number, rnaMoleculeIndex0 : number, nucleotideIndex0 : number, rnaMoleculeIndex1 : number, nucleotideIndex1 : number, boundingBoxOffset : Vector2D = null) : void {
        XRNA.createNucleotideBondSymbol(rnaComplexIndex, rnaMoleculeIndex0, nucleotideIndex0, rnaMoleculeIndex1, nucleotideIndex1,boundingBoxOffset);
        let
            rnaComplex = XRNA.rnaComplexes[rnaComplexIndex],
            nucleotide0 = rnaComplex.rnaMolecules[rnaMoleculeIndex0].nucleotides[nucleotideIndex0],
            nucleotide1 = rnaComplex.rnaMolecules[rnaMoleculeIndex1].nucleotides[nucleotideIndex1];
        nucleotide0.basePairIndex = nucleotideIndex1;
        nucleotide1.basePairIndex = nucleotideIndex0;
    }

    static createNucleotideBondSymbol(rnaComplexIndex : number, rnaMoleculeIndex0 : number, nucleotideIndex0 : number, rnaMoleculeIndex1 : number, nucleotideIndex1 : number, boundingBoxOffset : Vector2D = null) : void {
        if (((rnaMoleculeIndex1 - rnaMoleculeIndex0) || (nucleotideIndex1 - nucleotideIndex0)) > 0) {
            // Enforce that the zeroth rnaMoleculeIndex, nucleotideIndex pair is greater than the other.
            let
                tempRnaMoleculeIndex = rnaMoleculeIndex0,
                tempNucleotideIndex = nucleotideIndex0;
            rnaMoleculeIndex0 = rnaMoleculeIndex1;
            nucleotideIndex0 = nucleotideIndex1;
            rnaMoleculeIndex1 = tempRnaMoleculeIndex;
            nucleotideIndex1 = tempNucleotideIndex;
        }
        let
            nucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaMoleculeIndex0), nucleotideIndex0),
            nucleotideHTML = document.getElementById(nucleotideId);
        if (!boundingBoxOffset) {
            let
                boundingBoxHTML = document.getElementById(XRNA.boundingBoxHTMLId(nucleotideId));
            boundingBoxOffset = {
                x : parseFloat(boundingBoxHTML.getAttribute("x")) + parseFloat(boundingBoxHTML.getAttribute("width")) / 2.0,
                y : parseFloat(boundingBoxHTML.getAttribute("y")) + parseFloat(boundingBoxHTML.getAttribute("height")) / 2.0
            };
        }
        let
            rnaComplex = XRNA.rnaComplexes[rnaComplexIndex],
            nucleotide = rnaComplex.rnaMolecules[rnaMoleculeIndex0].nucleotides[nucleotideIndex0],
            basePairedNucleotide = rnaComplex.rnaMolecules[rnaMoleculeIndex1].nucleotides[nucleotideIndex1],
            dv = VectorOperations2D.subtract(basePairedNucleotide.position, nucleotide.position),
            bondSymbolHTML : SVGElement,
            circleHTMLHelper = (fill : string) => {
                bondSymbolHTML = document.createElementNS(svgNameSpaceURL, 'circle');
                bondSymbolHTML.setAttribute('fill', fill);
                let
                    interpolation = VectorOperations2D.add(boundingBoxOffset, VectorOperations2D.scaleUp(dv, 0.5));
                bondSymbolHTML.setAttribute('cx', '' + interpolation.x);
                bondSymbolHTML.setAttribute('cy', '' + interpolation.y);
                bondSymbolHTML.setAttribute('r', '' + VectorOperations2D.magnitude(dv) / 8.0);
            };
        // Hardcode black for now. This appears to be consistent with XRNA-GT (Java).
        let
            strokeAndFill = 'black';
        switch (nucleotide.symbol.string + basePairedNucleotide.symbol.string) {
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
                let
                    interpolation0 = VectorOperations2D.add(boundingBoxOffset, VectorOperations2D.scaleUp(dv, 0.25)),
                    interpolation1 = VectorOperations2D.add(boundingBoxOffset, VectorOperations2D.scaleUp(dv, 0.75));
                bondSymbolHTML.setAttribute('x1', '' + interpolation0.x);
                bondSymbolHTML.setAttribute('y1', '' + interpolation0.y);
                bondSymbolHTML.setAttribute('x2', '' + interpolation1.x);
                bondSymbolHTML.setAttribute('y2', '' + interpolation1.y);
                break;
            }
        }
        // Note that the bondSymbolHTML is a child exclusively of the nucleotideHTML with the greater nucleotide index.
        nucleotideHTML.appendChild(bondSymbolHTML);
        bondSymbolHTML.setAttribute('stroke', strokeAndFill);
        bondSymbolHTML.setAttribute('id', XRNA.nucleotideBondSymbolHTMLId(nucleotideId));
    }

    static deleteNucleotideBond(rnaComplexIndex : number, rnaMoleculeIndex0 : number, nucleotideIndex0 : number, rnaMoleculeIndex1 : number, nucleotideIndex1 : number) : void {
        if (((rnaMoleculeIndex1 - rnaMoleculeIndex0) || (nucleotideIndex1 - nucleotideIndex0)) > 0) {
            // Enforce that the zeroth rnaMoleculeIndex, nucleotideIndex pair is greater than the other.
            let
                tempRnaMoleculeIndex = rnaMoleculeIndex0,
                tempNucleotideIndex = nucleotideIndex0;
            rnaMoleculeIndex0 = rnaMoleculeIndex1;
            nucleotideIndex0 = nucleotideIndex1;
            rnaMoleculeIndex1 = tempRnaMoleculeIndex;
            nucleotideIndex1 = tempNucleotideIndex;
        }
        let
            nucleotideId = XRNA.nucleotideHTMLId(XRNA.rnaMoleculeHTMLId(XRNA.rnaComplexHTMLId(rnaComplexIndex), rnaMoleculeIndex0), nucleotideIndex0);
        document.getElementById(nucleotideId).removeChild(document.getElementById(XRNA.nucleotideBondSymbolHTMLId(nucleotideId)));
        let
            rnaComplex = XRNA.rnaComplexes[rnaComplexIndex];
        rnaComplex.rnaMolecules[rnaMoleculeIndex0].nucleotides[nucleotideIndex0].basePairIndex = -1;
        rnaComplex.rnaMolecules[rnaMoleculeIndex1].nucleotides[nucleotideIndex1].basePairIndex = -1;
    }

    public static updateSelectedOutputFileExtension(outputFileExtension : string) : void {
        XRNA.outputFileHandlerMap[outputFileExtension].handleSelectedOutputFileExtension();
    }
}
