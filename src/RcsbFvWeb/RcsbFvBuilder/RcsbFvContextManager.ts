import {RcsbFv, RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";



class RcsbFvContextManager {
    private rcsbFvManager: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private rcsbButtonManager: Map<string, Set<string>> = new Map<string, Set<string>>();
    private boardConfig: RcsbFvBoardConfigInterface;
    private polymerEntityToInstanceMap: Map<string,PolymerEntityInstanceTranslate> = new Map<string, PolymerEntityInstanceTranslate>();

    getFv(elementFvId: string): RcsbFv{
        return this.rcsbFvManager.get(elementFvId);
    }

    setFv(elementFvId: string, rcsbFv: RcsbFv): void{
        this.rcsbFvManager.set(elementFvId, rcsbFv);
    }

    getButtonList(elementFvId: string): Set<string>{
        return this.rcsbButtonManager.get(elementFvId);
    }

    setButton(elementFvId: string, buttonId: string): void{
        if(this.rcsbButtonManager.get(elementFvId) == null)
            this.rcsbButtonManager.set(elementFvId, new Set<string>());
        this.rcsbButtonManager.get(elementFvId).add(buttonId);
    }

    removeFv(elementFvId: string): void{
        this.rcsbFvManager.delete(elementFvId);
        if(this.rcsbButtonManager.has(elementFvId))
            this.rcsbButtonManager.delete(elementFvId);
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
