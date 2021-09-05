import { Tuple2 } from "./Tuple2";

export class Vector2 extends Tuple2<number, number> {
    public constructor(x = 0, y = 0) {
        super(x, y);
    }

    public distanceSquared(other : Vector2) : number {
        let dX = this.x - other.x;
        let dY = this.y - other.y;
        return dX * dX + dY * dY;
    }

    public distance(other : Vector2) : number {
        return Math.sqrt(this.distanceSquared(other));
    }

    public copy() : Vector2 {
        return new Vector2(this.x, this.y);
    }

    public length() : number {
        return this.distance(new Vector2());
    }

    public normalize() : void {
        let scalar = 1 / this.length();
        this.x *= scalar;
        this.y *= scalar;
    }
}