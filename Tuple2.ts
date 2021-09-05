export class Tuple2<T0, T1> {
    protected x : T0;
    protected y : T1;

    constructor(x : T0, y : T1) {
        this.x = x;
        this.y = y;
    }

    public getX() : T0 {
        return this.x;
    }

    public getY() : T1 {
        return this.y;
    }

    public setX(x : T0) : void {
        this.x = x;
    }

    public setY(y : T1) : void {
        this.y = y;
    }

    public set(arr : any[]) : void {
        this.x = <T0>arr[0];
        this.y = <T1>arr[1];
    }

    public get(arr : any[]) : void {
        arr[0] = this.x;
        arr[1] = this.y;
    }

    public copy() : Tuple2<T0, T1> {
        return new Tuple2<T0, T1>(this.x, this.y);
    }
}