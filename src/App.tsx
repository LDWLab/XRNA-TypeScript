import React, { createRef } from 'react';
import './App.css';
import { DivWithResizeDetector } from './components/DivWithResizeDetector';
import { Nucleotide } from './components/Nucleotide';
import { RnaComplex } from './components/RnaComplex';
import { RnaMolecule } from './components/RnaMolecule';
import Vector2D from './data_structures/Vector2D';
import inputFileReaders, { XrnaFileReader } from './input_output/inputUI';
import outputFileWriters, { XrnaFileWriter } from './input_output/outputUI';
import { SelectionConstraint } from './input_output/selectionConstraints';
import { Utils } from './utils/Utils';

// Begin constants.
export const DEFAULT_STROKE_WIDTH = 0.2;
export const FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT = 2;
export const CHARCOAL_GRAY_CSS = "rgb(54, 64, 79)";
const ZOOM_BASE = 1.1;
const ZOOM_STEP = Math.pow(10, -FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT);
export const ONE_OVER_LOG_OF_ZOOM_BASE = 1 / Math.log(ZOOM_BASE);
const DEFAULT_RIGHT_CLICK_MENU_CONTENT = <>
  Right-click a nucleotide to display the selection-constraint details.
</>

export namespace App {
  // Begin types.
  type Props = {
    // No properties.
  };

  type State = {
    currentTab : Tab,
    rnaComplexes : Array<RnaComplex.Component>,
    rnaComplexesAsJsx : Array<JSX.Element>,
    parentDivWidth : number,
    parentDivHeight : number,
    toolsDivHeight : number,
    svgHeight : number,
    showToolsDivFlag : boolean,
    copyInputFileNameToOutputFileNameFlag : boolean,
    copyInputFileExtensionToOutputFileExtensionFlag : boolean,
    useDegreesFlag : boolean,
    inputFileNameAndExtension : string,
    outputFileName : string,
    outputFileExtension : string,
    downloadAnchor : JSX.Element | undefined,
    zoom : number,
    zoomExponent : number,
    zoomAsString : string,
    zoomReciprocal : number,
    svgContentBoundingBox : DOMRect,
    viewX : number,
    viewXAsString : string,
    viewY : number,
    viewYAsString : string,
    selectionConstraint : string,
    originOfDrag : Vector2D,
    cachedDrag : Vector2D,
    activeDragListener : DragListener | null,
    mouseOverText : string | null,
    mouseOverTextDimensions : {
      width : number,
      height : number
    },
    visualizationElements : Array<JSX.Element>,
    rightClickMenuContent : JSX.Element,
    rightClickMenuReference : React.RefObject<SelectionConstraint.SelectionConstraintComponent<any, any>> | null
  };

  export enum Tab {
    IMPORT_EXPORT = "Import / Export",
    ANNOTATE = "Annotate",
    EDIT = "Edit",
    FORMAT = "Format",
    SETTINGS = "Settings"
  }

  export type TabData = {
    color : string,
    children : React.ReactNode
  };

  export interface DragListener {
    isWindowDragListenerFlag : boolean,
    initiateDrag() : Vector2D,
    drag(totalDrag : Vector2D) : void,
    terminateDrag() : void,
    affectedNucleotides : Array<Nucleotide.Component>
  }

  // Begin references.
  const uploadFileInput = createRef<HTMLInputElement>();
  const downloadFileButton = createRef<HTMLButtonElement>();
  const outputFileExtensionSelect = createRef<HTMLSelectElement>();
  const downloadAnchor = createRef<HTMLAnchorElement>();
  const mouseOverText = createRef<SVGTextElement>();
  const resetViewButton = createRef<HTMLButtonElement>();
  const toggleShowToolsDivButton = createRef<HTMLButtonElement>();

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
        currentTab : Tab.IMPORT_EXPORT,
        rnaComplexes : [],
        rnaComplexesAsJsx : new Array<JSX.Element>(),
        parentDivWidth : 0,
        parentDivHeight : 0,
        toolsDivHeight : 0,
        svgHeight : 0,
        showToolsDivFlag : true,
        copyInputFileNameToOutputFileNameFlag : true,
        copyInputFileExtensionToOutputFileExtensionFlag : true,
        useDegreesFlag : true,
        inputFileNameAndExtension : "",
        outputFileName : "",
        outputFileExtension : "",
        downloadAnchor : undefined,
        zoom : 1,
        zoomExponent : 0,
        zoomAsString : "1",
        zoomReciprocal : 1,
        svgContentBoundingBox : new DOMRect(0, 0, 1, 1),
        viewX : 0,
        viewXAsString : "0",
        viewY : 0,
        viewYAsString : "0",
        selectionConstraint : Object.keys(SelectionConstraint.selectionConstraints)[0],
        originOfDrag : new Vector2D(0, 0),
        cachedDrag : new Vector2D(0, 0),
        activeDragListener : null,
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
              (downloadFileButton.current as HTMLButtonElement).click();
            }
          }
          break;
        }
        case "o" : {
          if (event.ctrlKey) {
            event.preventDefault();
            (uploadFileInput.current as HTMLInputElement).click();
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
            (resetViewButton.current as HTMLButtonElement).click();
          }
          break;
        }
      }
    }

    public override render() : JSX.Element {
      const tabDataMap : Record<App.Tab, App.TabData> = {
        [App.Tab.IMPORT_EXPORT] : {
          color : "rgb(24, 98, 24)",
          children : <></>
        },
        [App.Tab.ANNOTATE] : {
          color : "rgb(34, 34, 139)",
          children : <></>
        },
        [App.Tab.EDIT] : {
          color : "rgb(124, 0, 0)",
          children : <></>
        },
        [App.Tab.FORMAT] : {
          color : "rgb(204, 85, 0)",
          children : <></>
        },
        [App.Tab.SETTINGS] : {
          color : "purple",
          children : <></>
        }
      };
      tabDataMap[Tab.IMPORT_EXPORT].children = <>
        <label>
          Input:&nbsp;
          <button
            onClick = {() => (uploadFileInput.current as HTMLInputElement).click()}
          >
            Upload
          </button>
          <input
          type = "file"
          accept = {Object.keys(inputFileReaders).map(inputFileExtension => `.${inputFileExtension}`).join(",")}
          ref = {uploadFileInput}
          style = {{
            display : "none"
          }}
          onChange = {
            (event) => {
              let files = event.target.files;
              if (files && files.length > 0) {
                let inputFileNameAndExtension = (files[0] as File).name;
                this.setState({
                  inputFileNameAndExtension
                });
                let lastIndexOfPeriod = inputFileNameAndExtension.lastIndexOf(".");
                if (this.state.copyInputFileNameToOutputFileNameFlag) {
                  this.setState({
                    outputFileName : inputFileNameAndExtension.substring(0, lastIndexOfPeriod)
                  });
                }
                let fileExtension = inputFileNameAndExtension.substring(lastIndexOfPeriod + 1);
                if (this.state.copyInputFileExtensionToOutputFileExtensionFlag) {
                  let newSelectedIndex = Array.from((outputFileExtensionSelect.current as HTMLSelectElement).children).findIndex(child => child.getAttribute("value") === fileExtension);
                  (outputFileExtensionSelect.current as HTMLSelectElement).selectedIndex = newSelectedIndex;
                  this.setState({
                    outputFileExtension : newSelectedIndex === -1 ? "" : fileExtension
                  });
                }
                let reader = new FileReader();
                reader.addEventListener("load", event => {
                  // Read the content of the input file.
                  let parsedInput = (inputFileReaders[fileExtension] as XrnaFileReader)((event.target as globalThis.FileReader).result as string);
                  this.setState({
                    zoom : 1,
                    zoomExponent : 0,
                    zoomAsString : "1",
                    viewX : 0,
                    viewXAsString : "0",
                    viewY : 0,
                    viewYAsString : "0",
                    rnaComplexes : parsedInput.rnaComplexes,
                    rnaComplexesAsJsx : parsedInput.rnaComplexes.map((rnaComplex : RnaComplex.Component, rnaComplexIndex : number) => <RnaComplex.Component
                      key = {rnaComplexIndex}
                      {...Object.assign(rnaComplex.props, rnaComplex.state)}
                    />)
                  });
                });
                reader.readAsText(files[0] as File);
              }
            }
          }
          />
        </label>
        <br/>
        <label>
          Output:&nbsp;
          <input
            type = {"text"}
            value = {this.state.outputFileName}
            placeholder = "file_name"
            onChange = {(event) => {
              this.setState({
                outputFileName : event.target.value
              });
            }}
          />
        </label>
        <select
          ref = {outputFileExtensionSelect}
          onChange = {(event) => this.setState({
            outputFileExtension : event.target.value
          })}
        >
          <option
            style = {{
              display : "none"
            }}
          >
            .file_extension
          </option>
          {Object.keys(outputFileWriters).map((outputFileWriterExtension : string, outputFileWriterIndex : number) => <option
            key = {outputFileWriterIndex}
            value = {outputFileWriterExtension}
            style = {{
              backgroundColor : CHARCOAL_GRAY_CSS
            }}
          >
            {`.${outputFileWriterExtension}`}
          </option>)}
        </select>
        <button
          ref = {downloadFileButton}
          style = {{
            display : this.state.outputFileName && this.state.outputFileExtension ? "inline" : "none"
          }}
          onClick = {() => this.setState({
            downloadAnchor : <a
              style = {{
                display : "none"
              }}
              ref = {downloadAnchor}
              href = {`data:text/plain;charset=utf-8,${encodeURIComponent((outputFileWriters[this.state.outputFileExtension] as XrnaFileWriter)(this.state.rnaComplexes))}`}
              download = {`${this.state.outputFileName}.${this.state.outputFileExtension}`}
            />
          })}
        >
          Download
        </button>
        {this.state.downloadAnchor}
      </>;
      const tabs = Object.values(Tab).map((tab : Tab) => {
        return {
          tab,
          tabData : tabDataMap[tab]
        };
      });
      const checkForAffectedNucleotideCollision = () => {
        if (this.state.activeDragListener === null) {
          return;
        }
        if (this.state.rightClickMenuReference === null) {
          return;
        }
        let rightClickMenuReference = this.state.rightClickMenuReference as React.RefObject<SelectionConstraint.SelectionConstraintComponent<SelectionConstraint.SelectionConstraintProps, any>>;
        if (this.state.activeDragListener.affectedNucleotides.some((affectedNucleotide : Nucleotide.Component) => (rightClickMenuReference.current as SelectionConstraint.SelectionConstraintComponent<SelectionConstraint.SelectionConstraintProps, any>).props.affectedNucleotides.includes(affectedNucleotide))) {
          // Collision between dragged nucleotides and nucleotides affected by the right-click menu.
          (rightClickMenuReference.current as SelectionConstraint.SelectionConstraintComponent<any, any>).reset();
        }
      };
      return <DivWithResizeDetector
        style = {{
          backgroundColor : CHARCOAL_GRAY_CSS,
          width : "100%",
          height : "100%",
          position : "absolute",
          display : "block"
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
            color : "white"
          }}
          onResize = {(_width : number, height : number) => {
            this.setState({
              toolsDivHeight : height
            });
          }}
          tabIndex = {0}
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
              {tabs.map((tab : {tab : Tab, tabData : TabData}, tabIndex : number) => <button
                key = {tabIndex}
                style = {{
                  backgroundColor : this.state.currentTab === tab.tab ? tab.tabData.color : "inherit"
                }}
                onClick = {() => this.setState({
                  currentTab : tab.tab,
                  rightClickMenuContent : DEFAULT_RIGHT_CLICK_MENU_CONTENT,
                  rightClickMenuReference : null
                })}
              >
                {tab.tab}
              </button>)}
              {tabs.map((tab : {tab : Tab, tabData : TabData}, tabIndex : number) =><div
                key = {tabIndex}
                style = {{
                  display : this.state.currentTab === tab.tab ? "block" : "none"
                }}
              >
                {tab.tabData.children}
              </div>)}
              <label>
                Zoom:&nbsp;
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
              </label>
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
              <label>
                View x:&nbsp;
                <input
                  type = "number"
                  value = {this.state.viewXAsString}
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
              <label>
                y:&nbsp;
                <input
                  type = "number"
                  value = {this.state.viewYAsString}
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
                ref = {resetViewButton}
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
                Reset view
              </button>
              <br/>
              <label>
                Selection constraint:&nbsp;
                <select
                  onChange = {(event) => this.setState({
                    selectionConstraint : event.target.value,
                    rightClickMenuContent : DEFAULT_RIGHT_CLICK_MENU_CONTENT,
                    rightClickMenuReference : null
                  })}
                >
                  {Object.entries(SelectionConstraint.selectionConstraints).map((selectionConstraintData : [string, SelectionConstraint.SelectionConstraint], selectionConstraintIndex : number) => <option
                    key = {selectionConstraintIndex}
                    value = {selectionConstraintData[0]}
                    style = {{
                      backgroundColor : CHARCOAL_GRAY_CSS
                    }}
                  >
                    {selectionConstraintData[0]}
                  </option>)}
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
              {(this.state.currentTab === Tab.IMPORT_EXPORT) || (this.state.currentTab === Tab.SETTINGS) ? <></> : this.state.rightClickMenuContent}
            </div>
          </div>
          <button
            ref = {toggleShowToolsDivButton}
            style = {{
              width : "10%",
              marginLeft : "auto",
              marginRight : "auto",
              display : "block"
            }}
            onClick = {() => this.setState({
              showToolsDivFlag : !this.state.showToolsDivFlag
            })}
          >
            {this.state.showToolsDivFlag ? "↑" : "↓"}
          </button>
        </DivWithResizeDetector>
        <svg
          viewBox = {`0 0 ${this.state.parentDivWidth} ${this.state.parentDivHeight - this.state.toolsDivHeight}`}
          style = {{
            backgroundColor : "white",
            top : this.state.toolsDivHeight,
            left : 0,
            position : "absolute"
          }}
          tabIndex={0}
          onMouseDown = {(event) => {
            this.setState({
              originOfDrag : new Vector2D(event.clientX, event.clientY)
            })
          }}
          onMouseMove = {(event) => {
            if (this.state.activeDragListener !== null) {
              let translation = Vector2D.subtract(new Vector2D(event.clientX, event.clientY), this.state.originOfDrag);
              translation.y = -translation.y;
              this.state.activeDragListener.drag(Vector2D.add(this.state.cachedDrag, Vector2D.scaleDown(translation, this.state.zoom * Math.min(this.state.parentDivWidth / this.state.svgContentBoundingBox.width, this.state.svgHeight / this.state.svgContentBoundingBox.height))));
            }
          }}
          onMouseUp = {() => {
            if (this.state.activeDragListener !== null) {
              this.state.activeDragListener.terminateDrag();
            }
            this.setState({
              activeDragListener : null
            });
            checkForAffectedNucleotideCollision();
          }}
          onMouseLeave = {() => {
            this.setState({
              activeDragListener : null
            });
            checkForAffectedNucleotideCollision();
          }}
          onMouseOut = {() => {
            this.setState({
              mouseOverText : null
            });
          }}
          onWheel = {event => {
            let newZoomExponent = this.state.zoomExponent + Utils.sign(event.deltaY);
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
            onMouseDown = {() => {
              let app : Component = this;
              this.setState({
                activeDragListener : app.windowDragListener
              });
            }}
            onContextMenu = {event => {
              event.preventDefault();
            }}
          />
          <g
            className = "svgContent"
            transform = {`scale(${this.state.zoom * Math.min(this.state.parentDivWidth / this.state.svgContentBoundingBox.width, this.state.svgHeight / this.state.svgContentBoundingBox.height)}) scale(1 -1) translate(${-this.state.svgContentBoundingBox.x + this.state.viewX} ${-(this.state.svgContentBoundingBox.y + this.state.svgContentBoundingBox.height) + this.state.viewY})`}
            onContextMenu = {(event) => event.preventDefault()}
          >
            {this.state.rnaComplexesAsJsx}
            {this.state.visualizationElements}
          </g>
          <g
            transform = {`translate(0 ${this.state.svgHeight - this.state.mouseOverTextDimensions.height})`}
            display = {this.state.mouseOverText === null ? "none" : "block"}
          >
            <rect
              fill = {CHARCOAL_GRAY_CSS}
              width = {this.state.mouseOverTextDimensions.width}
              height = {this.state.mouseOverTextDimensions.height}
            />
            <text
              ref = {mouseOverText}
              transform = {`translate(0 ${this.state.mouseOverTextDimensions.height})`}
              fontFamily = "dialog"
              stroke = "white"
            >
              {this.state.mouseOverText}
            </text>
          </g>
        </svg>
      </DivWithResizeDetector>
    }

    public override componentDidUpdate(previousProps : Props, previousState : State) {
      if (this.state.downloadAnchor !== previousState.downloadAnchor) {
        (downloadAnchor.current as HTMLAnchorElement).click();
      }
      if (this.state.parentDivHeight !== previousState.parentDivHeight || this.state.toolsDivHeight !== previousState.toolsDivHeight) {
        this.setState({
          svgHeight : this.state.parentDivHeight - this.state.toolsDivHeight
        });
      }
      if (this.state.rnaComplexesAsJsx !== previousState.rnaComplexesAsJsx) {
        let svgContent = document.querySelector("g.svgContent") as SVGGElement;
        let boundingBox = svgContent.getBBox();
        this.setState({
          svgContentBoundingBox : boundingBox
        });
      }
      if (this.state.zoom !== previousState.zoom) {
        this.setState({
          zoomReciprocal : 1 / this.state.zoom
        });
      }
      if (this.state.activeDragListener !== previousState.activeDragListener && this.state.activeDragListener !== null) {
        this.setState({
          cachedDrag : this.state.activeDragListener.initiateDrag()
        })
      }
      if (this.state.mouseOverText !== previousState.mouseOverText) {
        let mouseOverTextDimensions = (mouseOverText.current as SVGTextElement).getBBox();
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

    public static getCurrent() {
      return Component.current;
    }
  }
}