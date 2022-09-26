import React from "react";
import { DEFAULT_BACKGROUND_COLOR_CSS_STRING } from "../App";
import Color, { ColorFormat, DEFAULT_ALPHA, toNumber, toHexadecimal, fromNumber } from "../data_structures/Color";

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
                    backgroundColor : DEFAULT_BACKGROUND_COLOR_CSS_STRING
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