import { DEFAULT_STROKE_WIDTH } from "../App";
import { getBasePairType, Nucleotide } from "../components/Nucleotide";
import { RnaComplex } from "../components/RnaComplex";
import { findNucleotidePropsByIndex, insert, RnaMolecule } from "../components/RnaMolecule";
import Color, { BLACK, ColorFormat, fromCssString, fromHexadecimal, toCSS } from "../data_structures/Color";
import Font, { PartialFont } from "../data_structures/Font";
import Vector2D from "../data_structures/Vector2D";
import xrnaHeader from "./xrnaHeader";

export type FileReaderOutput = {
  rnaComplexProps : Array<RnaComplex.Props>,
  complexDocumentName : string
};

export interface InputFileReader {
  (inputFileContent : string) : FileReaderOutput
}

export interface OutputFileWriter {
  (rnaComplexes : Array<RnaComplex.Component>) : string
}

type BasePairsAcrossMolecules = {
  nucleotideIndex : number,
  rnaMoleculeIndex : number,
  basePairNucleotideIndex : number,
  basePairRnaMoleculeName : string
  length : number,
};

const xrnaInputFileReader : InputFileReader = (inputFileContent : string) => {
  type ParseDomElementCache = {
    rnaComplexProps : RnaComplex.Props | null,
    rnaMoleculeProps : RnaMolecule.Props | null,
    basePairsAcrossMolecules : Array<BasePairsAcrossMolecules> | null,
    indentation : number
  };

  type PreviousDomElementInformation = {
    tagName : string,
    referencedNucleotideIndex? : number
  };

  function parseDomElement(domElement : Element, output : FileReaderOutput, previousDomElementInformation : PreviousDomElementInformation, cache : ParseDomElementCache = {rnaComplexProps : null, rnaMoleculeProps : null, basePairsAcrossMolecules : null, indentation : 0}) : void {
    let domElementInformation : PreviousDomElementInformation = {
      tagName : domElement.tagName
    };
    switch (domElement.tagName) {
      case "ComplexDocument": {
        output.complexDocumentName = domElement.getAttribute("Name") as string;
        break;
      }
      case "Complex": {
        cache.rnaComplexProps = {
          name : domElement.getAttribute("Name") as string,
          rnaMoleculeProps : []
        };
        output.rnaComplexProps.push(cache.rnaComplexProps);
        cache.basePairsAcrossMolecules = new Array<BasePairsAcrossMolecules>();
        break;
      }
      case "RNAMolecule": {
        cache.rnaMoleculeProps = {
          name : domElement.getAttribute("Name") as string,
          rnaComplexIndex : output.rnaComplexProps.length - 1,
          firstNucleotideIndex : 0,
          nucleotideProps : [],
        };
        (cache.rnaComplexProps as RnaComplex.Props).rnaMoleculeProps.push(cache.rnaMoleculeProps as RnaMolecule.Props);
        break;
      }
      case "NucListData": {
        let rnaMoleculeProps = cache.rnaMoleculeProps as RnaMolecule.Props;
        let firstNucleotideIndexAttribute = domElement.getAttribute("StartNucID");
        if (firstNucleotideIndexAttribute != null) {
          let firstNucleotideIndex = Number.parseInt(firstNucleotideIndexAttribute);
          if (Number.isNaN(firstNucleotideIndex)) {
            throw new Error(`This <NucListData>.StartNucID is a non-integer: ${firstNucleotideIndexAttribute}`);
          }
          rnaMoleculeProps.firstNucleotideIndex = firstNucleotideIndex;
        }
        let indexToDataTypeMap : Record<number, string> = {};
        (domElement.getAttribute("DataType") as string).split(".").forEach((dataType : string, index : number) => indexToDataTypeMap[index] = dataType);
        let runningNucleotideIndex = 0;
        let nucleotideIndexToBasePairNucleotideIndexMap : Record<number, number> = {};
        let rnaMoleculeIndex = (cache.rnaComplexProps as RnaComplex.Props).rnaMoleculeProps.length - 1;
        for (let textContentLine of (domElement.textContent as string).split("\n")) {
          if (/^\s*$/.test(textContentLine)) {
            continue;
          }
          // This is guaranteed to be overwritten by the appropriate symbol.
          // See the <xrnaHeader> for details.
          let symbol : Nucleotide.Symbol = "A";
          let nucleotideIndex : number = NaN;
          let x : number = NaN;
          let y : number = NaN;
          let basePairNucleotideIndex : number = NaN;
          textContentLine.split(/\s+/).forEach((data : string, index : number) => {
            switch (indexToDataTypeMap[index]) {
              case "NucChar":
                if (data !== "A" && data !== "C" && data !== "G" && data !== "U") {
                  throw new Error(`This input NucChar is not a <NucleotideSymbol>: ${data}`);
                }
                symbol = data;
                break;
              case "NucID":
                nucleotideIndex = Number.parseInt(data);
                if (Number.isNaN(nucleotideIndex)) {
                  throw new Error(`This input <NucListData>.NucID is a non-integer: ${data}`);
                }
                runningNucleotideIndex = nucleotideIndex - rnaMoleculeProps.firstNucleotideIndex;
                break;
              case "XPos":
                x = Number.parseFloat(data);
                if (Number.isNaN(x)) {
                  throw new Error(`This input <NucListData>.XPos is not a number: ${data}`);
                }
                break;
              case "YPos":
                y = Number.parseFloat(data);
                if (Number.isNaN(y)) {
                  throw new Error(`This input <NucListData>.YPos is not a number: ${data}`);
                }
                break;
              case "FormatType":
                // The original XRNA source code does not use <FormatType>.
                break;
              case "BPID":
                basePairNucleotideIndex = Number.parseInt(data);
                if (Number.isNaN(basePairNucleotideIndex)) {
                  throw new Error(`This input <NucListData>.BPID is a non-integer: ${data}`);
                }
                nucleotideIndexToBasePairNucleotideIndexMap[nucleotideIndex] = basePairNucleotideIndex - rnaMoleculeProps.firstNucleotideIndex;
                break;
            }
          });
          if (Number.isNaN(nucleotideIndex)) {
            nucleotideIndex = runningNucleotideIndex;
          }
          runningNucleotideIndex++;
          let props = {
            rnaComplexIndex : rnaMoleculeProps.rnaComplexIndex,
            rnaMoleculeIndex,
            nucleotideIndex,
            symbol, 
            position : { x, y }
          };
          if (rnaMoleculeProps.nucleotideProps.some((nucleotideProps : Nucleotide.Props) => nucleotideProps.nucleotideIndex === nucleotideIndex)) {
            throw new Error(`This input <NucListData>.NucID is a duplicate: ${nucleotideIndex}`);
          }
          insert(rnaMoleculeProps, props);
        }
        for (const [nucleotideIndexAsString, basePairNucleotideIndex] of Object.entries(nucleotideIndexToBasePairNucleotideIndexMap)) {
          let nucleotideIndex = Number.parseInt(nucleotideIndexAsString);
          let nucleotideProps : Nucleotide.Props = findNucleotidePropsByIndex(rnaMoleculeProps, nucleotideIndex).props;
          let basePairNucleotideProps : Nucleotide.Props;
          try {
            basePairNucleotideProps = findNucleotidePropsByIndex(rnaMoleculeProps, basePairNucleotideIndex).props;
          } catch (exception) {
            throw new Error(`This <NucListData>.BPID is outside the set of expected nucleotide indices ${basePairNucleotideIndex + rnaMoleculeProps.firstNucleotideIndex}`);
          }
          let basePairType = getBasePairType(nucleotideProps.symbol, basePairNucleotideProps.symbol);
          if (nucleotideIndex < basePairNucleotideIndex) {
            nucleotideProps = Object.assign(nucleotideProps, {
              basePair : {
                nucleotideIndex : basePairNucleotideIndex,
                rnaMoleculeIndex,
                type : basePairType,
                strokeWidth : DEFAULT_STROKE_WIDTH,
                stroke : BLACK
              }
            });
          } else {
            basePairNucleotideProps = Object.assign(basePairNucleotideProps, {
              basePair : {
                nucleotideIndex,
                rnaMoleculeIndex,
                type : basePairType,
                strokeWidth : DEFAULT_STROKE_WIDTH,
                stroke : BLACK
              }
            });
          }
        }
        break;
      }
      case "BasePairs": {
        let rnaMoleculeProps = cache.rnaMoleculeProps as RnaMolecule.Props;
        let nucleotideIndexAttribute = domElement.getAttribute("nucID") as string;
        let nucleotideIndex = Number.parseInt(nucleotideIndexAttribute);
        if (Number.isNaN(nucleotideIndex)) {
          throw new Error(`This <BasePairs>.nucID is a non-integer: ${nucleotideIndexAttribute}`);
        }
        nucleotideIndex -= rnaMoleculeProps.firstNucleotideIndex;
        let basePairNucleotideIndexAttribute = domElement.getAttribute("bpNucID") as string;
        let basePairNucleotideIndex = Number.parseInt(basePairNucleotideIndexAttribute);
        if (Number.isNaN(basePairNucleotideIndex)) {
          throw new Error(`This <BasePairs>.bpNucID is a non-integer: ${basePairNucleotideIndexAttribute}`);
        }
        basePairNucleotideIndex -= rnaMoleculeProps.firstNucleotideIndex;
        let lengthAttribute = domElement.getAttribute("length") as string;
        let length = Number.parseInt(lengthAttribute);
        if (Number.isNaN(length)) {
          throw new Error(`This <BasePairs>.length is a non-integer: ${lengthAttribute}`);
        }
        let rnaMoleculeIndex = (cache.rnaComplexProps as RnaComplex.Props).rnaMoleculeProps.length - 1;
        let basePairRnaMoleculeNameAttribute = domElement.getAttribute("bpName");
        if (basePairRnaMoleculeNameAttribute === null) {
          for (let i = 0; i < length; i++) {
            let interpolatedNucleotideIndex = nucleotideIndex + i;
            let interpolatedBasePairNucleotideIndex = basePairNucleotideIndex - i;
            let nucleotideProps : Nucleotide.Props = findNucleotidePropsByIndex(rnaMoleculeProps, interpolatedNucleotideIndex).props;
            let basePairNucleotideProps : Nucleotide.Props = findNucleotidePropsByIndex(rnaMoleculeProps, interpolatedBasePairNucleotideIndex).props;
            let type = getBasePairType(nucleotideProps.symbol, basePairNucleotideProps.symbol);
            nucleotideProps = Object.assign(nucleotideProps, {
              basePair : {
                nucleotideIndex : interpolatedBasePairNucleotideIndex,
                rnaMoleculeIndex,
                type,
                strokeWidth : DEFAULT_STROKE_WIDTH,
                stroke : BLACK
              }
            });
            basePairNucleotideProps = Object.assign(basePairNucleotideProps, {
              basePair : {
                nucleotideIndex : interpolatedNucleotideIndex,
                rnaMoleculeIndex,
                type,
                strokeWidth : DEFAULT_STROKE_WIDTH,
                stroke : BLACK
              }
            });
          }
        } else {
          (cache.basePairsAcrossMolecules as Array<BasePairsAcrossMolecules>).push({
            nucleotideIndex,
            rnaMoleculeIndex,
            basePairNucleotideIndex,
            basePairRnaMoleculeName : basePairRnaMoleculeNameAttribute as string,
            length
          });
        }
        break;
      }
      case "Nuc" : {
        let firstNucleotideIndex = (cache.rnaMoleculeProps as RnaMolecule.Props).firstNucleotideIndex;
        let referencedNucleotideIndexAttribute = domElement.getAttribute("RefID");
        if (referencedNucleotideIndexAttribute !== null) {
          let referencedNucleotideIndex = Number.parseInt(referencedNucleotideIndexAttribute);
          if (Number.isNaN(referencedNucleotideIndex)) {
            throw new Error(`This <Nuc>.RefID is a non-integer: ${referencedNucleotideIndexAttribute}`);
          }
          domElementInformation.referencedNucleotideIndex = referencedNucleotideIndex - firstNucleotideIndex;
        }
        let referencedNucleotideIndicesAttribute = domElement.getAttribute("RefIDs");
        if (referencedNucleotideIndicesAttribute !== null) {
          let referencedNucleotideIndicesAttributeWithoutWhitespace = referencedNucleotideIndicesAttribute.replace(/\s+/, "");
          if (!/^(-?\d+(--?\d+)?(,-?\d+(--?\d+)?)*)$/.test(referencedNucleotideIndicesAttributeWithoutWhitespace)) {
            throw new Error(`This <Nuc>.RefIDs attribute did not match the expected format: ${referencedNucleotideIndicesAttribute}`);
          }
          let referencedNucleotideIndices : number[] = [];
          referencedNucleotideIndicesAttributeWithoutWhitespace.split(",").forEach(referencedNucleotideIndicesRange => {
            let referencedNucleotideIndicesRangeMatch = referencedNucleotideIndicesRange.match(/^(-?\d+)(?:-(-?\d+))?$/) as RegExpMatchArray;
            let referencedNucleotideIndicesStart = Number.parseInt(referencedNucleotideIndicesRangeMatch[1] as string);
            if (Number.isNaN(referencedNucleotideIndicesStart)) {
              throw new Error(`This referenced-nucleotide index is non-numeric: ${referencedNucleotideIndicesRangeMatch[1]}`);
            }
            referencedNucleotideIndicesStart -= firstNucleotideIndex;
            if (referencedNucleotideIndicesRangeMatch[2] === undefined) {
              referencedNucleotideIndices.push(Number.parseInt(referencedNucleotideIndicesRangeMatch[1] as string) - firstNucleotideIndex);
            } else {
              let referencedNucleotideIndicesEnd = Number.parseInt(referencedNucleotideIndicesRangeMatch[2] as string);
              if (Number.isNaN(referencedNucleotideIndicesEnd)) {
                throw new Error(`This referenced-nucleotide index is non-numeric: ${referencedNucleotideIndicesEnd}`);
              }
              referencedNucleotideIndicesEnd -= firstNucleotideIndex;
              if (referencedNucleotideIndicesStart > referencedNucleotideIndicesEnd) {
                let swapHelper = referencedNucleotideIndicesStart;
                referencedNucleotideIndicesStart = referencedNucleotideIndicesEnd;
                referencedNucleotideIndicesEnd = swapHelper;
              }
              for (let i = referencedNucleotideIndicesStart; i < referencedNucleotideIndicesEnd; i++) {
                referencedNucleotideIndices.push(i);
              }
            }
          });
          let colorAttribute = domElement.getAttribute("Color");
          let stroke : Color | null = null;
          if (colorAttribute !== null) {
            stroke = fromHexadecimal(colorAttribute, ColorFormat.RGB);
          }
          let fontIdAttribute = domElement.getAttribute("FontID");
          let partialFont : PartialFont | null = null;
          if (fontIdAttribute !== null) {
            let fontId = Number.parseInt(fontIdAttribute);
            if (Number.isNaN(fontId)) {
              throw new Error(`This <Nuc>.FontID attribute is non-integer: ${fontIdAttribute}`);
            }
            partialFont = PartialFont.fromFontId(fontId);
          }
          let fontSizeAttribute = domElement.getAttribute("FontSize");
          let fontSize : number | null = null;
          if (fontSizeAttribute !== null) {
            fontSize = Number.parseFloat(fontSizeAttribute);
            if (Number.isNaN(fontSize)) {
              throw new Error(`This <Nuc>.FontSize attribute is non-numeric: ${fontSizeAttribute}`);
            }
          }
          let rnaMoleculeProps = cache.rnaMoleculeProps as RnaMolecule.Props;
          referencedNucleotideIndices.forEach((referencedNucleotideIndex : number) => {
            let nucleotideProps : Nucleotide.Props;
            try {
              nucleotideProps = findNucleotidePropsByIndex(rnaMoleculeProps, referencedNucleotideIndex).props;
            } catch (exception) {
              throw new Error(`This referenced-nucleotide index indexes a non-existent Nucleotide: ${referencedNucleotideIndex}`);
            }
            if (stroke !== null) {
              nucleotideProps = Object.assign(nucleotideProps, {
                stroke
              });
            }
            if (fontSize !== null) {
              nucleotideProps = Object.assign(nucleotideProps, {
                font : Object.assign(nucleotideProps.font ?? Font.DEFAULT_FONT, {
                  size : fontSize
                })
              });
            }
            if (partialFont !== null) {
              nucleotideProps = Object.assign(nucleotideProps, {
                font : Font.fromPartialFont(partialFont, (nucleotideProps.font ?? Font.DEFAULT_FONT).size)
              });
            }
          });
        }
        break;
      }
      case "LabelList": {
        switch (previousDomElementInformation.tagName) {
          case "Nuc": {
            if (previousDomElementInformation.referencedNucleotideIndex === null) {
              throw new Error(`This <Nuc> had no attribute <RefID>`);
            }
            let nucleotideProps : Nucleotide.Props = findNucleotidePropsByIndex(cache.rnaMoleculeProps as RnaMolecule.Props, previousDomElementInformation.referencedNucleotideIndex as number).props;
            (domElement.textContent as string).split("\n").forEach((textContentLine : string) => {
              let textContentLineData = textContentLine.trim().split(/\s+/);
              switch (textContentLineData[0]) {
                case "l": {
                  if (textContentLineData.length < 7) {
                    throw new Error("This <LabelList> label-line line has too few entries.");
                  }
                  let x0AsString = textContentLineData[1] as string;
                  let y0AsString = textContentLineData[2] as string;
                  let x1AsString = textContentLineData[3] as string;
                  let y1AsString = textContentLineData[4] as string;
                  let strokeWidthAsString = textContentLineData[5] as string;
                  let x0 = Number.parseFloat(x0AsString);
                  let y0 = Number.parseFloat(y0AsString);
                  let x1 = Number.parseFloat(x1AsString);
                  let y1 = Number.parseFloat(y1AsString);
                  let strokeWidth = Number.parseFloat(strokeWidthAsString);
                  if (Number.isNaN(x0)) {
                    throw new Error(`This <LabelList> label-line line has a non-numeric x0 value: ${x0AsString}`);
                  }
                  if (Number.isNaN(y0)) {
                    throw new Error(`This <LabelList> label-line line has a non-numeric y0 value: ${y0AsString}`);
                  }
                  if (Number.isNaN(x1)) {
                    throw new Error(`This <LabelList> label-line line has a non-numeric x1 value: ${x1AsString}`);
                  }
                  if (Number.isNaN(y1)) {
                    throw new Error(`This <LabelList> label-line line has a non-numeric y1 value: ${y1AsString}`);
                  }
                  if (Number.isNaN(strokeWidth)) {
                    throw new Error(`This <LabelList> label-line line has a non-numeric strokeWidth value: ${strokeWidthAsString}`)
                  }
                  nucleotideProps = Object.assign(nucleotideProps, {
                    labelLineProps : {
                      endpoint0 : new Vector2D(x0, y0),
                      endpoint1 : new Vector2D(x1, y1),
                      strokeWidth,
                      stroke : fromHexadecimal(textContentLineData[6] as string, ColorFormat.RGB)
                    }
                  });
                  break;
                }
                case "s": {
                  if (textContentLineData.length < 8) {
                    throw new Error(`This <LabelList> label-content line has too few entries.`);
                  }
                  let xAsString = textContentLineData[1] as string;
                  let yAsString = textContentLineData[2] as string;
                  let fontSizeAsString = textContentLineData[4] as string;
                  let fontIdAsString = textContentLineData[5] as string;
                  let colorAsString = textContentLineData[6] as string;
                  let contentAsWrappedString = textContentLineData[7] as string;
                  let x = Number.parseFloat(xAsString);
                  let y = Number.parseFloat(yAsString);
                  let fontSize = Number.parseFloat(fontSizeAsString);
                  let fontId = Number.parseInt(fontIdAsString);
                  let stroke = fromHexadecimal(colorAsString, ColorFormat.RGB);
                  let contentMatch = contentAsWrappedString.match(/^"(.*)"$/);
                  if (Number.isNaN(x)) {
                    throw new Error(`This <LabelList> label-content line has a non-numeric x value: ${xAsString}`);
                  }
                  if (Number.isNaN(y)) {
                    throw new Error(`This <LabelList> label-content line has a non-numeric y value: ${yAsString}`);
                  }
                  if (Number.isNaN(fontSize)) {
                    throw new Error(`This <LabelList> label-content line has a non-numeric fontSize value: ${fontSizeAsString}`);
                  }
                  if (Number.isNaN(fontId)) {
                    throw new Error(`This <LabelList> label-content line has a non-numeric fontId value: ${fontIdAsString}`);
                  }
                  if (contentMatch === null) {
                    throw new Error(`This <LabelList> label-content line has a content value with an unrecognized format: ${contentAsWrappedString}`);
                  }
                  nucleotideProps = Object.assign(nucleotideProps, {
                    labelContentProps : {
                      position : new Vector2D(x, y),
                      content : contentMatch[1] as string,
                      stroke,
                      font : Font.fromFontId(fontId, fontSize),
                      graphicalAdjustment : new Vector2D(0, 0)
                    }
                  });
                  break;
                }
              }
            });
            break;
          }
        }
      }
    }
    Array.from(domElement.children).forEach(childElement => {
      cache.indentation++;
      parseDomElement(childElement, output, domElementInformation, cache);
      cache.indentation--;
    });
    switch (domElement.tagName) {
      case "Complex": {
        let rnaComplexProps = cache.rnaComplexProps as RnaComplex.Props;
        (cache.basePairsAcrossMolecules as BasePairsAcrossMolecules[]).forEach((basePairsAcrossMolecules : BasePairsAcrossMolecules) => {
          let basePairedRnaMoleculeIndex = rnaComplexProps.rnaMoleculeProps.findIndex((rnaMoleculeProps : RnaMolecule.Props) => rnaMoleculeProps.name === basePairsAcrossMolecules.basePairRnaMoleculeName);
          for (let i = 0; i < basePairsAcrossMolecules.length; i++) {
            let interpolatedNucleotideIndex = basePairsAcrossMolecules.nucleotideIndex + i;
            let interpolatedBasePairNucleotideIndex = basePairsAcrossMolecules.basePairNucleotideIndex - i;
            let foundNucleotideProps = findNucleotidePropsByIndex(rnaComplexProps.rnaMoleculeProps[basePairsAcrossMolecules.rnaMoleculeIndex] as RnaMolecule.Props, interpolatedNucleotideIndex);
            let nucleotideProps : Nucleotide.Props = foundNucleotideProps.props;
            let basePairedNucleotideProps : Nucleotide.Props = findNucleotidePropsByIndex(rnaComplexProps.rnaMoleculeProps[basePairedRnaMoleculeIndex] as RnaMolecule.Props, interpolatedBasePairNucleotideIndex).props;
            let type = getBasePairType(nucleotideProps.symbol, basePairedNucleotideProps.symbol);
            nucleotideProps.basePair = {
              rnaMoleculeIndex : basePairedRnaMoleculeIndex,
              nucleotideIndex : interpolatedBasePairNucleotideIndex,
              type,
              strokeWidth : DEFAULT_STROKE_WIDTH,
              stroke : BLACK
            };
            basePairedNucleotideProps.basePair = {
              rnaMoleculeIndex : basePairsAcrossMolecules.rnaMoleculeIndex,
              nucleotideIndex : interpolatedNucleotideIndex,
              type,
              strokeWidth : DEFAULT_STROKE_WIDTH,
              stroke : BLACK
            };
          }
        });
        break;
      }
    }
  }
  if (!inputFileContent.startsWith("<!DOCTYPE")) {
    inputFileContent += xrnaHeader + "\n" + inputFileContent;
  }
  let output : FileReaderOutput = {
    rnaComplexProps : new Array<RnaComplex.Props>(),
    complexDocumentName : ""
  }
  Array.from(new DOMParser().parseFromString(inputFileContent, "text/xml").children).forEach(childElement => {
    parseDomElement(childElement, output, { tagName : "" });
  });
  return output;
};

const jsonInputFileReader : InputFileReader = (inputFileContent : string) => {
  let rnaComplexProps : Array<RnaComplex.Props> = [];
  let complexDocumentName = "Unknown";
  let parsedJson = JSON.parse(inputFileContent);
  if (!("classes" in parsedJson) || !("rnaComplexes" in parsedJson)) {
    throw "Input Json should have \"classes\" and \"rnaComplexes\" variables.";
  }
  let cssClasses = parsedJson.classes as Array<any>;
  rnaComplexProps = (parsedJson.rnaComplexes as Array<any>).map((inputRnaComplex : any, inputRnaComplexIndex : number) => {
    if (!("name" in inputRnaComplex) || !("rnaMolecules" in inputRnaComplex)) {
      throw "Input rnaComplex elements of input Json should have \"name\" and \"rnaMolecules\" variables."
    }
    let name = inputRnaComplex.name;
    let rnaMoleculeProps = (inputRnaComplex.rnaMolecules as Array<any>).map((inputRnaMolecule : any, rnaMoleculeIndex : number) => {
      if (!("name" in inputRnaMolecule) || !("basePairs" in inputRnaMolecule) || !("labels" in inputRnaMolecule) || !("sequence" in inputRnaMolecule)) {
        throw "Input rnaMolecule elements of input Json should have \"name\", \"sequence\", \"basePairs\", \"labels\" variables."
      }
      let name = inputRnaMolecule.name;
      let rnaMoleculeProps : RnaMolecule.Props = {
        name,
        rnaComplexIndex : inputRnaComplexIndex,
        firstNucleotideIndex : Number.MAX_VALUE,
        nucleotideProps : []
      };
      (inputRnaMolecule.sequence as Array<any>).forEach(inputSequenceEntry => {
        if (!("classes" in inputSequenceEntry) || !("residueIndex" in inputSequenceEntry) || !("x" in inputSequenceEntry) || !("y" in inputSequenceEntry) || !("residueName" in inputSequenceEntry)) {
          throw "Input sequence elements of input Json should have \"classes\", \"residueIndex\", \"residueName\", \"x\" and \"y\" variables.";
        }
        let nucleotideIndex = Number.parseInt(inputSequenceEntry.residueIndex);
        if (nucleotideIndex < rnaMoleculeProps.firstNucleotideIndex) {
          rnaMoleculeProps.firstNucleotideIndex = nucleotideIndex;
        }
      });
      (inputRnaMolecule.sequence as Array<any>).forEach(inputSequenceEntry => {
        let nucleotideIndex = Number.parseInt(inputSequenceEntry.residueIndex) - rnaMoleculeProps.firstNucleotideIndex;
        let nucleotideProps : Nucleotide.Props = {
          rnaComplexIndex : inputRnaComplexIndex,
          rnaMoleculeIndex : rnaMoleculeIndex,
          nucleotideIndex,
          symbol : inputSequenceEntry.residueName as Nucleotide.Symbol,
          position : new Vector2D(Number.parseFloat(inputSequenceEntry.x), Number.parseFloat(inputSequenceEntry.y))
        };
        insert(rnaMoleculeProps, nucleotideProps);
        (inputSequenceEntry.classes as Array<string>).forEach(className => {
          let cssClass = cssClasses.find(cssClass => cssClass.name === className);
          if (cssClass !== undefined) {
            Object.entries(cssClass).forEach(cssClassData => {
              switch (cssClassData[0]) {
                case "font-family" : {
                  (nucleotideProps.font ?? Font.DEFAULT_FONT).family = cssClassData[1] as string;
                  break;
                }
                case "font-size" : {
                  (nucleotideProps.font ?? Font.DEFAULT_FONT).size = cssClassData[1] as string;
                  break;
                }
                case "font-weight" : {
                  (nucleotideProps.font ?? Font.DEFAULT_FONT).weight = cssClassData[1] as string;
                  break;
                }
                case "font-style" : {
                  (nucleotideProps.font ?? Font.DEFAULT_FONT).style = cssClassData[1] as string;
                  break;
                }
              }
            });
          } else if (className.startsWith("text-")) {
            nucleotideProps = Object.assign(nucleotideProps, {
              stroke : fromCssString(className.substring("text-".length))
            });
          }
        });
      });
      (inputRnaMolecule.labels as Array<any>).forEach(label => {
        if (!("residueIndex" in label)) {
          throw "Input label elements of input Json should have a \"residueIndex\" variable."
        }
        let nucleotideProps : Nucleotide.Props = findNucleotidePropsByIndex(rnaMoleculeProps, Number.parseInt(label.residueIndex) - rnaMoleculeProps.firstNucleotideIndex).props;
        if ("labelContent" in label) {
          let font = Font.DEFAULT_FONT;
          let stroke = BLACK;
          (label.labelContent.classes as Array<any>).forEach(labelClassName => {
            let cssClass = cssClasses.find(cssClass => cssClass.name === labelClassName);
            if (cssClass !== undefined) {
              Object.entries(cssClass).forEach(cssClassEntry => {
                switch (cssClassEntry[0]) {
                  case "font-family" : {
                    font.family = cssClassEntry[1] as string;
                    break;
                  }
                  case "font-size" : {
                    font.size = cssClassEntry[1] as string;
                    break;
                  }
                  case "font-weight" : {
                    font.weight = cssClassEntry[1] as string;
                    break;
                  }
                  case "font-style" : {
                    font.style = cssClassEntry[1] as string;
                    break;
                  }
                }
              });
            } else if (labelClassName.startsWith("text-")) {
              stroke = fromCssString(labelClassName.substring("text-".length));
            }
          });
          nucleotideProps = Object.assign(nucleotideProps, {
            labelContentProps : {
              position : Vector2D.subtract(new Vector2D(Number.parseFloat(label.labelContent.x), Number.parseFloat(label.labelContent.y)), nucleotideProps.position),
              content : label.labelContent.label,
              font,
              stroke,
              graphicalAdjustment : new Vector2D(0, 0)
            }
          });
        }
        if ("labelLine" in label) {
          let labelLine = label.labelLine;
          let stroke = BLACK;
          let strokeWidth = DEFAULT_STROKE_WIDTH;
          if (!("x1" in labelLine) || !("y1" in labelLine) || !("x2" in labelLine) || !("y2" in labelLine) || !("classes" in labelLine)) {
            throw "Input label-line elements should have \"x1\", \"y1\", \"x2\", \"y2\" and \"classes\" variables."
          }
          (labelLine.classes as Array<any>).forEach(className => {
            let cssClass = cssClasses.find(cssClass => cssClass.name === className);
            if (cssClass !== undefined) {
              Object.entries(cssClass).forEach(cssClassData => {
                switch (cssClassData[0]) {
                  case "stroke" : {
                    stroke = fromCssString(cssClassData[1] as string);
                    break;
                  }
                  case "stroke-width" : {
                    strokeWidth = Number.parseFloat(cssClassData[1] as string);
                    break;
                  }
                }
              });
            }
          });
          nucleotideProps = Object.assign(nucleotideProps, {
            labelLineProps : {
              endpoint0 : Vector2D.subtract(new Vector2D(Number.parseFloat(labelLine.x1), Number.parseFloat(labelLine.y1)), nucleotideProps.position),
              endpoint1 : Vector2D.subtract(new Vector2D(Number.parseFloat(labelLine.x2), Number.parseFloat(labelLine.y2)), nucleotideProps.position),
              stroke,
              strokeWidth
            }
          });
        }
      });
      (inputRnaMolecule.basePairs as Array<any>).forEach(basePair => {
        if (!("basePairType" in basePair) || !("residueIndex1" in basePair) || !("residueIndex2" in basePair) || !("classes" in basePair)) {
          throw "Input basePairs elements of input Json should have \"basePairType\", \"residueIndex1\", \"residueIndex2\" and \"classes\" variables."
        }
        let basePairType : Nucleotide.BasePairType;
        switch (basePair.basePairType) {
          case "canonical" : {
            basePairType = Nucleotide.BasePairType.CANONICAL;
            break;
          }
          case "wobble" : {
            basePairType = Nucleotide.BasePairType.WOBBLE;
            break;
          }
          case "mismatch" : {
            basePairType = Nucleotide.BasePairType.MISMATCH;
            break;
          }
          default : {
            throw "Unrecognized base-pair type.";
          }
        }
        let residueIndex1 = Number.parseInt(basePair.residueIndex1) - rnaMoleculeProps.firstNucleotideIndex;
        let nucleotideProps1 : Nucleotide.Props = findNucleotidePropsByIndex(rnaMoleculeProps, residueIndex1).props;
        let residueIndex2 = Number.parseInt(basePair.residueIndex2) - rnaMoleculeProps.firstNucleotideIndex;
        let nucleotideProps2 : Nucleotide.Props = findNucleotidePropsByIndex(rnaMoleculeProps, residueIndex2).props;
        let strokeWidth = DEFAULT_STROKE_WIDTH;
        let stroke = BLACK;
        (basePair.classes as Array<string>).forEach(className => {
          let cssClass = cssClasses.find(cssClass => cssClass.name === className);
          if (cssClass !== undefined) {
            Object.entries(cssClass).forEach(cssClassData => {
              switch (cssClassData[0]) {
                case "stroke-width" : {
                  strokeWidth = Number.parseFloat(cssClassData[1] as string);
                  break;
                }
                case "stroke" : {
                  stroke = fromCssString(cssClassData[1] as string);
                  break;
                }
              }
            });
          }
        });
        nucleotideProps1 = Object.assign(nucleotideProps1, {
          basePair : {
            rnaMoleculeIndex,
            nucleotideIndex : residueIndex2,
            type : basePairType,
            strokeWidth,
            stroke
          }
        });
        nucleotideProps2 = Object.assign(nucleotideProps2, {
          basePair : {
            rnaMoleculeIndex,
            nucleotideIndex : residueIndex1,
            type : basePairType,
            strokeWidth,
            stroke
          }
        });
      });
      return rnaMoleculeProps;
    });
    return {
      name,
      rnaMoleculeProps
    };
  }); 
  return {
    rnaComplexProps,
    complexDocumentName
  };
};

export const inputFileReaders : Record<string, InputFileReader> = {
  "xrna" : xrnaInputFileReader,
  "xml" : xrnaInputFileReader,
  "ps" : xrnaInputFileReader,
  "ss" : xrnaInputFileReader,
  "json" : jsonInputFileReader
};

type BasePairTypeForJson = "canonical" | "wobble" | "mismatch";

type BasePairForJson = {
  basePairType : BasePairTypeForJson,
  classes : Array<string>,
  residueIndex1 : number,
  residueIndex2 : number
};

type LabelForJson = {
  labelContent? : {
    classes : Array<string>,
    label : string,
    x : number,
    y : number
  },
  labelLine? : {
    classes : Array<string>,
    x1 : number,
    y1 : number,
    x2 : number,
    y2 : number
  },
  residueIndex : number
};

type CssClassForJson = {
  ["font-family"]? : string,
  ["font-size"]? : string,
  ["font-weight"]? : string,
  ["font-style"]? : string,
  ["stroke-width"]? : string,
  stroke? : string,
  name : string
};
const jsonFileWriter : OutputFileWriter = (rnaComplexes : Array<RnaComplex.Component>) => {
  let fontCssClasses : Array<CssClassForJson> = [];
  let strokeCssClasses : Array<CssClassForJson> = [];
  let labelContentCssClasses : Record<number, Array<string>> = {};
  let labelLineCssClasses : Record<number, Array<string>> = {};
  let nucleotideCssClasses : Record<number, Array<string>> = {};
  let basePairsCssClasses : Record<number, Array<string>> = {};
  rnaComplexes.forEach(rnaComplex => {
    rnaComplex.state.rnaMoleculeReferences.forEach((rnaMoleculeReference : React.RefObject<RnaMolecule.Component>) => {
      let rnaMolecule = rnaMoleculeReference.current as RnaMolecule.Component;
      rnaMolecule.state.nucleotideReferences.forEach((nucleotideReference : React.RefObject<Nucleotide.Component>) => {
        let nucleotide = nucleotideReference.current as Nucleotide.Component;
        let nucleotideIndex = nucleotide.props.nucleotideIndex;
        let fontCssClassName : string = "";
        const handleFontCss = (font : Font) => {
          let fontCssClassIndex = fontCssClasses.findIndex(cssClassForJson => cssClassForJson["font-family"] === font.family && cssClassForJson["font-size"] === `${font.size}` && cssClassForJson["font-weight"] === font.weight && cssClassForJson["font-style"] === font.style);
          if (fontCssClassIndex === -1) {
            fontCssClassName = `font#${fontCssClasses.length}`;
            fontCssClasses.push({
              name : fontCssClassName,
              ["font-family"] : font.family,
              ["font-size"] : `${font.size}`,
              ["font-weight"] : font.weight,
              ["font-style"] : font.style
            });
          } else {
            fontCssClassName = `font#${fontCssClassIndex}`;
          }
        };
        let strokeCssClassName : string = "";
        const handleStrokeCss = (stroke : {strokeWidth : number | string, stroke : Color}) => {
          let strokeAsText = toCSS(stroke.stroke);
          let strokeCssClassIndex = strokeCssClasses.findIndex(cssClassForJson => cssClassForJson["stroke-width"] === `${stroke.strokeWidth}` && cssClassForJson.stroke === strokeAsText);
          if (strokeCssClassIndex === -1) {
            strokeCssClassName = `stroke#${strokeCssClasses.length}`;
            strokeCssClasses.push({
              name : strokeCssClassName,
              ["stroke-width"] : `${stroke.strokeWidth}`,
              stroke : strokeAsText
            });
          } else {
            strokeCssClassName = `stroke#${strokeCssClassIndex}`;
          }
        };
        handleFontCss(nucleotide.state.font);
        nucleotideCssClasses[nucleotideIndex] = [
          "text-" + toCSS(nucleotide.state.stroke),
          fontCssClassName
        ];
        let labelContent = nucleotide.labelContentReference.current;
        if (labelContent !== null) {
          handleFontCss(labelContent.state.font);
          labelContentCssClasses[nucleotideIndex] = [
            "text-" + toCSS(labelContent.state.stroke),
            fontCssClassName
          ];
        }
        let labelLine = nucleotide.labelLineReference.current;
        if (labelLine !== null) {
          handleStrokeCss(labelLine.state);
          labelLineCssClasses[nucleotideIndex] = [
            strokeCssClassName
          ];
        }
        if (nucleotide.state.basePair !== undefined) {
          handleStrokeCss(nucleotide.state.basePair);
          basePairsCssClasses[nucleotideIndex] = [
            strokeCssClassName
          ];
        }
      });
    });
  });
  return JSON.stringify({
    classes : fontCssClasses.concat(strokeCssClasses),
    rnaComplexes : rnaComplexes.map((rnaComplex : RnaComplex.Component) => {
      return {
        name : rnaComplex.state.name,
        rnaMolecules : rnaComplex.state.rnaMoleculeReferences.map((rnaMoleculeReference : React.RefObject<RnaMolecule.Component>) => {
          let rnaMolecule = rnaMoleculeReference.current as RnaMolecule.Component;
          let basePairs = new Array<BasePairForJson>();
          let labels = new Array<LabelForJson>();
          rnaMolecule.state.nucleotideReferences.forEach((nucleotideReference : React.RefObject<Nucleotide.Component>) => {
            let nucleotide = nucleotideReference.current as Nucleotide.Component;
            let nucleotideIndex = nucleotide.props.nucleotideIndex;
            let labelContent = nucleotide.labelContentReference.current;
            let labelLine = nucleotide.labelLineReference.current;
            if (labelContent !== null || labelLine !== null) {
              let label : LabelForJson = {
                residueIndex : nucleotideIndex + rnaMolecule.state.firstNucleotideIndex
              };
              if (labelContent !== null) {
                label.labelContent = {
                  classes : labelContentCssClasses[nucleotideIndex],
                  label : labelContent.state.content,
                  x : labelContent.state.position.x + nucleotide.state.position.x,
                  y : labelContent.state.position.y + nucleotide.state.position.y
                };
              }
              if (labelLine !== null) {
                label.labelLine = {
                  classes : labelLineCssClasses[nucleotideIndex],
                  x1 : labelLine.state.endpoint0.x + nucleotide.state.position.x,
                  y1 : labelLine.state.endpoint0.y + nucleotide.state.position.y,
                  x2 : labelLine.state.endpoint1.x + nucleotide.state.position.x,
                  y2 : labelLine.state.endpoint1.y + nucleotide.state.position.y
                };
              }
              labels.push(label);
            }
            if (nucleotide.state.basePair !== undefined) {
              let basePairType : BasePairTypeForJson;
              switch (nucleotide.state.basePair.type) {
                case Nucleotide.BasePairType.CANONICAL : {
                  basePairType = "canonical";
                  break;
                }
                case Nucleotide.BasePairType.MISMATCH : {
                  basePairType = "mismatch";
                  break;
                }
                case Nucleotide.BasePairType.WOBBLE : {
                  basePairType = "wobble";
                  break;
                }
                default : {
                    throw "Unrecognized basepair type.";
                }
              }
              let basePair : BasePairForJson = {
                basePairType,
                classes : basePairsCssClasses[nucleotideIndex],
                residueIndex1 : rnaMolecule.state.firstNucleotideIndex + nucleotideIndex,
                residueIndex2 : rnaMolecule.state.firstNucleotideIndex + nucleotide.state.basePair.nucleotideIndex
              };
              basePairs.push(basePair);
            }
          });
          return {
            name : rnaMolecule.state.name,
            basePairs,
            labels,
            sequence : rnaMolecule.state.nucleotideReferences.map((nucleotideReference : React.RefObject<Nucleotide.Component>) => {
              let nucleotide = nucleotideReference.current as Nucleotide.Component;
              let nucleotideIndex = nucleotide.props.nucleotideIndex;
              return {
                classes : nucleotideCssClasses[nucleotideIndex],
                residueIndex : nucleotideIndex + rnaMolecule.state.firstNucleotideIndex,
                residueName : nucleotide.props.symbol,
                x : nucleotide.state.position.x,
                y : nucleotide.state.position.y
              };
            })
          };
        })
      };
    })
  });
};

export const outputFileWriters : Record<string, OutputFileWriter> = {
  "json" : jsonFileWriter
};
