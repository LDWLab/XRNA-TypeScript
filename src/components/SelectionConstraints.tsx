import React from "react";
import { App, DEFAULT_TRANSLATION_MAGNITUDE, FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT } from "../App";
import { Nucleotide } from "../components/Nucleotide";
import { findNucleotideReferenceByIndex, RnaMolecule } from "../components/RnaMolecule";
import { RnaComplex } from "../components/RnaComplex";
import { AngleEditor } from "../components/AngleEditor";
import { areEqual } from "../data_structures/Color";
import Vector2D from "../data_structures/Vector2D";
import { Circle, Geometry } from "../utils/Geometry";
import { Utils } from "../utils/Utils";

export namespace SelectionConstraint {
  enum ReturnType {
    DragListener,
    EditJsxElement,
    FormatJsxElement,
    AnnotateJsxElement
  }

  const interactionVerbsMap : Record<ReturnType, string> = {
    [ReturnType.DragListener] : "drag",
    [ReturnType.AnnotateJsxElement] : "annotate",
    [ReturnType.EditJsxElement] : "edit",
    [ReturnType.FormatJsxElement] : "format"
  };

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
    if (nucleotideArrayIndex + 1 < rnaMolecule.state.nucleotideReferences.length) {
      let currentNucleotide = rnaMolecule.state.nucleotideReferences[nucleotideArrayIndex + 1].current as Nucleotide.Component;
      let currentBasePair = currentNucleotide.state.basePair;
      if (currentBasePair !== undefined && currentBasePair.rnaMoleculeIndex === basePairedRnaMoleculeIndex) {
        let basePairedNucleotideArrayIndexDeltaCandidate = findNucleotideReferenceByIndex(basePairedRnaMolecule, currentBasePair.nucleotideIndex).arrayIndex - basePairedNucleotideArrayIndex;
        if (Math.abs(basePairedNucleotideArrayIndexDeltaCandidate) === 1) {
          basePairedNucleotideArrayIndexDelta = basePairedNucleotideArrayIndexDeltaCandidate;
        }
      }
    }
    if (basePairedNucleotideArrayIndexDelta === undefined && nucleotideArrayIndex > 0) {
      let currentNucleotide = rnaMolecule.state.nucleotideReferences[nucleotideArrayIndex - 1].current as Nucleotide.Component;
      let currentBasePair = currentNucleotide.state.basePair;
      if (currentBasePair !== undefined && currentBasePair.rnaMoleculeIndex === basePairedRnaMoleculeIndex) {
        let basePairedNucleotideArrayIndexDeltaCandidate = basePairedNucleotideArrayIndex - findNucleotideReferenceByIndex(basePairedRnaMolecule, currentBasePair.nucleotideIndex).arrayIndex;
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
    while (nucleotideArrayIndex < rnaMolecule.state.nucleotideReferences.length && basePairedNucleotideArrayIndex >= 0 && basePairedNucleotideArrayIndex < basePairedRnaMolecule.state.nucleotideReferences.length) {
      let currentNucleotide = rnaMolecule.state.nucleotideReferences[nucleotideArrayIndex].current as Nucleotide.Component;
      let basePair = currentNucleotide.state.basePair;
      if (basePair === undefined || basePair.rnaMoleculeIndex !== basePairedRnaMoleculeIndex) {
        break;
      }
      let basePairedNucleotide = basePairedRnaMolecule.state.nucleotideReferences[basePairedNucleotideArrayIndex].current as Nucleotide.Component;
      if (basePairedNucleotide.props.nucleotideIndex !== basePair.nucleotideIndex) {
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
              return "Not yet implemented.";
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
          let rnaMolecule = rnaComplex.state.rnaMoleculeReferences[clickedOnNucleotide.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          let nucleotideArrayIndex = findNucleotideReferenceByIndex(rnaMolecule, clickedOnNucleotide.props.nucleotideIndex).arrayIndex;
          let basePairedRnaMolecule = rnaComplex.state.rnaMoleculeReferences[basePair.rnaMoleculeIndex].current as RnaMolecule.Component;
          let foundBasePairedNucleotide = findNucleotideReferenceByIndex(basePairedRnaMolecule, basePair.nucleotideIndex);
          let basePairedNucleotide = foundBasePairedNucleotide.reference.current as Nucleotide.Component;
          let basePairedNucleotideArrayIndex = foundBasePairedNucleotide.arrayIndex;
          let isNotConsecutivelyBasePaired = (nucleotide : Nucleotide.Component) => {
            return nucleotide.state.basePair === undefined || nucleotide.state.basePair.rnaMoleculeIndex !== basePair.rnaMoleculeIndex || Math.abs(nucleotide.state.basePair.nucleotideIndex - basePair.nucleotideIndex) > 1;
          };
          if ((nucleotideArrayIndex == 0 || isNotConsecutivelyBasePaired(rnaMolecule.state.nucleotideReferences[nucleotideArrayIndex - 1].current as Nucleotide.Component)) && (nucleotideArrayIndex == rnaMolecule.state.nucleotideReferences.length - 1 || isNotConsecutivelyBasePaired(rnaMolecule.state.nucleotideReferences[nucleotideArrayIndex + 1].current as Nucleotide.Component))) {
            let draggedNucleotides : Array<Nucleotide.Component> = [
              clickedOnNucleotide,
              basePairedNucleotide
            ];
            let inBetweenNucleotides : Array<Nucleotide.Component> = [];
            if (clickedOnNucleotide.props.rnaMoleculeIndex === basePair.rnaMoleculeIndex) {
              let singleStrandedInteriorFlag = true;
              for (let arrayIndex = Math.min(nucleotideArrayIndex, basePairedNucleotideArrayIndex) + 1; arrayIndex < Math.max(nucleotideArrayIndex, basePairedNucleotideArrayIndex); arrayIndex++) {
                let nucleotide = rnaMolecule.state.nucleotideReferences[arrayIndex].current as Nucleotide.Component;
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
                    indexOfBoundingNucleotide0 = {0}
                    indexOfBoundingNucleotide1 = {1}
                  />
                };
              case ReturnType.FormatJsxElement:
              case ReturnType.AnnotateJsxElement:
                return "Not yet implemented.";
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
          let rnaMolecule = App.Component.getCurrent().state.rnaComplexes[clickedOnNucleotide.props.rnaComplexIndex].state.rnaMoleculeReferences[clickedOnNucleotide.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          let nucleotidesData = rnaMolecule.state.nucleotideReferences;
          let clickedOnNucleotideArrayIndex = findNucleotideReferenceByIndex(rnaMolecule, clickedOnNucleotide.props.nucleotideIndex).arrayIndex;
          let lowerBoundingNucleotideArrayIndex = clickedOnNucleotideArrayIndex;
          for (let arrayIndex = clickedOnNucleotideArrayIndex - 1; arrayIndex >= 0; arrayIndex--) {
            lowerBoundingNucleotideArrayIndex = arrayIndex;
            if ((nucleotidesData[arrayIndex].current as Nucleotide.Component).state.basePair !== undefined) {
              break;
            }
          }
          if (clickedOnNucleotideArrayIndex === nucleotidesData.length - 1) {
            let arrayIndex = clickedOnNucleotideArrayIndex;
            let draggedNucleotides = new Array<Nucleotide.Component>();
            do {
              draggedNucleotides.push(nucleotidesData[arrayIndex].current as Nucleotide.Component);
              arrayIndex--;
            } while (arrayIndex > lowerBoundingNucleotideArrayIndex);
            let interpolationFactorDelta = 1 / draggedNucleotides.length;
            let lowerBoundingNucleotide = nucleotidesData[lowerBoundingNucleotideArrayIndex].current as Nucleotide.Component;
            let repositionNucleotidesHelper = (newClickedOnNucleotidePosition : Vector2D) =>{
              let positionDelta = Vector2D.scaleUp(Vector2D.subtract(lowerBoundingNucleotide.state.position, newClickedOnNucleotidePosition), interpolationFactorDelta);
              let position = newClickedOnNucleotidePosition;
              draggedNucleotides.forEach((draggedNucleotide : Nucleotide.Component) => {
                draggedNucleotide.setState({
                  position
                });
                position = Vector2D.add(position, positionDelta);
              });
            };
            switch (returnType) {
              case ReturnType.DragListener:
                return {
                  isWindowDragListenerFlag : false,
                  initiateDrag() {
                    return clickedOnNucleotide.state.position;
                  },
                  drag : repositionNucleotidesHelper,
                  terminateDrag() {
                    
                  },
                  affectedNucleotides : draggedNucleotides
                };
              case ReturnType.EditJsxElement:
                let ref = React.createRef<SingleStrand.Edit.Terminal.Component>();
                return {
                  ref,
                  content : <SingleStrand.Edit.Terminal.Component
                    ref = {ref}
                    affectedNucleotides = {draggedNucleotides}
                    indexOfClickedOnNucleotide = {0}
                    repositionNucleotidesHelper = {repositionNucleotidesHelper}
                    threePrimeOrFivePrimeLabel = "3'"
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
            if ((nucleotidesData[arrayIndex].current as Nucleotide.Component).state.basePair !== undefined) {
              break;
            }
          }
          if (clickedOnNucleotideArrayIndex === 0) {
            let arrayIndex = clickedOnNucleotideArrayIndex;
            let draggedNucleotides = new Array<Nucleotide.Component>();
            do {
              draggedNucleotides.push(nucleotidesData[arrayIndex].current as Nucleotide.Component);
              arrayIndex++;
            } while (arrayIndex < upperBoundingNucleotideArrayIndex);
            let interpolationFactorDelta = 1 / draggedNucleotides.length;
            let upperBoundingNucleotide = nucleotidesData[upperBoundingNucleotideArrayIndex].current as Nucleotide.Component;
            let repositionNucleotidesHelper = (clickedOnNucleotidePosition : Vector2D) => {
              let positionDelta = Vector2D.scaleUp(Vector2D.subtract(upperBoundingNucleotide.state.position, clickedOnNucleotidePosition), interpolationFactorDelta);
              let position = clickedOnNucleotidePosition;
              draggedNucleotides.forEach((draggedNucleotide : Nucleotide.Component) => {
                draggedNucleotide.setState({
                  position
                });
                position = Vector2D.add(position, positionDelta);
              });
            };
            switch (returnType) {
              case ReturnType.DragListener:
                return {
                  isWindowDragListenerFlag : false,
                  initiateDrag() {
                    return clickedOnNucleotide.state.position;
                  },
                  drag : repositionNucleotidesHelper,
                  terminateDrag() {
                    // Do nothing.
                  },
                  affectedNucleotides : draggedNucleotides
                };
              case ReturnType.EditJsxElement:
                let ref = React.createRef<SingleStrand.Edit.Terminal.Component>();
                return {
                  ref,
                  content : <SingleStrand.Edit.Terminal.Component
                    ref = {ref}
                    affectedNucleotides = {draggedNucleotides}
                    indexOfClickedOnNucleotide = {0}
                    repositionNucleotidesHelper = {repositionNucleotidesHelper}
                    threePrimeOrFivePrimeLabel = "5'"
                  />
                };
              case ReturnType.FormatJsxElement:
                return "Not yet implemented.";
              default:
                throw "Unrecognized ReturnType.";
            }
          }
          let lowerBoundingNucleotide = (nucleotidesData[lowerBoundingNucleotideArrayIndex].current as Nucleotide.Component);
          let upperBoundingNucleotide = (nucleotidesData[upperBoundingNucleotideArrayIndex].current as Nucleotide.Component);
          let twoPi = 2 * Math.PI;
          let draggedNucleotides = new Array<Nucleotide.Component>();
          for (let nucleotideArrayIndex = lowerBoundingNucleotideArrayIndex + 1; nucleotideArrayIndex < upperBoundingNucleotideArrayIndex; nucleotideArrayIndex++) {
            draggedNucleotides.push(nucleotidesData[nucleotideArrayIndex].current as Nucleotide.Component);
          }
          let repositionNucleotidesHelper = (repositioningData : SingleStrand.Edit.Internal.RepositioningData) => {
            let angleDelta = repositioningData.angleTraversal / (upperBoundingNucleotideArrayIndex - lowerBoundingNucleotideArrayIndex);
            let angle = repositioningData.beginningAngle + angleDelta;
            draggedNucleotides.forEach((draggedNucleotide : Nucleotide.Component) => {
              draggedNucleotide.setState({
                position : Vector2D.add(repositioningData.boundingCircle.center, Vector2D.toCartesian(angle, repositioningData.boundingCircle.radius))
              });
              angle += angleDelta;
            });
          };
          let flipAngleTraversalHelper = (angleTraversal : number) => {
            if (angleTraversal < 0) {
              return angleTraversal + twoPi;
            } else {
              return angleTraversal - twoPi;
            }
          };
          let getBeginningAngleAndAngleTraversalHelper = (boundingCircleCenter : Vector2D, flipAngleTraversalCondition : (angleTraversal : number) => boolean) => {
            let lowerBoundingNucleotidePositionDifference = Vector2D.subtract(lowerBoundingNucleotide.state.position, boundingCircleCenter);
            let upperBoundingNucleotidePositionDifference = Vector2D.subtract(upperBoundingNucleotide.state.position, boundingCircleCenter);
            let beginningAngle = Vector2D.asAngle(lowerBoundingNucleotidePositionDifference);
            let endingAngle = Vector2D.asAngle(upperBoundingNucleotidePositionDifference);
            let angleTraversal = (endingAngle - beginningAngle + twoPi) % twoPi;
            if (flipAngleTraversalCondition(angleTraversal)) {
              angleTraversal = flipAngleTraversalHelper(angleTraversal);
            }
            return {
              beginningAngle,
              angleTraversal 
            };
          };
          let calculateRepositioningData = (clickedOnNucleotidePosition : Vector2D, flipAngleTraversalCondition : () => boolean) => {
            let boundingCircle = Geometry.getBoundingCircle(clickedOnNucleotidePosition, lowerBoundingNucleotide.state.position, upperBoundingNucleotide.state.position);
            return Object.assign(getBeginningAngleAndAngleTraversalHelper(boundingCircle.center, flipAngleTraversalCondition), {
              boundingCircle
            }) as SingleStrand.Edit.Internal.RepositioningData;
          };
          let flipAngleTraversalCondition = (clickedOnNucleotidePosition : Vector2D) => {
            return Utils.sign(Vector2D.crossProduct(Vector2D.subtract(clickedOnNucleotidePosition, lowerBoundingNucleotide.state.position), Vector2D.subtract(upperBoundingNucleotide.state.position, lowerBoundingNucleotide.state.position))) < 0;
          };
          switch (returnType) {
            case ReturnType.DragListener:
              return {
                isWindowDragListenerFlag : false,
                initiateDrag() {
                  return clickedOnNucleotide.state.position;
                },
                drag : (totalDrag : Vector2D) => {
                  repositionNucleotidesHelper(calculateRepositioningData(totalDrag, () => flipAngleTraversalCondition(totalDrag)));
                },
                terminateDrag() {
                  // Do nothing.
                },
                affectedNucleotides : draggedNucleotides
              };
            case ReturnType.EditJsxElement:
              let ref = React.createRef<SingleStrand.Edit.Internal.Component>()
              return {
                ref,
                content : <SingleStrand.Edit.Internal.Component
                  ref = {ref}
                  affectedNucleotides = {[...draggedNucleotides, lowerBoundingNucleotide, upperBoundingNucleotide]}
                  getBeginningAngleAndAngleTraversalHelper = {getBeginningAngleAndAngleTraversalHelper}
                  flipAngleTraversalHelper = {flipAngleTraversalHelper}
                  repositionNucleotidesHelper = {repositionNucleotidesHelper}
                  indexOfFivePrimeNucleotide = {draggedNucleotides.length}
                  indexOfThreePrimeNucleotide = {draggedNucleotides.length + 1}
                  normal = {Vector2D.normalize(Vector2D.orthogonalizeRight(Vector2D.subtract(upperBoundingNucleotide.state.position, lowerBoundingNucleotide.state.position)))}
                  boundingNucleotidesCenter = {Vector2D.scaleUp(Vector2D.add(lowerBoundingNucleotide.state.position, upperBoundingNucleotide.state.position), 0.5)}
                />
              };
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
        let rnaMolecule = rnaComplex.state.rnaMoleculeReferences[clickedOnNucleotide.props.rnaMoleculeIndex].current as RnaMolecule.Component;
        let basePairedRnaMoleculeIndex = basePair.rnaMoleculeIndex;
        let basePairedRnaMolecule = rnaComplex.state.rnaMoleculeReferences[basePair.rnaMoleculeIndex].current as RnaMolecule.Component;
        let basePairedNucleotideArrayIndex = findNucleotideReferenceByIndex(basePairedRnaMolecule, basePair.nucleotideIndex).arrayIndex;
        let clickedOnNucleotideArrayIndex = findNucleotideReferenceByIndex(rnaMolecule, clickedOnNucleotide.props.nucleotideIndex).arrayIndex;
        let basePairedNucleotideArrayIndexDelta : number | undefined = getBasePairedNucleotideArrayIndexDelta(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex);
        let basePairedNucleotide = basePairedRnaMolecule.state.nucleotideReferences[basePairedNucleotideArrayIndex].current as Nucleotide.Component;
        let draggedNucleotides : Array<Nucleotide.Component> = [
          clickedOnNucleotide,
          basePairedNucleotide
        ];
        let indexOfBoundingNucleotide0 : number;
        let indexOfBoundingNucleotide1 : number;
        let indexOfBoundingNucleotide2 : number;
        let indexOfBoundingNucleotide3 : number;
        if (basePairedNucleotideArrayIndexDelta === undefined) {
          // Implies the base pair is isolated.
          indexOfBoundingNucleotide0 = 0;
          indexOfBoundingNucleotide1 = 1;
          indexOfBoundingNucleotide2 = 0;
          indexOfBoundingNucleotide3 = 1;
        } else {
          appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex, 1, basePairedNucleotideArrayIndexDelta, draggedNucleotides);
          indexOfBoundingNucleotide0 = draggedNucleotides.length - 1;
          indexOfBoundingNucleotide1 = draggedNucleotides.length - 2;
          appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex, -1, -basePairedNucleotideArrayIndexDelta, draggedNucleotides);
          indexOfBoundingNucleotide2 = draggedNucleotides.length - 1;
          indexOfBoundingNucleotide3 = draggedNucleotides.length - 2;
          if (clickedOnNucleotide.props.rnaMoleculeIndex === basePairedRnaMoleculeIndex) {
            // Intramolecular helix.
            let sortedDraggedNucleotides = [...draggedNucleotides];
            sortedDraggedNucleotides.sort((draggedNucleotide0 : Nucleotide.Component, draggedNucleotide1 : Nucleotide.Component) => draggedNucleotide0.props.nucleotideIndex - draggedNucleotide1.props.nucleotideIndex);
            let greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex = sortedDraggedNucleotides[0].props.nucleotideIndex;
            for (let i = 1; i < sortedDraggedNucleotides.length; i++) {
              let nucleotideIndex = sortedDraggedNucleotides[i].props.nucleotideIndex;
              if (nucleotideIndex !== greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex + 1) {
                break;
              }
              greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex = nucleotideIndex;
            }
            let leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex = sortedDraggedNucleotides[sortedDraggedNucleotides.length - 1].props.nucleotideIndex;
            for (let i = sortedDraggedNucleotides.length - 2; i >= 0; i--) {
              let nucleotideIndex = sortedDraggedNucleotides[i].props.nucleotideIndex;
              if (nucleotideIndex !== leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex - 1) {
                break;
              }
              leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex = nucleotideIndex;
            }
            let partialDraggedNucleotides = new Array<Nucleotide.Component>();
            let freeNucleotidesOnlyFlag = true;
            let startingArrayIndex = findNucleotideReferenceByIndex(rnaMolecule, greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex).arrayIndex + 1;
            let boundingArrayIndex = findNucleotideReferenceByIndex(rnaMolecule, leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex).arrayIndex;
            for (let arrayIndex = startingArrayIndex; arrayIndex < boundingArrayIndex; arrayIndex++) {
              let nucleotide = rnaMolecule.state.nucleotideReferences[arrayIndex].current as Nucleotide.Component;
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
            let ref = React.createRef<SingleHelix.Edit.Component>();
            return {
              ref,
              content : <SingleHelix.Edit.Component
                ref = {ref}
                affectedNucleotides = {draggedNucleotides}
                indexOfBoundingNucleotide0 = {indexOfBoundingNucleotide0}
                indexOfBoundingNucleotide1 = {indexOfBoundingNucleotide1}
                indexOfBoundingNucleotide2 = {indexOfBoundingNucleotide2}
                indexOfBoundingNucleotide3 = {indexOfBoundingNucleotide3}
              />
            };
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            return "Not yet implemented.";
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
        let rnaMolecule = rnaComplex.state.rnaMoleculeReferences[rnaMoleculeIndex].current as RnaMolecule.Component;
        let foundClickedOnNucleotide = findNucleotideReferenceByIndex(rnaMolecule, clickedOnNucleotide.props.nucleotideIndex);
        let basePairedRnaMoleculeIndex = basePair.rnaMoleculeIndex;
        let basePairedRnaMolecule = rnaComplex.state.rnaMoleculeReferences[basePairedRnaMoleculeIndex].current as RnaMolecule.Component;
        let foundBasePairedNucleotide = findNucleotideReferenceByIndex(basePairedRnaMolecule, basePair.nucleotideIndex);
        let basePairedNucleotide = foundBasePairedNucleotide.reference.current as Nucleotide.Component;
        let draggedNucleotides : Array<Nucleotide.Component> = [
          clickedOnNucleotide,
          basePairedNucleotide
        ];
        let clickedOnNucleotideArrayIndex = foundClickedOnNucleotide.arrayIndex;
        let basePairedNucleotideArrayIndex = foundBasePairedNucleotide.arrayIndex;
        let basePairedNucleotideArrayIndexDelta = getBasePairedNucleotideArrayIndexDelta(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex);
        let indexOfBoundingNucleotide0 : number = 0;
        let indexOfBoundingNucleotide1 : number = 1;
        let indexOfBoundingNucleotide2 : number = 0;
        let indexOfBoundingNucleotide3 : number = 1;
        if (basePairedNucleotideArrayIndexDelta !== undefined) {
          let maximumNucleotideArrayIndices = appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex, 1, basePairedNucleotideArrayIndexDelta, draggedNucleotides);
          let minimumNucleotideArrayIndices = appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex, -1, -basePairedNucleotideArrayIndexDelta, draggedNucleotides);
          let iterateAcrossHelices = (nucleotideArrayIndices : {nucleotideArrayIndex : number, basePairedNucleotideArrayIndex : number}, nucleotideArrayIndexDelta : number, basePairedNucleotideArrayIndexDelta : number, setIndicesOfNucleotidesHelper : (indexOfNucleotide : number, indexOfBasePairedNucleotide : number) => void) => {
            outer: while (true) {
              let freeNucleotides = new Array<Nucleotide.Component>();
              let nucleotideArrayIndicesOutOfBoundsFlag = false;
              let nucleotideArrayIndex = nucleotideArrayIndices.nucleotideArrayIndex;
              inner: for (; ; nucleotideArrayIndex += nucleotideArrayIndexDelta) {
                if (nucleotideArrayIndex < 0 || nucleotideArrayIndex >= rnaMolecule.state.nucleotideReferences.length) {
                  nucleotideArrayIndicesOutOfBoundsFlag = true;
                  break inner;
                }
                let nucleotide = rnaMolecule.state.nucleotideReferences[nucleotideArrayIndex].current as Nucleotide.Component;
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
                if (basePairedNucleotideArrayIndex < 0 || basePairedNucleotideArrayIndex >= basePairedRnaMolecule.state.nucleotideReferences.length) {
                  nucleotideArrayIndicesOutOfBoundsFlag = true;
                  break inner;
                }
                let basePairedNucleotide = basePairedRnaMolecule.state.nucleotideReferences[basePairedNucleotideArrayIndex].current as Nucleotide.Component;
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
              let nucleotide = (rnaMolecule.state.nucleotideReferences[nucleotideArrayIndex].current as Nucleotide.Component);
              let basePair = nucleotide.state.basePair;
              let basePairedNucleotide = basePairedRnaMolecule.state.nucleotideReferences[basePairedNucleotideArrayIndex].current as Nucleotide.Component;
              if ((basePair as Nucleotide.BasePair).nucleotideIndex !== basePairedNucleotide.props.nucleotideIndex) {
                break outer;
              }
              draggedNucleotides.push(
                nucleotide,
                basePairedNucleotide
              );
              let draggedNucleotidesLength = draggedNucleotides.length;
              setIndicesOfNucleotidesHelper(draggedNucleotidesLength - 2, draggedNucleotidesLength - 1);
              draggedNucleotides.push(
                ...freeNucleotides
              );
              if (nucleotideArrayIndex === nucleotideArrayIndices.basePairedNucleotideArrayIndex - basePairedNucleotideArrayIndexDelta) {
                break outer;
              }
              nucleotideArrayIndices = appendDraggedNucleotides(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, nucleotideArrayIndex, basePairedNucleotideArrayIndex, nucleotideArrayIndexDelta, basePairedNucleotideArrayIndexDelta, draggedNucleotides);
              draggedNucleotidesLength = draggedNucleotides.length;
              setIndicesOfNucleotidesHelper(draggedNucleotidesLength - 2, draggedNucleotidesLength - 1);
            }
          };
          iterateAcrossHelices(maximumNucleotideArrayIndices, 1, basePairedNucleotideArrayIndexDelta, (indexOfNucleotide : number, indexOfBasePairedNucleotide : number) => {
            indexOfBoundingNucleotide0 = indexOfNucleotide;
            indexOfBoundingNucleotide1 = indexOfBasePairedNucleotide;
          });
          iterateAcrossHelices(minimumNucleotideArrayIndices, -1, -basePairedNucleotideArrayIndexDelta, (indexOfNucleotide : number, indexOfBasePairedNucleotide : number) => {
            indexOfBoundingNucleotide2 = indexOfBasePairedNucleotide;
            indexOfBoundingNucleotide3 = indexOfNucleotide;
          });
        }
        switch (returnType) {
          case ReturnType.DragListener:
            return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
          case ReturnType.EditJsxElement:
            let ref = React.createRef<StackedHelix.Edit.Component>();
            return {
              ref,
              content : <StackedHelix.Edit.Component
                ref = {ref}
                affectedNucleotides = {draggedNucleotides}
                indexOfBoundingNucleotide0 = {indexOfBoundingNucleotide0}
                indexOfBoundingNucleotide1 = {indexOfBoundingNucleotide1}
                indexOfBoundingNucleotide2 = {indexOfBoundingNucleotide2}
                indexOfBoundingNucleotide3 = {indexOfBoundingNucleotide3}
              />
            };
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            return "Not yet implemented.";
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
        let basePairedRnaMolecule = rnaComplex.state.rnaMoleculeReferences[basePairedRnaMoleculeIndex].current as RnaMolecule.Component;
        let rnaMolecule = rnaComplex.state.rnaMoleculeReferences[clickedOnNucleotide.props.rnaMoleculeIndex].current as RnaMolecule.Component;
        let foundClickedOnNucleotide = findNucleotideReferenceByIndex(rnaMolecule, clickedOnNucleotide.props.nucleotideIndex);
        let clickedOnNucleotideArrayIndex = foundClickedOnNucleotide.arrayIndex;
        let foundBasePairedNucleotide = findNucleotideReferenceByIndex(rnaMolecule, basePair.nucleotideIndex);
        let basePairedNucleotideArrayIndex = foundBasePairedNucleotide.arrayIndex;
        let basePairedNucleotide = foundBasePairedNucleotide.reference.current as Nucleotide.Component;
        let draggedNucleotides : Array<Nucleotide.Component> = [
          clickedOnNucleotide,
          basePairedNucleotide
        ];
        let indexOfBoundingNucleotide0 : number;
        let indexOfBoundingNucleotide1 : number;
        let arrayIndexDelta = getBasePairedNucleotideArrayIndexDelta(rnaMolecule, basePairedRnaMolecule, basePairedRnaMoleculeIndex, clickedOnNucleotideArrayIndex, basePairedNucleotideArrayIndex);
        if (arrayIndexDelta === undefined) {
          indexOfBoundingNucleotide0 = 0;
          indexOfBoundingNucleotide1 = 1;
        } else {
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
          indexOfBoundingNucleotide0 = 0;
          indexOfBoundingNucleotide1 = draggedNucleotides.length - 1;
          let startingArrayIndex = findNucleotideReferenceByIndex(rnaMolecule, greatestNucleotideIndexConsecutiveToTheMinimumNucleotideIndex).arrayIndex + 1;
          let boundingArrayIndex = findNucleotideReferenceByIndex(rnaMolecule, leastNucleotideIndexConsecutiveToTheMaximumNucleotideIndex).arrayIndex;
          for (let arrayIndex = startingArrayIndex; arrayIndex < boundingArrayIndex; arrayIndex++) {
            let nucleotide = rnaMolecule.state.nucleotideReferences[arrayIndex].current as Nucleotide.Component;
            draggedNucleotides.push(nucleotide);
          }
        }
        switch (returnType) {
          case ReturnType.DragListener:
            return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
          case ReturnType.EditJsxElement:
            let ref = React.createRef<RnaSubdomain.Edit.Component>();
            return {
              ref,
              content : <RnaSubdomain.Edit.Component
                ref = {ref}
                affectedNucleotides = {draggedNucleotides}
                indexOfBoundingNucleotide0 = {indexOfBoundingNucleotide0}
                indexOfBoundingNucleotide1 = {indexOfBoundingNucleotide1}
              />
            };
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            return "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [RNA_CYCLE] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(_clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        if (returnType === ReturnType.DragListener) {
          return `Cannot drag nucleotides using selection constraint "${RNA_CYCLE}"`; 
        }
        switch (returnType) {
          case ReturnType.EditJsxElement:
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            return "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [RNA_MOLECULE] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        let draggedNucleotides = new Array<Nucleotide.Component>(); 
        let array = (App.Component.getCurrent().state.rnaComplexes[clickedOnNucleotide.props.rnaComplexIndex].state.rnaMoleculeReferences[clickedOnNucleotide.props.rnaMoleculeIndex].current as RnaMolecule.Component).state.nucleotideReferences;
        for (let arrayIndex = 0; arrayIndex < array.length; arrayIndex++) {
          let nucleotide = array[arrayIndex].current as Nucleotide.Component;
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
            let indexOfBoundingNucleotide0 = 0;
            let indexOfBoundingNucleotide1 = 1;
            let app = App.Component.getCurrent();
            let rnaMoleculeReferences = app.state.rnaComplexes[draggedNucleotides[0].props.rnaComplexIndex].state.rnaMoleculeReferences;
            let indexOfNucleotide = 0;
            outer: for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < rnaMoleculeReferences.length; rnaMoleculeIndex++) {
              let rnaMolecule = rnaMoleculeReferences[rnaMoleculeIndex].current as RnaMolecule.Component;
              let nucleotideReferences = rnaMolecule.state.nucleotideReferences;
              for (let arrayIndex = 0; arrayIndex < nucleotideReferences.length; arrayIndex++) {
                let nucleotide = nucleotideReferences[arrayIndex].current as Nucleotide.Component;
                let basePair = nucleotide.props.basePair;
                if (basePair !== undefined) {
                  let basePairedNucleotide = findNucleotideReferenceByIndex((rnaMoleculeReferences[basePair.rnaMoleculeIndex].current as RnaMolecule.Component), basePair.nucleotideIndex).reference.current as Nucleotide.Component;
                  indexOfBoundingNucleotide0 = indexOfNucleotide;
                  indexOfBoundingNucleotide1 = draggedNucleotides.findIndex((draggedNucleotide : Nucleotide.Component) => {
                    return draggedNucleotide === basePairedNucleotide;
                  });
                  break outer;
                }
                indexOfNucleotide++;
              }
            }
            let ref = React.createRef<_RnaMolecule.Edit.Component>();
            return {
              ref,
              content : <_RnaMolecule.Edit.Component
                app = {app}
                ref = {ref}
                affectedNucleotides = {draggedNucleotides}
                indexOfBoundingNucleotide0 = {indexOfBoundingNucleotide0}
                indexOfBoundingNucleotide1 = {indexOfBoundingNucleotide1}
              />
            }
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            return "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [RNA_COMPLEX] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(clickedOnNucleotide : Nucleotide.Component, returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        let draggedNucleotides = new Array<Nucleotide.Component>();
        let app = App.Component.getCurrent();
        app.state.rnaComplexes[clickedOnNucleotide.props.rnaComplexIndex].state.rnaMoleculeReferences.forEach((rnaMoleculeReference : React.RefObject<RnaMolecule.Component>) => (rnaMoleculeReference.current as RnaMolecule.Component).state.nucleotideReferences.forEach((nucleotideReference : React.RefObject<Nucleotide.Component>) => {
          let nucleotide = nucleotideReference.current as Nucleotide.Component;
          draggedNucleotides.push(nucleotide);
        }));
        // By default, use the first and last nucleotides as bounding nucleotides.
        let indexOfBoundingNucleotide0 = 0;
        let indexOfBoundingNucleotide1 = draggedNucleotides.length - 1;
        let rnaComplexes = app.state.rnaComplexes;
        let indexOfNucleotide = 0;
        outer: for (let rnaComplexIndex = 0; rnaComplexIndex < rnaComplexes.length; rnaComplexIndex++) {
          let rnaComplex = rnaComplexes[rnaComplexIndex];
          let rnaMoleculeReferences = rnaComplex.state.rnaMoleculeReferences;
          for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < rnaMoleculeReferences.length; rnaMoleculeIndex++) {
            let rnaMolecule = rnaMoleculeReferences[rnaMoleculeIndex].current as RnaMolecule.Component;
            let nucleotideReferences = rnaMolecule.state.nucleotideReferences;
            for (let arrayIndex = 0; arrayIndex < nucleotideReferences.length; arrayIndex++) {
              let nucleotide = nucleotideReferences[arrayIndex].current as Nucleotide.Component;
              let basePair = nucleotide.state.basePair;
              if (basePair !== undefined) {
                let basePairedNucleotide = findNucleotideReferenceByIndex(rnaMoleculeReferences[basePair.rnaMoleculeIndex].current as RnaMolecule.Component, basePair.nucleotideIndex).reference.current as Nucleotide.Component;
                indexOfBoundingNucleotide0 = indexOfNucleotide;
                indexOfBoundingNucleotide1 = draggedNucleotides.findIndex((draggedNucleotide : Nucleotide.Component) => draggedNucleotide === basePairedNucleotide);
                break outer;
              }
              indexOfNucleotide++;
            }
          }
        }
        switch (returnType) {
          case ReturnType.DragListener:
            return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
          case ReturnType.EditJsxElement:
            let ref = React.createRef<_RnaComplex.Edit.Component>();
            return {
              ref,
              content : <_RnaComplex.Edit.Component
                app = {app}
                ref = {ref}
                affectedNucleotides = {draggedNucleotides}
                indexOfBoundingNucleotide0 = {indexOfBoundingNucleotide0}
                indexOfBoundingNucleotide1 = {indexOfBoundingNucleotide1}
              />
            }
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            return "Not yet implemented.";
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
          let rnaMoleculeReferences = rnaComplex.state.rnaMoleculeReferences;
          for (let rnaMoleculeIndex = 0; rnaMoleculeIndex < rnaMoleculeReferences.length; rnaMoleculeIndex++) {
            let nucleotideData = (rnaMoleculeReferences[rnaMoleculeIndex].current as RnaMolecule.Component).state.nucleotideReferences;
            for (let nucleotideArrayIndex = 0; nucleotideArrayIndex < nucleotideData.length; nucleotideArrayIndex++) {
              let nucleotide = nucleotideData[nucleotideArrayIndex].current as Nucleotide.Component;
              if (areEqual(nucleotide.state.stroke, clickedOnNucleotide.state.stroke)) {
                let basePair = nucleotide.state.basePair;
                if (basePair !== undefined && !areEqual((findNucleotideReferenceByIndex(rnaComplex.state.rnaMoleculeReferences[basePair.rnaMoleculeIndex].current as RnaMolecule.Component, basePair.nucleotideIndex).reference.current as Nucleotide.Component).state.stroke, clickedOnNucleotide.state.stroke)) {
                  return `Cannot ${interactionVerbsMap[returnType]} a set of same-color nucleotides which contain base pairs to nucleotides with different colors using selection constraint "${PER_COLOR}"`;
                }
                draggedNucleotides.push(nucleotide);
              }
            }
          }
        }
        switch (returnType) {
          case ReturnType.DragListener:
            return linearDrag(clickedOnNucleotide.state.position, draggedNucleotides);
          case ReturnType.EditJsxElement:
            let ref = React.createRef<PerColor.Edit.Component>();
            return {
              ref,
              content : <PerColor.Edit.Component
                ref = {ref}
                affectedNucleotides = {draggedNucleotides}
                indexOfClickedOnNucleotide = {draggedNucleotides.findIndex((draggedNucleotide : Nucleotide.Component) => draggedNucleotide === clickedOnNucleotide)}
              />
            };
          case ReturnType.FormatJsxElement:
          case ReturnType.AnnotateJsxElement:
            return "Not yet implemented.";
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
            return "Not yet implemented.";
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
            return "Not yet implemented.";
          default:
            throw "Unrecognized ReturnType.";
        }
      }
    },
    [LABELS_ONLY] : new class extends SelectionConstraint {
      override calculateAndApproveSelection(_clickedOnNucleotide : Nucleotide.Component, _returnType : ReturnType) : string | App.DragListener | RightClickMenu {
        return `Cannot interact with nucleotides using selection constraint "${LABELS_ONLY}." Directly interact with label elements instead.`;
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
            return "Not yet implemented.";
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

  namespace PolarSelectionConstraint {
    type NucleotideTransformationData = {
      nucleotide : Nucleotide.Component,
      additionalRotation : number,
      additionalRadiusScale : number
    };

    export type Props = SelectionConstraintProps & {
      indexOfBoundingNucleotide0 : number,
      indexOfBoundingNucleotide1 : number
    };

    export type State = {
      app : App.Component,
      transformationData : Array<NucleotideTransformationData>,
      originX : number,
      originY : number,
      // Exclusively use radians for this angle value.
      // Convert to and from degrees when displaying it in the UI if necessary.
      angle : number,
      radius : number,
      scale : number,
      originXAsString : string,
      originYAsString : string,
      scaleAsString : string,
      boundingNucleotide0 : Nucleotide.Component,
      boundingNucleotide1 : Nucleotide.Component
    };

    export const BOUNDING_NUCLEOTIDE_TO_ORIENTATION_ANGLE_FACTOR = Math.PI * -0.5;

    export abstract class Component<ExtendedProps extends Props, ExtendedState extends State> extends SelectionConstraintComponent<ExtendedProps, ExtendedState> {
      public override reset() {
        // Prevent state.<scale> from being re-defined.
        let scale = this.state.scale;
        let state = this.getInitialState();
        this.setState(Object.assign(state, {
          scale,
          scaleAsString : scale.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
          radius : Utils.areEqual(scale, 0) ? 0 : state.radius / scale
        }));
      }
  
      protected getInitialStateHelper() {
        let app = App.Component.getCurrent();
        let boundingNucleotide0 = this.props.affectedNucleotides[this.props.indexOfBoundingNucleotide0];
        let boundingNucleotide1 = this.props.affectedNucleotides[this.props.indexOfBoundingNucleotide1];
        let origin = Vector2D.scaleUp(Vector2D.add(boundingNucleotide0.state.position, boundingNucleotide1.state.position), 0.5);
        let conventionalDifference = Vector2D.subtract(boundingNucleotide0.state.position, boundingNucleotide1.state.position);
        if (boundingNucleotide0.isGreaterIndexInBasePair()) {
          conventionalDifference = Vector2D.negate(conventionalDifference);
        }
        let asPolar = Vector2D.toPolar(conventionalDifference);
        asPolar.radius *= 0.5;
        // Correct angle to adhere to convention (90-degree turn clockwise).
        asPolar.angle += BOUNDING_NUCLEOTIDE_TO_ORIENTATION_ANGLE_FACTOR;
        let oneOverScale = 1 / asPolar.radius;
        let scale = 1;
        return Object.assign(asPolar, {
          app,
          boundingNucleotide0,
          boundingNucleotide1,
          transformationData : this.props.affectedNucleotides.map((nucleotide : Nucleotide.Component) => {
            let positionDifference = Vector2D.subtract(nucleotide.state.position, origin);
            return {
              nucleotide,
              additionalRotation : Vector2D.asAngle(positionDifference) - asPolar.angle,
              additionalRadiusScale : Vector2D.magnitude(positionDifference) * oneOverScale
            };
          }),
          originX : origin.x,
          originY : origin.y,
          originXAsString : origin.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
          originYAsString : origin.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
          scale,
          scaleAsString : scale.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
        });
      }
  
      protected getNewPositions(centerX : number, centerY : number, radius : number, orientationAngle : number, scale : number) {
        let origin = new Vector2D(centerX, centerY);
        let radiusTimesScale = radius * scale;
        return this.state.transformationData.map((nucleotideTransformationDatum : NucleotideTransformationData) => {
          return Vector2D.add(origin, Vector2D.toCartesian(orientationAngle + nucleotideTransformationDatum.additionalRotation, radiusTimesScale * nucleotideTransformationDatum.additionalRadiusScale));
        });
      }
  
      protected repositionNucleotides(newPositions : Array<Vector2D>) {
        for (let i = 0; i < newPositions.length; i++) {
          this.state.transformationData[i].nucleotide.setState({
            position : newPositions[i]
          });
        }
      }
      
      protected repositionNucleotidesAndBasePairs(newPositions : Array<Vector2D>) {
        this.repositionNucleotides(newPositions);
        for (let i = 0; i < this.props.affectedNucleotides.length; i++) {
          let affectedNucleotide = this.props.affectedNucleotides[i];
          let basePair = affectedNucleotide.state.basePair;
          if (basePair === undefined) {
            continue;
          }
          let basePairedNucleotide = findNucleotideReferenceByIndex(this.state.app.state.rnaComplexes[affectedNucleotide.props.rnaComplexIndex].state.rnaMoleculeReferences[basePair.rnaMoleculeIndex].current as RnaMolecule.Component, basePair.nucleotideIndex).reference.current;
          let indexOfBasePairedAffectedNucleotide = this.props.affectedNucleotides.findIndex((nucleotide : Nucleotide.Component) => nucleotide === basePairedNucleotide);
          if (affectedNucleotide.state.basePair !== undefined) {
            affectedNucleotide.updateBasePairJsx(newPositions[i], newPositions[indexOfBasePairedAffectedNucleotide]);
          }
        }
      }
  
      protected renderTransformationData() {
        return <>
          <b>
            Origin position:
          </b>
          <br/>
          <label>
            x:&nbsp;
            <input
              type = "number"
              step = {DEFAULT_TRANSLATION_MAGNITUDE}
              value = {this.state.originXAsString}
              onChange = {event => {
                this.setState({
                  originXAsString : event.target.value
                });
                let newOriginX = Number.parseFloat(event.target.value);
                if (Number.isNaN(newOriginX)) {
                  return;
                }
                this.setState({
                  originX : newOriginX
                });
                this.repositionNucleotides(this.getNewPositions(newOriginX, this.state.originY, this.state.radius, this.state.angle, this.state.scale));
              }}
            />
          </label>
          <br/>
          <label>
            y:&nbsp;
            <input
              type = "number"
              step = {DEFAULT_TRANSLATION_MAGNITUDE}
              value = {this.state.originYAsString}
              onChange = {event => {
                this.setState({
                  originYAsString : event.target.value
                });
                let newOriginY = Number.parseFloat(event.target.value);
                if (Number.isNaN(newOriginY)) {
                  return;
                }
                this.setState({
                  originY : newOriginY
                });
                this.repositionNucleotides(this.getNewPositions(this.state.originX, newOriginY, this.state.radius, this.state.angle, this.state.scale));
              }}
            />
          </label>
          <br/>
          <AngleEditor.Component
            app = {this.state.app}
            angle = {this.state.angle}
            updateParentAngleHelper = {(angle : number) => {
              this.repositionNucleotidesAndBasePairs(this.getNewPositions(this.state.originX, this.state.originY, this.state.radius, angle, this.state.scale));
              this.setState({
                angle
              });
            }}
          />
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
                this.repositionNucleotidesAndBasePairs(this.getNewPositions(this.state.originX, this.state.originY, this.state.radius, this.state.angle, newScale));
              }}
            />
          </label>
          <br/>
          <button
            onClick = {() => {
              // Convert from the orientation angle to the difference between bounding nucleotides.
              let axisDirection = Vector2D.toNormalCartesian(this.state.angle - BOUNDING_NUCLEOTIDE_TO_ORIENTATION_ANGLE_FACTOR);
              let origin = new Vector2D(this.state.originX, this.state.originY);
              this.repositionNucleotidesAndBasePairs(this.state.transformationData.map((nucleotideTransformationData : NucleotideTransformationData) => {
                let currentPosition = Vector2D.subtract(nucleotideTransformationData.nucleotide.state.position, origin);
                let transformedPosition = Vector2D.add(currentPosition, Vector2D.scaleUp(Vector2D.projectUsingNormalDirection(currentPosition, axisDirection), -2));
                nucleotideTransformationData.additionalRotation = Vector2D.asAngle(transformedPosition) - this.state.angle;
                return Vector2D.add(origin, transformedPosition);
              }));
            }}
          >
            Flip
          </button>
        </>;
      }
    }
  }

  namespace SingleNucleotide {
    export namespace Edit {
      export type Props = SelectionConstraintProps;

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
          let rnaMolecule = rnaComplex.state.rnaMoleculeReferences[nucleotide.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          let nucleotideReferences = rnaMolecule.state.nucleotideReferences;
          let foundNucleotide = findNucleotideReferenceByIndex(rnaMolecule, nucleotide.props.nucleotideIndex);
          let arrayIndex = foundNucleotide.arrayIndex;
          let distanceJsxElements = new Array<JSX.Element>();
          if (foundNucleotide.arrayIndex > 0) {
            let previousNucleotide = nucleotideReferences[arrayIndex - 1].current as Nucleotide.Component;
            distanceJsxElements.push(<React.Fragment
              key = {0}
            >
              {`Distance to previous nucleotide: ${Vector2D.distance(nucleotide.state.position, previousNucleotide.state.position).toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)}`}
              <br/>
            </React.Fragment>);
          }
          if (foundNucleotide.arrayIndex < nucleotideReferences.length - 1) {
            let nextNucleotide = nucleotideReferences[arrayIndex + 1].current as Nucleotide.Component;
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
            {`In RNA molecule "${rnaMolecule.state.name}"`}
            <br/>
            {`In RNA complex "${rnaComplex.state.name}"`}
            <br/>
            {distanceJsxElements}
            <label>
              x:&nbsp;
              <input
                type = "number"
                step = {DEFAULT_TRANSLATION_MAGNITUDE}
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
                step = {DEFAULT_TRANSLATION_MAGNITUDE}
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

  namespace SingleBasePair {
    export namespace Edit {
      export type Props = PolarSelectionConstraint.Props;

      export type State = PolarSelectionConstraint.State;

      export class Component extends PolarSelectionConstraint.Component<Props, State> {
        constructor(props : Props) {
          super(props);
        }

        public override render() {
          let boundingNucleotide0 = this.state.boundingNucleotide0;
          let boundingNucleotide1 = this.state.boundingNucleotide1;
          let rnaComplex = this.state.app.state.rnaComplexes[boundingNucleotide0.props.rnaComplexIndex];
          let rnaMolecule = rnaComplex.state.rnaMoleculeReferences[boundingNucleotide0.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          let basePairedRnaMolecule = rnaComplex.state.rnaMoleculeReferences[boundingNucleotide1.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          return <>
            <b>
              Edit single base pair:
            </b>
            <br/>
            {`Nucleotide #${rnaMolecule.props.firstNucleotideIndex + boundingNucleotide0.props.nucleotideIndex} (${boundingNucleotide0.props.symbol})`}
            <br/>
            {`In RNA molecule "${rnaMolecule.state.name}"`}
            <br/>
            {"Base-paried to:"}
            <br/>
            {`Nucleotide #${basePairedRnaMolecule.props.firstNucleotideIndex + boundingNucleotide1.props.nucleotideIndex} (${boundingNucleotide1.props.symbol})`}
            <br/>
            {`In RNA molecule "${basePairedRnaMolecule.state.name}"`}
            <br/>
            {`In RNA complex "${rnaComplex.state.name}"`}
            <br/>
            {`Base-pair type: "${[(boundingNucleotide0.state.basePair as Nucleotide.BasePair).type]}"`}
            <br/>
            {this.renderTransformationData()}
          </>;
        }

        public override getInitialState() : State {
          return this.getInitialStateHelper();
        }
      }
    }
  }

  namespace SingleStrand {
    export namespace Edit {
      export namespace Terminal {
        export type Props = SelectionConstraintProps & {
          indexOfClickedOnNucleotide : number,
          repositionNucleotidesHelper : (newClickedOnNucleotidePosition : Vector2D) => void,
          threePrimeOrFivePrimeLabel : "3'" | "5'"
        };

        export type State = {
          terminalNucleotidePositionXAsString : string,
          terminalNucleotidePositionYAsString : string,
          terminalNucleotidePositionX : number,
          terminalNucleotidePositionY : number
        };

        export class Component extends SelectionConstraintComponent<Props, State> {
          constructor(props : Props) {
            super(props);
          }
  
          public override getInitialState() {
            let terminalNucleotidePosition = this.props.affectedNucleotides[this.props.indexOfClickedOnNucleotide].state.position;
            return {
              terminalNucleotidePositionXAsString : terminalNucleotidePosition.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
              terminalNucleotidePositionYAsString : terminalNucleotidePosition.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
              terminalNucleotidePositionX : terminalNucleotidePosition.x,
              terminalNucleotidePositionY : terminalNucleotidePosition.y
            };
          }
  
          public override render() {
            return <>
              <b>
                Edit single-stranded region ({this.props.threePrimeOrFivePrimeLabel} terminus):
              </b>
              <br/>
              <b>
                {this.props.threePrimeOrFivePrimeLabel} Nucleotide position:
              </b>
              <br/>
              <label>
                x:&nbsp;
                <input
                  type = "number"
                  value = {this.state.terminalNucleotidePositionXAsString}
                  step = {DEFAULT_TRANSLATION_MAGNITUDE}
                  onChange = {event => {
                    this.setState({
                      terminalNucleotidePositionXAsString : event.target.value
                    });
                    let newThreePrimeNucleotidePositionX = Number.parseFloat(event.target.value);
                    if (!Number.isNaN(newThreePrimeNucleotidePositionX)) {
                      this.setState({
                        terminalNucleotidePositionX : newThreePrimeNucleotidePositionX
                      });
                      this.props.repositionNucleotidesHelper(new Vector2D(newThreePrimeNucleotidePositionX, this.state.terminalNucleotidePositionY));
                    }
                  }}
                />
              </label>
              <br/>
              <label>
                y:&nbsp;
                <input
                  type = "number"
                  value = {this.state.terminalNucleotidePositionYAsString}
                  step = {DEFAULT_TRANSLATION_MAGNITUDE}
                  onChange = {event => {
                    this.setState({
                      terminalNucleotidePositionYAsString : event.target.value
                    });
                    let newThreePrimeNucleotidePositionY = Number.parseFloat(event.target.value);
                    if (!Number.isNaN(newThreePrimeNucleotidePositionY)) {
                      this.setState({
                        terminalNucleotidePositionY : newThreePrimeNucleotidePositionY
                      });
                      this.props.repositionNucleotidesHelper(new Vector2D(this.state.terminalNucleotidePositionX, newThreePrimeNucleotidePositionY));
                    }
                  }}
                />
              </label>
              <br/>
            </>
          }
        }
      }
      export namespace Internal {
        export type RepositioningData = {
          boundingCircle : Circle,
          angleTraversal : number,
          beginningAngle : number
        };

        export type Props = SelectionConstraintProps & {
          getBeginningAngleAndAngleTraversalHelper : (center : Vector2D, flipAngleTraversalCondition : (angleTraversal : number) => boolean) => { beginningAngle : number, angleTraversal : number },
          flipAngleTraversalHelper : (angleTraversal : number) => number,
          repositionNucleotidesHelper : (repositioningData : RepositioningData) => void,
          indexOfFivePrimeNucleotide : number,
          indexOfThreePrimeNucleotide : number,
          normal : Vector2D,
          boundingNucleotidesCenter : Vector2D
        };

        export type State = RepositioningData & {
          clockwiseFlag : boolean,
          signedDisplacementAsString : string
        };

        export class Component extends SelectionConstraintComponent<Props, State> {
          constructor(props : Props) {
            super(props);
          }

          private traverseFreeNucleotides(handleFreeNucleotideHelper : (freeNucleotide : Nucleotide.Component) => void) : void {
            for (let i = 0; i < this.props.affectedNucleotides.length; i++) {
              if (i === this.props.indexOfFivePrimeNucleotide || i === this.props.indexOfThreePrimeNucleotide) {
                continue;
              }
              handleFreeNucleotideHelper(this.props.affectedNucleotides[i]);
            };
          }
  
          public override getInitialState() {
            let averageBoundingCircleCenter = new Vector2D(0, 0);
            let averageBoundingCircleRadius = 0;
            let fivePrimeNucleotide = this.props.affectedNucleotides[this.props.indexOfFivePrimeNucleotide];
            let threePrimeNucleotide = this.props.affectedNucleotides[this.props.indexOfThreePrimeNucleotide];
            let scalar = 1 / (this.props.affectedNucleotides.length - 2);
            this.traverseFreeNucleotides((freeNucleotide : Nucleotide.Component) => {
              let boundingCircle = Geometry.getBoundingCircle(freeNucleotide.state.position, fivePrimeNucleotide.state.position, threePrimeNucleotide.state.position);
              averageBoundingCircleCenter = Vector2D.add(averageBoundingCircleCenter, boundingCircle.center);
              averageBoundingCircleRadius += boundingCircle.radius;
            });
            averageBoundingCircleCenter = Vector2D.scaleUp(averageBoundingCircleCenter, scalar);
            averageBoundingCircleRadius = averageBoundingCircleRadius * scalar;
            let signedDisplacement = Vector2D.dotProduct(Vector2D.subtract(averageBoundingCircleCenter, this.props.boundingNucleotidesCenter), this.props.normal);
            // Correct the averageBoundingCircleCenter in case it is displaced from the bounding nucleotides' bisector.
            averageBoundingCircleCenter = Vector2D.add(this.props.boundingNucleotidesCenter, Vector2D.scaleUp(this.props.normal, signedDisplacement));
            let clockwiseIndicator = 0;
            this.traverseFreeNucleotides((freeNucleotide : Nucleotide.Component) => {
              // Each free nucleotide "votes" on whether the single-stranded region is oriented clockwise.
              clockwiseIndicator += Utils.sign(Vector2D.dotProduct(this.props.normal, Vector2D.subtract(freeNucleotide.state.position, this.props.boundingNucleotidesCenter)));
            });
            let beginningAngleAndAngleTraversal = this.props.getBeginningAngleAndAngleTraversalHelper(averageBoundingCircleCenter, (angleTraversal : number) => {
              // Invert the angle traversal if these are inverted.
              return clockwiseIndicator * angleTraversal < 0;
            });
            return Object.assign(beginningAngleAndAngleTraversal, {
              boundingCircle : {
                center : averageBoundingCircleCenter,
                radius : averageBoundingCircleRadius
              },
              clockwiseFlag : beginningAngleAndAngleTraversal.angleTraversal < 0,
              signedDisplacementAsString : signedDisplacement.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT)
            });
          }
  
          public override render() {
            let freeNucleotide = this.props.affectedNucleotides[0];
            let rnaComplex = App.Component.getCurrent().state.rnaComplexes[freeNucleotide.props.rnaComplexIndex];
            let rnaMolecule = rnaComplex.state.rnaMoleculeReferences[freeNucleotide.props.rnaMoleculeIndex].current as RnaMolecule.Component;
            let fivePrimeNucleotide = this.props.affectedNucleotides[this.props.indexOfFivePrimeNucleotide];
            let threePrimeNucleotide = this.props.affectedNucleotides[this.props.indexOfThreePrimeNucleotide];
            return <>
              <b>
                Edit single-stranded region:
              </b>
              <br/>
              {`In RNA molecule "${rnaMolecule.state.name}"`}
              <br/>
              {`In RNA complex "${rnaComplex.state.name}"`}
              <br/>
              {`${this.props.affectedNucleotides.length - 2} free nucleotides between nucleotide #${fivePrimeNucleotide.props.nucleotideIndex + rnaMolecule.props.firstNucleotideIndex} (${fivePrimeNucleotide.props.symbol}, exclusive) and nucleotide #${threePrimeNucleotide.props.nucleotideIndex + rnaMolecule.props.firstNucleotideIndex} (${threePrimeNucleotide.props.symbol}, exclusive)`}
              <br/>
              <label>
                Clockwise?&nbsp;
                <input
                  type = "checkbox"
                  checked = {this.state.clockwiseFlag}
                  onChange = {() => {
                    let newAngleTraversal = this.props.flipAngleTraversalHelper(this.state.angleTraversal);
                    this.setState({
                      clockwiseFlag : !this.state.clockwiseFlag,
                      angleTraversal : newAngleTraversal
                    });
                    this.props.repositionNucleotidesHelper(Object.assign(this.state, {
                      angleTraversal : newAngleTraversal
                    }));
                  }}
                />
              </label>
              <br/>
              <label>
                Displacement along normal:
                <input
                  type = "number"
                  value = {this.state.signedDisplacementAsString}
                  step = {DEFAULT_TRANSLATION_MAGNITUDE}
                  onChange = {event => {
                    this.setState({
                      signedDisplacementAsString : event.target.value
                    });
                    let newSignedDisplacement = Number.parseFloat(event.target.value);
                    if (Number.isNaN(newSignedDisplacement)) {
                      return;
                    }
                    let center = Vector2D.add(this.props.boundingNucleotidesCenter, Vector2D.scaleUp(this.props.normal, newSignedDisplacement));
                    let beginningAngleAndAngleTraversal = this.props.getBeginningAngleAndAngleTraversalHelper(center, (angleTraversal : number) => {
                      return angleTraversal < 0 !== this.state.clockwiseFlag;
                    });
                    let boundingCircle = {
                      center,
                      radius : Vector2D.distance(fivePrimeNucleotide.state.position, center)
                    };
                    let repositioningData = Object.assign(beginningAngleAndAngleTraversal, {
                      boundingCircle
                    });
                    this.setState(repositioningData);
                    this.props.repositionNucleotidesHelper(repositioningData);
                  }}
                />
              </label>
              <br/>
              <button
                onClick = {() => {
                  let scalar = 1 / (this.props.affectedNucleotides.length - 1);
                  let positionDelta = Vector2D.scaleUp(Vector2D.subtract(threePrimeNucleotide.state.position, fivePrimeNucleotide.state.position), scalar);
                  let position = fivePrimeNucleotide.state.position;
                  this.traverseFreeNucleotides((freeNucleotide : Nucleotide.Component) => {
                    position = Vector2D.add(position, positionDelta);
                    freeNucleotide.setState({
                      position
                    });
                  });
                }}
              >
                Straighten
              </button>
              <br/>
            </>
          }
        }
      }
    }
  }

  namespace SingleHelix {
    export namespace Edit {
      type Props = PolarSelectionConstraint.Props & {
        indexOfBoundingNucleotide2 : number,
        indexOfBoundingNucleotide3 : number
      };
  
      type State = PolarSelectionConstraint.State & {
        boundingNucleotide2 : Nucleotide.Component,
        boundingNucleotide3 : Nucleotide.Component
      };

      export class Component extends PolarSelectionConstraint.Component<Props, State> {
        constructor(props : Props) {
          super(props);
        }

        public override getInitialState() {
          return Object.assign(this.getInitialStateHelper(), {
            boundingNucleotide2 : this.props.affectedNucleotides[this.props.indexOfBoundingNucleotide2],
            boundingNucleotide3 : this.props.affectedNucleotides[this.props.indexOfBoundingNucleotide3]
          });
        }

        public override render() {
          let boundingNucleotide0 = this.state.boundingNucleotide0;
          let boundingNucleotide1 = this.state.boundingNucleotide1;
          let boundingNucleotide2 = this.state.boundingNucleotide2;
          let boundingNucleotide3 = this.state.boundingNucleotide3;
          let rnaComplex = this.state.app.state.rnaComplexes[boundingNucleotide0.props.rnaComplexIndex];
          let rnaMolecule0 = rnaComplex.state.rnaMoleculeReferences[boundingNucleotide0.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          let rnaMolecule1 = rnaComplex.state.rnaMoleculeReferences[boundingNucleotide1.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          let rnaMoleculesAndNucleotidesInfo : JSX.Element;
          if (this.state.boundingNucleotide0.props.rnaMoleculeIndex === this.state.boundingNucleotide1.props.rnaMoleculeIndex) {
            rnaMoleculesAndNucleotidesInfo = <>
              {`Nucleotides #${boundingNucleotide0.props.nucleotideIndex + rnaMolecule0.props.firstNucleotideIndex} (${boundingNucleotide0.props.symbol}, inclusive) - #${boundingNucleotide2.props.nucleotideIndex + rnaMolecule0.props.firstNucleotideIndex} (${boundingNucleotide2.props.symbol}, inclusive)`}
              <br/>
              Contiguously bound to:
              <br/>
              {`Nucleotides #${boundingNucleotide1.props.nucleotideIndex + rnaMolecule1.props.firstNucleotideIndex} (${boundingNucleotide1.props.symbol}, inclusive) - #${boundingNucleotide3.props.nucleotideIndex + rnaMolecule1.props.firstNucleotideIndex} (${boundingNucleotide3.props.symbol}, inclusive)`}
              <br/>
              {`In RNA molecule "${rnaMolecule0.state.name}"`}
              <br/>
            </>;
          } else {
            rnaMoleculesAndNucleotidesInfo = <>
              {`Nucleotides #${boundingNucleotide0.props.nucleotideIndex + rnaMolecule0.props.firstNucleotideIndex} (${boundingNucleotide0.props.symbol}, inclusive) - #${boundingNucleotide2.props.nucleotideIndex + rnaMolecule0.props.firstNucleotideIndex} (${boundingNucleotide2.props.symbol}, inclusive)`}
              <br/>
              {`In RNA molecule "${rnaMolecule0.state.name}"`}
              <br/>
              Contiguously bound to:
              <br/>
              {`Nucleotides #${boundingNucleotide1.props.nucleotideIndex + rnaMolecule1.props.firstNucleotideIndex} (${boundingNucleotide1.props.symbol}, inclusive) - #${boundingNucleotide3.props.nucleotideIndex + rnaMolecule1.props.firstNucleotideIndex} (${boundingNucleotide3.props.symbol}, inclusive)`}
              <br/>
              {`In RNA molecule "${rnaMolecule1.state.name}"`}
              <br/>
            </>;
          }
          return <>
            <b>
              Edit single helix:
            </b>
            <br/>
            {rnaMoleculesAndNucleotidesInfo}
            {`In RNA complex "${rnaComplex.state.name}"`}
            <br/>
            {this.renderTransformationData()}
            <br/>
          </>;
        }
      } 
    }
  }

  namespace StackedHelix {
    export namespace Edit {
      type Props = PolarSelectionConstraint.Props & {
        indexOfBoundingNucleotide2 : number,
        indexOfBoundingNucleotide3 : number
      };

      type State = PolarSelectionConstraint.State & {
        boundingNucleotide2 : Nucleotide.Component,
        boundingNucleotide3 : Nucleotide.Component
      }

      export class Component extends PolarSelectionConstraint.Component<Props, State> {
        constructor(props : Props) {
          super(props);
        }

        public override getInitialState() {
          return Object.assign(this.getInitialStateHelper(), {
            boundingNucleotide2 : this.props.affectedNucleotides[this.props.indexOfBoundingNucleotide2],
            boundingNucleotide3 : this.props.affectedNucleotides[this.props.indexOfBoundingNucleotide3]
          });
        }

        public override render() {
          let boundingNucleotide0 = this.state.boundingNucleotide0;
          let boundingNucleotide1 = this.state.boundingNucleotide1;
          let boundingNucleotide2 = this.state.boundingNucleotide2;
          let boundingNucleotide3 = this.state.boundingNucleotide3;
          let rnaComplex = this.state.app.state.rnaComplexes[boundingNucleotide0.props.rnaComplexIndex];
          let rnaMolecule0 = rnaComplex.state.rnaMoleculeReferences[boundingNucleotide0.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          let rnaMolecule1 = rnaComplex.state.rnaMoleculeReferences[boundingNucleotide1.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          let rnaMoleculesAndNucleotidesInfo : JSX.Element;
          if (this.state.boundingNucleotide0.props.rnaMoleculeIndex === this.state.boundingNucleotide1.props.rnaMoleculeIndex) {
            rnaMoleculesAndNucleotidesInfo = <>
              {`Nucleotides #${boundingNucleotide0.props.nucleotideIndex + rnaMolecule0.props.firstNucleotideIndex} (${boundingNucleotide0.props.symbol}, inclusive) - #${boundingNucleotide2.props.nucleotideIndex + rnaMolecule0.props.firstNucleotideIndex} (${boundingNucleotide2.props.symbol}, inclusive)`}
              <br/>
              Bound to:
              <br/>
              {`Nucleotides #${boundingNucleotide1.props.nucleotideIndex + rnaMolecule1.props.firstNucleotideIndex} (${boundingNucleotide1.props.symbol}, inclusive) - #${boundingNucleotide3.props.nucleotideIndex + rnaMolecule1.props.firstNucleotideIndex} (${boundingNucleotide3.props.symbol}, inclusive)`}
              <br/>
              {`In RNA molecule "${rnaMolecule0.state.name}"`}
              <br/>
            </>;
          } else {
            rnaMoleculesAndNucleotidesInfo = <>
              {`Nucleotides #${boundingNucleotide0.props.nucleotideIndex + rnaMolecule0.props.firstNucleotideIndex} (${boundingNucleotide0.props.symbol}, inclusive) - #${boundingNucleotide2.props.nucleotideIndex + rnaMolecule0.props.firstNucleotideIndex} (${boundingNucleotide2.props.symbol}, inclusive)`}
              <br/>
              {`In RNA molecule "${rnaMolecule0.state.name}"`}
              <br/>
              Bound to:
              <br/>
              {`Nucleotides #${boundingNucleotide1.props.nucleotideIndex + rnaMolecule1.props.firstNucleotideIndex} (${boundingNucleotide1.props.symbol}, inclusive) - #${boundingNucleotide3.props.nucleotideIndex + rnaMolecule1.props.firstNucleotideIndex} (${boundingNucleotide3.props.symbol}, inclusive)`}
              <br/>
              {`In RNA molecule "${rnaMolecule1.state.name}"`}
              <br/>
            </>;
          }
          return <>
            <b>
              Edit stacked helices:
            </b>
            <br/>
            {rnaMoleculesAndNucleotidesInfo}
            {`In RNA complex "${rnaComplex.state.name}"`}
            <br/>
            {this.renderTransformationData()}
          </>;
        }
      }
    }
  }

  namespace RnaSubdomain {
    export namespace Edit{
      type Props = PolarSelectionConstraint.Props;

      type State = PolarSelectionConstraint.State;

      export class Component extends PolarSelectionConstraint.Component<Props, State> {
        constructor(props : Props) {
          super(props);
        }

        public override getInitialState() {
          return this.getInitialStateHelper();
        }

        public override render() {
          let fivePrimeNucleotide = this.state.boundingNucleotide0;
          let threePrimeNucleotide = this.state.boundingNucleotide1;
          if (fivePrimeNucleotide.isGreaterIndexInBasePair()) {
            let tempNucleotide = fivePrimeNucleotide;
            fivePrimeNucleotide = threePrimeNucleotide;
            threePrimeNucleotide = tempNucleotide;
          }
          let rnaComplex = this.state.app.state.rnaComplexes[fivePrimeNucleotide.props.rnaComplexIndex];
          let rnaMolecule = rnaComplex.state.rnaMoleculeReferences[fivePrimeNucleotide.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          return <>
            <b>
              Edit RNA subdomain:
            </b>
            <br/>
            {`5' Nucleotide: #${fivePrimeNucleotide.props.nucleotideIndex + rnaMolecule.props.firstNucleotideIndex} (${fivePrimeNucleotide.props.symbol}, inclusive)`}
            <br/>
            Bound to:
            <br/>
            {`3' Nucleotide: ${threePrimeNucleotide.props.nucleotideIndex + rnaMolecule.props.firstNucleotideIndex} (${threePrimeNucleotide.props.symbol}, inclusive)`}
            <br/>
            {`In RNA molecule "${rnaMolecule.state.name}"`}
            <br/>
            {`In RNA complex "${rnaComplex.state.name}"`}
            <br/>
            {this.renderTransformationData()}
          </>;
        }
      }
    }
  }

  namespace RnaCycle {
    export namespace Edit {
      export type Props = {};
      
      export type State = {};

      export class Component extends React.Component<Props, State> {
        public constructor(props : Props) {
          super(props);
          this.state = {};
        }

        public override render() {
          return <></>;
        }
      }
    }
  }
  
  namespace _RnaMolecule {
    export namespace Edit {
      type Props = PolarSelectionConstraint.Props & {
        app : App.Component
      };

      type State = PolarSelectionConstraint.State & {
        name : string,
        rnaMolecule : RnaMolecule.Component
      };

      export class Component extends PolarSelectionConstraint.Component<Props, State> {
        public constructor(props : Props) {
          super(props);
        }

        public override getInitialState() {
          let affectedNucleotide0 = this.props.affectedNucleotides[0];
          let rnaMolecule = this.props.app.state.rnaComplexes[affectedNucleotide0.props.rnaComplexIndex].state.rnaMoleculeReferences[affectedNucleotide0.props.rnaMoleculeIndex].current as RnaMolecule.Component;
          return Object.assign(this.getInitialStateHelper(), {
            name : rnaMolecule.state.name,
            rnaMolecule 
          });
        }

        public override render() {
          let rnaMolecule = this.state.rnaMolecule;
          return <>
            <b>
              {`Edit RNA Molecule`}
            </b>
            <br/>
            <label>
              Name:&nbsp;
              <input
                type = "text"
                value = {this.state.name}
                onChange = {event => {
                  this.setState({
                    name : event.target.value
                  });
                  rnaMolecule.setState({
                    name : event.target.value
                  });
                }}
              />
            </label>
            <br/>
            {this.renderTransformationData()}
          </>;
        }
      }
    }
  }

  namespace _RnaComplex {
    export namespace Edit {
      type Props = PolarSelectionConstraint.Props & {
        app : App.Component
      };

      type State = PolarSelectionConstraint.State & {
        name : string,
        rnaComplex : RnaComplex.Component
      };

      export class Component extends PolarSelectionConstraint.Component<Props, State> {
        public constructor(props : Props) {
          super(props);
        }

        public override getInitialState() {
          let affectedNucleotide0 = this.props.affectedNucleotides[0];
          let rnaComplex = this.props.app.state.rnaComplexes[affectedNucleotide0.props.rnaComplexIndex] as RnaComplex.Component;
          return Object.assign(this.getInitialStateHelper(), {
            name : rnaComplex.state.name,
            rnaComplex
          });
        }

        public override render() {
          let rnaComplex = this.state.app.state.rnaComplexes[this.props.affectedNucleotides[0].props.rnaComplexIndex];
          return <>
            <b>
              {`Edit RNA Complex`}
            </b>
            <br/>
            <label>
              Name:&nbsp;
              <input
                type = "text"
                value = {this.state.name}
                onChange = {event => {
                  this.setState({
                    name : event.target.value
                  });
                  rnaComplex.setState({
                    name : event.target.value
                  });
                }}
              />
            </label>
            <br/>
            {this.renderTransformationData()}
          </>;
        }
      }
    }
  }

  namespace PerColor {
    export namespace Edit {
      export type Props = SelectionConstraintProps & {
        indexOfClickedOnNucleotide : number
      };

      type State = {
        clickedOnNucleotideX : number,
        clickedOnNucleotideY : number,
        clickedOnNucleotideXAsString : string,
        clickedOnNucleotideYAsString : string,
        displacements : Array<Vector2D>
      };

      export class Component extends SelectionConstraintComponent<Props, State> {
        public constructor(props : Props) {
          super(props);
        }

        public override getInitialState() {
          let clickedOnNucleotide = this.props.affectedNucleotides[this.props.indexOfClickedOnNucleotide];
          let clickedOnNucleotidePosition = clickedOnNucleotide.state.position;
          return {
            clickedOnNucleotideX : clickedOnNucleotidePosition.x,
            clickedOnNucleotideY : clickedOnNucleotidePosition.y,
            clickedOnNucleotideXAsString : clickedOnNucleotidePosition.x.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            clickedOnNucleotideYAsString : clickedOnNucleotidePosition.y.toFixed(FORMATTED_NUMBER_DECIMAL_DIGITS_COUNT),
            displacements : this.props.affectedNucleotides.map((affectedNucleotide : Nucleotide.Component) => {
              return Vector2D.subtract(affectedNucleotide.state.position, clickedOnNucleotidePosition)
            })
          };
        }

        public override render() {
          let color = this.props.affectedNucleotides[0].state.stroke;
          let repositionNucleotides = (x : number, y : number) => {
            let origin = new Vector2D(x, y);
            for (let i = 0; i < this.props.affectedNucleotides.length; i++) {
              this.props.affectedNucleotides[i].setState({
                position : Vector2D.add(this.state.displacements[i], origin)
              });
            }
          }
          let colorText : string;
          if (color.alpha === undefined) {
            colorText = `rgb(${color.red}, ${color.green}, ${color.blue})`
          } else {
            colorText = `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`
          }
          return <>
            <b>
              {`Edit nucleotides with color = ${colorText}:`}
            </b>
            <br/>
            <b>
              Clicked-on nucleotide position:
            </b>
            <br/>
            <label>
              x:&nbsp;
              <input
                type = "number"
                step = {DEFAULT_TRANSLATION_MAGNITUDE}
                value = {this.state.clickedOnNucleotideXAsString}
                onChange = {event => {
                  this.setState({
                    clickedOnNucleotideXAsString : event.target.value
                  });
                  let newX = Number.parseFloat(event.target.value);
                  if (Number.isNaN(newX)) {
                    return;
                  }
                  this.setState({
                    clickedOnNucleotideX : newX
                  });
                  repositionNucleotides(newX, this.state.clickedOnNucleotideY);
                }}
              />
            </label>
            <br/>
            <label>
              y:&nbsp;
              <input
                type = "number"
                step = {DEFAULT_TRANSLATION_MAGNITUDE}
                value = {this.state.clickedOnNucleotideYAsString}
                onChange = {event => {
                  this.setState({
                    clickedOnNucleotideYAsString : event.target.value
                  });
                  let newY = Number.parseFloat(event.target.value);
                  if (Number.isNaN(newY)) {
                    return;
                  }
                  this.setState({
                    clickedOnNucleotideY : newY
                  });
                  repositionNucleotides(this.state.clickedOnNucleotideX, newY);
                }}
              />
            </label>
          </>;
        }
      }
    }
  }
}