import {
    ResidueDistributionFactoryInterface,
    ResidueDistributionInterface
} from "../ResidueDistributionFactoryInterface";
import {
    TrackManagerInterface
} from "../../../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";
import {RcsbDistributionConfig} from "../../../../../RcsbAnnotationConfig/RcsbDistributionConfig";
import {range} from "lodash";

export class MultipleTrackDistributionFactory implements ResidueDistributionFactoryInterface<[string]> {

    private readonly distributionConfig: RcsbDistributionConfig;

    constructor(distributionConfig?: RcsbDistributionConfig) {
        this.distributionConfig = distributionConfig ?? new RcsbDistributionConfig();
    }

    getDistribution(tracks:TrackManagerInterface[],blockType:string):ResidueDistributionInterface {
        return {
            attribute:this.distributionConfig.getBlockConfig(blockType).type,
            title:this.distributionConfig.getBlockConfig(blockType).title,
            buckets:tracks.map(track=>({
                label: this.distributionConfig.getTrackConfig(track.getId()).label,
                color: this.distributionConfig.getTrackConfig(track.getId()).color,
                id:  this.distributionConfig.getTrackConfig(track.getId()).type,
                residueSet:new Set(track.values().reduce<number[]>((prev,curr)=>(prev.concat(range(curr.begin, curr.end+1))),[]))
            }))
        }

    }

}