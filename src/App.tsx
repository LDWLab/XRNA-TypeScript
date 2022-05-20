import { useState, createRef, useEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector';
import inputFileReaders, { type FileReader } from './inputUI';
import outputFileWriters, { type FileWriter } from './outputUI';
import selectionConstraints from './selectionConstraints';
import { RNAComplex } from './RNAComplex'
import { RNAMolecule } from './RNAMolecule';
import { BasePairType, Nucleotide } from './Nucleotide';
import { Vector2D } from './Vector2D';

enum Tab {
  IMPORT_EXPORT = "Import/Export",
  EDIT = "Edit",
  FORMAT = "Format",
  ANNOTATE = "Annotate",
  SETTINGS = "Settings"
}

function App() {
  const tabColors : Record<Tab, string> = {
    [Tab.IMPORT_EXPORT] : "rgb(24, 98, 24)",
    [Tab.EDIT] : "rgb(124, 0, 0)",
    [Tab.FORMAT] : "rgb(204, 85, 0)",
    [Tab.ANNOTATE] : "rgb(34, 34, 139)",
    [Tab.SETTINGS] : "purple"
  };
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.IMPORT_EXPORT);
  const [showTabReminderFlag, setShowTabReminderFlag] = useState<boolean>(true);
  const [outputFileName, setOutputFileName] = useState<string>("");
  const [copyInputFileNameToOutputFileNameFlag, setCopyInputFileNameToOutputFileNameFlag] = useState<boolean>(true);
  const [copyInputFileExtensionToOutputFileExtensionFlag, setCopyInputFileExtensionToOutputFileExtensionFlag] = useState<boolean>(true);
  const [outputFileExtension, setOutputFileExtension] = useState<string>("");
  const [downloadAnchorHref, setDownloadAnchorHref] = useState<string>();
  const outputFileExtensionSelectRef = createRef<HTMLSelectElement>();
  const downloadAnchorRef = createRef<HTMLAnchorElement>();
  useEffect(() => {
    // Upon load:
    // * Initialize the output-file select.
    (outputFileExtensionSelectRef.current as HTMLSelectElement).selectedIndex = -1;
  }, []);
  useEffect(() => {
    (downloadAnchorRef.current as HTMLAnchorElement).click();
  }, [downloadAnchorHref]);
  const [zoomExponent, setZoomExponent] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [roundedZoom, setRoundedZoom] = useState(`${Math.round(zoom)}`);
  const ZOOM_BASE = 1.1;
  const [showToolsFlag, setShowToolsFlag] = useState<boolean>(true);
  const parentDivDimensionsWatcher = useResizeDetector();
  const bannerDivDimensionsWatcher = useResizeDetector();
  const [invertColorsInViewFlag, setInvertColorsInViewFlag] = useState<boolean>(false);
  const [invertColorsInOutputFileFlag, setInvertColorsInOutputFileFlag] = useState<boolean>(false);
  // In pixels
  const tabReminderBorderWidth = 6;
  const [svgContent, setSvgContent] = useState<JSX.Element[]>([]);
  const [svgContentOrigin, setSvgContentOrigin] = useState({x : 0, y : 0});
  useEffect(() => {
    let svgContentHtml = document.getElementById("svgContent") as HTMLElement;
    let svgContentBoundingClientRect = svgContentHtml.getBoundingClientRect();
    let svgHtml = document.getElementById("svg") as HTMLElement;
    let svgBoundingClientRect = svgHtml.getBoundingClientRect();
    setSvgContentOrigin({
      x : svgBoundingClientRect.x - svgContentBoundingClientRect.x,
      y : svgBoundingClientRect.y - svgContentBoundingClientRect.y
    });
    setSvgContentDimensions({
      width : svgContentBoundingClientRect.width,
      height : svgContentBoundingClientRect.height
    });

    let texts = document.querySelectorAll("text");
    let rectangles = document.querySelectorAll("rect");
    for (let i = 0; i < texts.length; i++) {
      let textI = texts[i] as SVGTextElement;
      let rectangleI = rectangles[i] as SVGRectElement;
      let boundingRectangle = textI.getBoundingClientRect();
      let xAttribute = textI.getAttribute("x");
      let yAttribute = textI.getAttribute("y");
      let newX = (xAttribute == null ? 0 : Number.parseFloat(xAttribute)) - boundingRectangle.width / 2;
      let newY = (yAttribute == null ? 0 : Number.parseFloat(yAttribute)) + boundingRectangle.height / 4;
      textI.setAttribute("x", `${newX}`);
      textI.setAttribute("y", `${newY}`);
      rectangleI.setAttribute("x", `${newX}`);
      rectangleI.setAttribute("y", `${-newY}`);
      rectangleI.setAttribute("width", `${boundingRectangle.width}`);
      rectangleI.setAttribute("height", `${boundingRectangle.height}`);
    };
  }, [svgContent]);
  useEffect(() => {
    (document.getElementById("svgContent") as HTMLElement).style.display = "block";
  }, [svgContentOrigin]);
  const [svgHeight, setSvgHeight] = useState(0);
  const [svgContentDimensions, setSvgContentDimensions] = useState({width : 1, height : 1});
  useEffect(() => {
    setSvgHeight((parentDivDimensionsWatcher.height as number) - (bannerDivDimensionsWatcher.height as number));
  }, [parentDivDimensionsWatcher.height, bannerDivDimensionsWatcher.height]);
  const [svgTranslateFromDrag, setSvgTranslateFromDrag] = useState(new Vector2D(0, 0));
  const [svgTranslate, setSvgTranslate] = useState(new Vector2D(0, 0));
  const [dragStart, setDragStart] = useState<Vector2D | null>(null);
  function handleMouseUp() {
    setSvgTranslate(Vector2D.add(svgTranslate, svgTranslateFromDrag));
    setSvgTranslateFromDrag(new Vector2D(0, 0));
    setDragStart(null);
  }
  const ELEMENT_ID_DELIMITER = ":";
  const MOUSE_OVER_HIGHLIGHT_STROKE = tabColors[Tab.EDIT];
  const DEFAULT_STROKE_WIDTH = 0.2;
  const DEFAULT_NUMBER_OF_DECIMAL_POINTS = 2;
  return (
    <div style={{
      border : showTabReminderFlag ? `solid ${tabColors[currentTab]} 6px` : "none" ,
      color : "white",
      padding : 0,
      margin : 0,
      backgroundColor : "rgb(54, 64, 79)",
      width : showTabReminderFlag ? `calc(100% - ${2 * tabReminderBorderWidth}px)` : "100%",
      height : showTabReminderFlag ? `calc(100% - ${2 * tabReminderBorderWidth}px)` : "100%",
      position : "absolute",
      display : "block"
    }} ref={parentDivDimensionsWatcher.ref}>
      <div ref={bannerDivDimensionsWatcher.ref}>
        <div style={{
          display : showToolsFlag ? "block" : "none"
        }}>
          {Object.entries(tabColors).map(([tabName, buttonDatum]) => {
            return <button style={{
              border : "groove gray",
              color : currentTab === tabName ? "white" : "black",
              backgroundColor : currentTab === tabName ? buttonDatum : "white"
            }} key={tabName} onClick={() => {
              console.log(`New currentTab: ${tabName} ${tabName as Tab}`);
              setCurrentTab(tabName as Tab);
            }}>{tabName}</button>;
          })}
          <div style={{
            display : currentTab === Tab.IMPORT_EXPORT ? "block" : "none"
          }}>
            <label>
              Upload an input file&nbsp;
              <input type="file" accept={Object.keys(inputFileReaders).map(inputFileExtension => "." + inputFileExtension).join(",")} onChange={event => {
                let files = event.target.files;
                if (files && files.length > 0) {
                  let inputFileName = (files[0] as File).name;
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
                    (document.getElementById("svgContent") as HTMLElement).style.display = "none";
                    setSvgContent(parsedInput.rnaComplexes.map((rnaComplex : RNAComplex, rnaComplexIndex : number) => <g key={rnaComplexIndex}>
                    {
                      rnaComplex.rnaMolecules.map((rnaMolecule : RNAMolecule, rnaMoleculeIndex : number) => <g key={rnaMoleculeIndex}>
                        {
                          Object.values(rnaMolecule.nucleotidesMap).map((nucleotide : Nucleotide, nucleotideIndex : number) => {
                            let nucleotideElementId = [rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex].join(ELEMENT_ID_DELIMITER);
                            let nucleotideRectangleElementId = [nucleotideElementId, "boundingClientRect"].join(ELEMENT_ID_DELIMITER);
                            let elements = [
                              <text transform="scale(1 -1)" style={{
                                fill : nucleotide.color.toCSS(),
                                fontSize : nucleotide.font.size,
                                fontWeight : nucleotide.font.weight,
                                fontStyle : nucleotide.font.style,
                                fontFamily : nucleotide.font.family
                              }} key="symbol" onMouseEnter={() => {
                                if (currentTab === Tab.EDIT) {
                                  (document.getElementById(nucleotideRectangleElementId) as HTMLElement).style.stroke = 
                                  MOUSE_OVER_HIGHLIGHT_STROKE;
                                }
                              }} onMouseLeave={() => {
                                (document.getElementById(nucleotideRectangleElementId) as HTMLElement).style.stroke = "none";
                              }}>{nucleotide.symbol}</text>,
                              <rect id={nucleotideRectangleElementId} key="symbolBoundingClientRect" style={{
                                fill : "none",
                                stroke : "none",
                                strokeWidth : DEFAULT_STROKE_WIDTH
                              }}></rect>
                            ];
                            if (nucleotide.basePair !== null) {
                              let basePairNucleotide = (rnaComplex.rnaMolecules[nucleotide.basePair.rnaMoleculeIndex] as RNAMolecule).nucleotidesMap[nucleotide.basePair.nucleotideIndex] as Nucleotide;
                              let difference = Vector2D.subtract(basePairNucleotide.position, nucleotide.position);
                              switch (nucleotide.basePair.type) {
                                case BasePairType.CANONICAL: {
                                  let interpolatedNucleotidePosition = Vector2D.scaleUp(difference, 0.3);
                                  let interpolatedBasePairNucleotidePosition = Vector2D.scaleUp(difference, 0.7)
                                  elements.push(
                                    <line x1={interpolatedNucleotidePosition.x} y1={interpolatedNucleotidePosition.y} x2={interpolatedBasePairNucleotidePosition.x} y2={interpolatedBasePairNucleotidePosition.y} stroke="black" key="bondSymbol" strokeWidth={DEFAULT_STROKE_WIDTH}/>
                                  );
                                  break;
                                }
                                case BasePairType.WOBBLE: {
                                  let center = Vector2D.scaleUp(difference, 0.5);
                                  elements.push(
                                    <circle cx={center.x} cy={center.y} fill="black" r={Vector2D.magnitude(difference) / 10} key="bondSymbol"></circle>
                                  );
                                  break;
                                }
                                case BasePairType.MISMATCH: {
                                  let center = Vector2D.scaleUp(difference, 0.5);
                                  elements.push(
                                    <circle cx={center.x} cy={center.y} fill="none" stroke="black" strokeWidth={DEFAULT_STROKE_WIDTH} r={Vector2D.magnitude(difference) / 10} key="bondSymbol"></circle>
                                  );
                                  break;
                                }
                              }
                            }
                            if (nucleotide.labelLine !== null) {
                              elements.push(<line x1={nucleotide.labelLine.endpoint0.x} y1={nucleotide.labelLine.endpoint0.y} x2={nucleotide.labelLine.endpoint1.x} y2={nucleotide.labelLine.endpoint1.y} strokeWidth={nucleotide.labelLine.strokeWidth} stroke={nucleotide.labelLine.color.toCSS()} key="labelLine"/>);
                              let labelLineElementId = [nucleotideElementId, "labelLine"].join(ELEMENT_ID_DELIMITER);
                              let pathBodyElementId = [labelLineElementId, "boundingBodyPath"].join(ELEMENT_ID_DELIMITER);
                              let pathCap0ElementId = [labelLineElementId, "boundingCap0Path"].join(ELEMENT_ID_DELIMITER);
                              let pathCap1ElementId = [labelLineElementId, "boundingCap1Path"].join(ELEMENT_ID_DELIMITER);
                              let differenceBetweenEndpoints = Vector2D.subtract(nucleotide.labelLine.endpoint1, nucleotide.labelLine.endpoint0);
                              let v0 = Vector2D.add(nucleotide.labelLine.endpoint0, Vector2D.scaleUp(differenceBetweenEndpoints, 0.2));
                              let v1 = Vector2D.subtract(nucleotide.labelLine.endpoint1, Vector2D.scaleUp(differenceBetweenEndpoints, 0.2));
                              // "positive" / "negative" designations are arbitrary.
                              let positiveTranslation = Vector2D.scaleDown(Vector2D.orthogonalize(differenceBetweenEndpoints), 3);
                              let negativeTranslation = Vector2D.negate(positiveTranslation);
                              let v0TranslatedPositively = Vector2D.add(v0, positiveTranslation);
                              let v0TranslatedNegatively = Vector2D.add(v0, negativeTranslation);
                              let v1TranslatedPositively = Vector2D.add(v1, positiveTranslation);
                              let v1TranslatedNegatively = Vector2D.add(v1, negativeTranslation);
                              elements.push(
                                <path id={pathBodyElementId} pointerEvents = "all" d={`M${v0TranslatedPositively.x} ${v0TranslatedPositively.y} L${v1TranslatedPositively.x} ${v1TranslatedPositively.y} L${v1TranslatedNegatively.x} ${v1TranslatedNegatively.y} L${v0TranslatedNegatively.x} ${v0TranslatedNegatively.y}Z`} style={{
                                  stroke : "none",
                                  fill : "none",
                                  strokeWidth : DEFAULT_STROKE_WIDTH
                                }} onMouseEnter={() => {
                                  console.log(`currentTab: ${currentTab} === ${Tab.EDIT} ? ${currentTab === Tab.EDIT}`);
                                  if (currentTab === Tab.EDIT) {
                                    [pathBodyElementId, pathCap0ElementId, pathCap1ElementId].forEach((elementId : string) => {
                                      (document.getElementById(elementId) as HTMLElement).style.stroke = MOUSE_OVER_HIGHLIGHT_STROKE;
                                    });
                                  }
                                }} onMouseLeave={() => {
                                  [pathBodyElementId, pathCap0ElementId, pathCap1ElementId].forEach((elementId : string) => {
                                    (document.getElementById(elementId) as HTMLElement).style.stroke = "none";
                                  });
                                }} key="boundingBodyPath"/>,
                                <path id={pathCap0ElementId} pointerEvents = "all" d={`M${v0TranslatedPositively.x} ${v0TranslatedPositively.y} A1 1 0 0 1 ${v0TranslatedNegatively.x} ${v0TranslatedNegatively.y} Z`} style={{
                                  stroke : "none",
                                  fill : "none",
                                  strokeWidth : DEFAULT_STROKE_WIDTH
                                }} onMouseEnter={() => {
                                  if (currentTab === Tab.EDIT) {
                                    (document.getElementById(pathCap0ElementId) as HTMLElement).style.stroke = MOUSE_OVER_HIGHLIGHT_STROKE;
                                  }
                                }} onMouseLeave={() => {
                                  (document.getElementById(pathCap0ElementId) as HTMLElement).style.stroke = "none";
                                }} key="boundingCap0Path"/>,
                                <path id={pathCap1ElementId} pointerEvents = "all" d={`M${v1TranslatedNegatively.x} ${v1TranslatedNegatively.y} A1 1 0 0 1 ${v1TranslatedPositively.x} ${v1TranslatedPositively.y} Z`} style={{
                                  stroke : "none",
                                  fill : "none",
                                  strokeWidth : DEFAULT_STROKE_WIDTH
                                }} onMouseEnter={() => {
                                  if (currentTab === Tab.EDIT) {
                                    (document.getElementById(pathCap1ElementId) as HTMLElement).style.stroke = MOUSE_OVER_HIGHLIGHT_STROKE;
                                  }
                                }} onMouseLeave={() => {
                                  (document.getElementById(pathCap1ElementId) as HTMLElement).style.stroke = "none";
                                }} key="boundingCap1Path"/>
                              );
                            }
                            if (nucleotide.labelContent !== null) {
                              let labelContentElementId = [nucleotideElementId, "labelContent"].join(ELEMENT_ID_DELIMITER);
                              let labelRectangleElementId = [labelContentElementId, "boundingClientRect"].join(ELEMENT_ID_DELIMITER);
                              elements.push(
                                <text x={nucleotide.labelContent.position.x} y={-nucleotide.labelContent.position.y} transform="scale(1 -1)" fill={nucleotide.labelContent.color.toCSS()} fontSize={nucleotide.labelContent.font.size} fontFamily={nucleotide.labelContent.font.family} fontStyle={nucleotide.labelContent.font.style} fontWeight={nucleotide.labelContent.font.weight} onMouseEnter={() => {
                                  if (currentTab === Tab.EDIT) {
                                    (document.getElementById(labelRectangleElementId) as HTMLElement).style.stroke = MOUSE_OVER_HIGHLIGHT_STROKE;
                                  }
                                }} onMouseLeave={() => {
                                  (document.getElementById(labelRectangleElementId) as HTMLElement).style.stroke = "none";
                                }} key="labelContent">{nucleotide.labelContent.content}</text>,
                                <rect id={labelRectangleElementId} key="labelContentBoundingClientRect" style={{
                                  fill : "none",
                                  stroke : "none",
                                  strokeWidth : DEFAULT_STROKE_WIDTH,
                                  display : "block"
                                }}></rect>
                              );
                            }
                            return <g key={nucleotideIndex} transform={`translate(${nucleotide.position.x} ${nucleotide.position.y})`}>
                              {elements}
                            </g>
                          })
                        }
                      </g>)
                    }
                    </g>));
                  });
                  reader.readAsText(files[0] as File);
                }
              }}/>
            </label>
            <br />
            <label>
              Create a downloadable output file&nbsp;
              <input type="text" value={outputFileName} onChange={event => setOutputFileName(event.target.value)} />
            </label>
            <select onChange={event => setOutputFileExtension(event.target.value)} ref={outputFileExtensionSelectRef}>
              {Object.entries(outputFileWriters).map(([fileExtension, ]) => {
                return <option key={fileExtension} value={fileExtension}>{"." + fileExtension}</option>
              })}
            </select>
            <a href={downloadAnchorHref} download={outputFileName + "." + outputFileExtension} style={{
              display : "none"
            }} ref={downloadAnchorRef}></a>
            <button onClick={() => {
              setDownloadAnchorHref(`data:text/plain;charset=utf-8,${encodeURIComponent((outputFileWriters[outputFileExtension] as FileWriter)())}`);
            }} disabled={!outputFileName || !outputFileExtension}>Download</button>
          </div>
          <div style={{
            display : currentTab === Tab.EDIT ? "block" : "none"
          }}>
          </div>
          <div style={{
            display : currentTab === Tab.FORMAT ? "block" : "none"
          }}>
          </div>
          <div style={{
            display : currentTab === Tab.ANNOTATE ? "block" : "none"
          }}>
          </div>
          <div style={{
            display : currentTab === Tab.SETTINGS ? "block" : "none"
          }}>
            <label>
              Show tab reminder&nbsp;
              <input type="checkbox" onChange={() => setShowTabReminderFlag(!showTabReminderFlag)} checked={showTabReminderFlag} />
            </label>
            <br />
            <label>
              Copy input-file name and extension to output-file name&nbsp;
              <input type="checkbox" onChange={() => {
                setCopyInputFileNameToOutputFileNameFlag(!copyInputFileNameToOutputFileNameFlag);
                setCopyInputFileExtensionToOutputFileExtensionFlag(!copyInputFileNameToOutputFileNameFlag);
              }} checked={copyInputFileNameToOutputFileNameFlag} />
            </label>
            <label>
              &nbsp;and extension&nbsp;
              <input type="checkbox" onChange={() => setCopyInputFileExtensionToOutputFileExtensionFlag(!copyInputFileExtensionToOutputFileExtensionFlag)} checked={copyInputFileExtensionToOutputFileExtensionFlag} />
            </label>
            <br />
            <label>
              Dark mode (invert colors) in viewer&nbsp;
              <input type="checkbox" onChange={() => {
                setInvertColorsInViewFlag(!invertColorsInViewFlag);
                setInvertColorsInOutputFileFlag(!invertColorsInViewFlag);
              }} checked={invertColorsInViewFlag} />
            </label>
            <label>
            &nbsp;and in output file(s)&nbsp;
              <input type="checkbox" onChange={() => setInvertColorsInOutputFileFlag(!invertColorsInOutputFileFlag)} checked={invertColorsInOutputFileFlag} />
            </label>
          </div>
          <label>
            Selection Constraint&nbsp;
            <select>
              {Object.entries(selectionConstraints).map(([key, ]) => {
                return <option key={key}>{key}</option>
              })}
            </select>
          </label>
          <br />
          <label>
            Zoom&nbsp;
            <input type="range" value={zoomExponent} min={-50} max={50} onChange={event => {
              let newZoomExponent = Number.parseInt((event.target as HTMLInputElement).value);
              setZoomExponent(newZoomExponent);
              let newZoom = Math.pow(ZOOM_BASE, newZoomExponent);
              setZoom(newZoom);
              setRoundedZoom(newZoom.toFixed(DEFAULT_NUMBER_OF_DECIMAL_POINTS));
            }}/>
            <input type="number" value={roundedZoom} onChange={event => {
              let newZoom = Number.parseFloat(event.target.value);
              if (!Number.isNaN(newZoom)) {
                setZoom(newZoom);
                setZoomExponent(Math.log(newZoom) / Math.log(ZOOM_BASE));
              }
              setRoundedZoom(event.target.value);
            }} step={0.01}/>
          </label>
          <button onClick={() => {
            setZoomExponent(0);
            setZoom(1);
            setRoundedZoom("1");
            setSvgTranslate(new Vector2D(0, 0));
          }}>Rest View</button>
        </div>
        <button style={{
          color : "white",
          backgroundColor : "inherit",
          border : "groove gray",
          width : "10%",
          display : "block",
          marginLeft : "auto",
          marginRight : "auto"
        }} onClick={() => setShowToolsFlag(!showToolsFlag)}>{(showToolsFlag ? "↑" : "↓") + currentTab + " " + (currentTab === Tab.EDIT)}</button>
        
      </div>
      <svg id="svg" viewBox={`0 0 ${parentDivDimensionsWatcher.width ?? 0} ${svgHeight}`} version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" style={{
        display : "block",
        width : "100%",
        height : svgHeight,
        position : "absolute",
        background : invertColorsInViewFlag ? "black" : "white"
      }} onMouseDown={mouseEvent => {
        setDragStart(new Vector2D(mouseEvent.clientX, mouseEvent.clientY));
      }} onMouseMove={event => {
        if (dragStart !== null) {
          setSvgTranslateFromDrag(new Vector2D(event.clientX - dragStart.x, event.clientY - dragStart.y));
        }
      }} onMouseLeave={handleMouseUp} onMouseUp={handleMouseUp} onWheel={(event) => {
        let newZoomExponent = zoomExponent + (event.deltaY < 0 ? 1 : -1);
        setZoomExponent(newZoomExponent);
        let zoom = Math.pow(ZOOM_BASE, newZoomExponent);
        setZoom(zoom);
        setRoundedZoom(zoom.toFixed(DEFAULT_NUMBER_OF_DECIMAL_POINTS));
      }}>
        <g id="svgContent" transform={`translate(${svgTranslate.x + svgTranslateFromDrag.x} ${svgTranslate.y + svgTranslateFromDrag.y}) scale(${zoom * Math.min((parentDivDimensionsWatcher.width ?? 1) / svgContentDimensions.width, svgHeight / svgContentDimensions.height)}) translate(${svgContentOrigin.x} ${svgContentOrigin.y}) scale(1 -1)`}>
          {svgContent}
        </g>
      </svg>
    </div>
  );
}

export default App;