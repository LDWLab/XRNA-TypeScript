import React from "react";
import { RnaMolecule } from "./RnaMolecule";

export namespace RnaComplex {
  export type Props = {
    name : string,
    rnaMoleculeProps : Array<RnaMolecule.Props>
  };

  export type State = {
    name : string,
    rnaMoleculesJsx : React.ReactNode,
    rnaMoleculeReferences : Array<React.RefObject<RnaMolecule.Component>>
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      let rnaMoleculesJsx : Array<JSX.Element> = [];
      let rnaMoleculeReferences : Array<React.RefObject<RnaMolecule.Component>> = [];
      props.rnaMoleculeProps.forEach((rnaMoleculeProps : RnaMolecule.Props, rnaMoleculeIndex : number) => {
        let reference = React.createRef<RnaMolecule.Component>();
        rnaMoleculeReferences.push(reference);
        rnaMoleculesJsx.push(<RnaMolecule.Component
          key = {rnaMoleculeIndex}
          ref = {reference}
          {...rnaMoleculeProps}
        />);
      });
      this.state = {
        name : props.name,
        rnaMoleculesJsx,
        rnaMoleculeReferences
      };
    }

    public override render() {
      return <g
        transform = "translate(10 10)"
      >
        {this.state.rnaMoleculesJsx}
      </g>
    }
  }
}