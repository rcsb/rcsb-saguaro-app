
export class PolymerEntityChromosomeTranslate {

    private readonly rawData: Map<string, string[]>

    constructor( entityMap: Map<string, string[]> ) {
        this.rawData = entityMap;
    }

    getData(): Map<string, string[]>{
        return this.rawData;
    }

}