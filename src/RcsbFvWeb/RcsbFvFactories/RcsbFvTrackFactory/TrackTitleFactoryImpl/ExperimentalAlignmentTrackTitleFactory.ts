import {RcsbFvLink} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {SequenceReference, TargetAlignments} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AlignmentRequestContextType} from "../TrackFactoryImpl/AlignmentTrackFactory";
import resource from "../../../../RcsbServerConfig/web.resources.json";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {Assertions} from "../../../../RcsbUtils/Helpers/Assertions";
import assertDefined = Assertions.assertDefined;
import {TagDelimiter} from "@rcsb/rcsb-api-tools/lib/RcsbUtils/TagDelimiter";

export class ExperimentalAlignmentTrackTitleFactory implements TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignments]> {

    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate | undefined = undefined;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.entityInstanceTranslator = entityInstanceTranslator;
    }

    public async getTrackTitle(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<string | RcsbFvLink> {
        let rowTitle: string | RcsbFvLink;
        assertDefined(targetAlignment.target_id);
        if(alignmentQueryContext.excludeAlignmentLinks){
            rowTitle = targetAlignment.target_id;
        } else if (alignmentQueryContext.to === SequenceReference.PdbInstance && this.entityInstanceTranslator != null) {
            const entityId: string | undefined = this.entityInstanceTranslator.translateAsymToEntity(TagDelimiter.parseInstance(targetAlignment.target_id).instanceId);
            assertDefined(entityId);
            rowTitle = {
                visibleTex:this.buildInstanceId(targetAlignment.target_id),
                url:(resource as any).rcsb_entry.url+TagDelimiter.parseInstance(targetAlignment.target_id).entryId+"#entity-"+entityId,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbLink
                }
            };
        } else if (alignmentQueryContext.to === SequenceReference.PdbEntity) {
            const entityId: string = TagDelimiter.parseEntity(targetAlignment.target_id).entityId;
            rowTitle = {
                visibleTex:targetAlignment.target_id,
                url:(resource as any).rcsb_entry.url+TagDelimiter.parseEntity(targetAlignment.target_id).entryId+"#entity-"+entityId,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbLink
                }
            };
        } else if( alignmentQueryContext.to === SequenceReference.Uniprot ){
            rowTitle = {
                visibleTex: targetAlignment.target_id,
                url: (resource as any).rcsb_uniprot.url+targetAlignment.target_id,
                style: {
                    fontWeight:"bold",
                    color:RcsbAnnotationConstants.provenanceColorCode.rcsbLink
                }
            };
        } else {
            rowTitle = targetAlignment.target_id;
        }
        return rowTitle;
    }

    public async getTrackTitlePrefix(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<string> {
        return alignmentQueryContext.to && !alignmentQueryContext.to.includes("PDB")? alignmentQueryContext.to.replace("_", " ") + " " + TagDelimiter.alignmentTitle : "";
    }

    public async getTrackTitleFlagColor(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignments): Promise<string> {
        if(alignmentQueryContext.to === SequenceReference.Uniprot)
            return RcsbAnnotationConstants.provenanceColorCode.external;
        return RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
    }

    private buildInstanceId(targetId: string): string{
        const labelAsymId: string = TagDelimiter.parseInstance(targetId).instanceId;
        const authAsymId: string  | undefined = this.entityInstanceTranslator?.translateAsymToAuth(labelAsymId);
        return TagDelimiter.parseInstance(targetId).entryId+TagDelimiter.instance+(labelAsymId === authAsymId || !authAsymId? labelAsymId : labelAsymId+"[auth "+authAsymId+"]");
    }

}