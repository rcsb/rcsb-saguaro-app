import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvLink} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {ExperimentalAlignmentTrackTitleFactory} from "./ExperimentalAlignmentTrackTitleFactory";
import {ModelAlignmentTrackTitleFactory} from "./ModelAlignmentTrackTitleFactory";
import {AlignmentRequestContextType} from "../TrackFactoryInterface";

export class AlignmentTrackTitleFactory implements TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]> {

    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate | undefined = undefined;
    private readonly experimentalTrackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]>;
    private readonly modelTrackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]>;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.entityInstanceTranslator = entityInstanceTranslator;
        this.experimentalTrackTitleFactory = new ExperimentalAlignmentTrackTitleFactory(entityInstanceTranslator);
        this.modelTrackTitleFactory = new ModelAlignmentTrackTitleFactory(entityInstanceTranslator);
    }

    public async getTrackTitle(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string | RcsbFvLink> {
        if(TagDelimiter.isModel(targetAlignment.target_id))
        return this.modelTrackTitleFactory.getTrackTitle(alignmentQueryContext, targetAlignment);
    else
        return this.experimentalTrackTitleFactory.getTrackTitle(alignmentQueryContext, targetAlignment);
    }

    public async getTrackTitlePrefix(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string> {
        if(TagDelimiter.isModel(targetAlignment.target_id))
            return this.modelTrackTitleFactory.getTrackTitlePrefix(alignmentQueryContext, targetAlignment);
        else
            return this.experimentalTrackTitleFactory.getTrackTitlePrefix(alignmentQueryContext, targetAlignment);
    }

    public async getTrackTitleFlagColor(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string> {
        if(TagDelimiter.isModel(targetAlignment.target_id))
            return this.modelTrackTitleFactory.getTrackTitleFlagColor(alignmentQueryContext, targetAlignment);
        else
            return this.experimentalTrackTitleFactory.getTrackTitleFlagColor(alignmentQueryContext, targetAlignment);
    }

}