import React from "react";
import { DEFAULT_STROKE_WIDTH, FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT } from "../App";
import { BLACK } from "../data_structures/Color";
import Vector2D from "../data_structures/Vector2D";
import { Nucleotide, getBasePairType } from "./Nucleotide";
import { RnaComplex } from "./RnaComplex";
import { RnaMolecule } from "./RnaMolecule";

const tableColumnWidth = "100px";
const tableStyle = {
  border : "1px solid",
  width : tableColumnWidth
};
const fivePrimeRnaMoleculeLabel = "5' RNA Molecule";
const threePrimeRnaMoleculeLabel = "3' RNA Molecule";
const nucleotideIndexLabel = "Nucleotide Index";
const lengthLabel = "Length";
const mismatchBasePairDistance = 10;
const wobbleBasePairDistance = 15;
const canonicalBasePairDistance = 20;

export namespace BasePairsEditor {
  export type Props = {
    rnaComplex : RnaComplex.Component,
    initialContiguousBasePairsProps : Array<ContiguousBasePairs.Props>
  };

  export type State = {
    inputFivePrimeRnaMoleculeIndex : number,
    inputFivePrimeNucleotideIndex : number | undefined,
    inputFivePrimeNucleotideIndexAsText : string,
    inputThreePrimeRnaMoleculeIndex : number,
    inputThreePrimeNucleotideIndex : number | undefined,
    inputThreePrimeNucleotideIndexAsText : string,
    inputLength : number | undefined,
    inputLengthAsText : string,
    contiguousBasePairsProps : Array<ContiguousBasePairs.ExternalProps>,
    disableAddFlag : boolean,
    repositionNucleotidesOnUpdateFlag : boolean,
    mismatchBasePairDistance : number,
    mismatchBasePairDistanceAsText : string,
    wobbleBasePairDistance : number,
    wobbleBasePairDistanceAsText : string,
    canonicalBasePairDistance : number,
    canonicalBasePairDistanceAsText : string
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = {
        inputFivePrimeRnaMoleculeIndex : -1,
        inputFivePrimeNucleotideIndex : undefined,
        inputFivePrimeNucleotideIndexAsText : "",
        inputThreePrimeRnaMoleculeIndex : -1,
        inputThreePrimeNucleotideIndex : undefined,
        inputThreePrimeNucleotideIndexAsText : "",
        inputLength : undefined,
        inputLengthAsText : "",
        contiguousBasePairsProps : [],
        disableAddFlag : true,
        repositionNucleotidesOnUpdateFlag : false,
        mismatchBasePairDistance : mismatchBasePairDistance,
        mismatchBasePairDistanceAsText : mismatchBasePairDistance.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
        wobbleBasePairDistance : wobbleBasePairDistance,
        wobbleBasePairDistanceAsText : wobbleBasePairDistance.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
        canonicalBasePairDistance : canonicalBasePairDistance,
        canonicalBasePairDistanceAsText : canonicalBasePairDistance.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
      };
    }

    public override render() {
      return <>
        <table
          style = {{
            ...tableStyle,
            borderCollapse : "collapse"
          }}
        >
          <tbody>
            {/* Label Row */}
            <tr
              style = {tableStyle}
            >
              <th
                style = {tableStyle}
              >
                {fivePrimeRnaMoleculeLabel}
              </th>
              <th
              style = {tableStyle}
              >
                {nucleotideIndexLabel}
              </th>
              <th
                style = {tableStyle}
              >
                {threePrimeRnaMoleculeLabel}
              </th>
              <th
                style = {tableStyle}
              >
                {nucleotideIndexLabel}
              </th>
              <th
                style = {tableStyle}
              >
                {lengthLabel}
              </th>
              <th
                style = {tableStyle}
              >
                Modify
              </th>
            </tr>

            {/* Display Rows */}
            {this.state.contiguousBasePairsProps.map((externalProps : ContiguousBasePairs.ExternalProps, index : number) => <ContiguousBasePairs.Component
              key = {index}
              rnaComplex = {this.props.rnaComplex}
              updateCache = {{
                ...externalProps
              }}
              createBasePairs = {(createProps : ContiguousBasePairs.ExternalProps, deleteProps : ContiguousBasePairs.ExternalProps) => {
                this.deleteBasePairs(
                  deleteProps.fivePrimeRnaMoleculeIndex,
                  deleteProps.threePrimeRnaMoleculeIndex,
                  deleteProps.fivePrimeNucleotideIndex,
                  deleteProps.threePrimeNucleotideIndex,
                  deleteProps.length
                );
                this.createBasePairs(
                  createProps.fivePrimeRnaMoleculeIndex,
                  createProps.threePrimeRnaMoleculeIndex,
                  createProps.fivePrimeNucleotideIndex,
                  createProps.threePrimeNucleotideIndex,
                  createProps.length
                );
              }}
              deleteBasePairs = {(deleteProps : ContiguousBasePairs.ExternalProps) => {
                this.setState((previousState) => ({
                  contiguousBasePairsProps : previousState.contiguousBasePairsProps.filter((_ : ContiguousBasePairs.ExternalProps, externalPropsIndex : number) => externalPropsIndex != index)
                }));
                this.deleteBasePairs(
                  deleteProps.fivePrimeRnaMoleculeIndex,
                  deleteProps.threePrimeRnaMoleculeIndex,
                  deleteProps.fivePrimeNucleotideIndex,
                  deleteProps.threePrimeNucleotideIndex,
                  deleteProps.length
                );
              }}
              updatePropsHelper = {(partialProps : Partial<ContiguousBasePairs.ExternalProps>) => {
                this.setState((previousState : State) => {
                  let props = [...previousState.contiguousBasePairsProps];
                  props[index] = Object.assign({}, props[index], partialProps);
                  return {
                    contiguousBasePairsProps : props
                  };
                });
              }}
              {...externalProps}
            />)}

            {/* Input Row */}
            <tr
              style = {tableStyle}
            >
              {/* 5' RNA Molecule */}
              <td
                style = {tableStyle}
              >
                <select
                  style = {{
                    width : tableColumnWidth
                  }}
                  value = {this.state.inputFivePrimeRnaMoleculeIndex}
                  onChange = {e => {
                    let newInputFivePrimeRnaMoleculeIndex = Number.parseInt(e.target.value);
                    this.setState({
                      inputFivePrimeRnaMoleculeIndex : newInputFivePrimeRnaMoleculeIndex
                    });
                    this.updateDisableAddFlag(
                      newInputFivePrimeRnaMoleculeIndex,
                      this.state.inputFivePrimeNucleotideIndex,
                      this.state.inputThreePrimeRnaMoleculeIndex,
                      this.state.inputThreePrimeNucleotideIndex,
                      this.state.inputLength
                    );
                  }}
                >
                  <option
                    value = {-1}
                    style = {{
                      display : "none"
                    }}
                  >
                    {fivePrimeRnaMoleculeLabel}
                  </option>
                  {this.props.rnaComplex.state.rnaMoleculeReferences.map((rnaMoleculeReference : React.RefObject<RnaMolecule.Component>, index : number) => {
                    let rnaMolecule = rnaMoleculeReference.current as RnaMolecule.Component;
                    return <option
                      key = {index}
                      value = {index}
                    >
                      {rnaMolecule.state.name}
                    </option>
                  })}
                </select>
              </td>
              {/* 5' Nucleotide Index */}
              <td
                style = {tableStyle}
              >
                <input
                  style = {{
                    width : tableColumnWidth
                  }}
                  placeholder = {nucleotideIndexLabel}
                  type = "number"
                  value = {this.state.inputFivePrimeNucleotideIndexAsText}
                  onChange = {e => {
                    this.setState({
                      inputFivePrimeNucleotideIndexAsText : e.target.value
                    });
                    let newFivePrimeNucleotideIndex = Number.parseInt(e.target.value);
                    if (Number.isNaN(newFivePrimeNucleotideIndex)) {
                      return;
                    }
                    this.setState({
                      inputFivePrimeNucleotideIndex : newFivePrimeNucleotideIndex
                    });
                    this.updateDisableAddFlag(
                      this.state.inputFivePrimeRnaMoleculeIndex,
                      newFivePrimeNucleotideIndex,
                      this.state.inputThreePrimeRnaMoleculeIndex,
                      this.state.inputThreePrimeNucleotideIndex,
                      this.state.inputLength
                    );
                  }}
                />
              </td>
              {/* 3' RNA Molecule */}
              <td
                style = {tableStyle}
              >
                <select
                  style = {{
                    width : tableColumnWidth
                  }}
                  value = {this.state.inputThreePrimeRnaMoleculeIndex}
                  onChange = {e => {
                    let newInputThreePrimeRnaMoleculeIndex = Number.parseInt(e.target.value);
                    this.setState({
                      inputThreePrimeRnaMoleculeIndex : newInputThreePrimeRnaMoleculeIndex
                    });
                    this.updateDisableAddFlag(
                      this.state.inputFivePrimeRnaMoleculeIndex,
                      this.state.inputFivePrimeNucleotideIndex,
                      newInputThreePrimeRnaMoleculeIndex,
                      this.state.inputThreePrimeNucleotideIndex,
                      this.state.inputLength
                    );
                  }}
                >
                  <option
                    value = {-1}
                    style = {{
                      display : "none"
                    }}
                  >
                    {threePrimeRnaMoleculeLabel}
                  </option>
                  {this.props.rnaComplex.state.rnaMoleculeReferences.map((rnaMoleculeReference : React.RefObject<RnaMolecule.Component>, index : number) => {
                    let rnaMolecule = rnaMoleculeReference.current as RnaMolecule.Component;
                    return <option
                      key = {index}
                      value = {index}
                    >
                      {rnaMolecule.state.name}
                    </option>
                  })}
                </select>
              </td>
              {/* 3' Nucleotide Index */}
              <td
                style = {tableStyle}
              >
                <input
                  style = {{
                    width : tableColumnWidth
                  }}
                  placeholder = {nucleotideIndexLabel}
                  type = "number"
                  value = {this.state.inputThreePrimeNucleotideIndexAsText}
                  onChange = {e => {
                    this.setState({
                      inputThreePrimeNucleotideIndexAsText : e.target.value
                    });
                    let newThreePrimeNucleotideIndex = Number.parseInt(e.target.value);
                    if (Number.isNaN(newThreePrimeNucleotideIndex)) {
                      return;
                    }
                    this.setState({
                      inputThreePrimeNucleotideIndex : newThreePrimeNucleotideIndex
                    });
                    this.updateDisableAddFlag(
                      this.state.inputFivePrimeRnaMoleculeIndex,
                      this.state.inputFivePrimeNucleotideIndex,
                      this.state.inputThreePrimeRnaMoleculeIndex,
                      newThreePrimeNucleotideIndex,
                      this.state.inputLength
                    );
                  }}
                />
              </td>
              {/* Length */}
              <td
                style = {tableStyle}
              >
                <input
                  style = {{
                    width : tableColumnWidth
                  }}
                  placeholder = {lengthLabel}
                  type = "number"
                  value = {this.state.inputLengthAsText}
                  onChange = {e => {
                    this.setState({
                      inputLengthAsText : e.target.value
                    });
                    let newLength = Number.parseInt(e.target.value);
                    if (Number.isNaN(newLength)) {
                      return;
                    }
                    this.setState({
                      inputLength : newLength
                    });
                    this.updateDisableAddFlag(
                      this.state.inputFivePrimeRnaMoleculeIndex,
                      this.state.inputFivePrimeNucleotideIndex,
                      this.state.inputThreePrimeRnaMoleculeIndex,
                      this.state.inputThreePrimeNucleotideIndex,
                      newLength
                    );
                  }}
                />
              </td>
              {/* Modify */}
              <td
                style = {tableStyle}
              >
                <button
                  disabled = {this.state.disableAddFlag}
                  style = {{
                    width : tableColumnWidth,
                    backgroundColor : this.state.disableAddFlag ? "rgb(129, 0, 0)" : "inherit"
                  }}
                  onClick = {() => {
                    this.deleteBasePairs(
                      this.state.inputFivePrimeRnaMoleculeIndex,
                      this.state.inputThreePrimeRnaMoleculeIndex,
                      this.state.inputFivePrimeNucleotideIndex as number,
                      this.state.inputThreePrimeNucleotideIndex as number,
                      this.state.inputLength as number
                    );
                    this.createBasePairs(
                      this.state.inputFivePrimeRnaMoleculeIndex,
                      this.state.inputThreePrimeRnaMoleculeIndex,
                      this.state.inputFivePrimeNucleotideIndex as number,
                      this.state.inputThreePrimeNucleotideIndex as number,
                      this.state.inputLength as number
                    );
                    this.setState((oldState : State) => ({
                      inputFivePrimeRnaMoleculeIndex : -1,
                      inputFivePrimeNucleotideIndex : undefined,
                      inputFivePrimeNucleotideIndexAsText : "",
                      inputThreePrimeRnaMoleculeIndex : -1,
                      inputThreePrimeNucleotideIndex : undefined,
                      inputThreePrimeNucleotideIndexAsText : "",
                      inputLength : undefined,
                      inputLengthAsText : "",
                      disableAddFlag : true,
                      contiguousBasePairsProps : [
                        ...oldState.contiguousBasePairsProps,
                        {
                          fivePrimeRnaMoleculeIndex : this.state.inputFivePrimeRnaMoleculeIndex,
                          fivePrimeNucleotideIndex : this.state.inputFivePrimeNucleotideIndex as number,
                          threePrimeRnaMoleculeIndex : this.state.inputThreePrimeRnaMoleculeIndex,
                          threePrimeNucleotideIndex : this.state.inputThreePrimeNucleotideIndex as number,
                          length : this.state.inputLength as number
                        }
                      ]
                    }));
                  }}
                >
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <label>
          Reposition nucleotides on update:&nbsp;
          <input
            type = "checkbox"
            checked = {this.state.repositionNucleotidesOnUpdateFlag}
            onChange = {() => {
              this.setState({
                repositionNucleotidesOnUpdateFlag : !this.state.repositionNucleotidesOnUpdateFlag
              })
            }}
          /> 
        </label>
        <br/>
        {this.state.repositionNucleotidesOnUpdateFlag && <>
          <label>
            Mismatch base-pair distance:&nbsp;
            <input
              type = "number"
              value = {this.state.mismatchBasePairDistanceAsText}
              onChange = {e => {
                let newMismatchBasePairDistance = Number.parseFloat(e.target.value);
                this.setState({
                  mismatchBasePairDistanceAsText : e.target.value
                });
                if (Number.isNaN(newMismatchBasePairDistance)) {
                  return;
                }
                this.setState({
                  mismatchBasePairDistance : newMismatchBasePairDistance
                });
              }}
            />
          </label>
          <br/>
          <label>
            Wobble base-pair distance:&nbsp;
            <input
              type = "number"
              value = {this.state.wobbleBasePairDistanceAsText}
              onChange = {e => {
                let newWobbleBasePairDistance = Number.parseFloat(e.target.value);
                this.setState({
                  wobbleBasePairDistanceAsText : e.target.value
                });
                if (Number.isNaN(newWobbleBasePairDistance)) {
                  return;
                }
                this.setState({
                  wobbleBasePairDistance : newWobbleBasePairDistance
                })
              }}
            />
          </label>
          <br/>
          <label>
            Canonical base-pair distance:&nbsp;
            <input
              type = "number"
              value = {this.state.canonicalBasePairDistanceAsText}
              onChange = {e => {
                let newCanonicalBasePairDistance = Number.parseFloat(e.target.value);
                this.setState({
                  canonicalBasePairDistanceAsText : e.target.value
                });
                if (Number.isNaN(newCanonicalBasePairDistance)) {
                  return;
                }
                this.setState({
                  canonicalBasePairDistance : newCanonicalBasePairDistance
                });
              }}
            />
          </label>
        </>}
      </>
    }

    private updateDisableAddFlag(
      inputFivePrimeRnaMoleculeIndex : number,
      inputFivePrimeNucleotideIndex : number | undefined,
      inputThreePrimeRnaMoleculeIndex : number,
      inputThreePrimeNucleotideIndex : number | undefined,
      inputLength : number | undefined
    ) {
      this.setState({
        disableAddFlag : (
          inputFivePrimeRnaMoleculeIndex == -1 ||
          inputFivePrimeNucleotideIndex == undefined ||
          inputThreePrimeRnaMoleculeIndex == -1 ||
          inputThreePrimeNucleotideIndex == undefined ||
          inputLength == undefined
        )
      })
    }

    private deleteBasePairs(
      fivePrimeRnaMoleculeIndex : number,
      threePrimeRnaMoleculeIndex : number,
      fivePrimeNucleotideIndex : number,
      threePrimeNucleotideIndex : number,
      length : number
    ) {
      let fivePrimeRnaMolecule = this.props.rnaComplex.state.rnaMoleculeReferences[fivePrimeRnaMoleculeIndex].current as RnaMolecule.Component;
      let threePrimeRnaMolecule = this.props.rnaComplex.state.rnaMoleculeReferences[threePrimeRnaMoleculeIndex].current as RnaMolecule.Component;
      let normalizedFivePrimeNucleotideIndex = fivePrimeNucleotideIndex - fivePrimeRnaMolecule.state.firstNucleotideIndex;
      let normalizedThreePrimeNucleotideIndex = threePrimeNucleotideIndex - threePrimeRnaMolecule.state.firstNucleotideIndex;
      for (let i = 0; i < length; i++) {
        // Delete old base pairs.
        let fivePrimeNucleotide = fivePrimeRnaMolecule.state.nucleotideReferences[normalizedFivePrimeNucleotideIndex + i].current as Nucleotide.Component;
        let threePrimeNucleotide = threePrimeRnaMolecule.state.nucleotideReferences[normalizedThreePrimeNucleotideIndex - i].current as Nucleotide.Component;
        [fivePrimeNucleotide, threePrimeNucleotide].forEach(nucleotide => {
          let basePair = nucleotide.state.basePair;
          if (basePair != undefined) {
            let basePairedRnaMolecule = this.props.rnaComplex.state.rnaMoleculeReferences[basePair.rnaMoleculeIndex].current as RnaMolecule.Component;
            let basePairedNucleotide = basePairedRnaMolecule.state.nucleotideReferences[basePair.nucleotideIndex].current as Nucleotide.Component;
            if (nucleotide.isGreaterIndexInBasePair()) {
              nucleotide.setState({
                basePairJsx : <></>
              });
            } else {
              basePairedNucleotide.setState({
                basePairJsx : <></>
              });
            }
            nucleotide.setState({
              basePair : undefined
            });
            nucleotide.setState({
              basePair : undefined
            });
          }
        });
      }
    }

    private createBasePairs(
      fivePrimeRnaMoleculeIndex : number,
      threePrimeRnaMoleculeIndex : number,
      fivePrimeNucleotideIndex : number,
      threePrimeNucleotideIndex : number,
      length : number
    ) : void {
      let fivePrimeRnaMolecule = this.props.rnaComplex.state.rnaMoleculeReferences[fivePrimeRnaMoleculeIndex].current as RnaMolecule.Component;
      let threePrimeRnaMolecule = this.props.rnaComplex.state.rnaMoleculeReferences[threePrimeRnaMoleculeIndex].current as RnaMolecule.Component;
      let normalizedFivePrimeNucleotideIndex = fivePrimeNucleotideIndex - fivePrimeRnaMolecule.state.firstNucleotideIndex;
      let normalizedThreePrimeNucleotideIndex = threePrimeNucleotideIndex - threePrimeRnaMolecule.state.firstNucleotideIndex;
      let normalizedFivePrimeNucleotide = fivePrimeRnaMolecule.state.nucleotideReferences[normalizedFivePrimeNucleotideIndex].current as Nucleotide.Component;
      let normalizedThreePrimeNucleotide = threePrimeRnaMolecule.state.nucleotideReferences[normalizedThreePrimeNucleotideIndex].current as Nucleotide.Component;
      let runningCenter = Vector2D.scaleUp(Vector2D.add(normalizedThreePrimeNucleotide.state.position, normalizedFivePrimeNucleotide.state.position), 0.5);
      let axis : Vector2D = Vector2D.normalize(Vector2D.subtract(normalizedFivePrimeNucleotide.state.position, runningCenter));
      let orthogonalAxis = Vector2D.negate(Vector2D.orthogonalize(axis));
      let distanceBetweenBasePairs = 6;
      for (let i = 0; i < length; i++) {
        // Form current base pairs.
        let currentFivePrimeNucleotideIndex = normalizedFivePrimeNucleotideIndex + i;
        let currentThreePrimeNucleotideIndex = normalizedThreePrimeNucleotideIndex - i;
        let fivePrimeNucleotide = fivePrimeRnaMolecule.state.nucleotideReferences[currentFivePrimeNucleotideIndex].current as Nucleotide.Component;
        let threePrimeNucleotide = threePrimeRnaMolecule.state.nucleotideReferences[currentThreePrimeNucleotideIndex].current as Nucleotide.Component;
        let basePairType = getBasePairType(threePrimeNucleotide.state.symbol, fivePrimeNucleotide.state.symbol);
        let newFivePrimeBasePair : Nucleotide.BasePair = {
          rnaMoleculeIndex : threePrimeRnaMoleculeIndex,
          nucleotideIndex : currentThreePrimeNucleotideIndex,
          type : basePairType,
          strokeWidth : DEFAULT_STROKE_WIDTH,
          stroke : BLACK
        }
        let newThreePrimeBasePair : Nucleotide.BasePair = {
          rnaMoleculeIndex : fivePrimeRnaMoleculeIndex,
          nucleotideIndex : currentFivePrimeNucleotideIndex,
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

        if (this.state.repositionNucleotidesOnUpdateFlag) {
          let basePairLength = undefined;
          switch (basePairType) {
            case Nucleotide.BasePairType.MISMATCH : {
              basePairLength = this.state.mismatchBasePairDistance;
              break;
            }
            case Nucleotide.BasePairType.WOBBLE : {
              basePairLength = this.state.wobbleBasePairDistance;
              break;
            }
            case Nucleotide.BasePairType.CANONICAL : {
              basePairLength = this.state.canonicalBasePairDistance;
              break;
            }
            default : {
              throw new Error("Unrecognized basepair type.");
            }
          }
          let scaledAxis = Vector2D.scaleUp(axis, basePairLength * 0.5);
          fivePrimeNucleotidePosition = Vector2D.add(runningCenter, scaledAxis);
          threePrimeNucleotidePosition = Vector2D.subtract(runningCenter, scaledAxis);
          fivePrimeNucleotide.setState({
            position : fivePrimeNucleotidePosition
          });
          threePrimeNucleotide.setState({
            position : threePrimeNucleotidePosition
          })
          runningCenter = Vector2D.add(runningCenter, Vector2D.scaleUp(orthogonalAxis, distanceBetweenBasePairs));
        }

        if (fivePrimeNucleotide.isGreaterIndexInBasePair(newFivePrimeBasePair)) {
          fivePrimeNucleotide.updateBasePairJsx(
            fivePrimeNucleotidePosition,
            threePrimeNucleotidePosition,
            newFivePrimeBasePair
          );
        } else {
          threePrimeNucleotide.updateBasePairJsx(
            threePrimeNucleotidePosition,
            fivePrimeNucleotidePosition,
            newThreePrimeBasePair
          )
        }
      }
    }
  }
}

export namespace ContiguousBasePairs {
  export type ExternalProps = {
    fivePrimeRnaMoleculeIndex : number,
    fivePrimeNucleotideIndex : number,
    threePrimeRnaMoleculeIndex : number,
    threePrimeNucleotideIndex : number,
    length : number
  };

  export type PropsFromBasePairsEditor = ExternalProps & {
    updateCache : ExternalProps
  }

  export type Props = PropsFromBasePairsEditor & {
    rnaComplex : RnaComplex.Component,
    createBasePairs : (createProps : ExternalProps, deleteProps : ExternalProps) => void,
    deleteBasePairs : (deleteProps : ExternalProps) => void,
    updatePropsHelper : (partialProps : Partial<PropsFromBasePairsEditor>) => void
  };

  export type State = {
    fivePrimeNucleotideIndexAsText : string,
    threePrimeNucleotideIndexAsText : string,
    lengthAsText : string
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = {
        fivePrimeNucleotideIndexAsText : "" + props.fivePrimeNucleotideIndex,
        threePrimeNucleotideIndexAsText : "" + props.threePrimeNucleotideIndex,
        lengthAsText : "" + props.length
      };
    }

    public override componentDidUpdate(previousProps : Props) {
      if (
        this.props.fivePrimeRnaMoleculeIndex !== previousProps.fivePrimeRnaMoleculeIndex ||
        this.props.fivePrimeNucleotideIndex !== previousProps.fivePrimeNucleotideIndex ||
        this.props.threePrimeRnaMoleculeIndex !== previousProps.threePrimeRnaMoleculeIndex ||
        this.props.threePrimeNucleotideIndex !== previousProps.threePrimeNucleotideIndex ||
        this.props.length !== previousProps.length
      ) {
        this.setState({
          fivePrimeNucleotideIndexAsText : "" + this.props.fivePrimeNucleotideIndex,
          threePrimeNucleotideIndexAsText : "" + this.props.threePrimeNucleotideIndex,
          lengthAsText : "" + this.props.length
        });
      }
    }

    public override render() {
      return <tr
        style = {tableStyle}
      >
        <td
          style = {tableStyle}
        >
          <select
            style = {{
              width : tableColumnWidth
            }}
            value = {this.props.fivePrimeRnaMoleculeIndex}
            onChange = {e => {
              let newFivePrimeRnaMoleculeIndex = Number.parseInt(e.target.value);
              if (Number.isNaN(newFivePrimeRnaMoleculeIndex)) {
                return;
              }
              this.props.updatePropsHelper({
                fivePrimeRnaMoleculeIndex : newFivePrimeRnaMoleculeIndex
              });
            }}
          >
            <option
              value = {-1}
              style = {{
                display : "none"
              }}
            >
              {fivePrimeRnaMoleculeLabel}
            </option>
            {this.props.rnaComplex.state.rnaMoleculeReferences.map((rnaMoleculeReference : React.RefObject<RnaMolecule.Component>, index : number) => {
              let rnaMolecule = rnaMoleculeReference.current as RnaMolecule.Component;
              return <option
                key = {index}
                value = {index}
              >
                {rnaMolecule.state.name}
              </option>
            })}
          </select>
        </td>
        <td
          style = {tableStyle}
        >
          <input
            style = {{
              width : tableColumnWidth
            }}
            placeholder = {nucleotideIndexLabel}
            type = "number"
            value = {this.state.fivePrimeNucleotideIndexAsText}
            onChange = {e => {
              this.setState({
                fivePrimeNucleotideIndexAsText : e.target.value
              });
              let newFivePrimeNucleotideIndex = Number.parseInt(e.target.value);
              if (Number.isNaN(newFivePrimeNucleotideIndex)) {
                return;
              }
              this.props.updatePropsHelper({
                fivePrimeNucleotideIndex : newFivePrimeNucleotideIndex
              });
            }}
          />
        </td>
        <td
          style = {tableStyle}
        >
          <select
            style = {{
              width : tableColumnWidth
            }}
            value = {this.props.threePrimeRnaMoleculeIndex}
            onChange = {e => {
              let newFivePrimeRnaMoleculeIndex = Number.parseInt(e.target.value);
              this.props.updatePropsHelper({
                fivePrimeRnaMoleculeIndex : newFivePrimeRnaMoleculeIndex
              });
            }}
          >
            <option
              value = {-1}
              style = {{
                display : "none"
              }}
            >
              {threePrimeRnaMoleculeLabel}
            </option>
            {this.props.rnaComplex.state.rnaMoleculeReferences.map((rnaMoleculeReference : React.RefObject<RnaMolecule.Component>, index : number) => {
              let rnaMolecule = rnaMoleculeReference.current as RnaMolecule.Component;
              return <option
                key = {index}
                value = {index}
              >
                {rnaMolecule.state.name}
              </option>
            })}
          </select>
        </td>
        <td
          style = {tableStyle}
        >
          <input
            style = {{
              width : tableColumnWidth
            }}
            placeholder = {nucleotideIndexLabel}
            type = "number"
            value = {this.state.threePrimeNucleotideIndexAsText}
            onChange = {e => {
              this.setState({
                threePrimeNucleotideIndexAsText : e.target.value
              });
              let newThreePrimeNucleotideIndex = Number.parseInt(e.target.value);
              if (Number.isNaN(newThreePrimeNucleotideIndex)) {
                return;
              }
              this.props.updatePropsHelper({
                threePrimeNucleotideIndex : newThreePrimeNucleotideIndex
              });
            }}
          />
        </td>
        <td
          style = {tableStyle}
        >
          <input
            style = {{
              width : tableColumnWidth
            }}
            placeholder = {lengthLabel}
            type = "number"
            value = {this.state.lengthAsText}
            onChange = {e => {
              this.setState({
                lengthAsText : e.target.value
              });
              let newLength = Number.parseInt(e.target.value);
              if (Number.isNaN(newLength)) {
                return;
              }
              this.props.updatePropsHelper({
                length : newLength
              });
            }}
          />
        </td>
        <td
          style = {tableStyle}
        >
          <button
            style = {{
              width : tableColumnWidth
            }}
            onClick = {() => {
              this.props.updatePropsHelper({
                updateCache : {
                  fivePrimeRnaMoleculeIndex : this.props.fivePrimeRnaMoleculeIndex,
                  fivePrimeNucleotideIndex : this.props.fivePrimeNucleotideIndex,
                  threePrimeRnaMoleculeIndex : this.props.threePrimeRnaMoleculeIndex,
                  threePrimeNucleotideIndex : this.props.threePrimeNucleotideIndex,
                  length : this.props.length
                }
              });
              this.props.createBasePairs(this.props, this.props.updateCache);
            }}
          >
            Update
          </button>
          <button
            style = {{
              width : tableColumnWidth
            }}
            onClick = {() => {
              this.props.deleteBasePairs(this.props.updateCache);
            }}
          >
            Delete
          </button>
        </td>
      </tr>;
    }
  }
}