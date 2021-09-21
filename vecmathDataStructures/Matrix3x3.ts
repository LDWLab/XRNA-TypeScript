export class Matrix3x3 {
    private entry00 : number;
    private entry01 : number;
    private entry02 : number;
    private entry10 : number;
    private entry11 : number;
    private entry12 : number;
    private entry20 : number;
    private entry21 : number;
    private entry22 : number;

    public constructor(entry00 : number, entry01 : number, entry02 : number, entry10 : number, entry11 : number, entry12 : number, entry20 : number, entry21 : number, entry22 : number) {
        this.entry00 = entry00;
        this.entry01 = entry01;
        this.entry02 = entry02;
        this.entry10 = entry10;
        this.entry11 = entry11;
        this.entry12 = entry12;
        this.entry20 = entry20;
        this.entry21 = entry21;
        this.entry22 = entry22;
    }

    public determinant() : number {
        // | 00 01 02 |
        // | 10 11 12 | == 00 * | 11 12 | - 01 * | 10 12 | + 02 * | 10 11 |
        // | 20 21 22 |         | 21 22 |        | 20 22 |        | 20 21 |
        //
        // ==  00 * (11 * 22 - 12 - 21) + 01 * (12 * 20 - 10 * 22) + 02 * (10 * 21 - 11 * 20)
        return this.entry00 * (this.entry11 * this.entry22 - this.entry12 * this.entry21) + this.entry01 * (this.entry12 * this.entry20 - this.entry10 * this.entry22) + this.entry02 * (this.entry10 * this.entry21 - this.entry11 * this.entry20);
    }
}