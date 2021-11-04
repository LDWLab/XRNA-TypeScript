# XRNA-GT-TypeScript
This project is derived from the Java desktop app XRNA, the source code of which can be found on our group's Github page.
    https://github.com/LDWLab/XRNA-GT

# Compilation
Use "tsc --lib 'es2021,dom' <path to script directory>*.ts" to re-compile
Linux Example: tsc --lib 'es2021,dom' /mnt/c/Users/User/Desktop/XRNA/secondaryStructureViewer/static/scripts/*.ts

# Development Tips
Familiarity with regex will be key to understanding the operation of this program.
See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp

# Warnings
Note that this program is not currently built to support base pairing between RNA strands.

# Misc.
This project exclusively uses a 3-byte RGB color format.