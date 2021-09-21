import { ComplexCollection } from "./ComplexCollection";

export class ComplexScene extends ComplexCollection {
    private name : string;
    private author : string;

    public constructor(name : string, author : string) {
        super();
        this.name = name;
        this.author = author;
    }
}