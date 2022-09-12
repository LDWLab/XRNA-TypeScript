import { DEFAULT_STROKE_WIDTH } from "../App";
import Color from "../data_structures/Color";
import Font, { PartialFont } from "../data_structures/Font";
import { Nucleotide } from "../components/Nucleotide";
import { RnaComplex } from "../components/RnaComplex";
import { RnaMolecule } from "../components/RnaMolecule";
import Vector2D from "../data_structures/Vector2D";
import xrnaHeader from "./xrnaHeader";
import { RefObject } from "react";
import { LabelContent } from "../components/LabelContent";

type FileReaderOutput = {
  rnaComplexes : Array<RnaComplex.Component>,
  complexDocumentName : string
}

interface XrnaFileReader {
  (inputFileContent : string) : FileReaderOutput
}

type BasePairsAcrossMolecules = {
  nucleotideIndex : number,
  rnaMoleculeIndex : number,
  basePairNucleotideIndex : number,
  basePairRnaMoleculeName : string
  length : number,
};

const xrnaFileReader : XrnaFileReader = inputFileContent => {
  type ParseDomElementCache = {
    rnaComplex : RnaComplex.Component | null,
    rnaMolecule : RnaMolecule.Component | null,
    basePairsAcrossMolecules : Array<BasePairsAcrossMolecules> | null,
    indentation : number
  };
  type PreviousDomElementInformation = {
    tagName : string,
    referencedNucleotideIndex? : number
  };
  function parseDomElement(domElement : Element, output : FileReaderOutput, previousDomElementInformation : PreviousDomElementInformation, cache : ParseDomElementCache = {rnaComplex : null, rnaMolecule : null, basePairsAcrossMolecules : null, indentation : 0}) : void {
    let domElementInformation : PreviousDomElementInformation = {
      tagName : domElement.tagName
    };
    switch (domElement.tagName) {
      case "ComplexDocument": {
        output.complexDocumentName = domElement.getAttribute("Name") as string;
        break;
      }
      case "Complex": {
        cache.rnaComplex = new RnaComplex.Component({
          name : domElement.getAttribute("Name") as string,
          rnaMolecules : []
        });
        output.rnaComplexes.push(cache.rnaComplex);
        cache.basePairsAcrossMolecules = new Array<BasePairsAcrossMolecules>();
        break;
      }
      case "RNAMolecule": {
        cache.rnaMolecule = new RnaMolecule.Component({
          name : domElement.getAttribute("Name") as string,
          rnaComplexIndex : output.rnaComplexes.length - 1,
          firstNucleotideIndex : 0,
          nucleotidesIndexMap : [],

        });
        (cache.rnaComplex as RnaComplex.Component).props.rnaMolecules.push(cache.rnaMolecule);
        break;
      }
      case "NucListData": {
        let rnaMolecule = cache.rnaMolecule as RnaMolecule.Component;
        let firstNucleotideIndexAttribute = domElement.getAttribute("StartNucID");
        if (firstNucleotideIndexAttribute != null) {
          let firstNucleotideIndex = Number.parseInt(firstNucleotideIndexAttribute);
          if (Number.isNaN(firstNucleotideIndex)) {
            throw new Error(`This <NucListData>.StartNucID is a non-integer: ${firstNucleotideIndexAttribute}`);
          }
          rnaMolecule.state = Object.assign(rnaMolecule.state, {
            firstNucleotideIndex
          })
        }
        let indexToDataTypeMap : Record<number, string> = {};
        (domElement.getAttribute("DataType") as string).split(".").forEach((dataType : string, index : number) => indexToDataTypeMap[index] = dataType);
        let runningNucleotideIndex = 0;
        let nucleotideIndexToBasePairNucleotideIndexMap : Record<number, number> = {};
        let rnaMoleculeIndex = (cache.rnaComplex as RnaComplex.Component).props.rnaMolecules.length - 1;
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
                runningNucleotideIndex = nucleotideIndex - rnaMolecule.state.firstNucleotideIndex;
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
                nucleotideIndexToBasePairNucleotideIndexMap[nucleotideIndex] = basePairNucleotideIndex - rnaMolecule.state.firstNucleotideIndex;
                break;
            }
          });
          if (Number.isNaN(nucleotideIndex)) {
            nucleotideIndex = runningNucleotideIndex;
          }
          runningNucleotideIndex++;
          let props = {
            rnaComplexIndex : rnaMolecule.props.rnaComplexIndex,
            rnaMoleculeIndex,
            nucleotideIndex,
            symbol, 
            position : { x, y }
          };
          if (rnaMolecule.props.nucleotidesIndexMap.some((arrayEntry : RnaMolecule.ArrayEntry) => arrayEntry.nucleotideIndex === nucleotideIndex)) {
            throw new Error(`This input <NucListData>.NucID is a duplicate: ${nucleotideIndex}`);
          }
          rnaMolecule.insert(nucleotideIndex, props);
        }
        for (const [nucleotideIndexAsString, basePairNucleotideIndex] of Object.entries(nucleotideIndexToBasePairNucleotideIndexMap)) {
          let nucleotideIndex = Number.parseInt(nucleotideIndexAsString);
          let nucleotideProps : Nucleotide.Props = rnaMolecule.findNucleotideByIndex(nucleotideIndex).arrayEntry.nucleotideProps;
          let basePairNucleotideProps : Nucleotide.Props;
          try {
            basePairNucleotideProps = rnaMolecule.findNucleotideByIndex(basePairNucleotideIndex).arrayEntry.nucleotideProps;
          } catch (exception) {
            throw new Error(`This <NucListData>.BPID is outside the set of expected nucleotide indices ${basePairNucleotideIndex + rnaMolecule.state.firstNucleotideIndex}`);
          }
          let basePairType = Nucleotide.Component.getBasePairType(nucleotideProps.symbol, basePairNucleotideProps.symbol);
          if (nucleotideIndex < basePairNucleotideIndex) {
            nucleotideProps = Object.assign(nucleotideProps, {
              basePair : {
                nucleotideIndex : basePairNucleotideIndex,
                rnaMoleculeIndex,
                type : basePairType,
                strokeWidth : DEFAULT_STROKE_WIDTH,
                stroke : Color.BLACK
              }
            });
          } else {
            basePairNucleotideProps = Object.assign(basePairNucleotideProps, {
              basePair : {
                nucleotideIndex,
                rnaMoleculeIndex,
                type : basePairType,
                strokeWidth : DEFAULT_STROKE_WIDTH,
                stroke : Color.BLACK
              }
            });
          }
        }
        break;
      }
      case "BasePairs": {
        let rnaMolecule = cache.rnaMolecule as RnaMolecule.Component;
        let nucleotideIndexAttribute = domElement.getAttribute("nucID") as string;
        let nucleotideIndex = Number.parseInt(nucleotideIndexAttribute);
        if (Number.isNaN(nucleotideIndex)) {
          throw new Error(`This <BasePairs>.nucID is a non-integer: ${nucleotideIndexAttribute}`);
        }
        nucleotideIndex -= rnaMolecule.state.firstNucleotideIndex;
        let basePairNucleotideIndexAttribute = domElement.getAttribute("bpNucID") as string;
        let basePairNucleotideIndex = Number.parseInt(basePairNucleotideIndexAttribute);
        if (Number.isNaN(basePairNucleotideIndex)) {
          throw new Error(`This <BasePairs>.bpNucID is a non-integer: ${basePairNucleotideIndexAttribute}`);
        }
        basePairNucleotideIndex -= rnaMolecule.state.firstNucleotideIndex;
        let lengthAttribute = domElement.getAttribute("length") as string;
        let length = Number.parseInt(lengthAttribute);
        if (Number.isNaN(length)) {
          throw new Error(`This <BasePairs>.length is a non-integer: ${lengthAttribute}`);
        }
        let rnaMoleculeIndex = (cache.rnaComplex as RnaComplex.Component).props.rnaMolecules.length - 1;
        let basePairRnaMoleculeNameAttribute = domElement.getAttribute("bpName");
        if (basePairRnaMoleculeNameAttribute === null) {
          for (let i = 0; i < length; i++) {
            let interpolatedNucleotideIndex = nucleotideIndex + i;
            let interpolatedBasePairNucleotideIndex = basePairNucleotideIndex - i;
            let nucleotideProps : Nucleotide.Props = rnaMolecule.findNucleotideByIndex(interpolatedNucleotideIndex).arrayEntry.nucleotideProps;
            let basePairNucleotideProps : Nucleotide.Props = rnaMolecule.findNucleotideByIndex(interpolatedBasePairNucleotideIndex).arrayEntry.nucleotideProps;
            let type = Nucleotide.Component.getBasePairType(nucleotideProps.symbol, basePairNucleotideProps.symbol);
            nucleotideProps = Object.assign(nucleotideProps, {
              basePair : {
                nucleotideIndex : interpolatedBasePairNucleotideIndex,
                rnaMoleculeIndex,
                type,
                strokeWidth : DEFAULT_STROKE_WIDTH,
                stroke : Color.BLACK
              }
            });
            basePairNucleotideProps = Object.assign(basePairNucleotideProps, {
              basePair : {
                nucleotideIndex : interpolatedNucleotideIndex,
                rnaMoleculeIndex,
                type,
                strokeWidth : DEFAULT_STROKE_WIDTH,
                stroke : Color.BLACK
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
        let firstNucleotideIndex = (cache.rnaMolecule as RnaMolecule.Component).state.firstNucleotideIndex;
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
            stroke = Color.fromHexadecimal(colorAttribute, "rgb");
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
          let rnaMolecule = cache.rnaMolecule as RnaMolecule.Component;
          referencedNucleotideIndices.forEach((referencedNucleotideIndex : number) => {
            let nucleotideProps : Nucleotide.Props;
            try {
              nucleotideProps = rnaMolecule.findNucleotideByIndex(referencedNucleotideIndex).arrayEntry.nucleotideProps;
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
            let nucleotideProps : Nucleotide.Props = (cache.rnaMolecule as RnaMolecule.Component).findNucleotideByIndex(previousDomElementInformation.referencedNucleotideIndex as number).arrayEntry.nucleotideProps;
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
                    labelLine : {
                      endpoint0 : new Vector2D(x0, y0),
                      endpoint1 : new Vector2D(x1, y1),
                      strokeWidth,
                      stroke : Color.fromHexadecimal(textContentLineData[6] as string, "rgb")
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
                  let stroke = Color.fromHexadecimal(colorAsString, "rgb");
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
        let rnaComplex = cache.rnaComplex as RnaComplex.Component;
        (cache.basePairsAcrossMolecules as BasePairsAcrossMolecules[]).forEach((basePairsAcrossMolecules : BasePairsAcrossMolecules) => {
          let basePairedRnaMoleculeIndex = rnaComplex.props.rnaMolecules.findIndex((rnaMolecule : RnaMolecule.Component) => rnaMolecule.props.name === basePairsAcrossMolecules.basePairRnaMoleculeName);
          for (let i = 0; i < basePairsAcrossMolecules.length; i++) {
            let interpolatedNucleotideIndex = basePairsAcrossMolecules.nucleotideIndex + i;
            let interpolatedBasePairNucleotideIndex = basePairsAcrossMolecules.basePairNucleotideIndex - i;
            let foundNucleotideProps = (rnaComplex.props.rnaMolecules[basePairsAcrossMolecules.rnaMoleculeIndex] as RnaMolecule.Component).findNucleotideByIndex(interpolatedNucleotideIndex);
            let nucleotideProps : Nucleotide.Props = foundNucleotideProps.arrayEntry.nucleotideProps;
            let foundBasePairedNucleotideProps = (rnaComplex.props.rnaMolecules[basePairedRnaMoleculeIndex] as RnaMolecule.Component).findNucleotideByIndex(interpolatedBasePairNucleotideIndex);
            let basePairedNucleotideProps : Nucleotide.Props = foundBasePairedNucleotideProps.arrayEntry.nucleotideProps;
            let type = Nucleotide.Component.getBasePairType(nucleotideProps.symbol, basePairedNucleotideProps.symbol);
            nucleotideProps.basePair = {
              rnaMoleculeIndex : basePairedRnaMoleculeIndex,
              nucleotideIndex : interpolatedBasePairNucleotideIndex,
              type,
              strokeWidth : DEFAULT_STROKE_WIDTH,
              stroke : Color.BLACK
            };
            basePairedNucleotideProps.basePair = {
              rnaMoleculeIndex : basePairsAcrossMolecules.rnaMoleculeIndex,
              nucleotideIndex : interpolatedNucleotideIndex,
              type,
              strokeWidth : DEFAULT_STROKE_WIDTH,
              stroke : Color.BLACK
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
  let output = {
    rnaComplexes : new Array<RnaComplex.Component>(),
    complexDocumentName : ""
  }
  Array.from(new DOMParser().parseFromString(inputFileContent, "text/xml").children).forEach(childElement => {
    parseDomElement(childElement, output, { tagName : "" });
  });
  return output;
};

const jsonFileReader : XrnaFileReader = inputFileContent => {
  let rnaComplexes : Array<RnaComplex.Component> = [];
  let complexDocumentName = "Unknown";
  let parsedJson = JSON.parse(inputFileContent);
  if (!("classes" in parsedJson) || !("rnaComplexes" in parsedJson)) {
    throw "Input Json should have \"classes\" and \"rnaComplexes\" variables.";
  }
  let cssClasses = parsedJson.classes as Array<any>;
  rnaComplexes = (parsedJson.rnaComplexes as Array<any>).map((inputRnaComplex : any, inputRnaComplexIndex : number) => {
    if (!("name" in inputRnaComplex) || !("rnaMolecules" in inputRnaComplex)) {
      throw "Input rnaComplex elements of input Json should have \"name\" and \"rnaMolecules\" variables."
    }
    let name = inputRnaComplex.name;
    let rnaMolecules = (inputRnaComplex.rnaMolecules as Array<any>).map((inputRnaMolecule : any, rnaMoleculeIndex : number) => {
      if (!("name" in inputRnaMolecule) || !("basePairs" in inputRnaMolecule) || !("labels" in inputRnaMolecule) || !("sequence" in inputRnaMolecule)) {
        throw "Input rnaMolecule elements of input Json should have \"name\", \"sequence\", \"basePairs\", \"labels\" variables."
      }
      let name = inputRnaMolecule.name;
      let rnaMolecule = new RnaMolecule.Component({
        name,
        rnaComplexIndex : inputRnaComplexIndex,
        firstNucleotideIndex : Number.MAX_VALUE,
        nucleotidesIndexMap : []
      });
      (inputRnaMolecule.sequence as Array<any>).forEach(inputSequenceEntry => {
        if (!("classes" in inputSequenceEntry) || !("residueIndex" in inputSequenceEntry) || !("x" in inputSequenceEntry) || !("y" in inputSequenceEntry) || !("residueName" in inputSequenceEntry)) {
          throw "Input sequence elements of input Json should have \"classes\", \"residueIndex\", \"residueName\", \"x\" and \"y\" variables.";
        }
        let nucleotideIndex = Number.parseInt(inputSequenceEntry.residueIndex);
        if (nucleotideIndex < rnaMolecule.state.firstNucleotideIndex) {
          rnaMolecule.state = Object.assign(rnaMolecule.state, {
            firstNucleotideIndex : nucleotideIndex
          });
        }
      });
      (inputRnaMolecule.sequence as Array<any>).forEach(inputSequenceEntry => {
        let nucleotideIndex = Number.parseInt(inputSequenceEntry.residueIndex) - rnaMolecule.state.firstNucleotideIndex;
        let nucleotideProps : Nucleotide.Props = {
          rnaComplexIndex : inputRnaComplexIndex,
          rnaMoleculeIndex : rnaMoleculeIndex,
          nucleotideIndex,
          symbol : inputSequenceEntry.residueName as Nucleotide.Symbol,
          position : new Vector2D(Number.parseFloat(inputSequenceEntry.x), Number.parseFloat(inputSequenceEntry.y))
        };
        rnaMolecule.insert(nucleotideIndex, nucleotideProps);
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
              stroke : Color.fromCssString(className.substring("text-".length))
            });
          }
        });
      });
      (inputRnaMolecule.labels as Array<any>).forEach(label => {
        if (!("residueIndex" in label)) {
          throw "Input label elements of input Json should have a \"residueIndex\" variable."
        }
        let nucleotideProps : Nucleotide.Props = rnaMolecule.findNucleotideByIndex(Number.parseInt(label.residueIndex) - rnaMolecule.state.firstNucleotideIndex).arrayEntry.nucleotideProps;
        if ("labelContent" in label) {
          let font = Font.DEFAULT_FONT;
          let stroke = Color.BLACK;
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
              stroke = Color.fromCssString(labelClassName.substring("text-".length));
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
          let stroke = Color.BLACK;
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
                    stroke = Color.fromCssString(cssClassData[1] as string);
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
            labelLine : {
              endpoint0 : Vector2D.subtract(new Vector2D(Number.parseFloat(labelLine.x1), Number.parseFloat(labelLine.y1)), nucleotideProps.position),
              endpoint1 : Vector2D.subtract(new Vector2D(Number.parseFloat(labelLine.x2), Number.parseFloat(labelLine.y2)), nucleotideProps.position),
              strokeWidth,
              stroke
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
        let residueIndex1 = Number.parseInt(basePair.residueIndex1);
        let nucleotideProps1 : Nucleotide.Props = rnaMolecule.findNucleotideByIndex(residueIndex1).arrayEntry.nucleotideProps;
        let residueIndex2 = Number.parseInt(basePair.residueIndex2);
        let nucleotideProps2 : Nucleotide.Props = rnaMolecule.findNucleotideByIndex(residueIndex2).arrayEntry.nucleotideProps;
        let strokeWidth = DEFAULT_STROKE_WIDTH;
        let stroke = Color.BLACK;
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
                  stroke = Color.fromCssString(cssClassData[1] as string);
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
      return rnaMolecule;
    });
    return new RnaComplex.Component({
      name,
      rnaMolecules
    });
  }); 
  return {
    rnaComplexes,
    complexDocumentName
  };
};

const inputFileReaders : Record<string, XrnaFileReader> = {
  "xrna" : xrnaFileReader,
  "xml" : xrnaFileReader,
  "ps" : xrnaFileReader,
  "ss" : xrnaFileReader,
  // "str" : (_ : string) => {
  //   return {
  //     rnaComplexes : [],
  //     complexDocumentName : ""
  //   };
  // },
  // "svg" : (_ : string) => {
  //   return {
  //     rnaComplexes : [],
  //     complexDocumentName : ""
  //   };
  // },
  "json" : jsonFileReader
};

export type { XrnaFileReader };
export default inputFileReaders;