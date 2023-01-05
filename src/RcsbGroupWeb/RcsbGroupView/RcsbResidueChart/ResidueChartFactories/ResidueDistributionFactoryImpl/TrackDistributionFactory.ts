import {
    ResidueDistributionFactoryInterface,
    ResidueDistributionInterface
} from "../ResidueDistributionFactoryInterface";
import {RcsbDistributionConfig} from "../../../../../RcsbAnnotationConfig/RcsbDistributionConfig";
import {
    TrackManagerInterface
} from "../../../../../RcsbFvWeb/RcsbFvFactories/RcsbFvBlockFactory/BlockManager/TrackManagerInterface";
import {MultipleTrackDistributionFactory} from "./MultipleTrackDistributionFactory";
import {NumericalTrackDistributionFactory} from "./NumericalTrackDistributionFactory";

export class TrackDistributionFactory implements ResidueDistributionFactoryInterface<[string,number]> {

    private readonly distributionConfig: RcsbDistributionConfig;
    private readonly multipleTrackDistributionFactory: MultipleTrackDistributionFactory
    private readonly numericalTrackDistributionFactory: NumericalTrackDistributionFactory

    constructor(distributionConfig?: RcsbDistributionConfig) {
        this.distributionConfig = distributionConfig ?? new RcsbDistributionConfig();
        this.multipleTrackDistributionFactory = new MultipleTrackDistributionFactory(distributionConfig);
        this.numericalTrackDistributionFactory = new NumericalTrackDistributionFactory(distributionConfig);

    }

    getDistribution(tracks:TrackManagerInterface[], blockType:string, numberResidues: number): ResidueDistributionInterface | undefined {

        switch(this.distributionConfig.getBlockConfig(blockType)?.contentType) {
            case "binary":
                return this.multipleTrackDistributionFactory.getDistribution(tracks, blockType, numberResidues);
            case "numerical":
                return this.numericalTrackDistributionFactory.getDistribution([tracks[0]], blockType, numberResidues);
            default:
                return undefined;
        }

    }
}