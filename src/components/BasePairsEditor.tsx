import React, { RefObject } from "react";
import { DEFAULT_STROKE_WIDTH, FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT } from "../App";
import { BLACK } from "../data_structures/Color";
import Vector2D from "../data_structures/Vector2D";
import { getBasePairType, Nucleotide } from "./Nucleotide";
import { RnaComplex } from "./RnaComplex";
import { RnaMolecule } from "./RnaMolecule";

export namespace BasePairsEditor {
  export type Props = {
    initialContiguousBasePairs : Array<ContiguousBasePairs.PartialProps>,
    multipleHelicesFlag : boolean
  };

  export type State = {
    contiguousBasePairsProps : Array<ContiguousBasePairs.PartialProps>,
    newFivePrimeStartAsString : string,
    newThreePrimeStartAsString : string,
    newLengthAsString : string,
    canonicalBasePairDistanceAsString : string,
    wobbleBasePairDistanceAsString : string,
    mismatchBasePairDistanceAsString : string,
    newFivePrimeStart : number,
    newThreePrimeStart : number,
    newLength : number,
    repositionNucleotidesOnUpdate : boolean,
    canonicalBasePairDistance : number,
    wobbleBasePairDistance : number,
    mismatchBasePairDistance : number
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      
      // let countBonds = 0;
      // let totalBondLengthSum = 0;
      // this.state.nucleotideReferences.forEach((nucleotideReference : React.RefObject<Nucleotide.Component>) => {
      //   let nucleotide = nucleotideReference.current as Nucleotide.Component;
      //   let basePair = nucleotide.state.basePair;
      //   if (basePair !== undefined && nucleotide.isGreaterIndexInBasePair()) {
      //     let basePairedNucleotide = findNucleotideReferenceByIndex(rnaComplex.state.rnaMoleculeReferences[basePair.rnaMoleculeIndex].current as RnaMolecule.Component, basePair.nucleotideIndex).reference.current as Nucleotide.Component;
      //     if (basePairType == undefined || getBasePairType(nucleotide.state.symbol, basePairedNucleotide.state.symbol) == basePairType) {
      //       countBonds++;
      //       totalBondLengthSum += Vector2D.distance(nucleotide.state.position, basePairedNucleotide.state.position);
      //     }
      //   }
      // });
      // return totalBondLengthSum / countBonds;

      // this.props.

      let averageCanonicalBasePairDistance = 1;
      let averageWobbleBasePairDistance = 1;
      let averageMismatchBasePairDistance = 1;
      this.state = {
        contiguousBasePairsProps : [...props.initialContiguousBasePairs],
        newFivePrimeStartAsString : "",
        newThreePrimeStartAsString : "",
        newLengthAsString : "",
        canonicalBasePairDistanceAsString : averageCanonicalBasePairDistance.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
        wobbleBasePairDistanceAsString : averageWobbleBasePairDistance.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
        mismatchBasePairDistanceAsString : averageMismatchBasePairDistance.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
        newFivePrimeStart : NaN,
        newThreePrimeStart : NaN,
        newLength : 1,
        repositionNucleotidesOnUpdate : false,
        canonicalBasePairDistance : averageCanonicalBasePairDistance,
        wobbleBasePairDistance : averageWobbleBasePairDistance,
        mismatchBasePairDistance : averageMismatchBasePairDistance
      };
    }

    public override render() {
      return <>
        <b>Base-pairs Editor:</b>
        <table>
          <tbody>
              <tr>
                {this.props.multipleHelicesFlag && <th>5' RNA Molecule</th>}
                <th>5' Nucleotide index</th>
                {this.props.multipleHelicesFlag && <th>3' RNA Molecule</th>}
                <th>3' Nucleotide index</th>
                <th>Length</th>
                {this.props.multipleHelicesFlag && <th>Modify</th>}
              </tr>
              {this.state.contiguousBasePairsProps.map((contiguousBasePairsProps : ContiguousBasePairs.PartialProps, index : number) => <ContiguousBasePairs.Component
                key = {index}
                repositionNucleotidesOnUpdate = {this.state.repositionNucleotidesOnUpdate}
                canonicalBasePairDistance = {this.state.canonicalBasePairDistance}
                wobbleBasePairDistance = {this.state.wobbleBasePairDistance}
                mismatchBasePairDistance = {this.state.mismatchBasePairDistance}
                multipleHelicesFlag = {this.props.multipleHelicesFlag}
                {...contiguousBasePairsProps}
              />)}
              {this.props.multipleHelicesFlag && <>
                <tr>
                  <td>
                    {/* Deliberately empty row */}
                    <br/>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type = "number"
                      value = {this.state.newFivePrimeStartAsString}
                      onChange = {e => {
                        let updatedFivePrimeStart = Number.parseInt(e.target.value);
                        this.setState({
                          newFivePrimeStartAsString : e.target.value
                        });
                        if (Number.isNaN(updatedFivePrimeStart)) {
                          return;
                        }
                        this.setState({
                          newFivePrimeStart : updatedFivePrimeStart
                        });
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type = "number"
                      value = {this.state.newThreePrimeStartAsString}
                      onChange = {e => {
                        let updatedThreePrimeStart = Number.parseInt(e.target.value);
                        this.setState({
                          newThreePrimeStartAsString : e.target.value
                        });
                        if (Number.isNaN(updatedThreePrimeStart)) {
                          return;
                        }
                        this.setState({
                          newThreePrimeStart : updatedThreePrimeStart
                        });
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type = "number"
                      value = {this.state.newLengthAsString}
                      onChange = {e => {
                        let updatedLength = Number.parseInt(e.target.value);
                        this.setState({
                          newLengthAsString : e.target.value
                        });
                        if (Number.isNaN(updatedLength)) {
                          return;
                        }
                        this.setState({
                          newLength : updatedLength
                        });
                      }}
                    />
                  </td>
                  <td>
                    <button
                      onClick = {(e) => {
                        // this.setState((previousState : State) => ({
                        //   contiguousBasePairsProps : [...previousState.contiguousBasePairsProps, {
                        //     rnaMoleculeIndex0 : 0,
                        //     fivePrimeStart : previousState.newFivePrimeStart,
                        //     threePrimeStart : previousState.newThreePrimeStart,
                        //     length : previousState.newLength
                        //   }],
                        //   newFivePrimeStart : 0,
                        //   newThreePrimeStart : 0,
                        //   newLength : 0
                        // }))
                      }}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </>}
          </tbody>
        </table>
        {!this.props.multipleHelicesFlag && "This selection constraint supports only one helix."}
        <br/>
        <label>
          Reposition nucleotides on update:&nbsp;
          <input
            type = "checkbox"
            checked = {this.state.repositionNucleotidesOnUpdate}
            onChange = {() => {
              this.setState({
                repositionNucleotidesOnUpdate : !this.state.repositionNucleotidesOnUpdate
              });
            }}
          />
        </label>
        <br/>
        {this.state.repositionNucleotidesOnUpdate && <>
          <b>
            Base-pair distances:
          </b>
          <br/>
          <label>
            Canonical:&nbsp;
            <input
              type = "number"
              value = {this.state.canonicalBasePairDistanceAsString}
              onChange = {e => {
                this.setState({
                  canonicalBasePairDistanceAsString : e.target.value
                });
                let newDistance = Number.parseFloat(e.target.value);
                if (Number.isNaN(newDistance)) {
                  return;
                }
                this.setState({
                  canonicalBasePairDistance : newDistance
                });
              }}
            />
          </label>
          <br/>
          <label>
            Wobble:&nbsp;
            <input
              type = "number"
              value = {this.state.wobbleBasePairDistanceAsString}
              onChange = {e => {
                this.setState({
                  wobbleBasePairDistanceAsString : e.target.value
                });
                let newDistance = Number.parseFloat(e.target.value);
                if (Number.isNaN(newDistance)) {
                  return;
                }
                this.setState({
                  wobbleBasePairDistance : newDistance
                })
              }}
            />
          </label>
          <br/>
          <label>
            Mismatch:&nbsp;
            <input
              type = "number"
              value = {this.state.mismatchBasePairDistanceAsString}
              onChange = {e => {
                this.setState({
                  mismatchBasePairDistanceAsString : e.target.value
                });
                let newDistance = Number.parseFloat(e.target.value);
                if (Number.isNaN(newDistance)) {
                  return;
                }
                this.setState({
                  mismatchBasePairDistance : newDistance
                });
              }}
            />
          </label>
        </>}
      </>;
    }

    // public updateBasePairs() {
    //   let numberOfHelices = this.state.contiguousBasePairsProps.length;
    //   for () {

    //   }
    // }
  }
}

export namespace ContiguousBasePairs {
  export type PartialProps = {
    rnaMolecule0 : RnaMolecule.Component,
    fivePrimeStart : number,
    threePrimeStart : number,
    length : number
  };

  export type Props = PartialProps & {
    multipleHelicesFlag : boolean,
    repositionNucleotidesOnUpdate : boolean,
    canonicalBasePairDistance : number,
    wobbleBasePairDistance : number,
    mismatchBasePairDistance : number
  };

  export type State = {
    fivePrimeStartAsString : string,
    threePrimeStartAsString : string,
    lengthAsString : string,
    fivePrimeStart : number,
    threePrimeStart : number,
    length : number
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = {
        fivePrimeStartAsString : "" + props.fivePrimeStart,
        threePrimeStartAsString : "" + props.threePrimeStart,
        lengthAsString : "" + props.length,
        fivePrimeStart : props.fivePrimeStart,
        threePrimeStart : props.threePrimeStart,
        length : props.length
      };
    }

    public override componentDidUpdate(previousProps: Props, previousState : State): void {
      if (previousProps.fivePrimeStart !== this.props.fivePrimeStart) {
        this.setState({
          fivePrimeStartAsString : "" + this.props.fivePrimeStart,
          threePrimeStartAsString : "" + this.props.threePrimeStart,
          lengthAsString : "" + this.props.length
        });
      }
    }

    public override render() {
      return <tr>
        <td>
          <input
            type = "number"
            value = {this.state.fivePrimeStartAsString}
            onChange = {e => {
              let newFivePrimeStart = Number.parseInt(e.target.value);
              this.setState({
                fivePrimeStartAsString : e.target.value
              });
              if (Number.isNaN(newFivePrimeStart)) {
                return;
              }
              this.setState({
                fivePrimeStart : newFivePrimeStart
              });
              this.updateBasePairs(newFivePrimeStart, this.state.threePrimeStart, this.state.length);
            }}
          />
        </td>
        <td>
          <input
            type = "number"
            value = {this.state.threePrimeStartAsString}
            onChange = {e => {
              let newThreePrimeStart = Number.parseInt(e.target.value);
              this.setState({
                threePrimeStartAsString : e.target.value
              });
              if (Number.isNaN(newThreePrimeStart)) {
                return;
              }
              this.setState({
                threePrimeStart : newThreePrimeStart
              });
              this.updateBasePairs(this.state.fivePrimeStart, newThreePrimeStart, this.state.length);
            }}
          />
        </td>
        <td>
          <input
            type = "number"
            value = {this.state.lengthAsString}
            onChange = {e => {
              let newLength = Number.parseInt(e.target.value);
              this.setState({
                lengthAsString : e.target.value
              });
              if (Number.isNaN(newLength)) {
                return;
              }
              let oldLength = this.state.length;
              this.setState({
                length : newLength
              })
              this.updateBasePairs(this.state.fivePrimeStart, this.state.threePrimeStart, newLength, oldLength);
            }}
          />
        </td>
        {this.props.multipleHelicesFlag && <td>
          <button
            // onClick = {

            // }
          >
            Delete
          </button>
        </td>}
      </tr>
    }

    private updateBasePairs(fivePrimeStartIndex : number, threePrimeStartIndex : number, length : number, oldLength : number = length) {
      let rnaMolecule = this.props.rnaMolecule0;
      let firstNucleotideIndex = rnaMolecule.state.firstNucleotideIndex;
      fivePrimeStartIndex -= firstNucleotideIndex;
      threePrimeStartIndex -= firstNucleotideIndex;
      for (let i = 0; i < oldLength; i++) {
        let fivePrimeNucleotide = rnaMolecule.state.nucleotideReferences[fivePrimeStartIndex + i].current as Nucleotide.Component;
        let threePrimeNucleotide = rnaMolecule.state.nucleotideReferences[threePrimeStartIndex - i].current as Nucleotide.Component;
        if (fivePrimeNucleotide.state.basePair !== undefined) {
          // TODO: Refactor to support base pairs across rna molecules
          let basePairedNucleotide = rnaMolecule.state.nucleotideReferences[fivePrimeNucleotide.state.basePair.nucleotideIndex].current as Nucleotide.Component;
          if (fivePrimeNucleotide.isGreaterIndexInBasePair()) {
            fivePrimeNucleotide.setState({
              basePairJsx : <></>
            });
          } else {
            basePairedNucleotide.setState({
              basePairJsx : <></>
            });
          }
          fivePrimeNucleotide.setState({
            basePair : undefined
          });
          basePairedNucleotide.setState({
            basePair : undefined
          });
        }
        if (threePrimeNucleotide.state.basePair !== undefined) {
          // TODO: Refactor to support base pairs across rna molecules
          let basePairedNucleotide = rnaMolecule.state.nucleotideReferences[threePrimeNucleotide.state.basePair.nucleotideIndex].current as Nucleotide.Component;
          if (threePrimeNucleotide.isGreaterIndexInBasePair()) {
            threePrimeNucleotide.setState({
              basePairJsx : <></>
            });
          } else {
            basePairedNucleotide.setState({
              basePairJsx : <></>
            });
          }
          threePrimeNucleotide.setState({
            basePair : undefined
          });
          basePairedNucleotide.setState({
            basePair : undefined
          });
        }
      }

      for (let i = 0; i < length; i++) {
        let fivePrimeIndex = fivePrimeStartIndex + i;
        let threePrimeIndex = threePrimeStartIndex - i;
        let fivePrimeNucleotide = rnaMolecule.state.nucleotideReferences[fivePrimeIndex].current as Nucleotide.Component;
        let threePrimeNucleotide = rnaMolecule.state.nucleotideReferences[threePrimeIndex].current as Nucleotide.Component;
        let basePairType = getBasePairType(threePrimeNucleotide.state.symbol, fivePrimeNucleotide.state.symbol);
        let newFivePrimeBasePair = {
          rnaMoleculeIndex : threePrimeNucleotide.props.rnaMoleculeIndex,
          nucleotideIndex : threePrimeIndex,
          type : basePairType,
          strokeWidth : DEFAULT_STROKE_WIDTH,
          stroke : BLACK
        };
        let newThreePrimeBasePair = {
          rnaMoleculeIndex : fivePrimeNucleotide.props.rnaMoleculeIndex,
          nucleotideIndex : fivePrimeIndex,
          type : basePairType,
          strokeWidth : DEFAULT_STROKE_WIDTH,
          stroke : BLACK
        };
        fivePrimeNucleotide.setState({
          basePair : newFivePrimeBasePair
        });
        threePrimeNucleotide.setState({
          basePair : newThreePrimeBasePair
        });

        let fivePrimeNucleotidePosition = fivePrimeNucleotide.state.position;
        let threePrimeNucleotidePosition = threePrimeNucleotide.state.position;

        if (this.props.repositionNucleotidesOnUpdate) {
          let center = Vector2D.scaleUp(Vector2D.add(fivePrimeNucleotidePosition, threePrimeNucleotidePosition), 0.5);
          let normal = Vector2D.normalize(Vector2D.subtract(center, fivePrimeNucleotidePosition));
          let distance = 1;
          switch (getBasePairType(fivePrimeNucleotide.state.symbol, threePrimeNucleotide.state.symbol)) {
            case Nucleotide.BasePairType.CANONICAL : {
              distance = this.props.canonicalBasePairDistance;
              break;
            }
            case Nucleotide.BasePairType.WOBBLE : {
              distance = this.props.wobbleBasePairDistance;
              break;
            }
            case Nucleotide.BasePairType.MISMATCH : {
              distance = this.props.mismatchBasePairDistance;
              break;
            }
          }
          let dv = Vector2D.scaleUp(normal, distance * 0.5);

          fivePrimeNucleotidePosition = Vector2D.add(center, dv);
          threePrimeNucleotidePosition = Vector2D.subtract(center, dv);
          fivePrimeNucleotide.setState({
            position : fivePrimeNucleotidePosition
          });
          threePrimeNucleotide.setState({
            position : threePrimeNucleotidePosition
          });
        }

        if (fivePrimeNucleotide.isGreaterIndexInBasePair(newFivePrimeBasePair)) {
          fivePrimeNucleotide.updateBasePairJsx(fivePrimeNucleotidePosition, threePrimeNucleotidePosition, newFivePrimeBasePair);
        } else {
          threePrimeNucleotide.updateBasePairJsx(threePrimeNucleotidePosition, fivePrimeNucleotidePosition, newThreePrimeBasePair);
        }
      }
    }
  }
}