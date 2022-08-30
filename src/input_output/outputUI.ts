import { stringify } from "querystring";
import Color from "../data_structures/Color";
import Font from "../data_structures/Font";
import { Nucleotide } from "../components/Nucleotide";
import { RnaComplex } from "../components/RnaComplex";
import { RnaMolecule } from "../components/RnaMolecule";

interface XrnaFileWriter {
  (rnaComplexes : Array<RnaComplex.Component>) : string;
}

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

const jsonFileWriter : XrnaFileWriter = (rnaComplexes : Array<RnaComplex.Component>) => {
  let fontCssClasses : Array<CssClassForJson> = [];
  let strokeCssClasses : Array<CssClassForJson> = [];
  let labelContentCssClasses : Record<number, Array<string>> = {};
  let labelLineCssClasses : Record<number, Array<string>> = {};
  let nucleotideCssClasses : Record<number, Array<string>> = {};
  let basePairsCssClasses : Record<number, Array<string>> = {};
  rnaComplexes.forEach(rnaComplex => {
    rnaComplex.props.rnaMolecules.forEach((rnaMolecule : RnaMolecule.Component) => {
      rnaMolecule.props.nucleotidesIndexMap.forEach((nucleotideData : RnaMolecule.ArrayEntry) => {
        let nucleotideIndex = nucleotideData.nucleotideIndex;
        let nucleotide = nucleotideData.nucleotideReference.current as Nucleotide.Component;
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
          let strokeAsText = stroke.stroke.toCSS();
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
          "text-" + nucleotide.state.stroke.toCSS(),
          fontCssClassName
        ];
        if (nucleotide.state.labelContent !== undefined) {
          handleFontCss(nucleotide.state.labelContent.font);
          labelContentCssClasses[nucleotideIndex] = [
            "text-" + nucleotide.state.labelContent.stroke.toCSS(),
            fontCssClassName
          ];
        }
        if (nucleotide.state.labelLine !== undefined) {
          handleStrokeCss(nucleotide.state.labelLine);
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
    rnaComplexes : rnaComplexes.map(rnaComplex => {
      return {
        name : rnaComplex.props.name,
        rnaMolecules : rnaComplex.props.rnaMolecules.map((rnaMolecule : RnaMolecule.Component) => {
          let basePairs = new Array<BasePairForJson>();
          let labels = new Array<LabelForJson>();
          rnaMolecule.props.nucleotidesIndexMap.forEach((nucleotideData : RnaMolecule.ArrayEntry) => {
            let nucleotideIndex = nucleotideData.nucleotideIndex;
            let nucleotide = nucleotideData.nucleotideReference.current as Nucleotide.Component;
            if (nucleotide.state.labelContent !== undefined || nucleotide.state.labelLine !== undefined) {
              let label : LabelForJson = {
                residueIndex : nucleotideData.nucleotideIndex
              };
              if (nucleotide.state.labelContent !== undefined) {
                label.labelContent = {
                  classes : labelContentCssClasses[nucleotideIndex],
                  label : nucleotide.state.labelContent.content,
                  x : nucleotide.state.labelContent.position.x + nucleotide.state.position.x,
                  y : nucleotide.state.labelContent.position.y + nucleotide.state.position.y
                };
              }
              if (nucleotide.state.labelLine !== undefined) {
                label.labelLine = {
                  classes : labelLineCssClasses[nucleotideIndex],
                  x1 : nucleotide.state.labelLine.endpoint0.x + nucleotide.state.position.x,
                  y1 : nucleotide.state.labelLine.endpoint0.y + nucleotide.state.position.y,
                  x2 : nucleotide.state.labelLine.endpoint1.x + nucleotide.state.position.x,
                  y2 : nucleotide.state.labelLine.endpoint1.y + nucleotide.state.position.y
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
            name : rnaMolecule.props.name,
            basePairs,
            labels,
            sequence : rnaMolecule.props.nucleotidesIndexMap.map((nucleotideData : RnaMolecule.ArrayEntry) => {
              let nucleotideIndex = nucleotideData.nucleotideIndex;
              let nucleotide = nucleotideData.nucleotideReference.current as Nucleotide.Component;
              return {
                classes : nucleotideCssClasses[nucleotideIndex],
                residueIndex : nucleotideData.nucleotideIndex,
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

const outputFileWriters : Record<string, XrnaFileWriter> = {
  "xrna" : () => "This is an XRNA file.",
  "svg" : () => "This is an SVG file.",
  "tr" : () => "This is a TR file.",
  "csv" : () => "This is a CSV file.",
  "bpseq" : () => "This is a BPSeq file.",
  "jpg" : () => "This is a JPG file.",
  "json" : jsonFileWriter
};

export type { XrnaFileWriter };
export default outputFileWriters;