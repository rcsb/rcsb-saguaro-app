import {
    ResidueBucket,
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

export class NumericalTrackDistributionFactory implements ResidueDistributionFactoryInterface<[string,number]> {

    private readonly distributionConfig: RcsbDistributionConfig;

    constructor(distributionConfig?: RcsbDistributionConfig) {
        this.distributionConfig = distributionConfig ?? new RcsbDistributionConfig();
    }

    getDistribution(tracks:[TrackManagerInterface],blockType:string,numberResidues:number):ResidueDistributionInterface {
        const track: TrackManagerInterface = tracks[0];
        const numericalCategories = this.distributionConfig.getTrackConfig(track.getId())?.numericalCategories;
        assertDefined(numericalCategories);
        const bucketMap: Map<string,ResidueBucket> = new Map<string, ResidueBucket>();
        const undefResidues: Set<number> = new Set(range(1,numberResidues+1));
        numericalCategories.categories.forEach(category=>{
            const label: string = category.label;
            bucketMap.set(label, {
                ...category,
                residueSet: new Set<number>()
            });
        });
        track.forEach(ann=>{
            let index: number = numericalCategories.thresholds.findIndex((x)=>x>=(ann.value as number ?? Number.MAX_SAFE_INTEGER));
            if(index<0) index = numericalCategories.thresholds.length;
            const label: string = numericalCategories.categories[index].label;
            bucketMap.get(label)?.residueSet.add(ann.begin);
            undefResidues.delete(ann.begin)
        });
        const bc = this.distributionConfig.getBlockConfig(blockType);
        assertDefined(bc)
        return {
            attribute: bc.type,
            title:bc.title,
            buckets: Array.from(bucketMap.values()).concat(bc.undefTrack && undefResidues.size > 0 ? [{
                ...bc.undefTrack,
                residueSet: undefResidues
            }] : [])
        };
    }

}