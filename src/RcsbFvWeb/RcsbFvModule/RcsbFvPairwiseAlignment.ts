import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface, RcsbFvModulePublicInterface} from "./RcsbFvModuleInterface";
import {PairwiseAlignmentBuilder} from "../PairwiseAlignmentTools/PairwiseAlignmentBuilder";
import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";

export class RcsbFvPairwiseAlignment extends RcsbFvAbstractModule {

    async build(buildConfig: RcsbFvModuleBuildInterface): Promise<void> {
        const pab: PairwiseAlignmentBuilder = new PairwiseAlignmentBuilder(buildConfig.psa);
        const config: RcsbFvBoardConfigInterface = {
            rowTitleWidth: 120,
            trackWidth: 800,
            length: pab.getLength(),
            includeAxis: !buildConfig.psa.pairwiseView,
            ...buildConfig.additionalConfig?.boardConfig
        };
        this.boardConfigData = { ...this.boardConfigData, ...config};
        this.rowConfigData = buildConfig.psa.pairwiseView ? pab.buildPairwiseAlignment() : pab.buildReferenceAlignment();
        await this.display();
        return void 0;
    }

}