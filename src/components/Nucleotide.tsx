import React, { createRef } from "react";
import { App, DEFAULT_STROKE_WIDTH } from "../App";
import Color, { BLACK, toCSS } from "../data_structures/Color";
import Font from "../data_structures/Font";
import Vector2D from "../data_structures/Vector2D";
import { SelectionConstraint } from "../input_output/selectionConstraints";
import { LabelContent } from "./LabelContent";
import { LabelLine } from "./LabelLine";

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
    rnaComplexIndex : number,
    rnaMoleculeIndex : number,
    nucleotideIndex : number,
    symbol : Symbol,
    position : Vector2D,
    stroke? : Color | undefined,
    font? : Font | undefined,
    basePair? : BasePair | undefined,
    labelLineProps? : LabelLine.PartialProps | undefined,
    labelContentProps? : LabelContent.PartialProps | undefined
  };

  type State = {
    position : Vector2D,
    stroke : Color,
    font : Font,
    basePair : BasePair | undefined,
    graphicalAdjustment : Vector2D,
    basePairJsx : JSX.Element | undefined,
    displaySymbolMouseoverFlag : boolean,
    symbolBoundingBoxWidth : number,
    symbolBoundingBoxHeight : number,
    labelLineProps? : LabelLine.PartialProps | undefined,
    labelContentProps? : LabelContent.PartialProps | undefined
  };

  export class Component extends React.Component<Props, State> {
    // Begin references.
    private symbolReference = createRef<SVGTextElement>();
    public readonly labelContentReference = createRef<LabelContent.Component>();
    public readonly labelLineReference = createRef<LabelLine.Component>();

    public constructor(props : Props) {
      super(props);
      this.state = ({
        position : props.position,
        stroke : props.stroke ?? BLACK,
        font : props.font ?? Font.DEFAULT_FONT,
        basePair : props.basePair,
        graphicalAdjustment : new Vector2D(0, 0),
        basePairJsx : undefined,
        displaySymbolMouseoverFlag : false,
        symbolBoundingBoxWidth : 0,
        symbolBoundingBoxHeight : 0,
        labelLineProps : props.labelLineProps,
        labelContentProps : props.labelContentProps
      });
    }

    public isGreaterIndexInBasePair() {
      let basePair = this.state.basePair;
      if (basePair === undefined) {
        throw "Undefined condition";
      }
      return basePair.rnaMoleculeIndex < this.props.rnaMoleculeIndex || (basePair.rnaMoleculeIndex === this.props.rnaMoleculeIndex && basePair.nucleotideIndex < this.props.nucleotideIndex);
    }

    public updateBasePairJsxWithCurrentPositions() : void {
      if (this.state.basePair === undefined) {
        return;
      }
      const rnaComplex = App.Component.getCurrent().state.rnaComplexes[this.props.rnaComplexIndex];
      const basePairNucleotide = rnaComplex.props.rnaMolecules[this.state.basePair.rnaMoleculeIndex].findNucleotideByIndex(this.state.basePair.nucleotideIndex).arrayEntry.nucleotideReference.current as Nucleotide.Component;
      this.updateBasePairJsx(this.state.position, basePairNucleotide.state.position);
    }

    public updateBasePairJsx(nucleotidePosition : Vector2D, basePairedNucleotidePosition : Vector2D) : void {
      if (this.state.basePair === undefined) {
        return;
      }
      const rnaComplex = App.Component.getCurrent().state.rnaComplexes[this.props.rnaComplexIndex];
      let basePairCircleRadius = rnaComplex.props.rnaMolecules[this.props.rnaMoleculeIndex].getBasePairCircleRadius();
      let basePairedRnaMoleculeIndex = this.state.basePair.rnaMoleculeIndex;
      if (this.props.rnaMoleculeIndex !== basePairedRnaMoleculeIndex) {
        basePairCircleRadius = (basePairCircleRadius + rnaComplex.props.rnaMolecules[basePairedRnaMoleculeIndex].getBasePairCircleRadius()) * 0.5;
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

    public override componentDidMount() {
      let symbolBoundingBox = (this.symbolReference.current as SVGTextElement).getBBox();
      this.setState({
        graphicalAdjustment : new Vector2D(symbolBoundingBox.width * -0.5, symbolBoundingBox.height * -0.25),
        symbolBoundingBoxWidth : symbolBoundingBox.width,
        symbolBoundingBoxHeight : symbolBoundingBox.height
      });
      
      if (this.state.basePair && this.isGreaterIndexInBasePair()) {
        this.updateBasePairJsxWithCurrentPositions();
      }
    }

    public override render() {
      const app = App.Component.getCurrent();
      const optionalChildren : Array<JSX.Element> = new Array<JSX.Element>();
      const labelContentProps = this.state.labelContentProps;
      const labelLineProps = this.state.labelLineProps;
      if (labelContentProps !== undefined) {
        optionalChildren.push(<LabelContent.Component
          ref = {this.labelContentReference}
          key = "labelContent"
          nucleotide = {this}
          {...Object.assign(labelContentProps)}
        />);
      }
      if (labelLineProps !== undefined) {
        optionalChildren.push(<LabelLine.Component
          ref = {this.labelLineReference}
          key = "labelLine"
          nucleotide = {this}
          {...Object.assign(labelLineProps)}
        />);
      }
      return <g
        transform = {`translate(${this.state.position.x} ${this.state.position.y})`}
      >
        <text
          ref = {this.symbolReference}
          style = {{
            fontSize : this.state.font.size,
            fontFamily : this.state.font.family,
            fontWeight : this.state.font.weight,
            fontStyle : this.state.font.style,
            fill : toCSS(this.state.stroke)
          }}
          transform = {`translate(${this.state.graphicalAdjustment.x} ${this.state.graphicalAdjustment.y}) scale(1 -1)`}
        >
          {this.props.symbol}
        </text>
        <rect
          fill = "none"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          visibility = {this.state.displaySymbolMouseoverFlag && app.state.currentTab === App.Tab.EDIT ? "visible" : "hidden"}
          transform = {`translate(${this.state.graphicalAdjustment.x} ${this.state.graphicalAdjustment.y})`}
          width = {this.state.symbolBoundingBoxWidth}
          height = {this.state.symbolBoundingBoxHeight}
          pointerEvents = "all"
          onMouseDown = {event => {
            let selectionConstraint = SelectionConstraint.selectionConstraints[app.state.selectionConstraint];
            switch (event.button) {
              case App.MOUSE_BUTTON_INDICES.LEFT : {
                if (app.state.currentTab === App.Tab.EDIT) {
                  let dragAttempt = selectionConstraint.attemptDrag(this);
                  if (typeof dragAttempt === "string") {
                    alert(dragAttempt);
                  } else {
                    app.setState({
                      activeDragListener : dragAttempt
                    });
                  }
                } else {
                  app.setState({
                    activeDragListener : app.windowDragListener
                  })
                }
                break;
              }
              case App.MOUSE_BUTTON_INDICES.RIGHT : {
                let rightClickMenuOrErrorMessage : SelectionConstraint.RightClickMenu | string;
                switch (app.state.currentTab) {
                  case App.Tab.ANNOTATE : {
                    rightClickMenuOrErrorMessage = selectionConstraint.getAnnotateMenuContent(this);
                    break;
                  }
                  case App.Tab.EDIT : {
                    rightClickMenuOrErrorMessage = selectionConstraint.getEditMenuContent(this);
                    break;
                  }
                  case App.Tab.FORMAT : {
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
            let currentAppComponent = app;
            if (currentAppComponent.state.activeDragListener === null) {
              this.setState({
                displaySymbolMouseoverFlag : true
              });
              let rnaMolecule = app.state.rnaComplexes[this.props.rnaComplexIndex].props.rnaMolecules[this.props.rnaMoleculeIndex];
              currentAppComponent.setState({
                mouseOverText : `Nucleotide #${this.props.nucleotideIndex + rnaMolecule.props.firstNucleotideIndex} (${this.props.symbol}) in RNA molecule \"${rnaMolecule.state.name}\"`
              });
            }
          }}
          onMouseLeave = {() => {
            if (app.state.activeDragListener === null) {
              this.setState({
                displaySymbolMouseoverFlag : false
              })
            }
          }}
        />
        {this.state.basePairJsx}
        {optionalChildren}
      </g>;
    }

    public static getBasePairType(symbol0 : Symbol, symbol1 : Symbol) : BasePairType {
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
          return BasePairType.MISMATCH;
        case "G_U":
        case "U_G":
          return BasePairType.WOBBLE;
        case "A_U":
        case "U_A":
        case "C_G":
        case "G_C":
          return BasePairType.CANONICAL;
        default:
          throw `Unsupported base-pair type between ${symbol0} and ${symbol1}`;
      }
    }
  }
}