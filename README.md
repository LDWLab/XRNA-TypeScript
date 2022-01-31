# How to Compile XRNA:
1. Open a command prompt.
2. Navigate to the folder(s) containing TypeScript (.ts) source file(s).
3. Compile the desired source file(s): "tsc --lib "dom,ES2021" <file name>.ts".

# How to Run XRNA Locally:
1. Open a command prompt
2. Navigate to the directory containing index.html
3. Host the XRNA server: "python -m http.server 8000"
4. Open XRNA within an internet browser (at URL localhost:8000)

# How to Use XRNA:
1. Open an input file within the "File input/output" tab at the top left of the screen.
    * An example .xrna file (EC_LSU_3D_l.xrna) is included in the root directory of this project.
2, Click on the button labeled "Choose an input file"
    * The supported input file types are listed at the bottom right of the resulting file-selection window.
        a. These file types include .XRNA, .XML, .PS, .SS, .SVG, .JSON
3. If desired, make changes to the input data
    * Open the "Edit" tab to manually drag scene elements.
        a. Click on scene elements with the left mouse button and drag them about the screen.
        b. Click on scene elements with the right mouse button to inspect and edit scene-element data.
    * Open the "Format" tab to programmatically change the topology of scene elements.
        a. Click on scene elements with the right mouse button to inspect and re-format scene-element data.
4. Once all desired changes are complete, return to the "File input/output" tab at the top left of the screen.
    * Change the output-file name if desired.
    * Change the output-file extension to create an output file of a different type.
        a. All supported output-file extensions are listed in the drop-down menu to the right of the output-file-name input box.
    * Click the "Download" button to begin the download.
        a. Once complete, the output file should appear in your laptop's designated download folder.

# Disambiguation:
1. "RNA Complex" within XRNA refers to a collection of RNA Molecules which interact with (bond to) one another, and do not bond to outside RNA molecules.

# Contact(s):
1. This TypeScript version of XRNA was developed by Caeden D. Meade with support from faculty and coworkers at the Georgia Institute of Technology.
    * Email: caedenmeade@gmail.com
    * If issues with XRNA arise (bugs, etc.), please contact me, and provide as much of a detailed description of the issue as you can.
    * Requests (ideas) for further development are also appreciated.