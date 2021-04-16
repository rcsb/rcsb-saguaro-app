import {RcsbFv, RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {Feature} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";



class RcsbFvContextManager {
    private rcsbFvManager: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private rcsbMountedManager: Map<string, Set<string>> = new Map<string, Set<string>>();
    private boardConfig: RcsbFvBoardConfigInterface;
    private polymerEntityToInstanceMap: Map<string,PolymerEntityInstanceTranslate> = new Map<string, PolymerEntityInstanceTranslate>();
    private rcsbFvFeatures: Map<string, Promise<Array<Feature>>> = new Map<string, Promise<Array<Feature>>>();
    private rcsbFvAnnotationConfigData: Map<string, Promise<Array<RcsbFvRowConfigInterface>>> = new Map<string, Promise<Array<RcsbFvRowConfigInterface>>>();

    getFv(elementFvId: string): RcsbFv{
        return this.rcsbFvManager.get(elementFvId);
    }

    setFv(elementFvId: string, rcsbFv: RcsbFv): void{
        this.rcsbFvManager.set(elementFvId, rcsbFv);
    }

    getFeatures(elementFvId: string): Promise<Array<Feature>>{
        return this.rcsbFvFeatures.get(elementFvId);
    }

    setFeatures(elementFvId: string, features: Promise<Array<Feature>>): void{
        this.rcsbFvFeatures.set(elementFvId, features);
    }

    getAnnotationConfigData(elementFvId: string): Promise<Array<RcsbFvRowConfigInterface>>{
        return this.rcsbFvAnnotationConfigData.get(elementFvId);
    }

    setAnnotationConfigData(elementFvId: string, acd: Promise<Array<RcsbFvRowConfigInterface>>): void{
        this.rcsbFvAnnotationConfigData.set(elementFvId, acd);
    }

    getMountedList(elementFvId: string): Set<string>{
        return this.rcsbMountedManager.get(elementFvId);
    }

    setMounted(elementFvId: string, buttonId: string): void{
        if(this.rcsbMountedManager.get(elementFvId) == null)
            this.rcsbMountedManager.set(elementFvId, new Set<string>());
        this.rcsbMountedManager.get(elementFvId).add(buttonId);
    }

    removeFv(elementFvId: string): void{
        this.rcsbFvManager.delete(elementFvId);
        if(this.rcsbMountedManager.has(elementFvId))
            this.rcsbMountedManager.delete(elementFvId);
    }

    setBoardConfig(boardConfig: RcsbFvBoardConfigInterface): void{
        this.boardConfig = boardConfig;

    }

    getBoardConfig():RcsbFvBoardConfigInterface{
        return this.boardConfig;
    }

    setEntityToInstance(entryId: string, map: PolymerEntityInstanceTranslate): void{
        this.polymerEntityToInstanceMap.set(entryId, map);

    }

    getEntityToInstance(entryId: string): PolymerEntityInstanceTranslate{
        return this.polymerEntityToInstanceMap.get(entryId);
    }

}

export const rcsbFvCtxManager: RcsbFvContextManager = new RcsbFvContextManager();
