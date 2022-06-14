import {RcsbFv, RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";

class RcsbFvContextManager {

    private readonly rcsbFvManager: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private readonly rcsbButtonManager: Map<string, Set<string>> = new Map<string, Set<string>>();

    public getFv(elementFvId: string, boardConfig?: Partial<RcsbFvBoardConfigInterface>): RcsbFv{
        if( this.rcsbFvManager.has(elementFvId)) {
            return this.rcsbFvManager.get(elementFvId);
        }else{
            const rcsbFvSingleViewer: RcsbFv = buildRcsbFvSingleViewer(elementFvId, boardConfig);
            this.setFv(elementFvId, rcsbFvSingleViewer);
            return rcsbFvSingleViewer;
        }
    }

    public hasFv(elementFvId: string): boolean{
        return this.rcsbFvManager.has(elementFvId);
    }

    private setFv(elementFvId: string, rcsbFv: RcsbFv): void{
        this.rcsbFvManager.set(elementFvId, rcsbFv);
    }

    public getButtonList(elementFvId: string): Set<string>{
        return this.rcsbButtonManager.get(elementFvId);
    }

    public setButton(elementFvId: string, buttonId: string): void{
        if(this.rcsbButtonManager.get(elementFvId) == null)
            this.rcsbButtonManager.set(elementFvId, new Set<string>());
        this.rcsbButtonManager.get(elementFvId).add(buttonId);
    }

    public removeFv(elementFvId: string): void{
        this.rcsbFvManager.delete(elementFvId);
        if(this.rcsbButtonManager.has(elementFvId))
            this.rcsbButtonManager.delete(elementFvId);
    }

}

function buildRcsbFvSingleViewer(elementId: string, boardConfig?: Partial<RcsbFvBoardConfigInterface>): RcsbFv{
    const config: RcsbFvBoardConfigInterface =  {
        rowTitleWidth: 190,
        trackWidth: 900,
        ...boardConfig
    };
    return new RcsbFv({
        rowConfigData: null,
        boardConfigData: config,
        elementId: elementId
    });
}

export const rcsbFvCtxManager: RcsbFvContextManager = new RcsbFvContextManager();
