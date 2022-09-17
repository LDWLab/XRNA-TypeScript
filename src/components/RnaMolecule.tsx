import React, { createRef, RefObject } from "react";
import { App } from "../App";
import Vector2D from "../data_structures/Vector2D";
import { Utils } from "../utils/Utils";
import { Nucleotide } from "./Nucleotide";

export namespace RnaMolecule {
  type Props = {
    name : string,
    rnaComplexIndex : number,
    nucleotidesIndexMap : Array<ArrayEntry>,
    firstNucleotideIndex : number
  };

  type State = {
    name : string,
    firstNucleotideIndex : number
  };

  export type ArrayEntry = {
    nucleotideIndex : number,
    nucleotideProps : Nucleotide.Props,
    nucleotideReference : RefObject<Nucleotide.Component>
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = {
        name : props.name,
        firstNucleotideIndex : props.firstNucleotideIndex
      };
    }

    public override render() : JSX.Element {
      return <g>
        {this.props.nucleotidesIndexMap.map((arrayEntry : ArrayEntry, arrayIndex : number) => {
          return <Nucleotide.Component
            key = {arrayIndex}
            ref = {arrayEntry.nucleotideReference}
            {...arrayEntry.nucleotideProps}
          />;
        })}
      </g>;
    }

    public getBasePairCircleRadius() : number {
      let rnaComplex = App.Component.getCurrent().state.rnaComplexes[this.props.rnaComplexIndex];
      let countBonds = 0;
      let totalBondLengthSum = 0;
      this.props.nucleotidesIndexMap.forEach((arrayEntry : ArrayEntry) => {
        let nucleotideReference = arrayEntry.nucleotideReference.current;
        let basePair : Nucleotide.BasePair | undefined;
        if (nucleotideReference === null) {
          basePair = arrayEntry.nucleotideProps.basePair;
        } else {
          basePair = nucleotideReference.state.basePair;
          if (basePair !== undefined && nucleotideReference.isGreaterIndexInBasePair()) {
            let basePairNucleotide = rnaComplex.props.rnaMolecules[basePair.rnaMoleculeIndex].findNucleotideByIndex(basePair.nucleotideIndex).arrayEntry.nucleotideReference.current as Nucleotide.Component;
            countBonds++;
            totalBondLengthSum += Vector2D.distance(nucleotideReference.state.position, basePairNucleotide.state.position);
          }
        }
      });
      return totalBondLengthSum / (countBonds * 6);
    }

    public insert(nucleotideIndex : number, props : Nucleotide.Props) : void {
      let i = this.props.nucleotidesIndexMap.length;
      for (; i > 0 && this.props.nucleotidesIndexMap[i - 1].nucleotideIndex > nucleotideIndex; i--) {
        // Do nothing.
      }
      this.props.nucleotidesIndexMap.splice(i, 0, {
        nucleotideIndex,
        nucleotideProps : props,
        nucleotideReference : createRef<Nucleotide.Component>()
      });
    }
    
    public findNucleotideByIndex(nucleotideIndex : number) : { arrayEntry : ArrayEntry, arrayIndex : number } {
      let foundByNucleotideIndex = Utils.binarySearch(this.props.nucleotidesIndexMap, (arrayEntry : ArrayEntry) => arrayEntry.nucleotideIndex - nucleotideIndex);
      if (foundByNucleotideIndex === null) {
        throw `Nucleotide index ${nucleotideIndex} was not found within RnaMolecule ${this.state.name}.`;
      }
      return foundByNucleotideIndex;
    }
  }
}