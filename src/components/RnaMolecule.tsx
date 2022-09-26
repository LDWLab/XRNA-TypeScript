import React from "react";
import { App } from "../App";
import Vector2D from "../data_structures/Vector2D";
import { Utils } from "../utils/Utils";
import { Nucleotide } from "./Nucleotide";

export namespace RnaMolecule {
  export type Props = {
    name : string,
    rnaComplexIndex : number,
    firstNucleotideIndex : number,
    nucleotideProps : Array<Nucleotide.Props>
  };

  export type State = {
    name : string,
    firstNucleotideIndex : number,
    nucleotidesJsx : React.ReactNode,
    nucleotideReferences : Array<React.RefObject<Nucleotide.Component>>
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      let nucleotidesJsx : Array<JSX.Element> = [];
      let nucleotideReferences : Array<React.RefObject<Nucleotide.Component>> = [];
      props.nucleotideProps.forEach((nucleotideProps : Nucleotide.Props, nucleotideIndex : number) => {
        let reference = React.createRef<Nucleotide.Component>();
        nucleotideReferences.push(reference);
        nucleotidesJsx.push(<Nucleotide.Component
          key = {nucleotideIndex}
          ref = {reference}
          {...nucleotideProps}
        />);
      });
      this.state = {
        name : props.name,
        firstNucleotideIndex : props.firstNucleotideIndex,
        nucleotidesJsx,
        nucleotideReferences
      };
    }

    public override render() {
      return <g
        transform = "translate(10 10)"
      >
        {this.state.nucleotidesJsx}
      </g>
    }

    public getBasePairCircleRadius(rnaComplex = App.Component.getCurrent().state.rnaComplexes[this.props.rnaComplexIndex]) : number {
      let countBonds = 0;
      let totalBondLengthSum = 0;
      this.state.nucleotideReferences.forEach((nucleotideReference : React.RefObject<Nucleotide.Component>) => {
        let nucleotide = nucleotideReference.current as Nucleotide.Component;
        let basePair = nucleotide.state.basePair;
        if (basePair !== undefined && nucleotide.isGreaterIndexInBasePair()) {
          let basePairedNucleotide = findNucleotideReferenceByIndex(rnaComplex.state.rnaMoleculeReferences[basePair.rnaMoleculeIndex].current as RnaMolecule.Component, basePair.nucleotideIndex).reference.current as Nucleotide.Component;
          countBonds++;
          totalBondLengthSum += Vector2D.distance(nucleotide.state.position, basePairedNucleotide.state.position);
        }
      });
      return totalBondLengthSum / (countBonds * 6);
    }
  }
}

export function insert(rnaMoleculeProps : RnaMolecule.Props, nucleotideProps : Nucleotide.Props) : void {
  let i = rnaMoleculeProps.nucleotideProps.length;
  for (; i > 0 && rnaMoleculeProps.nucleotideProps[i - 1].nucleotideIndex > nucleotideProps.nucleotideIndex; i--) {
    // Do nothing.
  }
  rnaMoleculeProps.nucleotideProps.splice(i, 0, nucleotideProps);
}

export function findNucleotidePropsByIndex(rnaMoleculeProps : RnaMolecule.Props, nucleotideIndex : number) : { props : Nucleotide.Props, arrayIndex : number } {
  let foundByNucleotideIndex = Utils.binarySearch(rnaMoleculeProps.nucleotideProps, (nucleotideProps : Nucleotide.Props) => nucleotideProps.nucleotideIndex - nucleotideIndex);
  if (foundByNucleotideIndex === null) {
    throw `Nucleotide index ${nucleotideIndex} was not found.`;
  }
  return {
    props : foundByNucleotideIndex.arrayEntry,
    arrayIndex : foundByNucleotideIndex.arrayIndex
  };
}

export function findNucleotideReferenceByIndex(rnaMolecule : RnaMolecule.Component, nucleotideIndex : number) : { reference : React.RefObject<Nucleotide.Component>, arrayIndex : number } {
  let foundByNucleotideIndex = Utils.binarySearch(rnaMolecule.state.nucleotideReferences, (nucleotideReference : React.RefObject<Nucleotide.Component>) => (nucleotideReference.current as Nucleotide.Component).props.nucleotideIndex - nucleotideIndex);
  if (foundByNucleotideIndex === null) {
    throw `Nucleotide index ${nucleotideIndex} was not found.`;
  }
  return {
    reference : foundByNucleotideIndex.arrayEntry,
    arrayIndex : foundByNucleotideIndex.arrayIndex
  };
}