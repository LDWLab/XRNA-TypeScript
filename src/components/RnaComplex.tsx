import React from "react";
import { RnaMolecule } from "./RnaMolecule";

export namespace RnaComplex {
  type Props = {
    name : string,
    rnaMolecules : Array<RnaMolecule.Component>
  };

  type State = {
    // No properties.
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = {
        // No properties.
      };
    }

    public override render() : JSX.Element {
      return <g
        key = {this.props.name}
      >
        {this.props.rnaMolecules.map((rnaMolecule : RnaMolecule.Component, rnaMoleculeIndex : number) => <RnaMolecule.Component
          key = {rnaMoleculeIndex}
          {...Object.assign(rnaMolecule.props, rnaMolecule.state)}
        />)}
      </g>
    }
  }
}