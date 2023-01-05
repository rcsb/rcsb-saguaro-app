import {
    ResidueDistributionFactoryInterface,
    ResidueDistributionInterface
} from "../ResidueDistributionFactoryInterface";
import {
    TrackManagerInterface
} from "../../../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";
import {RcsbDistributionConfig} from "../../../../../RcsbAnnotationConfig/RcsbDistributionConfig";
import {range} from "lodash";
import {Assertions} from "../../../../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export class MultipleTrackDistributionFactory implements ResidueDistributionFactoryInterface<[string,number]> {

    private readonly distributionConfig: RcsbDistributionConfig;

    constructor(distributionConfig?: RcsbDistributionConfig) {
        this.distributionConfig = distributionConfig ?? new RcsbDistributionConfig();
    }

    getDistribution(tracks:TrackManagerInterface[],blockType:string,numberResidues:number):ResidueDistributionInterface {
        const undefResidues: Set<number> = new Set(range(1,numberResidues+1));
        const blockConfig = this.distributionConfig.getBlockConfig(blockType);
        assertDefined(blockConfig);
        const undefTrack = blockConfig.undefTrack;
        return {
            attribute: blockConfig.type,
            title:blockConfig.title,
            buckets:tracks.map(track=>{
                const trackConfig = this.distributionConfig.getTrackConfig(track.getId());
                assertDefined(trackConfig), assertDefined(trackConfig.label), assertDefined(trackConfig?.color);
                return {
                    label: trackConfig.label,
                    color: trackConfig.color,
                    id:  trackConfig.type,
                    residueSet:new Set(
                        track.values().reduce<number[]>((prev,curr)=>(prev.concat(range(curr.begin, (curr.end ?? curr.begin)+1))),[]).map(n=>{
                            undefResidues.delete(n);
                            return n;
                        })
                    )
                }
            }).concat(undefTrack && undefResidues.size > 0 ? [{
                ...undefTrack,
                residueSet: undefResidues
            }] : [])
        }

    }

}