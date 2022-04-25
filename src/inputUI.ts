interface FileReader {
  (inputFileContent : string) : void;
}

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

export type { FileReader };
export default inputFileReaders;