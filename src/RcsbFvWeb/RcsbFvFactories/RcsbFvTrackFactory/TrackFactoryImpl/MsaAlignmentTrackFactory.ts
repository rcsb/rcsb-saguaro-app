import {AlignmentRequestContextType, TrackFactoryInterface} from "../TrackFactoryInterface";
import {AnnotationFeatures, TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {PositionalScoreAlignmentTrackFactory} from "./PositionalScoreAlignmentTrackFactory";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {PlainObservedAlignmentTrackFactory} from "./PlainObservedAlignmentTrackFactory";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";

export class MsaAlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>{

    private observedAlignmentTrackFactory: PlainObservedAlignmentTrackFactory;
    private positionalScoreAlignmentTrackFactory: PositionalScoreAlignmentTrackFactory;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.observedAlignmentTrackFactory = new PlainObservedAlignmentTrackFactory(entityInstanceTranslator);
        this.positionalScoreAlignmentTrackFactory = new PositionalScoreAlignmentTrackFactory(entityInstanceTranslator);
    }

    public async getTrack(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<RcsbFvRowConfigInterface> {
        if(TagDelimiter.isEntityOrInstanceId(targetAlignment.target_id))
            return this.observedAlignmentTrackFactory.getTrack(alignmentQueryContext,targetAlignment);
        else
            return this.positionalScoreAlignmentTrackFactory.getTrack(alignmentQueryContext,targetAlignment);
    }

    public async prepareFeatures(unObservedRegions: AnnotationFeatures[], positionalScores: AnnotationFeatures[]): Promise<void>{
        await this.observedAlignmentTrackFactory.prepareFeatures(unObservedRegions);
        await this.positionalScoreAlignmentTrackFactory.prepareFeatures(positionalScores);
    }

}