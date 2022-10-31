import { Utils } from "../utils/Utils";

export default class Vector2D {
  public x : number;
  public y : number;

  public constructor(x : number, y : number) {
    this.x = x;
    this.y = y;
  }

  public static copy(v : Vector2D) : Vector2D {
    return new Vector2D(v.x, v.y);
  }

  public static add(v0 : Vector2D, v1 : Vector2D) : Vector2D {
    return new Vector2D(
      v0.x + v1.x,
      v0.y + v1.y
    );
  }

  public static subtract(v0 : Vector2D, v1 : Vector2D) : Vector2D {
    return new Vector2D(
      v0.x - v1.x,
      v0.y - v1.y
    );
  }

  public static negate(v : Vector2D) : Vector2D {
    return Vector2D.scaleUp(v, -1);
  }

  public static scaleUp(v : Vector2D, scalar : number) : Vector2D {
    return new Vector2D(
      v.x * scalar,
      v.y * scalar
    );
  }

  public static scaleDown(v : Vector2D, scalar : number) : Vector2D {
    return Vector2D.scaleUp(v, 1.0 / scalar);
  }

  public static normalize(v : Vector2D) {
    return Vector2D.scaleDown(v, Vector2D.magnitude(v));
  }

  public static orthogonalizeRight(v : Vector2D) {
    // Equivalent to a 90-degree turn right.
    return new Vector2D(v.y, -v.x);
  }

  public static orthogonalizeLeft(v : Vector2D) {
    // Equivalent to a 90-degree turn left.
    return new Vector2D(-v.y, v.x);
  }

  public static orthogonalize = Vector2D.orthogonalizeLeft;

  public static interpolate(v0 : Vector2D, v1 : Vector2D, interpolationFactor : number) : Vector2D {
    let oneMinusInterpolationFactor = 1 - interpolationFactor;
    return {
      x : oneMinusInterpolationFactor * v0.x + interpolationFactor * v1.x,
      y : oneMinusInterpolationFactor * v0.y + interpolationFactor * v1.y
    };
  }

  public static magnitudeSquared(v : Vector2D) : number {
    return (
      v.x * v.x +
      v.y * v.y
    );
  }

  public static magnitude(v : Vector2D) : number {
    return Math.sqrt(Vector2D.magnitudeSquared(v));
  }

  public static distanceSquared(v0 : Vector2D, v1 : Vector2D) : number {
    return Vector2D.magnitudeSquared(Vector2D.subtract(v0, v1));
  }

  public static distance(v0 : Vector2D, v1 : Vector2D) : number {
    return Vector2D.magnitude(Vector2D.subtract(v0, v1));
  }

  public static dotProduct(v0 : Vector2D, v1 : Vector2D) : number {
    return (
      v0.x * v1.x + 
      v0.y * v1.y
    );
  }

  public static crossProduct(v0 : Vector2D, v1 : Vector2D) {
    /*
               |i    j    k   |
    v0 x v1 == |v0.x v0.y v0.z|
               |v1.x v1.y v1.z|
    
    (v0 x v1) * k == v0.x * v1.y - v0.y * v1.x
    */
    return (
      v0.x * v1.y -
      v0.y * v1.x
    );
  }

  public static asAngle(v : Vector2D) : number {
    return Math.atan2(v.y, v.x);
  }

  public static toNormalCartesian(angle : number) {
    return new Vector2D(Math.cos(angle), Math.sin(angle));
  }

  public static toCartesian(angle : number, radius : number) : Vector2D {
    return Vector2D.scaleUp(Vector2D.toNormalCartesian(angle), radius);
  }

  public static toPolar(v : Vector2D) : PolarVector2D {
    return {
      radius : Vector2D.magnitude(v),
      angle : Vector2D.asAngle(v)
    };
  }

  public static angleBetween(v0 : Vector2D, v1 : Vector2D) : number {
    return Math.acos(Vector2D.dotProduct(v0, v1) / Math.sqrt(Vector2D.magnitudeSquared(v0) * Vector2D.magnitudeSquared(v1)));
  }

  public static scalarProjection(v : Vector2D, direction : Vector2D) {
    return Vector2D.dotProduct(v, direction) / Vector2D.magnitude(direction);
  }

  public static project(v : Vector2D, direction : Vector2D) : Vector2D {
    return Vector2D.scaleUp(direction, Vector2D.dotProduct(v, direction) / Vector2D.magnitudeSquared(direction));
  }

  public static reject(v : Vector2D, direction : Vector2D) : Vector2D {
    return Vector2D.subtract(v, Vector2D.project(v, direction));
  }

  public static projectUsingNormalDirection(v : Vector2D, normalDirection : Vector2D) {
    return Vector2D.scaleUp(normalDirection, Vector2D.dotProduct(v, normalDirection));
  }

  public static rejectUsingNormalDirection(v : Vector2D, normalDirection : Vector2D) {
    return Vector2D.subtract(v, Vector2D.projectUsingNormalDirection(v, normalDirection));
  }

  public static rotationDirection(dv0 : Vector2D, dv1 : Vector2D) {
    return Utils.sign(Vector2D.crossProduct(dv0, dv1));
  }
}

export type PolarVector2D = {
  radius : number,
  angle : number
}