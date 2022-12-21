import {
    ResidueBucket,
    ResidueDistributionFactoryInterface,
    ResidueDistributionInterface
} from "../ResidueDistributionFactoryInterface";
import {
    TrackManagerInterface
} from "../../../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/AnnotationBlockManager/TrackManagerInterface";
import {RcsbDistributionConfig} from "../../../../../RcsbAnnotationConfig/RcsbDistributionConfig";
import {range} from "lodash";

export class NumericalTrackDistributionFactory implements ResidueDistributionFactoryInterface<[string,number]> {

    private readonly distributionConfig: RcsbDistributionConfig;

    constructor(distributionConfig?: RcsbDistributionConfig) {
        this.distributionConfig = distributionConfig ?? new RcsbDistributionConfig();
    }

    getDistribution(tracks:[TrackManagerInterface],blockType:string,numberResidues:number):ResidueDistributionInterface {
        const track: TrackManagerInterface = tracks[0];
        const numericalCategories = this.distributionConfig.getTrackConfig(track.getId()).numericalCategories;
        const bucketMap: Map<string,ResidueBucket> = new Map<string, ResidueBucket>();
        const undefResidues = new Set<number>(range(1,numberResidues+1));
        numericalCategories.categories.forEach(category=>{
            const label: string = category.label;
            bucketMap.set(label, {
                ...category,
                residueSet: new Set<number>()
            });
        });
        track.forEach(ann=>{
            let index: number = numericalCategories.thresholds.findIndex((x)=>x>=ann.value);
            if(index<0) index = numericalCategories.thresholds.length;
            const label: string = numericalCategories.categories[index].label;
            bucketMap.get(label).residueSet.add(ann.begin);
            undefResidues.delete(ann.begin)
        });
        const undefTrack = this.distributionConfig.getBlockConfig(blockType).undefTrack;
        return {
            attribute:this.distributionConfig.getBlockConfig(blockType).type,
            title:this.distributionConfig.getBlockConfig(blockType).title,
            buckets: Array.from(bucketMap.values()).concat(undefTrack && undefResidues.size > 0 ? [{
                ...undefTrack,
                residueSet: undefResidues
            }] : [])
        };
    }

}