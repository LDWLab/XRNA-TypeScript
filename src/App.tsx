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
      console.log("Reading XRNA input file.");
    },
    "str" : (_ : string) => {
      console.log("Reading str input file.");
    }
  };
  const [downloadAnchorHref, setDownloadAnchorHref] = useState<string>();
  const outputFileGenerators : Record<string, FileGenerator> = {
    "json" : () => "This is a JSON file.",
    "xrna" : () => "This is an XRNA file.",
    "svg" : () => "This is an SVG file."
  };
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
  return ( 
    <div style={{
      border : showTabReminderFlag ? "ridge " + (buttonData[currentTab] as ButtonData).highlightColor : "none" ,
      color : "white"
    }}>
      <div style={{
        backgroundColor : "rgb(54, 64, 79)",
        width : "100"
      }}>
        {Object.entries(buttonData).map(([tabName, buttonDatum]) => {
          return <button style={{
            border : "groove gray",
            color : currentTab == tabName ? "white" : "black",
            backgroundColor : currentTab == tabName ? buttonDatum.highlightColor : "white"
          }} key={tabName} onClick={() => setCurrentTab(tabName as Tab)}>{tabName}</button>;
        })}
        <div style={{
          display : currentTab == Tab.IMPORT_EXPORT ? "block" : "none"
        }}>
          <label>
            Upload an input file:&nbsp;
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
                  setOutputFileExtension(newSelectedIndex == -1 ? "" : outputFileExtension);
                }
                let reader = new FileReader();
                reader.addEventListener("load", event => {
                  // Read the content of the input file.
                  let inputFileContent = (event.target as globalThis.FileReader).result as string;
                  (inputFileReaders[outputFileExtension] as FileReader)(inputFileContent);
                });
                reader.readAsText(files[0] as File);
              }
            }}></input>
          </label>
          <br />
          <label>
            Create a downloadable output file:&nbsp;
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
          display : currentTab == Tab.EDIT ? "block" : "none"
        }}>

        </div>
        <div style={{
          display : currentTab == Tab.ANNOTATE ? "block" : "none"
        }}>

        </div>
        <div style={{
          display : currentTab == Tab.SETTINGS ? "block" : "none"
        }}>
          <label>
            Show tab reminder: 
            <input type="checkbox" onChange={() => setShowTabReminderFlag(!showTabReminderFlag)} checked={showTabReminderFlag}></input>
          </label>
          <br />
          <label>
            Copy input-file name and extension to output-file name&nbsp;
            <input type="checkbox" onChange={() => setCopyInputFileNameToOutputFileNameFlag(!copyInputFileNameToOutputFileNameFlag)} checked={copyInputFileNameToOutputFileNameFlag}></input>
          </label>
          <label>
            &nbsp;and extension
            <input type="checkbox" onChange={() => setCopyInputFileExtensionToOutputFileExtensionFlag(!copyInputFileExtensionToOutputFileExtensionFlag)} checked={copyInputFileExtensionToOutputFileExtensionFlag}></input>
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;