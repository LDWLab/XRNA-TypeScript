import React from "react";
import { withResizeDetector } from "react-resize-detector";

namespace Div {
  type Props = {
    style? : React.CSSProperties,
    innerRef? : React.Ref<HTMLDivElement>,
    children : React.ReactNode,
    onResize : (width : number, height : number) => void,
    onKeyDown? : React.KeyboardEventHandler,
    onMouseDown? : React.MouseEventHandler,
    onMouseMove? : React.MouseEventHandler,
    onMouseUp? : React.MouseEventHandler,
    onContextMenu? : React.MouseEventHandler,
    tabIndex? : number,
    width : number,
    height : number
  };

  export class Component extends React.Component<Props> {
    public constructor(props : Props) {
      super(props);
    }

    public override render() {
      return <div
        style = {this.props.style}
        ref = {this.props.innerRef}
        onKeyDown = {this.props.onKeyDown}
        onMouseDown = {this.props.onMouseDown}
        onMouseMove = {this.props.onMouseMove}
        onMouseUp = {this.props.onMouseUp}
        onContextMenu = {this.props.onContextMenu}
        tabIndex = {this.props.tabIndex}
      >
        {this.props.children}
      </div>
    }

    public override componentDidMount() {
      this.props.onResize(this.props.width, this.props.height);
    }

    public override componentDidUpdate(prevProps : Props) {
      if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
        this.props.onResize(this.props.width, this.props.height);
      }
    }
  }
}

export const DivWithResizeDetector = withResizeDetector(Div.Component);