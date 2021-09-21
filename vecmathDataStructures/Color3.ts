import { Tuple3 } from "./Tuple3"

export class Color0To1Range extends Tuple3<number, number, number> {
    public constructor(red = 0, green = 0, blue = 0) {
        super(red, green, blue);
    }

    public static fromColor0To255Range(red = 0, green = 0, blue = 0) {
        return new Color0To1Range(red / 255, green / 255, blue / 255);
    }
}