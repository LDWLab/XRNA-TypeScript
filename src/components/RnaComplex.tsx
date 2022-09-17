import React from "react";
import { RnaMolecule } from "./RnaMolecule";

export namespace RnaComplex {
  type Props = {
    name : string,
    rnaMolecules : Array<RnaMolecule.Component>
  };

  type State = {
    name : string
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = {
        name : props.name
      };
    }

    public override render() : JSX.Element {
      return <g
        key = {this.state.name}
      >
        {this.props.rnaMolecules.map((rnaMolecule : RnaMolecule.Component, rnaMoleculeIndex : number) => <RnaMolecule.Component
          key = {rnaMoleculeIndex}
          {...Object.assign(rnaMolecule.props, rnaMolecule.state)}
        />)}
      </g>
    }
  }
}