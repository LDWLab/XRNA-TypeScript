export class Nuc2D {
    public readonly character : string;
    public readonly x : number;
    public readonly y : number;
    public readonly index : number
    public readonly basePairIndex : number;
    public static template : string;
    private static serialIndex = 0;

    public constructor(character : string, x = 0.0, y = 0.0, index = Nuc2D.serialIndex, basePairIndex = -1) {
        this.character = character;
        this.x = x;
        this.y = y;
        this.index = index;
        Nuc2D.serialIndex = index + 1;
        this.basePairIndex = basePairIndex;
    }

    public static parse(inputLine : string, template = Nuc2D.template) : Nuc2D {
        let inputData = inputLine.split(/\s+/);
        let character : string;
        let x = 0.0;
        let y = 0.0;
        let index = Nuc2D.serialIndex
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
        return new Nuc2D(character, x, y, index, basePairIndex);
    }
}