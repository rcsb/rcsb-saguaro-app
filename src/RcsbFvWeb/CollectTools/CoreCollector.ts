import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";

export class CoreCollector {

    private polymerEntityInstance:PolymerEntityInstanceTranslate = null;
    setPolymerEntityInstance(p: PolymerEntityInstanceTranslate){
        this.polymerEntityInstance = p;
    }
    getPolymerEntityInstance(): PolymerEntityInstanceTranslate{
        return this.polymerEntityInstance;
    }

}