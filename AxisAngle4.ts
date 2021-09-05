import { Tuple4 } from "./Tuple4";

export class AxisAngle4 extends Tuple4<number, number, number, number> {
    public constructor(x : number, y : number, z : number, w : number) {
        super(x, y, z, w);
    }
}