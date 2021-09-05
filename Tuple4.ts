import { Tuple3 } from "./Tuple3";

export class Tuple4<T0, T1, T2, T3> extends Tuple3<T0, T1, T2> {
    protected w : T3;

    public constructor(x : T0, y : T1, z : T2, w : T3) {
        super(x, y, z);
        this.w = w;
    }

    public getW() : T3 {
        return this.w;
    }

    public setW(w : T3) : void {
        this.w = w;
    }

    public get(arr : any[]) : void {
        arr[0] = this.x;
        arr[1] = this.y;
        arr[2] = this.z;
        arr[3] = this.w;
    }

    public set(arr : any[]) : void {
        this.x = <T0>arr[0];
        this.y = <T1>arr[1];
        this.z = <T2>arr[2];
        this.w = <T3>arr[3];
    }

    public copy() : Tuple4<T0, T1, T2, T3> {
        return new Tuple4<T0, T1, T2, T3>(this.x, this.y, this.z, this.w);
    }
}