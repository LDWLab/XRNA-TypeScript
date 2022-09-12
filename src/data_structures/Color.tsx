import React from "react";
import { CHARCOAL_GRAY_CSS, FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT } from "../App";

export enum ColorFormat {
  RGB = "RGB",
  RGBA = "RGBA",
  ARGB = "ARGB",
  BGR = "BGR",
  BGRA = "BGRA",
  ABGR = "ABGR"
}

export type ByteIndex = 0 | 1 | 2 | 3;

export type ByteMap = { red : ByteIndex, green : ByteIndex, blue : ByteIndex, alpha? : ByteIndex | undefined };

export const byteMaps : Record<ColorFormat, ByteMap> = {
  [ColorFormat.RGB] : {
    red : 2,
    green : 1,
    blue : 0
  },
  [ColorFormat.RGBA] : {
    red : 3,
    green : 2,
    blue : 1,
    alpha : 0
  },
  [ColorFormat.ARGB] : {
    red : 2,
    green : 1,
    blue : 0,
    alpha : 3
  },
  [ColorFormat.BGR] : {
    red : 0,
    green : 1,
    blue : 2
  },
  [ColorFormat.BGRA] : {
    red : 1,
    green : 2,
    blue : 3,
    alpha : 0
  },
  [ColorFormat.ABGR] : {
    red : 0,
    green : 1,
    blue : 2,
    alpha : 3
  }
}

export type Color = {
  red : number;
  green : number;
  blue : number;
  alpha? : number | undefined;
};

export const DEFAULT_ALPHA = 255;
export const DEFAULT_COLOR_FORMAT = ColorFormat.RGB;
export const BLACK : Color = {
  red : 0,
  green : 0,
  blue : 0,
  alpha : DEFAULT_ALPHA
};

export function toCSS(color : Color) : string {
  let cssRgb = `${color.red}, ${color.green}, ${color.blue}`;
  return color.alpha == null || Number.isNaN(color.alpha) ? `rgb(${cssRgb})` : `rgba(${cssRgb}, ${color.alpha})`;
}

export function fromHexadecimal(hexadecimal : string, colorFormat : ColorFormat) : Color {
  return fromNumber(Number.parseInt(hexadecimal, 16), colorFormat);
}

export function fromNumber(_number : number, colorFormat : ColorFormat) : Color {
  let splitBits = {
    // Right-most 8 bits
    0 : _number & 255,
    1 : (_number >>> 8) & 255,
    2 : (_number >>> 16) & 255,
    // Left-most 8 bits.
    3 : (_number >>> 24) & 255
  };
  let byteMap = byteMaps[colorFormat];
  let fromHexadecimal = {
    red : splitBits[byteMap.red],
    green : splitBits[byteMap.green],
    blue : splitBits[byteMap.blue]
  };
  if (byteMap.alpha !== undefined) {
    fromHexadecimal = Object.assign(fromHexadecimal, {
      alpha : splitBits[byteMap.alpha]
    });
  }
  return fromHexadecimal;
}

export function toNumber(color : Color, colorFormat : ColorFormat) : number {
  let byteMap = byteMaps[colorFormat];
  let toNumber = byteMap.alpha === undefined || color.alpha === undefined ? 0 : (color.alpha << (byteMap.alpha * 8));
  return (
    (color.red << (byteMap.red * 8)) |
    (color.green << (byteMap.green * 8)) |
    (color.blue << (byteMap.blue * 8)) |
    toNumber
  );
}

export function toHexadecimal(color : Color, colorFormat : ColorFormat) : string {
  return toNumber(color, colorFormat).toString(16).toUpperCase();
}

export function fromCssString(cssString : string) : Color {
  let rgbMatch = /^rgb\((\d{1,3})(?:\s*,\s*|\s+)(\d{1,3})(?:\s*,\s*|\s+)(\d{1,3})\)$/.exec(cssString)
  if (rgbMatch !== null) {
    return {
      red : Number.parseInt(rgbMatch[1]),
      green : Number.parseInt(rgbMatch[2]),
      blue : Number.parseInt(rgbMatch[3])
    };
  }
  switch (cssString) {
    case "black" : {
      return {
        red : 0,
        green : 0,
        blue : 0
      };
    }
    case "silver" : {
      return {
        red : 192,
        green : 192,
        blue : 192
      };
    }
    case "gray" : {
      return {
        red : 128,
        green : 128,
        blue : 128
      };
    }
    case "white" : {
      return {
        red : 255,
        green : 255,
        blue : 255
      };
    }
    case "maroon" : {
      return {
        red : 128,
        green : 0,
        blue : 0
      };
    }
    case "red" : {
      return {
        red : 255,
        green : 0,
        blue : 0
      };
    }
    case "purple" : {
      return {
        red : 128,
        green : 0,
        blue : 128
      };
    }
    case "fuchsia" : {
      return {
        red : 255,
        green : 0,
        blue : 255
      };
    }
    case "green" : {
      return {
        red : 0,
        green : 128,
        blue : 0
      };
    }
    case "lime" : {
      return {
        red : 0,
        green : 255,
        blue : 0
      };
    }
    case "olive" : {
      return {
        red : 128,
        green : 128,
        blue : 0
      };
    }
    case "yellow" : {
      return {
        red : 255,
        green : 255,
        blue : 0
      };
    }
    case "navy" : {
      return {
        red : 0,
        green : 0,
        blue : 128
      };
    }
    case "blue" : {
      return {
        red : 0,
        green : 0,
        blue : 255
      };
    }
    case "teal" : {
      return {
        red : 0,
        green : 128,
        blue : 128
      };
    }
    case "aqua" : {
      return {
        red : 0,
        green : 255,
        blue : 255
      };
    }
    case "aliceblue" : {
      return {
        red : 240,
        green : 248,
        blue : 255
      };
    }
    case "antiquewhite" : {
      return {
        red : 250,
        green : 235,
        blue : 215
      };
    }
    case "aquamarine" : {
      return {
        red : 127,
        green : 255,
        blue : 212
      };
    }
    case "azure" : {
      return {
        red : 240,
        green : 255,
        blue : 255
      };
    }
    case "beige" : {
      return {
        red : 245,
        green : 245,
        blue : 220
      };
    }
    case "bisque" : {
      return {
        red : 255,
        green : 228,
        blue : 196
      };
    }
    case "blanchedalmond" : {
      return {
        red : 255,
        green : 235,
        blue : 205
      };
    }
    case "blueviolet" : {
      return {
        red : 138,
        green : 43,
        blue : 226
      };
    }
    case "brown" : {
      return {
        red : 165,
        green : 42,
        blue : 42
      };
    }
    case "burlywood" : {
      return {
        red : 222,
        green : 184,
        blue : 135
      };
    }
    case "cadetblue" : {
      return {
        red : 95,
        green : 158,
        blue : 160
      };
    }
    case "chartreuse" : {
      return {
        red : 127,
        green : 255,
        blue : 0
      };
    }
    case "chocolate" : {
      return {
        red : 210,
        green : 105,
        blue : 30
      };
    }
    case "coral" : {
      return {
        red : 255,
        green : 127,
        blue : 80
      };
    }
    case "cornflowerblue" : {
      return {
        red : 100,
        green : 149,
        blue : 237
      };
    }
    case "cornsilk" : {
      return {
        red : 255,
        green : 248,
        blue : 220
      };
    }
    case "crimson" : {
      return {
        red : 220,
        green : 20,
        blue : 60
      };
    }
    case "cyan" : {
      return {
        red : 0,
        green : 255,
        blue : 255
      };
    }
    case "darkblue" : {
      return {
        red : 0,
        green : 0,
        blue : 139
      };
    }
    case "darkcyan" : {
      return {
        red : 0,
        green : 139,
        blue : 139
      };
    }
    case "darkgoldenrod" : {
      return {
        red : 184,
        green : 134,
        blue : 11
      };
    }
    case "darkgreen" : {
      return {
        red : 0,
        green : 100,
        blue : 0
      };
    }
    case "darkkhaki" : {
      return {
        red : 189,
        green : 183,
        blue : 107
      };
    }
    case "darkmagenta" : {
      return {
        red : 139,
        green : 0,
        blue : 139
      };
    }
    case "darkolivegreen" : {
      return {
        red : 85,
        green : 107,
        blue : 47
      };
    }
    case "darkorange" : {
      return {
        red : 255,
        green : 140,
        blue : 0
      };
    }
    case "darkorchid" : {
      return {
        red : 139,
        green : 0,
        blue : 0
      };
    }
    case "darksalmon" : {
      return {
        red : 233,
        green : 150,
        blue : 122
      };
    }
    case "darkseagreen" : {
      return {
        red : 143,
        green : 188,
        blue : 143
      };
    }
    case "darkslateblue" : {
      return {
        red : 72,
        green : 61,
        blue : 139
      };
    }
    case "darkslategray" : {
      return {
        red : 47,
        green : 79,
        blue : 79
      };
    }
    case "darkturqoise" : {
      return {
        red : 0,
        green : 206,
        blue : 209
      };
    }
    case "darkviolet" : {
      return {
        red : 148,
        green : 0,
        blue : 211
      };
    }
    case "deeppink" : {
      return {
        red : 255,
        green : 20,
        blue : 147
      };
    }
    case "deepskyblue" : {
      return {
        red : 0,
        green : 191,
        blue : 255
      };
    }
    case "dimgray" : {
      return {
        red : 105,
        green : 105,
        blue : 105
      };
    }
    case "dodgerblue" : {
      return {
        red : 30,
        green : 144,
        blue : 255
      };
    }
    case "firebrick" : {
      return {
        red : 178,
        green : 34,
        blue : 34
      };
    }
    case "floralwhite" : {
      return {
        red : 255,
        green : 250,
        blue : 240
      };
    }
    case "forestgreen" : {
      return {
        red : 34,
        green : 139,
        blue : 34
      };
    }
    case "gainsboro" : {
      return {
        red : 220,
        green : 220,
        blue : 220
      };
    }
    case "ghostwhite" : {
      return {
        red : 248,
        green : 248,
        blue : 255
      };
    }
    case "gold" : {
      return {
        red : 255,
        green : 215,
        blue : 0
      };
    }
    case "goldenrod" : {
      return {
        red : 218,
        green : 165,
        blue : 32
      };
    }
    case "greenyellow" : {
      return {
        red : 173,
        green : 255,
        blue : 47
      };
    }
    case "honeydew" : {
      return {
        red : 240,
        green : 255,
        blue : 240
      };
    }
    case "hotpink" : {
      return {
        red : 255,
        green : 105,
        blue : 180
      };
    }
    case "indianred" : {
      return {
        red : 205,
        green : 92,
        blue : 92
      };
    }
    case "indigo" : {
      return {
        red : 75,
        green : 0,
        blue : 130
      };
    }
    case "ivory" : {
      return {
        red : 255,
        green : 255,
        blue : 240
      };
    }
    case "khaki" : {
      return {
        red : 240,
        green : 230,
        blue : 140
      };
    }
    case "lavender" : {
      return {
        red : 230,
        green : 230,
        blue : 250
      };
    }
    case "lavenderblush" : {
      return {
        red : 255,
        green : 240,
        blue : 245
      };
    }
    case "lawngreen" : {
      return {
        red : 124,
        green : 252,
        blue : 0
      };
    }
    case "lemonchiffon" : {
      return {
        red : 255,
        green : 250,
        blue : 205
      };
    }
    case "lightblue" : {
      return {
        red : 173,
        green : 216,
        blue : 230
      };
    }
    case "lightcoral" : {
      return {
        red : 240,
        green : 128,
        blue : 128
      };
    }
    case "lightcyan" : {
      return {
        red : 224,
        green : 255,
        blue : 255
      };
    }
    case "lightgoldenrodyellow" : {
      return {
        red : 250,
        green : 250,
        blue : 210
      };
    }
    case "lightgray" : {
      return {
        red : 211,
        green : 211,
        blue : 211
      };
    }
    case "lightgreen" : {
      return {
        red : 148,
        green : 238,
        blue : 144
      };
    }
    case "lightgrey" : {
      return {
        red : 211,
        green : 211,
        blue : 211
      };
    }
    case "lightpink" : {
      return {
        red : 255,
        green : 182,
        blue : 193
      };
    }
    case "lightsalmon" : {
      return {
        red : 255,
        green : 160,
        blue : 122
      };
    }
    case "lightseagreen" : {
      return {
        red : 32,
        green : 178,
        blue : 170
      };
    }
    case "lightskyblue" : {
      return {
        red : 135,
        green : 206,
        blue : 250
      };
    }
    case "lightslategray" : {
      return {
        red : 119,
        green : 136,
        blue : 153
      };
    }
    case "lightslategrey" : {
      return {
        red : 119,
        green : 136,
        blue : 153
      };
    }
    case "lightsleetblue" : {
      return {
        red : 176,
        green : 196,
        blue : 222
      };
    }
    case "lightyellow" : {
      return {
        red : 255,
        green : 255,
        blue : 224
      };
    }
    case "lime" : {
      return {
        red : 0,
        green : 255,
        blue : 0
      };
    }
    case "limegreen" : {
      return {
        red : 50,
        green : 205,
        blue : 50
      };
    }
    case "linen" : {
      return {
        red : 250,
        green : 240,
        blue : 230
      };
    }
    case "magenta" : {
      return {
        red : 255,
        green : 0,
        blue : 255
      };
    }
    case "maroon" : {
      return {
        red : 128,
        green : 0,
        blue : 0
      };
    }
    case "mediumaquamarine" : {
      return {
        red : 102,
        green : 205,
        blue : 170
      };
    }
    case "mediumblue" : {
      return {
        red : 0,
        green : 0,
        blue : 205
      };
    }
    case "mediumorchid" : {
      return {
        red : 186,
        green : 85,
        blue : 211
      };
    }
    case "mediumpruple" : {
      return {
        red : 147,
        green : 112,
        blue : 219
      };
    }
    case "mediumseagreen" : {
      return {
        red : 60,
        green : 179,
        blue : 113
      };
    }
    case "mediumslateblue" : {
      return {
        red : 123,
        green : 104,
        blue : 238
      };
    }
    case "mediumspringgreen" : {
      return {
        red : 0,
        green : 250,
        blue : 154
      };
    }
    case "mediumturquiose" : {
      return {
        red : 72,
        green : 209,
        blue : 204
      };
    }
    case "mediumvioletred" : {
      return {
        red : 199,
        green : 21,
        blue : 133
      };
    }
    case "midnightblue" : {
      return {
        red : 25,
        green : 25,
        blue : 112
      };
    }
    case "mintcream" : {
      return {
        red : 245,
        green : 255,
        blue : 250
      };
    }
    case "mistyrose" : {
      return {
        red : 255,
        green : 228,
        blue : 225
      };
    }
    case "moccasin" : {
      return {
        red : 255,
        green : 228,
        blue : 181
      };
    }
    case "navajowhite" : {
      return {
        red : 255,
        green : 222,
        blue : 173
      };
    }
    case "navy" : {
      return {
        red : 0,
        green : 0,
        blue : 128
      };
    }
    case "oldlace" : {
      return {
        red : 253,
        green : 245,
        blue : 230
      };
    }
    case "olive" : {
      return {
        red : 128,
        green : 128,
        blue : 0
      };
    }
    case "olivedrab" : {
      return {
        red : 107,
        green : 142,
        blue : 35
      };
    }
    case "orange" : {
      return {
        red : 255,
        green : 165,
        blue : 0
      };
    }
    case "orangered" : {
      return {
        red : 255,
        green : 69,
        blue : 0
      };
    }
    case "orchid" : {
      return {
        red : 218,
        green : 112,
        blue : 214
      };
    }
    case "palegoldenrod" : {
      return {
        red : 238,
        green : 232,
        blue : 170
      };
    }
    case "palegreen" : {
      return {
        red : 152,
        green : 251,
        blue : 152
      };
    }
    case "paleturquoise" : {
      return {
        red : 175,
        green : 238,
        blue : 238
      };
    }
    case "palevioletred" : {
      return {
        red : 219,
        green : 112,
        blue : 147
      };
    }
    case "papayawhip" : {
      return {
        red : 255,
        green : 239,
        blue : 213
      };
    }
    case "peachpuff" : {
      return {
        red : 255,
        green : 218,
        blue : 185
      };
    }
    case "peru" : {
      return {
        red : 205,
        green : 133,
        blue : 63
      };
    }
    case "pink" : {
      return {
        red : 255,
        green : 192,
        blue : 203
      };
    }
    case "plum" : {
      return {
        red : 221,
        green : 160,
        blue : 221
      };
    }
    case "powderblue" : {
      return {
        red : 176,
        green : 224,
        blue : 230
      };
    }
    case "pruple" : {
      return {
        red : 128,
        green : 0,
        blue : 128
      };
    }
    case "red" : {
      return {
        red : 255,
        green : 0,
        blue : 0
      };
    }
    case "rosybrown" : {
      return {
        red : 188,
        green : 143,
        blue : 143
      };
    }
    case "royalblue" : {
      return {
        red : 65,
        green : 105,
        blue : 225
      };
    }
    case "saddlebrown" : {
      return {
        red : 139,
        green : 69,
        blue : 19
      };
    }
    case "salmon" : {
      return {
        red : 250,
        green : 128,
        blue : 114
      };
    }
    case "sandybrown" : {
      return {
        red : 244,
        green : 264,
        blue : 96
      };
    }
    case "seagreen" : {
      return {
        red : 46,
        green : 139,
        blue : 87
      };
    }
    case "seashell" : {
      return {
        red : 255,
        green : 245,
        blue : 238
      };
    }
    case "sienna" : {
      return {
        red : 160,
        green : 82,
        blue : 45
      };
    }
    case "silver" : {
      return {
        red : 192,
        green : 192,
        blue : 192
      };
    }
    case "skyblue" : {
      return {
        red : 135,
        green : 206,
        blue : 235
      };
    }
    case "slateblue" : {
      return {
        red : 106,
        green : 80,
        blue : 205
      };
    }
    case "slategray" : {
      return {
        red : 112,
        green : 128,
        blue : 144
      };
    }
    case "slategrey" : {
      return {
        red : 112,
        green : 128,
        blue : 144
      };
    }
    case "snow" : {
      return {
        red : 255,
        green : 250,
        blue : 250
      };
    }
    case "springgreen" : {
      return {
        red : 0,
        green : 255,
        blue : 127
      };
    }
    case "steelblue" : {
      return {
        red : 70,
        green : 130,
        blue : 180
      };
    }
    case "tan" : {
      return {
        red : 210,
        green : 180,
        blue : 140
      };
    }
    case "teal" : {
      return {
        red : 0,
        green : 128,
        blue : 128
      };
    }
    case "thistle" : {
      return {
        red : 216,
        green : 191,
        blue : 216
      };
    }
    case "tomato" : {
      return {
        red : 255,
        green : 99,
        blue : 71
      };
    }
    case "turquoise" : {
      return {
        red : 64,
        green : 224,
        blue : 208
      };
    }
    case "violet" : {
      return {
        red : 238,
        green : 130,
        blue : 238
      };
    }
    case "wheat" : {
      return {
        red : 245,
        green : 222,
        blue : 179
      };
    }
    case "white" : {
      return {
        red : 255,
        green : 255,
        blue : 255
      };
    }
    case "yellow" : {
      return {
        red : 255,
        green : 255,
        blue : 0
      };
    }
    case "yellowgreen" : {
      return {
        red : 154,
        green : 205,
        blue : 50
      };
    }
    default : {
      throw `Unsupported color literal: ${cssString}`
    }
  }
}

export function areEqual(color0 : Color, color1 : Color) : boolean {
  return (
    color0.red === color1.red && 
    color0.green === color1.green && 
    color0.blue === color1.blue
  );
}

export namespace ColorEditor {
  type Props = {
    color : Color,
    updateParentColorHelper : (color : Color) => void,
    supportAlphaFlag : boolean,
    colorFormat : ColorFormat
  };

  type State = Color & {
    redAsString : string,
    greenAsString : string,
    blueAsString : string,
    alphaAsString : string,
    colorAsHexadecimalNumber : number,
    hexadecimalString : string,
    colorFormat : ColorFormat
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = Object.assign(props.color, {
        redAsString : props.color.red.toFixed(0),
        greenAsString : props.color.green.toFixed(0),
        blueAsString : props.color.blue.toFixed(0),
        alphaAsString : (props.color.alpha ?? DEFAULT_ALPHA).toFixed(0),
        colorAsHexadecimalNumber : toNumber(props.color, props.colorFormat),
        hexadecimalString : toHexadecimal(props.color, props.colorFormat),
        colorFormat : props.colorFormat
      });
    }

    public override render() {
      let alphaJsx = this.props.supportAlphaFlag ? <>
        <br/>
        <label>
          Alpha:&nbsp;
          <input
            type = "number"
            value = {this.state.alpha}
          />
        </label>
      </> : <></>;
      let onChangeHexadecimal = (colorFormat : ColorFormat, colorAsHexadecimalNumber : number) => {
        let newColor = fromNumber(colorAsHexadecimalNumber, colorFormat);
        this.setState({
          redAsString : newColor.red.toFixed(0),
          greenAsString : newColor.green.toFixed(0),
          blueAsString : newColor.blue.toFixed(0),
          alphaAsString : (newColor.alpha ?? DEFAULT_ALPHA).toFixed(0),
          red : newColor.red,
          green : newColor.green,
          blue : newColor.blue
        });
        this.props.updateParentColorHelper(newColor);
      };
      return <>
        <b>
          Color:
        </b>
        <br/>
        <label>
          Red:&nbsp;
          <input
            type = "number"
            value = {this.state.redAsString}
            onChange = {event => {
              this.setState({
                redAsString : event.target.value
              });
              let newRed = Math.min(Number.parseFloat(event.target.value), 255);
              if (Number.isNaN(newRed)) {
                return;
              }
              let newColor = {
                red : newRed,
                green : this.state.green,
                blue : this.state.blue
              };
              this.setState({
                red : newRed,
                colorAsHexadecimalNumber : toNumber(newColor, this.state.colorFormat),
                hexadecimalString : toHexadecimal(newColor, this.state.colorFormat)
              });
              this.props.updateParentColorHelper(newColor);
            }}
          />
        </label>
        <br/>
        <label>
          Green:&nbsp;
          <input
            type = "number"
            value = {this.state.greenAsString}
            onChange = {event => {
              this.setState({
                greenAsString : event.target.value
              });
              let newGreen = Math.min(Number.parseFloat(event.target.value), 255);
              if (Number.isNaN(newGreen)) {
                return;
              }
              let newColor = {
                red : this.state.red,
                green : newGreen,
                blue : this.state.blue
              };
              this.setState({
                green : newGreen,
                colorAsHexadecimalNumber : toNumber(newColor, this.state.colorFormat),
                hexadecimalString : toHexadecimal(newColor, this.state.colorFormat)
              });
              this.props.updateParentColorHelper(newColor);
            }}
          />
        </label>
        <br/>
        <label>
          Blue:&nbsp;
          <input
            type = "number"
            value = {this.state.blueAsString}
            onChange = {event => {
              this.setState({
                blueAsString : event.target.value
              });
              let newBlue = Math.min(Number.parseFloat(event.target.value), 255);
              if (Number.isNaN(newBlue)) {
                return;
              }
              let newColor = {
                red : this.state.red,
                green : this.state.green,
                blue : newBlue
              };
              this.setState({
                blue : newBlue,
                colorAsHexadecimalNumber : toNumber(newColor, this.state.colorFormat),
                hexadecimalString : toHexadecimal(newColor, this.state.colorFormat)
              });
              this.props.updateParentColorHelper(newColor);
            }}
          />
        </label>
        <br/>
        <b>
          Hexadecimal:
        </b>
        <br/>
        <label>
          Format:&nbsp;
          <select
            onChange = {event => {
              let newColorFormat = event.target.value as ColorFormat;
              let oldColorAsHexadecimalNumber = this.state.colorAsHexadecimalNumber;
              this.setState({
                colorFormat : newColorFormat,
                colorAsHexadecimalNumber : toNumber({
                  red : this.state.red,
                  green : this.state.green,
                  blue : this.state.blue
                }, newColorFormat)
              });
              onChangeHexadecimal(newColorFormat, oldColorAsHexadecimalNumber);
            }}
          >
            {Object.values(ColorFormat).map((colorFormat : ColorFormat, colorFormatIndex : number) => {
              return <option
                key = {colorFormatIndex}
                value = {colorFormat}
                style = {{
                  backgroundColor : CHARCOAL_GRAY_CSS
                }}
              >
                {colorFormat}
              </option>;
            })}
          </select>
        </label>
        <label>
          Value:&nbsp;
          <input
            type = "string"
            // Hexadecimal string pattern
            pattern = "[a-fA-F\d]+"
            value = {this.state.hexadecimalString}
            onChange = {event => {
              this.setState({
                hexadecimalString : event.target.value
              });
              let newColorAsHexadecimalNumber = Number.parseInt(event.target.value, 16);
              if (Number.isNaN(newColorAsHexadecimalNumber)) {
                return;
              }
              // 16777215 === 0xFFFFFF
              newColorAsHexadecimalNumber = Math.min(newColorAsHexadecimalNumber, 16777215);
              onChangeHexadecimal(this.state.colorFormat, newColorAsHexadecimalNumber);
            }}
          />
        </label>
        {alphaJsx}
      </>;
    }
  }
}

export default Color;