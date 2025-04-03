import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";

import {TrackFactoryInterface} from "../TrackFactoryInterface";
import {AlignmentRequestContextType} from "./AlignmentTrackFactory";
import {SequenceAnnotations, TargetAlignments} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PositionalScoreAlignmentTrackFactory} from "./PositionalScoreAlignmentTrackFactory";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {PlainObservedAlignmentTrackFactory} from "./PlainObservedAlignmentTrackFactory";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/lib/RcsbUtils/TagDelimiter";

export class MsaAlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignments]>{

    private observedAlignmentTrackFactory: PlainObservedAlignmentTrackFactory;
    private positionalScoreAlignmentTrackFactory: PositionalScoreAlignmentTrackFactory;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.observedAlignmentTrackFactory = new PlainObservedAlignmentTrackFactory(entityInstanceTranslator);
        this.positionalScoreAlignmentTrackFactory = new PositionalScoreAlignmentTrackFactory(entityInstanceTranslator);
    }

    public async getTrack(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<RcsbFvRowConfigInterface> {
        if(targetAlignment.target_id && TagDelimiter.isEntityOrInstanceId(targetAlignment.target_id))
            return this.observedAlignmentTrackFactory.getTrack(alignmentQueryContext,targetAlignment);
        else
            return this.positionalScoreAlignmentTrackFactory.getTrack(alignmentQueryContext,targetAlignment);
    }

    public async prepareFeatures(unObservedRegions: Array<SequenceAnnotations>, positionalScores: Array<SequenceAnnotations>): Promise<void>{
        await this.observedAlignmentTrackFactory.prepareFeatures(unObservedRegions);
        await this.positionalScoreAlignmentTrackFactory.prepareFeatures(positionalScores);
    }

}