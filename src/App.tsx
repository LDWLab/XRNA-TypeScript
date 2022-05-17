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
    [Tab.EDIT] : "rgb(204, 85, 0)",
    [Tab.FORMAT] : "rgb(124, 0, 0)",
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
  const zoomBase = 1.1;
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
            }} key={tabName} onClick={() => setCurrentTab(tabName as Tab)}>{tabName}</button>;
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
                            let nucleotideRectangleElementId = [rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex, "boundingClientRect"].join(":");
                            let elements = [
                              <text transform="scale(1 -1)" style={{
                                fill : nucleotide.color.toCSS(),
                                fontSize : nucleotide.font.size,
                                fontWeight : nucleotide.font.weight,
                                fontStyle : nucleotide.font.style,
                                fontFamily : nucleotide.font.family
                              }} key="symbol" onMouseEnter={() => {
                                (document.getElementById(nucleotideRectangleElementId) as HTMLElement).style.stroke = "red";
                              }} onMouseLeave={() => {
                                (document.getElementById(nucleotideRectangleElementId) as HTMLElement).style.stroke = "none";
                              }}>{nucleotide.symbol}</text>,
                              <rect id={nucleotideRectangleElementId} key="symbolBoundingClientRect" style={{
                                fill : "none",
                                stroke : "none",
                                strokeWidth : 0.2
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
                                    <line x1={interpolatedNucleotidePosition.x} y1={interpolatedNucleotidePosition.y} x2={interpolatedBasePairNucleotidePosition.x} y2={interpolatedBasePairNucleotidePosition.y} stroke="black" key="bondSymbol" strokeWidth="0.2"/>
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
                                    <circle cx={center.x} cy={center.y} fill="none" stroke="black" strokeWidth="0.2" r={Vector2D.magnitude(difference) / 10} key="bondSymbol"></circle>
                                  );
                                  break;
                                }
                              }
                            }
                            if (nucleotide.labelLine !== null) {
                              elements.push(<line x1={nucleotide.labelLine.endpoint0.x} y1={nucleotide.labelLine.endpoint0.y} x2={nucleotide.labelLine.endpoint1.x} y2={nucleotide.labelLine.endpoint1.y} strokeWidth={nucleotide.labelLine.strokeWidth} stroke={nucleotide.labelLine.color.toCSS()} key="labelLine"/>);
                            }
                            if (nucleotide.labelContent !== null) {
                              let labelRectangleElementId = [rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex, "label", "boundingClientRect"].join(":");
                              elements.push(
                                <text x={nucleotide.labelContent.position.x} y={-nucleotide.labelContent.position.y} transform="scale(1 -1)" fill={nucleotide.labelContent.color.toCSS()} fontSize={nucleotide.labelContent.font.size} fontFamily={nucleotide.labelContent.font.family} fontStyle={nucleotide.labelContent.font.style} fontWeight={nucleotide.labelContent.font.weight} onMouseEnter={() => {
                                  (document.getElementById(labelRectangleElementId) as HTMLElement).style.stroke = "red";
                                }} onMouseLeave={() => {
                                  (document.getElementById(labelRectangleElementId) as HTMLElement).style.stroke = "none";
                                }} key="labelContent">{nucleotide.labelContent.content}</text>,
                                <rect id={labelRectangleElementId} key="labelContentBoundingClientRect" style={{
                                  fill : "none",
                                  stroke : "none",
                                  strokeWidth : 0.2
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
              let newZoom = Math.pow(zoomBase, newZoomExponent);
              setZoom(newZoom);
              setRoundedZoom(newZoom.toFixed(2));
            }}/>
            <input type="number" value={roundedZoom} onChange={event => {
              let newZoom = Number.parseFloat(event.target.value);
              if (!Number.isNaN(newZoom)) {
                setZoom(newZoom);
                setZoomExponent(Math.log(newZoom) / Math.log(zoomBase));
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
        }} onClick={() => setShowToolsFlag(!showToolsFlag)}>{showToolsFlag ? "↑" : "↓"}</button>
        
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
      }} onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}>
        <g id="svgContent" transform={`translate(${svgTranslate.x + svgTranslateFromDrag.x} ${svgTranslate.y + svgTranslateFromDrag.y}) scale(${zoom * Math.min((parentDivDimensionsWatcher.width ?? 1) / svgContentDimensions.width, svgHeight / svgContentDimensions.height)}) translate(${svgContentOrigin.x} ${svgContentOrigin.y}) scale(1 -1)`}>
          {svgContent}
        </g>
      </svg>
    </div>
  );
}

export default App;