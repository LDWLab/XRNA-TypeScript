import { useState, createRef, useEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector';
import inputFileReaders, { type FileReader } from './inputUI';
import outputFileWriters, { type FileWriter } from './outputUI';
import { RNAMolecule } from './RNAMolecule';
import selectionConstraints from './selectionConstraints';

type ButtonData = {
  highlightColor : string
};

enum Tab {
  IMPORT_EXPORT = "Import/Export",
  EDIT = "Edit",
  ANNOTATE = "Annotate",
  SETTINGS = "Settings"
}

function App() {
  const buttonData : Record<Tab, ButtonData> = {
    [Tab.IMPORT_EXPORT] : {
      highlightColor : "rgb(24, 98, 24)"
    },
    [Tab.EDIT] : {
      highlightColor : "rgb(204, 85, 0)"
    },
    [Tab.ANNOTATE] : {
      highlightColor : "rgb(34, 34, 139)"
    },
    [Tab.SETTINGS] : {
      highlightColor : "purple"
    }
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
  const minimumZoomExponent = -50;
  const maximumZoomExponent = 50;
  const zoomBase = 1.1;
  const [showToolsFlag, setShowToolsFlag] = useState<boolean>(true);
  const parentDivDimensionsWatcher = useResizeDetector();
  const bannerDivDimensionsWatcher = useResizeDetector();
  const [darkModeFlag, setDarkModeFlag] = useState<boolean>(false);
  const [invertColorsInOutputFileFlag, setInvertColorsInOutputFileFlag] = useState<boolean>(false);
  // In pixels
  const tabReminderBorderWidth = 6;
  const rnaMolecules = new Array<JSX.Element>();
  rnaMolecules.push(<RNAMolecule/>)
  return (
    <div style={{
      border : showTabReminderFlag ? `solid ${(buttonData[currentTab] as ButtonData).highlightColor} 6px` : "none" ,
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
          {Object.entries(buttonData).map(([tabName, buttonDatum]) => {
            return <button style={{
              border : "groove gray",
              color : currentTab === tabName ? "white" : "black",
              backgroundColor : currentTab === tabName ? buttonDatum.highlightColor : "white"
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
                    (inputFileReaders[outputFileExtension] as FileReader)((event.target as globalThis.FileReader).result as string);
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
                setDarkModeFlag(!darkModeFlag);
                setInvertColorsInOutputFileFlag(!darkModeFlag);
              }} checked={darkModeFlag} />
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
            <input type="range" value={zoomExponent} min={minimumZoomExponent} max={maximumZoomExponent} onChange={event => {
              let newZoomExponent = Number.parseInt((event.target as HTMLInputElement).value);
              setZoomExponent(newZoomExponent);
              setZoom(Math.pow(zoomBase, newZoomExponent));
            }}/>
            <input type="number" value={zoom} onChange={event => {
              let newZoom = Number.parseFloat(event.target.value);
              setZoom(newZoom);
              setZoomExponent(Math.log(newZoom) / Math.log(zoomBase));
            }} step={0.01}/>
          </label>
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
      <svg viewBox={`0 0 ${parentDivDimensionsWatcher.width} ${(parentDivDimensionsWatcher.height as number) - (bannerDivDimensionsWatcher.height as number)}`} version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" style={{
        backgroundColor : darkModeFlag ? "black" : "white",
        display : "block",
        width : "100%",
        height : (parentDivDimensionsWatcher.height as number) - (bannerDivDimensionsWatcher.height as number),
        position : "absolute"
      }}>
        {rnaMolecules}
      </svg>
    </div>
  );
}

export default App;