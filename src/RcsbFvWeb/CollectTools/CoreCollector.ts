import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";

export class CoreCollector {

    private polymerEntityInstance:PolymerEntityInstanceTranslate;
    setPolymerEntityInstance(p: PolymerEntityInstanceTranslate){
        this.polymerEntityInstance = p;
    }
    getPolymerEntityInstance(): PolymerEntityInstanceTranslate{
        return this.polymerEntityInstance;
    }

}