import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {AlignmentRequestContextType} from "../TrackFactoryImpl/AlignmentTrackFactory";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbFvLink} from "@rcsb/rcsb-saguaro";
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

}