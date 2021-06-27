
export class PolymerEntityChromosomeTranslate {

    private readonly rawData: Map<string, Array<string>>

    constructor( entityMap: Map<string, Array<string>> ) {
        this.rawData = entityMap;
    }

    getData(): Map<string, Array<string>>{
        return this.rawData;
    }

}