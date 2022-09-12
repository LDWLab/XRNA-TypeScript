import React, { createRef } from "react";
import { App, DEFAULT_STROKE_WIDTH, DEFAULT_TRANSLATION_MAGNITUDE, FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT } from "../App";
import Color, { ColorEditor, ColorFormat, toCSS } from "../data_structures/Color";
import Font, { FontEditor } from "../data_structures/Font";
import Vector2D from "../data_structures/Vector2D";
import { SelectionConstraint } from "../input_output/selectionConstraints";
import { Nucleotide } from "./Nucleotide";

export namespace LabelContent {
  export type PartialProps = {
    position : Vector2D,
    content : string,
    font : Font,
    stroke : Color,
    graphicalAdjustment : Vector2D,
  };

  export type Props = PartialProps & {
    nucleotide : Nucleotide.Component
  };
  
  type State = {
    position : Vector2D,
    content : string,
    font : Font,
    stroke : Color,
    graphicalAdjustment : Vector2D,
    textReference : React.RefObject<SVGTextElement>,
    boundingBoxWidth : number,
    boundingBoxHeight : number,
    displayMouseOverFlag : boolean
  };

  export class Component extends React.Component<Props, State> {
    constructor(props : Props) {
      super(props);
      this.state = Object.assign({
        textReference : createRef<SVGTextElement>(),
        boundingBoxWidth : 0,
        boundingBoxHeight : 0,
        displayMouseOverFlag : false
      }, props);
    }
  
    public override render() {
      let app = App.Component.getCurrent();
      return <>
        <text
          key = "labelContent"
          ref = {this.state.textReference}
          fontSize = {this.state.font.size}
          fontFamily = {this.state.font.family}
          fontWeight = {this.state.font.weight}
          fontStyle = {this.state.font.style}
          fill = {toCSS(this.state.stroke)}
          transform = {`translate(${this.state.position.x + this.state.graphicalAdjustment.x} ${this.state.position.y + this.state.graphicalAdjustment.y}) scale(1 -1)`}
        >
          {this.state.content}
        </text>
        <rect
          key = "labelContentBoundingBox"
          fill = "none"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          visibility = {this.state.displayMouseOverFlag && app.state.currentTab === App.Tab.EDIT ? "visible" : "hidden"}
          transform = {`translate(${this.state.position.x + this.state.graphicalAdjustment.x} ${this.state.position.y + this.state.graphicalAdjustment.y})`}
          width = {this.state.boundingBoxWidth}
          height = {this.state.boundingBoxHeight}
          pointerEvents = "all"
          onMouseDown = {event => {
            let labelContent : Component = this;
            switch (event.button) {
              case App.MOUSE_BUTTON_INDICES.LEFT:
                let activeDragListener = app.state.currentTab !== App.Tab.EDIT ? app.windowDragListener : {
                  isWindowDragListenerFlag : false,
                  initiateDrag() {
                    return labelContent.state.position;
                  },
                  drag(totalDrag : Vector2D) {
                    labelContent.setState({
                      position : totalDrag
                    });
                  },
                  terminateDrag() {
                    // Do nothing.
                  },
                  affectedNucleotides : [this.props.nucleotide]
                };
                app.setState({
                  activeDragListener
                });
                break;
              case App.MOUSE_BUTTON_INDICES.RIGHT:
                let ref = React.createRef<LabelContent.Edit.Component>();
                let nucleotide = this.props.nucleotide;
                app.setState({
                  rightClickMenuReference : ref,
                  rightClickMenuContent : <LabelContent.Edit.Component
                    ref = {ref}
                    affectedNucleotides = {[nucleotide]}
                    app = {app}
                    nucleotide = {nucleotide}
                    labelContent = {this}
                  />
                })
                break;
            }
          }}
          onMouseEnter = {() => {
            if (app.state.activeDragListener === null) {
              this.setState({
                displayMouseOverFlag : true,
              });
            }
          }}
          onMouseLeave = {() => {
            if (app.state.activeDragListener === null) {
              this.setState({
                displayMouseOverFlag : false
              })
            }
          }}
        />
      </>;
    }
  
    public override componentDidMount() {
      this.updateBoundingBox();
    }

    public override componentDidUpdate(previousProps : Props, previousState : State) {
      if (this.state.content !== previousState.content || this.state.font !== previousState.font) {
        this.updateBoundingBox();
      }
    }

    public updateBoundingBox() {
      let labelContentBoundingBox = (this.state.textReference.current as SVGTextElement).getBBox();
      this.setState({
        graphicalAdjustment : new Vector2D(labelContentBoundingBox.width * -0.5, labelContentBoundingBox.height * -0.25),
        boundingBoxWidth : labelContentBoundingBox.width,
        boundingBoxHeight : labelContentBoundingBox.height
      });
    }
  }

  export namespace Edit {
    type Props = SelectionConstraint.SelectionConstraintProps & {
      app : App.Component,
      nucleotide : Nucleotide.Component,
      labelContent : LabelContent.Component
    };
  
    type State = {
      content : string,
      positionX : number,
      positionY : number,
      positionXAsString : string,
      positionYAsString : string
    };
  
    export class Component extends SelectionConstraint.SelectionConstraintComponent<Props, State> {
      constructor(props : Props) {
        super(props);
      }

      public override getInitialState() {
        let labelContent = this.props.labelContent;
        let position = labelContent.state.position;
        return {
          content : labelContent.state.content,
          positionX : position.x,
          positionY : position.y,
          positionXAsString : position.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
          positionYAsString : position.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
        };
      }
  
      public override render() {
        let rnaComplex = this.props.app.state.rnaComplexes[this.props.nucleotide.props.rnaComplexIndex];
        let rnaMolecule = rnaComplex.props.rnaMolecules[this.props.nucleotide.props.rnaMoleculeIndex];
        return <>
          <b>
            {`Edit label for Nucleotide #${this.props.nucleotide.props.nucleotideIndex + rnaMolecule.props.firstNucleotideIndex}`}
          </b>
          <br/>
          {`In RNA molecule "${rnaMolecule.props.name}"`}
          <br/>
          {`In RNA complex "${rnaComplex.props.name}"`}
          <br/>
          <label>
            Label:&nbsp;
            <input
              type = "text"
              value = {this.state.content}
              onChange = {event => {
                this.setState({
                  content : event.target.value
                });
                this.props.labelContent.setState({
                  content : event.target.value
                })
              }}
            />
          </label>
          <br/>
          <b>
            Position:
          </b>
          <br/>
          <label>
            x:&nbsp;
            <input
              type = "number"
              value = {this.state.positionXAsString}
              onChange = {event => {
                this.setState({
                  positionXAsString : event.target.value
                });
                let newPositionX = Number.parseFloat(event.target.value);
                if (Number.isNaN(newPositionX)) {
                  return;
                }
                this.setState({
                  positionX : newPositionX
                });
                this.props.labelContent.state.position.x = newPositionX;
                this.props.nucleotide.setState({
                  // No other changes.
                });
              }}
              step = {DEFAULT_TRANSLATION_MAGNITUDE}
            />
          </label>
          <br/>
          <label>
            y:&nbsp;
            <input
              type = "number"
              value = {this.state.positionYAsString}
              onChange = {event => {
                this.setState({
                  positionYAsString : event.target.value
                });
                let newPositionY = Number.parseFloat(event.target.value);
                if (Number.isNaN(newPositionY)) {
                  return;
                }
                this.setState({
                  positionY : newPositionY
                });
                this.props.labelContent.state.position.y = newPositionY;
                this.props.nucleotide.setState({
                  // No other changes.
                });
              }}
              step = {DEFAULT_TRANSLATION_MAGNITUDE}
            />
          </label>
          <br/>
          <FontEditor.Component
            font = {this.props.labelContent.state.font}
            updateFontParentHelper = {(newFont : Font) => {
              this.props.labelContent.setState({
                font : newFont
              });
            }}
          />
          <br/>
          <ColorEditor.Component
            color = {this.props.labelContent.state.stroke}
            updateParentColorHelper = {(color : Color) => {
              this.props.labelContent.setState({
                stroke : color
              });
            }}
            supportAlphaFlag = {false}
            colorFormat = {ColorFormat.RGB}
          />
        </>
      }
    }
  }
}