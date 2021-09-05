import { Tuple3 } from "./Tuple3";

export class Vector3 extends Tuple3<number, number, number> {
    public constructor(x = 0, y = 0, z = 0) {
        super(x, y, z);
    }

    public add(other : Tuple3<number, number, number>) : void {
        this.x += other.getX();
        this.y += other.getY();
        this.z += other.getZ();
    }

    public sub(other : Tuple3<number, number, number>) : void {
        this.x -= other.getX();
        this.y -= other.getY();
        this.z -= other.getZ();
    }

    public dot(other : Vector3) : number {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    public distanceSquared(other : Vector3) : number {
        let dX = this.x - other.x;
        let dY = this.y - other.y;
        let dZ = this.z - other.z;
        return dX * dX + dY * dY + dZ * dZ;
    }

    public distance(other : Vector3) : number {
        return Math.sqrt(this.distanceSquared(other));
    }

    public length() : number {
        return this.distance(new Vector3());
    }

    public angle(other : Vector3) : number {
        // a * b == |a| * |b| * cos(theta)
        // a * b / (|a| * |b|) == cos(theta)
        // acos(a * b / (|a| * |b|)) == theta
        let dot = this.dot(other) / (this.length() * other.length());
        if (dot < -1) {
            dot = -1;
        } else if (dot > 1) {
            dot = 1;
        }
        return Math.acos(dot);
    }

    public cross(v0 : Vector3, v1 : Vector3) : void {
        // v0 x v1
        //
        // | i    j    k    |
        // | v0.x v0.y v0.z | == i * | v0.y v0.z | - j * | v0.x v0.z | + k * | v0.x v0.y |
        // | v1.x v1.y v1.z |        | v1.y v1.z |       | v1.x v1.z |       | v1.x v1.y |
        //
        // i * (v0.y * v1.z - v0.z * v1.y) - j * (v0.x * v1.z - v0.z * v1.x) + k * (v0.x * v1.y - v0.y * v1.x)
        // <v0.y * v1.z - v0.z * v1.y, v0.z * v1.x - v0.x * v1.z, v0.x * v1.y - v0.y * v1.x>
        let x = v0.y * v1.z - v0.z - v1.y;
        let y = v0.z * v1.x - v0.x * v1.z;
        let z = v0.x * v1.y - v0.y * v1.x;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public negate() : void {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
    }

    public equals(other : Vector3) : boolean {
        return this.x == other.x && this.y == other.y && this.z == other.z;
    }

    public scale(scalar : number) : void {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    public normalize() : void {
        this.scale(1 / this.length());
    }

    public copy() : Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }
}