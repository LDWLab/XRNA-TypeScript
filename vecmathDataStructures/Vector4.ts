import { Tuple4 } from "./Tuple4";

export class Vector4 extends Tuple4<number, number, number, number> {
    public constructor(x = 0, y = 0, z = 0, w = 0) {
        super(x, y, z, w);
    }

    public copy() : Vector4 {
        return new Vector4(this.x, this.y, this.z, this.w);
    }
}