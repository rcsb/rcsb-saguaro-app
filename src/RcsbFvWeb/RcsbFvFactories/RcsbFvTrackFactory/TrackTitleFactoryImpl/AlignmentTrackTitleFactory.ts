import {RcsbFvLink} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {TargetAlignments} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AlignmentRequestContextType} from "../TrackFactoryImpl/AlignmentTrackFactory";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {ExperimentalAlignmentTrackTitleFactory} from "./ExperimentalAlignmentTrackTitleFactory";
import {ModelAlignmentTrackTitleFactory} from "./ModelAlignmentTrackTitleFactory";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/lib/RcsbUtils/TagDelimiter";

export class AlignmentTrackTitleFactory implements TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignments]> {

    private readonly experimentalTrackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignments]>;
    private readonly modelTrackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignments]>;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.experimentalTrackTitleFactory = new ExperimentalAlignmentTrackTitleFactory(entityInstanceTranslator);
        this.modelTrackTitleFactory = new ModelAlignmentTrackTitleFactory(entityInstanceTranslator);
    }

    public async getTrackTitle(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<string | RcsbFvLink> {
        if(targetAlignment.target_id && TagDelimiter.isModel(targetAlignment.target_id))
        return this.modelTrackTitleFactory.getTrackTitle(alignmentQueryContext, targetAlignment);
    else
        return this.experimentalTrackTitleFactory.getTrackTitle(alignmentQueryContext, targetAlignment);
    }

    public async getTrackTitlePrefix(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<string> {
        if(targetAlignment.target_id && TagDelimiter.isModel(targetAlignment.target_id))
            return this.modelTrackTitleFactory.getTrackTitlePrefix(alignmentQueryContext, targetAlignment);
        else
            return this.experimentalTrackTitleFactory.getTrackTitlePrefix(alignmentQueryContext, targetAlignment);
    }

    public async getTrackTitleFlagColor(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<string> {
        if(targetAlignment.target_id && TagDelimiter.isModel(targetAlignment.target_id))
            return this.modelTrackTitleFactory.getTrackTitleFlagColor(alignmentQueryContext, targetAlignment);
        else
            return this.experimentalTrackTitleFactory.getTrackTitleFlagColor(alignmentQueryContext, targetAlignment);
    }

}