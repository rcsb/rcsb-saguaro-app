import {TrackBlockFactoryInterface} from "../ResidueDistributionFactoryInterface";
import {
    TrackManagerInterface
} from "../../../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";
import {RcsbDistributionConfig} from "../../../../../RcsbAnnotationConfig/RcsbDistributionConfig";

export class TrackBlockFactory implements TrackBlockFactoryInterface<{blockType:string}>{

    private readonly distributionConfig: RcsbDistributionConfig;

    constructor(distributionConfig?: RcsbDistributionConfig) {
        this.distributionConfig = distributionConfig ?? new RcsbDistributionConfig();
    }

    getTrackBlocks(tracks: TrackManagerInterface[]): ({ tracks: TrackManagerInterface[] } & { blockType: string })[] {
        const trackMap: Map<string,TrackManagerInterface[]> = new Map<string, TrackManagerInterface[]>();
        tracks.forEach(t=>{
            const blockType: string = this.distributionConfig.getBlockType(t.getId());
            if(!blockType)
                return;
            if(!trackMap.has(blockType))
                trackMap.set(blockType, []);
            trackMap.get(blockType).push(t);
        });
        return Array.from(trackMap.entries()).map(e=>({blockType:e[0],tracks:e[1]}));
    }

}