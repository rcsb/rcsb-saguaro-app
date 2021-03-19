import {PolymerEntityInstanceTranslate} from "../../Utils/PolymerEntityInstanceTranslate";
import {RcsbFvQuery} from "../../../RcsbGraphQL/RcsbFvQuery";

export class CoreCollector {

    protected rcsbFvQuery: RcsbFvQuery = new RcsbFvQuery();
    private polymerEntityInstance:PolymerEntityInstanceTranslate = null;
    setPolymerEntityInstance(p: PolymerEntityInstanceTranslate){
        this.polymerEntityInstance = p;
    }
    protected getPolymerEntityInstance(): PolymerEntityInstanceTranslate{
        return this.polymerEntityInstance;
    }

}