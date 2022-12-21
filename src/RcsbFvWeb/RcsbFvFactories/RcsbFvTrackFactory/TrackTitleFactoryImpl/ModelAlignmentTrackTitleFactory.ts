import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvLink} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {ExperimentalAlignmentTrackTitleFactory} from "./ExperimentalAlignmentTrackTitleFactory";
import {AlignmentRequestContextType} from "../TrackFactoryInterface";

export class ModelAlignmentTrackTitleFactory implements TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]> {

    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate | undefined = undefined;
    private readonly alignmentTrackTitleFactory: TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]>;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.entityInstanceTranslator = entityInstanceTranslator;
        this.alignmentTrackTitleFactory = new ExperimentalAlignmentTrackTitleFactory(entityInstanceTranslator);
    }

    public async getTrackTitle(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string | RcsbFvLink> {
        const rowTitle: string | RcsbFvLink = await this.alignmentTrackTitleFactory.getTrackTitle(alignmentQueryContext, targetAlignment);
        return typeof rowTitle === "string" ? rowTitle : {
            ...rowTitle,
            style: {
                fontWeight:"bold",
                color:RcsbAnnotationConstants.provenanceColorCode.rcsbLink
            }
        };
    }

    public async getTrackTitlePrefix(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string> {
        return this.alignmentTrackTitleFactory.getTrackTitlePrefix(alignmentQueryContext, targetAlignment);
    }

    public async getTrackTitleFlagColor(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string> {
        return RcsbAnnotationConstants.provenanceColorCode.csm;
    }
}