import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface} from "./RcsbFvModuleInterface";
import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {PairwiseAlignmentBuilder} from "../../RcsbUtils/PairwiseAlignmentTools/PairwiseAlignmentBuilder";
import {Assertions} from "../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;

export class RcsbFvPairwiseAlignment extends RcsbFvAbstractModule {

    protected async protectedBuild(): Promise<void> {
        const buildConfig: RcsbFvModuleBuildInterface = this.buildConfig;
        assertDefined(buildConfig.psa);
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
        return void 0;
    }

    protected concatAlignmentAndAnnotationTracks(): void {
    }

}