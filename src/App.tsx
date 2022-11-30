import React from 'react';
import './App.css';
import { DivWithResizeDetector } from './components/DivWithResizeDetector';
import { Nucleotide } from './components/Nucleotide';
import { RnaComplex } from './components/RnaComplex';
import { RnaMolecule } from './components/RnaMolecule';
import { SelectionConstraint } from './components/SelectionConstraints';
import { CHARCOAL_GRAY, Color, FOREST_GREEN, toCSS } from './data_structures/Color';
import Vector2D from './data_structures/Vector2D';
import { InputFileReader, inputFileReaders, jsonToRnaComplexProps, OutputFileWriter, outputFileWriters } from './io/InputOutputUI';
import { Utils } from './utils/Utils';

// Begin constants
export const DEFAULT_STROKE_WIDTH = 0.2;
export const FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT = 2;
export const DEFAULT_BACKGROUND_COLOR : Color = CHARCOAL_GRAY;
export const DEFAULT_BACKGROUND_COLOR_CSS_STRING : string = toCSS(CHARCOAL_GRAY);
export const FORREST_GREEN_CSS_STRING : string = toCSS(FOREST_GREEN);
const ZOOM_BASE = 1.1;
const ZOOM_STEP = Math.pow(10, -FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT);
export const ONE_OVER_LOG_OF_ZOOM_BASE = 1 / Math.log(ZOOM_BASE);
export const DEFAULT_TRANSLATION_MAGNITUDE = 0.5;
const DEFAULT_RIGHT_CLICK_MENU_CONTENT = <>
  Right-click a nucleotide to display the selection-constraint details.
</>

// Begin references
const downloadFileButtonReference = React.createRef<HTMLButtonElement>();
const inputFileInputReference = React.createRef<HTMLInputElement>();
const outputFileExtensionSelectReference = React.createRef<HTMLSelectElement>();
const resetViewButtonReference = React.createRef<HTMLButtonElement>();
const mouseOverTextReference = React.createRef<SVGTextElement>();
export const svgContentReference = React.createRef<SVGGElement>();
const svgWrapperReference = React.createRef<SvgWrapper.Component>();

namespace SvgWrapper {
  export type Props = {
    app : App.Component,
    rnaComplexProps : Array<RnaComplex.Props>
  };

  export type State = {
    
  };

  export class Component extends React.Component<Props, State> {
    public constructor(props : Props) {
      super(props);
      this.state = {
        rnaComplexProps : []
      };
    }

    public override render() {
      return <>
        {this.props.rnaComplexProps.map((rnaComplexProps : RnaComplex.Props, rnaComplexIndex : number) => <RnaComplex.Component
          key = {rnaComplexIndex}
          ref = {(rnaComplex : RnaComplex.Component) => {
            if (rnaComplex === null) {
              return;
            }
            let rnaComplexes : Array<RnaComplex.Component> = [];
            rnaComplexes.push(rnaComplex);
            rnaComplex.state.rnaMoleculeReferences.forEach((rnaMoleculeReference : React.RefObject<RnaMolecule.Component>) => {
              (rnaMoleculeReference.current as RnaMolecule.Component).state.nucleotideReferences.forEach((nucleotideReference : React.RefObject<Nucleotide.Component>) => {
                let nucleotide = nucleotideReference.current as Nucleotide.Component;
                if (nucleotide.state.basePair && nucleotide.isGreaterIndexInBasePair()) {
                  nucleotide.updateBasePairJsxWithCurrentPositions(nucleotide.state.basePair, rnaComplex);
                }
              })
            });
            this.props.app.setState({
              rnaComplexes
            });
          }}
          {...rnaComplexProps}
        />)}
      </>;
    }
  }
}

export namespace App {
  export enum Tab {
    ImportExport = "Import / Export",
    Annotate = "Annotate",
    Edit = "Edit",
    Format = "Format",
    Settings = "Settings",
    Demos = "Demos"
  }

  export interface DragListener {
    isWindowDragListenerFlag : boolean,
    initiateDrag() : Vector2D,
    drag(totalDrag : Vector2D) : void,
    terminateDrag() : void,
    affectedNucleotides : Array<Nucleotide.Component>
  }

  export enum MouseButtonIndices {
    Left = 0,
    Middle = 1,
    Right = 2
  };

  export type Props = {};

  export type State = {
    // Begin dimensions
    parentDivWidth : number,
    parentDivHeight : number,
    toolsDivHeight : number,
    svgHeight : number,
    svgBoundingBox : {
      width : number,
      height : number,
      x : number,
      y : number
    },
    // Begin i/o state elements
    inputFileNameAndExtension : string,
    outputFileName : string,
    outputFileExtension : string | undefined,
    downloadAnchor : JSX.Element,
    currentDragListener : DragListener | null,
    // Begin functional flags
    showToolsDivFlag : boolean,
    // Begin behavioural flags
    copyInputFileNameToOutputFileNameFlag : boolean,
    copyInputFileExtensionToOutputFileExtensionFlag : boolean,
    useDegreesFlag : boolean,
    currentSelectionConstraint : string
    // Begin the most important data
    svgWrapper : JSX.Element | undefined,
    rnaComplexes : Array<RnaComplex.Component>,
    currentTab : Tab,
    // Begin cosmetic data
    zoom : number,
    zoomExponent : number,
    zoomAsString : string,
    viewX : number,
    viewY : number,
    viewXAsString : string,
    viewYAsString : string,
    originOfDrag : Vector2D,
    cachedDrag : Vector2D,
    mouseOverText : string | null,
    mouseOverTextDimensions : {
      width : number,
      height : number
    },
    visualizationElements : Array<JSX.Element>,
    rightClickMenuContent : JSX.Element,
    rightClickMenuReference : React.RefObject<SelectionConstraint.SelectionConstraintComponent<any, any>> | null
  };

  export class Component extends React.Component<Props, State> {
    public readonly windowDragListener : DragListener;

    private static current : Component;

    public constructor(props : Props) {
      super(props);
      let app : Component = this;
      this.windowDragListener = {
        isWindowDragListenerFlag : true,
        initiateDrag() {
          return new Vector2D(app.state.viewX, app.state.viewY)
        },
        drag(totalDrag : Vector2D) {
          app.setState({
            viewX : totalDrag.x,
            viewXAsString : totalDrag.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            viewY : totalDrag.y,
            viewYAsString : totalDrag.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
          });
        },
        terminateDrag() {
          // Do nothing.
        },
        affectedNucleotides : []
      };
      this.state = {
        parentDivWidth : 0,
        parentDivHeight : 0,
        toolsDivHeight : 0,
        svgHeight : 0,
        svgBoundingBox : {
          width : 1,
          height : 1,
          x : 0,
          y : 0
        },
        inputFileNameAndExtension : "",
        outputFileName : "",
        outputFileExtension : undefined,
        downloadAnchor : <></>,
        showToolsDivFlag : true,
        copyInputFileNameToOutputFileNameFlag : true,
        copyInputFileExtensionToOutputFileExtensionFlag : true,
        useDegreesFlag : true,
        svgWrapper : undefined,
        rnaComplexes : [],
        currentTab : Tab.ImportExport,
        zoom : 1,
        zoomExponent : 0,
        zoomAsString : "1",
        viewX : 0,
        viewXAsString : "0",
        viewY : 0,
        viewYAsString : "0",
        currentSelectionConstraint : Object.keys(SelectionConstraint.selectionConstraints)[0],
        originOfDrag : new Vector2D(0, 0),
        cachedDrag : new Vector2D(0, 0),
        currentDragListener : null,
        mouseOverText : null,
        mouseOverTextDimensions : {
          width : 0,
          height : 0
        },
        visualizationElements : [],
        rightClickMenuContent : DEFAULT_RIGHT_CLICK_MENU_CONTENT,
        rightClickMenuReference : null
      };
      Component.current = this;
    }

    public override render() {
      const tabs = Object.values(Tab);
      const tabsJsx : Record<Tab, JSX.Element> = {
        [Tab.ImportExport] : <>
          <label>
            Input:&nbsp;
            <button
              onClick = {() => {
                (inputFileInputReference.current as HTMLInputElement).click();
              }}
            >
              Upload
            </button>
          </label>
          <input
            ref = {inputFileInputReference}
            style = {{
              display : "none"
            }}
            type = "file"
            accept = {Object.keys(inputFileReaders).map(inputFileExtension => `.${inputFileExtension}`).join(",")}
            onChange = {(event : React.ChangeEvent<HTMLInputElement>) => {
              let files = event.target.files;
              if (files !== null && files.length > 0) {
                let inputFileNameAndExtension = files[0].name;
                this.setState({
                  inputFileNameAndExtension
                });
                let lastIndexOfPeriod = inputFileNameAndExtension.lastIndexOf(".");
                if (this.state.copyInputFileNameToOutputFileNameFlag) {
                  this.setState({
                    outputFileName : inputFileNameAndExtension.substring(0, lastIndexOfPeriod)
                  });
                }
                let fileExtension = inputFileNameAndExtension.substring(lastIndexOfPeriod + 1)
                if (this.state.copyInputFileExtensionToOutputFileExtensionFlag) {
                  let newSelectedIndex = Array.from((outputFileExtensionSelectReference.current as HTMLSelectElement).children).findIndex(child => child.getAttribute("value") === fileExtension);
                  (outputFileExtensionSelectReference.current as HTMLSelectElement).selectedIndex = newSelectedIndex;
                  this.setState({
                    outputFileExtension : newSelectedIndex === -1 ? "" : fileExtension
                  });
                }
                let reader = new FileReader();
                reader.addEventListener("load", event => {
                  // Read the content of the input file.
                  let parsedInput = (inputFileReaders[fileExtension] as InputFileReader)((event.target as globalThis.FileReader).result as string);
                  this.setState({
                    svgWrapper : <SvgWrapper.Component
                      ref = {svgWrapperReference}
                      app = {this}
                      rnaComplexProps = {parsedInput.rnaComplexProps}
                    />
                  });
                  let rnaComplexes : Array<RnaComplex.Component> = [];
                  this.setState({
                    zoom : 1,
                    zoomExponent : 0,
                    zoomAsString : "1",
                    viewX : 0,
                    viewY : 0,
                    viewXAsString : "0",
                    viewYAsString : "0",
                    rnaComplexes
                  });
                })
                reader.readAsText(files[0] as File);
              }
            }}
          />
          <br/>
          <label>
            Output:&nbsp;
            <input
              type = "text"
              placeholder = "file_name"
              value = {this.state.outputFileName}
              onChange = {(event : React.ChangeEvent<HTMLInputElement>) => {
                this.setState({
                  outputFileName : event.target.value
                })
              }}
            />
          </label>
          <select
            ref = {outputFileExtensionSelectReference}
            value = {this.state.outputFileExtension}
            onChange = {(event : React.ChangeEvent<HTMLSelectElement>) => {
              this.setState({
                outputFileExtension : event.target.value
              });
            }}
          >
            <option
              style = {{
                display : "none"
              }}
              value = {".file_extension"}
            >
              .file_extension
            </option>
            {Object.keys(outputFileWriters).map((outputFileExtension : string, outputFileExtensionIndex : number) => <option
              key = {outputFileExtensionIndex}
              value = {outputFileExtension}
            >
              {outputFileExtension}
            </option>)}
          </select>
          <button
            style = {{
              display : this.state.outputFileName !== "" && this.state.outputFileExtension !== undefined && this.state.outputFileExtension !== "" ? "inline-block" : "none"
            }}
            ref = {downloadFileButtonReference}
            onClick = {() => this.setState({
              downloadAnchor : <a
                style = {{
                  display : "none"
                }}
                ref = {(anchorElement : HTMLAnchorElement) => {
                  if (anchorElement === null) {
                    return;
                  }
                  anchorElement.click();
                }}
                href = {`data:text/plain;charset=utf-8,${encodeURIComponent((outputFileWriters[this.state.outputFileExtension as string] as OutputFileWriter)(this.state.rnaComplexes))}`}
                download = {`${this.state.outputFileName}.${this.state.outputFileExtension}`}
              />
            })}
          >
            Download
          </button>
          {this.state.downloadAnchor}
        </>,
        [Tab.Annotate] : <></>,
        [Tab.Edit] : <></>,
        [Tab.Format] : <></>,
        [Tab.Settings] : <></>,
        [Tab.Demos] : <></>
      };
      return <>
        <DivWithResizeDetector
          style = {{
            width : "100%",
            height : "100%",
            position : "absolute",
            display : "block",
            color : "white",
            backgroundColor : DEFAULT_BACKGROUND_COLOR_CSS_STRING
          }}
          onResize = {(width : number, height : number) => {
            this.setState({
              parentDivWidth : width,
              parentDivHeight : height
            });
          }}
          onKeyDown = {this.onKeyDown}
        >
          <DivWithResizeDetector
            style = {{
              width : "100%",
              height : "auto",
              position : "absolute",
              // display : "block"
            }}
            tabIndex = {0}
            onResize = {(_width : number, height : number) => {
              this.setState({
                toolsDivHeight : height
              });
            }}
          >
            <div
              style = {{
                display : this.state.showToolsDivFlag ? "block" : "none"
              }}
            >
              <div
                style = {{
                  display : "inline-block",
                  width : "50%",
                  verticalAlign : "top"
                }}
              >
                {tabs.map((tab : Tab, tabIndex : number) => <button
                  key = {tabIndex}
                  style = {{
                    backgroundColor : this.state.currentTab === tab ? FORREST_GREEN_CSS_STRING : "inherit"
                  }}
                  onClick = {() => {
                    this.setState({
                      currentTab : tab,
                      rightClickMenuContent : DEFAULT_RIGHT_CLICK_MENU_CONTENT,
                      rightClickMenuReference : null
                    });
                  }}
                >
                  {tab}
                </button>)}
                {tabs.map((tab : Tab, tabIndex : number) => <div
                  key = {tabIndex}
                  style = {{
                    display : this.state.currentTab === tab ? "block" : "none"
                  }}
                >
                  {tabsJsx[tab]}
                </div>)}
                <b>
                  Zoom:
                </b>
                <br/>
                <input
                  type = "range"
                  min = {-50}
                  max = {50}
                  value = {this.state.zoomExponent}
                  onChange = {(event) => {
                    let newZoomExponent = Number.parseInt(event.target.value);
                    let newZoom = Math.pow(ZOOM_BASE, newZoomExponent);
                    this.setState({
                      zoomExponent : newZoomExponent,
                      zoom : newZoom,
                      zoomAsString : newZoom.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
                    });
                  }}
                />
                <input
                  type = {"number"}
                  value = {this.state.zoomAsString}
                  step = {ZOOM_STEP}
                  onChange = {(event) => {
                    let newZoom = Number.parseFloat(event.target.value);
                    if (Number.isNaN(newZoom)) {
                      this.setState({
                        zoomAsString : event.target.value
                      });
                    } else {
                      let logOfNewZoom = Math.log(newZoom);
                      this.setState({
                        // zoom = ZOOM_BASE ^ this.state.zoomExponent
                        // log(zoom) = log(ZOOM_BASE ^ this.state.zoomExponent)
                        // log(zoom) = this.state.zoomExponent * log(ZOOM_BASE)
                        // log(zoom) / log(ZOOM_BASE) = this.state.zoomExponent
                        zoomExponent : Number.isFinite(logOfNewZoom) ? logOfNewZoom * ONE_OVER_LOG_OF_ZOOM_BASE : 0,
                        zoom : newZoom,
                        zoomAsString : event.target.value
                      })
                    }
                  }}
                />
                <br/>
                <b>
                  View:
                </b>
                <br/>
                <label>
                  x:&nbsp;
                  <input
                    type = "number"
                    value = {this.state.viewXAsString}
                    step = {DEFAULT_TRANSLATION_MAGNITUDE}
                    onChange = {(event) => {
                      let newViewX = Number.parseFloat(event.target.value);
                      if (!Number.isNaN(newViewX)) {
                        this.setState({
                          viewX : newViewX
                        });
                      }
                      this.setState({
                        viewXAsString : event.target.value
                      });
                    }}
                  />
                </label>
                <br/>
                <label>
                  y:&nbsp;
                  <input
                    type = "number"
                    value = {this.state.viewYAsString}
                    step = {DEFAULT_TRANSLATION_MAGNITUDE}
                    onChange = {(event) => {
                      let newViewY = Number.parseFloat(event.target.value);
                      if (!Number.isNaN(newViewY)) {
                        this.setState({
                          viewY : newViewY
                        })
                      }
                      this.setState({
                        viewYAsString : event.target.value
                      })
                    }}
                  />
                </label>
                <br/>
                <button
                  ref = {resetViewButtonReference}
                  onClick = {() => this.setState({
                    zoomExponent : 0,
                    zoom : 1,
                    zoomAsString : "1",
                    viewX : 0,
                    viewY : 0,
                    viewXAsString : "0",
                    viewYAsString : "0"
                  })}
                >
                  Reset
                </button>
                <br/>
                <label>
                  Selection constraint:&nbsp;
                  <select
                    onChange = {(event : React.ChangeEvent<HTMLSelectElement>) => {
                      this.setState({
                        currentSelectionConstraint : event.target.value,
                        rightClickMenuContent : DEFAULT_RIGHT_CLICK_MENU_CONTENT,
                        rightClickMenuReference : null
                      });
                    }}
                  >
                    {Object.keys(SelectionConstraint.selectionConstraints).map((selectionConstraintName : string, selectionConstraintIndex : number) => {
                      return <option
                        key = {selectionConstraintIndex}
                        style = {{
                          backgroundColor : DEFAULT_BACKGROUND_COLOR_CSS_STRING
                        }}
                        value = {selectionConstraintName}
                      >
                        {selectionConstraintName}
                      </option>;
                    })}
                  </select>
                </label>
              </div>
              <div
                style = {{
                  display : "inline-block",
                  width : "calc(50% - 6px)",
                  paddingLeft : "5px",
                  paddingRight : "0px",
                  borderLeft : this.state.rightClickMenuContent === null ? "none" : "solid white 1px"
                }}
              >
                {(this.state.currentTab === Tab.ImportExport) || (this.state.currentTab === Tab.Settings) || (this.state.currentTab === Tab.Demos) ? <></> : this.state.rightClickMenuContent}
              </div>
            </div>
            <button
              style = {{
                width : "10%",
                marginLeft : "auto",
                marginRight : "auto",
                display : "block"
              }}
              onClick = {() => {
                this.setState({
                  showToolsDivFlag : !this.state.showToolsDivFlag,
                });
              }}
            >
              {this.state.showToolsDivFlag ? "↑" : "↓"}
            </button>
          </DivWithResizeDetector>
          <svg
            id = "outerSvgElement"
            xmlns="http://www.w3.org/2000/svg"
            style = {{
              top : this.state.toolsDivHeight,
              left : 0,
              position : "absolute"
            }}
            viewBox = {`0 0 ${this.state.parentDivWidth} ${this.state.svgHeight}`}
            tabIndex = {0}
            onMouseDown = {(event : React.MouseEvent<SVGSVGElement, MouseEvent>) => {
              switch (event.button) {
                case MouseButtonIndices.Left : {
                  this.setState({
                    originOfDrag : new Vector2D(event.clientX, event.clientY)
                  })
                }
              }
            }}
            onMouseMove = {(event) => {
              if (this.state.currentDragListener !== null) {
                let translation = Vector2D.subtract(new Vector2D(event.clientX, event.clientY), this.state.originOfDrag);
                translation.y = -translation.y;
                this.state.currentDragListener.drag(Vector2D.add(this.state.cachedDrag, Vector2D.scaleDown(translation, this.state.zoom * Math.min(this.state.parentDivWidth / this.state.svgBoundingBox.width, this.state.svgHeight / this.state.svgBoundingBox.height))));
              }
            }}
            onMouseUp = {() => {
              if (this.state.currentDragListener !== null) {
                this.state.currentDragListener.terminateDrag();
              }
              this.setState({
                currentDragListener : null
              });
              this.checkForAffectedNucleotideCollision();
            }}
            onMouseLeave = {() => {
              this.setState({
                currentDragListener : null
              });
              this.checkForAffectedNucleotideCollision();
            }}
            onMouseOut = {() => {
              this.setState({
                mouseOverText : null
              });
            }}
            onWheel = {event => {
              // Apparently, the sign of <event.deltaY> needs to be negated in order to support intuitive scrolling..
              let newZoomExponent = this.state.zoomExponent - Utils.sign(event.deltaY);
              let newZoom = Math.pow(ZOOM_BASE, newZoomExponent);
              this.setState({
                zoom : newZoom,
                zoomExponent : newZoomExponent,
                zoomAsString : newZoom.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
              });
            }}
          >
            <rect
              fill = "white"
              width = "100%"
              height = "100%"
              onMouseDown = {(event : React.MouseEvent<SVGRectElement, MouseEvent>) => {
                switch (event.button) {
                  case MouseButtonIndices.Left : {
                    this.setState({
                      currentDragListener : this.windowDragListener
                    });
                  }
                }
              }}
            onContextMenu = {event => {
              event.preventDefault();
            }}
            />
            <g
              id = "transformedSvgElement"
              ref = {svgContentReference}
              transform = {`scale(${this.state.zoom * Math.min(this.state.parentDivWidth / this.state.svgBoundingBox.width, this.state.svgHeight / this.state.svgBoundingBox.height)}) scale(1 -1) translate(${-this.state.svgBoundingBox.x + this.state.viewX} ${-(this.state.svgBoundingBox.y + this.state.svgBoundingBox.height) + this.state.viewY})`}
              onContextMenu = {(event) => event.preventDefault()}
            >
              {this.state.visualizationElements}
              <g
                id = "coreSvgContent"
              >
                {this.state.svgWrapper}
              </g>
            </g>
            <g
              transform = {`translate(0 ${this.state.svgHeight - this.state.mouseOverTextDimensions.height})`}
              display = {this.state.mouseOverText === null ? "none" : "block"}
            >
              <rect
                fill = {DEFAULT_BACKGROUND_COLOR_CSS_STRING}
                width = {this.state.mouseOverTextDimensions.width}
                height = {this.state.mouseOverTextDimensions.height}
              />
              <text
                ref = {mouseOverTextReference}
                transform = {`translate(0 ${this.state.mouseOverTextDimensions.height})`}
                fontFamily = "dialog"
                stroke = "white"
              >
                {this.state.mouseOverText}
              </text>
            </g>
          </svg>
        </DivWithResizeDetector>
      </>;
    }

    public override componentDidMount() {
      let index = document.URL.indexOf('?');
      let params : Record<string, string> = {};
      if (index != -1) {
        let pairs = document.URL.substring(index + 1, document.URL.length).split('&');
        for (let i = 0; i < pairs.length; i++) {
          let nameVal = pairs[i].split('=');
          params[nameVal[0]] = nameVal[1];
        }
      }
      let r2dt_key = "r2dt_job_id";
      if (r2dt_key in params) {
        let promise = fetch(`https://www.ebi.ac.uk/Tools/services/rest/r2dt/result/${params[r2dt_key]}/json`, {
          method : "GET"
        });
        promise.then(data => {
          data.json().then(json => {
            let parsedInput = jsonToRnaComplexProps(json);
            this.setState({
              svgWrapper : <SvgWrapper.Component
                ref = {svgWrapperReference}
                app = {this}
                rnaComplexProps = {parsedInput.rnaComplexProps}
              />
            });
            let rnaComplexes : Array<RnaComplex.Component> = [];
            this.setState({
              zoom : 1,
              zoomExponent : 0,
              zoomAsString : "1",
              viewX : 0,
              viewY : 0,
              viewXAsString : "0",
              viewYAsString : "0",
              rnaComplexes
            });
          });
        });
      }
    }

    public override componentDidUpdate(previousProps : Props, previousState : State) {
      if (this.state.parentDivHeight !== previousState.parentDivHeight || this.state.toolsDivHeight !== previousState.toolsDivHeight) {
        this.setState({
          svgHeight : this.state.parentDivHeight - this.state.toolsDivHeight
        });
      }
      if (this.state.currentDragListener !== previousState.currentDragListener && this.state.currentDragListener !== null) {
        this.setState({
          cachedDrag : this.state.currentDragListener.initiateDrag()
        });
      }
      if (this.state.mouseOverText !== previousState.mouseOverText) {
        let mouseOverTextDimensions = (mouseOverTextReference.current as SVGTextElement).getBBox();
        this.setState({
          mouseOverTextDimensions : {
            width : mouseOverTextDimensions.width,
            height : mouseOverTextDimensions.height
          }
        });
      }
      if (this.state.rightClickMenuReference !== previousState.rightClickMenuReference && this.state.rightClickMenuReference !== null) {
        (this.state.rightClickMenuReference.current as SelectionConstraint.SelectionConstraintComponent<any, any>).reset();
      }
    }

    private onKeyDown(event : React.KeyboardEvent<Element>) {
      // "this.state" is undefined. I'm not sure what's wrong here.
      // Replacing "this.state" with "app.state" solves this bug.
      let app = App.Component.getCurrent();
      switch (event.key) {
        case "s" : {
          if (event.ctrlKey) {
            event.preventDefault();
            if (app.state.outputFileName === "") {
              alert("A name for the output file was not provided.");
            } else if (app.state.outputFileExtension === "") {
              alert("An extension for the output file was not selected.");
            } else {
              (downloadFileButtonReference.current as HTMLButtonElement).click();
            }
          }
          break;
        }
        case "o" : {
          if (event.ctrlKey) {
            event.preventDefault();
            (inputFileInputReference.current as HTMLInputElement).click();
          }
          break;
        }
        case "Escape" : {
          app.setState({
            showToolsDivFlag : !app.state.showToolsDivFlag
          });
          break;
        }
        case "0" : {
          if (event.ctrlKey) {
            event.preventDefault();
            (resetViewButtonReference.current as HTMLButtonElement).click();
          }
          break;
        }
      }
    }

    private checkForAffectedNucleotideCollision = () => {
      if (this.state.currentDragListener === null) {
        return;
      }
      if (this.state.rightClickMenuReference === null) {
        return;
      }
      let rightClickMenuReference = this.state.rightClickMenuReference as React.RefObject<SelectionConstraint.SelectionConstraintComponent<SelectionConstraint.SelectionConstraintProps, any>>;
      if (this.state.currentDragListener.affectedNucleotides.some((affectedNucleotide : Nucleotide.Component) => (rightClickMenuReference.current as SelectionConstraint.SelectionConstraintComponent<SelectionConstraint.SelectionConstraintProps, any>).props.affectedNucleotides.includes(affectedNucleotide))) {
        // Collision between dragged nucleotides and nucleotides affected by the right-click menu.
        (rightClickMenuReference.current as SelectionConstraint.SelectionConstraintComponent<any, any>).reset();
      }
    };

    public static getCurrent() {
      return Component.current;
    }
  }
}
