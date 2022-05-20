class Vector2D {
  public x : number;
  public y : number;

  public constructor(x : number, y : number) {
    this.x = x;
    this.y = y;
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

  public static normalize(v : Vector2D) {
    return Vector2D.scaleDown(v, Vector2D.magnitude(v));
  }

  public static orthogonalize(v : Vector2D) {
    return new Vector2D(-v.y, v.x);
  }

  public static scaleDown(v : Vector2D, scalar : number) : Vector2D {
    return Vector2D.scaleUp(v, 1.0 / scalar);
  }

  public static interpolate(v0 : Vector2D, v1 : Vector2D, interpolationFactor : number) : Vector2D {
    let oneMinusInterpolationFactor = 1 - interpolationFactor;
    return {
      x : oneMinusInterpolationFactor * v0.x + interpolationFactor * v1.x,
      y : oneMinusInterpolationFactor * v0.y + interpolationFactor * v1.y
    };
  }

  public static magnitudeSquared(v : Vector2D) : number {
    return v.x * v.x + v.y * v.y;
  }

  public static magnitude(v : Vector2D) : number {
    return Math.sqrt(Vector2D.magnitudeSquared(v));
  }
}

export { Vector2D };