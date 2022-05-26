import { useEffect, useState, /*createRef*/ } from 'react'
import { useResizeDetector } from 'react-resize-detector';
import inputFileReaders, { type FileReader } from './inputUI';
// import outputFileWriters, { type FileWriter } from './outputUI';
// import selectionConstraints from './selectionConstraints';
import { RNAComplex } from './RNAComplex'
import { RNAMolecule } from './RNAMolecule';
import { Nucleotide, BasePair, BasePairType, LabelContent } from './Nucleotide';
import { Vector2D } from './Vector2D';
import sampleInput from './sampleInput';

interface Tab {
  label : string;
  backgroundColor : string;
  childElements : JSX.Element[]
}

function App() : JSX.Element {
  const importExportTab : Tab = {
    label : "Import/Export",
    backgroundColor : "rgb(24, 98, 24)",
    childElements : []
  };
  const editTab : Tab = {
    label : "Edit",
    backgroundColor : "rgb(124, 0, 0)",
    childElements : []
  };
  const formatTab : Tab = {
    label : "Format",
    backgroundColor : "rgb(204, 85, 0)",
    childElements : []
  };
  const annotateTab : Tab = {
    label : "Annotate",
    backgroundColor : "rgb(34, 34, 139)",
    childElements : []
  };
  const settingsTab : Tab = {
    label : "Settings",
    backgroundColor : "purple",
    childElements : []
  };
  const tabs : Tab[] = [
    importExportTab,
    editTab,
    formatTab,
    annotateTab,
    settingsTab
  ];
  // *** Begin constants ***
  const CHARCOAL_GRAY = "rgb(54, 64, 79)";
  const TAB_REMINDER_BORDER_WIDTH = 6; // in pixels
  const MOUSE_OVER_HIGHLIGHT_STROKE_COLOR = "red";
  const MOUSE_OVER_HIGHLIGHT_STROKE_WIDTH = 0.2;
  const ID_DELIMITER = ":";
  const NUCLEOTIDE_TEXT_ID_SUFFIX = "symbol";
  const LABEL_CONTENT_TEXT_ID_SUFFIX = "labelContent";
  // *** End constants ***
  // *** Begin state variables ***
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  const [svgHeight, setSvgHeight] = useState<number>(0);
  const [rnaComplexes, setRnaComplexes] = useState<RNAComplex[]>([]);
  const [showTabReminderFlag, setShowTabReminderFlag] = useState<boolean>(true);
  const [svgBoundingBox, setSvgBoundingBox] = useState<DOMRect>(new DOMRect(0, 0, 1, 1));
  const parentDivResizeDetector = useResizeDetector();
  const toolsDivResizeDetector = useResizeDetector();
  // *** End state variables ***
  // *** Begin effect functions ***
  useEffect(
    () => {
      let parentDivHeight = parentDivResizeDetector.height ?? 0;
      let toolsDivHeight = toolsDivResizeDetector.height ?? 0;
      setSvgHeight(parentDivHeight - toolsDivHeight);
    },
    [parentDivResizeDetector.height, toolsDivResizeDetector.height]
  );
  useEffect(
    () => {
      let parsedInput = (inputFileReaders["xrna"] as FileReader)(sampleInput);
      setRnaComplexes(parsedInput.rnaComplexes);
    },
    []
  );
  useEffect(
    () => {
      let rectangleElements = document.querySelectorAll("rect");
      let textElements = document.querySelectorAll("text");
      // rectangleElements.length === textElements.length
      for (let i = 0; i < rectangleElements.length; i++) {
        // let rectangleElementI = rectangleElements[i] as SVGRectElement;
        let textElementI = textElements[i] as SVGTextElement;
        let textBoundingBox = textElementI.getBBox();
        let idSplit = (textElementI.getAttribute("id") as string).split(ID_DELIMITER);
        let nucleotide = ((rnaComplexes[Number.parseInt(idSplit[0] as string)] as RNAComplex).rnaMolecules[Number.parseInt(idSplit[1] as string)] as RNAMolecule).nucleotidesMap[Number.parseInt(idSplit[2] as string)] as Nucleotide;
        switch (idSplit[3] as string) {
          case NUCLEOTIDE_TEXT_ID_SUFFIX : {
            nucleotide.graphicalAdjustment = new Vector2D(-textBoundingBox.width / 2, -textBoundingBox.height / 4);
            break;
          }
          case LABEL_CONTENT_TEXT_ID_SUFFIX : {
            (nucleotide.labelContent as LabelContent).graphicalAdjustment = new Vector2D(-textBoundingBox.width / 2, -textBoundingBox.height / 4);
            break;
          }
        }
      }
      // Get the bounding box of the top-level group element.
      let svgElement = document.querySelector("g") as SVGGElement;
      setSvgBoundingBox(svgElement.getBBox());
    },
    [rnaComplexes]
  );
  // *** End effect functions ***
  // *** Begin style variables ***
  // *** End style variables ***
  // *** Begin event handlers ***
  // *** End event handlers ***
  settingsTab.childElements.push(<label
    key = {"showTabReminderInput"}
  >
    Show tab reminder:&nbsp;
    <input
      type = "checkbox"
      checked = {showTabReminderFlag}
      onChange = {() => setShowTabReminderFlag(!showTabReminderFlag)}
    />
  </label>);
  return (
    <div
      ref = {parentDivResizeDetector.ref}
      style = {{
        backgroundColor : CHARCOAL_GRAY,
        position : "absolute",
        width : `calc(100% - ${showTabReminderFlag ? 2 * TAB_REMINDER_BORDER_WIDTH : 0}px)`,
        height : `calc(100% - ${showTabReminderFlag ? 2 * TAB_REMINDER_BORDER_WIDTH : 0}px)`,
        border : `solid ${(tabs[currentTabIndex] as Tab).backgroundColor} ${showTabReminderFlag ? TAB_REMINDER_BORDER_WIDTH : 0}px`,
        color : "white"
      }}
    >
      <div
        ref = {toolsDivResizeDetector.ref}
      >
        {tabs.map((tab : Tab, tabIndex : number) => <button
          key = {tabIndex}
          style = {{
            backgroundColor : tabIndex === currentTabIndex ? tab.backgroundColor : CHARCOAL_GRAY,
            color : "inherit",
            border : `ridge ${CHARCOAL_GRAY}`
          }}
          onClick = {() => setCurrentTabIndex(tabIndex)}
        >
          {tab.label}
        </button>)}
        {tabs.map((tab : Tab, tabIndex : number) => <div
          key = {tabIndex}
          style = {{
            display : tabIndex === currentTabIndex ? "block" : "none"
          }}
          >
          {tab.childElements}
        </div>)}
      </div>
      <svg
        style = {{
          height : svgHeight,
          width : parentDivResizeDetector.width,
          backgroundColor : "white"
        }}
      >
        <g
          transform = {`scale(${Math.min((parentDivResizeDetector.width ?? 1) / svgBoundingBox.width, svgHeight / svgBoundingBox.height)}) scale(1 -1) translate(${-svgBoundingBox.x} ${-(svgBoundingBox.y + svgBoundingBox.height)})`}
        >
          {rnaComplexes.map((rnaComplex : RNAComplex, rnaComplexIndex : number) => <g
            key = {rnaComplexIndex}
          >
            {rnaComplex.rnaMolecules.map((rnaMolecule : RNAMolecule, rnaMoleculeIndex) => <g
              key = {rnaMoleculeIndex}
            >
              {Object.values(rnaMolecule.nucleotidesMap).map((nucleotide : Nucleotide, nucleotideIndex) => {
                const optionalElements : JSX.Element[] = [];
                if (nucleotide.labelContent !== null) {
                  let labelContent = nucleotide.labelContent;
                  optionalElements.push(
                    <text
                      key = {LABEL_CONTENT_TEXT_ID_SUFFIX}
                      id = {[rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex, LABEL_CONTENT_TEXT_ID_SUFFIX].join(":")}
                      transform = {`translate(${labelContent.position.x + labelContent.graphicalAdjustment.x} ${labelContent.position.y + labelContent.graphicalAdjustment.y}) scale(1 -1)`}//{`translate(${labelContent.position.x + labelContent.graphicalAdjustment.x, labelContent.position.y + labelContent.graphicalAdjustment.y}) scale(1 -1)`}
                      fontSize = {labelContent.font.size}
                      fontStyle = {labelContent.font.style}
                      fontFamily = {labelContent.font.family}
                      fontWeight = {labelContent.font.weight}
                      fill = {labelContent.color.toCSS()}
                    >
                      {labelContent.content}
                    </text>
                  );
                }
                if (nucleotide.labelLine !== null) {
                  let labelLine = nucleotide.labelLine;
                  optionalElements.push(<line
                    key = "labelLine"
                    x1 = {labelLine.endpoint0.x}
                    y1 = {labelLine.endpoint0.y}
                    x2 = {labelLine.endpoint1.x}
                    y2 = {labelLine.endpoint1.y}
                    stroke = {labelLine.color.toCSS()}
                    strokeWidth = {labelLine.strokeWidth}
                  />);
                }
                if (nucleotide.basePair !== null) {
                  let basePair : BasePair = nucleotide.basePair;
                  if (rnaMoleculeIndex < basePair.rnaMoleculeIndex || (rnaMoleculeIndex == basePair.rnaMoleculeIndex && nucleotideIndex < basePair.nucleotideIndex)) {
                    let basePairNucleotide = (rnaComplex.rnaMolecules[basePair.rnaMoleculeIndex] as RNAMolecule).nucleotidesMap[basePair.nucleotideIndex] as Nucleotide;
                    let difference = Vector2D.subtract(basePairNucleotide.position, nucleotide.position);
                    switch (basePair.type) {
                      case BasePairType.CANONICAL : {
                        let scalar = 0.3;
                        let difference0 : Vector2D = Vector2D.scaleUp(difference, scalar);
                        let difference1 : Vector2D = Vector2D.scaleUp(difference, (1 - scalar));
                        optionalElements.push(<line
                          stroke = "black"
                          strokeWidth = {MOUSE_OVER_HIGHLIGHT_STROKE_WIDTH}
                          key = "basePair"
                          x1 = {difference0.x}
                          y1 = {difference0.y}
                          x2 = {difference1.x}
                          y2 = {difference1.y}
                        />);
                        break;
                      }
                      case BasePairType.MISMATCH : {
                        break;
                      }
                      case BasePairType.WOBBLE : {
                        break;
                      }
                    }
                  }
                }
                return <g
                  key = {nucleotideIndex}
                  transform = {`translate(${nucleotide.position.x} ${nucleotide.position.y})`}
                >
                  {optionalElements}
                  <text
                    id = {[rnaComplexIndex, rnaMoleculeIndex, nucleotideIndex, NUCLEOTIDE_TEXT_ID_SUFFIX].join(":")}
                    transform = {`translate(${nucleotide.graphicalAdjustment.x} ${nucleotide.graphicalAdjustment.y}) scale(1 -1)`}
                    fontSize = {nucleotide.font.size}
                    fontStyle = {nucleotide.font.style}
                    fontFamily = {nucleotide.font.family}
                    fontWeight = {nucleotide.font.weight}
                    fill = {nucleotide.color.toCSS()}
                  >
                    {nucleotide.symbol}
                  </text>
                  <rect
                    fill = "none"
                    stroke = {MOUSE_OVER_HIGHLIGHT_STROKE_COLOR}
                    strokeWidth = {MOUSE_OVER_HIGHLIGHT_STROKE_WIDTH}
                  />
                </g>
              })}
            </g>)}
          </g>)}
        </g>
      </svg>
    </div>
  );
}

export default App;