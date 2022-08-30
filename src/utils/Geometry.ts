import { Utils } from "./Utils";
import Vector2D from "../data_structures/Vector2D";

export type Circle = {
  center : Vector2D,
  radius : number
};

export type Line2D = {
  anchor : Vector2D,
  direction : Vector2D
};

export class Geometry {
  public static intersect2dLines(l0 : Line2D, l1 : Line2D) : number | Line2D | null {
    let crossProduct = Vector2D.crossProduct(l0.direction, l1.direction);
    if (Utils.sign(crossProduct) === 0) {
      if (Utils.sign(Vector2D.crossProduct(Vector2D.subtract(l0.anchor, l1.anchor), l0.direction)) === 0) {
        return l0;
      } else {
        return null;
      }
    } else {
      return Geometry.intersectNonparallel2dLines(l0, l1, crossProduct);
    }
  }

  public static intersectNonparallel2dLines(l0 : Line2D, l1 : Line2D, denominator = Vector2D.crossProduct(l0.direction, l1.direction)) : number {
    // See https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    return Vector2D.crossProduct(Vector2D.subtract(l1.anchor, l0.anchor), l1.direction) / denominator;
  }

  public static interpolate(l : Line2D, interpolationFactor : number) : Vector2D {
    return Vector2D.add(l.anchor, Vector2D.scaleUp(l.direction, interpolationFactor))
  }

  public static getBoundingCircleGivenVectorsAreNotColinear(v0 : Vector2D, v1 : Vector2D, v2 : Vector2D) : Circle {
    let difference0 = Vector2D.subtract(v1, v2);
    let difference1 = Vector2D.subtract(v0, v2);
    let normal0 = Vector2D.orthogonalize(difference0);
    let normal1 = Vector2D.orthogonalize(difference1);
    let average0 = Vector2D.scaleUp(Vector2D.add(v1, v2), 0.5);
    let average1 = Vector2D.scaleUp(Vector2D.add(v0, v2), 0.5);
    let line0 = {
      anchor : average0,
      direction : normal0
    };
    let line1 = {
      anchor : average1,
      direction : normal1
    };
    let center = Geometry.interpolate(line0, Geometry.intersectNonparallel2dLines(line0, line1));
    return {
      center,
      radius : Vector2D.distance(center, v0)
    };
  }

  public static getBoundingCircle(v0 : Vector2D, v1 : Vector2D, v2 : Vector2D) : Circle {
    let difference0 = Vector2D.subtract(v1, v2);
    let difference1 = Vector2D.subtract(v0, v2);
    if (Utils.sign(Vector2D.crossProduct(difference0, difference1)) === 0) {
      // The vectors are colinear.
      let indexOfMaximumValue = 0;
      let diameterSquared = [difference0, difference1, Vector2D.subtract(v1, v0)].map(Vector2D.magnitudeSquared).reduce((previousValue : number, currentValue : number, currentIndex : number) => {
        if (currentValue >= previousValue) {
          indexOfMaximumValue = currentIndex;
          return currentValue;
        } else {
          return previousValue;
        }
      });
      let radius = Math.sqrt(diameterSquared) * 0.5;
      let boundingVertices : [Vector2D, Vector2D];
      switch (indexOfMaximumValue) {
        case 0 : {
          boundingVertices = [v1, v2];
          break;
        }
        case 1 : {
          boundingVertices = [v0, v2];
          break;
        }
        case 2 : {
          boundingVertices = [v0, v1];
          break;
        }
        default : {
          throw "This state should be impossible.";
        }
      }
      let center = Vector2D.scaleUp(Vector2D.add(boundingVertices[0], boundingVertices[1]), 0.5);
      return {
        center,
        radius
      };
    } else {
      return this.getBoundingCircleGivenVectorsAreNotColinear(v0, v1, v2);
    }
  }
}