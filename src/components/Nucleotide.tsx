import React from "react";
import { App, DEFAULT_STROKE_WIDTH, svgContentReference } from "../App";
import Color, { toCSS, BLACK } from "../data_structures/Color";
import Font from "../data_structures/Font";
import Vector2D from "../data_structures/Vector2D";
import { LabelContent } from "./LabelContent";
import { LabelLine } from "./LabelLine";
import { RnaComplex } from "./RnaComplex";
import { findNucleotideReferenceByIndex, RnaMolecule } from "./RnaMolecule";
import { SelectionConstraint } from "./SelectionConstraints";

export namespace Nucleotide {
  export type Symbol = "A" | "C" | "G" | "U" | "5" | "3" | "5'" | "3'";

  export enum BasePairType {
    CANONICAL = "canonical",
    WOBBLE = "wobble",
    MISMATCH = "mismatch"
  }

  export type BasePair = {
    rnaMoleculeIndex : number,
    nucleotideIndex : number,
    type : BasePairType,
    strokeWidth : number,
    stroke : Color
  };
  
  export type Props = {
    symbol : Symbol,
    rnaComplexIndex : number,
    rnaMoleculeIndex : number,
    nucleotideIndex : number,
    position : Vector2D,
    stroke? : Color | undefined,
    font? : Font | undefined,
    strokeWidth? : number | undefined,
    basePair? : BasePair | undefined,
    labelLineProps? : LabelLine.PartialProps | undefined,
    labelContentProps? : LabelContent.PartialProps | undefined
  };

  export type State = {
    symbol : Symbol,
    position : Vector2D,
    font : Font,
    stroke : Color,
    strokeWidth : number,
    basePair : BasePair | undefined,
    basePairJsx : React.ReactNode,
    graphicalAdjustment : Vector2D,
    displaySymbolMouseoverFlag : boolean,
    symbolBoundingBoxDimensions : {
      width : number,
      height : number
    },
    labelLineProps? : LabelLine.PartialProps | undefined,
    labelContentProps? : LabelContent.PartialProps | undefined
  };

  export class Component extends React.Component<Props, State> {
    public readonly labelLineReference = React.createRef<LabelLine.Component>();
    public readonly labelContentReference = React.createRef<LabelContent.Component>();

    private readonly symbolReference = React.createRef<SVGTextElement>();

    public constructor(props : Props) {
      super(props);
      this.state = {
        symbol : props.symbol,
        position : props.position,
        font : props.font ?? Font.DEFAULT_FONT,
        stroke : props.stroke ?? BLACK,
        strokeWidth : props.strokeWidth ?? DEFAULT_STROKE_WIDTH,
        basePair : props.basePair,
        basePairJsx : <></>,
        graphicalAdjustment : new Vector2D(0, 0),
        displaySymbolMouseoverFlag : false,
        symbolBoundingBoxDimensions : {
          width : 0,
          height : 0
        },
        labelLineProps : props.labelLineProps,
        labelContentProps : props.labelContentProps
      };
    }

    public override render() {
      const app = App.Component.getCurrent();
      const labelLineProps = this.state.labelLineProps;
      const labelContentProps = this.state.labelContentProps;
      return <g
        transform = {`translate(${this.state.position.x} ${this.state.position.y})`}
      >
        <text
          ref = {this.symbolReference}
          transform = {`translate(${this.state.graphicalAdjustment.x} ${this.state.graphicalAdjustment.y}) scale(1 -1)`}
          fontSize = {this.state.font.size}
          fontFamily = {this.state.font.family}
          fontWeight = {this.state.font.weight}
          fontStyle = {this.state.font.style}
          fill = {toCSS(this.state.stroke)}
        >
          {this.state.symbol}
        </text>
        <rect
          fill = "none"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          visibility = {this.state.displaySymbolMouseoverFlag && app.state.currentTab === App.Tab.Edit ? "visible" : "hidden"}
          transform = {`translate(${this.state.graphicalAdjustment.x} ${this.state.graphicalAdjustment.y})`}
          width = {this.state.symbolBoundingBoxDimensions.width}
          height = {this.state.symbolBoundingBoxDimensions.height}
          pointerEvents = "all"
          onMouseDown = {event => {
            let selectionConstraint = SelectionConstraint.selectionConstraints[app.state.currentSelectionConstraint];
            switch (event.button) {
              case App.MouseButtonIndices.Left : {
                if (app.state.currentTab === App.Tab.Edit) {
                  let dragAttempt = selectionConstraint.attemptDrag(this);
                  if (typeof dragAttempt === "string") {
                    alert(dragAttempt);
                  } else {
                    app.setState({
                      currentDragListener : dragAttempt
                    });
                  }
                } else {
                  app.setState({
                    currentDragListener : app.windowDragListener
                  })
                }
                break;
              }
              case App.MouseButtonIndices.Right : {
                let rightClickMenuOrErrorMessage : SelectionConstraint.RightClickMenu | string;
                switch (app.state.currentTab) {
                  case App.Tab.Annotate : {
                    rightClickMenuOrErrorMessage = selectionConstraint.getAnnotateMenuContent(this);
                    break;
                  }
                  case App.Tab.Edit : {
                    rightClickMenuOrErrorMessage = selectionConstraint.getEditMenuContent(this);
                    break;
                  }
                  case App.Tab.Format : {
                    rightClickMenuOrErrorMessage = selectionConstraint.getFormatMenuContent(this);
                    break;
                  }
                  default : {
                    rightClickMenuOrErrorMessage = `Right clicking is not supported for the "${[app.state.currentTab]}" tab.`;
                    break;
                  }
                }
                if (typeof rightClickMenuOrErrorMessage === "string") {
                  alert(rightClickMenuOrErrorMessage);
                } else {
                  app.setState({
                    rightClickMenuReference : rightClickMenuOrErrorMessage.ref,
                    rightClickMenuContent : rightClickMenuOrErrorMessage.content
                  });
                }
                break;
              }
            }
          }}
          onMouseEnter = {() => {
            if (app.state.currentDragListener === null) {
              this.setState({
                displaySymbolMouseoverFlag : true
              });
              let rnaMolecule = app.state.rnaComplexes[this.props.rnaComplexIndex].state.rnaMoleculeReferences[this.props.rnaMoleculeIndex].current as RnaMolecule.Component;
              app.setState({
                mouseOverText : `Nucleotide #${this.props.nucleotideIndex + rnaMolecule.props.firstNucleotideIndex} (${this.props.symbol}) in RNA molecule \"${rnaMolecule.state.name}\"`
              });
            }
          }}
          onMouseLeave = {() => {
            if (app.state.currentDragListener === null) {
              this.setState({
                displaySymbolMouseoverFlag : false
              })
            }
          }}
        />
        {this.state.basePairJsx}
        {labelLineProps === undefined ? <></> : <LabelLine.Component
          ref = {this.labelLineReference}
          key = "labelLine"
          nucleotide = {this}
          {...labelLineProps}
        />}
        {labelContentProps === undefined ? <></> : <LabelContent.Component
          ref = {this.labelContentReference}
          key = "labelContent"
          nucleotide = {this}
          {...labelContentProps}
        />}
      </g>;
    }

    public isGreaterIndexInBasePair() {
      let basePair = this.state.basePair;
      if (basePair === undefined) {
        throw "Undefined condition";
      }
      return basePair.rnaMoleculeIndex < this.props.rnaMoleculeIndex || (basePair.rnaMoleculeIndex === this.props.rnaMoleculeIndex && basePair.nucleotideIndex < this.props.nucleotideIndex);
    }

    public updateBasePairJsxWithCurrentPositions(rnaComplex : RnaComplex.Component = App.Component.getCurrent().state.rnaComplexes[this.props.rnaComplexIndex]) : void {
      if (this.state.basePair === undefined) {
        return;
      }
      const basePairNucleotide = findNucleotideReferenceByIndex(rnaComplex.state.rnaMoleculeReferences[this.state.basePair.rnaMoleculeIndex].current as RnaMolecule.Component, this.state.basePair.nucleotideIndex).reference.current as Nucleotide.Component;
      this.updateBasePairJsx(this.state.position, basePairNucleotide.state.position, rnaComplex);
    }

    public updateBasePairJsx(nucleotidePosition : Vector2D, basePairedNucleotidePosition : Vector2D, rnaComplex : RnaComplex.Component = App.Component.getCurrent().state.rnaComplexes[this.props.rnaComplexIndex]) : void {
      if (this.state.basePair === undefined) {
        return;
      }
      let basePairCircleRadius = (rnaComplex.state.rnaMoleculeReferences[this.props.rnaMoleculeIndex].current as RnaMolecule.Component).getBasePairCircleRadius(rnaComplex);
      let basePairedRnaMoleculeIndex = this.state.basePair.rnaMoleculeIndex;
      if (this.props.rnaMoleculeIndex !== basePairedRnaMoleculeIndex) {
        basePairCircleRadius = (basePairCircleRadius + (rnaComplex.state.rnaMoleculeReferences[basePairedRnaMoleculeIndex].current as RnaMolecule.Component).getBasePairCircleRadius(rnaComplex)) * 0.5;
      }
      const dv = Vector2D.subtract(basePairedNucleotidePosition, nucleotidePosition);
      switch (this.state.basePair.type) {
        case BasePairType.CANONICAL : {
          const v0 = Vector2D.scaleUp(dv, 0.25);
          const v1 = Vector2D.scaleUp(dv, 0.75);
          this.setState({
            basePairJsx : <line
              key = "basePair"
              x1 = {v0.x}
              y1 = {v0.y}
              x2 = {v1.x}
              y2 = {v1.y}
              stroke = {toCSS(this.state.basePair.stroke)}
              strokeWidth = {this.state.basePair.strokeWidth}
              pointerEvents = "none"
            />
          });
          break;
        }
        case BasePairType.MISMATCH : {
          const center = Vector2D.scaleUp(dv, 0.5);
          this.setState({
            basePairJsx : <circle
              key = "basePair"
              cx = {center.x}
              cy = {center.y}
              r = {basePairCircleRadius}
              fill = "none"
              stroke = {toCSS(this.state.basePair.stroke)}
              strokeWidth = {this.state.basePair.strokeWidth}
              pointerEvents = "none"
            />
          });
          break;
        }
        case BasePairType.WOBBLE : {
          const center = Vector2D.scaleUp(dv, 0.5);
          this.setState({
            basePairJsx : <circle
              key = "basePair"
              cx = {center.x}
              cy = {center.y}
              r = {basePairCircleRadius * 0.5}
              fill = {toCSS(this.state.basePair.stroke)}
              stroke = "none"
              strokeWidth = {this.state.basePair.strokeWidth}
              pointerEvents = "none"
            />
          })
          break;
        }
      }
    }

    public override componentDidUpdate(previousProps : Props, previousState : State) {
      let app = App.Component.getCurrent();
      if (this.state.symbolBoundingBoxDimensions !== previousState.symbolBoundingBoxDimensions) { 
        let rnaComplexes = app.state.rnaComplexes;
        let rnaMoleculeReferences = rnaComplexes[this.props.rnaComplexIndex].state.rnaMoleculeReferences;
        let nucleotideReferences = (rnaMoleculeReferences[this.props.rnaMoleculeIndex].current as RnaMolecule.Component).state.nucleotideReferences;
        if (this.props.rnaComplexIndex === rnaComplexes.length - 1 && this.props.rnaMoleculeIndex === rnaMoleculeReferences.length - 1 && this === nucleotideReferences[nucleotideReferences.length - 1].current) {
          // This is the last nucleotide in the scene.
          app.setState({
            svgBoundingBox : (svgContentReference.current as SVGGElement).getBBox()
          });
        }
      }
    }

    public override componentDidMount() {
      let symbolBoundingBox = (this.symbolReference.current as SVGTextElement).getBBox();
      this.setState({
        graphicalAdjustment : new Vector2D(symbolBoundingBox.width * -0.5, symbolBoundingBox.height * -0.25),
        symbolBoundingBoxDimensions : {
          width : symbolBoundingBox.width,
          height : symbolBoundingBox.height
        }
      });
    }
  }
}

export function getBasePairType(symbol0 : Nucleotide.Symbol, symbol1 : Nucleotide.Symbol) : Nucleotide.BasePairType {
  switch (`${symbol0}_${symbol1}`) {
    case "A_A":
    case "C_C":
    case "G_G":
    case "U_U":
    case "A_C":
    case "C_A":
    case "C_U":
    case "U_C":
    case "A_G":
    case "G_A":
      return Nucleotide.BasePairType.MISMATCH;
    case "G_U":
    case "U_G":
      return Nucleotide.BasePairType.WOBBLE;
    case "A_U":
    case "U_A":
    case "C_G":
    case "G_C":
      return Nucleotide.BasePairType.CANONICAL;
    default:
      throw `Unsupported base-pair type between ${symbol0} and ${symbol1}`;
  }
}