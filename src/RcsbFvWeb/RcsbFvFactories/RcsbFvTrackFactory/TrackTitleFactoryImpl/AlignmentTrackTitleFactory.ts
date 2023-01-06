import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AlignmentRequestContextType} from "../TrackFactoryImpl/AlignmentTrackFactory";
import {RcsbFvLink} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {ExperimentalAlignmentTrackTitleFactory} from "./ExperimentalAlignmentTrackTitleFactory";
import {ModelAlignmentTrackTitleFactory} from "./ModelAlignmentTrackTitleFactory";

export class AlignmentTrackTitleFactory implements TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]> {

    private readonly experimentalTrackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]>;
    private readonly modelTrackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]>;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.experimentalTrackTitleFactory = new ExperimentalAlignmentTrackTitleFactory(entityInstanceTranslator);
        this.modelTrackTitleFactory = new ModelAlignmentTrackTitleFactory(entityInstanceTranslator);
    }

    public async getTrackTitle(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string | RcsbFvLink> {
        if(targetAlignment.target_id && TagDelimiter.isModel(targetAlignment.target_id))
        return this.modelTrackTitleFactory.getTrackTitle(alignmentQueryContext, targetAlignment);
    else
        return this.experimentalTrackTitleFactory.getTrackTitle(alignmentQueryContext, targetAlignment);
    }

    public async getTrackTitlePrefix(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string> {
        if(targetAlignment.target_id && TagDelimiter.isModel(targetAlignment.target_id))
            return this.modelTrackTitleFactory.getTrackTitlePrefix(alignmentQueryContext, targetAlignment);
        else
            return this.experimentalTrackTitleFactory.getTrackTitlePrefix(alignmentQueryContext, targetAlignment);
    }

    public async getTrackTitleFlagColor(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string> {
        if(targetAlignment.target_id && TagDelimiter.isModel(targetAlignment.target_id))
            return this.modelTrackTitleFactory.getTrackTitleFlagColor(alignmentQueryContext, targetAlignment);
        else
            return this.experimentalTrackTitleFactory.getTrackTitleFlagColor(alignmentQueryContext, targetAlignment);
    }

}