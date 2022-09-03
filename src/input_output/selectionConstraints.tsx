import React from "react";
import { App, DEFAULT_STROKE_WIDTH, FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT } from "../App";
import { Nucleotide } from "../components/Nucleotide";
import { RnaMolecule } from "../components/RnaMolecule";
import Vector2D, { PolarVector2D } from "../data_structures/Vector2D";
import { Geometry } from "../utils/Geometry";
import { Utils } from "../utils/Utils";

export namespace SelectionConstraint {
  enum ReturnType {
    DragListener,
    EditJsxElement,
    FormatJsxElement,
    AnnotateJsxElement
  }

  export abstract class SelectionConstraint {
    abstract calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : App.DragListener | string | RightClickMenu;
    attemptDrag(clickedOnNucleotide : Nucleotide.Component) : App.DragListener | string {
      return this.calculateAndApproveSelection(clickedOnNucleotide, ReturnType.DragListener) as App.DragListener | string;
    }
    getEditMenuContent(clickedOnNucleotide : Nucleotide.Component) : RightClickMenu | string {
      return this.calculateAndApproveSelection(clickedOnNucleotide, ReturnType.EditJsxElement) as RightClickMenu | string;
    }
    getFormatMenuContent(clickedOnNucleotide : Nucleotide.Component) : RightClickMenu | string {
      return this.calculateAndApproveSelection(clickedOnNucleotide, ReturnType.FormatJsxElement) as RightClickMenu | string;
    }
    getAnnotateMenuContent(clickedOnNucleotide : Nucleotide.Component) : RightClickMenu | string {
      return this.calculateAndApproveSelection(clickedOnNucleotide, ReturnType.AnnotateJsxElement) as RightClickMenu | string;
    }
  };

  export type RightClickMenu = {
    ref : React.RefObject<SelectionConstraintComponent<any, any>>,
    content : JSX.Element
  };

  const SINGLE_NUCLEOTIDE = "Single nucleotide";
  const SINGLE_BASE_PAIR = "Single base-pair";
  const RNA_SINGLE_STRAND = "RNA single strand";
  const RNA_HELIX = "RNA helix";
  const RNA_SUB_DOMAIN = "RNA sub-domain";
  const RNA_CYCLE = "RNA cycle";
  const RNA_MOLECULE = "RNA molecule";
  const RNA_COMPLEX = "RNA complex";
  const PER_COLOR = "Per-color";
  const CUSTOM_RANGE = "Custom range";
  const NAMED_GROUP = "Named group";
  const RNA_STACKED_HELIX = "RNA stacked helix";
  const LABELS_ONLY = "Labels only";
  const ENTIRE_SCENE = "Entire scene";

  export function linearDrag(cachedDrag : Vector2D, draggedNucleotides : Array<Nucleotide.Component>) : App.DragListener {
    let draggedNucleotidesData = draggedNucleotides.map(draggedNucleotide => {
      return {
        nucleotide : draggedNucleotide,
        positionDifference : Vector2D.subtract(draggedNucleotide.state.position, cachedDrag)
      };
    });
    return {
      isWindowDragListenerFlag : false,
      initiateDrag() {
        return cachedDrag;
      },
      drag(totalDrag : Vector2D) {
        draggedNucleotidesData.forEach((draggedNucleotideData : { positionDifference : Vector2D, nucleotide : Nucleotide.Component }) => draggedNucleotideData.nucleotide.setState({
          position : Vector2D.add(draggedNucleotideData.positionDifference, totalDrag)
        }));
      },
      terminateDrag() {
        // Do nothing.
      },
      affectedNucleotides : draggedNucleotides
    }
  }

  function getBasePairedNucleotideArrayIndexDelta(rnaMolecule : RnaMolecule.Component, basePairedRnaMolecule : RnaMolecule.Component, basePairedRnaMoleculeIndex : number, nucleotideArrayIndex : number, basePairedNucleotideArrayIndex : number) : number | undefined {
    let basePairedNucleotideArrayIndexDelta : number | undefined = undefined;
    if (nucleotideArrayIndex + 1 < rnaMolecule.props.nucleotidesIndexMap.length) {
      let currentNucleotide = rnaMolecule.props.nucleotidesIndexMap[nucleotideArrayIndex + 1].nucleotideReference.current as Nucleotide.Component;
      let currentBasePair = currentNucleotide.state.basePair;
      if (currentBasePair !== undefined && currentBasePair.rnaMoleculeIndex === basePairedRnaMoleculeIndex) {
        let basePairedNucleotideArrayIndexDeltaCandidate = basePairedRnaMolecule.findNucleotideByIndex(currentBasePair.nucleotideIndex).arrayIndex - basePairedNucleotideArrayIndex;
        if (Math.abs(basePairedNucleotideArrayIndexDeltaCandidate) === 1) {
          basePairedNucleotideArrayIndexDelta = basePairedNucleotideArrayIndexDeltaCandidate;
        }
      }
    }
    if (basePairedNucleotideArrayIndexDelta === undefined && nucleotideArrayIndex > 0) {
      let currentNucleotide = rnaMolecule.props.nucleotidesIndexMap[nucleotideArrayIndex - 1].nucleotideReference.current as Nucleotide.Component;
      let currentBasePair = currentNucleotide.state.basePair;
      if (currentBasePair !== undefined && currentBasePair.rnaMoleculeIndex === basePairedRnaMoleculeIndex) {
        let basePairedNucleotideArrayIndexDeltaCandidate = basePairedNucleotideArrayIndex - basePairedRnaMolecule.findNucleotideByIndex(currentBasePair.nucleotideIndex).arrayIndex;
        if (Math.abs(basePairedNucleotideArrayIndexDeltaCandidate) === 1) {
          basePairedNucleotideArrayIndexDelta = basePairedNucleotideArrayIndexDeltaCandidate;
        }
      }
    }
    return basePairedNucleotideArrayIndexDelta;
  }

  function appendDraggedNucleotides(rnaMolecule : RnaMolecule.Component, basePairedRnaMolecule : RnaMolecule.Component, basePairedRnaMoleculeIndex : number, nucleotideArrayIndex : number, basePairedNucleotideArrayIndex : number, nucleotideArrayIndexDelta : number, basePairedNucleotideArrayIndexDelta : number, draggedNucleotides : Array<Nucleotide.Component>) : { nucleotideArrayIndex : number, basePairedNucleotideArrayIndex : number } {
    nucleotideArrayIndex += nucleotideArrayIndexDelta;
    basePairedNucleotideArrayIndex += basePairedNucleotideArrayIndexDelta;
    while (nucleotideArrayIndex < rnaMolecule.props.nucleotidesIndexMap.length && basePairedNucleotideArrayIndex >= 0 && basePairedNucleotideArrayIndex < basePairedRnaMolecule.props.nucleotidesIndexMap.length) {
      let currentNucleotide = rnaMolecule.props.nucleotidesIndexMap[nucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component;
      let basePair = currentNucleotide.state.basePair;
      if (basePair === undefined || basePair.rnaMoleculeIndex !== basePairedRnaMoleculeIndex) {
        break;
      }
      let basePairedNucleotideArrayEntry = basePairedRnaMolecule.props.nucleotidesIndexMap[basePairedNucleotideArrayIndex];
      let basePairedNucleotide = basePairedNucleotideArrayEntry.nucleotideReference.current as Nucleotide.Component;
      if (basePairedNucleotideArrayEntry.nucleotideIndex !== basePair.nucleotideIndex) {
        break;
      }
      draggedNucleotides.push(
        currentNucleotide, 
        basePairedNucleotide
      );
      nucleotideArrayIndex += nucleotideArrayIndexDelta;
      basePairedNucleotideArrayIndex += basePairedNucleotideArrayIndexDelta;
    }
    return {
      nucleotideArrayIndex,
      basePairedNucleotideArrayIndex
    };
  }

  export const selectionConstraints : Record<string, SelectionConstraint> = {
    [SINGLE_NUCLEOTIDE] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        if (clickedOnNucleotide.state.basePair === undefined) {
          switch (returnType) {
            case ReturnType.DragListener:
              return {
                isWindowDragListenerFlag : false,
                initiateDrag() {
                  return clickedOnNucleotide.state.position;
                },
                drag(totalDrag : Vector2D) {
                  clickedOnNucleotide.setState({
                    position : totalDrag
                  })
                },
                terminateDrag() {
                  // Do nothing.
                },
                affectedNucleotides : [clickedOnNucleotide]
              };
            case ReturnType.EditJsxElement:
              let ref = React.createRef<SingleNucleotide.Edit.Component>();
              return {
                ref,
                content : <SingleNucleotide.Edit.Component
                  ref = {ref}
                  affectedNucleotides = {[clickedOnNucleotide]}
                />
              };
            case ReturnType.FormatJsxElement:
            case ReturnType.AnnotateJsxElement:
              throw "Not yet implemented.";
            default:
              throw "Unrecognized ReturnType.";
          }
        } else {
          return `Cannot drag a base-paired nucleotide using selection constraint "${SINGLE_NUCLEOTIDE}"`;
        }
      }
    },
    [SINGLE_BASE_PAIR] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        if (clickedOnNucleotide.state.basePair === undefined) {
          return `Cannot drag a non-base-paired nucleotide using selection constraint "${SINGLE_BASE_PAIR}"`;
        } else {
          let basePair = clickedOnNucleotide.state.basePair;
          let rnaComplex = App.Component.getCurrent().state.rnaComplexes[clickedOnNucleotide.props.rnaComplexIndex];
          let rnaMolecule = rnaComplex.props.rnaMolecules[clickedOnNucleotide.props.rnaMoleculeIndex];
          let nucleotideArrayIndex = rnaMolecule.findNucleotideByIndex(clickedOnNucleotide.props.nucleotideIndex).arrayIndex;
          let basePairedRnaMolecule = rnaComplex.props.rnaMolecules[basePair.rnaMoleculeIndex];
          let arrayEntryData = basePairedRnaMolecule.findNucleotideByIndex(basePair.nucleotideIndex);
          let basePairedNucleotide = arrayEntryData.arrayEntry.nucleotideReference.current as Nucleotide.Component;
          let basePairedNucleotideArrayIndex = arrayEntryData.arrayIndex;
          let isNotConsecutivelyBasePaired = (nucleotide : Nucleotide.Component) => {
            return nucleotide.state.basePair === undefined || nucleotide.state.basePair.rnaMoleculeIndex !== basePair.rnaMoleculeIndex || Math.abs(nucleotide.state.basePair.nucleotideIndex - basePair.nucleotideIndex) > 1;
          };
          if ((nucleotideArrayIndex == 0 || isNotConsecutivelyBasePaired(rnaMolecule.props.nucleotidesIndexMap[nucleotideArrayIndex - 1].nucleotideReference.current as Nucleotide.Component)) && (nucleotideArrayIndex == rnaMolecule.props.nucleotidesIndexMap.length - 1 || isNotConsecutivelyBasePaired(rnaMolecule.props.nucleotidesIndexMap[nucleotideArrayIndex + 1].nucleotideReference.current as Nucleotide.Component))) {
            let draggedNucleotides : Array<Nucleotide.Component> = [
              clickedOnNucleotide,
              basePairedNucleotide
            ];
            let inBetweenNucleotides : Array<Nucleotide.Component> = [];
            if (clickedOnNucleotide.props.rnaMoleculeIndex === basePair.rnaMoleculeIndex) {
              let singleStrandedInteriorFlag = true;
              for (let arrayIndex = Math.min(nucleotideArrayIndex, basePairedNucleotideArrayIndex) + 1; arrayIndex < Math.max(nucleotideArrayIndex, basePairedNucleotideArrayIndex); arrayIndex++) {
                let nucleotide = rnaMolecule.props.nucleotidesIndexMap[arrayIndex].nucleotideReference.current as Nucleotide.Component;
                if (nucleotide.state.basePair !== undefined) {
                  singleStrandedInteriorFlag = false;
                }
                inBetweenNucleotides.push(nucleotide);
              }
              if (singleStrandedInteriorFlag) {
                draggedNucleotides.push(...inBetweenNucleotides);
              }
            }
            switch (returnType) {
              case ReturnType.DragListener:
                return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
              case ReturnType.EditJsxElement:
                let ref = React.createRef<SingleBasePair.Edit.Component>();
                return {
                  ref,
                  content : <SingleBasePair.Edit.Component
                    ref = {ref}
                    affectedNucleotides = {draggedNucleotides}
                    indexOfClickedOnNucleotide = {0}
                    indexOfBasePairedNucleotide = {1}
                  />
                };
              case ReturnType.FormatJsxElement:
              case ReturnType.AnnotateJsxElement:
                throw "Not yet implemented.";
              default:
                throw "Unrecognized ReturnType.";
            }
          } else {
            return `Cannot drag nucleotides within consecutive base pairs using selection constraint "${SINGLE_BASE_PAIR}"`;
          }
        }
      }
    },
    [RNA_SINGLE_STRAND] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        if (clickedOnNucleotide.state.basePair === undefined) {
          let rnaMolecule = App.Component.getCurrent().state.rnaComplexes[clickedOnNucleotide.props.rnaComplexIndex].props.rnaMolecules[clickedOnNucleotide.props.rnaMoleculeIndex];
          let nucleotidesData = rnaMolecule.props.nucleotidesIndexMap;
          let clickedOnNucleotideArrayIndex = rnaMolecule.findNucleotideByIndex(clickedOnNucleotide.props.nucleotideIndex).arrayIndex;
          let lowerBoundingNucleotideArrayIndex = clickedOnNucleotideArrayIndex;
          for (let arrayIndex = clickedOnNucleotideArrayIndex - 1; arrayIndex >= 0; arrayIndex--) {
            lowerBoundingNucleotideArrayIndex = arrayIndex;
            if ((nucleotidesData[arrayIndex].nucleotideReference.current as Nucleotide.Component).state.basePair !== undefined) {
              break;
            }
          }
          if (clickedOnNucleotideArrayIndex === nucleotidesData.length - 1) {
            let arrayIndex = clickedOnNucleotideArrayIndex;
            let draggedNucleotides = new Array<Nucleotide.Component>();
            do {
              draggedNucleotides.push(nucleotidesData[arrayIndex].nucleotideReference.current as Nucleotide.Component);
              arrayIndex--;
            } while (arrayIndex > lowerBoundingNucleotideArrayIndex);
            let interpolationFactorDelta = 1 / draggedNucleotides.length;
            let lowerBoundingNucleotide = nucleotidesData[lowerBoundingNucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component;
            // let showHighlightUponTerminateDrag = true;
            switch (returnType) {
              case ReturnType.DragListener:
                return {
                  isWindowDragListenerFlag : false,
                  initiateDrag() {
                    return clickedOnNucleotide.state.position;
                  },
                  drag(totalDrag : Vector2D) {
                    let positionDelta = Vector2D.scaleUp(Vector2D.subtract(lowerBoundingNucleotide.state.position, totalDrag), interpolationFactorDelta);
                    let position = totalDrag;
                    draggedNucleotides.forEach((draggedNucleotide : Nucleotide.Component) => {
                      draggedNucleotide.setState({
                        position
                      });
                      position = Vector2D.add(position, positionDelta);
                    });
                  },
                  terminateDrag() {
                    
                  },
                  affectedNucleotides : draggedNucleotides
                };
              case ReturnType.EditJsxElement:
                let ref = React.createRef<SingleStrand.Edit.Component>();
                return {
                  ref,
                  content : <SingleStrand.Edit.Component
                    ref = {ref}
                    affectedNucleotides = {draggedNucleotides}
                  />
                };
              case ReturnType.FormatJsxElement:
                return "Not yet implemented.";
              default:
                throw "Unrecognized ReturnType.";
            }
          }
          let upperBoundingNucleotideArrayIndex = clickedOnNucleotideArrayIndex;
          for (let arrayIndex = clickedOnNucleotideArrayIndex + 1; arrayIndex < nucleotidesData.length; arrayIndex++) {
            upperBoundingNucleotideArrayIndex = arrayIndex;
            if ((nucleotidesData[arrayIndex].nucleotideReference.current as Nucleotide.Component).state.basePair !== undefined) {
              break;
            }
          }
          if (clickedOnNucleotideArrayIndex === 0) {
            let arrayIndex = clickedOnNucleotideArrayIndex;
            let draggedNucleotides = new Array<Nucleotide.Component>();
            do {
              draggedNucleotides.push(nucleotidesData[arrayIndex].nucleotideReference.current as Nucleotide.Component);
              arrayIndex++;
            } while (arrayIndex < upperBoundingNucleotideArrayIndex);
            let interpolationFactorDelta = 1 / draggedNucleotides.length;
            let upperBoundingNucleotide = nucleotidesData[upperBoundingNucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component;
            switch (returnType) {
              case ReturnType.DragListener:
                return {
                  isWindowDragListenerFlag : false,
                  initiateDrag() {
                    return clickedOnNucleotide.state.position;
                  },
                  drag(totalDrag : Vector2D) {
                    let positionDelta = Vector2D.scaleUp(Vector2D.subtract(upperBoundingNucleotide.state.position, totalDrag), interpolationFactorDelta);
                    let position = totalDrag;
                    draggedNucleotides.forEach((draggedNucleotide : Nucleotide.Component) => {
                      draggedNucleotide.setState({
                        position
                      });
                      position = Vector2D.add(position, positionDelta);
                    });
                  },
                  terminateDrag() {
                    // Do nothing.
                  },
                  affectedNucleotides : draggedNucleotides
                };
              case ReturnType.EditJsxElement:
                return "Not yet implemented.";
              case ReturnType.FormatJsxElement:
                return "Not yet implemented.";
              default:
                throw "Unrecognized ReturnType.";
            }
          }
          let lowerBoundingNucleotide = (nucleotidesData[lowerBoundingNucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component);
          let upperBoundingNucleotide = (nucleotidesData[upperBoundingNucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component);
          let twoPi = 2 * Math.PI;
          switch (returnType) {
            case ReturnType.DragListener:
              let draggedNucleotides = new Array<Nucleotide.Component>();
              for (let nucleotideArrayIndex = lowerBoundingNucleotideArrayIndex + 1; nucleotideArrayIndex < upperBoundingNucleotideArrayIndex; nucleotideArrayIndex++) {
                draggedNucleotides.push(nucleotidesData[nucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component);
              }
              return {
                isWindowDragListenerFlag : false,
                initiateDrag() {
                  return clickedOnNucleotide.state.position;
                },
                drag(totalDrag : Vector2D) {
                  let crossProduct = Vector2D.crossProduct(Vector2D.subtract(totalDrag, lowerBoundingNucleotide.state.position), Vector2D.subtract(upperBoundingNucleotide.state.position, lowerBoundingNucleotide.state.position));
                  let crossProductSign = Utils.sign(crossProduct);
                  let boundingCircle = Geometry.getBoundingCircleGivenVectorsAreNotColinear(totalDrag, lowerBoundingNucleotide.state.position, upperBoundingNucleotide.state.position);
                  let lowerBoundingNucleotidePositionDifference = Vector2D.subtract(lowerBoundingNucleotide.state.position, boundingCircle.center);
                  let upperBoundingNucleotidePositionDifference = Vector2D.subtract(upperBoundingNucleotide.state.position, boundingCircle.center);
                  let lowerBoundingNucleotidePositionDifferenceAsAngle = Vector2D.asAngle(lowerBoundingNucleotidePositionDifference);
                  let upperBoundingNucleotidePositionDifferenceAsAngle = Vector2D.asAngle(upperBoundingNucleotidePositionDifference);
                  let angleTraversal = (upperBoundingNucleotidePositionDifferenceAsAngle - lowerBoundingNucleotidePositionDifferenceAsAngle + twoPi) % twoPi;
                  if (crossProductSign < 0) {
                    angleTraversal = -(twoPi - angleTraversal);
                  }
                  let angleDelta = angleTraversal / (upperBoundingNucleotideArrayIndex - lowerBoundingNucleotideArrayIndex);
                  let angle = lowerBoundingNucleotidePositionDifferenceAsAngle + angleDelta;
                  draggedNucleotides.forEach((draggedNucleotide : Nucleotide.Component) => {
                    draggedNucleotide.setState({
                      position : Vector2D.add(boundingCircle.center, Vector2D.toCartesian(angle, boundingCircle.radius))
                    });
                    angle += angleDelta;
                  });
                },
                terminateDrag() {
                  // Do nothing.
                },
                affectedNucleotides : draggedNucleotides
              };
            case ReturnType.EditJsxElement:
              return "Not yet implemented.";
            case ReturnType.FormatJsxElement:
              return "Not yet implemented.";
            default:
              throw "Unrecognized ReturnType.";
          }
        } else {
          return `Cannot drag a base-paired nucleotide using selection constraint "${RNA_SINGLE_STRAND}"`;
        }
      }
    },
    [RNA_HELIX] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        let rnaComplex = App.Component.getCurrent().state.rnaComplexes[clickedOnNucleotide.props.rnaComplexIndex];
        let basePair = clickedOnNucleotide.state.basePair;
        if (basePair === undefined) {
          return `Cannot drag a non-base-paired nucleotide using selection constraint "${RNA_HELIX}"`;
        }
        let rnaMolecule = rnaComplex.props.rnaMolecules[clickedOnNucleotide.props.rnaMoleculeIndex];
        let basePairedRnaMoleculeIndex = basePair.rnaMoleculeIndex;
        let basePairedRnaMolecule = rnaComplex.props.rnaMolecules[basePair.rnaMoleculeIndex];
        let basePairedNucleotideArrayIndex = basePairedRnaMolecule.findNucleotideByIndex(basePair.nucleotideIndex).arrayIndex;
        let clickedOnNucleotideArrayIndex = rnaMolecule.findNucleotideByIndex(clickedOnNucleotide.props.nucleotideIndex).arrayIndex;
        let basePairedNucleotideArrayIndexDelta : number | undefined = getBasePairedNucleotideArrayIndexDelta(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex);
        let basePairedNucleotide = basePairedRnaMolecule.props.nucleotidesIndexMap[basePairedNucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component;
        let draggedNucleotides : Array<Nucleotide.Component> = [
          clickedOnNucleotide,
          basePairedNucleotide
        ];
        if (basePairedNucleotideArrayIndexDelta !== undefined) {
          appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex, 1, basePairedNucleotideArrayIndexDelta, draggedNucleotides);
          appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex, -1, -basePairedNucleotideArrayIndexDelta, draggedNucleotides);
          if (clickedOnNucleotide.props.rnaMoleculeIndex === basePairedRnaMoleculeIndex) {
            // Intramolecular helix.
            draggedNucleotides.sort((draggedNucleotide0 : Nucleotide.Component, draggedNucleotide1 : Nucleotide.Component) => draggedNucleotide0.props.nucleotideIndex - draggedNucleotide1.props.nucleotideIndex);
            let greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex = draggedNucleotides[0].props.nucleotideIndex;
            for (let i = 1; i < draggedNucleotides.length; i++) {
              let nucleotideIndex = draggedNucleotides[i].props.nucleotideIndex;
              if (nucleotideIndex !== greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex + 1) {
                break;
              }
              greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex = nucleotideIndex;
            }
            let leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex = draggedNucleotides[draggedNucleotides.length - 1].props.nucleotideIndex;
            for (let i = draggedNucleotides.length - 2; i >= 0; i--) {
              let nucleotideIndex = draggedNucleotides[i].props.nucleotideIndex;
              if (nucleotideIndex !== leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex - 1) {
                break;
              }
              leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex = nucleotideIndex;
            }
            let partialDraggedNucleotides = new Array<Nucleotide.Component>();
            let freeNucleotidesOnlyFlag = true;
            let startingArrayIndex = rnaMolecule.findNucleotideByIndex(greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex).arrayIndex + 1;
            let boundingArrayIndex = rnaMolecule.findNucleotideByIndex(leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex).arrayIndex;
            for (let arrayIndex = startingArrayIndex; arrayIndex < boundingArrayIndex; arrayIndex++) {
              let nucleotide = rnaMolecule.props.nucleotidesIndexMap[arrayIndex].nucleotideReference.current as Nucleotide.Component;
              if (nucleotide.state.basePair !== undefined) {
                freeNucleotidesOnlyFlag = false;
                break;
              }
              partialDraggedNucleotides.push(nucleotide);
            }
            if (freeNucleotidesOnlyFlag) {
              draggedNucleotides.push(...partialDraggedNucleotides);
            }
          }
        }
        switch (returnType) {
          case ReturnType.DragListener:
            return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [RNA_STACKED_HELIX] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        let basePair = clickedOnNucleotide.state.basePair;
        if (basePair === undefined) {
          return `Cannot drag a non-basepaired nucleotide using selection constraint "${RNA_STACKED_HELIX}"`;
        }
        let rnaComplex = App.Component.getCurrent().state.rnaComplexes[clickedOnNucleotide.props.rnaComplexIndex];
        let rnaMoleculeIndex = clickedOnNucleotide.props.rnaMoleculeIndex;
        let rnaMolecule = rnaComplex.props.rnaMolecules[rnaMoleculeIndex];
        let foundClickedOnNucleotide = rnaMolecule.findNucleotideByIndex(clickedOnNucleotide.props.nucleotideIndex);
        let basePairedRnaMoleculeIndex = basePair.rnaMoleculeIndex;
        let basePairedRnaMolecule = rnaComplex.props.rnaMolecules[basePairedRnaMoleculeIndex];
        let foundBasePairedNucleotide = basePairedRnaMolecule.findNucleotideByIndex(basePair.nucleotideIndex);
        let basePairedNucleotide = foundBasePairedNucleotide.arrayEntry.nucleotideReference.current as Nucleotide.Component;
        let draggedNucleotides : Array<Nucleotide.Component> = [
          clickedOnNucleotide,
          basePairedNucleotide
        ];
        let clickedOnNucleotideArrayIndex = foundClickedOnNucleotide.arrayIndex;
        let basePairedNucleotideArrayIndex = foundBasePairedNucleotide.arrayIndex;
        let basePairedNucleotideArrayIndexDelta = getBasePairedNucleotideArrayIndexDelta(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex);
        if (basePairedNucleotideArrayIndexDelta !== undefined) {
          let maximumNucleotideArrayIndices = appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex, 1, basePairedNucleotideArrayIndexDelta, draggedNucleotides);
          let minimumNucleotideArrayIndices = appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex, -1, -basePairedNucleotideArrayIndexDelta, draggedNucleotides);
          let iterateAcrossHelices = (nucleotideArrayIndices : {nucleotideArrayIndex : number, basePairedNucleotideArrayIndex : number}, nucleotideArrayIndexDelta : number, basePairedNucleotideArrayIndexDelta : number) => {
            outer: while (true) {
              let freeNucleotides = new Array<Nucleotide.Component>();
              let nucleotideArrayIndicesOutOfBoundsFlag = false;
              let nucleotideArrayIndex = nucleotideArrayIndices.nucleotideArrayIndex;
              inner: for (; ; nucleotideArrayIndex += nucleotideArrayIndexDelta) {
                if (nucleotideArrayIndex < 0 || nucleotideArrayIndex >= rnaMolecule.props.nucleotidesIndexMap.length) {
                  nucleotideArrayIndicesOutOfBoundsFlag = true;
                  break inner;
                }
                let nucleotide = rnaMolecule.props.nucleotidesIndexMap[nucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component;
                let basePair = nucleotide.state.basePair;
                if (basePair === undefined) {
                  freeNucleotides.push(nucleotide);
                } else if (basePair.rnaMoleculeIndex === basePairedRnaMoleculeIndex) {
                  break inner;
                } else {
                  break outer;
                }
              }
              let basePairedNucleotideArrayIndex = nucleotideArrayIndices.basePairedNucleotideArrayIndex;
              inner: for (; ; basePairedNucleotideArrayIndex += basePairedNucleotideArrayIndexDelta) {
                if (basePairedNucleotideArrayIndex < 0 || basePairedNucleotideArrayIndex >= basePairedRnaMolecule.props.nucleotidesIndexMap.length) {
                  nucleotideArrayIndicesOutOfBoundsFlag = true;
                  break inner;
                }
                let basePairedNucleotide = basePairedRnaMolecule.props.nucleotidesIndexMap[basePairedNucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component;
                let basePair = basePairedNucleotide.state.basePair;
                if (basePair === undefined) {
                  freeNucleotides.push(basePairedNucleotide);
                } else if (basePair.rnaMoleculeIndex === rnaMoleculeIndex) {
                  break inner;
                } else {
                  break outer;
                }
              }
              if (nucleotideArrayIndicesOutOfBoundsFlag) {
                draggedNucleotides.push(...freeNucleotides);
                break outer;
              }
              let nucleotide = (rnaMolecule.props.nucleotidesIndexMap[nucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component);
              let basePair = nucleotide.state.basePair;
              let basePairedNucleotide = basePairedRnaMolecule.props.nucleotidesIndexMap[basePairedNucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component;
              if ((basePair as Nucleotide.BasePair).nucleotideIndex !== basePairedNucleotide.props.nucleotideIndex) {
                break outer;
              }
              draggedNucleotides.push(
                nucleotide,
                basePairedNucleotide,
                ...freeNucleotides
              );
              if (nucleotideArrayIndex === nucleotideArrayIndices.basePairedNucleotideArrayIndex - basePairedNucleotideArrayIndexDelta) {
                break outer;
              }
              nucleotideArrayIndices = appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, nucleotideArrayIndex, basePairedNucleotideArrayIndex, nucleotideArrayIndexDelta, basePairedNucleotideArrayIndexDelta, draggedNucleotides);
            }
          };
          iterateAcrossHelices(maximumNucleotideArrayIndices, 1, basePairedNucleotideArrayIndexDelta);
          iterateAcrossHelices(minimumNucleotideArrayIndices, -1, -basePairedNucleotideArrayIndexDelta);
        }
        switch (returnType) {
          case ReturnType.DragListener:
            return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [RNA_SUB_DOMAIN] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        let basePair = clickedOnNucleotide.state.basePair;
        if (basePair === undefined) {
          return `Cannot drag a non-basepaired nucleotide using selection constraint "${RNA_SUB_DOMAIN}"`;
        }
        let basePairedRnaMoleculeIndex = basePair.rnaMoleculeIndex;
        let rnaComplex = App.Component.getCurrent().state.rnaComplexes[clickedOnNucleotide.props.rnaComplexIndex];
        let basePairedRnaMolecule = rnaComplex.props.rnaMolecules[basePairedRnaMoleculeIndex];
        let rnaMolecule = rnaComplex.props.rnaMolecules[clickedOnNucleotide.props.rnaMoleculeIndex];
        let foundClickedOnNucleotide = rnaMolecule.findNucleotideByIndex(clickedOnNucleotide.props.nucleotideIndex);
        let clickedOnNucleotideArrayIndex = foundClickedOnNucleotide.arrayIndex;
        let foundBasePairedNucleotide = rnaMolecule.findNucleotideByIndex(basePair.nucleotideIndex);
        let basePairedNucleotideArrayIndex = foundBasePairedNucleotide.arrayIndex;
        let basePairedNucleotide = foundBasePairedNucleotide.arrayEntry.nucleotideReference.current as Nucleotide.Component;
        let draggedNucleotides : Array<Nucleotide.Component> = [
          clickedOnNucleotide,
          basePairedNucleotide
        ];
        let arrayIndexDelta = getBasePairedNucleotideArrayIndexDelta(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex);
        if (arrayIndexDelta !== undefined) {
          appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex, 1, arrayIndexDelta, draggedNucleotides);
          appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex, -1, -arrayIndexDelta, draggedNucleotides);
          for (let i = 0; i < draggedNucleotides.length; i++) {
            let draggedNucleotide = draggedNucleotides[i];
            if (draggedNucleotide.props.rnaMoleculeIndex !== clickedOnNucleotide.props.rnaMoleculeIndex) {
              return `Inter-molecule base pairs detected. Cannot drag multiple RNA molecules using selection constraint "${RNA_SUB_DOMAIN}"`;
            }
          }
          draggedNucleotides.sort((draggedNucleotide0 : Nucleotide.Component, draggedNucleotide1 : Nucleotide.Component) => draggedNucleotide0.props.nucleotideIndex - draggedNucleotide1.props.nucleotideIndex);
          let greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex = draggedNucleotides[0].props.nucleotideIndex;
          for (let i = 1; i < draggedNucleotides.length; i++) {
            let nucleotideIndex = draggedNucleotides[i].props.nucleotideIndex;
            if (nucleotideIndex !== greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex + 1) {
              break;
            }
            greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex = nucleotideIndex;
          }
          let leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex = draggedNucleotides[draggedNucleotides.length - 1].props.nucleotideIndex;
          for (let i = draggedNucleotides.length - 2; i >= 0; i--) {
            let nucleotideIndex = draggedNucleotides[i].props.nucleotideIndex;
            if (nucleotideIndex !== leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex - 1) {
              break;
            }
            leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex = nucleotideIndex;
          }
          let startingArrayIndex = rnaMolecule.findNucleotideByIndex(greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex).arrayIndex + 1;
          let boundingArrayIndex = rnaMolecule.findNucleotideByIndex(leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex).arrayIndex;
          for (let arrayIndex = startingArrayIndex; arrayIndex < boundingArrayIndex; arrayIndex++) {
            let nucleotide = rnaMolecule.props.nucleotidesIndexMap[arrayIndex].nucleotideReference.current as Nucleotide.Component;
            draggedNucleotides.push(nucleotide);
          }
        }
        switch (returnType) {
          case ReturnType.DragListener:
            return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [RNA_CYCLE] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(_clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        switch (returnType) {
          case ReturnType.DragListener:
            return `Cannot drag nucleotides using selection constraint "${RNA_CYCLE}"`; 
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [RNA_MOLECULE] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        let draggedNucleotides = new Array<Nucleotide.Component>(); 
        let array = App.Component.getCurrent().state.rnaComplexes[clickedOnNucleotide.props.rnaComplexIndex].props.rnaMolecules[clickedOnNucleotide.props.rnaMoleculeIndex].props.nucleotidesIndexMap;
        for (let arrayIndex = 0; arrayIndex < array.length; arrayIndex++) {
          let nucleotide = array[arrayIndex].nucleotideReference.current as Nucleotide.Component;
          let basePair = nucleotide.state.basePair;
          if (basePair !== undefined && basePair.rnaMoleculeIndex !== clickedOnNucleotide.props.rnaMoleculeIndex) {
            return `Cannot drag an RNA molecule with bonds to other RNA molecules using selection constraint "${RNA_MOLECULE}"`;
          }
          draggedNucleotides.push(nucleotide);
        }
        switch (returnType) {
          case ReturnType.DragListener:
            return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [RNA_COMPLEX] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        let draggedNucleotides = new Array<Nucleotide.Component>();
        App.Component.getCurrent().state.rnaComplexes[clickedOnNucleotide.props.rnaComplexIndex].props.rnaMolecules.forEach((rnaMolecule : RnaMolecule.Component) => rnaMolecule.props.nucleotidesIndexMap.forEach((arrayEntry : RnaMolecule.ArrayEntry) => {
          let nucleotide = arrayEntry.nucleotideReference.current as Nucleotide.Component;
          draggedNucleotides.push(nucleotide);
        }));
        switch (returnType) {
          case ReturnType.DragListener:
            return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [PER_COLOR] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        let draggedNucleotides = new Array<Nucleotide.Component>();
        let rnaComplexes = App.Component.getCurrent().state.rnaComplexes;
        for (let rnaComplexIndex = 0; rnaComplexIndex < rnaComplexes.length; rnaComplexIndex++) {
          let rnaComplex = rnaComplexes[rnaComplexIndex];
          let rnaMolecules = rnaComplex.props.rnaMolecules;
          for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < rnaMolecules.length; rnaMoleculeIndex++) {
            let nucleotideData = rnaMolecules[rnaMoleculeIndex].props.nucleotidesIndexMap;
            for (let nucleotideArrayIndex = 0; nucleotideArrayIndex < nucleotideData.length; nucleotideArrayIndex++) {
              let nucleotide = nucleotideData[nucleotideArrayIndex].nucleotideReference.current as Nucleotide.Component;
              if (nucleotide.state.stroke.equals(clickedOnNucleotide.state.stroke)) {
                let basePair = nucleotide.state.basePair;
                if (basePair !== undefined && !(rnaComplex.props.rnaMolecules[basePair.rnaMoleculeIndex].props.nucleotidesIndexMap[basePair.nucleotideIndex].nucleotideReference.current as Nucleotide.Component).state.stroke.equals(clickedOnNucleotide.state.stroke)) {
                  return `Cannot drag a set of same-color nucleotides which contain base pairs to nucleotides with different colors using selection constraint "${PER_COLOR}"`;
                } else {
                  draggedNucleotides.push(nucleotide);
                }
              }
            }
          }
        }
        switch (returnType) {
          case ReturnType.DragListener:
            return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [CUSTOM_RANGE] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(_clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        switch (returnType) {
          case ReturnType.DragListener:
            return `Cannot drag nucleotides using selection constraint "${CUSTOM_RANGE}"`;
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [NAMED_GROUP] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        switch (returnType) {
          case ReturnType.DragListener:
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [LABELS_ONLY] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(_clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        switch (returnType) {
          case ReturnType.DragListener:
            return `Cannot drag nucleotides using selection constraint "${LABELS_ONLY}"`;
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [ENTIRE_SCENE] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(_clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        switch (returnType) {
          case ReturnType.DragListener:
            return `Cannot drag nucleotides using selection constraint "${ENTIRE_SCENE}"`;
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            throw "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    }
  };

  export type SelectionConstraintProps = {
    affectedNucleotides : Array<Nucleotide.Component>,
    ref : React.RefObject<SelectionConstraintComponent<any, any>>
  };

  export abstract class SelectionConstraintComponent<Props extends SelectionConstraintProps, State> extends React.Component<Props, State> {
    constructor(props : Props) {
      super(props);
      this.state = Object.assign({}, this.getInitialState());
    }

    public abstract getInitialState() : State

    public reset() : void {
      this.setState(this.getInitialState());
    }
  }

  namespace SingleNucleotide {
    export namespace Edit {
      export type Props = SelectionConstraintProps & {};

      export type State = {
        xAsString : string,
        yAsString : string
      };

      export class Component extends SelectionConstraintComponent<Props, State> {
        constructor(props : Props) {
          super(props);
        }

        public override getInitialState() {
          let nucleotide = this.props.affectedNucleotides[0];
          return {
            xAsString : nucleotide.state.position.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            yAsString : nucleotide.state.position.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
          };
        }

        public override render() {
          let nucleotide = this.props.affectedNucleotides[0];
          let rnaComplex = App.Component.getCurrent().state.rnaComplexes[nucleotide.props.rnaComplexIndex];
          let rnaMolecule = rnaComplex.props.rnaMolecules[nucleotide.props.rnaMoleculeIndex];
          let nucleotidesIndexMap = rnaMolecule.props.nucleotidesIndexMap;
          let foundNucleotide = rnaMolecule.findNucleotideByIndex(nucleotide.props.nucleotideIndex);
          let arrayIndex = foundNucleotide.arrayIndex;
          let distanceJsxElements = new Array<JSX.Element>();
          if (foundNucleotide.arrayIndex > 0) {
            let previousNucleotide = nucleotidesIndexMap[arrayIndex - 1].nucleotideReference.current as Nucleotide.Component;
            distanceJsxElements.push(<React.Fragment
              key = {0}
            >
              {`Distance to previous nucleotide: ${Vector2D.distance(nucleotide.state.position, previousNucleotide.state.position).toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)}`}
              <br/>
            </React.Fragment>);
          }
          if (foundNucleotide.arrayIndex < nucleotidesIndexMap.length - 1) {
            let nextNucleotide = nucleotidesIndexMap[arrayIndex + 1].nucleotideReference.current as Nucleotide.Component;
            distanceJsxElements.push(<React.Fragment
              key = {1}
            >
              {`Distance to next nucleotide: ${Vector2D.distance(nucleotide.state.position, nextNucleotide.state.position).toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)}`}
              <br/>
            </React.Fragment>);
          }
          return <>
            <b>
              Edit single nucleotide:
            </b>
            <br/>
            {`Nucleotide #${nucleotide.props.nucleotideIndex + rnaMolecule.props.firstNucleotideIndex} (${nucleotide.props.symbol})`}
            <br/>
            {`In RNA molecule "${rnaMolecule.props.name}"`}
            <br/>
            {`In RNA complex "${rnaComplex.props.name}"`}
            <br/>
            {distanceJsxElements}
            <label>
              x:&nbsp;
              <input
                type = "number"
                step = {0.5}
                value = {this.state.xAsString}
                onChange = {event => {
                  nucleotide.state.position.x = Number.parseFloat(event.target.value);
                  nucleotide.setState({
                    // No other changes.
                  });
                  this.setState({
                    xAsString : event.target.value
                  });
                }}
              />
            </label>
            <br/>
            <label>
              y:&nbsp;
              <input
                type = "number"
                step = {0.5}
                value = {this.state.yAsString}
                onChange = {event => {
                  nucleotide.state.position.y = Number.parseFloat(event.target.value);
                  nucleotide.setState({
                    // No other changes.
                  });
                  this.setState({
                    yAsString : event.target.value
                  });
                }}
              />
            </label>
            <br/>
          </>;
        }
      }
    }
  }

  type NucleotideTransformationData = {
    nucleotide : Nucleotide.Component,
    additionalRotation : number,
    additionalRadiusScale : number
  };

  namespace SingleBasePair {
    export namespace Edit {
      export type Props = SelectionConstraintProps & {
        indexOfClickedOnNucleotide : number,
        indexOfBasePairedNucleotide : number
      };

      export type State = {
        app : App.Component,
        clickedOnNucleotide : Nucleotide.Component,
        basePairedNucleotide : Nucleotide.Component,
        nucleotideTransformationData : Array<NucleotideTransformationData>,
        centerX : number,
        centerY : number,
        // Exclusively use radians for the internal angle value.
        // Convert to and from degrees when interacting with UI if necessary.
        angle : number,
        radius : number,
        scale : number,
        centerXAsString : string,
        centerYAsString : string,
        angleAsString : string,
        scaleAsString : string;
      };

      export class Component extends SelectionConstraintComponent<Props, State> {
        constructor(props : Props) {
          super(props);
        }

        public override getInitialState() {
          let app = App.Component.getCurrent();
          let clickedOnNucleotide = this.props.affectedNucleotides[this.props.indexOfClickedOnNucleotide];
          let basePairedNucleotide = this.props.affectedNucleotides[this.props.indexOfBasePairedNucleotide];
          let center = Vector2D.scaleUp(Vector2D.add(clickedOnNucleotide.state.position, basePairedNucleotide.state.position), 0.5);
          let conventionalDifference = Vector2D.subtract(clickedOnNucleotide.state.position, basePairedNucleotide.state.position);
          if (clickedOnNucleotide.isGreaterIndexInBasePair(clickedOnNucleotide.state.basePair as Nucleotide.BasePair)) {
            conventionalDifference = Vector2D.negate(conventionalDifference);
          }
          let asPolar = Vector2D.toPolar(conventionalDifference);
          // Correct angle to adhere to convention (90-degree turn clockwise).
          asPolar.angle -= Math.PI * 0.5;
          let oneOverBasePairDistance = 1 / asPolar.radius;
          let nucleotideTransformationData = this.props.affectedNucleotides.map((nucleotide : Nucleotide.Component) => {
            let positionDifference = Vector2D.subtract(nucleotide.state.position, center);
            let angle = Math.atan2(positionDifference.y, positionDifference.x);
            return {
              nucleotide,
              additionalRotation : angle - asPolar.angle,
              additionalRadiusScale : Vector2D.magnitude(positionDifference) * oneOverBasePairDistance
            };
          });
          let angleForString = asPolar.angle;
          if (app.state.useDegreesFlag) {
            angleForString = Utils.radiansToDegrees(angleForString);
          }
          let scale = 1;
          return {
            app,
            clickedOnNucleotide,
            basePairedNucleotide,
            nucleotideTransformationData,
            centerX : center.x,
            centerY : center.y,
            angle : asPolar.angle,
            radius : asPolar.radius,
            scale,
            centerXAsString : center.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            centerYAsString : center.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            angleAsString : angleForString.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            scaleAsString : scale.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
          };
        }

        public override reset() {
          let scale = this.state.scale;
          let state = Object.assign(this.getInitialState(), {
            scale,
            scaleAsString : scale.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
          });
          state.radius = Utils.areEqual(scale, 0) ? 0 : state.radius / scale;
          this.setState(state);
        }

        public override render() {
          let nucleotide = this.state.clickedOnNucleotide;
          let rnaComplex = this.state.app.state.rnaComplexes[nucleotide.props.rnaComplexIndex];
          let rnaMolecule = rnaComplex.props.rnaMolecules[nucleotide.props.rnaMoleculeIndex];
          let basePairedNucleotide = this.state.basePairedNucleotide;
          let basePairedRnaMolecule = rnaComplex.props.rnaMolecules[basePairedNucleotide.props.rnaMoleculeIndex];
          let getNewPositions = (centerX : number, centerY : number, radius : number, orientationAngle : number, scale : number) => {
            return this.state.nucleotideTransformationData.map((nucleotideTransformationDatum : NucleotideTransformationData) => {
              let angle = orientationAngle + nucleotideTransformationDatum.additionalRotation;
              return Vector2D.add(new Vector2D(centerX, centerY), Vector2D.toCartesian(angle, radius * scale * nucleotideTransformationDatum.additionalRadiusScale));
            });
          };
          let repositionNucleotides = (newPositions : Array<Vector2D>) => {
            for (let i = 0; i < newPositions.length; i++) {
              this.state.nucleotideTransformationData[i].nucleotide.setState({
                position : newPositions[i]
              });
            }
          };
          let repositionNucleotidesAndBasePair = (newPositions : Array<Vector2D>) => {
            repositionNucleotides(newPositions);
            // The base pair jsx belongs to only one nucleotide, but checking which first would be inefficient.
            let clickedOnNucleotidePosition = newPositions[this.props.indexOfClickedOnNucleotide];
            let basePairedNucleotidePosition = newPositions[this.props.indexOfBasePairedNucleotide];
            if (this.state.clickedOnNucleotide.state.basePairJsx !== undefined) {
              this.state.clickedOnNucleotide.updateBasePairJsx(clickedOnNucleotidePosition, basePairedNucleotidePosition);
            }
            if (this.state.basePairedNucleotide.state.basePairJsx !== undefined) {
              this.state.basePairedNucleotide.updateBasePairJsx(basePairedNucleotidePosition, clickedOnNucleotidePosition);
            }
          };
          return <>
            <b>
              Edit single base pair:
            </b>
            <br/>
            {`Nucleotide #${rnaMolecule.props.firstNucleotideIndex + nucleotide.props.nucleotideIndex} (${nucleotide.props.symbol})`}
            <br/>
            {`In RNA molecule "${rnaMolecule.props.name}"`}
            <br/>
            {"Base-paried to:"}
            <br/>
            {`Nucleotide #${basePairedRnaMolecule.props.firstNucleotideIndex + basePairedNucleotide.props.nucleotideIndex} (${basePairedNucleotide.props.symbol})`}
            <br/>
            {`In RNA molecule "${basePairedRnaMolecule.props.name}"`}
            <br/>
            {`In RNA complex "${rnaComplex.props.name}"`}
            <br/>
            {`Base-pair type: "${[(nucleotide.state.basePair as Nucleotide.BasePair).type]}"`}
            <br/>
            <b>
              Center position:
            </b>
            <br/>
            <label>
              x:&nbsp;
              <input
                type = "number"
                step = {0.5}
                value = {this.state.centerXAsString}
                onChange = {event => {
                  this.setState({
                    centerXAsString : event.target.value
                  });
                  let newCenterX = Number.parseFloat(event.target.value);
                  if (Number.isNaN(newCenterX)) {
                    return;
                  }
                  this.setState({
                    centerX : newCenterX
                  });
                  repositionNucleotides(getNewPositions(newCenterX, this.state.centerY, this.state.radius, this.state.angle, this.state.scale));
                }}
              />
            </label>
            <br/>
            <label>
              y:&nbsp;
              <input
                type = "number"
                step = {0.5}
                value = {this.state.centerYAsString}
                onChange = {event => {
                  this.setState({
                    centerYAsString : event.target.value
                  });
                  let newCenterY = Number.parseFloat(event.target.value);
                  if (Number.isNaN(newCenterY)) {
                    return;
                  }
                  this.setState({
                    centerY : newCenterY
                  });
                  repositionNucleotides(getNewPositions(this.state.centerX, newCenterY, this.state.radius, this.state.angle, this.state.scale));
                }}
              />
            </label>
            <br/>
            <label>
              θ:&nbsp;
              <input
                type = "number"
                // 1 degree in radians === 0.01745329251
                step = {this.state.app.state.useDegreesFlag ? 1 : 0.01745329251}
                value = {this.state.angleAsString}
                onChange = {event => {
                  this.setState({
                    angleAsString : event.target.value
                  });
                  let newAngle = Number.parseFloat(event.target.value);
                  if (Number.isNaN(newAngle)) {
                    return;
                  }
                  if (this.state.app.state.useDegreesFlag) {
                    newAngle = Utils.degreesToRadians(newAngle);
                  }
                  this.setState({
                    angle : newAngle
                  });
                  repositionNucleotidesAndBasePair(getNewPositions(this.state.centerX, this.state.centerY, this.state.radius, newAngle, this.state.scale));
                }}
              />
            </label>
            {this.state.app.state.useDegreesFlag ? "°" : "radians"}
            <br/>
            <label>
              scale:&nbsp;
              <input
                type = "number"
                step = {0.1}
                value = {this.state.scaleAsString}
                onChange = {event => {
                  this.setState({
                    scaleAsString : event.target.value
                  });
                  let newScale = Number.parseFloat(event.target.value);
                  if (Number.isNaN(newScale)) {
                    return;
                  }
                  this.setState({
                    scale : newScale
                  });
                  repositionNucleotidesAndBasePair(getNewPositions(this.state.centerX, this.state.centerY, this.state.radius, this.state.angle, newScale));
                }}
              />
            </label>
            <br/>
            <button
              onClick = {() => {
                let normalDirection = Vector2D.toNormalCartesian(this.state.angle);
                let center = new Vector2D(this.state.centerX, this.state.centerY);
                repositionNucleotidesAndBasePair(this.state.nucleotideTransformationData.map((nucleotideTransformationData : NucleotideTransformationData) => {
                  let currentPosition = Vector2D.subtract(nucleotideTransformationData.nucleotide.state.position, center);
                  let transformedPosition = Vector2D.add(currentPosition, Vector2D.scaleUp(Vector2D.projectUsingNormalDirection(currentPosition, normalDirection), -2));
                  nucleotideTransformationData.additionalRotation = Vector2D.asAngle(transformedPosition) - this.state.angle;
                  return Vector2D.add(center, transformedPosition);
                }));
              }}
            >
              Flip
            </button>
          </>;
        }
      }
    }
  }

  namespace SingleStrand {
    export namespace Edit {
      export type Props = SelectionConstraintProps & {
        
      };

      export type State = {};

      export class Component extends SelectionConstraintComponent<Props, State> {
        constructor(props : Props) {
          super(props);
        }

        public override getInitialState() {
          return {};
        }

        public override render() {
          return "Not yet implemented.";
        }
      }
    }
  }
}