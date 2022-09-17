import React from "react";
import { App, DEFAULT_STROKE_WIDTH, DEFAULT_TRANSLATION_MAGNITUDE, FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT } from "../App";
import { AngleEditor } from "../data_structures/AngleEditor";
import Color, { ColorEditor, ColorFormat, toCSS } from "../data_structures/Color";
import Vector2D, { PolarVector2D } from "../data_structures/Vector2D";
import { SelectionConstraint } from "../input_output/selectionConstraints";
import { Nucleotide } from "./Nucleotide";

export namespace LabelLine {
  export type PartialProps = {
    endpoint0 : Vector2D,
    endpoint1 : Vector2D,
    stroke : Color,
    strokeWidth : number
  }

  type Props = PartialProps & {
    nucleotide : Nucleotide.Component
  };

  type State = PartialProps & {
    displayLabelLineEndpoint0MouseoverFlag : boolean,
    displayLabelLineEndpoint1MouseoverFlag : boolean,
    displayLabelLineCenterMouseoverFlag : boolean
  };

  // Begin constants.
  export const MOUSE_OVER_RADIUS = 1;

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = Object.assign({
        displayLabelLineEndpoint0MouseoverFlag : false,
        displayLabelLineEndpoint1MouseoverFlag : false,
        displayLabelLineCenterMouseoverFlag : false
      }, props);
    }

    public override render() {
      const app = App.Component.getCurrent();
      let difference = Vector2D.subtract(this.state.endpoint1, this.state.endpoint0);
      let scaledOrthogonal = Vector2D.scaleUp(Vector2D.orthogonalize(difference), MOUSE_OVER_RADIUS / Vector2D.magnitude(difference));
      let endpoint0TranslatedPositively = Vector2D.add(this.state.endpoint0, scaledOrthogonal);
      let endpoint0TranslatedNegatively = Vector2D.subtract(this.state.endpoint0, scaledOrthogonal);
      let endpoint1TranslatedPositively = Vector2D.add(this.state.endpoint1, scaledOrthogonal);
      let endpoint1TranslatedNegatively = Vector2D.subtract(this.state.endpoint1, scaledOrthogonal);
      let endpointPositionDifference : Vector2D;
      return <>
        <line
          key = "labelLine"
          x1 = {this.state.endpoint0.x}
          y1 = {this.state.endpoint0.y}
          x2 = {this.state.endpoint1.x}
          y2 = {this.state.endpoint1.y}
          stroke = {toCSS(this.state.stroke)}
          strokeWidth = {this.state.strokeWidth}
        />
        <circle
          key = "draggableEndpoint0"
          pointerEvents = "all"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          fill = "none"
          cx = {this.state.endpoint0.x}
          cy = {this.state.endpoint0.y}
          r = {MOUSE_OVER_RADIUS}
          visibility = {this.state.displayLabelLineEndpoint0MouseoverFlag && app.state.currentTab === App.Tab.EDIT ? "visible" : "hidden"}
          onMouseEnter = {() => {
            if (app.state.activeDragListener === null) {
              this.setState({
                displayLabelLineEndpoint0MouseoverFlag : true
              });
            }
          }}
          onMouseLeave = {() => {
            if (app.state.activeDragListener === null) {
              this.setState({
                displayLabelLineEndpoint0MouseoverFlag : false
              })
            }
          }}
          onMouseDown = {event => {
            let labelLine : LabelLine.Component = this;
            switch (event.button) {
              case App.MOUSE_BUTTON_INDICES.LEFT:
                let activeDragListener = app.state.currentTab !== App.Tab.EDIT ? app.windowDragListener : {
                  isWindowDragListenerFlag : false,
                  initiateDrag() {
                    return labelLine.state.endpoint0;
                  },
                  drag(totalDrag : Vector2D) {
                    labelLine.setState({
                      endpoint0 : totalDrag
                    });
                  },
                  terminateDrag() {
                    // Do nothing.
                  },
                  affectedNucleotides : [labelLine.props.nucleotide]
                };
                app.setState({
                  activeDragListener
                });
              break;
              case App.MOUSE_BUTTON_INDICES.RIGHT:
                let ref = React.createRef<LabelLine.Edit.Component>();
                let nucleotide = this.props.nucleotide;
                app.setState({
                  rightClickMenuReference : ref,
                  rightClickMenuContent : <LabelLine.Edit.Component
                    ref = {ref}
                    affectedNucleotides = {[nucleotide]}
                    app = {app}
                    nucleotide = {nucleotide}
                    labelLine = {this}
                  />
                });
                break;
            }
          }}
        />
        <circle
          key = "draggableEndpoint1"
          pointerEvents = "all"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          fill = "none"
          cx = {this.state.endpoint1.x}
          cy = {this.state.endpoint1.y}
          r = {MOUSE_OVER_RADIUS}
          visibility = {this.state.displayLabelLineEndpoint1MouseoverFlag && app.state.currentTab === App.Tab.EDIT ? "visible" : "hidden"}
          onMouseEnter = {() => {
            if (app.state.activeDragListener === null) {
              this.setState({
                displayLabelLineEndpoint1MouseoverFlag : true
              });
            }
          }}
          onMouseLeave = {() => {
            if (app.state.activeDragListener === null) {
              this.setState({
                displayLabelLineEndpoint1MouseoverFlag : false
              });
            }
          }}
          onMouseDown = {() => {
            let labelLine : Component = this;
            let activeDragListener = app.state.currentTab !== App.Tab.EDIT ? app.windowDragListener : {
              isWindowDragListenerFlag : false,
              initiateDrag() {
                return labelLine.state.endpoint1;
              },
              drag(totalDrag : Vector2D) {
                labelLine.setState({
                  endpoint1 : totalDrag
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
          }}
        />
        <path
          key = "draggableBody"
          pointerEvents = "all"
          stroke = "red"
          strokeWidth = {DEFAULT_STROKE_WIDTH}
          fill = "none"
          d = {`M ${endpoint0TranslatedPositively.x} ${endpoint0TranslatedPositively.y} A ${MOUSE_OVER_RADIUS} ${MOUSE_OVER_RADIUS} 0 0 0 ${endpoint0TranslatedNegatively.x} ${endpoint0TranslatedNegatively.y} L ${endpoint1TranslatedNegatively.x} ${endpoint1TranslatedNegatively.y} A ${MOUSE_OVER_RADIUS} ${MOUSE_OVER_RADIUS} 0 0 0 ${endpoint1TranslatedPositively.x} ${endpoint1TranslatedPositively.y} z`}
          visibility = {this.state.displayLabelLineCenterMouseoverFlag && app.state.currentTab === App.Tab.EDIT ? "visible" : "hidden"}
          onMouseEnter = {() => {
            if (app.state.activeDragListener === null) {
              this.setState({
                displayLabelLineCenterMouseoverFlag : true
              });
            }
          }}
          onMouseLeave = {() => {
            if (app.state.activeDragListener === null) {
              this.setState({
                displayLabelLineCenterMouseoverFlag : false
              });
            }
          }}
          onMouseDown = {event => {
            let labelLine = this;
            let nucleotide = this.props.nucleotide;
            switch (event.button) {
              case App.MOUSE_BUTTON_INDICES.LEFT:
                let activeDragListener = app.state.currentTab !== App.Tab.EDIT ? app.windowDragListener : {
                  isWindowDragListenerFlag : false,
                  initiateDrag() {
                    endpointPositionDifference = Vector2D.subtract(labelLine.state.endpoint1, labelLine.state.endpoint0);
                    return labelLine.state.endpoint0;
                  },
                  drag(totalDrag : Vector2D) {
                    labelLine.setState({
                      endpoint0 : totalDrag,
                      endpoint1 : Vector2D.add(totalDrag, endpointPositionDifference)
                    });
                  },
                  terminateDrag() {
                    // Do nothing.
                  },
                  affectedNucleotides : [nucleotide]
                };
                app.setState({
                  activeDragListener
                });
                break;
              case App.MOUSE_BUTTON_INDICES.RIGHT:
                let ref = React.createRef<LabelLine.Edit.Component>();
                app.setState({
                  rightClickMenuReference : ref,
                  rightClickMenuContent : <LabelLine.Edit.Component
                    ref = {ref}
                    affectedNucleotides = {[nucleotide]}
                    app = {app}
                    nucleotide = {nucleotide}
                    labelLine = {this}
                  />
                });
                break;
            }
          }}
        />
      </>
    }
  }

  export namespace Edit {
    type Props = SelectionConstraint.SelectionConstraintProps & {
      app : App.Component,
      nucleotide : Nucleotide.Component,
      labelLine : LabelLine.Component
    };

    type State = PolarVector2D & {
      origin : Vector2D,
      scale : number,
      x0AsString : string,
      y0AsString : string,
      x1AsString : string,
      y1AsString : string,
      strokeWidthAsString : string,
      scaleAsString : string,
      originXAsString : string,
      originYAsString : string
    };

    export class Component extends SelectionConstraint.SelectionConstraintComponent<Props, State> {
      private readonly angleEditorReference= React.createRef<AngleEditor.Component>();

      public constructor(props : Props) {
        super(props);
      }

      public override getInitialState() {
        let origin = Vector2D.scaleUp(Vector2D.add(this.props.labelLine.state.endpoint1, this.props.labelLine.state.endpoint0), 0.5);
        return Object.assign({
          origin,
          scale : 1,
          x0AsString : this.props.labelLine.state.endpoint0.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
          y0AsString : this.props.labelLine.state.endpoint0.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
          x1AsString : this.props.labelLine.state.endpoint1.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
          y1AsString : this.props.labelLine.state.endpoint1.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
          strokeWidthAsString : this.props.labelLine.state.strokeWidth.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
          scaleAsString : "1",
          originXAsString : origin.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
          originYAsString : origin.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
        }, Vector2D.toPolar(Vector2D.subtract(this.props.labelLine.state.endpoint1, origin)));
      }

      public override render() {
        let rnaComplex = this.props.app.state.rnaComplexes[this.props.nucleotide.props.rnaComplexIndex];
        let rnaMolecule = rnaComplex.props.rnaMolecules[this.props.nucleotide.props.rnaMoleculeIndex];
        let updateOriginAndOrientation = () => {
          let newOrigin = Vector2D.scaleUp(Vector2D.add(this.props.labelLine.state.endpoint0, this.props.labelLine.state.endpoint1), 0.5);
          let newOrientation = Vector2D.toPolar(Vector2D.subtract(this.props.labelLine.state.endpoint1, newOrigin));
          let newScale = newOrientation.radius / this.state.radius;
          let newAngle = newOrientation.angle;
          this.setState({
            origin : newOrigin,
            originXAsString : newOrigin.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            originYAsString : newOrigin.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            scale : newScale,
            scaleAsString : newScale.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            angle : newAngle
          });
          (this.angleEditorReference.current as AngleEditor.Component).update(newAngle);
        };
        let updateEndpoints = (origin : Vector2D, angle : number, scale : number) => {
          let displacementFromOrigin = Vector2D.toCartesian(angle, this.state.radius * scale);
          let newEndpoint0 = Vector2D.add(origin, displacementFromOrigin);
          let newEndpoint1 = Vector2D.subtract(origin, displacementFromOrigin);
          this.props.labelLine.setState({
            endpoint0 : newEndpoint0,
            endpoint1 : newEndpoint1
          });
          this.setState({
            x0AsString : newEndpoint0.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            y0AsString : newEndpoint0.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            x1AsString : newEndpoint1.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            y1AsString : newEndpoint1.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
          });
        }
        return <>
          <b>
            {`Edit label line for Nucleotide #${this.props.nucleotide.props.nucleotideIndex + rnaMolecule.props.firstNucleotideIndex}`}
          </b>
          <br/>
          {`In RNA molecule "${rnaMolecule.state.name}"`}
          <br/>
          {`In RNA complex "${rnaComplex.state.name}"`}
          <br/>
          <b>
            Endpoint 0:
          </b>
          <br/>
          <label>
            x:&nbsp;
            <input
              type = "number"
              value = {this.state.x0AsString}
              step = {DEFAULT_TRANSLATION_MAGNITUDE}
              onChange = {event => {
                this.setState({
                  x0AsString : event.target.value
                });
                let newX0 = Number.parseFloat(event.target.value);
                if (Number.isNaN(newX0)) {
                  return;
                }
                this.props.labelLine.state.endpoint0.x = newX0;
                this.props.labelLine.setState({
                  // No other changes.
                });
                updateOriginAndOrientation();
              }}
            />
          </label>
          <br/>
          <label>
            y:&nbsp;
            <input
              type = "number"
              value = {this.state.y0AsString}
              step = {DEFAULT_TRANSLATION_MAGNITUDE}
              onChange = {event => {
                this.setState({
                  y0AsString : event.target.value
                });
                let newY0 = Number.parseFloat(event.target.value);
                if (Number.isNaN(newY0)) {
                  return;
                }
                this.props.labelLine.state.endpoint0.y = newY0;
                this.props.labelLine.setState({
                  // No other changes.
                });
                updateOriginAndOrientation();
              }}
            />
          </label>
          <br/>
          <b>
            Endpoint 1:
          </b>
          <br/>
          <label>
            x:&nbsp;
            <input
              type = "number"
              value = {this.state.x1AsString}
              step = {DEFAULT_TRANSLATION_MAGNITUDE}
              onChange = {event => {
                this.setState({
                  x1AsString : event.target.value
                });
                let newX1 = Number.parseFloat(event.target.value);
                if (Number.isNaN(newX1)) {
                  return;
                }
                this.props.labelLine.state.endpoint1.x = newX1
                this.props.labelLine.setState({
                  // No other changes.
                });
                updateOriginAndOrientation();
              }}
            />
          </label>
          <br/>
          <label>
            y:&nbsp;
            <input
              type = "number"
              value = {this.state.y1AsString}
              step = {DEFAULT_TRANSLATION_MAGNITUDE}
              onChange = {event => {
                this.setState({
                  y1AsString : event.target.value
                });
                let newY1 = Number.parseFloat(event.target.value);
                if (Number.isNaN(newY1)) {
                  return;
                }
                this.props.labelLine.state.endpoint1.y = newY1;
                this.props.labelLine.setState({
                  // No other changes.
                });
                updateOriginAndOrientation();
              }}
            />
          </label>
          <br/>
          <b>
            Center:
          </b>
          <br/>
          <label>
            x:&nbsp;
            <input
              type = "number"
              value = {this.state.originXAsString}
              step = {DEFAULT_TRANSLATION_MAGNITUDE}
              onChange = {event => {
                this.setState({
                  originXAsString : event.target.value
                });
                let newCenterX = Number.parseFloat(event.target.value);
                if (Number.isNaN(newCenterX)) {
                  return;
                }
                this.state.origin.x = newCenterX;
                this.setState({
                  // No other changes.
                });
                updateEndpoints(this.state.origin, this.state.angle, this.state.scale);
              }}
            />
          </label>
          <br/>
          <label>
            y:&nbsp;
            <input
              type = "number"
              value = {this.state.originYAsString}
              step = {DEFAULT_TRANSLATION_MAGNITUDE}
              onChange = {event => {
                this.setState({
                  originYAsString : event.target.value
                });
                let newCenterY = Number.parseFloat(event.target.value);
                if (Number.isNaN(newCenterY)) {
                  return;
                }
                this.state.origin.y = newCenterY;
                this.setState({
                  // No other changes.
                });
                updateEndpoints(this.state.origin, this.state.angle, this.state.scale);
              }}
            />
          </label>
          <br/>
          <b>
            Orientation:
          </b>
          <br/>
          <AngleEditor.Component
            ref = {this.angleEditorReference}
            app = {this.props.app}
            angle = {this.state.angle}
            updateParentAngleHelper = {(angle : number) => {
              this.setState({
                angle
              });
              updateEndpoints(this.state.origin, angle, this.state.scale);
            }}
          />
          <br/>
          <label>
            Scale:&nbsp;
            <input
              type = "number"
              value = {this.state.scaleAsString}
              step = {0.1}
              onChange = {event => {
                this.setState({
                  scaleAsString : event.target.value
                });
                let newScale = Number.parseFloat(event.target.value);
                if (Number.isNaN(newScale)) {
                  return;
                }
                this.setState({
                  scale : newScale
                });
                updateEndpoints(this.state.origin, this.state.angle, newScale);
              }}
            />
          </label>
          <br/>
          <ColorEditor.Component
            color = {this.props.labelLine.state.stroke}
            updateParentColorHelper = {(color : Color) => {
              this.props.labelLine.setState({
                stroke : color
              });
            }}
            supportAlphaFlag = {false}
            colorFormat = {ColorFormat.RGB}
          />
        </>;
      }
    }
  }
}