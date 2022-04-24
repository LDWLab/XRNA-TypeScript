import { useState, createRef, useEffect } from 'react'

type ButtonData = {
  highlightColor : string
};

interface FileReader {
  (inputFileContent : string) : void;
}

interface FileGenerator {
  () : string;
}

enum Tab {
  IMPORT_EXPORT = "Import/Export",
  EDIT = "Edit",
  ANNOTATE = "Annotate",
  SETTINGS = "Settings"
}

interface SelectionConstraint {

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
  const inputFileReaders : Record<string, FileReader> = {
    "xrna" : (_ : string) => {

    },
    "xml" : (_ : string) => {

    },
    "ps" : (_ : string) => {

    },
    "ss" : (_ : string) => {

    },
    "str" : (_ : string) => {

    },
    "svg" : (_ : string) => {

    },
    "json" : (_ : string) => {
      
    }
  };
  const outputFileGenerators : Record<string, FileGenerator> = {
    "xrna" : () => "This is an XRNA file.",
    "svg" : () => "This is an SVG file.",
    "tr" : () => "This is a TR file.",
    "csv" : () => "This is a CSV file.",
    "bpseq" : () => "This is a BPSeq file.",
    "jpg" : () => "This is a JPG file.",
    "json" : () => "This is a JSON file."
  };
  const selectionConstraints : Record<string, SelectionConstraint> = {
    "RNA Single Nucleotide" : {

    },
    "RNA Single Strand" : {

    },
    "RNA Single Base Pair" : {

    },
    "RNA Helix" : {

    },
    "RNA Stacked Helix" : {

    },
    "RNA Sub-domain" : {

    },
    "RNA Cycle" : {

    },
    "RNA List Nucs" : {

    },
    "RNA Strand" : {

    },
    "RNA Color Unit" : {

    },
    "RNA Named Group" : {

    },
    "RNA Strand Group" : {

    },
    "Labels Only" : {

    },
    "Entire Scene" : {

    }
  };
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
  return (
    <div style={{
      border : showTabReminderFlag ? "ridge " + (buttonData[currentTab] as ButtonData).highlightColor : "none" ,
      color : "white",
      padding : 0,
      margin : 0,
      backgroundColor : "rgb(54, 64, 79)"
    }}>
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
            }}></input>
          </label>
          <br />
          <label>
            Create a downloadable output file&nbsp;
            <input type="text" value={outputFileName} onChange={event => setOutputFileName(event.target.value)}></input>
          </label>
          <select onChange={event => setOutputFileExtension(event.target.value)} ref={outputFileExtensionSelectRef}>
            {Object.entries(outputFileGenerators).map(([fileExtension, ]) => {
              return <option key={fileExtension} value={fileExtension}>{"." + fileExtension}</option>
            })}
          </select>
          <a href={downloadAnchorHref} download={outputFileName + "." + outputFileExtension} style={{
            display : "none"
          }} ref={downloadAnchorRef}></a>
          <button onClick={() => {
            setDownloadAnchorHref(`data:text/plain;charset=utf-8,${encodeURIComponent((outputFileGenerators[outputFileExtension] as FileGenerator)())}`);
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
            <input type="checkbox" onChange={() => setShowTabReminderFlag(!showTabReminderFlag)} checked={showTabReminderFlag}></input>
          </label>
          <br />
          <label>
            Copy input-file name and extension to output-file name&nbsp;
            <input type="checkbox" onChange={() => setCopyInputFileNameToOutputFileNameFlag(!copyInputFileNameToOutputFileNameFlag)} checked={copyInputFileNameToOutputFileNameFlag}></input>
          </label>
          <label>
            &nbsp;and extension&nbsp;
            <input type="checkbox" onChange={() => setCopyInputFileExtensionToOutputFileExtensionFlag(!copyInputFileExtensionToOutputFileExtensionFlag)} checked={copyInputFileExtensionToOutputFileExtensionFlag}></input>
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
          }}></input>
          <input type="number" value={zoom} onChange={event => {
            let newZoom = Number.parseFloat(event.target.value);
            setZoom(newZoom);
            setZoomExponent(Math.log(newZoom) / Math.log(zoomBase));
          }} step={0.01}></input>
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
  );
}

export default App;