import {RcsbFv} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFv";
import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvTooltip} from "../RcsbFvTooltip/RcsbFvTooltip";

class RcsbFvContextManager {

    private readonly rcsbFvManager: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private readonly rcsbButtonManager: Map<string, Set<string>> = new Map<string, Set<string>>();

    public getFv(elementFvId: string, boardConfig?: Partial<RcsbFvBoardConfigInterface>): RcsbFv{
        const o = this.rcsbFvManager.get(elementFvId);
        if(o) {
            return o;
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

    public getButtonList(elementFvId: string): Set<string> | undefined{
        return this.rcsbButtonManager.get(elementFvId);
    }

    public setButton(elementFvId: string, buttonId: string): void{
        if(this.rcsbButtonManager.get(elementFvId) == null)
            this.rcsbButtonManager.set(elementFvId, new Set<string>());
        this.rcsbButtonManager.get(elementFvId)?.add(buttonId);
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
        tooltipGenerator: new RcsbFvTooltip(),
        ...boardConfig
    };
    return new RcsbFv({
        rowConfigData: [],
        boardConfigData: config,
        elementId: elementId
    });
}

export const rcsbFvCtxManager: RcsbFvContextManager = new RcsbFvContextManager();
