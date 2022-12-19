import React from "react";
import { DEFAULT_BACKGROUND_COLOR_CSS_STRING, DEFAULT_STROKE_WIDTH, FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT } from "../App";
import '../App.css';
import { BLACK } from "../data_structures/Color";
import Vector2D from "../data_structures/Vector2D";
import { getBasePairType, Nucleotide } from "./Nucleotide";
import { RnaComplex } from "./RnaComplex";
import { RnaMolecule } from "./RnaMolecule";

export namespace BasePairsEditor {
  export type Props = {
    multipleHelicesFlag : boolean,
    rnaComplex : RnaComplex.Component,
    initialContiguousBasePairsProps : Array<ContiguousBasePairs.PartialProps>
  };

  export type State = ContiguousBasePairs.OptionalProps & {
    contiguousBasePairProps : Array<ContiguousBasePairs.PartialProps>,
    disableAddHelixFlag : boolean,
    fivePrimeSelectValue : number,
    threePrimeSelectValue : number,
    fivePrimeNucleotideIndexAsText : string,
    threePrimeNucleotideIndexAsText : string,
    lengthAsText : string
  };

  export class Component extends React.Component<Props, State> {
    private readonly fivePrimeSelect = React.createRef<HTMLSelectElement>();
    private readonly threePrimeSelect = React.createRef<HTMLSelectElement>();

    public constructor(props : Props) {
      super(props);
      this.state = {
        contiguousBasePairProps : [
          ...props.initialContiguousBasePairsProps
        ],
        disableAddHelixFlag : true,
        fivePrimeSelectValue : -1,
        threePrimeSelectValue : -1,
        fivePrimeNucleotideIndexAsText : "",
        threePrimeNucleotideIndexAsText : "",
        lengthAsText : ""
      };
    }

    private updateDisableButtonFlag(
      fivePrimeSelectValue = this.state.fivePrimeSelectValue,
      threePrimeSelectValue = this.state.threePrimeSelectValue,
      fivePrimeNucleotideIndex = this.state.fivePrimeNucleotideIndex,
      threePrimeNucleotideIndex = this.state.threePrimeNucleotideIndex,
      length = this.state.length
    ) {
      this.setState({
        disableAddHelixFlag : (
          fivePrimeSelectValue === -1 ||
          threePrimeSelectValue === -1 ||
          fivePrimeNucleotideIndex === undefined ||
          threePrimeNucleotideIndex === undefined ||
          length === undefined
        )
      });
    }

    private removeHelix(indexToRemove : number) : void {
      let toBeRemoved = this.state.contiguousBasePairProps[indexToRemove];
      this.deleteBasePairs(
        toBeRemoved.fivePrimeRnaMoleculeIndex,
        toBeRemoved.threePrimeRnaMoleculeIndex,
        toBeRemoved.fivePrimeNucleotideIndex,
        toBeRemoved.threePrimeNucleotideIndex,
        toBeRemoved.length
      );
      this.setState((previousState : State) => {
        let filtered = previousState.contiguousBasePairProps.filter((_ : ContiguousBasePairs.PartialProps, index : number) => indexToRemove !== index);
        return {
          contiguousBasePairProps : filtered
        }
      });
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
      this.deleteBasePairs(
        fivePrimeRnaMoleculeIndex,
        threePrimeRnaMoleculeIndex,
        fivePrimeNucleotideIndex,
        threePrimeNucleotideIndex,
        length
      );
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
      let basePairLength = 20;
      let scaledAxis = Vector2D.scaleUp(axis, basePairLength * 0.5);
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

        fivePrimeNucleotidePosition = Vector2D.add(runningCenter, scaledAxis);
        threePrimeNucleotidePosition = Vector2D.subtract(runningCenter, scaledAxis);
        fivePrimeNucleotide.setState({
          position : fivePrimeNucleotidePosition
        });
        threePrimeNucleotide.setState({
          position : threePrimeNucleotidePosition
        })
        runningCenter = Vector2D.add(runningCenter, Vector2D.scaleUp(orthogonalAxis, distanceBetweenBasePairs));

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

    public override render() {
      let fivePrimeNucleotidePlaceholderText = "Nucleotide #";
      let threePrimeNucleotidePlaceholderText = "Nucleotide #";
      if (!this.props.multipleHelicesFlag) {
        fivePrimeNucleotidePlaceholderText = "5' " + fivePrimeNucleotidePlaceholderText;
        threePrimeNucleotidePlaceholderText = "3' " + threePrimeNucleotidePlaceholderText;
      }
      let helixLengthPlaceholderText = "Helix length"
      return <>
        <table
          style = {{
            ...tableStyle,
            borderCollapse : "collapse"
          }}
        >
          <tbody>
            <tr>
              {this.props.multipleHelicesFlag && <th
                style = {tableStyle}
              >
                5' RNA Molecule
              </th>}
              <th
                style = {tableStyle}
              >
                {fivePrimeNucleotidePlaceholderText}
              </th>
              {this.props.multipleHelicesFlag && <th
                style = {tableStyle}
              >
                3' RNA Molecule
              </th>}
              <th
                style = {tableStyle}
              >
                {threePrimeNucleotidePlaceholderText}
              </th>
              <th
                style = {tableStyle}
              >
                {helixLengthPlaceholderText}
              </th>
              <th
                style = {tableStyle}
              >
                Modify
              </th>
            </tr>
            
            {this.state.contiguousBasePairProps.map((contiguousBasePairsProps : ContiguousBasePairs.PartialProps, index : number) => <ContiguousBasePairs.Component
              key = {index}
              {...contiguousBasePairsProps}
              rnaComplex = {this.props.rnaComplex}
              fivePrimeNucleotidePlaceholderText = {fivePrimeNucleotidePlaceholderText}
              threePrimeNucleotidePlaceholderText = {threePrimeNucleotidePlaceholderText}
              helixLengthPlaceholderText = {helixLengthPlaceholderText}
              index = {index}
              removeHelix = {(index : number) => this.removeHelix(index)}
              createBasePairs = {(fivePrimeRnaMoleculeIndex : number, threePrimeRnaMoleculeIndex : number, fivePrimeNucleotideIndex : number, threePrimeNucleotideIndex : number, length : number) => this.createBasePairs(fivePrimeRnaMoleculeIndex, threePrimeRnaMoleculeIndex, fivePrimeNucleotideIndex, threePrimeNucleotideIndex, length)}
              deleteBasePairs = {(fivePrimeRnaMoleculeIndex : number, threePrimeRnaMoleculeIndex : number, fivePrimeNucleotideIndex : number, threePrimeNucleotideIndex : number, length : number) => this.deleteBasePairs(fivePrimeRnaMoleculeIndex, threePrimeRnaMoleculeIndex, fivePrimeNucleotideIndex, threePrimeNucleotideIndex, length)}
            />)}
            
            {/* To-be-added helix row */}
            <tr
              style = {tableStyle}
            >
              <td
                style = {tableStyle}
              >
                {this.props.multipleHelicesFlag && <>
                  <select
                    ref = {this.fivePrimeSelect}
                    value = {this.state.fivePrimeSelectValue}
                    onChange = {e => {
                      let newFivePrimeSelectValue = Number.parseInt(e.target.value);
                      this.setState({
                        fivePrimeSelectValue : newFivePrimeSelectValue
                      });
                      this.updateDisableButtonFlag(
                        newFivePrimeSelectValue,
                        this.state.threePrimeSelectValue,
                        this.state.fivePrimeNucleotideIndex,
                        this.state.threePrimeNucleotideIndex,
                        this.state.length
                      );
                    }}
                  >
                    <option
                      style = {{
                        display : "none"
                      }}
                      value = {-1}
                    >
                      5' RNA molecule
                    </option>
                    {this.props.rnaComplex.state.rnaMoleculeReferences.map((rnaMolecule : React.RefObject<RnaMolecule.Component>, index : number) => <option
                      value = {index}
                      key = {index}
                    >
                      {(rnaMolecule.current as RnaMolecule.Component).state.name}
                    </option>)}
                  </select>
                </>}
              </td>
              <td
                style = {tableStyle}
              >
                <input
                  style = {{
                    width : tableColumnWidth
                  }}
                  type = "number"
                  placeholder = {fivePrimeNucleotidePlaceholderText}
                  value = {this.state.fivePrimeNucleotideIndexAsText}
                  onChange = {e => {
                    let newFivePrimeNucleotideIndex = Number.parseInt(e.target.value);
                    this.setState({
                      fivePrimeNucleotideIndexAsText : e.target.value
                    });
                    if (Number.isNaN(newFivePrimeNucleotideIndex)) {
                      return;
                    }
                    this.setState({
                      fivePrimeNucleotideIndex : newFivePrimeNucleotideIndex
                    });
                    this.updateDisableButtonFlag(
                      this.state.fivePrimeSelectValue,
                      this.state.threePrimeSelectValue,
                      newFivePrimeNucleotideIndex,
                      this.state.threePrimeNucleotideIndex,
                      this.state.length
                    );
                  }}
                />
              </td>
              <td
                style = {tableStyle}
              >
                <select
                  ref = {this.threePrimeSelect}
                  value = {this.state.threePrimeSelectValue}
                  onChange = {e => {
                    let newThreePrimeSelectValue = Number.parseInt(e.target.value);
                    this.setState({
                      threePrimeSelectValue : newThreePrimeSelectValue
                    });
                    this.updateDisableButtonFlag(
                      this.state.fivePrimeSelectValue,
                      newThreePrimeSelectValue,
                      this.state.fivePrimeNucleotideIndex,
                      this.state.threePrimeNucleotideIndex,
                      this.state.length
                    );
                  }}
                >
                  <option
                    style = {{
                      display : "none"
                    }}
                    value = {-1}
                  >
                    3' RNA molecule
                  </option>
                  {this.props.rnaComplex.state.rnaMoleculeReferences.map((rnaMolecule : React.RefObject<RnaMolecule.Component>, index : number) => <option
                    style = {{
                      backgroundColor : "inherit"
                    }}
                    value = {index}
                    key = {index}
                  >
                    {(rnaMolecule.current as RnaMolecule.Component).state.name}
                  </option>)}
                </select>
              </td>
              <td
                style = {tableStyle}
              >
                <input
                  style = {{
                    width : tableColumnWidth
                  }}
                  type = "number"
                  placeholder = {threePrimeNucleotidePlaceholderText}
                  value = {this.state.threePrimeNucleotideIndexAsText}
                  onChange = {e => {
                    let newThreePrimeNucleotideIndex = Number.parseInt(e.target.value);
                    this.setState({
                      threePrimeNucleotideIndexAsText : e.target.value
                    });
                    if (Number.isNaN(newThreePrimeNucleotideIndex)) {
                      return;
                    }
                    this.setState({
                      threePrimeNucleotideIndex : newThreePrimeNucleotideIndex
                    });
                    this.updateDisableButtonFlag(
                      this.state.fivePrimeSelectValue,
                      this.state.threePrimeSelectValue,
                      this.state.fivePrimeNucleotideIndex,
                      newThreePrimeNucleotideIndex,
                      this.state.length
                    );
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
                  type = "number"
                  placeholder = {helixLengthPlaceholderText}
                  value = {this.state.lengthAsText}
                  onChange = {e => {
                    let newLength = Number.parseInt(e.target.value);
                    this.setState({
                      lengthAsText : e.target.value
                    });
                    if (Number.isNaN(newLength)) {
                      return;
                    }
                    this.setState({
                      length : newLength
                    });
                    this.updateDisableButtonFlag(
                      this.state.fivePrimeSelectValue,
                      this.state.threePrimeSelectValue,
                      this.state.fivePrimeNucleotideIndex,
                      this.state.threePrimeNucleotideIndex,
                      newLength
                    );
                  }}
                />
              </td>
              <td
                style = {tableStyle}
              >
                <button
                  style = {{
                    backgroundColor : this.state.disableAddHelixFlag ? "rgb(139, 0, 0)" : "inherit",
                    width : tableColumnWidth
                  }}
                  onClick = {() => {
                    this.deleteBasePairs(
                      this.state.fivePrimeSelectValue,
                      this.state.threePrimeSelectValue,
                      this.state.fivePrimeNucleotideIndex as number,
                      this.state.threePrimeNucleotideIndex as number,
                      this.state.length as number
                    );
                    this.createBasePairs(
                      this.state.fivePrimeSelectValue,
                      this.state.threePrimeSelectValue,
                      this.state.fivePrimeNucleotideIndex as number,
                      this.state.threePrimeNucleotideIndex as number,
                      this.state.length as number
                    );
                    this.setState(prevState => ({
                      fivePrimeSelectValue : -1,
                      threePrimeSelectValue : -1,
                      fivePrimeNucleotideIndex : undefined,
                      threePrimeNucleotideIndex : undefined,
                      length : undefined,
                      fivePrimeNucleotideIndexAsText : "",
                      threePrimeNucleotideIndexAsText : "",
                      lengthAsText : "",
                      disableAddHelixFlag : true,
                      contiguousBasePairProps : [
                        ...prevState.contiguousBasePairProps,
                        {
                          fivePrimeRnaMoleculeIndex : this.state.fivePrimeSelectValue,
                          threePrimeRnaMoleculeIndex : this.state.threePrimeSelectValue,
                          fivePrimeNucleotideIndex : this.state.fivePrimeNucleotideIndex as number,
                          threePrimeNucleotideIndex : this.state.threePrimeNucleotideIndex as number,
                          length : this.state.length as number
                        }
                      ]
                    }));
                  }}
                >
                  Add Helix
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        {!this.props.multipleHelicesFlag && "This selection constraint supports only one helix."}
      </>;
    }
  }
}

const tableStyle = {
  border : "1px solid"
};

const tableColumnWidth = "100px";

export namespace ContiguousBasePairs {
  export type PartialProps = {
    fivePrimeRnaMoleculeIndex : number,
    threePrimeRnaMoleculeIndex : number,
    fivePrimeNucleotideIndex : number,
    threePrimeNucleotideIndex : number,
    length : number
  };

  export type OptionalProps = Partial<PartialProps>;

  export type Props = PartialProps & {
    rnaComplex : RnaComplex.Component,
    fivePrimeNucleotidePlaceholderText : string,
    threePrimeNucleotidePlaceholderText : string,
    helixLengthPlaceholderText : string,
    index : number,
    removeHelix : (index : number) => void,
    createBasePairs : (fivePrimeRnaMoleculeIndex : number, threePrimeRnaMoleculeIndex : number, fivePrimeNucleotideIndex : number, threePrimeNucleotideIndex : number, length : number) => void
    deleteBasePairs : (fivePrimeRnaMoleculeIndex : number, threePrimeRnaMoleculeIndex : number, fivePrimeNucleotideIndex : number, threePrimeNucleotideIndex : number, length : number) => void
  };

  export type State = PartialProps & {
    fivePrimeNucleotideIndexAsText : string,
    threePrimeNucleotideIndexAsText : string,
    lengthAsText : string
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = {
        fivePrimeRnaMoleculeIndex : props.fivePrimeRnaMoleculeIndex,
        fivePrimeNucleotideIndex : props.fivePrimeNucleotideIndex,
        threePrimeRnaMoleculeIndex : props.threePrimeRnaMoleculeIndex,
        threePrimeNucleotideIndex : props.threePrimeNucleotideIndex,
        length : props.length,
        fivePrimeNucleotideIndexAsText : props.fivePrimeNucleotideIndex.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
        threePrimeNucleotideIndexAsText : props.threePrimeNucleotideIndex.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
        lengthAsText : props.length.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
      };
    }

    public override componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
      if (this.props.fivePrimeRnaMoleculeIndex !== prevProps.fivePrimeRnaMoleculeIndex) {
        this.setState({
          fivePrimeRnaMoleculeIndex : this.props.fivePrimeRnaMoleculeIndex
        });
      }
      if (this.props.threePrimeRnaMoleculeIndex !== prevProps.threePrimeRnaMoleculeIndex) {
        this.setState({
          threePrimeRnaMoleculeIndex : this.props.threePrimeRnaMoleculeIndex
        });
      }
      if (this.props.fivePrimeNucleotideIndex !== prevProps.fivePrimeNucleotideIndex) {
        this.setState({
          fivePrimeNucleotideIndex : this.props.fivePrimeNucleotideIndex,
          fivePrimeNucleotideIndexAsText : this.props.fivePrimeNucleotideIndex.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
        });
      }
      if (this.props.threePrimeNucleotideIndex !== prevProps.threePrimeNucleotideIndex) {
        this.setState({
          threePrimeNucleotideIndex : this.props.threePrimeNucleotideIndex,
          threePrimeNucleotideIndexAsText : this.props.threePrimeNucleotideIndex.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
        });
      }
      if (this.props.length !== prevProps.length) {
        this.setState({
          length : this.props.length,
          lengthAsText : this.props.length.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
        })
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
            value = {this.state.fivePrimeRnaMoleculeIndex}
            onChange = {e => {
              let newFivePrimeRnaMoleculeIndex = Number.parseInt(e.target.value);
              this.props.deleteBasePairs(
                this.state.fivePrimeRnaMoleculeIndex,
                this.state.threePrimeRnaMoleculeIndex,
                this.state.fivePrimeNucleotideIndex,
                this.state.threePrimeNucleotideIndex,
                this.state.length
              );
              this.props.createBasePairs(
                newFivePrimeRnaMoleculeIndex,
                this.state.threePrimeRnaMoleculeIndex,
                this.state.fivePrimeNucleotideIndex,
                this.state.threePrimeNucleotideIndex,
                this.state.length
              );
              this.setState({
                fivePrimeRnaMoleculeIndex : newFivePrimeRnaMoleculeIndex
              });
            }}
          >
            <option
              style = {{
                display : "none"
              }}
              value = {-1}
            >
              5' RNA molecule
            </option>
            {this.props.rnaComplex.state.rnaMoleculeReferences.map((rnaMoleculeReference : React.RefObject<RnaMolecule.Component>, index : number) => {
              let rnaMolecule = rnaMoleculeReference.current as RnaMolecule.Component;
              return <option
                key = {index}
                value = {index}
              >
                {rnaMolecule.state.name}
              </option>;
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
            type = "number"
            placeholder = {this.props.fivePrimeNucleotidePlaceholderText}
            value = {this.state.fivePrimeNucleotideIndexAsText}
            onChange = {e => {
              let newFivePrimeNucleotideIndex = Number.parseInt(e.target.value);
              this.setState({
                fivePrimeNucleotideIndexAsText : e.target.value
              });
              if (Number.isNaN(newFivePrimeNucleotideIndex)) {
                return;
              }
              this.props.deleteBasePairs(
                this.state.fivePrimeRnaMoleculeIndex,
                this.state.threePrimeRnaMoleculeIndex,
                this.state.fivePrimeNucleotideIndex,
                this.state.threePrimeNucleotideIndex,
                this.state.length
              );
              this.props.createBasePairs(
                this.state.fivePrimeRnaMoleculeIndex,
                this.state.threePrimeRnaMoleculeIndex,
                newFivePrimeNucleotideIndex,
                this.state.threePrimeNucleotideIndex,
                this.state.length
              );
              this.setState({
                fivePrimeNucleotideIndex : newFivePrimeNucleotideIndex
              });
            }}
          />
        </td>
        <td
          style = {tableStyle}
        >
          <select
            value = {this.state.threePrimeRnaMoleculeIndex}
            onChange = {e => {
              let newThreePrimeRnaMoleculeIndex = Number.parseInt(e.target.value);
              this.props.deleteBasePairs(
                this.state.fivePrimeRnaMoleculeIndex,
                this.state.threePrimeRnaMoleculeIndex,
                this.state.fivePrimeNucleotideIndex,
                this.state.threePrimeNucleotideIndex,
                this.state.length
              );
              this.props.createBasePairs(
                this.state.fivePrimeRnaMoleculeIndex,
                newThreePrimeRnaMoleculeIndex,
                this.state.fivePrimeNucleotideIndex,
                this.state.threePrimeNucleotideIndex,
                this.state.length
              );
              this.setState({
                threePrimeRnaMoleculeIndex : newThreePrimeRnaMoleculeIndex
              });
            }}
          >
            <option
              style = {{
                display : "none"
              }}
              value = {-1}
            >
              3' RNA molecule
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
            type = "number"
            placeholder = {this.props.threePrimeNucleotidePlaceholderText}
            value = {this.state.threePrimeNucleotideIndexAsText}
            onChange = {e => {
              let newThreePrimeNucleotideIndex = Number.parseInt(e.target.value);
              this.setState({
                threePrimeNucleotideIndexAsText : e.target.value
              });
              if (Number.isNaN(newThreePrimeNucleotideIndex)) {
                return;
              }
              this.props.deleteBasePairs(
                this.state.fivePrimeRnaMoleculeIndex,
                this.state.threePrimeRnaMoleculeIndex,
                this.state.fivePrimeNucleotideIndex,
                this.state.threePrimeNucleotideIndex,
                this.state.length
              );
              this.props.createBasePairs(
                this.state.fivePrimeRnaMoleculeIndex,
                this.state.threePrimeRnaMoleculeIndex,
                this.state.fivePrimeNucleotideIndex,
                newThreePrimeNucleotideIndex,
                this.state.length
              );
              this.setState({
                threePrimeNucleotideIndex : newThreePrimeNucleotideIndex
              })
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
            type = "number"
            placeholder = {this.props.helixLengthPlaceholderText}
            value = {this.state.lengthAsText}
            onChange = {e => {
              let newLength = Number.parseFloat(e.target.value);
              this.setState({
                lengthAsText : e.target.value
              });
              if (Number.isNaN(newLength)) {
                return;
              }
              this.props.deleteBasePairs(
                this.state.fivePrimeRnaMoleculeIndex,
                this.state.threePrimeRnaMoleculeIndex,
                this.state.fivePrimeNucleotideIndex,
                this.state.threePrimeNucleotideIndex,
                this.state.length
              );
              this.props.createBasePairs(
                this.state.fivePrimeRnaMoleculeIndex,
                this.state.threePrimeRnaMoleculeIndex,
                this.state.fivePrimeNucleotideIndex,
                this.state.threePrimeNucleotideIndex,
                newLength
              );
              this.setState({
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
            onClick = {() => {}}
          >
            Update
          </button>
          <br/>
          <button
            style = {{
              width : tableColumnWidth
            }}
            onClick = {() => this.props.removeHelix(this.props.index)}
          >
            Delete
          </button>
        </td>
      </tr>;
    }
  }
}