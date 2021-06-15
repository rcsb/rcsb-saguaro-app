import {RcsbFv, RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../Utils/PolymerEntityInstanceTranslate";
import {EntryInstancesCollector} from "../CollectTools/EntryInstancesCollector";



class RcsbFvContextManager {
    private rcsbFvManager: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private rcsbButtonManager: Map<string, Set<string>> = new Map<string, Set<string>>();
    private boardConfig: RcsbFvBoardConfigInterface;
    private polymerEntityToInstanceMap: Map<string,PolymerEntityInstanceTranslate> = new Map<string, PolymerEntityInstanceTranslate>();
    private polymerEntityToInstanceMapRequestStatus: Map<string, "pending"|"available"> = new Map<string, "pending"|"available">();

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
        this.polymerEntityToInstanceMapRequestStatus.set(entryId, "available");
    }

    getEntityToInstance(entryId: string): Promise<PolymerEntityInstanceTranslate>{
        if(this.polymerEntityToInstanceMapRequestStatus.get(entryId) === "available") {
            return new Promise<PolymerEntityInstanceTranslate>((resolve, reject)=>{
                resolve(this.polymerEntityToInstanceMap.get(entryId));
            });
        } else if (this.polymerEntityToInstanceMapRequestStatus.get(entryId) === "pending") {
            return new Promise<PolymerEntityInstanceTranslate>((resolve, reject) => {
                const recursiveWait = () =>{
                    if(this.polymerEntityToInstanceMapRequestStatus.get(entryId) === "pending"){
                        setTimeout(()=>{
                            recursiveWait();
                        },100);
                    }else{
                        resolve(this.polymerEntityToInstanceMap.get(entryId));
                    }
                };
                recursiveWait();
            });
        }else{
            this.polymerEntityToInstanceMapRequestStatus.set(entryId, "pending");
            return new Promise<PolymerEntityInstanceTranslate>((resolve, reject)=>{
                const instanceCollector: EntryInstancesCollector = new EntryInstancesCollector();
                instanceCollector.collect({entry_id: entryId}).then(result => {
                    const translator: PolymerEntityInstanceTranslate =  new PolymerEntityInstanceTranslate(result);
                    this.polymerEntityToInstanceMap.set(entryId, translator);
                    this.polymerEntityToInstanceMapRequestStatus.set(entryId, "available");
                    resolve(translator);
                });
            })

        }
    }

}

export const rcsbFvCtxManager: RcsbFvContextManager = new RcsbFvContextManager();
