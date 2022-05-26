import { Nucleotide } from './Nucleotide';

class RNAMolecule {
  public name : string;
  public firstNucleotideIndex : number;
  public nucleotidesMap : Record<number, Nucleotide>;
  public basePairCircleRadius : number = 1;

  public constructor(name : string, firstNucleotideIndex : number) {
    this.name = name;
    this.firstNucleotideIndex = firstNucleotideIndex;
    this.nucleotidesMap = {};
  }
}

export { RNAMolecule };