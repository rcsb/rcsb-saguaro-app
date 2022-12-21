import {TrackTitleFactoryInterface} from "../TrackTitleFactoryInterface";
import {SequenceReference, TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvLink} from "@rcsb/rcsb-saguaro";
import {TagDelimiter} from "../../../../RcsbUtils/Helpers/TagDelimiter";
import * as resource from "../../../../RcsbServerConfig/web.resources.json";
import {RcsbAnnotationConstants} from "../../../../RcsbAnnotationConfig/RcsbAnnotationConstants";
import {PolymerEntityInstanceTranslate} from "../../../../RcsbUtils/Translators/PolymerEntityInstanceTranslate";
import {AlignmentRequestContextType} from "../TrackFactoryInterface";

export class ExperimentalAlignmentTrackTitleFactory implements TrackTitleFactoryInterface<[AlignmentRequestContextType,TargetAlignment]> {

    private readonly entityInstanceTranslator: PolymerEntityInstanceTranslate | undefined = undefined;

    constructor(entityInstanceTranslator?: PolymerEntityInstanceTranslate) {
        this.entityInstanceTranslator = entityInstanceTranslator;
    }

    public async getTrackTitle(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string | RcsbFvLink> {
        let rowTitle: string | RcsbFvLink;
        if(alignmentQueryContext.excludeAlignmentLinks){
            rowTitle = targetAlignment.target_id;
        } else if (alignmentQueryContext.to === SequenceReference.PdbInstance && this.entityInstanceTranslator != null) {
            const entityId: string = this.entityInstanceTranslator.translateAsymToEntity(TagDelimiter.parseInstance(targetAlignment.target_id).instanceId);
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

    public async getTrackTitlePrefix(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string> {
        return alignmentQueryContext.to && !alignmentQueryContext.to.includes("PDB")? alignmentQueryContext.to.replace("_", " ") + " " + TagDelimiter.alignmentTitle : "";
    }

    public async getTrackTitleFlagColor(alignmentQueryContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<string> {
        if(alignmentQueryContext.to === SequenceReference.Uniprot)
            return RcsbAnnotationConstants.provenanceColorCode.external;
        return RcsbAnnotationConstants.provenanceColorCode.rcsbPdb;
    }

    private buildInstanceId(targetId: string): string{
        const labelAsymId: string = TagDelimiter.parseInstance(targetId).instanceId;
        const authAsymId: string = this.entityInstanceTranslator?.translateAsymToAuth(labelAsymId);
        return TagDelimiter.parseInstance(targetId).entryId+TagDelimiter.instance+(labelAsymId === authAsymId || !authAsymId? labelAsymId : labelAsymId+"[auth "+authAsymId+"]");
    }

}