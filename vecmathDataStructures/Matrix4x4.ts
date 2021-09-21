import { AxisAngle4 } from "./AxisAngle4";
import { Tuple3 } from "./Tuple3";
import { Tuple4 } from "./Tuple4";

export class Matrix4x4 {
    private entry00 : number;
    private entry01 : number;
    private entry02 : number;
    private entry03 : number;
    private entry10 : number;
    private entry11 : number;
    private entry12 : number;
    private entry13 : number;
    private entry20 : number;
    private entry21 : number;
    private entry22 : number;
    private entry23 : number;
    private entry30 : number;
    private entry31 : number;
    private entry32 : number;
    private entry33 : number;

    public constructor(entry00 = 0, entry01 = 0, entry02 = 0, entry03 = 0, entry10 = 0, entry11 = 0, entry12 = 0, entry13 = 0, entry20 = 0, entry21 = 0, entry22 = 0, entry23 = 0, entry30 = 0, entry31 = 0, entry32 = 0, entry33 = 0) {
        this.entry00 = entry00;
        this.entry01 = entry01;
        this.entry02 = entry02;
        this.entry03 = entry03;
        this.entry10 = entry10;
        this.entry11 = entry11;
        this.entry12 = entry12;
        this.entry13 = entry13;
        this.entry20 = entry20;
        this.entry21 = entry21;
        this.entry22 = entry22;
        this.entry23 = entry23;
        this.entry30 = entry30;
        this.entry31 = entry31;
        this.entry32 = entry32;
        this.entry33 = entry33;
    }

    public getElement(i : number, j : number) : number {
        switch ([i, j]) {
            case [0, 0]:
                return this.entry00;
            case [0, 1]:
                return this.entry01;
            case [0, 2]:
                return this.entry02;
            case [0, 3]:
                return this.entry03;
            case [1, 0]:
                return this.entry10;
            case [1, 1]:
                return this.entry11;
            case [1, 2]:
                return this.entry12;
            case [1, 3]:
                return this.entry13;
            case [2, 0]:
                return this.entry20;
            case [2, 1]:
                return this.entry21;
            case [2, 2]:
                return this.entry22;
            case [2, 3]:
                return this.entry23;
            case [3, 0]:
                return this.entry30;
            case [3, 1]:
                return this.entry31;
            case [3, 2]:
                return this.entry32;
            case [3, 3]:
                return this.entry33;
            default:
                throw new Error("Indices out of bounds (" + i + ", " + j + ")");
        }
    }

    public get(arr : number[]) : void {
        arr[0] = this.entry00;
        arr[1] = this.entry01;
        arr[2] = this.entry02;
        arr[3] = this.entry03;
        arr[4] = this.entry10;
        arr[5] = this.entry11;
        arr[6] = this.entry12;
        arr[7] = this.entry13;
        arr[8] = this.entry21;
        arr[9] = this.entry21;
        arr[10] = this.entry22;
        arr[11] = this.entry23;
        arr[12] = this.entry30;
        arr[13] = this.entry31;
        arr[14] = this.entry32;
        arr[15] = this.entry33;
    }

    public set(arr : number[]) : void {
        this.entry00 = arr[0];
        this.entry01 = arr[1];
        this.entry02 = arr[2];
        this.entry03 = arr[3];
        this.entry10 = arr[4];
        this.entry11 = arr[5];
        this.entry12 = arr[6];
        this.entry13 = arr[7];
        this.entry21 = arr[8];
        this.entry22 = arr[9];
        this.entry23 = arr[10];
        this.entry30 = arr[11];
        this.entry31 = arr[12];
        this.entry32 = arr[13];
        this.entry33 = arr[14];
    }

    public invert() : void {
        Matrix4x4.invert(this);
    }

    public negate() : void {
        this.entry00 = -this.entry00;
        this.entry01 = -this.entry01;
        this.entry02 = -this.entry02;
        this.entry03 = -this.entry03;
        this.entry10 = -this.entry10;
        this.entry11 = -this.entry11;
        this.entry12 = -this.entry12;
        this.entry13 = -this.entry13;
        this.entry20 = -this.entry20;
        this.entry21 = -this.entry21;
        this.entry22 = -this.entry22;
        this.entry23 = -this.entry23;
        this.entry30 = -this.entry30;
        this.entry31 = -this.entry31;
        this.entry32 = -this.entry32;
        this.entry33 = -this.entry33;
    }

    public mul(other : Matrix4x4) : void {
        this.entry00 = this.entry00 * other.entry00 + this.entry01 * other.entry10 + this.entry02 * other.entry20 + this.entry03 * other.entry30;
        this.entry01 = this.entry00 * other.entry01 + this.entry01 * other.entry11 + this.entry02 * other.entry21 + this.entry03 * other.entry31;
        this.entry02 = this.entry00 * other.entry02 + this.entry01 * other.entry12 + this.entry02 * other.entry22 + this.entry03 * other.entry32;
        this.entry03 = this.entry00 * other.entry03 + this.entry01 * other.entry13 + this.entry02 * other.entry23 + this.entry03 * other.entry33;
        this.entry10 = this.entry10 * other.entry00 + this.entry11 * other.entry10 + this.entry12 * other.entry20 + this.entry13 * other.entry30;
        this.entry11 = this.entry10 * other.entry01 + this.entry11 * other.entry11 + this.entry12 * other.entry21 + this.entry13 * other.entry31;
        this.entry12 = this.entry10 * other.entry02 + this.entry11 * other.entry12 + this.entry12 * other.entry22 + this.entry13 * other.entry32;
        this.entry13 = this.entry10 * other.entry03 + this.entry11 * other.entry13 + this.entry12 * other.entry23 + this.entry13 * other.entry33;
        this.entry20 = this.entry20 * other.entry00 + this.entry21 * other.entry10 + this.entry22 * other.entry20 + this.entry23 * other.entry30;
        this.entry21 = this.entry20 * other.entry01 + this.entry21 * other.entry11 + this.entry22 * other.entry21 + this.entry23 * other.entry31;
        this.entry22 = this.entry20 * other.entry02 + this.entry21 * other.entry12 + this.entry22 * other.entry22 + this.entry23 * other.entry32;
        this.entry23 = this.entry20 * other.entry03 + this.entry21 * other.entry13 + this.entry22 * other.entry23 + this.entry23 * other.entry33;
        this.entry30 = this.entry30 * other.entry00 + this.entry31 * other.entry10 + this.entry32 * other.entry20 + this.entry33 * other.entry30;
        this.entry31 = this.entry30 * other.entry01 + this.entry31 * other.entry11 + this.entry32 * other.entry21 + this.entry33 * other.entry31;
        this.entry32 = this.entry30 * other.entry02 + this.entry31 * other.entry12 + this.entry32 * other.entry22 + this.entry33 * other.entry32;
        this.entry33 = this.entry30 * other.entry03 + this.entry31 * other.entry13 + this.entry32 * other.entry23 + this.entry33 * other.entry33;
    }

    public rotX(theta : number) : void {
        let sin = Math.sin(theta);
        let cos = Math.cos(theta);
        this.entry00 = 1;
        this.entry01 = 0;
        this.entry02 = 0;
        this.entry03 = 0;
        this.entry10 = 0;
        this.entry11 = cos;
        this.entry12 = -sin;
        this.entry13 = 0;
        this.entry20 = 0;
        this.entry21 = sin;
        this.entry22 = cos;
        this.entry23 = 0;
        this.entry30 = 0;
        this.entry31 = 0;
        this.entry32 = 0;
        this.entry33 = 1;
    }

    public rotY(theta : number) : void {
        let sin = Math.sin(theta);
        let cos = Math.cos(theta);
        this.entry00 = cos;
        this.entry01 = 0;
        this.entry02 = sin;
        this.entry03 = 0;
        this.entry10 = 0;
        this.entry11 = 1;
        this.entry12 = 0;
        this.entry13 = 0;
        this.entry20 = -sin;
        this.entry21 = 0;
        this.entry22 = cos;
        this.entry23 = 0;
        this.entry30 = 0;
        this.entry31 = 0;
        this.entry32 = 0;
        this.entry33 = 1;
    }

    public rotZ(theta : number) : void {
        let sin = Math.sin(theta);
        let cos = Math.cos(theta);
        this.entry00 = cos;
        this.entry01 = -sin;
        this.entry02 = 0;
        this.entry03 = 0;
        this.entry10 = sin;
        this.entry11 = cos;
        this.entry12 = 0;
        this.entry13 = 0;
        this.entry20 = 0;
        this.entry21 = 0;
        this.entry22 = 1;
        this.entry23 = 0;
        this.entry30 = 0;
        this.entry31 = 0;
        this.entry32 = 0;
        this.entry33 = 1;
    }

    public setFromAxisAngle(axisAngle : AxisAngle4) : void {
        let x = axisAngle.getX();
        let y = axisAngle.getY();
        let z = axisAngle.getZ();
        let d = Math.sqrt(x * x + y * y + z * z);
        if (d < 1E-10) {
            this.entry00 = 1.0;
            this.entry01 = 0.0;
            this.entry02 = 0.0;
            this.entry10 = 0.0;
            this.entry11 = 1.0;
            this.entry12 = 0.0;
            this.entry20 = 0.0;
            this.entry21 = 0.0;
            this.entry22 = 1.0;
        } else {
            d = 1.0 / d;
            let d1 = x * d;
            let d2 = y * d;
            let d3 = z * d;
            let angle = axisAngle.getW();
            let d4 = Math.sin(angle);
            let d5 = Math.cos(angle);
            let d6 = 1.0 - d5;
            let d7 = d1 * d3;
            let d8 = d1 * d2;
            let d9 = d2 * d3;
            this.entry00 = d6 * d1 * d1 + d5;
            this.entry01 = d6 * d8 - d4 * d3;
            this.entry02 = d6 * d7 + d4 * d2;
            this.entry10 = d6 * d8 + d4 * d3;
            this.entry11 = d6 * d2 * d2 + d5;
            this.entry12 = d6 * d9 - d4 * d1;
            this.entry20 = d6 * d7 - d4 * d2;
            this.entry21 = d6 * d9 + d4 * d1;
            this.entry22 = d6 * d3 * d3 + d5;
        } 
        this.entry03 = 0.0;
        this.entry13 = 0.0;
        this.entry23 = 0.0;
        this.entry30 = 0.0;
        this.entry31 = 0.0;
        this.entry32 = 0.0;
        this.entry33 = 1.0;
    }

    public setElement(i : number, j : number, value : number) {
        switch ([i, j]) {
            case [0, 0]:
                this.entry00 = value;
                break;
            case [0, 1]:
                this.entry01 = value;
                break;
            case [0, 2]:
                this.entry02 = value;
                break;
            case [0, 3]:
                this.entry03 = value;
                break;
            case [1, 0]:
                this.entry10 = value;
                break;
            case [1, 1]:
                this.entry11 = value;
                break;
            case [1, 2]:
                this.entry12 = value;
                break;
            case [1, 3]:
                this.entry13 = value;
                break;
            case [2, 0]:
                this.entry20 = value;
                break;
            case [2, 1]:
                this.entry21 = value;
                break;
            case [2, 2]:
                this.entry22 = value;
                break;
            case [2, 3]:
                this.entry23 = value;
                break;
            case [3, 0]:
                this.entry30 = value;
                break;
            case [3, 1]:
                this.entry31 = value;
                break;
            case [3, 2]:
                this.entry32 = value;
                break;
            case [3, 3]:
                this.entry33 = value;
                break;
            default:
                throw new Error("Indices out of bounds (" + i + ", " + j + ")");
        }
    }

    public static invert(m4: Matrix4x4) : void {
        let arr0 = new Array<number>(16);
        let indices = new Array<number>(4);
        let arr1 = new Array<number>(16);
        m4.get(arr1);
        if (Matrix4x4.luDecomposition(arr1, indices)) {
            arr1[0] = 1;
            arr1[1] = 0;
            arr1[2] = 0;
            arr1[3] = 0;
            arr1[4] = 0;
            arr1[5] = 1;
            arr1[6] = 0;
            arr1[7] = 0;
            arr1[8] = 0;
            arr1[9] = 0;
            arr1[10] = 1;
            arr1[11] = 0;
            arr1[12] = 0;
            arr1[13] = 0;
            arr1[14] = 0;
            arr1[15] = 1;
            Matrix4x4.luBackSubstitution(arr1, indices, arr0);
            m4.set(arr0);
        } else {
            throw new Error("This singular matrix has no inverse.");
        }
    }

    public setIdentity() : void {
        this.entry00 = 1.0;
        this.entry01 = 0.0;
        this.entry02 = 0.0;
        this.entry03 = 0.0;
        this.entry10 = 0.0;
        this.entry11 = 1.0;
        this.entry12 = 0.0;
        this.entry13 = 0.0;
        this.entry20 = 0.0;
        this.entry21 = 0.0;
        this.entry22 = 1.0;
        this.entry23 = 0.0;
        this.entry30 = 0.0;
        this.entry31 = 0.0;
        this.entry32 = 0.0;
        this.entry33 = 1.0;
    }

    public setTranslation(translation : Tuple3<number, number, number>) : void {
        this.entry03 = translation.getX();
        this.entry13 = translation.getY();
        this.entry23 = translation.getZ();
    }

    public transform(t4 : Tuple4<number, number, number, number>) : void {
        let x = t4.getX();
        let y = t4.getY();
        let z = t4.getZ();
        let w = t4.getW();
        t4.setX(this.entry00 * x + this.entry01 * y + this.entry02 * z + this.entry03 * w);
        t4.setY(this.entry10 * x + this.entry11 * y + this.entry12 * z + this.entry13 * w);
        t4.setZ(this.entry20 * x + this.entry21 * y + this.entry22 * z + this.entry23 * w);
        t4.setW(this.entry30 * x + this.entry31 * y + this.entry32 * z + this.entry33 * w);
    }

    public static luDecomposition(arr : number[], indices : number[]) : boolean {
        let tempArr = new Array<number>(4);
        let j = 0;
        let k = 0;
        let i = 4;
        while (i-- != 0) {
            let d = 0.0;
            let m = 4;
            while (m-- != 0) {
                let d1 = arr[j++];
                d1 = Math.abs(d1);
                if (d1 > d) {
                    d = d1; 
                }
            } 
            if (d == 0.0) {
                return false; 
            }
            tempArr[k++] = 1.0 / d;
        }
        let b = 0;
        for (i = 0; i < 4; i++) {
            for (j = 0; j < i; j++) {
                let n = b + 4 * j + i;
                let d1 = arr[n];
                let m = j;
                let i1 = b + 4 * j;
                let i2 = b + i;
                while (m-- != 0) {
                    d1 -= arr[i1] * arr[i2];
                    i1++;
                    i2 += 4;
                } 
                arr[n] = d1;
            } 
            let d = 0.0;
            k = -1;
            for (j = i; j < 4; j++) {
                let n = b + 4 * j + i;
                let d1 = arr[n];
                let m = i;
                let i1 = b + 4 * j;
                let i2 = b + i;
                while (m-- != 0) {
                    d1 -= arr[i1] * arr[i2];
                    i1++;
                    i2 += 4;
                } 
                arr[n] = d1;
                let d2;
                if ((d2 = tempArr[j] * Math.abs(d1)) >= d) {
                    d = d2;
                    k = j;
                } 
            } 
            if (k < 0) {
                throw new Error("Logic error: imax < 0");
            }
            if (i != k) {
                let m = 4;
                let n = b + 4 * k;
                let i1 = b + 4 * i;
                while (m-- != 0) {
                    let d1 = arr[n];
                    arr[n++] = arr[i1];
                    arr[i1++] = d1;
                } 
                tempArr[k] = tempArr[i];
            } 
            indices[i] = k;
            if (arr[b + 4 * i + i] == 0.0) {
                return false; 
            }
            if (i != 3) {
                let d1 = 1.0 / arr[b + 4 * i + i];
                let m = b + 4 * (i + 1) + i;
                j = 3 - i;
                while (j-- != 0) {
                    arr[m] = arr[m] * d1;
                    m += 4;
                } 
            } 
        } 
        return true;
    }

    public static luBackSubstitution(arr0 : number[], indices : number[], arr1 : number[]) {
        let b2 = 0;
        for (let b1 = 0; b1 < 4; b1++) {
            let b4 = b1;
            let b = -1;
            for (let b3 = 0; b3 < 4; b3++) {
                let i = indices[b2 + b3];
                let d = arr1[b4 + 4 * i];
                arr1[b4 + 4 * i] = arr1[b4 + 4 * b3];
                if (b >= 0) {
                    let j = b3 * 4;
                    for (let b6 = b; b6 <= b3 - 1; b6++)
                    d -= arr0[j + b6] * arr1[b4 + 4 * b6]; 
                } else if (d != 0.0) {
                    b = b3;
                } 
                arr1[b4 + 4 * b3] = d;
            } 
            let b5 = 12;
            arr1[b4 + 12] = arr1[b4 + 12] / arr0[b5 + 3];
            b5 -= 4;
            arr1[b4 + 8] = (arr1[b4 + 8] - arr0[b5 + 3] * arr1[b4 + 12]) / arr0[b5 + 2];
            b5 -= 4;
            arr1[b4 + 4] = (arr1[b4 + 4] - arr0[b5 + 2] * arr1[b4 + 8] - arr0[b5 + 3] * arr1[b4 + 12]) / arr0[b5 + 1];
            b5 -= 4;
            arr1[b4 + 0] = (arr1[b4 + 0] - arr0[b5 + 1] * arr1[b4 + 4] - arr0[b5 + 2] * arr1[b4 + 8] - arr0[b5 + 3] * arr1[b4 + 12]) / arr0[b5 + 0];
        }
    }

    public copy() : Matrix4x4 {
        return new Matrix4x4(this.entry00, this.entry01, this.entry02, this.entry03, this.entry10, this.entry11, this.entry12, this.entry13, this.entry20, this.entry21, this.entry22, this.entry23, this.entry30, this.entry31, this.entry32, this.entry33);
    }
}