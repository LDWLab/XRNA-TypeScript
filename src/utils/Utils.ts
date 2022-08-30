export const EPSILON = 1E-7;

export class Utils {
  public static sign(n : number, epsilon = EPSILON) : number {
    return n < -epsilon ? -1 : n < epsilon ? 0 : 1;
  }

  public static compare(n0 : number, n1 : number, epsilon = EPSILON) : number {
    return Utils.sign(n0 - n1, epsilon);
  }

  public static areEqual(n0 : number, n1 : number, epsilon = EPSILON) : boolean {
    return Utils.compare(n0, n1, epsilon) === 0;
  }

  public static binarySearch<T>(array : Array<T>, comparator : (t : T) => number) : { arrayEntry : T, arrayIndex : number } | null {
    let arrayIndexLowBound = 0;
    let arrayIndexHighBound = array.length - 1;
    while (true) {
      let arrayIndex = (arrayIndexLowBound + arrayIndexHighBound) >> 1;
      let arrayEntry = array[arrayIndex];
      let comparison = comparator(arrayEntry);
      if (comparison === 0) {
        return {
          arrayEntry,
          arrayIndex
        };
      }
      if (comparison > 0) {
        arrayIndexHighBound = arrayIndex - 1;
      } else {
        arrayIndexLowBound = arrayIndex + 1;
      }
      if (arrayIndexLowBound > arrayIndexHighBound) {
        break;
      }
    }
    return null;
  }

  public static radiansToDegrees(angle : number) {
    // 57.2957795131 === 180 / Math.PI
    return angle * 57.2957795131;
  }

  public static degreesToRadians(angle : number) {
    // 0.01745329251 === Math.PI / 180
    return angle * 0.01745329251;
  }
}