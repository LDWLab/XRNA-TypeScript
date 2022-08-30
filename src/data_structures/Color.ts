class Color {
  public red : number;
  public green : number;
  public blue : number;
  public alpha : number | null;

  public static readonly BLACK : Color = new Color(0, 0, 0);

  public constructor(red : number, green : number, blue : number, alpha : number | null = null) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  public equals(other : Color) : boolean {
    return this.red === other.red && this.green === other.green && this.blue === other.blue && this.alpha === other.alpha;
  }

  public toCSS() : string {
    let cssRgb = `${this.red}, ${this.green}, ${this.blue}`;
    return this.alpha == null || Number.isNaN(this.alpha) ? `rgb(${cssRgb})` : `rgba(${cssRgb}, ${this.alpha})`;
  }

  public static fromHexadecimal(hexadecimal : string, format : "argb" | "rgba" | "rgb") : Color {
    hexadecimal = hexadecimal.toLocaleLowerCase();
    if (!/^[a-f\d]+$/.test(hexadecimal)) {
      throw "The input hexadecimal string did not match the expected format: " + hexadecimal;
    }
    let parsedHexadecimal = Number.parseInt(hexadecimal, 16);
    let alpha = 255;
    // 16 = 2^4
    // Two hex digits occupy 8 bits.
    switch (format) {
      case "argb":
        alpha = parsedHexadecimal >>> 24;
        break;
      case "rgba":
        alpha = parsedHexadecimal & 255;
        parsedHexadecimal >>>= 8;
        break;
    }
    return new Color((parsedHexadecimal >>> 16) & 255, (parsedHexadecimal >>> 8) & 255, parsedHexadecimal & 255, alpha);
  }

  public static fromCssString(cssString : string) : Color {
    let rgbMatch = /^rgb\((\d{1,3})(?:\s*,\s*|\s+)(\d{1,3})(?:\s*,\s*|\s+)(\d{1,3})\)$/.exec(cssString)
    if (rgbMatch !== null) {
      return new Color(
        Number.parseInt(rgbMatch[1]),
        Number.parseInt(rgbMatch[2]),
        Number.parseInt(rgbMatch[3])
      );
    }
    switch (cssString) {
      case "black" : {
        return new Color(0, 0, 0);
      }
      case "silver" : {
        return new Color(192, 192, 192);
      }
      case "gray" : {
        return new Color(128, 128, 128);
      }
      case "white" : {
        return new Color(255, 255, 255);
      }
      case "maroon" : {
        return new Color(128, 0, 0);
      }
      case "red" : {
        return new Color(255, 0, 0);
      }
      case "purple" : {
        return new Color(128, 0, 128);
      }
      case "fuchsia" : {
        return new Color(255, 0, 255);
      }
      case "green" : {
        return new Color(0, 128, 0);
      }
      case "lime" : {
        return new Color(0, 255, 0);
      }
      case "olive" : {
        return new Color(128, 128, 0);
      }
      case "yellow" : {
        return new Color(255, 255, 0);
      }
      case "navy" : {
        return new Color(0, 0, 128);
      }
      case "blue" : {
        return new Color(0, 0, 255);
      }
      case "teal" : {
        return new Color(0, 128, 128);
      }
      case "aqua" : {
        return new Color(0, 255, 255);
      }
      case "aliceblue" : {
        return new Color(240, 248, 255);
      }
      case "antiquewhite" : {
        return new Color(250, 235, 215);
      }
      case "aquamarine" : {
        return new Color(127, 255, 212);
      }
      case "azure" : {
        return new Color(240, 255, 255);
      }
      case "beige" : {
        return new Color(245, 245, 220);
      }
      case "bisque" : {
        return new Color(255, 228, 196);
      }
      case "blanchedalmond" : {
        return new Color(255, 235, 205);
      }
      case "blueviolet" : {
        return new Color(138, 43, 226);
      }
      case "brown" : {
        return new Color(165, 42, 42);
      }
      case "burlywood" : {
        return new Color(222, 184, 135);
      }
      case "cadetblue" : {
        return new Color(95, 158, 160);
      }
      case "chartreuse" : {
        return new Color(127, 255, 0);
      }
      case "chocolate" : {
        return new Color(210, 105, 30);
      }
      case "coral" : {
        return new Color(255, 127, 80);
      }
      case "cornflowerblue" : {
        return new Color(100, 149, 237);
      }
      case "cornsilk" : {
        return new Color(255, 248, 220);
      }
      case "crimson" : {
        return new Color(220, 20, 60);
      }
      case "cyan" : {
        return new Color(0, 255, 255);
      }
      case "darkblue" : {
        return new Color(0, 0, 139);
      }
      case "darkcyan" : {
        return new Color(0, 139, 139);
      }
      case "darkgoldenrod" : {
        return new Color(184, 134, 11);
      }
      case "darkgreen" : {
        return new Color(0, 100, 0);
      }
      case "darkkhaki" : {
        return new Color(189, 183, 107);
      }
      case "darkmagenta" : {
        return new Color(139, 0, 139);
      }
      case "darkolivegreen" : {
        return new Color(85, 107, 47);
      }
      case "darkorange" : {
        return new Color(255, 140, 0);
      }
      case "darkorchid" : {
        return new Color(139, 0, 0);
      }
      case "darksalmon" : {
        return new Color(233, 150, 122);
      }
      case "darkseagreen" : {
        return new Color(143, 188, 143);
      }
      case "darkslateblue" : {
        return new Color(72, 61, 139);
      }
      case "darkslategray" : {
        return new Color(47, 79, 79);
      }
      case "darkturqoise" : {
        return new Color(0, 206, 209);
      }
      case "darkviolet" : {
        return new Color(148, 0, 211);
      }
      case "deeppink" : {
        return new Color(255, 20, 147);
      }
      case "deepskyblue" : {
        return new Color(0, 191, 255);
      }
      case "dimgray" : {
        return new Color(105, 105, 105);
      }
      case "dodgerblue" : {
        return new Color(30, 144, 255);
      }
      case "firebrick" : {
        return new Color(178, 34, 34);
      }
      case "floralwhite" : {
        return new Color(255, 250, 240);
      }
      case "forestgreen" : {
        return new Color(34, 139, 34);
      }
      case "gainsboro" : {
        return new Color(220, 220, 220);
      }
      case "ghostwhite" : {
        return new Color(248, 248, 255);
      }
      case "gold" : {
        return new Color(255, 215, 0);
      }
      case "goldenrod" : {
        return new Color(218, 165, 32);
      }
      case "greenyellow" : {
        return new Color(173, 255, 47);
      }
      case "honeydew" : {
        return new Color(240, 255, 240);
      }
      case "hotpink" : {
        return new Color(255, 105, 180);
      }
      case "indianred" : {
        return new Color(205, 92, 92);
      }
      case "indigo" : {
        return new Color(75, 0, 130);
      }
      case "ivory" : {
        return new Color(255, 255, 240);
      }
      case "khaki" : {
        return new Color(240, 230, 140);
      }
      case "lavender" : {
        return new Color(230, 230, 250);
      }
      case "lavenderblush" : {
        return new Color(255, 240, 245);
      }
      case "lawngreen" : {
        return new Color(124, 252, 0);
      }
      case "lemonchiffon" : {
        return new Color(255, 250, 205);
      }
      case "lightblue" : {
        return new Color(173, 216, 230);
      }
      case "lightcoral" : {
        return new Color(240, 128, 128);
      }
      case "lightcyan" : {
        return new Color(224, 255, 255);
      }
      case "lightgoldenrodyellow" : {
        return new Color(250, 250, 210);
      }
      case "lightgray" : {
        return new Color(211, 211, 211);
      }
      case "lightgreen" : {
        return new Color(148, 238, 144);
      }
      case "lightgrey" : {
        return new Color(211, 211, 211);
      }
      case "lightpink" : {
        return new Color(255, 182, 193);
      }
      case "lightsalmon" : {
        return new Color(255, 160, 122);
      }
      case "lightseagreen" : {
        return new Color(32, 178,170);
      }
      case "lightskyblue" : {
        return new Color(135, 206, 250);
      }
      case "lightslategray" : {
        return new Color(119, 136, 153);
      }
      case "lightslategrey" : {
        return new Color(119, 136, 153);
      }
      case "lightsleetblue" : {
        return new Color(176, 196, 222);
      }
      case "lightyellow" : {
        return new Color(255, 255, 224);
      }
      case "lime" : {
        return new Color(0, 255, 0);
      }
      case "limegreen" : {
        return new Color(50, 205, 50);
      }
      case "linen" : {
        return new Color(250, 240, 230);
      }
      case "magenta" : {
        return new Color(255, 0, 255);
      }
      case "maroon" : {
        return new Color(128, 0, 0);
      }
      case "mediumaquamarine" : {
        return new Color(102, 205, 170);
      }
      case "mediumblue" : {
        return new Color(0, 0, 205);
      }
      case "mediumorchid" : {
        return new Color(186, 85, 211);
      }
      case "mediumpruple" : {
        return new Color(147, 112, 219);
      }
      case "mediumseagreen" : {
        return new Color(60, 179, 113);
      }
      case "mediumslateblue" : {
        return new Color(123, 104, 238);
      }
      case "mediumspringgreen" : {
        return new Color(0, 250, 154);
      }
      case "mediumturquiose" : {
        return new Color(72, 209, 204);
      }
      case "mediumvioletred" : {
        return new Color(199, 21, 133);
      }
      case "midnightblue" : {
        return new Color(25, 25, 112);
      }
      case "mintcream" : {
        return new Color(245, 255, 250);
      }
      case "mistyrose" : {
        return new Color(255, 228, 225);
      }
      case "moccasin" : {
        return new Color(255, 228, 181);
      }
      case "navajowhite" : {
        return new Color(255, 222, 173);
      }
      case "navy" : {
        return new Color(0, 0, 128);
      }
      case "oldlace" : {
        return new Color(253, 245, 230);
      }
      case "olive" : {
        return new Color(128, 128, 0);
      }
      case "olivedrab" : {
        return new Color(107, 142, 35);
      }
      case "orange" : {
        return new Color(255, 165, 0);
      }
      case "orangered" : {
        return new Color(255, 69, 0);
      }
      case "orchid" : {
        return new Color(218, 112, 214);
      }
      case "palegoldenrod" : {
        return new Color(238, 232, 170);
      }
      case "palegreen" : {
        return new Color(152, 251, 152);
      }
      case "paleturquoise" : {
        return new Color(175, 238, 238);
      }
      case "palevioletred" : {
        return new Color(219, 112, 147);
      }
      case "papayawhip" : {
        return new Color(255, 239, 213);
      }
      case "peachpuff" : {
        return new Color(255, 218, 185);
      }
      case "peru" : {
        return new Color(205, 133, 63);
      }
      case "pink" : {
        return new Color(255, 192, 203);
      }
      case "plum" : {
        return new Color(221, 160, 221);
      }
      case "powderblue" : {
        return new Color(176, 224, 230);
      }
      case "pruple" : {
        return new Color(128, 0, 128);
      }
      case "red" : {
        return new Color(255, 0, 0);
      }
      case "rosybrown" : {
        return new Color(188, 143, 143);
      }
      case "royalblue" : {
        return new Color(65, 105, 225);
      }
      case "saddlebrown" : {
        return new Color(139, 69, 19);
      }
      case "salmon" : {
        return new Color(250, 128, 114);
      }
      case "sandybrown" : {
        return new Color(244, 264, 96);
      }
      case "seagreen" : {
        return new Color(46, 139, 87);
      }
      case "seashell" : {
        return new Color(255, 245, 238);
      }
      case "sienna" : {
        return new Color(160, 82, 45);
      }
      case "silver" : {
        return new Color(192, 192, 192);
      }
      case "skyblue" : {
        return new Color(135, 206, 235);
      }
      case "slateblue" : {
        return new Color(106, 80, 205);
      }
      case "slategray" : {
        return new Color(112, 128, 144);
      }
      case "slategrey" : {
        return new Color(112, 128, 144);
      }
      case "snow" : {
        return new Color(255, 250, 250);
      }
      case "springgreen" : {
        return new Color(0, 255, 127);
      }
      case "steelblue" : {
        return new Color(70, 130, 180);
      }
      case "tan" : {
        return new Color(210, 180, 140);
      }
      case "teal" : {
        return new Color(0, 128, 128);
      }
      case "thistle" : {
        return new Color(216, 191, 216);
      }
      case "tomato" : {
        return new Color(255, 99, 71);
      }
      case "turquoise" : {
        return new Color(64, 224, 208);
      }
      case "violet" : {
        return new Color(238, 130, 238);
      }
      case "wheat" : {
        return new Color(245, 222, 179);
      }
      case "white" : {
        return new Color(255, 255, 255);
      }
      case "yellow" : {
        return new Color(255, 255, 0);
      }
      case "yellowgreen" : {
        return new Color(154, 205, 50);
      }
      default : {
        throw `Unsupported color literal: ${cssString}`
      }
    }
  }
}

export default Color;