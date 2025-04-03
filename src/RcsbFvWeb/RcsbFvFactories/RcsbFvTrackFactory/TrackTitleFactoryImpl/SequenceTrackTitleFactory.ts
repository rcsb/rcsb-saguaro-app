import {RcsbFvLink} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {AlignmentRequestContextType} from "../TrackFactoryImpl/AlignmentTrackFactory";
import {SequenceReference} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import resource from "../../../../RcsbServerConfig/web.resources.json";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {TrackUtils} from "../TrackFactoryImpl/Helper/TrackUtils";
import {Assertions} from "../../../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {TagDelimiter} from "@rcsb/rcsb-api-tools/lib/RcsbUtils/TagDelimiter";

export class SequenceTrackTitleFactory implements  TrackTitleFactoryInterface<[AlignmentRequestContextType]> {

    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate | undefined = undefined;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.entityInstanceTranslator = entityInstanceTranslator;
    }

    public async getTrackTitle(alignmentQueryContext: AlignmentRequestContextType): Promise<string | RcsbFvLink> {
        let rowTitle:string|RcsbFvLink;
        if(!alignmentQueryContext.excludeFirstRowLink && alignmentQueryContext.from === SequenceReference.Uniprot){
            rowTitle = {
                visibleTex: alignmentQueryContext.queryId ?? "",
                url: (resource as any).rcsb_uniprot.url+alignmentQueryContext.queryId,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbLink
                }
            };
        }else if(!alignmentQueryContext.excludeFirstRowLink && alignmentQueryContext.from === SequenceReference.PdbInstance && this.entityInstanceTranslator!=null) {
            rowTitle = {
                visibleTex: alignmentQueryContext.queryId ? this.buildInstanceId(alignmentQueryContext.queryId) : "",
                style: {
                    fontWeight:"bold",
                }
            };
        }else{
            rowTitle = {
                visibleTex: alignmentQueryContext.queryId ?? (alignmentQueryContext.groupId ?? ""),
                style: {
                    fontWeight:"bold",
                }
            };
        }
        return rowTitle
    }

    public async getTrackTitlePrefix(alignmentQueryContext: AlignmentRequestContextType): Promise<string> {
        return (alignmentQueryContext.from && !alignmentQueryContext.from.includes("PDB")) ? alignmentQueryContext.from.replace("_"," ")+" "+TagDelimiter.sequenceTitle : (alignmentQueryContext.sequencePrefix ?? "");
    }

    public async getTrackTitleFlagColor(alignmentQueryContext: AlignmentRequestContextType): Promise<string> {
        const queryId = alignmentQueryContext.queryId ?? alignmentQueryContext.groupId;
        assertDefined(queryId), assertDefined(alignmentQueryContext.from);
        return TrackUtils.getProvenanceConfigFormTarget(queryId,alignmentQueryContext.from).color;
    }

    private buildInstanceId(targetId: string): string{
        const labelAsymId: string = targetId.split(TagDelimiter.instance)[1]
        const authAsymId: string | undefined = this.entityInstanceTranslator?.translateAsymToAuth(labelAsymId);
        return (labelAsymId === authAsymId || !authAsymId? labelAsymId : labelAsymId+"[auth "+authAsymId+"]");
    }

}