import React, { createRef } from "react";
import { App, DEFAULT_STROKE_WIDTH } from "../App";
import Color from "../data_structures/Color";
import Font from "../data_structures/Font";
import Vector2D from "../data_structures/Vector2D";
import { SelectionConstraint } from "../input_output/selectionConstraints";

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

  export type LabelLine = {
    endpoint0 : Vector2D,
    endpoint1 : Vector2D,
    strokeWidth : number,
    stroke : Color
  };

  export type LabelContent = {
    position : Vector2D,
    content : string,
    font : Font,
    stroke : Color,
    graphicalAdjustment : Vector2D
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
    labelLine? : LabelLine | undefined,
    labelContent? : LabelContent | undefined
  };

  type State = {
    position : Vector2D,
    stroke : Color,
    font : Font,
    basePair : BasePair | undefined,
    labelLine : LabelLine | undefined,
    labelContent : LabelContent | undefined,
    graphicalAdjustment : Vector2D,
    basePairJsx : JSX.Element | undefined,
    displayLabelLineEndpoint0MouseoverFlag : boolean,
    displayLabelLineEndpoint1MouseoverFlag : boolean,
    displayLabelLineCenterMouseoverFlag : boolean,
    displayLabelContentMouseoverFlag : boolean,
    displaySymbolMouseoverFlag : boolean,
    labelContentBoundingBoxWidth : number,
    labelContentBoundingBoxHeight : number,
    symbolBoundingBoxWidth : number,
    symbolBoundingBoxHeight : number
  };

  // Begin constants.
  const MOUSE_OVER_RADIUS = 1;

  export class Component extends React.Component<Props, State> {
    // Begin references.
    private labelContent = createRef<SVGTextElement>();
    private symbol = createRef<SVGTextElement>();

    public constructor(props : Props) {
      super(props);
      this.state = ({
        position : props.position,
        stroke : props.stroke ?? Color.BLACK,
        font : props.font ?? Font.DEFAULT_FONT,
        basePair : props.basePair,
        labelLine : props.labelLine,
        labelContent : props.labelContent,
        graphicalAdjustment : new Vector2D(0, 0),
        basePairJsx : undefined,
        displayLabelLineEndpoint0MouseoverFlag : false,
        displayLabelLineEndpoint1MouseoverFlag : false,
        displayLabelLineCenterMouseoverFlag : false,
        displayLabelContentMouseoverFlag : false,
        displaySymbolMouseoverFlag : false,
        labelContentBoundingBoxWidth : 0,
        labelContentBoundingBoxHeight : 0,
        symbolBoundingBoxWidth : 0,
        symbolBoundingBoxHeight : 0
      });
    }

    public isGreaterIndexInBasePair(basePair : BasePair) {
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
              stroke = {this.state.basePair.stroke.toCSS()}
              strokeWidth = {this.state.basePair.strokeWidth}
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
              stroke = {this.state.basePair.stroke.toCSS()}
              strokeWidth = {this.state.basePair.strokeWidth}
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
              fill = {this.state.basePair.stroke.toCSS()}
              stroke = "none"
              strokeWidth = {this.state.basePair.strokeWidth}
            />
          })
          break;
        }
      }
    }

    public override componentDidMount() {
      if (this.state.labelContent !== undefined) {
        let labelContentBoundingBox = (this.labelContent.current as SVGTextElement).getBBox();
        this.state.labelContent.graphicalAdjustment = new Vector2D(labelContentBoundingBox.width * -0.5, labelContentBoundingBox.height * -0.25);
        this.setState({
          labelContentBoundingBoxWidth : labelContentBoundingBox.width,
          labelContentBoundingBoxHeight : labelContentBoundingBox.height
        });
      }
      let symbolBoundingBox = (this.symbol.current as SVGTextElement).getBBox();
      this.setState({
        graphicalAdjustment : new Vector2D(symbolBoundingBox.width * -0.5, symbolBoundingBox.height * -0.25),
        symbolBoundingBoxWidth : symbolBoundingBox.width,
        symbolBoundingBoxHeight : symbolBoundingBox.height
      });
      
      if (this.state.basePair && this.isGreaterIndexInBasePair(this.state.basePair)) {
        this.updateBasePairJsxWithCurrentPositions();
      }
    }

    public override render() {
      const optionalChildren : Array<JSX.Element> = new Array<JSX.Element>();
      const labelContent = this.state.labelContent;
      const labelLine = this.state.labelLine;
      if (labelContent) {
        optionalChildren.push(<text
          key = "labelContent"
          ref = {this.labelContent}
          fontSize = {labelContent.font.size}
          fontFamily = {labelContent.font.family}
          fontWeight = {labelContent.font.weight}
          fontStyle = {labelContent.font.style}
          fill = {labelContent.stroke.toCSS()}
          transform = {`translate(${labelContent.position.x + labelContent.graphicalAdjustment.x} ${labelContent.position.y + labelContent.graphicalAdjustment.y}) scale(1 -1)`}
        >
          {labelContent.content}
        </text>,
        <rect
          key = "labelContentBoundingBox"
          fill = "none"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          visibility = {this.state.displayLabelContentMouseoverFlag && App.Component.getCurrent().state.currentTab === App.Tab.EDIT ? "visible" : "hidden"}
          transform = {`translate(${labelContent.position.x + labelContent.graphicalAdjustment.x} ${labelContent.position.y + labelContent.graphicalAdjustment.y})`}
          width = {this.state.labelContentBoundingBoxWidth}
          height = {this.state.labelContentBoundingBoxHeight}
          pointerEvents = "all"
          onMouseDown = {() => {
            const nucleotide : Component = this;
            App.Component.getCurrent().setState({
              activeDragListener : {
                isWindowDragListenerFlag : false,
                getCachedDrag() {
                  return labelContent.position;
                },
                drag (totalDrag : Vector2D) {
                  labelContent.position = totalDrag;
                  nucleotide.setState({
                    // No other changes.
                  });
                },
                affectedNucleotides : [nucleotide]
              }
            })
          }}
          onMouseEnter = {() => {
            if (App.Component.getCurrent().state.activeDragListener === null) {
              this.setState({
                displayLabelContentMouseoverFlag : true,
              });
            }
          }}
          onMouseLeave = {() => {
            if (App.Component.getCurrent().state.activeDragListener === null) {
              this.setState({
                displayLabelContentMouseoverFlag : false
              })
            }
          }}
        />);
      }
      if (labelLine) {
        optionalChildren.push(<line
          key = "labelLine"
          x1 = {labelLine.endpoint0.x}
          y1 = {labelLine.endpoint0.y}
          x2 = {labelLine.endpoint1.x}
          y2 = {labelLine.endpoint1.y}
          stroke = {labelLine.stroke.toCSS()}
          strokeWidth = {labelLine.strokeWidth}
        />,
        <circle
          key = "draggableEndpoint0"
          pointerEvents = "all"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          fill = "none"
          cx = {labelLine.endpoint0.x}
          cy = {labelLine.endpoint0.y}
          r = {MOUSE_OVER_RADIUS}
          visibility = {this.state.displayLabelLineEndpoint0MouseoverFlag && App.Component.getCurrent().state.currentTab === App.Tab.EDIT ? "visible" : "hidden"}
          onMouseEnter = {() => {
            if (App.Component.getCurrent().state.activeDragListener === null) {
              this.setState({
                displayLabelLineEndpoint0MouseoverFlag : true
              });
            }
          }}
          onMouseLeave = {() => {
            if (App.Component.getCurrent().state.activeDragListener === null) {
              this.setState({
                displayLabelLineEndpoint0MouseoverFlag : false
              })
            }
          }}
          onMouseDown = {() => {
            let nucleotide : Component = this;
            App.Component.getCurrent().setState({
              activeDragListener : {
                isWindowDragListenerFlag : false,
                getCachedDrag() {
                  return labelLine.endpoint0;
                },
                drag(totalDrag : Vector2D) {
                  labelLine.endpoint0 = totalDrag;
                  nucleotide.setState({
                    // No other changes.
                  });
                },
                affectedNucleotides : [nucleotide]
              }
            });
          }}
        />,
        <circle
          key = "draggableEndpoint1"
          pointerEvents = "all"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          fill = "none"
          cx = {labelLine.endpoint1.x}
          cy = {labelLine.endpoint1.y}
          r = {MOUSE_OVER_RADIUS}
          visibility = {this.state.displayLabelLineEndpoint1MouseoverFlag && App.Component.getCurrent().state.currentTab === App.Tab.EDIT ? "visible" : "hidden"}
          onMouseEnter = {() => {
            if (App.Component.getCurrent().state.activeDragListener === null) {
              this.setState({
                displayLabelLineEndpoint1MouseoverFlag : true
              });
            }
          }}
          onMouseLeave = {() => {
            if (App.Component.getCurrent().state.activeDragListener === null) {
              this.setState({
                displayLabelLineEndpoint1MouseoverFlag : false
              });
            }
          }}
          onMouseDown = {() => {
            let nucleotide : Component = this;
            App.Component.getCurrent().setState({
              activeDragListener : {
                isWindowDragListenerFlag : false,
                getCachedDrag() {
                  return labelLine.endpoint1;
                },
                drag(totalDrag : Vector2D) {
                  labelLine.endpoint1 = totalDrag;
                  nucleotide.setState({
                    // No other changes.
                  });
                },
                affectedNucleotides : [nucleotide]
              }
            });
          }}
        />);
        let difference = Vector2D.subtract(labelLine.endpoint1, labelLine.endpoint0);
        let scaledOrthogonal = Vector2D.scaleUp(Vector2D.orthogonalize(difference), MOUSE_OVER_RADIUS / Vector2D.magnitude(difference));
        let endpoint0TranslatedPositively = Vector2D.add(labelLine.endpoint0, scaledOrthogonal);
        let endpoint0TranslatedNegatively = Vector2D.subtract(labelLine.endpoint0, scaledOrthogonal);
        let endpoint1TranslatedPositively = Vector2D.add(labelLine.endpoint1, scaledOrthogonal);
        let endpoint1TranslatedNegatively = Vector2D.subtract(labelLine.endpoint1, scaledOrthogonal);
        let endpointPositionDifference : Vector2D;
        optionalChildren.push(<path
          key = "draggableBody"
          pointerEvents = "all"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          fill = "none"
          d = {`M ${endpoint0TranslatedPositively.x} ${endpoint0TranslatedPositively.y} A ${MOUSE_OVER_RADIUS} ${MOUSE_OVER_RADIUS} 0 0 0 ${endpoint0TranslatedNegatively.x} ${endpoint0TranslatedNegatively.y} L ${endpoint1TranslatedNegatively.x} ${endpoint1TranslatedNegatively.y} A ${MOUSE_OVER_RADIUS} ${MOUSE_OVER_RADIUS} 0 0 0 ${endpoint1TranslatedPositively.x} ${endpoint1TranslatedPositively.y} z`}
          visibility = {this.state.displayLabelLineCenterMouseoverFlag && App.Component.getCurrent().state.currentTab === App.Tab.EDIT ? "visible" : "hidden"}
          onMouseEnter = {() => {
            if (App.Component.getCurrent().state.activeDragListener === null) {
              this.setState({
                displayLabelLineCenterMouseoverFlag : true
              });
            }
          }}
          onMouseLeave = {() => {
            if (App.Component.getCurrent().state.activeDragListener === null) {
              this.setState({
                displayLabelLineCenterMouseoverFlag : false
              });
            }
          }}
          onMouseDown = {() => {
            let nucleotide : Component = this;
            App.Component.getCurrent().setState({
              activeDragListener : {
                isWindowDragListenerFlag : false,
                getCachedDrag() {
                  endpointPositionDifference = Vector2D.subtract(labelLine.endpoint1, labelLine.endpoint0);
                  return labelLine.endpoint0;
                },
                drag(totalDrag : Vector2D) {
                  labelLine.endpoint0 = totalDrag;
                  labelLine.endpoint1 = Vector2D.add(totalDrag, endpointPositionDifference);
                  nucleotide.setState({
                    // No other changes.
                  });
                },
                affectedNucleotides : []
              }
            });
          }}
        />);
      }
      return <g
        transform = {`translate(${this.state.position.x} ${this.state.position.y})`}
      >
        <text
          ref = {this.symbol}
          style = {{
            fontSize : this.state.font.size,
            fontFamily : this.state.font.family,
            fontWeight : this.state.font.weight,
            fontStyle : this.state.font.style,
            fill : this.state.stroke.toCSS()
          }}
          transform = {`translate(${this.state.graphicalAdjustment.x} ${this.state.graphicalAdjustment.y}) scale(1 -1)`}
        >
          {this.props.symbol}
        </text>
        <rect
          fill = "none"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          visibility = {this.state.displaySymbolMouseoverFlag && App.Component.getCurrent().state.currentTab === App.Tab.EDIT ? "visible" : "hidden"}
          transform = {`translate(${this.state.graphicalAdjustment.x} ${this.state.graphicalAdjustment.y})`}
          width = {this.state.symbolBoundingBoxWidth}
          height = {this.state.symbolBoundingBoxHeight}
          pointerEvents = "all"
          onMouseDown = {event => {
            let app = App.Component.getCurrent();
            let selectionConstraint = SelectionConstraint.selectionConstraints[app.state.selectionConstraint];
            switch (event.button) {
              case 0 : {
                // Left mouse button
                let dragAttempt = selectionConstraint.attemptDrag(this);
                if (typeof dragAttempt === "string") {
                  alert(dragAttempt);
                } else {
                  app.setState({
                    activeDragListener : dragAttempt
                  });
                }
                break;
              }
              case 1 : {
                // Middle mouse button
                break;
              }
              case 2 : {
                // Right mouse button
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
            let currentAppComponent = App.Component.getCurrent();
            if (currentAppComponent.state.activeDragListener === null) {
              this.setState({
                displaySymbolMouseoverFlag : true
              });
              let rnaMolecule = App.Component.getCurrent().state.rnaComplexes[this.props.rnaComplexIndex].props.rnaMolecules[this.props.rnaMoleculeIndex];
              currentAppComponent.setState({
                mouseOverText : `Nucleotide #${this.props.nucleotideIndex + rnaMolecule.props.firstNucleotideIndex} (${this.props.symbol}) in RNA molecule \"${rnaMolecule.props.name}\"`
              });
            }
          }}
          onMouseLeave = {() => {
            if (App.Component.getCurrent().state.activeDragListener === null) {
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
      }
      throw `Unsupported base-pair type between ${symbol0} and ${symbol1}`;
    }
  }
}