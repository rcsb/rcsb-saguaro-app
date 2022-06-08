import {TrackFactoryInterface} from "./TrackFactoryInterface";
import {AlignmentRequestContextType} from "./AlignmentTrackFactory";
import {AnnotationFeatures, TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {PositionalScoreAlignmentTrackFactory} from "./PositionalScoreAlignmentTrackFactory";
import {PolymerEntityInstanceTranslate} from "../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {PlainObservedAlignmentTrackFactory} from "./PlainObservedAlignmentTrackFactory";

export class UniprotAlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]>{

    private observedAlignmentTrackFactory: PlainObservedAlignmentTrackFactory;
    private positionalScoreAlignmentTrackFactory: PositionalScoreAlignmentTrackFactory;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.observedAlignmentTrackFactory = new PlainObservedAlignmentTrackFactory(entityInstanceTranslator);
        this.positionalScoreAlignmentTrackFactory = new PositionalScoreAlignmentTrackFactory(entityInstanceTranslator);
    }

    public async getTrack(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<RcsbFvRowConfigInterface> {
        if(targetAlignment.target_id.length == 6)
            return this.observedAlignmentTrackFactory.getTrack(alignmentQueryContext,targetAlignment);
        else
            return this.positionalScoreAlignmentTrackFactory.getTrack(alignmentQueryContext,targetAlignment);
    }

    public async prepareFeatures(unObservedRegions: Array<AnnotationFeatures>, positionalScores: Array<AnnotationFeatures>): Promise<void>{
        await this.observedAlignmentTrackFactory.prepareFeatures(unObservedRegions);
        await this.positionalScoreAlignmentTrackFactory.prepareFeatures(positionalScores);
    }

}