import React, { RefObject } from "react";
import { RnaComplex } from "./RnaComplex";
import { RnaMolecule } from "./RnaMolecule";

export type Props = {
  rnaMolecule : RnaMolecule.Component,
  initialContiguousBasePairs : Array<ContiguousBasePairs.Props>
};

export type State = {
  contiguousBasePairs : Array<ContiguousBasePairs>
};

type ContiguousBasePairs = {
  fivePrimeStart : number,
  threePrimeStart : number,
  length : number
}

export class BasePairsEditor extends React.Component<Props, State> {
  public constructor(props : Props) {
    super(props);
    this.state = {
      contiguousBasePairs : [...props.initialContiguousBasePairs]
    };
  }

  public override render() {
    return <>
      <b>Base-pairs Editor:</b>
      <table>
        <>
          <tr>
            <th>5' Nucleotide index</th>
            <th>3' Nucleotide index</th>
            <th>Length</th>
            <th>Modify</th>
            {/* <th>RNA Molecule #0</th>
            <th>RNA Molecule #1</th> */}
          </tr>
          {this.state.contiguousBasePairs}
        </>
      </table>
    </>;
  }
}

export namespace ContiguousBasePairs {
  export type Props = {
    fivePrimeStart : number,
    threePrimeStart : number,
    length : number
  };

  export type State = {
    fivePrimeStart : number,
    threePrimeStart : number,
    length : number
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = {
        fivePrimeStart : props.fivePrimeStart,
        threePrimeStart : props.threePrimeStart,
        length : props.length
      };
    }

    public override render() {
      return <tr>
        <td>
          <input
            type = "number"
            value = {this.state.fivePrimeStart}
            onChange = {e => {
              let newFivePrimeStart = Number.parseInt(e.target.value);
              if (Number.isNaN(newFivePrimeStart)) {
                return;
              }
              this.setState({
                fivePrimeStart : newFivePrimeStart
              });
            }}
          />
        </td>
        <td>
          <input
            type = "number"
            value = {this.state.threePrimeStart}
            onChange = {e => {
              let newThreePrimeStart = Number.parseInt(e.target.value);
              if (Number.isNaN(newThreePrimeStart)) {
                return;
              }
              this.setState({
                threePrimeStart : newThreePrimeStart
              });
            }}
          />
        </td>
        <td>
          <input
            type = "number"
            value = {this.state.length}
            onChange = {e => {
              let newLength = Number.parseInt(e.target.value);
              if (Number.isNaN(newLength)) {
                return;
              }
              this.setState({
                length : newLength
              })
            }}
          />
        </td>
        <td>
          {/* <button
            onClick = {

            }
          /> */}
        </td>
      </tr>
    }
  }
}