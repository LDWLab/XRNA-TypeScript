import React from "react";
import { App, FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT } from "../App";
import { Utils } from "../utils/Utils";

export namespace AngleEditor {
  export type Props = {
    app : App.Component,
    angle : number,
    updateParentAngleHelper : (angle : number) => void
  };

  export type State = {
    app : App.Component,
    angleAsString : string
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      let angleForString = props.angle;
      if (props.app.state.useDegreesFlag) {
        angleForString = Utils.radiansToDegrees(angleForString);
      }
      this.state = {
        app : props.app,
        angleAsString : angleForString.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
      };
    }

    public override render() {
      return <>
        <label>
          θ:&nbsp;
          <input
            type = "number"
            // 1 degree === 0.01745329251 radians
            step = {this.state.app.state.useDegreesFlag ? 1 : 0.01745329251}
            value = {this.state.angleAsString}
            onChange = {event => {
              this.setState({
                angleAsString : event.target.value
              });
              let newAngle = Number.parseFloat(event.target.value);
              if (Number.isNaN(newAngle)) {
                return;
              }
              if (this.state.app.state.useDegreesFlag) {
                newAngle = Utils.degreesToRadians(newAngle);
              }
              this.props.updateParentAngleHelper(newAngle);
            }}
          />
        </label>
      </>;
    }

    public update(angleInRadians : number) : void {
      if (this.props.app.state.useDegreesFlag) {
        angleInRadians = Utils.radiansToDegrees(angleInRadians);
      }
      this.setState({
        angleAsString : angleInRadians.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
      })
    }
  }
}