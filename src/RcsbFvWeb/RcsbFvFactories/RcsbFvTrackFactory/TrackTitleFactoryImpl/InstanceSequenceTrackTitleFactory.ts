import {RcsbFvLink} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";

import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {AlignmentRequestContextType} from "../TrackFactoryImpl/AlignmentTrackFactory";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {SequenceTrackTitleFactory} from "./SequenceTrackTitleFactory";

export class InstanceSequenceTrackTitleFactory implements TrackTitleFactoryInterface<[AlignmentRequestContextType]> {

    private readonly trackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType]>;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.trackTitleFactory = new SequenceTrackTitleFactory(entityInstanceTranslator);
    }

    public async getTrackTitle(alignmentQueryContext: AlignmentRequestContextType): Promise<string | RcsbFvLink> {
        return this.trackTitleFactory.getTrackTitle(alignmentQueryContext);
    }

    public async getTrackTitlePrefix(alignmentQueryContext: AlignmentRequestContextType): Promise<string> {
        return "CHAIN";
    }

    public async getTrackTitleFlagColor(alignmentQueryContext: AlignmentRequestContextType): Promise<string> {
        return this.trackTitleFactory.getTrackTitleFlagColor(alignmentQueryContext);
    }

}