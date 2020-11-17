import {RcsbFv, RcsbFvBoardConfigInterface} from "@bioinsilico/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";



class RcsbFvContextManager {
    private rcsbFvManager: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private boardConfig: RcsbFvBoardConfigInterface;
    private polymerEntityToInstanceMap: Map<string,PolymerEntityInstanceTranslate> = new Map<string, PolymerEntityInstanceTranslate>();

    getFv(elementFvId: string): RcsbFv{
        return this.rcsbFvManager.get(elementFvId);
    }

    setFv(elementFvId: string, rcsbFv: RcsbFv): void{
        this.rcsbFvManager.set(elementFvId, rcsbFv);
    }

    removeFv(elementFvId: string): void{
        this.rcsbFvManager.delete(elementFvId);
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
