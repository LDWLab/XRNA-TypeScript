import './App.css';
import { useState, useEffect, createRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import inputFileReaders, { type FileReader } from './inputUI';
import outputFileWriters from './outputUI';
import { Vector2D } from './Vector2D'
import { RNAMolecule } from './RNAMolecule';
import { RNAComplex } from './RNAComplex';
import { Nucleotide, BasePair, BasePairType } from './Nucleotide';
// Begin types
interface Tab {
  label : string,
  reminderHighlight : string,
  jsxElements : Array<JSX.Element>
};
interface Dragable {
  invertYFlag : boolean;
  handleDrag(dragVector : Vector2D) : void;
  setDragSum(dragSum : Vector2D) : void;
  getDragSum() : Vector2D;
  endDrag() : void;
}
function App() {
  // Begin constants
  const CHARCOAL_GRAY = "rgb(54, 64, 79)";
  const DEFAULT_STROKE_WIDTH = 0.2;
  const MOUSE_OVER_HIGHLIGHT_STROKE_COLOR = "red";
  const MOUSE_OVER_HIGHLIGHT_STROKE_WIDTH = DEFAULT_STROKE_WIDTH;
  const ROUNDED_STRUCTURE_VIEWER_ZOOM_PRECISION = 2;
  const STRUCTURE_VIEWER_ZOOM_BASE = 1.1;
  // In pixels.
  const TAB_REMINDER_BORDER_WIDTH = 6; 
  const inputOutputTab : Tab = {
    label : "Input/Output",
    reminderHighlight : "rgb(24, 98, 24)",
    jsxElements : []
  };
  const settingsTab : Tab = {
    label : "Settings",
    reminderHighlight : "purple",
    jsxElements : []
  };
  const editTab : Tab = {
    label : "Edit",
    reminderHighlight : "rgb(124, 0, 0)",
    jsxElements : []
  };
  const formatTab = {
    label : "Format",
    reminderHighlight : "rgb(204, 85, 0)",
    jsxElements : []
  };
  const annotateTab = {
    label : "Annotate",
    reminderHighlight : "rgb(34, 34, 139)",
    jsxElements : []
  };
  const tabs : Array<Tab> = [
    inputOutputTab,
    editTab,
    formatTab,
    annotateTab,
    settingsTab
  ];
  // Begin state variables
  const parentDivResizeDetector = useResizeDetector();
  const toolsDivResizeDetector = useResizeDetector();
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  const [showTabReminderFlag, setShowTabReminderFlag] = useState<boolean>(true);
  const [darkModeInStructureViewerFlag, setDarkModeInStructureViewerFlag] = useState<boolean>(false);
  const [darkModeInOutputFilesFlag, setDarkModeInOutputFilesFlag] = useState<boolean>(false);
  const [showToolsFlag, setShowToolsFlag] = useState<boolean>(true);
  const [inputFileNameAndExtension, setInputFileNameAndExtension] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>("");
  const [outputFileExtension, setOutputFileExtension] = useState<string>("");
  const [copyInputFileNameToOutputFileNameFlag, setCopyInputFileNameToOutputFileNameFlag] = useState<boolean>(true);
  const [copyInputFileExtensionToOutputFileExtensionFlag, setCopyInputFileExtensionToOutputFileExtensionFlag] = useState<boolean>(true);
  const [rnaComplexes, setRnaComplexes] = useState<Array<RNAComplex>>([]);
  const [svgBoundingRectangle, setSvgBoundingRectangle] = useState<DOMRect>(new DOMRect(0, 0, 1, 1));
  const [svgHeight, setSvgHeight] = useState<number>(1);
  const [svgWidth, setSvgWidth] = useState<number>(1);
  const [structureViewerZoom, setStructureViewerZoom] = useState<number>(1);
  const [roundedStructureViewerZoom, setRoundedStructureViewerZoom] = useState<string>(new Number(1).toFixed(ROUNDED_STRUCTURE_VIEWER_ZOOM_PRECISION));
  const [structureViewerZoomExponent, setStructureViewerZoomExponent] = useState<number>(0);
  const [draggingOrigin, setDraggingOrigin] = useState<Vector2D | null>(null);
  const [viewerDraggingSum, setViewerDraggingSum] = useState<Vector2D>(new Vector2D(0, 0));
  const [viewerDraggingDifference, setViewerDraggingDifference] = useState<Vector2D>(new Vector2D(0, 0));
  const [viewerScale, setViewerScale] = useState<number>(1);
  const [oneOverViewerScale, setOneOverViewerScale] = useState<number>(1);
  const [draggingDifference, setDraggingDifference] = useState<Vector2D>(new Vector2D(0, 0));
  const [activeDragables, setActiveDragables] = useState<Array<Dragable>>([]);
  // Begin effects
  useEffect(
    () => {
      let textElements = document.querySelectorAll("text.boundedText") as NodeListOf<SVGTextElement>;
      let rectangleElements = document.querySelectorAll("rect.boundingRectangle") as NodeListOf<SVGRectElement>;
      // Invariant: textElements.length === rectangleElements.length
      for (let i = 0; i < textElements.length; i++) {
        let textElement = textElements[i];
        let rectangleElement = rectangleElements[i];
        let textBounds = textElement.getBBox();
        
        rectangleElement.setAttribute("width", `${textBounds.width}`);
        rectangleElement.setAttribute("height", `${textBounds.height}`);
        rectangleElement.setAttribute("transform", `translate(${textBounds.width * -0.5} ${textBounds.height * -0.25}) ${rectangleElement.getAttribute("transform") ?? ""}`);

        textElement.setAttribute("transform", `translate(${textBounds.width * -0.5} ${textBounds.height * -0.25}) ${textElement.getAttribute("transform") ?? ""}`);
      }
      let svgBoundingRectangle = (document.querySelector("g") as SVGSVGElement).getBBox();
      if (svgBoundingRectangle.width == 0) {
        svgBoundingRectangle.width = 1;
      }
      if (svgBoundingRectangle.height == 0) {
        svgBoundingRectangle.height = 1;
      }
      setSvgBoundingRectangle(svgBoundingRectangle);
    },
    [rnaComplexes]
  );
  useEffect(
    () => {
      setSvgHeight((parentDivResizeDetector.height ?? 0) - (toolsDivResizeDetector.height ?? 0));
    },
    [parentDivResizeDetector.height, toolsDivResizeDetector.height]
  );
  useEffect(
    () => {
      setSvgWidth(parentDivResizeDetector.width ?? 1);
    },
    [parentDivResizeDetector.width]
  );
  useEffect(
    () => {
      let _viewerScale = structureViewerZoom * Math.min(svgWidth / svgBoundingRectangle.width, svgHeight / svgBoundingRectangle.height);
      setViewerScale(_viewerScale);
      setOneOverViewerScale(1 / _viewerScale);
    },
    [structureViewerZoom, svgWidth, svgHeight, svgBoundingRectangle.width, svgBoundingRectangle.height] 
  );
  // Begin ref variables.
  const uploadInputFileRef = createRef<HTMLInputElement>();
  const outputFileExtensionSelectRef = createRef<HTMLSelectElement>();
  // Begin tsx
  inputOutputTab.jsxElements.push(
    <label
      key = "fileUpload"
    >
      Input file:&nbsp;
      <button
        onClick = {() => (uploadInputFileRef.current as HTMLInputElement).click()}
      >
        Upload
      </button>
      &nbsp;{inputFileNameAndExtension ?? ""}
      <input
        style = {{
          display : "none"
        }}
        type = "file"
        accept = {Object.keys(inputFileReaders).map(inputFileReaderKey => "." + inputFileReaderKey).join(",")}
        ref = {uploadInputFileRef}
        onChange = {event => {
          let files = event.target.files;
          if (files && files.length > 0) {
            let inputFileName = (files[0] as File).name;
            setInputFileNameAndExtension(inputFileName);
            let lastIndexOfPeriod = inputFileName.lastIndexOf(".");
            if (copyInputFileNameToOutputFileNameFlag) {
              setOutputFileName(inputFileName.substring(0, lastIndexOfPeriod));
            }
            let outputFileExtension = inputFileName.substring(lastIndexOfPeriod + 1);
            if (copyInputFileExtensionToOutputFileExtensionFlag) {
              let newSelectedIndex = Array.from((outputFileExtensionSelectRef.current as HTMLSelectElement).children).findIndex(child => child.getAttribute("value") === outputFileExtension);
              (outputFileExtensionSelectRef.current as HTMLSelectElement).selectedIndex = newSelectedIndex;
              setOutputFileExtension(newSelectedIndex === -1 ? "" : outputFileExtension);
            }
            let reader = new FileReader();
            reader.addEventListener("load", event => {
              // Read the content of the input file.
              let parsedInput = (inputFileReaders[outputFileExtension] as FileReader)((event.target as globalThis.FileReader).result as string);
              setRnaComplexes(parsedInput.rnaComplexes);
            });
            reader.readAsText(files[0] as File);
          }
        }}
      />
    </label>,
    <br
      key = "newLine0"
    />,
    <label
      key = "outputFileName"
    >
      Output file:&nbsp;
      <input
        type = "text"
        value = {outputFileName}
        placeholder = "File_name"
        onChange = {(event) => setOutputFileName(event.target.value)}
      />
    </label>,
    <select
      ref = {outputFileExtensionSelectRef}
      key = "outputFileExtensionSelect"
      onChange = {(event) => {
        setOutputFileExtension(event.target.value);
      }}
    >
      <option
        style = {{
          display : "none"
        }}
      >
        .file_extension
      </option>
      {Object.keys(outputFileWriters).map(outputFileWriterKey => <option
        value = {outputFileWriterKey}
        key = {outputFileWriterKey}
        style = {{
          backgroundColor : CHARCOAL_GRAY
        }}
      >
        {`.${outputFileWriterKey}`}
      </option>)}
    </select>,
    <button
      style = {{
        display : outputFileName && outputFileExtension ? "inline" : "none"
      }}
      key = "downloadOutputFileButton"
    >
      Download
    </button>
  );
  settingsTab.jsxElements.push(
    <label
      key = "showHighlightSetting"
    >
      Show tab reminder:&nbsp;
      <input
        type = "checkbox"
        checked = {showTabReminderFlag}
        onChange = {() => setShowTabReminderFlag(!showTabReminderFlag)}
      />
    </label>,
    <br
      key = "newLine0"
    />,
    <label
      key = "darkModeInStructureViewerSetting"
    >
      Dark mode (invert colors) in structure viewer:&nbsp;
      <input
        type = "checkbox"
        checked = {darkModeInStructureViewerFlag}
        onChange = {() => {
          let newFlag = !darkModeInStructureViewerFlag;
          setDarkModeInStructureViewerFlag(newFlag);
          setDarkModeInOutputFilesFlag(newFlag);
        }}
      />
    </label>,
    <label
      key = "darkModeInOutputFilesSetting"
    >
      &nbsp;and in output files:&nbsp;
      <input
        type = "checkbox"
        checked = {darkModeInOutputFilesFlag}
        onChange = {() => setDarkModeInOutputFilesFlag(!darkModeInOutputFilesFlag)}
      />
    </label>,
    <br
      key = "newLine1"
    />,
    <label
      key = "copyInputFileNameToOutputFileNameSetting"
    >
      Copy input-file name:&nbsp;
      <input
        type = "checkbox"
        checked = {copyInputFileNameToOutputFileNameFlag}
        onChange = {() => {
          let newFlag = !copyInputFileNameToOutputFileNameFlag;
          setCopyInputFileNameToOutputFileNameFlag(newFlag);
          setCopyInputFileExtensionToOutputFileExtensionFlag(newFlag)
        }}
      />
    </label>,
    <label
      key = "copyInputFileExtensionToOutputFileExtensionSetting"
    >
      &nbsp;and extension:&nbsp;
      <input
        type = "checkbox"
        checked = {copyInputFileExtensionToOutputFileExtensionFlag}
        onChange = {() => setCopyInputFileExtensionToOutputFileExtensionFlag(!copyInputFileExtensionToOutputFileExtensionFlag)}
      />
      &nbsp;to the output file.
    </label>
  );
  return (
    <div
      ref = {parentDivResizeDetector.ref}
      style = {{
        width : showTabReminderFlag ? `calc(100% - ${2 * TAB_REMINDER_BORDER_WIDTH}px)` : "100%",
        height : showTabReminderFlag ? `calc(100% - ${2 * TAB_REMINDER_BORDER_WIDTH}px)` : "100%",
        position : "absolute",
        margin : "0px",
        padding : "0px",
        color : "white",
        background : CHARCOAL_GRAY,
        border : showTabReminderFlag ? `ridge ${tabs[currentTabIndex].reminderHighlight} ${TAB_REMINDER_BORDER_WIDTH}px` : "none"
      }}
    >
      <div
        ref = {toolsDivResizeDetector.ref}
      >
        {tabs.map((tab : Tab, tabIndex : number) => <button
          onClick = {() => setCurrentTabIndex(tabIndex)}
          style = {{
            backgroundColor : tabIndex === currentTabIndex ? tabs[tabIndex].reminderHighlight : "inherit"
          }}
          key = {tabIndex}
        >
          {tab.label}
        </button>)}
        <div
          style = {{
            display : showToolsFlag ? "block" : "none"
          }}
        >
          {tabs.map((tab : Tab, tabIndex : number) => <div
            style = {{
              display : tabIndex === currentTabIndex ? "block" : "none"
            }}
            key = {tabIndex}
          >
            {tab.jsxElements}
          </div>)}
          <input
            type = "range"
            min = "-50"
            max = "50"
            value = {structureViewerZoomExponent}
            onChange = {
              (event) => {
                let newStructureViewerZoomExponent = Number.parseInt(event.target.value);
                setStructureViewerZoomExponent(newStructureViewerZoomExponent);
                let newStructureViewerZoom = Math.pow(STRUCTURE_VIEWER_ZOOM_BASE, newStructureViewerZoomExponent);
                setStructureViewerZoom(newStructureViewerZoom);
                setRoundedStructureViewerZoom(newStructureViewerZoom.toFixed(ROUNDED_STRUCTURE_VIEWER_ZOOM_PRECISION));
              }
            }
          />
          <input
            type = "number"
            step = {`${Math.pow(10, -ROUNDED_STRUCTURE_VIEWER_ZOOM_PRECISION)}`}
            value = {roundedStructureViewerZoom}
            onChange = {
              (event) => {
                let newRoundedStructureViewerZoom = event.target.value;
                setRoundedStructureViewerZoom(newRoundedStructureViewerZoom);
                // zoom == base^exponent
                // log(zoom) == log(base^exponent) 
                //           == exponent * log(base)
                // log(zoom) / log(base) == exponent
                let newStructureViewerZoom = Number.parseFloat(newRoundedStructureViewerZoom);
                setStructureViewerZoom(newStructureViewerZoom);
                setStructureViewerZoomExponent(Math.log(newStructureViewerZoom) / Math.log(STRUCTURE_VIEWER_ZOOM_BASE));
              }
            }
          />
          <button
            onClick = {() => {
              setStructureViewerZoom(1);
              setStructureViewerZoomExponent(0);
              setRoundedStructureViewerZoom(new Number(1).toFixed(ROUNDED_STRUCTURE_VIEWER_ZOOM_PRECISION));
              setViewerDraggingSum(new Vector2D(0, 0));
              setViewerDraggingDifference(new Vector2D(0, 0));
            }}
          >
            Reset view
          </button>
        </div>
        <button
          style = {{
            marginLeft : "auto",
            marginRight : "auto",
            display : "block",
            width : "10%"
          }}
          onClick = {() => setShowToolsFlag(!showToolsFlag)}
        >
          {showToolsFlag ? "↑" : "↓"}
        </button>
      </div>
      <svg
        style = {{
          position : "absolute",
          padding : "0px",
          margin : "0px"
        }}
        viewBox = {`0 0 ${svgWidth} ${svgHeight}`}
        onMouseDown = {(mouseEvent) => {
          setDraggingOrigin(new Vector2D(mouseEvent.clientX, mouseEvent.clientY));
        }}
        onMouseMove = {(mouseEvent) => {
          if (draggingOrigin !== null) {
            let _draggingDifference = Vector2D.subtract(new Vector2D(mouseEvent.clientX, mouseEvent.clientY), draggingOrigin);
            activeDragables.forEach(activeDragable => activeDragable.handleDrag(_draggingDifference));
            setDraggingDifference(_draggingDifference);
          }
        }}
        onMouseUp = {(mouseEvent) => {
          if (draggingOrigin !== null) {
            activeDragables.forEach(activeDragable => {
              let _draggingDifference = activeDragable.invertYFlag ? new Vector2D(draggingDifference.x, -draggingDifference.y) : draggingDifference;
              activeDragable.setDragSum(Vector2D.add(activeDragable.getDragSum(), _draggingDifference));
              activeDragable.endDrag();
            });
            setActiveDragables([]);
            setDraggingDifference(new Vector2D(0, 0));
            setDraggingOrigin(null);
          }
        }}
      >
        <rect
          x = {0}
          y = {0}
          width = "100%"
          height = "100%"
          fill = {darkModeInStructureViewerFlag ? "black" : "white"}
          style = {{
            position : "absolute"
          }}
          onMouseDown = {() => {
            setActiveDragables([
              {
                invertYFlag : false,
                handleDrag : (draggingDifference : Vector2D) => setViewerDraggingDifference(draggingDifference),
                setDragSum : (draggingSum : Vector2D) => setViewerDraggingSum(draggingSum),
                getDragSum : () => viewerDraggingSum,
                endDrag : () => setViewerDraggingDifference(new Vector2D(0, 0))
              }
            ])
          }}
        />
        <g
          style = {{
            backgroundColor : "none"
          }}
          transform = {`translate(${viewerDraggingSum.x + viewerDraggingDifference.x} ${viewerDraggingSum.y + viewerDraggingDifference.y}) scale(${viewerScale}) translate(${-svgBoundingRectangle.x} ${-svgBoundingRectangle.y}) scale(1 -1)`}
        >
          {rnaComplexes.map((rnaComplex : RNAComplex, rnaComplexIndex : number) => <g
            style = {{
              backgroundColor : "none"
            }}
            key = {rnaComplexIndex}
          >
            {rnaComplex.rnaMolecules.map((rnaMolecule : RNAMolecule, rnaMoleculeIndex : number) => <g
              style = {{
                backgroundColor : "none"
              }}
              key = {rnaMoleculeIndex}
            >
              {Object.keys(rnaMolecule.nucleotidesMap).map((nucleotideKey : string, nucleotideIndex : number) => {
                let nucleotide = rnaMolecule.nucleotidesMap[Number.parseInt(nucleotideKey)];
                let font = nucleotide.font;
                let optionalElements = new Array<JSX.Element>();
                let labelContentBoundingClientRectangle = createRef<SVGRectElement>();
                if (nucleotide.labelContent) {
                  let labelContent = nucleotide.labelContent;
                  optionalElements.push(<text
                    className = "boundedText"
                    color = {nucleotide.color.toCSS()}
                    transform = {`translate(${labelContent.position.x + labelContent.graphicalAdjustment.x} ${labelContent.position.y + labelContent.graphicalAdjustment.y}) scale(1 -1)`}
                    key = "labelContent"
                  >
                    {nucleotide.labelContent.content}
                  </text>,
                  <rect
                    className = "boundingRectangle"
                    style = {{
                      visibility : "hidden",
                      fill : "none",
                      stroke : MOUSE_OVER_HIGHLIGHT_STROKE_COLOR,
                      strokeWidth : MOUSE_OVER_HIGHLIGHT_STROKE_WIDTH
                    }}
                    pointerEvents = "all"
                    onMouseEnter = {() => (labelContentBoundingClientRectangle.current as SVGRectElement).style.visibility = "visible"}
                    onMouseLeave = {() => (labelContentBoundingClientRectangle.current as SVGRectElement).style.visibility = "hidden"}
                    onMouseDown = {() => {
                      setActiveDragables([
                        {
                          invertYFlag : true,
                          handleDrag : (draggingDifference : Vector2D) => labelContent.graphicalAdjustment = Vector2D.scaleUp(draggingDifference, oneOverViewerScale),
                          setDragSum : (draggingSum : Vector2D) => labelContent.position = draggingSum,
                          getDragSum : () => labelContent.position,
                          endDrag : () => labelContent.graphicalAdjustment = new Vector2D(0, 0)
                        }
                      ])
                    }}
                    transform = {`translate(${labelContent.position.x} ${labelContent.position.y})`}
                    ref = {labelContentBoundingClientRectangle}
                    key = "labelContentBoundingRectangle"
                  />);
                }
                if (nucleotide.labelLine) {
                  let labelLine = nucleotide.labelLine;
                  optionalElements.push(<line
                    x1 = {labelLine.endpoint0.x}
                    y1 = {labelLine.endpoint0.y}
                    x2 = {labelLine.endpoint1.x}
                    y2 = {labelLine.endpoint1.y}
                    stroke = {labelLine.color.toCSS()}
                    strokeWidth = {labelLine.strokeWidth}
                    key = "labelLine"
                  />);
                }
                if (nucleotide.basePair) {
                  let basePair = nucleotide.basePair;
                  // Only create one base-pair symbol per base pair.
                  if (rnaMoleculeIndex < basePair.rnaMoleculeIndex || (rnaMoleculeIndex === basePair.rnaMoleculeIndex && nucleotideIndex < basePair.nucleotideIndex)) {
                    let basePairNucleotide = (rnaComplex.rnaMolecules[basePair.rnaMoleculeIndex] as RNAMolecule).nucleotidesMap[basePair.nucleotideIndex];
                    let positionDifference = Vector2D.subtract(basePairNucleotide.position, nucleotide.position);
                    let scalar = 0.25;
                    let v1 = Vector2D.scaleUp(positionDifference, scalar);
                    let v2 = Vector2D.scaleUp(positionDifference, 1 - scalar);
                    switch (basePair.type) {
                      case BasePairType.CANONICAL : {
                        optionalElements.push(<line
                          x1 = {v1.x}
                          y1 = {v1.y}
                          x2 = {v2.x}
                          y2 = {v2.y}
                          stroke = "black"
                          strokeWidth = {DEFAULT_STROKE_WIDTH}
                          key = "basePairSymbol"
                        />);
                        break;
                      }
                      case BasePairType.MISMATCH : {
                        let center = Vector2D.scaleUp(positionDifference, 0.5);
                        optionalElements.push(<circle
                          cx = {center.x}
                          cy = {center.y}
                          r = {rnaMolecule.basePairCircleRadius}
                          fill = "black"
                          stroke = "none"
                          key = "basePairSymbol"
                        />);
                        break;
                      }
                      case BasePairType.WOBBLE : {
                        let center = Vector2D.scaleUp(positionDifference, 0.5);
                        optionalElements.push(<circle
                          cx = {center.x}
                          cy = {center.y}
                          r = {rnaMolecule.basePairCircleRadius}
                          fill = "none"
                          stroke = "black"
                          strokeWidth = {DEFAULT_STROKE_WIDTH}
                          key = "basePairSymbol"
                        />);
                        break;
                      }
                    }
                  }
                }
                let symbolBoundingRectangleRef = createRef<SVGRectElement>();
                return <g
                  transform = {`translate(${nucleotide.position.x} ${nucleotide.position.y})`}
                  style = {{
                    fontSize : font.size,
                    fontFamily : font.family,
                    fontStyle : font.style,
                    fontWeight : font.weight,
                    backgroundColor : "none"
                  }}
                  key = {nucleotideIndex}
                >
                  <text
                    className = "boundedText"
                    stroke = {nucleotide.color.toCSS()}
                    strokeWidth = {DEFAULT_STROKE_WIDTH}
                    transform = {`scale(1 -1)`}
                  >
                    {nucleotide.symbol}
                  </text>
                  <rect
                    className = "boundingRectangle"
                    style = {{
                      visibility : "hidden",
                      fill : "none",
                      stroke : MOUSE_OVER_HIGHLIGHT_STROKE_COLOR,
                      strokeWidth : MOUSE_OVER_HIGHLIGHT_STROKE_WIDTH
                    }}
                    pointerEvents = "all"
                    onMouseEnter = {() => (symbolBoundingRectangleRef.current as SVGRectElement).style.visibility = "visible"}
                    onMouseLeave = {() => (symbolBoundingRectangleRef.current as SVGRectElement).style.visibility = "hidden"}
                    ref = {symbolBoundingRectangleRef}
                    key = "labelContentBoundingBox"
                  />
                  {optionalElements}
                </g>;
              })}
            </g>)}
          </g>)}
        </g>
      </svg>
    </div>
  );
}

export default App;
