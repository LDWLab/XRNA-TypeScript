import { Tuple2 } from "./Tuple2";

export class Tuple3<T0, T1, T2> extends Tuple2<T0, T1> {
    protected z : T2;

    public constructor(x : T0, y : T1, z : T2) {
        super(x, y);
        this.z = z;
    }

    public getZ() : T2 {
        return this.z;
    }

    public setZ(z : T2) : void {
        this.z = z;
    }

    public set(arr : any[]) : void {
        this.x = <T0>arr[0];
        this.y = <T1>arr[1];
        this.z = <T2>arr[2];
    }

    public get(arr : any[]) : void {
        arr[0] = this.x;
        arr[1] = this.y;
        arr[2] = this.z;
    }

    public copy() : Tuple3<T0, T1, T2> {
        return new Tuple3<T0, T1, T2>(this.x, this.y, this.z);
    }
}