import {RcsbFvLink} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {AlignmentRequestContextType} from "../TrackFactoryImpl/AlignmentTrackFactory";
import {TargetAlignments} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {ExperimentalAlignmentTrackTitleFactory} from "./ExperimentalAlignmentTrackTitleFactory";

export class ModelAlignmentTrackTitleFactory implements TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignments]> {

    private readonly alignmentTrackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignments]>;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.alignmentTrackTitleFactory = new ExperimentalAlignmentTrackTitleFactory(entityInstanceTranslator);
    }

    public async getTrackTitle(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<string | RcsbFvLink> {
        const rowTitle: string | RcsbFvLink = await this.alignmentTrackTitleFactory.getTrackTitle(alignmentQueryContext, targetAlignment);
        return typeof rowTitle === "string" ? rowTitle : {
            ...rowTitle,
            style: {
                fontWeight:"bold",
                color:RcsbAnnotationConstants.provenanceColorCode.rcsbLink
            }
        };
    }

    public async getTrackTitlePrefix(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<string> {
        return this.alignmentTrackTitleFactory.getTrackTitlePrefix(alignmentQueryContext, targetAlignment);
    }

    public async getTrackTitleFlagColor(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<string> {
        return RcsbAnnotationConstants.provenanceColorCode.csm;
    }
}