import { useState } from 'react'

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
  
  const buttons = [];
  var buttonIndex = 0;
  for (const [tabName, buttonDatum] of Object.entries(buttonData)) {
    const style = {
      border : "groove gray",
      color : currentTab == tabName ? "white" : "black",
      backgroundColor : currentTab == tabName ? buttonDatum.highlightColor : "white"
    };
    buttons.push(<button style={style} key={buttonIndex} onClick={() => setCurrentTab(tabName as Tab)}>{tabName}</button>);
    buttonIndex++;
  }
  const [showTabReminderFlag, setShowTabReminderFlag] = useState<boolean>(true);
  const boundingDivStyle = {
    border : showTabReminderFlag ? "ridge " + (buttonData[currentTab] as ButtonData).highlightColor : "none" ,
    color : "white"
  };
  const toolsDivStyle = {
    backgroundColor : "rgb(54, 64, 79)",
    width : "100"
  };
  const importExportDivStyle = {
    display : currentTab == Tab.IMPORT_EXPORT ? "block" : "none"
  };
  const editDivStyle = {
    display : currentTab == Tab.EDIT ? "block" : "none"
  };
  const annotateDivStyle = {
    display : currentTab == Tab.ANNOTATE ? "block" : "none"
  };
  const settingsDivStyle = {
    display : currentTab == Tab.SETTINGS ? "block" : "none"
  };
  const [outputFileName, setOutputFileName] = useState<string>("");
  const [syncOutputFileNameToInputFileNameFlag, setSyncOutputFileNameToInputFileNameFlag] = useState<boolean>(true);
  return (
    <div style={boundingDivStyle}>
      <div style={toolsDivStyle}>
        {buttons}
        <div style={importExportDivStyle}>
          <label>
            Upload an input file:&nbsp;
            <input type="file" onChange={event => {
              if (syncOutputFileNameToInputFileNameFlag) {
                let files = event.target.files;
                if (files && files.length > 0) {
                  let newValue = (files[0] as File).name;
                  setOutputFileName(newValue.substring(0, newValue.lastIndexOf(".")));
                }
              }
            }}></input>
          </label>
          <br />
          <label>
            Create a downloadable output file:&nbsp;
            <input type="text" value={outputFileName} onChange={event => setOutputFileName(event.target.value)}></input>
          </label>
          <select>
          </select>
        </div>
        <div style={editDivStyle}>

        </div>
        <div style={annotateDivStyle}>

        </div>
        <div style={settingsDivStyle}>
          <label>
            Show tab reminder: 
            <input type="checkbox" onChange={() => setShowTabReminderFlag(!showTabReminderFlag)} checked={showTabReminderFlag}></input>
          </label>
          <br />
          <label>
            Sync output file name to input file name:
            <input type="checkbox" onChange={() => setSyncOutputFileNameToInputFileNameFlag(!syncOutputFileNameToInputFileNameFlag)} checked={syncOutputFileNameToInputFileNameFlag}></input>
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;